'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useJobIntakeStore, ROLE_OPEN_REASONS } from '@/stores/job-intake-store'
import { cn } from '@/lib/utils'
import { FileText, Users2, Target, TrendingUp, HelpCircle } from 'lucide-react'

export function IntakeStep3RoleDetails() {
  const { formData, setFormData } = useJobIntakeStore()

  return (
    <div className="space-y-8">
      {/* Job Description Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Role Description
          </h3>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Role Summary *
            <span className="text-xs text-charcoal-400 font-normal">
              (A brief overview of the position)
            </span>
          </Label>
          <Textarea
            value={formData.roleSummary}
            onChange={(e) => setFormData({ roleSummary: e.target.value })}
            placeholder="We are looking for a Senior Backend Engineer to join our Platform team. This role will focus on building scalable microservices and APIs that power our core product..."
            rows={4}
            className="resize-none"
          />
          <div className="flex justify-between text-xs text-charcoal-500">
            <span>{formData.roleSummary.length} characters</span>
            <span className={formData.roleSummary.length >= 20 ? 'text-green-600' : 'text-amber-600'}>
              {formData.roleSummary.length >= 20 ? '✓ Minimum met' : 'Minimum 20 characters'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Key Responsibilities *
            <span className="text-xs text-charcoal-400 font-normal">
              (Use bullet points for clarity)
            </span>
          </Label>
          <Textarea
            value={formData.responsibilities}
            onChange={(e) => setFormData({ responsibilities: e.target.value })}
            placeholder="• Design and implement scalable backend services&#10;• Own end-to-end development from architecture to deployment&#10;• Collaborate with frontend engineers and product managers&#10;• Mentor junior team members&#10;• Participate in code reviews and technical discussions"
            rows={6}
            className="resize-none font-mono text-sm"
          />
          <div className="flex justify-between text-xs text-charcoal-500">
            <span>{formData.responsibilities.length} characters</span>
            <span className={formData.responsibilities.length >= 20 ? 'text-green-600' : 'text-amber-600'}>
              {formData.responsibilities.length >= 20 ? '✓ Minimum met' : 'Minimum 20 characters'}
            </span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <HelpCircle className="w-3.5 h-3.5 text-charcoal-400" />
            Why is this role open?
          </Label>
          <div className="grid grid-cols-2 gap-2">
            {ROLE_OPEN_REASONS.map((reason) => (
              <button
                key={reason.value}
                type="button"
                onClick={() => setFormData({ roleOpenReason: reason.value })}
                className={cn(
                  'p-3 rounded-lg border-2 text-left transition-all duration-200',
                  formData.roleOpenReason === reason.value
                    ? 'border-gold-500 bg-gold-50 text-charcoal-900 shadow-sm'
                    : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50'
                )}
              >
                <span className="text-sm font-medium">{reason.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Team Structure Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <Users2 className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Team Structure
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Team / Department Name</Label>
            <Input
              value={formData.teamName}
              onChange={(e) => setFormData({ teamName: e.target.value })}
              placeholder="e.g., Platform Engineering, Payments Team"
            />
          </div>
          <div className="space-y-2">
            <Label>Current Team Size</Label>
            <Select
              value={formData.teamSize}
              onValueChange={(value) => setFormData({ teamSize: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-3">1-3 people (Small)</SelectItem>
                <SelectItem value="4-6">4-6 people (Medium)</SelectItem>
                <SelectItem value="7-10">7-10 people (Large)</SelectItem>
                <SelectItem value="11-20">11-20 people (XL)</SelectItem>
                <SelectItem value="20+">20+ people (Enterprise)</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Reports To</Label>
            <Input
              value={formData.reportsTo}
              onChange={(e) => setFormData({ reportsTo: e.target.value })}
              placeholder="e.g., VP of Engineering, Engineering Manager"
            />
          </div>
          <div className="space-y-2">
            <Label>Will Have Direct Reports?</Label>
            <Select
              value={formData.directReports}
              onValueChange={(value) => setFormData({ directReports: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">No (Individual Contributor)</SelectItem>
                <SelectItem value="1-2">1-2 reports</SelectItem>
                <SelectItem value="3-5">3-5 reports</SelectItem>
                <SelectItem value="6-10">6-10 reports</SelectItem>
                <SelectItem value="10+">10+ reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Key Projects & Success Metrics Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Projects & Success Metrics
          </h3>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            Key Projects This Person Will Work On
            <span className="text-xs text-charcoal-400 font-normal">(Optional)</span>
          </Label>
          <Textarea
            value={formData.keyProjects}
            onChange={(e) => setFormData({ keyProjects: e.target.value })}
            placeholder="• Real-time payment processing system&#10;• Fraud detection integration with ML models&#10;• API gateway modernization&#10;• Performance optimization initiatives"
            rows={4}
            className="resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <TrendingUp className="w-3.5 h-3.5 text-charcoal-400" />
            Success Metrics (First 90 Days)
            <span className="text-xs text-charcoal-400 font-normal">(Optional)</span>
          </Label>
          <Textarea
            value={formData.successMetrics}
            onChange={(e) => setFormData({ successMetrics: e.target.value })}
            placeholder="• Day 30: Complete onboarding and ship first feature&#10;• Day 60: Own a service component independently&#10;• Day 90: Join on-call rotation, contribute to architecture decisions"
            rows={4}
            className="resize-none"
          />
          <p className="text-xs text-charcoal-500">
            These help candidates understand what &quot;success&quot; looks like in this role
          </p>
        </div>
      </div>
    </div>
  )
}
