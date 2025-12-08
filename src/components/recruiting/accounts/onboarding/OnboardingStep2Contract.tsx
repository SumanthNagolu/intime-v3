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

export function OnboardingStep2Contract() {
  const { formData, setFormData } = useAccountOnboardingStore()

  return (
    <div className="space-y-6">
      {/* Contract Type */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Contract Type
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Agreement Type</Label>
            <Select
              value={formData.contractType}
              onValueChange={(v) => setFormData({ contractType: v })}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="msa">Master Service Agreement (MSA)</SelectItem>
                <SelectItem value="sow">Statement of Work (SOW)</SelectItem>
                <SelectItem value="staffing">Staffing Agreement</SelectItem>
                <SelectItem value="rpo">RPO Agreement</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Contract Signed Date</Label>
            <Input
              type="date"
              value={formData.contractSignedDate}
              onChange={(e) => setFormData({ contractSignedDate: e.target.value })}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Start Date</Label>
            <Input
              type="date"
              value={formData.contractStartDate}
              onChange={(e) => setFormData({ contractStartDate: e.target.value })}
            />
          </div>
          <div className="space-y-2">
            <Label>End Date</Label>
            <Input
              type="date"
              value={formData.contractEndDate}
              onChange={(e) => setFormData({ contractEndDate: e.target.value })}
              disabled={formData.isEvergreen}
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={formData.isEvergreen}
            onCheckedChange={(checked) => setFormData({ isEvergreen: !!checked })}
          />
          <span className="text-sm">Evergreen contract (auto-renews)</span>
        </label>
      </div>

      {/* Terms */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Contract Terms
        </h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>Conversion Fee %</Label>
            <Input
              type="number"
              value={formData.conversionFeePercent}
              onChange={(e) => setFormData({ conversionFeePercent: e.target.value })}
              placeholder="20"
              min={0}
              max={100}
            />
          </div>
          <div className="space-y-2">
            <Label>Guarantee Period (Days)</Label>
            <Input
              type="number"
              value={formData.guaranteePeriodDays}
              onChange={(e) => setFormData({ guaranteePeriodDays: e.target.value })}
              placeholder="30"
              min={0}
            />
          </div>
          <div className="space-y-2">
            <Label>Notice Period (Weeks)</Label>
            <Input
              type="number"
              value={formData.noticePeriodWeeks}
              onChange={(e) => setFormData({ noticePeriodWeeks: e.target.value })}
              placeholder="2"
              min={0}
            />
          </div>
        </div>

        <label className="flex items-center gap-2">
          <Checkbox
            checked={formData.useCustomRateCard}
            onCheckedChange={(checked) => setFormData({ useCustomRateCard: !!checked })}
          />
          <span className="text-sm">Use custom rate card (non-standard pricing)</span>
        </label>
      </div>

      {/* Notes */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Contract Notes
        </h3>
        <Textarea
          value={formData.contractNotes}
          onChange={(e) => setFormData({ contractNotes: e.target.value })}
          placeholder="Any special terms, conditions, or notes about the contract..."
          rows={4}
        />
      </div>
    </div>
  )
}
