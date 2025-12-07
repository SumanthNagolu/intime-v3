'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Search, Loader2, X, Check } from 'lucide-react'
import { toast } from 'sonner'

interface AddMembersDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  podId: string
  existingMemberIds: string[]
}

type UserProfile = {
  id: string
  full_name: string
  email: string
  avatar_url?: string | null
  role_id?: string
}

export function AddMembersDialog({
  open,
  onOpenChange,
  podId,
  existingMemberIds,
}: AddMembersDialogProps) {
  const utils = trpc.useUtils()
  const [search, setSearch] = useState('')
  const [selectedIds, setSelectedIds] = useState<string[]>([])

  const usersQuery = trpc.pods.getAvailableUsers.useQuery({
    search: search || undefined,
    excludePodId: podId,
  })

  const addMembersMutation = trpc.pods.addMembers.useMutation({
    onSuccess: (data) => {
      toast.success(`Added ${data.added} member(s)`)
      utils.pods.getById.invalidate({ id: podId })
      setSelectedIds([])
      setSearch('')
      onOpenChange(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add members')
    },
  })

  const availableUsers = usersQuery.data?.filter(
    (u: UserProfile) => !existingMemberIds.includes(u.id)
  ) ?? []

  const toggleUser = (userId: string) => {
    setSelectedIds(prev =>
      prev.includes(userId)
        ? prev.filter(id => id !== userId)
        : [...prev, userId]
    )
  }

  const handleSubmit = () => {
    if (selectedIds.length === 0) {
      toast.error('Please select at least one user')
      return
    }

    addMembersMutation.mutate({
      podId,
      members: selectedIds.map(userId => ({ userId, role: 'junior' as const })),
    })
  }

  const handleClose = () => {
    setSelectedIds([])
    setSearch('')
    onOpenChange(false)
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4 max-h-[80vh] flex flex-col">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-charcoal-900">Add Members</h3>
          <button
            onClick={handleClose}
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
              placeholder="Search users..."
              className="pl-10"
            />
          </div>

          {/* User List */}
          <div className="flex-1 overflow-y-auto border rounded-lg divide-y divide-charcoal-100 min-h-[200px]">
            {usersQuery.isLoading ? (
              <div className="p-4 text-center">
                <Loader2 className="w-6 h-6 animate-spin mx-auto text-charcoal-400" />
              </div>
            ) : availableUsers.length === 0 ? (
              <div className="p-4 text-center text-charcoal-500">
                {search ? 'No users found matching your search' : 'No users available'}
              </div>
            ) : (
              availableUsers.map((user: UserProfile) => (
                <label
                  key={user.id}
                  className="flex items-center gap-3 p-3 hover:bg-charcoal-50 cursor-pointer"
                >
                  <div
                    className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-colors ${
                      selectedIds.includes(user.id)
                        ? 'bg-hublot-900 border-hublot-900'
                        : 'border-charcoal-300'
                    }`}
                    onClick={() => toggleUser(user.id)}
                  >
                    {selectedIds.includes(user.id) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center text-charcoal-700 font-medium text-sm">
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
          {selectedIds.length > 0 && (
            <p className="text-sm text-charcoal-600">
              {selectedIds.length} user{selectedIds.length > 1 ? 's' : ''} selected
            </p>
          )}

          {/* Actions */}
          <div className="flex gap-3 justify-end pt-2">
            <Button variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={selectedIds.length === 0 || addMembersMutation.isPending}
              className="bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              {addMembersMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Add {selectedIds.length > 0 ? `(${selectedIds.length})` : ''}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
