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
import { useCreateJobStore, ROLE_OPEN_REASONS } from '@/stores/create-job-store'
import { Section, FieldGroup, SelectCard, ValidationBanner } from './shared'
import { FileText, Users, Target, TrendingUp } from 'lucide-react'

export function JobIntakeStep3RoleDetails() {
  const { formData, setFormData } = useCreateJobStore()

  const validationItems: string[] = []
  if (!formData.roleSummary || formData.roleSummary.length < 20) {
    validationItems.push('Provide a role summary (at least 20 characters)')
  }

  return (
    <div className="space-y-10">
      {/* Role Summary */}
      <Section icon={FileText} title="Role Summary" subtitle="Brief overview of the position">
        <div className="space-y-2">
          <Label htmlFor="roleSummary" className="text-charcoal-700 font-medium">
            Role Summary <span className="text-gold-500">*</span>
          </Label>
          <Textarea
            id="roleSummary"
            value={formData.roleSummary}
            onChange={(e) => setFormData({ roleSummary: e.target.value })}
            placeholder="Provide a 2-3 sentence overview of this role, its importance, and key impact areas..."
            rows={4}
            className="rounded-xl border-charcoal-200 bg-white resize-none"
          />
          <p className="text-xs text-charcoal-500">
            {formData.roleSummary.length}/500 characters
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="responsibilities" className="text-charcoal-700 font-medium">
            Key Responsibilities
          </Label>
          <Textarea
            id="responsibilities"
            value={formData.responsibilities}
            onChange={(e) => setFormData({ responsibilities: e.target.value })}
            placeholder="• Design and implement scalable backend services&#10;• Collaborate with cross-functional teams&#10;• Mentor junior developers&#10;• Participate in code reviews..."
            rows={6}
            className="rounded-xl border-charcoal-200 bg-white resize-none font-mono text-sm"
          />
          <p className="text-xs text-charcoal-500">
            Use bullet points (•) for each responsibility
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="description" className="text-charcoal-700 font-medium">
            Full Job Description
          </Label>
          <Textarea
            id="description"
            value={formData.description}
            onChange={(e) => setFormData({ description: e.target.value })}
            placeholder="Detailed job description that will be used for postings..."
            rows={8}
            className="rounded-xl border-charcoal-200 bg-white resize-none"
          />
        </div>
      </Section>

      {/* Why is this role open? */}
      <Section icon={TrendingUp} title="Why is this role open?" subtitle="Reason for the requisition">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROLE_OPEN_REASONS.map((reason) => (
            <SelectCard
              key={reason.value}
              selected={formData.roleOpenReason === reason.value}
              onClick={() => setFormData({ roleOpenReason: reason.value })}
            >
              <div className="text-center">
                <span className="text-2xl mb-2 block">{reason.icon}</span>
                <span className="text-sm font-semibold text-charcoal-800 block">{reason.label}</span>
              </div>
            </SelectCard>
          ))}
        </div>
      </Section>

      {/* Team Information */}
      <Section icon={Users} title="Team Information" subtitle="About the team and reporting structure">
        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="teamName" className="text-charcoal-700 font-medium">
              Team / Department Name
            </Label>
            <Input
              id="teamName"
              value={formData.teamName}
              onChange={(e) => setFormData({ teamName: e.target.value })}
              placeholder="e.g., Platform Engineering, Product Design"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="teamSize" className="text-charcoal-700 font-medium">
              Current Team Size
            </Label>
            <Select
              value={formData.teamSize}
              onValueChange={(value) => setFormData({ teamSize: value })}
            >
              <SelectTrigger id="teamSize" className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select team size" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-5">1-5 people</SelectItem>
                <SelectItem value="6-10">6-10 people</SelectItem>
                <SelectItem value="11-20">11-20 people</SelectItem>
                <SelectItem value="21-50">21-50 people</SelectItem>
                <SelectItem value="50+">50+ people</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldGroup>

        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="reportsTo" className="text-charcoal-700 font-medium">
              Reports To (Title)
            </Label>
            <Input
              id="reportsTo"
              value={formData.reportsTo}
              onChange={(e) => setFormData({ reportsTo: e.target.value })}
              placeholder="e.g., VP of Engineering, Director of Product"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="directReports" className="text-charcoal-700 font-medium">
              Direct Reports
            </Label>
            <Select
              value={formData.directReports}
              onValueChange={(value) => setFormData({ directReports: value })}
            >
              <SelectTrigger id="directReports" className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select number" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">None (Individual Contributor)</SelectItem>
                <SelectItem value="1-3">1-3 direct reports</SelectItem>
                <SelectItem value="4-6">4-6 direct reports</SelectItem>
                <SelectItem value="7-10">7-10 direct reports</SelectItem>
                <SelectItem value="10+">10+ direct reports</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </FieldGroup>
      </Section>

      {/* Success Metrics */}
      <Section icon={Target} title="Success Metrics" subtitle="How will success be measured?">
        <div className="space-y-2">
          <Label htmlFor="keyProjects" className="text-charcoal-700 font-medium">
            Key Projects / Initiatives
          </Label>
          <Textarea
            id="keyProjects"
            value={formData.keyProjects}
            onChange={(e) => setFormData({ keyProjects: e.target.value })}
            placeholder="What major projects or initiatives will this person work on in the first 6-12 months?"
            rows={3}
            className="rounded-xl border-charcoal-200 bg-white resize-none"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="successMetrics" className="text-charcoal-700 font-medium">
            Success Metrics / KPIs
          </Label>
          <Textarea
            id="successMetrics"
            value={formData.successMetrics}
            onChange={(e) => setFormData({ successMetrics: e.target.value })}
            placeholder="• Reduce system latency by 30%&#10;• Ship 2 major features per quarter&#10;• Maintain 99.9% uptime&#10;• Mentor 2 junior engineers..."
            rows={4}
            className="rounded-xl border-charcoal-200 bg-white resize-none font-mono text-sm"
          />
          <p className="text-xs text-charcoal-500">
            Specific, measurable outcomes that define success in this role
          </p>
        </div>
      </Section>

      {/* Validation */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
