import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { updateRowById, readSheet, toObjects } from '@/lib/sheets'

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getSession()
    if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

    const { status, note, actualCost } = await req.json()
    const validStatuses = ['pending', 'started', 'finished', 'delivered', 'cancelled']
    if (!validStatuses.includes(status)) return NextResponse.json({ error: 'Invalid status' }, { status: 400 })

    // Get existing history
    const rows = await readSheet('Repairs')
    const repairs = toObjects<Record<string, string>>(rows)
    const repair = repairs.find(r => r.id === params.id)
    if (!repair) return NextResponse.json({ error: 'Repair not found' }, { status: 404 })

    const now = new Date().toISOString()
    let history = []
    try { history = JSON.parse(repair.status_history || '[]') } catch { history = [] }
    history.push({ status, note: note || '', updatedBy: session.name, updatedAt: now })

    const updates: Record<string, string> = {
      status,
      status_history: JSON.stringify(history),
    }
    if (actualCost) updates.actual_cost = actualCost
    if (status === 'delivered') updates.delivered_date = now.split('T')[0]

    const ok = await updateRowById('Repairs', params.id, updates)
    if (!ok) return NextResponse.json({ error: 'Update failed' }, { status: 500 })

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('repair status update error:', e)
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
