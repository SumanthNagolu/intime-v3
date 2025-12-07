'use client'

import { useState } from 'react'
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
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Loader2, AlertTriangle, AlertCircle, Info, XCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { cn } from '@/lib/utils'

interface CreateEscalationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
}

const escalationTypes = [
  { value: 'quality_concern', label: 'Quality Concern' },
  { value: 'candidate_issue', label: 'Candidate Issue' },
  { value: 'billing_dispute', label: 'Billing Dispute' },
  { value: 'sla_violation', label: 'SLA Violation' },
  { value: 'contract_dispute', label: 'Contract Dispute' },
  { value: 'communication', label: 'Communication Issue' },
  { value: 'compliance', label: 'Compliance Concern' },
  { value: 'relationship', label: 'Relationship Issue' },
  { value: 'other', label: 'Other' },
]

const severityLevels = [
  {
    value: 'low',
    label: 'Low',
    icon: <Info className="w-4 h-4" />,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    description: 'Minor issue, 24h response SLA',
  },
  {
    value: 'medium',
    label: 'Medium',
    icon: <AlertCircle className="w-4 h-4" />,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    description: 'Moderate impact, 4h response SLA',
  },
  {
    value: 'high',
    label: 'High',
    icon: <AlertTriangle className="w-4 h-4" />,
    color: 'text-orange-600 bg-orange-50 border-orange-200',
    description: 'Significant impact, 2h response SLA',
  },
  {
    value: 'critical',
    label: 'Critical',
    icon: <XCircle className="w-4 h-4" />,
    color: 'text-red-600 bg-red-50 border-red-200',
    description: 'Severe impact, 1h response SLA',
  },
]

const impactOptions = [
  { value: 'revenue_at_risk', label: 'Revenue at Risk' },
  { value: 'relationship_damage', label: 'Relationship Damage' },
  { value: 'legal_compliance', label: 'Legal/Compliance Issue' },
  { value: 'timeline_impact', label: 'Timeline Impact' },
  { value: 'reputation_damage', label: 'Reputation Damage' },
]

