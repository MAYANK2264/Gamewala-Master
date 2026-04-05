import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'
import { getUsers } from '@/lib/sheets'
import AppHeader from '@/components/layout/AppHeader'
import BottomNav from '@/components/layout/BottomNav'
import { ExternalLink } from 'lucide-react'

export const dynamic = 'force-dynamic'

export default async function EmployeesPage() {
  const session = await getSession().catch(() => null)
  if (!session || session.role !== 'admin') redirect('/login')

  const users = await getUsers().catch(() => [])
  const sheetUrl = `https://docs.google.com/spreadsheets/d/${process.env.GOOGLE_SHEET_ID}/edit`

  return (
    <div className="min-h-screen bg-brand-black">
      <AppHeader title="Employees" back />
      <div className="page-content px-4 space-y-4">

        <a href={sheetUrl} target="_blank" rel="noopener noreferrer"
          className="card p-4 flex items-center gap-3 hover:border-green-500/30 transition-all">
          <span className="text-2xl">📊</span>
          <div className="flex-1">
            <p className="font-display font-semibold text-brand-text text-sm">Manage in Google Sheets</p>
            <p className="text-xs text-brand-text-dim">Add/remove employees, change PINs in the Users tab</p>
          </div>
          <ExternalLink size={15} className="text-brand-muted" />
        </a>

        <div className="card p-4 bg-brand-dark">
          <p className="text-xs font-display font-medium text-brand-text-dim mb-2">How to add an employee:</p>
          <ol className="space-y-1 text-xs text-brand-muted">
            <li>1. Open the Google Sheet → Users tab</li>
            <li>2. Add a row: id, name, phone, role (employee), pin (4 digits), active (TRUE)</li>
            <li>3. The employee can now login with their 4-digit PIN</li>
          </ol>
        </div>

        <p className="text-xs font-display uppercase tracking-wider text-brand-text-dim">{users.length} Employees</p>

        {users.length === 0 ? (
          <div className="card p-8 text-center">
            <p className="text-brand-text-dim">No employees yet. Add them in Google Sheets.</p>
          </div>
        ) : (
          <div className="space-y-2">
            {users.map((emp, i) => (
              <div key={i} className="card p-4 flex items-center gap-3">
                <div className="w-11 h-11 bg-brand-red/20 rounded-full flex items-center justify-center font-display font-bold text-brand-red text-lg">
                  {emp.name[0]?.toUpperCase()}
                </div>
                <div className="flex-1">
                  <div className="font-display font-semibold text-brand-text">{emp.name}</div>
                  <div className="text-xs text-brand-text-dim">{emp.phone}</div>
                </div>
                <div className="text-right">
                  <div className="text-xs text-brand-muted mb-1">PIN</div>
                  <div className="font-mono font-bold text-brand-text bg-brand-dark rounded-lg px-3 py-1 text-sm tracking-widest">{emp.pin}</div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <BottomNav isAdmin />
    </div>
  )
}
