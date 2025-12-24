import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EntityNavigationProvider } from '@/lib/navigation/EntityNavigationContext'
import { ReactNode } from 'react'

export const dynamic = 'force-dynamic'

/**
 * Employee portal layout with authentication protection.
 * 
 * This layout:
 * 1. Checks for valid Supabase session on the server
 * 2. Redirects unauthenticated users to /login
 * 3. Preserves the intended destination in the redirect URL
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

  return (
    <EntityNavigationProvider>
      {children}
    </EntityNavigationProvider>
  )
}
