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
  User,
  Files,
  HardDrive,
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
import type { FullSubmission, Document } from '@/types/submission'

// File type icons
function getFileIcon(fileType: string | undefined): React.ElementType {
  if (!fileType) return File
  const type = fileType.toLowerCase()
  if (type.includes('image') || type.includes('png') || type.includes('jpg') || type.includes('jpeg')) {
    return FileImage
  }
  if (type.includes('pdf') || type.includes('doc') || type.includes('text')) {
    return FileText
  }
  if (type.includes('sheet') || type.includes('excel') || type.includes('csv')) {
    return FileSpreadsheet
  }
  return File
}

// Format file size
function formatFileSize(bytes: number | undefined): string {
  if (!bytes) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let size = bytes
  let unitIndex = 0
  while (size >= 1024 && unitIndex < units.length - 1) {
    size /= 1024
    unitIndex++
  }
  return `${size.toFixed(1)} ${units[unitIndex]}`
}

const DOCUMENT_TYPE_STYLES: Record<string, string> = {
  resume: 'bg-blue-100 text-blue-700',
  cover_letter: 'bg-purple-100 text-purple-700',
  contract: 'bg-green-100 text-green-700',
  offer_letter: 'bg-gold-100 text-gold-700',
  reference: 'bg-amber-100 text-amber-700',
  other: 'bg-charcoal-100 text-charcoal-600',
}

interface DocumentsSectionProps {
  submission: FullSubmission
}

export function DocumentsSection({ submission }: DocumentsSectionProps) {
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)
  const documents = submission.sections?.documents?.items || []
  const selectedDoc = documents.find((d) => d.id === selectedDocId)

  // Calculate stats
  const totalStorage = documents.reduce((acc, doc) => acc + (doc.file_size || 0), 0)
  const typeCount: Record<string, number> = {}
  documents.forEach((doc) => {
    const type = doc.document_type || 'other'
    typeCount[type] = (typeCount[type] || 0) + 1
  })

  if (documents.length === 0) {
    return (
      <EmptyState
        config={{
          icon: Folder,
          title: 'No documents yet',
          description: 'Upload documents to keep everything organized',
          action: { label: 'Upload Document', onClick: () => {} },
        }}
        variant="inline"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-charcoal-100 rounded-lg">
                <Files className="w-5 h-5 text-charcoal-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">{documents.length}</p>
                <p className="text-sm text-charcoal-500">Total Documents</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Folder className="w-5 h-5 text-blue-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-charcoal-900 mb-1">By Type</p>
                <div className="flex flex-wrap gap-1">
                  {Object.entries(typeCount)
                    .slice(0, 3)
                    .map(([type, count]) => (
                      <Badge
                        key={type}
                        className={cn('text-xs', DOCUMENT_TYPE_STYLES[type] || DOCUMENT_TYPE_STYLES.other)}
                      >
                        {type.replace(/_/g, ' ')}: {count}
                      </Badge>
                    ))}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white">
          <CardContent className="py-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <HardDrive className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="text-2xl font-semibold text-charcoal-900">
                  {formatFileSize(totalStorage)}
                </p>
                <p className="text-sm text-charcoal-500">Storage Used</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Documents List with Inline Panel */}
      <div className="flex gap-4">
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            selectedDocId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
          )}
        >
          {/* Header */}
          <div className="flex justify-end mb-4">
            <Button size="sm">
              <Upload className="w-4 h-4 mr-1" />
              Upload
            </Button>
          </div>

          {/* Document Cards */}
          <div className="space-y-2">
            {documents.map((doc) => {
              const Icon = getFileIcon(doc.file_type)
              return (
                <Card
                  key={doc.id}
                  className={cn(
                    'bg-white cursor-pointer transition-all duration-300',
                    selectedDocId === doc.id ? 'ring-2 ring-gold-500' : 'hover:shadow-md'
                  )}
                  onClick={() => setSelectedDocId(doc.id)}
                >
                  <CardContent className="py-3">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-charcoal-100 rounded-lg">
                        <Icon className="w-5 h-5 text-charcoal-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-charcoal-900 truncate">{doc.name}</p>
                        <div className="flex items-center gap-3 mt-0.5 text-xs text-charcoal-400">
                          <span>{formatFileSize(doc.file_size)}</span>
                          <span>•</span>
                          <span>
                            {doc.created_at
                              ? formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })
                              : '—'}
                          </span>
                        </div>
                      </div>
                      <Badge
                        className={cn(
                          'text-xs',
                          DOCUMENT_TYPE_STYLES[doc.document_type || 'other'] ||
                            DOCUMENT_TYPE_STYLES.other
                        )}
                      >
                        {(doc.document_type || 'other').replace(/_/g, ' ')}
                      </Badge>
                      <div className="flex items-center gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={(e) => {
                            e.stopPropagation()
                            // Download logic here
                          }}
                        >
                          <Download className="w-4 h-4 text-charcoal-600" />
                        </Button>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem>
                              <Eye className="w-4 h-4 mr-2" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem>
                              <Download className="w-4 h-4 mr-2" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem className="text-red-600">
                              <Trash2 className="w-4 h-4 mr-2" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
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
          title={selectedDoc?.name || 'Document'}
          description="Document details"
          width="md"
          actions={
            <div className="flex gap-2">
              <Button variant="outline" className="flex-1">
                <Download className="w-4 h-4 mr-1" />
                Download
              </Button>
              <Button className="flex-1">
                <Eye className="w-4 h-4 mr-1" />
                Preview
              </Button>
            </div>
          }
        >
          {selectedDoc && (
            <>
              <InlinePanelSection title="File Information">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Filename</span>
                    <span className="font-medium truncate max-w-[200px]">{selectedDoc.name}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Size</span>
                    <span className="font-medium">{formatFileSize(selectedDoc.file_size)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Type</span>
                    <Badge
                      className={
                        DOCUMENT_TYPE_STYLES[selectedDoc.document_type || 'other'] ||
                        DOCUMENT_TYPE_STYLES.other
                      }
                    >
                      {(selectedDoc.document_type || 'other').replace(/_/g, ' ')}
                    </Badge>
                  </div>
                  {selectedDoc.file_type && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Format</span>
                      <span className="font-medium uppercase text-xs">
                        {selectedDoc.file_type.split('/').pop()}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Uploaded</span>
                    <span className="font-medium">
                      {selectedDoc.created_at &&
                        format(new Date(selectedDoc.created_at), 'MMM d, yyyy')}
                    </span>
                  </div>
                  {selectedDoc.uploader && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Uploaded by</span>
                      <div className="flex items-center gap-2">
                        {selectedDoc.uploader.avatar_url ? (
                          <img
                            src={selectedDoc.uploader.avatar_url}
                            alt={selectedDoc.uploader.full_name}
                            className="w-5 h-5 rounded-full"
                          />
                        ) : (
                          <div className="w-5 h-5 rounded-full bg-charcoal-200 flex items-center justify-center">
                            <User className="w-3 h-3 text-charcoal-500" />
                          </div>
                        )}
                        <span className="font-medium">{selectedDoc.uploader.full_name}</span>
                      </div>
                    </div>
                  )}
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
    </div>
  )
}
