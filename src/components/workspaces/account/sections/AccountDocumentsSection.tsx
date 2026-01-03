'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  FileText, FileSignature, Shield, FileCheck2, FilePlus, FileCode,
  Plus, Search, MoreVertical, Download, ExternalLink, Eye, Edit,
  X, ChevronLeft, ChevronRight, Calendar, DollarSign, Clock,
  AlertTriangle, CheckCircle2, RefreshCw, Loader2, Trash2,
  FileImage, FileVideo, FileAudio, File, Maximize2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { AccountDocument } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { differenceInDays, format, formatDistanceToNow, isBefore, startOfDay } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useAccountWorkspace } from '../AccountWorkspaceProvider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

// Constants
const ITEMS_PER_PAGE = 10

interface AccountDocumentsSectionProps {
  documents: AccountDocument[]
  accountId: string
}

type CategoryFilter = 'all' | 'msa' | 'sow' | 'nda' | 'other' | 'expiring'

// Document type configuration with gradients
const DOCUMENT_TYPE_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  label: string
  fullLabel: string
}> = {
  msa: { icon: FileSignature, gradient: 'from-blue-400 to-blue-600', label: 'MSA', fullLabel: 'Master Service Agreement' },
  sow: { icon: FileCheck2, gradient: 'from-purple-400 to-purple-600', label: 'SOW', fullLabel: 'Statement of Work' },
  nda: { icon: Shield, gradient: 'from-amber-400 to-amber-600', label: 'NDA', fullLabel: 'Non-Disclosure Agreement' },
  amendment: { icon: FilePlus, gradient: 'from-cyan-400 to-cyan-600', label: 'Amendment', fullLabel: 'Amendment' },
  addendum: { icon: FileCode, gradient: 'from-teal-400 to-teal-600', label: 'Addendum', fullLabel: 'Addendum' },
  rate_card_agreement: { icon: FileCheck2, gradient: 'from-green-400 to-green-600', label: 'Rate Card', fullLabel: 'Rate Card Agreement' },
  sla: { icon: FileText, gradient: 'from-indigo-400 to-indigo-600', label: 'SLA', fullLabel: 'Service Level Agreement' },
  vendor_agreement: { icon: FileText, gradient: 'from-pink-400 to-pink-600', label: 'Vendor', fullLabel: 'Vendor Agreement' },
  other: { icon: FileText, gradient: 'from-charcoal-400 to-charcoal-500', label: 'Other', fullLabel: 'Document' },
}

// Status configuration
const STATUS_CONFIG: Record<string, { label: string; bg: string; text: string; dot: string }> = {
  draft: { label: 'Draft', bg: 'bg-charcoal-100', text: 'text-charcoal-600', dot: 'bg-charcoal-400' },
  pending_review: { label: 'Pending Review', bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  pending_signature: { label: 'Pending Signature', bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500' },
  active: { label: 'Active', bg: 'bg-success-50', text: 'text-success-700', dot: 'bg-success-500' },
  expired: { label: 'Expired', bg: 'bg-error-50', text: 'text-error-700', dot: 'bg-error-500' },
  terminated: { label: 'Terminated', bg: 'bg-charcoal-200', text: 'text-charcoal-600', dot: 'bg-charcoal-500' },
}

// File type icons based on extension
function getFileIcon(fileName: string, url?: string): React.ComponentType<{ className?: string }> {
  const ext = fileName?.split('.').pop()?.toLowerCase() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return FileImage
  if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext)) return FileVideo
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return FileAudio
  if (['pdf'].includes(ext)) return FileText
  return File
}

// Check if file can be previewed
function canPreview(fileName: string, url?: string): { previewable: boolean; type: 'pdf' | 'image' | 'iframe' | 'none' } {
  const ext = fileName?.split('.').pop()?.toLowerCase() || ''
  if (['pdf'].includes(ext)) return { previewable: true, type: 'pdf' }
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return { previewable: true, type: 'image' }
  if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx'].includes(ext) && url) return { previewable: true, type: 'iframe' }
  return { previewable: false, type: 'none' }
}

