'use client'
import { useRouter } from 'next/navigation'
import { Bell, LogOut, ChevronLeft } from 'lucide-react'

interface Props {
  title: string
  back?: boolean
  actions?: React.ReactNode
  userName?: string
}

export default function AppHeader({ title, back, actions, userName }: Props) {
  const router = useRouter()

  return (
    <header className="app-header">
      <div className="flex items-center justify-between px-4 h-14">
        <div className="flex items-center gap-2">
          {back && (
            <button onClick={() => router.back()} className="p-2 -ml-2 text-brand-text-dim hover:text-brand-text">
              <ChevronLeft size={22} />
            </button>
          )}
          <h1 className="font-display font-bold text-lg text-brand-text">{title}</h1>
        </div>
        <div className="flex items-center gap-1">
          {actions}
          {userName && (
            <div className="flex items-center gap-2 ml-2">
              <div className="w-8 h-8 bg-brand-red/20 rounded-full flex items-center justify-center text-brand-red text-sm font-display font-bold">
                {userName[0].toUpperCase()}
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}
