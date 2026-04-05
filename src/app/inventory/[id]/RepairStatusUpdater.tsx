'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const STATUSES = [
  { value: 'pending',   label: 'Pending',    emoji: '⏳', color: 'border-amber-500/40 text-amber-400' },
  { value: 'started',   label: 'In Progress', emoji: '🔧', color: 'border-blue-500/40 text-blue-400' },
  { value: 'finished',  label: 'Ready',       emoji: '✅', color: 'border-green-500/40 text-green-400' },
  { value: 'delivered', label: 'Delivered',   emoji: '📦', color: 'border-purple-500/40 text-purple-400' },
  { value: 'cancelled', label: 'Cancelled',   emoji: '❌', color: 'border-red-500/40 text-red-400' },
]

interface Props {
  repairId: string
  currentStatus: string
  isAdmin: boolean
}

export default function RepairStatusUpdater({ repairId, currentStatus, isAdmin }: Props) {
  const [status, setStatus] = useState(currentStatus)
  const [note, setNote] = useState('')
  const [actualCost, setActualCost] = useState('')
  const [saving, setSaving] = useState(false)
  const router = useRouter()

  const update = async () => {
    setSaving(true)
    try {
      const res = await fetch(`/api/repair/${repairId}/status`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status, note, actualCost }),
      })
      if (res.ok) {
        toast.success('Status updated!')
        router.refresh()
      } else {
        toast.error('Failed to update status')
      }
    } catch { toast.error('Error') }
    setSaving(false)
  }

  return (
    <div className="card p-5 space-y-4">
      <p className="font-display font-semibold text-brand-text text-sm">Update Repair Status</p>

      <div className="grid grid-cols-2 gap-2">
        {STATUSES.map(s => (
          <button key={s.value} onClick={() => setStatus(s.value)}
            className={clsx(
              'p-3 rounded-xl border text-sm font-display font-medium transition-all text-left',
              status === s.value ? `${s.color} bg-white/5` : 'border-brand-border text-brand-text-dim hover:border-brand-border-light'
            )}>
            <span className="mr-2">{s.emoji}</span>{s.label}
          </button>
        ))}
      </div>

      {(status === 'finished' || status === 'delivered') && (
        <div>
          <label className="label">Actual Repair Cost (₹)</label>
          <input value={actualCost} onChange={e => setActualCost(e.target.value)}
            type="number" placeholder="Final cost charged to customer" className="input-field" inputMode="numeric" />
        </div>
      )}

      <div>
        <label className="label">Note (optional)</label>
        <input value={note} onChange={e => setNote(e.target.value)}
          placeholder="What was done, any remarks..." className="input-field" />
      </div>

      <button onClick={update} disabled={saving || status === currentStatus}
        className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
        {saving ? <Loader2 size={16} className="animate-spin" /> : null}
        {saving ? 'Updating...' : 'Update Status'}
      </button>
    </div>
  )
}
