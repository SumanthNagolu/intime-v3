'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Target,
  DollarSign,
  Users,
  Calendar,
  BarChart3,
  ClipboardList,
} from 'lucide-react'
import { SectionHeader } from '../fields/SectionHeader'
import { UnifiedField } from '../fields/UnifiedField'
import {
  LEAD_STATUSES,
  BUDGET_STATUSES,
  AUTHORITY_LEVELS,
  LEAD_URGENCY,
  BANT_LEVELS,
  getLeadStatusBadgeVariant,
} from '@/lib/contacts/constants'
import type { SectionMode, LeadSectionData } from '@/lib/contacts/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface LeadSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: LeadSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

/**
 * LeadSection - Lead-specific qualification and scoring
 *
 * Handles BANT qualification, lead scoring, and pipeline management.
 * Only applicable for contacts with 'lead' type.
 */
export function LeadSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: LeadSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // Reset editing state when mode changes
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

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Convert constants to option format
  const statusOptions = LEAD_STATUSES.map(s => ({ value: s.value, label: s.label }))
  const budgetOptions = BUDGET_STATUSES.map(b => ({ value: b.value, label: b.label }))
  const authorityOptions = AUTHORITY_LEVELS.map(a => ({ value: a.value, label: a.label }))
  const urgencyOptions = LEAD_URGENCY.map(u => ({ value: u.value, label: u.label }))
  const bantOptions = BANT_LEVELS.map(b => ({ value: String(b.value), label: b.label }))

  // Calculate total BANT score
  const bantScore = data.leadBantBudget + data.leadBantAuthority + data.leadBantNeed + data.leadBantTimeline
  const maxBantScore = 12 // 3 * 4 criteria

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Lead Qualification"
          subtitle="BANT scoring, qualification, and pipeline management"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Lead Status Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Lead Status</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Lead Status"
              type="select"
              options={statusOptions}
              value={data.leadStatus}
              onChange={(v) => handleChange('leadStatus', v)}
              editable={isEditable}
              badge={!isEditable}
              badgeVariant={getLeadStatusBadgeVariant(data.leadStatus)}
            />
            <UnifiedField
              label="Lead Score"
              type="number"
              value={data.leadScore ? String(data.leadScore) : ''}
              onChange={(v) => handleChange('leadScore', v ? parseInt(v as string) : null)}
              editable={isEditable}
              min={0}
              max={100}
              placeholder="0-100"
            />
            <UnifiedField
              label="Lead Source"
              value={data.leadSource}
              onChange={(v) => handleChange('leadSource', v)}
              editable={isEditable}
              placeholder="e.g., LinkedIn, Referral, Website"
            />
            <UnifiedField
              label="Estimated Value"
              type="currency"
              value={data.leadEstimatedValue}
              onChange={(v) => handleChange('leadEstimatedValue', v)}
              editable={isEditable}
            />
          </CardContent>
        </Card>

        {/* BANT Score Summary Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <BarChart3 className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">BANT Score</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {/* Score Summary */}
            <div className="text-center mb-6 p-4 bg-charcoal-50 rounded-lg">
              <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-1">
                Total BANT Score
              </p>
              <p className="text-3xl font-bold text-charcoal-900">
                {bantScore} <span className="text-lg text-charcoal-400">/ {maxBantScore}</span>
              </p>
              <div className="w-full h-2 bg-charcoal-200 rounded-full mt-3">
                <div
                  className="h-2 bg-gradient-to-r from-gold-400 to-gold-500 rounded-full transition-all"
                  style={{ width: `${(bantScore / maxBantScore) * 100}%` }}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <UnifiedField
                label="Budget"
                type="select"
                options={bantOptions}
                value={String(data.leadBantBudget)}
                onChange={(v) => handleChange('leadBantBudget', parseInt(v as string))}
                editable={isEditable}
              />
              <UnifiedField
                label="Authority"
                type="select"
                options={bantOptions}
                value={String(data.leadBantAuthority)}
                onChange={(v) => handleChange('leadBantAuthority', parseInt(v as string))}
                editable={isEditable}
              />
              <UnifiedField
                label="Need"
                type="select"
                options={bantOptions}
                value={String(data.leadBantNeed)}
                onChange={(v) => handleChange('leadBantNeed', parseInt(v as string))}
                editable={isEditable}
              />
              <UnifiedField
                label="Timeline"
                type="select"
                options={bantOptions}
                value={String(data.leadBantTimeline)}
                onChange={(v) => handleChange('leadBantTimeline', parseInt(v as string))}
                editable={isEditable}
              />
            </div>
          </CardContent>
        </Card>

        {/* Budget Details Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <DollarSign className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Budget Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Budget Status"
              type="select"
              options={budgetOptions}
              value={data.leadBudgetStatus}
              onChange={(v) => handleChange('leadBudgetStatus', v)}
              editable={isEditable}
              placeholder="Select status"
            />
            <UnifiedField
              label="Est. Monthly Spend"
              type="currency"
              value={data.leadEstimatedMonthlySpend}
              onChange={(v) => handleChange('leadEstimatedMonthlySpend', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Budget Notes"
              type="textarea"
              value={data.leadBantBudgetNotes}
              onChange={(v) => handleChange('leadBantBudgetNotes', v)}
              editable={isEditable}
              placeholder="Notes about their budget situation..."
            />
          </CardContent>
        </Card>

        {/* Authority Details Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Users className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Authority Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Authority Level"
              type="select"
              options={authorityOptions}
              value={data.leadAuthorityLevel}
              onChange={(v) => handleChange('leadAuthorityLevel', v)}
              editable={isEditable}
              placeholder="Select level"
            />
            <UnifiedField
              label="Authority Notes"
              type="textarea"
              value={data.leadBantAuthorityNotes}
              onChange={(v) => handleChange('leadBantAuthorityNotes', v)}
              editable={isEditable}
              placeholder="Notes about their decision-making authority..."
            />
          </CardContent>
        </Card>

        {/* Need & Timeline Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Calendar className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-heading">Need & Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Business Need"
              type="textarea"
              value={data.leadBusinessNeed}
              onChange={(v) => handleChange('leadBusinessNeed', v)}
              editable={isEditable}
              placeholder="What problem are they trying to solve?"
            />
            <UnifiedField
              label="Urgency"
              type="select"
              options={urgencyOptions}
              value={data.leadUrgency}
              onChange={(v) => handleChange('leadUrgency', v)}
              editable={isEditable}
              placeholder="Select urgency"
            />
            <UnifiedField
              label="Target Start Date"
              type="date"
              value={data.leadTargetStartDate}
              onChange={(v) => handleChange('leadTargetStartDate', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Number of Positions"
              type="number"
              value={String(data.leadPositionsCount)}
              onChange={(v) => handleChange('leadPositionsCount', parseInt(v as string) || 1)}
              editable={isEditable}
              min={1}
            />
          </CardContent>
        </Card>

        {/* Next Steps Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <ClipboardList className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Next Steps</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Next Action"
              value={data.leadNextAction}
              onChange={(v) => handleChange('leadNextAction', v)}
              editable={isEditable}
              placeholder="e.g., Schedule discovery call"
            />
            <UnifiedField
              label="Next Action Date"
              type="date"
              value={data.leadNextActionDate}
              onChange={(v) => handleChange('leadNextActionDate', v)}
              editable={isEditable}
            />
            <UnifiedField
              label="Interest Level"
              value={data.leadInterestLevel}
              onChange={(v) => handleChange('leadInterestLevel', v)}
              editable={isEditable}
              placeholder="e.g., High, Medium, Low"
            />
          </CardContent>
        </Card>

        {/* Qualification Notes Card - full width */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-heading">Qualification Notes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <UnifiedField
                label="Qualification Result"
                value={data.leadQualificationResult}
                onChange={(v) => handleChange('leadQualificationResult', v)}
                editable={isEditable}
                placeholder="e.g., Qualified, Not Qualified, Needs Review"
              />
              <UnifiedField
                label="Hiring Needs"
                type="textarea"
                value={data.leadHiringNeeds}
                onChange={(v) => handleChange('leadHiringNeeds', v)}
                editable={isEditable}
                placeholder="What positions are they looking to fill?"
              />
            </div>
            <UnifiedField
              label="Pain Points"
              type="textarea"
              value={data.leadPainPoints}
              onChange={(v) => handleChange('leadPainPoints', v)}
              editable={isEditable}
              placeholder="What challenges are they facing?"
            />
            <UnifiedField
              label="Qualification Notes"
              type="textarea"
              value={data.leadQualificationNotes}
              onChange={(v) => handleChange('leadQualificationNotes', v)}
              editable={isEditable}
              placeholder="Additional notes about lead qualification..."
            />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default LeadSection
