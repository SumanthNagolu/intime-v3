'use client'

import * as React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Plus, FileText, Download, Eye, File, FileImage, FileSpreadsheet, FilePlus2 } from 'lucide-react'
import type { ContactDocument } from '@/types/workspace'
import { formatDistanceToNow } from 'date-fns'

interface ContactDocumentsSectionProps {
  documents: ContactDocument[]
  contactId: string
}

const DOCUMENT_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  resume: FileText,
  cover_letter: FileText,
  offer_letter: File,
  contract: File,
  image: FileImage,
  spreadsheet: FileSpreadsheet,
  other: FilePlus2,
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`
}

/**
 * ContactDocumentsSection - Shows uploaded documents
 */
export function ContactDocumentsSection({ documents, contactId }: ContactDocumentsSectionProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Documents ({documents.length})
          </CardTitle>
          <Button variant="outline" size="sm">
            <Plus className="h-4 w-4 mr-2" />
            Upload Document
          </Button>
        </CardHeader>
        <CardContent>
          {documents.length === 0 ? (
            <div className="py-8 text-center text-charcoal-500">
              <FileText className="h-8 w-8 mx-auto mb-2 text-charcoal-300" />
              <p>No documents uploaded</p>
              <p className="text-sm mt-1">Upload resumes, contracts, or other files.</p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {documents.map((doc) => (
                <DocumentRow key={doc.id} document={doc} />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function DocumentRow({ document }: { document: ContactDocument }) {
  const DocIcon = DOCUMENT_TYPE_ICONS[document.type] || FileText

  return (
    <div className="py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-charcoal-100 flex items-center justify-center">
          <DocIcon className="h-5 w-5 text-charcoal-600" />
        </div>
        <div>
          <div className="font-medium text-charcoal-900">{document.name}</div>
          <div className="text-sm text-charcoal-500">
            {formatFileSize(document.size)}
            {' \u2022 '}{document.type.replace(/_/g, ' ')}
            {' \u2022 '}{document.uploadedBy}
            {' \u2022 '}{formatDistanceToNow(new Date(document.uploadedAt), { addSuffix: true })}
          </div>
        </div>
      </div>
      <div className="flex items-center gap-1">
        {document.url && (
          <>
            <Button variant="ghost" size="sm" asChild>
              <a href={document.url} target="_blank" rel="noopener noreferrer">
                <Eye className="h-4 w-4" />
              </a>
            </Button>
            <Button variant="ghost" size="sm" asChild>
              <a href={document.url} download>
                <Download className="h-4 w-4" />
              </a>
            </Button>
          </>
        )}
      </div>
    </div>
  )
}

export default ContactDocumentsSection
