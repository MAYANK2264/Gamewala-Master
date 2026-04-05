import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getRepairs } from '@/lib/sheets'
import BottomNav from '@/components/layout/BottomNav'
import AppHeader from '@/components/layout/AppHeader'
import { Plus, Phone, Wrench } from 'lucide-react'
import clsx from 'clsx'

export const dynamic = 'force-dynamic'

const STATUS_TABS = ['all', 'pending', 'started', 'finished', 'delivered'] as const
type StatusTab = typeof STATUS_TABS[number]

export default async function RepairPage({ searchParams }: { searchParams: { status?: string } }) {
  const session = await getSession().catch(() => null)
  if (!session) redirect('/login')

  const repairs = await getRepairs().catch(() => [])
  const activeTab = (searchParams.status || 'all') as StatusTab

  const filtered = activeTab === 'all' ? repairs : repairs.filter(r => r.status === activeTab)
  const sorted = filtered.sort((a, b) =>
    new Date(b.received_date || b.receivedDate || '').getTime() -
    new Date(a.received_date || a.receivedDate || '').getTime()
  )

  const counts = {
    all: repairs.length,
    pending: repairs.filter(r => r.status === 'pending').length,
    started: repairs.filter(r => r.status === 'started').length,
    finished: repairs.filter(r => r.status === 'finished').length,
    delivered: repairs.filter(r => r.status === 'delivered').length,
  }

  return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader title="Repairs" actions={
        <Link href="/add-product" className="text-xs text-brand-red border border-brand-red/30 rounded-lg px-3 py-1.5">
          + New
        </Link>
      } />

      <div className="page-content px-4 space-y-4">
        {/* Status tabs - horizontal scroll */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-4 px-4">
          {STATUS_TABS.map(tab => (
            <Link key={tab} href={`/repair?status=${tab}`}
              className={clsx(
                'shrink-0 px-4 py-2 rounded-xl text-sm font-display font-medium transition-all capitalize',
                activeTab === tab ? 'bg-brand-red text-white' : 'bg-brand-card border border-brand-border text-brand-text-dim'
              )}>
              {tab} ({counts[tab]})
            </Link>
          ))}
        </div>

        {/* List */}
        {sorted.length === 0 ? (
          <div className="card p-10 text-center">
            <Wrench size={36} className="text-brand-muted mx-auto mb-3" />
            <p className="font-display font-semibold text-brand-text mb-1">No repair jobs</p>
            <p className="text-sm text-brand-text-dim mb-4">No jobs with status &quot;{activeTab}&quot;</p>
            <Link href="/add-product" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5">
              <Plus size={15} /> Create Repair Job
            </Link>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((r, i) => {
              const name = (r as unknown as Record<string,string>).product_name || r.productName || 'Unknown'
              const owner = (r as unknown as Record<string,string>).owner_name || r.ownerName || ''
              const phone = (r as unknown as Record<string,string>).owner_phone || r.ownerPhone || ''
              const received = (r as unknown as Record<string,string>).received_date || r.receivedDate || ''
              const status = r.status || 'pending'

              return (
                <div key={r.id || i} className="card p-4 space-y-3">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="font-display font-semibold text-brand-text text-sm truncate">{name}</p>
                      <p className="font-mono text-xs text-brand-muted mt-0.5">{r.id}</p>
                    </div>
                    <span className={clsx('text-xs border rounded-full px-2.5 py-1 font-display shrink-0', `status-${status}`)}>
                      {status}
                    </span>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-brand-text-dim">
                    <span className="flex items-center gap-1">👤 {owner}</span>
                    {received && <span className="flex items-center gap-1">📅 {received}</span>}
                  </div>

                  <div className="flex gap-2">
                    <Link href={`/inventory/${r.id}`} className="btn-secondary flex-1 text-center text-xs py-2">
                      View Details
                    </Link>
                    {phone && (
                      <a href={`tel:${phone}`} className="bg-green-600 text-white rounded-xl px-4 py-2 flex items-center gap-1.5 text-xs font-display font-medium">
                        <Phone size={13} /> Call
                      </a>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <BottomNav isAdmin={session.role === 'admin'} />
    </div>
  )
}
