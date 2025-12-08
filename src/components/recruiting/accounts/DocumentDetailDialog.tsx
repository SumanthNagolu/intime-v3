'use client'

import { useState, useEffect } from 'react'
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
import { Badge } from '@/components/ui/badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Loader2, Trash2, Edit, X, Check, ExternalLink, Calendar, DollarSign, FileText } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'
import { format, formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface DocumentDetailDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  documentId: string | null
  accountId: string
}

const contractTypeOptions = [
  { value: 'msa', label: 'MSA' },
  { value: 'sow', label: 'SOW' },
  { value: 'nda', label: 'NDA' },
  { value: 'amendment', label: 'Amendment' },
  { value: 'addendum', label: 'Addendum' },
  { value: 'other', label: 'Other' },
]

const statusOptions = [
  { value: 'draft', label: 'Draft' },
  { value: 'pending_review', label: 'Pending Review' },
  { value: 'active', label: 'Active' },
  { value: 'expired', label: 'Expired' },
  { value: 'terminated', label: 'Terminated' },
]

const contractTypeConfig: Record<string, { label: string; color: string }> = {
  msa: { label: 'MSA', color: 'bg-blue-100 text-blue-700' },
  sow: { label: 'SOW', color: 'bg-purple-100 text-purple-700' },
  nda: { label: 'NDA', color: 'bg-amber-100 text-amber-700' },
  amendment: { label: 'Amendment', color: 'bg-cyan-100 text-cyan-700' },
  addendum: { label: 'Addendum', color: 'bg-teal-100 text-teal-700' },
  other: { label: 'Other', color: 'bg-charcoal-100 text-charcoal-700' },
}

const statusConfig: Record<string, { label: string; color: string }> = {
  draft: { label: 'Draft', color: 'bg-charcoal-100 text-charcoal-600' },
  pending_review: { label: 'Pending Review', color: 'bg-amber-100 text-amber-700' },
  active: { label: 'Active', color: 'bg-green-100 text-green-700' },
  expired: { label: 'Expired', color: 'bg-red-100 text-red-700' },
  terminated: { label: 'Terminated', color: 'bg-charcoal-200 text-charcoal-700' },
}

