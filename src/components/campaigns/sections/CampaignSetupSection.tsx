'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Megaphone,
  Target,
  Building2,
  Users,
  Sparkles,
  Settings,
  Flag,
  Tag,
  X,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { GroupedSelect, type CascadeGroup } from '@/components/ui/cascade-select'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SectionMode, CampaignSetupSectionData, CampaignPriority } from '@/lib/campaigns/types'
import { CAMPAIGN_TYPE_OPTIONS, CAMPAIGN_GOAL_OPTIONS, PRIORITY_OPTIONS } from '@/lib/campaigns/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CampaignSetupSectionProps {
  mode: SectionMode
  data: CampaignSetupSectionData
  onChange?: (field: string, value: unknown) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

// Category icons for campaign types
const CATEGORY_ICONS = {
  client: Building2,
  candidate: Users,
  marketing: Sparkles,
  internal: Settings,
}

// Priority colors
const PRIORITY_COLORS: Record<CampaignPriority, string> = {
  low: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200',
  normal: 'bg-blue-50 text-blue-700 border-blue-200',
  high: 'bg-amber-50 text-amber-700 border-amber-200',
  urgent: 'bg-red-50 text-red-700 border-red-200',
}

// Convert campaign types to grouped select format
const CAMPAIGN_TYPE_GROUPS: CascadeGroup[] = [
  {
    value: 'client',
    label: 'Client Campaigns',
    icon: Building2,
    options: CAMPAIGN_TYPE_OPTIONS.filter(t => t.category === 'client').map(t => ({
      value: t.value,
      label: t.label,
      description: t.description,
    })),
  },
  {
    value: 'candidate',
    label: 'Candidate Campaigns',
    icon: Users,
    options: CAMPAIGN_TYPE_OPTIONS.filter(t => t.category === 'candidate').map(t => ({
      value: t.value,
      label: t.label,
      description: t.description,
    })),
  },
  {
    value: 'marketing',
    label: 'Marketing Campaigns',
    icon: Sparkles,
    options: CAMPAIGN_TYPE_OPTIONS.filter(t => t.category === 'marketing').map(t => ({
      value: t.value,
      label: t.label,
      description: t.description,
    })),
  },
  {
    value: 'internal',
    label: 'Internal Campaigns',
    icon: Settings,
    options: CAMPAIGN_TYPE_OPTIONS.filter(t => t.category === 'internal').map(t => ({
      value: t.value,
      label: t.label,
      description: t.description,
    })),
  },
]

/**
 * CampaignSetupSection - Unified component for Campaign Setup (Identity & Goals)
 *
 * Redesigned with:
 * - Grouped dropdown for campaign type (replaces card grid)
 * - Horizontal label:value layout (Guidewire style)
 * - Compact, professional appearance
 */
