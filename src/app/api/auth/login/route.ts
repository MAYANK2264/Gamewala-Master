import { NextRequest, NextResponse } from 'next/server'
import { createToken } from '@/lib/auth'
import { getUsers } from '@/lib/sheets'

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // ── Admin password login ──────────────────────────────────────
    if (body.adminPassword !== undefined) {
      const adminPass = process.env.ADMIN_PASSWORD || 'admin123'
      if (body.adminPassword !== adminPass) {
        return NextResponse.json({ error: 'Invalid password' }, { status: 401 })
      }
      const token = await createToken({ userId: 'admin', name: 'Admin', role: 'admin' })
      const res = NextResponse.json({ success: true, name: 'Admin', role: 'admin' })
      res.cookies.set('gw_session', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production', // Use secure only in production or with HTTPS
        sameSite: 'lax', maxAge: 60 * 60 * 12, path: '/',
      })
      return res
    }

    // ── Employee PIN login ────────────────────────────────────────
    if (body.pin !== undefined) {
      const users = await getUsers()
      let user = users.find(u => u.pin === body.pin && String(u.active) !== 'FALSE')

      // ── Demo Fallback (for testing phase) ──────────────────────────
      if (!user && body.pin === '4321') {
        user = { id: 'demo-emp', name: 'Demo Employee', role: 'employee', pin: '4321', active: 'TRUE' } as any
      }

      if (!user) {
        return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
      }
      const token = await createToken({ userId: user.id, name: user.name, role: user.role })
      const res = NextResponse.json({ success: true, name: user.name, role: user.role })
      res.cookies.set('gw_session', token, {
        httpOnly: true, 
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax', maxAge: 60 * 60 * 12, path: '/',
      })
      return res
    }

    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  } catch (e) {
    console.error('Login error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
