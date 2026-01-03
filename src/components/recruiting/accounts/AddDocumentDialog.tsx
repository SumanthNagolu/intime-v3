'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
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
import { Switch } from '@/components/ui/switch'
import { FileUpload } from '@/components/ui/file-upload'
import { Loader2, FileSignature, Shield, FileText, FileCheck2, FilePlus, FileCode } from 'lucide-react'
import { cn } from '@/lib/utils'

interface AddDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
}

const contractTypes = [
  { value: 'msa', label: 'MSA', fullLabel: 'Master Service Agreement', icon: <FileSignature className="w-4 h-4" /> },
  { value: 'sow', label: 'SOW', fullLabel: 'Statement of Work', icon: <FileText className="w-4 h-4" /> },
  { value: 'nda', label: 'NDA', fullLabel: 'Non-Disclosure Agreement', icon: <Shield className="w-4 h-4" /> },
  { value: 'amendment', label: 'Amendment', fullLabel: 'Amendment', icon: <FilePlus className="w-4 h-4" /> },
  { value: 'addendum', label: 'Addendum', fullLabel: 'Addendum', icon: <FileCode className="w-4 h-4" /> },
  { value: 'rate_card_agreement', label: 'Rate Card', fullLabel: 'Rate Card Agreement', icon: <FileCheck2 className="w-4 h-4" /> },
  { value: 'other', label: 'Other', fullLabel: 'Other Document', icon: <FileText className="w-4 h-4" /> },
]

const statusOptions = [
  { value: 'draft', label: 'Draft', description: 'Document is being prepared' },
  { value: 'pending_review', label: 'Pending Review', description: 'Awaiting legal/management review' },
  { value: 'pending_signature', label: 'Pending Signature', description: 'Sent for signatures' },
  { value: 'active', label: 'Active', description: 'Fully executed and in effect' },
  { value: 'expired', label: 'Expired', description: 'Past expiration date' },
  { value: 'terminated', label: 'Terminated', description: 'Contract was terminated early' },
]

const categoryOptions = [
  { value: 'legal', label: 'Legal' },
  { value: 'compliance', label: 'Compliance' },
  { value: 'hr', label: 'HR' },
  { value: 'operational', label: 'Operational' },
  { value: 'general', label: 'General' },
]

