'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { Loader2, ChevronRight, ChevronLeft, Plus, X, Briefcase } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format } from 'date-fns'

interface JobIntakeWizardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId?: string
  accountName?: string
}

type Step = 1 | 2 | 3 | 4 | 5

const INTAKE_METHODS = [
  { value: 'phone_video', label: 'Phone/Video Call (Live intake)' },
  { value: 'email', label: 'Email (Client sent requirements)' },
  { value: 'client_portal', label: 'Client Portal (Self-service submission)' },
  { value: 'in_person', label: 'In-Person Meeting' },
]

const JOB_TYPES = [
  { value: 'contract', label: 'Contract (W2)' },
  { value: 'contract_to_hire', label: 'Contract-to-Hire' },
  { value: 'permanent', label: 'Direct Hire (Permanent)' },
  { value: 'c2c', label: '1099 / C2C' },
]

const PRIORITY_LEVELS = [
  { value: 'urgent', label: 'Urgent (Need ASAP, <2 weeks)', color: 'text-red-600' },
  { value: 'high', label: 'High (Within 30 days)', color: 'text-amber-600' },
  { value: 'normal', label: 'Normal (30-60 days)', color: 'text-blue-600' },
  { value: 'low', label: 'Low (60+ days, pipeline building)', color: 'text-charcoal-500' },
]

const EXPERIENCE_LEVELS = [
  { value: 'junior', label: 'Junior (0-2 years)' },
  { value: 'mid', label: 'Mid-Level (3-5 years)' },
  { value: 'senior', label: 'Senior (5-8 years)' },
  { value: 'staff', label: 'Staff/Principal (8+ years)' },
]

const EDUCATION_LEVELS = [
  { value: 'none', label: 'No requirement' },
  { value: 'high_school', label: 'High School' },
  { value: 'associates', label: "Associate's" },
  { value: 'bachelors', label: "Bachelor's in CS or equivalent" },
  { value: 'masters', label: "Master's preferred" },
  { value: 'phd', label: 'PhD required' },
]

const ROLE_OPEN_REASONS = [
  { value: 'growth', label: 'Team growth / Expansion' },
  { value: 'backfill', label: 'Backfill (someone left)' },
  { value: 'new_project', label: 'New project / Initiative' },
  { value: 'restructuring', label: 'Restructuring' },
]

const WORK_ARRANGEMENTS = [
  { value: 'remote', label: 'Remote (100%)' },
  { value: 'hybrid', label: 'Hybrid' },
  { value: 'onsite', label: 'On-site (Full-time in office)' },
]

const WORK_AUTHORIZATIONS = [
  { value: 'us_citizen', label: 'US Citizen' },
  { value: 'green_card', label: 'Green Card' },
  { value: 'h1b_transfer', label: 'H1B (Transfer)' },
  { value: 'h1b_new', label: 'H1B (New sponsorship)' },
  { value: 'opt_cpt', label: 'OPT / CPT' },
  { value: 'tn_visa', label: 'TN Visa' },
]

const INTERVIEW_FORMATS = [
  { value: 'phone', label: 'Phone' },
  { value: 'video', label: 'Video' },
  { value: 'onsite', label: 'On-site' },
]

interface SkillEntry {
  name: string
  years: string
  proficiency: 'beginner' | 'proficient' | 'expert'
}

interface InterviewRound {
  name: string
  format: string
  duration: number
  interviewer: string
  focus: string
}

