'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { BusinessHoursTab } from './org-tabs/BusinessHoursTab'

export function BusinessHoursSettingsPage() {
  const utils = trpc.useUtils()

  const { data: organization, isLoading } = trpc.settings.getOrganization.useQuery()

  const updateMutation = trpc.settings.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success('Business hours saved successfully')
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Business Hours' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="animate-pulse space-y-4">
          <div className="h-48 bg-charcoal-100 rounded-lg" />
          <div className="h-48 bg-charcoal-100 rounded-lg" />
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
      <BusinessHoursTab
        organization={organization}
        onSave={(data) => updateMutation.mutate(data)}
        isPending={updateMutation.isPending}
      />
    </AdminPageContent>
  )
}
