import { ReactNode } from 'react'
import { notFound } from 'next/navigation'
import { getServerCaller } from '@/server/trpc/server-caller'
import { UserWorkspaceProvider } from '@/components/admin/users/UserWorkspaceProvider'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import type { UserPodMembership } from '@/types/admin'

export const dynamic = 'force-dynamic'

interface UserLayoutProps {
  children: ReactNode
  params: Promise<{ id: string }>
}

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-800',
  pending: 'bg-amber-100 text-amber-800',
  suspended: 'bg-orange-100 text-orange-800',
  deactivated: 'bg-charcoal-100 text-charcoal-600',
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Active',
  pending: 'Pending',
  suspended: 'Suspended',
  deactivated: 'Deactivated',
}

/**
 * User Detail Layout
 *
 * ONE DATABASE CALL pattern:
 * - Fetches all user data via getFullUser
 * - Provides data to children via UserWorkspaceProvider
 * - No additional queries needed in page/components
 */
export default async function UserDetailLayout({ children, params }: UserLayoutProps) {
  const { id: userId } = await params

  // ONE DATABASE CALL: Fetch all user data
  let data
  try {
    const caller = await getServerCaller()
    data = await caller.users.getFullUser({ id: userId })
  } catch {
    notFound()
  }

  const user = data

  // Get active pod
  const activePod = user.pod_memberships?.find((pm: UserPodMembership) => pm.is_active)?.pod

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Users', href: '/employee/admin/users' },
    { label: user.full_name ?? 'User Details' },
  ]

  return (
    <UserWorkspaceProvider initialData={data} mode="view">
      <AdminPageContent>
        <AdminPageHeader
          title={user.full_name}
          description={
            <div className="flex items-center gap-2 mt-1">
              <span className="text-charcoal-500">{user.email}</span>
              {user.role && (
                <>
                  <span className="text-charcoal-300">-</span>
                  <span
                    className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${user.role.color_code}20`,
                      color: user.role.color_code,
                    }}
                  >
                    {user.role.display_name}
                  </span>
                </>
              )}
              {activePod && (
                <>
                  <span className="text-charcoal-300">-</span>
                  <span className="text-charcoal-500">{activePod.name}</span>
                </>
              )}
              <span className="text-charcoal-300">-</span>
              <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}>
                {STATUS_LABELS[user.status]}
              </span>
            </div>
          }
          breadcrumbs={breadcrumbs}
        />

        {children}
      </AdminPageContent>
    </UserWorkspaceProvider>
  )
}
