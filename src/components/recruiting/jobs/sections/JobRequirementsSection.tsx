'use client'

import * as React from 'react'
import { useState, useEffect } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  ListChecks,
  Plus,
  X,
  Pencil,
  Loader2,
  GraduationCap,
  Award,
  Globe2,
  Briefcase,
  MapPin,
  Clock,
  Plane,
  Shield,
  CheckCircle2,
  AlertCircle,
  Building2,
  Monitor,
  Home,
  CalendarDays,
} from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface JobRequirementsSectionProps {
  jobId: string
}

// Configuration options
const EDUCATION_LEVELS = [
  { value: 'high_school', label: 'High School Diploma' },
  { value: 'associate', label: "Associate's Degree" },
  { value: 'bachelor', label: "Bachelor's Degree" },
  { value: 'master', label: "Master's Degree" },
  { value: 'doctorate', label: 'Doctorate (PhD)' },
  { value: 'professional', label: 'Professional Degree (JD, MD, etc.)' },
  { value: 'none', label: 'No Requirement' },
]

const WORK_ARRANGEMENTS = [
  { value: 'onsite', label: 'On-site', icon: Building2 },
  { value: 'remote', label: 'Remote', icon: Home },
  { value: 'hybrid', label: 'Hybrid', icon: Monitor },
]

const CLEARANCE_LEVELS = [
  { value: 'none', label: 'None Required' },
  { value: 'public_trust', label: 'Public Trust' },
  { value: 'secret', label: 'Secret' },
  { value: 'top_secret', label: 'Top Secret' },
  { value: 'ts_sci', label: 'Top Secret/SCI' },
]

const TRAVEL_OPTIONS = [
  { value: 'none', label: 'No Travel' },
  { value: 'minimal', label: 'Minimal (< 10%)' },
  { value: 'occasional', label: 'Occasional (10-25%)' },
  { value: 'moderate', label: 'Moderate (25-50%)' },
  { value: 'frequent', label: 'Frequent (50-75%)' },
  { value: 'extensive', label: 'Extensive (75%+)' },
]

const LANGUAGE_PROFICIENCIES = [
  { value: 'basic', label: 'Basic' },
  { value: 'conversational', label: 'Conversational' },
  { value: 'professional', label: 'Professional Working' },
  { value: 'full_professional', label: 'Full Professional' },
  { value: 'native', label: 'Native/Bilingual' },
]

const COMMON_LANGUAGES = [
  'English', 'Spanish', 'French', 'German', 'Mandarin', 'Japanese', 
  'Portuguese', 'Hindi', 'Arabic', 'Korean', 'Italian', 'Russian'
]

const VISA_OPTIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card (Permanent Resident)' },
  { value: 'h1b', label: 'H-1B Visa' },
  { value: 'l1', label: 'L-1 Visa' },
  { value: 'tn', label: 'TN Visa (Canada/Mexico)' },
  { value: 'opt', label: 'OPT/CPT' },
  { value: 'ead', label: 'EAD (Employment Authorization)' },
  { value: 'any', label: 'Any Valid Work Authorization' },
]

// Editable Card Component for reuse
interface EditableSkillsCardProps {
  title: string
  icon?: React.ReactNode
  skills: string[]
  badgeVariant?: 'default' | 'secondary' | 'outline'
  emptyMessage: string
  isEditing: boolean
  onEdit: () => void
  onSave: (skills: string[]) => Promise<void>
  onCancel: () => void
  isLoading?: boolean
  placeholder?: string
}

