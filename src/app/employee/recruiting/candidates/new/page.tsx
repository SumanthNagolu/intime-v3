'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  ChevronLeft,
  ChevronRight,
  Loader2,
  User,
  Briefcase,
  FileText,
  Shield,
  Upload,
  X,
} from 'lucide-react'

type Step = 1 | 2 | 3 | 4 | 5

const STEPS = [
  { id: 1, title: 'Source', icon: Upload },
  { id: 2, title: 'Basic Info', icon: User },
  { id: 3, title: 'Professional', icon: Briefcase },
  { id: 4, title: 'Authorization', icon: Shield },
  { id: 5, title: 'Documents', icon: FileText },
]

export default function AddCandidatePage() {
  const router = useRouter()
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [step, setStep] = useState<Step>(1)
  const [sourceType, setSourceType] = useState<'resume' | 'linkedin' | 'manual'>('manual')

  // Form state
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [linkedinUrl, setLinkedinUrl] = useState('')
  const [professionalHeadline, setProfessionalHeadline] = useState('')
  const [professionalSummary, setProfessionalSummary] = useState('')
  const [skills, setSkills] = useState<string[]>([])
  const [skillInput, setSkillInput] = useState('')
  const [experienceYears, setExperienceYears] = useState<number>(0)
  const [visaStatus, setVisaStatus] = useState<string>('')
  const [availability, setAvailability] = useState<string>('2_weeks')
  const [location, setLocation] = useState('')
  const [willingToRelocate, setWillingToRelocate] = useState(false)
  const [isRemoteOk, setIsRemoteOk] = useState(false)
  const [minimumHourlyRate, setMinimumHourlyRate] = useState<number | undefined>()
  const [desiredHourlyRate, setDesiredHourlyRate] = useState<number | undefined>()
  const [leadSource, setLeadSource] = useState<string>('linkedin')
  const [sourceDetails, setSourceDetails] = useState('')
  const [isOnHotlist, setIsOnHotlist] = useState(false)
  const [hotlistNotes, setHotlistNotes] = useState('')

  // Mutations
  const createMutation = trpc.ats.candidates.create.useMutation({
    onSuccess: (data) => {
      utils.ats.candidates.advancedSearch.invalidate()
      toast({ title: 'Candidate added successfully' })
      router.push(`/employee/recruiting/candidates/${data.candidateId}`)
    },
    onError: (error) => {
      toast({
        title: 'Error adding candidate',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const checkDuplicateQuery = trpc.ats.candidates.checkDuplicate.useQuery(
    { email: email || undefined },
    { enabled: email.length > 5 && email.includes('@') }
  )

  // Validation
  const validateStep = (s: Step): boolean => {
    switch (s) {
      case 1:
        return true // Source selection always valid
      case 2:
        if (!firstName || firstName.length < 1) {
          toast({ title: 'First name is required', variant: 'error' })
          return false
        }
        if (!lastName || lastName.length < 1) {
          toast({ title: 'Last name is required', variant: 'error' })
          return false
        }
        if (!email || !email.includes('@')) {
          toast({ title: 'Valid email is required', variant: 'error' })
          return false
        }
        if (checkDuplicateQuery.data?.duplicate) {
          toast({
            title: 'Duplicate candidate',
            description: `A candidate with this email already exists: ${checkDuplicateQuery.data.duplicate.first_name} ${checkDuplicateQuery.data.duplicate.last_name}`,
            variant: 'error',
          })
          return false
        }
        return true
      case 3:
        if (skills.length < 1) {
          toast({ title: 'At least one skill is required', variant: 'error' })
          return false
        }
        return true
      case 4:
        if (!visaStatus) {
          toast({ title: 'Visa status is required', variant: 'error' })
          return false
        }
        if (!location) {
          toast({ title: 'Location is required', variant: 'error' })
          return false
        }
        return true
      case 5:
        return true
    }
  }

  const handleNext = () => {
    if (validateStep(step) && step < 5) {
      setStep((step + 1) as Step)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep((step - 1) as Step)
    }
  }

  const handleSubmit = () => {
    if (!validateStep(step)) return

    createMutation.mutate({
      firstName,
      lastName,
      email,
      phone: phone || undefined,
      linkedinUrl: linkedinUrl || undefined,
      professionalHeadline: professionalHeadline || undefined,
      professionalSummary: professionalSummary || undefined,
      skills,
      experienceYears,
      visaStatus: visaStatus as 'us_citizen' | 'green_card' | 'h1b' | 'l1' | 'tn' | 'opt' | 'cpt' | 'ead' | 'other',
      availability: availability as 'immediate' | '2_weeks' | '30_days' | 'not_available',
      location,
      willingToRelocate,
      isRemoteOk,
      minimumHourlyRate,
      desiredHourlyRate,
      leadSource: leadSource as 'linkedin' | 'indeed' | 'dice' | 'monster' | 'referral' | 'direct' | 'agency' | 'job_board' | 'other',
      sourceDetails: sourceDetails || undefined,
      isOnHotlist,
      hotlistNotes: hotlistNotes || undefined,
    })
  }

  const addSkill = () => {
    const skill = skillInput.trim()
    if (skill && !skills.includes(skill)) {
      setSkills([...skills, skill])
      setSkillInput('')
    }
  }

  const removeSkill = (skill: string) => {
    setSkills(skills.filter((s) => s !== skill))
  }

  return (
    <div className="min-h-screen bg-cream">
      <div className="container mx-auto px-6 py-8 max-w-3xl">
        {/* Back button */}
        <Button
          variant="ghost"
          onClick={() => router.push('/employee/recruiting/candidates')}
          className="mb-6"
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Candidates
        </Button>

        {/* Progress */}
        <div className="flex items-center justify-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s.id} className="flex items-center">
              <div
                className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center transition-colors',
                  s.id === step
                    ? 'bg-hublot-900 text-white'
                    : s.id < step
                      ? 'bg-gold-500 text-white'
                      : 'bg-charcoal-100 text-charcoal-400'
                )}
              >
                <s.icon className="w-5 h-5" />
              </div>
              {i < STEPS.length - 1 && (
                <div
                  className={cn('w-12 h-1 mx-1', i < step - 1 ? 'bg-gold-500' : 'bg-charcoal-100')}
                />
              )}
            </div>
          ))}
        </div>

        <Card className="bg-white">
          <CardHeader>
            <CardTitle>
              Step {step}: {STEPS[step - 1].title}
            </CardTitle>
            <CardDescription>
              {step === 1 && 'How are you adding this candidate?'}
              {step === 2 && 'Enter basic contact information'}
              {step === 3 && 'Add professional details and skills'}
              {step === 4 && 'Work authorization and availability'}
              {step === 5 && 'Source information and notes'}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Step 1: Source Selection */}
            {step === 1 && (
              <div className="space-y-4">
                <div
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-colors',
                    sourceType === 'manual'
                      ? 'border-hublot-900 bg-hublot-50'
                      : 'border-charcoal-200 hover:border-charcoal-400'
                  )}
                  onClick={() => setSourceType('manual')}
                >
                  <div className="flex items-center gap-3">
                    <User className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Manual Entry</p>
                      <p className="text-sm text-charcoal-500">Enter candidate details manually</p>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-colors opacity-60',
                    sourceType === 'resume'
                      ? 'border-hublot-900 bg-hublot-50'
                      : 'border-charcoal-200 hover:border-charcoal-400'
                  )}
                  onClick={() => setSourceType('resume')}
                >
                  <div className="flex items-center gap-3">
                    <Upload className="w-5 h-5" />
                    <div>
                      <p className="font-medium">Upload Resume</p>
                      <p className="text-sm text-charcoal-500">
                        Parse candidate details from resume (coming soon)
                      </p>
                    </div>
                  </div>
                </div>
                <div
                  className={cn(
                    'p-4 border rounded-lg cursor-pointer transition-colors opacity-60',
                    sourceType === 'linkedin'
                      ? 'border-hublot-900 bg-hublot-50'
                      : 'border-charcoal-200 hover:border-charcoal-400'
                  )}
                  onClick={() => setSourceType('linkedin')}
                >
                  <div className="flex items-center gap-3">
                    <Briefcase className="w-5 h-5" />
                    <div>
                      <p className="font-medium">LinkedIn Import</p>
                      <p className="text-sm text-charcoal-500">
                        Import from LinkedIn URL (coming soon)
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Step 2: Basic Info */}
            {step === 2 && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="firstName">First Name *</Label>
                  <Input
                    id="firstName"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    placeholder="John"
                    maxLength={50}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="lastName">Last Name *</Label>
                  <Input
                    id="lastName"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    placeholder="Smith"
                    maxLength={50}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="email">Email *</Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="john@example.com"
                    maxLength={100}
                    required
                  />
                  {checkDuplicateQuery.data?.duplicate && (
                    <p className="text-sm text-red-500 mt-1">
                      Duplicate: {checkDuplicateQuery.data.duplicate.first_name}{' '}
                      {checkDuplicateQuery.data.duplicate.last_name}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="(555) 123-4567"
                    maxLength={20}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="linkedin">LinkedIn URL</Label>
                  <Input
                    id="linkedin"
                    type="url"
                    value={linkedinUrl}
                    onChange={(e) => setLinkedinUrl(e.target.value)}
                    placeholder="https://linkedin.com/in/username"
                  />
                </div>
              </div>
            )}

            {/* Step 3: Professional */}
            {step === 3 && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="headline">Professional Headline</Label>
                  <Input
                    id="headline"
                    value={professionalHeadline}
                    onChange={(e) => setProfessionalHeadline(e.target.value)}
                    placeholder="Senior Software Engineer"
                    maxLength={200}
                  />
                  <p className="text-xs text-charcoal-500 mt-1">
                    {professionalHeadline.length}/200
                  </p>
                </div>
                <div>
                  <Label htmlFor="summary">Professional Summary</Label>
                  <Textarea
                    id="summary"
                    value={professionalSummary}
                    onChange={(e) => setProfessionalSummary(e.target.value)}
                    placeholder="Brief overview of experience and expertise..."
                    rows={4}
                    maxLength={2000}
                  />
                  <p className="text-xs text-charcoal-500 mt-1">
                    {professionalSummary.length}/2000
                  </p>
                </div>
                <div>
                  <Label>Skills *</Label>
                  <div className="flex gap-2 mb-2">
                    <Input
                      value={skillInput}
                      onChange={(e) => setSkillInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault()
                          addSkill()
                        }
                      }}
                      placeholder="Type a skill and press Enter"
                    />
                    <Button type="button" variant="outline" onClick={addSkill}>
                      Add
                    </Button>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {skills.map((skill) => (
                      <span
                        key={skill}
                        className="px-2 py-1 bg-charcoal-100 text-charcoal-700 rounded flex items-center gap-1"
                      >
                        {skill}
                        <button
                          onClick={() => removeSkill(skill)}
                          className="text-charcoal-400 hover:text-charcoal-600"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </span>
                    ))}
                    {skills.length === 0 && (
                      <span className="text-sm text-charcoal-400">No skills added yet</span>
                    )}
                  </div>
                </div>
                <div>
                  <Label htmlFor="experience">Years of Experience *</Label>
                  <Input
                    id="experience"
                    type="number"
                    min={0}
                    max={50}
                    value={experienceYears}
                    onChange={(e) => setExperienceYears(parseInt(e.target.value) || 0)}
                  />
                </div>
              </div>
            )}

            {/* Step 4: Authorization */}
            {step === 4 && (
              <div className="space-y-4">
                <div>
                  <Label>Visa Status *</Label>
                  <Select value={visaStatus} onValueChange={setVisaStatus}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select visa status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us_citizen">US Citizen</SelectItem>
                      <SelectItem value="green_card">Green Card</SelectItem>
                      <SelectItem value="h1b">H1B</SelectItem>
                      <SelectItem value="l1">L1</SelectItem>
                      <SelectItem value="tn">TN</SelectItem>
                      <SelectItem value="opt">OPT</SelectItem>
                      <SelectItem value="cpt">CPT</SelectItem>
                      <SelectItem value="ead">EAD</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label>Availability *</Label>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select availability" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="2_weeks">2 Weeks Notice</SelectItem>
                      <SelectItem value="30_days">30 Days Notice</SelectItem>
                      <SelectItem value="not_available">Not Available</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="location">Location *</Label>
                  <Input
                    id="location"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="San Francisco, CA"
                    maxLength={200}
                  />
                </div>
                <div className="flex items-center gap-6">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isRemoteOk}
                      onCheckedChange={(c) => setIsRemoteOk(c === true)}
                    />
                    <span>Open to Remote</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={willingToRelocate}
                      onCheckedChange={(c) => setWillingToRelocate(c === true)}
                    />
                    <span>Willing to Relocate</span>
                  </label>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="minRate">Minimum Rate ($/hr)</Label>
                    <Input
                      id="minRate"
                      type="number"
                      min={0}
                      value={minimumHourlyRate ?? ''}
                      onChange={(e) =>
                        setMinimumHourlyRate(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      placeholder="85"
                    />
                  </div>
                  <div>
                    <Label htmlFor="maxRate">Desired Rate ($/hr)</Label>
                    <Input
                      id="maxRate"
                      type="number"
                      min={0}
                      value={desiredHourlyRate ?? ''}
                      onChange={(e) =>
                        setDesiredHourlyRate(e.target.value ? parseInt(e.target.value) : undefined)
                      }
                      placeholder="110"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Step 5: Documents & Source */}
            {step === 5 && (
              <div className="space-y-4">
                <div>
                  <Label>Lead Source *</Label>
                  <Select value={leadSource} onValueChange={setLeadSource}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select source" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="linkedin">LinkedIn</SelectItem>
                      <SelectItem value="indeed">Indeed</SelectItem>
                      <SelectItem value="dice">Dice</SelectItem>
                      <SelectItem value="monster">Monster</SelectItem>
                      <SelectItem value="referral">Employee Referral</SelectItem>
                      <SelectItem value="direct">Direct Application</SelectItem>
                      <SelectItem value="agency">Agency/Partner</SelectItem>
                      <SelectItem value="job_board">Other Job Board</SelectItem>
                      <SelectItem value="other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="sourceDetails">Source Details</Label>
                  <Input
                    id="sourceDetails"
                    value={sourceDetails}
                    onChange={(e) => setSourceDetails(e.target.value)}
                    placeholder="e.g., Found via LinkedIn Recruiter search"
                    maxLength={500}
                  />
                </div>
                <div className="border-t pt-4 mt-4">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <Checkbox
                      checked={isOnHotlist}
                      onCheckedChange={(c) => setIsOnHotlist(c === true)}
                    />
                    <span className="font-medium">Add to Hotlist</span>
                  </label>
                  <p className="text-sm text-charcoal-500 mt-1">
                    Mark as high-priority candidate for immediate attention
                  </p>
                  {isOnHotlist && (
                    <Textarea
                      className="mt-2"
                      value={hotlistNotes}
                      onChange={(e) => setHotlistNotes(e.target.value)}
                      placeholder="Hotlist notes (visible to all recruiters)..."
                      rows={3}
                      maxLength={500}
                    />
                  )}
                </div>
              </div>
            )}
          </CardContent>

          {/* Footer */}
          <div className="flex justify-between px-6 pb-6">
            <div>
              {step > 1 && (
                <Button type="button" variant="outline" onClick={handleBack}>
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back
                </Button>
              )}
            </div>
            <div className="flex gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => router.push('/employee/recruiting/candidates')}
              >
                Cancel
              </Button>
              {step < 5 ? (
                <Button onClick={handleNext}>
                  Next
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              ) : (
                <Button onClick={handleSubmit} disabled={createMutation.isPending}>
                  {createMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  Add Candidate
                </Button>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
