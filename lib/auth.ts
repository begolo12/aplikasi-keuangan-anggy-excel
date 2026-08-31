import bcrypt from 'bcryptjs'
import { SignJWT, jwtVerify } from 'jose'

const secretText = process.env.JWT_SECRET || 'anggy-keuangan-default-jwt-secret-2026'
const JWT_KEY = new TextEncoder().encode(secretText)

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
    .setExpirationTime('30d')
    .sign(JWT_KEY)
}

export async function verifySessionToken(token: string): Promise<AuthPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_KEY)
    return payload as AuthPayload
  } catch {
    return null
  }
}

export function parseCookies(cookieHeader: string | null | undefined): Record<string, string> {
  if (!cookieHeader) return {}
  return Object.fromEntries(
    cookieHeader
      .split(';')
      .map((c) => c.trim().split('='))
      .filter((pair) => pair.length === 2)
  )
}
