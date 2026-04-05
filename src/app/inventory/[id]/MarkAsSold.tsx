'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { DollarSign, User, Phone, FileText, Loader2, CheckCircle, X } from 'lucide-react'
import toast from 'react-hot-toast'

interface Props {
  itemId: string
  itemType: 'new' | 'secondhand'
  onSuccess?: () => void
}

export default function MarkAsSold({ itemId, itemType, onSuccess }: Props) {
  const [isOpen, setIsOpen] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const [formData, setFormData] = useState({
    soldPrice: '',
    soldTo: '',
    customerPhone: '',
    saleNote: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!formData.soldPrice || !formData.soldTo) {
      return toast.error('Please fill in required fields')
    }

    setLoading(true)
    try {
      const typeMap = {
        'new': 'NewProducts',
        'secondhand': 'SecondHand'
      }

      const res = await fetch(`/api/inventory/${itemId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: typeMap[itemType],
          in_stock: 'FALSE',
          sold_at: new Date().toISOString(),
          sold_to: formData.soldTo,
          sold_price: formData.soldPrice,
          customer_phone: formData.customerPhone,
          sale_note: formData.saleNote,
          // We can't easily get the session user name here without a hook, 
          // but the sheet update logic can handle it or we can pass it from parent
        })
      })

      if (!res.ok) throw new Error('Failed to update')

      toast.success('Product marked as SOLD!')
      setIsOpen(false)
      if (onSuccess) onSuccess()
      router.refresh()
    } catch (err) {
      toast.error('Error updating status')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) {
    return (
      <button onClick={() => setIsOpen(true)} className="btn-primary w-full flex items-center justify-center gap-2">
        <DollarSign size={18} /> Mark as Sold
      </button>
    )
  }

  return (
    <div className="card p-5 border-brand-red/30 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-brand-text">Sale Details</h3>
        <button onClick={() => setIsOpen(false)} className="text-brand-muted hover:text-brand-text">
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="label">Final Selling Price (₹)</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
            <input
              type="number"
              value={formData.soldPrice}
              onChange={e => setFormData({ ...formData, soldPrice: e.target.value })}
              className="input-field pl-12"
              placeholder="e.g. 50000"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Customer Name</label>
          <div className="relative">
            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
            <input
              type="text"
              value={formData.soldTo}
              onChange={e => setFormData({ ...formData, soldTo: e.target.value })}
              className="input-field pl-12"
              placeholder="e.g. Rahul Sharma"
              required
            />
          </div>
        </div>

        <div>
          <label className="label">Customer Phone</label>
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted" size={18} />
            <input
              type="tel"
              value={formData.customerPhone}
              onChange={e => setFormData({ ...formData, customerPhone: e.target.value })}
              className="input-field pl-12"
              placeholder="e.g. 9876543210"
            />
          </div>
        </div>

        <div>
          <label className="label">Sale Note / Description</label>
          <div className="relative">
            <FileText className="absolute left-4 top-4 text-brand-muted" size={18} />
            <textarea
              value={formData.saleNote}
              onChange={e => setFormData({ ...formData, saleNote: e.target.value })}
              className="input-field pl-12 min-h-[80px]"
              placeholder="Any additional details..."
            />
          </div>
        </div>

        <button type="submit" disabled={loading} className="btn-primary w-full flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          {loading ? 'Processing...' : 'Confirm Sale'}
        </button>
      </form>
    </div>
  )
}
