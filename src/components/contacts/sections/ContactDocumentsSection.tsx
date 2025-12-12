'use client'

import { useState } from 'react'
import { formatDistanceToNow, format } from 'date-fns'
import {
  FolderOpen,
  File,
  FileText,
  FileImage,
  Download,
  Eye,
  Trash2,
  Upload,
  Loader2,
  MoreVertical,
  AlertTriangle,
  Calendar,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
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
import { EmptyState } from '@/components/pcf/shared/EmptyState'
import { useToast } from '@/components/ui/use-toast'

interface ContactDocumentsSectionProps {
  contactId: string
}

// Document type config
const documentTypeConfig: Record<string, { label: string; color: string }> = {
  resume: { label: 'Resume', color: 'bg-blue-100 text-blue-700' },
  cover_letter: { label: 'Cover Letter', color: 'bg-purple-100 text-purple-700' },
  id_document: { label: 'ID Document', color: 'bg-amber-100 text-amber-700' },
  certification: { label: 'Certification', color: 'bg-green-100 text-green-700' },
  reference_letter: { label: 'Reference', color: 'bg-cyan-100 text-cyan-700' },
  background_check: { label: 'Background Check', color: 'bg-red-100 text-red-700' },
  i9: { label: 'I-9', color: 'bg-indigo-100 text-indigo-700' },
  w4: { label: 'W-4', color: 'bg-teal-100 text-teal-700' },
  contract: { label: 'Contract', color: 'bg-orange-100 text-orange-700' },
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

export function ContactDocumentsSection({ contactId }: ContactDocumentsSectionProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()
  const [selectedId, setSelectedId] = useState<string | null>(null)

  // Fetch documents using the unified documents router
  const documentsQuery = trpc.documents.listByEntity.useQuery({
    entityType: 'contact',
    entityId: contactId,
    latestOnly: true,
    limit: 50,
  })

  // Delete mutation
  const deleteMutation = trpc.documents.delete.useMutation({
    onSuccess: () => {
      toast({ title: 'Document deleted' })
      utils.documents.listByEntity.invalidate({ entityType: 'contact', entityId: contactId })
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

  const handleUpload = () => {
    // TODO: Implement upload dialog/flow
    toast({
      title: 'Upload Document',
      description: 'Document upload will open Supabase storage picker',
    })
  }

  if (documentsQuery.isLoading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <Loader2 className="w-6 h-6 animate-spin text-charcoal-400" />
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          config={{
            icon: FolderOpen,
            title: 'No Documents',
            description: 'Upload resumes, certifications, ID documents, and more.',
            action: {
              label: 'Upload Document',
              onClick: handleUpload,
            },
          }}
          variant="inline"
        />
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-charcoal-900">
          Documents ({documents.length})
        </h2>
        <Button size="sm" onClick={handleUpload}>
          <Upload className="w-4 h-4 mr-1" />
          Upload
        </Button>
      </div>

      {/* Documents List */}
      <div className="space-y-3">
        {documents.map((doc) => {
          const typeConfig = documentTypeConfig[doc.documentType] || documentTypeConfig.other
          const FileIcon = getFileIcon(doc.mimeType)
          const isExpiring = doc.expiresAt && new Date(doc.expiresAt) < new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)

          return (
            <Card
              key={doc.id}
              className={cn(
                'bg-white transition-colors cursor-pointer',
                selectedId === doc.id ? 'ring-2 ring-hublot-500' : 'hover:bg-charcoal-50'
              )}
              onClick={() => setSelectedId(selectedId === doc.id ? null : doc.id)}
            >
              <CardContent className="p-4">
                <div className="flex items-start gap-3">
                  {/* File Icon */}
                  <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                    <FileIcon className="w-5 h-5 text-charcoal-600" />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="font-medium text-charcoal-900 truncate">{doc.fileName}</p>
                      {isExpiring && (
                        <AlertTriangle className="w-4 h-4 text-amber-500 flex-shrink-0" />
                      )}
                    </div>
                    <div className="flex items-center gap-2 mt-1 flex-wrap">
                      <Badge className={cn('text-xs', typeConfig.color)}>
                        {typeConfig.label}
                      </Badge>
                      {doc.version > 1 && (
                        <Badge variant="outline" className="text-xs">
                          v{doc.version}
                        </Badge>
                      )}
                      <span className="text-xs text-charcoal-400">
                        {formatFileSize(doc.fileSizeBytes)}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 mt-2 text-xs text-charcoal-400">
                      <span>
                        Uploaded {formatDistanceToNow(new Date(doc.createdAt), { addSuffix: true })}
                      </span>
                      {doc.expiresAt && (
                        <span className={cn('flex items-center gap-1', isExpiring && 'text-amber-600')}>
                          <Calendar className="w-3 h-3" />
                          Expires {format(new Date(doc.expiresAt), 'MMM d, yyyy')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                      <Button variant="ghost" size="icon" className="flex-shrink-0">
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

                {/* Expanded Details */}
                {selectedId === doc.id && doc.description && (
                  <div className="mt-4 pt-4 border-t">
                    <p className="text-sm text-charcoal-600">{doc.description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
