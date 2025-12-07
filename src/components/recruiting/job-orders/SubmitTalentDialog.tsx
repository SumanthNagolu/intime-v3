'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Search, User, Briefcase, Calendar, DollarSign, AlertCircle } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface SubmitTalentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  jobOrderId: string
  jobOrderTitle: string
  requiredSkills?: string[]
  onSuccess?: () => void
}

const visaStatusColors: Record<string, string> = {
  'H1B': 'bg-blue-100 text-blue-800',
  'OPT': 'bg-purple-100 text-purple-800',
  'CPT': 'bg-indigo-100 text-indigo-800',
  'GC': 'bg-green-100 text-green-800',
  'USC': 'bg-emerald-100 text-emerald-800',
  'H4_EAD': 'bg-cyan-100 text-cyan-800',
  'L1': 'bg-orange-100 text-orange-800',
  'TN': 'bg-yellow-100 text-yellow-800',
}

const statusColors: Record<string, string> = {
  'available': 'bg-green-100 text-green-800',
  'placed': 'bg-blue-100 text-blue-800',
  'marketing': 'bg-purple-100 text-purple-800',
  'interviewing': 'bg-yellow-100 text-yellow-800',
  'onboarding': 'bg-amber-100 text-amber-800',
  'inactive': 'bg-charcoal-100 text-charcoal-800',
}

interface TalentItem {
  id: string
  status?: string
  visa_type?: string
  target_rate?: number
  years_experience?: number
  skills?: string[]
  candidate?: {
    id: string
    full_name?: string
    email?: string
    title?: string
  }
}

