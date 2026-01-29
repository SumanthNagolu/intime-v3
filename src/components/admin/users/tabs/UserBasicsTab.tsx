'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Edit,
  Key,
  UserX,
  UserCheck,
  LogOut,
  Loader2,
  Mail,
  AlertTriangle,
} from 'lucide-react'
import { toast } from 'sonner'
import type { FullUserData } from '@/types/admin'
import { useUserWorkspace } from '../UserWorkspaceProvider'

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

interface UserBasicsTabProps {
  user: FullUserData
  mode?: 'view' | 'edit'
}

/**
 * User Basics Tab - Name, Account, Status, Contact sections
 */
export function UserBasicsTab({ user, mode = 'view' }: UserBasicsTabProps) {
  const router = useRouter()
  const utils = trpc.useUtils()
  const { isEditing, setIsEditing, refreshData, registerSaveHandler, unregisterSaveHandler } = useUserWorkspace()

  // Form state for edit mode
  const [formData, setFormData] = useState({
    first_name: user.first_name || '',
    last_name: user.last_name || '',
    phone: user.phone || '',
  })

  // Reset form data when user changes or mode changes
  useEffect(() => {
    setFormData({
      first_name: user.first_name || '',
      last_name: user.last_name || '',
      phone: user.phone || '',
    })
  }, [user, isEditing])

  const [showStatusDialog, setShowStatusDialog] = useState<'activate' | 'suspend' | 'deactivate' | null>(null)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  // Update user mutation
  const updateUserMutation = trpc.users.update.useMutation({
    onSuccess: () => {
      toast.success('User updated successfully')
      utils.users.getFullUser.invalidate({ id: user.id })
      refreshData()
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update user')
      throw error // Re-throw to signal failure to parent
    },
  })

  // Use refs to avoid stale closure in save handler
  const formDataRef = useRef(formData)
  const userRef = useRef(user)
  formDataRef.current = formData
  userRef.current = user

  // Handle save - returns a promise for the parent to await
  const handleSave = useCallback(async () => {
    const currentFormData = formDataRef.current
    const currentUser = userRef.current

    // Only save if there are changes
    const hasChanges =
      currentFormData.first_name !== (currentUser.first_name || '') ||
      currentFormData.last_name !== (currentUser.last_name || '') ||
      currentFormData.phone !== (currentUser.phone || '')

    if (!hasChanges) return

    await updateUserMutation.mutateAsync({
      id: currentUser.id,
      firstName: currentFormData.first_name,
      lastName: currentFormData.last_name,
      phone: currentFormData.phone || null,
    })
  }, [updateUserMutation])

  // Register save handler when in edit mode
  useEffect(() => {
    if (isEditing) {
      registerSaveHandler(handleSave)
      return () => {
        unregisterSaveHandler(handleSave)
      }
    }
  }, [isEditing, handleSave, registerSaveHandler, unregisterSaveHandler])

  const updateStatusMutation = trpc.users.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('User status updated')
      utils.users.getFullUser.invalidate({ id: user.id })
      setShowStatusDialog(null)
      router.refresh()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to update status')
    },
  })

  const resetPasswordMutation = trpc.users.resetPassword.useMutation({
    onSuccess: (data) => {
      toast.success(`Password reset email sent to ${data.email}`)
      setShowResetPasswordDialog(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to send reset email')
    },
  })

  const revokeSessionsMutation = trpc.users.revokeAllSessions.useMutation({
    onSuccess: () => {
      toast.success('All sessions revoked')
      setShowLogoutDialog(false)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to revoke sessions')
    },
  })

  const getInitials = (name?: string) => {
    return name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  }

  const getActivePod = () => {
    return user.pod_memberships?.find((pm) => pm.is_active)?.pod
  }

  const activePod = getActivePod()

  return (
    <div className="space-y-6">
      {/* Status Banner for non-active users */}
      {user.status !== 'active' && (
        <div className={`rounded-lg p-4 flex items-center gap-3 ${
          user.status === 'suspended' ? 'bg-orange-50 border border-orange-200' :
          user.status === 'pending' ? 'bg-amber-50 border border-amber-200' :
          'bg-charcoal-50 border border-charcoal-200'
        }`}>
          <AlertTriangle className={`w-5 h-5 ${
            user.status === 'suspended' ? 'text-orange-600' :
            user.status === 'pending' ? 'text-amber-600' :
            'text-charcoal-600'
          }`} />
          <p className={`font-medium ${
            user.status === 'suspended' ? 'text-orange-800' :
            user.status === 'pending' ? 'text-amber-800' :
            'text-charcoal-800'
          }`}>
            {user.status === 'suspended' && 'This user is currently suspended.'}
            {user.status === 'pending' && 'This user has not yet accepted their invitation.'}
            {user.status === 'deactivated' && 'This user account has been deactivated.'}
          </p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-6">
        {/* Name Section */}
        <Card>
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
                Name
              </CardTitle>
              {!isEditing && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditing(true)}>
                  <Edit className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-4">
              <div className="w-16 h-16 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-semibold text-xl">
                {getInitials(isEditing ? `${formData.first_name} ${formData.last_name}` : user.full_name)}
              </div>
              <div className="flex-1 space-y-3">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">First Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.first_name}
                        onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                        placeholder="Enter first name"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-charcoal-900">{user.first_name || '—'}</p>
                    )}
                  </div>
                  <div>
                    <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Last Name</Label>
                    {isEditing ? (
                      <Input
                        value={formData.last_name}
                        onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                        placeholder="Enter last name"
                        className="mt-1"
                      />
                    ) : (
                      <p className="font-medium text-charcoal-900">{user.last_name || '—'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Display Name</Label>
                  <p className="font-medium text-charcoal-900">
                    {isEditing
                      ? `${formData.first_name} ${formData.last_name}`.trim() || '—'
                      : user.full_name}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Account Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Account
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Username</p>
                <p className="font-medium text-charcoal-900">{user.email}</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Account Status</p>
                <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}>
                  {STATUS_LABELS[user.status]}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Last Login</p>
                  <p className="font-medium text-charcoal-900">
                    {user.last_login_at
                      ? new Date(user.last_login_at).toLocaleString()
                      : 'Never'}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">2FA Enabled</p>
                  <p className="font-medium text-charcoal-900">
                    {user.two_factor_enabled ? 'Yes' : 'No'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Organization Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Organization
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Role</p>
                <p className="font-medium text-charcoal-900">
                  {user.role?.display_name || <span className="text-charcoal-400">No role assigned</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Group</p>
                <p className="font-medium text-charcoal-900">
                  {activePod?.name || <span className="text-charcoal-400">No group assigned</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Reports To</p>
                <p className="font-medium text-charcoal-900">
                  {user.manager?.full_name || <span className="text-charcoal-400">No manager assigned</span>}
                </p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Start Date</p>
                <p className="font-medium text-charcoal-900">
                  {user.start_date
                    ? new Date(user.start_date).toLocaleDateString()
                    : <span className="text-charcoal-400">Not set</span>}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contact Section */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Contact
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div>
                <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Email</Label>
                <p className="font-medium text-charcoal-900">{user.email}</p>
              </div>
              <div>
                <Label className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">Phone</Label>
                {isEditing ? (
                  <Input
                    value={formData.phone}
                    onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                    placeholder="Enter phone number"
                    className="mt-1"
                  />
                ) : (
                  <p className="font-medium text-charcoal-900">
                    {user.phone || <span className="text-charcoal-400">Not provided</span>}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Quick Actions
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              onClick={() => setShowResetPasswordDialog(true)}
            >
              <Key className="w-4 h-4 mr-2" />
              Reset Password
            </Button>
            {user.status === 'active' && (
              <Button
                variant="outline"
                className="text-orange-600 hover:text-orange-700 hover:border-orange-300"
                onClick={() => setShowStatusDialog('suspend')}
              >
                <UserX className="w-4 h-4 mr-2" />
                Suspend User
              </Button>
            )}
            {(user.status === 'suspended' || user.status === 'deactivated') && (
              <Button
                variant="outline"
                className="text-green-600 hover:text-green-700 hover:border-green-300"
                onClick={() => setShowStatusDialog('activate')}
              >
                <UserCheck className="w-4 h-4 mr-2" />
                Activate User
              </Button>
            )}
            {user.status !== 'deactivated' && (
              <Button
                variant="outline"
                className="text-red-600 hover:text-red-700 hover:border-red-300"
                onClick={() => setShowStatusDialog('deactivate')}
              >
                <UserX className="w-4 h-4 mr-2" />
                Deactivate User
              </Button>
            )}
            <Button
              variant="outline"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Force Logout
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Status Change Dialog */}
      {showStatusDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
              {showStatusDialog === 'activate' && 'Activate User'}
              {showStatusDialog === 'suspend' && 'Suspend User'}
              {showStatusDialog === 'deactivate' && 'Deactivate User'}
            </h3>
            <p className="text-charcoal-600 mb-6">
              {showStatusDialog === 'activate' && `Are you sure you want to activate ${user.full_name}? They will be able to log in again.`}
              {showStatusDialog === 'suspend' && `Are you sure you want to suspend ${user.full_name}? They will be logged out and unable to access the system.`}
              {showStatusDialog === 'deactivate' && `Are you sure you want to deactivate ${user.full_name}? This is a permanent action.`}
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowStatusDialog(null)}>
                Cancel
              </Button>
              <Button
                className={
                  showStatusDialog === 'activate'
                    ? 'bg-green-600 hover:bg-green-700 text-white'
                    : showStatusDialog === 'deactivate'
                    ? 'bg-red-600 hover:bg-red-700 text-white'
                    : 'bg-orange-600 hover:bg-orange-700 text-white'
                }
                onClick={() => {
                  const statusMap: Record<string, 'active' | 'suspended' | 'deactivated'> = {
                    activate: 'active',
                    suspend: 'suspended',
                    deactivate: 'deactivated',
                  }
                  updateStatusMutation.mutate({
                    id: user.id,
                    status: statusMap[showStatusDialog!],
                  })
                }}
                disabled={updateStatusMutation.isPending}
              >
                {updateStatusMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                {showStatusDialog === 'activate' && 'Activate'}
                {showStatusDialog === 'suspend' && 'Suspend'}
                {showStatusDialog === 'deactivate' && 'Deactivate'}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Reset Password Dialog */}
      {showResetPasswordDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Reset Password</h3>
            <div className="flex items-center gap-3 mb-4 p-3 bg-charcoal-50 rounded-lg">
              <Mail className="w-5 h-5 text-charcoal-500" />
              <p className="text-charcoal-600">
                A password reset link will be sent to <strong>{user.email}</strong>
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowResetPasswordDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-hublot-900 hover:bg-hublot-800 text-white"
                onClick={() => resetPasswordMutation.mutate({ id: user.id })}
                disabled={resetPasswordMutation.isPending}
              >
                {resetPasswordMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Send Reset Link
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Force Logout Dialog */}
      {showLogoutDialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Force Logout</h3>
            <p className="text-charcoal-600 mb-6">
              Are you sure you want to log out {user.full_name} from all devices? They will need to log in again.
            </p>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowLogoutDialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => revokeSessionsMutation.mutate({ id: user.id })}
                disabled={revokeSessionsMutation.isPending}
              >
                {revokeSessionsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Force Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
