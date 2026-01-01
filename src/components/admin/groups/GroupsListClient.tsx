'use client'

import { useState, useCallback } from 'react'
import { trpc } from '@/lib/trpc/client'
import {
  DashboardShell,
  DashboardSection,
} from '@/components/dashboard/DashboardShell'
import { Button } from '@/components/ui/button'
import { Plus, Building2, MoreHorizontal, Edit, Eye, Users, MapPin } from 'lucide-react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { GroupSearchForm } from './GroupSearchForm'

const GROUP_TYPE_LABELS: Record<string, string> = {
  root: 'Organization',
  division: 'Division',
  branch: 'Branch Office',
  team: 'Team',
  satellite_office: 'Satellite Office',
  producer: 'Producer',
}

const GROUP_TYPE_COLORS: Record<string, string> = {
  root: 'bg-gold-100 text-gold-800',
  division: 'bg-blue-100 text-blue-800',
  branch: 'bg-green-100 text-green-800',
  team: 'bg-purple-100 text-purple-800',
  satellite_office: 'bg-cyan-100 text-cyan-800',
  producer: 'bg-orange-100 text-orange-800',
}

type GroupItem = {
  id: string
  name: string
  code: string | null
  groupType: string
  parentGroupId: string | null
  hierarchyLevel: number
  isActive: boolean
  memberCount: number
  regionCount: number
  supervisor?: {
    id: string
    full_name: string
    email: string
    avatar_url?: string
  } | null
  parent?: {
    id: string
    name: string
    group_type: string
  } | null
}

