'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  Loader2,
  Edit,
  Copy,
  Trash2,
  Shield,
  Users,
  Key,
  ArrowLeft,
  ChevronUp,
} from 'lucide-react'
import { toast } from 'sonner'
import { CloneRoleDialog } from './CloneRoleDialog'
import { RoleDetailTabs } from './RoleDetailTabs'
import type { FullRoleData } from '@/types/admin'

const CATEGORY_LABELS: Record<string, string> = {
  pod_ic: 'Pod IC',
  pod_manager: 'Pod Manager',
  leadership: 'Leadership',
  executive: 'Executive',
  portal: 'Portal',
  admin: 'Admin',
}

interface RoleDetailPageProps {
  roleId: string
}

export function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)

  // Use the ONE DB CALL pattern with getFullRole
  const roleQuery = trpc.permissions.getFullRole.useQuery({ id: roleId })

  const deleteMutation = trpc.permissions.deleteRole.useMutation({
    onSuccess: () => {
      toast.success('Role deleted successfully')
      utils.permissions.listRoles.invalidate()
      router.push('/employee/admin/roles')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete role')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Roles', href: '/employee/admin/roles' },
    { label: roleQuery.data?.display_name ?? 'Role Details' },
  ]

  const handleDelete = () => {
    if (roleQuery.data?.is_system_role) {
      toast.error('Cannot delete system roles')
      return
    }
    if (confirm(`Are you sure you want to delete "${roleQuery.data?.display_name}"?`)) {
      deleteMutation.mutate({ id: roleId })
    }
  }

  if (roleQuery.isLoading) {
    return (
      <AdminPageContent>
        <AdminPageHeader title="Loading..." breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-hublot-600" />
        </div>
      </AdminPageContent>
    )
  }

  if (roleQuery.error || !roleQuery.data) {
    return (
      <AdminPageContent>
        <AdminPageHeader title="Error" breadcrumbs={breadcrumbs} />
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <p className="text-red-600 mb-4">Failed to load role details</p>
          <Button variant="outline" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Go Back
          </Button>
        </div>
      </AdminPageContent>
    )
  }

  const role = roleQuery.data as FullRoleData

  return (
    <AdminPageContent>
      <AdminPageHeader
        title={role.display_name}
        description={role.description ?? `${CATEGORY_LABELS[role.category]} role`}
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => setCloneDialogOpen(true)}>
              <Copy className="w-4 h-4 mr-2" />
              Clone
            </Button>
            <Link href={`/employee/admin/roles/${roleId}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
            {!role.is_system_role && (
              <Button
                variant="outline"
                className="text-red-600 hover:bg-red-50"
                onClick={handleDelete}
                disabled={deleteMutation.isPending}
              >
                {deleteMutation.isPending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Delete
              </Button>
            )}
          </div>
        }
      />

      {/* Up to Roles Link */}
      <div className="mb-4">
        <Link
          href="/employee/admin/roles"
          className="inline-flex items-center gap-1.5 text-sm text-charcoal-600 hover:text-gold-600 transition-colors"
        >
          <ChevronUp className="w-4 h-4" />
          Up to Roles
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-lg border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${role.color_code}20` }}
            >
              <Shield className="w-5 h-5" style={{ color: role.color_code }} />
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wider">Category</p>
              <p className="font-semibold text-charcoal-900">
                {CATEGORY_LABELS[role.category]}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wider">Users</p>
              <p className="font-semibold text-charcoal-900">{role.users.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-lg border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Key className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-xs text-charcoal-500 uppercase tracking-wider">Permissions</p>
              <p className="font-semibold text-charcoal-900">{role.permissions.length}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs Component */}
      <RoleDetailTabs role={role} />

      {/* Clone Dialog */}
      <CloneRoleDialog
        open={cloneDialogOpen}
        onOpenChange={setCloneDialogOpen}
        sourceRole={role}
      />
    </AdminPageContent>
  )
}
