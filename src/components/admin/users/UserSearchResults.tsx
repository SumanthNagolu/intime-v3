'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ChevronLeft, ChevronRight, LayoutGrid, List, Users, MoreHorizontal, Edit, Eye, UserCog } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { UserListItem, UserPodMembership } from '@/types/admin'

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

interface UserSearchResultsProps {
  items: UserListItem[]
  pagination: {
    total: number
    page: number
    pageSize: number
    totalPages: number
  }
  isLoading?: boolean
}

/**
 * User Search Results Table (Guidewire-style)
 *
 * Columns: Name (linked), Username, Organization, Group Name
 * Pagination: (1 - 15 of X) format with page controls
 * Grid/List view toggle
 */
export function UserSearchResults({ items, pagination, isLoading }: UserSearchResultsProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list')
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)

  const getInitials = (name: string) => {
    return name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  }

  const getActivePod = (user: UserListItem): string | null => {
    const activeMembership = user.pod_memberships?.find((pm: UserPodMembership) => pm.is_active)
    return activeMembership?.pod?.name ?? null
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams(searchParams.toString())
    if (newPage > 1) {
      params.set('page', String(newPage))
    } else {
      params.delete('page')
    }
    router.push(`?${params.toString()}`, { scroll: false })
  }

  // Calculate display range
  const startIndex = (pagination.page - 1) * pagination.pageSize + 1
  const endIndex = Math.min(pagination.page * pagination.pageSize, pagination.total)

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg border border-charcoal-100">
        <div className="p-8 space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded" />
          ))}
        </div>
      </div>
    )
  }

  if (items.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-charcoal-100">
        <div className="p-12 text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
            <Users className="w-8 h-8 text-charcoal-400" />
          </div>
          <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No users found</h3>
          <p className="text-charcoal-500">
            Try adjusting your search criteria
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-charcoal-100">
      {/* Header with pagination info and view toggle */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-charcoal-100 bg-charcoal-50">
        <div className="text-sm text-charcoal-600">
          {startIndex} - {endIndex} of {pagination.total} users
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              viewMode === 'list' && 'bg-charcoal-100'
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className={cn(
              'h-8 w-8 p-0',
              viewMode === 'grid' && 'bg-charcoal-100'
            )}
            onClick={() => setViewMode('grid')}
          >
            <LayoutGrid className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {viewMode === 'list' ? (
        /* Table View */
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal-100">
              <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Username
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Role
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Group Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 w-[50px]"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100">
            {items.map((user) => {
              const activePodName = getActivePod(user)
              return (
                <tr key={user.id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-medium text-sm">
                        {getInitials(user.full_name)}
                      </div>
                      <Link
                        href={`/employee/admin/users/${user.id}`}
                        className="font-medium text-charcoal-900 hover:text-gold-600 transition-colors"
                      >
                        {user.full_name}
                      </Link>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal-600">
                    {user.email}
                  </td>
                  <td className="px-6 py-4">
                    {user.role ? (
                      <span
                        className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: `${user.role.color_code}20`,
                          color: user.role.color_code,
                        }}
                      >
                        {user.role.display_name}
                      </span>
                    ) : (
                      <span className="text-charcoal-400 text-sm">—</span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-sm text-charcoal-600">
                    {activePodName ?? <span className="text-charcoal-400">—</span>}
                  </td>
                  <td className="px-6 py-4">
                    <span className={cn(
                      'inline-flex px-2 py-0.5 rounded-full text-xs font-medium',
                      STATUS_COLORS[user.status] ?? 'bg-charcoal-100 text-charcoal-600'
                    )}>
                      {STATUS_LABELS[user.status] ?? user.status}
                    </span>
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
                              href={`/employee/admin/users/${user.id}?tab=access`}
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
      ) : (
        /* Grid View */
        <div className="grid grid-cols-3 gap-4 p-6">
          {items.map((user) => {
            const activePodName = getActivePod(user)
            return (
              <Link
                key={user.id}
                href={`/employee/admin/users/${user.id}`}
                className="p-4 border border-charcoal-100 rounded-lg hover:border-gold-300 hover:shadow-sm transition-all"
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-medium">
                    {getInitials(user.full_name)}
                  </div>
                  <div>
                    <div className="font-medium text-charcoal-900">{user.full_name}</div>
                    <div className="text-sm text-charcoal-500">{user.email}</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-sm">
                  {user.role && (
                    <span
                      className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: `${user.role.color_code}20`,
                        color: user.role.color_code,
                      }}
                    >
                      {user.role.display_name}
                    </span>
                  )}
                  {activePodName && (
                    <span className="text-charcoal-500">{activePodName}</span>
                  )}
                </div>
              </Link>
            )
          })}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-charcoal-100 bg-charcoal-50">
          <div className="text-sm text-charcoal-600">
            Page {pagination.page} of {pagination.totalPages}
          </div>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <Button
              variant="ghost"
              size="sm"
              disabled={pagination.page >= pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
