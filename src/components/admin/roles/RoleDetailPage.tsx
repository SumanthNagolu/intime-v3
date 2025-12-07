'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Loader2,
  Edit,
  Copy,
  Trash2,
  Shield,
  Users,
  Key,
  Flag,
  Lock,
  ArrowLeft,
  CheckCircle2,
  XCircle,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import { CloneRoleDialog } from './CloneRoleDialog'

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

type Permission = {
  id: string
  code: string
  name: string
  object_type: string
  action: string
}

type RolePermission = {
  permission_id: string
  scope_condition: string
  granted: boolean
  permissions: Permission
}

type FeatureFlag = {
  id: string
  key: string
  name: string
}

type RoleFeature = {
  feature_flag_id: string
  enabled: boolean
  feature_flags: FeatureFlag
}

export function RoleDetailPage({ roleId }: RoleDetailPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)

  const roleQuery = trpc.permissions.getRoleById.useQuery({ id: roleId })

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

  const role = roleQuery.data

  // Group permissions by object type
  const permissionsByType = (role.permissions as RolePermission[])?.reduce(
    (acc, rp) => {
      const objType = rp.permissions?.object_type ?? 'Other'
      if (!acc[objType]) acc[objType] = []
      acc[objType].push(rp)
      return acc
    },
    {} as Record<string, RolePermission[]>
  ) ?? {}

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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${role.color_code}20` }}
            >
              <Shield className="w-5 h-5" style={{ color: role.color_code }} />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Category</p>
              <p className="font-semibold text-charcoal-900">
                {CATEGORY_LABELS[role.category]}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Users</p>
              <p className="font-semibold text-charcoal-900">{role.userCount}</p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Key className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Permissions</p>
              <p className="font-semibold text-charcoal-900">
                {role.permissions?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Flag className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Features</p>
              <p className="font-semibold text-charcoal-900">
                {role.features?.length ?? 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="permissions">Permissions</TabsTrigger>
          <TabsTrigger value="features">Features</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <DashboardSection>
            <div className="bg-white rounded-xl border border-charcoal-100 p-6">
              <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
                Role Details
              </h3>
              <dl className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <dt className="text-sm text-charcoal-500">Code</dt>
                  <dd className="mt-1">
                    <code className="px-2 py-1 bg-charcoal-100 text-charcoal-700 text-sm rounded">
                      {role.code}
                    </code>
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-charcoal-500">Name</dt>
                  <dd className="mt-1 font-medium text-charcoal-900">{role.name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-charcoal-500">Display Name</dt>
                  <dd className="mt-1 font-medium text-charcoal-900">{role.display_name}</dd>
                </div>
                <div>
                  <dt className="text-sm text-charcoal-500">Category</dt>
                  <dd className="mt-1 font-medium text-charcoal-900">
                    {CATEGORY_LABELS[role.category]}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-charcoal-500">Hierarchy Level</dt>
                  <dd className="mt-1 font-medium text-charcoal-900">
                    Level {role.hierarchy_level}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-charcoal-500">Type</dt>
                  <dd className="mt-1">
                    {role.is_system_role ? (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                        <Lock className="w-3 h-3" />
                        System Role
                      </span>
                    ) : (
                      <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-charcoal-100 text-charcoal-600">
                        Custom Role
                      </span>
                    )}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm text-charcoal-500">Status</dt>
                  <dd className="mt-1">
                    {role.is_active ? (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        Active
                      </span>
                    ) : (
                      <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-600">
                        Inactive
                      </span>
                    )}
                  </dd>
                </div>
                {role.pod_type && (
                  <div>
                    <dt className="text-sm text-charcoal-500">Pod Type</dt>
                    <dd className="mt-1 font-medium text-charcoal-900 capitalize">
                      {role.pod_type.replace('_', ' ')}
                    </dd>
                  </div>
                )}
              </dl>
              {role.description && (
                <div className="mt-6 pt-6 border-t border-charcoal-100">
                  <dt className="text-sm text-charcoal-500 mb-2">Description</dt>
                  <dd className="text-charcoal-700">{role.description}</dd>
                </div>
              )}
            </div>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="permissions">
          <DashboardSection>
            <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
              {Object.keys(permissionsByType).length === 0 ? (
                <div className="p-8 text-center">
                  <Key className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
                  <p className="text-charcoal-500">No permissions assigned to this role</p>
                  <Link
                    href={`/employee/admin/permissions?roleId=${roleId}`}
                    className="text-hublot-600 hover:underline text-sm mt-2 inline-block"
                  >
                    Manage permissions in the Permission Matrix
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-charcoal-100">
                  {Object.entries(permissionsByType).map(([objectType, permissions]) => (
                    <div key={objectType} className="p-4">
                      <h4 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-3">
                        {objectType.replace('_', ' ')}
                      </h4>
                      <div className="space-y-2">
                        {permissions.map((rp) => (
                          <div
                            key={rp.permission_id}
                            className="flex items-center justify-between py-2 px-3 bg-charcoal-50 rounded-lg"
                          >
                            <div className="flex items-center gap-3">
                              {rp.granted ? (
                                <CheckCircle2 className="w-4 h-4 text-green-600" />
                              ) : (
                                <XCircle className="w-4 h-4 text-red-600" />
                              )}
                              <div>
                                <p className="text-sm font-medium text-charcoal-900">
                                  {rp.permissions?.name}
                                </p>
                                <code className="text-xs text-charcoal-500">
                                  {rp.permissions?.code}
                                </code>
                              </div>
                            </div>
                            <span className="text-xs bg-charcoal-200 text-charcoal-700 px-2 py-0.5 rounded">
                              {rp.scope_condition}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardSection>
        </TabsContent>

        <TabsContent value="features">
          <DashboardSection>
            <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
              {(role.features as RoleFeature[])?.length === 0 ? (
                <div className="p-8 text-center">
                  <Flag className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
                  <p className="text-charcoal-500">No feature flags assigned to this role</p>
                  <Link
                    href="/employee/admin/feature-flags"
                    className="text-hublot-600 hover:underline text-sm mt-2 inline-block"
                  >
                    Manage feature flags
                  </Link>
                </div>
              ) : (
                <div className="divide-y divide-charcoal-100">
                  {(role.features as RoleFeature[])?.map((rf) => (
                    <div
                      key={rf.feature_flag_id}
                      className="flex items-center justify-between p-4 hover:bg-charcoal-50"
                    >
                      <div className="flex items-center gap-3">
                        <Flag className={`w-5 h-5 ${rf.enabled ? 'text-green-600' : 'text-charcoal-400'}`} />
                        <div>
                          <p className="font-medium text-charcoal-900">
                            {rf.feature_flags?.name}
                          </p>
                          <code className="text-xs text-charcoal-500">
                            {rf.feature_flags?.key}
                          </code>
                        </div>
                      </div>
                      {rf.enabled ? (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Enabled
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-600">
                          Disabled
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DashboardSection>
        </TabsContent>
      </Tabs>

      {/* Clone Dialog */}
      <CloneRoleDialog
        open={cloneDialogOpen}
        onOpenChange={setCloneDialogOpen}
        sourceRole={role}
      />
    </AdminPageContent>
  )
}
