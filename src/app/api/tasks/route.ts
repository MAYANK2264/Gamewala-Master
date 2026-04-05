import { NextRequest, NextResponse } from 'next/server'
import { getSession } from '@/lib/auth'
import { appendRow } from '@/lib/sheets'
import { v4 as uuid } from 'uuid'

export async function POST(req: NextRequest) {
  try {
    const session = await getSession()
    if (!session || session.role !== 'admin') return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    const { title, description, assignedTo, assignedBy, priority, dueDate } = await req.json()
    if (!title || !assignedTo) return NextResponse.json({ error: 'Title and assignee required' }, { status: 400 })
    const row = [uuid().slice(0, 8), title, description || '', assignedTo, assignedBy || session.name, dueDate || '', 'pending', priority || 'medium', new Date().toISOString(), '']
    const ok = await appendRow('Tasks', row)
    if (!ok) return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    return NextResponse.json({ success: true })
  } catch (e) {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
