import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getTasks, getUsers } from '@/lib/sheets'
import AppHeader from '@/components/layout/AppHeader'
import BottomNav from '@/components/layout/BottomNav'
import TasksClient from './TasksClient'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function TasksPage() {
  const session = await getSession().catch(() => null)
  if (!session || session.role !== 'admin') redirect('/login')

  const [tasks, users] = await Promise.all([
    getTasks().catch(() => []),
    getUsers().catch(() => []),
  ])

  const sheetUrl = `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}/edit`
  const employees = users.filter(u => u.role === 'employee').map(u => u.name)

  return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader title="Tasks" back />
      <div className="page-content px-4 space-y-4">
        <a href={sheetUrl} target="_blank" rel="noopener noreferrer"
          className="card p-4 flex items-center gap-3 hover:border-green-500/30 transition-all">
          <span className="text-2xl">📊</span>
          <div className="flex-1">
            <p className="font-display font-semibold text-brand-text text-sm">Manage in Google Sheets</p>
            <p className="text-xs text-brand-text-dim">Add tasks directly in the Tasks tab</p>
          </div>
          <ExternalLink size={15} className="text-brand-muted" />
        </a>
        <TasksClient tasks={tasks} employees={employees} adminName={session.name} />
      </div>
      <BottomNav isAdmin />
    </div>
  )
}
