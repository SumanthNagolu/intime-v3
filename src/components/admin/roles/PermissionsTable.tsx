'use client'

import { useState, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Key } from 'lucide-react'
import { Button } from '@/components/ui/button'
import type { RolePermission } from '@/types/admin'

interface PermissionsTableProps {
  permissions: RolePermission[]
  pageSize?: number
}

export function PermissionsTable({ permissions, pageSize = 15 }: PermissionsTableProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalItems = permissions.length
  const totalPages = Math.ceil(totalItems / pageSize)

  const paginatedPermissions = useMemo(() => {
    const startIndex = (currentPage - 1) * pageSize
    const endIndex = startIndex + pageSize
    return permissions.slice(startIndex, endIndex)
  }, [permissions, currentPage, pageSize])

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

  if (permissions.length === 0) {
    return (
      <div className="py-8 text-center">
        <Key className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
        <p className="text-charcoal-500 text-sm">No permissions assigned to this role</p>
      </div>
    )
  }

  return (
    <div>
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-charcoal-100 bg-charcoal-50">
              <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Permission
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Code
              </th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">
                Description
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal-100">
            {paginatedPermissions.map((permission) => (
              <tr key={permission.id} className="hover:bg-charcoal-50 transition-colors">
                <td className="px-4 py-3">
                  <span className="font-medium text-charcoal-900 text-sm">
                    {permission.name}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <code className="px-1.5 py-0.5 bg-charcoal-100 text-charcoal-700 text-xs rounded">
                    {permission.code}
                  </code>
                </td>
                <td className="px-4 py-3">
                  <span className="text-charcoal-600 text-sm">
                    {permission.description || '-'}
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
