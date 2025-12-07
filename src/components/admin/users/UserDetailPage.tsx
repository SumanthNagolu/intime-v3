'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { DashboardSection } from '@/components/dashboard/DashboardShell'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import {
  Edit,
  Key,
  UserX,
  UserCheck,
  LogOut,
  Loader2,
  AlertTriangle,
  Shield,
  Clock,
  Activity,
  Mail,
} from 'lucide-react'
import Link from 'next/link'
import { toast } from 'sonner'

interface UserDetailPageProps {
  userId: string
}

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

type Role = {
  id: string
  name: string
  display_name: string
  code: string
  category: string
  color_code?: string
  description?: string
}

type Manager = {
  id: string
  full_name: string
  email: string
  avatar_url?: string
}

type Pod = {
  id: string
  name: string
  pod_type: string
  status: string
}

type PodMembership = {
  id: string
  pod_id: string
  role: string
  is_active: boolean
  joined_at?: string
  pod: Pod
}

type UserData = {
  id: string
  full_name: string
  first_name?: string
  last_name?: string
  email: string
  phone?: string
  avatar_url?: string
  status: string
  is_active: boolean
  role_id?: string
  role?: Role
  manager_id?: string
  manager?: Manager
  start_date?: string
  last_login_at?: string
  two_factor_enabled: boolean
  password_changed_at?: string
  created_at: string
  updated_at: string
  pod_memberships?: PodMembership[]
}

type AuditLog = {
  id: string
  action: string
  table_name: string
  record_id: string
  created_at: string
  old_values?: Record<string, unknown>
  new_values?: Record<string, unknown>
}

type LoginHistoryEntry = {
  id: string
  success: boolean
  ip_address?: string
  user_agent?: string
  failure_reason?: string
  created_at: string
}