// Helper: Get expiration status
function getExpirationStatus(doc: AccountDocument): {
  status: 'active' | 'expiring_soon' | 'expired' | 'none'
  label: string
  daysUntil: number | null
  color: string
  bgColor: string
} {
  if (!doc.expirationDate) {
    return { status: 'none', label: '—', daysUntil: null, color: 'text-charcoal-400', bgColor: '' }
  }

  const today = startOfDay(new Date())
  const expDate = startOfDay(new Date(doc.expirationDate))
  const daysUntil = differenceInDays(expDate, today)

  if (daysUntil < 0) {
    return { status: 'expired', label: `${Math.abs(daysUntil)}d ago`, daysUntil, color: 'text-error-600', bgColor: 'bg-error-500' }
  }
  if (daysUntil <= 30) {
    return { status: 'expiring_soon', label: `${daysUntil}d left`, daysUntil, color: 'text-amber-600', bgColor: 'bg-amber-500' }
  }
  return { status: 'active', label: `${daysUntil}d`, daysUntil, color: 'text-success-600', bgColor: 'bg-success-500' }
}

// Helper: Format currency
function formatCurrency(value: number, currency: string = 'USD'): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(value)
}

// Helper: Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Categorize document
function categorizeDocument(type: string | undefined): 'msa' | 'sow' | 'nda' | 'other' {
  const docType = type?.toLowerCase() || ''
  if (docType === 'msa') return 'msa'
  if (docType === 'sow') return 'sow'
  if (docType === 'nda') return 'nda'
  return 'other'
}

/**
 * AccountDocumentsSection - Premium Documents workspace with Activities-style list view
 * Features: Grid list view with headers, bottom detail panel with preview, rich document management
 */
