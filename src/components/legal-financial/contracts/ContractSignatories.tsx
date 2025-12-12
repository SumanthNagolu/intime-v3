'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  User,
  Building2,
  PenTool,
  CheckCircle,
  Clock,
  XCircle,
  Plus,
  MoreVertical,
  Send,
  Trash2,
} from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { InlinePanelSection } from '@/components/ui/inline-panel'

interface ContractSignatoriesProps {
  contractId: string
}

interface Signatory {
  id: string
  partyType: string
  partyRole: string
  partyName: string | null
  partyEmail: string | null
  partyTitle: string | null
  partyCompany: string | null
  signatoryStatus: string
  signedAt: string | null
  signatureIp: string | null
  signatureRequestedAt: string | null
  signingOrder: number
  isRequired: boolean
  createdAt: string
}

const STATUS_CONFIG = {
  pending: {
    label: 'Pending',
    color: 'bg-charcoal-100 text-charcoal-600',
    icon: Clock,
  },
  requested: {
    label: 'Requested',
    color: 'bg-blue-100 text-blue-700',
    icon: Send,
  },
  signed: {
    label: 'Signed',
    color: 'bg-green-100 text-green-700',
    icon: CheckCircle,
  },
  declined: {
    label: 'Declined',
    color: 'bg-red-100 text-red-700',
    icon: XCircle,
  },
  voided: {
    label: 'Voided',
    color: 'bg-charcoal-100 text-charcoal-500',
    icon: XCircle,
  },
}

const PARTY_TYPES = [
  { value: 'internal', label: 'Internal (Your Organization)' },
  { value: 'company', label: 'Company' },
  { value: 'individual', label: 'Individual' },
]

const PARTY_ROLES = [
  { value: 'client', label: 'Client' },
  { value: 'vendor', label: 'Vendor' },
  { value: 'consultant', label: 'Consultant' },
  { value: 'guarantor', label: 'Guarantor' },
  { value: 'witness', label: 'Witness' },
]

/**
 * ContractSignatories - Manage contract signatories/parties
 *
 * Features:
 * - List all signatories with status
 * - Add new signatories
 * - Request signatures
 * - Track signature status
 */
