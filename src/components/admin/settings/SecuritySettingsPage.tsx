'use client'

import * as React from 'react'
import { Key, Shield, Clock } from 'lucide-react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { SettingsSection } from './SettingsSection'

export function SecuritySettingsPage() {
  const utils = trpc.useUtils()

  // Fetch system settings
  const { data: systemSettings, isLoading } = trpc.settings.getSystemSettings.useQuery({ category: 'security' })

  // Password policy state
  const [passwordMinLength, setPasswordMinLength] = React.useState('12')
  const [requireUppercase, setRequireUppercase] = React.useState(true)
  const [requireLowercase, setRequireLowercase] = React.useState(true)
  const [requireNumber, setRequireNumber] = React.useState(true)
  const [requireSpecial, setRequireSpecial] = React.useState(true)
  const [passwordHistory, setPasswordHistory] = React.useState('5')
  const [passwordExpiry, setPasswordExpiry] = React.useState('90')

  // Session state
  const [sessionTimeout, setSessionTimeout] = React.useState('30')
  const [maxConcurrentSessions, setMaxConcurrentSessions] = React.useState('3')
  const [rememberMeEnabled, setRememberMeEnabled] = React.useState(true)

  // Login security state
  const [failedLoginLockout, setFailedLoginLockout] = React.useState('5')
  const [lockoutDuration, setLockoutDuration] = React.useState('15')
  const [twoFactorRequirement, setTwoFactorRequirement] = React.useState('optional')

  // Update form when data loads
  React.useEffect(() => {
    if (systemSettings) {
      const settingsMap = Object.fromEntries(
        systemSettings.map(s => {
          try {
            return [s.key, JSON.parse(s.value as string)]
          } catch {
            return [s.key, s.value]
          }
        })
      )

      if (settingsMap.password_min_length) setPasswordMinLength(String(settingsMap.password_min_length))
      if (typeof settingsMap.password_require_uppercase === 'boolean') setRequireUppercase(settingsMap.password_require_uppercase)
      if (typeof settingsMap.password_require_lowercase === 'boolean') setRequireLowercase(settingsMap.password_require_lowercase)
      if (typeof settingsMap.password_require_number === 'boolean') setRequireNumber(settingsMap.password_require_number)
      if (typeof settingsMap.password_require_special === 'boolean') setRequireSpecial(settingsMap.password_require_special)
      if (settingsMap.password_history_count) setPasswordHistory(String(settingsMap.password_history_count))
      if (settingsMap.password_expiry_days) setPasswordExpiry(String(settingsMap.password_expiry_days))
      if (settingsMap.session_timeout_minutes) setSessionTimeout(String(settingsMap.session_timeout_minutes))
      if (settingsMap.max_concurrent_sessions) setMaxConcurrentSessions(String(settingsMap.max_concurrent_sessions))
      if (typeof settingsMap.remember_me_enabled === 'boolean') setRememberMeEnabled(settingsMap.remember_me_enabled)
      if (settingsMap.failed_login_lockout) setFailedLoginLockout(String(settingsMap.failed_login_lockout))
      if (settingsMap.lockout_duration_minutes) setLockoutDuration(String(settingsMap.lockout_duration_minutes))
      if (settingsMap.two_factor_requirement) setTwoFactorRequirement(settingsMap.two_factor_requirement)
    }
  }, [systemSettings])

  // Mutation
  const updateSettings = trpc.settings.bulkUpdateSystemSettings.useMutation({
    onSuccess: () => {
      utils.settings.getSystemSettings.invalidate()
      toast.success('Security settings saved successfully')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const handleSave = () => {
    updateSettings.mutate({
      settings: [
        { key: 'password_min_length', value: parseInt(passwordMinLength) || 12 },
        { key: 'password_require_uppercase', value: requireUppercase },
        { key: 'password_require_lowercase', value: requireLowercase },
        { key: 'password_require_number', value: requireNumber },
        { key: 'password_require_special', value: requireSpecial },
        { key: 'password_history_count', value: parseInt(passwordHistory) || 5 },
        { key: 'password_expiry_days', value: parseInt(passwordExpiry) || 90 },
        { key: 'session_timeout_minutes', value: parseInt(sessionTimeout) || 30 },
        { key: 'max_concurrent_sessions', value: parseInt(maxConcurrentSessions) || 3 },
        { key: 'remember_me_enabled', value: rememberMeEnabled },
        { key: 'failed_login_lockout', value: parseInt(failedLoginLockout) || 5 },
        { key: 'lockout_duration_minutes', value: parseInt(lockoutDuration) || 15 },
        { key: 'two_factor_requirement', value: twoFactorRequirement },
      ],
    })
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Security' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="animate-pulse space-y-6">
          <div className="h-64 bg-charcoal-100 rounded-lg" />
          <div className="h-48 bg-charcoal-100 rounded-lg" />
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
        actions={
          <Button
            onClick={handleSave}
            loading={updateSettings.isPending}
            disabled={updateSettings.isPending}
          >
            Save Changes
          </Button>
        }
      />
      <div className="space-y-8">
        {/* Password Policy */}
        <SettingsSection
          title="Password Policy"
          description="Configure password requirements"
          icon={Key}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <Label htmlFor="minLength">Minimum Length</Label>
                <Input
                  id="minLength"
                  type="number"
                  value={passwordMinLength}
                  onChange={(e) => setPasswordMinLength(e.target.value)}
                  min="8"
                  max="128"
                />
                <p className="text-xs text-charcoal-500">8-128 characters</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordHistory">Password History</Label>
                <Input
                  id="passwordHistory"
                  type="number"
                  value={passwordHistory}
                  onChange={(e) => setPasswordHistory(e.target.value)}
                  min="0"
                  max="24"
                />
                <p className="text-xs text-charcoal-500">Previous passwords to remember</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Password Expiry (days)</Label>
                <Input
                  id="passwordExpiry"
                  type="number"
                  value={passwordExpiry}
                  onChange={(e) => setPasswordExpiry(e.target.value)}
                  min="0"
                  max="365"
                />
                <p className="text-xs text-charcoal-500">0 = never expires</p>
              </div>
            </div>

            <div className="p-4 bg-charcoal-50 rounded-lg space-y-4">
              <Label className="text-sm font-medium">Password Requirements</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-600">Uppercase letter (A-Z)</span>
                  <Switch checked={requireUppercase} onCheckedChange={setRequireUppercase} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-600">Lowercase letter (a-z)</span>
                  <Switch checked={requireLowercase} onCheckedChange={setRequireLowercase} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-600">Number (0-9)</span>
                  <Switch checked={requireNumber} onCheckedChange={setRequireNumber} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-charcoal-600">Special character (!@#$%^&*)</span>
                  <Switch checked={requireSpecial} onCheckedChange={setRequireSpecial} />
                </div>
              </div>
            </div>
          </div>
        </SettingsSection>

        {/* Session Management */}
        <SettingsSection
          title="Session Management"
          description="Configure session behavior"
          icon={Clock}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Session Timeout (minutes)</Label>
                <Input
                  id="sessionTimeout"
                  type="number"
                  value={sessionTimeout}
                  onChange={(e) => setSessionTimeout(e.target.value)}
                  min="5"
                  max="480"
                />
                <p className="text-xs text-charcoal-500">5-480 minutes of inactivity</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="maxSessions">Max Concurrent Sessions</Label>
                <Input
                  id="maxSessions"
                  type="number"
                  value={maxConcurrentSessions}
                  onChange={(e) => setMaxConcurrentSessions(e.target.value)}
                  min="1"
                  max="10"
                />
                <p className="text-xs text-charcoal-500">Per user account</p>
              </div>
            </div>

            <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
              <div className="space-y-0.5">
                <Label>Remember Me Option</Label>
                <p className="text-sm text-charcoal-500">
                  Allow users to extend session to 30 days
                </p>
              </div>
              <Switch
                checked={rememberMeEnabled}
                onCheckedChange={setRememberMeEnabled}
              />
            </div>
          </div>
        </SettingsSection>

        {/* Login Security */}
        <SettingsSection
          title="Login Security"
          description="Configure login protection"
          icon={Shield}
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="failedAttempts">Failed Login Attempts</Label>
                <Input
                  id="failedAttempts"
                  type="number"
                  value={failedLoginLockout}
                  onChange={(e) => setFailedLoginLockout(e.target.value)}
                  min="3"
                  max="10"
                />
                <p className="text-xs text-charcoal-500">Before account lockout</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="lockoutDuration">Lockout Duration (minutes)</Label>
                <Input
                  id="lockoutDuration"
                  type="number"
                  value={lockoutDuration}
                  onChange={(e) => setLockoutDuration(e.target.value)}
                  min="5"
                  max="60"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="twoFactor">Two-Factor Authentication</Label>
              <Select value={twoFactorRequirement} onValueChange={setTwoFactorRequirement}>
                <SelectTrigger id="twoFactor">
                  <SelectValue placeholder="Select requirement" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="disabled">Disabled</SelectItem>
                  <SelectItem value="optional">Optional (user choice)</SelectItem>
                  <SelectItem value="required">Required for all users</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </SettingsSection>
      </div>
    </AdminPageContent>
  )
}
