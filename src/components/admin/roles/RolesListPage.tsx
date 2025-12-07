'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Plus,
  Search,
  Shield,
  MoreHorizontal,
  Edit,
  Eye,
  Copy,
  Trash2,
  Users,
  Lock,
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

const CATEGORY_COLORS: Record<string, string> = {
  pod_ic: 'bg-blue-100 text-blue-800',
  pod_manager: 'bg-purple-100 text-purple-800',
  leadership: 'bg-amber-100 text-amber-800',
  executive: 'bg-rose-100 text-rose-800',
  portal: 'bg-green-100 text-green-800',
  admin: 'bg-charcoal-100 text-charcoal-800',
}

type Role = {
  id: string
  code: string
  name: string
  display_name: string
  description?: string
  category: string
  hierarchy_level: number
  is_system_role: boolean
  is_active: boolean
  color_code?: string
  icon_name?: string
  pod_type?: string
  created_at: string
}

export function RolesListPage() {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string>('')
  const [showInactive, setShowInactive] = useState(false)
  const [page, setPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const [cloneDialogOpen, setCloneDialogOpen] = useState(false)
  const [roleToClone, setRoleToClone] = useState<Role | null>(null)

  const utils = trpc.useUtils()

  const rolesQuery = trpc.permissions.listRoles.useQuery({
    search: search || undefined,
    category: category && category !== 'all' ? category as 'pod_ic' | 'pod_manager' | 'leadership' | 'executive' | 'portal' | 'admin' : undefined,
    isActive: showInactive ? undefined : true,
    page,
    pageSize: 20,
  })

  const statsQuery = trpc.permissions.getRoleStats.useQuery()

  const deleteMutation = trpc.permissions.deleteRole.useMutation({
    onSuccess: () => {
      toast.success('Role deleted successfully')
      utils.permissions.listRoles.invalidate()
      utils.permissions.getRoleStats.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to delete role')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Roles' },
  ]

  const handleDelete = (role: Role) => {
    if (role.is_system_role) {
      toast.error('Cannot delete system roles')
      return
    }
    if (confirm(`Are you sure you want to delete "${role.display_name}"?`)) {
      deleteMutation.mutate({ id: role.id })
    }
    setOpenDropdown(null)
  }

  const handleClone = (role: Role) => {
    setRoleToClone(role)
    setCloneDialogOpen(true)
    setOpenDropdown(null)
  }

  return (
    <AdminPageContent>
      <AdminPageHeader
        title="Roles"
        description="Manage user roles and their permissions"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/employee/admin/roles/new">
            <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New Role
            </Button>
          </Link>
        }
      />
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Total Roles</p>
              <p className="text-xl font-semibold text-charcoal-900">
                {statsQuery.data?.total ?? '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Active</p>
              <p className="text-xl font-semibold text-charcoal-900">
                {statsQuery.data?.active ?? '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center">
              <Lock className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">System Roles</p>
              <p className="text-xl font-semibold text-charcoal-900">
                {statsQuery.data?.system ?? '-'}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white rounded-xl border border-charcoal-100 p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center">
              <Users className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-charcoal-500">Custom Roles</p>
              <p className="text-xl font-semibold text-charcoal-900">
                {statsQuery.data?.custom ?? '-'}
              </p>
            </div>
          </div>
        </div>
      </div>

      <DashboardSection>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search roles..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={category} onValueChange={(v) => { setCategory(v); setPage(1) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              <SelectItem value="pod_ic">Pod IC</SelectItem>
              <SelectItem value="pod_manager">Pod Manager</SelectItem>
              <SelectItem value="leadership">Leadership</SelectItem>
              <SelectItem value="executive">Executive</SelectItem>
              <SelectItem value="portal">Portal</SelectItem>
              <SelectItem value="admin">Admin</SelectItem>
            </SelectContent>
          </Select>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showInactive}
              onChange={(e) => { setShowInactive(e.target.checked); setPage(1) }}
              className="w-4 h-4 rounded border-charcoal-300"
            />
            <span className="text-sm text-charcoal-600">Show Inactive</span>
          </label>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {rolesQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : rolesQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load roles. Please try again.
            </div>
          ) : rolesQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Shield className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No roles found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || (category && category !== 'all')
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first role'}
              </p>
              {!search && (!category || category === 'all') && (
                <Link href="/employee/admin/roles/new">
                  <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Role
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Code</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Hierarchy</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {rolesQuery.data?.items.map((role: Role) => (
                  <tr key={role.id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-10 h-10 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${role.color_code}20` }}
                        >
                          <Shield className="w-5 h-5" style={{ color: role.color_code }} />
                        </div>
                        <div>
                          <Link
                            href={`/employee/admin/roles/${role.id}`}
                            className="font-medium text-charcoal-900 hover:text-hublot-600"
                          >
                            {role.display_name}
                          </Link>
                          {role.description && (
                            <p className="text-sm text-charcoal-500 truncate max-w-xs">
                              {role.description}
                            </p>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <code className="px-2 py-1 bg-charcoal-100 text-charcoal-700 text-xs rounded">
                        {role.code}
                      </code>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${CATEGORY_COLORS[role.category] ?? 'bg-charcoal-100 text-charcoal-600'}`}>
                        {CATEGORY_LABELS[role.category] ?? role.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-charcoal-600">
                      Level {role.hierarchy_level}
                    </td>
                    <td className="px-6 py-4">
                      {role.is_system_role ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-medium bg-purple-100 text-purple-700">
                          <Lock className="w-3 h-3" />
                          System
                        </span>
                      ) : (
                        <span className="inline-flex px-2 py-0.5 rounded text-xs font-medium bg-charcoal-100 text-charcoal-600">
                          Custom
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {role.is_active ? (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                          Active
                        </span>
                      ) : (
                        <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-charcoal-100 text-charcoal-600">
                          Inactive
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === role.id ? null : role.id)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
                        </button>
                        {openDropdown === role.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                              <Link
                                href={`/employee/admin/roles/${role.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </Link>
                              <Link
                                href={`/employee/admin/roles/${role.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Role
                              </Link>
                              <button
                                onClick={() => handleClone(role)}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 w-full text-left"
                              >
                                <Copy className="w-4 h-4" />
                                Clone Role
                              </button>
                              {!role.is_system_role && (
                                <button
                                  onClick={() => handleDelete(role)}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="w-4 h-4" />
                                  Delete Role
                                </button>
                              )}
                            </div>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {rolesQuery.data && rolesQuery.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-charcoal-500">
              Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, rolesQuery.data.pagination.total)} of {rolesQuery.data.pagination.total} roles
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= rolesQuery.data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardSection>

      {/* Clone Dialog */}
      {roleToClone && (
        <CloneRoleDialog
          open={cloneDialogOpen}
          onOpenChange={setCloneDialogOpen}
          sourceRole={roleToClone}
        />
      )}
    </AdminPageContent>
  )
}
