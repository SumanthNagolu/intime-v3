'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Building2,
  Users,
  Briefcase,
  Calendar,
  Zap,
  CheckCircle2,
  Clock,
  TrendingUp,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { trpc } from '@/lib/trpc/client'
import {
  INTAKE_METHODS,
  JOB_TYPES,
  PRIORITY_LEVELS,
  JOB_STATUSES,
  getStatusBadgeVariant,
  getPriorityBadgeVariant,
} from '@/lib/jobs/constants'
import type { SectionMode, BasicInfoSectionData } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

// ============ PROPS ============

interface BasicInfoSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: BasicInfoSectionData
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
 * BasicInfoSection - Unified component for Job Basic Information
 *
 * Guidewire PCH Architecture:
 * - Same card-based layout in all modes (create, view, edit)
 * - Consistent field groupings across wizard and detail view
 * - Mode determines editability, not layout
 */
export function BasicInfoSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: BasicInfoSectionProps) {
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

  // Queries for dynamic data
  const accountsQuery = trpc.crm.accounts.list.useQuery(
    { limit: 100, status: 'active' },
    { enabled: isEditable && !data.accountId }
  )

  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId: data.accountId || '' },
    { enabled: isEditable && !!data.accountId }
  )

  const accounts = accountsQuery.data?.items || []
  const contacts = contactsQuery.data || []

  const handleAccountChange = (accountId: string) => {
    const account = accounts.find((a) => a.id === accountId)
    handleChange('accountId', accountId)
    handleChange('accountName', account?.name || '')
    handleChange('hiringManagerContactId', null)
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Basic Information"
          subtitle="Account, position details, and priority settings"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Client Account Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-forest-50 rounded-lg">
                <Building2 className="w-4 h-4 text-forest-600" />
              </div>
              <CardTitle className="text-base font-heading">Client Account</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Account Selection */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Client Account {isEditable && <span className="text-gold-500">*</span>}
              </Label>
              {isEditable ? (
                data.accountName && data.accountId ? (
                  <div className="flex items-center gap-3 p-4 bg-gradient-to-r from-forest-50 to-emerald-50 border border-forest-200 rounded-xl">
                    <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center">
                      <Building2 className="w-5 h-5 text-forest-600" />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-forest-900">{data.accountName}</p>
                      <p className="text-xs text-forest-600">Active Client</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleChange('accountId', '')
                        handleChange('accountName', '')
                        handleChange('hiringManagerContactId', null)
                      }}
                      className="text-sm text-forest-600 hover:text-forest-800 hover:underline font-medium px-3 py-1 rounded-lg hover:bg-forest-100 transition-colors"
                    >
                      Change
                    </button>
                  </div>
                ) : (
                  <Select value={data.accountId} onValueChange={handleAccountChange}>
                    <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                      <SelectValue placeholder="Select client account" />
                    </SelectTrigger>
                    <SelectContent>
                      {accounts.map((account) => (
                        <SelectItem key={account.id} value={account.id}>
                          <div className="flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-charcoal-400" />
                            {account.name}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )
              ) : (
                <p className="text-sm text-charcoal-900 font-medium">
                  {data.accountName || <span className="text-charcoal-400">Not specified</span>}
                </p>
              )}
              {errors?.accountId && <p className="text-xs text-error-600">{errors.accountId}</p>}
            </div>

            {/* Hiring Manager */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-charcoal-400" />
                Hiring Manager
              </Label>
              {isEditable ? (
                <Select
                  value={data.hiringManagerContactId || ''}
                  onValueChange={(value) => handleChange('hiringManagerContactId', value || null)}
                  disabled={!data.accountId || contacts.length === 0}
                >
                  <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue placeholder={data.accountId ? 'Select hiring manager' : 'Select account first'} />
                  </SelectTrigger>
                  <SelectContent>
                    {contacts.map((contact: { id: string; first_name: string; last_name?: string; title?: string }) => (
                      <SelectItem key={contact.id} value={contact.id}>
                        {contact.first_name} {contact.last_name}
                        {contact.title && <span className="text-charcoal-500 ml-1">• {contact.title}</span>}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-charcoal-900">
                  {data.hiringManagerContactId ? (
                    contacts.find((c: { id: string; first_name: string; last_name?: string }) => c.id === data.hiringManagerContactId)
                      ? `${contacts.find((c: { id: string; first_name: string; last_name?: string }) => c.id === data.hiringManagerContactId)?.first_name || ''} ${contacts.find((c: { id: string; first_name: string; last_name?: string }) => c.id === data.hiringManagerContactId)?.last_name || ''}`
                      : 'Contact assigned'
                  ) : (
                    <span className="text-charcoal-400">Not specified</span>
                  )}
                </p>
              )}
            </div>

            {/* Intake Method */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                How was this job received?
              </Label>
              {isEditable ? (
                <Select value={data.intakeMethod} onValueChange={(value) => handleChange('intakeMethod', value)}>
                  <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {INTAKE_METHODS.map((method) => (
                      <SelectItem key={method.value} value={method.value}>
                        {method.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-charcoal-900">
                  {INTAKE_METHODS.find((m) => m.value === data.intakeMethod)?.label || data.intakeMethod}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Position Information Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Position Details</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Job Title */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Job Title {isEditable && <span className="text-gold-500">*</span>}
              </Label>
              {isEditable ? (
                <Input
                  value={data.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  placeholder="e.g., Senior Backend Engineer"
                  className="h-12 text-lg rounded-xl border-charcoal-200 bg-white"
                />
              ) : (
                <p className="text-lg font-semibold text-charcoal-900">{data.title || 'Untitled Job'}</p>
              )}
              {errors?.title && <p className="text-xs text-error-600">{errors.title}</p>}
            </div>

            {/* Status - View mode only */}
            {!isCreateMode && data.status && (
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Status
                </Label>
                <Badge variant={getStatusBadgeVariant(data.status)} className="capitalize">
                  {JOB_STATUSES.find((s) => s.value === data.status)?.label || data.status}
                </Badge>
              </div>
            )}

            {/* Positions Count & External ID */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  # of Positions
                </Label>
                {isEditable ? (
                  <Select
                    value={data.positionsCount.toString()}
                    onValueChange={(value) => handleChange('positionsCount', parseInt(value) || 1)}
                  >
                    <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 15, 20, 25, 50].map((num) => (
                        <SelectItem key={num} value={num.toString()}>
                          {num} {num === 1 ? 'position' : 'positions'}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-charcoal-900">
                    {data.positionsCount} {data.positionsCount === 1 ? 'position' : 'positions'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  External Job ID
                </Label>
                {isEditable ? (
                  <Input
                    value={data.externalJobId}
                    onChange={(e) => handleChange('externalJobId', e.target.value)}
                    placeholder="e.g., REQ-12345"
                    className="h-11 rounded-xl border-charcoal-200 bg-white"
                  />
                ) : (
                  <p className="text-sm text-charcoal-900">
                    {data.externalJobId || <span className="text-charcoal-400">Not specified</span>}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Employment Type Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Employment Type</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {JOB_TYPES.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => handleChange('jobType', type.value)}
                    className={cn(
                      'p-4 rounded-xl border-2 text-center transition-all duration-200',
                      data.jobType === type.value
                        ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
                        : 'border-charcoal-100 bg-white hover:border-gold-200'
                    )}
                  >
                    <span className="text-2xl mb-2 block">{type.icon}</span>
                    <span className="text-sm font-semibold text-charcoal-800 block">{type.label}</span>
                    {data.jobType === type.value && (
                      <CheckCircle2 className="w-4 h-4 text-gold-500 mx-auto mt-2" />
                    )}
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <span className="text-2xl">{JOB_TYPES.find((t) => t.value === data.jobType)?.icon || '📋'}</span>
                <span className="text-lg font-medium text-charcoal-900">
                  {JOB_TYPES.find((t) => t.value === data.jobType)?.label || data.jobType}
                </span>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Priority & Dates Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <Zap className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-heading">Priority & Timeline</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Priority */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Priority Level
              </Label>
              {isEditable ? (
                <div className="grid grid-cols-5 gap-2">
                  {PRIORITY_LEVELS.map((level) => {
                    const icons = {
                      critical: <Clock className="w-4 h-4 text-red-500" />,
                      urgent: <Clock className="w-4 h-4 text-orange-500" />,
                      high: <TrendingUp className="w-4 h-4 text-amber-500" />,
                      normal: <Briefcase className="w-4 h-4 text-blue-500" />,
                      low: <Calendar className="w-4 h-4 text-charcoal-400" />,
                    }
                    return (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => handleChange('priority', level.value)}
                        className={cn(
                          'p-3 rounded-xl border-2 text-center transition-all duration-200',
                          data.priority === level.value
                            ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
                            : 'border-charcoal-100 bg-white hover:border-gold-200'
                        )}
                      >
                        <div className="flex flex-col items-center gap-1">
                          {icons[level.value as keyof typeof icons]}
                          <span className="text-xs font-semibold text-charcoal-700">{level.label}</span>
                        </div>
                      </button>
                    )
                  })}
                </div>
              ) : (
                <Badge variant={getPriorityBadgeVariant(data.priority)} className="capitalize">
                  {PRIORITY_LEVELS.find((p) => p.value === data.priority)?.label || data.priority}
                </Badge>
              )}
            </div>

            {/* Dates */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Target Fill
                </Label>
                {isEditable ? (
                  <Input
                    type="date"
                    value={data.targetFillDate}
                    onChange={(e) => handleChange('targetFillDate', e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="h-11 rounded-xl border-charcoal-200 bg-white"
                  />
                ) : (
                  <p className="text-sm text-charcoal-900">
                    {data.targetFillDate ? format(new Date(data.targetFillDate), 'MMM d, yyyy') : <span className="text-charcoal-400">Not set</span>}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Target Start
                </Label>
                {isEditable ? (
                  <Input
                    type="date"
                    value={data.targetStartDate}
                    onChange={(e) => handleChange('targetStartDate', e.target.value)}
                    min={format(new Date(), 'yyyy-MM-dd')}
                    className="h-11 rounded-xl border-charcoal-200 bg-white"
                  />
                ) : (
                  <p className="text-sm text-charcoal-900">
                    {data.targetStartDate ? format(new Date(data.targetStartDate), 'MMM d, yyyy') : <span className="text-charcoal-400">Not set</span>}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5" />
                  Target End
                </Label>
                {isEditable ? (
                  <Input
                    type="date"
                    value={data.targetEndDate}
                    onChange={(e) => handleChange('targetEndDate', e.target.value)}
                    min={data.targetStartDate || format(new Date(), 'yyyy-MM-dd')}
                    className="h-11 rounded-xl border-charcoal-200 bg-white"
                  />
                ) : (
                  <p className="text-sm text-charcoal-900">
                    {data.targetEndDate ? format(new Date(data.targetEndDate), 'MMM d, yyyy') : <span className="text-charcoal-400">Not set</span>}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Description Card - full width */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Description</CardTitle>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <Textarea
              value={data.description}
              onChange={(e) => handleChange('description', e.target.value)}
              placeholder="Brief description of the role and key responsibilities..."
              className="min-h-[120px] rounded-xl border-charcoal-200 bg-white resize-none"
              maxLength={2000}
            />
          ) : (
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap">
              {data.description || <span className="text-charcoal-400">No description provided</span>}
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default BasicInfoSection