export function JobIntakeWizardDialog({
  open,
  onOpenChange,
  accountId: initialAccountId,
  accountName,
}: JobIntakeWizardDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = trpc.useUtils()

  const [step, setStep] = useState<Step>(1)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Step 1: Basic Information
  const [accountId, setAccountId] = useState(initialAccountId || '')
  const [hiringManagerId, setHiringManagerId] = useState('')
  const [intakeMethod, setIntakeMethod] = useState('phone_video')
  const [title, setTitle] = useState('')
  const [positionsCount, setPositionsCount] = useState(1)
  const [jobType, setJobType] = useState('contract')
  const [priority, setPriority] = useState('normal')
  const [targetStartDate, setTargetStartDate] = useState('')

  // Step 2: Technical Requirements
  const [minExperience, setMinExperience] = useState('5')
  const [preferredExperience, setPreferredExperience] = useState('7')
  const [experienceLevel, setExperienceLevel] = useState('senior')
  const [requiredSkills, setRequiredSkills] = useState<SkillEntry[]>([])
  const [preferredSkills, setPreferredSkills] = useState<string[]>([])
  const [newSkillName, setNewSkillName] = useState('')
  const [newSkillYears, setNewSkillYears] = useState('2')
  const [newSkillProficiency, setNewSkillProficiency] = useState<'beginner' | 'proficient' | 'expert'>('proficient')
  const [preferredSkillInput, setPreferredSkillInput] = useState('')
  const [education, setEducation] = useState('bachelors')
  const [certifications, setCertifications] = useState('')
  const [industries, setIndustries] = useState<string[]>([])

  // Step 3: Role Details
  const [roleSummary, setRoleSummary] = useState('')
  const [responsibilities, setResponsibilities] = useState('')
  const [roleOpenReason, setRoleOpenReason] = useState('growth')
  const [teamName, setTeamName] = useState('')
  const [teamSize, setTeamSize] = useState('')
  const [reportsTo, setReportsTo] = useState('')
  const [directReports, setDirectReports] = useState('0')
  const [keyProjects, setKeyProjects] = useState('')
  const [successMetrics, setSuccessMetrics] = useState('')

  // Step 4: Logistics & Compensation
  const [workArrangement, setWorkArrangement] = useState('remote')
  const [hybridDays, setHybridDays] = useState(3)
  const [locationRestrictions, setLocationRestrictions] = useState<string[]>(['us_based'])
  const [officeLocation, setOfficeLocation] = useState('')
  const [workAuthorizations, setWorkAuthorizations] = useState<string[]>(['us_citizen', 'green_card'])
  const [billRateMin, setBillRateMin] = useState('')
  const [billRateMax, setBillRateMax] = useState('')
  const [payRateMin, setPayRateMin] = useState('')
  const [payRateMax, setPayRateMax] = useState('')
  const [conversionSalaryMin, setConversionSalaryMin] = useState('')
  const [conversionSalaryMax, setConversionSalaryMax] = useState('')
  const [conversionFee, setConversionFee] = useState('20')
  const [benefits, setBenefits] = useState<string[]>(['health', '401k', 'pto'])
  const [weeklyHours, setWeeklyHours] = useState('40')
  const [overtimeExpected, setOvertimeExpected] = useState('rarely')
  const [onCallRequired, setOnCallRequired] = useState(false)
  const [onCallSchedule, setOnCallSchedule] = useState('')

  // Step 5: Interview Process
  const [interviewRounds, setInterviewRounds] = useState<InterviewRound[]>([
    { name: 'Recruiter Screen', format: 'phone', duration: 30, interviewer: 'InTime Recruiter', focus: 'Experience overview, culture, logistics' },
    { name: 'Technical Phone Screen', format: 'video', duration: 60, interviewer: 'Senior Engineer - TBD', focus: 'Technical depth, coding problem' },
  ])
  const [decisionDays, setDecisionDays] = useState('3-5')
  const [submissionRequirements, setSubmissionRequirements] = useState<string[]>(['resume'])
  const [submissionFormat, setSubmissionFormat] = useState('standard')
  const [submissionNotes, setSubmissionNotes] = useState('')
  const [candidatesPerWeek, setCandidatesPerWeek] = useState('3-5')
  const [feedbackTurnaround, setFeedbackTurnaround] = useState('48')
  const [screeningQuestions, setScreeningQuestions] = useState('')

  // Queries
  const accountsQuery = trpc.crm.accounts.list.useQuery(
    { limit: 100, status: 'active' },
    { enabled: open && !initialAccountId }
  )

  const contactsQuery = trpc.crm.contacts.listByAccount.useQuery(
    { accountId: accountId || '' },
    { enabled: open && !!accountId }
  )

  const createJobMutation = trpc.ats.jobs.create.useMutation({
    onSuccess: (data) => {
      toast({
        title: 'Job requisition created!',
        description: `${title} @ ${accountName || 'Account'}`,
      })
      utils.ats.jobs.list.invalidate()
      utils.crm.accounts.getById.invalidate({ id: accountId })
      onOpenChange(false)
      router.push(`/employee/recruiting/jobs/${data.id}`)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create job requisition.',
        variant: 'error',
      })
      setIsSubmitting(false)
    },
  })

  // Reset form when opened
  useEffect(() => {
    if (open) {
      setStep(1)
      if (initialAccountId) {
        setAccountId(initialAccountId)
      }
    }
  }, [open, initialAccountId])

  const accounts = accountsQuery.data?.items || []
  const contacts = contactsQuery.data || []

  const addRequiredSkill = () => {
    if (!newSkillName.trim()) return
    setRequiredSkills([
      ...requiredSkills,
      { name: newSkillName.trim(), years: newSkillYears, proficiency: newSkillProficiency },
    ])
    setNewSkillName('')
    setNewSkillYears('2')
    setNewSkillProficiency('proficient')
  }

  const removeRequiredSkill = (index: number) => {
    setRequiredSkills(requiredSkills.filter((_, i) => i !== index))
  }

  const addPreferredSkill = () => {
    if (!preferredSkillInput.trim()) return
    setPreferredSkills([...preferredSkills, preferredSkillInput.trim()])
    setPreferredSkillInput('')
  }

  const removePreferredSkill = (index: number) => {
    setPreferredSkills(preferredSkills.filter((_, i) => i !== index))
  }

  const addInterviewRound = () => {
    setInterviewRounds([
      ...interviewRounds,
      { name: `Round ${interviewRounds.length + 1}`, format: 'video', duration: 60, interviewer: '', focus: '' },
    ])
  }

  const removeInterviewRound = (index: number) => {
    setInterviewRounds(interviewRounds.filter((_, i) => i !== index))
  }

  const updateInterviewRound = (index: number, field: keyof InterviewRound, value: string | number) => {
    const updated = [...interviewRounds]
    updated[index] = { ...updated[index], [field]: value }
    setInterviewRounds(updated)
  }

  const validateStep = (currentStep: Step): boolean => {
    switch (currentStep) {
      case 1:
        if (!accountId) {
          toast({ title: 'Validation Error', description: 'Please select an account.', variant: 'error' })
          return false
        }
        if (!title.trim()) {
          toast({ title: 'Validation Error', description: 'Please enter a job title.', variant: 'error' })
          return false
        }
        return true
      case 2:
        if (requiredSkills.length === 0) {
          toast({ title: 'Validation Error', description: 'Please add at least one required skill.', variant: 'error' })
          return false
        }
        return true
      case 3:
        if (!roleSummary.trim() || roleSummary.length < 20) {
          toast({ title: 'Validation Error', description: 'Please provide a role summary (at least 20 characters).', variant: 'error' })
          return false
        }
        if (!responsibilities.trim() || responsibilities.length < 20) {
          toast({ title: 'Validation Error', description: 'Please provide key responsibilities (at least 20 characters).', variant: 'error' })
          return false
        }
        return true
      case 4:
        if (!billRateMin || !billRateMax) {
          toast({ title: 'Validation Error', description: 'Please enter bill rate range.', variant: 'error' })
          return false
        }
        return true
      case 5:
        return true
      default:
        return true
    }
  }

  const handleNext = () => {
    if (!validateStep(step)) return
    if (step < 5) {
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleSubmit = async () => {
    if (!validateStep(step)) return
    setIsSubmitting(true)

    try {
      createJobMutation.mutate({
        title: title.trim(),
        accountId,
        jobType: jobType as 'contract' | 'permanent' | 'contract_to_hire' | 'temp' | 'sow',
        positionsCount,
        priority: priority as 'low' | 'normal' | 'high' | 'urgent' | 'critical',
        targetStartDate: targetStartDate || undefined,
        // Location
        isRemote: workArrangement === 'remote',
        isHybrid: workArrangement === 'hybrid',
        hybridDays: workArrangement === 'hybrid' ? hybridDays : undefined,
        location: officeLocation || undefined,
        // Requirements
        minExperience: minExperience ? parseInt(minExperience) : undefined,
        maxExperience: preferredExperience ? parseInt(preferredExperience) : undefined,
        requiredSkills: requiredSkills.map(s => s.name),
        niceToHaveSkills: preferredSkills,
        description: `${roleSummary}\n\nKey Responsibilities:\n${responsibilities}`,
        // Compensation
        rateMin: billRateMin ? parseFloat(billRateMin) : undefined,
        rateMax: billRateMax ? parseFloat(billRateMax) : undefined,
        rateType: 'hourly',
        // Extended intake data
        intakeData: {
          intakeMethod,
          hiringManagerId: hiringManagerId || undefined,
          experienceLevel,
          requiredSkillsDetailed: requiredSkills,
          preferredSkills,
          education,
          certifications: certifications || undefined,
          industries,
          roleOpenReason,
          teamName: teamName || undefined,
          teamSize: teamSize ? parseInt(teamSize) : undefined,
          reportsTo: reportsTo || undefined,
          directReports: directReports ? parseInt(directReports) : undefined,
          keyProjects: keyProjects || undefined,
          successMetrics: successMetrics || undefined,
          workArrangement,
          hybridDays: workArrangement === 'hybrid' ? hybridDays : undefined,
          locationRestrictions,
          workAuthorizations,
          payRateMin: payRateMin ? parseFloat(payRateMin) : undefined,
          payRateMax: payRateMax ? parseFloat(payRateMax) : undefined,
          conversionSalaryMin: conversionSalaryMin ? parseFloat(conversionSalaryMin) : undefined,
          conversionSalaryMax: conversionSalaryMax ? parseFloat(conversionSalaryMax) : undefined,
          conversionFee: conversionFee ? parseFloat(conversionFee) : undefined,
          benefits,
          weeklyHours: weeklyHours ? parseInt(weeklyHours) : undefined,
          overtimeExpected,
          onCallRequired,
          onCallSchedule: onCallRequired ? onCallSchedule : undefined,
          interviewRounds,
          decisionDays,
          submissionRequirements,
          submissionFormat,
          submissionNotes: submissionNotes || undefined,
          candidatesPerWeek,
          feedbackTurnaround: feedbackTurnaround ? parseInt(feedbackTurnaround) : undefined,
          screeningQuestions: screeningQuestions || undefined,
        },
      })
    } catch {
      setIsSubmitting(false)
    }
  }

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-6">
      {[1, 2, 3, 4, 5].map((s, index) => (
        <div key={s} className="flex items-center">
          <div
            className={cn(
              'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors',
              s === step
                ? 'bg-hublot-900 text-white'
                : s < step
                ? 'bg-hublot-700 text-white'
                : 'bg-charcoal-200 text-charcoal-500'
            )}
          >
            {s}
          </div>
          {index < 4 && (
            <div
              className={cn(
                'w-12 h-0.5',
                s < step ? 'bg-hublot-700' : 'bg-charcoal-200'
              )}
            />
          )}
        </div>
      ))}
    </div>
  )

  const stepTitles = [
    'Basic Information',
    'Technical Requirements',
    'Role Details',
    'Logistics & Compensation',
    'Interview Process',
  ]

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Briefcase className="w-5 h-5" />
            Job Intake Wizard
          </DialogTitle>
          <DialogDescription>
            Step {step} of 5: {stepTitles[step - 1]}
          </DialogDescription>
        </DialogHeader>

        {renderStepIndicator()}

        <div className="space-y-4 py-4">
          {/* Step 1: Basic Information */}
          {step === 1 && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Account & Contact
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="account">Account *</Label>
                  {initialAccountId ? (
                    <Input value={accountName || 'Selected Account'} disabled />
                  ) : (
                    <Select value={accountId} onValueChange={setAccountId}>
                      <SelectTrigger id="account">
                        <SelectValue placeholder="Select account" />
                      </SelectTrigger>
                      <SelectContent>
                        {accounts.map((account) => (
                          <SelectItem key={account.id} value={account.id}>
                            {account.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                </div>

                {accountId && contacts.length > 0 && (
                  <div className="space-y-2">
                    <Label htmlFor="hiringManager">Hiring Manager</Label>
                    <Select value={hiringManagerId} onValueChange={setHiringManagerId}>
                      <SelectTrigger id="hiringManager">
                        <SelectValue placeholder="Select hiring manager" />
                      </SelectTrigger>
                      <SelectContent>
                        {contacts.map((contact: { id: string; first_name: string; last_name?: string; title?: string }) => (
                          <SelectItem key={contact.id} value={contact.id}>
                            {contact.first_name} {contact.last_name} {contact.title && `- ${contact.title}`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="intakeMethod">Intake Method *</Label>
                  <Select value={intakeMethod} onValueChange={setIntakeMethod}>
                    <SelectTrigger id="intakeMethod">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {INTAKE_METHODS.map((method) => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Job Basics
                </h3>

                <div className="space-y-2">
                  <Label htmlFor="title">Job Title *</Label>
                  <Input
                    id="title"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="e.g., Senior Backend Engineer"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="positions">Number of Positions *</Label>
                    <Input
                      id="positions"
                      type="number"
                      min={1}
                      value={positionsCount}
                      onChange={(e) => setPositionsCount(parseInt(e.target.value) || 1)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="targetStartDate">Target Start Date</Label>
                    <Input
                      id="targetStartDate"
                      type="date"
                      value={targetStartDate}
                      onChange={(e) => setTargetStartDate(e.target.value)}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Job Type *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {JOB_TYPES.map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setJobType(type.value)}
                        className={cn(
                          'p-3 rounded-lg border-2 text-left transition-colors text-sm',
                          jobType === type.value
                            ? 'border-hublot-700 bg-hublot-50 text-hublot-900'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Priority Level *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {PRIORITY_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setPriority(level.value)}
                        className={cn(
                          'p-3 rounded-lg border-2 text-left transition-colors text-sm',
                          priority === level.value
                            ? 'border-hublot-700 bg-hublot-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        <span className={level.color}>{level.label}</span>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Step 2: Technical Requirements */}
          {step === 2 && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Experience Requirements
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Minimum Years *</Label>
                    <Input
                      type="number"
                      min={0}
                      value={minExperience}
                      onChange={(e) => setMinExperience(e.target.value)}
                      placeholder="5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Preferred Years</Label>
                    <Input
                      type="number"
                      min={0}
                      value={preferredExperience}
                      onChange={(e) => setPreferredExperience(e.target.value)}
                      placeholder="7"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Experience Level *</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {EXPERIENCE_LEVELS.map((level) => (
                      <button
                        key={level.value}
                        type="button"
                        onClick={() => setExperienceLevel(level.value)}
                        className={cn(
                          'p-2 rounded-lg border-2 text-sm transition-colors',
                          experienceLevel === level.value
                            ? 'border-hublot-700 bg-hublot-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        {level.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Required Skills (Must-Have)
                </h3>

                <div className="p-4 border rounded-lg space-y-4">
                  <div className="grid grid-cols-12 gap-2">
                    <div className="col-span-5">
                      <Input
                        placeholder="Skill name"
                        value={newSkillName}
                        onChange={(e) => setNewSkillName(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addRequiredSkill())}
                      />
                    </div>
                    <div className="col-span-2">
                      <Input
                        type="number"
                        placeholder="Years"
                        value={newSkillYears}
                        onChange={(e) => setNewSkillYears(e.target.value)}
                        min={0}
                      />
                    </div>
                    <div className="col-span-4">
                      <Select value={newSkillProficiency} onValueChange={(v) => setNewSkillProficiency(v as 'beginner' | 'proficient' | 'expert')}>
                        <SelectTrigger>
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
                      <Button type="button" variant="outline" size="icon" onClick={addRequiredSkill}>
                        <Plus className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>

                  {requiredSkills.length > 0 && (
                    <div className="space-y-2">
                      {requiredSkills.map((skill, index) => (
                        <div key={index} className="flex items-center justify-between p-2 bg-charcoal-50 rounded">
                          <span className="text-sm">
                            {skill.name} · {skill.years}+ years · {skill.proficiency}
                          </span>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-6 w-6"
                            onClick={() => removeRequiredSkill(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Preferred Skills (Nice-to-Have)
                </h3>

                <div className="flex gap-2">
                  <Input
                    placeholder="Add preferred skill"
                    value={preferredSkillInput}
                    onChange={(e) => setPreferredSkillInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addPreferredSkill())}
                  />
                  <Button type="button" variant="outline" onClick={addPreferredSkill}>
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>

                {preferredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {preferredSkills.map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center gap-1 px-3 py-1 bg-charcoal-100 rounded-full text-sm"
                      >
                        {skill}
                        <button
                          type="button"
                          onClick={() => removePreferredSkill(index)}
                          className="hover:text-red-500"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Education
                </h3>

                <div className="space-y-2">
                  <Label>Minimum Education</Label>
                  <Select value={education} onValueChange={setEducation}>
                    <SelectTrigger>
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

                <div className="space-y-2">
                  <Label>Certifications (Optional)</Label>
                  <Input
                    placeholder="e.g., AWS Certified, not required but preferred"
                    value={certifications}
                    onChange={(e) => setCertifications(e.target.value)}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 3: Role Details */}
          {step === 3 && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Job Description
                </h3>

                <div className="space-y-2">
                  <Label>Role Summary *</Label>
                  <Textarea
                    value={roleSummary}
                    onChange={(e) => setRoleSummary(e.target.value)}
                    placeholder="Describe what this role is about and its impact..."
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Key Responsibilities *</Label>
                  <Textarea
                    value={responsibilities}
                    onChange={(e) => setResponsibilities(e.target.value)}
                    placeholder="• Design and build scalable services&#10;• Own end-to-end development&#10;• Mentor junior engineers"
                    rows={5}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Why This Role is Open</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {ROLE_OPEN_REASONS.map((reason) => (
                      <button
                        key={reason.value}
                        type="button"
                        onClick={() => setRoleOpenReason(reason.value)}
                        className={cn(
                          'p-2 rounded-lg border-2 text-sm transition-colors text-left',
                          roleOpenReason === reason.value
                            ? 'border-hublot-700 bg-hublot-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        {reason.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Team Structure
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Team Name</Label>
                    <Input
                      value={teamName}
                      onChange={(e) => setTeamName(e.target.value)}
                      placeholder="e.g., Payments Team"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Team Size</Label>
                    <Input
                      type="number"
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      placeholder="8"
                      min={1}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Reports To</Label>
                    <Input
                      value={reportsTo}
                      onChange={(e) => setReportsTo(e.target.value)}
                      placeholder="e.g., VP Engineering"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Direct Reports</Label>
                    <Input
                      type="number"
                      value={directReports}
                      onChange={(e) => setDirectReports(e.target.value)}
                      placeholder="0"
                      min={0}
                    />
                  </div>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Key Projects & Success Metrics
                </h3>

                <div className="space-y-2">
                  <Label>What Will This Person Work On?</Label>
                  <Textarea
                    value={keyProjects}
                    onChange={(e) => setKeyProjects(e.target.value)}
                    placeholder="• Real-time payment processing&#10;• Fraud detection integration&#10;• Performance optimization"
                    rows={4}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Success Metrics (First 90 Days)</Label>
                  <Textarea
                    value={successMetrics}
                    onChange={(e) => setSuccessMetrics(e.target.value)}
                    placeholder="• Onboard and ship first feature by Day 30&#10;• Own a service component by Day 60&#10;• Join on-call rotation by Day 90"
                    rows={4}
                  />
                </div>
              </div>
            </>
          )}

          {/* Step 4: Logistics & Compensation */}
          {step === 4 && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Work Location
                </h3>

                <div className="space-y-2">
                  <Label>Work Arrangement *</Label>
                  <div className="grid grid-cols-3 gap-2">
                    {WORK_ARRANGEMENTS.map((arr) => (
                      <button
                        key={arr.value}
                        type="button"
                        onClick={() => setWorkArrangement(arr.value)}
                        className={cn(
                          'p-3 rounded-lg border-2 text-sm transition-colors',
                          workArrangement === arr.value
                            ? 'border-hublot-700 bg-hublot-50'
                            : 'border-charcoal-200 hover:border-charcoal-300'
                        )}
                      >
                        {arr.label}
                      </button>
                    ))}
                  </div>
                </div>

                {workArrangement === 'hybrid' && (
                  <div className="space-y-2">
                    <Label>Days in Office</Label>
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={hybridDays}
                      onChange={(e) => setHybridDays(parseInt(e.target.value) || 3)}
                    />
                  </div>
                )}

                {(workArrangement === 'hybrid' || workArrangement === 'onsite') && (
                  <div className="space-y-2">
                    <Label>Office Location</Label>
                    <Input
                      value={officeLocation}
                      onChange={(e) => setOfficeLocation(e.target.value)}
                      placeholder="e.g., San Francisco, CA"
                    />
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Work Authorization
                </h3>

                <div className="grid grid-cols-2 gap-2">
                  {WORK_AUTHORIZATIONS.map((auth) => (
                    <label
                      key={auth.value}
                      className={cn(
                        'flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors',
                        workAuthorizations.includes(auth.value)
                          ? 'bg-hublot-50 border-hublot-700'
                          : 'border-charcoal-200 hover:border-charcoal-300'
                      )}
                    >
                      <Checkbox
                        checked={workAuthorizations.includes(auth.value)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setWorkAuthorizations([...workAuthorizations, auth.value])
                          } else {
                            setWorkAuthorizations(workAuthorizations.filter(a => a !== auth.value))
                          }
                        }}
                      />
                      <span className="text-sm">{auth.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Compensation
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Bill Rate Min ($/hr) *</Label>
                    <Input
                      type="number"
                      value={billRateMin}
                      onChange={(e) => setBillRateMin(e.target.value)}
                      placeholder="110.00"
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Bill Rate Max ($/hr) *</Label>
                    <Input
                      type="number"
                      value={billRateMax}
                      onChange={(e) => setBillRateMax(e.target.value)}
                      placeholder="140.00"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Pay Rate Min ($/hr)</Label>
                    <Input
                      type="number"
                      value={payRateMin}
                      onChange={(e) => setPayRateMin(e.target.value)}
                      placeholder="88.00"
                      min={0}
                      step={0.01}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Pay Rate Max ($/hr)</Label>
                    <Input
                      type="number"
                      value={payRateMax}
                      onChange={(e) => setPayRateMax(e.target.value)}
                      placeholder="112.00"
                      min={0}
                      step={0.01}
                    />
                  </div>
                </div>

                {jobType === 'contract_to_hire' && (
                  <div className="p-4 border rounded-lg space-y-4 bg-charcoal-50">
                    <h4 className="text-sm font-medium">Contract-to-Hire Conversion</h4>
                    <div className="grid grid-cols-3 gap-4">
                      <div className="space-y-2">
                        <Label>Salary Min</Label>
                        <Input
                          type="number"
                          value={conversionSalaryMin}
                          onChange={(e) => setConversionSalaryMin(e.target.value)}
                          placeholder="180000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Salary Max</Label>
                        <Input
                          type="number"
                          value={conversionSalaryMax}
                          onChange={(e) => setConversionSalaryMax(e.target.value)}
                          placeholder="220000"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Fee %</Label>
                        <Input
                          type="number"
                          value={conversionFee}
                          onChange={(e) => setConversionFee(e.target.value)}
                          placeholder="20"
                        />
                      </div>
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Schedule
                </h3>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Weekly Hours</Label>
                    <Input
                      type="number"
                      value={weeklyHours}
                      onChange={(e) => setWeeklyHours(e.target.value)}
                      placeholder="40"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Overtime Expected</Label>
                    <Select value={overtimeExpected} onValueChange={setOvertimeExpected}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="regularly">Yes, regularly (10+ hrs/week)</SelectItem>
                        <SelectItem value="occasionally">Occasionally (5-10 hrs/week)</SelectItem>
                        <SelectItem value="rarely">Rarely (&lt;5 hrs/week)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="flex items-center gap-2">
                    <Checkbox
                      checked={onCallRequired}
                      onCheckedChange={(checked) => setOnCallRequired(!!checked)}
                    />
                    <span className="text-sm font-medium">On-Call Required</span>
                  </label>
                  {onCallRequired && (
                    <Input
                      value={onCallSchedule}
                      onChange={(e) => setOnCallSchedule(e.target.value)}
                      placeholder="e.g., 1 week every 6 weeks"
                      className="mt-2"
                    />
                  )}
                </div>
              </div>
            </>
          )}

          {/* Step 5: Interview Process */}
          {step === 5 && (
            <>
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Interview Process
                </h3>

                <div className="space-y-3">
                  {interviewRounds.map((round, index) => (
                    <div key={index} className="p-4 border rounded-lg space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-medium">Round {index + 1}</h4>
                        {interviewRounds.length > 1 && (
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => removeInterviewRound(index)}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                      <div className="grid grid-cols-3 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Name</Label>
                          <Input
                            value={round.name}
                            onChange={(e) => updateInterviewRound(index, 'name', e.target.value)}
                            placeholder="Round name"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Format</Label>
                          <Select
                            value={round.format}
                            onValueChange={(v) => updateInterviewRound(index, 'format', v)}
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {INTERVIEW_FORMATS.map((f) => (
                                <SelectItem key={f.value} value={f.value}>
                                  {f.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Duration (min)</Label>
                          <Input
                            type="number"
                            value={round.duration}
                            onChange={(e) => updateInterviewRound(index, 'duration', parseInt(e.target.value) || 30)}
                            min={15}
                            step={15}
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <Label className="text-xs">Interviewer</Label>
                          <Input
                            value={round.interviewer}
                            onChange={(e) => updateInterviewRound(index, 'interviewer', e.target.value)}
                            placeholder="e.g., Senior Engineer"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Focus</Label>
                          <Input
                            value={round.focus}
                            onChange={(e) => updateInterviewRound(index, 'focus', e.target.value)}
                            placeholder="e.g., Technical depth"
                          />
                        </div>
                      </div>
                    </div>
                  ))}

                  <Button type="button" variant="outline" onClick={addInterviewRound} className="w-full">
                    <Plus className="w-4 h-4 mr-2" /> Add Round
                  </Button>
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t">
                <h3 className="text-sm font-semibold text-charcoal-700 uppercase tracking-wider">
                  Decision & Submission
                </h3>

                <div className="grid grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label>Decision Days</Label>
                    <Input
                      value={decisionDays}
                      onChange={(e) => setDecisionDays(e.target.value)}
                      placeholder="3-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Candidates/Week</Label>
                    <Input
                      value={candidatesPerWeek}
                      onChange={(e) => setCandidatesPerWeek(e.target.value)}
                      placeholder="3-5"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Feedback (hrs)</Label>
                    <Input
                      type="number"
                      value={feedbackTurnaround}
                      onChange={(e) => setFeedbackTurnaround(e.target.value)}
                      placeholder="48"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Submission Notes</Label>
                  <Textarea
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Any special submission preferences or requirements..."
                    rows={3}
                  />
                </div>

                <div className="space-y-2">
                  <Label>Screening Questions</Label>
                  <Textarea
                    value={screeningQuestions}
                    onChange={(e) => setScreeningQuestions(e.target.value)}
                    placeholder="• What's your experience level with X?&#10;• Are you comfortable with Y?&#10;• What's your expected rate?"
                    rows={4}
                  />
                </div>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="gap-2">
          {step > 1 && (
            <Button type="button" variant="outline" onClick={handleBack}>
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
          )}
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          {step < 5 ? (
            <Button type="button" onClick={handleNext}>
              Next
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          ) : (
            <Button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting}
              className="bg-hublot-900 hover:bg-hublot-800"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              Create Job Requisition
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
