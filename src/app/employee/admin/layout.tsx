import { getServerCaller } from '@/server/trpc/server-caller'
import { AdminLayoutClient } from '@/components/admin/AdminLayoutClient'
import { AdminErrorState } from '@/components/admin/AdminErrorState'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import type { ReactNode } from 'react'

export default async function AdminLayout({ children }: { children: ReactNode }) {
  // First check if user is authenticated using getUser() for secure verification
  const supabase = await createClient()
  const { data: { user }, error: authError } = await supabase.auth.getUser()

  if (authError || !user) {
    redirect('/auth')
  }

  try {
    const caller = await getServerCaller()

    // Fetch organization and groups data in parallel (Guidewire-style)
    const [organization, groupsData] = await Promise.all([
      caller.settings.getOrganization(),
      caller.groups.listForTree(),
    ])

    return (
      <AdminLayoutClient
        organization={{ id: organization.id, name: organization.name }}
        groups={groupsData.groups}
      >
        {children}
      </AdminLayoutClient>
    )
  } catch (error) {
    console.error('AdminLayout error:', error)

    // Show error state with helpful information
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'

    return (
      <AdminErrorState
        error={errorMessage}
        userId={user.id}
        userEmail={user.email || 'Unknown'}
      />
    )
  }
}