function EditableSkillsCard({
  title,
  icon,
  skills,
  badgeVariant = 'secondary',
  emptyMessage,
  isEditing,
  onEdit,
  onSave,
  onCancel,
  isLoading,
  placeholder = 'Add item...',
}: EditableSkillsCardProps) {
  const [editedSkills, setEditedSkills] = useState<string[]>(skills)
  const [newSkill, setNewSkill] = useState('')

  useEffect(() => {
    setEditedSkills(skills)
  }, [skills])

  const addSkill = () => {
    if (newSkill.trim() && !editedSkills.includes(newSkill.trim())) {
      setEditedSkills([...editedSkills, newSkill.trim()])
      setNewSkill('')
    }
  }

  const removeSkill = (skill: string) => {
    setEditedSkills(editedSkills.filter(s => s !== skill))
  }

  const handleSave = async () => {
    await onSave(editedSkills)
  }

  const handleCancel = () => {
    setEditedSkills(skills)
    setNewSkill('')
    onCancel()
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between py-4">
        <CardTitle className="flex items-center gap-2 text-base font-medium">
          {icon}
          {title}
        </CardTitle>
        {!isEditing && (
          <Button variant="ghost" size="sm" onClick={onEdit}>
            <Pencil className="w-4 h-4 mr-1" />
            Edit
          </Button>
        )}
      </CardHeader>
      <CardContent className="pt-0">
        {isEditing ? (
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2 min-h-[32px]">
              {editedSkills.map((skill) => (
                <Badge key={skill} variant={badgeVariant} className="pl-2 pr-1 py-1">
                  {skill}
                  <button
                    onClick={() => removeSkill(skill)}
                    className="ml-1 hover:bg-charcoal-300 rounded p-0.5"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </Badge>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder={placeholder}
                value={newSkill}
                onChange={(e) => setNewSkill(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                className="flex-1"
              />
              <Button variant="outline" onClick={addSkill} size="icon">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="flex justify-end gap-2 pt-2 border-t">
              <Button variant="ghost" size="sm" onClick={handleCancel}>
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={isLoading}>
                {isLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                Save
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {skills.length > 0 ? (
              skills.map((skill) => (
                <Badge key={skill} variant={badgeVariant}>
                  {skill.replace(/_/g, ' ')}
                </Badge>
              ))
            ) : (
              <span className="text-charcoal-500 text-sm italic">{emptyMessage}</span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function JobRequirementsSection({ jobId }: JobRequirementsSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Fetch job data
  const jobQuery = trpc.ats.jobs.getById.useQuery({ id: jobId })
  const job = jobQuery.data

  // Extract job data with defaults
  const requiredSkills = job?.required_skills || []
  const niceToHaveSkills = job?.nice_to_have_skills || []
  const minExperienceYears = job?.min_experience_years || null
  const maxExperienceYears = job?.max_experience_years || null
  const visaRequirements = job?.visa_requirements || []
  const isRemote = job?.is_remote || false
  const hybridDays = job?.hybrid_days || null
  const location = job?.location || ''

  // Editing states
  const [isEditingRequired, setIsEditingRequired] = useState(false)
  const [isEditingNiceToHave, setIsEditingNiceToHave] = useState(false)
  const [isEditingExperience, setIsEditingExperience] = useState(false)
  const [isEditingVisa, setIsEditingVisa] = useState(false)
  const [isEditingEducation, setIsEditingEducation] = useState(false)
  const [isEditingCertifications, setIsEditingCertifications] = useState(false)
  const [isEditingWorkArrangement, setIsEditingWorkArrangement] = useState(false)
  const [isEditingLanguages, setIsEditingLanguages] = useState(false)
  const [isEditingTravel, setIsEditingTravel] = useState(false)
  const [isEditingClearance, setIsEditingClearance] = useState(false)
  const [isEditingResponsibilities, setIsEditingResponsibilities] = useState(false)

  // Form states
  const [editedMinExp, setEditedMinExp] = useState('')
  const [editedMaxExp, setEditedMaxExp] = useState('')
  const [editedEducation, setEditedEducation] = useState('none')
  const [editedFieldOfStudy, setEditedFieldOfStudy] = useState('')
  const [editedWorkArrangement, setEditedWorkArrangement] = useState('onsite')
  const [editedHybridDays, setEditedHybridDays] = useState('')
  const [editedLocation, setEditedLocation] = useState('')
  const [editedTravel, setEditedTravel] = useState('none')
  const [editedClearance, setEditedClearance] = useState('none')
  const [editedResponsibilities, setEditedResponsibilities] = useState('')

  // Update local state when job data loads
  useEffect(() => {
    if (job) {
      setEditedMinExp(job.min_experience_years?.toString() || '')
      setEditedMaxExp(job.max_experience_years?.toString() || '')
      setEditedWorkArrangement(job.is_remote ? 'remote' : job.hybrid_days ? 'hybrid' : 'onsite')
      setEditedHybridDays(job.hybrid_days?.toString() || '')
      setEditedLocation(job.location || '')
    }
  }, [job])

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

  // Save handlers
  const handleSaveRequiredSkills = async (skills: string[]) => {
    await updateJobMutation.mutateAsync({ jobId, requiredSkills: skills })
    setIsEditingRequired(false)
  }

  const handleSaveNiceToHaveSkills = async (skills: string[]) => {
    await updateJobMutation.mutateAsync({ jobId, niceToHaveSkills: skills })
    setIsEditingNiceToHave(false)
  }

  const handleSaveVisaRequirements = async (visas: string[]) => {
    await updateJobMutation.mutateAsync({ jobId, visaRequirements: visas })
    setIsEditingVisa(false)
  }

  const handleSaveExperience = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      minExperienceYears: editedMinExp ? parseInt(editedMinExp) : undefined,
      maxExperienceYears: editedMaxExp ? parseInt(editedMaxExp) : undefined,
    })
    setIsEditingExperience(false)
  }

  const handleSaveWorkArrangement = async () => {
    await updateJobMutation.mutateAsync({
      jobId,
      isRemote: editedWorkArrangement === 'remote',
      hybridDays: editedWorkArrangement === 'hybrid' ? parseInt(editedHybridDays) || null : null,
      location: editedLocation || undefined,
    })
    setIsEditingWorkArrangement(false)
  }

  // Get work arrangement display
  const getWorkArrangementDisplay = () => {
    if (isRemote) return { label: 'Remote', icon: Home, color: 'text-green-600 bg-green-50' }
    if (hybridDays) return { label: `Hybrid (${hybridDays} days in office)`, icon: Monitor, color: 'text-blue-600 bg-blue-50' }
    return { label: 'On-site', icon: Building2, color: 'text-amber-600 bg-amber-50' }
  }

  const workArrangement = getWorkArrangementDisplay()
  const WorkArrangementIcon = workArrangement.icon

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
    <div className="space-y-8">
      {/* Section Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-semibold text-charcoal-900">Job Requirements</h2>
          <p className="text-sm text-charcoal-500 mt-1">
            Skills, qualifications, and requirements for this position
          </p>
        </div>
        <Badge variant="outline" className="text-xs">
          {requiredSkills.length} required skill{requiredSkills.length !== 1 ? 's' : ''}
        </Badge>
      </div>

      {/* Skills Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider flex items-center gap-2">
          <ListChecks className="w-4 h-4" />
          Skills & Competencies
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <EditableSkillsCard
            title="Required Skills"
            icon={<CheckCircle2 className="w-4 h-4 text-green-600" />}
            skills={requiredSkills}
            badgeVariant="secondary"
            emptyMessage="No required skills specified"
            isEditing={isEditingRequired}
            onEdit={() => setIsEditingRequired(true)}
            onSave={handleSaveRequiredSkills}
            onCancel={() => setIsEditingRequired(false)}
            isLoading={updateJobMutation.isPending}
            placeholder="Add required skill..."
          />

          <EditableSkillsCard
            title="Nice to Have Skills"
            icon={<AlertCircle className="w-4 h-4 text-amber-500" />}
            skills={niceToHaveSkills}
            badgeVariant="outline"
            emptyMessage="No preferred skills specified"
            isEditing={isEditingNiceToHave}
            onEdit={() => setIsEditingNiceToHave(true)}
            onSave={handleSaveNiceToHaveSkills}
            onCancel={() => setIsEditingNiceToHave(false)}
            isLoading={updateJobMutation.isPending}
            placeholder="Add preferred skill..."
          />
        </div>
      </div>

      {/* Experience & Education Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider flex items-center gap-2">
          <GraduationCap className="w-4 h-4" />
          Experience & Education
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Experience Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Briefcase className="w-4 h-4 text-purple-600" />
                Experience Required
              </CardTitle>
              {!isEditingExperience && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingExperience(true)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {isEditingExperience ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs text-charcoal-500">Minimum Years</Label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={editedMinExp}
                        onChange={(e) => setEditedMinExp(e.target.value)}
                        placeholder="0"
                      />
                    </div>
                    <div>
                      <Label className="text-xs text-charcoal-500">Maximum Years</Label>
                      <Input
                        type="number"
                        min="0"
                        max="50"
                        value={editedMaxExp}
                        onChange={(e) => setEditedMaxExp(e.target.value)}
                        placeholder="15+"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => {
                      setEditedMinExp(minExperienceYears?.toString() || '')
                      setEditedMaxExp(maxExperienceYears?.toString() || '')
                      setIsEditingExperience(false)
                    }}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveExperience} disabled={updateJobMutation.isPending}>
                      {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-purple-100 flex items-center justify-center">
                    <span className="text-lg font-bold text-purple-700">
                      {minExperienceYears || 0}
                    </span>
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-charcoal-900">
                      {minExperienceYears || maxExperienceYears
                        ? `${minExperienceYears || 0} - ${maxExperienceYears || '15+'} years`
                        : 'Not specified'}
                    </p>
                    <p className="text-xs text-charcoal-500">Years of relevant experience</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Education Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <GraduationCap className="w-4 h-4 text-indigo-600" />
                Education Level
              </CardTitle>
              {!isEditingEducation && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingEducation(true)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {isEditingEducation ? (
                <div className="space-y-4">
                  <div>
                    <Label className="text-xs text-charcoal-500">Minimum Education</Label>
                    <Select value={editedEducation} onValueChange={setEditedEducation}>
                      <SelectTrigger>
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
                  <div>
                    <Label className="text-xs text-charcoal-500">Field of Study (Optional)</Label>
                    <Input
                      value={editedFieldOfStudy}
                      onChange={(e) => setEditedFieldOfStudy(e.target.value)}
                      placeholder="e.g., Computer Science, Engineering"
                    />
                  </div>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingEducation(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => setIsEditingEducation(false)}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-lg bg-indigo-100 flex items-center justify-center">
                    <GraduationCap className="w-6 h-6 text-indigo-600" />
                  </div>
                  <div>
                    <p className="text-lg font-semibold text-charcoal-900">
                      {EDUCATION_LEVELS.find(e => e.value === editedEducation)?.label || 'Not specified'}
                    </p>
                    <p className="text-xs text-charcoal-500">Minimum education requirement</p>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Certifications Card */}
          <EditableSkillsCard
            title="Certifications"
            icon={<Award className="w-4 h-4 text-amber-600" />}
            skills={[]}
            badgeVariant="outline"
            emptyMessage="No certifications required"
            isEditing={isEditingCertifications}
            onEdit={() => setIsEditingCertifications(true)}
            onSave={async () => setIsEditingCertifications(false)}
            onCancel={() => setIsEditingCertifications(false)}
            placeholder="Add certification (e.g., AWS, PMP)..."
          />

          {/* Languages Card */}
          <EditableSkillsCard
            title="Language Requirements"
            icon={<Globe2 className="w-4 h-4 text-blue-600" />}
            skills={[]}
            badgeVariant="outline"
            emptyMessage="No language requirements"
            isEditing={isEditingLanguages}
            onEdit={() => setIsEditingLanguages(true)}
            onSave={async () => setIsEditingLanguages(false)}
            onCancel={() => setIsEditingLanguages(false)}
            placeholder="Add language (e.g., Spanish - Professional)..."
          />
        </div>
      </div>

      {/* Work Arrangement Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Work Arrangement
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Work Type Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <WorkArrangementIcon className="w-4 h-4" />
                Work Type
              </CardTitle>
              {!isEditingWorkArrangement && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingWorkArrangement(true)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {isEditingWorkArrangement ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-3 gap-2">
                    {WORK_ARRANGEMENTS.map((arr) => {
                      const Icon = arr.icon
                      return (
                        <button
                          key={arr.value}
                          onClick={() => setEditedWorkArrangement(arr.value)}
                          className={cn(
                            'p-3 rounded-lg border-2 text-center transition-all',
                            editedWorkArrangement === arr.value
                              ? 'border-hublot-600 bg-hublot-50'
                              : 'border-charcoal-200 hover:border-charcoal-300'
                          )}
                        >
                          <Icon className={cn(
                            'w-5 h-5 mx-auto mb-1',
                            editedWorkArrangement === arr.value ? 'text-hublot-600' : 'text-charcoal-500'
                          )} />
                          <span className="text-xs font-medium">{arr.label}</span>
                        </button>
                      )
                    })}
                  </div>
                  {editedWorkArrangement === 'hybrid' && (
                    <div>
                      <Label className="text-xs text-charcoal-500">Days in Office per Week</Label>
                      <Input
                        type="number"
                        min="1"
                        max="5"
                        value={editedHybridDays}
                        onChange={(e) => setEditedHybridDays(e.target.value)}
                        placeholder="3"
                      />
                    </div>
                  )}
                  {editedWorkArrangement !== 'remote' && (
                    <div>
                      <Label className="text-xs text-charcoal-500">Office Location</Label>
                      <Input
                        value={editedLocation}
                        onChange={(e) => setEditedLocation(e.target.value)}
                        placeholder="City, State"
                      />
                    </div>
                  )}
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingWorkArrangement(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={handleSaveWorkArrangement} disabled={updateJobMutation.isPending}>
                      {updateJobMutation.isPending && <Loader2 className="w-4 h-4 mr-1 animate-spin" />}
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={cn('p-3 rounded-lg', workArrangement.color)}>
                  <div className="flex items-center gap-2">
                    <WorkArrangementIcon className="w-5 h-5" />
                    <span className="font-medium">{workArrangement.label}</span>
                  </div>
                  {location && !isRemote && (
                    <p className="text-xs mt-1 opacity-80">{location}</p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Travel Card */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Plane className="w-4 h-4 text-sky-600" />
                Travel Required
              </CardTitle>
              {!isEditingTravel && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingTravel(true)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {isEditingTravel ? (
                <div className="space-y-4">
                  <Select value={editedTravel} onValueChange={setEditedTravel}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select travel requirement" />
                    </SelectTrigger>
                    <SelectContent>
                      {TRAVEL_OPTIONS.map((opt) => (
                        <SelectItem key={opt.value} value={opt.value}>
                          {opt.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingTravel(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => setIsEditingTravel(false)}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="p-3 rounded-lg bg-sky-50 text-sky-700">
                  <div className="flex items-center gap-2">
                    <Plane className="w-5 h-5" />
                    <span className="font-medium">
                      {TRAVEL_OPTIONS.find(t => t.value === editedTravel)?.label || 'No Travel'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Schedule Card */}
          <Card>
            <CardHeader className="py-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Clock className="w-4 h-4 text-teal-600" />
                Work Schedule
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-0">
              <div className="p-3 rounded-lg bg-teal-50 text-teal-700">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-5 h-5" />
                  <span className="font-medium">
                    {job?.job_type === 'fulltime' ? 'Full-time' : 
                     job?.job_type === 'parttime' ? 'Part-time' :
                     job?.job_type === 'contract' ? 'Contract' : 'Standard Hours'}
                  </span>
                </div>
                <p className="text-xs mt-1 opacity-80">Monday - Friday</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Work Authorization Section */}
      <div className="space-y-4">
        <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider flex items-center gap-2">
          <Shield className="w-4 h-4" />
          Work Authorization & Compliance
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {/* Visa Requirements */}
          <EditableSkillsCard
            title="Work Authorization"
            icon={<Globe2 className="w-4 h-4 text-green-600" />}
            skills={visaRequirements}
            badgeVariant="outline"
            emptyMessage="No visa requirements specified (all candidates welcome)"
            isEditing={isEditingVisa}
            onEdit={() => setIsEditingVisa(true)}
            onSave={handleSaveVisaRequirements}
            onCancel={() => setIsEditingVisa(false)}
            isLoading={updateJobMutation.isPending}
            placeholder="Add visa type (e.g., us_citizen, h1b)..."
          />

          {/* Security Clearance */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between py-4">
              <CardTitle className="flex items-center gap-2 text-base font-medium">
                <Shield className="w-4 h-4 text-red-600" />
                Security Clearance
              </CardTitle>
              {!isEditingClearance && (
                <Button variant="ghost" size="sm" onClick={() => setIsEditingClearance(true)}>
                  <Pencil className="w-4 h-4 mr-1" />
                  Edit
                </Button>
              )}
            </CardHeader>
            <CardContent className="pt-0">
              {isEditingClearance ? (
                <div className="space-y-4">
                  <Select value={editedClearance} onValueChange={setEditedClearance}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select clearance level" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLEARANCE_LEVELS.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="ghost" size="sm" onClick={() => setIsEditingClearance(false)}>
                      Cancel
                    </Button>
                    <Button size="sm" onClick={() => setIsEditingClearance(false)}>
                      Save
                    </Button>
                  </div>
                </div>
              ) : (
                <div className={cn(
                  'p-3 rounded-lg',
                  editedClearance === 'none' ? 'bg-charcoal-50 text-charcoal-600' : 'bg-red-50 text-red-700'
                )}>
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5" />
                    <span className="font-medium">
                      {CLEARANCE_LEVELS.find(c => c.value === editedClearance)?.label || 'None Required'}
                    </span>
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Summary Stats */}
      <Card className="bg-charcoal-50 border-charcoal-200">
        <CardContent className="py-4">
          <div className="flex items-center justify-between text-sm">
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500"></div>
                <span className="text-charcoal-600">{requiredSkills.length} required skills</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-amber-500"></div>
                <span className="text-charcoal-600">{niceToHaveSkills.length} preferred skills</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                <span className="text-charcoal-600">{visaRequirements.length} visa types accepted</span>
              </div>
            </div>
            <Badge variant="outline" className="text-xs bg-white">
              Last updated: {job?.updated_at ? new Date(job.updated_at).toLocaleDateString() : 'N/A'}
            </Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
