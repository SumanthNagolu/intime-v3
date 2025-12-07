'use client'

import * as React from 'react'
import { Plug, Gauge, Code } from 'lucide-react'
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
import { useSystemSettingsForm, useUnsavedChangesWarning } from './useSettingsForm'

// Field definitions for API settings
const apiFields = [
  { key: 'api_enabled', defaultValue: true, parse: (v: unknown) => Boolean(v) },
  { key: 'api_rate_limit_requests', defaultValue: '1000', parse: (v: unknown) => String(v) },
  { key: 'api_rate_limit_window_minutes', defaultValue: '60', parse: (v: unknown) => String(v) },
  { key: 'api_version', defaultValue: 'v1' },
] as const

type ApiFormState = {
  api_enabled: boolean
  api_rate_limit_requests: string
  api_rate_limit_window_minutes: string
  api_version: string
}

export function ApiSettingsPage() {
  const {
    formState,
    updateField,
    save,
    isLoading,
    isSaving,
    isDirty,
  } = useSystemSettingsForm<ApiFormState>('api', apiFields, {
    successMessage: 'API settings saved successfully',
  })

  // Warn about unsaved changes
  useUnsavedChangesWarning(isDirty)

  const handleSave = () => {
    // Convert string values to numbers before saving
    save()
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'API' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="animate-pulse space-y-6">
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
            loading={isSaving}
            disabled={isSaving}
          >
            Save Changes
          </Button>
        }
      />
      <div className="space-y-8">
        {/* Unsaved changes indicator */}
        {isDirty && (
          <div className="bg-gold-50 border border-gold-200 rounded-lg p-3">
            <p className="text-sm text-gold-800">
              You have unsaved changes.
            </p>
          </div>
        )}

        {/* API Access */}
        <SettingsSection
          title="API Access"
          description="Enable or disable API access"
          icon={Plug}
        >
          <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
            <div className="space-y-0.5">
              <Label>Enable API Access</Label>
              <p className="text-sm text-charcoal-500">
                Allow external applications to connect via API
              </p>
            </div>
            <Switch
              checked={formState.api_enabled}
              onCheckedChange={(checked) => updateField('api_enabled', checked)}
            />
          </div>

          {!formState.api_enabled && (
            <div className="mt-4 p-4 bg-error-50 border border-error-200 rounded-lg">
              <p className="text-sm text-error-700">
                <strong>Warning:</strong> Disabling API access will prevent all external integrations and applications from functioning.
              </p>
            </div>
          )}
        </SettingsSection>

        {/* Rate Limiting */}
        <SettingsSection
          title="Rate Limiting"
          description="Configure API rate limits"
          icon={Gauge}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="rateLimit">Requests per Window</Label>
              <Input
                id="rateLimit"
                type="number"
                value={formState.api_rate_limit_requests}
                onChange={(e) => updateField('api_rate_limit_requests', e.target.value)}
                min="100"
                max="10000"
                disabled={!formState.api_enabled}
              />
              <p className="text-xs text-charcoal-500">
                Maximum API requests allowed (100-10,000)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="rateLimitWindow">Rate Limit Window (minutes)</Label>
              <Select
                value={formState.api_rate_limit_window_minutes}
                onValueChange={(value) => updateField('api_rate_limit_window_minutes', value)}
                disabled={!formState.api_enabled}
              >
                <SelectTrigger id="rateLimitWindow">
                  <SelectValue placeholder="Select window" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="15">15 minutes</SelectItem>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">60 minutes (1 hour)</SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-charcoal-500">
                Time window for rate limit calculation
              </p>
            </div>
          </div>

          <div className="mt-4 p-4 bg-charcoal-50 rounded-lg">
            <p className="text-sm text-charcoal-700">
              <strong>Current Limit:</strong> {formState.api_rate_limit_requests} requests per {formState.api_rate_limit_window_minutes} minute{parseInt(formState.api_rate_limit_window_minutes) > 1 ? 's' : ''}
            </p>
          </div>
        </SettingsSection>

        {/* API Version */}
        <SettingsSection
          title="API Version"
          description="Manage API versioning"
          icon={Code}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="apiVersion">Current API Version</Label>
              <Select
                value={formState.api_version}
                onValueChange={(value) => updateField('api_version', value)}
                disabled={!formState.api_enabled}
              >
                <SelectTrigger id="apiVersion">
                  <SelectValue placeholder="Select version" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="v1">v1 (Current)</SelectItem>
                  <SelectItem value="v2" disabled>v2 (Coming Soon)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 p-4 bg-charcoal-50 rounded-lg space-y-2">
            <p className="text-sm font-medium text-charcoal-900">API Documentation</p>
            <p className="text-sm text-charcoal-600">
              View the complete API documentation at <code className="text-xs bg-charcoal-200 px-1 py-0.5 rounded">/api/docs</code>
            </p>
          </div>
        </SettingsSection>
      </div>
    </AdminPageContent>
  )
}
