'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  FileText,
  Users,
  Target,
  TrendingUp,
  CheckCircle2,
  Briefcase,
  UserPlus,
  RefreshCw,
  Layers,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { ROLE_OPEN_REASONS } from '@/lib/jobs/constants'
import type { SectionMode, RoleDetailsSectionData } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface RoleDetailsSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: RoleDetailsSectionData
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
 * RoleDetailsSection - Unified component for Role Details
 *
 * Covers role summary, responsibilities, team context, and success metrics
 */
export function RoleDetailsSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: RoleDetailsSectionProps) {
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

  // Role open reason icons
  const reasonIcons: Record<string, React.ReactNode> = {
    growth: <TrendingUp className="w-5 h-5" />,
    backfill: <RefreshCw className="w-5 h-5" />,
    new_project: <UserPlus className="w-5 h-5" />,
    restructuring: <Layers className="w-5 h-5" />,
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Role Details"
          subtitle="Role context, team structure, and expectations"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Role Summary Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="w-4 h-4 text-blue-600" />
            </div>
            <CardTitle className="text-base font-heading">Role Summary</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <Textarea
              value={data.roleSummary}
              onChange={(e) => handleChange('roleSummary', e.target.value)}
              placeholder="Provide a brief summary of this role, including its purpose and impact within the organization..."
              className="min-h-[120px] rounded-xl border-charcoal-200 bg-white resize-none"
              maxLength={2000}
            />
          ) : (
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
              {data.roleSummary || (
                <span className="text-charcoal-400">No role summary provided</span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Why is this role open Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-50 rounded-lg">
              <Briefcase className="w-4 h-4 text-amber-600" />
            </div>
            <CardTitle className="text-base font-heading">Why is this role open?</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {ROLE_OPEN_REASONS.map((reason) => (
                <button
                  key={reason.value}
                  type="button"
                  onClick={() => handleChange('roleOpenReason', reason.value)}
                  className={cn(
                    'p-4 rounded-xl border-2 text-center transition-all duration-200',
                    data.roleOpenReason === reason.value
                      ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
                      : 'border-charcoal-100 bg-white hover:border-gold-200'
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        'p-2 rounded-lg',
                        data.roleOpenReason === reason.value
                          ? 'bg-gold-100 text-gold-700'
                          : 'bg-charcoal-100 text-charcoal-500'
                      )}
                    >
                      {reasonIcons[reason.value]}
                    </div>
                    <span className="text-sm font-medium text-charcoal-800">{reason.label}</span>
                    {data.roleOpenReason === reason.value && (
                      <CheckCircle2 className="w-4 h-4 text-gold-500" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              {data.roleOpenReason ? (
                <>
                  <div className="p-2 bg-charcoal-100 rounded-lg">
                    {reasonIcons[data.roleOpenReason] || <Briefcase className="w-5 h-5" />}
                  </div>
                  <span className="font-medium text-charcoal-900">
                    {ROLE_OPEN_REASONS.find((r) => r.value === data.roleOpenReason)?.label ||
                      data.roleOpenReason}
                  </span>
                </>
              ) : (
                <span className="text-charcoal-400">Not specified</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Responsibilities Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Target className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-base font-heading">Key Responsibilities</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <Textarea
              value={data.responsibilities}
              onChange={(e) => handleChange('responsibilities', e.target.value)}
              placeholder="List the main responsibilities and day-to-day activities for this role..."
              className="min-h-[150px] rounded-xl border-charcoal-200 bg-white resize-none"
              maxLength={3000}
            />
          ) : (
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
              {data.responsibilities || (
                <span className="text-charcoal-400">No responsibilities listed</span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Team Context Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-green-50 rounded-lg">
              <Users className="w-4 h-4 text-green-600" />
            </div>
            <CardTitle className="text-base font-heading">Team Context</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Team Name */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Team Name
              </Label>
              {isEditable ? (
                <Input
                  value={data.teamName}
                  onChange={(e) => handleChange('teamName', e.target.value)}
                  placeholder="e.g., Platform Engineering"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              ) : (
                <p className="text-sm text-charcoal-900">
                  {data.teamName || <span className="text-charcoal-400">Not specified</span>}
                </p>
              )}
            </div>

            {/* Team Size */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Team Size
              </Label>
              {isEditable ? (
                <Input
                  value={data.teamSize}
                  onChange={(e) => handleChange('teamSize', e.target.value)}
                  placeholder="e.g., 8-10 people"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              ) : (
                <p className="text-sm text-charcoal-900">
                  {data.teamSize || <span className="text-charcoal-400">Not specified</span>}
                </p>
              )}
            </div>

            {/* Reports To */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Reports To
              </Label>
              {isEditable ? (
                <Input
                  value={data.reportsTo}
                  onChange={(e) => handleChange('reportsTo', e.target.value)}
                  placeholder="e.g., VP of Engineering"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              ) : (
                <p className="text-sm text-charcoal-900">
                  {data.reportsTo || <span className="text-charcoal-400">Not specified</span>}
                </p>
              )}
            </div>

            {/* Direct Reports */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Direct Reports
              </Label>
              {isEditable ? (
                <Input
                  value={data.directReports}
                  onChange={(e) => handleChange('directReports', e.target.value)}
                  placeholder="e.g., 3 engineers"
                  className="h-11 rounded-xl border-charcoal-200 bg-white"
                />
              ) : (
                <p className="text-sm text-charcoal-900">
                  {data.directReports || <span className="text-charcoal-400">None</span>}
                </p>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Projects Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-50 rounded-lg">
              <Layers className="w-4 h-4 text-indigo-600" />
            </div>
            <CardTitle className="text-base font-heading">Key Projects</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <Textarea
              value={data.keyProjects}
              onChange={(e) => handleChange('keyProjects', e.target.value)}
              placeholder="Describe the main projects or initiatives this person will work on..."
              className="min-h-[100px] rounded-xl border-charcoal-200 bg-white resize-none"
              maxLength={2000}
            />
          ) : (
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
              {data.keyProjects || (
                <span className="text-charcoal-400">No key projects specified</span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Success Metrics Card */}
      <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-red-50 rounded-lg">
              <TrendingUp className="w-4 h-4 text-red-600" />
            </div>
            <CardTitle className="text-base font-heading">Success Metrics</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <Textarea
              value={data.successMetrics}
              onChange={(e) => handleChange('successMetrics', e.target.value)}
              placeholder="How will success be measured in this role? What are the key performance indicators?"
              className="min-h-[100px] rounded-xl border-charcoal-200 bg-white resize-none"
              maxLength={2000}
            />
          ) : (
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
              {data.successMetrics || (
                <span className="text-charcoal-400">No success metrics defined</span>
              )}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default RoleDetailsSection