export function UserDetailPage({ userId }: UserDetailPageProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [activeTab, setActiveTab] = useState<'profile' | 'activity' | 'security'>('profile')
  const [showStatusDialog, setShowStatusDialog] = useState<'activate' | 'suspend' | 'deactivate' | null>(null)
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)

  const userQuery = trpc.users.getById.useQuery({ id: userId })
  const activityQuery = trpc.users.getActivity.useQuery(
    { userId, limit: 50 },
    { enabled: activeTab === 'activity' }
  )
  const loginHistoryQuery = trpc.users.getLoginHistory.useQuery(
    { userId, limit: 50 },
    { enabled: activeTab === 'security' }
  )

  const updateStatusMutation = trpc.users.updateStatus.useMutation({
    onSuccess: () => {
      toast.success('User status updated')
      utils.users.getById.invalidate({ id: userId })
      utils.users.list.invalidate()
      setShowStatusDialog(null)
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

  const user = userQuery.data as UserData | undefined

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Users', href: '/employee/admin/users' },
    { label: user?.full_name ?? 'User Details' },
  ]

  const getInitials = (name?: string) => {
    return name?.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase() || '??'
  }

  const getActivePod = () => {
    return user?.pod_memberships?.find((pm) => pm.is_active)?.pod
  }

  if (userQuery.isLoading) {
    return (
      <AdminPageContent>
        <AdminPageHeader title="Loading..." breadcrumbs={breadcrumbs} />
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-8 h-8 animate-spin text-hublot-600" />
        </div>
      </AdminPageContent>
    )
  }

  if (userQuery.error || !user) {
    return (
      <AdminPageContent>
        <AdminPageHeader title="Error" breadcrumbs={breadcrumbs} />
        <div className="text-center py-12">
          <p className="text-red-600">User not found or failed to load.</p>
          <Button
            variant="outline"
            className="mt-4"
            onClick={() => router.push('/employee/admin/users')}
          >
            Back to Users
          </Button>
        </div>
      </AdminPageContent>
    )
  }

  const activePod = getActivePod()

  return (
    <AdminPageContent>
      <AdminPageHeader
        title={user.full_name}
        description={
          <div className="flex items-center gap-2 mt-1">
            <span className="text-charcoal-500">{user.email}</span>
            {user.role && (
              <>
                <span className="text-charcoal-300">•</span>
                <span
                  className="inline-flex px-2 py-0.5 rounded-full text-xs font-medium"
                  style={{
                    backgroundColor: `${user.role.color_code}20`,
                    color: user.role.color_code,
                  }}
                >
                  {user.role.display_name}
                </span>
              </>
            )}
            {activePod && (
              <>
                <span className="text-charcoal-300">•</span>
                <span className="text-charcoal-500">{activePod.name}</span>
              </>
            )}
            <span className="text-charcoal-300">•</span>
            <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${STATUS_COLORS[user.status]}`}>
              {STATUS_LABELS[user.status]}
            </span>
          </div>
        }
        breadcrumbs={breadcrumbs}
        actions={
          <div className="flex gap-2">
            <Link href={`/employee/admin/users/${userId}/edit`}>
              <Button variant="outline">
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            </Link>
          </div>
        }
      />
      {/* Status Banner for non-active users */}
      {user.status !== 'active' && (
        <div className={`rounded-lg p-4 mb-6 flex items-center gap-3 ${
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

      {/* Tabs */}
      <div className="border-b border-charcoal-100 mb-6">
        <div className="flex gap-6">
          {['profile', 'activity', 'security'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab as typeof activeTab)}
              className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors capitalize ${
                activeTab === tab
                  ? 'border-gold-600 text-gold-600'
                  : 'border-transparent text-charcoal-500 hover:text-charcoal-700'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <DashboardSection title="User Information">
            <div className="bg-white rounded-xl border border-charcoal-100 p-6">
              <div className="flex items-start gap-6">
                <div className="w-20 h-20 rounded-full bg-gold-100 flex items-center justify-center text-gold-700 font-semibold text-2xl">
                  {getInitials(user.full_name)}
                </div>
                <div className="flex-1 grid grid-cols-2 gap-6">
                  <div>
                    <p className="text-sm text-charcoal-500">Full Name</p>
                    <p className="font-medium">{user.full_name}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Email</p>
                    <p className="font-medium">{user.email}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Phone</p>
                    <p className="font-medium">{user.phone || <span className="text-charcoal-400">Not provided</span>}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Role</p>
                    <p className="font-medium">{user.role?.display_name || <span className="text-charcoal-400">No role</span>}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Pod</p>
                    <p className="font-medium">{activePod?.name || <span className="text-charcoal-400">No pod</span>}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Reports To</p>
                    <p className="font-medium">{user.manager?.full_name || <span className="text-charcoal-400">No manager</span>}</p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Start Date</p>
                    <p className="font-medium">
                      {user.start_date
                        ? new Date(user.start_date).toLocaleDateString()
                        : <span className="text-charcoal-400">Not set</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-charcoal-500">Last Login</p>
                    <p className="font-medium">
                      {user.last_login_at
                        ? new Date(user.last_login_at).toLocaleString()
                        : <span className="text-charcoal-400">Never</span>}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Quick Actions">
            <div className="bg-white rounded-xl border border-charcoal-100 p-6">
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
            </div>
          </DashboardSection>
        </div>
      )}

      {/* Activity Tab */}
      {activeTab === 'activity' && (
        <DashboardSection title="Recent Activity">
          <div className="bg-white rounded-xl border border-charcoal-100">
            {activityQuery.isLoading ? (
              <div className="p-8 flex justify-center">
                <Loader2 className="w-6 h-6 animate-spin text-hublot-600" />
              </div>
            ) : !activityQuery.data?.length ? (
              <div className="p-12 text-center">
                <Activity className="w-12 h-12 mx-auto text-charcoal-300 mb-3" />
                <p className="text-charcoal-500">No activity recorded</p>
              </div>
            ) : (
              <div className="divide-y divide-charcoal-100">
                {activityQuery.data.map((activity: AuditLog) => (
                  <div key={activity.id} className="p-4 flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-charcoal-100 flex items-center justify-center">
                      <Activity className="w-4 h-4 text-charcoal-500" />
                    </div>
                    <div className="flex-1">
                      <p className="font-medium text-charcoal-900">
                        {activity.action} on {activity.table_name}
                      </p>
                      <p className="text-sm text-charcoal-500">
                        {new Date(activity.created_at).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </DashboardSection>
      )}

      {/* Security Tab */}
      {activeTab === 'security' && (
        <div className="space-y-6">
          <DashboardSection title="Security Settings">
            <div className="bg-white rounded-xl border border-charcoal-100 p-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                    user.two_factor_enabled ? 'bg-green-100' : 'bg-charcoal-100'
                  }`}>
                    <Shield className={`w-5 h-5 ${user.two_factor_enabled ? 'text-green-600' : 'text-charcoal-400'}`} />
                  </div>
                  <div>
                    <p className="font-medium">Two-Factor Authentication</p>
                    <p className="text-sm text-charcoal-500">
                      {user.two_factor_enabled ? 'Enabled' : 'Not enabled'}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
                    <Clock className="w-5 h-5 text-charcoal-400" />
                  </div>
                  <div>
                    <p className="font-medium">Password Last Changed</p>
                    <p className="text-sm text-charcoal-500">
                      {user.password_changed_at
                        ? new Date(user.password_changed_at).toLocaleDateString()
                        : 'Never changed'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DashboardSection>

          <DashboardSection title="Login History">
            <div className="bg-white rounded-xl border border-charcoal-100">
              {loginHistoryQuery.isLoading ? (
                <div className="p-8 flex justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-hublot-600" />
                </div>
              ) : !loginHistoryQuery.data?.length ? (
                <div className="p-12 text-center">
                  <Clock className="w-12 h-12 mx-auto text-charcoal-300 mb-3" />
                  <p className="text-charcoal-500">No login history</p>
                </div>
              ) : (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-charcoal-100 bg-charcoal-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Status</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Date</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">IP Address</th>
                      <th className="px-6 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-charcoal-100">
                    {loginHistoryQuery.data.map((entry: LoginHistoryEntry) => (
                      <tr key={entry.id}>
                        <td className="px-6 py-3">
                          <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${
                            entry.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                          }`}>
                            {entry.success ? 'Success' : 'Failed'}
                          </span>
                        </td>
                        <td className="px-6 py-3 text-sm text-charcoal-600">
                          {new Date(entry.created_at).toLocaleString()}
                        </td>
                        <td className="px-6 py-3 text-sm text-charcoal-600">
                          {entry.ip_address || '—'}
                        </td>
                        <td className="px-6 py-3 text-sm text-charcoal-500">
                          {entry.failure_reason || (entry.success ? 'Successful login' : '—')}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </DashboardSection>
        </div>
      )}

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
              <Button
                variant="outline"
                onClick={() => setShowStatusDialog(null)}
              >
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
                    id: userId,
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
              <Button
                variant="outline"
                onClick={() => setShowResetPasswordDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-hublot-900 hover:bg-hublot-800 text-white"
                onClick={() => resetPasswordMutation.mutate({ id: userId })}
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
              <Button
                variant="outline"
                onClick={() => setShowLogoutDialog(false)}
              >
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => revokeSessionsMutation.mutate({ id: userId })}
                disabled={revokeSessionsMutation.isPending}
              >
                {revokeSessionsMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Force Logout
              </Button>
            </div>
          </div>
        </div>
      )}
    </AdminPageContent>
  )
}
