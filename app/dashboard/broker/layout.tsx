import DashboardShell from '@/components/layout/dashboard-shell'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export default async function BrokerDashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'broker') {
    redirect('/dashboard/' + profile?.role)
  }

  return <DashboardShell role="broker">{children}</DashboardShell>
}
