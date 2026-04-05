import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { appendRow } from '@/lib/sheets'
import { generateProductId, generateQRDataUrl, buildQRPayload } from '@/lib/qr'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const body = await req.json()
    const {
      productName, platform, problemDescription,
      ownerName, ownerPhone, ownerAddress,
      estimateCost, imageUrl, receivedDate,
    } = body

    if (!productName || !problemDescription || !ownerName || !ownerPhone)
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })

    const id = generateProductId('REP')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const qrPayload = buildQRPayload(id, appUrl)
    const qrDataUrl = await generateQRDataUrl(qrPayload)
    const now = new Date().toISOString()
    const initialHistory = JSON.stringify([{
      status: 'pending', note: 'Job created', updatedBy: session.name, updatedAt: now
    }])

    const row = [
      id, qrPayload, productName, platform || 'PlayStation',
      problemDescription, ownerName, ownerPhone, ownerAddress || '',
      receivedDate || now.split('T')[0], '', '',
      estimateCost || '', '',
      'pending', initialHistory,
      session.name, session.name, imageUrl || '', now
    ]

    const saved = await appendRow('Repairs', row)
    if (!saved) return NextResponse.json({ error: 'Failed to save to sheet' }, { status: 500 })

    return NextResponse.json({ success: true, id, qrDataUrl })
  } catch (e) {
    console.error('repair error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
