'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { ChevronRight, Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import {
  CreateCampaignFormData,
  CAMPAIGN_TYPES,
  GOALS,
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

export function CampaignSetupStep({
  formData,
  setFormData,
  onNext,
  onCancel,
  isFirst,
}: StepProps) {
  const isValid = formData.name.length >= 3 && formData.campaignType && formData.goal

  const handleNext = () => {
    if (isValid) {
      onNext()
    }
  }

  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <div>
          <Label htmlFor="name">Campaign Name *</Label>
          <Input
            id="name"
            placeholder="Q1 Tech Lead Gen Campaign"
            value={formData.name}
            onChange={(e) => setFormData({ name: e.target.value })}
            className="mt-1"
          />
          {formData.name.length > 0 && formData.name.length < 3 && (
            <p className="text-sm text-red-500 mt-1">Name must be at least 3 characters</p>
          )}
        </div>

        <div>
          <Label>Campaign Type *</Label>
          <RadioGroup
            onValueChange={(value) => setFormData({ campaignType: value as CreateCampaignFormData['campaignType'] })}
            value={formData.campaignType}
            className="grid grid-cols-2 gap-4 mt-2"
          >
            {CAMPAIGN_TYPES.map((type) => (
              <div key={type.value} className="relative">
                <RadioGroupItem
                  value={type.value}
                  id={type.value}
                  className="peer sr-only"
                />
                <label
                  htmlFor={type.value}
                  className={cn(
                    'flex flex-col p-4 border rounded-lg cursor-pointer transition-all',
                    'hover:border-charcoal-300',
                    'peer-data-[state=checked]:border-hublot-900 peer-data-[state=checked]:bg-hublot-50'
                  )}
                >
                  <span className="font-medium">{type.label}</span>
                  <span className="text-sm text-charcoal-500">{type.description}</span>
                </label>
              </div>
            ))}
          </RadioGroup>
        </div>

        <div>
          <Label htmlFor="goal">Primary Goal *</Label>
          <Select
            onValueChange={(value) => setFormData({ goal: value as CreateCampaignFormData['goal'] })}
            value={formData.goal}
          >
            <SelectTrigger className="mt-1">
              <SelectValue placeholder="Select goal" />
            </SelectTrigger>
            <SelectContent>
              {GOALS.map((goal) => (
                <SelectItem key={goal.value} value={goal.value}>
                  {goal.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            placeholder="Describe the campaign objectives..."
            className="min-h-[80px] mt-1"
            value={formData.description}
            onChange={(e) => setFormData({ description: e.target.value })}
          />
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <div />
        <div className="flex gap-2">
          <Button type="button" variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="button" onClick={handleNext} disabled={!isValid}>
            Next
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
