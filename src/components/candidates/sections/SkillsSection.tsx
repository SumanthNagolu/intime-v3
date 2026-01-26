'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Award,
  Code,
  Plus,
  Pencil,
  Trash2,
  Star,
  Calendar,
  ExternalLink,
  Shield,
  Check,
  X,
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import type { SectionMode, SkillsSectionData, SkillEntry, CertificationEntry } from '@/lib/candidates/types'
import { PROFICIENCY_LEVELS } from '@/lib/candidates/types'
import { cn } from '@/lib/utils'
import { format, isPast, addMonths, isAfter } from 'date-fns'

// ============ INLINE FORM TYPES ============

interface SkillFormData {
  skillName: string
  skillCategory: string
  proficiencyLevel: number
  yearsExperience: string
  isPrimary: boolean
}

interface CertificationFormData {
  name: string
  acronym: string
  issuingOrganization: string
  credentialId: string
  credentialUrl: string
  issueDate: string
  expiryDate: string
  isLifetime: boolean
}

const emptySkillForm: SkillFormData = {
  skillName: '',
  skillCategory: '',
  proficiencyLevel: 3,
  yearsExperience: '',
  isPrimary: false,
}

const emptyCertificationForm: CertificationFormData = {
  name: '',
  acronym: '',
  issuingOrganization: '',
  credentialId: '',
  credentialUrl: '',
  issueDate: '',
  expiryDate: '',
  isLifetime: false,
}

// ============ PROPS ============

