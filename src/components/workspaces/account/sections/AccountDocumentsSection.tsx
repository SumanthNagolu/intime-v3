'use client'

import * as React from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Plus, FileText, Download, ExternalLink, File, Image, FileSpreadsheet,
  Shield, FileSignature, Presentation, FolderOpen, AlertTriangle, Clock, CheckCircle2
} from 'lucide-react'
import type { AccountDocument } from '@/types/workspace'
import { formatDistanceToNow, format, differenceInDays, isBefore, addDays } from 'date-fns'
import { cn } from '@/lib/utils'

interface AccountDocumentsSectionProps {
  documents: AccountDocument[]
  accountId: string
}

// Document categories
type DocumentCategory = 'all' | 'contracts' | 'compliance' | 'proposals' | 'other'

const CATEGORY_CONFIG: Record<DocumentCategory, { 
  label: string; 
  icon: React.ComponentType<{ className?: string }>;
  keywords: string[];
}> = {
  all: { label: 'All', icon: FolderOpen, keywords: [] },
  contracts: { label: 'Contracts', icon: FileSignature, keywords: ['contract', 'msa', 'sow', 'agreement', 'nda', 'terms'] },
  compliance: { label: 'Compliance', icon: Shield, keywords: ['compliance', 'certificate', 'insurance', 'w9', 'w-9', 'tax', 'coi', 'eeo'] },
  proposals: { label: 'Proposals', icon: Presentation, keywords: ['proposal', 'quote', 'estimate', 'rfp', 'rfi', 'bid'] },
  other: { label: 'Other', icon: FileText, keywords: [] },
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

// Document status based on expiration
type DocumentStatus = 'active' | 'expiring_soon' | 'expired' | 'pending' | 'none'

function getDocumentStatus(doc: AccountDocument): { status: DocumentStatus; label: string; daysUntil: number | null } {
  // Check for expiration date in document metadata or name patterns
  const expirationDate = doc.expirationDate ? new Date(doc.expirationDate) : null
  
  if (!expirationDate) {
    return { status: 'none', label: '', daysUntil: null }
  }

  const today = new Date()
  const daysUntil = differenceInDays(expirationDate, today)
  
  if (isBefore(expirationDate, today)) {
    return { status: 'expired', label: 'Expired', daysUntil }
  }
  if (daysUntil <= 30) {
    return { status: 'expiring_soon', label: `Expires in ${daysUntil} days`, daysUntil }
  }
  return { status: 'active', label: `Valid until ${format(expirationDate, 'MMM d, yyyy')}`, daysUntil }
}

function categorizeDocument(doc: AccountDocument): DocumentCategory {
  const nameAndType = `${doc.name} ${doc.type}`.toLowerCase()
  
  for (const [category, config] of Object.entries(CATEGORY_CONFIG)) {
    if (category === 'all' || category === 'other') continue
    if (config.keywords.some(kw => nameAndType.includes(kw))) {
      return category as DocumentCategory
    }
  }
  return 'other'
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

/**
 * AccountDocumentsSection - Documents for this account
 * Enhanced with category tabs and expiration tracking (Guidewire-inspired)
 */
export function AccountDocumentsSection({ documents, accountId }: AccountDocumentsSectionProps) {
  const [categoryFilter, setCategoryFilter] = React.useState<DocumentCategory>('all')

  // Calculate category counts
  const categoryCounts = React.useMemo(() => {
    const counts: Record<DocumentCategory, number> = { all: documents.length, contracts: 0, compliance: 0, proposals: 0, other: 0 }
    documents.forEach(doc => {
      const cat = categorizeDocument(doc)
      counts[cat]++
    })
    return counts
  }, [documents])

  // Count expiring/expired documents
  const expirationStats = React.useMemo(() => {
    let expired = 0
    let expiringSoon = 0
    documents.forEach(doc => {
      const status = getDocumentStatus(doc)
      if (status.status === 'expired') expired++
      if (status.status === 'expiring_soon') expiringSoon++
    })
    return { expired, expiringSoon }
  }, [documents])

  // Filter documents
  const filteredDocuments = React.useMemo(() => {
    if (categoryFilter === 'all') return documents
    return documents.filter(doc => categorizeDocument(doc) === categoryFilter)
  }, [documents, categoryFilter])

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">
            Documents ({documents.length})
          </h2>
          {(expirationStats.expired > 0 || expirationStats.expiringSoon > 0) && (
            <div className="flex items-center gap-3 mt-1 text-xs">
              {expirationStats.expired > 0 && (
                <span className="text-error-600 flex items-center gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  {expirationStats.expired} expired
                </span>
              )}
              {expirationStats.expiringSoon > 0 && (
                <span className="text-amber-600 flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {expirationStats.expiringSoon} expiring soon
                </span>
              )}
            </div>
          )}
        </div>
        <Button 
          size="sm"
          onClick={() => {
            window.dispatchEvent(new CustomEvent('openAccountDialog', { 
              detail: { dialogId: 'addDocument', accountId } 
            }))
          }}
        >
          <Plus className="h-4 w-4 mr-1" />
          Upload Document
        </Button>
      </div>

      {/* Category Tabs */}
      {documents.length > 3 && (
        <Tabs value={categoryFilter} onValueChange={(v) => setCategoryFilter(v as DocumentCategory)}>
          <TabsList className="bg-charcoal-100 p-1">
            {Object.entries(CATEGORY_CONFIG).map(([key, config]) => {
              const count = categoryCounts[key as DocumentCategory]
              if (key !== 'all' && count === 0) return null
              const Icon = config.icon
              return (
                <TabsTrigger key={key} value={key} className="text-xs">
                  <Icon className="h-3 w-3 mr-1" />
                  {config.label} {key !== 'all' && `(${count})`}
                </TabsTrigger>
              )
            })}
          </TabsList>
        </Tabs>
      )}

      {/* List */}
      <Card>
        <CardContent className="p-0">
          {filteredDocuments.length > 0 ? (
            <div className="divide-y divide-charcoal-100">
              {filteredDocuments.map((doc) => {
                const ext = doc.name.split('.').pop()?.toLowerCase() || ''
                const Icon = TYPE_ICONS[ext] || File
                const docCategory = categorizeDocument(doc)
                const CategoryIcon = CATEGORY_CONFIG[docCategory].icon
                const docStatus = getDocumentStatus(doc)

                return (
                  <div
                    key={doc.id}
                    className={cn(
                      "flex items-center gap-4 p-4 hover:bg-charcoal-50 transition-colors group",
                      docStatus.status === 'expired' && "bg-error-50",
                      docStatus.status === 'expiring_soon' && "bg-amber-50"
                    )}
                  >
                    <div className={cn(
                      "w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0",
                      docStatus.status === 'expired' ? 'bg-error-100' :
                      docStatus.status === 'expiring_soon' ? 'bg-amber-100' :
                      'bg-charcoal-100'
                    )}>
                      <Icon className={cn(
                        "h-5 w-5",
                        docStatus.status === 'expired' ? 'text-error-600' :
                        docStatus.status === 'expiring_soon' ? 'text-amber-600' :
                        'text-charcoal-500'
                      )} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <p className="text-sm font-medium text-charcoal-900 truncate">
                          {doc.name}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {doc.type.toUpperCase()}
                        </Badge>
                        <Badge variant="outline" className="text-xs capitalize">
                          <CategoryIcon className="h-3 w-3 mr-1" />
                          {CATEGORY_CONFIG[docCategory].label}
                        </Badge>
                        {docStatus.status === 'expired' && (
                          <Badge className="text-xs bg-error-100 text-error-700">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            Expired
                          </Badge>
                        )}
                        {docStatus.status === 'expiring_soon' && (
                          <Badge className="text-xs bg-amber-100 text-amber-700">
                            <Clock className="h-3 w-3 mr-1" />
                            {docStatus.label}
                          </Badge>
                        )}
                        {docStatus.status === 'active' && (
                          <Badge className="text-xs bg-success-100 text-success-700">
                            <CheckCircle2 className="h-3 w-3 mr-1" />
                            Active
                          </Badge>
                        )}
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
              <p className="text-sm text-charcoal-500">
                {categoryFilter !== 'all' 
                  ? `No ${CATEGORY_CONFIG[categoryFilter].label.toLowerCase()} documents` 
                  : 'No documents yet'}
              </p>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-4"
                onClick={() => {
                  window.dispatchEvent(new CustomEvent('openAccountDialog', { 
                    detail: { dialogId: 'addDocument', accountId } 
                  }))
                }}
              >
                <Plus className="h-4 w-4 mr-1" />
                Upload {categoryFilter === 'all' ? 'First' : ''} Document
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default AccountDocumentsSection
