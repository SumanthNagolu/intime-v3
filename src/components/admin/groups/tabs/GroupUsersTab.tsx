'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  UserPlus,
  UserMinus,
  Crown,
  Loader2,
  Users,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'
import type { FullGroupData } from '@/types/admin'
import { AddMembersDialog } from '@/components/admin/pods/AddMembersDialog'

interface GroupUsersTabProps {
  group: FullGroupData
  onMembersChange?: () => void
}

/**
 * Group Users Tab - Members list with Add/Remove functionality
 */
export function GroupUsersTab({ group, onMembersChange }: GroupUsersTabProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [showAddMembers, setShowAddMembers] = useState(false)
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null)

  const removeMemberMutation = trpc.pods.removeMembers.useMutation({
    onSuccess: () => {
      toast.success('Member removed')
      utils.pods.getFullPod.invalidate({ id: group.id })
      setMemberToRemove(null)
      onMembersChange?.()
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to remove member')
    },
  })

  const getInitials = (name?: string) => {
    return name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  }

  const activeMembers = group.members?.filter((m) => m.is_active) ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Members ({activeMembers.length})
            </CardTitle>
            {group.status === 'active' && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddMembers(true)}
              >
                <UserPlus className="w-4 h-4 mr-2" />
                Add Members
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {/* Manager */}
          {group.manager && (
            <div className="mb-4 pb-4 border-b border-charcoal-100">
              <Link
                href={`/employee/admin/users/${group.manager.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-gold-50/50 hover:bg-gold-50 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-medium">
                    {getInitials(group.manager.full_name)}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-charcoal-900 group-hover:text-gold-600 transition-colors">
                        {group.manager.full_name}
                      </span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-gold-100 text-gold-800 rounded-full text-xs font-medium">
                        <Crown className="w-3 h-3" />
                        Manager
                      </span>
                    </div>
                    <span className="text-sm text-charcoal-500">{group.manager.email}</span>
                  </div>
                </div>
              </Link>
            </div>
          )}

          {/* Members List */}
          {activeMembers.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <Users className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No members</h3>
              <p className="text-charcoal-500 mb-4">
                This group doesn't have any members yet.
              </p>
              {group.status === 'active' && (
                <Button
                  variant="outline"
                  onClick={() => setShowAddMembers(true)}
                >
                  <UserPlus className="w-4 h-4 mr-2" />
                  Add Members
                </Button>
              )}
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {activeMembers.map((member) => (
                <Link
                  key={member.id}
                  href={`/employee/admin/users/${member.user.id}`}
                  className="flex items-center justify-between p-3 hover:bg-charcoal-50 rounded-lg transition-colors group"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center text-charcoal-700 font-medium">
                      {getInitials(member.user.full_name)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-charcoal-900 group-hover:text-gold-600 transition-colors">
                          {member.user.full_name}
                        </span>
                        <span className="inline-flex px-2 py-0.5 bg-charcoal-100 text-charcoal-600 rounded-full text-xs font-medium">
                          {member.role === 'senior' ? 'Senior' : 'Junior'}
                        </span>
                      </div>
                      <span className="text-sm text-charcoal-500">
                        {member.user.email}
                        {member.joined_at && ` • joined ${new Date(member.joined_at).toLocaleDateString()}`}
                      </span>
                    </div>
                  </div>
                  {group.status === 'active' && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-charcoal-400 hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        setMemberToRemove(member.user.id)
                      }}
                    >
                      <UserMinus className="w-4 h-4" />
                    </Button>
                  )}
                </Link>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add Members Dialog */}
      <AddMembersDialog
        open={showAddMembers}
        onOpenChange={setShowAddMembers}
        podId={group.id}
        existingMemberIds={activeMembers.map((m) => m.user.id)}
      />

      {/* Remove Member Confirmation Dialog */}
      {memberToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Remove Member</h3>
            <p className="text-charcoal-600 mb-6">
              Are you sure you want to remove this member from the group? They can be added back later.
            </p>
            <div className="flex justify-end gap-3">
              <Button
                variant="outline"
                onClick={() => setMemberToRemove(null)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  if (memberToRemove) {
                    removeMemberMutation.mutate({
                      podId: group.id,
                      userIds: [memberToRemove],
                    })
                  }
                }}
                disabled={removeMemberMutation.isPending}
              >
                {removeMemberMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Remove
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
