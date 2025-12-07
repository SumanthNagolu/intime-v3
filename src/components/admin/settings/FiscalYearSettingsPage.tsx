'use client'

import * as React from 'react'
import { toast } from 'sonner'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { FiscalYearTab } from './org-tabs/FiscalYearTab'

export function FiscalYearSettingsPage() {
  const utils = trpc.useUtils()

  const { data: organization, isLoading } = trpc.settings.getOrganization.useQuery()

  const updateMutation = trpc.settings.updateOrganization.useMutation({
    onSuccess: () => {
      toast.success('Fiscal year settings saved successfully')
      utils.settings.getOrganization.invalidate()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to save settings')
    },
  })

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Fiscal Year' },
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
      <FiscalYearTab
        organization={organization}
        onSave={(data) => updateMutation.mutate(data)}
        isPending={updateMutation.isPending}
      />
    </AdminPageContent>
  )
}
