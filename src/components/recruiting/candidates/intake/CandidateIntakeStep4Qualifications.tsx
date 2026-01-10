'use client'

import React, { useState } from 'react'
import {
  GraduationCap,
  Award,
  Plus,
  X,
  Star,
  Calendar,
  AlertCircle,
  Info,
} from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  useCreateCandidateStore,
  PROFICIENCY_LEVELS,
  SkillEntry,
} from '@/stores/create-candidate-store'
import { Section, ValidationBanner, SectionDivider } from './shared'
import { EducationEditor } from './EducationEditor'
import { cn } from '@/lib/utils'

export function CandidateIntakeStep4Qualifications() {
  const {
    formData,
    addSkill,
    removeSkill,
    togglePrimarySkill,
    addCertification,
    removeCertification,
    addEducation,
    updateEducation,
    removeEducation,
  } = useCreateCandidateStore()

  const { education, skills, certifications, primarySkills } = formData

  // Skill input state
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillProficiency, setNewSkillProficiency] = useState<SkillEntry['proficiency']>('intermediate')
  const [newSkillYears, setNewSkillYears] = useState('')

  // Certification input state
  const [newCertName, setNewCertName] = useState('')
  const [newCertIssuer, setNewCertIssuer] = useState('')
  const [newCertExpiry, setNewCertExpiry] = useState('')

  const handleAddSkill = () => {
    if (!newSkillName.trim()) return

    addSkill({
      name: newSkillName.trim(),
      proficiency: newSkillProficiency,
      yearsOfExperience: newSkillYears ? parseFloat(newSkillYears) : undefined,
      isPrimary: primarySkills.length < 5,
      isCertified: false,
    })

    setNewSkillName('')
    setNewSkillProficiency('intermediate')
    setNewSkillYears('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleAddSkill()
    }
  }

  const handleAddCertification = () => {
    if (!newCertName.trim()) return

    addCertification({
      name: newCertName.trim(),
      issuingOrganization: newCertIssuer || undefined,
      expiryDate: newCertExpiry || undefined,
      isLifetime: !newCertExpiry,
    })

    setNewCertName('')
    setNewCertIssuer('')
    setNewCertExpiry('')
  }

  const getProficiencyColor = (proficiency: SkillEntry['proficiency']) => {
    switch (proficiency) {
      case 'beginner': return 'bg-blue-100 text-blue-700 border-blue-200'
      case 'intermediate': return 'bg-green-100 text-green-700 border-green-200'
      case 'advanced': return 'bg-purple-100 text-purple-700 border-purple-200'
      case 'expert': return 'bg-gold-100 text-gold-700 border-gold-200'
      default: return 'bg-charcoal-100 text-charcoal-700 border-charcoal-200'
    }
  }

  // Build validation items
  const validationItems: string[] = []
  if (skills.length === 0) {
    validationItems.push('Add at least one skill')
  }

  return (
    <div className="space-y-8">
      {/* Education Section */}
      <Section
        icon={GraduationCap}
        title="Education"
        subtitle="Add educational background (optional but recommended)"
      >
        {/* Info Banner */}
        <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200 mb-4">
          <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-blue-800">
              Education is Optional
            </p>
            <p className="text-xs text-blue-600 mt-0.5">
              While not required, adding education can help match candidates with positions that have specific degree requirements.
            </p>
          </div>
        </div>

        {/* Info Banner for Resume-Parsed Entries */}
        {education.some(e => e.isFromResume) && (
          <div className="flex items-start gap-3 p-4 rounded-xl bg-gold-50 border border-gold-200 mb-4">
            <AlertCircle className="w-5 h-5 text-gold-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-gold-800">
                AI-Extracted Education
              </p>
              <p className="text-xs text-gold-600 mt-0.5">
                Some entries were automatically extracted from the resume. Please review and correct any inaccuracies.
              </p>
            </div>
          </div>
        )}

        <EducationEditor
          entries={education}
          onAdd={addEducation}
          onUpdate={updateEducation}
          onRemove={removeEducation}
        />
      </Section>

      <SectionDivider label="Skills & Certifications" />

      {/* Skills Section */}
      <Section
        icon={Award}
        title="Technical Skills"
        subtitle="Add skills with proficiency levels (mark up to 5 as primary)"
      >
        {/* Add Skill Form */}
        <div className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={newSkillName}
                onChange={(e) => setNewSkillName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Skill name (e.g., React, Python, AWS)"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <div className="w-full md:w-40">
              <Select
                value={newSkillProficiency}
                onValueChange={(value) => setNewSkillProficiency(value as SkillEntry['proficiency'])}
              >
                <SelectTrigger className="h-12 rounded-xl border-charcoal-200 bg-white">
                  <SelectValue placeholder="Proficiency" />
                </SelectTrigger>
                <SelectContent>
                  {PROFICIENCY_LEVELS.map((level) => (
                    <SelectItem key={level.value} value={level.value}>
                      {level.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="w-full md:w-28">
              <Input
                type="number"
                min={0}
                max={40}
                step={0.5}
                value={newSkillYears}
                onChange={(e) => setNewSkillYears(e.target.value)}
                placeholder="Years"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddSkill}
              disabled={!newSkillName.trim()}
              className="h-12 px-6 rounded-xl bg-gold-500 hover:bg-gold-600 text-white"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Skills List */}
        {skills.length > 0 ? (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-sm text-charcoal-600">
                {skills.length} skill{skills.length !== 1 ? 's' : ''} added
              </Label>
              <Label className="text-xs text-charcoal-500">
                Click the star to mark as primary ({primarySkills.length}/5)
              </Label>
            </div>
            <div className="flex flex-wrap gap-2 p-4 bg-white rounded-xl border border-charcoal-200">
              {skills.map((skill, index) => {
                const isPrimary = primarySkills.includes(skill.name)
                return (
                  <div
                    key={`${skill.name}-${index}`}
                    className={cn(
                      'inline-flex items-center gap-2 px-3 py-2 rounded-lg border transition-all',
                      getProficiencyColor(skill.proficiency),
                      isPrimary && 'ring-2 ring-gold-400 ring-offset-1'
                    )}
                  >
                    <button
                      type="button"
                      onClick={() => togglePrimarySkill(skill.name)}
                      className={cn(
                        'w-5 h-5 flex items-center justify-center transition-colors',
                        isPrimary ? 'text-gold-500' : 'text-charcoal-300 hover:text-gold-400'
                      )}
                    >
                      <Star className={cn('w-4 h-4', isPrimary && 'fill-current')} />
                    </button>
                    <span className="font-medium">{skill.name}</span>
                    <Badge variant="outline" className="text-[10px] px-1.5 py-0">
                      {skill.proficiency}
                    </Badge>
                    {skill.yearsOfExperience && (
                      <span className="text-xs opacity-75">{skill.yearsOfExperience}y</span>
                    )}
                    <button
                      type="button"
                      onClick={() => removeSkill(index)}
                      className="w-4 h-4 rounded-full hover:bg-black/10 flex items-center justify-center transition-colors"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                )
              })}
            </div>
          </div>
        ) : (
          <div className="p-6 bg-charcoal-50 rounded-xl border border-charcoal-200 text-center">
            <Award className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
            <p className="text-sm text-charcoal-500">No skills added yet</p>
            <p className="text-xs text-charcoal-400 mt-1">Add skills with their proficiency levels above</p>
          </div>
        )}
      </Section>

      {/* Certifications Section */}
      <Section
        icon={GraduationCap}
        title="Certifications"
        subtitle="Professional certifications and credentials (optional)"
      >
        {/* Add Certification Form */}
        <div className="p-4 bg-charcoal-50 rounded-xl border border-charcoal-200">
          <div className="flex flex-col md:flex-row gap-3">
            <div className="flex-1">
              <Input
                value={newCertName}
                onChange={(e) => setNewCertName(e.target.value)}
                placeholder="Certification name (e.g., AWS Solutions Architect)"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <div className="w-full md:w-48">
              <Input
                value={newCertIssuer}
                onChange={(e) => setNewCertIssuer(e.target.value)}
                placeholder="Issuing org"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <div className="w-full md:w-40">
              <Input
                type="date"
                value={newCertExpiry}
                onChange={(e) => setNewCertExpiry(e.target.value)}
                placeholder="Expiry"
                className="h-12 rounded-xl border-charcoal-200 bg-white"
              />
            </div>
            <Button
              type="button"
              onClick={handleAddCertification}
              disabled={!newCertName.trim()}
              variant="outline"
              className="h-12 px-6 rounded-xl"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
        </div>

        {/* Certifications List */}
        {certifications.length > 0 ? (
          <div className="space-y-2">
            {certifications.map((cert, index) => (
              <div
                key={`${cert.name}-${index}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-charcoal-200"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-gold-100 to-amber-100 flex items-center justify-center">
                    <GraduationCap className="w-5 h-5 text-gold-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-800">{cert.name}</p>
                    <div className="flex items-center gap-2 text-xs text-charcoal-500">
                      {cert.issuingOrganization && <span>{cert.issuingOrganization}</span>}
                      {cert.expiryDate && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          Expires: {new Date(cert.expiryDate).toLocaleDateString()}
                        </span>
                      )}
                      {cert.isLifetime && <Badge variant="outline" className="text-[10px]">Lifetime</Badge>}
                    </div>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeCertification(index)}
                  className="text-charcoal-400 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 bg-charcoal-50 rounded-xl border border-charcoal-200 text-center">
            <GraduationCap className="w-10 h-10 text-charcoal-300 mx-auto mb-2" />
            <p className="text-sm text-charcoal-500">No certifications added</p>
            <p className="text-xs text-charcoal-400 mt-1">Add professional certifications if applicable</p>
          </div>
        )}
      </Section>

      {/* Validation Summary */}
      <ValidationBanner items={validationItems} />
    </div>
  )
}
