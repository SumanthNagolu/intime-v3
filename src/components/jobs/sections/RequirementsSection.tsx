'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Code2,
  GraduationCap,
  Award,
  Building,
  Globe,
  Plus,
  X,
  Sparkles,
  Target,
  User,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import {
  EXPERIENCE_LEVELS,
  EDUCATION_LEVELS,
  PROFICIENCY_LEVELS,
  VISA_TYPES,
} from '@/lib/jobs/constants'
import type { SectionMode, RequirementsSectionData, SkillEntry } from '@/lib/jobs/types'
import { cn } from '@/lib/utils'

// ============ PROPS ============

interface RequirementsSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: RequirementsSectionData
  /** Handler for field changes */
  onChange?: (field: string, value: unknown) => void
  /** Handler to enter edit mode (view mode) */
  onEdit?: () => void
  /** Save handler (for edit mode) */
  onSave?: () => Promise<void>
  /** Cancel handler (for edit mode) */
  onCancel?: () => void
  /** Loading state for save operation */
  isSaving?: boolean
  /** Validation errors by field name */
  errors?: Record<string, string>
  /** Additional class name */
  className?: string
}

/**
 * RequirementsSection - Unified component for Job Requirements
 *
 * Covers skills, experience, education, and work authorization requirements
 */
