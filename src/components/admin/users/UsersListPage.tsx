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
import { Plus, Search, Users, MoreHorizontal, Edit, Eye, UserCog } from 'lucide-react'
import Link from 'next/link'

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

type Role = {
  id: string
  name: string
  display_name: string
  code: string
  category: string
  color_code?: string
}

type Manager = {
  id: string
  full_name: string
  email: string
}

type Pod = {
  id: string
  name: string
  pod_type: string
}

type PodMembership = {
  id: string
  pod_id: string
  role: string
  is_active: boolean
  pod: Pod
}

type User = {
  id: string
  full_name: string
  email: string
  phone?: string
  avatar_url?: string
  status: string
  is_active: boolean
  role_id?: string
  role?: Role
  manager?: Manager
  pod_memberships?: PodMembership[]
  last_login_at?: string
  created_at: string
}

export function UsersListPage() {
  const [search, setSearch] = useState('')
  const [roleId, setRoleId] = useState<string>('')
  const [podId, setPodId] = useState<string>('')
  const [status, setStatus] = useState<string>('active')
  const [page, setPage] = useState(1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const usersQuery = trpc.users.list.useQuery({
    search: search || undefined,
    roleId: roleId && roleId !== 'all' ? roleId : undefined,
    podId: podId && podId !== 'all' ? podId : undefined,
    status: status && status !== 'all' ? status as 'pending' | 'active' | 'suspended' | 'deactivated' : undefined,
    page,
    pageSize: 20,
  })

  const rolesQuery = trpc.users.getRoles.useQuery()
  const podsQuery = trpc.users.getPods.useQuery()

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Users' },
  ]

  const getInitials = (name: string) => {
    return name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  }

  const getActivePod = (user: User) => {
    const activeMembership = user.pod_memberships?.find((pm) => pm.is_active)
    return activeMembership?.pod
  }

  return (
    <AdminPageContent>
      <AdminPageHeader
        title="Users"
        description="Manage user accounts, roles, and permissions"
        breadcrumbs={breadcrumbs}
        actions={
          <Link href="/employee/admin/users/new">
            <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
              <Plus className="w-4 h-4 mr-2" />
              New User
            </Button>
          </Link>
        }
      />
      <DashboardSection>
        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
            <Input
              placeholder="Search by name or email..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value)
                setPage(1)
              }}
              className="pl-10"
            />
          </div>
          <Select value={roleId} onValueChange={(v) => { setRoleId(v); setPage(1) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {rolesQuery.data?.map((role: Role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={podId} onValueChange={(v) => { setPodId(v); setPage(1) }}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="All Pods" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Pods</SelectItem>
              {podsQuery.data?.map((pod: Pod) => (
                <SelectItem key={pod.id} value={pod.id}>
                  {pod.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1) }}>
            <SelectTrigger className="w-[150px]">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
              <SelectItem value="all">All</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {usersQuery.isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : usersQuery.error ? (
            <div className="p-8 text-center text-red-600">
              Failed to load users. Please try again.
            </div>
          ) : usersQuery.data?.items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Users className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No users found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || (roleId && roleId !== 'all') || (podId && podId !== 'all')
                  ? 'Try adjusting your filters'
                  : 'Get started by creating your first user'}
              </p>
              {!search && (!roleId || roleId === 'all') && (!podId || podId === 'all') && (
                <Link href="/employee/admin/users/new">
                  <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create User
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">User</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Role</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Pod</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Last Login</th>
                  <th className="px-6 py-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {usersQuery.data?.items.map((user: User) => {
                  const activePod = getActivePod(user)
                  return (
                    <tr key={user.id} className="hover:bg-charcoal-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-medium">
                            {getInitials(user.full_name)}
                          </div>
                          <div>
                            <Link
                              href={`/employee/admin/users/${user.id}`}
                              className="font-medium text-charcoal-900 hover:text-gold-600"
                            >
                              {user.full_name}
                            </Link>
                            <p className="text-sm text-charcoal-500">{user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        {user.role ? (
                          <span
                            className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium"
                            style={{
                              backgroundColor: `${user.role.color_code}20`,
                              color: user.role.color_code,
                            }}
                          >
                            {user.role.display_name}
                          </span>
                        ) : (
                          <span className="text-charcoal-400">No role</span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-charcoal-600">
                        {activePod?.name ?? <span className="text-charcoal-400">—</span>}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status] ?? 'bg-charcoal-100 text-charcoal-600'}`}>
                          {STATUS_LABELS[user.status] ?? user.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-charcoal-500">
                        {user.last_login_at
                          ? new Date(user.last_login_at).toLocaleDateString()
                          : <span className="text-charcoal-400">Never</span>}
                      </td>
                      <td className="px-6 py-4">
                        <div className="relative">
                          <button
                            onClick={() => setOpenDropdown(openDropdown === user.id ? null : user.id)}
                            className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                          >
                            <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
                          </button>
                          {openDropdown === user.id && (
                            <>
                              <div
                                className="fixed inset-0 z-10"
                                onClick={() => setOpenDropdown(null)}
                              />
                              <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                                <Link
                                  href={`/employee/admin/users/${user.id}`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <Eye className="w-4 h-4" />
                                  View Details
                                </Link>
                                <Link
                                  href={`/employee/admin/users/${user.id}/edit`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <Edit className="w-4 h-4" />
                                  Edit User
                                </Link>
                                <Link
                                  href={`/employee/admin/users/${user.id}`}
                                  className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                  onClick={() => setOpenDropdown(null)}
                                >
                                  <UserCog className="w-4 h-4" />
                                  Manage Access
                                </Link>
                              </div>
                            </>
                          )}
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>

        {/* Pagination */}
        {usersQuery.data && usersQuery.data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-charcoal-500">
              Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, usersQuery.data.pagination.total)} of {usersQuery.data.pagination.total} users
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
                disabled={page >= usersQuery.data.pagination.totalPages}
                onClick={() => setPage(p => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardSection>
    </AdminPageContent>
  )
}
