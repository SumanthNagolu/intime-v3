'use client'

import { useState, useCallback } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Search, RotateCcw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { AdminFilterOptions } from '@/types/admin'

interface UserSearchFormProps {
  filterOptions: AdminFilterOptions
  onSearch: (filters: Record<string, string | boolean | undefined>) => void
}

/**
 * 8-field User Search Form (Guidewire-style)
 *
 * Fields:
 * 1. Username (email)
 * 2. First name
 * 3. Last name
 * 4. Group Name (pod)
 * 5. Unassigned (checkbox)
 * 6. User types
 * 7. Role
 * 8. Organization (lookup) - not applicable for single-org, replaced with Status
 */
export function UserSearchForm({ filterOptions, onSearch }: UserSearchFormProps) {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Initialize form state from URL params
  const [username, setUsername] = useState(searchParams.get('username') || '')
  const [firstName, setFirstName] = useState(searchParams.get('firstName') || '')
  const [lastName, setLastName] = useState(searchParams.get('lastName') || '')
  const [groupName, setGroupName] = useState(searchParams.get('groupName') || '')
  const [unassigned, setUnassigned] = useState(searchParams.get('unassigned') === 'true')
  const [userType, setUserType] = useState(searchParams.get('userType') || '')
  const [roleId, setRoleId] = useState(searchParams.get('roleId') || '')
  const [status, setStatus] = useState(searchParams.get('status') || '')

  const handleSearch = useCallback(() => {
    const params = new URLSearchParams()

    if (username) params.set('username', username)
    if (firstName) params.set('firstName', firstName)
    if (lastName) params.set('lastName', lastName)
    if (groupName) params.set('groupName', groupName)
    if (unassigned) params.set('unassigned', 'true')
    if (userType && userType !== 'all') params.set('userType', userType)
    if (roleId && roleId !== 'all') params.set('roleId', roleId)
    if (status && status !== 'all') params.set('status', status)

    // Reset to page 1 on search
    router.push(`?${params.toString()}`, { scroll: false })

    onSearch({
      username: username || undefined,
      firstName: firstName || undefined,
      lastName: lastName || undefined,
      groupName: groupName || undefined,
      unassigned: unassigned || undefined,
      userType: userType && userType !== 'all' ? userType : undefined,
      roleId: roleId && roleId !== 'all' ? roleId : undefined,
      status: status && status !== 'all' ? status : undefined,
    })
  }, [username, firstName, lastName, groupName, unassigned, userType, roleId, status, router, onSearch])

  const handleReset = useCallback(() => {
    setUsername('')
    setFirstName('')
    setLastName('')
    setGroupName('')
    setUnassigned(false)
    setUserType('')
    setRoleId('')
    setStatus('')

    router.push('?', { scroll: false })
    onSearch({})
  }, [router, onSearch])

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }, [handleSearch])

  return (
    <div className="bg-white rounded-lg border border-charcoal-100 p-6 mb-6">
      <h3 className="text-sm font-semibold text-charcoal-900 uppercase tracking-wider mb-4">
        Search Users
      </h3>

      <div className="grid grid-cols-4 gap-4">
        {/* Row 1: Username, First name, Last name, Group Name */}
        <div className="space-y-1.5">
          <Label htmlFor="username" className="text-xs font-medium text-charcoal-600">
            Username
          </Label>
          <Input
            id="username"
            placeholder="Email address..."
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="firstName" className="text-xs font-medium text-charcoal-600">
            First Name
          </Label>
          <Input
            id="firstName"
            placeholder="First name..."
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="lastName" className="text-xs font-medium text-charcoal-600">
            Last Name
          </Label>
          <Input
            id="lastName"
            placeholder="Last name..."
            value={lastName}
            onChange={(e) => setLastName(e.target.value)}
            onKeyDown={handleKeyDown}
            className="h-9"
          />
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="groupName" className="text-xs font-medium text-charcoal-600">
            Group Name
          </Label>
          <Select value={groupName} onValueChange={setGroupName}>
            <SelectTrigger id="groupName" className="h-9">
              <SelectValue placeholder="Select group..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Groups</SelectItem>
              {filterOptions.pods.map((pod) => (
                <SelectItem key={pod.id} value={pod.id}>
                  {pod.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Row 2: Unassigned, User types, Role, Status */}
        <div className="space-y-1.5">
          <Label className="text-xs font-medium text-charcoal-600">
            &nbsp;
          </Label>
          <div className="flex items-center h-9 gap-2">
            <Checkbox
              id="unassigned"
              checked={unassigned}
              onCheckedChange={(checked) => setUnassigned(checked === true)}
            />
            <Label
              htmlFor="unassigned"
              className="text-sm font-normal text-charcoal-700 cursor-pointer"
            >
              Unassigned users only
            </Label>
          </div>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="userType" className="text-xs font-medium text-charcoal-600">
            User Types
          </Label>
          <Select value={userType} onValueChange={setUserType}>
            <SelectTrigger id="userType" className="h-9">
              <SelectValue placeholder="Select type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="internal">Internal</SelectItem>
              <SelectItem value="external">External</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label htmlFor="role" className="text-xs font-medium text-charcoal-600">
            Role
          </Label>
          <Select value={roleId} onValueChange={setRoleId}>
            <SelectTrigger id="role" className="h-9">
              <SelectValue placeholder="Select role..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Roles</SelectItem>
              {filterOptions.roles.map((role) => (
                <SelectItem key={role.id} value={role.id}>
                  {role.display_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

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
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="suspended">Suspended</SelectItem>
              <SelectItem value="deactivated">Deactivated</SelectItem>
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
