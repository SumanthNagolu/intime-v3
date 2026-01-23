'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'
import { Loader2, Target, Thermometer, DollarSign, Users, Lightbulb, Clock } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { CampaignProspect } from '@/types/campaign'

interface ConvertToLeadDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  prospect: CampaignProspect | null
  onSuccess?: () => void
}

const INTEREST_LEVELS = [
  { value: 'hot', label: 'Hot', color: 'text-red-600', bg: 'bg-red-50' },
  { value: 'warm', label: 'Warm', color: 'text-amber-600', bg: 'bg-amber-50' },
  { value: 'cold', label: 'Cold', color: 'text-blue-600', bg: 'bg-blue-50' },
] as const

const BUDGET_OPTIONS = [
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'likely', label: 'Likely' },
  { value: 'unclear', label: 'Unclear' },
  { value: 'no_budget', label: 'No Budget' },
] as const

const AUTHORITY_OPTIONS = [
  { value: 'decision_maker', label: 'Decision Maker' },
  { value: 'champion', label: 'Champion' },
  { value: 'influencer', label: 'Influencer' },
  { value: 'unknown', label: 'Unknown' },
] as const

const NEED_OPTIONS = [
  { value: 'urgent', label: 'Urgent' },
  { value: 'defined', label: 'Defined' },
  { value: 'identified', label: 'Identified' },
  { value: 'unknown', label: 'Unknown' },
] as const

const TIMELINE_OPTIONS = [
  { value: 'short', label: 'Short (< 1 month)' },
  { value: 'medium', label: 'Medium (1-3 months)' },
  { value: 'long', label: 'Long (> 3 months)' },
  { value: 'unknown', label: 'Unknown' },
] as const

export function ConvertToLeadDialog({
  open,
  onOpenChange,
  prospect,
  onSuccess,
}: ConvertToLeadDialogProps) {
  const [interestLevel, setInterestLevel] = useState<'hot' | 'warm' | 'cold'>('warm')
  const [budgetStatus, setBudgetStatus] = useState<string>('')
  const [authorityStatus, setAuthorityStatus] = useState<string>('')
  const [needStatus, setNeedStatus] = useState<string>('')
  const [timelineStatus, setTimelineStatus] = useState<string>('')
  const [notes, setNotes] = useState('')

  const utils = trpc.useUtils()

  const convertMutation = trpc.crm.campaigns.convertProspectToLead.useMutation({
    onSuccess: () => {
      toast.success('Prospect converted to lead successfully')
      utils.crm.campaigns.getProspects.invalidate()
      utils.crm.campaigns.getFullEntity.invalidate()
      utils.crm.leads.list.invalidate()
      onSuccess?.()
      handleClose()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to convert prospect')
    },
  })

  const handleClose = () => {
    setInterestLevel('warm')
    setBudgetStatus('')
    setAuthorityStatus('')
    setNeedStatus('')
    setTimelineStatus('')
    setNotes('')
    onOpenChange(false)
  }

  const handleSubmit = () => {
    if (!prospect) return

    convertMutation.mutate({
      prospectId: prospect.id,
      interestLevel,
      // Convert empty strings to undefined for optional enum fields
      budgetStatus: budgetStatus || undefined,
      authorityStatus: authorityStatus || undefined,
      needStatus: needStatus || undefined,
      timelineStatus: timelineStatus || undefined,
      notes: notes.trim() || undefined,
    })
  }

  if (!prospect) return null

  const fullName = [prospect.firstName, prospect.lastName].filter(Boolean).join(' ') || 'Unknown'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Target className="w-5 h-5 text-gold-500" />
            Convert to Lead
          </DialogTitle>
          <DialogDescription>
            Convert <strong>{fullName}</strong> from prospect to a qualified lead
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-4">
          {/* Prospect Info Card */}
          <div className="bg-charcoal-50 rounded-lg p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-charcoal-200 flex items-center justify-center">
                <span className="text-sm font-medium text-charcoal-700">
                  {(prospect.firstName?.[0] || '') + (prospect.lastName?.[0] || '')}
                </span>
              </div>
              <div>
                <p className="font-medium text-charcoal-900">{fullName}</p>
                <p className="text-sm text-charcoal-500">
                  {prospect.title ? `${prospect.title} at ` : ''}
                  {prospect.companyName || 'Unknown Company'}
                </p>
              </div>
            </div>
          </div>

          {/* Interest Level */}
          <div className="space-y-2">
            <Label className="flex items-center gap-2">
              <Thermometer className="w-4 h-4 text-charcoal-400" />
              Interest Level *
            </Label>
            <div className="flex gap-2">
              {INTEREST_LEVELS.map((level) => (
                <button
                  key={level.value}
                  type="button"
                  onClick={() => setInterestLevel(level.value)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                    interestLevel === level.value
                      ? `${level.bg} ${level.color} border-current`
                      : 'border-charcoal-200 text-charcoal-600 hover:border-charcoal-300'
                  )}
                >
                  {level.label}
                </button>
              ))}
            </div>
          </div>

          {/* BANT Grid */}
          <div className="grid grid-cols-2 gap-4">
            {/* Budget */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <DollarSign className="w-3.5 h-3.5 text-charcoal-400" />
                Budget
              </Label>
              <Select value={budgetStatus} onValueChange={setBudgetStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {BUDGET_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Authority */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <Users className="w-3.5 h-3.5 text-charcoal-400" />
                Authority
              </Label>
              <Select value={authorityStatus} onValueChange={setAuthorityStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {AUTHORITY_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Need */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-charcoal-400" />
                Need
              </Label>
              <Select value={needStatus} onValueChange={setNeedStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {NEED_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Timeline */}
            <div className="space-y-2">
              <Label className="flex items-center gap-2 text-xs">
                <Clock className="w-3.5 h-3.5 text-charcoal-400" />
                Timeline
              </Label>
              <Select value={timelineStatus} onValueChange={setTimelineStatus}>
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select..." />
                </SelectTrigger>
                <SelectContent>
                  {TIMELINE_OPTIONS.map((opt) => (
                    <SelectItem key={opt.value} value={opt.value}>
                      {opt.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Any additional notes about this lead..."
              rows={2}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={convertMutation.isPending}
          >
            {convertMutation.isPending && (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            )}
            Convert to Lead
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
