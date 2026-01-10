'use client'

import React, { useState, useRef } from 'react'
import { cn } from '@/lib/utils'
import {
  FileText,
  Upload,
  Check,
  Clock,
  X,
  AlertTriangle,
  Trash2,
  Download,
  Info,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import type { ComplianceDocumentEntry } from '@/stores/create-candidate-store'
import { COMPLIANCE_DOCUMENT_TYPES, COMPLIANCE_DOCUMENT_STATUSES } from '@/stores/create-candidate-store'

interface ComplianceDocumentUploadProps {
  documents: ComplianceDocumentEntry[]
  onAdd: (doc: Omit<ComplianceDocumentEntry, 'id'>) => void
  onUpdate: (id: string, doc: Partial<ComplianceDocumentEntry>) => void
  onRemove: (id: string) => void
}

const getStatusIcon = (status: ComplianceDocumentEntry['status']) => {
  switch (status) {
    case 'approved':
      return <Check className="w-4 h-4 text-green-600" />
    case 'submitted':
    case 'pending':
      return <Clock className="w-4 h-4 text-amber-600" />
    case 'rejected':
      return <AlertTriangle className="w-4 h-4 text-red-600" />
    default:
      return <FileText className="w-4 h-4 text-charcoal-400" />
  }
}

const getStatusColor = (status: ComplianceDocumentEntry['status']) => {
  switch (status) {
    case 'approved':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'submitted':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    case 'pending':
      return 'bg-amber-100 text-amber-700 border-amber-200'
    case 'rejected':
      return 'bg-red-100 text-red-700 border-red-200'
    default:
      return 'bg-charcoal-100 text-charcoal-600 border-charcoal-200'
  }
}

export function ComplianceDocumentUpload({
  documents,
  onAdd,
  onUpdate,
  onRemove,
}: ComplianceDocumentUploadProps) {
  const [expandedType, setExpandedType] = useState<string | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [uploadingType, setUploadingType] = useState<string | null>(null)

  // Get document for a specific type
  const getDocumentForType = (type: string) => {
    return documents.find(d => d.type === type)
  }

  // Handle file selection
  const handleFileSelect = async (type: string, file: File) => {
    const existingDoc = getDocumentForType(type)

    // In a real implementation, you would upload the file here
    // For now, we'll just store the file info
    const fileInfo = {
      fileName: file.name,
      fileSize: file.size,
      uploadedAt: new Date().toISOString(),
      status: 'pending' as const,
    }

    if (existingDoc) {
      onUpdate(existingDoc.id, fileInfo)
    } else {
      onAdd({
        type: type as ComplianceDocumentEntry['type'],
        ...fileInfo,
      })
    }

    setUploadingType(null)
  }

  // Trigger file input
  const triggerUpload = (type: string) => {
    setUploadingType(type)
    fileInputRef.current?.click()
  }

  return (
    <div className="space-y-4">
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        className="hidden"
        accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
        onChange={(e) => {
          const file = e.target.files?.[0]
          if (file && uploadingType) {
            handleFileSelect(uploadingType, file)
          }
          e.target.value = '' // Reset for next upload
        }}
      />

      {/* Info Banner */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-blue-50 border border-blue-200">
        <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-blue-800">
            Optional Document Uploads
          </p>
          <p className="text-xs text-blue-600 mt-0.5">
            These documents are optional during candidate creation. They can be uploaded later when needed for specific job submissions or placements.
          </p>
        </div>
      </div>

      {/* Document Type Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {COMPLIANCE_DOCUMENT_TYPES.map((docType) => {
          const doc = getDocumentForType(docType.value)
          const isExpanded = expandedType === docType.value
          const hasDocument = !!doc?.fileName

          return (
            <div
              key={docType.value}
              className={cn(
                'border rounded-xl overflow-hidden transition-all duration-300',
                hasDocument
                  ? 'border-charcoal-200 bg-white'
                  : 'border-dashed border-charcoal-300 bg-charcoal-50/50'
              )}
            >
              {/* Card Header */}
              <div
                className={cn(
                  'p-4 cursor-pointer transition-colors',
                  hasDocument ? 'hover:bg-charcoal-50' : 'hover:bg-charcoal-100/50'
                )}
                onClick={() => setExpandedType(isExpanded ? null : docType.value)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className={cn(
                      'w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0',
                      hasDocument ? 'bg-charcoal-100' : 'bg-charcoal-200/50'
                    )}
                  >
                    {hasDocument ? getStatusIcon(doc?.status || 'not_uploaded') : (
                      <Upload className="w-5 h-5 text-charcoal-400" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="font-semibold text-charcoal-800 text-sm">{docType.label}</h4>
                      {hasDocument && doc?.status && (
                        <span
                          className={cn(
                            'text-xs px-2 py-0.5 rounded-full font-medium border',
                            getStatusColor(doc.status)
                          )}
                        >
                          {COMPLIANCE_DOCUMENT_STATUSES.find(s => s.value === doc.status)?.label}
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-charcoal-500 mt-0.5">{docType.description}</p>
                    {hasDocument && doc?.fileName && (
                      <p className="text-xs text-charcoal-600 mt-1 truncate font-medium">
                        {doc.fileName}
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Expanded Content */}
              {isExpanded && (
                <div className="border-t border-charcoal-100 p-4 space-y-4 bg-charcoal-50/30">
                  {hasDocument && doc ? (
                    <>
                      {/* File Info */}
                      <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-charcoal-100">
                        <div className="flex items-center gap-3">
                          <FileText className="w-5 h-5 text-charcoal-500" />
                          <div>
                            <p className="text-sm font-medium text-charcoal-800">{doc.fileName}</p>
                            <p className="text-xs text-charcoal-500">
                              {doc.fileSize && `${(doc.fileSize / 1024).toFixed(1)} KB`}
                              {doc.uploadedAt && ` • Uploaded ${new Date(doc.uploadedAt).toLocaleDateString()}`}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => triggerUpload(docType.value)}
                            className="text-charcoal-500"
                          >
                            Replace
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemove(doc.id)}
                            className="text-red-500"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>

                      {/* Notes */}
                      <div className="space-y-2">
                        <label className="text-xs font-medium text-charcoal-600">Notes (Optional)</label>
                        <Textarea
                          value={doc.notes || ''}
                          onChange={(e) => onUpdate(doc.id, { notes: e.target.value })}
                          placeholder="Add any notes about this document..."
                          rows={2}
                          className="resize-none text-sm"
                        />
                      </div>
                    </>
                  ) : (
                    /* Upload Zone */
                    <div
                      onClick={() => triggerUpload(docType.value)}
                      className={cn(
                        'p-6 rounded-lg border-2 border-dashed cursor-pointer transition-all duration-300',
                        'border-charcoal-200 hover:border-gold-300 hover:bg-gold-50/30',
                        'flex flex-col items-center justify-center gap-2 text-center'
                      )}
                    >
                      <div className="w-12 h-12 rounded-full bg-charcoal-100 flex items-center justify-center">
                        <Upload className="w-6 h-6 text-charcoal-500" />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-charcoal-700">
                          Click to upload
                        </p>
                        <p className="text-xs text-charcoal-500 mt-0.5">
                          PDF, DOC, DOCX, or image files
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          )
        })}
      </div>

      {/* Summary */}
      {documents.length > 0 && (
        <div className="p-3 rounded-lg bg-charcoal-50 border border-charcoal-100">
          <p className="text-xs text-charcoal-600">
            <span className="font-medium text-charcoal-800">{documents.length}</span> document{documents.length !== 1 ? 's' : ''} uploaded
            {documents.filter(d => d.status === 'approved').length > 0 && (
              <span className="text-green-600 ml-2">
                • {documents.filter(d => d.status === 'approved').length} approved
              </span>
            )}
            {documents.filter(d => d.status === 'pending').length > 0 && (
              <span className="text-amber-600 ml-2">
                • {documents.filter(d => d.status === 'pending').length} pending review
              </span>
            )}
          </p>
        </div>
      )}
    </div>
  )
}
