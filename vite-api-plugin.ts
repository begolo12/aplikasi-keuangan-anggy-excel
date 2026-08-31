import type { Plugin } from 'vite'
import { resolve } from 'node:path'
import { config } from 'dotenv'

// Load server-side env (DATABASE_URL, JWT_SECRET) before any handler imports lib/db
config({ path: '.env.local' })
config()

/**
 * Dev-only plugin that serves the Vercel-style serverless handlers in /api
 * directly in Node, so `npm run dev` can exercise the same code that runs
 * on Vercel (production). Handlers are compiled on demand via Vite's SSR
 * pipeline, so edits to api/ or lib/ are picked up without restarting Vite.
 */
export function apiDevPlugin(): Plugin {
  return {
    name: 'api-dev-handlers',
    async configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = req.url ?? ''
        if (!url.startsWith('/api/')) return next()

        const pathname = url.split('?')[0]
        const rel = pathname.replace(/^\/api\/?/, '') || 'index'
        let targetFile = resolve(process.cwd(), 'api', rel)
        if (!targetFile.endsWith('.ts')) {
          const fs = await import('node:fs')
          if (fs.existsSync(targetFile + '.ts')) {
            targetFile = targetFile + '.ts'
          } else if (fs.existsSync(resolve(targetFile, 'index.ts'))) {
            targetFile = resolve(targetFile, 'index.ts')
          }
        }

        let mod: any
        try {
          mod = await server.ssrLoadModule(targetFile)
        } catch (err: any) {
          const isNotFound =
            err?.code === 'ERR_MODULE_NOT_FOUND' ||
            err?.message?.includes('Cannot find module') ||
            err?.message?.includes('Failed to resolve') ||
            err?.message?.includes('No matching export')
          if (isNotFound) {
            res.statusCode = 404
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: `Endpoint tidak ditemukan: ${pathname}` }))
            return
          }
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Gagal memuat handler', details: String(err?.message ?? err) }))
          return
        }

        const handler = mod.default ?? mod.handler
        if (typeof handler !== 'function') {
          res.statusCode = 500
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ error: 'Handler tidak valid' }))
          return
        }

        // Read request body (JSON) before invoking the handler
        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(chunk as Buffer)
        let body: any = undefined
        if (chunks.length > 0) {
          const raw = Buffer.concat(chunks).toString('utf8')
          try {
            body = raw ? JSON.parse(raw) : undefined
          } catch {
            body = raw
          }
        }

        const vercelReq: any = req
        vercelReq.body = body
        vercelReq.query = Object.fromEntries(new URL(url, 'http://localhost').searchParams)

        const finish = (data: unknown) => {
          res.statusCode = vercelRes.statusCode ?? 200
          if (typeof data === 'object' && data !== null) {
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify(data))
          } else {
            res.end(data as string | undefined)
          }
        }

        const vercelRes: any = {
          statusCode: 200,
          setHeader: (name: string, value: string) => res.setHeader(name, value),
          getHeader: (name: string) => res.getHeader(name),
          set: (name: string, value: string) => res.setHeader(name, value),
          json: (payload: unknown) => finish(payload),
          status: (code: number) => {
            vercelRes.statusCode = code
            return vercelRes
          },
          send: (data?: unknown) => finish(data),
          end: (data?: unknown) => finish(data),
          redirect: (codeOrUrl: number | string, maybeUrl?: string) => {
            const code = typeof codeOrUrl === 'number' ? codeOrUrl : 302
            const location = typeof codeOrUrl === 'number' ? maybeUrl : codeOrUrl
            res.statusCode = code
            res.setHeader('Location', location ?? '/')
            res.end()
          },
        }

        try {
          await handler(vercelReq, vercelRes)
        } catch (err: any) {
          console.error('[api-dev] handler error:', err)
          if (!res.writableEnded) {
            res.statusCode = 500
            res.setHeader('Content-Type', 'application/json')
            res.end(JSON.stringify({ error: 'Internal server error' }))
          }
        }
      })
    },
  }
}
