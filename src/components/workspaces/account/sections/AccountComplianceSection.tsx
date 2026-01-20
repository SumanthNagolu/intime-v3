'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Shield, CheckCircle2, AlertTriangle, Clock, FileCheck,
  Building2, Users, Pencil, Plus, ShieldCheck, ShieldAlert
} from 'lucide-react'
import type { AccountData } from '@/types/workspace'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import { cn } from '@/lib/utils'

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
  const getOnboardingStyle = (status: string | null) => {
    if (!status) return { variant: 'secondary' as const, icon: Clock, label: 'Not Started' }
    switch (status.toLowerCase()) {
      case 'completed':
        return { variant: 'success' as const, icon: CheckCircle2, label: 'Completed' }
      case 'in_progress':
        return { variant: 'warning' as const, icon: Clock, label: 'In Progress' }
      case 'pending':
        return { variant: 'warning' as const, icon: Clock, label: 'Pending' }
      default:
        return { variant: 'secondary' as const, icon: Clock, label: status.replace(/_/g, ' ') }
    }
  }

  const onboardingStyle = getOnboardingStyle(account.onboarding_status)
  const OnboardingIcon = onboardingStyle.icon

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-heading font-semibold text-charcoal-900">Compliance</h2>
          <p className="text-sm text-charcoal-500 mt-1">Compliance requirements, insurance, and certifications</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => setIsEditing(true)}
          className="gap-2"
        >
          <Pencil className="w-4 h-4" />
          Edit
        </Button>
      </div>

      {/* Onboarding Status Card */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileCheck className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-base font-heading">Onboarding Status</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Status</p>
              <Badge variant={onboardingStyle.variant} className="gap-1">
                <OnboardingIcon className="w-3 h-3" />
                {onboardingStyle.label}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Completed At</p>
              <p className={cn("text-sm", account.onboarding_completed_at ? "text-charcoal-900" : "text-charcoal-400")}>
                {account.onboarding_completed_at
                  ? new Date(account.onboarding_completed_at).toLocaleDateString()
                  : 'Not completed'}
              </p>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">First Engagement</p>
              <p className={cn("text-sm", account.first_engagement_date ? "text-charcoal-900" : "text-charcoal-400")}>
                {account.first_engagement_date
                  ? new Date(account.first_engagement_date).toLocaleDateString()
                  : 'Not yet'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Compliance Requirements Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Insurance Requirements */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-green-50 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                </div>
                <CardTitle className="text-base font-heading">Insurance Requirements</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-charcoal-400">
              <ShieldCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No insurance requirements configured</p>
              <p className="text-xs mt-1">Add requirements like General Liability, Workers Comp, etc.</p>
            </div>
          </CardContent>
        </Card>

        {/* Background Check Requirements */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-purple-50 rounded-lg">
                  <Users className="w-4 h-4 text-purple-600" />
                </div>
                <CardTitle className="text-base font-heading">Background Check Requirements</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-charcoal-400">
              <Users className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No background check requirements configured</p>
              <p className="text-xs mt-1">Specify required background checks for placements</p>
            </div>
          </CardContent>
        </Card>

        {/* Certifications */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 bg-gold-50 rounded-lg">
                  <FileCheck className="w-4 h-4 text-gold-600" />
                </div>
                <CardTitle className="text-base font-heading">Required Certifications</CardTitle>
              </div>
              <Button variant="ghost" size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-center py-6 text-charcoal-400">
              <FileCheck className="w-10 h-10 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No certification requirements configured</p>
              <p className="text-xs mt-1">Add certifications required for placements at this account</p>
            </div>
          </CardContent>
        </Card>

        {/* Work Authorization */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Building2 className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Work Policies</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Remote Work</p>
              <Badge variant={account.allows_remote_work ? 'success' : 'secondary'}>
                {account.allows_remote_work ? 'Allowed' : 'Not Allowed'}
              </Badge>
            </div>
            <div>
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">Submission Approval</p>
              <Badge variant={account.requires_approval_for_submission ? 'warning' : 'secondary'}>
                {account.requires_approval_for_submission ? 'Required' : 'Not Required'}
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AccountComplianceSection
