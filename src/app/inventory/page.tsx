import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getSession } from '@/lib/auth'
import { getInventoryItems } from '@/lib/sheets'
import BottomNav from '@/components/layout/BottomNav'
import AppHeader from '@/components/layout/AppHeader'
import { Package, RefreshCw, Search, QrCode } from 'lucide-react'
import InventoryClient from './InventoryClient'

export const dynamic = 'force-dynamic'

export default async function InventoryPage() {
  const session = await getSession().catch(() => null)
  if (!session) redirect('/login')

  const { newProducts, secondHand, repairs } = await getInventoryItems().catch(() => ({
    newProducts: [], secondHand: [], repairs: []
  }))

  const all = [
    ...newProducts.map(p => ({ ...p, _type: 'new' as const })),
    ...secondHand.map(p => ({ ...p, _type: 'secondhand' as const })),
    ...repairs.map(p => ({ ...p, _type: 'repair' as const })),
  ]

  return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader title="Inventory" actions={
        <Link href="/scan" className="p-2 text-brand-text-dim">
          <QrCode size={20} />
        </Link>
      } />
      <div className="page-content px-4">
        <InventoryClient items={all} isAdmin={session.role === 'admin'} />
      </div>
      <BottomNav isAdmin={session.role === 'admin'} />
    </div>
  )
}
