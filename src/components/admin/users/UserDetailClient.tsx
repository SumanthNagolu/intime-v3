'use client'

import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Edit, AlertTriangle } from 'lucide-react'
import Link from 'next/link'
import { UserDetailTabs } from './UserDetailTabs'
import type { FullUserData } from '@/types/admin'

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

interface UserDetailClientProps {
  data: FullUserData
}

export function UserDetailClient({ data }: UserDetailClientProps) {
  const user = data

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Users', href: '/employee/admin/users' },
    { label: user.full_name ?? 'User Details' },
  ]

  const getActivePod = () => {
    return user.pod_memberships?.find((pm) => pm.is_active)?.pod
  }

  const activePod = getActivePod()

  return (
    <AdminPageContent>
      <AdminPageHeader
        title={user.full_name}
        description={
          <div className="flex items-center gap-2 mt-1">
            <span className="text-charcoal-500">{user.email}</span>
            {user.role && (
              <>
                <span className="text-charcoal-300">•</span>
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
                <span className="text-charcoal-300">•</span>
                <span className="text-charcoal-500">{activePod.name}</span>
              </>
            )}
            <span className="text-charcoal-300">•</span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}>
              {STATUS_LABELS[user.status]}
            </span>
          </div>
        }
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Link href={`/employee/admin/users/${user.id}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />

      {/* Status Banner for non-active users */}
      {user.status !== 'active' && (
        <div className={`rounded-lg p-4 mb-6 flex items-center gap-3 ${
          user.status === 'suspended' ? 'bg-orange-50 border border-orange-200' :
          user.status === 'pending' ? 'bg-amber-50 border border-amber-200' :
          'bg-charcoal-50 border border-charcoal-200'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${
            user.status === 'suspended' ? 'text-orange-600' :
            user.status === 'pending' ? 'text-amber-600' :
            'text-charcoal-600'
          }`} />
          <p className={`font-medium ${
            user.status === 'suspended' ? 'text-orange-800' :
            user.status === 'pending' ? 'text-amber-800' :
            'text-charcoal-800'
          }`}>
            {user.status === 'suspended' && 'This user is currently suspended.'}
            {user.status === 'pending' && 'This user has not yet accepted their invitation.'}
            {user.status === 'deactivated' && 'This user account has been deactivated.'}
          </p>
        </div>
      )}

      {/* Guidewire-style 7-tab interface */}
      <UserDetailTabs user={user} />
    </AdminPageContent>
  )
}
