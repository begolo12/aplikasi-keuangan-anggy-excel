import type { VercelRequest, VercelResponse } from '@vercel/node'
import { z } from 'zod'
import { db } from '../../lib/db'
import { users, workspaces, settings } from '../../lib/schema'
import { hashPassword, createSessionToken } from '../../lib/auth'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
})

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  try {
    const { email, password, name } = registerSchema.parse(req.body)
    const existing = await db.query.users.findFirst({
      where: (u, { eq }) => eq(u.email, email.toLowerCase().trim()),
    })
    if (existing) {
      return res.status(400).json({ error: 'Email sudah terdaftar. Silakan login.' })
    }

    const userId = crypto.randomUUID()
    const workspaceId = crypto.randomUUID()
    const passwordHash = await hashPassword(password)

    await db.insert(users).values({
      id: userId,
      email: email.toLowerCase().trim(),
      passwordHash,
      name: name?.trim() || 'Pengguna',
    })

    await db.insert(workspaces).values({
      id: workspaceId,
      userId,
      name: 'Keuangan Personal',
    })

    await db.insert(settings).values({
      workspaceId,
      year: 2026,
      saldoAwal: '0',
      demoMode: false,
    })

    const token = await createSessionToken({
      userId,
      email: email.toLowerCase().trim(),
      workspaceId,
    })

    res.setHeader(
      'Set-Cookie',
      `anggy_session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${30 * 24 * 3600}${process.env.NODE_ENV === 'production' ? '; Secure' : ''}`
    )

    return res.status(200).json({
      user: { id: userId, email: email.toLowerCase().trim(), name: name || 'Pengguna' },
      workspace: { id: workspaceId, name: 'Keuangan Personal' },
    })
  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({ error: 'Input tidak valid', details: err.errors })
    }
    console.error('Register error:', err)
    return res.status(500).json({ error: 'Gagal mendaftar. Silakan coba lagi.' })
  }
}
