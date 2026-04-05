import { NextRequest, NextResponse } from 'next/server'
import { getInventoryItems } from '@/lib/sheets'

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const { id } = params
    const { newProducts, secondHand, repairs } = await getInventoryItems()

    const product =
      newProducts.find(p => p.id === id) ||
      secondHand.find(p => p.id === id) ||
      repairs.find(r => r.id === id)

    if (!product) return NextResponse.json({ error: 'Not found' }, { status: 404 })
    return NextResponse.json(product)
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
