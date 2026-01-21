'use client'

import * as React from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
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
} from 'lucide-react'
import { SectionHeader } from '@/components/accounts/fields/SectionHeader'
import type { SectionMode, SkillsSectionData, SkillEntry, CertificationEntry } from '@/lib/candidates/types'
import { PROFICIENCY_LEVELS } from '@/lib/candidates/types'
import { cn } from '@/lib/utils'
import { format, isPast, addMonths, isAfter } from 'date-fns'

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

  React.useEffect(() => {
    setIsEditing(mode === 'edit')
  }, [mode])

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
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 rounded-lg">
                <Code className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">Skills</CardTitle>
                <p className="text-xs text-charcoal-500">
                  {data.skills.length} skill{data.skills.length !== 1 ? 's' : ''}
                  {primarySkills.length > 0 && ` · ${primarySkills.length} primary`}
                </p>
              </div>
            </div>
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddSkill?.({
                  skillId: '',
                  skillName: '',
                  skillCategory: null,
                  proficiencyLevel: 3,
                  yearsExperience: null,
                  isPrimary: false,
                  source: 'manual',
                })}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add Skill
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.skills.length === 0 ? (
            <div className="text-center py-8 text-charcoal-400">
              <Code className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No skills added yet</p>
            </div>
          ) : (
            <div className="space-y-4">
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
                        className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border border-gold-200 bg-gold-50/50"
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
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveSkill?.(skill.id)}
                            className="h-6 w-6 p-0 text-charcoal-400 hover:text-error-600"
                          >
                            <Trash2 className="w-3 h-3" />
                          </Button>
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
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border border-charcoal-100 bg-charcoal-50"
                        >
                          <span className="text-sm text-charcoal-900">{skill.skillName}</span>
                          <Badge className={cn('text-xs', getProficiencyColor(skill.proficiencyLevel))}>
                            {getProficiencyLabel(skill.proficiencyLevel)}
                          </Badge>
                          {skill.yearsExperience && (
                            <span className="text-xs text-charcoal-400">{skill.yearsExperience}y</span>
                          )}
                          {isEditable && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onRemoveSkill?.(skill.id)}
                              className="h-5 w-5 p-0 text-charcoal-400 hover:text-error-600"
                            >
                              <Trash2 className="w-3 h-3" />
                            </Button>
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
      <Card className="shadow-elevation-sm">
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-gold-50 rounded-lg">
                <Award className="w-4 h-4 text-gold-600" />
              </div>
              <div>
                <CardTitle className="text-base font-heading">Certifications</CardTitle>
                <p className="text-xs text-charcoal-500">
                  {data.certifications.length} certification{data.certifications.length !== 1 ? 's' : ''}
                </p>
              </div>
            </div>
            {isEditable && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => onAddCertification?.({
                  name: '',
                  acronym: null,
                  issuingOrganization: null,
                  credentialId: null,
                  credentialUrl: null,
                  issueDate: null,
                  expiryDate: null,
                  isLifetime: false,
                })}
                className="gap-1.5"
              >
                <Plus className="w-4 h-4" />
                Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {data.certifications.length === 0 ? (
            <div className="text-center py-8 text-charcoal-400">
              <Award className="w-8 h-8 mx-auto mb-2 opacity-50" />
              <p className="text-sm">No certifications added yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              {data.certifications.map((cert) => {
                const expiryStatus = getCertExpiryStatus(cert.expiryDate, cert.isLifetime)
                
                return (
                  <div
                    key={cert.id}
                    className={cn(
                      'p-4 rounded-lg border bg-charcoal-50/50',
                      expiryStatus.status === 'expired' && 'border-error-200 bg-error-50/30',
                      expiryStatus.status === 'expiring' && 'border-amber-200 bg-amber-50/30',
                      expiryStatus.status === 'active' && 'border-charcoal-100',
                      expiryStatus.status === 'lifetime' && 'border-green-200 bg-green-50/30'
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
                        <div className="flex items-center gap-4 text-sm text-charcoal-600">
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
                        <div className="flex items-center gap-1 ml-4">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => {/* Open edit modal */}}
                            className="h-8 w-8 p-0"
                          >
                            <Pencil className="w-4 h-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveCertification?.(cert.id)}
                            className="h-8 w-8 p-0 text-error-600 hover:text-error-700"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      )}
                    </div>
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

export default SkillsSection
