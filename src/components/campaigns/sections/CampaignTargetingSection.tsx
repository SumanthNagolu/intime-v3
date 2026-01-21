'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Users, Building2, MapPin, Briefcase, Plus, X, CheckCircle2, Filter } from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import { UnifiedField } from '@/components/accounts/fields/UnifiedField'
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

/**
 * CampaignTargetingSection - Unified component for Target Audience configuration
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

  const handleToggle = (field: string, value: string) => {
    if (onToggle) {
      onToggle(field, value)
    } else {
      // Fallback: handle toggle internally
      const currentArray = data[field as keyof CampaignTargetingSectionData] as string[]
      const isSelected = currentArray.includes(value)
      handleChange(
        field,
        isSelected ? currentArray.filter(v => v !== value) : [...currentArray, value]
      )
    }
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

      {/* Audience Source Selection - prominent in create mode */}
      {isCreateMode && (
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Users className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Audience Source</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {AUDIENCE_SOURCE_OPTIONS.map((source) => (
                <button
                  key={source.value}
                  type="button"
                  onClick={() => handleChange('audienceSource', source.value)}
                  className={cn(
                    'relative p-4 rounded-xl border-2 text-left transition-all duration-300 group hover:shadow-elevation-sm',
                    data.audienceSource === source.value
                      ? 'border-gold-400 bg-gradient-to-br from-gold-50/50 to-white shadow-gold-glow'
                      : 'border-charcoal-100 bg-white hover:border-gold-200'
                  )}
                >
                  {data.audienceSource === source.value && (
                    <div className="absolute top-3 right-3">
                      <CheckCircle2 className="w-4 h-4 text-gold-500" />
                    </div>
                  )}
                  <h3 className="text-sm font-semibold text-charcoal-900 mb-1">{source.label}</h3>
                  <p className="text-xs text-charcoal-500">{source.description}</p>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Industries Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Building2 className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Industries</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <div className="flex flex-wrap gap-2">
                {INDUSTRY_OPTIONS.map((industry) => {
                  const isSelected = data.industries.includes(industry)
                  return (
                    <button
                      key={industry}
                      type="button"
                      onClick={() => handleToggle('industries', industry)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white shadow-sm'
                          : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                      )}
                    >
                      {industry}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.industries.length > 0 ? (
                  data.industries.map((ind) => (
                    <Badge key={ind} variant="outline">{ind}</Badge>
                  ))
                ) : (
                  <span className="text-sm text-charcoal-400">All industries</span>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Company Sizes Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Users className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Company Size</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <div className="flex flex-wrap gap-2">
                {COMPANY_SIZE_OPTIONS.map((size) => {
                  const isSelected = data.companySizes.includes(size.value)
                  return (
                    <button
                      key={size.value}
                      type="button"
                      onClick={() => handleToggle('companySizes', size.value)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white shadow-sm'
                          : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                      )}
                    >
                      {size.label}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
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
          </CardContent>
        </Card>

        {/* Regions Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-orange-50 rounded-lg">
                <MapPin className="w-4 h-4 text-orange-600" />
              </div>
              <CardTitle className="text-base font-heading">Regions</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <div className="flex flex-wrap gap-2">
                {REGION_OPTIONS.map((region) => {
                  const isSelected = data.regions.includes(region.value)
                  return (
                    <button
                      key={region.value}
                      type="button"
                      onClick={() => handleToggle('regions', region.value)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium transition-all duration-200',
                        isSelected
                          ? 'bg-gradient-to-r from-hublot-800 to-hublot-900 text-white shadow-sm'
                          : 'bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200'
                      )}
                    >
                      {region.label}
                      {isSelected && <CheckCircle2 className="w-3.5 h-3.5 ml-0.5" />}
                    </button>
                  )
                })}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
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
          </CardContent>
        </Card>

        {/* Target Titles Card */}
        <Card className="shadow-elevation-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Briefcase className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Target Titles</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable && (
              <div className="flex gap-2 mb-3">
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
                  size="sm"
                  onClick={handleAddTitle}
                  className="h-10"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.targetTitles.length > 0 ? (
                data.targetTitles.map((title) => (
                  <Badge key={title} variant="outline" className="gap-1">
                    {title}
                    {isEditable && (
                      <button
                        type="button"
                        onClick={() => handleRemoveTitle(title)}
                        className="ml-1 hover:text-error-500"
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
          </CardContent>
        </Card>
      </div>

      {/* Exclusions Card */}
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-charcoal-100 rounded-lg">
              <Filter className="w-4 h-4 text-charcoal-600" />
            </div>
            <CardTitle className="text-base font-heading">Exclusions</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <UnifiedField
            label="Exclude Existing Clients"
            type="switch"
            value={data.excludeExistingClients}
            onChange={(v) => handleChange('excludeExistingClients', v)}
            editable={isEditable}
            helpText="Don't target contacts from active client accounts"
          />
          <UnifiedField
            label="Exclude Recently Contacted (days)"
            type="number"
            value={String(data.excludeRecentlyContacted)}
            onChange={(v) => handleChange('excludeRecentlyContacted', parseInt(String(v), 10) || 0)}
            editable={isEditable}
            min={0}
            max={365}
            helpText="Contacts reached in the last N days will be excluded"
          />
          <UnifiedField
            label="Exclude Competitors"
            type="switch"
            value={data.excludeCompetitors}
            onChange={(v) => handleChange('excludeCompetitors', v)}
            editable={isEditable}
            helpText="Don't target contacts from competitor companies"
          />
        </CardContent>
      </Card>
    </div>
  )
}

export default CampaignTargetingSection
