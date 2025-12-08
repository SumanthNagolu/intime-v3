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
import { FileUpload } from '@/components/ui/file-upload'
import { Loader2 } from 'lucide-react'

interface AddDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  accountId: string
}

const contractTypes = [
  { value: 'msa', label: 'Master Service Agreement (MSA)' },
  { value: 'sow', label: 'Statement of Work (SOW)' },
  { value: 'nda', label: 'Non-Disclosure Agreement (NDA)' },
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

export function AddDocumentDialog({ open, onOpenChange, accountId }: AddDocumentDialogProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [name, setName] = useState('')
  const [contractType, setContractType] = useState<string>('')
  const [status, setStatus] = useState('draft')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [value, setValue] = useState('')
  const [paymentTermsDays, setPaymentTermsDays] = useState('')
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
    setContractType('')
    setStatus('draft')
    setStartDate('')
    setEndDate('')
    setValue('')
    setPaymentTermsDays('')
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
        contractType: contractType as 'msa' | 'sow' | 'nda' | 'amendment' | 'addendum' | 'other',
        status: status as 'draft' | 'pending_review' | 'active' | 'expired' | 'terminated',
        startDate: startDate ? new Date(startDate).toISOString() : undefined,
        endDate: endDate ? new Date(endDate).toISOString() : undefined,
        value: value ? parseFloat(value) : undefined,
        paymentTermsDays: paymentTermsDays ? parseInt(paymentTermsDays) : undefined,
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
    } catch (error: any) {
      toast({
        title: 'Error adding document',
        description: error.message || 'Something went wrong',
        variant: 'error'
      })
    } finally {
      setIsUploading(false)
    }
  }

  const isPending = createMutation.isPending || uploadMutation.isPending || isUploading

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Add Document</DialogTitle>
          <DialogDescription>
            Add a contract or document to this account (MSA, SOW, NDA, etc.)
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* File Upload */}
          <div>
            <Label>Attachment</Label>
            <FileUpload
              value={fileData}
              onChange={handleFileChange}
              accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.rtf"
              maxSize={10 * 1024 * 1024} // 10MB
              placeholder="PDF, Word, Excel, PowerPoint (max 10MB)"
              preview={true}
              className="mt-1"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <Label htmlFor="name">Document Name *</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., MSA 2024"
                required
              />
            </div>

            <div>
              <Label htmlFor="contractType">Document Type *</Label>
              <Select value={contractType} onValueChange={setContractType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {contractTypes.map((type) => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="status">Status</Label>
              <Select value={status} onValueChange={setStatus}>
                <SelectTrigger>
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

            <div>
              <Label htmlFor="startDate">Start Date</Label>
              <Input
                id="startDate"
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="endDate">End Date</Label>
              <Input
                id="endDate"
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <Label htmlFor="value">Contract Value ($)</Label>
              <Input
                id="value"
                type="number"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                placeholder="0"
                min="0"
              />
            </div>

            <div>
              <Label htmlFor="paymentTerms">Payment Terms (days)</Label>
              <Input
                id="paymentTerms"
                type="number"
                value={paymentTermsDays}
                onChange={(e) => setPaymentTermsDays(e.target.value)}
                placeholder="e.g., 30"
                min="0"
              />
            </div>

            <div className="col-span-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Additional notes about this document..."
                rows={2}
              />
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={isPending}>
              {isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {isUploading ? 'Uploading...' : 'Add Document'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
