'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useJobIntakeStore, ROLE_OPEN_REASONS } from '@/stores/job-intake-store'
import { cn } from '@/lib/utils'

export function IntakeStep3RoleDetails() {
  const { formData, setFormData } = useJobIntakeStore()

  return (
    <div className="space-y-6">
      {/* Job Description Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Job Description
        </h3>

        <div className="space-y-2">
          <Label>Role Summary *</Label>
          <Textarea
            value={formData.roleSummary}
            onChange={(e) => setFormData({ roleSummary: e.target.value })}
            placeholder="Describe what this role is about and its impact..."
            rows={4}
          />
          <p className="text-xs text-charcoal-500">
            {formData.roleSummary.length}/20 characters minimum
          </p>
        </div>

        <div className="space-y-2">
          <Label>Key Responsibilities *</Label>
          <Textarea
            value={formData.responsibilities}
            onChange={(e) => setFormData({ responsibilities: e.target.value })}
            placeholder="&#8226; Design and build scalable services&#10;&#8226; Own end-to-end development&#10;&#8226; Mentor junior engineers"
            rows={5}
          />
          <p className="text-xs text-charcoal-500">
            {formData.responsibilities.length}/20 characters minimum
          </p>
        </div>

        <div className="space-y-2">
          <Label>Why This Role is Open</Label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPEN_REASONS.map((reason) => (
              <button
                key={reason.value}
                type="button"
                onClick={() => setFormData({ roleOpenReason: reason.value })}
                className={cn(
                  'p-2 rounded-lg border-2 text-sm transition-colors text-left',
                  formData.roleOpenReason === reason.value
                    ? 'border-hublot-700 bg-hublot-50'
                    : 'border-charcoal-200 hover:border-charcoal-300'
                )}
              >
                {reason.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Structure Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Team Structure
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Team Name</Label>
            <Input
              value={formData.teamName}
              onChange={(e) => setFormData({ teamName: e.target.value })}
              placeholder="e.g., Payments Team"
            />
          </div>
          <div className="space-y-2">
            <Label>Team Size</Label>
            <Input
              type="number"
              value={formData.teamSize}
              onChange={(e) => setFormData({ teamSize: e.target.value })}
              placeholder="8"
              min={1}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Reports To</Label>
            <Input
              value={formData.reportsTo}
              onChange={(e) => setFormData({ reportsTo: e.target.value })}
              placeholder="e.g., VP Engineering"
            />
          </div>
          <div className="space-y-2">
            <Label>Direct Reports</Label>
            <Input
              type="number"
              value={formData.directReports}
              onChange={(e) => setFormData({ directReports: e.target.value })}
              placeholder="0"
              min={0}
            />
          </div>
        </div>
      </div>

      {/* Key Projects & Success Metrics Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Key Projects & Success Metrics
        </h3>

        <div className="space-y-2">
          <Label>What Will This Person Work On?</Label>
          <Textarea
            value={formData.keyProjects}
            onChange={(e) => setFormData({ keyProjects: e.target.value })}
            placeholder="&#8226; Real-time payment processing&#10;&#8226; Fraud detection integration&#10;&#8226; Performance optimization"
            rows={4}
          />
        </div>

        <div className="space-y-2">
          <Label>Success Metrics (First 90 Days)</Label>
          <Textarea
            value={formData.successMetrics}
            onChange={(e) => setFormData({ successMetrics: e.target.value })}
            placeholder="&#8226; Onboard and ship first feature by Day 30&#10;&#8226; Own a service component by Day 60&#10;&#8226; Join on-call rotation by Day 90"
            rows={4}
          />
        </div>
      </div>
    </div>
  )
}
