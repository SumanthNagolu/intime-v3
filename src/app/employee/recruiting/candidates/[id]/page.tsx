'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { CandidateWorkspace } from '@/components/workspaces/candidate/CandidateWorkspace'
import { useCandidateWorkspace } from '@/components/workspaces/candidate/CandidateWorkspaceProvider'
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
import { Loader2, Play } from 'lucide-react'

// Custom event handler types
declare global {
  interface WindowEventMap {
    openCandidateDialog: CustomEvent<{ dialogId: string; candidateId?: string }>
  }
}

export default function CandidateDetailPage() {
  const params = useParams()
  const candidateId = params.id as string
  const { data, refreshData } = useCandidateWorkspace()

  // Dialog/view states
  const [showStartScreeningDialog, setShowStartScreeningDialog] = useState(false)
  const [selectedJobForScreening, setSelectedJobForScreening] = useState<string | null>(null)
  const [activeScreeningId, setActiveScreeningId] = useState<string | null>(null)
  const [showScreeningRoom, setShowScreeningRoom] = useState(false)
  const [showProfileBuilder, setShowProfileBuilder] = useState(false)

  // Get jobs for screening selection (only loaded when dialog opens)
  const jobsForScreeningQuery = trpc.ats.jobs.list.useQuery(
    { status: 'open', limit: 100 },
    { enabled: showStartScreeningDialog }
  )
  const jobs = jobsForScreeningQuery.data?.items || []

  // Find active/in-progress screening from workspace data
  const activeScreening = data.screenings.find((s) => s.status === 'in_progress')

  // Mutations
  const startScreeningMutation = trpc.ats.candidates.startScreening.useMutation({
    onSuccess: (result) => {
      setActiveScreeningId(result.screeningId)
      setShowStartScreeningDialog(false)
      setShowScreeningRoom(true)
      refreshData()
      toast.success('Screening started')
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to start screening')
    },
  })

  // Listen for dialog events from sidebar quick actions
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
          // TODO: Show submit to job dialog
          break
        case 'addToHotlist':
          // TODO: Handle hotlist toggle
          break
        case 'viewResume':
          // TODO: Show resume viewer
          break
        case 'logActivity':
          // TODO: Show activity dialog
          break
        case 'markInactive':
          // TODO: Show mark inactive dialog
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
    refreshData()
  }

  // If we're showing the screening room, render it instead
  if (showScreeningRoom) {
    return (
      <ScreeningRoom
        candidateId={candidateId}
        candidateName={data.candidate.fullName}
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
        candidateName={data.candidate.fullName}
        onClose={() => setShowProfileBuilder(false)}
        onSave={() => {
          refreshData()
        }}
      />
    )
  }

  return (
    <>
      {/* Guidewire-style Candidate Workspace */}
      <CandidateWorkspace />

      {/* Start Screening Dialog */}
      <Dialog open={showStartScreeningDialog} onOpenChange={setShowStartScreeningDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Start Candidate Screening</DialogTitle>
            <DialogDescription>
              Select a job to screen {data.candidate.fullName} for, or start a general screening.
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