export function DocumentDetailDialog({
  open,
  onOpenChange,
  documentId,
  accountId,
}: DocumentDetailDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [isEditing, setIsEditing] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)

  // Form state
  const [name, setName] = useState('')
  const [contractType, setContractType] = useState('other')
  const [status, setStatus] = useState('draft')
  const [value, setValue] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [paymentTermsDays, setPaymentTermsDays] = useState('')
  const [notes, setNotes] = useState('')

  // Fetch document data
  const documentQuery = trpc.crm.contracts.getById.useQuery(
    { id: documentId! },
    { enabled: !!documentId && open }
  )

  // Update mutation
  const updateMutation = trpc.crm.contracts.update.useMutation({
    onSuccess: () => {
      toast({ title: 'Document updated' })
      utils.crm.contracts.listByAccount.invalidate({ accountId })
      setIsEditing(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Delete mutation
  const deleteMutation = trpc.crm.contracts.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Document deleted' })
      utils.crm.contracts.listByAccount.invalidate({ accountId })
      onOpenChange(false)
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
    },
  })

  // Populate form when document data loads
  useEffect(() => {
    if (documentQuery.data) {
      const d = documentQuery.data
      setName(d.name || '')
      setContractType(d.contract_type || 'other')
      setStatus(d.status || 'draft')
      setValue(d.value?.toString() || '')
      setCurrency(d.currency || 'USD')
      setPaymentTermsDays(d.payment_terms_days?.toString() || '')
      setNotes(d.notes || '')
    }
  }, [documentQuery.data])

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      setIsEditing(false)
    }
  }, [open])

  const handleSave = () => {
    if (!documentId) return
    updateMutation.mutate({
      id: documentId,
      name: name.trim(),
      contractType: contractType as 'msa' | 'sow' | 'nda' | 'amendment' | 'addendum' | 'other',
      status: status as 'draft' | 'pending_review' | 'active' | 'expired' | 'terminated',
      value: value ? parseFloat(value) : null,
      currency,
      paymentTermsDays: paymentTermsDays ? parseInt(paymentTermsDays) : null,
      notes: notes.trim() || null,
    })
  }

  const handleDelete = () => {
    if (!documentId) return
    deleteMutation.mutate({ id: documentId })
  }

  const formatCurrency = (value: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value)
  }

  const document = documentQuery.data
  const typeConfig = document ? contractTypeConfig[document.contract_type] || contractTypeConfig.other : contractTypeConfig.other
  const statusCfg = document ? statusConfig[document.status] || statusConfig.draft : statusConfig.draft

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>
                {isEditing ? 'Edit Document' : 'Document Details'}
              </DialogTitle>
              <DialogDescription>
                {isEditing ? 'Update document information' : 'View contract/document details'}
              </DialogDescription>
            </div>
            {!isEditing && document && (
              <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                <Edit className="w-4 h-4 mr-2" />
                Edit
              </Button>
            )}
          </div>
        </DialogHeader>

        {documentQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : document ? (
          isEditing ? (
            // Edit Mode
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contractType">Type</Label>
                  <Select value={contractType} onValueChange={setContractType}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {contractTypeOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="status">Status</Label>
                  <Select value={status} onValueChange={setStatus}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {statusOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="value">Value</Label>
                  <Input
                    id="value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentTerms">Payment Terms (Net days)</Label>
                  <Input
                    id="paymentTerms"
                    type="number"
                    value={paymentTermsDays}
                    onChange={(e) => setPaymentTermsDays(e.target.value)}
                    placeholder="30"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes">Notes</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          ) : (
            // View Mode
            <div className="py-4 space-y-6">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <Badge className={cn('text-xs', typeConfig.color)}>
                    {typeConfig.label}
                  </Badge>
                  <Badge className={cn('text-xs', statusCfg.color)}>
                    {statusCfg.label}
                  </Badge>
                </div>
                <h3 className="text-lg font-semibold">{document.name}</h3>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                {document.value && (
                  <div className="flex items-center gap-2">
                    <DollarSign className="w-4 h-4 text-charcoal-400" />
                    <span>{formatCurrency(document.value, document.currency)}</span>
                  </div>
                )}
                {document.payment_terms_days && (
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-charcoal-400" />
                    <span>Net {document.payment_terms_days} days</span>
                  </div>
                )}
                {document.start_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-charcoal-400" />
                    <span>Starts: {format(new Date(document.start_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {document.end_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-charcoal-400" />
                    <span>Ends: {format(new Date(document.end_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
                {document.signed_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-charcoal-400" />
                    <span>Signed: {format(new Date(document.signed_date), 'MMM d, yyyy')}</span>
                  </div>
                )}
              </div>

              {document.notes && (
                <div>
                  <h4 className="font-medium text-charcoal-700 mb-2">Notes</h4>
                  <div className="bg-charcoal-50 rounded-lg p-4">
                    <p className="whitespace-pre-wrap text-sm">{document.notes}</p>
                  </div>
                </div>
              )}

              {document.document_url && (
                <div>
                  <a
                    href={document.document_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-hublot-600 hover:text-hublot-700"
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Document
                  </a>
                </div>
              )}

              <div className="text-xs text-charcoal-500">
                Added {formatDistanceToNow(new Date(document.created_at), { addSuffix: true })}
              </div>
            </div>
          )
        ) : (
          <div className="text-center py-8 text-charcoal-500">
            Document not found
          </div>
        )}

        <DialogFooter>
          {isEditing ? (
            <>
              <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                <AlertDialogTrigger asChild>
                  <Button variant="outline" className="text-red-600 mr-auto">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Delete Document?</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete this document. This action cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={handleDelete}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      Delete
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>

              <Button variant="outline" onClick={() => setIsEditing(false)}>
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
              <Button onClick={handleSave} disabled={updateMutation.isPending || !name.trim()}>
                {updateMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                <Check className="w-4 h-4 mr-2" />
                Save Changes
              </Button>
            </>
          ) : (
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
