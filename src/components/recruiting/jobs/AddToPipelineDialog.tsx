'use client'

import { useState, useCallback } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { trpc } from '@/lib/trpc/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Loader2,
  Search,
  UserPlus,
  Star,
  CheckCircle,
  MapPin,
  Briefcase,
  X,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDebouncedCallback } from 'use-debounce'

// Form validation schema
const addToPipelineSchema = z.object({
  candidateId: z.string().uuid('Please select a candidate'),
  matchExplanation: z.string().max(1000).optional(),
  recruiterMatchScore: z.number().min(0).max(100).optional(),
})

type AddToPipelineFormData = z.infer<typeof addToPipelineSchema>

interface Candidate {
  id: string
  name: string
  email: string
  phone?: string
  status?: string
  skills?: string
  title?: string
  location?: string
}

interface AddToPipelineDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobId: string
  jobTitle: string
  accountName: string
  onSuccess?: () => void
}

export function AddToPipelineDialog({
  open,
  onOpenChange,
  jobId,
  jobTitle,
  accountName,
  onSuccess,
}: AddToPipelineDialogProps) {
  const { toast } = useToast()
  const [step, setStep] = useState<'search' | 'confirm'>('search')
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCandidate, setSelectedCandidate] = useState<Candidate | null>(null)

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<AddToPipelineFormData>({
    resolver: zodResolver(addToPipelineSchema),
    defaultValues: {
      candidateId: '',
      matchExplanation: '',
      recruiterMatchScore: undefined,
    },
  })

  // Search candidates
  const searchResults = trpc.ats.candidates.search.useQuery(
    { query: searchQuery, limit: 10 },
    { enabled: searchQuery.length >= 2 }
  )

  // Debounced search handler
  const handleSearchChange = useDebouncedCallback((value: string) => {
    setSearchQuery(value)
  }, 300)

  // Create submission mutation
  const createSubmissionMutation = trpc.ats.submissions.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Candidate added to pipeline',
        description: `${selectedCandidate?.name} has been added to the pipeline for ${jobTitle}`,
      })
      handleClose()
      onSuccess?.()
    },
    onError: (error) => {
      toast({
        title: 'Failed to add candidate',
        description: error.message,
        variant: 'error',
      })
    },
  })

  const handleSelectCandidate = useCallback((candidate: Candidate) => {
    setSelectedCandidate(candidate)
    setValue('candidateId', candidate.id)
    setStep('confirm')
  }, [setValue])

  const onSubmit = (data: AddToPipelineFormData) => {
    createSubmissionMutation.mutate({
      jobId,
      candidateId: data.candidateId,
      status: 'sourced',
      matchExplanation: data.matchExplanation || undefined,
      recruiterMatchScore: data.recruiterMatchScore,
    })
  }

  const handleClose = () => {
    reset()
    setStep('search')
    setSearchQuery('')
    setSelectedCandidate(null)
    onOpenChange(false)
  }

  const handleBack = () => {
    setStep('search')
    setSelectedCandidate(null)
    setValue('candidateId', '')
  }

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5 text-gold-500" />
            Add to Pipeline
          </DialogTitle>
          <DialogDescription>
            Add a candidate to{' '}
            <span className="font-medium text-charcoal-900">{jobTitle}</span> at{' '}
            <span className="font-medium text-charcoal-900">{accountName}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Progress Indicator */}
        <div className="flex items-center gap-2 py-2">
          {['search', 'confirm'].map((s, i) => (
            <div key={s} className="flex items-center flex-1">
              <div
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium',
                  step === s
                    ? 'bg-hublot-900 text-white'
                    : ['search', 'confirm'].indexOf(step) > i
                    ? 'bg-green-100 text-green-800'
                    : 'bg-charcoal-100 text-charcoal-500'
                )}
              >
                {['search', 'confirm'].indexOf(step) > i ? (
                  <CheckCircle className="w-4 h-4" />
                ) : (
                  i + 1
                )}
              </div>
              {i < 1 && (
                <div
                  className={cn(
                    'flex-1 h-1 mx-2',
                    ['search', 'confirm'].indexOf(step) > i
                      ? 'bg-green-400'
                      : 'bg-charcoal-200'
                  )}
                />
              )}
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Step 1: Search */}
          {step === 'search' && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Find Candidate</h3>

              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
                <Input
                  placeholder="Search by name, email, or skills..."
                  className="pl-10"
                  onChange={(e) => handleSearchChange(e.target.value)}
                  autoFocus
                />
              </div>

              {/* Search Results */}
              <ScrollArea className="h-[300px]">
                <div className="space-y-2 pr-4">
                  {searchQuery.length < 2 ? (
                    <div className="text-center text-charcoal-500 py-8">
                      Type at least 2 characters to search
                    </div>
                  ) : searchResults.isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
                    </div>
                  ) : searchResults.data?.length === 0 ? (
                    <div className="text-center text-charcoal-500 py-8">
                      No candidates found
                    </div>
                  ) : (
                    searchResults.data?.map((candidate) => (
                      <Card
                        key={candidate.id}
                        className={cn(
                          'cursor-pointer transition-colors hover:border-gold-500',
                          selectedCandidate?.id === candidate.id && 'border-gold-500 bg-gold-50'
                        )}
                        onClick={() => handleSelectCandidate(candidate)}
                      >
                        <CardContent className="p-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1 min-w-0">
                              <div className="font-medium text-charcoal-900 truncate">
                                {candidate.name}
                              </div>
                              <div className="text-sm text-charcoal-500 truncate">
                                {candidate.email}
                              </div>
                              {candidate.title && (
                                <div className="flex items-center gap-1 mt-1 text-sm text-charcoal-600">
                                  <Briefcase className="w-3 h-3" />
                                  {candidate.title}
                                </div>
                              )}
                              {candidate.location && (
                                <div className="flex items-center gap-1 mt-0.5 text-sm text-charcoal-500">
                                  <MapPin className="w-3 h-3" />
                                  {candidate.location}
                                </div>
                              )}
                              {candidate.skills && (
                                <div className="flex flex-wrap gap-1 mt-2">
                                  {candidate.skills.split(',').slice(0, 3).map((skill: string) => (
                                    <Badge key={skill.trim()} variant="secondary" className="text-xs">
                                      {skill.trim()}
                                    </Badge>
                                  ))}
                                  {candidate.skills.split(',').length > 3 && (
                                    <Badge variant="outline" className="text-xs">
                                      +{candidate.skills.split(',').length - 3}
                                    </Badge>
                                  )}
                                </div>
                              )}
                            </div>
                            <Badge variant="outline" className="ml-2 shrink-0">
                              {candidate.status || 'Active'}
                            </Badge>
                          </div>
                        </CardContent>
                      </Card>
                    ))
                  )}
                </div>
              </ScrollArea>
            </div>
          )}

          {/* Step 2: Confirm */}
          {step === 'confirm' && selectedCandidate && (
            <div className="space-y-4">
              <h3 className="font-medium text-charcoal-900">Confirm Selection</h3>

              {/* Selected Candidate */}
              <Card className="bg-cream">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-medium text-charcoal-900">
                        {selectedCandidate.name}
                      </div>
                      <div className="text-sm text-charcoal-500">
                        {selectedCandidate.email}
                      </div>
                      {selectedCandidate.title && (
                        <div className="text-sm text-charcoal-600 mt-1">
                          {selectedCandidate.title}
                        </div>
                      )}
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleBack}
                      className="text-charcoal-500"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Match Score (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="recruiterMatchScore">Match Score (Optional)</Label>
                <div className="flex items-center gap-3">
                  <Input
                    id="recruiterMatchScore"
                    type="number"
                    min={0}
                    max={100}
                    placeholder="0-100"
                    className="w-24"
                    {...register('recruiterMatchScore', { valueAsNumber: true })}
                  />
                  <span className="text-sm text-charcoal-500">/ 100</span>
                  <div className="flex items-center gap-1 text-gold-500">
                    <Star className="w-4 h-4 fill-current" />
                    <span className="text-xs">Recruiter rating</span>
                  </div>
                </div>
                {errors.recruiterMatchScore && (
                  <p className="text-sm text-red-500">{errors.recruiterMatchScore.message}</p>
                )}
              </div>

              {/* Match Explanation (Optional) */}
              <div className="space-y-2">
                <Label htmlFor="matchExplanation">Why is this a good match? (Optional)</Label>
                <Textarea
                  id="matchExplanation"
                  {...register('matchExplanation')}
                  placeholder="Relevant experience, skill alignment, availability..."
                  rows={3}
                  className="resize-none"
                />
                {errors.matchExplanation && (
                  <p className="text-sm text-red-500">{errors.matchExplanation.message}</p>
                )}
              </div>

              {/* Summary */}
              <div className="bg-blue-50 rounded-lg p-3 text-sm text-blue-700">
                <p>
                  <strong>{selectedCandidate.name}</strong> will be added to the pipeline for{' '}
                  <strong>{jobTitle}</strong> in the <strong>Sourced</strong> stage.
                </p>
              </div>
            </div>
          )}

          <DialogFooter className="flex justify-between">
            {step === 'confirm' && (
              <Button type="button" variant="outline" onClick={handleBack}>
                Back
              </Button>
            )}
            <div className="flex gap-2 ml-auto">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              {step === 'confirm' && (
                <Button type="submit" disabled={createSubmissionMutation.isPending}>
                  {createSubmissionMutation.isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Adding...
                    </>
                  ) : (
                    <>
                      <UserPlus className="w-4 h-4 mr-2" />
                      Add to Pipeline
                    </>
                  )}
                </Button>
              )}
            </div>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
