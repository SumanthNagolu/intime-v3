'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { EntityDetailView } from '@/components/pcf/detail-view/EntityDetailView'
import { candidatesDetailConfig, Candidate } from '@/configs/entities/candidates.config'
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
import { Button } from '@/components/ui/button'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Loader2, Play, ClipboardCheck } from 'lucide-react'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openCandidateDialog: CustomEvent<{ dialogId: string; candidateId?: string }>
  }
}

export default function CandidateDetailPage() {
  const params = useParams()
  const router = useRouter()
  const candidateId = params.id as string

  // Dialog/view states
  const [showStartScreeningDialog, setShowStartScreeningDialog] = useState(false)
  const [selectedJobForScreening, setSelectedJobForScreening] = useState<string | null>(null)
  const [activeScreeningId, setActiveScreeningId] = useState<string | null>(null)
  const [showScreeningRoom, setShowScreeningRoom] = useState(false)
  const [showProfileBuilder, setShowProfileBuilder] = useState(false)
  const [showSubmitToJobDialog, setShowSubmitToJobDialog] = useState(false)

  const utils = trpc.useUtils()

  // Queries
  const candidateQuery = trpc.ats.candidates.getById.useQuery({ id: candidateId })
  const candidate = candidateQuery.data

  // Get candidate's screenings
  const screeningsQuery = trpc.ats.candidates.getCandidateScreenings.useQuery({ candidateId })

  // Get jobs for screening selection
  const jobsForScreeningQuery = trpc.ats.jobs.list.useQuery({
    status: 'open',
    limit: 100,
  })

  // Get candidate's profiles
  const profilesQuery = trpc.ats.candidates.getCandidateProfiles.useQuery({ candidateId })

  const screenings = screeningsQuery.data || []
  const jobs = jobsForScreeningQuery.data?.items || []

  // Find active/in-progress screening
  const activeScreening = screenings.find((s: { status: string }) => s.status === 'in_progress')

  // Mutations
  const startScreeningMutation = trpc.ats.candidates.startScreening.useMutation({
    onSuccess: (data) => {
      setActiveScreeningId(data.screeningId)
      setShowStartScreeningDialog(false)
      setShowScreeningRoom(true)
      screeningsQuery.refetch()
      toast.success('Screening started')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start screening')
    },
  })

  // Listen for dialog events from sidebar quick actions and PCF components
  useEffect(() => {
    const handleCandidateDialog = (
      event: CustomEvent<{ dialogId: string; candidateId?: string }>
    ) => {
      switch (event.detail.dialogId) {
        case 'startScreening':
          setShowStartScreeningDialog(true)
          break
        case 'resumeScreening':
          if (activeScreening) {
            setActiveScreeningId(activeScreening.id)
            setShowScreeningRoom(true)
          }
          break
        case 'createProfile':
          setShowProfileBuilder(true)
          break
        case 'submitToJob':
          setShowSubmitToJobDialog(true)
          break
        case 'addToHotlist':
          // Handled via mutation
          break
        case 'viewResume':
          // Show resume viewer
          break
        case 'logActivity':
          // Show activity dialog
          break
        case 'markInactive':
          // Show mark inactive dialog
          break
      }
    }

    window.addEventListener('openCandidateDialog', handleCandidateDialog)
    return () => window.removeEventListener('openCandidateDialog', handleCandidateDialog)
  }, [activeScreening])

  const handleStartScreening = () => {
    if (!selectedJobForScreening) {
      toast.error('Please select a job')
      return
    }
    startScreeningMutation.mutate({
      candidateId,
      jobId: selectedJobForScreening,
    })
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
    <>
      <EntityDetailView<Candidate>
        config={candidatesDetailConfig}
        entityId={candidateId}
      />

      {/* Start Screening Dialog */}
      <Dialog open={showStartScreeningDialog} onOpenChange={setShowStartScreeningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Candidate Screening</DialogTitle>
            <DialogDescription>
              Select a job to screen {candidate?.first_name} {candidate?.last_name} for, or start a
              general screening.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="job-select">Select Job (Optional)</Label>
              <Select
                value={selectedJobForScreening || 'general'}
                onValueChange={(value) =>
                  setSelectedJobForScreening(value === 'general' ? null : value)
                }
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
            <Button onClick={handleStartScreening} disabled={startScreeningMutation.isPending}>
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
    </>
  )
}