export function CreateEscalationDialog({
  open,
  onOpenChange,
  accountId,
}: CreateEscalationDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [escalationType, setEscalationType] = useState('')
  const [severity, setSeverity] = useState('medium')
  const [issueSummary, setIssueSummary] = useState('')
  const [detailedDescription, setDetailedDescription] = useState('')
  const [clientImpact, setClientImpact] = useState<string[]>([])
  const [immediateActions, setImmediateActions] = useState('')

  const createEscalationMutation = trpc.crm.escalations.create.useMutation({
    onSuccess: () => {
      toast({
        title: 'Escalation created',
        description: 'The escalation has been logged and assigned.',
      })
      utils.crm.escalations.listByAccount.invalidate({ accountId })
      utils.crm.accounts.getById.invalidate({ id: accountId })
      resetForm()
      onOpenChange(false)
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to create escalation.',
        variant: 'error',
      })
    },
  })

  const resetForm = () => {
    setEscalationType('')
    setSeverity('medium')
    setIssueSummary('')
    setDetailedDescription('')
    setClientImpact([])
    setImmediateActions('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (!escalationType) {
      toast({
        title: 'Validation Error',
        description: 'Please select an escalation type.',
        variant: 'error',
      })
      return
    }

    if (!issueSummary.trim() || issueSummary.length < 10) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a summary of at least 10 characters.',
        variant: 'error',
      })
      return
    }

    if (!detailedDescription.trim() || detailedDescription.length < 20) {
      toast({
        title: 'Validation Error',
        description: 'Please provide a detailed description of at least 20 characters.',
        variant: 'error',
      })
      return
    }

    createEscalationMutation.mutate({
      accountId,
      escalationType: escalationType as 'quality_concern' | 'candidate_issue' | 'billing_dispute' | 'sla_violation' | 'contract_dispute' | 'communication' | 'compliance' | 'relationship' | 'other',
      severity: severity as 'low' | 'medium' | 'high' | 'critical',
      issueSummary: issueSummary.trim(),
      detailedDescription: detailedDescription.trim(),
      clientImpact: clientImpact.length > 0 ? clientImpact : undefined,
      immediateActions: immediateActions.trim() || undefined,
    })
  }

  const toggleImpact = (impact: string) => {
    if (clientImpact.includes(impact)) {
      setClientImpact(clientImpact.filter((i) => i !== impact))
    } else {
      setClientImpact([...clientImpact, impact])
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              Create Escalation
            </DialogTitle>
            <DialogDescription>
              Report a client issue or concern that requires immediate attention.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Escalation Type */}
            <div className="space-y-2">
              <Label htmlFor="escalationType">Escalation Type *</Label>
              <Select value={escalationType} onValueChange={setEscalationType}>
                <SelectTrigger id="escalationType">
                  <SelectValue placeholder="Select type of issue" />
                </SelectTrigger>
                <SelectContent>
                  {escalationTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Severity Selection */}
            <div className="space-y-2">
              <Label>Severity *</Label>
              <div className="grid grid-cols-2 gap-2">
                {severityLevels.map((level) => (
                  <button
                    key={level.value}
                    type="button"
                    onClick={() => setSeverity(level.value)}
                    className={cn(
                      'flex flex-col items-start p-3 rounded-lg border-2 transition-all',
                      severity === level.value
                        ? `${level.color} border-current`
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <div className="flex items-center gap-2">
                      {level.icon}
                      <span className="font-medium">{level.label}</span>
                    </div>
                    <span className="text-xs mt-1 text-charcoal-500">
                      {level.description}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            {/* Issue Summary */}
            <div className="space-y-2">
              <Label htmlFor="issueSummary">Issue Summary *</Label>
              <Input
                id="issueSummary"
                value={issueSummary}
                onChange={(e) => setIssueSummary(e.target.value)}
                placeholder="Brief summary of the issue (50-200 characters)"
                maxLength={200}
                required
              />
              <p className="text-xs text-charcoal-500">
                {issueSummary.length}/200 characters
              </p>
            </div>

            {/* Detailed Description */}
            <div className="space-y-2">
              <Label htmlFor="detailedDescription">Detailed Description *</Label>
              <Textarea
                id="detailedDescription"
                value={detailedDescription}
                onChange={(e) => setDetailedDescription(e.target.value)}
                placeholder="Provide full details about the issue, including context, timeline, and any relevant background information..."
                rows={4}
                required
              />
            </div>

            {/* Client Impact */}
            <div className="space-y-2">
              <Label>Client Impact</Label>
              <p className="text-xs text-charcoal-500 mb-2">
                Select all that apply
              </p>
              <div className="grid grid-cols-2 gap-2">
                {impactOptions.map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      'flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors',
                      clientImpact.includes(option.value)
                        ? 'bg-hublot-50 border-hublot-700'
                        : 'border-charcoal-200 hover:border-charcoal-300'
                    )}
                  >
                    <Checkbox
                      checked={clientImpact.includes(option.value)}
                      onCheckedChange={() => toggleImpact(option.value)}
                    />
                    <span className="text-sm">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Immediate Actions */}
            <div className="space-y-2">
              <Label htmlFor="immediateActions">Immediate Actions Taken</Label>
              <Textarea
                id="immediateActions"
                value={immediateActions}
                onChange={(e) => setImmediateActions(e.target.value)}
                placeholder="Describe any immediate steps already taken to address the issue..."
                rows={3}
              />
            </div>

            {/* SLA Information */}
            {severity && (
              <div className="p-3 bg-charcoal-50 rounded-lg">
                <h4 className="text-sm font-medium text-charcoal-900 mb-1">
                  SLA Requirements
                </h4>
                <p className="text-xs text-charcoal-600">
                  {severity === 'critical' && 'Response required within 1 hour. Resolution target: 24 hours.'}
                  {severity === 'high' && 'Response required within 2 hours. Resolution target: 48 hours.'}
                  {severity === 'medium' && 'Response required within 4 hours. Resolution target: 5 days.'}
                  {severity === 'low' && 'Response required within 24 hours. Resolution target: 10 days.'}
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={createEscalationMutation.isPending}
              variant="default"
              className="bg-amber-600 hover:bg-amber-700"
            >
              {createEscalationMutation.isPending && (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              )}
              Create Escalation
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
