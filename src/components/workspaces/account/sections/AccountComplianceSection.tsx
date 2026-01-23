'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import {
  Shield, CheckCircle2, Clock, FileCheck,
  Building2, Users, Plus, ShieldCheck,
} from 'lucide-react'
import type { AccountData } from '@/types/workspace'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import {
  UnifiedSection,
  InfoCard,
  InfoRow,
  CardsGrid,
  SectionEmptyState,
} from '@/components/pcf/sections/UnifiedSection'
import { formatDate } from '@/lib/formatters'

interface AccountComplianceSectionProps {
  account: AccountData
}

/**
 * AccountComplianceSection - Compliance Requirements
 * Displays compliance settings, certifications, and requirements
 * Matches wizard Step 6: Compliance
 */
export function AccountComplianceSection({ account }: AccountComplianceSectionProps) {
  const { refreshData, data } = useAccountWorkspace()
  const [isEditing, setIsEditing] = React.useState(false)

  // Get onboarding status styling
  const getOnboardingVariant = (status: string | null): 'secondary' | 'success' | 'warning' | 'destructive' => {
    if (!status) return 'secondary'
    switch (status.toLowerCase()) {
      case 'completed':
        return 'success'
      case 'in_progress':
      case 'pending':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  return (
    <UnifiedSection
      title="Compliance"
      description="Compliance requirements, insurance, and certifications"
      icon={Shield}
      editable={false}
    >
      {/* Onboarding Status Card */}
      <InfoCard
        title="Onboarding Status"
        icon={FileCheck}
        iconBg="bg-charcoal-100"
        iconColor="text-charcoal-600"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <InfoRow
            label="Status"
            value={account.onboarding_status || 'Not Started'}
            badge={true}
            badgeVariant={getOnboardingVariant(account.onboarding_status)}
          />
          <InfoRow
            label="Completed At"
            value={account.onboarding_completed_at ? formatDate(account.onboarding_completed_at) : null}
            type="date"
          />
          <InfoRow
            label="First Engagement"
            value={account.first_engagement_date ? formatDate(account.first_engagement_date) : null}
            type="date"
          />
        </div>
      </InfoCard>

      {/* Compliance Requirements Grid */}
      <CardsGrid columns={2} className="mt-6">
        {/* Insurance Requirements */}
        <InfoCard
          title="Insurance Requirements"
          icon={ShieldCheck}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
        >
          <SectionEmptyState
            icon={ShieldCheck}
            title="No insurance requirements"
            description="Add requirements like General Liability, Workers Comp, etc."
            action={{
              label: 'Add Requirement',
              onClick: () => console.log('Add insurance requirement'),
            }}
            className="py-4"
          />
        </InfoCard>

        {/* Background Check Requirements */}
        <InfoCard
          title="Background Check Requirements"
          icon={Users}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
        >
          <SectionEmptyState
            icon={Users}
            title="No background check requirements"
            description="Specify required background checks for placements"
            action={{
              label: 'Add Requirement',
              onClick: () => console.log('Add background check'),
            }}
            className="py-4"
          />
        </InfoCard>

        {/* Certifications */}
        <InfoCard
          title="Required Certifications"
          icon={FileCheck}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
        >
          <SectionEmptyState
            icon={FileCheck}
            title="No certification requirements"
            description="Add certifications required for placements at this account"
            action={{
              label: 'Add Certification',
              onClick: () => console.log('Add certification'),
            }}
            className="py-4"
          />
        </InfoCard>

        {/* Work Authorization */}
        <InfoCard
          title="Work Policies"
          icon={Building2}
          iconBg="bg-charcoal-100"
          iconColor="text-charcoal-600"
        >
          <InfoRow
            label="Remote Work"
            value={account.allows_remote_work ? 'Allowed' : 'Not Allowed'}
            badge={true}
            badgeVariant={account.allows_remote_work ? 'success' : 'secondary'}
          />
          <InfoRow
            label="Submission Approval"
            value={account.requires_approval_for_submission ? 'Required' : 'Not Required'}
            badge={true}
            badgeVariant={account.requires_approval_for_submission ? 'warning' : 'secondary'}
          />
        </InfoCard>
      </CardsGrid>
    </UnifiedSection>
  )
}

export default AccountComplianceSection
