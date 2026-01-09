'use client'

import { useState } from 'react'
import { Briefcase, GraduationCap, Plus, X } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { useCreateCandidateStore } from '@/stores/create-candidate-store'
import { Section, FieldGroup, ValidationBanner, SkillBadge } from './shared'

export function CandidateIntakeStep3Professional() {
  const { formData, setFormData, addSkill, removeSkill } = useCreateCandidateStore()
  const [newSkill, setNewSkill] = useState('')

  const handleAddSkill = () => {
    if (newSkill.trim()) {
      addSkill(newSkill.trim())
      setNewSkill('')
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  // Build validation items
  const validationItems: string[] = []
  if (formData.skills.length === 0) validationItems.push('Add at least one skill')

  return (
    <div className="space-y-8">
      <Section
        icon={Briefcase}
        title="Professional Profile"
        subtitle="Add professional details and skills"
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
          <Label htmlFor="professionalSummary" className="text-charcoal-700 font-medium">
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
      </Section>

      <Section
        icon={GraduationCap}
        title="Skills & Experience"
        subtitle="Add relevant skills and experience level"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">
              Skills <span className="text-gold-500">*</span>
            </Label>
            <div className="flex gap-2">
              <Input
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a skill and press Enter"
                className="h-12 rounded-xl border-charcoal-200 bg-white flex-1"
              />
              <Button
                type="button"
                onClick={handleAddSkill}
                variant="outline"
                className="h-12 px-4 rounded-xl"
                disabled={!newSkill.trim()}
              >
                <Plus className="w-4 h-4 mr-1" />
                Add
              </Button>
            </div>
          </div>

          {formData.skills.length > 0 && (
            <div className="flex flex-wrap gap-2 p-4 bg-charcoal-50 rounded-xl border border-charcoal-100">
              {formData.skills.map((skill) => (
                <SkillBadge
                  key={skill}
                  skill={skill}
                  onRemove={() => removeSkill(skill)}
                />
              ))}
            </div>
          )}

          {formData.skills.length === 0 && (
            <div className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-200 text-center text-sm text-charcoal-500">
              No skills added yet. Type a skill name and press Enter or click Add.
            </div>
          )}
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

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
