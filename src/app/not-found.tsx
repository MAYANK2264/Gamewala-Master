import Link from 'next/link'
export default function NotFound() {
  return (
    <div className="min-h-screen bg-brand-black flex flex-col items-center justify-center px-6 text-center">
      <div className="text-6xl mb-4">🎮</div>
      <h1 className="font-display font-bold text-5xl text-brand-red mb-2">404</h1>
      <p className="font-display font-semibold text-xl text-brand-text mb-2">Page Not Found</p>
      <p className="text-brand-text-dim text-sm mb-8">This page doesn&apos;t exist in the system.</p>
      <Link href="/dashboard" className="btn-primary">Go to Dashboard</Link>
    </div>
  )
}
