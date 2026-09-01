import type { VercelRequest, VercelResponse } from '@vercel/node'

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' })

  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : ''
  res.setHeader('Set-Cookie', `anggy_session=; Path=/; HttpOnly; SameSite=Lax${secure}; Max-Age=0`)
  return res.status(200).json({ ok: true })
}
