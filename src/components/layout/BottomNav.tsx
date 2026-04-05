'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { LayoutDashboard, Package, QrCode, Wrench, Settings } from 'lucide-react'
import clsx from 'clsx'

const NAV = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Home' },
  { href: '/inventory', icon: Package, label: 'Inventory' },
  { href: '/scan', icon: QrCode, label: 'Scan', center: true },
  { href: '/repair', icon: Wrench, label: 'Repairs' },
  { href: '/admin', icon: Settings, label: 'Admin' },
]

export default function BottomNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname()
  const links = isAdmin ? NAV : NAV.filter(n => n.href !== '/admin')

  return (
    <nav className="bottom-nav">
      <div className="flex items-center justify-around px-2 py-2">
        {links.map(({ href, icon: Icon, label, center }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          if (center) {
            return (
              <Link key={href} href={href}
                className="relative -top-5 flex flex-col items-center">
                <div className={clsx(
                  'w-[60px] h-[60px] rounded-full flex items-center justify-center transition-all',
                  active ? 'bg-gradient-to-tr from-brand-red to-brand-red-glow shadow-[0_0_25px_rgba(232,32,42,0.6)]' : 'bg-gradient-to-tr from-brand-red to-brand-red-glow shadow-[0_0_15px_rgba(232,32,42,0.3)]'
                )}>
                  <Icon size={28} className="text-white" />
                </div>
                <span className="text-[10px] mt-1.5 text-brand-text font-display font-medium">{label}</span>
              </Link>
            )
          }
          return (
            <Link key={href} href={href}
              className={clsx(
                'flex flex-col items-center gap-1.5 px-3 py-2 rounded-2xl transition-all duration-300',
                active ? 'text-brand-red bg-brand-red/10' : 'text-brand-text-dim hover:text-brand-text hover:bg-brand-card/50'
              )}>
              <Icon size={22} className={active ? 'drop-shadow-[0_0_8px_rgba(232,32,42,0.4)]' : ''} />
              <span className="text-[10px] font-display">{label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
