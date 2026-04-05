'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, Package, RefreshCw, Wrench } from 'lucide-react'
import AppHeader from '@/components/layout/AppHeader'
import BottomNav from '@/components/layout/BottomNav'
import NewProductForm from '@/components/forms/NewProductForm'
import SecondHandForm from '@/components/forms/SecondHandForm'
import RepairForm from '@/components/forms/RepairForm'

type ProductType = 'new' | 'secondhand' | 'repair' | null

export default function AddProductPage() {
  const [type, setType] = useState<ProductType>(null)

  const TYPES = [
    {
      id: 'new' as const,
      icon: Package,
      label: 'New Product',
      desc: 'Brand new item entering stock',
      color: 'bg-brand-red/10',
      iconColor: 'text-brand-red',
      border: 'hover:border-brand-red/40',
    },
    {
      id: 'secondhand' as const,
      icon: RefreshCw,
      label: 'Second-hand',
      desc: 'Used item bought from customer',
      color: 'bg-brand-yellow/10',
      iconColor: 'text-brand-yellow',
      border: 'hover:border-brand-yellow/40',
    },
    {
      id: 'repair' as const,
      icon: Wrench,
      label: 'Repair Job',
      desc: 'Console/product for repair',
      color: 'bg-indigo-500/10',
      iconColor: 'text-indigo-400',
      border: 'hover:border-indigo-500/40',
    },
  ]

  if (type === 'new') return <NewProductForm onBack={() => setType(null)} />
  if (type === 'secondhand') return <SecondHandForm onBack={() => setType(null)} />
  if (type === 'repair') return <RepairForm onBack={() => setType(null)} />

  return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader title="Add Product" back />

      <div className="page-content px-4">
        <p className="text-brand-text-dim text-sm mb-6">
          Select what type of product you&apos;re adding to the system. A QR code will be generated automatically.
        </p>

        <div className="space-y-3">
          {TYPES.map(({ id, icon: Icon, label, desc, color, iconColor, border }) => (
            <button
              key={id}
              onClick={() => setType(id)}
              className={`w-full card p-5 flex items-center gap-4 active:scale-95 transition-all text-left ${border}`}
            >
              <div className={`w-14 h-14 ${color} rounded-2xl flex items-center justify-center shrink-0`}>
                <Icon size={28} className={iconColor} />
              </div>
              <div>
                <div className="font-display font-bold text-brand-text text-lg">{label}</div>
                <div className="text-sm text-brand-text-dim">{desc}</div>
              </div>
              <div className="ml-auto text-brand-muted">→</div>
            </button>
          ))}
        </div>

        <div className="mt-8 card p-4 bg-brand-dark">
          <p className="text-xs text-brand-text-dim font-display font-medium mb-2">What happens next?</p>
          <div className="space-y-1.5 text-xs text-brand-muted">
            <p>1. Fill in the product details</p>
            <p>2. A unique QR code is generated automatically</p>
            <p>3. Print the QR label and stick it on the product</p>
            <p>4. Product is added to inventory in Google Sheets</p>
          </div>
        </div>
      </div>

      <BottomNav isAdmin={false} />
    </div>
  )
}
