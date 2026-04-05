'use client'
import { useState } from 'react'
import { Loader2, QrCode, Download, CheckCircle, Camera } from 'lucide-react'
import toast from 'react-hot-toast'
import AppHeader from '@/components/layout/AppHeader'
import ImageCapture from '@/components/forms/ImageCapture'

const CATEGORIES = ['Console', 'Game', 'Accessory', 'Controller', 'Other']
const PLATFORMS = ['PlayStation', 'Xbox', 'Nintendo', 'PC', 'Retro', 'Other']
const CONDITIONS = ['Excellent', 'Good', 'Fair', 'Poor']

interface Props { onBack: () => void }

export default function SecondHandForm({ onBack }: Props) {
  const [form, setForm] = useState({
    name: '', category: 'Console', platform: 'PlayStation',
    sellingPrice: '', buyingPrice: '', originalPrice: '',
    purchaseDate: '', condition: 'Good', knownIssues: '', description: '',
    imageUrl: '', receiptImageUrl: '',
    sellerName: '', sellerPhone: '', sellerAddress: '',
  })
  const [saving, setSaving] = useState(false)
  const [done, setDone] = useState<{ id: string; qrDataUrl: string } | null>(null)

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }))

  const submit = async () => {
    if (!form.name || !form.sellingPrice || !form.buyingPrice || !form.sellerName || !form.sellerPhone) {
      toast.error('Fill all required fields (name, prices, seller info)')
      return
    }
    setSaving(true)
    try {
      const res = await fetch('/api/inventory/secondhand', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      setDone({ id: data.id, qrDataUrl: data.qrDataUrl })
      toast.success('Second-hand product added!')
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
          <p className="text-brand-text-dim text-sm mb-6">{form.name} added to second-hand inventory.</p>
          <div className="bg-white rounded-2xl p-4 mb-4">
            <img src={done.qrDataUrl} alt="QR" className="w-full max-w-[200px] mx-auto" />
          </div>
          <p className="font-mono text-xs text-brand-muted mb-6 bg-brand-dark rounded-lg px-3 py-2">{done.id}</p>
          <div className="space-y-3">
            <button onClick={downloadQR} className="btn-primary w-full flex items-center justify-center gap-2">
              <Download size={16} /> Download QR Label
            </button>
            <button onClick={onBack} className="btn-secondary w-full">Add Another</button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader title="Second-hand Product" back />
      <div className="page-content px-4 space-y-4">
        <div className="inline-flex items-center gap-2 badge-used">Second-hand</div>

        {/* Product info */}
        <div className="card p-5 space-y-4">
          <p className="font-display font-semibold text-brand-text text-sm">Product Details</p>
          <div>
            <label className="label">Product Name *</label>
            <input value={form.name} onChange={e => set('name', e.target.value)}
              placeholder="e.g. PS4 Pro 1TB" className="input-field" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Category</label>
              <select value={form.category} onChange={e => set('category', e.target.value)} className="input-field">
                {CATEGORIES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Platform</label>
              <select value={form.platform} onChange={e => set('platform', e.target.value)} className="input-field">
                {PLATFORMS.map(p => <option key={p}>{p}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="label">Condition *</label>
            <div className="grid grid-cols-4 gap-2">
              {CONDITIONS.map(c => (
                <button key={c} onClick={() => set('condition', c)}
                  className={`py-2 rounded-xl text-sm font-display font-medium border transition-all ${
                    form.condition === c ? 'bg-brand-red border-brand-red text-white' : 'border-brand-border text-brand-text-dim'
                  }`}>
                  {c}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="label">Known Issues</label>
            <input value={form.knownIssues} onChange={e => set('knownIssues', e.target.value)}
              placeholder="e.g. Minor scratches on top, controller L2 stiff" className="input-field" />
          </div>
        </div>

        {/* Pricing */}
        <div className="card p-5 space-y-4">
          <p className="font-display font-semibold text-brand-text text-sm">Pricing</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">We're buying at (₹) *</label>
              <input value={form.buyingPrice} onChange={e => set('buyingPrice', e.target.value)}
                type="number" placeholder="12000" className="input-field" inputMode="numeric" />
            </div>
            <div>
              <label className="label">We'll sell at (₹) *</label>
              <input value={form.sellingPrice} onChange={e => set('sellingPrice', e.target.value)}
                type="number" placeholder="18999" className="input-field" inputMode="numeric" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="label">Original MRP (₹)</label>
              <input value={form.originalPrice} onChange={e => set('originalPrice', e.target.value)}
                type="number" placeholder="34990" className="input-field" inputMode="numeric" />
            </div>
            <div>
              <label className="label">Purchase Date</label>
              <input value={form.purchaseDate} onChange={e => set('purchaseDate', e.target.value)}
                type="date" className="input-field" />
            </div>
          </div>
        </div>

        {/* Seller info */}
        <div className="card p-5 space-y-4">
          <p className="font-display font-semibold text-brand-text text-sm">Seller Information</p>
          <div>
            <label className="label">Seller Name *</label>
            <input value={form.sellerName} onChange={e => set('sellerName', e.target.value)}
              placeholder="Full name" className="input-field" />
          </div>
          <div>
            <label className="label">Seller Phone *</label>
            <input value={form.sellerPhone} onChange={e => set('sellerPhone', e.target.value)}
              type="tel" placeholder="+91 XXXXXXXXXX" className="input-field" inputMode="tel" />
          </div>
          <div>
            <label className="label">Seller Address</label>
            <input value={form.sellerAddress} onChange={e => set('sellerAddress', e.target.value)}
              placeholder="Optional" className="input-field" />
          </div>
        </div>

        {/* Images */}
        <div className="card p-5 space-y-4">
          <p className="font-display font-semibold text-brand-text text-sm">Photos</p>
          <div className="pt-2">
            <ImageCapture onCapture={(val) => set('imageUrl', val)} label="Product Photo (Optional)" />
          </div>
          <div className="pt-2">
            <ImageCapture onCapture={(val) => set('receiptImageUrl', val)} label="Original Bill / Receipt Photo (Optional)" />
          </div>
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
