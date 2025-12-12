'use client'

import { useState } from 'react'
import { formatDistanceToNow } from 'date-fns'
import {
  FileText,
  File,
  FileImage,
  Download,
  Eye,
  Plus,
  Trash2,
  Upload,
  Loader2,
  MoreVertical,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { cn } from '@/lib/utils'
import { useToast } from '@/components/ui/use-toast'

interface JobDocumentsSectionProps {
  jobId: string
}

// Document type config for job-related documents
const documentTypeConfig: Record<string, { label: string; color: string }> = {
  job_description: { label: 'Job Description', color: 'bg-blue-100 text-blue-700' },
  requirements: { label: 'Requirements', color: 'bg-purple-100 text-purple-700' },
  scorecard: { label: 'Scorecard', color: 'bg-green-100 text-green-700' },
  contract: { label: 'Contract', color: 'bg-amber-100 text-amber-700' },
  sow: { label: 'SOW', color: 'bg-orange-100 text-orange-700' },
  other: { label: 'Other', color: 'bg-charcoal-100 text-charcoal-700' },
}

// Get file icon based on mime type
function getFileIcon(mimeType: string | null) {
  if (!mimeType) return File
  if (mimeType.startsWith('image/')) return FileImage
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText
  return File
}

// Format file size
function formatFileSize(bytes: number | null): string {
  if (!bytes) return '—'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

export function JobDocumentsSection({ jobId }: JobDocumentsSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Fetch documents using the unified documents router
  const documentsQuery = trpc.documents.listByEntity.useQuery({
    entityType: 'job',
    entityId: jobId,
    latestOnly: true,
    limit: 50,
  })

  // Delete mutation
  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Document deleted' })
      utils.documents.listByEntity.invalidate({ entityType: 'job', entityId: jobId })
    },
    onError: (error) => {
      toast({ title: 'Failed to delete', description: error.message, variant: 'error' })
    },
  })

  // Log download mutation
  const logDownloadMutation = trpc.documents.logDownload.useMutation()

  const documents = documentsQuery.data?.items || []

  const handleDownload = (doc: { id: string; publicUrl: string | null; fileName: string }) => {
    if (!doc.publicUrl) {
      toast({ title: 'Download not available', description: 'No URL available for this document', variant: 'error' })
      return
    }
    logDownloadMutation.mutate({ id: doc.id })
    window.open(doc.publicUrl, '_blank')
  }

  const handleView = (doc: { id: string; publicUrl: string | null }) => {
    if (!doc.publicUrl) {
      toast({ title: 'Preview not available', variant: 'error' })
      return
    }
    window.open(doc.publicUrl, '_blank')
  }

  const handleDelete = (id: string) => {
    if (confirm('Are you sure you want to delete this document?')) {
      deleteMutation.mutate({ id })
    }
  }

  const handleAddDocument = () => {
    // TODO: Implement upload dialog/flow
    toast({
      title: 'Upload Document',
      description: 'Document upload will open Supabase storage picker',
    })
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Documents
          </CardTitle>
          <CardDescription>
            {documents.length} document{documents.length !== 1 ? 's' : ''} attached
          </CardDescription>
        </div>
        <Button onClick={handleAddDocument}>
          <Plus className="w-4 h-4 mr-2" />
          Add Document
        </Button>
      </CardHeader>
      <CardContent>
        {documentsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
          </div>
        ) : documents.length === 0 ? (
          <div className="text-center py-8">
            <FileText className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No documents attached</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Add job descriptions, interview guides, or other relevant documents
            </p>
            <Button className="mt-4" variant="outline" onClick={handleAddDocument}>
              <Upload className="w-4 h-4 mr-2" />
              Add First Document
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            {documents.map((doc) => {
              const typeConfig = documentTypeConfig[doc.documentType] || documentTypeConfig.other
              const FileIcon = getFileIcon(doc.mimeType)

              return (
                <div
                  key={doc.id}
                  className={cn(
                    'flex items-center gap-4 p-4 border rounded-lg transition-colors cursor-pointer',
                    selectedId === doc.id
                      ? 'border-hublot-500 bg-hublot-50'
                      : 'hover:border-hublot-300'
                  )}
                  onClick={() => setSelectedId(selectedId === doc.id ? null : doc.id)}
                >
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-charcoal-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-charcoal-900 truncate">{doc.fileName}</p>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className={cn('text-xs', typeConfig.color)}>
                        {typeConfig.label}
                      </Badge>
                      {doc.version > 1 && (
                        <Badge variant="outline" className="text-xs">
                          v{doc.version}
                        </Badge>
                      )}
                      <span className="text-xs text-charcoal-500">
                        {formatFileSize(doc.fileSizeBytes)}
                      </span>
                      <span className="text-xs text-charcoal-500">
                        {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                      </span>
                    </div>
                    {selectedId === doc.id && doc.description && (
                      <p className="text-sm text-charcoal-600 mt-2">{doc.description}</p>
                    )}
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon">
                        <MoreVertical className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleView(doc)}>
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleDownload(doc)}>
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-red-600"
                        onClick={() => handleDelete(doc.id)}
                      >
                        <Trash2 className="w-4 h-4 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              )
            })}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
