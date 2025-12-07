'use client'

import * as React from 'react'
import { Mail, Send, Reply, FileText } from 'lucide-react'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { SettingsSection } from './SettingsSection'
import { useSystemSettingsForm, useUnsavedChangesWarning, validators } from './useSettingsForm'

// Field definitions for email settings
const emailFields = [
  { key: 'email_from_address', defaultValue: 'noreply@intime.io' },
  { key: 'email_from_name', defaultValue: 'InTime Platform' },
  { key: 'email_reply_to', defaultValue: 'support@intime.io' },
  { key: 'email_footer_text', defaultValue: '2024 InTime. All rights reserved.' },
  { key: 'bounce_handling_enabled', defaultValue: true, parse: (v: unknown) => Boolean(v) },
] as const

type EmailFormState = {
  email_from_address: string
  email_from_name: string
  email_reply_to: string
  email_footer_text: string
  bounce_handling_enabled: boolean
}

export function EmailSettingsPage() {
  const {
    formState,
    updateField,
    save,
    isLoading,
    isSaving,
    isDirty,
  } = useSystemSettingsForm<EmailFormState>('email', emailFields, {
    successMessage: 'Email settings saved successfully',
  })

  // Warn about unsaved changes
  useUnsavedChangesWarning(isDirty)

  // Validation state
  const [errors, setErrors] = React.useState<Record<string, string>>({})

  const validateAndSave = () => {
    const newErrors: Record<string, string> = {}

    if (!validators.email(formState.email_from_address)) {
      newErrors.email_from_address = 'Please enter a valid email address'
    }
    if (!validators.email(formState.email_reply_to)) {
      newErrors.email_reply_to = 'Please enter a valid email address'
    }
    if (!validators.required(formState.email_from_name)) {
      newErrors.email_from_name = 'From name is required'
    }

    setErrors(newErrors)

    if (Object.keys(newErrors).length === 0) {
      save()
    }
  }

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Email' },
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
            onClick={validateAndSave}
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

        {/* Sender Configuration */}
        <SettingsSection
          title="Sender Configuration"
          description="Configure the default sender information"
          icon={Send}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <Label htmlFor="fromAddress">From Address</Label>
              <Input
                id="fromAddress"
                type="email"
                value={formState.email_from_address}
                onChange={(e) => updateField('email_from_address', e.target.value)}
                placeholder="noreply@example.com"
                leftIcon={<Mail className="h-4 w-4" />}
                error={errors.email_from_address}
              />
              <p className="text-xs text-charcoal-500">
                The email address shown as the sender
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="fromName">From Name</Label>
              <Input
                id="fromName"
                value={formState.email_from_name}
                onChange={(e) => updateField('email_from_name', e.target.value)}
                placeholder="Company Name"
                error={errors.email_from_name}
              />
              <p className="text-xs text-charcoal-500">
                The name shown alongside the email address
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="replyTo">Reply-To Address</Label>
              <Input
                id="replyTo"
                type="email"
                value={formState.email_reply_to}
                onChange={(e) => updateField('email_reply_to', e.target.value)}
                placeholder="support@example.com"
                leftIcon={<Reply className="h-4 w-4" />}
                error={errors.email_reply_to}
              />
              <p className="text-xs text-charcoal-500">
                Where replies to automated emails should go
              </p>
            </div>
          </div>
        </SettingsSection>

        {/* Email Footer */}
        <SettingsSection
          title="Email Footer"
          description="Default footer text for all emails"
          icon={FileText}
        >
          <div className="space-y-2">
            <Label htmlFor="footer">Footer Text</Label>
            <Textarea
              id="footer"
              value={formState.email_footer_text}
              onChange={(e) => updateField('email_footer_text', e.target.value)}
              placeholder="Copyright notice and legal text..."
              className="min-h-[100px]"
            />
            <p className="text-xs text-charcoal-500">
              This text appears at the bottom of all automated emails
            </p>
          </div>
        </SettingsSection>

        {/* Email Handling */}
        <SettingsSection
          title="Email Handling"
          description="Configure email processing options"
          icon={Mail}
        >
          <div className="flex items-center justify-between p-4 bg-charcoal-50 rounded-lg">
            <div className="space-y-0.5">
              <Label>Bounce Handling</Label>
              <p className="text-sm text-charcoal-500">
                Automatically process bounced emails and update contact records
              </p>
            </div>
            <Switch
              checked={formState.bounce_handling_enabled}
              onCheckedChange={(checked) => updateField('bounce_handling_enabled', checked)}
            />
          </div>
        </SettingsSection>
      </div>
    </AdminPageContent>
  )
}
