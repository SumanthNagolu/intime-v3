'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, User, DollarSign, Check } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface AddToHotlistDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  hotlistId: string
  hotlistName: string
  existingConsultantIds: string[]
  onSuccess?: () => void
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
  // contactBench camelCase fields
  benchStatus?: string
  visaType?: string
  targetRate?: number
  // Legacy snake_case fields
  status?: string
  visa_type?: string
  target_rate?: number
  // Contact (new shape from contactBench)
  contact?: {
    id: string
    first_name?: string
    last_name?: string
    email?: string
  }
  // Legacy candidate shape
  candidate?: {
    id: string
    full_name?: string
    email?: string
  }
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

export function AddToHotlistDialog({
  open,
  onOpenChange,
  hotlistId,
  hotlistName,
  existingConsultantIds,
  onSuccess
}: AddToHotlistDialogProps) {
  const [searchQuery, setSearchQuery] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedConsultants, setSelectedConsultants] = useState<string[]>([])
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Fetch available talent - uses contactBench router
  const { data: talentData, isLoading } = trpc.contactBench.list.useQuery({
    benchStatus: statusFilter !== 'all' ? statusFilter as 'onboarding' | 'available' | 'marketing' | 'interviewing' | 'placed' | 'inactive' : undefined,
    search: searchQuery || undefined,
    limit: 50
  }, {
    enabled: open
  })

  const utils = trpc.useUtils()
  const addConsultantMutation = trpc.bench.hotlists.addConsultant.useMutation({
    onSuccess: () => {
      utils.bench.hotlists.getById.invalidate({ id: hotlistId })
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to add consultant')
    }
  })

  const handleToggleConsultant = (id: string) => {
    setSelectedConsultants(prev =>
      prev.includes(id)
        ? prev.filter(c => c !== id)
        : [...prev, id]
    )
  }

  const handleAddConsultants = async () => {
    if (selectedConsultants.length === 0) {
      toast.error('Please select at least one consultant')
      return
    }

    setIsSubmitting(true)
    try {
      // Add consultants one by one (could be batched in backend)
      for (const consultantId of selectedConsultants) {
        await addConsultantMutation.mutateAsync({
          hotlistId,
          consultantId,
        })
      }
      toast.success(`Added ${selectedConsultants.length} consultant(s) to hotlist`)
      onOpenChange(false)
      setSelectedConsultants([])
      setSearchQuery('')
      onSuccess?.()
    } finally {
      setIsSubmitting(false)
    }
  }

  const talents = (talentData?.items || []) as TalentItem[]
  // Filter out consultants already in the hotlist
  const availableTalents = talents.filter((t: TalentItem) => !existingConsultantIds.includes(t.id))

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading">Add to {hotlistName}</DialogTitle>
          <p className="text-sm text-charcoal-600">
            Select consultants to add to this hotlist
          </p>
        </DialogHeader>

        <div className="flex-1 overflow-hidden flex flex-col space-y-4">
          {/* Filters */}
          <div className="flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
              <Input
                placeholder="Search consultants..."
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

          {/* Selection summary */}
          {selectedConsultants.length > 0 && (
            <div className="flex items-center gap-2 p-2 bg-gold-50 rounded-lg border border-gold-200">
              <Check className="h-4 w-4 text-gold-600" />
              <span className="text-sm text-gold-800">
                {selectedConsultants.length} consultant(s) selected
              </span>
              <Button
                variant="ghost"
                size="sm"
                className="ml-auto text-xs h-6"
                onClick={() => setSelectedConsultants([])}
              >
                Clear
              </Button>
            </div>
          )}

          {/* Consultants list */}
          <div className="flex-1 overflow-y-auto space-y-2 pr-2">
            {isLoading ? (
              <div className="space-y-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-charcoal-100 animate-pulse rounded-lg" />
                ))}
              </div>
            ) : availableTalents.length === 0 ? (
              <div className="text-center py-8 text-charcoal-500">
                <User className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>{talents.length > 0 ? 'All matching consultants are already in this hotlist' : 'No consultants found'}</p>
              </div>
            ) : (
              availableTalents.map((talent: TalentItem) => {
                const isSelected = selectedConsultants.includes(talent.id)
                // Handle both contact (new) and candidate (legacy) shapes
                const candidateName = talent.contact
                  ? `${talent.contact.first_name || ''} ${talent.contact.last_name || ''}`.trim()
                  : talent.candidate?.full_name || 'Unknown'
                const candidateEmail = talent.contact?.email || talent.candidate?.email || 'No email'
                const status = talent.benchStatus || talent.status || ''
                const visaType = talent.visaType || talent.visa_type
                const targetRate = talent.targetRate || talent.target_rate

                return (
                  <Card
                    key={talent.id}
                    className={`cursor-pointer transition-all duration-200 ${
                      isSelected
                        ? 'ring-2 ring-gold-500 bg-gold-50'
                        : 'hover:border-charcoal-300'
                    }`}
                    onClick={() => handleToggleConsultant(talent.id)}
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
                            <Badge className={statusColors[status] || 'bg-charcoal-100'}>
                              {status.replace('_', ' ')}
                            </Badge>
                          </div>
                          <p className="text-sm text-charcoal-600 truncate">
                            {candidateEmail}
                          </p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-500">
                            {visaType && (
                              <Badge className={`${visaStatusColors[visaType] || 'bg-charcoal-100'} text-xs`}>
                                {visaType.replace('_', ' ')}
                              </Badge>
                            )}
                            {targetRate && (
                              <span className="flex items-center gap-1">
                                <DollarSign className="h-3 w-3" />
                                ${targetRate}/hr
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })
            )}
          </div>
        </div>

        <DialogFooter className="mt-4 pt-4 border-t">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button
            onClick={handleAddConsultants}
            disabled={selectedConsultants.length === 0 || isSubmitting}
          >
            {isSubmitting ? 'Adding...' : `Add ${selectedConsultants.length || ''} Consultant${selectedConsultants.length !== 1 ? 's' : ''}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
