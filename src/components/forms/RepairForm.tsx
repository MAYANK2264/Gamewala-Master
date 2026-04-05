'use client'
import { useState } from 'react'
import { Loader2, QrCode, Download, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import AppHeader from '@/components/layout/AppHeader'
import ImageCapture from '@/components/forms/ImageCapture'

const PLATFORMS = ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Retro', 'Other']

interface Props { onBack: () => void }

export default function RepairForm({ onBack }: Props) {
  const [form, setForm] = useState({
    productName: '', platform: 'PlayStation',
    problemDescription: '',
    ownerName: '', ownerPhone: '', ownerAddress: '',
    estimateCost: '', imageUrl: '',
    receivedDate: new Date().toISOString().split('T')[0],
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<{ id: string; qrDataUrl: string } | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.productName || !form.problemDescription || !form.ownerName || !form.ownerPhone) {
      toast.error('Fill all required fields')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/inventory/repair', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.status === 401) {
        toast.error('Session expired. Please log in again.', { duration: 4000 })
        return
      }
      if (!res.ok) throw new Error(data.error || 'Failed')
      setDone({ id: data.id, qrDataUrl: data.qrDataUrl })
      toast.success('Repair job created!')
    } catch (e: unknown) {
      toast.error(e instanceof Error ? e.message : 'Failed to save')
    }
    setSaving(false)
  }

  const downloadQR = () => {
    if (!done) return
    const a = document.createElement('a')
    a.href = done.qrDataUrl
    a.download = `QR-${done.id}.png`
    a.click()
  }

  if (done) return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader title="Repair Job Created" />
      <div className="page-content px-4 flex flex-col items-center text-center">
        <div className="card p-8 w-full font-display">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-brand-text mb-1">Repair Job Created!</h2>
          <p className="text-brand-text-dim text-sm mb-2">{form.productName}</p>
          <p className="text-xs text-brand-muted mb-6">Owner: {form.ownerName} · {form.ownerPhone}</p>
          <div className="bg-white rounded-2xl p-4 mb-4">
            <img src={done.qrDataUrl} alt="QR" className="w-full h-auto mx-auto" />
          </div>
          <p className="font-mono text-xs text-brand-muted mb-6 bg-brand-dark rounded-lg px-3 py-2">{done.id}</p>
          <div className="space-y-3">
            <button onClick={downloadQR} className="btn-primary w-full flex items-center justify-center gap-2">
              <Download size={16} /> Download QR Label
            </button>
            <button onClick={onBack} className="btn-secondary w-full">Add Another</button>
          </div>
          <p className="text-xs text-brand-muted mt-3">Stick this QR on the product — scan it to update repair status</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader title="New Repair Job" back />
      <div className="page-content px-4 space-y-4">
        <div className="inline-flex items-center gap-2 badge-repair">Repair Job</div>

        {/* Product info */}
        <div className="card p-5 space-y-4">
          <p className="font-display font-semibold text-brand-text text-sm">Product Info</p>
          <div>
            <label className="label">Product / Console Name *</label>
            <input value={form.productName} onChange={e => set('productName', e.target.value)}
              placeholder="e.g. PS4 Pro, Xbox One S, Nintendo Switch" className="input-field" />
          </div>
          <div>
            <label className="label">Platform</label>
            <select value={form.platform} onChange={e => set('platform', e.target.value)} className="input-field">
              {PLATFORMS.map(p => <option key={p}>{p}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Problem Description *</label>
            <textarea value={form.problemDescription} onChange={e => set('problemDescription', e.target.value)}
              placeholder="Describe the issue in detail — e.g. Console won't turn on, disc not reading, HDMI port broken, joy-con drift..." rows={4} className="input-field resize-none" />
          </div>
          <div className="pt-2">
            <ImageCapture onCapture={(val) => set('imageUrl', val)} label="Product Photo (Optional)" />
          </div>
        </div>

        {/* Owner info */}
        <div className="card p-5 space-y-4">
          <p className="font-display font-semibold text-brand-text text-sm">Owner Details</p>
          <div>
            <label className="label">Owner Name *</label>
            <input value={form.ownerName} onChange={e => set('ownerName', e.target.value)}
              placeholder="Customer full name" className="input-field" />
          </div>
          <div>
            <label className="label">Owner Phone *</label>
            <input value={form.ownerPhone} onChange={e => set('ownerPhone', e.target.value)}
              type="tel" placeholder="+91 XXXXXXXXXX" className="input-field" inputMode="tel" />
          </div>
          <div>
            <label className="label">Owner Address</label>
            <input value={form.ownerAddress} onChange={e => set('ownerAddress', e.target.value)}
              placeholder="Optional" className="input-field" />
          </div>
        </div>

        {/* Repair meta */}
        <div className="card p-5 space-y-4">
          <p className="font-display font-semibold text-brand-text text-sm">Repair Details</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="label">Received Date</label>
              <input value={form.receivedDate} onChange={e => set('receivedDate', e.target.value)}
                type="date" className="input-field" />
            </div>
            <div>
              <label className="label">Estimate Cost (₹)</label>
              <input value={form.estimateCost} onChange={e => set('estimateCost', e.target.value)}
                type="number" placeholder="500" className="input-field" inputMode="numeric" />
            </div>
          </div>
        </div>

        <div className="flex gap-3 pb-4">
          <button onClick={onBack} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? 'Creating...' : 'Create Repair Job'}
          </button>
        </div>
      </div>
    </div>
  )
}
