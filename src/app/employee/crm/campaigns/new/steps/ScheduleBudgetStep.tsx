'use client'

import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { CreateCampaignFormData } from '@/stores/create-campaign-store'

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

export function ScheduleBudgetStep({
  formData,
  setFormData,
  onNext,
  onPrev,
}: StepProps) {
  const isValid = formData.startDate && formData.endDate

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="startDate">Start Date *</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ startDate: e.target.value })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="endDate">End Date *</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ endDate: e.target.value })}
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex items-center justify-between border rounded-lg p-4">
        <div>
          <Label>Launch Immediately</Label>
          <p className="text-sm text-charcoal-500">Start campaign as soon as it's created</p>
        </div>
        <Switch
          checked={formData.launchImmediately}
          onCheckedChange={(checked) => setFormData({ launchImmediately: checked })}
        />
      </div>

      <div className="border-t pt-4">
        <h4 className="text-sm font-medium mb-4">Budget & Targets</h4>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="budgetTotal">Campaign Budget ($)</Label>
            <Input
              id="budgetTotal"
              type="number"
              min={0}
              value={formData.budgetTotal}
              onChange={(e) => setFormData({ budgetTotal: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="targetRevenue">Target Revenue ($)</Label>
            <Input
              id="targetRevenue"
              type="number"
              min={0}
              value={formData.targetRevenue}
              onChange={(e) => setFormData({ targetRevenue: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="targetLeads">Target Leads</Label>
            <Input
              id="targetLeads"
              type="number"
              min={0}
              value={formData.targetLeads}
              onChange={(e) => setFormData({ targetLeads: Number(e.target.value) })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="targetMeetings">Target Meetings</Label>
            <Input
              id="targetMeetings"
              type="number"
              min={0}
              value={formData.targetMeetings}
              onChange={(e) => setFormData({ targetMeetings: Number(e.target.value) })}
              className="mt-1"
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
        <Button type="button" onClick={onNext} disabled={!isValid}>
          Next
          <ChevronRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  )
}
