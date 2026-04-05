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
      name, category, platform, sellingPrice, buyingPrice, originalPrice,
      purchaseDate, condition, knownIssues, description, imageUrl, receiptImageUrl,
      sellerName, sellerPhone, sellerAddress,
    } = body

    if (!name || !sellingPrice || !buyingPrice || !sellerName || !sellerPhone)
      return NextResponse.json({ error: 'Required fields missing' }, { status: 400 })

    const id = generateProductId('SH')
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3001'
    const qrPayload = buildQRPayload(id, appUrl)
    const qrDataUrl = await generateQRDataUrl(qrPayload)
    const now = new Date().toISOString()

    const row = [
      id, qrPayload, name, category || 'Console', platform || 'PlayStation',
      sellingPrice, buyingPrice, originalPrice || '',
      purchaseDate || '', condition || 'Good', knownIssues || '', description || '',
      imageUrl || '', receiptImageUrl || '',
      sellerName, sellerPhone, sellerAddress || '',
      session.name, now, 'TRUE', '', ''
    ]

    const saved = await appendRow('SecondHand', row)
    if (!saved) return NextResponse.json({ error: 'Failed to save to sheet' }, { status: 500 })

    return NextResponse.json({ success: true, id, qrDataUrl })
  } catch (e) {
    console.error('secondhand error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
