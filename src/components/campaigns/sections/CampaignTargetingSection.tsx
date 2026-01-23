'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Users, Building2, MapPin, Briefcase, Plus, X, Filter, Database } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { MultiSelectDropdown, type MultiSelectOption } from '@/components/ui/multi-select-dropdown'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { SectionMode, CampaignTargetingSectionData } from '@/lib/campaigns/types'
import {
  AUDIENCE_SOURCE_OPTIONS,
  INDUSTRY_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  REGION_OPTIONS,
} from '@/lib/campaigns/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface CampaignTargetingSectionProps {
  mode: SectionMode
  data: CampaignTargetingSectionData
  onChange?: (field: string, value: unknown) => void
  onToggle?: (field: string, value: string) => void
  onEdit?: () => void
  onSave?: () => Promise<void>
  onCancel?: () => void
  isSaving?: boolean
  errors?: Record<string, string>
  className?: string
}

// Convert options to MultiSelectOption format
const industryOptions: MultiSelectOption[] = INDUSTRY_OPTIONS.map((ind) => ({
  value: ind,
  label: ind,
}))

const companySizeOptions: MultiSelectOption[] = COMPANY_SIZE_OPTIONS.map((size) => ({
  value: size.value,
  label: size.label,
}))

const regionOptions: MultiSelectOption[] = REGION_OPTIONS.map((region) => ({
  value: region.value,
  label: region.label,
  group: region.value.startsWith('US') ? 'United States' : 'International',
}))

/**
 * CampaignTargetingSection - Unified component for Target Audience configuration
 *
 * Redesigned with:
 * - Multi-select dropdowns instead of tag chips
 * - Horizontal label:value layout (Guidewire style)
 * - Compact, professional appearance
 */