export function CampaignSetupSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: CampaignSetupSectionProps) {
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

  // Handle tag input
  const handleAddTag = (tag: string) => {
    const trimmedTag = tag.trim()
    if (trimmedTag && !data.tags.includes(trimmedTag)) {
      onChange?.('tags', [...data.tags, trimmedTag])
    }
  }

  const handleRemoveTag = (tagToRemove: string) => {
    onChange?.('tags', data.tags.filter(t => t !== tagToRemove))
  }

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Get selected campaign type info
  const selectedType = CAMPAIGN_TYPE_OPTIONS.find(t => t.value === data.campaignType)
  const CategoryIcon = selectedType ? CATEGORY_ICONS[selectedType.category] : Megaphone

  // Convert goal options for select
  const goalOptions = CAMPAIGN_GOAL_OPTIONS.map(g => ({ value: g.value, label: g.label }))

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Campaign Setup"
          subtitle="Campaign identity, type, and goals"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Main Content - Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Identity Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <CategoryIcon className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Campaign Identity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Campaign Type - Grouped Dropdown */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Type <span className="text-red-500">*</span>
              </Label>
              <div className="flex-1">
                <GroupedSelect
                  placeholder="Select campaign type..."
                  groups={CAMPAIGN_TYPE_GROUPS}
                  value={data.campaignType}
                  onChange={(v) => handleChange('campaignType', v)}
                  disabled={!isEditable}
                  showDescriptions={true}
                  error={errors?.campaignType}
                />
              </div>
            </div>

            {/* Campaign Name */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Name <span className="text-red-500">*</span>
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Input
                    value={data.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="e.g., Q1 Lead Generation"
                    className={cn('h-10', errors?.name && 'border-red-500')}
                  />
                ) : (
                  <p className="text-charcoal-900 py-2">{data.name || '—'}</p>
                )}
                {errors?.name && <p className="text-xs text-red-500 mt-1">{errors.name}</p>}
              </div>
            </div>

            {/* Description */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Description
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Textarea
                    value={data.description}
                    onChange={(e) => handleChange('description', e.target.value)}
                    placeholder="Brief description of campaign objectives..."
                    className="min-h-[80px] resize-y"
                    maxLength={500}
                  />
                ) : (
                  <p className="text-charcoal-700 py-2 whitespace-pre-wrap">
                    {data.description || '—'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Goals & Priority Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Goals & Priority</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Primary Goal */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Primary Goal <span className="text-red-500">*</span>
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Select
                    value={data.goal}
                    onValueChange={(v) => handleChange('goal', v)}
                  >
                    <SelectTrigger className={cn('h-10', errors?.goal && 'border-red-500')}>
                      <SelectValue placeholder="Select primary goal..." />
                    </SelectTrigger>
                    <SelectContent>
                      {goalOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {goalOptions.find(g => g.value === data.goal)?.label || '—'}
                  </p>
                )}
                {errors?.goal && <p className="text-xs text-red-500 mt-1">{errors.goal}</p>}
              </div>
            </div>

            {/* Priority */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2 shrink-0">
                Priority
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <div className="flex flex-wrap gap-2">
                    {PRIORITY_OPTIONS.map((priority) => (
                      <button
                        key={priority.value}
                        type="button"
                        onClick={() => handleChange('priority', priority.value)}
                        className={cn(
                          'px-3 py-1.5 rounded-lg border text-sm font-medium transition-all duration-200',
                          data.priority === priority.value
                            ? PRIORITY_COLORS[priority.value as CampaignPriority]
                            : 'border-charcoal-200 bg-white text-charcoal-500 hover:border-charcoal-300'
                        )}
                      >
                        {priority.label}
                      </button>
                    ))}
                  </div>
                ) : (
                  <span
                    className={cn(
                      'inline-flex px-3 py-1 rounded-lg border text-sm font-medium',
                      PRIORITY_COLORS[data.priority as CampaignPriority]
                    )}
                  >
                    {PRIORITY_OPTIONS.find(p => p.value === data.priority)?.label}
                  </span>
                )}
              </div>
            </div>

            {/* Tags */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5" />
                Tags
              </Label>
              <div className="flex-1">
                {isEditable && (
                  <Input
                    placeholder="Type tag and press Enter..."
                    className="h-10 mb-2"
                    onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        const input = e.target as HTMLInputElement
                        handleAddTag(input.value)
                        input.value = ''
                      }
                    }}
                  />
                )}
                <div className="flex flex-wrap gap-1.5">
                  {data.tags.length > 0 ? (
                    data.tags.map((tag) => (
                      <span
                        key={tag}
                        className={cn(
                          'inline-flex items-center gap-1 px-2.5 py-1 bg-charcoal-100 rounded-md text-sm text-charcoal-700',
                          isEditable && 'pr-1'
                        )}
                      >
                        {tag}
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTag(tag)}
                            className="w-4 h-4 rounded hover:bg-charcoal-200 flex items-center justify-center"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))
                  ) : (
                    <span className="text-sm text-charcoal-400">No tags</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default CampaignSetupSection
