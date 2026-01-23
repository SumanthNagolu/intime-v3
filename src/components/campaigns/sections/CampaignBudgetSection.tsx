'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { DollarSign, Target, TrendingUp, Users, Briefcase, UserCheck } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
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
            {/* Total Budget with Currency */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-32 pt-2.5 shrink-0">
                Total Budget
              </Label>
              <div className="flex-1 flex gap-2">
                {isEditable ? (
                  <>
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                      <Input
                        type="number"
                        value={data.budgetTotal || ''}
                        onChange={(e) => handleChange('budgetTotal', parseFloat(e.target.value) || null)}
                        placeholder="0.00"
                        className={cn('h-10 pl-7 tabular-nums', errors?.budgetTotal && 'border-red-500')}
                      />
                    </div>
                    <Select
                      value={data.budgetCurrency}
                      onValueChange={(v) => handleChange('budgetCurrency', v)}
                    >
                      <SelectTrigger className="w-24 h-10">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {CURRENCY_OPTIONS.map((c) => (
                          <SelectItem key={c.value} value={c.value}>{c.value}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </>
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {data.budgetTotal != null ? `$${data.budgetTotal.toLocaleString()} ${data.budgetCurrency}` : '—'}
                  </p>
                )}
              </div>
            </div>
            {errors?.budgetTotal && <p className="text-xs text-red-500 ml-36">{errors.budgetTotal}</p>}

            {/* Target Revenue */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-32 pt-2.5 shrink-0">
                Target Revenue
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-400">$</span>
                    <Input
                      type="number"
                      value={data.targetRevenue || ''}
                      onChange={(e) => handleChange('targetRevenue', parseFloat(e.target.value) || null)}
                      placeholder="0.00"
                      className="h-10 pl-7 tabular-nums"
                    />
                  </div>
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {data.targetRevenue != null ? `$${data.targetRevenue.toLocaleString()}` : '—'}
                  </p>
                )}
                <p className="text-xs text-charcoal-500 mt-1">Expected revenue from this campaign</p>
              </div>
            </div>
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
            {/* Expected Response Rate */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-36 pt-2.5 shrink-0">
                Response Rate
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <div className="relative w-24">
                    <Input
                      type="number"
                      value={data.expectedResponseRate ?? ''}
                      onChange={(e) => handleChange('expectedResponseRate', parseFloat(e.target.value) || null)}
                      placeholder="10"
                      min={0}
                      max={100}
                      className="h-10 pr-7 tabular-nums text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">%</span>
                  </div>
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {data.expectedResponseRate != null ? `${data.expectedResponseRate}%` : '—'}
                  </p>
                )}
                <p className="text-xs text-charcoal-500 mt-1">Historical industry average: 8-12%</p>
              </div>
            </div>

            {/* Expected Conversion Rate */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-36 pt-2.5 shrink-0">
                Conversion Rate
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <div className="relative w-24">
                    <Input
                      type="number"
                      value={data.expectedConversionRate ?? ''}
                      onChange={(e) => handleChange('expectedConversionRate', parseFloat(e.target.value) || null)}
                      placeholder="20"
                      min={0}
                      max={100}
                      className="h-10 pr-7 tabular-nums text-right"
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-charcoal-400">%</span>
                  </div>
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {data.expectedConversionRate != null ? `${data.expectedConversionRate}%` : '—'}
                  </p>
                )}
                <p className="text-xs text-charcoal-500 mt-1">From lead to meeting/submission</p>
              </div>
            </div>
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
            {/* Target Contacts */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Contacts
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Input
                    type="number"
                    value={data.targetContacts ?? ''}
                    onChange={(e) => handleChange('targetContacts', parseInt(e.target.value, 10) || null)}
                    placeholder="500"
                    min={0}
                    className="h-10 w-28 tabular-nums"
                  />
                ) : (
                  <p className="text-charcoal-900 py-2">{data.targetContacts?.toLocaleString() ?? '—'}</p>
                )}
                <p className="text-xs text-charcoal-500 mt-1">Total to reach</p>
              </div>
            </div>

            {/* Target Responses */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Responses
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Input
                    type="number"
                    value={data.targetResponses ?? ''}
                    onChange={(e) => handleChange('targetResponses', parseInt(e.target.value, 10) || null)}
                    placeholder="50"
                    min={0}
                    className="h-10 w-28 tabular-nums"
                  />
                ) : (
                  <p className="text-charcoal-900 py-2">{data.targetResponses?.toLocaleString() ?? '—'}</p>
                )}
                <p className="text-xs text-charcoal-500 mt-1">Expected replies</p>
              </div>
            </div>

            {/* Target Leads */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Leads
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Input
                    type="number"
                    value={data.targetLeads ?? ''}
                    onChange={(e) => handleChange('targetLeads', parseInt(e.target.value, 10) || null)}
                    placeholder="25"
                    min={0}
                    className="h-10 w-28 tabular-nums"
                  />
                ) : (
                  <p className="text-charcoal-900 py-2">{data.targetLeads?.toLocaleString() ?? '—'}</p>
                )}
                <p className="text-xs text-charcoal-500 mt-1">Qualified leads</p>
              </div>
            </div>

            {/* Target Meetings */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Meetings
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Input
                    type="number"
                    value={data.targetMeetings ?? ''}
                    onChange={(e) => handleChange('targetMeetings', parseInt(e.target.value, 10) || null)}
                    placeholder="10"
                    min={0}
                    className="h-10 w-28 tabular-nums"
                  />
                ) : (
                  <p className="text-charcoal-900 py-2">{data.targetMeetings?.toLocaleString() ?? '—'}</p>
                )}
                <p className="text-xs text-charcoal-500 mt-1">Meetings to book</p>
              </div>
            </div>
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
            <p className="text-xs text-charcoal-500 mt-1">
              Recruiting and placement goals
            </p>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Submissions */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center shrink-0">
                  <Users className="w-5 h-5 text-charcoal-500" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Submissions
                  </Label>
                  {isEditable ? (
                    <Input
                      type="number"
                      value={data.targetSubmissions ?? ''}
                      onChange={(e) => handleChange('targetSubmissions', parseInt(e.target.value, 10) || null)}
                      placeholder="20"
                      min={0}
                      className="h-10 w-24 mt-1 tabular-nums"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-charcoal-900 mt-1">
                      {data.targetSubmissions?.toLocaleString() ?? '—'}
                    </p>
                  )}
                  <p className="text-xs text-charcoal-500 mt-1">To clients</p>
                </div>
              </div>

              {/* Interviews */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center shrink-0">
                  <UserCheck className="w-5 h-5 text-charcoal-500" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Interviews
                  </Label>
                  {isEditable ? (
                    <Input
                      type="number"
                      value={data.targetInterviews ?? ''}
                      onChange={(e) => handleChange('targetInterviews', parseInt(e.target.value, 10) || null)}
                      placeholder="10"
                      min={0}
                      className="h-10 w-24 mt-1 tabular-nums"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-charcoal-900 mt-1">
                      {data.targetInterviews?.toLocaleString() ?? '—'}
                    </p>
                  )}
                  <p className="text-xs text-charcoal-500 mt-1">Scheduled</p>
                </div>
              </div>

              {/* Placements */}
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center shrink-0">
                  <Briefcase className="w-5 h-5 text-charcoal-500" />
                </div>
                <div className="flex-1">
                  <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                    Placements
                  </Label>
                  {isEditable ? (
                    <Input
                      type="number"
                      value={data.targetPlacements ?? ''}
                      onChange={(e) => handleChange('targetPlacements', parseInt(e.target.value, 10) || null)}
                      placeholder="5"
                      min={0}
                      className="h-10 w-24 mt-1 tabular-nums"
                    />
                  ) : (
                    <p className="text-lg font-semibold text-charcoal-900 mt-1">
                      {data.targetPlacements?.toLocaleString() ?? '—'}
                    </p>
                  )}
                  <p className="text-xs text-charcoal-500 mt-1">Successful</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CampaignBudgetSection
