'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { AdminPageContent, AdminPageHeader } from '@/components/admin'
import { OrganizationAddressesSection } from './OrganizationAddressesSection'
import { Skeleton } from '@/components/ui/skeleton'

export function AddressesSettingsPage() {
  const { data: organization, isLoading } = trpc.settings.getOrganization.useQuery()

  const breadcrumbs = [
    { label: 'Admin', href: '/employee/admin' },
    { label: 'Settings', href: '/employee/admin/settings' },
    { label: 'Addresses' },
  ]

  if (isLoading) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="space-y-6">
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </AdminPageContent>
    )
  }

  if (!organization?.id) {
    return (
      <AdminPageContent insideTabLayout>
        <AdminPageHeader insideTabLayout breadcrumbs={breadcrumbs} />
        <div className="text-center py-12">
          <p className="text-charcoal-500">Organization not found</p>
        </div>
      </AdminPageContent>
    )
  }

  return (
    <AdminPageContent insideTabLayout>
      <AdminPageHeader
        insideTabLayout
        breadcrumbs={breadcrumbs}
      />

      <div className="space-y-6">
        <OrganizationAddressesSection organizationId={organization.id} />
      </div>
    </AdminPageContent>
  )
}

export default AddressesSettingsPage
