import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getInventoryItems } from '@/lib/sheets'
import AppHeader from '@/components/layout/AppHeader'
import BottomNav from '@/components/layout/BottomNav'
import AnalyticsClient from './AnalyticsClient'

export const dynamic = 'force-dynamic'

export default async function AnalyticsPage() {
  const session = await getSession().catch(() => null)
  if (!session) redirect('/login')
  if (session.role !== 'admin') redirect('/dashboard')

  const { newProducts, secondHand, repairs } = await getInventoryItems().catch(() => ({
    newProducts: [], secondHand: [], repairs: []
  }))

  return (
    <div className="min-h-screen bg-brand-black pb-20">
      <AppHeader title="Analytics & Reports" back />
      <div className="page-content px-4 py-4">
        <AnalyticsClient 
          newProducts={newProducts} 
          secondHand={secondHand} 
          repairs={repairs} 
        />
      </div>
      <BottomNav isAdmin={true} />
    </div>
  )
}
