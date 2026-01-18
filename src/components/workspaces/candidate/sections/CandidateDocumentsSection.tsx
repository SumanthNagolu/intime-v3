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
  // Standard document types
  resume: FileText,
  certification: FilePen,
  portfolio: FileSpreadsheet,
  cover_letter: FilePen,
  id_document: FilePen,
  // Compliance document types
  rtr: FilePen,
  nda: FilePen,
  references: FileText,
  reference_letter: FileText,
  background_auth: FilePen,
  background_check: FilePen,
  void_check: FileSpreadsheet,
  direct_deposit: FileSpreadsheet,
  drug_test: FilePen,
  i9: FilePen,
  w4: FilePen,
  w9: FilePen,
  msa: FilePen,
  sow: FilePen,
  coi: FilePen,
  insurance: FilePen,
  contract: FilePen,
  offer_letter: FilePen,
  employment_verification: FileText,
  other: File,
}

const TYPE_COLORS: Record<string, string> = {
  // Standard document types
  resume: 'bg-blue-100 text-blue-700',
  certification: 'bg-green-100 text-green-700',
  portfolio: 'bg-purple-100 text-purple-700',
  cover_letter: 'bg-amber-100 text-amber-700',
  id_document: 'bg-slate-100 text-slate-700',
  // Compliance document types
  rtr: 'bg-indigo-100 text-indigo-700',
  nda: 'bg-red-100 text-red-700',
  references: 'bg-teal-100 text-teal-700',
  reference_letter: 'bg-teal-100 text-teal-700',
  background_auth: 'bg-orange-100 text-orange-700',
  background_check: 'bg-orange-100 text-orange-700',
  void_check: 'bg-cyan-100 text-cyan-700',
  direct_deposit: 'bg-cyan-100 text-cyan-700',
  drug_test: 'bg-lime-100 text-lime-700',
  i9: 'bg-violet-100 text-violet-700',
  w4: 'bg-pink-100 text-pink-700',
  w9: 'bg-rose-100 text-rose-700',
  msa: 'bg-emerald-100 text-emerald-700',
  sow: 'bg-sky-100 text-sky-700',
  coi: 'bg-fuchsia-100 text-fuchsia-700',
  insurance: 'bg-amber-100 text-amber-700',
  contract: 'bg-stone-100 text-stone-700',
  offer_letter: 'bg-green-100 text-green-700',
  employment_verification: 'bg-blue-100 text-blue-700',
  other: 'bg-charcoal-100 text-charcoal-700',
}

const TYPE_LABELS: Record<string, string> = {
  resume: 'Resume',
  certification: 'Certification',
  portfolio: 'Portfolio',
  cover_letter: 'Cover Letter',
  id_document: 'ID Document',
  rtr: 'RTR',
  nda: 'NDA',
  references: 'References',
  reference_letter: 'Reference Letter',
  background_auth: 'Background Auth',
  background_check: 'Background Check',
  void_check: 'Void Check',
  direct_deposit: 'Direct Deposit',
  drug_test: 'Drug Test',
  i9: 'I-9',
  w4: 'W-4',
  w9: 'W-9',
  msa: 'MSA',
  sow: 'SOW',
  coi: 'COI',
  insurance: 'Insurance',
  contract: 'Contract',
  offer_letter: 'Offer Letter',
  employment_verification: 'Employment Verification',
  other: 'Other',
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
                const typeLabel = TYPE_LABELS[doc.documentType] || doc.documentType.replace('_', ' ')
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
                        <Badge className={cn(typeColor)}>
                          {typeLabel}
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
