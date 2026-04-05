import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getInventoryItems, getRepairs, getTasks } from '@/lib/sheets'
import BottomNav from '@/components/layout/BottomNav'
import { Package, Wrench, QrCode, Plus, Clock, CheckCircle, AlertCircle, ChevronRight, ClipboardList } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const session = await getSession().catch(() => null)
  if (!session) redirect('/login')

  const [{ newProducts, secondHand, repairs }, tasks] = await Promise.all([
    getInventoryItems().catch(() => ({ newProducts: [], secondHand: [], repairs: [] })),
    getTasks().catch(() => []),
  ])

  const totalNew = newProducts.filter(p => String(p.inStock) !== 'FALSE').length
  const totalUsed = secondHand.filter(p => String(p.inStock) !== 'FALSE').length
  const repairsPending = repairs.filter(r => r.status === 'pending').length
  const repairsStarted = repairs.filter(r => r.status === 'started').length
  const repairsFinished = repairs.filter(r => r.status === 'finished').length

  const myTasks = session.role === 'employee'
    ? tasks.filter(t => t.assigned_to === session.name && t.status !== 'done')
    : tasks.filter(t => t.status !== 'done')

  const recentRepairs = repairs
    .sort((a, b) => new Date(b.received_date || b.receivedDate || '').getTime() - new Date(a.received_date || a.receivedDate || '').getTime())
    .slice(0, 3)

  return (
    <div className="min-h-screen bg-brand-black">
      {/* Header */}
      <header className="app-header">
        <div className="flex items-center justify-between px-4 h-14">
          <div>
            <h1 className="font-display font-bold text-lg text-brand-text">
              Hey, {session.name.split(' ')[0]} 👋
            </h1>
            <p className="text-xs text-brand-text-dim capitalize">{session.role} · Gamewala</p>
          </div>
          <Link href="/api/auth/logout" className="text-xs text-brand-muted hover:text-brand-red px-3 py-1.5 rounded-lg border border-brand-border">
            Logout
          </Link>
        </div>
      </header>

      <div className="page-content px-4 space-y-6">

        {/* Quick actions */}
        <div className="grid grid-cols-2 gap-3 pt-2">
          <Link href="/scan" className="card p-4 flex flex-col gap-2 active:scale-95 transition-all hover:border-brand-red/30">
            <div className="w-10 h-10 bg-brand-red rounded-xl flex items-center justify-center">
              <QrCode size={20} className="text-white" />
            </div>
            <span className="font-display font-semibold text-brand-text">Scan QR</span>
            <span className="text-xs text-brand-text-dim">Lookup any product</span>
          </Link>
          <Link href="/add-product" className="card p-4 flex flex-col gap-2 active:scale-95 transition-all hover:border-green-500/30">
            <div className="w-10 h-10 bg-green-600 rounded-xl flex items-center justify-center">
              <Plus size={20} className="text-white" />
            </div>
            <span className="font-display font-semibold text-brand-text">Add Product</span>
            <span className="text-xs text-brand-text-dim">New, used or repair</span>
          </Link>
        </div>

        {/* Inventory stats - Show only relevant parts for employees */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-brand-text-dim uppercase tracking-wider">Inventory</h2>
            <Link href="/inventory" className="text-xs text-brand-red">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Link href="/inventory?type=new" className="card p-3 text-center active:scale-95 transition-all">
              <div className="font-display font-bold text-2xl text-brand-red">{totalNew}</div>
              <div className="text-xs text-brand-text-dim mt-1">New</div>
            </Link>
            <Link href="/inventory?type=secondhand" className="card p-3 text-center active:scale-95 transition-all">
              <div className="font-display font-bold text-2xl text-brand-yellow">{totalUsed}</div>
              <div className="text-xs text-brand-text-dim mt-1">Used</div>
            </Link>
            <div className="card p-3 text-center">
              <div className="font-display font-bold text-2xl text-indigo-400">{repairs.length}</div>
              <div className="text-xs text-brand-text-dim mt-1">Repairs</div>
            </div>
          </div>
        </div>

        {/* Repair status */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="font-display font-semibold text-sm text-brand-text-dim uppercase tracking-wider">Repair Status</h2>
            <Link href="/repair" className="text-xs text-brand-red">View all →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <div className="card p-3 text-center border-amber-500/20">
              <AlertCircle size={18} className="text-amber-400 mx-auto mb-1" />
              <div className="font-display font-bold text-lg text-amber-400">{repairsPending}</div>
              <div className="text-xs text-brand-text-dim">Pending</div>
            </div>
            <div className="card p-3 text-center border-blue-500/20">
              <Clock size={18} className="text-blue-400 mx-auto mb-1" />
              <div className="font-display font-bold text-lg text-blue-400">{repairsStarted}</div>
              <div className="text-xs text-brand-text-dim">In Progress</div>
            </div>
            <div className="card p-3 text-center border-green-500/20">
              <CheckCircle size={18} className="text-green-400 mx-auto mb-1" />
              <div className="font-display font-bold text-lg text-green-400">{repairsFinished}</div>
              <div className="text-xs text-brand-text-dim">Ready</div>
            </div>
          </div>
        </div>

        {/* My tasks/Open tasks */}
        {myTasks.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-sm text-brand-text-dim uppercase tracking-wider">
                {session.role === 'admin' ? 'Open Tasks' : 'My Assigned Tasks'}
              </h2>
              {session.role === 'admin' && (
                <Link href="/admin/tasks" className="text-xs text-brand-red">Manage →</Link>
              )}
            </div>
            <div className="space-y-2">
              {myTasks.slice(0, 3).map((task, i) => (
                <div key={i} className="card p-4 flex items-start gap-3">
                  <div className={`w-2 h-2 rounded-full mt-1.5 shrink-0 ${
                    task.priority === 'high' ? 'bg-red-400' :
                    task.priority === 'medium' ? 'bg-amber-400' : 'bg-green-400'
                  }`} />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-brand-text truncate">{task.title}</p>
                    <p className="text-xs text-brand-text-dim mt-0.5">Assigned to: {task.assigned_to || task.assignedTo}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Recent repairs */}
        {recentRepairs.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="font-display font-semibold text-sm text-brand-text-dim uppercase tracking-wider">Recent Repairs</h2>
              <Link href="/repair" className="text-xs text-brand-red">View all →</Link>
            </div>
            <div className="space-y-2">
              {recentRepairs.map((r, i) => (
                <Link key={i} href={`/repair/${r.id}`} className="card p-4 flex items-center gap-3 active:scale-95 transition-all">
                  <div className="w-10 h-10 bg-indigo-500/10 rounded-xl flex items-center justify-center shrink-0">
                    <Wrench size={18} className="text-indigo-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-display font-semibold text-brand-text truncate">{r.product_name || r.productName}</p>
                    <p className="text-xs text-brand-text-dim truncate">{r.owner_name || r.ownerName} · {r.owner_phone || r.ownerPhone}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1">
                    <span className={`text-xs border rounded-full px-2 py-0.5 font-display status-${r.status}`}>
                      {r.status}
                    </span>
                    <ChevronRight size={14} className="text-brand-muted" />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* No data hint */}
        {newProducts.length === 0 && secondHand.length === 0 && repairs.length === 0 && (
          <div className="card p-8 text-center">
            <Package size={40} className="text-brand-muted mx-auto mb-3" />
            <p className="font-display font-semibold text-brand-text mb-1">No inventory yet</p>
            <p className="text-sm text-brand-text-dim mb-4">Add your first product to get started</p>
            <Link href="/add-product" className="btn-primary inline-flex items-center gap-2 text-sm py-2.5 px-5">
              <Plus size={16} /> Add First Product
            </Link>
          </div>
        )}
      </div>

      <BottomNav isAdmin={session.role === 'admin'} />
    </div>
  )
}
