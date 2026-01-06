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
  useCreateJobStore,
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  INDUSTRIES,
  WORK_AUTHORIZATIONS,
  SKILL_PROFICIENCIES,
  COMMON_CERTIFICATIONS,
  type SkillEntry,
} from '@/stores/create-job-store'
import { Section, FieldGroup, SelectCard, ChipToggle, EmptyState, InlineItemCard, ValidationBanner } from './shared'
import { Plus, X, GraduationCap, Award, Target, Briefcase, Sparkles, Globe } from 'lucide-react'

export function JobIntakeStep2Requirements() {
  const { formData, setFormData, addSkill, removeSkill, addPreferredSkill, removePreferredSkill, toggleArrayItem } = useCreateJobStore()

  // Local state for new skill inputs
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillYears, setNewSkillYears] = useState('2')
  const [newSkillProficiency, setNewSkillProficiency] = useState<'beginner' | 'proficient' | 'expert'>('proficient')
  const [preferredSkillInput, setPreferredSkillInput] = useState('')
  const [certificationInput, setCertificationInput] = useState('')
  const [showCertSuggestions, setShowCertSuggestions] = useState(false)

  const handleAddRequiredSkill = () => {
    if (!newSkillName.trim()) return
    const newSkill: SkillEntry = {
      name: newSkillName.trim(),
      years: newSkillYears,
      proficiency: newSkillProficiency,
    }
    addSkill(newSkill)
    setNewSkillName('')
    setNewSkillYears('2')
    setNewSkillProficiency('proficient')
  }

  const handleAddPreferredSkill = () => {
    if (!preferredSkillInput.trim()) return
    addPreferredSkill(preferredSkillInput.trim())
    setPreferredSkillInput('')
  }

  const handleAddCertification = (cert?: string) => {
    const certToAdd = cert || certificationInput.trim()
    if (!certToAdd || formData.certifications.includes(certToAdd)) return
    setFormData({ certifications: [...formData.certifications, certToAdd] })
    setCertificationInput('')
    setShowCertSuggestions(false)
  }

  const handleRemoveCertification = (cert: string) => {
    setFormData({ certifications: formData.certifications.filter((c) => c !== cert) })
  }

  // Flatten certifications for suggestions
  const allCertifications = Object.values(COMMON_CERTIFICATIONS).flat()
  const filteredSuggestions = allCertifications.filter(
    (cert) =>
      cert.toLowerCase().includes(certificationInput.toLowerCase()) &&
      !formData.certifications.includes(cert)
  )

  const validationItems: string[] = []
  if (formData.requiredSkills.length === 0) validationItems.push('Add at least one required skill')

  return (
    <div className="space-y-10">
      {/* Experience Requirements Section */}
      <Section icon={Briefcase} title="Experience Requirements" subtitle="Define the experience level needed">
        <FieldGroup cols={3}>
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
            <Label className="text-charcoal-700 font-medium">Maximum Years</Label>
            <Select
              value={formData.maxExperience}
              onValueChange={(value) => setFormData({ maxExperience: value })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select maximum years" />
              </SelectTrigger>
              <SelectContent>
                {[3, 4, 5, 6, 7, 8, 10, 12, 15, 20, 25].map((years) => (
                  <SelectItem key={years} value={years.toString()}>
                    {years} years
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="text-charcoal-700 font-medium">Experience Level</Label>
            <Select
              value={formData.experienceLevel}
              onValueChange={(value) => setFormData({ experienceLevel: value as typeof formData.experienceLevel })}
            >
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                {EXPERIENCE_LEVELS.map((level) => (
                  <SelectItem key={level.value} value={level.value}>
                    {level.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </FieldGroup>
      </Section>

      {/* Required Skills */}
      <Section
        icon={Target}
        title="Required Skills"
        subtitle={`${formData.requiredSkills.length} skills added`}
      >
        {/* Add skill form */}
        <div className="flex gap-3 items-end">
          <div className="flex-1 space-y-2">
            <Label className="text-charcoal-700 font-medium">Skill Name</Label>
            <Input
              value={newSkillName}
              onChange={(e) => setNewSkillName(e.target.value)}
              placeholder="e.g., React, Python, AWS"
              className="h-12 rounded-xl border-charcoal-200 bg-white"
              onKeyDown={(e) => e.key === 'Enter' && handleAddRequiredSkill()}
            />
          </div>
          <div className="w-32 space-y-2">
            <Label className="text-charcoal-700 font-medium">Years</Label>
            <Select value={newSkillYears} onValueChange={setNewSkillYears}>
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((y) => (
                  <SelectItem key={y} value={y.toString()}>{y}+ yrs</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="w-36 space-y-2">
            <Label className="text-charcoal-700 font-medium">Proficiency</Label>
            <Select value={newSkillProficiency} onValueChange={(v) => setNewSkillProficiency(v as typeof newSkillProficiency)}>
              <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SKILL_PROFICIENCIES.map((p) => (
                  <SelectItem key={p.value} value={p.value}>{p.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <Button
            type="button"
            onClick={handleAddRequiredSkill}
            disabled={!newSkillName.trim()}
            className="h-12 px-6 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {/* Skills list */}
        {formData.requiredSkills.length > 0 ? (
          <div className="space-y-2">
            {formData.requiredSkills.map((skill, index) => (
              <InlineItemCard
                key={index}
                onRemove={() => removeSkill(index)}
              >
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-charcoal-900">{skill.name}</span>
                  <span className="text-sm text-charcoal-500">{skill.years}+ years</span>
                  <span className="text-xs px-2 py-1 rounded-full bg-gold-100 text-gold-700 capitalize">
                    {skill.proficiency}
                  </span>
                </div>
              </InlineItemCard>
            ))}
          </div>
        ) : (
          <EmptyState
            icon={Target}
            title="No skills added yet"
            description="Add required technical skills for this role"
          />
        )}
      </Section>

      {/* Preferred Skills */}
      <Section icon={Sparkles} title="Preferred Skills (Nice-to-Have)" subtitle="Optional but desirable skills">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <Input
              value={preferredSkillInput}
              onChange={(e) => setPreferredSkillInput(e.target.value)}
              placeholder="Add a preferred skill..."
              className="h-12 rounded-xl border-charcoal-200 bg-white"
              onKeyDown={(e) => e.key === 'Enter' && handleAddPreferredSkill()}
            />
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={handleAddPreferredSkill}
            disabled={!preferredSkillInput.trim()}
            className="h-12 rounded-xl"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add
          </Button>
        </div>

        {formData.preferredSkills.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.preferredSkills.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-charcoal-100 text-charcoal-700 rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => removePreferredSkill(skill)}
                  className="hover:text-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* Education */}
      <Section icon={GraduationCap} title="Education" subtitle="Educational requirements">
        <div className="space-y-2 max-w-md">
          <Label className="text-charcoal-700 font-medium">Minimum Education Level</Label>
          <Select
            value={formData.education}
            onValueChange={(value) => setFormData({ education: value })}
          >
            <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
              <SelectValue placeholder="Select education level" />
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
      </Section>

      {/* Certifications */}
      <Section icon={Award} title="Certifications" subtitle="Required or preferred certifications">
        <div className="relative">
          <div className="flex gap-3 items-end">
            <div className="flex-1">
              <Input
                value={certificationInput}
                onChange={(e) => {
                  setCertificationInput(e.target.value)
                  setShowCertSuggestions(e.target.value.length > 0)
                }}
                onFocus={() => setShowCertSuggestions(certificationInput.length > 0)}
                placeholder="Type to search or add a certification..."
                className="h-12 rounded-xl border-charcoal-200 bg-white"
                onKeyDown={(e) => e.key === 'Enter' && handleAddCertification()}
              />
            </div>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleAddCertification()}
              disabled={!certificationInput.trim()}
              className="h-12 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-2" />
              Add
            </Button>
          </div>

          {showCertSuggestions && filteredSuggestions.length > 0 && (
            <div className="absolute z-10 w-full mt-1 bg-white border border-charcoal-200 rounded-xl shadow-lg max-h-48 overflow-auto">
              {filteredSuggestions.slice(0, 8).map((cert) => (
                <button
                  key={cert}
                  type="button"
                  onClick={() => handleAddCertification(cert)}
                  className="w-full px-4 py-2 text-left text-sm hover:bg-charcoal-50 transition-colors"
                >
                  {cert}
                </button>
              ))}
            </div>
          )}
        </div>

        {formData.certifications.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {formData.certifications.map((cert, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 px-3 py-1.5 bg-gold-100 text-gold-700 rounded-full text-sm"
              >
                <Award className="w-3.5 h-3.5" />
                {cert}
                <button
                  type="button"
                  onClick={() => handleRemoveCertification(cert)}
                  className="hover:text-red-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            ))}
          </div>
        )}
      </Section>

      {/* Industries */}
      <Section icon={Briefcase} title="Industry Experience" subtitle="Preferred industry background">
        <div className="flex flex-wrap gap-2">
          {INDUSTRIES.map((industry) => (
            <ChipToggle
              key={industry.value}
              selected={formData.industries.includes(industry.value)}
              onClick={() => toggleArrayItem('industries', industry.value)}
              icon={<span>{industry.icon}</span>}
            >
              {industry.label}
            </ChipToggle>
          ))}
        </div>
      </Section>

      {/* Work Authorizations */}
      <Section icon={Globe} title="Work Authorization Requirements" subtitle="Acceptable work authorization types">
        <div className="flex flex-wrap gap-2">
          {WORK_AUTHORIZATIONS.map((auth) => (
            <ChipToggle
              key={auth.value}
              selected={formData.visaRequirements.includes(auth.value)}
              onClick={() => toggleArrayItem('visaRequirements', auth.value)}
            >
              {auth.label}
            </ChipToggle>
          ))}
        </div>
      </Section>

      {/* Validation */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
