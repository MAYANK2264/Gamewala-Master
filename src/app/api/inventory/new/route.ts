import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { appendRow } from '@/lib/sheets'
import { generateProductId, generateQRDataUrl, buildQRPayload } from '@/lib/qr'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const { name, category, platform, price, mfgDate, description, imageUrl } = body

    if (!name || !price) return NextResponse.json({ error: 'Name and price required' }, { status: 400 })

    const id = generateProductId('NEW')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const qrPayload = buildQRPayload(id, appUrl)
    const qrDataUrl = await generateQRDataUrl(qrPayload)
    const now = new Date().toISOString()

    const row = [
      id, qrPayload, name, category || 'Console', platform || 'PlayStation',
      price, mfgDate || '', description || '', imageUrl || '',
      'TRUE', session.name, now, '', ''
    ]

    const saved = await appendRow('NewProducts', row)
    if (!saved) return NextResponse.json({ error: 'Failed to save to sheet' }, { status: 500 })

    return NextResponse.json({ success: true, id, qrDataUrl })
  } catch (e) {
    console.error('new product error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
