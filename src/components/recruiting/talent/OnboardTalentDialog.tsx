'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { Loader2, ChevronsUpDown, Check, User } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface OnboardTalentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function OnboardTalentDialog({ open, onOpenChange }: OnboardTalentDialogProps) {
  const router = useRouter()
  const utils = trpc.useUtils()

  const [candidateId, setCandidateId] = useState('')
  const [candidateSearch, setCandidateSearch] = useState('')
  const [candidateOpen, setCandidateOpen] = useState(false)
  const [benchStartDate, setBenchStartDate] = useState(new Date().toISOString().split('T')[0])
  const [visaType, setVisaType] = useState('')
  const [visaExpiryDate, setVisaExpiryDate] = useState('')
  const [workAuthStatus, setWorkAuthStatus] = useState('')
  const [minAcceptableRate, setMinAcceptableRate] = useState('')
  const [targetRate, setTargetRate] = useState('')
  const [willingRelocate, setWillingRelocate] = useState(false)
  const [preferredLocations, setPreferredLocations] = useState('')

  // Fetch candidates to select from - using unified contacts (candidates are contacts with specific subtype)
  const candidatesQuery = trpc.unifiedContacts.candidates.list.useQuery({
    search: candidateSearch || undefined,
    limit: 20,
  })

  // Type annotation for candidates
  interface CandidateItem {
    id: string
    full_name: string
    email?: string | null
    first_name?: string | null
    last_name?: string | null
  }

  const candidates: CandidateItem[] = (candidatesQuery.data?.items || []).map((c: Record<string, unknown>) => ({
    id: c.id as string,
    full_name: `${c.first_name || ''} ${c.last_name || ''}`.trim() || 'Unknown',
    email: c.email as string | null,
    first_name: c.first_name as string | null,
    last_name: c.last_name as string | null,
  }))

  // Uses contactBench router for creating bench records
  const createMutation = trpc.contactBench.convertToBench.useMutation({
    onSuccess: (data) => {
      toast.success('Talent onboarded successfully')
      utils.contactBench.list.invalidate()
      onOpenChange(false)
      resetForm()
      router.push(`/employee/recruiting/talent/${data.id}`)
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to onboard talent')
    },
  })

  const resetForm = () => {
    setCandidateId('')
    setCandidateSearch('')
    setBenchStartDate(new Date().toISOString().split('T')[0])
    setVisaType('')
    setVisaExpiryDate('')
    setWorkAuthStatus('')
    setMinAcceptableRate('')
    setTargetRate('')
    setWillingRelocate(false)
    setPreferredLocations('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!candidateId) {
      toast.error('Please select a candidate')
      return
    }

    if (!benchStartDate) {
      toast.error('Please select a bench start date')
      return
    }

    // In unified contacts, candidates are contacts - so candidateId IS the contactId
    createMutation.mutate({
      contactId: candidateId, // Candidate's ID is their contact ID
      benchStartDate,
      benchType: 'w2_internal' as const, // Default for onboarding - must match enum values
      visaType: visaType || undefined,
      visaExpiryDate: visaExpiryDate || undefined,
      targetRate: targetRate ? parseFloat(targetRate) : undefined,
    })
  }

  const selectedCandidate = candidates.find((c: CandidateItem) => c.id === candidateId)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Onboard Talent</DialogTitle>
          <DialogDescription>
            Add a candidate to the bench talent pool. This creates a bench consultant record to track marketing, submissions, and placements.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit}>
          <div className="space-y-6 py-4">
            {/* Candidate Selection */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-charcoal-900">Select Candidate *</h3>

              <Popover open={candidateOpen} onOpenChange={setCandidateOpen}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    aria-expanded={candidateOpen}
                    className="w-full justify-between"
                  >
                    {selectedCandidate ? (
                      <span className="flex items-center gap-2">
                        <User className="w-4 h-4" />
                        {selectedCandidate.full_name}
                        <span className="text-charcoal-400">({selectedCandidate.email})</span>
                      </span>
                    ) : (
                      "Select a candidate..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[500px] p-0">
                  <Command>
                    <CommandInput
                      placeholder="Search candidates..."
                      value={candidateSearch}
                      onValueChange={setCandidateSearch}
                    />
                    <CommandList>
                      <CommandEmpty>No candidates found.</CommandEmpty>
                      <CommandGroup>
                        {candidates.map((candidate: CandidateItem) => (
                          <CommandItem
                            key={candidate.id}
                            value={candidate.id}
                            onSelect={() => {
                              setCandidateId(candidate.id)
                              setCandidateOpen(false)
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                candidateId === candidate.id ? "opacity-100" : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span>{candidate.full_name}</span>
                              <span className="text-xs text-charcoal-500">{candidate.email}</span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
            </div>

            {/* Bench Start Date */}
            <div>
              <Label htmlFor="benchStartDate">Bench Start Date *</Label>
              <Input
                id="benchStartDate"
                type="date"
                value={benchStartDate}
                onChange={(e) => setBenchStartDate(e.target.value)}
                required
              />
            </div>

            {/* Work Authorization */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-charcoal-900">Work Authorization</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="visaType">Visa Type</Label>
                  <Select value={visaType} onValueChange={setVisaType}>
                    <SelectTrigger id="visaType">
                      <SelectValue placeholder="Select visa type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="us_citizen">US Citizen</SelectItem>
                      <SelectItem value="gc">Green Card</SelectItem>
                      <SelectItem value="h1b">H-1B</SelectItem>
                      <SelectItem value="h1b_transfer">H-1B Transfer</SelectItem>
                      <SelectItem value="l1">L1</SelectItem>
                      <SelectItem value="opt">OPT</SelectItem>
                      <SelectItem value="opt_stem">OPT STEM</SelectItem>
                      <SelectItem value="cpt">CPT</SelectItem>
                      <SelectItem value="ead">EAD</SelectItem>
                      <SelectItem value="tn">TN</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="visaExpiryDate">Visa Expiry Date</Label>
                  <Input
                    id="visaExpiryDate"
                    type="date"
                    value={visaExpiryDate}
                    onChange={(e) => setVisaExpiryDate(e.target.value)}
                  />
                </div>

                <div className="col-span-2">
                  <Label htmlFor="workAuthStatus">Work Authorization Status</Label>
                  <Input
                    id="workAuthStatus"
                    value={workAuthStatus}
                    onChange={(e) => setWorkAuthStatus(e.target.value)}
                    placeholder="e.g., Valid until 2025"
                  />
                </div>
              </div>
            </div>

            {/* Rate Information */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-charcoal-900">Rate Information</h3>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="minAcceptableRate">Minimum Acceptable Rate ($/hr)</Label>
                  <Input
                    id="minAcceptableRate"
                    type="number"
                    step="0.01"
                    value={minAcceptableRate}
                    onChange={(e) => setMinAcceptableRate(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="targetRate">Target Rate ($/hr)</Label>
                  <Input
                    id="targetRate"
                    type="number"
                    step="0.01"
                    value={targetRate}
                    onChange={(e) => setTargetRate(e.target.value)}
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            {/* Location Preferences */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-charcoal-900">Location Preferences</h3>

              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="willingRelocate"
                    checked={willingRelocate}
                    onChange={(e) => setWillingRelocate(e.target.checked)}
                    className="rounded border-charcoal-300"
                  />
                  <Label htmlFor="willingRelocate">Willing to relocate</Label>
                </div>

                <div>
                  <Label htmlFor="preferredLocations">Preferred Locations</Label>
                  <Input
                    id="preferredLocations"
                    value={preferredLocations}
                    onChange={(e) => setPreferredLocations(e.target.value)}
                    placeholder="New York, Los Angeles, Remote (comma-separated)"
                  />
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={createMutation.isPending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={createMutation.isPending}>
              {createMutation.isPending ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Onboarding...
                </>
              ) : (
                'Onboard Talent'
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
