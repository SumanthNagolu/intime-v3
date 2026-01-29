'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Users, Shield, Clock, Search, Loader2, X, Check } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import type { FullOrgGroupData, OrgGroupMember } from '@/types/admin'

const VACATION_STATUS_LABELS: Record<string, string> = {
  available: 'Available',
  vacation: 'On Vacation',
  sick: 'Sick Leave',
  leave: 'On Leave',
}

const VACATION_STATUS_COLORS: Record<string, string> = {
  available: 'bg-green-100 text-green-700',
  vacation: 'bg-blue-100 text-blue-700',
  sick: 'bg-orange-100 text-orange-700',
  leave: 'bg-purple-100 text-purple-700',
}

type AvailableUser = {
  id: string
  full_name: string
  email: string
  avatar_url?: string | null
  role_id?: string
}

interface GroupUsersSectionProps {
  group: FullOrgGroupData
  onMembersChange?: () => void
}

/**
 * Guidewire-style Group Users Tab
 * 
 * Shows members with:
 * - User info (name, email)
 * - Manager flag
 * - Load Factor
 * - Vacation Status
 * - Add/Remove actions
 */
export function GroupUsersSection({ group, onMembersChange }: GroupUsersSectionProps) {
  const utils = trpc.useUtils()
  const [selectedMembers, setSelectedMembers] = useState<Set<string>>(new Set())
  const [isAddingMember, setIsAddingMember] = useState(false)
  const [search, setSearch] = useState('')
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([])

  const removeMembers = trpc.groups.removeMembers.useMutation({
    onSuccess: () => {
      setSelectedMembers(new Set())
      onMembersChange?.()
    },
  })

  // Query for available users when dialog is open
  const availableUsersQuery = trpc.groups.getAvailableUsers.useQuery(
    { search: search || undefined, excludeGroupId: group.id },
    { enabled: isAddingMember }
  )

  // Mutation to add members
  const addMembersMutation = trpc.groups.addMembers.useMutation({
    onSuccess: (data) => {
      toast.success(`Added ${data.added} member(s)`)
      utils.groups.getById.invalidate({ id: group.id })
      utils.groups.getFullGroup.invalidate({ id: group.id })
      setSelectedUserIds([])
      setSearch('')
      setIsAddingMember(false)
      onMembersChange?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add members')
    },
  })

  const activeMembers = group.members?.filter(m => m.is_active) ?? []
  const existingMemberIds = new Set(activeMembers.map(m => m.user_id))

  // Filter out users who are already members
  const availableUsers = (availableUsersQuery.data ?? []).filter(
    (u: AvailableUser) => !existingMemberIds.has(u.id)
  )

  const toggleUserSelection = (userId: string) => {
    setSelectedUserIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleAddMembers = () => {
    if (selectedUserIds.length === 0) {
      toast.error('Please select at least one user')
      return
    }
    addMembersMutation.mutate({
      groupId: group.id,
      members: selectedUserIds.map(userId => ({ userId, isManager: false })),
    })
  }

  const handleCloseDialog = () => {
    setSelectedUserIds([])
    setSearch('')
    setIsAddingMember(false)
  }

  const handleToggleSelect = (memberId: string) => {
    const newSelected = new Set(selectedMembers)
    if (newSelected.has(memberId)) {
      newSelected.delete(memberId)
    } else {
      newSelected.add(memberId)
    }
    setSelectedMembers(newSelected)
  }

  const handleRemoveSelected = async () => {
    if (selectedMembers.size === 0) return
    
    const userIds = Array.from(selectedMembers).map(memberId => {
      const member = group.members.find(m => m.id === memberId)
      return member?.user_id
    }).filter(Boolean) as string[]

    await removeMembers.mutateAsync({
      groupId: group.id,
      userIds,
    })
  }

  return (
    <div className="space-y-4">
      {/* Action Bar */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button 
            className="bg-hublot-900 hover:bg-hublot-800 text-white"
            onClick={() => setIsAddingMember(true)}
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
          <Button 
            variant="outline"
            disabled={selectedMembers.size === 0}
            onClick={handleRemoveSelected}
            className={selectedMembers.size > 0 ? 'text-red-600 hover:text-red-700 hover:bg-red-50' : ''}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Remove
          </Button>
        </div>
        <span className="text-sm text-charcoal-500">
          {activeMembers.length} member{activeMembers.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Members Table */}
      <div className="bg-white rounded-lg border border-charcoal-100 overflow-hidden">
        {activeMembers.length === 0 ? (
          <div className="p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
              <Users className="w-8 h-8 text-charcoal-400" />
            </div>
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No members</h3>
            <p className="text-charcoal-500 mb-4">
              This group has no members yet. Add users to get started.
            </p>
            <Button 
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
              onClick={() => setIsAddingMember(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Add Member
            </Button>
          </div>
        ) : (
          <table className="w-full">
            <thead>
              <tr className="border-b border-charcoal-100 bg-charcoal-50">
                <th className="px-4 py-3 w-10">
                  <input
                    type="checkbox"
                    className="rounded border-charcoal-300"
                    checked={selectedMembers.size === activeMembers.length && activeMembers.length > 0}
                    onChange={(e) => {
                      if (e.target.checked) {
                        setSelectedMembers(new Set(activeMembers.map(m => m.id)))
                      } else {
                        setSelectedMembers(new Set())
                      }
                    }}
                  />
                </th>
                <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase tracking-wider">User</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Member</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Active</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Manager</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Load Perm</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Load Factor</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Vacation Status</th>
                <th className="px-4 py-3 text-center text-xs font-semibold text-charcoal-600 uppercase tracking-wider">Backup User</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal-100">
              {activeMembers.map((member: OrgGroupMember) => (
                <tr key={member.id} className="hover:bg-charcoal-50 transition-colors">
                  <td className="px-4 py-3">
                    <input
                      type="checkbox"
                      className="rounded border-charcoal-300"
                      checked={selectedMembers.has(member.id)}
                      onChange={() => handleToggleSelect(member.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-medium text-sm">
                        {member.user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div>
                        <Link
                          href={`/employee/admin/users/${member.user.id}`}
                          className="font-medium text-charcoal-900 hover:text-gold-600"
                        >
                          {member.user.full_name}
                        </Link>
                        <p className="text-xs text-charcoal-500">{member.user.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className="text-green-600">✓</span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={member.is_active ? 'text-green-600' : 'text-charcoal-400'}>
                      {member.is_active ? '✓' : '—'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    {member.is_manager ? (
                      <Shield className="w-4 h-4 text-gold-600 mx-auto" />
                    ) : (
                      <span className="text-charcoal-400">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-charcoal-600">
                    {member.load_permission === 'normal' ? 'Normal' : 
                     member.load_permission === 'reduced' ? 'Reduced' : 'Exempt'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-charcoal-600">
                    {member.load_factor}%
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                      VACATION_STATUS_COLORS[member.vacation_status] ?? 'bg-charcoal-100 text-charcoal-600'
                    }`}>
                      {VACATION_STATUS_LABELS[member.vacation_status] ?? member.vacation_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-charcoal-500">
                    {member.backup_user_id ? (
                      <Clock className="w-4 h-4 text-charcoal-400 mx-auto" />
                    ) : (
                      '—'
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Add Member Dialog */}
      {isAddingMember && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 max-h-[80vh] flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-charcoal-900">Add Members</h3>
              <button
                onClick={handleCloseDialog}
                className="p-2 hover:bg-charcoal-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-charcoal-500" />
              </button>
            </div>

            <div className="space-y-4 flex-1 overflow-hidden flex flex-col">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search users by name or email..."
                  className="pl-10"
                />
              </div>

              {/* User List */}
              <div className="flex-1 overflow-y-auto border rounded-lg divide-y divide-charcoal-100 min-h-[200px]">
                {availableUsersQuery.isLoading ? (
                  <div className="p-4 text-center">
                    <Loader2 className="w-6 h-6 animate-spin mx-auto text-charcoal-400" />
                  </div>
                ) : availableUsers.length === 0 ? (
                  <div className="p-4 text-center text-charcoal-500">
                    {search ? 'No users found matching your search' : 'No users available to add'}
                  </div>
                ) : (
                  availableUsers.map((user: AvailableUser) => (
                    <label
                      key={user.id}
                      className="flex items-center gap-3 p-3 hover:bg-charcoal-50 cursor-pointer"
                    >
                      <div
                        className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                          selectedUserIds.includes(user.id)
                            ? 'bg-hublot-900 border-hublot-900'
                            : 'border-charcoal-300'
                        }`}
                        onClick={() => toggleUserSelection(user.id)}
                      >
                        {selectedUserIds.includes(user.id) && (
                          <Check className="w-3 h-3 text-white" />
                        )}
                      </div>
                      <div className="w-8 h-8 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-medium text-sm">
                        {user.full_name?.split(' ').map(n => n[0]).join('').slice(0, 2)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate text-charcoal-900">{user.full_name}</p>
                        <p className="text-xs text-charcoal-500 truncate">{user.email}</p>
                      </div>
                    </label>
                  ))
                )}
              </div>

              {/* Selected count */}
              {selectedUserIds.length > 0 && (
                <p className="text-sm text-charcoal-600">
                  {selectedUserIds.length} user{selectedUserIds.length > 1 ? 's' : ''} selected
                </p>
              )}

              {/* Actions */}
              <div className="flex gap-3 justify-end pt-2">
                <Button variant="outline" onClick={handleCloseDialog}>
                  Cancel
                </Button>
                <Button
                  onClick={handleAddMembers}
                  disabled={selectedUserIds.length === 0 || addMembersMutation.isPending}
                  className="bg-hublot-900 hover:bg-hublot-800 text-white"
                >
                  {addMembersMutation.isPending && (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  )}
                  Add {selectedUserIds.length > 0 ? `(${selectedUserIds.length})` : ''}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}







