import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

function getJwtKey(): Uint8Array {
  const s = process.env.JWT_SECRET
  if (!s || s.length < 32) throw new Error('JWT_SECRET must be set (>=32 chars)')
  return new TextEncoder().encode(s)
}

export async function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, 10)
}

export async function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash)
}

export type AuthPayload = {
  userId: string
  email: string
  workspaceId: string
}

export async function createSessionToken(payload: AuthPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(getJwtKey())
}

export async function verifySessionToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, getJwtKey())
    return payload as AuthPayload
  } catch {
    return null
  }
}

export function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  const out: Record<string, string> = {}
  for (const part of cookieHeader.split(';')) {
    const idx = part.indexOf('=')
    if (idx === -1) continue
    const k = part.slice(0, idx).trim()
    const v = part.slice(idx + 1).trim()
    if (!k) continue
    try {
      out[k] = decodeURIComponent(v)
    } catch {
      out[k] = v
    }
  }
  return out
}