export function ContractSignatories({ contractId }: ContractSignatoriesProps) {
  const { toast } = useToast()
  const [showAddForm, setShowAddForm] = useState(false)
  const [newSignatory, setNewSignatory] = useState({
    partyType: 'company',
    partyRole: 'client',
    partyName: '',
    partyEmail: '',
    partyTitle: '',
    partyCompany: '',
  })

  // Fetch signatories
  const signatoriesQuery = trpc.contracts.parties.list.useQuery({
    contractId,
  })

  const utils = trpc.useUtils()

  // Add signatory mutation
  const addMutation = trpc.contracts.parties.add.useMutation({
    onSuccess: () => {
      toast({
        title: 'Signatory added',
        description: 'The signatory has been added to the contract.',
      })
      utils.contracts.parties.list.invalidate({ contractId })
      setShowAddForm(false)
      setNewSignatory({
        partyType: 'company',
        partyRole: 'client',
        partyName: '',
        partyEmail: '',
        partyTitle: '',
        partyCompany: '',
      })
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.message || 'Failed to add signatory.',
        variant: 'error',
      })
    },
  })

  // Delete signatory mutation
  const deleteMutation = trpc.contracts.parties.remove.useMutation({
    onSuccess: () => {
      toast({
        title: 'Signatory removed',
        description: 'The signatory has been removed from the contract.',
      })
      utils.contracts.parties.list.invalidate({ contractId })
    },
  })

  // Request signature mutation
  const requestSignatureMutation = trpc.contracts.parties.requestSignature.useMutation({
    onSuccess: () => {
      toast({
        title: 'Signature requested',
        description: 'A signature request has been sent.',
      })
      utils.contracts.parties.list.invalidate({ contractId })
    },
  })

  const isLoading = signatoriesQuery.isLoading
  const signatories = signatoriesQuery.data ?? []

  const handleAddSignatory = () => {
    if (!newSignatory.partyName) {
      toast({
        title: 'Error',
        description: 'Party name is required.',
        variant: 'error',
      })
      return
    }

    addMutation.mutate({
      contractId,
      partyType: newSignatory.partyType as 'company' | 'individual' | 'internal',
      partyRole: newSignatory.partyRole as 'client' | 'vendor' | 'consultant' | 'guarantor' | 'witness',
      partyName: newSignatory.partyName || undefined,
      partyEmail: newSignatory.partyEmail || undefined,
      partyTitle: newSignatory.partyTitle || undefined,
      partyCompany: newSignatory.partyCompany || undefined,
      signingOrder: signatories.length + 1,
    })
  }

  const handleRequestSignature = (signatory: Signatory) => {
    if (!signatory.partyEmail) {
      toast({
        title: 'Error',
        description: 'Party email is required to request signature.',
        variant: 'error',
      })
      return
    }
    requestSignatureMutation.mutate({ id: signatory.id })
  }

  const handleDelete = (signatory: Signatory) => {
    if (signatory.signatoryStatus === 'signed') {
      toast({
        title: 'Cannot delete',
        description: 'Cannot delete a signatory who has already signed.',
        variant: 'error',
      })
      return
    }
    if (confirm('Are you sure you want to remove this signatory?')) {
      deleteMutation.mutate({ id: signatory.id })
    }
  }

  // Count signed/total
  const signedCount = signatories.filter((s) => s.signatoryStatus === 'signed').length
  const totalCount = signatories.length

  if (isLoading) {
    return (
      <InlinePanelSection title="Signatories">
        <div className="space-y-3">
          {[1, 2].map((i) => (
            <div key={i} className="flex gap-3 p-3 border rounded-lg animate-pulse">
              <Skeleton className="w-10 h-10 rounded" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-4 w-32" />
                <Skeleton className="h-3 w-48" />
              </div>
            </div>
          ))}
        </div>
      </InlinePanelSection>
    )
  }

  return (
    <InlinePanelSection title="Signatories">
      {/* Summary */}
      {totalCount > 0 && (
        <div className="flex items-center gap-2 mb-4 pb-4 border-b border-charcoal-200">
          <div className="flex -space-x-2">
            {signatories.slice(0, 3).map((s, i) => (
              <div
                key={s.id}
                className={cn(
                  'w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium border-2 border-white',
                  s.signatoryStatus === 'signed'
                    ? 'bg-green-100 text-green-700'
                    : 'bg-charcoal-100 text-charcoal-600'
                )}
              >
                {(s.partyName || s.partyCompany || 'P').charAt(0).toUpperCase()}
              </div>
            ))}
          </div>
          <span className="text-sm text-charcoal-600">
            {signedCount}/{totalCount} signed
          </span>
          {signedCount === totalCount && totalCount > 0 && (
            <Badge className="bg-green-100 text-green-700 text-xs">
              Fully Executed
            </Badge>
          )}
        </div>
      )}

      {/* Signatories List */}
      <div className="space-y-3">
        {signatories.map((signatory) => {
          const statusConfig = STATUS_CONFIG[signatory.signatoryStatus as keyof typeof STATUS_CONFIG] || STATUS_CONFIG.pending
          const StatusIcon = statusConfig.icon

          return (
            <div
              key={signatory.id}
              className={cn(
                'flex items-start gap-3 p-3 rounded-lg border transition-colors',
                signatory.signatoryStatus === 'signed'
                  ? 'bg-green-50/50 border-green-200'
                  : 'bg-white border-charcoal-200'
              )}
            >
              {/* Party Icon */}
              <div
                className={cn(
                  'w-10 h-10 rounded flex items-center justify-center flex-shrink-0',
                  signatory.partyType === 'internal'
                    ? 'bg-blue-100 text-blue-600'
                    : 'bg-charcoal-100 text-charcoal-600'
                )}
              >
                {signatory.partyType === 'internal' ? (
                  <Building2 className="w-5 h-5" />
                ) : signatory.partyType === 'company' ? (
                  <Building2 className="w-5 h-5" />
                ) : (
                  <User className="w-5 h-5" />
                )}
              </div>

              {/* Party Info */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-charcoal-900 truncate">
                    {signatory.partyName || signatory.partyCompany || 'Unnamed Party'}
                  </span>
                  <Badge className={cn('text-xs', statusConfig.color)}>
                    <StatusIcon className="w-3 h-3 mr-1" />
                    {statusConfig.label}
                  </Badge>
                </div>

                {signatory.partyTitle && (
                  <p className="text-sm text-charcoal-600">
                    {signatory.partyTitle}
                  </p>
                )}

                {signatory.partyEmail && (
                  <p className="text-xs text-charcoal-500">{signatory.partyEmail}</p>
                )}

                {signatory.signedAt && (
                  <p className="text-xs text-green-600 mt-1">
                    Signed {formatDistanceToNow(new Date(signatory.signedAt), { addSuffix: true })}
                  </p>
                )}
              </div>

              {/* Actions */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                    <MoreVertical className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  {signatory.signatoryStatus !== 'signed' && signatory.partyEmail && (
                    <DropdownMenuItem onClick={() => handleRequestSignature(signatory)}>
                      <Send className="w-4 h-4 mr-2" />
                      Request Signature
                    </DropdownMenuItem>
                  )}
                  {signatory.signatoryStatus !== 'signed' && (
                    <DropdownMenuItem
                      className="text-red-600"
                      onClick={() => handleDelete(signatory)}
                    >
                      <Trash2 className="w-4 h-4 mr-2" />
                      Remove
                    </DropdownMenuItem>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          )
        })}
      </div>

      {/* Add Signatory Form */}
      {showAddForm ? (
        <div className="mt-4 p-4 border border-charcoal-200 rounded-lg bg-charcoal-50/50">
          <h4 className="font-medium text-charcoal-900 mb-4">Add Signatory</h4>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Party Type *</Label>
                <Select
                  value={newSignatory.partyType}
                  onValueChange={(value) =>
                    setNewSignatory({ ...newSignatory, partyType: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTY_TYPES.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Party Role *</Label>
                <Select
                  value={newSignatory.partyRole}
                  onValueChange={(value) =>
                    setNewSignatory({ ...newSignatory, partyRole: value })
                  }
                >
                  <SelectTrigger className="h-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {PARTY_ROLES.map((role) => (
                      <SelectItem key={role.value} value={role.value}>
                        {role.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Party Name *</Label>
                <Input
                  className="h-9"
                  placeholder="John Smith"
                  value={newSignatory.partyName}
                  onChange={(e) =>
                    setNewSignatory({ ...newSignatory, partyName: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Party Email</Label>
                <Input
                  className="h-9"
                  type="email"
                  placeholder="john@example.com"
                  value={newSignatory.partyEmail}
                  onChange={(e) =>
                    setNewSignatory({ ...newSignatory, partyEmail: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">Party Title</Label>
                <Input
                  className="h-9"
                  placeholder="CEO, VP of Sales, etc."
                  value={newSignatory.partyTitle}
                  onChange={(e) =>
                    setNewSignatory({ ...newSignatory, partyTitle: e.target.value })
                  }
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Party Company</Label>
                <Input
                  className="h-9"
                  placeholder="Company name"
                  value={newSignatory.partyCompany}
                  onChange={(e) =>
                    setNewSignatory({ ...newSignatory, partyCompany: e.target.value })
                  }
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAddForm(false)}
              >
                Cancel
              </Button>
              <Button size="sm" onClick={handleAddSignatory}>
                Add Signatory
              </Button>
            </div>
          </div>
        </div>
      ) : (
        <Button
          variant="outline"
          size="sm"
          className="w-full mt-4"
          onClick={() => setShowAddForm(true)}
        >
          <Plus className="w-4 h-4 mr-1" />
          Add Signatory
        </Button>
      )}
    </InlinePanelSection>
  )
}
