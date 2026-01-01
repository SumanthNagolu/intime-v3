'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  FileText,
  Download,
  ExternalLink,
  File,
  Image,
  FileSpreadsheet,
} from 'lucide-react'
import type { DealDocument } from '@/types/deal'
import { formatDistanceToNow } from 'date-fns'

interface DealDocumentsSectionProps {
  documents: DealDocument[]
  dealId: string
  onRefresh?: () => void
  onUploadDocument?: () => void
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  png: Image,
  jpg: Image,
  jpeg: Image,
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

export function DealDocumentsSection({
  documents,
  dealId,
  onRefresh,
  onUploadDocument,
}: DealDocumentsSectionProps) {
  const handleUpload = () => {
    if (onUploadDocument) {
      onUploadDocument()
    } else {
      // Dispatch event for sidebar/dialog handling
      window.dispatchEvent(
        new CustomEvent('openDealDialog', {
          detail: { dialogId: 'uploadDocument', dealId },
        })
      )
    }
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">Documents ({documents.length})</h2>
        <Button size="sm" onClick={handleUpload}>
          <Plus className="h-4 w-4 mr-1" />
          Upload Document
        </Button>
      </div>

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {documents.length > 0 ? (
            <div className="divide-y divide-charcoal-100">
              {documents.map((doc) => {
                const ext = doc.name.split('.').pop()?.toLowerCase() || ''
                const Icon = TYPE_ICONS[ext] || File
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 hover:bg-charcoal-50 transition-colors group"
                  >
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-charcoal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-charcoal-900 truncate">{doc.name}</p>
                        <Badge variant="outline" className="text-xs">
                          {doc.type.toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-500">
                        <span>{formatFileSize(doc.size)}</span>
                        <span>Uploaded by {doc.uploadedBy}</span>
                        <span>
                          {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {doc.url && (
                        <>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.url} target="_blank" rel="noopener noreferrer">
                              <ExternalLink className="h-4 w-4" />
                            </a>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <a href={doc.url} download={doc.name}>
                              <Download className="h-4 w-4" />
                            </a>
                          </Button>
                        </>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="p-8 text-center">
              <FileText className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
              <p className="text-sm text-charcoal-500">No documents uploaded for this deal</p>
              <Button variant="outline" size="sm" className="mt-4" onClick={handleUpload}>
                <Plus className="h-4 w-4 mr-1" />
                Upload First Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default DealDocumentsSection
