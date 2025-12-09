'use client'

import { useState } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CreateCampaignFormData,
  INDUSTRIES,
  COMPANY_SIZES,
  REGIONS,
} from '@/stores/create-campaign-store'

interface StepProps {
  formData: CreateCampaignFormData
  setFormData: (data: Partial<CreateCampaignFormData>) => void
  onNext: () => void
  onPrev: () => void
  onSubmit: () => void
  onCancel: () => void
  isFirst: boolean
  isLast: boolean
  isSubmitting: boolean
}

export function TargetAudienceStep({
  formData,
  setFormData,
  onNext,
  onPrev,
}: StepProps) {
  const [titleInput, setTitleInput] = useState('')

  const addTitle = () => {
    if (titleInput.trim() && !formData.targetTitles.includes(titleInput.trim())) {
      setFormData({ targetTitles: [...formData.targetTitles, titleInput.trim()] })
      setTitleInput('')
    }
  }

  const removeTitle = (title: string) => {
    setFormData({ targetTitles: formData.targetTitles.filter(t => t !== title) })
  }

  const toggleArrayValue = (field: 'industries' | 'companySizes' | 'regions', value: string) => {
    const current = formData[field]
    if (current.includes(value)) {
      setFormData({ [field]: current.filter((v: string) => v !== value) })
    } else {
      setFormData({ [field]: [...current, value] })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <Label>Audience Source *</Label>
        <RadioGroup
          onValueChange={(value) => setFormData({ audienceSource: value as CreateCampaignFormData['audienceSource'] })}
          value={formData.audienceSource}
          className="grid grid-cols-2 gap-4 mt-2"
        >
          <div className="relative">
            <RadioGroupItem value="new_prospects" id="new_prospects" className="peer sr-only" />
            <label htmlFor="new_prospects" className={cn(
              'flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-charcoal-300',
              'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
            )}>
              <span className="font-medium">New Prospects</span>
              <span className="text-sm text-charcoal-500">Build list from scratch</span>
            </label>
          </div>
          <div className="relative">
            <RadioGroupItem value="existing_leads" id="existing_leads" className="peer sr-only" />
            <label htmlFor="existing_leads" className={cn(
              'flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-charcoal-300',
              'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
            )}>
              <span className="font-medium">Existing Leads</span>
              <span className="text-sm text-charcoal-500">From your CRM</span>
            </label>
          </div>
          <div className="relative">
            <RadioGroupItem value="dormant_accounts" id="dormant_accounts" className="peer sr-only" />
            <label htmlFor="dormant_accounts" className={cn(
              'flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-charcoal-300',
              'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
            )}>
              <span className="font-medium">Dormant Accounts</span>
              <span className="text-sm text-charcoal-500">Re-engage old clients</span>
            </label>
          </div>
          <div className="relative">
            <RadioGroupItem value="import_list" id="import_list" className="peer sr-only" />
            <label htmlFor="import_list" className={cn(
              'flex flex-col p-4 border rounded-lg cursor-pointer transition-all hover:border-charcoal-300',
              'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
            )}>
              <span className="font-medium">Import List</span>
              <span className="text-sm text-charcoal-500">Upload CSV/Excel</span>
            </label>
          </div>
        </RadioGroup>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Industry Filters</h4>
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((industry) => {
            const selected = formData.industries.includes(industry)
            return (
              <Badge
                key={industry}
                variant={selected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayValue('industries', industry)}
              >
                {industry}
              </Badge>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Company Size</h4>
        <div className="flex flex-wrap gap-2">
          {COMPANY_SIZES.map((size) => {
            const selected = formData.companySizes.includes(size.value)
            return (
              <Badge
                key={size.value}
                variant={selected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayValue('companySizes', size.value)}
              >
                {size.label}
              </Badge>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Regions</h4>
        <div className="flex flex-wrap gap-2">
          {REGIONS.map((region) => {
            const selected = formData.regions.includes(region.value)
            return (
              <Badge
                key={region.value}
                variant={selected ? 'default' : 'outline'}
                className="cursor-pointer"
                onClick={() => toggleArrayValue('regions', region.value)}
              >
                {region.label}
              </Badge>
            )
          })}
        </div>
      </div>

      <div className="space-y-4">
        <h4 className="text-sm font-medium">Target Titles</h4>
        <div className="flex gap-2">
          <Input
            placeholder="e.g., VP Engineering, CTO"
            value={titleInput}
            onChange={(e) => setTitleInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') {
                e.preventDefault()
                addTitle()
              }
            }}
          />
          <Button type="button" variant="outline" onClick={addTitle}>Add</Button>
        </div>
        {formData.targetTitles.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.targetTitles.map((title) => (
              <Badge key={title} variant="secondary" className="flex items-center gap-1">
                {title}
                <button type="button" onClick={() => removeTitle(title)} className="hover:text-red-500">
                  <X className="w-3 h-3" />
                </button>
              </Badge>
            ))}
          </div>
        )}
      </div>

      <div className="border-t pt-4 space-y-4">
        <h4 className="text-sm font-medium">Exclusions</h4>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="font-normal">Exclude existing clients</Label>
            <Switch
              checked={formData.excludeExistingClients}
              onCheckedChange={(checked) => setFormData({ excludeExistingClients: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-normal">Exclude competitors</Label>
            <Switch
              checked={formData.excludeCompetitors}
              onCheckedChange={(checked) => setFormData({ excludeCompetitors: checked })}
            />
          </div>
          <div className="flex items-center justify-between">
            <Label className="font-normal">Exclude contacted within (days)</Label>
            <Input
              type="number"
              className="w-20"
              value={formData.excludeRecentlyContacted}
              onChange={(e) => setFormData({ excludeRecentlyContacted: Number(e.target.value) })}
            />
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrev}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button type="button" onClick={onNext}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