type GroupsListData = {
  items: GroupItem[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
}

interface GroupsListClientProps {
  initialData: GroupsListData
  initialFilters: {
    search?: string
    groupType?: string
    status?: string
    page?: number
  }
}

export function GroupsListClient({ initialData, initialFilters }: GroupsListClientProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [search, setSearch] = useState(initialFilters.search || '')
  const [groupType, setGroupType] = useState<string>(initialFilters.groupType || '')
  const [status, setStatus] = useState<string>(initialFilters.status || 'active')
  const [page, setPage] = useState(initialFilters.page || 1)
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  // Use initial data, then switch to client query for filtering
  const [data, setData] = useState(initialData)
  const [isRefetching, setIsRefetching] = useState(false)

  // Use refetch for client-side filtering
  const refetch = trpc.groups.list.useQuery(
    {
      search: search || undefined,
      groupType: groupType && groupType !== 'all' 
        ? groupType as 'root' | 'division' | 'branch' | 'team' | 'satellite_office' | 'producer' 
        : undefined,
      isActive: status === 'active' ? true : status === 'inactive' ? false : undefined,
      page,
      pageSize: 20,
    },
    {
      enabled: false, // Manual fetch only
    }
  )

  const updateFilters = useCallback(async (newFilters: {
    search?: string
    groupType?: string
    status?: string
    page?: number
  }) => {
    setIsRefetching(true)
    const params = new URLSearchParams(searchParams.toString())

    if (newFilters.search !== undefined) {
      if (newFilters.search) params.set('search', newFilters.search)
      else params.delete('search')
    }
    if (newFilters.groupType !== undefined) {
      if (newFilters.groupType && newFilters.groupType !== 'all') params.set('groupType', newFilters.groupType)
      else params.delete('groupType')
    }
    if (newFilters.status !== undefined) {
      if (newFilters.status && newFilters.status !== 'all') params.set('status', newFilters.status)
      else params.delete('status')
    }
    if (newFilters.page !== undefined) {
      if (newFilters.page > 1) params.set('page', String(newFilters.page))
      else params.delete('page')
    }

    router.push(`?${params.toString()}`, { scroll: false })

    // Refetch data
    const result = await refetch.refetch()
    if (result.data) {
      setData(result.data)
    }
    setIsRefetching(false)
  }, [searchParams, router, refetch])

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Groups' },
  ]

  const isLoading = isRefetching

  return (
    <DashboardShell
      title="Groups"
      description="Manage organizational groups and team structures"
      breadcrumbs={breadcrumbs}
      actions={
        <Link href="/employee/admin/groups/new">
          <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
            <Plus className="w-4 h-4 mr-2" />
            New Group
          </Button>
        </Link>
      }
    >
      <DashboardSection>
        {/* Search Form */}
        <GroupSearchForm
          onSearch={(filters) => {
            setSearch(filters.search || '')
            setGroupType(filters.groupType || '')
            setStatus(filters.status || 'active')
            setPage(1)
            updateFilters({
              search: filters.search,
              groupType: filters.groupType,
              status: filters.status,
              page: 1,
            })
          }}
        />

        {/* Table */}
        <div className="bg-white rounded-xl border border-charcoal-100 overflow-hidden">
          {isLoading ? (
            <div className="p-8 space-y-4">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
              ))}
            </div>
          ) : data.items.length === 0 ? (
            <div className="p-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Building2 className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No groups found</h3>
              <p className="text-charcoal-500 mb-4">
                {search || (groupType && groupType !== 'all') ? 'Try adjusting your filters' : 'Get started by creating your first group'}
              </p>
              {!search && (!groupType || groupType === 'all') && (
                <Link href="/employee/admin/groups/new">
                  <Button className="bg-hublot-900 hover:bg-hublot-800 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Create Group
                  </Button>
                </Link>
              )}
            </div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-charcoal-100 bg-charcoal-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Parent</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Organization</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Type</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Members</th>
                  <th className="px-6 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Regions</th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Status</th>
                  <th className="px-6 py-3 w-[50px]"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100">
                {data.items.map((group: GroupItem) => (
                  <tr key={group.id} className="hover:bg-charcoal-50 transition-colors">
                    <td className="px-6 py-4">
                      <Link
                        href={`/employee/admin/groups/${group.id}`}
                        className="font-medium text-charcoal-900 hover:text-gold-600"
                      >
                        {group.name}
                      </Link>
                      {group.code && (
                        <span className="ml-2 text-xs text-charcoal-400">
                          ({group.code})
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {group.parent ? (
                        <Link
                          href={`/employee/admin/groups/${group.parent.id}`}
                          className="text-charcoal-600 hover:text-gold-600"
                        >
                          {group.parent.name}
                        </Link>
                      ) : (
                        <span className="text-charcoal-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-charcoal-600">
                      {/* Organization column - for now show parent name or root */}
                      {group.groupType === 'root' ? (
                        <span className="text-charcoal-900 font-medium">{group.name}</span>
                      ) : group.parent ? (
                        group.parent.name
                      ) : (
                        <span className="text-charcoal-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${GROUP_TYPE_COLORS[group.groupType] ?? 'bg-gray-100 text-gray-800'}`}>
                        {GROUP_TYPE_LABELS[group.groupType] ?? group.groupType}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-charcoal-600">
                        <Users className="w-4 h-4 text-charcoal-400" />
                        <span>{group.memberCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex items-center justify-center gap-1 text-charcoal-600">
                        <MapPin className="w-4 h-4 text-charcoal-400" />
                        <span>{group.regionCount}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        group.isActive
                          ? 'bg-green-100 text-green-800'
                          : 'bg-charcoal-100 text-charcoal-600'
                      }`}>
                        {group.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="relative">
                        <button
                          onClick={() => setOpenDropdown(openDropdown === group.id ? null : group.id)}
                          className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
                        >
                          <MoreHorizontal className="w-4 h-4 text-charcoal-500" />
                        </button>
                        {openDropdown === group.id && (
                          <>
                            <div
                              className="fixed inset-0 z-10"
                              onClick={() => setOpenDropdown(null)}
                            />
                            <div className="absolute right-0 mt-1 w-48 bg-white rounded-lg shadow-lg border border-charcoal-100 z-20">
                              <Link
                                href={`/employee/admin/groups/${group.id}`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Eye className="w-4 h-4" />
                                View Details
                              </Link>
                              <Link
                                href={`/employee/admin/groups/${group.id}/edit`}
                                className="flex items-center gap-2 px-4 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50"
                                onClick={() => setOpenDropdown(null)}
                              >
                                <Edit className="w-4 h-4" />
                                Edit Group
                              </Link>
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
        {data.pagination.totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <p className="text-sm text-charcoal-500">
              Showing {((page - 1) * 20) + 1} - {Math.min(page * 20, data.pagination.total)} of {data.pagination.total} groups
            </p>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                disabled={page === 1}
                onClick={() => { const newPage = page - 1; setPage(newPage); updateFilters({ page: newPage }) }}
              >
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                disabled={page >= data.pagination.totalPages}
                onClick={() => { const newPage = page + 1; setPage(newPage); updateFilters({ page: newPage }) }}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </DashboardSection>
    </DashboardShell>
  )
}


