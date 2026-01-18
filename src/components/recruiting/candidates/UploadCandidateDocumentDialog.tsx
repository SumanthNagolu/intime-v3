'use client'

import { useState } from 'react'
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
import { Upload, Loader2, File, X } from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { toast } from 'sonner'

interface UploadCandidateDocumentDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  candidateId: string
  candidateName: string
  onSuccess?: () => void
}

const DOCUMENT_TYPES = [
  { value: 'resume', label: 'Resume' },
  { value: 'cover_letter', label: 'Cover Letter' },
  { value: 'id_document', label: 'ID Document' },
  { value: 'certification', label: 'Certification' },
  { value: 'reference_letter', label: 'Reference Letter' },
  { value: 'background_check', label: 'Background Check' },
  { value: 'drug_test', label: 'Drug Test' },
  { value: 'i9', label: 'I-9 Form' },
  { value: 'w4', label: 'W-4 Form' },
  { value: 'w9', label: 'W-9 Form' },
  { value: 'direct_deposit', label: 'Direct Deposit Form' },
  { value: 'nda', label: 'NDA' },
  { value: 'msa', label: 'MSA' },
  { value: 'sow', label: 'Statement of Work' },
  { value: 'coi', label: 'Certificate of Insurance' },
  { value: 'insurance', label: 'Insurance' },
  { value: 'contract', label: 'Contract' },
  { value: 'other', label: 'Other' },
] as const

export function UploadCandidateDocumentDialog({
  open,
  onOpenChange,
  candidateId,
  candidateName,
  onSuccess,
}: UploadCandidateDocumentDialogProps) {
  const [file, setFile] = useState<File | null>(null)
  const [name, setName] = useState('')
  const [documentType, setDocumentType] = useState('other')
  const [description, setDescription] = useState('')
  const [uploading, setUploading] = useState(false)

  const uploadMutation = trpc.documents.upload.useMutation({
    onSuccess: () => {
      toast.success('Document uploaded successfully')
      resetForm()
      onOpenChange(false)
      onSuccess?.()
    },
    onError: (error) => {
      toast.error(error.message || 'Failed to upload document')
    },
  })

  const resetForm = () => {
    setFile(null)
    setName('')
    setDocumentType('other')
    setDescription('')
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!name) {
        setName(selectedFile.name.replace(/\.[^/.]+$/, ''))
      }
    }
  }

  const clearFile = () => {
    setFile(null)
    const fileInput = document.getElementById('candidate-doc-upload') as HTMLInputElement
    if (fileInput) fileInput.value = ''
  }

  const handleUpload = async () => {
    if (!file) {
      toast.error('Please select a file')
      return
    }

    if (!name.trim()) {
      toast.error('Please enter a document name')
      return
    }

    setUploading(true)
    try {
      // Convert file to base64
      const fileData = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader()
        reader.onload = () => resolve(reader.result as string)
        reader.onerror = reject
        reader.readAsDataURL(file)
      })

      // Upload via server-side mutation (bypasses RLS)
      await uploadMutation.mutateAsync({
        entityType: 'candidate',
        entityId: candidateId,
        fileName: file.name,
        fileData,
        mimeType: file.type || 'application/octet-stream',
        fileSizeBytes: file.size,
        documentType: documentType as 'other',
        documentCategory: 'general',
        description: description || undefined,
      })
    } catch (error) {
      console.error('Upload error:', error)
      toast.error(error instanceof Error ? error.message : 'Failed to upload')
    } finally {
      setUploading(false)
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / 1024 / 1024).toFixed(2)} MB`
  }

  const isLoading = uploading || uploadMutation.isPending

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Upload Document</DialogTitle>
          <DialogDescription>Upload a document for {candidateName}.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* File Upload */}
          <div className="space-y-2">
            <Label>File</Label>
            <div className="border-2 border-dashed border-charcoal-200 rounded-lg p-6 text-center hover:border-hublot-500 transition-colors">
              <input
                type="file"
                onChange={handleFileChange}
                className="hidden"
                id="candidate-doc-upload"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg,.gif"
              />
              <label htmlFor="candidate-doc-upload" className="cursor-pointer">
                {file ? (
                  <div className="flex items-center justify-center gap-3">
                    <File className="w-8 h-8 text-hublot-600" />
                    <div className="text-left flex-1">
                      <p className="font-medium text-charcoal-900 truncate max-w-[280px]">
                        {file.name}
                      </p>
                      <p className="text-sm text-charcoal-500">{formatFileSize(file.size)}</p>
                    </div>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={(e) => {
                        e.preventDefault()
                        e.stopPropagation()
                        clearFile()
                      }}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                ) : (
                  <>
                    <Upload className="w-10 h-10 text-charcoal-400 mx-auto mb-2" />
                    <p className="text-sm text-charcoal-600">Click to upload or drag and drop</p>
                    <p className="text-xs text-charcoal-400 mt-1">PDF, DOC, XLS, images up to 10MB</p>
                  </>
                )}
              </label>
            </div>
          </div>

          {/* Name */}
          <div className="space-y-2">
            <Label htmlFor="doc-name">Document Name</Label>
            <Input
              id="doc-name"
              placeholder="e.g., Background Check Results"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Document Type */}
          <div className="space-y-2">
            <Label>Document Type</Label>
            <Select value={documentType} onValueChange={setDocumentType}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {DOCUMENT_TYPES.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label htmlFor="doc-description">Description (Optional)</Label>
            <Textarea
              id="doc-description"
              placeholder="Brief description of this document..."
              rows={2}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button type="button" onClick={handleUpload} disabled={isLoading}>
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export default UploadCandidateDocumentDialog
