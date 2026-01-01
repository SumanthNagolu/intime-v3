'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface GroupSearchFormProps {
  onSearch: (filters: Record<string, string | undefined>) => void
}

const GROUP_TYPES = [
  { value: 'root', label: 'Organization' },
  { value: 'division', label: 'Division' },
  { value: 'branch', label: 'Branch Office' },
  { value: 'team', label: 'Team' },
  { value: 'satellite_office', label: 'Satellite Office' },
  { value: 'producer', label: 'Producer' },
]

const GROUP_STATUSES = [
  { value: 'active', label: 'Active' },
  { value: 'inactive', label: 'Inactive' },
]

/**
 * Guidewire-style Group Search Form
 *
 * Fields:
 * 1. Group Name (text search)
 * 2. Group Type (organizational type)
 * 3. Status
 */
export function GroupSearchForm({ onSearch }: GroupSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize form state from URL params
  const [groupName, setGroupName] = useState(searchParams.get('search') || '')
  const [groupType, setGroupType] = useState(searchParams.get('groupType') || '')
  const [status, setStatus] = useState(searchParams.get('status') || 'active')

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()

    if (groupName) params.set('search', groupName)
    if (groupType && groupType !== 'all') params.set('groupType', groupType)
    if (status && status !== 'all') params.set('status', status)

    // Reset to page 1 on search
    router.push(`?${params.toString()}`, { scroll: false })

    onSearch({
      search: groupName || undefined,
      groupType: groupType && groupType !== 'all' ? groupType : undefined,
      status: status && status !== 'all' ? status : undefined,
    })
  }, [groupName, groupType, status, router, onSearch])

  const handleReset = useCallback(() => {
    setGroupName('')
    setGroupType('')
    setStatus('active')

    router.push('?status=active', { scroll: false })
    onSearch({ status: 'active' })
  }, [router, onSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  return (
    <div className="bg-white rounded-lg border border-charcoal-100 p-6 mb-6">
      <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
        Search Groups
      </h3>

      <div className="grid grid-cols-3 gap-4">
        {/* Group Name */}
        <div className="space-y-1.5">
          <Label htmlFor="groupName" className="text-xs font-medium text-charcoal-600">
            Group Name
          </Label>
          <Input
            id="groupName"
            placeholder="Search by name..."
            value={groupName}
            onChange={(e) => setGroupName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9"
          />
        </div>

        {/* Group Type */}
        <div className="space-y-1.5">
          <Label htmlFor="groupType" className="text-xs font-medium text-charcoal-600">
            Group Type
          </Label>
          <Select value={groupType} onValueChange={setGroupType}>
            <SelectTrigger id="groupType" className="h-9">
              <SelectValue placeholder="All Types" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              {GROUP_TYPES.map((type) => (
                <SelectItem key={type.value} value={type.value}>
                  {type.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label htmlFor="status" className="text-xs font-medium text-charcoal-600">
            Status
          </Label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status" className="h-9">
              <SelectValue placeholder="Select status..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Statuses</SelectItem>
              {GROUP_STATUSES.map((s) => (
                <SelectItem key={s.value} value={s.value}>
                  {s.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-charcoal-100">
        <Button
          onClick={handleSearch}
          className="bg-hublot-900 hover:bg-hublot-800 text-white"
        >
          <Search className="w-4 h-4 mr-2" />
          Search
        </Button>
        <Button
          variant="outline"
          onClick={handleReset}
        >
          <RotateCcw className="w-4 h-4 mr-2" />
          Reset
        </Button>
      </div>
    </div>
  )
}