export function AddDocumentDialog({ open, onOpenChange, accountId }: AddDocumentDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  // Form state
  const [name, setName] = useState('')
  const [contractNumber, setContractNumber] = useState('')
  const [contractType, setContractType] = useState<string>('')
  const [category, setCategory] = useState<string>('')
  const [status, setStatus] = useState('draft')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [value, setValue] = useState('')
  const [currency, setCurrency] = useState('USD')
  const [paymentTermsDays, setPaymentTermsDays] = useState('')
  const [autoRenew, setAutoRenew] = useState(false)
  const [renewalTermMonths, setRenewalTermMonths] = useState('')
  const [renewalNoticeDays, setRenewalNoticeDays] = useState('30')
  const [notes, setNotes] = useState('')

  // File upload state
  const [fileData, setFileData] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [fileMimeType, setFileMimeType] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)

  const createMutation = trpc.crm.contracts.create.useMutation()
  const uploadMutation = trpc.crm.contracts.uploadFile.useMutation()

  const resetForm = () => {
    setName('')
    setContractNumber('')
    setContractType('')
    setCategory('')
    setStatus('draft')
    setStartDate('')
    setEndDate('')
    setValue('')
    setCurrency('USD')
    setPaymentTermsDays('')
    setAutoRenew(false)
    setRenewalTermMonths('')
    setRenewalNoticeDays('30')
    setNotes('')
    setFileData(null)
    setFileName(null)
    setFileMimeType(null)
  }

  const handleFileChange = (value: string | null, file?: File) => {
    setFileData(value)
    if (file) {
      setFileName(file.name)
      setFileMimeType(file.type)
      // Auto-fill document name if empty
      if (!name) {
        const nameWithoutExt = file.name.replace(/\.[^/.]+$/, '')
        setName(nameWithoutExt)
      }
    } else {
      setFileName(null)
      setFileMimeType(null)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!name.trim() || !contractType) {
      toast({ title: 'Please fill in required fields', variant: 'error' })
      return
    }

    setIsUploading(true)

    try {
      // First create the contract record
      const contract = await createMutation.mutateAsync({
        accountId,
        name: name.trim(),
        contractNumber: contractNumber.trim() || undefined,
        contractType: contractType as 'msa' | 'sow' | 'nda' | 'amendment' | 'addendum' | 'rate_card_agreement' | 'sla' | 'vendor_agreement' | 'other',
        category: category || undefined,
        status: status as 'draft' | 'pending_review' | 'pending_signature' | 'active' | 'expired' | 'terminated',
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        value: value ? parseFloat(value) : undefined,
        currency,
        paymentTermsDays: paymentTermsDays ? parseInt(paymentTermsDays) : undefined,
        autoRenew,
        renewalTermMonths: renewalTermMonths ? parseInt(renewalTermMonths) : undefined,
        renewalNoticeDays: renewalNoticeDays ? parseInt(renewalNoticeDays) : 30,
        notes: notes.trim() || undefined,
      })

      // If we have a file, upload it
      if (fileData && fileName && fileMimeType && contract?.id) {
        await uploadMutation.mutateAsync({
          accountId,
          contractId: contract.id,
          fileData,
          fileName,
          mimeType: fileMimeType,
        })
      }

      utils.crm.contracts.listByAccount.invalidate({ accountId })
      toast({ title: 'Document added successfully' })
      onOpenChange(false)
      resetForm()
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Something went wrong'
      toast({
        title: 'Error adding document',
        description: errorMessage,
        variant: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const isPending = createMutation.isPending || uploadMutation.isPending || isUploading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-charcoal-900">Add Document</DialogTitle>
            <DialogDescription className="text-sm text-charcoal-600">
              Add a contract or document to this account (MSA, SOW, NDA, etc.)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* File Upload */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-charcoal-700">Attachment</Label>
              <FileUpload
                value={fileData}
                onChange={handleFileChange}
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
                maxSize={10 * 1024 * 1024}
                placeholder="PDF, Word, Excel, PowerPoint (max 10MB)"
                preview={true}
              />
            </div>

            {/* Document Type Selection - Visual Cards */}
            <div className="space-y-2">
              <Label className="text-sm font-medium text-charcoal-700">Document Type *</Label>
              <div className="grid grid-cols-4 gap-2">
                {contractTypes.slice(0, 4).map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setContractType(type.value)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200',
                      contractType === type.value
                        ? 'border-gold-500 bg-gold-50 text-charcoal-900 shadow-sm'
                        : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-600 hover:bg-charcoal-50'
                    )}
                  >
                    {type.icon}
                    <span className="text-xs mt-1 font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-2">
                {contractTypes.slice(4).map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setContractType(type.value)}
                    className={cn(
                      'flex flex-col items-center justify-center p-3 rounded-lg border-2 transition-all duration-200',
                      contractType === type.value
                        ? 'border-gold-500 bg-gold-50 text-charcoal-900 shadow-sm'
                        : 'border-charcoal-200 hover:border-charcoal-300 text-charcoal-600 hover:bg-charcoal-50'
                    )}
                  >
                    {type.icon}
                    <span className="text-xs mt-1 font-medium">{type.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Document Name and Number */}
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label htmlFor="name" className="text-sm font-medium text-charcoal-700">Document Name *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g., MSA 2026"
                  className="h-10"
                  required
                />
              </div>
              <div className="col-span-2 sm:col-span-1 space-y-2">
                <Label htmlFor="contractNumber" className="text-sm font-medium text-charcoal-700">Contract Number</Label>
                <Input
                  id="contractNumber"
                  value={contractNumber}
                  onChange={(e) => setContractNumber(e.target.value)}
                  placeholder="e.g., CON-2026-001"
                  className="h-10"
                />
              </div>
            </div>

            {/* Status and Category */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="status" className="text-sm font-medium text-charcoal-700">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {statusOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="category" className="text-sm font-medium text-charcoal-700">Category</Label>
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger className="h-10">
                    <SelectValue placeholder="Select category" />
                  </SelectTrigger>
                  <SelectContent>
                    {categoryOptions.map((opt) => (
                      <SelectItem key={opt.value} value={opt.value}>
                        {opt.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Dates */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate" className="text-sm font-medium text-charcoal-700">Effective Date</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="h-10"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate" className="text-sm font-medium text-charcoal-700">Expiry Date</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="h-10"
                />
              </div>
            </div>

            {/* Financial */}
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="value" className="text-sm font-medium text-charcoal-700">Contract Value</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-charcoal-500">$</span>
                  <Input
                    id="value"
                    type="number"
                    value={value}
                    onChange={(e) => setValue(e.target.value)}
                    placeholder="0"
                    min="0"
                    className="h-10 pl-7"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="currency" className="text-sm font-medium text-charcoal-700">Currency</Label>
                <Select value={currency} onValueChange={setCurrency}>
                  <SelectTrigger className="h-10">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="USD">USD</SelectItem>
                    <SelectItem value="EUR">EUR</SelectItem>
                    <SelectItem value="GBP">GBP</SelectItem>
                    <SelectItem value="INR">INR</SelectItem>
                    <SelectItem value="CAD">CAD</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms" className="text-sm font-medium text-charcoal-700">Payment Terms</Label>
                <div className="relative">
                  <Input
                    id="paymentTerms"
                    type="number"
                    value={paymentTermsDays}
                    onChange={(e) => setPaymentTermsDays(e.target.value)}
                    placeholder="30"
                    min="0"
                    className="h-10 pr-12"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal-500">days</span>
                </div>
              </div>
            </div>

            {/* Auto-Renewal Section */}
            <div className="p-4 bg-charcoal-50 rounded-lg space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label className="text-sm font-medium text-charcoal-900">Auto-Renewal</Label>
                  <p className="text-xs text-charcoal-600 mt-0.5">Automatically renew this contract</p>
                </div>
                <Switch
                  checked={autoRenew}
                  onCheckedChange={setAutoRenew}
                />
              </div>

              {autoRenew && (
                <div className="grid grid-cols-2 gap-4 pt-2 border-t border-charcoal-200">
                  <div className="space-y-2">
                    <Label htmlFor="renewalTermMonths" className="text-xs font-medium text-charcoal-700">Renewal Term</Label>
                    <div className="relative">
                      <Input
                        id="renewalTermMonths"
                        type="number"
                        value={renewalTermMonths}
                        onChange={(e) => setRenewalTermMonths(e.target.value)}
                        placeholder="12"
                        min="1"
                        className="h-9 text-sm pr-16"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal-500">months</span>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="renewalNoticeDays" className="text-xs font-medium text-charcoal-700">Notice Period</Label>
                    <div className="relative">
                      <Input
                        id="renewalNoticeDays"
                        type="number"
                        value={renewalNoticeDays}
                        onChange={(e) => setRenewalNoticeDays(e.target.value)}
                        placeholder="30"
                        min="0"
                        className="h-9 text-sm pr-12"
                      />
                      <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-charcoal-500">days</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes" className="text-sm font-medium text-charcoal-700">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this document..."
                rows={3}
                className="resize-none"
              />
            </div>
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-charcoal-300"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={isPending}
              className="bg-hublot-900 hover:bg-hublot-800"
            >
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isUploading ? 'Uploading...' : 'Add Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
