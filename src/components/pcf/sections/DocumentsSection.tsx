'use client'

import { useState } from 'react'
import { format, formatDistanceToNow } from 'date-fns'
import {
  Download,
  Eye,
  File,
  FileImage,
  FileText,
  FileSpreadsheet,
  Folder,
  MoreVertical,
  Trash2,
  Upload,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { InlinePanel, InlinePanelSection } from '@/components/ui/inline-panel'
import { cn } from '@/lib/utils'
import { EmptyState } from '@/components/pcf/shared/EmptyState'

// File type icons
const FILE_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  default: File,
}

const DOCUMENT_CATEGORY_CONFIG = {
  contract: { color: 'bg-blue-100 text-blue-700', label: 'Contract' },
  resume: { color: 'bg-green-100 text-green-700', label: 'Resume' },
  proposal: { color: 'bg-purple-100 text-purple-700', label: 'Proposal' },
  invoice: { color: 'bg-amber-100 text-amber-700', label: 'Invoice' },
  report: { color: 'bg-cyan-100 text-cyan-700', label: 'Report' },
  other: { color: 'bg-charcoal-100 text-charcoal-700', label: 'Other' },
} as const

interface DocumentType {
  id: string
  filename: string
  file_size: number
  category?: string
  description?: string
  url?: string
  created_at: string
}

interface DocumentsSectionProps {
  entityType: string
  entityId: string
  documents?: DocumentType[]
  isLoading?: boolean
  onUpload?: () => void
  onDownload?: (doc: DocumentType) => void
  onPreview?: (doc: DocumentType) => void
  onDelete?: (doc: DocumentType) => void
}

export function DocumentsSection({
  entityType: _entityType,
  entityId: _entityId,
  documents = [],
  isLoading = false,
  onUpload,
  onDownload,
  onPreview,
  onDelete,
}: DocumentsSectionProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  const selectedDoc = documents.find((d) => d.id === selectedDocId)

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase() || ''
    return FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default
  }

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="bg-white animate-pulse">
            <CardContent className="py-4">
              <div className="h-20 bg-charcoal-100 rounded" />
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        config={{
          icon: Folder,
          title: 'No documents yet',
          description: 'Upload documents to keep everything organized',
          action: onUpload ? { label: 'Upload Document', onClick: onUpload } : undefined,
        }}
        variant="inline"
      />
    )
  }

  return (
    <div className="flex gap-4">
      {/* Document Grid */}
      <div
        className={cn(
          'flex-1 transition-all duration-300',
          selectedDocId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
        )}
      >
        {/* Header */}
        {onUpload && (
          <div className="flex justify-end mb-4">
            <Button onClick={onUpload} size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
          </div>
        )}

        {/* Document cards */}
        <div className="grid grid-cols-2 gap-4">
          {documents.map((doc) => {
            const FileIcon = getFileIcon(doc.filename)
            const categoryConfig = DOCUMENT_CATEGORY_CONFIG[doc.category as keyof typeof DOCUMENT_CATEGORY_CONFIG]
              || DOCUMENT_CATEGORY_CONFIG.other

            return (
              <Card
                key={doc.id}
                className={cn(
                  'bg-white cursor-pointer transition-all duration-200',
                  selectedDocId === doc.id
                    ? 'ring-2 ring-gold-500 bg-gold-50/30'
                    : 'hover:shadow-sm'
                )}
                onClick={() => setSelectedDocId(doc.id)}
              >
                <CardContent className="py-4">
                  <div className="flex items-start gap-3">
                    {/* File icon */}
                    <div className="p-2 bg-charcoal-100 rounded-lg">
                      <FileIcon className="w-5 h-5 text-charcoal-600" />
                    </div>

                    {/* Content */}
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-charcoal-900 truncate" title={doc.filename}>
                        {doc.filename}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge className={cn('text-xs', categoryConfig.color)}>
                          {categoryConfig.label}
                        </Badge>
                        <span className="text-xs text-charcoal-500">
                          {formatFileSize(doc.file_size)}
                        </span>
                      </div>
                      <p className="text-xs text-charcoal-400 mt-1">
                        {formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}
                      </p>
                    </div>

                    {/* Actions */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {onPreview && (
                          <DropdownMenuItem onClick={() => onPreview(doc)}>
                            <Eye className="w-4 h-4 mr-2" />
                            Preview
                          </DropdownMenuItem>
                        )}
                        {onDownload && (
                          <DropdownMenuItem onClick={() => onDownload(doc)}>
                            <Download className="w-4 h-4 mr-2" />
                            Download
                          </DropdownMenuItem>
                        )}
                        {onDelete && (
                          <>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600" onClick={() => onDelete(doc)}>
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </>
                        )}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Inline Panel */}
      <InlinePanel
        isOpen={!!selectedDoc}
        onClose={() => setSelectedDocId(null)}
        title={selectedDoc?.filename || 'Document'}
        description="Document details"
        width="md"
        actions={
          <div className="flex gap-2">
            {onDownload && selectedDoc && (
              <Button variant="outline" className="flex-1" onClick={() => onDownload(selectedDoc)}>
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
            )}
            {onPreview && selectedDoc && (
              <Button className="flex-1" onClick={() => onPreview(selectedDoc)}>
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            )}
          </div>
        }
      >
        {selectedDoc && (
          <>
            <InlinePanelSection title="File Information">
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Filename</span>
                  <span className="font-medium truncate max-w-[200px]">{selectedDoc.filename}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Size</span>
                  <span className="font-medium">{formatFileSize(selectedDoc.file_size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Category</span>
                  <Badge className={DOCUMENT_CATEGORY_CONFIG[selectedDoc.category as keyof typeof DOCUMENT_CATEGORY_CONFIG]?.color || DOCUMENT_CATEGORY_CONFIG.other.color}>
                    {DOCUMENT_CATEGORY_CONFIG[selectedDoc.category as keyof typeof DOCUMENT_CATEGORY_CONFIG]?.label || DOCUMENT_CATEGORY_CONFIG.other.label}
                  </Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-charcoal-500">Uploaded</span>
                  <span className="font-medium">
                    {format(new Date(selectedDoc.created_at), 'MMM d, yyyy')}
                  </span>
                </div>
              </div>
            </InlinePanelSection>

            {selectedDoc.description && (
              <InlinePanelSection title="Description">
                <p className="text-sm text-charcoal-700">{selectedDoc.description}</p>
              </InlinePanelSection>
            )}
          </>
        )}
      </InlinePanel>
    </div>
  )
}
