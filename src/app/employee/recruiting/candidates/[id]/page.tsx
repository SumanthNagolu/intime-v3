'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Skeleton } from '@/components/ui/skeleton'
import { useToast } from '@/components/ui/use-toast'
import {
  Star,
  Edit,
  MoreHorizontal,
  MapPin,
  DollarSign,
  Clock,
  Mail,
  Phone,
  Linkedin,
  Send,
  GraduationCap,
  FileText,
  Loader2,
  ClipboardCheck,
  Play,
  CheckCircle,
  XCircle,
  Download,
} from 'lucide-react'
import { ScreeningRoom } from '@/components/recruiting/candidates/ScreeningRoom'
import { ProfileBuilder } from '@/components/recruiting/candidates/ProfileBuilder'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'
import { formatDistanceToNow } from 'date-fns'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

type CandidateStatus = 'active' | 'sourced' | 'screening' | 'bench' | 'placed' | 'inactive' | 'archived'

const STATUS_CONFIG: Record<CandidateStatus, { label: string; color: string }> = {
  active: { label: 'Active', color: 'bg-green-100 text-green-800 border-green-200' },
  sourced: { label: 'Sourced', color: 'bg-amber-100 text-amber-800 border-amber-200' },
  screening: { label: 'Screening', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  bench: { label: 'Bench', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  placed: { label: 'Placed', color: 'bg-indigo-100 text-indigo-800 border-indigo-200' },
  inactive: { label: 'Inactive', color: 'bg-charcoal-100 text-charcoal-600 border-charcoal-200' },
  archived: { label: 'Archived', color: 'bg-charcoal-100 text-charcoal-500 border-charcoal-200' },
}

const VISA_CONFIG: Record<string, { label: string; color: string }> = {
  us_citizen: { label: 'US Citizen', color: 'bg-green-100 text-green-700' },
  green_card: { label: 'Green Card', color: 'bg-green-100 text-green-700' },
  h1b: { label: 'H1B', color: 'bg-blue-100 text-blue-700' },
  l1: { label: 'L1', color: 'bg-blue-100 text-blue-700' },
  tn: { label: 'TN', color: 'bg-purple-100 text-purple-700' },
  opt: { label: 'OPT', color: 'bg-amber-100 text-amber-700' },
  cpt: { label: 'CPT', color: 'bg-amber-100 text-amber-700' },
  ead: { label: 'EAD', color: 'bg-cyan-100 text-cyan-700' },
  other: { label: 'Other', color: 'bg-charcoal-100 text-charcoal-600' },
}

const AVAILABILITY_CONFIG: Record<string, string> = {
  immediate: 'Immediate',
  '2_weeks': '2 Weeks Notice',
  '30_days': '30 Days Notice',
  not_available: 'Not Available',
}

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const candidateId = params.id as string

  const [activeTab, setActiveTab] = useState('overview')
  const [showStartScreeningDialog, setShowStartScreeningDialog] = useState(false)
  const [selectedJobForScreening, setSelectedJobForScreening] = useState<string | null>(null)
  const [activeScreeningId, setActiveScreeningId] = useState<string | null>(null)
  const [showScreeningRoom, setShowScreeningRoom] = useState(false)
  const [showProfileBuilder, setShowProfileBuilder] = useState(false)

  // Queries
  const candidateQuery = trpc.ats.candidates.getById.useQuery({ id: candidateId })

  // Get candidate's screenings
  const screeningsQuery = trpc.ats.candidates.getCandidateScreenings.useQuery({ candidateId })

  // Get jobs for screening selection (jobs the candidate is submitted to)
  const jobsForScreeningQuery = trpc.ats.jobs.list.useQuery({
    status: 'open',
    limit: 100
  })

  // Get candidate's profiles
  const profilesQuery = trpc.ats.candidates.getCandidateProfiles.useQuery({ candidateId })

  const utils = trpc.useUtils()

  // Mutations
  const addToHotlistMutation = trpc.ats.candidates.addToHotlist.useMutation({
    onSuccess: () => {
      utils.ats.candidates.getById.invalidate({ id: candidateId })
      toast({ title: 'Added to hotlist' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const removeFromHotlistMutation = trpc.ats.candidates.removeFromHotlist.useMutation({
    onSuccess: () => {
      utils.ats.candidates.getById.invalidate({ id: candidateId })
      toast({ title: 'Removed from hotlist' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const startScreeningMutation = trpc.ats.candidates.startScreening.useMutation({
    onSuccess: (data) => {
      setActiveScreeningId(data.screeningId)
      setShowStartScreeningDialog(false)
      setShowScreeningRoom(true)
      setActiveTab('screening')
      screeningsQuery.refetch()
      toast({ title: 'Screening started' })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  const candidate = candidateQuery.data
  const screenings = screeningsQuery.data || []
  const jobs = jobsForScreeningQuery.data?.items || []
  const profiles = profilesQuery.data || []

  // Find active/in-progress screening
  const activeScreening = screenings.find((s: { status: string }) => s.status === 'in_progress')
  const completedScreenings = screenings.filter((s: { status: string }) => s.status === 'completed')

  // Listen for dialog events from sidebar quick actions
  useEffect(() => {
    const handleOpenDialog = (event: CustomEvent<{ dialogId: string }>) => {
      const { dialogId } = event.detail
      switch (dialogId) {
        case 'startScreening':
          setShowStartScreeningDialog(true)
          break
        case 'submitToJob':
          // Would open submit to job dialog
          break
        case 'logActivity':
          // Would open log activity dialog
          break
      }
    }

    window.addEventListener('openCandidateDialog', handleOpenDialog as EventListener)
    return () => {
      window.removeEventListener('openCandidateDialog', handleOpenDialog as EventListener)
    }
  }, [])

  // Loading handled by layout
  if (candidateQuery.isLoading || !candidate) {
    return (
      <div className="p-6">
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  const statusConfig = STATUS_CONFIG[candidate.status as CandidateStatus] || STATUS_CONFIG.active
  const visaConfig = VISA_CONFIG[candidate.visa_status] || VISA_CONFIG.other
  const skills = candidate.skills || []
  const submissions = candidate.submissions || []

  const handleToggleHotlist = () => {
    if (candidate.is_on_hotlist) {
      removeFromHotlistMutation.mutate({ candidateId })
    } else {
      addToHotlistMutation.mutate({ candidateId })
    }
  }

  const handleStartScreening = () => {
    if (!selectedJobForScreening) {
      toast({ title: 'Please select a job', variant: 'error' })
      return
    }
    startScreeningMutation.mutate({
      candidateId,
      jobId: selectedJobForScreening,
    })
  }

  const handleResumeScreening = (screeningId: string) => {
    setActiveScreeningId(screeningId)
    setShowScreeningRoom(true)
  }

  const handleScreeningComplete = () => {
    setShowScreeningRoom(false)
    setActiveScreeningId(null)
    screeningsQuery.refetch()
  }

  // If we're showing the screening room, render it instead
  if (showScreeningRoom) {
    return (
      <ScreeningRoom
        candidateId={candidateId}
        candidateName={`${candidate?.first_name} ${candidate?.last_name}`}
        jobId={selectedJobForScreening || undefined}
        existingScreeningId={activeScreeningId || undefined}
        onComplete={handleScreeningComplete}
        onCancel={() => {
          setShowScreeningRoom(false)
          setActiveScreeningId(null)
        }}
      />
    )
  }

  // If we're showing the profile builder, render it instead
  if (showProfileBuilder) {
    return (
      <ProfileBuilder
        candidateId={candidateId}
        candidateName={`${candidate?.first_name} ${candidate?.last_name}`}
        onClose={() => setShowProfileBuilder(false)}
        onSave={() => {
          profilesQuery.refetch()
        }}
      />
    )
  }

  return (
    <div className="p-6 space-y-6">
      {/* Quick Action Bar - compact horizontal actions */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4 text-sm text-charcoal-500">
          {candidate.email && (
            <a href={`mailto:${candidate.email}`} className="flex items-center gap-1 hover:text-hublot-900">
              <Mail className="w-4 h-4" />
              {candidate.email}
            </a>
          )}
          {candidate.phone && (
            <a href={`tel:${candidate.phone}`} className="flex items-center gap-1 hover:text-hublot-900">
              <Phone className="w-4 h-4" />
              {candidate.phone}
            </a>
          )}
          {candidate.linkedin_url && (
            <a
              href={candidate.linkedin_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 hover:text-hublot-900"
            >
              <Linkedin className="w-4 h-4" />
              LinkedIn
            </a>
          )}
          {candidate.location && (
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {candidate.location}
              {candidate.is_remote_ok && ' (Remote OK)'}
            </span>
          )}
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2">
          {activeScreening ? (
            <Button
              onClick={() => handleResumeScreening(activeScreening.id)}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              <Play className="w-4 h-4 mr-2" />
              Resume Screening
            </Button>
          ) : (
            <Button
              onClick={() => setShowStartScreeningDialog(true)}
              variant="outline"
            >
              <ClipboardCheck className="w-4 h-4 mr-2" />
              Start Screening
            </Button>
          )}
          <Button
            variant={candidate.is_on_hotlist ? 'default' : 'outline'}
            onClick={handleToggleHotlist}
            disabled={addToHotlistMutation.isPending || removeFromHotlistMutation.isPending}
            className={candidate.is_on_hotlist ? 'bg-gold-500 hover:bg-gold-600 text-white' : ''}
          >
            {(addToHotlistMutation.isPending || removeFromHotlistMutation.isPending) ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Star className={cn('w-4 h-4 mr-2', candidate.is_on_hotlist && 'fill-white')} />
            )}
            {candidate.is_on_hotlist ? 'On Hotlist' : 'Add to Hotlist'}
          </Button>
          <Button variant="outline">
            <Send className="w-4 h-4 mr-2" />
            Submit to Job
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="icon">
                <MoreHorizontal className="w-4 h-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Edit className="w-4 h-4 mr-2" />
                Edit Candidate
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setShowProfileBuilder(true)}>
                <FileText className="w-4 h-4 mr-2" />
                Prepare Profile
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleToggleHotlist}>
                <Star className="w-4 h-4 mr-2" />
                {candidate.is_on_hotlist ? 'Remove from Hotlist' : 'Add to Hotlist'}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Experience</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900 mt-1">
                {candidate.experience_years ?? 0} years
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <DollarSign className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Desired Rate</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900 mt-1">
                {candidate.desired_rate ? `$${candidate.desired_rate}/hr` : 'TBD'}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Send className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Submissions</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900 mt-1">
                {submissions.length}
              </div>
            </CardContent>
          </Card>
          <Card className="bg-white">
            <CardContent className="pt-6">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-charcoal-400" />
                <span className="text-sm text-charcoal-500">Availability</span>
              </div>
              <div className="text-2xl font-bold text-charcoal-900 mt-1">
                {AVAILABILITY_CONFIG[candidate.availability] || 'Unknown'}
              </div>
            </CardContent>
          </Card>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="bg-white mb-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="screening">
              Screening
              {screenings.length > 0 && (
                <Badge className="ml-2 bg-charcoal-100 text-charcoal-700">
                  {screenings.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="profiles">
              Profiles
              {profiles.length > 0 && (
                <Badge className="ml-2 bg-charcoal-100 text-charcoal-700">
                  {profiles.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="submissions">Submissions ({submissions.length})</TabsTrigger>
            <TabsTrigger value="activity">Activity</TabsTrigger>
          </TabsList>

          <TabsContent value="overview">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Main content */}
              <div className="lg:col-span-2 space-y-6">
                {/* Professional Summary */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Professional Summary</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {candidate.summary ? (
                      <div className="prose prose-sm max-w-none text-charcoal-700 whitespace-pre-wrap">
                        {candidate.summary}
                      </div>
                    ) : (
                      <p className="text-charcoal-500 italic">No summary provided</p>
                    )}
                  </CardContent>
                </Card>

                {/* Skills */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Skills</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {skills.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {skills.map((skill: { skill_name: string }) => (
                          <Badge key={skill.skill_name} variant="secondary">
                            {skill.skill_name}
                          </Badge>
                        ))}
                      </div>
                    ) : (
                      <p className="text-charcoal-500 italic">No skills listed</p>
                    )}
                  </CardContent>
                </Card>

                {/* Hotlist Notes */}
                {candidate.is_on_hotlist && candidate.hotlist_notes && (
                  <Card className="bg-white border-gold-200">
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <Star className="w-4 h-4 text-gold-500" />
                        Hotlist Notes
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-charcoal-700 whitespace-pre-wrap">
                        {candidate.hotlist_notes}
                      </p>
                    </CardContent>
                  </Card>
                )}
              </div>

              {/* Sidebar */}
              <div className="space-y-6">
                {/* Details */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Details</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-500">Visa Status</span>
                      <Badge className={visaConfig.color}>{visaConfig.label}</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-500">Availability</span>
                      <span className="text-sm font-medium">
                        {AVAILABILITY_CONFIG[candidate.availability] || 'Unknown'}
                      </span>
                    </div>
                    {candidate.minimum_rate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-charcoal-500">Min Rate</span>
                        <span className="text-sm font-medium">${candidate.minimum_rate}/hr</span>
                      </div>
                    )}
                    {candidate.desired_rate && (
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-charcoal-500">Desired Rate</span>
                        <span className="text-sm font-medium">${candidate.desired_rate}/hr</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-500">Remote OK</span>
                      <span className="text-sm font-medium">{candidate.is_remote_ok ? 'Yes' : 'No'}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-500">Will Relocate</span>
                      <span className="text-sm font-medium">{candidate.willing_to_relocate ? 'Yes' : 'No'}</span>
                    </div>
                  </CardContent>
                </Card>

                {/* Source Info */}
                <Card className="bg-white">
                  <CardHeader>
                    <CardTitle>Source</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-500">Lead Source</span>
                      <span className="text-sm font-medium capitalize">
                        {candidate.lead_source?.replace(/_/g, ' ') || 'Unknown'}
                      </span>
                    </div>
                    {candidate.source_details && (
                      <div>
                        <span className="text-sm text-charcoal-500">Details</span>
                        <p className="text-sm text-charcoal-700 mt-1">{candidate.source_details}</p>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-charcoal-500">Added</span>
                      <span className="text-sm font-medium">
                        {candidate.created_at
                          ? formatDistanceToNow(new Date(candidate.created_at), { addSuffix: true })
                          : 'Unknown'}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="screening">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Screening History</CardTitle>
                <Button size="sm" onClick={() => setShowStartScreeningDialog(true)}>
                  <ClipboardCheck className="w-4 h-4 mr-2" />
                  Start New Screening
                </Button>
              </CardHeader>
              <CardContent>
                {screenings.length === 0 ? (
                  <div className="text-center py-8">
                    <ClipboardCheck className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
                    <h3 className="text-lg font-medium text-charcoal-900 mb-2">No screenings yet</h3>
                    <p className="text-charcoal-500 mb-4">
                      Start a phone screening to evaluate this candidate
                    </p>
                    <Button onClick={() => setShowStartScreeningDialog(true)}>
                      <ClipboardCheck className="w-4 h-4 mr-2" />
                      Start Screening
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {screenings.map((screening: any) => (
                      <div
                        key={screening.id}
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg cursor-pointer hover:bg-charcoal-50 transition-colors",
                          screening.status === 'in_progress' && "border-blue-300 bg-blue-50/50"
                        )}
                        onClick={() => {
                          if (screening.status === 'in_progress') {
                            handleResumeScreening(screening.id)
                          }
                        }}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            screening.status === 'completed'
                              ? screening.recommendation === 'submit'
                                ? "bg-green-100"
                                : screening.recommendation === 'reject'
                                  ? "bg-red-100"
                                  : "bg-amber-100"
                              : "bg-blue-100"
                          )}>
                            {screening.status === 'completed' ? (
                              screening.recommendation === 'submit' ? (
                                <CheckCircle className="w-5 h-5 text-green-600" />
                              ) : screening.recommendation === 'reject' ? (
                                <XCircle className="w-5 h-5 text-red-600" />
                              ) : (
                                <ClipboardCheck className="w-5 h-5 text-amber-600" />
                              )
                            ) : (
                              <Play className="w-5 h-5 text-blue-600" />
                            )}
                          </div>
                          <div>
                            <h4 className="font-medium text-charcoal-900">
                              {Array.isArray(screening.job) ? screening.job[0]?.title : screening.job?.title || 'General Screening'}
                            </h4>
                            <p className="text-sm text-charcoal-500">
                              Started {formatDistanceToNow(new Date(screening.started_at), { addSuffix: true })}
                              {screening.completed_at && (
                                <> • Completed {formatDistanceToNow(new Date(screening.completed_at), { addSuffix: true })}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {screening.knockout_passed !== null && (
                            <Badge className={screening.knockout_passed ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}>
                              {screening.knockout_passed ? 'Knockout Passed' : 'Knockout Failed'}
                            </Badge>
                          )}
                          {screening.overall_score !== null && (
                            <Badge variant="outline" className="font-mono">
                              Score: {screening.overall_score.toFixed(1)}
                            </Badge>
                          )}
                          <Badge className={cn(
                            screening.status === 'in_progress'
                              ? "bg-blue-100 text-blue-700"
                              : screening.recommendation === 'submit'
                                ? "bg-green-100 text-green-700"
                                : screening.recommendation === 'submit_with_reservations'
                                  ? "bg-amber-100 text-amber-700"
                                  : screening.recommendation === 'reject'
                                    ? "bg-red-100 text-red-700"
                                    : "bg-charcoal-100 text-charcoal-700"
                          )}>
                            {screening.status === 'in_progress'
                              ? 'In Progress'
                              : screening.recommendation?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase()) || 'Unknown'}
                          </Badge>
                          {screening.status === 'in_progress' && (
                            <Button
                              size="sm"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleResumeScreening(screening.id)
                              }}
                            >
                              Resume
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profiles">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Candidate Profiles</CardTitle>
                <Button size="sm" onClick={() => setShowProfileBuilder(true)}>
                  <FileText className="w-4 h-4 mr-2" />
                  Create Profile
                </Button>
              </CardHeader>
              <CardContent>
                {profiles.length === 0 ? (
                  <div className="text-center py-8">
                    <FileText className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
                    <h3 className="text-lg font-medium text-charcoal-900 mb-2">No profiles yet</h3>
                    <p className="text-charcoal-500 mb-4">
                      Create a formatted profile to submit to clients
                    </p>
                    <Button onClick={() => setShowProfileBuilder(true)}>
                      <FileText className="w-4 h-4 mr-2" />
                      Create Profile
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {profiles.map((profile: any) => (
                      <div
                        key={profile.id}
                        className={cn(
                          "flex items-center justify-between p-4 border rounded-lg hover:bg-charcoal-50 transition-colors",
                          profile.status === 'finalized' && "border-green-300 bg-green-50/50"
                        )}
                      >
                        <div className="flex items-center gap-4">
                          <div className={cn(
                            "w-10 h-10 rounded-full flex items-center justify-center",
                            profile.status === 'finalized' ? "bg-green-100" : "bg-charcoal-100"
                          )}>
                            <FileText className={cn(
                              "w-5 h-5",
                              profile.status === 'finalized' ? "text-green-600" : "text-charcoal-600"
                            )} />
                          </div>
                          <div>
                            <h4 className="font-medium text-charcoal-900">
                              {Array.isArray(profile.job) ? profile.job[0]?.title : profile.job?.title || 'General Profile'}
                            </h4>
                            <p className="text-sm text-charcoal-500">
                              {profile.template_type} template • Created {formatDistanceToNow(new Date(profile.created_at), { addSuffix: true })}
                              {profile.finalized_at && (
                                <> • Finalized {formatDistanceToNow(new Date(profile.finalized_at), { addSuffix: true })}</>
                              )}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <Badge className={cn(
                            profile.status === 'finalized'
                              ? "bg-green-100 text-green-700"
                              : "bg-amber-100 text-amber-700"
                          )}>
                            {profile.status === 'finalized' ? 'Finalized' : 'Draft'}
                          </Badge>
                          {profile.status === 'draft' && (
                            <Button size="sm" variant="outline">
                              Edit
                            </Button>
                          )}
                          {profile.status === 'finalized' && (
                            <Button size="sm" variant="outline">
                              <Download className="w-4 h-4 mr-1" />
                              Export
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="submissions">
            <Card className="bg-white">
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Submissions</CardTitle>
                <Button size="sm">
                  <Send className="w-4 h-4 mr-2" />
                  Submit to Job
                </Button>
              </CardHeader>
              <CardContent>
                {submissions.length === 0 ? (
                  <div className="text-center py-8">
                    <Send className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
                    <h3 className="text-lg font-medium text-charcoal-900 mb-2">No submissions yet</h3>
                    <p className="text-charcoal-500 mb-4">
                      This candidate hasn&apos;t been submitted to any jobs
                    </p>
                    <Button>
                      <Send className="w-4 h-4 mr-2" />
                      Submit to Job
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {submissions.map((submission: {
                      id: string
                      job_id: string
                      status: string
                      created_at: string
                      job?: { title: string; account?: { name: string } }
                    }) => (
                      <div
                        key={submission.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:bg-charcoal-50 cursor-pointer"
                        onClick={() => router.push(`/employee/recruiting/submissions/${submission.id}`)}
                      >
                        <div>
                          <h4 className="font-medium text-charcoal-900">
                            {submission.job?.title || 'Unknown Job'}
                          </h4>
                          <p className="text-sm text-charcoal-500">
                            {submission.job?.account?.name || 'Unknown Client'} &bull;{' '}
                            {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                          </p>
                        </div>
                        <Badge variant="outline" className="capitalize">
                          {submission.status.replace(/_/g, ' ')}
                        </Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="activity">
            <Card className="bg-white">
              <CardHeader>
                <CardTitle>Activity Timeline</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Clock className="w-12 h-12 mx-auto text-charcoal-300 mb-4" />
                  <h3 className="text-lg font-medium text-charcoal-900 mb-2">No activity yet</h3>
                  <p className="text-charcoal-500">
                    Activity will be recorded here as you interact with this candidate
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

      {/* Start Screening Dialog */}
      <Dialog open={showStartScreeningDialog} onOpenChange={setShowStartScreeningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Candidate Screening</DialogTitle>
            <DialogDescription>
              Select a job to screen {candidate?.first_name} {candidate?.last_name} for, or start a general screening.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-select">Select Job (Optional)</Label>
              <Select
                value={selectedJobForScreening || 'general'}
                onValueChange={(value) => setSelectedJobForScreening(value === 'general' ? null : value)}
              >
                <SelectTrigger id="job-select">
                  <SelectValue placeholder="Select a job or general screening" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="general">General Screening (No Job)</SelectItem>
                  {jobs.map((job: { id: string; title: string; account?: { name: string } }) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title} {job.account?.name && `- ${job.account.name}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="bg-charcoal-50 p-4 rounded-lg text-sm text-charcoal-600">
              <h4 className="font-medium text-charcoal-900 mb-2">Screening includes:</h4>
              <ul className="list-disc list-inside space-y-1">
                <li>Knockout questions (if job has them configured)</li>
                <li>Technical skills assessment (1-5 rating)</li>
                <li>Soft skills evaluation</li>
                <li>Overall recommendation</li>
              </ul>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStartScreeningDialog(false)}>
              Cancel
            </Button>
            <Button
              onClick={handleStartScreening}
              disabled={startScreeningMutation.isPending}
            >
              {startScreeningMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Starting...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 mr-2" />
                  Start Screening
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
