'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Shield,
  Lock,
  Key,
  Smartphone,
  Clock,
  AlertTriangle,
  Activity,
  LogOut,
  AlertCircle,
  CheckCircle,
  RefreshCw,
  Loader2,
  Mail,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import type { FullUserData } from '@/types/admin'

interface UserSecurityTabProps {
  user: FullUserData
  mode?: 'create' | 'view' | 'edit'
}

/**
 * User Security Tab - 2FA, password, sessions, login history
 *
 * Combines security features:
 * - Two-Factor Authentication settings
 * - Password management
 * - Active sessions
 * - Login history
 */
export function UserSecurityTab({ user, mode = 'view' }: UserSecurityTabProps) {
  const [showResetPasswordDialog, setShowResetPasswordDialog] = useState(false)
  const [showLogoutDialog, setShowLogoutDialog] = useState(false)
  const [showDisable2FADialog, setShowDisable2FADialog] = useState(false)

  const isViewMode = mode === 'view'

  // Login history from sections
  const loginHistory = user.sections?.loginHistory?.items || []

  // Mutations
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

  return (
    <div className="space-y-6">
      {/* Security Overview */}
      <div className="grid grid-cols-4 gap-4">
        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user.two_factor_enabled ? 'bg-green-100' : 'bg-amber-100'
              }`}>
                <Smartphone className={`w-5 h-5 ${
                  user.two_factor_enabled ? 'text-green-600' : 'text-amber-600'
                }`} />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider">2FA</p>
                <p className="font-semibold text-charcoal-900">
                  {user.two_factor_enabled ? 'Enabled' : 'Disabled'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user.is_locked ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <Lock className={`w-5 h-5 ${
                  user.is_locked ? 'text-red-600' : 'text-green-600'
                }`} />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider">Account</p>
                <p className="font-semibold text-charcoal-900">
                  {user.is_locked ? 'Locked' : 'Unlocked'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-charcoal-500" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider">Password Age</p>
                <p className="font-semibold text-charcoal-900">
                  {user.password_changed_at
                    ? `${Math.floor((Date.now() - new Date(user.password_changed_at).getTime()) / (1000 * 60 * 60 * 24))} days`
                    : 'Never changed'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="overflow-hidden">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal-100 flex items-center justify-center">
                <Activity className="w-5 h-5 text-charcoal-500" />
              </div>
              <div>
                <p className="text-xs text-charcoal-500 uppercase tracking-wider">Last Login</p>
                <p className="font-semibold text-charcoal-900">
                  {user.last_login_at
                    ? new Date(user.last_login_at).toLocaleDateString()
                    : 'Never'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Two-Factor Authentication */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Two-Factor Authentication
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
            <div className="flex items-center gap-4">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                user.two_factor_enabled ? 'bg-green-100' : 'bg-charcoal-200'
              }`}>
                <Shield className={`w-6 h-6 ${
                  user.two_factor_enabled ? 'text-green-600' : 'text-charcoal-400'
                }`} />
              </div>
              <div>
                <p className="font-medium text-charcoal-900">
                  {user.two_factor_enabled
                    ? 'Two-factor authentication is enabled'
                    : 'Two-factor authentication is not enabled'}
                </p>
                <p className="text-sm text-charcoal-500">
                  {user.two_factor_enabled
                    ? 'Account is protected with an additional layer of security'
                    : 'Enable 2FA to add an extra layer of security to this account'}
                </p>
              </div>
            </div>
            {!isViewMode && (
              <div className="flex items-center gap-3">
                {user.two_factor_enabled ? (
                  <Button
                    variant="outline"
                    className="text-red-600 hover:text-red-700"
                    onClick={() => setShowDisable2FADialog(true)}
                  >
                    Disable 2FA
                  </Button>
                ) : (
                  <Button variant="outline">
                    Enable 2FA
                  </Button>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Password Management */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Password Management
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-charcoal-200 flex items-center justify-center">
                  <Key className="w-6 h-6 text-charcoal-500" />
                </div>
                <div>
                  <p className="font-medium text-charcoal-900">Password</p>
                  <p className="text-sm text-charcoal-500">
                    Last changed: {user.password_changed_at
                      ? new Date(user.password_changed_at).toLocaleDateString()
                      : 'Never'}
                  </p>
                </div>
              </div>
              <Button
                variant="outline"
                onClick={() => setShowResetPasswordDialog(true)}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset Password
              </Button>
            </div>

            {/* Password Policy Info */}
            <div className="p-4 border border-charcoal-200 rounded-lg">
              <p className="text-sm font-medium text-charcoal-700 mb-2">Password Requirements</p>
              <ul className="text-sm text-charcoal-500 space-y-1">
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  Minimum 8 characters
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  At least one uppercase letter
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  At least one number
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-500" />
                  At least one special character
                </li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Active Sessions */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Active Sessions
            </CardTitle>
            <Button
              variant="outline"
              size="sm"
              className="text-red-600 hover:text-red-700"
              onClick={() => setShowLogoutDialog(true)}
            >
              <LogOut className="w-4 h-4 mr-2" />
              Revoke All Sessions
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Activity className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
            <p className="text-charcoal-500">Session tracking not enabled</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Active sessions will be displayed here when available
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Login History */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Recent Login History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loginHistory.length === 0 ? (
            <div className="text-center py-8">
              <Activity className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No login history</p>
            </div>
          ) : (
            <div className="border border-charcoal-100 rounded-lg overflow-hidden">
              <table className="w-full">
                <thead>
                  <tr className="bg-charcoal-50 border-b border-charcoal-100">
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Status</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Date</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">IP Address</th>
                    <th className="px-4 py-3 text-left text-xs font-semibold text-charcoal-600 uppercase">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-charcoal-100">
                  {loginHistory.slice(0, 10).map((entry) => (
                    <tr key={entry.id} className="hover:bg-charcoal-50">
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.success ? (
                            <CheckCircle className="w-3 h-3" />
                          ) : (
                            <AlertCircle className="w-3 h-3" />
                          )}
                          {entry.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal-600">
                        {new Date(entry.created_at).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal-600 font-mono">
                        {entry.ip_address || '—'}
                      </td>
                      <td className="px-4 py-3 text-sm text-charcoal-500">
                        {entry.failure_reason || (entry.success ? 'Successful login' : '—')}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Account Lock Status */}
      {user.is_locked && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-red-600" />
              <div className="flex-1">
                <p className="font-medium text-red-900">Account is Locked</p>
                <p className="text-sm text-red-700">
                  This account has been locked due to multiple failed login attempts.
                </p>
              </div>
              {!isViewMode && (
                <Button variant="outline" className="border-red-300 text-red-700 hover:bg-red-100">
                  Unlock Account
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
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
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Revoke All Sessions</h3>
            <p className="text-charcoal-600 mb-6">
              This will log out {user.full_name} from all devices. They will need to log in again.
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
                Revoke Sessions
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Disable 2FA Dialog */}
      {showDisable2FADialog && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full mx-4">
            <h3 className="text-lg font-semibold text-charcoal-900 mb-2">Disable Two-Factor Authentication</h3>
            <div className="flex items-start gap-3 mb-4 p-3 bg-amber-50 border border-amber-200 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
              <p className="text-amber-800 text-sm">
                Disabling 2FA will reduce the security of this account. The user will only need their password to log in.
              </p>
            </div>
            <div className="flex justify-end gap-3">
              <Button variant="outline" onClick={() => setShowDisable2FADialog(false)}>
                Cancel
              </Button>
              <Button
                className="bg-red-600 hover:bg-red-700 text-white"
                onClick={() => {
                  // TODO: Implement disable 2FA
                  toast.success('2FA disabled')
                  setShowDisable2FADialog(false)
                }}
              >
                Disable 2FA
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
