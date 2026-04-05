'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Gamepad2, ChevronRight, Delete, Eye, EyeOff, Loader2 } from 'lucide-react'
import toast from 'react-hot-toast'
import clsx from 'clsx'

const DIGITS = ['1','2','3','4','5','6','7','8','9','','0','⌫']

export default function LoginPage() {
  const [mode, setMode] = useState<'select' | 'pin' | 'admin'>('select')
  const [pin, setPin] = useState('')
  const [adminPass, setAdminPass] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const addDigit = (d: string) => {
    if (d === '⌫') { setPin(p => p.slice(0,-1)); return }
    if (d === '') return
    if (pin.length >= 4) return
    const next = pin + d
    setPin(next)
    if (next.length === 4) submitPin(next)
  }

  const submitPin = async (p: string) => {
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin: p }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success(`Welcome, ${data.name}!`)
        router.push('/dashboard')
      } else {
        toast.error('Wrong PIN. Try again.')
        setPin('')
      }
    } catch { toast.error('Login failed'); setPin('') }
    setLoading(false)
  }

  const submitAdmin = async () => {
    if (!adminPass) return
    setLoading(true)
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ adminPassword: adminPass }),
      })
      const data = await res.json()
      if (res.ok) {
        toast.success('Welcome, Admin!')
        router.push('/dashboard')
      } else {
        toast.error('Wrong password.')
        setAdminPass('')
      }
    } catch { toast.error('Login failed') }
    setLoading(false)
  }

  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 pt-safe">
      {/* Logo */}
      <div className="mb-10 text-center">
        <div className="w-20 h-20 bg-brand-red rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-[0_0_40px_rgba(232,32,42,0.4)]">
          <Gamepad2 size={40} className="text-white" />
        </div>
        <h1 className="font-display font-bold text-3xl text-brand-text">GAMEWALA</h1>
        <p className="text-brand-text-dim text-sm mt-1">Inventory & Repair System</p>
      </div>

      {/* Role select */}
      {mode === 'select' && (
        <div className="w-full max-w-sm space-y-3 animate-slide-up">
          <button onClick={() => setMode('pin')}
            className="w-full card p-5 flex items-center gap-4 hover:border-brand-red/40 active:scale-95 transition-all">
            <div className="w-12 h-12 bg-brand-red/10 rounded-2xl flex items-center justify-center text-2xl">👤</div>
            <div className="text-left flex-1">
              <div className="font-display font-semibold text-brand-text">Employee Login</div>
              <div className="text-sm text-brand-text-dim">Enter your 4-digit PIN</div>
            </div>
            <ChevronRight size={18} className="text-brand-muted" />
          </button>
          <button onClick={() => setMode('admin')}
            className="w-full card p-5 flex items-center gap-4 hover:border-brand-yellow/40 active:scale-95 transition-all">
            <div className="w-12 h-12 bg-brand-yellow/10 rounded-2xl flex items-center justify-center text-2xl">👑</div>
            <div className="text-left flex-1">
              <div className="font-display font-semibold text-brand-text">Admin Login</div>
              <div className="text-sm text-brand-text-dim">Owner / Manager</div>
            </div>
            <ChevronRight size={18} className="text-brand-muted" />
          </button>
        </div>
      )}

      {/* PIN pad */}
      {mode === 'pin' && (
        <div className="w-full max-w-xs animate-slide-up">
          <button onClick={() => { setMode('select'); setPin('') }} className="mb-6 text-sm text-brand-text-dim flex items-center gap-1">
            ← Back
          </button>
          <p className="text-center text-brand-text-dim text-sm mb-6">Enter your 4-digit PIN</p>

          {/* PIN dots */}
          <div className="flex justify-center gap-4 mb-8">
            {[0,1,2,3].map(i => (
              <div key={i} className={clsx(
                'w-5 h-5 rounded-full border-2 transition-all',
                i < pin.length ? 'bg-brand-red border-brand-red' : 'border-brand-border'
              )} />
            ))}
          </div>

          {loading && (
            <div className="flex justify-center mb-4">
              <Loader2 size={24} className="animate-spin text-brand-red" />
            </div>
          )}

          {/* Numpad */}
          <div className="grid grid-cols-3 gap-3">
            {DIGITS.map((d, i) => (
              <button
                key={i}
                onClick={() => addDigit(d)}
                disabled={loading}
                className={clsx(
                  'h-16 rounded-2xl font-display font-semibold text-xl transition-all active:scale-90',
                  d === '' ? 'cursor-default' :
                  d === '⌫' ? 'bg-brand-card text-brand-text-dim border border-brand-border flex items-center justify-center' :
                  'bg-brand-card border border-brand-border text-brand-text hover:border-brand-border-light hover:bg-brand-card-hover'
                )}
              >
                {d === '⌫' ? <Delete size={20} /> : d}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Admin password */}
      {mode === 'admin' && (
        <div className="w-full max-w-sm animate-slide-up">
          <button onClick={() => { setMode('select'); setAdminPass('') }} className="mb-6 text-sm text-brand-text-dim flex items-center gap-1">
            ← Back
          </button>
          <div className="card p-6 space-y-4">
            <h2 className="font-display font-semibold text-brand-text text-lg">Admin Login</h2>
            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input
                  type={showPass ? 'text' : 'password'}
                  value={adminPass}
                  onChange={e => setAdminPass(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && submitAdmin()}
                  placeholder="Enter admin password"
                  className="input-field pr-10"
                  autoComplete="current-password"
                />
                <button onClick={() => setShowPass(!showPass)} className="absolute right-3 top-1/2 -translate-y-1/2 text-brand-muted">
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>
            <button onClick={submitAdmin} disabled={loading || !adminPass} className="btn-primary w-full flex items-center justify-center gap-2 disabled:opacity-50">
              {loading ? <Loader2 size={16} className="animate-spin" /> : null}
              {loading ? 'Logging in...' : 'Login as Admin'}
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
