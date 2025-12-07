'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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
import { Loader2, ChevronRight, ChevronLeft } from 'lucide-react'
import { cn } from '@/lib/utils'

interface CreateJobDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

type Step = 1 | 2 | 3

const JOB_TYPES = [
  { value: 'contract', label: 'Contract' },
  { value: 'permanent', label: 'Permanent (Direct Hire)' },
  { value: 'contract_to_hire', label: 'Contract to Hire' },
  { value: 'temp', label: 'Temporary' },
  { value: 'sow', label: 'Statement of Work (SOW)' },
]

const RATE_TYPES = [
  { value: 'hourly', label: 'Hourly' },
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'monthly', label: 'Monthly' },
  { value: 'annual', label: 'Annual' },
]

const PRIORITIES = [
  { value: 'low', label: 'Low', color: 'text-charcoal-500' },
  { value: 'normal', label: 'Normal', color: 'text-blue-500' },
  { value: 'high', label: 'High', color: 'text-amber-500' },
  { value: 'urgent', label: 'Urgent', color: 'text-orange-500' },
  { value: 'critical', label: 'Critical', color: 'text-red-500' },
]

export function CreateJobDialog({ open, onOpenChange }: CreateJobDialogProps) {
  const { toast } = useToast()
  const router = useRouter()
  const utils = trpc.useUtils()

  // Multi-step wizard state
  const [step, setStep] = useState<Step>(1)

  // Form state - Step 1: Basic Info
  const [title, setTitle] = useState('')
  const [accountId, setAccountId] = useState('')
  const [jobType, setJobType] = useState('contract')
  const [location, setLocation] = useState('')
  const [isRemote, setIsRemote] = useState(false)
  const [isHybrid, setIsHybrid] = useState(false)
  const [hybridDays, setHybridDays] = useState(3)

  // Form state - Step 2: Requirements
  const [requiredSkills, setRequiredSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [niceToHaveSkills, setNiceToHaveSkills] = useState<string[]>([])
  const [niceToHaveInput, setNiceToHaveInput] = useState('')
  const [minExperience, setMinExperience] = useState<string>('')
  const [maxExperience, setMaxExperience] = useState<string>('')
  const [description, setDescription] = useState('')

  // Form state - Step 3: Compensation
  const [rateMin, setRateMin] = useState<string>('')
  const [rateMax, setRateMax] = useState<string>('')
  const [rateType, setRateType] = useState('hourly')
  const [positionsCount, setPositionsCount] = useState(1)
  const [priority, setPriority] = useState('normal')
  const [targetFillDate, setTargetFillDate] = useState('')
  const [targetStartDate, setTargetStartDate] = useState('')

  // Queries
  const accountsQuery = trpc.crm.accounts.list.useQuery(
    { limit: 100, status: 'active' },
    { enabled: open }
  )
  const accounts = accountsQuery.data?.items || []

  // Mutation
  const createMutation = trpc.ats.jobs.create.useMutation({
    onSuccess: (data) => {
      utils.ats.jobs.list.invalidate()
      utils.ats.jobs.getStats.invalidate()
      toast({
        title: 'Job created successfully',
        description: `${data.title} has been created in draft status`,
      })
      onOpenChange(false)
      resetForm()
      router.push(`/employee/recruiting/jobs/${data.jobId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error creating job',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    setStep(1)
    setTitle('')
    setAccountId('')
    setJobType('contract')
    setLocation('')
    setIsRemote(false)
    setIsHybrid(false)
    setHybridDays(3)
    setRequiredSkills([])
    setSkillInput('')
    setNiceToHaveSkills([])
    setNiceToHaveInput('')
    setMinExperience('')
    setMaxExperience('')
    setDescription('')
    setRateMin('')
    setRateMax('')
    setRateType('hourly')
    setPositionsCount(1)
    setPriority('normal')
    setTargetFillDate('')
    setTargetStartDate('')
  }

  const handleAddSkill = (isRequired: boolean) => {
    const input = isRequired ? skillInput.trim() : niceToHaveInput.trim()
    if (!input) return

    if (isRequired) {
      if (!requiredSkills.includes(input)) {
        setRequiredSkills([...requiredSkills, input])
      }
      setSkillInput('')
    } else {
      if (!niceToHaveSkills.includes(input)) {
        setNiceToHaveSkills([...niceToHaveSkills, input])
      }
      setNiceToHaveInput('')
    }
  }

  const handleRemoveSkill = (skill: string, isRequired: boolean) => {
    if (isRequired) {
      setRequiredSkills(requiredSkills.filter((s) => s !== skill))
    } else {
      setNiceToHaveSkills(niceToHaveSkills.filter((s) => s !== skill))
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent, isRequired: boolean) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      handleAddSkill(isRequired)
    }
  }

  const validateStep1 = () => {
    if (!title || title.length < 3) {
      toast({ title: 'Validation Error', description: 'Job title is required (min 3 characters)', variant: 'error' })
      return false
    }
    if (!accountId) {
      toast({ title: 'Validation Error', description: 'Please select a client account', variant: 'error' })
      return false
    }
    return true
  }

  const validateStep2 = () => {
    if (requiredSkills.length === 0) {
      toast({ title: 'Validation Error', description: 'At least one required skill is needed', variant: 'error' })
      return false
    }
    if (minExperience && maxExperience && parseInt(maxExperience) < parseInt(minExperience)) {
      toast({ title: 'Validation Error', description: 'Max experience must be greater than min', variant: 'error' })
      return false
    }
    return true
  }

  const handleNext = () => {
    if (step === 1 && validateStep1()) {
      setStep(2)
    } else if (step === 2 && validateStep2()) {
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) setStep((step - 1) as Step)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    createMutation.mutate({
      title,
      accountId,
      jobType: jobType as 'contract' | 'permanent' | 'contract_to_hire' | 'temp' | 'sow',
      location: location || undefined,
      isRemote,
      hybridDays: isHybrid ? hybridDays : undefined,
      requiredSkills,
      niceToHaveSkills: niceToHaveSkills.length > 0 ? niceToHaveSkills : undefined,
      minExperienceYears: minExperience ? parseInt(minExperience) : undefined,
      maxExperienceYears: maxExperience ? parseInt(maxExperience) : undefined,
      description: description || undefined,
      rateMin: rateMin ? parseFloat(rateMin) : undefined,
      rateMax: rateMax ? parseFloat(rateMax) : undefined,
      rateType: rateType as 'hourly' | 'daily' | 'weekly' | 'monthly' | 'annual',
      positionsCount,
      priority: priority as 'low' | 'normal' | 'high' | 'urgent' | 'critical',
      targetFillDate: targetFillDate || undefined,
      targetStartDate: targetStartDate || undefined,
    })
  }

  const getRateSuffix = () => {
    const suffixes: Record<string, string> = {
      hourly: '/hr',
      daily: '/day',
      weekly: '/week',
      monthly: '/mo',
      annual: '/yr',
    }
    return suffixes[rateType] || '/hr'
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>Create New Job</DialogTitle>
            <DialogDescription>
              Step {step} of 3: {step === 1 ? 'Basic Information' : step === 2 ? 'Requirements' : 'Compensation & Details'}
            </DialogDescription>
          </DialogHeader>

          {/* Progress indicator */}
          <div className="flex items-center justify-center gap-2 py-4">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={cn(
                  'w-3 h-3 rounded-full transition-colors',
                  s === step
                    ? 'bg-hublot-900'
                    : s < step
                    ? 'bg-gold-500'
                    : 'bg-charcoal-200'
                )}
              />
            ))}
          </div>

          {/* Step 1: Basic Information */}
          {step === 1 && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="title">Job Title *</Label>
                <Input
                  id="title"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Senior Software Engineer"
                  maxLength={200}
                  required
                />
                <p className="text-xs text-charcoal-500 mt-1">{title.length}/200</p>
              </div>

              <div>
                <Label htmlFor="account">Client Account *</Label>
                <Select value={accountId} onValueChange={setAccountId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select account" />
                  </SelectTrigger>
                  <SelectContent>
                    {accounts.map((account) => (
                      <SelectItem key={account.id} value={account.id}>
                        {account.name} {account.industry ? `(${account.industry})` : ''}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="jobType">Job Type *</Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {JOB_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g., San Francisco, CA"
                  maxLength={200}
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isRemote}
                    onChange={(e) => {
                      setIsRemote(e.target.checked)
                      if (e.target.checked) setIsHybrid(false)
                    }}
                    className="w-4 h-4 rounded border-charcoal-300"
                  />
                  <span className="text-sm">Remote</span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isHybrid}
                    onChange={(e) => {
                      setIsHybrid(e.target.checked)
                      if (e.target.checked) setIsRemote(false)
                    }}
                    className="w-4 h-4 rounded border-charcoal-300"
                  />
                  <span className="text-sm">Hybrid</span>
                </label>
                {isHybrid && (
                  <div className="flex items-center gap-2">
                    <Input
                      type="number"
                      min={1}
                      max={5}
                      value={hybridDays}
                      onChange={(e) => setHybridDays(parseInt(e.target.value) || 3)}
                      className="w-16"
                    />
                    <span className="text-sm text-charcoal-500">days/week in office</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Step 2: Requirements */}
          {step === 2 && (
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="requiredSkills">Required Skills *</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="requiredSkills"
                    value={skillInput}
                    onChange={(e) => setSkillInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, true)}
                    placeholder="Type skill and press Enter"
                  />
                  <Button type="button" variant="outline" onClick={() => handleAddSkill(true)}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-hublot-100 text-hublot-900 rounded text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill, true)}
                        className="hover:text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div>
                <Label htmlFor="niceToHaveSkills">Nice-to-Have Skills</Label>
                <div className="flex gap-2 mb-2">
                  <Input
                    id="niceToHaveSkills"
                    value={niceToHaveInput}
                    onChange={(e) => setNiceToHaveInput(e.target.value)}
                    onKeyDown={(e) => handleKeyDown(e, false)}
                    placeholder="Type skill and press Enter"
                  />
                  <Button type="button" variant="outline" onClick={() => handleAddSkill(false)}>
                    Add
                  </Button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {niceToHaveSkills.map((skill) => (
                    <span
                      key={skill}
                      className="inline-flex items-center gap-1 px-2 py-1 bg-charcoal-100 text-charcoal-700 rounded text-sm"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill, false)}
                        className="hover:text-red-500"
                      >
                        &times;
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minExp">Min Experience (years)</Label>
                  <Input
                    id="minExp"
                    type="number"
                    min={0}
                    max={50}
                    value={minExperience}
                    onChange={(e) => setMinExperience(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div>
                  <Label htmlFor="maxExp">Max Experience (years)</Label>
                  <Input
                    id="maxExp"
                    type="number"
                    min={0}
                    max={50}
                    value={maxExperience}
                    onChange={(e) => setMaxExperience(e.target.value)}
                    placeholder="10"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="description">Job Description</Label>
                <Textarea
                  id="description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Enter job description, responsibilities, and requirements..."
                  rows={5}
                  maxLength={5000}
                />
                <p className="text-xs text-charcoal-500 mt-1">{description.length}/5000</p>
              </div>
            </div>
          )}

          {/* Step 3: Compensation & Details */}
          {step === 3 && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="rateMin">Min Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-charcoal-500">$</span>
                    <Input
                      id="rateMin"
                      type="number"
                      min={0}
                      step="0.01"
                      value={rateMin}
                      onChange={(e) => setRateMin(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rateMax">Max Rate</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-charcoal-500">$</span>
                    <Input
                      id="rateMax"
                      type="number"
                      min={0}
                      step="0.01"
                      value={rateMax}
                      onChange={(e) => setRateMax(e.target.value)}
                      className="pl-7"
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="rateType">Rate Type</Label>
                  <Select value={rateType} onValueChange={setRateType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {RATE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              {(rateMin || rateMax) && (
                <p className="text-sm text-charcoal-500">
                  Rate Range: ${rateMin || '0'} - ${rateMax || '0'} {getRateSuffix()}
                </p>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="positions">Positions</Label>
                  <Input
                    id="positions"
                    type="number"
                    min={1}
                    max={100}
                    value={positionsCount}
                    onChange={(e) => setPositionsCount(parseInt(e.target.value) || 1)}
                  />
                </div>
                <div>
                  <Label htmlFor="priority">Priority</Label>
                  <Select value={priority} onValueChange={setPriority}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {PRIORITIES.map((p) => (
                        <SelectItem key={p.value} value={p.value}>
                          <span className={p.color}>{p.label}</span>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="targetFill">Target Fill Date</Label>
                  <Input
                    id="targetFill"
                    type="date"
                    value={targetFillDate}
                    onChange={(e) => setTargetFillDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
                <div>
                  <Label htmlFor="targetStart">Target Start Date</Label>
                  <Input
                    id="targetStart"
                    type="date"
                    value={targetStartDate}
                    onChange={(e) => setTargetStartDate(e.target.value)}
                    min={new Date().toISOString().split('T')[0]}
                  />
                </div>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              {step < 3 ? (
                <Button type="button" onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button type="submit" disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Create Job
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
