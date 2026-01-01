'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Shield, Lock, Globe, AlertCircle, Clock, Activity } from 'lucide-react'
import type { FullUserData } from '@/types/admin'

interface UserAccessTabProps {
  user: FullUserData
}

/**
 * User Access Tab - Security zones, access levels
 */
export function UserAccessTab({ user }: UserAccessTabProps) {
  // Get access data from user or use defaults
  const access = user.access || {
    security_zones: [],
    access_levels: [],
  }

  // Login history from sections
  const loginHistory = user.sections?.loginHistory?.items || []

  return (
    <div className="space-y-6">
      {/* Security Settings */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Security Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-6">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user.two_factor_enabled ? 'bg-green-100' : 'bg-charcoal-100'
              }`}>
                <Shield className={`w-5 h-5 ${user.two_factor_enabled ? 'text-green-600' : 'text-charcoal-400'}`} />
              </div>
              <div>
                <p className="font-medium text-charcoal-900">Two-Factor Authentication</p>
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
                <p className="font-medium text-charcoal-900">Password Last Changed</p>
                <p className="text-sm text-charcoal-500">
                  {user.password_changed_at
                    ? new Date(user.password_changed_at).toLocaleDateString()
                    : 'Never changed'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                user.is_locked ? 'bg-red-100' : 'bg-green-100'
              }`}>
                <Lock className={`w-5 h-5 ${user.is_locked ? 'text-red-600' : 'text-green-600'}`} />
              </div>
              <div>
                <p className="font-medium text-charcoal-900">Account Lock</p>
                <p className="text-sm text-charcoal-500">
                  {user.is_locked ? 'Locked' : 'Unlocked'}
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Zones */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Security Zones
            </CardTitle>
            <Button variant="outline" size="sm">
              Edit Zones
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {access.security_zones.length === 0 ? (
            <div className="text-center py-8">
              <Globe className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No security zones assigned</p>
              <p className="text-sm text-charcoal-400 mt-1">
                Security zones control which resources this user can access
              </p>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {access.security_zones.map((zone, index) => (
                <span
                  key={index}
                  className="inline-flex items-center gap-1 px-3 py-1 bg-charcoal-100 text-charcoal-700 rounded-full text-sm"
                >
                  <Globe className="w-3.5 h-3.5" />
                  {zone}
                </span>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Access Levels */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
              Access Levels
            </CardTitle>
            <Button variant="outline" size="sm">
              Edit Access
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {access.access_levels.length === 0 ? (
            <div className="text-center py-8">
              <Lock className="w-10 h-10 mx-auto text-charcoal-300 mb-3" />
              <p className="text-charcoal-500">No access levels configured</p>
              <p className="text-sm text-charcoal-400 mt-1">
                Access levels define permission boundaries
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {access.access_levels.map((level, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 p-3 bg-charcoal-50 rounded-lg"
                >
                  <Shield className="w-4 h-4 text-charcoal-500" />
                  <span className="text-sm font-medium text-charcoal-700">{level}</span>
                </div>
              ))}
            </div>
          )}
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
                    <tr key={entry.id}>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${
                          entry.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                        }`}>
                          {entry.success ? (
                            <Shield className="w-3 h-3" />
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
    </div>
  )
}
