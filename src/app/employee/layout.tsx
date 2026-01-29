import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EntityNavigationProvider } from '@/lib/navigation/EntityNavigationContext'
import { UserRoleProvider } from '@/lib/contexts/UserRoleContext'
import { BrandingProvider } from '@/components/providers/BrandingProvider'
import { getServerCaller } from '@/server/trpc/server-caller'
import { type UserRole } from '@/lib/auth/client'
import { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

/**
 * Employee portal layout with authentication protection.
 *
 * This layout:
 * 1. Checks for valid Supabase session on the server
 * 2. Redirects unauthenticated users to /login
 * 3. Fetches user role server-side (ONE time, no client API calls needed)
 * 4. Provides role via context to TopNavigation and other components
 */
export default async function EmployeeLayout({ children }: { children: ReactNode }) {
  const supabase = await createClient()

  // Check for authenticated user
  const { data: { user }, error } = await supabase.auth.getUser()

  if (error || !user) {
    // Get current path for redirect after login
    // Note: headers() not available in layout, so we use a generic redirect
    redirect('/login?redirect=/employee/workspace/dashboard')
  }

  // Fetch role server-side (ONE time, cached per request)
  // This eliminates the need for client-side getMyRole API calls
  let userRole: UserRole | null = null
  try {
    const caller = await getServerCaller()
    userRole = await caller.users.getMyRole()
  } catch (err) {
    console.error('[EmployeeLayout] Failed to fetch role:', err)
    // Continue - TopNavigation will show limited tabs with null role
  }

  return (
    <UserRoleProvider role={userRole}>
      <BrandingProvider>
        <EntityNavigationProvider>
          {children}
        </EntityNavigationProvider>
      </BrandingProvider>
    </UserRoleProvider>
  )
}
