import { NextRequest, NextResponse } from 'next/server'
import { getInventoryItems } from '@/lib/sheets'

import { updateRowById } from '@/lib/sheets'
import { getSession } from '@/lib/auth'

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

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { id } = params
    const body = await req.json()
    const { type, ...updateData } = body

    if (!type || !['NewProducts', 'SecondHand', 'Repairs'].includes(type)) {
      return NextResponse.json({ error: 'Invalid item type' }, { status: 400 })
    }

    const success = await updateRowById(type, id, updateData)
    if (!success) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('PATCH inventory error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
