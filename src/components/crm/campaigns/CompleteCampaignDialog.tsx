'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { trpc } from '@/lib/trpc/client'
import { Loader2, CheckCircle, TrendingUp, Target, XCircle } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

interface CompleteCampaignDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  campaignId: string
  campaignName: string
  metrics?: {
    funnel?: {
      total_prospects: number
      leads: number
      meetings: number
    }
    targets?: {
      leads: { target: number; actual: number }
      meetings: { target: number; actual: number }
    }
  }
  onSuccess: () => void
}

const outcomeOptions = [
  { value: 'exceeded', label: 'Exceeded Targets', icon: TrendingUp, color: 'text-green-600' },
  { value: 'met', label: 'Met Targets', icon: CheckCircle, color: 'text-blue-600' },
  { value: 'partial', label: 'Partially Successful', icon: Target, color: 'text-amber-600' },
  { value: 'failed', label: 'Did Not Meet Goals', icon: XCircle, color: 'text-red-600' },
]

export function CompleteCampaignDialog({
  open,
  onOpenChange,
  campaignId,
  campaignName,
  metrics,
  onSuccess,
}: CompleteCampaignDialogProps) {
  const [outcome, setOutcome] = useState<string>('')
  const [notes, setNotes] = useState('')

  const completeCampaign = trpc.crm.campaigns.complete.useMutation({
    onSuccess: () => {
      toast.success('Campaign completed')
      onOpenChange(false)
      setOutcome('')
      setNotes('')
      onSuccess()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to complete campaign')
    },
  })

  const handleComplete = () => {
    if (!outcome) {
      toast.error('Please select an outcome')
      return
    }

    completeCampaign.mutate({
      id: campaignId,
      outcome: outcome as 'exceeded' | 'met' | 'partial' | 'failed',
      completionNotes: notes || undefined,
    })
  }

  // Calculate achievement percentages
  const leadsAchievement = metrics?.targets?.leads
    ? Math.round((metrics.targets.leads.actual / metrics.targets.leads.target) * 100)
    : 0
  const meetingsAchievement = metrics?.targets?.meetings
    ? Math.round((metrics.targets.meetings.actual / metrics.targets.meetings.target) * 100)
    : 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Complete Campaign</DialogTitle>
          <DialogDescription>
            Mark &quot;{campaignName}&quot; as completed and record the outcome.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Performance Summary */}
          <div className="bg-charcoal-50 rounded-lg p-4 space-y-3">
            <h4 className="font-medium text-sm text-charcoal-700">Performance Summary</h4>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-xs text-charcoal-500">Leads</p>
                <p className="text-lg font-semibold">
                  {metrics?.targets?.leads?.actual || 0} / {metrics?.targets?.leads?.target || 0}
                </p>
                <div className="h-1.5 bg-charcoal-200 rounded-full overflow-hidden mt-1">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      leadsAchievement >= 100 ? 'bg-green-500' : leadsAchievement >= 75 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(leadsAchievement, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-charcoal-500 mt-0.5">{leadsAchievement}% of target</p>
              </div>
              <div>
                <p className="text-xs text-charcoal-500">Meetings</p>
                <p className="text-lg font-semibold">
                  {metrics?.targets?.meetings?.actual || 0} / {metrics?.targets?.meetings?.target || 0}
                </p>
                <div className="h-1.5 bg-charcoal-200 rounded-full overflow-hidden mt-1">
                  <div
                    className={cn(
                      'h-full rounded-full',
                      meetingsAchievement >= 100 ? 'bg-green-500' : meetingsAchievement >= 75 ? 'bg-amber-500' : 'bg-red-500'
                    )}
                    style={{ width: `${Math.min(meetingsAchievement, 100)}%` }}
                  />
                </div>
                <p className="text-xs text-charcoal-500 mt-0.5">{meetingsAchievement}% of target</p>
              </div>
            </div>
          </div>

          {/* Outcome Selection */}
          <div className="space-y-2">
            <Label>Campaign Outcome *</Label>
            <Select value={outcome} onValueChange={setOutcome}>
              <SelectTrigger>
                <SelectValue placeholder="Select outcome..." />
              </SelectTrigger>
              <SelectContent>
                {outcomeOptions.map((opt) => {
                  const Icon = opt.icon
                  return (
                    <SelectItem key={opt.value} value={opt.value}>
                      <div className="flex items-center gap-2">
                        <Icon className={cn('h-4 w-4', opt.color)} />
                        <span>{opt.label}</span>
                      </div>
                    </SelectItem>
                  )
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Completion Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Completion Notes</Label>
            <Textarea
              id="notes"
              placeholder="Key learnings, what worked, what to improve..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={4}
            />
            <p className="text-xs text-charcoal-400">
              Record insights for future campaigns
            </p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleComplete} disabled={completeCampaign.isPending || !outcome}>
            {completeCampaign.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Complete Campaign
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
