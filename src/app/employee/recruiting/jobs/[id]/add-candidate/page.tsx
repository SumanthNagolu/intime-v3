'use client'

import { useState, useMemo } from 'react'
import { useParams, useRouter, useSearchParams } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'
import {
  ArrowLeft,
  Search,
  User,
  Users,
  Briefcase,
  Mail,
  Phone,
  Loader2,
  CheckCircle,
  Plus,
  Star,
  Clock,
  DollarSign,
  Sparkles,
  UserPlus,
  ChevronDown,
  ChevronUp,
  X,
  FileText,
} from 'lucide-react'
import Link from 'next/link'

// Candidate sources for quick add
const CANDIDATE_SOURCES = [
  { value: 'linkedin', label: 'LinkedIn' },
  { value: 'referral', label: 'Referral' },
  { value: 'job_board', label: 'Job Board' },
  { value: 'website', label: 'Company Website' },
  { value: 'cold_outreach', label: 'Cold Outreach' },
  { value: 'agency', label: 'Agency' },
  { value: 'other', label: 'Other' },
]

export default function AddCandidatePage() {
  const params = useParams()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const jobId = params.id as string

  // Check if a new candidate was just created (redirected from wizard)
  const newCandidateId = searchParams.get('newCandidateId')

  // State for selecting existing candidates
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(newCandidateId)
  const [submissionRate, setSubmissionRate] = useState('')
  const [submissionNotes, setSubmissionNotes] = useState('')
  const [rateType, setRateType] = useState<'hourly' | 'daily' | 'annual'>('hourly')

  // State for Quick Add form
  const [showQuickAdd, setShowQuickAdd] = useState(false)
  const [quickAddData, setQuickAddData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    currentTitle: '',
    skills: [] as string[],
    source: 'linkedin',
  })
  const [newSkill, setNewSkill] = useState('')

  // Fetch job details
  const jobQuery = trpc.ats.jobs.getById.useQuery({ id: jobId })
  const job = jobQuery.data

  // Fetch candidates from user_profiles (with candidateOnly filter)
  const candidatesQuery = trpc.users.list.useQuery({
    candidateOnly: true, // Only users with candidate_status set (talent pool)
    pageSize: 100,
  })
  const candidates = candidatesQuery.data?.items || []

  // Use candidates if available, otherwise show message
  const displayCandidates = candidates.length > 0 ? candidates : []

  // Helper to get candidate display name
  const getCandidateName = (candidate: typeof candidates[0]) => {
    return candidate.full_name || candidate.email || 'Unknown'
  }

  // Filter candidates based on search
  const filteredCandidates = useMemo(() => {
    if (!searchQuery.trim()) return displayCandidates
    const query = searchQuery.toLowerCase()
    return displayCandidates.filter(
      (c) =>
        getCandidateName(c).toLowerCase().includes(query) ||
        c.email?.toLowerCase().includes(query) ||
        c.candidate_skills?.some((s: string) => s.toLowerCase().includes(query))
    )
  }, [displayCandidates, searchQuery])

  // Create submission mutation
  const createSubmissionMutation = trpc.ats.submissions.create.useMutation({
    onSuccess: () => {
      toast({ title: 'Candidate added to pipeline', description: 'Successfully added candidate to this job' })
      router.push(`/employee/recruiting/jobs/${jobId}?section=pipeline`)
    },
    onError: (error) => {
      toast({ title: 'Failed to add candidate', description: error.message, variant: 'destructive' })
    },
  })

  // Create candidate mutation
  const createCandidateMutation = trpc.users.createCandidate.useMutation({
    onSuccess: (data) => {
      toast({ title: 'Candidate created', description: 'Now adding to pipeline...' })
      // Add the new candidate to the pipeline
      createSubmissionMutation.mutate({
        jobId,
        candidateId: data.id,
        submittedRate: submissionRate ? parseFloat(submissionRate) : undefined,
        submittedRateType: rateType,
        submissionNotes: submissionNotes || undefined,
        status: 'sourced',
      })
    },
    onError: (error) => {
      toast({ title: 'Failed to create candidate', description: error.message, variant: 'destructive' })
    },
  })

  // Handle add existing candidate
  const handleAddCandidate = () => {
    if (!selectedCandidateId) {
      toast({ title: 'Select a candidate', description: 'Please select a candidate to add', variant: 'destructive' })
      return
    }

    createSubmissionMutation.mutate({
      jobId,
      candidateId: selectedCandidateId,
      submittedRate: submissionRate ? parseFloat(submissionRate) : undefined,
      submittedRateType: rateType,
      submissionNotes: submissionNotes || undefined,
      status: 'sourced',
    })
  }

  // Handle quick add new candidate
  const handleQuickAdd = () => {
    if (!quickAddData.firstName || !quickAddData.lastName || !quickAddData.email) {
      toast({ 
        title: 'Missing required fields', 
        description: 'Please fill in first name, last name, and email', 
        variant: 'destructive' 
      })
      return
    }

    createCandidateMutation.mutate({
      firstName: quickAddData.firstName,
      lastName: quickAddData.lastName,
      email: quickAddData.email,
      phone: quickAddData.phone || undefined,
      currentTitle: quickAddData.currentTitle || undefined,
      skills: quickAddData.skills.length > 0 ? quickAddData.skills : undefined,
      source: quickAddData.source,
    })
  }

  // Add skill to quick add form
  const handleAddSkill = () => {
    if (newSkill.trim() && !quickAddData.skills.includes(newSkill.trim())) {
      setQuickAddData(prev => ({
        ...prev,
        skills: [...prev.skills, newSkill.trim()]
      }))
      setNewSkill('')
    }
  }

  // Remove skill from quick add form
  const handleRemoveSkill = (skill: string) => {
    setQuickAddData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }))
  }

  const selectedCandidate = displayCandidates.find((c) => c.id === selectedCandidateId)
  const isLoading = createSubmissionMutation.isPending || createCandidateMutation.isPending

  return (
    <div className="p-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Link href={`/employee/recruiting/jobs/${jobId}?section=pipeline`}>
            <Button variant="ghost" size="icon">
              <ArrowLeft className="w-5 h-5" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-heading font-bold text-charcoal-900">Add Candidate</h1>
            <p className="text-charcoal-500">
              {job ? `Add candidate to ${job.title}` : 'Loading...'}
            </p>
          </div>
        </div>
        
        {/* Action Buttons */}
        <div className="flex items-center gap-3">
          <Button
            variant={showQuickAdd ? 'default' : 'outline'}
            onClick={() => setShowQuickAdd(!showQuickAdd)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Quick Add
            {showQuickAdd ? <ChevronUp className="w-4 h-4 ml-2" /> : <ChevronDown className="w-4 h-4 ml-2" />}
          </Button>
          <Link href={`/employee/recruiting/candidates/new?returnTo=/employee/recruiting/jobs/${jobId}/add-candidate`}>
            <Button variant="outline">
              <FileText className="w-4 h-4 mr-2" />
              Full Profile
            </Button>
          </Link>
        </div>
      </div>

      {/* Quick Add Form - Collapsible */}
      {showQuickAdd && (
        <Card className="mb-6 border-hublot-200 bg-hublot-50/30">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <UserPlus className="w-5 h-5 text-hublot-600" />
                  Quick Add New Candidate
                </CardTitle>
                <CardDescription>Rapidly source a new candidate and add them to this job</CardDescription>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setShowQuickAdd(false)}>
                <X className="w-4 h-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <Label>First Name *</Label>
                <Input
                  placeholder="John"
                  value={quickAddData.firstName}
                  onChange={(e) => setQuickAddData(prev => ({ ...prev, firstName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Last Name *</Label>
                <Input
                  placeholder="Smith"
                  value={quickAddData.lastName}
                  onChange={(e) => setQuickAddData(prev => ({ ...prev, lastName: e.target.value }))}
                />
              </div>
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  placeholder="john.smith@email.com"
                  value={quickAddData.email}
                  onChange={(e) => setQuickAddData(prev => ({ ...prev, email: e.target.value }))}
                />
              </div>
              <div>
                <Label>Phone</Label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={quickAddData.phone}
                  onChange={(e) => setQuickAddData(prev => ({ ...prev, phone: e.target.value }))}
                />
              </div>
              <div>
                <Label>Current Title</Label>
                <Input
                  placeholder="Senior Software Engineer"
                  value={quickAddData.currentTitle}
                  onChange={(e) => setQuickAddData(prev => ({ ...prev, currentTitle: e.target.value }))}
                />
              </div>
              <div>
                <Label>Source</Label>
                <Select 
                  value={quickAddData.source} 
                  onValueChange={(v) => setQuickAddData(prev => ({ ...prev, source: v }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {CANDIDATE_SOURCES.map(source => (
                      <SelectItem key={source.value} value={source.value}>
                        {source.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Skills */}
            <div className="mt-4">
              <Label>Skills</Label>
              <div className="flex gap-2 mt-1">
                <Input
                  placeholder="Add a skill (e.g., React, Python)"
                  value={newSkill}
                  onChange={(e) => setNewSkill(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                  className="flex-1"
                />
                <Button type="button" variant="outline" onClick={handleAddSkill}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              {quickAddData.skills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {quickAddData.skills.map((skill, idx) => (
                    <Badge key={idx} variant="secondary" className="flex items-center gap-1">
                      {skill}
                      <button
                        type="button"
                        onClick={() => handleRemoveSkill(skill)}
                        className="ml-1 hover:text-red-500"
                      >
                        <X className="w-3 h-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Quick Add Actions */}
            <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
              <Button variant="outline" onClick={() => setShowQuickAdd(false)}>
                Cancel
              </Button>
              <Button onClick={handleQuickAdd} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Creating...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Create & Add to Pipeline
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Candidate Search */}
        <div className="lg:col-span-2 space-y-6">
          {/* Search Bar */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Search Talent Pool
              </CardTitle>
              <CardDescription>Search by name, email, or skills</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder="Search candidates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
            </CardContent>
          </Card>

          {/* Candidate List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Available Candidates
                </span>
                <Badge variant="outline">{filteredCandidates.length} found</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {candidatesQuery.isLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin" />
                </div>
              ) : filteredCandidates.length === 0 ? (
                <div className="text-center py-8 text-charcoal-500">
                  <User className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
                  <p className="font-medium">No candidates in talent pool</p>
                  <p className="text-sm mt-1">Use Quick Add or Full Profile to add new candidates</p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setShowQuickAdd(true)}
                  >
                    <UserPlus className="w-4 h-4 mr-2" />
                    Quick Add Candidate
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-[500px] overflow-y-auto">
                  {filteredCandidates.map((candidate) => {
                    const isSelected = selectedCandidateId === candidate.id
                    return (
                      <div
                        key={candidate.id}
                        onClick={() => setSelectedCandidateId(candidate.id)}
                        className={cn(
                          'p-4 rounded-lg border cursor-pointer transition-all',
                          isSelected
                            ? 'border-hublot-500 bg-hublot-50 ring-2 ring-hublot-200'
                            : 'border-charcoal-200 hover:border-charcoal-300 hover:bg-charcoal-50'
                        )}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={cn(
                              'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                              isSelected ? 'bg-hublot-100' : 'bg-charcoal-100'
                            )}
                          >
                            {candidate.avatar_url ? (
                              <img
                                src={candidate.avatar_url}
                                alt=""
                                className="w-10 h-10 rounded-full object-cover"
                              />
                            ) : (
                              <User className={cn('w-5 h-5', isSelected ? 'text-hublot-700' : 'text-charcoal-500')} />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <p className="font-medium text-charcoal-900">{getCandidateName(candidate)}</p>
                              {isSelected && <CheckCircle className="w-4 h-4 text-hublot-600" />}
                            </div>
                            {candidate.email && (
                              <div className="flex items-center gap-1 text-sm text-charcoal-500">
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{candidate.email}</span>
                              </div>
                            )}
                            {candidate.candidate_skills && candidate.candidate_skills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {candidate.candidate_skills.slice(0, 4).map((skill: string, idx: number) => (
                                  <Badge key={idx} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                                {candidate.candidate_skills.length > 4 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{candidate.candidate_skills.length - 4}
                                  </Badge>
                                )}
                              </div>
                            )}
                            <div className="flex items-center gap-4 mt-2 text-xs text-charcoal-500">
                              {candidate.candidate_experience_years && (
                                <span className="flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {candidate.candidate_experience_years} yrs exp
                                </span>
                              )}
                              {candidate.candidate_hourly_rate && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="w-3 h-3" />
                                  ${candidate.candidate_hourly_rate}/hr
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Submission Details */}
        <div className="space-y-6">
          {/* Job Info Card */}
          {job && (
            <Card className="bg-charcoal-50">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <Briefcase className="w-4 h-4" />
                  Adding to Job
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="font-medium text-charcoal-900">{job.title}</p>
                {(job as any).clientCompany && (
                  <p className="text-sm text-charcoal-500">{(job as any).clientCompany.name}</p>
                )}
                <div className="flex flex-wrap gap-2 mt-3">
                  {job.location && (
                    <Badge variant="outline" className="text-xs">
                      {job.location}
                    </Badge>
                  )}
                  {(job as any).rate_min && (job as any).rate_max && (
                    <Badge variant="outline" className="text-xs">
                      ${(job as any).rate_min} - ${(job as any).rate_max}/hr
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Submission Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Plus className="w-5 h-5" />
                Submission Details
              </CardTitle>
              <CardDescription>Optional details for this submission</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {selectedCandidate && (
                <div className="p-3 bg-hublot-50 border border-hublot-200 rounded-lg">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-hublot-600" />
                    <span className="font-medium text-hublot-900">
                      {getCandidateName(selectedCandidate)}
                    </span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Submitted Rate</Label>
                  <Input
                    type="number"
                    placeholder="e.g., 75"
                    value={submissionRate}
                    onChange={(e) => setSubmissionRate(e.target.value)}
                    min={0}
                    step={5}
                  />
                </div>
                <div>
                  <Label>Rate Type</Label>
                  <Select value={rateType} onValueChange={(v) => setRateType(v as 'hourly' | 'daily' | 'annual')}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="annual">Annual</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="Why is this candidate a good fit for this role?"
                  value={submissionNotes}
                  onChange={(e) => setSubmissionNotes(e.target.value)}
                  rows={3}
                />
              </div>

              <div className="flex gap-3">
                <Link href={`/employee/recruiting/jobs/${jobId}?section=pipeline`} className="flex-1">
                  <Button variant="outline" className="w-full">
                    Cancel
                  </Button>
                </Link>
                <Button
                  onClick={handleAddCandidate}
                  disabled={!selectedCandidateId || isLoading}
                  className="flex-1"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" />
                      Add to Pipeline
                    </>
                  )}
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* AI Match Tip */}
          <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-purple-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-medium text-purple-900 mb-1">AI Matching Coming Soon</p>
                  <p className="text-sm text-purple-700">
                    Soon you'll be able to see AI-powered match scores to help find the best
                    candidates for this role.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
