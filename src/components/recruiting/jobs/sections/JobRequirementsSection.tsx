'use client'

import { useState, useEffect } from 'react'
import { ChevronDown, ChevronRight, Edit, Check, X, Loader2 } from 'lucide-react'
import { useEntityData } from '@/components/layouts/EntityContextProvider'
import { trpc } from '@/lib/trpc/client'
import { toast } from '@/components/ui/use-toast'
import { Button } from '@/components/ui/button'
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import type { FullJob } from '@/types/job'

interface JobRequirementsSectionProps {
  jobId: string
}

interface RequirementGroup {
  id: string
  label: string
  fields: {
    key: string
    label: string
    placeholder: string
  }[]
}

// Define the 3 collapsible groups as per the plan
const REQUIREMENT_GROUPS: RequirementGroup[] = [
  {
    id: 'skills',
    label: 'Skills',
    fields: [
      { key: 'required_skills', label: 'Required Skills', placeholder: 'Enter required skills (one per line or comma-separated)...' },
      { key: 'preferred_skills', label: 'Preferred Skills', placeholder: 'Enter preferred/nice-to-have skills...' },
    ],
  },
  {
    id: 'experience',
    label: 'Experience',
    fields: [
      { key: 'experience_level', label: 'Experience Level', placeholder: 'e.g., 5+ years in software development, 3+ years with React...' },
    ],
  },
  {
    id: 'qualifications',
    label: 'Qualifications',
    fields: [
      { key: 'education', label: 'Education', placeholder: "e.g., Bachelor's degree in Computer Science or related field..." },
      { key: 'certifications', label: 'Certifications', placeholder: 'e.g., AWS Certified Solutions Architect, PMP, etc...' },
    ],
  },
]

type EditableFields = {
  required_skills: string
  preferred_skills: string
  experience_level: string
  education: string
  certifications: string
}

export function JobRequirementsSection({ jobId }: JobRequirementsSectionProps) {
  // ONE database call pattern: Get job data from context
  const entityData = useEntityData<FullJob>()
  const job = entityData?.data
  const utils = trpc.useUtils()

  // Section-level edit mode
  const [isEditing, setIsEditing] = useState(false)

  // Collapsible state for each group
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({
    skills: true,
    experience: true,
    qualifications: false,
  })

  // Edit state - all fields editable together
  const [editData, setEditData] = useState<EditableFields>({
    required_skills: '',
    preferred_skills: '',
    experience_level: '',
    education: '',
    certifications: '',
  })

  // Sync edit data when job data is available
  useEffect(() => {
    if (job) {
      setEditData({
        required_skills: job.required_skills || '',
        preferred_skills: job.preferred_skills || '',
        experience_level: job.experience_level || '',
        education: job.education || '',
        certifications: job.certifications || '',
      })
    }
  }, [job])

  // Update mutation
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
    updateMutation.mutate({
      jobId,
      required_skills: editData.required_skills || undefined,
      preferred_skills: editData.preferred_skills || undefined,
      experience_level: editData.experience_level || undefined,
      education: editData.education || undefined,
      certifications: editData.certifications || undefined,
    })
  }

  const handleCancel = () => {
    // Revert to original job data
    if (job) {
      setEditData({
        required_skills: job.required_skills || '',
        preferred_skills: job.preferred_skills || '',
        experience_level: job.experience_level || '',
        education: job.education || '',
        certifications: job.certifications || '',
      })
    }
    setIsEditing(false)
  }

  // Count filled fields in a group
  const getFilledCount = (group: RequirementGroup): { filled: number; total: number } => {
    let filled = 0
    group.fields.forEach((field) => {
      const value = editData[field.key as keyof EditableFields]
      if (value && value.trim().length > 0) {
        filled++
      }
    })
    return { filled, total: group.fields.length }
  }

  // Loading state
  if (!job) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {/* Header with Edit Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">Requirements</h2>
          <p className="text-sm text-charcoal-500">Skills, experience, and qualifications</p>
        </div>
        {!isEditing ? (
          <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
            <Edit className="w-4 h-4 mr-2" />
            Edit
          </Button>
        ) : (
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={handleCancel}>
              <X className="w-4 h-4 mr-2" />
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave} disabled={updateMutation.isPending}>
              {updateMutation.isPending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Check className="w-4 h-4 mr-2" />
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

          return (
            <Collapsible
              key={group.id}
              open={isOpen}
              onOpenChange={() => toggleGroup(group.id)}
              className="border border-charcoal-200 rounded-lg"
            >
              <CollapsibleTrigger className="flex items-center gap-2 w-full px-4 py-3 hover:bg-charcoal-50 transition-colors rounded-t-lg">
                {isOpen ? (
                  <ChevronDown className="w-4 h-4 text-charcoal-500" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-charcoal-500" />
                )}
                <span className="font-medium text-charcoal-700">{group.label}</span>
                <Badge variant="secondary" className="ml-auto">
                  {filled}/{total}
                </Badge>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <div className="px-4 pb-4 space-y-4">
                  {group.fields.map((field) => {
                    const value = editData[field.key as keyof EditableFields]
                    const jobValue = job[field.key as keyof FullJob] as string | undefined

                    return (
                      <div key={field.key}>
                        <Label className="block text-sm font-medium text-charcoal-600 mb-1">
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
                            rows={3}
                            placeholder={field.placeholder}
                            className="resize-none"
                          />
                        ) : (
                          <div className="text-charcoal-900 whitespace-pre-wrap min-h-[24px]">
                            {jobValue || (
                              <span className="text-charcoal-400 italic">Not specified</span>
                            )}
                          </div>
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

      {/* Summary footer */}
      <div className="flex items-center justify-between text-xs text-charcoal-500 pt-2 border-t border-charcoal-100">
        <span>
          {REQUIREMENT_GROUPS.reduce((sum, g) => sum + getFilledCount(g).filled, 0)} of{' '}
          {REQUIREMENT_GROUPS.reduce((sum, g) => sum + g.fields.length, 0)} fields completed
        </span>
        {job.updated_at && (
          <span>Last updated: {new Date(job.updated_at).toLocaleDateString()}</span>
        )}
      </div>
    </div>
  )
}