export function AccountDocumentsSection({ documents, accountId }: AccountDocumentsSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useAccountWorkspace()

  const [selectedDocument, setSelectedDocument] = React.useState<AccountDocument | null>(null)
  const [searchQuery, setSearchQuery] = React.useState('')
  const [categoryFilter, setCategoryFilter] = React.useState<CategoryFilter>('all')
  const [currentPage, setCurrentPage] = React.useState(1)
  const [previewOpen, setPreviewOpen] = React.useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false)

  // Handle download for cross-origin URLs
  const handleDownload = async (url: string, fileName: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation()
    if (!url) return

    try {
      const response = await fetch(url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = blobUrl
      a.download = fileName
      window.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(blobUrl)
      window.document.body.removeChild(a)
    } catch (error) {
      toast({ title: 'Download failed', description: 'Could not download the file', variant: 'error' })
    }
  }

  // Calculate category counts
  const categoryCounts = React.useMemo(() => {
    const counts = {
      all: documents.length,
      msa: 0,
      sow: 0,
      nda: 0,
      other: 0,
      expiring: 0,
    }
    documents.forEach(doc => {
      const cat = categorizeDocument(doc.type)
      counts[cat]++
      const expStatus = getExpirationStatus(doc)
      if (expStatus.status === 'expiring_soon' || expStatus.status === 'expired') {
        counts.expiring++
      }
    })
    return counts
  }, [documents])

  // Filter documents
  const filteredDocuments = React.useMemo(() => {
    let result = documents

    // Category filter
    if (categoryFilter === 'expiring') {
      result = result.filter(doc => {
        const expStatus = getExpirationStatus(doc)
        return expStatus.status === 'expiring_soon' || expStatus.status === 'expired'
      })
    } else if (categoryFilter !== 'all') {
      result = result.filter(doc => categorizeDocument(doc.type) === categoryFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(doc =>
        doc.name.toLowerCase().includes(q) ||
        doc.type?.toLowerCase().includes(q) ||
        doc.contractNumber?.toLowerCase().includes(q)
      )
    }

    return result
  }, [documents, searchQuery, categoryFilter])

  // Pagination
  const totalPages = Math.ceil(filteredDocuments.length / ITEMS_PER_PAGE)
  const paginatedDocuments = React.useMemo(() => {
    const start = (currentPage - 1) * ITEMS_PER_PAGE
    return filteredDocuments.slice(start, start + ITEMS_PER_PAGE)
  }, [filteredDocuments, currentPage])

  // Reset page when filters change
  React.useEffect(() => {
    setCurrentPage(1)
  }, [searchQuery, categoryFilter])

  const handleRowClick = (document: AccountDocument) => {
    if (selectedDocument?.id === document.id) {
      setSelectedDocument(null)
    } else {
      setSelectedDocument(document)
    }
  }

  const handleOpenAddDialog = () => {
    window.dispatchEvent(new CustomEvent('openAccountDialog', {
      detail: { dialogId: 'addDocument', accountId }
    }))
  }

  const getDocumentTypeConfig = (type: string | undefined) => {
    return DOCUMENT_TYPE_CONFIG[type?.toLowerCase() || 'other'] || DOCUMENT_TYPE_CONFIG.other
  }

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Premium List Card */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
        {/* Header with gradient */}
        <div className="px-5 py-4 border-b border-charcoal-100 bg-gradient-to-r from-charcoal-50/80 via-white to-blue-50/30">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-blue-500 to-blue-700 flex items-center justify-center shadow-sm">
                <FileText className="h-5 w-5 text-white" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900">Contracts & Documents</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} for this account
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-charcoal-400" />
                <Input
                  placeholder="Search documents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-9 w-64 text-sm border-charcoal-200 focus:border-blue-400 focus:ring-blue-400/20"
                />
              </div>
              <Button
                size="sm"
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm font-medium"
                onClick={handleOpenAddDialog}
              >
                <Plus className="h-4 w-4 mr-1.5" />
                Add Document
              </Button>
            </div>
          </div>

          {/* Category Filter Pills */}
          {documents.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {[
                { key: 'all', label: 'All', count: categoryCounts.all },
                { key: 'msa', label: 'MSA', count: categoryCounts.msa },
                { key: 'sow', label: 'SOW', count: categoryCounts.sow },
                { key: 'nda', label: 'NDA', count: categoryCounts.nda },
                { key: 'other', label: 'Other', count: categoryCounts.other },
                { key: 'expiring', label: 'Expiring', count: categoryCounts.expiring, highlight: true },
              ].filter(f => f.count > 0 || f.key === 'all').map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setCategoryFilter(filter.key as CategoryFilter)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    categoryFilter === filter.key
                      ? filter.highlight && filter.count > 0
                        ? "bg-amber-600 text-white shadow-sm"
                        : "bg-charcoal-900 text-white shadow-sm"
                      : filter.highlight && filter.count > 0
                        ? "bg-amber-50 text-amber-700 hover:bg-amber-100"
                        : "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                  )}
                >
                  {filter.label} ({filter.count})
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Table Header */}
        <div className="grid grid-cols-[40px_1fr_100px_100px_100px_90px_60px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">#</div>
          <div>Document</div>
          <div>Type</div>
          <div className="text-right">Value</div>
          <div className="text-center">Expires</div>
          <div className="text-center">Status</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedDocuments.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedDocuments.map((doc, idx) => {
              const rowNumber = ((currentPage - 1) * ITEMS_PER_PAGE) + idx + 1
              const typeConfig = getDocumentTypeConfig(doc.type)
              const TypeIcon = typeConfig.icon
              const statusConfig = STATUS_CONFIG[doc.status || 'draft'] || STATUS_CONFIG.draft
              const expStatus = getExpirationStatus(doc)

              return (
                <div
                  key={doc.id}
                  onClick={() => handleRowClick(doc)}
                  className={cn(
                    'group grid grid-cols-[40px_1fr_100px_100px_100px_90px_60px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedDocument?.id === doc.id
                      ? 'bg-blue-50/80 border-l-2 border-l-blue-500'
                      : 'hover:bg-charcoal-50/60 border-l-2 border-l-transparent',
                    expStatus.status === 'expired' && selectedDocument?.id !== doc.id && 'bg-error-50/30',
                    expStatus.status === 'expiring_soon' && selectedDocument?.id !== doc.id && 'bg-amber-50/30'
                  )}
                >
                  {/* Row Number */}
                  <div className="text-center">
                    <span className="text-sm font-bold text-charcoal-300 tabular-nums">
                      {rowNumber}
                    </span>
                  </div>

                  {/* Document Info */}
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className={cn(
                      "relative w-8 h-8 rounded-lg bg-gradient-to-br flex items-center justify-center flex-shrink-0 shadow-sm",
                      typeConfig.gradient
                    )}>
                      <TypeIcon className="h-4 w-4 text-white" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm truncate text-charcoal-900">{doc.name}</span>
                        {doc.autoRenew && (
                          <RefreshCw className="h-3 w-3 text-blue-500 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex items-center gap-3 mt-0.5 text-[11px] text-charcoal-500">
                        {doc.contractNumber && <span>#{doc.contractNumber}</span>}
                        <span>{formatFileSize(doc.size)}</span>
                        <span className="text-charcoal-400">•</span>
                        <span>Added {formatDistanceToNow(new Date(doc.uploadedAt), { addSuffix: true })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <Badge variant="outline" className={cn("text-[10px] font-semibold px-1.5 py-0 border-0", typeConfig.gradient.includes('blue') ? 'bg-blue-50 text-blue-700' : typeConfig.gradient.includes('purple') ? 'bg-purple-50 text-purple-700' : typeConfig.gradient.includes('amber') ? 'bg-amber-50 text-amber-700' : 'bg-charcoal-100 text-charcoal-600')}>
                      {typeConfig.label}
                    </Badge>
                  </div>

                  {/* Value */}
                  <div className="text-right">
                    {doc.contractValue ? (
                      <span className="text-sm font-semibold text-charcoal-700 tabular-nums">
                        {formatCurrency(doc.contractValue, doc.currency)}
                      </span>
                    ) : (
                      <span className="text-charcoal-300 text-xs">—</span>
                    )}
                  </div>

                  {/* Expires */}
                  <div className="text-center">
                    {doc.expirationDate ? (
                      <div className={cn("text-xs", expStatus.color)}>
                        <div className="font-semibold tabular-nums">{format(new Date(doc.expirationDate), 'MMM d')}</div>
                        <div className="text-[10px]">{expStatus.label}</div>
                      </div>
                    ) : (
                      <span className="text-charcoal-300 text-xs">—</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="text-center">
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0 border-0",
                        statusConfig.bg,
                        statusConfig.text
                      )}
                    >
                      <span className={cn("w-1 h-1 rounded-full mr-1", statusConfig.dot)} />
                      {statusConfig.label}
                    </Badge>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center justify-end">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                        <Button variant="ghost" size="icon" className="h-7 w-7 opacity-0 group-hover:opacity-100 transition-opacity">
                          <MoreVertical className="h-4 w-4 text-charcoal-400" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        {doc.url && (
                          <>
                            <DropdownMenuItem onClick={(e) => { e.stopPropagation(); setSelectedDocument(doc); setPreviewOpen(true) }}>
                              <Eye className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                              Preview
                            </DropdownMenuItem>
                            <DropdownMenuItem asChild>
                              <a href={doc.url} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()}>
                                <ExternalLink className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                                Open in New Tab
                              </a>
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={(e) => handleDownload(doc.url!, doc.name, e as unknown as React.MouseEvent)}>
                              <Download className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                              Download
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                          </>
                        )}
                        <DropdownMenuItem onClick={(e) => e.stopPropagation()}>
                          <Edit className="h-3.5 w-3.5 mr-2 text-charcoal-500" />
                          Edit Details
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <div className="p-12 text-center">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-charcoal-100 to-charcoal-50 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-8 w-8 text-charcoal-400" />
            </div>
            <p className="text-base font-medium text-charcoal-700">
              {searchQuery || categoryFilter !== 'all' ? 'No documents match your filters' : 'No documents yet'}
            </p>
            <p className="text-sm text-charcoal-500 mt-1">
              {searchQuery || categoryFilter !== 'all' ? 'Try different search terms or filters' : 'Add contracts and documents to track MSAs, SOWs, NDAs, and more'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  onClick={handleOpenAddDialog}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Add Document
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Pagination Footer */}
        {totalPages > 1 && (
          <div className="px-5 py-3 border-t border-charcoal-100 bg-charcoal-50/30 flex items-center justify-between">
            <p className="text-sm text-charcoal-500">
              Showing <span className="font-medium text-charcoal-700">{((currentPage - 1) * ITEMS_PER_PAGE) + 1}</span> - <span className="font-medium text-charcoal-700">{Math.min(currentPage * ITEMS_PER_PAGE, filteredDocuments.length)}</span> of <span className="font-medium text-charcoal-700">{filteredDocuments.length}</span>
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                disabled={currentPage === 1}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <span className="text-sm text-charcoal-600 min-w-[100px] text-center">
                Page <span className="font-medium">{currentPage}</span> of <span className="font-medium">{totalPages}</span>
              </span>
              <Button
                variant="outline"
                size="sm"
                className="h-8"
                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                disabled={currentPage === totalPages}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>

      {/* Premium Detail Panel - Slides up from bottom */}
      {selectedDocument && (
        <DocumentDetailBottomPanel
          document={selectedDocument}
          onClose={() => setSelectedDocument(null)}
          onPreview={() => setPreviewOpen(true)}
          onDelete={() => setDeleteDialogOpen(true)}
          refreshData={refreshData}
          accountId={accountId}
        />
      )}

      {/* Full-Screen Preview Dialog */}
      {selectedDocument && (
        <DocumentPreviewDialog
          document={selectedDocument}
          open={previewOpen}
          onOpenChange={setPreviewOpen}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Document?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete "{selectedDocument?.name}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-error-600 hover:bg-error-700"
              onClick={() => {
                // Delete mutation would go here
                toast({ title: 'Document deleted' })
                setDeleteDialogOpen(false)
                setSelectedDocument(null)
                refreshData()
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// ============================================
// Document Detail Bottom Panel
// ============================================
interface DocumentDetailBottomPanelProps {
  document: AccountDocument
  onClose: () => void
  onPreview: () => void
  onDelete: () => void
  refreshData: () => void
  accountId: string
}

function DocumentDetailBottomPanel({
  document,
  onClose,
  onPreview,
  onDelete,
  refreshData,
  accountId,
}: DocumentDetailBottomPanelProps) {
  const { toast } = useToast()
  const [isDownloading, setIsDownloading] = React.useState(false)

  // Handle download for cross-origin URLs
  const handleDownload = async () => {
    if (!document.url) return

    setIsDownloading(true)
    try {
      const response = await fetch(document.url)
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = url
      a.download = document.name
      window.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      window.document.body.removeChild(a)
    } catch (error) {
      toast({ title: 'Download failed', description: 'Could not download the file', variant: 'error' })
    } finally {
      setIsDownloading(false)
    }
  }

  const typeConfig = DOCUMENT_TYPE_CONFIG[document.type?.toLowerCase() || 'other'] || DOCUMENT_TYPE_CONFIG.other
  const TypeIcon = typeConfig.icon
  const statusConfig = STATUS_CONFIG[document.status || 'draft'] || STATUS_CONFIG.draft
  const expStatus = getExpirationStatus(document)
  const previewInfo = canPreview(document.name, document.url)

  // Calculate KPIs
  const daysToExpiry = expStatus.daysUntil
  const isActive = document.status === 'active'
  const daysOld = differenceInDays(new Date(), new Date(document.uploadedAt))

  return (
    <div
      className="relative rounded-2xl border border-charcoal-200/40 bg-gradient-to-br from-white via-white to-cream/30 shadow-[0_8px_30px_rgb(0,0,0,0.06)] overflow-hidden"
      style={{
        animation: 'slideUpFade 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards',
      }}
    >
      {/* Decorative top accent bar */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-400 via-blue-500 to-purple-500" />

      {/* Floating close button */}
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-charcoal-900/5 hover:bg-charcoal-900/10 backdrop-blur-sm border border-charcoal-200/50 text-charcoal-500 hover:text-charcoal-700 transition-all duration-200 group"
      >
        <span className="text-xs font-medium">Close</span>
        <X className="h-3.5 w-3.5 group-hover:rotate-90 transition-transform duration-200" />
      </button>

      {/* Header */}
      <div className="relative px-8 pt-6 pb-5 bg-gradient-to-br from-charcoal-50/80 via-transparent to-blue-50/20">
        <div className="flex items-start gap-5">
          {/* Document icon with glow */}
          <div className="relative">
            <div className={cn(
              "absolute inset-0 rounded-2xl blur-xl opacity-40",
              expStatus.status === 'expired' ? 'bg-error-400' :
              expStatus.status === 'expiring_soon' ? 'bg-amber-400' :
              'bg-blue-400'
            )} />
            <div className={cn(
              "relative w-16 h-16 rounded-2xl bg-gradient-to-br flex items-center justify-center shadow-lg ring-4 ring-white/80",
              typeConfig.gradient
            )}>
              <TypeIcon className="h-8 w-8 text-white drop-shadow-sm" />
            </div>
          </div>

          <div className="flex-1 min-w-0 pt-1">
            <div className="flex items-center gap-3 flex-wrap">
              <h3 className="text-xl font-bold text-charcoal-900 tracking-tight">{document.name}</h3>
              <div className="flex items-center gap-2">
                <Badge
                  variant="outline"
                  className={cn(
                    "text-xs font-semibold border-0 shadow-sm",
                    statusConfig.bg,
                    statusConfig.text
                  )}
                >
                  <span className={cn("w-1.5 h-1.5 rounded-full mr-1.5", statusConfig.dot)} />
                  {statusConfig.label}
                </Badge>
                {document.autoRenew && (
                  <Badge variant="outline" className="text-xs font-semibold border-0 shadow-sm bg-blue-50 text-blue-700">
                    <RefreshCw className="h-3 w-3 mr-1" />
                    Auto-renew
                  </Badge>
                )}
                {expStatus.status === 'expired' && (
                  <Badge variant="outline" className="text-xs font-semibold border-0 shadow-sm bg-error-50 text-error-700">
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Expired
                  </Badge>
                )}
                {expStatus.status === 'expiring_soon' && (
                  <Badge variant="outline" className="text-xs font-semibold border-0 shadow-sm bg-amber-50 text-amber-700">
                    <Clock className="h-3 w-3 mr-1" />
                    Expiring Soon
                  </Badge>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                {typeConfig.fullLabel}
              </span>
              {document.contractNumber && (
                <span className="flex items-center gap-1.5">
                  <span className="text-charcoal-400">#{document.contractNumber}</span>
                </span>
              )}
              <span className="text-charcoal-400">{formatFileSize(document.size)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* KPI Cards */}
        <div
          className="grid grid-cols-4 gap-4 mb-8"
          style={{ animation: 'fadeInUp 0.4s ease-out 0.1s forwards', opacity: 0 }}
        >
          {/* Contract Value */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
            <div className="absolute inset-0 bg-green-500 opacity-[0.02]" />
            <p className={cn(
              "text-2xl font-black tracking-tight relative",
              document.contractValue ? 'text-green-600' : 'text-charcoal-400'
            )}>
              {document.contractValue ? formatCurrency(document.contractValue, document.currency) : '—'}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Contract Value</p>
          </div>

          {/* Days to Expiry */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
            <div className={cn(
              "absolute inset-0 opacity-[0.03]",
              expStatus.bgColor
            )} />
            <p className={cn(
              "text-3xl font-black tracking-tight relative",
              expStatus.color
            )}>
              {daysToExpiry !== null ? (daysToExpiry < 0 ? Math.abs(daysToExpiry) : daysToExpiry) : '—'}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">
              {expStatus.status === 'expired' ? 'Days Expired' : document.expirationDate ? 'Days to Expiry' : 'No Expiry'}
            </p>
            {expStatus.status === 'expired' && <span className="absolute top-3 right-3 w-2 h-2 rounded-full bg-error-500 animate-pulse" />}
          </div>

          {/* Effective Date */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-blue-200/60 transition-all duration-300">
            <div className="absolute inset-0 bg-blue-500 opacity-[0.02]" />
            <p className="text-lg font-bold text-charcoal-700 relative">
              {document.effectiveDate ? format(new Date(document.effectiveDate), 'MMM d, yyyy') : '—'}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Effective Date</p>
          </div>

          {/* Days Old */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
            <div className="absolute inset-0 bg-charcoal-500 opacity-[0.02]" />
            <p className="text-3xl font-black tracking-tight text-charcoal-500 relative">
              {daysOld}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Days Old</p>
          </div>
        </div>

        {/* 3-Column Info Grid */}
        <div className="grid grid-cols-3 gap-8 mb-8">
          {/* Column 1 - Document Details */}
          <div
            className="space-y-4"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.15s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-blue-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Document Details</h4>
            </div>
            <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
              <DetailRow label="Type" value={typeConfig.fullLabel} />
              <DetailRow label="Status" value={statusConfig.label} />
              <DetailRow label="Contract #" value={document.contractNumber} />
              <DetailRow label="Category" value={document.category} />
            </div>
          </div>

          {/* Column 2 - Financial Details */}
          <div
            className="space-y-4"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <DollarSign className="h-4 w-4 text-green-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Financial Details</h4>
            </div>
            <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
              <DetailRow label="Value" value={document.contractValue ? formatCurrency(document.contractValue, document.currency) : undefined} />
              <DetailRow label="Currency" value={document.currency} />
              <DetailRow label="Auto-Renew" value={document.autoRenew ? 'Yes' : 'No'} />
              <DetailRow label="Renewal Term" value={document.renewalTermMonths ? `${document.renewalTermMonths} months` : undefined} />
            </div>
          </div>

          {/* Column 3 - Timeline */}
          <div
            className="space-y-4"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.25s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-purple-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Timeline</h4>
            </div>
            <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
              <DetailRow label="Effective" value={document.effectiveDate ? format(new Date(document.effectiveDate), 'MMM d, yyyy') : undefined} />
              <DetailRow label="Expires" value={document.expirationDate ? format(new Date(document.expirationDate), 'MMM d, yyyy') : undefined} />
              <DetailRow label="Uploaded" value={format(new Date(document.uploadedAt), 'MMM d, yyyy')} />
              <DetailRow label="By" value={document.uploadedBy} />
            </div>
          </div>
        </div>

        {/* Notes Section */}
        {document.notes && (
          <div
            className="mb-8"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.3s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-charcoal-400" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Notes</h4>
            </div>
            <div className="rounded-2xl border border-charcoal-100/50 bg-charcoal-50/50 p-4">
              <p className="text-sm text-charcoal-700 whitespace-pre-wrap">{document.notes}</p>
            </div>
          </div>
        )}

        {/* Action Footer */}
        <div
          className="flex items-center justify-between pt-6 border-t border-charcoal-100"
          style={{ animation: 'fadeInUp 0.5s ease-out 0.35s forwards', opacity: 0 }}
        >
          <div className="flex items-center gap-3">
            {document.url && (
              <>
                {previewInfo.previewable && (
                  <Button
                    onClick={onPreview}
                    className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-sm"
                  >
                    <Eye className="h-4 w-4 mr-2" />
                    Preview Document
                  </Button>
                )}
                <Button variant="outline" asChild>
                  <a href={document.url} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Open in New Tab
                  </a>
                </Button>
                <Button variant="outline" onClick={handleDownload} disabled={isDownloading}>
                  {isDownloading ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Download className="h-4 w-4 mr-2" />
                  )}
                  {isDownloading ? 'Downloading...' : 'Download'}
                </Button>
              </>
            )}
          </div>
          <Button variant="ghost" className="text-error-600 hover:text-error-700 hover:bg-error-50" onClick={onDelete}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Animation keyframes */}
      <style jsx global>{`
        @keyframes slideUpFade {
          from {
            opacity: 0;
            transform: translateY(20px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  )
}

// ============================================
// Document Preview Dialog
// ============================================
interface DocumentPreviewDialogProps {
  document: AccountDocument
  open: boolean
  onOpenChange: (open: boolean) => void
}

function DocumentPreviewDialog({ document, open, onOpenChange }: DocumentPreviewDialogProps) {
  const previewInfo = canPreview(document.name, document.url)
  const [isLoading, setIsLoading] = React.useState(true)

  // Handle download for cross-origin URLs
  const handleDownload = async () => {
    if (!document.url) return

    try {
      const response = await fetch(document.url)
      const blob = await response.blob()
      const blobUrl = window.URL.createObjectURL(blob)
      const a = window.document.createElement('a')
      a.href = blobUrl
      a.download = document.name
      window.document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(blobUrl)
      window.document.body.removeChild(a)
    } catch (error) {
      console.error('Download failed:', error)
    }
  }

  // Get preview URL
  const getPreviewUrl = () => {
    if (!document.url) return null

    if (previewInfo.type === 'pdf' || previewInfo.type === 'image') {
      return document.url
    }

    // Use Google Docs viewer for Office documents
    if (previewInfo.type === 'iframe') {
      return `https://docs.google.com/viewer?url=${encodeURIComponent(document.url)}&embedded=true`
    }

    return null
  }

  const previewUrl = getPreviewUrl()

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-charcoal-100 bg-charcoal-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm",
                DOCUMENT_TYPE_CONFIG[document.type?.toLowerCase() || 'other']?.gradient || DOCUMENT_TYPE_CONFIG.other.gradient
              )}>
                {(() => {
                  const config = DOCUMENT_TYPE_CONFIG[document.type?.toLowerCase() || 'other'] || DOCUMENT_TYPE_CONFIG.other
                  const Icon = config.icon
                  return <Icon className="h-5 w-5 text-white" />
                })()}
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">{document.name}</DialogTitle>
                <DialogDescription className="text-sm text-charcoal-500">
                  {DOCUMENT_TYPE_CONFIG[document.type?.toLowerCase() || 'other']?.fullLabel || 'Document'} • {formatFileSize(document.size)}
                </DialogDescription>
              </div>
            </div>
            <div className="flex items-center gap-2">
              {document.url && (
                <>
                  <Button variant="outline" size="sm" asChild>
                    <a href={document.url} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Open
                    </a>
                  </Button>
                  <Button variant="outline" size="sm" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download
                  </Button>
                </>
              )}
            </div>
          </div>
        </DialogHeader>

        <div className="flex-1 h-full bg-charcoal-900 relative overflow-hidden" style={{ minHeight: 'calc(90vh - 80px)' }}>
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-charcoal-900">
              <div className="text-center">
                <Loader2 className="h-8 w-8 animate-spin text-blue-400 mx-auto mb-3" />
                <p className="text-sm text-charcoal-400">Loading preview...</p>
              </div>
            </div>
          )}

          {previewUrl ? (
            previewInfo.type === 'image' ? (
              <div className="absolute inset-0 flex items-center justify-center p-8">
                <img
                  src={previewUrl}
                  alt={document.name}
                  className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
                  onLoad={() => setIsLoading(false)}
                  onError={() => setIsLoading(false)}
                />
              </div>
            ) : (
              <iframe
                src={previewUrl}
                className="absolute inset-0 w-full h-full border-0"
                onLoad={() => setIsLoading(false)}
                title={`Preview of ${document.name}`}
              />
            )
          ) : (
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <FileText className="h-16 w-16 text-charcoal-600 mx-auto mb-4" />
                <p className="text-lg font-medium text-charcoal-400 mb-2">Preview not available</p>
                <p className="text-sm text-charcoal-500 mb-4">This file type cannot be previewed in the browser</p>
                {document.url && (
                  <Button variant="outline" onClick={handleDownload}>
                    <Download className="h-4 w-4 mr-2" />
                    Download File
                  </Button>
                )}
              </div>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ============================================
// Detail Row Component
// ============================================
function DetailRow({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="flex items-center justify-between px-4 py-2.5 bg-white even:bg-charcoal-50/30 border-b border-charcoal-100/30 last:border-0">
      <span className="text-xs text-charcoal-500">{label}</span>
      <span className="text-sm font-medium text-charcoal-800">{value || '—'}</span>
    </div>
  )
}

export default AccountDocumentsSection
