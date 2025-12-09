'use client'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { ChevronLeft, Loader2 } from 'lucide-react'
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

export function ComplianceStep({
  formData,
  setFormData,
  onPrev,
  onSubmit,
  isSubmitting,
}: StepProps) {
  return (
    <div className="space-y-6">
      <div className="border rounded-lg p-4">
        <h4 className="font-medium mb-4">Email Compliance</h4>
        <div className="space-y-4">
          <div className="flex items-start gap-3">
            <Checkbox
              id="gdpr"
              checked={formData.gdpr}
              onCheckedChange={(checked) => setFormData({ gdpr: !!checked })}
            />
            <div>
              <Label htmlFor="gdpr" className="font-normal cursor-pointer">GDPR Compliant</Label>
              <p className="text-sm text-charcoal-500">
                Ensure compliance with EU data protection regulations
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="canSpam"
              checked={formData.canSpam}
              onCheckedChange={(checked) => setFormData({ canSpam: !!checked })}
            />
            <div>
              <Label htmlFor="canSpam" className="font-normal cursor-pointer">CAN-SPAM Compliant</Label>
              <p className="text-sm text-charcoal-500">
                Follow US commercial email regulations
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="casl"
              checked={formData.casl}
              onCheckedChange={(checked) => setFormData({ casl: !!checked })}
            />
            <div>
              <Label htmlFor="casl" className="font-normal cursor-pointer">CASL Compliant</Label>
              <p className="text-sm text-charcoal-500">
                Follow Canadian anti-spam legislation
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox
              id="includeUnsubscribe"
              checked={formData.includeUnsubscribe}
              onCheckedChange={(checked) => setFormData({ includeUnsubscribe: !!checked })}
            />
            <div>
              <Label htmlFor="includeUnsubscribe" className="font-normal cursor-pointer">Include Unsubscribe Link</Label>
              <p className="text-sm text-charcoal-500">
                Add unsubscribe option to all emails (required)
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
        <h4 className="font-medium text-yellow-800 mb-2">Important Notice</h4>
        <p className="text-sm text-yellow-700">
          By creating this campaign, you confirm that you have obtained proper consent
          to contact the prospects in your target audience and will comply with all
          applicable email marketing regulations.
        </p>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t">
        <Button type="button" variant="outline" onClick={onPrev} disabled={isSubmitting}>
          <ChevronLeft className="w-4 h-4 mr-2" />
          Previous
        </Button>
        <Button type="button" onClick={onSubmit} disabled={isSubmitting}>
          {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
          Create Campaign
        </Button>
      </div>
    </div>
  )
}
