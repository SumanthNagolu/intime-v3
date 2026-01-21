'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { DollarSign, Target, TrendingUp, Users, Briefcase, UserCheck } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import type { SectionMode, CampaignBudgetSectionData } from '@/lib/campaigns/types'
import { CURRENCY_OPTIONS } from '@/lib/campaigns/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CampaignBudgetSectionProps {
  mode: SectionMode
  data: CampaignBudgetSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
  /** Show staffing-specific targets (submissions, interviews, placements) */
  showStaffingTargets?: boolean
}

/**
 * CampaignBudgetSection - Budget allocation and performance targets
 *
 * Supports both standard marketing targets and staffing-specific targets.
 */
export function CampaignBudgetSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
  showStaffingTargets = true,
}: CampaignBudgetSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  return (
    <div className={cn('space-y-6', className)}>
      {!isCreateMode && (
        <SectionHeader
          title="Budget & Targets"
          subtitle="Campaign budget allocation and performance goals"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Budget Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Budget</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Total Budget"
                type="currency"
                value={data.budgetTotal}
                onChange={(v) => handleChange('budgetTotal', v)}
                editable={isEditable}
                placeholder="0.00"
                error={errors?.budgetTotal}
              />
              <UnifiedField
                label="Currency"
                type="select"
                value={data.budgetCurrency}
                onChange={(v) => handleChange('budgetCurrency', v)}
                editable={isEditable}
                options={CURRENCY_OPTIONS.map(c => ({ value: c.value, label: c.label }))}
              />
            </div>
            <UnifiedField
              label="Target Revenue"
              type="currency"
              value={data.targetRevenue}
              onChange={(v) => handleChange('targetRevenue', v)}
              editable={isEditable}
              placeholder="0.00"
              helpText="Expected revenue from this campaign"
            />
          </CardContent>
        </Card>

        {/* Expected Rates Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <TrendingUp className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Expected Performance</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Expected Response Rate"
              type="percentage"
              value={data.expectedResponseRate}
              onChange={(v) => handleChange('expectedResponseRate', v)}
              editable={isEditable}
              min={0}
              max={100}
              placeholder="10"
              helpText="Historical industry average: 8-12%"
            />
            <UnifiedField
              label="Expected Conversion Rate"
              type="percentage"
              value={data.expectedConversionRate}
              onChange={(v) => handleChange('expectedConversionRate', v)}
              editable={isEditable}
              min={0}
              max={100}
              placeholder="20"
              helpText="From lead to meeting/submission"
            />
          </CardContent>
        </Card>
      </div>

      {/* Outreach Targets Card */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-base font-heading">Outreach Targets</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <UnifiedField
              label="Target Contacts"
              type="number"
              value={data.targetContacts}
              onChange={(v) => handleChange('targetContacts', v)}
              editable={isEditable}
              min={0}
              placeholder="500"
              helpText="Total contacts to reach"
            />
            <UnifiedField
              label="Target Responses"
              type="number"
              value={data.targetResponses}
              onChange={(v) => handleChange('targetResponses', v)}
              editable={isEditable}
              min={0}
              placeholder="50"
              helpText="Expected replies"
            />
            <UnifiedField
              label="Target Leads"
              type="number"
              value={data.targetLeads}
              onChange={(v) => handleChange('targetLeads', v)}
              editable={isEditable}
              min={0}
              placeholder="25"
              helpText="Qualified leads to generate"
            />
            <UnifiedField
              label="Target Meetings"
              type="number"
              value={data.targetMeetings}
              onChange={(v) => handleChange('targetMeetings', v)}
              editable={isEditable}
              min={0}
              placeholder="10"
              helpText="Meetings to book"
            />
          </div>
        </CardContent>
      </Card>

      {/* Staffing-Specific Targets Card */}
      {showStaffingTargets && (
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-heading">Staffing Targets</CardTitle>
            </div>
            <p className="text-sm text-charcoal-500 mt-1">
              Recruiting and placement goals
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Users className="w-4 h-4 text-charcoal-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                      Submissions
                    </p>
                  </div>
                </div>
                <UnifiedField
                  label=""
                  type="number"
                  value={data.targetSubmissions}
                  onChange={(v) => handleChange('targetSubmissions', v)}
                  editable={isEditable}
                  min={0}
                  placeholder="20"
                  helpText="Candidate submissions to clients"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <UserCheck className="w-4 h-4 text-charcoal-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                      Interviews
                    </p>
                  </div>
                </div>
                <UnifiedField
                  label=""
                  type="number"
                  value={data.targetInterviews}
                  onChange={(v) => handleChange('targetInterviews', v)}
                  editable={isEditable}
                  min={0}
                  placeholder="10"
                  helpText="Client interviews scheduled"
                />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-charcoal-100 flex items-center justify-center">
                    <Briefcase className="w-4 h-4 text-charcoal-500" />
                  </div>
                  <div>
                    <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                      Placements
                    </p>
                  </div>
                </div>
                <UnifiedField
                  label=""
                  type="number"
                  value={data.targetPlacements}
                  onChange={(v) => handleChange('targetPlacements', v)}
                  editable={isEditable}
                  min={0}
                  placeholder="5"
                  helpText="Successful placements"
                />
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CampaignBudgetSection
