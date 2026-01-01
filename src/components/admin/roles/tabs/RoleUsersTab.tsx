'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Users, UserCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import type { RoleUser } from '@/types/admin'

interface RoleUsersTabProps {
  users: RoleUser[]
  pageSize?: number
}

export function RoleUsersTab({ users, pageSize = 15 }: RoleUsersTabProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalItems = users.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const paginatedUsers = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return users.slice(startIndex, endIndex)
  }, [users, currentPage, pageSize])

  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1
  const endItem = Math.min(currentPage * pageSize, totalItems)

  const handlePrevPage = () => {
    if (currentPage > 1) {
      setCurrentPage((p) => p - 1)
    }
  }

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage((p) => p + 1)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2)
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800'
      case 'pending':
        return 'bg-amber-100 text-amber-800'
      case 'suspended':
        return 'bg-red-100 text-red-800'
      default:
        return 'bg-charcoal-100 text-charcoal-600'
    }
  }

  if (users.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-charcoal-100">
        <div className="py-12 text-center">
          <Users className="w-12 h-12 mx-auto text-charcoal-300 mb-3" />
          <p className="text-charcoal-500 text-sm">No users assigned to this role</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white rounded-lg border border-charcoal-100">
      <div className="px-4 py-3 border-b border-charcoal-100 bg-charcoal-50 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider">
          Users with this Role
        </h3>
        <span className="text-xs text-charcoal-500">
          {totalItems} user{totalItems !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal-100 bg-charcoal-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                User
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Email
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100">
            {paginatedUsers.map((user) => (
              <tr key={user.id} className="hover:bg-charcoal-50 transition-colors">
                <td className="px-4 py-3">
                  <Link
                    href={`/employee/admin/users/${user.id}`}
                    className="flex items-center gap-3 hover:text-hublot-600"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user.avatar_url} alt={user.full_name} />
                      <AvatarFallback className="bg-charcoal-100 text-charcoal-600 text-xs">
                        {user.avatar_url ? (
                          <UserCircle className="h-4 w-4" />
                        ) : (
                          getInitials(user.full_name)
                        )}
                      </AvatarFallback>
                    </Avatar>
                    <span className="font-medium text-charcoal-900 text-sm">
                      {user.full_name}
                    </span>
                  </Link>
                </td>
                <td className="px-4 py-3">
                  <span className="text-charcoal-600 text-sm">{user.email}</span>
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium capitalize ${getStatusColor(user.status)}`}
                  >
                    {user.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between px-4 py-3 border-t border-charcoal-100">
          <p className="text-sm text-charcoal-500">
            ({startItem} - {endItem} of {totalItems})
          </p>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handlePrevPage}
              disabled={currentPage === 1}
              className="h-8 w-8 p-0"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-sm text-charcoal-600 px-2">
              Page {currentPage} of {totalPages}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={handleNextPage}
              disabled={currentPage === totalPages}
              className="h-8 w-8 p-0"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
