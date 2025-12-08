'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useJobIntakeStore,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  SkillEntry,
} from '@/stores/job-intake-store'
import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'

export function IntakeStep2Requirements() {
  const { formData, setFormData } = useJobIntakeStore()

  // Local state for new skill inputs
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillYears, setNewSkillYears] = useState('2')
  const [newSkillProficiency, setNewSkillProficiency] = useState<'beginner' | 'proficient' | 'expert'>(
    'proficient'
  )
  const [preferredSkillInput, setPreferredSkillInput] = useState('')

  const addRequiredSkill = () => {
    if (!newSkillName.trim()) return
    const newSkill: SkillEntry = {
      name: newSkillName.trim(),
      years: newSkillYears,
      proficiency: newSkillProficiency,
    }
    setFormData({ requiredSkills: [...formData.requiredSkills, newSkill] })
    setNewSkillName('')
    setNewSkillYears('2')
    setNewSkillProficiency('proficient')
  }

  const removeRequiredSkill = (index: number) => {
    setFormData({
      requiredSkills: formData.requiredSkills.filter((_, i) => i !== index),
    })
  }

  const addPreferredSkill = () => {
    if (!preferredSkillInput.trim()) return
    setFormData({
      preferredSkills: [...formData.preferredSkills, preferredSkillInput.trim()],
    })
    setPreferredSkillInput('')
  }

  const removePreferredSkill = (index: number) => {
    setFormData({
      preferredSkills: formData.preferredSkills.filter((_, i) => i !== index),
    })
  }

  return (
    <div className="space-y-6">
      {/* Experience Requirements Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Experience Requirements
        </h3>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Minimum Years *</Label>
            <Input
              type="number"
              min={0}
              value={formData.minExperience}
              onChange={(e) => setFormData({ minExperience: e.target.value })}
              placeholder="5"
            />
          </div>
          <div className="space-y-2">
            <Label>Preferred Years</Label>
            <Input
              type="number"
              min={0}
              value={formData.preferredExperience}
              onChange={(e) => setFormData({ preferredExperience: e.target.value })}
              placeholder="7"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Experience Level *</Label>
          <div className="grid grid-cols-2 gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData({ experienceLevel: level.value })}
                className={cn(
                  'p-2 rounded-lg border-2 text-sm transition-colors',
                  formData.experienceLevel === level.value
                    ? 'border-hublot-700 bg-hublot-50'
                    : 'border-charcoal-200 hover:border-charcoal-300'
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Required Skills Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Required Skills (Must-Have)
        </h3>

        <div className="p-4 border rounded-lg space-y-4">
          <div className="grid grid-cols-12 gap-2">
            <div className="col-span-5">
              <Input
                placeholder="Skill name"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
              />
            </div>
            <div className="col-span-2">
              <Input
                type="number"
                placeholder="Years"
                value={newSkillYears}
                onChange={(e) => setNewSkillYears(e.target.value)}
                min={0}
              />
            </div>
            <div className="col-span-4">
              <Select
                value={newSkillProficiency}
                onValueChange={(v) =>
                  setNewSkillProficiency(v as 'beginner' | 'proficient' | 'expert')
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">Beginner</SelectItem>
                  <SelectItem value="proficient">Proficient</SelectItem>
                  <SelectItem value="expert">Expert</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-1">
              <Button type="button" variant="outline" size="icon" onClick={addRequiredSkill}>
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {formData.requiredSkills.length > 0 && (
            <div className="space-y-2">
              {formData.requiredSkills.map((skill, index) => (
                <div key={index} className="flex items-center justify-between p-2 bg-charcoal-50 rounded">
                  <span className="text-sm">
                    {skill.name} - {skill.years}+ years - {skill.proficiency}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={() => removeRequiredSkill(index)}
                  >
                    <X className="w-3 h-3" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Preferred Skills Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Preferred Skills (Nice-to-Have)
        </h3>

        <div className="flex gap-2">
          <Input
            placeholder="Add preferred skill"
            value={preferredSkillInput}
            onChange={(e) => setPreferredSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredSkill())}
          />
          <Button type="button" variant="outline" onClick={addPreferredSkill}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>

        {formData.preferredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.preferredSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-charcoal-100 rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removePreferredSkill(index)}
                  className="hover:text-red-500"
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Education Section */}
      <div className="space-y-4 pt-4 border-t">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Education
        </h3>

        <div className="space-y-2">
          <Label>Minimum Education</Label>
          <Select
            value={formData.education}
            onValueChange={(value) => setFormData({ education: value })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EDUCATION_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label>Certifications (Optional)</Label>
          <Input
            placeholder="e.g., AWS Certified, not required but preferred"
            value={formData.certifications}
            onChange={(e) => setFormData({ certifications: e.target.value })}
          />
        </div>
      </div>
    </div>
  )
}
