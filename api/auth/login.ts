import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { db } from '../../lib/db.js'
import { verifyPassword, createSessionToken } from '../../lib/auth.js'
import { isRateLimited, rateLimitResponse } from './rate-limit.js'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

// Hash dummy agar path "user tidak ada" tetap membayar biaya bcrypt —
// menutup side-channel timing untuk enumerasi email.
const DUMMY_HASH = '$2b$10$CwTycUXWue0Thq9StjUM0uJ8DGMk2IpMSKM9jBq0Kqd11HkzudX7K'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const rl = isRateLimited(req, 'login', 10, 60_000)
  if (rl) return rateLimitResponse(res, rl)

  try {
    const { email, password } = loginSchema.parse(req.body)
    const normalizedEmail = email.toLowerCase().trim()
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, normalizedEmail),
    })

    const match = await verifyPassword(password, user?.passwordHash ?? DUMMY_HASH)
    if (!user || !match) {
      return res.status(401).json({ error: 'Email atau password salah' })
    }

    const workspace = await db.query.workspaces.findFirst({
      where: (w, { eq }) => eq(w.userId, user.id),
    })
    if (!workspace) {
      return res.status(500).json({ error: 'Workspace tidak ditemukan' })
    }

    const token = await createSessionToken({
      userId: user.id,
      email: user.email,
      workspaceId: workspace.id,
    })

    res.setHeader(
      'Set-Cookie',
      `anggy_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${7 * 24 * 3600}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    )

    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: workspace.id, name: workspace.name },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Input tidak valid' })
    }
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Gagal login. Silakan coba lagi.' })
  }
}
