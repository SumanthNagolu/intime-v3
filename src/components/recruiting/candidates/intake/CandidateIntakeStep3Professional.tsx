'use client'

import { Briefcase, Building2, Monitor, FileText } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { useCreateCandidateStore, EMPLOYMENT_TYPES, WORK_MODES } from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner } from './shared'

export function CandidateIntakeStep3Professional() {
  const { formData, setFormData } = useCreateCandidateStore()

  const toggleEmploymentType = (type: typeof formData.employmentTypes[number]) => {
    const current = formData.employmentTypes || []
    const updated = current.includes(type)
      ? current.filter(t => t !== type)
      : [...current, type]
    setFormData({ employmentTypes: updated })
  }

  const toggleWorkMode = (mode: typeof formData.workModes[number]) => {
    const current = formData.workModes || []
    const updated = current.includes(mode)
      ? current.filter(m => m !== mode)
      : [...current, mode]
    setFormData({ workModes: updated })
  }

  // Build validation items
  const validationItems: string[] = []
  if (formData.experienceYears === undefined || formData.experienceYears < 0) {
    validationItems.push('Enter years of experience')
  }
  if (!formData.employmentTypes || formData.employmentTypes.length === 0) {
    validationItems.push('Select at least one employment type')
  }

  return (
    <div className="space-y-8">
      <Section
        icon={Briefcase}
        title="Professional Profile"
        subtitle="Add professional details and experience"
      >
        <div className="space-y-2">
          <Label htmlFor="professionalHeadline" className="text-charcoal-700 font-medium">
            Professional Headline
          </Label>
          <Input
            id="professionalHeadline"
            value={formData.professionalHeadline || ''}
            onChange={(e) => setFormData({ professionalHeadline: e.target.value })}
            placeholder="e.g., Senior Software Engineer | Full Stack Developer"
            className="h-12 rounded-xl border-charcoal-200 bg-white"
            maxLength={200}
          />
          <p className="text-xs text-charcoal-500">A brief title summarizing their expertise (max 200 characters)</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="professionalSummary" className="text-charcoal-700 font-medium flex items-center gap-2">
            <FileText className="w-4 h-4 text-charcoal-400" />
            Professional Summary
          </Label>
          <Textarea
            id="professionalSummary"
            value={formData.professionalSummary || ''}
            onChange={(e) => setFormData({ professionalSummary: e.target.value })}
            placeholder="Brief overview of experience, expertise, and career highlights..."
            className="min-h-[120px] rounded-xl border-charcoal-200 bg-white resize-none"
            maxLength={2000}
          />
          <p className="text-xs text-charcoal-500">{formData.professionalSummary?.length || 0}/2000 characters</p>
        </div>

        <FieldGroup cols={2}>
          <div className="space-y-2">
            <Label htmlFor="experienceYears" className="text-charcoal-700 font-medium">
              Years of Experience <span className="text-gold-500">*</span>
            </Label>
            <Input
              id="experienceYears"
              type="number"
              min={0}
              max={50}
              value={formData.experienceYears}
              onChange={(e) => setFormData({ experienceYears: parseInt(e.target.value) || 0 })}
              className="h-12 rounded-xl border-charcoal-200 bg-white"
            />
          </div>
        </FieldGroup>
      </Section>

      <Section
        icon={Building2}
        title="Employment Preferences"
        subtitle="What types of employment is the candidate open to?"
      >
        <div className="space-y-4">
          <Label className="text-charcoal-700 font-medium">
            Employment Types <span className="text-gold-500">*</span>
          </Label>
          <div className="grid grid-cols-2 gap-3">
            {EMPLOYMENT_TYPES.map((type) => (
              <div
                key={type.value}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.employmentTypes?.includes(type.value as typeof formData.employmentTypes[number])
                    ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50'
                    : 'border-charcoal-200 bg-white hover:border-charcoal-300'
                }`}
                onClick={() => toggleEmploymentType(type.value as typeof formData.employmentTypes[number])}
              >
                <Checkbox
                  checked={formData.employmentTypes?.includes(type.value as typeof formData.employmentTypes[number]) || false}
                  onCheckedChange={() => toggleEmploymentType(type.value as typeof formData.employmentTypes[number])}
                  className="data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
                />
                <Label className="cursor-pointer text-sm font-medium text-charcoal-700">
                  {type.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </Section>

      <Section
        icon={Monitor}
        title="Work Mode Preferences"
        subtitle="What work arrangements is the candidate open to?"
      >
        <div className="space-y-4">
          <Label className="text-charcoal-700 font-medium">Work Modes</Label>
          <div className="grid grid-cols-3 gap-3">
            {WORK_MODES.map((mode) => (
              <div
                key={mode.value}
                className={`flex items-center space-x-3 p-4 rounded-xl border-2 cursor-pointer transition-all ${
                  formData.workModes?.includes(mode.value as typeof formData.workModes[number])
                    ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50'
                    : 'border-charcoal-200 bg-white hover:border-charcoal-300'
                }`}
                onClick={() => toggleWorkMode(mode.value as typeof formData.workModes[number])}
              >
                <Checkbox
                  checked={formData.workModes?.includes(mode.value as typeof formData.workModes[number]) || false}
                  onCheckedChange={() => toggleWorkMode(mode.value as typeof formData.workModes[number])}
                  className="data-[state=checked]:bg-gold-500 data-[state=checked]:border-gold-500"
                />
                <Label className="cursor-pointer text-sm font-medium text-charcoal-700">
                  {mode.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
      </Section>

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
