import type { VercelRequest, VercelResponse } from '@vercel/node'
import { verifySessionToken, parseCookies } from '../../lib/auth.js'
import { db } from '../../lib/db.js'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const cookies = parseCookies(req.headers.cookie)
  const token = cookies.anggy_session
  if (!token) return res.status(401).json({ error: 'Belum login' })

  const session = await verifySessionToken(token)
  if (!session) return res.status(401).json({ error: 'Sesi kedaluwarsa' })

  const user = await db.query.users.findFirst({
    where: (u, { eq }) => eq(u.id, session.userId),
  })
  if (!user) return res.status(401).json({ error: 'User tidak ditemukan' })

  const workspace = await db.query.workspaces.findFirst({
    where: (w, { eq }) => eq(w.id, session.workspaceId),
  })

  return res.status(200).json({
    user: { id: user.id, email: user.email, name: user.name },
    workspace: workspace ? { id: workspace.id, name: workspace.name } : null,
  })
}
