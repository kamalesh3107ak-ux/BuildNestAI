'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function DashboardPage() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const redirect = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        router.push('/login')
        return
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', user.id)
        .single()

      if (profile?.role === 'vendor') {
        router.push('/dashboard/vendor')
      } else if (profile?.role === 'broker') {
        router.push('/dashboard/broker')
      } else if (profile?.role === 'engineer') {
        router.push('/dashboard/engineer')
      } else if (profile?.role === 'admin') {
        router.push('/dashboard/admin')
      } else {
        router.push('/dashboard/customer')
      }
    }

    redirect()
  }, [router, supabase])

  return <div>Redirecting...</div>
}
