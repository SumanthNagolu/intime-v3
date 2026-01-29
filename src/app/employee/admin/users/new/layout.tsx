import { ReactNode } from 'react'
import { UserWorkspaceProvider } from '@/components/admin/users/UserWorkspaceProvider'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import type { FullUserData } from '@/types/admin'

export const dynamic = 'force-dynamic'

interface NewUserLayoutProps {
  children: ReactNode
}

/**
 * New User Wizard Layout
 *
 * Provides empty user template for create mode
 */
export default function NewUserLayout({ children }: NewUserLayoutProps) {
  // Create empty user template for wizard
  const emptyUser: FullUserData = {
    id: '',
    email: '',
    full_name: '',
    first_name: null,
    last_name: null,
    status: 'pending',
    is_active: false,
    two_factor_enabled: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Users', href: '/employee/admin/users' },
    { label: 'New User' },
  ]

  return (
    <UserWorkspaceProvider initialData={emptyUser} mode="create">
      <AdminPageContent>
        <AdminPageHeader
          title="Create New User"
          description="Complete the wizard to add a new user to the organization"
          breadcrumbs={breadcrumbs}
        />

        {children}
      </AdminPageContent>
    </UserWorkspaceProvider>
  )
}
