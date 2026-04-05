// lib/auth.ts
import { cookies } from 'next/headers'
import type { Session, UserRole } from '@/types'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-in-production'

// Using a simplified but secure signing for both Node and Edge
async function hmac(data: string): Promise<string> {
  const { createHmac } = await import('crypto')
  return createHmac('sha256', JWT_SECRET).update(data).digest('base64url')
}

export async function createToken(session: Omit<Session, 'token'>): Promise<string> {
  const payload = Buffer.from(JSON.stringify({ ...session, exp: Date.now() + 12 * 60 * 60 * 1000 })).toString('base64url')
  const sig = await hmac(payload)
  return `${payload}.${sig}`
}

export async function verifyToken(token: string): Promise<Session | null> {
  try {
    const [payload, sig] = token.split('.')
    if (!payload || !sig) return null
    const expected = await hmac(payload)
    if (sig !== expected) return null
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString())
    if (data.exp < Date.now()) return null
    return { userId: data.userId, name: data.name, role: data.role as UserRole, token }
  } catch { return null }
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = cookies()
  const token = cookieStore.get('gw_session')?.value
  if (!token) return null
  return verifyToken(token)
}

export async function requireSession(): Promise<Session> {
  const session = await getSession()
  if (!session) throw new Error('Unauthenticated')
  return session
}

export async function requireAdmin(): Promise<Session> {
  const session = await requireSession()
  if (session.role !== 'admin') throw new Error('Unauthorized')
  return session
}
