'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Edit, Check, X, Loader2 } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { FullJob } from '@/types/job'

interface RequirementsCardProps {
  job: FullJob
  jobId: string
}

interface RequirementGroup {
  id: string
  label: string
  fields: {
    key: string
    dbKey: string
    label: string
    placeholder: string
    type: 'string' | 'array' | 'jsonb' | 'number'
  }[]
}

function toDisplayString(value: unknown): string {
  if (value === null || value === undefined) return ''
  if (typeof value === 'string') return value
  if (typeof value === 'number') return String(value)
  if (Array.isArray(value)) return value.join('\n')
  if (typeof value === 'object') {
    const obj = value as Record<string, unknown>
    if (obj.degree || obj.field) {
      return [obj.degree, obj.field, obj.institution].filter(Boolean).join(', ')
    }
    return JSON.stringify(value, null, 2)
  }
  return String(value)
}

const REQUIREMENT_GROUPS: RequirementGroup[] = [
  {
    id: 'skills',
    label: 'Skills',
    fields: [
      { key: 'required_skills', dbKey: 'required_skills', label: 'Required Skills', placeholder: 'Enter required skills (one per line)...', type: 'array' },
      { key: 'preferred_skills', dbKey: 'nice_to_have_skills', label: 'Preferred Skills', placeholder: 'Enter preferred/nice-to-have skills (one per line)...', type: 'array' },
    ],
  },
  {
    id: 'experience',
    label: 'Experience',
    fields: [
      { key: 'min_experience_years', dbKey: 'min_experience_years', label: 'Min Years', placeholder: '0', type: 'number' },
      { key: 'max_experience_years', dbKey: 'max_experience_years', label: 'Max Years', placeholder: '10', type: 'number' },
      { key: 'experience_level', dbKey: 'experience_level', label: 'Experience Details', placeholder: 'e.g., 5+ years in software development, 3+ years with React...', type: 'string' },
    ],
  },
  {
    id: 'qualifications',
    label: 'Qualifications',
    fields: [
      { key: 'education', dbKey: 'education', label: 'Education', placeholder: "e.g., Bachelor's degree in Computer Science or related field...", type: 'jsonb' },
      { key: 'certifications', dbKey: 'certifications', label: 'Certifications', placeholder: 'e.g., AWS Certified Solutions Architect, PMP (one per line)...', type: 'array' },
    ],
  },
  {
    id: 'visa',
    label: 'Work Authorization',
    fields: [
      { key: 'visa_requirements', dbKey: 'visa_requirements', label: 'Visa/Work Authorization', placeholder: 'e.g., US Citizen, Green Card, H1B, OPT (one per line)...', type: 'array' },
    ],
  },
]

type EditableFields = {
  required_skills: string
  preferred_skills: string
  min_experience_years: string
  max_experience_years: string
  experience_level: string
  education: string
  certifications: string
  visa_requirements: string
}