export function RequirementsSection({
  mode,
  data,
  onChange,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: RequirementsSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')
  const [newSkillName, setNewSkillName] = React.useState('')
  const [newPreferredSkill, setNewPreferredSkill] = React.useState('')
  const [newCertification, setNewCertification] = React.useState('')
  const [newIndustry, setNewIndustry] = React.useState('')

  // Reset editing state when mode changes
  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  const handleChange = (field: string, value: unknown) => {
    onChange?.(field, value)
  }

  const handleSave = async () => {
    await onSave?.()
    setIsEditing(false)
  }

  const handleCancel = () => {
    onCancel?.()
    setIsEditing(false)
  }

  const handleEdit = () => {
    onEdit?.()
    setIsEditing(true)
  }

  // Editable in create mode or when explicitly editing
  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  // ============ Skill Management ============

  const addRequiredSkill = () => {
    if (!newSkillName.trim()) return
    const newSkill: SkillEntry = {
      name: newSkillName.trim(),
      years: '',
      proficiency: 'proficient',
    }
    handleChange('requiredSkills', [...data.requiredSkills, newSkill])
    setNewSkillName('')
  }

  const updateSkill = (index: number, updates: Partial<SkillEntry>) => {
    const updated = [...data.requiredSkills]
    updated[index] = { ...updated[index], ...updates }
    handleChange('requiredSkills', updated)
  }

  const removeSkill = (index: number) => {
    handleChange('requiredSkills', data.requiredSkills.filter((_, i) => i !== index))
  }

  const addPreferredSkill = () => {
    if (!newPreferredSkill.trim()) return
    handleChange('preferredSkills', [...data.preferredSkills, newPreferredSkill.trim()])
    setNewPreferredSkill('')
  }

  const removePreferredSkill = (index: number) => {
    handleChange('preferredSkills', data.preferredSkills.filter((_, i) => i !== index))
  }

  // ============ List Management ============

  const addCertification = () => {
    if (!newCertification.trim()) return
    handleChange('certifications', [...data.certifications, newCertification.trim()])
    setNewCertification('')
  }

  const removeCertification = (index: number) => {
    handleChange('certifications', data.certifications.filter((_, i) => i !== index))
  }

  const addIndustry = () => {
    if (!newIndustry.trim()) return
    handleChange('industries', [...data.industries, newIndustry.trim()])
    setNewIndustry('')
  }

  const removeIndustry = (index: number) => {
    handleChange('industries', data.industries.filter((_, i) => i !== index))
  }

  const toggleVisaRequirement = (visa: string) => {
    const current = data.visaRequirements
    if (current.includes(visa)) {
      handleChange('visaRequirements', current.filter((v) => v !== visa))
    } else {
      handleChange('visaRequirements', [...current, visa])
    }
  }

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header - only show Edit/Save/Cancel in view/edit mode */}
      {!isCreateMode && (
        <SectionHeader
          title="Requirements"
          subtitle="Skills, experience, and qualifications needed"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Cards Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Required Skills Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-purple-50 rounded-lg">
                <Code2 className="w-4 h-4 text-purple-600" />
              </div>
              <CardTitle className="text-base font-heading">Required Skills</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditable && (
              <div className="flex gap-2">
                <Input
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  placeholder="Add a required skill (e.g., React, Python)"
                  className="h-11 rounded-xl border-charcoal-200 bg-white flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
                />
                <Button
                  type="button"
                  onClick={addRequiredSkill}
                  disabled={!newSkillName.trim()}
                  className="h-11 px-4 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}

            {data.requiredSkills.length > 0 ? (
              <div className="space-y-3">
                {data.requiredSkills.map((skill, index) => (
                  <div
                    key={index}
                    className={cn(
                      'flex items-center gap-3 p-3 rounded-xl border transition-all',
                      isEditable
                        ? 'border-charcoal-200 bg-white'
                        : 'border-charcoal-100 bg-charcoal-50'
                    )}
                  >
                    <div className="flex-1 min-w-0">
                      <span className="font-medium text-charcoal-900">{skill.name}</span>
                    </div>
                    {isEditable ? (
                      <>
                        <Select
                          value={skill.years}
                          onValueChange={(value) => updateSkill(index, { years: value })}
                        >
                          <SelectTrigger className="w-28 h-9 rounded-lg border-charcoal-200 text-sm">
                            <SelectValue placeholder="Years" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">1+ year</SelectItem>
                            <SelectItem value="2">2+ years</SelectItem>
                            <SelectItem value="3">3+ years</SelectItem>
                            <SelectItem value="5">5+ years</SelectItem>
                            <SelectItem value="7">7+ years</SelectItem>
                            <SelectItem value="10">10+ years</SelectItem>
                          </SelectContent>
                        </Select>
                        <Select
                          value={skill.proficiency}
                          onValueChange={(value) =>
                            updateSkill(index, { proficiency: value as SkillEntry['proficiency'] })
                          }
                        >
                          <SelectTrigger className="w-28 h-9 rounded-lg border-charcoal-200 text-sm">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {PROFICIENCY_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkill(index)}
                          className="h-9 w-9 p-0 text-charcoal-400 hover:text-error-600"
                        >
                          <X className="w-4 h-4" />
                        </Button>
                      </>
                    ) : (
                      <>
                        {skill.years && (
                          <Badge variant="outline" className="text-xs">
                            {skill.years}+ years
                          </Badge>
                        )}
                        <Badge
                          variant={
                            skill.proficiency === 'expert'
                              ? 'default'
                              : skill.proficiency === 'proficient'
                                ? 'secondary'
                                : 'outline'
                          }
                          className="text-xs"
                        >
                          {PROFICIENCY_LEVELS.find((p) => p.value === skill.proficiency)?.label ||
                            skill.proficiency}
                        </Badge>
                      </>
                    )}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-charcoal-500 text-center py-6">
                No required skills specified
              </p>
            )}
          </CardContent>
        </Card>

        {/* Nice-to-Have Skills Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-green-50 rounded-lg">
                <Sparkles className="w-4 h-4 text-green-600" />
              </div>
              <CardTitle className="text-base font-heading">Nice-to-Have Skills</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditable && (
              <div className="flex gap-2">
                <Input
                  value={newPreferredSkill}
                  onChange={(e) => setNewPreferredSkill(e.target.value)}
                  placeholder="Add a preferred skill"
                  className="h-10 rounded-xl border-charcoal-200 bg-white flex-1"
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addPreferredSkill())
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addPreferredSkill}
                  disabled={!newPreferredSkill.trim()}
                  className="h-10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.preferredSkills.map((skill, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 flex items-center gap-1"
                >
                  {skill}
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => removePreferredSkill(index)}
                      className="ml-1 hover:text-error-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.preferredSkills.length === 0 && (
                <p className="text-sm text-charcoal-400">None specified</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Experience Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Target className="w-4 h-4 text-blue-600" />
              </div>
              <CardTitle className="text-base font-heading">Experience</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Experience Level */}
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Experience Level
              </Label>
              {isEditable ? (
                <Select
                  value={data.experienceLevel}
                  onValueChange={(value) => handleChange('experienceLevel', value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {EXPERIENCE_LEVELS.map((level) => (
                      <SelectItem key={level.value} value={level.value}>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-charcoal-400" />
                          {level.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <p className="text-sm text-charcoal-900">
                  {EXPERIENCE_LEVELS.find((l) => l.value === data.experienceLevel)?.label || (
                    <span className="text-charcoal-400">Not specified</span>
                  )}
                </p>
              )}
            </div>

            {/* Years Range */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Min Years
                </Label>
                {isEditable ? (
                  <Select
                    value={data.minExperience}
                    onValueChange={(value) => handleChange('minExperience', value)}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-charcoal-200 bg-white">
                      <SelectValue placeholder="Min" />
                    </SelectTrigger>
                    <SelectContent>
                      {['0', '1', '2', '3', '4', '5', '6', '7', '8', '10', '12', '15'].map(
                        (year) => (
                          <SelectItem key={year} value={year}>
                            {year} years
                          </SelectItem>
                        )
                      )}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-charcoal-900">
                    {data.minExperience ? `${data.minExperience} years` : 'Not set'}
                  </p>
                )}
              </div>
              <div className="space-y-2">
                <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                  Max Years
                </Label>
                {isEditable ? (
                  <Select
                    value={data.maxExperience}
                    onValueChange={(value) => handleChange('maxExperience', value)}
                  >
                    <SelectTrigger className="h-10 rounded-xl border-charcoal-200 bg-white">
                      <SelectValue placeholder="Max" />
                    </SelectTrigger>
                    <SelectContent>
                      {['3', '5', '7', '10', '12', '15', '20', '25'].map((year) => (
                        <SelectItem key={year} value={year}>
                          {year} years
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <p className="text-sm text-charcoal-900">
                    {data.maxExperience ? `${data.maxExperience} years` : 'Not set'}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Education Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-amber-50 rounded-lg">
                <GraduationCap className="w-4 h-4 text-amber-600" />
              </div>
              <CardTitle className="text-base font-heading">Education</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label className="text-xs font-medium text-charcoal-500 uppercase tracking-wider">
                Minimum Education
              </Label>
              {isEditable ? (
                <Select
                  value={data.education}
                  onValueChange={(value) => handleChange('education', value)}
                >
                  <SelectTrigger className="h-11 rounded-xl border-charcoal-200 bg-white">
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
              ) : (
                <p className="text-sm text-charcoal-900">
                  {EDUCATION_LEVELS.find((l) => l.value === data.education)?.label || (
                    <span className="text-charcoal-400">Not required</span>
                  )}
                </p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Certifications Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-red-50 rounded-lg">
                <Award className="w-4 h-4 text-red-600" />
              </div>
              <CardTitle className="text-base font-heading">Certifications</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditable && (
              <div className="flex gap-2">
                <Input
                  value={newCertification}
                  onChange={(e) => setNewCertification(e.target.value)}
                  placeholder="e.g., AWS Solutions Architect"
                  className="h-10 rounded-xl border-charcoal-200 bg-white flex-1"
                  onKeyDown={(e) =>
                    e.key === 'Enter' && (e.preventDefault(), addCertification())
                  }
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addCertification}
                  disabled={!newCertification.trim()}
                  className="h-10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.certifications.map((cert, index) => (
                <Badge
                  key={index}
                  variant="outline"
                  className="pl-3 pr-1 py-1 flex items-center gap-1 border-red-200 bg-red-50"
                >
                  <Award className="w-3 h-3 text-red-500" />
                  {cert}
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => removeCertification(index)}
                      className="ml-1 hover:text-error-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.certifications.length === 0 && (
                <p className="text-sm text-charcoal-400">No certifications required</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Industries Card */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-teal-50 rounded-lg">
                <Building className="w-4 h-4 text-teal-600" />
              </div>
              <CardTitle className="text-base font-heading">Industry Experience</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            {isEditable && (
              <div className="flex gap-2">
                <Input
                  value={newIndustry}
                  onChange={(e) => setNewIndustry(e.target.value)}
                  placeholder="e.g., Healthcare, FinTech"
                  className="h-10 rounded-xl border-charcoal-200 bg-white flex-1"
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addIndustry())}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={addIndustry}
                  disabled={!newIndustry.trim()}
                  className="h-10 rounded-xl"
                >
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
            )}
            <div className="flex flex-wrap gap-2">
              {data.industries.map((industry, index) => (
                <Badge
                  key={index}
                  variant="secondary"
                  className="pl-3 pr-1 py-1 flex items-center gap-1"
                >
                  {industry}
                  {isEditable && (
                    <button
                      type="button"
                      onClick={() => removeIndustry(index)}
                      className="ml-1 hover:text-error-600"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </Badge>
              ))}
              {data.industries.length === 0 && (
                <p className="text-sm text-charcoal-400">Any industry acceptable</p>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Work Authorization Card - Full Width */}
        <Card className="shadow-elevation-sm hover:shadow-elevation-md transition-shadow lg:col-span-2">
          <CardHeader className="pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-indigo-50 rounded-lg">
                <Globe className="w-4 h-4 text-indigo-600" />
              </div>
              <CardTitle className="text-base font-heading">Work Authorization</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {isEditable ? (
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                {VISA_TYPES.map((visa) => (
                  <button
                    key={visa.value}
                    type="button"
                    onClick={() => toggleVisaRequirement(visa.value)}
                    className={cn(
                      'p-3 rounded-xl border-2 text-left transition-all duration-200',
                      data.visaRequirements.includes(visa.value)
                        ? 'border-indigo-400 bg-indigo-50'
                        : 'border-charcoal-100 bg-white hover:border-indigo-200'
                    )}
                  >
                    <span className="text-sm font-medium text-charcoal-900">{visa.label}</span>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex flex-wrap gap-2">
                {data.visaRequirements.length > 0 ? (
                  data.visaRequirements.map((visa, index) => (
                    <Badge key={index} variant="secondary" className="py-1">
                      {VISA_TYPES.find((v) => v.value === visa)?.label || visa}
                    </Badge>
                  ))
                ) : (
                  <p className="text-sm text-charcoal-400">No specific authorization required</p>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default RequirementsSection
