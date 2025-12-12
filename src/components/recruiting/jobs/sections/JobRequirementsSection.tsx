'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  ListChecks,
  Plus,
  X,
  Pencil,
  Check,
  Loader2,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface JobRequirementsSectionProps {
  jobId: string
}

export function JobRequirementsSection({ jobId }: JobRequirementsSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Fetch job data
  const jobQuery = trpc.ats.jobs.getById.useQuery({ id: jobId })
  const job = jobQuery.data

  const requiredSkills = job?.required_skills || []
  const niceToHaveSkills = job?.nice_to_have_skills || []
  const minExperienceYears = job?.min_experience_years || null
  const maxExperienceYears = job?.max_experience_years || null
  const visaRequirements = job?.visa_requirements || []

  const [isEditingRequired, setIsEditingRequired] = useState(false)
  const [isEditingNiceToHave, setIsEditingNiceToHave] = useState(false)
  const [isEditingExperience, setIsEditingExperience] = useState(false)
  const [isEditingVisa, setIsEditingVisa] = useState(false)

  const [editedRequiredSkills, setEditedRequiredSkills] = useState<string[]>([])
  const [editedNiceToHaveSkills, setEditedNiceToHaveSkills] = useState<string[]>([])
  const [editedMinExp, setEditedMinExp] = useState('')
  const [editedMaxExp, setEditedMaxExp] = useState('')
  const [editedVisaReqs, setEditedVisaReqs] = useState<string[]>([])

  // Update local state when job data loads
  useEffect(() => {
    if (job) {
      setEditedRequiredSkills(job.required_skills || [])
      setEditedNiceToHaveSkills(job.nice_to_have_skills || [])
      setEditedMinExp(job.min_experience_years?.toString() || '')
      setEditedMaxExp(job.max_experience_years?.toString() || '')
      setEditedVisaReqs(job.visa_requirements || [])
    }
  }, [job])

  const [newRequiredSkill, setNewRequiredSkill] = useState('')
  const [newNiceToHaveSkill, setNewNiceToHaveSkill] = useState('')
  const [newVisaReq, setNewVisaReq] = useState('')

  // Mutation for updating job
  const updateJobMutation = trpc.ats.jobs.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Requirements updated successfully' })
      utils.ats.jobs.getById.invalidate({ id: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to update requirements', description: error.message, variant: 'error' })
    },
  })

  const handleSaveRequiredSkills = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      requiredSkills: editedRequiredSkills,
    })
    setIsEditingRequired(false)
  }

  const handleSaveNiceToHaveSkills = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      niceToHaveSkills: editedNiceToHaveSkills,
    })
    setIsEditingNiceToHave(false)
  }

  const handleSaveExperience = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      minExperienceYears: editedMinExp ? parseInt(editedMinExp) : undefined,
      maxExperienceYears: editedMaxExp ? parseInt(editedMaxExp) : undefined,
    })
    setIsEditingExperience(false)
  }

  const handleSaveVisaRequirements = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      visaRequirements: editedVisaReqs,
    })
    setIsEditingVisa(false)
  }

  const addRequiredSkill = () => {
    if (newRequiredSkill.trim() && !editedRequiredSkills.includes(newRequiredSkill.trim())) {
      setEditedRequiredSkills([...editedRequiredSkills, newRequiredSkill.trim()])
      setNewRequiredSkill('')
    }
  }

  const removeRequiredSkill = (skill: string) => {
    setEditedRequiredSkills(editedRequiredSkills.filter(s => s !== skill))
  }

  const addNiceToHaveSkill = () => {
    if (newNiceToHaveSkill.trim() && !editedNiceToHaveSkills.includes(newNiceToHaveSkill.trim())) {
      setEditedNiceToHaveSkills([...editedNiceToHaveSkills, newNiceToHaveSkill.trim()])
      setNewNiceToHaveSkill('')
    }
  }

  const removeNiceToHaveSkill = (skill: string) => {
    setEditedNiceToHaveSkills(editedNiceToHaveSkills.filter(s => s !== skill))
  }

  const addVisaReq = () => {
    if (newVisaReq.trim() && !editedVisaReqs.includes(newVisaReq.trim())) {
      setEditedVisaReqs([...editedVisaReqs, newVisaReq.trim()])
      setNewVisaReq('')
    }
  }

  const removeVisaReq = (visa: string) => {
    setEditedVisaReqs(editedVisaReqs.filter(v => v !== visa))
  }

  const cancelEditRequired = () => {
    setEditedRequiredSkills(requiredSkills)
    setNewRequiredSkill('')
    setIsEditingRequired(false)
  }

  const cancelEditNiceToHave = () => {
    setEditedNiceToHaveSkills(niceToHaveSkills)
    setNewNiceToHaveSkill('')
    setIsEditingNiceToHave(false)
  }

  const cancelEditExperience = () => {
    setEditedMinExp(minExperienceYears?.toString() || '')
    setEditedMaxExp(maxExperienceYears?.toString() || '')
    setIsEditingExperience(false)
  }

  const cancelEditVisa = () => {
    setEditedVisaReqs(visaRequirements)
    setNewVisaReq('')
    setIsEditingVisa(false)
  }

  if (jobQuery.isLoading) {
    return (
      <div className="space-y-6">
        <Card>
          <CardContent className="py-8">
            <div className="flex items-center justify-center">
              <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Required Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <ListChecks className="w-5 h-5" />
            Required Skills
          </CardTitle>
          {!isEditingRequired && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingRequired(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingRequired ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {editedRequiredSkills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="pl-2 pr-1 py-1">
                    {skill}
                    <button
                      onClick={() => removeRequiredSkill(skill)}
                      className="ml-1 hover:bg-charcoal-300 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill..."
                  value={newRequiredSkill}
                  onChange={(e) => setNewRequiredSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
                />
                <Button variant="outline" onClick={addRequiredSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={cancelEditRequired}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveRequiredSkills} disabled={updateJobMutation.isPending}>
                  {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {requiredSkills.length > 0 ? (
                requiredSkills.map((skill: string) => (
                  <Badge key={skill} variant="secondary">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-charcoal-500 italic">No required skills specified</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Nice to Have Skills */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Nice to Have Skills</CardTitle>
          {!isEditingNiceToHave && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingNiceToHave(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingNiceToHave ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {editedNiceToHaveSkills.map((skill) => (
                  <Badge key={skill} variant="outline" className="pl-2 pr-1 py-1">
                    {skill}
                    <button
                      onClick={() => removeNiceToHaveSkill(skill)}
                      className="ml-1 hover:bg-charcoal-200 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add skill..."
                  value={newNiceToHaveSkill}
                  onChange={(e) => setNewNiceToHaveSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNiceToHaveSkill())}
                />
                <Button variant="outline" onClick={addNiceToHaveSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={cancelEditNiceToHave}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveNiceToHaveSkills} disabled={updateJobMutation.isPending}>
                  {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {niceToHaveSkills.length > 0 ? (
                niceToHaveSkills.map((skill: string) => (
                  <Badge key={skill} variant="outline">
                    {skill}
                  </Badge>
                ))
              ) : (
                <span className="text-charcoal-500 italic">No nice-to-have skills specified</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Experience Requirements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Experience Requirements</CardTitle>
          {!isEditingExperience && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingExperience(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingExperience ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Minimum Years</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editedMinExp}
                    onChange={(e) => setEditedMinExp(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label>Maximum Years</Label>
                  <Input
                    type="number"
                    min="0"
                    value={editedMaxExp}
                    onChange={(e) => setEditedMaxExp(e.target.value)}
                    placeholder="10+"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={cancelEditExperience}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveExperience} disabled={updateJobMutation.isPending}>
                  {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <p className="text-charcoal-700">
              {minExperienceYears || maxExperienceYears ? (
                `${minExperienceYears || 0} - ${maxExperienceYears || '10+'} years`
              ) : (
                <span className="text-charcoal-500 italic">No experience requirements specified</span>
              )}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Visa Requirements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle>Visa Requirements</CardTitle>
          {!isEditingVisa && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsEditingVisa(true)}
            >
              <Pencil className="w-4 h-4 mr-1" />
              Edit
            </Button>
          )}
        </CardHeader>
        <CardContent>
          {isEditingVisa ? (
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {editedVisaReqs.map((visa) => (
                  <Badge key={visa} variant="outline" className="pl-2 pr-1 py-1">
                    {visa.replace(/_/g, ' ')}
                    <button
                      onClick={() => removeVisaReq(visa)}
                      className="ml-1 hover:bg-charcoal-200 rounded p-0.5"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
              </div>
              <div className="flex gap-2">
                <Input
                  placeholder="Add visa type (e.g., US_CITIZEN, H1B)..."
                  value={newVisaReq}
                  onChange={(e) => setNewVisaReq(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addVisaReq())}
                />
                <Button variant="outline" onClick={addVisaReq}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="ghost" size="sm" onClick={cancelEditVisa}>
                  Cancel
                </Button>
                <Button size="sm" onClick={handleSaveVisaRequirements} disabled={updateJobMutation.isPending}>
                  {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                  Save
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {visaRequirements.length > 0 ? (
                visaRequirements.map((visa: string) => (
                  <Badge key={visa} variant="outline">
                    {visa.replace(/_/g, ' ')}
                  </Badge>
                ))
              ) : (
                <span className="text-charcoal-500 italic">No visa requirements specified</span>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