export function RequirementsCard({ job, jobId }: RequirementsCardProps) {
  const utils = trpc.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    skills: true,
    experience: true,
    qualifications: false,
    visa: false,
  })
  const [editData, setEditData] = useState<EditableFields>({
    required_skills: '',
    preferred_skills: '',
    min_experience_years: '',
    max_experience_years: '',
    experience_level: '',
    education: '',
    certifications: '',
    visa_requirements: '',
  })

  useEffect(() => {
    if (job) {
      const jobData = job as Record<string, unknown>
      setEditData({
        required_skills: toDisplayString(job.required_skills),
        preferred_skills: toDisplayString(jobData.nice_to_have_skills),
        min_experience_years: toDisplayString(jobData.min_experience_years),
        max_experience_years: toDisplayString(jobData.max_experience_years),
        experience_level: toDisplayString(job.experience_level),
        education: toDisplayString(job.education),
        certifications: toDisplayString(job.certifications),
        visa_requirements: toDisplayString(jobData.visa_requirements),
      })
    }
  }, [job])

  const updateMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Requirements updated' })
      setIsEditing(false)
      utils.ats.jobs.getFullJob.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Update failed', description: error.message, variant: 'error' })
    },
  })

  const toggleGroup = (groupId: string) => {
    setOpenGroups((prev) => ({ ...prev, [groupId]: !prev[groupId] }))
  }

  const handleSave = () => {
    const toArray = (str: string): string[] | undefined => {
      if (!str.trim()) return undefined
      return str.split(/[\n,]/).map(s => s.trim()).filter(Boolean)
    }

    const toNumber = (str: string): number | undefined => {
      if (!str.trim()) return undefined
      const num = parseInt(str, 10)
      return isNaN(num) ? undefined : num
    }

    updateMutation.mutate({
      id: jobId,
      requiredSkills: toArray(editData.required_skills),
      niceToHaveSkills: toArray(editData.preferred_skills),
      minExperienceYears: toNumber(editData.min_experience_years),
      maxExperienceYears: toNumber(editData.max_experience_years),
      visaRequirements: toArray(editData.visa_requirements),
    })
  }

  const handleCancel = () => {
    if (job) {
      const jobData = job as Record<string, unknown>
      setEditData({
        required_skills: toDisplayString(job.required_skills),
        preferred_skills: toDisplayString(jobData.nice_to_have_skills),
        min_experience_years: toDisplayString(jobData.min_experience_years),
        max_experience_years: toDisplayString(jobData.max_experience_years),
        experience_level: toDisplayString(job.experience_level),
        education: toDisplayString(job.education),
        certifications: toDisplayString(job.certifications),
        visa_requirements: toDisplayString(jobData.visa_requirements),
      })
    }
    setIsEditing(false)
  }

  const getFilledCount = (group: RequirementGroup): { filled: number; total: number } => {
    let filled = 0
    group.fields.forEach((field) => {
      const value = editData[field.key as keyof EditableFields]
      if (typeof value === 'string' && value.trim().length > 0) {
        filled++
      }
    })
    return { filled, total: group.fields.length }
  }

  const totalFilled = REQUIREMENT_GROUPS.reduce((sum, g) => sum + getFilledCount(g).filled, 0)
  const totalFields = REQUIREMENT_GROUPS.reduce((sum, g) => sum + g.fields.length, 0)
  const completionPercent = Math.round((totalFilled / totalFields) * 100)

  return (
    <div className="space-y-4">
      {/* Header with Progress */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <div className="w-20 h-1.5 bg-charcoal-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${completionPercent}%` }}
              />
            </div>
            <span className="text-xs font-medium text-charcoal-500 tabular-nums">
              {totalFilled}/{totalFields}
            </span>
          </div>
        </div>
        {!isEditing ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsEditing(true)}
            className="h-8 px-3 text-charcoal-500 hover:text-charcoal-900 hover:bg-charcoal-100"
          >
            <Edit className="w-3.5 h-3.5 mr-1.5" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel} className="h-8 px-3">
              <X className="w-3.5 h-3.5 mr-1.5" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending} className="h-8 px-3">
              {updateMutation.isPending ? (
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              ) : (
                <Check className="w-3.5 h-3.5 mr-1.5" />
              )}
              Save
            </Button>
          </div>
        )}
      </div>

      {/* Collapsible Groups */}
      <div className="space-y-2">
        {REQUIREMENT_GROUPS.map((group) => {
          const isOpen = openGroups[group.id]
          const { filled, total } = getFilledCount(group)
          const groupComplete = filled === total && total > 0

          return (
            <Collapsible
              key={group.id}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.id)}
              className="rounded-lg border border-charcoal-100 bg-charcoal-50/30 hover:bg-charcoal-50/50 transition-colors"
            >
              <CollapsibleTrigger className="flex items-center gap-3 w-full px-4 py-3 text-left">
                <div className={`
                  p-1.5 rounded-md transition-all duration-300
                  ${isOpen ? '' : '-rotate-90'}
                `}>
                  <ChevronDown className="w-4 h-4 text-charcoal-400" />
                </div>
                <span className="font-medium text-charcoal-800 text-sm flex-1">{group.label}</span>
                <Badge
                  variant="secondary"
                  className={`
                    text-xs font-medium px-2 py-0.5 border-0
                    ${groupComplete
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-charcoal-100 text-charcoal-600'
                    }
                  `}
                >
                  {filled}/{total}
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 pt-1 space-y-4">
                  {/* Render number fields in a row */}
                  {group.fields.some(f => f.type === 'number') && (
                    <div className="grid grid-cols-2 gap-4">
                      {group.fields.filter(f => f.type === 'number').map((field) => {
                        const value = editData[field.key as keyof EditableFields]
                        const rawJobValue = (job as Record<string, unknown>)[field.dbKey]
                        const jobValue = toDisplayString(rawJobValue)

                        return (
                          <div key={field.key}>
                            <Label className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 mb-1.5 block">
                              {field.label}
                            </Label>
                            {isEditing ? (
                              <Input
                                type="number"
                                value={value || ''}
                                onChange={(e) =>
                                  setEditData((prev) => ({
                                    ...prev,
                                    [field.key]: e.target.value,
                                  }))
                                }
                                min={0}
                                max={50}
                                placeholder={field.placeholder}
                                className="text-sm h-9 bg-white"
                              />
                            ) : (
                              <p className={`text-sm font-medium ${jobValue ? 'text-charcoal-900' : 'text-charcoal-400 italic'}`}>
                                {jobValue ? `${jobValue} years` : 'Not specified'}
                              </p>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  )}
                  {/* Render other fields */}
                  {group.fields.filter(f => f.type !== 'number').map((field) => {
                    const value = editData[field.key as keyof EditableFields]
                    const rawJobValue = (job as Record<string, unknown>)[field.dbKey]
                    const jobValue = toDisplayString(rawJobValue)

                    return (
                      <div key={field.key}>
                        <Label className="text-[11px] font-medium uppercase tracking-wider text-charcoal-500 mb-1.5 block">
                          {field.label}
                        </Label>
                        {isEditing ? (
                          <Textarea
                            value={value || ''}
                            onChange={(e) =>
                              setEditData((prev) => ({
                                ...prev,
                                [field.key]: e.target.value,
                              }))
                            }
                            rows={2}
                            placeholder={field.placeholder}
                            className="resize-none text-sm bg-white"
                          />
                        ) : (
                          <p className={`text-sm font-medium whitespace-pre-wrap ${jobValue ? 'text-charcoal-900' : 'text-charcoal-400 italic'}`}>
                            {jobValue || 'Not specified'}
                          </p>
                        )}
                      </div>
                    )
                  })}
                </div>
              </CollapsibleContent>
            </Collapsible>
          )
        })}
      </div>
    </div>
  )
}
