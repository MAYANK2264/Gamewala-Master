'use client'
import { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, X, Package, RefreshCw, Wrench } from 'lucide-react'
import clsx from 'clsx'

type ItemType = 'new' | 'secondhand' | 'repair'
interface Item { id: string; name?: string; product_name?: string; productName?: string; platform?: string; price?: number; sellingPrice?: number; status?: string; condition?: string; _type: ItemType; inStock?: boolean | string; sellerName?: string; seller_name?: string; ownerName?: string; owner_name?: string }

interface Props {
  items: Item[]
  isAdmin: boolean
}

const TYPE_LABELS: Record<ItemType, string> = { new: 'New', secondhand: 'Second-hand', repair: 'Repairs' }
const TYPE_ICONS: Record<ItemType, typeof Package> = { new: Package, secondhand: RefreshCw, repair: Wrench }
const TYPE_COLORS: Record<ItemType, string> = { new: 'text-brand-red', secondhand: 'text-brand-yellow', repair: 'text-indigo-400' }

export default function InventoryClient({ items, isAdmin }: Props) {
  const [search, setSearch] = useState('')
  const [typeFilter, setTypeFilter] = useState<'all' | ItemType>('all')

  const filtered = useMemo(() => {
    let res = [...items]
    if (typeFilter !== 'all') res = res.filter(i => i._type === typeFilter)
    if (search) {
      const q = search.toLowerCase()
      res = res.filter(i => {
        const name = (i.name || i.product_name || i.productName || '').toLowerCase()
        const id = (i.id || '').toLowerCase()
        const platform = (i.platform || '').toLowerCase()
        return name.includes(q) || id.includes(q) || platform.includes(q)
      })
    }
    return res
  }, [items, typeFilter, search])

  return (
    <div className="space-y-4">
      {/* Search */}
      <div className="relative">
        <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-brand-muted" />
        <input
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Search by name, ID, platform..."
          className="input-field pl-10 pr-10"
        />
        {search && (
          <button onClick={() => setSearch('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
            <X size={15} />
          </button>
        )}
      </div>

      {/* Type filter */}
      <div className="flex gap-2 overflow-x-auto pb-1">
        {(['all', 'new', 'secondhand', 'repair'] as const).map(t => (
          <button key={t} onClick={() => setTypeFilter(t)}
            className={clsx(
              'shrink-0 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all',
              typeFilter === t ? 'bg-brand-red text-white' : 'bg-brand-card border border-brand-border text-brand-text-dim'
            )}>
            {t === 'all' ? `All (${items.length})` : `${TYPE_LABELS[t]} (${items.filter(i => i._type === t).length})`}
          </button>
        ))}
      </div>

      {/* Count */}
      <p className="text-xs text-brand-muted font-display">{filtered.length} items</p>

      {/* Items */}
      {filtered.length === 0 ? (
        <div className="card p-10 text-center">
          <Package size={36} className="text-brand-muted mx-auto mb-3" />
          <p className="text-brand-text-dim">No items found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(item => {
            const Icon = TYPE_ICONS[item._type]
            const iconColor = TYPE_COLORS[item._type]
            const name = item.name || item.product_name || item.productName || 'Unnamed'
            const price = item.price || item.sellingPrice
            const extra = item._type === 'repair'
              ? (item.owner_name || item.ownerName || '')
              : item._type === 'secondhand'
              ? (item.seller_name || item.sellerName || '')
              : item.platform || ''

            return (
              <Link key={item.id} href={`/inventory/${item.id}`}
                className="card p-4 flex items-center gap-3 active:scale-[0.99] transition-all hover:border-brand-border-light">
                <div className={`w-12 h-12 rounded-xl bg-brand-dark flex items-center justify-center shrink-0 overflow-hidden shadow-sm border border-brand-border/50 ${iconColor}`}>
                  {(item as any).image_url || (item as any).imageUrl ? (
                    <img src={(item as any).image_url || (item as any).imageUrl} className="w-full h-full object-cover" alt="Thumbnail" />
                  ) : (
                    <Icon size={20} />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-display font-semibold text-brand-text text-sm truncate">{name}</p>
                  <p className="text-xs text-brand-text-dim truncate">{item.id} · {extra}</p>
                </div>
                <div className="text-right shrink-0">
                  {item._type === 'repair' && item.status && (
                    <span className={`text-xs border rounded-full px-2 py-0.5 font-display status-${item.status}`}>
                      {item.status}
                    </span>
                  )}
                  {price && item._type !== 'repair' && (
                    <span className="text-sm font-display font-bold text-brand-red">₹{Number(price).toLocaleString('en-IN')}</span>
                  )}
                  {item._type !== 'repair' && String(item.inStock) === 'FALSE' && (
                    <span className="text-xs text-brand-muted block">Sold</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