export function SubmitTalentDialog({
  open,
  onOpenChange,
  jobOrderId,
  jobOrderTitle,
  requiredSkills = [],
  onSuccess
}: SubmitTalentDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('available')
  const [selectedTalent, setSelectedTalent] = useState<string | null>(null)
  const [proposedRate, setProposedRate] = useState('')
  const [availabilityDate, setAvailabilityDate] = useState('')
  const [notes, setNotes] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch available talent
  const { data: talentData, isLoading: isLoadingTalent } = trpc.bench.talent.list.useQuery({
    status: statusFilter !== 'all' ? statusFilter as 'onboarding' | 'available' | 'marketing' | 'interviewing' | 'placed' | 'inactive' : undefined,
    search: searchQuery || undefined,
    limit: 50
  }, {
    enabled: open
  })

  const utils = trpc.useUtils()
  const submitMutation = trpc.bench.submissions.submitToJobOrder.useMutation({
    onSuccess: () => {
      toast.success('Talent submitted successfully')
      utils.bench.submissions.listByJobOrder.invalidate({ jobOrderId })
      utils.bench.jobOrders.getById.invalidate({ id: jobOrderId })
      onOpenChange(false)
      resetForm()
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to submit talent')
    }
  })

  const resetForm = () => {
    setSelectedTalent(null)
    setProposedRate('')
    setAvailabilityDate('')
    setNotes('')
    setSearchQuery('')
    setStatusFilter('available')
  }

  const handleSubmit = async () => {
    if (!selectedTalent) {
      toast.error('Please select a talent to submit')
      return
    }
    if (!proposedRate) {
      toast.error('Please enter a proposed rate')
      return
    }

    setIsSubmitting(true)
    try {
      await submitMutation.mutateAsync({
        jobOrderId,
        consultantId: selectedTalent,
        submittedRate: parseFloat(proposedRate),
        notes: notes || undefined
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const talents = (talentData?.items || []) as TalentItem[]
  const selectedTalentData = talents.find((t: TalentItem) => t.id === selectedTalent)

  // Check if talent has matching skills
  const getMatchingSkills = (talentSkills: string[]) => {
    return talentSkills.filter(skill =>
      requiredSkills.some(required =>
        skill.toLowerCase().includes(required.toLowerCase()) ||
        required.toLowerCase().includes(skill.toLowerCase())
      )
    )
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Submit Talent to Job Order</DialogTitle>
          <p className="text-sm text-charcoal-600">
            Job Order: <span className="font-medium text-charcoal-900">{jobOrderTitle}</span>
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden grid grid-cols-2 gap-4">
          {/* Left: Talent Selection */}
          <div className="flex flex-col space-y-4 overflow-hidden">
            <div className="flex items-center gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search talent..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="marketing">Marketing</SelectItem>
                  <SelectItem value="interviewing">Interviewing</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {requiredSkills.length > 0 && (
              <div className="flex flex-wrap gap-1">
                <span className="text-xs text-charcoal-500">Required Skills:</span>
                {requiredSkills.map((skill, index) => (
                  <Badge key={index} variant="outline" className="text-xs">
                    {skill}
                  </Badge>
                ))}
              </div>
            )}

            <div className="flex-1 overflow-y-auto space-y-2 pr-2">
              {isLoadingTalent ? (
                <div className="space-y-2">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <div key={i} className="h-20 bg-charcoal-100 animate-pulse rounded-lg" />
                  ))}
                </div>
              ) : talents.length === 0 ? (
                <div className="text-center py-8 text-charcoal-500">
                  <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No talent found matching criteria</p>
                </div>
              ) : (
                talents.map((talent: TalentItem) => {
                  const matchingSkills = getMatchingSkills(talent.skills || [])
                  const isSelected = selectedTalent === talent.id
                  const candidateName = talent.candidate?.full_name || 'Unknown'

                  return (
                    <Card
                      key={talent.id}
                      className={`cursor-pointer transition-all duration-200 ${
                        isSelected
                          ? 'ring-2 ring-gold-500 bg-gold-50'
                          : 'hover:border-charcoal-300'
                      }`}
                      onClick={() => setSelectedTalent(talent.id)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={isSelected}
                            className="mt-1"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2">
                              <span className="font-medium text-charcoal-900">
                                {candidateName}
                              </span>
                              <Badge className={statusColors[talent.status || ''] || 'bg-charcoal-100'}>
                                {talent.status?.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-charcoal-600 truncate">
                              {talent.candidate?.title || 'No title'}
                            </p>
                            <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-500">
                              <span className="flex items-center gap-1">
                                <Briefcase className="h-3 w-3" />
                                {talent.years_experience || 0}+ years
                              </span>
                              {talent.visa_type && (
                                <Badge className={`${visaStatusColors[talent.visa_type] || 'bg-charcoal-100'} text-xs`}>
                                  {talent.visa_type.replace('_', ' ')}
                                </Badge>
                              )}
                              {talent.target_rate && (
                                <span className="flex items-center gap-1">
                                  <DollarSign className="h-3 w-3" />
                                  ${talent.target_rate}/hr
                                </span>
                              )}
                            </div>
                            {matchingSkills.length > 0 && (
                              <div className="flex flex-wrap gap-1 mt-2">
                                {matchingSkills.slice(0, 3).map((skill: string, index: number) => (
                                  <Badge key={index} className="bg-green-100 text-green-800 text-xs">
                                    ✓ {skill}
                                  </Badge>
                                ))}
                                {matchingSkills.length > 3 && (
                                  <Badge variant="outline" className="text-xs">
                                    +{matchingSkills.length - 3} more
                                  </Badge>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })
              )}
            </div>
          </div>

          {/* Right: Submission Details */}
          <div className="flex flex-col space-y-4 border-l pl-4">
            {selectedTalentData ? (
              <>
                <Card className="bg-gold-50 border-gold-200">
                  <CardContent className="p-4">
                    <h3 className="font-medium text-charcoal-900 mb-2">Selected Talent</h3>
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-gold-200 flex items-center justify-center">
                        <User className="h-5 w-5 text-gold-700" />
                      </div>
                      <div>
                        <p className="font-medium">
                          {selectedTalentData.candidate?.full_name || 'Unknown'}
                        </p>
                        <p className="text-sm text-charcoal-600">
                          {selectedTalentData.candidate?.title || 'No title'}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="proposedRate">
                      Proposed Rate ($/hr) <span className="text-red-500">*</span>
                    </Label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                      <Input
                        id="proposedRate"
                        type="number"
                        value={proposedRate}
                        onChange={(e) => setProposedRate(e.target.value)}
                        placeholder={selectedTalentData.target_rate ? `Suggested: $${selectedTalentData.target_rate}` : 'Enter rate'}
                        className="pl-10"
                      />
                    </div>
                    {selectedTalentData.target_rate && (
                      <p className="text-xs text-charcoal-500">
                        Talent's standard rate: ${selectedTalentData.target_rate}/hr
                      </p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="availabilityDate">Availability Date</Label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                      <Input
                        id="availabilityDate"
                        type="date"
                        value={availabilityDate}
                        onChange={(e) => setAvailabilityDate(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">Submission Notes</Label>
                    <Textarea
                      id="notes"
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Add any relevant notes about this submission..."
                      rows={4}
                    />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center text-center text-charcoal-500">
                <div>
                  <AlertCircle className="h-12 w-12 mx-auto mb-3 opacity-50" />
                  <p className="font-medium">No Talent Selected</p>
                  <p className="text-sm mt-1">
                    Select a talent from the list to configure submission details
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!selectedTalent || !proposedRate || isSubmitting}
          >
            {isSubmitting ? 'Submitting...' : 'Submit Talent'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
