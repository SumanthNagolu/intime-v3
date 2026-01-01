'use client'

import { useState, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Plus, Users, UserCheck, Clock, AlertTriangle, UserX } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { UserSearchForm } from './UserSearchForm'
import { UserSearchResults } from './UserSearchResults'
import type { UserListItem, AdminFilterOptions, UserStats } from '@/types/admin'

interface UsersListData {
  items: UserListItem[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  filterOptions: AdminFilterOptions
  stats: UserStats
}

interface UsersListClientProps {
  initialData: UsersListData
  initialFilters: {
    search?: string
    roleId?: string
    podId?: string
    status?: string
    page?: number
  }
}

export function UsersListClient({ initialData, initialFilters }: UsersListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [page, setPage] = useState(initialFilters.page || 1)
  const [data, setData] = useState(initialData)
  const [isRefetching, setIsRefetching] = useState(false)

  // Use refetch for client-side filtering
  const refetch = trpc.users.listWithFilterOptions.useQuery(
    {
      search: searchParams.get('username') || searchParams.get('firstName') || searchParams.get('lastName') || undefined,
      roleId: searchParams.get('roleId') || undefined,
      podId: searchParams.get('groupName') || undefined,
      status: searchParams.get('status') as 'pending' | 'active' | 'suspended' | 'deactivated' | undefined,
      page,
      pageSize: 15,
    },
    {
      enabled: false, // Manual fetch only
    }
  )

  const handleSearch = useCallback(async (filters: Record<string, string | boolean | undefined>) => {
    setIsRefetching(true)
    setPage(1)

    // Build query params for the router
    const params = new URLSearchParams()
    if (filters.username) params.set('username', String(filters.username))
    if (filters.firstName) params.set('firstName', String(filters.firstName))
    if (filters.lastName) params.set('lastName', String(filters.lastName))
    if (filters.groupName) params.set('groupName', String(filters.groupName))
    if (filters.unassigned) params.set('unassigned', 'true')
    if (filters.userType) params.set('userType', String(filters.userType))
    if (filters.roleId) params.set('roleId', String(filters.roleId))
    if (filters.status) params.set('status', String(filters.status))

    router.push(`?${params.toString()}`, { scroll: false })

    // Refetch data with new filters
    const result = await refetch.refetch()
    if (result.data) {
      setData(result.data as UsersListData)
    }
    setIsRefetching(false)
  }, [router, refetch])

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Users' },
  ]

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
        {/* Stats Cards */}
        <div className="grid grid-cols-5 gap-4 mb-6">
          <div className="bg-white rounded-lg border border-charcoal-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
                <Users className="w-5 h-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{data.stats.total}</p>
                <p className="text-sm text-charcoal-500">Total Users</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-charcoal-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                <UserCheck className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{data.stats.active}</p>
                <p className="text-sm text-charcoal-500">Active</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-charcoal-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{data.stats.pending}</p>
                <p className="text-sm text-charcoal-500">Pending</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-charcoal-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{data.stats.suspended}</p>
                <p className="text-sm text-charcoal-500">Suspended</p>
              </div>
            </div>
          </div>
          <div className="bg-white rounded-lg border border-charcoal-100 p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
                <UserX className="w-5 h-5 text-charcoal-500" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{data.stats.deactivated}</p>
                <p className="text-sm text-charcoal-500">Deactivated</p>
              </div>
            </div>
          </div>
        </div>

        {/* Guidewire-style Search Form */}
        <UserSearchForm
          filterOptions={{
            roles: data.filterOptions.roles,
            pods: data.filterOptions.pods,
            userTypes: [
              { value: 'internal', label: 'Internal' },
              { value: 'external', label: 'External' },
            ],
          }}
          onSearch={handleSearch}
        />

        {/* Guidewire-style Results Table */}
        <UserSearchResults
          items={data.items}
          pagination={data.pagination}
          isLoading={isRefetching}
        />
      </DashboardSection>
    </AdminPageContent>
  )
}
