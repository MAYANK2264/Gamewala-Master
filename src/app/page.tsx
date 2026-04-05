import { redirect } from 'next/navigation'
import { getSession } from '@/lib/auth'

export default async function RootPage() {
  const session = await getSession().catch(() => null)
  if (session) redirect('/dashboard')
  redirect('/login')
}
