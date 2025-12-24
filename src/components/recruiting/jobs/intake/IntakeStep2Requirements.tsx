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
import { Plus, X, GraduationCap, Award, Target, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'

// Common certifications for auto-suggest
const COMMON_CERTIFICATIONS = [
  'AWS Certified Solutions Architect',
  'AWS Certified Developer',
  'Google Cloud Professional',
  'Azure Solutions Architect',
  'PMP',
  'Scrum Master (CSM)',
  'CISSP',
  'CompTIA Security+',
  'Kubernetes (CKA/CKAD)',
  'Terraform Associate',
]

export function IntakeStep2Requirements() {
  const { formData, setFormData } = useJobIntakeStore()

  // Handle migration from old string to new array format for certifications
  // This handles legacy data in localStorage
  const certifications = Array.isArray(formData.certifications)
    ? formData.certifications
    : formData.certifications
      ? [formData.certifications]
      : []

  // Local state for new skill inputs
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillYears, setNewSkillYears] = useState('2')
  const [newSkillProficiency, setNewSkillProficiency] = useState<'beginner' | 'proficient' | 'expert'>(
    'proficient'
  )
  const [preferredSkillInput, setPreferredSkillInput] = useState('')
  const [certificationInput, setCertificationInput] = useState('')
  const [showCertSuggestions, setShowCertSuggestions] = useState(false)

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

  const addCertification = (cert?: string) => {
    const certToAdd = cert || certificationInput.trim()
    if (!certToAdd || certifications.includes(certToAdd)) return
    setFormData({
      certifications: [...certifications, certToAdd],
    })
    setCertificationInput('')
    setShowCertSuggestions(false)
  }

  const removeCertification = (index: number) => {
    setFormData({
      certifications: certifications.filter((_, i) => i !== index),
    })
  }

  const filteredSuggestions = COMMON_CERTIFICATIONS.filter(
    (cert) =>
      cert.toLowerCase().includes(certificationInput.toLowerCase()) &&
      !certifications.includes(cert)
  )

  return (
    <div className="space-y-8">
      {/* Experience Requirements Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Briefcase className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Experience Requirements
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Minimum Years *</Label>
            <Select
              value={formData.minExperience}
              onValueChange={(value) => setFormData({ minExperience: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select minimum years" />
              </SelectTrigger>
              <SelectContent>
                {[0, 1, 2, 3, 4, 5, 6, 7, 8, 10, 12, 15].map((years) => (
                  <SelectItem key={years} value={years.toString()}>
                    {years === 0 ? 'Entry Level' : `${years}+ years`}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Preferred Years</Label>
            <Select
              value={formData.preferredExperience}
              onValueChange={(value) => setFormData({ preferredExperience: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select preferred years" />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 10, 12, 15, 20].map((years) => (
                  <SelectItem key={years} value={years.toString()}>
                    {years}+ years
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="space-y-2">
          <Label>Experience Level *</Label>
          <div className="grid grid-cols-4 gap-2">
            {EXPERIENCE_LEVELS.map((level) => (
              <button
                key={level.value}
                type="button"
                onClick={() => setFormData({ experienceLevel: level.value })}
                className={cn(
                  'p-3 rounded-lg border-2 text-sm transition-all duration-200',
                  formData.experienceLevel === level.value
                    ? 'border-gold-500 bg-gold-50 text-charcoal-900 shadow-sm'
                    : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50'
                )}
              >
                {level.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Required Skills Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <Target className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Required Skills (Must-Have)
          </h3>
        </div>

        <div className="p-4 border border-charcoal-200 rounded-lg space-y-4 bg-white">
          <div className="grid grid-cols-12 gap-2 items-end">
            <div className="col-span-5 space-y-1">
              <Label className="text-xs text-charcoal-500">Skill Name</Label>
              <Input
                placeholder="e.g., React, Python, AWS"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
              />
            </div>
            <div className="col-span-2 space-y-1">
              <Label className="text-xs text-charcoal-500">Min. Years</Label>
              <Select value={newSkillYears} onValueChange={setNewSkillYears}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((y) => (
                    <SelectItem key={y} value={y.toString()}>
                      {y}+ yrs
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-4 space-y-1">
              <Label className="text-xs text-charcoal-500">Proficiency</Label>
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
              <Button
                type="button"
                variant="default"
                size="icon"
                onClick={addRequiredSkill}
                disabled={!newSkillName.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {formData.requiredSkills.length > 0 && (
            <div className="space-y-2 pt-2 border-t border-charcoal-100">
              {formData.requiredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 bg-charcoal-50 rounded-lg group hover:bg-charcoal-100 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-gold-100 text-gold-700 rounded-full text-sm font-medium">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-medium text-charcoal-900">{skill.name}</span>
                      <span className="text-charcoal-500 text-sm ml-2">
                        • {skill.years}+ years • {skill.proficiency}
                      </span>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => removeRequiredSkill(index)}
                  >
                    <X className="w-4 h-4 text-charcoal-400 hover:text-red-500" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {formData.requiredSkills.length === 0 && (
            <p className="text-sm text-charcoal-400 text-center py-4">
              Add at least one required skill to continue
            </p>
          )}
        </div>
      </div>

      {/* Preferred Skills Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
          Preferred Skills (Nice-to-Have)
        </h3>

        <div className="flex gap-2">
          <Input
            placeholder="Add preferred skill and press Enter"
            value={preferredSkillInput}
            onChange={(e) => setPreferredSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredSkill())}
            className="flex-1"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addPreferredSkill}
            disabled={!preferredSkillInput.trim()}
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {formData.preferredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.preferredSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-charcoal-100 hover:bg-charcoal-200 rounded-full text-sm transition-colors group"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removePreferredSkill(index)}
                  className="text-charcoal-400 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Education & Certifications Section */}
      <div className="space-y-4 pt-6 border-t border-charcoal-100">
        <div className="flex items-center gap-2">
          <GraduationCap className="w-4 h-4 text-gold-500" />
          <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
            Education & Certifications
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-6">
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

          <div className="space-y-2 relative">
            <Label className="flex items-center gap-2">
              <Award className="w-3.5 h-3.5 text-gold-500" />
              Certifications (Optional)
            </Label>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Input
                  placeholder="Type or select certifications"
                  value={certificationInput}
                  onChange={(e) => {
                    setCertificationInput(e.target.value)
                    setShowCertSuggestions(e.target.value.length > 0)
                  }}
                  onFocus={() => setShowCertSuggestions(certificationInput.length > 0)}
                  onBlur={() => setTimeout(() => setShowCertSuggestions(false), 200)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      addCertification()
                    }
                  }}
                />
                {showCertSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-1 bg-white border border-charcoal-200 rounded-lg shadow-lg max-h-48 overflow-auto">
                    {filteredSuggestions.map((cert) => (
                      <button
                        key={cert}
                        type="button"
                        className="w-full px-3 py-2 text-left text-sm hover:bg-charcoal-50 transition-colors"
                        onClick={() => addCertification(cert)}
                      >
                        {cert}
                      </button>
                    ))}
                  </div>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                onClick={() => addCertification()}
                disabled={!certificationInput.trim()}
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Certifications List */}
        {certifications.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-2">
            {certifications.map((cert, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gold-50 border border-gold-200 text-gold-800 rounded-full text-sm"
              >
                <Award className="w-3.5 h-3.5" />
                {cert}
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="text-gold-600 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Quick-add common certifications */}
        {certifications.length === 0 && (
          <div className="space-y-2">
            <p className="text-xs text-charcoal-500">Common certifications (click to add):</p>
            <div className="flex flex-wrap gap-1.5">
              {COMMON_CERTIFICATIONS.slice(0, 6).map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => addCertification(cert)}
                  className="px-2.5 py-1 text-xs border border-charcoal-200 rounded-full hover:bg-charcoal-50 hover:border-charcoal-300 transition-colors"
                >
                  + {cert}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