export function CampaignTargetingSection({
  mode,
  data,
  onChange,
  onToggle,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: CampaignTargetingSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  const [newTitle, setNewTitle] = React.useState('')

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleAddTitle = () => {
    if (newTitle.trim() && !data.targetTitles.includes(newTitle.trim())) {
      handleChange('targetTitles', [...data.targetTitles, newTitle.trim()])
      setNewTitle('')
    }
  }

  const handleRemoveTitle = (title: string) => {
    handleChange('targetTitles', data.targetTitles.filter(t => t !== title))
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
          title="Target Audience"
          subtitle="Define who you want to reach with this campaign"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Audience Source Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Database className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Audience Source</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Source Selection */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0">
                Source
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <Select
                    value={data.audienceSource}
                    onValueChange={(v) => handleChange('audienceSource', v)}
                  >
                    <SelectTrigger className="h-10">
                      <SelectValue placeholder="Select audience source..." />
                    </SelectTrigger>
                    <SelectContent>
                      {AUDIENCE_SOURCE_OPTIONS.map((source) => (
                        <SelectItem key={source.value} value={source.value}>
                          <div className="flex flex-col">
                            <span className="font-medium">{source.label}</span>
                            <span className="text-xs text-charcoal-500">{source.description}</span>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-charcoal-900 py-2">
                    {AUDIENCE_SOURCE_OPTIONS.find(s => s.value === data.audienceSource)?.label || '—'}
                  </p>
                )}
              </div>
            </div>

            {/* Target Titles */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" />
                Job Titles
              </Label>
              <div className="flex-1">
                {isEditable && (
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={newTitle}
                      onChange={(e) => setNewTitle(e.target.value)}
                      placeholder="Add job title (e.g., VP of Engineering)"
                      onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddTitle())}
                      className="h-10"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="icon"
                      onClick={handleAddTitle}
                      className="h-10 w-10 shrink-0"
                    >
                      <Plus className="w-4 h-4" />
                    </Button>
                  </div>
                )}
                <div className="flex flex-wrap gap-1.5">
                  {data.targetTitles.length > 0 ? (
                    data.targetTitles.map((title) => (
                      <Badge key={title} variant="outline" className="gap-1 font-normal">
                        {title}
                        {isEditable && (
                          <button
                            type="button"
                            onClick={() => handleRemoveTitle(title)}
                            className="ml-0.5 hover:text-red-500"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-charcoal-400">No specific titles</span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Targeting Filters Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Filter className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Targeting Filters</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Industries - Multi-select Dropdown */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0 flex items-center gap-1">
                <Building2 className="w-3.5 h-3.5" />
                Industries
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <MultiSelectDropdown
                    placeholder="Select industries..."
                    options={industryOptions}
                    value={data.industries}
                    onChange={(v) => handleChange('industries', v)}
                    maxDisplay={2}
                    showSelectAll={true}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.industries.length > 0 ? (
                      data.industries.map((ind) => (
                        <Badge key={ind} variant="outline">{ind}</Badge>
                      ))
                    ) : (
                      <span className="text-sm text-charcoal-400">All industries</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Company Sizes - Multi-select Dropdown */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0 flex items-center gap-1">
                <Users className="w-3.5 h-3.5" />
                Company Size
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <MultiSelectDropdown
                    placeholder="Select company sizes..."
                    options={companySizeOptions}
                    value={data.companySizes}
                    onChange={(v) => handleChange('companySizes', v)}
                    maxDisplay={3}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.companySizes.length > 0 ? (
                      data.companySizes.map((size) => {
                        const sizeOption = COMPANY_SIZE_OPTIONS.find(s => s.value === size)
                        return <Badge key={size} variant="outline">{sizeOption?.label || size}</Badge>
                      })
                    ) : (
                      <span className="text-sm text-charcoal-400">All sizes</span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Regions - Multi-select Dropdown */}
            <div className="flex items-start gap-4">
              <Label className="text-sm font-medium text-charcoal-700 w-28 pt-2.5 shrink-0 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5" />
                Regions
              </Label>
              <div className="flex-1">
                {isEditable ? (
                  <MultiSelectDropdown
                    placeholder="Select regions..."
                    options={regionOptions}
                    value={data.regions}
                    onChange={(v) => handleChange('regions', v)}
                    maxDisplay={2}
                    showSelectAll={true}
                  />
                ) : (
                  <div className="flex flex-wrap gap-1.5">
                    {data.regions.length > 0 ? (
                      data.regions.map((region) => {
                        const regionOption = REGION_OPTIONS.find(r => r.value === region)
                        return <Badge key={region} variant="outline">{regionOption?.label || region}</Badge>
                      })
                    ) : (
                      <span className="text-sm text-charcoal-400">All regions</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Exclusions Card - Full Width */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-charcoal-100 rounded-lg">
              <X className="w-4 h-4 text-charcoal-600" />
            </div>
            <CardTitle className="text-base font-heading">Exclusions</CardTitle>
          </div>
          <p className="text-xs text-charcoal-500 mt-1">
            Define contacts to exclude from this campaign
          </p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Exclude Existing Clients */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">
                  Exclude Existing Clients
                </Label>
                <p className="text-xs text-charcoal-500">
                  Don't target contacts from active client accounts
                </p>
              </div>
              <Switch
                checked={data.excludeExistingClients}
                onCheckedChange={(v) => handleChange('excludeExistingClients', v)}
                disabled={!isEditable}
              />
            </div>

            {/* Exclude Competitors */}
            <div className="flex items-center justify-between gap-4">
              <div className="space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">
                  Exclude Competitors
                </Label>
                <p className="text-xs text-charcoal-500">
                  Don't target contacts from competitor companies
                </p>
              </div>
              <Switch
                checked={data.excludeCompetitors}
                onCheckedChange={(v) => handleChange('excludeCompetitors', v)}
                disabled={!isEditable}
              />
            </div>

            {/* Exclude Recently Contacted */}
            <div className="flex items-start gap-4">
              <div className="flex-1 space-y-0.5">
                <Label className="text-sm font-medium text-charcoal-700">
                  Exclude Recently Contacted
                </Label>
                <p className="text-xs text-charcoal-500">
                  Days since last contact
                </p>
              </div>
              <div className="w-20">
                <Input
                  type="number"
                  value={data.excludeRecentlyContacted}
                  onChange={(e) => handleChange('excludeRecentlyContacted', parseInt(e.target.value, 10) || 0)}
                  disabled={!isEditable}
                  min={0}
                  max={365}
                  className="h-9 text-center"
                />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignTargetingSection
