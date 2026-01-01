'use client'

import { useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

const CATEGORY_OPTIONS = [
  { value: 'all', label: 'All Categories' },
  { value: 'pod_ic', label: 'Pod IC' },
  { value: 'pod_manager', label: 'Pod Manager' },
  { value: 'leadership', label: 'Leadership' },
  { value: 'executive', label: 'Executive' },
  { value: 'portal', label: 'Portal' },
  { value: 'admin', label: 'Admin' },
]

interface RoleSearchFormProps {
  onSearch?: () => void
}

export function RoleSearchForm({ onSearch }: RoleSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const [name, setName] = useState(searchParams.get('search') || '')
  const [category, setCategory] = useState(searchParams.get('category') || 'all')

  const handleSearch = () => {
    const params = new URLSearchParams()
    if (name) params.set('search', name)
    if (category && category !== 'all') params.set('category', category)
    params.set('page', '1')

    router.push(`?${params.toString()}`, { scroll: false })
    onSearch?.()
  }

  const handleReset = () => {
    setName('')
    setCategory('all')
    router.push('?', { scroll: false })
    onSearch?.()
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  return (
    <div className="bg-white rounded-lg border border-charcoal-100 p-4 mb-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Name Search */}
        <div>
          <label className="block text-xs font-medium text-charcoal-600 uppercase tracking-wider mb-1.5">
            Name
          </label>
          <Input
            placeholder="Search by name or code..."
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9"
          />
        </div>

        {/* Category Select */}
        <div>
          <label className="block text-xs font-medium text-charcoal-600 uppercase tracking-wider mb-1.5">
            Type
          </label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="h-9">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              {CATEGORY_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Search/Reset Buttons */}
        <div className="flex items-end gap-2">
          <Button
            onClick={handleSearch}
            className="bg-hublot-900 hover:bg-hublot-800 text-white h-9"
          >
            <Search className="w-4 h-4 mr-2" />
            Search
          </Button>
          <Button
            variant="outline"
            onClick={handleReset}
            className="h-9"
          >
            <RotateCcw className="w-4 h-4 mr-2" />
            Reset
          </Button>
        </div>
      </div>
    </div>
  )
}
