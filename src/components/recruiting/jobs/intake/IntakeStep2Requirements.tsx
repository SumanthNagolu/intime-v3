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
import { Plus, X, GraduationCap, Award, Target, Briefcase, CheckCircle2, Sparkles } from 'lucide-react'
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

// Section wrapper component
function Section({ 
  icon: Icon, 
  title, 
  badge,
  children,
  className 
}: { 
  icon?: React.ElementType
  title: string
  badge?: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('space-y-5', className)}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center">
            <Icon className="w-4 h-4 text-gold-600" />
          </div>
        )}
        <h3 className="text-sm font-semibold text-charcoal-800 uppercase tracking-wider">
          {title}
        </h3>
        {badge && (
          <span className="text-xs px-2 py-0.5 rounded-full bg-charcoal-100 text-charcoal-500 font-medium">
            {badge}
          </span>
        )}
      </div>
      {children}
    </div>
  )
}

export function IntakeStep2Requirements() {
  const { formData, setFormData } = useJobIntakeStore()

  // Handle migration from old string to new array format for certifications
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
    <div className="space-y-10">
      {/* Experience Requirements Section */}
      <Section icon={Briefcase} title="Experience Requirements">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">
              Minimum Years <span className="text-gold-500">*</span>
            </Label>
            <Select
              value={formData.minExperience}
              onValueChange={(value) => setFormData({ minExperience: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
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
            <Label className="text-charcoal-700 font-medium">Preferred Years</Label>
            <Select
              value={formData.preferredExperience}
              onValueChange={(value) => setFormData({ preferredExperience: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
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

        <div className="space-y-3">
          <Label className="text-charcoal-700 font-medium">
            Experience Level <span className="text-gold-500">*</span>
          </Label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {EXPERIENCE_LEVELS.map((level) => {
              const isSelected = formData.experienceLevel === level.value
              return (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setFormData({ experienceLevel: level.value })}
                  className={cn(
                    'relative p-4 rounded-xl border-2 text-center transition-all duration-300 overflow-hidden',
                    isSelected
                      ? 'border-gold-400 bg-gradient-to-br from-gold-50 to-amber-50 shadow-gold-glow'
                      : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50/50'
                  )}
                >
                  {isSelected && (
                    <div className="absolute top-2 right-2">
                      <CheckCircle2 className="w-4 h-4 text-gold-500" />
                    </div>
                  )}
                  <span className={cn('text-sm font-semibold', isSelected ? 'text-gold-700' : 'text-charcoal-800')}>
                    {level.label}
                  </span>
                </button>
              )
            })}
          </div>
        </div>
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Technical Skills</span>
        </div>
      </div>

      {/* Required Skills Section */}
      <Section icon={Target} title="Required Skills" badge="Must-Have">
        <div className="p-5 bg-gradient-to-br from-charcoal-50/50 to-white border border-charcoal-100 rounded-2xl space-y-5">
          {/* Skill Input Row */}
          <div className="grid grid-cols-12 gap-3 items-end">
            <div className="col-span-5 space-y-2">
              <Label className="text-xs text-charcoal-500 font-medium">Skill Name</Label>
              <Input
                placeholder="e.g., React, Python, AWS"
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
                className="h-11 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <div className="col-span-2 space-y-2">
              <Label className="text-xs text-charcoal-500 font-medium">Min. Years</Label>
              <Select value={newSkillYears} onValueChange={setNewSkillYears}>
                <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
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
            <div className="col-span-4 space-y-2">
              <Label className="text-xs text-charcoal-500 font-medium">Proficiency</Label>
              <Select
                value={newSkillProficiency}
                onValueChange={(v) =>
                  setNewSkillProficiency(v as 'beginner' | 'proficient' | 'expert')
                }
              >
                <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
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
                onClick={addRequiredSkill}
                disabled={!newSkillName.trim()}
                className="h-11 w-11 rounded-xl bg-gradient-to-br from-gold-500 to-gold-600 hover:from-gold-400 hover:to-gold-500 shadow-gold-glow disabled:opacity-50 disabled:shadow-none"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Skills List */}
          {formData.requiredSkills.length > 0 && (
            <div className="space-y-2 pt-4 border-t border-charcoal-100">
              {formData.requiredSkills.map((skill, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-100 group hover:border-charcoal-200 hover:shadow-elevation-xs transition-all duration-200"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-9 h-9 flex items-center justify-center bg-gradient-to-br from-gold-100 to-amber-50 text-gold-700 rounded-lg text-sm font-bold">
                      {index + 1}
                    </span>
                    <div>
                      <span className="font-semibold text-charcoal-900">{skill.name}</span>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-charcoal-500 bg-charcoal-100 px-2 py-0.5 rounded-full">
                          {skill.years}+ years
                        </span>
                        <span className={cn(
                          'text-xs px-2 py-0.5 rounded-full capitalize',
                          skill.proficiency === 'expert' && 'bg-purple-100 text-purple-700',
                          skill.proficiency === 'proficient' && 'bg-blue-100 text-blue-700',
                          skill.proficiency === 'beginner' && 'bg-charcoal-100 text-charcoal-600'
                        )}>
                          {skill.proficiency}
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-50 hover:text-red-500"
                    onClick={() => removeRequiredSkill(index)}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                </div>
              ))}
            </div>
          )}

          {formData.requiredSkills.length === 0 && (
            <div className="text-center py-8">
              <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center mx-auto mb-3">
                <Target className="w-6 h-6 text-charcoal-400" />
              </div>
              <p className="text-sm text-charcoal-500">
                Add at least one required skill to continue
              </p>
            </div>
          )}
        </div>
      </Section>

      {/* Preferred Skills Section */}
      <Section icon={Sparkles} title="Preferred Skills" badge="Nice-to-Have">
        <div className="flex gap-3">
          <Input
            placeholder="Add preferred skill and press Enter"
            value={preferredSkillInput}
            onChange={(e) => setPreferredSkillInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredSkill())}
            className="flex-1 h-11 rounded-xl border-charcoal-200 bg-white"
          />
          <Button
            type="button"
            variant="outline"
            onClick={addPreferredSkill}
            disabled={!preferredSkillInput.trim()}
            className="h-11 px-5 rounded-xl border-charcoal-200 hover:bg-charcoal-50"
          >
            <Plus className="w-4 h-4 mr-1" /> Add
          </Button>
        </div>

        {formData.preferredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.preferredSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-charcoal-50 to-slate-50 hover:from-charcoal-100 hover:to-slate-100 border border-charcoal-200 rounded-full text-sm transition-colors group"
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
      </Section>

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-charcoal-100"></div>
        </div>
        <div className="relative flex justify-center">
          <span className="px-4 bg-white text-xs text-charcoal-400 uppercase tracking-wider">Education</span>
        </div>
      </div>

      {/* Education & Certifications Section */}
      <Section icon={GraduationCap} title="Education & Certifications">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Minimum Education</Label>
            <Select
              value={formData.education}
              onValueChange={(value) => setFormData({ education: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
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
            <Label className="text-charcoal-700 font-medium flex items-center gap-2">
              <Award className="w-4 h-4 text-gold-500" />
              Certifications
              <span className="text-xs text-charcoal-400 font-normal">(Optional)</span>
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
                  className="h-12 rounded-xl border-charcoal-200 bg-white"
                />
                {showCertSuggestions && filteredSuggestions.length > 0 && (
                  <div className="absolute z-10 w-full mt-2 bg-white border border-charcoal-200 rounded-xl shadow-elevation-md max-h-48 overflow-auto">
                    {filteredSuggestions.map((cert) => (
                      <button
                        key={cert}
                        type="button"
                        className="w-full px-4 py-3 text-left text-sm hover:bg-gold-50 transition-colors first:rounded-t-xl last:rounded-b-xl"
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
                className="h-12 w-12 rounded-xl border-charcoal-200 hover:bg-charcoal-50"
              >
                <Plus className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Certifications List */}
        {certifications.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-3">
            {certifications.map((cert, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gold-50 to-amber-50 border border-gold-200 text-gold-800 rounded-full text-sm"
              >
                <Award className="w-4 h-4 text-gold-500" />
                {cert}
                <button
                  type="button"
                  onClick={() => removeCertification(index)}
                  className="text-gold-500 hover:text-red-500 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Quick-add common certifications */}
        {certifications.length === 0 && (
          <div className="p-4 bg-charcoal-50/50 rounded-xl space-y-3">
            <p className="text-xs text-charcoal-500 font-medium">Popular certifications (click to add):</p>
            <div className="flex flex-wrap gap-2">
              {COMMON_CERTIFICATIONS.slice(0, 6).map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => addCertification(cert)}
                  className="px-3 py-1.5 text-xs border border-charcoal-200 rounded-full hover:bg-white hover:border-gold-300 hover:text-gold-700 transition-all duration-200"
                >
                  + {cert}
                </button>
              ))}
            </div>
          </div>
        )}
      </Section>
    </div>
  )
}
