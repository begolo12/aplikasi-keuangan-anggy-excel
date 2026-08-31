import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { db } from '../../lib/db'
import { verifyPassword, createSessionToken } from '../../lib/auth'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, password } = loginSchema.parse(req.body)
    const user = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email.toLowerCase().trim()),
    })
    if (!user) {
      return res.status(401).json({ error: 'Email atau password salah' })
    }

    const match = await verifyPassword(password, user.passwordHash)
    if (!match) {
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
      `anggy_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    )

    return res.status(200).json({
      user: { id: user.id, email: user.email, name: user.name },
      workspace: { id: workspace.id, name: workspace.name },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Input tidak valid', details: err.issues })
    }
    console.error('Login error:', err)
    return res.status(500).json({ error: 'Gagal login. Silakan coba lagi.' })
  }
}
