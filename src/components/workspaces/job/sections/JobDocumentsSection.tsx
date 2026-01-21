'use client'

import * as React from 'react'
import { FileText, Plus, Download, MoreHorizontal, File, FileImage, FileSpreadsheet } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import type { FullJob, DocumentItem } from '@/types/job'
import { formatDistanceToNow } from 'date-fns'

interface JobDocumentsSectionProps {
  job: FullJob
  onRefresh?: () => void
}

const FILE_ICONS: Record<string, typeof File> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
}

/**
 * JobDocumentsSection - Documents attached to the job
 */
export function JobDocumentsSection({ job, onRefresh }: JobDocumentsSectionProps) {
  const documents = job.sections?.documents?.items || []

  const getFileIcon = (fileType?: string) => {
    if (!fileType) return File
    const ext = fileType.toLowerCase().replace('.', '')
    return FILE_ICONS[ext] || File
  }

  const formatFileSize = (bytes?: number) => {
    if (!bytes) return null
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-charcoal-100">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
                <FileText className="h-5 w-5 text-charcoal-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Documents</h3>
                <p className="text-xs text-charcoal-500">{documents.length} files</p>
              </div>
            </div>
            <Button size="sm" variant="outline">
              <Plus className="h-4 w-4 mr-1.5" />
              Upload
            </Button>
          </div>
        </div>

        <div className="p-6">
          {documents.length === 0 ? (
            <div className="py-12 text-center">
              <FileText className="h-12 w-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm text-charcoal-500">No documents uploaded</p>
              <Button variant="outline" size="sm" className="mt-4">
                <Plus className="h-4 w-4 mr-1.5" />
                Upload Document
              </Button>
            </div>
          ) : (
            <div className="space-y-2">
              {documents.map((doc) => {
                const FileIcon = getFileIcon(doc.file_type)

                return (
                  <div
                    key={doc.id}
                    className="flex items-center gap-4 rounded-lg border border-charcoal-200/60 bg-white p-4 hover:bg-charcoal-50 transition-colors"
                  >
                    <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center flex-shrink-0">
                      <FileIcon className="h-5 w-5 text-charcoal-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-charcoal-900 truncate">
                        {doc.file_name}
                      </p>
                      <div className="flex items-center gap-2 text-xs text-charcoal-500 mt-0.5">
                        {doc.file_type && (
                          <Badge variant="secondary" className="text-xs uppercase">
                            {doc.file_type.replace('.', '')}
                          </Badge>
                        )}
                        <span>{formatDistanceToNow(new Date(doc.created_at), { addSuffix: true })}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {doc.file_url && (
                        <Button variant="ghost" size="sm" asChild>
                          <a href={doc.file_url} target="_blank" rel="noopener noreferrer">
                            <Download className="h-4 w-4" />
                          </a>
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default JobDocumentsSection