interface SkillsSectionProps {
  /** Mode determines rendering style */
  mode: SectionMode
  /** Data to display/edit */
  data: SkillsSectionData
  /** Handler to add skill entry */
  onAddSkill?: (entry: Omit<SkillEntry, 'id'>) => void
  /** Handler to update skill entry */
  onUpdateSkill?: (id: string, entry: Partial<SkillEntry>) => void
  /** Handler to remove skill entry */
  onRemoveSkill?: (id: string) => void
  /** Handler to add certification entry */
  onAddCertification?: (entry: Omit<CertificationEntry, 'id'>) => void
  /** Handler to update certification entry */
  onUpdateCertification?: (id: string, entry: Partial<CertificationEntry>) => void
  /** Handler to remove certification entry */
  onRemoveCertification?: (id: string) => void
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
 * SkillsSection - Unified component for Candidate Skills (Section 3)
 *
 * Fields:
 * - Skills: name, category, proficiency, years of experience
 * - Certifications: name, issuer, dates, credential ID
 */
export function SkillsSection({
  mode,
  data,
  onAddSkill,
  onUpdateSkill,
  onRemoveSkill,
  onAddCertification,
  onUpdateCertification,
  onRemoveCertification,
  onEdit,
  onSave,
  onCancel,
  isSaving = false,
  errors = {},
  className,
}: SkillsSectionProps) {
  const [isEditing, setIsEditing] = React.useState(mode === 'edit')

  // State for inline skill editing
  const [isAddingSkill, setIsAddingSkill] = React.useState(false)
  const [editingSkillId, setEditingSkillId] = React.useState<string | null>(null)
  const [skillForm, setSkillForm] = React.useState<SkillFormData>(emptySkillForm)

  // State for inline certification editing
  const [isAddingCertification, setIsAddingCertification] = React.useState(false)
  const [editingCertificationId, setEditingCertificationId] = React.useState<string | null>(null)
  const [certificationForm, setCertificationForm] = React.useState<CertificationFormData>(emptyCertificationForm)

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

  // Skill handlers
  const handleStartAddSkill = () => {
    setSkillForm(emptySkillForm)
    setIsAddingSkill(true)
    setEditingSkillId(null)
  }

  const handleStartEditSkill = (skill: SkillEntry) => {
    setSkillForm({
      skillName: skill.skillName || '',
      skillCategory: skill.skillCategory || '',
      proficiencyLevel: skill.proficiencyLevel || 3,
      yearsExperience: skill.yearsExperience?.toString() || '',
      isPrimary: skill.isPrimary,
    })
    setEditingSkillId(skill.id)
    setIsAddingSkill(false)
  }

  const handleSaveSkill = () => {
    if (!skillForm.skillName.trim()) return

    const entry: Omit<SkillEntry, 'id'> = {
      skillId: '',
      skillName: skillForm.skillName,
      skillCategory: skillForm.skillCategory || null,
      proficiencyLevel: skillForm.proficiencyLevel,
      yearsExperience: skillForm.yearsExperience ? parseInt(skillForm.yearsExperience, 10) : null,
      isPrimary: skillForm.isPrimary,
      source: 'manual',
    }

    if (editingSkillId) {
      onUpdateSkill?.(editingSkillId, entry)
      setEditingSkillId(null)
    } else {
      onAddSkill?.(entry)
      setIsAddingSkill(false)
    }
    setSkillForm(emptySkillForm)
  }

  const handleCancelSkill = () => {
    setIsAddingSkill(false)
    setEditingSkillId(null)
    setSkillForm(emptySkillForm)
  }

  // Certification handlers
  const handleStartAddCertification = () => {
    setCertificationForm(emptyCertificationForm)
    setIsAddingCertification(true)
    setEditingCertificationId(null)
  }

  const handleStartEditCertification = (cert: CertificationEntry) => {
    setCertificationForm({
      name: cert.name || '',
      acronym: cert.acronym || '',
      issuingOrganization: cert.issuingOrganization || '',
      credentialId: cert.credentialId || '',
      credentialUrl: cert.credentialUrl || '',
      issueDate: cert.issueDate || '',
      expiryDate: cert.expiryDate || '',
      isLifetime: cert.isLifetime,
    })
    setEditingCertificationId(cert.id)
    setIsAddingCertification(false)
  }

  const handleSaveCertification = () => {
    if (!certificationForm.name.trim()) return

    const entry: Omit<CertificationEntry, 'id'> = {
      name: certificationForm.name,
      acronym: certificationForm.acronym || null,
      issuingOrganization: certificationForm.issuingOrganization || null,
      credentialId: certificationForm.credentialId || null,
      credentialUrl: certificationForm.credentialUrl || null,
      issueDate: certificationForm.issueDate || null,
      expiryDate: certificationForm.isLifetime ? null : (certificationForm.expiryDate || null),
      isLifetime: certificationForm.isLifetime,
    }

    if (editingCertificationId) {
      onUpdateCertification?.(editingCertificationId, entry)
      setEditingCertificationId(null)
    } else {
      onAddCertification?.(entry)
      setIsAddingCertification(false)
    }
    setCertificationForm(emptyCertificationForm)
  }

  const handleCancelCertification = () => {
    setIsAddingCertification(false)
    setEditingCertificationId(null)
    setCertificationForm(emptyCertificationForm)
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

  const isEditable = mode === 'create' || isEditing
  const isCreateMode = mode === 'create'

  const getProficiencyLabel = (level: number) => {
    return PROFICIENCY_LEVELS.find(l => l.value === level)?.label || `Level ${level}`
  }

  const getProficiencyColor = (level: number) => {
    switch (level) {
      case 1: return 'bg-charcoal-100 text-charcoal-700'
      case 2: return 'bg-blue-100 text-blue-700'
      case 3: return 'bg-green-100 text-green-700'
      case 4: return 'bg-purple-100 text-purple-700'
      case 5: return 'bg-gold-100 text-gold-700'
      default: return 'bg-charcoal-100 text-charcoal-700'
    }
  }

  const getCertExpiryStatus = (expiryDate: string | null, isLifetime: boolean) => {
    if (isLifetime) return { status: 'lifetime', label: 'Lifetime' }
    if (!expiryDate) return { status: 'unknown', label: 'No expiry' }
    
    const expiry = new Date(expiryDate)
    const now = new Date()
    const threeMonthsFromNow = addMonths(now, 3)
    
    if (isPast(expiry)) return { status: 'expired', label: 'Expired' }
    if (isAfter(threeMonthsFromNow, expiry)) return { status: 'expiring', label: 'Expiring Soon' }
    return { status: 'active', label: 'Active' }
  }

  // Group skills by category
  const skillsByCategory = data.skills.reduce((acc, skill) => {
    const category = skill.skillCategory || 'Other'
    if (!acc[category]) acc[category] = []
    acc[category].push(skill)
    return acc
  }, {} as Record<string, SkillEntry[]>)

  const primarySkills = data.skills.filter(s => s.isPrimary)

  return (
    <div className={cn('space-y-6', className)}>
      {/* Section Header */}
      {!isCreateMode && (
        <SectionHeader
          title="Skills"
          subtitle="Technical skills and certifications"
          mode={isEditing ? 'edit' : 'view'}
          onEdit={handleEdit}
          onSave={handleSave}
          onCancel={handleCancel}
          isSaving={isSaving}
        />
      )}

      {/* Skills */}
      <Card className="relative overflow-hidden border-charcoal-200/60 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-300 via-blue-400 to-blue-300" />
        <CardHeader className="pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200/60 shadow-sm">
                <Code className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading font-semibold text-charcoal-900 tracking-tight">Skills</CardTitle>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {data.skills.length} skill{data.skills.length !== 1 ? 's' : ''}
                  {primarySkills.length > 0 && ` · ${primarySkills.length} primary`}
                </p>
              </div>
            </div>
            {isEditable && !isAddingSkill && !editingSkillId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartAddSkill}
                className="gap-1.5 border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Inline Add Form */}
          {isAddingSkill && (
            <div className="mb-5 p-5 rounded-xl border-2 border-dashed border-blue-300/70 bg-gradient-to-br from-blue-50/40 to-sky-50/30 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-charcoal-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-blue-600" />
                  </div>
                  Add Skill
                </h4>
                <Button variant="ghost" size="sm" onClick={handleCancelSkill} className="text-charcoal-500 hover:text-charcoal-700">
                  Cancel
                </Button>
              </div>
              <SkillForm
                form={skillForm}
                onChange={setSkillForm}
                onSave={handleSaveSkill}
                onCancel={handleCancelSkill}
              />
            </div>
          )}

          {data.skills.length === 0 && !isAddingSkill ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-blue-100 to-blue-50 flex items-center justify-center border border-blue-200/60">
                <Code className="w-7 h-7 text-blue-400" />
              </div>
              <h4 className="text-sm font-medium text-charcoal-600 mb-1">No skills added</h4>
              <p className="text-xs text-charcoal-400 mb-4">Add technical skills to build the candidate profile</p>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartAddSkill}
                  className="gap-1.5 border-charcoal-200 hover:border-blue-300 hover:bg-blue-50/50 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Skill
                </Button>
              )}
            </div>
          ) : data.skills.length > 0 && (
            <div className="space-y-4">
              {/* Inline Edit Form for Skills */}
              {editingSkillId && (
                <div className="mb-3 p-5 rounded-xl border-2 border-blue-300 bg-gradient-to-br from-blue-50 to-white shadow-sm animate-in fade-in duration-200">
                  <div className="flex items-center justify-between mb-5">
                    <h4 className="font-semibold text-charcoal-800 flex items-center gap-2.5">
                      <div className="w-7 h-7 rounded-lg bg-blue-100 flex items-center justify-center">
                        <Pencil className="w-4 h-4 text-blue-600" />
                      </div>
                      Edit Skill
                    </h4>
                    <Button variant="ghost" size="sm" onClick={handleCancelSkill} className="text-charcoal-500 hover:text-charcoal-700">
                      Cancel
                    </Button>
                  </div>
                  <SkillForm
                    form={skillForm}
                    onChange={setSkillForm}
                    onSave={handleSaveSkill}
                    onCancel={handleCancelSkill}
                    isEdit
                  />
                </div>
              )}

              {/* Primary Skills */}
              {primarySkills.length > 0 && (
                <div>
                  <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                    Primary Skills
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {primarySkills.map((skill) => (
                      <div
                        key={skill.id}
                        className={cn(
                          'group inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gold-200 bg-gold-50/50 transition-all duration-200 hover:border-gold-300',
                          editingSkillId === skill.id && 'ring-2 ring-blue-500 ring-offset-1'
                        )}
                      >
                        <Star className="w-3.5 h-3.5 text-gold-500 fill-gold-500" />
                        <span className="font-medium text-charcoal-900">{skill.skillName}</span>
                        <Badge className={cn('text-xs', getProficiencyColor(skill.proficiencyLevel))}>
                          {getProficiencyLabel(skill.proficiencyLevel)}
                        </Badge>
                        {skill.yearsExperience && (
                          <span className="text-xs text-charcoal-500">{skill.yearsExperience}y</span>
                        )}
                        {isEditable && (
                          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleStartEditSkill(skill)}
                              className="h-6 w-6 p-0 text-charcoal-400 hover:text-charcoal-700"
                            >
                              <Pencil className="w-3 h-3" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveSkill?.(skill.id)}
                              className="h-6 w-6 p-0 text-charcoal-400 hover:text-error-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Skills by Category */}
              {Object.entries(skillsByCategory).map(([category, skills]) => {
                const nonPrimarySkills = skills.filter(s => !s.isPrimary)
                if (nonPrimarySkills.length === 0) return null

                return (
                  <div key={category}>
                    <p className="text-xs font-medium text-charcoal-500 uppercase tracking-wider mb-2">
                      {category}
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {nonPrimarySkills.map((skill) => (
                        <div
                          key={skill.id}
                          className={cn(
                            'group inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-charcoal-100 bg-charcoal-50 transition-all duration-200 hover:border-charcoal-200',
                            editingSkillId === skill.id && 'ring-2 ring-blue-500 ring-offset-1'
                          )}
                        >
                          <span className="text-sm text-charcoal-900">{skill.skillName}</span>
                          <Badge className={cn('text-xs', getProficiencyColor(skill.proficiencyLevel))}>
                            {getProficiencyLabel(skill.proficiencyLevel)}
                          </Badge>
                          {skill.yearsExperience && (
                            <span className="text-xs text-charcoal-400">{skill.yearsExperience}y</span>
                          )}
                          {isEditable && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEditSkill(skill)}
                                className="h-5 w-5 p-0 text-charcoal-400 hover:text-charcoal-700"
                              >
                                <Pencil className="w-3 h-3" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveSkill?.(skill.id)}
                                className="h-5 w-5 p-0 text-charcoal-400 hover:text-error-600"
                              >
                                <Trash2 className="w-3 h-3" />
                              </Button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Certifications */}
      <Card className="relative overflow-hidden border-charcoal-200/60 shadow-elevation-sm hover:shadow-elevation-md transition-all duration-300">
        {/* Top accent line */}
        <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-gold-300 via-gold-400 to-gold-300" />
        <CardHeader className="pb-4 pt-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center border border-gold-200/60 shadow-sm">
                <Award className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading font-semibold text-charcoal-900 tracking-tight">Certifications</CardTitle>
                <p className="text-xs text-charcoal-500 mt-0.5">
                  {data.certifications.length} certification{data.certifications.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {isEditable && !isAddingCertification && !editingCertificationId && (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartAddCertification}
                className="gap-1.5 border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50 transition-all duration-200"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          {/* Inline Add Form */}
          {isAddingCertification && (
            <div className="mb-5 p-5 rounded-xl border-2 border-dashed border-gold-300/70 bg-gradient-to-br from-gold-50/40 to-amber-50/30 animate-in fade-in duration-300">
              <div className="flex items-center justify-between mb-5">
                <h4 className="font-semibold text-charcoal-800 flex items-center gap-2.5">
                  <div className="w-7 h-7 rounded-lg bg-gold-100 flex items-center justify-center">
                    <Plus className="w-4 h-4 text-gold-600" />
                  </div>
                  Add Certification
                </h4>
                <Button variant="ghost" size="sm" onClick={handleCancelCertification} className="text-charcoal-500 hover:text-charcoal-700">
                  Cancel
                </Button>
              </div>
              <CertificationForm
                form={certificationForm}
                onChange={setCertificationForm}
                onSave={handleSaveCertification}
                onCancel={handleCancelCertification}
              />
            </div>
          )}

          {data.certifications.length === 0 && !isAddingCertification ? (
            <div className="text-center py-12 px-6">
              <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-gradient-to-br from-gold-100 to-gold-50 flex items-center justify-center border border-gold-200/60">
                <Award className="w-7 h-7 text-gold-400" />
              </div>
              <h4 className="text-sm font-medium text-charcoal-600 mb-1">No certifications added</h4>
              <p className="text-xs text-charcoal-400 mb-4">Add professional certifications and credentials</p>
              {isEditable && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartAddCertification}
                  className="gap-1.5 border-charcoal-200 hover:border-gold-300 hover:bg-gold-50/50 transition-all duration-200"
                >
                  <Plus className="w-4 h-4" />
                  Add Certification
                </Button>
              )}
            </div>
          ) : data.certifications.length > 0 && (
            <div className="space-y-3">
              {data.certifications.map((cert, index) => {
                const expiryStatus = getCertExpiryStatus(cert.expiryDate, cert.isLifetime)

                return (
                  <div key={cert.id} className="animate-in fade-in duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                    {editingCertificationId === cert.id ? (
                      // Inline Edit Form
                      <div className="p-5 rounded-xl border-2 border-gold-300 bg-gradient-to-br from-gold-50 to-white shadow-sm animate-in fade-in duration-200">
                        <div className="flex items-center justify-between mb-5">
                          <h4 className="font-semibold text-charcoal-800 flex items-center gap-2.5">
                            <div className="w-7 h-7 rounded-lg bg-gold-100 flex items-center justify-center">
                              <Pencil className="w-4 h-4 text-gold-600" />
                            </div>
                            Edit Certification
                          </h4>
                          <Button variant="ghost" size="sm" onClick={handleCancelCertification} className="text-charcoal-500 hover:text-charcoal-700">
                            Cancel
                          </Button>
                        </div>
                        <CertificationForm
                          form={certificationForm}
                          onChange={setCertificationForm}
                          onSave={handleSaveCertification}
                          onCancel={handleCancelCertification}
                          isEdit
                        />
                      </div>
                    ) : (
                      // Display Mode
                      <div
                        className={cn(
                          'group p-4 rounded-xl border transition-all duration-200 hover:shadow-sm',
                          expiryStatus.status === 'expired' && 'border-error-200 bg-error-50/30',
                          expiryStatus.status === 'expiring' && 'border-amber-200 bg-amber-50/30',
                          expiryStatus.status === 'active' && 'border-charcoal-200/60 bg-white hover:bg-charcoal-50/30',
                          expiryStatus.status === 'lifetime' && 'border-green-200 bg-green-50/30',
                          expiryStatus.status === 'unknown' && 'border-charcoal-200/60 bg-white hover:bg-charcoal-50/30'
                        )}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1">
                              <Shield className="w-4 h-4 text-gold-600" />
                              <h4 className="font-semibold text-charcoal-900">
                                {cert.name}
                                {cert.acronym && ` (${cert.acronym})`}
                              </h4>
                              <Badge
                                variant={
                                  expiryStatus.status === 'expired' ? 'destructive' :
                                  expiryStatus.status === 'expiring' ? 'warning' :
                                  expiryStatus.status === 'lifetime' ? 'success' :
                                  'secondary'
                                }
                                className="text-xs"
                              >
                                {expiryStatus.label}
                              </Badge>
                            </div>
                            <div className="flex items-center gap-4 text-sm text-charcoal-600 flex-wrap">
                              {cert.issuingOrganization && (
                                <span>{cert.issuingOrganization}</span>
                              )}
                              {cert.issueDate && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="w-3.5 h-3.5" />
                                  Issued {format(new Date(cert.issueDate), 'MMM yyyy')}
                                </span>
                              )}
                              {cert.expiryDate && !cert.isLifetime && (
                                <span className="text-charcoal-500">
                                  Expires {format(new Date(cert.expiryDate), 'MMM yyyy')}
                                </span>
                              )}
                              {cert.credentialId && (
                                <span className="text-charcoal-400">ID: {cert.credentialId}</span>
                              )}
                            </div>
                            {cert.credentialUrl && (
                              <a
                                href={cert.credentialUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:underline mt-2"
                              >
                                View Credential <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                          {isEditable && (
                            <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity duration-200 ml-4">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleStartEditCertification(cert)}
                                className="h-8 w-8 p-0 text-charcoal-400 hover:text-charcoal-700 hover:bg-charcoal-100"
                              >
                                <Pencil className="w-4 h-4" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => onRemoveCertification?.(cert.id)}
                                className="h-8 w-8 p-0 text-charcoal-400 hover:text-error-600 hover:bg-error-50"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

// ============ INLINE FORM COMPONENTS ============

interface SkillFormProps {
  form: SkillFormData
  onChange: (form: SkillFormData) => void
  onSave: () => void
  onCancel: () => void
  isEdit?: boolean
}

function SkillForm({ form, onChange, onSave, onCancel, isEdit }: SkillFormProps) {
  const isValid = form.skillName.trim()

  return (
    <div className="space-y-4">
      {/* Row 1: Skill Name & Category */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">
            Skill Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.skillName}
            onChange={(e) => onChange({ ...form, skillName: e.target.value })}
            placeholder="e.g., React, Python, AWS"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Category</Label>
          <Select
            value={form.skillCategory || ''}
            onValueChange={(value) => onChange({ ...form, skillCategory: value })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="programming">Programming Languages</SelectItem>
              <SelectItem value="frameworks">Frameworks & Libraries</SelectItem>
              <SelectItem value="databases">Databases</SelectItem>
              <SelectItem value="cloud">Cloud & DevOps</SelectItem>
              <SelectItem value="tools">Tools & Software</SelectItem>
              <SelectItem value="soft_skills">Soft Skills</SelectItem>
              <SelectItem value="other">Other</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Row 2: Proficiency & Years */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Proficiency Level</Label>
          <Select
            value={form.proficiencyLevel.toString()}
            onValueChange={(value) => onChange({ ...form, proficiencyLevel: parseInt(value, 10) })}
          >
            <SelectTrigger className="h-10">
              <SelectValue placeholder="Select level" />
            </SelectTrigger>
            <SelectContent>
              {PROFICIENCY_LEVELS.map((level) => (
                <SelectItem key={level.value} value={level.value.toString()}>
                  {level.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Years of Experience</Label>
          <Input
            type="number"
            min="0"
            max="50"
            value={form.yearsExperience}
            onChange={(e) => onChange({ ...form, yearsExperience: e.target.value })}
            placeholder="e.g., 5"
            className="h-10"
          />
        </div>
      </div>

      {/* Row 3: Primary Skill Checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={form.isPrimary}
          onCheckedChange={(checked) => onChange({ ...form, isPrimary: !!checked })}
        />
        <span className="text-sm text-charcoal-700">Mark as primary skill</span>
      </label>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-charcoal-100">
        <Button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Check className="w-4 h-4" />
          {isEdit ? 'Save Changes' : 'Add Skill'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-charcoal-200 hover:bg-charcoal-50 transition-all duration-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

interface CertificationFormProps {
  form: CertificationFormData
  onChange: (form: CertificationFormData) => void
  onSave: () => void
  onCancel: () => void
  isEdit?: boolean
}

function CertificationForm({ form, onChange, onSave, onCancel, isEdit }: CertificationFormProps) {
  const isValid = form.name.trim()

  return (
    <div className="space-y-4">
      {/* Row 1: Name & Acronym */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="md:col-span-2 space-y-2">
          <Label className="text-xs text-charcoal-600">
            Certification Name <span className="text-red-500">*</span>
          </Label>
          <Input
            value={form.name}
            onChange={(e) => onChange({ ...form, name: e.target.value })}
            placeholder="e.g., AWS Solutions Architect"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Acronym</Label>
          <Input
            value={form.acronym}
            onChange={(e) => onChange({ ...form, acronym: e.target.value })}
            placeholder="e.g., SAA-C03"
            className="h-10"
          />
        </div>
      </div>

      {/* Row 2: Issuing Organization */}
      <div className="space-y-2">
        <Label className="text-xs text-charcoal-600">Issuing Organization</Label>
        <Input
          value={form.issuingOrganization}
          onChange={(e) => onChange({ ...form, issuingOrganization: e.target.value })}
          placeholder="e.g., Amazon Web Services"
          className="h-10"
        />
      </div>

      {/* Row 3: Dates */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Issue Date</Label>
          <Input
            type="month"
            value={form.issueDate}
            onChange={(e) => onChange({ ...form, issueDate: e.target.value })}
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Expiry Date</Label>
          <Input
            type="month"
            value={form.expiryDate}
            onChange={(e) => onChange({ ...form, expiryDate: e.target.value })}
            disabled={form.isLifetime}
            className="h-10"
          />
        </div>
      </div>

      {/* Row 4: Lifetime Checkbox */}
      <label className="flex items-center gap-2 cursor-pointer">
        <Checkbox
          checked={form.isLifetime}
          onCheckedChange={(checked) => onChange({
            ...form,
            isLifetime: !!checked,
            expiryDate: checked ? '' : form.expiryDate
          })}
        />
        <span className="text-sm text-charcoal-700">This certification does not expire</span>
      </label>

      {/* Row 5: Credential Info */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Credential ID</Label>
          <Input
            value={form.credentialId}
            onChange={(e) => onChange({ ...form, credentialId: e.target.value })}
            placeholder="e.g., ABC123XYZ"
            className="h-10"
          />
        </div>
        <div className="space-y-2">
          <Label className="text-xs text-charcoal-600">Credential URL</Label>
          <Input
            type="url"
            value={form.credentialUrl}
            onChange={(e) => onChange({ ...form, credentialUrl: e.target.value })}
            placeholder="https://..."
            className="h-10"
          />
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3 pt-4 border-t border-charcoal-100">
        <Button
          type="button"
          onClick={onSave}
          disabled={!isValid}
          className="gap-2 bg-charcoal-900 hover:bg-charcoal-800 text-white shadow-sm hover:shadow-md transition-all duration-200"
        >
          <Check className="w-4 h-4" />
          {isEdit ? 'Save Changes' : 'Add Certification'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          className="border-charcoal-200 hover:bg-charcoal-50 transition-all duration-200"
        >
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default SkillsSection
