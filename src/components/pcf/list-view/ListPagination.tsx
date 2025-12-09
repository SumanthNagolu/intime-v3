'use client'

import { Button } from '@/components/ui/button'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface ListPaginationProps {
  currentPage: number
  totalPages: number
  totalItems: number
  pageSize: number
  onPageChange: (page: number) => void
  showingFrom: number
  showingTo: number
}

export function ListPagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize: _pageSize, // Reserved for future page size selector
  onPageChange,
  showingFrom,
  showingTo,
}: ListPaginationProps) {
  if (totalPages <= 1) {
    return (
      <p className="text-sm text-charcoal-500 mt-4">
        Showing {totalItems} {totalItems === 1 ? 'item' : 'items'}
      </p>
    )
  }

  return (
    <div className="flex items-center justify-between mt-6">
      <p className="text-sm text-charcoal-500">
        Showing {showingFrom} to {showingTo} of {totalItems} items
      </p>

      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
        >
          <ChevronLeft className="w-4 h-4 mr-1" />
          Previous
        </Button>

        <span className="text-sm text-charcoal-600 px-2">
          Page {currentPage} of {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
        >
          Next
          <ChevronRight className="w-4 h-4 ml-1" />
        </Button>
      </div>
    </div>
  )
}
