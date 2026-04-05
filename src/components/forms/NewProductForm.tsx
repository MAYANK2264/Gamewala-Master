'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, QrCode, Download, CheckCircle } from 'lucide-react'
import toast from 'react-hot-toast'
import AppHeader from '@/components/layout/AppHeader'
import ImageCapture from '@/components/forms/ImageCapture'

const CATEGORIES = ['Console', 'Game', 'Accessory', 'Controller', 'Other']
const PLATFORMS = ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Retro', 'Other']

interface Props { onBack: () => void }

export default function NewProductForm({ onBack }: Props) {
  const [form, setForm] = useState({
    name: '', category: 'Console', platform: 'PlayStation',
    price: '', mfgDate: '', description: '', imageUrl: '',
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<{ id: string; qrDataUrl: string } | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name || !form.price) { toast.error('Name and price are required'); return }
    setSaving(true)
    try {
      const res = await fetch('/api/inventory/new', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setDone({ id: data.id, qrDataUrl: data.qrDataUrl })
      toast.success('Product added!')
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
      <AppHeader title="Product Added" />
      <div className="page-content px-4 flex flex-col items-center text-center">
        <div className="card p-8 w-full max-w-sm">
          <CheckCircle size={48} className="text-green-400 mx-auto mb-4" />
          <h2 className="font-display font-bold text-2xl text-brand-text mb-1">Done!</h2>
          <p className="text-brand-text-dim text-sm mb-6">{form.name} has been added to inventory.</p>

          <div className="bg-white rounded-2xl p-4 mb-4">
            <img src={done.qrDataUrl} alt="QR Code" className="w-full max-w-[200px] mx-auto" />
          </div>

          <p className="font-mono text-xs text-brand-muted mb-6 bg-brand-dark rounded-lg px-3 py-2">{done.id}</p>

          <div className="space-y-3">
            <button onClick={downloadQR} className="btn-primary w-full flex items-center justify-center gap-2">
              <Download size={16} /> Download QR Label
            </button>
            <button onClick={onBack} className="btn-secondary w-full">Add Another Product</button>
          </div>

          <p className="text-xs text-brand-muted mt-4">Print this QR code and stick it on the product</p>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader title="New Product" back />
      <div className="page-content px-4 space-y-4">

        <div className="inline-flex items-center gap-2 badge-new mb-2">
          <span>New Product</span>
        </div>

        <div className="card p-5 space-y-4">
          <div>
            <label className="label">Product Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. Sony PS5 Console (Disc Edition)" className="input-field" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category *</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field cursor-pointer">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Platform *</label>
              <select value={form.platform} onChange={e => set('platform', e.target.value)} className="input-field cursor-pointer">
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Selling Price (₹) *</label>
              <input value={form.price} onChange={e => set('price', e.target.value)}
                type="number" placeholder="54990" className="input-field" inputMode="numeric" />
            </div>
            <div>
              <label className="label">Mfg. Date</label>
              <input value={form.mfgDate} onChange={e => set('mfgDate', e.target.value)}
                type="month" className="input-field" />
            </div>
          </div>

          <div>
            <label className="label">Description / Notes</label>
            <textarea value={form.description} onChange={e => set('description', e.target.value)}
              placeholder="Any additional details about this product..." rows={3} className="input-field resize-none" />
          </div>

          <div className="pt-2">
            <ImageCapture onCapture={(val) => set('imageUrl', val)} label="Product Photo (Optional)" />
          </div>
        </div>

        <div className="card p-4 flex items-start gap-3 bg-brand-dark">
          <QrCode size={18} className="text-brand-red shrink-0 mt-0.5" />
          <p className="text-xs text-brand-text-dim">A unique QR code will be generated when you save. Print it and stick it on the product.</p>
        </div>

        <div className="flex gap-3 pb-4">
          <button onClick={onBack} className="btn-secondary flex-1">Cancel</button>
          <button onClick={submit} disabled={saving} className="btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50">
            {saving ? <Loader2 size={16} className="animate-spin" /> : null}
            {saving ? 'Saving...' : 'Save & Generate QR'}
          </button>
        </div>
      </div>
    </div>
  )
}
