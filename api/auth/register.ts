import type { VercelRequest, VercelResponse } from '@vercel/node'
import type { BatchItem } from 'drizzle-orm/batch'
import { z } from 'zod'
import { db } from '../../lib/db.js'
import { users, workspaces, settings } from '../../lib/schema.js'
import { hashPassword, createSessionToken } from '../../lib/auth.js'
import { isRateLimited, rateLimitResponse } from './rate-limit.js'

const registerSchema = z.object({
  email: z.string().email().max(120),
  password: z.string().min(8).max(72),
  name: z.string().max(80).optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const rl = isRateLimited(req, 'register', 5, 60_000)
  if (rl) return rateLimitResponse(res, rl)

  try {
    const { email, password, name } = registerSchema.parse(req.body)
    const normalizedEmail = email.toLowerCase().trim()
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, normalizedEmail),
    })
    if (existing) {
      return res.status(400).json({ error: 'Email sudah terdaftar. Silakan login.' })
    }

    const userId = crypto.randomUUID()
    const workspaceId = crypto.randomUUID()
    const passwordHash = await hashPassword(password)

    // Atomic: user + workspace + settings dibuat bersamaan atau tidak sama sekali.
    await db.batch([
      db.insert(users).values({
        id: userId,
        email: normalizedEmail,
        passwordHash,
        name: name?.trim() || 'Pengguna',
      }),
      db.insert(workspaces).values({
        id: workspaceId,
        userId,
        name: 'Keuangan Personal',
      }),
      db.insert(settings).values({
        workspaceId,
        year: 2026,
        saldoAwal: '0',
        demoMode: false,
      }),
    ] as [BatchItem<'pg'>, BatchItem<'pg'>, BatchItem<'pg'>])

    const token = await createSessionToken({
      userId,
      email: normalizedEmail,
      workspaceId,
    })

    res.setHeader(
      'Set-Cookie',
      `anggy_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    )

    return res.status(200).json({
      user: { id: userId, email: normalizedEmail, name: name || 'Pengguna' },
      workspace: { id: workspaceId, name: 'Keuangan Personal' },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Input tidak valid' })
    }
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Gagal mendaftar. Silakan coba lagi.' })
  }
}
