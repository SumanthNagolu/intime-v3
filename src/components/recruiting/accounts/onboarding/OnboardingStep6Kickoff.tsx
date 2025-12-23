'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAccountOnboardingStore } from '@/stores/account-onboarding-store'

export function OnboardingStep6Kickoff() {
  const { formData, setFormData, accountName } = useAccountOnboardingStore()

  return (
    <div className="space-y-6">
      {/* Kickoff Meeting */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Kickoff Meeting
        </h3>
        <label className="flex items-center gap-2">
          <Checkbox
            checked={formData.scheduleKickoff}
            onCheckedChange={(checked) => setFormData({ scheduleKickoff: !!checked })}
          />
          <span className="text-sm font-medium">Schedule kickoff meeting</span>
        </label>

        {formData.scheduleKickoff && (
          <div className="p-4 border rounded-lg space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Meeting Duration</Label>
                <Select
                  value={formData.kickoffDuration}
                  onValueChange={(v) => setFormData({ kickoffDuration: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30">30 minutes</SelectItem>
                    <SelectItem value="45">45 minutes</SelectItem>
                    <SelectItem value="60">60 minutes</SelectItem>
                    <SelectItem value="90">90 minutes</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Meeting Type</Label>
                <Select
                  value={formData.kickoffMeetingType}
                  onValueChange={(v) => setFormData({ kickoffMeetingType: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="video">Video Call (Zoom/Teams)</SelectItem>
                    <SelectItem value="phone">Phone Call</SelectItem>
                    <SelectItem value="in_person">In-Person</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Attendees</Label>
              <Textarea
                value={formData.kickoffAttendees}
                onChange={(e) => setFormData({ kickoffAttendees: e.target.value })}
                placeholder="List key attendees from client side..."
                rows={2}
              />
            </div>
          </div>
        )}
      </div>

      {/* Welcome Package */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Welcome Package
        </h3>
        <div className="space-y-3">
          <label className="flex items-center gap-2">
            <Checkbox
              checked={formData.sendWelcomeEmail}
              onCheckedChange={(checked) => setFormData({ sendWelcomeEmail: !!checked })}
            />
            <span className="text-sm">Send welcome email to primary contact</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={formData.includeCompanyDeck}
              onCheckedChange={(checked) => setFormData({ includeCompanyDeck: !!checked })}
            />
            <span className="text-sm">Include InTime company deck</span>
          </label>
          <label className="flex items-center gap-2">
            <Checkbox
              checked={formData.sharePortalAccess}
              onCheckedChange={(checked) => setFormData({ sharePortalAccess: !!checked })}
            />
            <span className="text-sm">Share client portal access credentials</span>
          </label>
        </div>
      </div>

      {/* Internal Notes */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Internal Notes
        </h3>
        <Textarea
          value={formData.internalNotes}
          onChange={(e) => setFormData({ internalNotes: e.target.value })}
          placeholder="Any internal notes about this account, special considerations, relationship history..."
          rows={4}
        />
      </div>

      {/* Summary */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Onboarding Summary
        </h3>
        <div className="p-4 bg-charcoal-50 rounded-lg space-y-3">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-charcoal-500">Account:</span>{' '}
              <span className="font-medium">{accountName || 'Not set'}</span>
            </div>
            <div>
              <span className="text-charcoal-500">Industries:</span>{' '}
              <span className="font-medium capitalize">
                {formData.industries.length > 0
                  ? formData.industries.map(i => i.replace(/_/g, ' ')).join(', ')
                  : 'Not set'}
              </span>
            </div>
            <div>
              <span className="text-charcoal-500">Payment Terms:</span>{' '}
              <span className="font-medium capitalize">
                {formData.paymentTerms.replace(/_/g, ' ') || 'Net 30'}
              </span>
            </div>
            <div>
              <span className="text-charcoal-500">Billing Frequency:</span>{' '}
              <span className="font-medium capitalize">
                {formData.billingFrequency || 'Bi-weekly'}
              </span>
            </div>
            <div>
              <span className="text-charcoal-500">Job Categories:</span>{' '}
              <span className="font-medium">{formData.selectedJobCategories.length} selected</span>
            </div>
            <div>
              <span className="text-charcoal-500">Kickoff Meeting:</span>{' '}
              <span className="font-medium">
                {formData.scheduleKickoff ? 'Yes' : 'No'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
