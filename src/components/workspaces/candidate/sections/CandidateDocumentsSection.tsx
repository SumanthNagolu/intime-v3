'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Plus,
  FileText,
  FileSpreadsheet,
  FilePen,
  File,
  Download,
  Eye,
  Upload,
  Calendar,
  User,
} from 'lucide-react'
import type { CandidateDocument } from '@/types/candidate-workspace'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface CandidateDocumentsSectionProps {
  documents: CandidateDocument[]
  candidateId: string
}

const TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  resume: FileText,
  certification: FilePen,
  portfolio: FileSpreadsheet,
  cover_letter: FilePen,
}

const TYPE_COLORS: Record<string, string> = {
  resume: 'bg-blue-100 text-blue-700',
  certification: 'bg-green-100 text-green-700',
  portfolio: 'bg-purple-100 text-purple-700',
  cover_letter: 'bg-amber-100 text-amber-700',
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * CandidateDocumentsSection - Documents for this candidate
 */
export function CandidateDocumentsSection({ documents, candidateId }: CandidateDocumentsSectionProps) {
  const handleUploadDocument = () => {
    window.dispatchEvent(
      new CustomEvent('openCandidateDialog', {
        detail: { dialogId: 'uploadDocument', candidateId },
      })
    )
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-charcoal-900">
          Documents ({documents.length})
        </h2>
        <Button size="sm" onClick={handleUploadDocument}>
          <Upload className="h-4 w-4 mr-1" />
          Upload Document
        </Button>
      </div>

      {/* Documents List */}
      {documents.length > 0 ? (
        <Card>
          <CardContent className="p-0">
            <div className="divide-y divide-charcoal-100">
              {documents.map((doc) => {
                const Icon = TYPE_ICONS[doc.documentType] || File
                const typeColor = TYPE_COLORS[doc.documentType] || 'bg-charcoal-100 text-charcoal-700'
                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 p-4 hover:bg-charcoal-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                      <Icon className="h-5 w-5 text-charcoal-500" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-medium text-charcoal-900 truncate">
                          {doc.name}
                        </p>
                        <Badge className={cn('capitalize', typeColor)}>
                          {doc.documentType.replace('_', ' ')}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-4 mt-1 text-xs text-charcoal-500">
                        <span>{formatFileSize(doc.fileSize)}</span>
                        {doc.uploadedBy && (
                          <span className="flex items-center gap-1">
                            <User className="h-3 w-3" />
                            {doc.uploadedBy.fullName}
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer">
                          <Eye className="h-4 w-4" />
                        </a>
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={doc.fileUrl} download>
                          <Download className="h-4 w-4" />
                        </a>
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-dashed">
          <CardContent className="p-8 text-center">
            <File className="h-12 w-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-sm text-charcoal-500">No documents uploaded</p>
            <Button variant="outline" size="sm" className="mt-4" onClick={handleUploadDocument}>
              <Upload className="h-4 w-4 mr-1" />
              Upload First Document
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CandidateDocumentsSection
