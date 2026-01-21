'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Megaphone,
  Target,
  CheckCircle2,
  Building2,
  Users,
  Sparkles,
  Settings,
  Flag,
  Tag,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
import { Input } from '@/components/ui/input'
import type { SectionMode, CampaignSetupSectionData, CampaignPriority } from '@/lib/campaigns/types'
import { CAMPAIGN_TYPE_OPTIONS, CAMPAIGN_GOAL_OPTIONS, PRIORITY_OPTIONS } from '@/lib/campaigns/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CampaignSetupSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: CampaignSetupSectionData
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
  normal: 'bg-blue-50 text-blue-600 border-blue-200',
  high: 'bg-amber-50 text-amber-600 border-amber-200',
  urgent: 'bg-red-50 text-red-600 border-red-200',
}

/**
 * CampaignSetupSection - Unified component for Campaign Setup (Identity & Goals)
 *
 * Same component used in:
 * - Wizard Step 1 (mode='create')
 * - Workspace edit (mode='view' / 'edit')
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

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // Convert options to format for UnifiedField
  const typeOptions = CAMPAIGN_TYPE_OPTIONS.map(t => ({ value: t.value, label: t.label }))
  const goalOptions = CAMPAIGN_GOAL_OPTIONS.map(g => ({ value: g.value, label: g.label }))
  const priorityOptions = PRIORITY_OPTIONS.map(p => ({ value: p.value, label: p.label }))

  // Group campaign types by category for display
  const typesByCategory = React.useMemo(() => {
    const grouped: Record<string, typeof CAMPAIGN_TYPE_OPTIONS> = {
      client: [],
      candidate: [],
      marketing: [],
      internal: [],
    }
    CAMPAIGN_TYPE_OPTIONS.forEach(type => {
      grouped[type.category].push(type)
    })
    return grouped
  }, [])

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

      {/* Campaign Type Selection - only in create mode */}
      {isCreateMode && (
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Megaphone className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Campaign Type</CardTitle>
            </div>
            <p className="text-sm text-charcoal-500 mt-1">
              Select the type of campaign you want to create
            </p>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Client Campaigns */}
            <div>
              <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Building2 className="w-3.5 h-3.5" />
                Client Campaigns
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {typesByCategory.client.map((type) => (
                  <CampaignTypeCard
                    key={type.value}
                    type={type}
                    selected={data.campaignType === type.value}
                    onSelect={() => handleChange('campaignType', type.value)}
                  />
                ))}
              </div>
            </div>

            {/* Candidate Campaigns */}
            <div>
              <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Users className="w-3.5 h-3.5" />
                Candidate Campaigns
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-3">
                {typesByCategory.candidate.map((type) => (
                  <CampaignTypeCard
                    key={type.value}
                    type={type}
                    selected={data.campaignType === type.value}
                    onSelect={() => handleChange('campaignType', type.value)}
                  />
                ))}
              </div>
            </div>

            {/* Marketing Campaigns */}
            <div>
              <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Sparkles className="w-3.5 h-3.5" />
                Marketing Campaigns
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {typesByCategory.marketing.map((type) => (
                  <CampaignTypeCard
                    key={type.value}
                    type={type}
                    selected={data.campaignType === type.value}
                    onSelect={() => handleChange('campaignType', type.value)}
                  />
                ))}
              </div>
            </div>

            {/* Internal Campaigns */}
            <div>
              <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-3 flex items-center gap-2">
                <Settings className="w-3.5 h-3.5" />
                Internal Campaigns
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {typesByCategory.internal.map((type) => (
                  <CampaignTypeCard
                    key={type.value}
                    type={type}
                    selected={data.campaignType === type.value}
                    onSelect={() => handleChange('campaignType', type.value)}
                  />
                ))}
              </div>
            </div>

            {errors?.campaignType && (
              <p className="text-xs text-error-600 mt-2">{errors.campaignType}</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Campaign Identity Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Megaphone className="w-4 h-4 text-gold-600" />
              </div>
              <CardTitle className="text-base font-heading">Campaign Identity</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Campaign Name"
              value={data.name}
              onChange={(v) => handleChange('name', v)}
              editable={isEditable}
              required
              error={errors?.name}
              placeholder="e.g., Q1 Lead Generation"
            />
            {!isCreateMode && (
              <UnifiedField
                label="Campaign Type"
                type="select"
                options={typeOptions}
                value={data.campaignType}
                onChange={(v) => handleChange('campaignType', v)}
                editable={isEditable}
                required
              />
            )}
          </CardContent>
        </Card>

        {/* Goals & Priority Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Goals & Priority</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <UnifiedField
              label="Primary Goal"
              type="select"
              options={goalOptions}
              value={data.goal}
              onChange={(v) => handleChange('goal', v)}
              editable={isEditable}
              required
              error={errors?.goal}
              placeholder="Select primary goal"
            />
            {isEditable ? (
              <div className="space-y-2">
                <label className="text-[11px] font-medium text-charcoal-500 uppercase tracking-wider flex items-center gap-2">
                  <Flag className="w-3.5 h-3.5" />
                  Priority
                </label>
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
                          : 'border-charcoal-100 bg-white text-charcoal-500 hover:border-charcoal-200'
                      )}
                    >
                      {priority.label}
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <UnifiedField
                label="Priority"
                type="select"
                options={priorityOptions}
                value={data.priority}
                onChange={(v) => handleChange('priority', v)}
                editable={false}
              />
            )}
          </CardContent>
        </Card>
      </div>

      {/* Description Card */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-heading">Description</CardTitle>
        </CardHeader>
        <CardContent>
          <UnifiedField
            label=""
            type="textarea"
            value={data.description}
            onChange={(v) => handleChange('description', v)}
            editable={isEditable}
            placeholder="Describe the campaign's objectives, target audience, and expected outcomes..."
            maxLength={500}
          />
        </CardContent>
      </Card>

      {/* Tags Card */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-purple-50 rounded-lg">
              <Tag className="w-4 h-4 text-purple-600" />
            </div>
            <CardTitle className="text-base font-heading">Tags</CardTitle>
          </div>
          <p className="text-sm text-charcoal-500 mt-1">
            Add tags to organize and filter campaigns
          </p>
        </CardHeader>
        <CardContent>
          {isEditable ? (
            <div className="space-y-3">
              <div className="flex flex-wrap gap-2">
                {data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center gap-1.5 px-3 py-1 bg-charcoal-50 rounded-full text-sm font-medium text-charcoal-700"
                  >
                    {tag}
                    <button
                      type="button"
                      onClick={() => handleRemoveTag(tag)}
                      className="w-4 h-4 rounded-full bg-charcoal-200 text-charcoal-500 hover:bg-charcoal-300 hover:text-charcoal-700 flex items-center justify-center text-xs"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
              <Input
                placeholder="Type a tag and press Enter..."
                className="h-11 rounded-lg border-charcoal-200"
                onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    const input = e.target as HTMLInputElement
                    handleAddTag(input.value)
                    input.value = ''
                  }
                }}
              />
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {data.tags.length > 0 ? (
                data.tags.map((tag) => (
                  <span
                    key={tag}
                    className="inline-flex items-center px-3 py-1 bg-charcoal-50 rounded-full text-sm font-medium text-charcoal-700"
                  >
                    {tag}
                  </span>
                ))
              ) : (
                <span className="text-sm text-charcoal-400 italic">No tags assigned</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============ HELPER COMPONENTS ============

interface CampaignTypeCardProps {
  type: {
    value: string
    label: string
    description: string
    category: 'client' | 'candidate' | 'marketing' | 'internal'
  }
  selected: boolean
  onSelect: () => void
}

function CampaignTypeCard({ type, selected, onSelect }: CampaignTypeCardProps) {
  const IconComponent = CATEGORY_ICONS[type.category]

  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'relative p-4 rounded-xl border-2 text-left transition-all duration-300 group hover:shadow-elevation-sm',
        selected
          ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
          : 'border-charcoal-100 bg-white hover:border-gold-200'
      )}
    >
      {selected && (
        <div className="absolute top-2 right-2">
          <CheckCircle2 className="w-4 h-4 text-gold-500" />
        </div>
      )}
      <div
        className={cn(
          'w-8 h-8 rounded-lg flex items-center justify-center mb-2 transition-colors',
          selected
            ? 'bg-gradient-to-br from-gold-400 to-gold-500 text-white shadow-gold-glow'
            : 'bg-charcoal-50 text-charcoal-400 group-hover:bg-gold-50 group-hover:text-gold-500'
        )}
      >
        <IconComponent className="w-4 h-4" />
      </div>
      <h3 className="text-sm font-semibold text-charcoal-900 mb-0.5">{type.label}</h3>
      <p className="text-xs text-charcoal-500 line-clamp-2">{type.description}</p>
    </button>
  )
}

export default CampaignSetupSection
