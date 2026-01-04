'use client'

import * as React from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import {
  FileText, FileSignature, File, FileCheck2, FilePlus, FileImage, FileSpreadsheet,
  Plus, Search, MoreVertical, Download, ExternalLink, Eye, Edit,
  X, ChevronLeft, ChevronRight, Calendar, User, Clock, Loader2, Trash2,
  FileVideo, FileAudio, Maximize2
} from 'lucide-react'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import type { ContactDocument } from '@/types/workspace'
import { cn } from '@/lib/utils'
import { differenceInDays, format, formatDistanceToNow } from 'date-fns'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { useContactWorkspace } from '../ContactWorkspaceProvider'
import {
  Dialog,
  DialogContent,
  DialogDescription,
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

interface ContactDocumentsSectionProps {
  documents: ContactDocument[]
  contactId: string
}

type CategoryFilter = 'all' | 'resume' | 'contract' | 'other'

// Document type configuration with gradients
const DOCUMENT_TYPE_CONFIG: Record<string, {
  icon: React.ComponentType<{ className?: string }>
  gradient: string
  label: string
  fullLabel: string
}> = {
  resume: { icon: FileText, gradient: 'from-blue-400 to-blue-600', label: 'Resume', fullLabel: 'Resume/CV' },
  cover_letter: { icon: FileSignature, gradient: 'from-purple-400 to-purple-600', label: 'Cover Letter', fullLabel: 'Cover Letter' },
  offer_letter: { icon: FileCheck2, gradient: 'from-green-400 to-green-600', label: 'Offer', fullLabel: 'Offer Letter' },
  contract: { icon: File, gradient: 'from-amber-400 to-amber-600', label: 'Contract', fullLabel: 'Employment Contract' },
  id_document: { icon: FileCheck2, gradient: 'from-cyan-400 to-cyan-600', label: 'ID Doc', fullLabel: 'ID Document' },
  certification: { icon: FilePlus, gradient: 'from-teal-400 to-teal-600', label: 'Cert', fullLabel: 'Certification' },
  image: { icon: FileImage, gradient: 'from-pink-400 to-pink-600', label: 'Image', fullLabel: 'Image' },
  spreadsheet: { icon: FileSpreadsheet, gradient: 'from-emerald-400 to-emerald-600', label: 'Sheet', fullLabel: 'Spreadsheet' },
  other: { icon: FileText, gradient: 'from-charcoal-400 to-charcoal-500', label: 'Other', fullLabel: 'Document' },
}

// File type icons based on extension
function getFileIcon(fileName: string): React.ComponentType<{ className?: string }> {
  const ext = fileName?.split('.').pop()?.toLowerCase() || ''
  if (['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg', 'bmp'].includes(ext)) return FileImage
  if (['mp4', 'mov', 'avi', 'webm', 'mkv'].includes(ext)) return FileVideo
  if (['mp3', 'wav', 'ogg', 'aac'].includes(ext)) return FileAudio
  if (['pdf'].includes(ext)) return FileText
  if (['xls', 'xlsx', 'csv'].includes(ext)) return FileSpreadsheet
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

// Helper: Format file size
function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  const k = 1024
  const sizes = ['B', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i]
}

// Categorize document
function categorizeDocument(type: string | undefined): 'resume' | 'contract' | 'other' {
  const docType = type?.toLowerCase() || ''
  if (['resume', 'cover_letter'].includes(docType)) return 'resume'
  if (['offer_letter', 'contract'].includes(docType)) return 'contract'
  return 'other'
}

/**
 * ContactDocumentsSection - Premium Documents workspace with Activities-style list view
 * Features: Grid list view with headers, bottom detail panel with preview, rich document management
 */
export function ContactDocumentsSection({ documents, contactId }: ContactDocumentsSectionProps) {
  const { toast } = useToast()
  const { refreshData } = useContactWorkspace()

  const [selectedDocument, setSelectedDocument] = React.useState<ContactDocument | null>(null)
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
      resume: 0,
      contract: 0,
      other: 0,
    }
    documents.forEach(doc => {
      const cat = categorizeDocument(doc.type)
      counts[cat]++
    })
    return counts
  }, [documents])

  // Filter documents
  const filteredDocuments = React.useMemo(() => {
    let result = documents

    // Category filter
    if (categoryFilter !== 'all') {
      result = result.filter(doc => categorizeDocument(doc.type) === categoryFilter)
    }

    // Search filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(doc =>
        doc.name.toLowerCase().includes(q) ||
        doc.type?.toLowerCase().includes(q) ||
        doc.uploadedBy?.toLowerCase().includes(q)
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

  const handleRowClick = (document: ContactDocument) => {
    if (selectedDocument?.id === document.id) {
      setSelectedDocument(null)
    } else {
      setSelectedDocument(document)
    }
  }

  const handleOpenAddDialog = () => {
    window.dispatchEvent(new CustomEvent('openContactDialog', {
      detail: { dialogId: 'addDocument', contactId }
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
                <h3 className="font-semibold text-charcoal-900">Documents</h3>
                <p className="text-xs text-charcoal-500">
                  {filteredDocuments.length} document{filteredDocuments.length !== 1 ? 's' : ''} for this contact
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
                Upload Document
              </Button>
            </div>
          </div>

          {/* Category Filter Pills */}
          {documents.length > 0 && (
            <div className="flex items-center gap-2 mt-4">
              {[
                { key: 'all', label: 'All', count: categoryCounts.all },
                { key: 'resume', label: 'Resumes', count: categoryCounts.resume },
                { key: 'contract', label: 'Contracts', count: categoryCounts.contract },
                { key: 'other', label: 'Other', count: categoryCounts.other },
              ].filter(f => f.count > 0 || f.key === 'all').map((filter) => (
                <button
                  key={filter.key}
                  onClick={() => setCategoryFilter(filter.key as CategoryFilter)}
                  className={cn(
                    "px-3 py-1.5 rounded-full text-xs font-medium transition-all",
                    categoryFilter === filter.key
                      ? "bg-charcoal-900 text-white shadow-sm"
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
        <div className="grid grid-cols-[40px_1fr_100px_100px_100px_60px] gap-2 px-4 py-2.5 bg-charcoal-50/80 border-b border-charcoal-200/60 text-[10px] font-bold text-charcoal-400 uppercase tracking-[0.1em]">
          <div className="text-center">#</div>
          <div>Document</div>
          <div>Type</div>
          <div className="text-right">Size</div>
          <div className="text-center">Uploaded</div>
          <div className="text-right">Actions</div>
        </div>

        {/* Table Body */}
        {paginatedDocuments.length > 0 ? (
          <div className="divide-y divide-charcoal-100/40">
            {paginatedDocuments.map((doc, idx) => {
              const rowNumber = ((currentPage - 1) * ITEMS_PER_PAGE) + idx + 1
              const typeConfig = getDocumentTypeConfig(doc.type)
              const TypeIcon = typeConfig.icon

              return (
                <div
                  key={doc.id}
                  onClick={() => handleRowClick(doc)}
                  className={cn(
                    'group grid grid-cols-[40px_1fr_100px_100px_100px_60px] gap-2 px-4 py-3 cursor-pointer transition-all duration-150 items-center',
                    selectedDocument?.id === doc.id
                      ? 'bg-blue-50/80 border-l-2 border-l-blue-500'
                      : 'hover:bg-charcoal-50/60 border-l-2 border-l-transparent'
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
                      </div>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-charcoal-500">
                        <span>by {doc.uploadedBy}</span>
                      </div>
                    </div>
                  </div>

                  {/* Type */}
                  <div>
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-[10px] font-semibold px-1.5 py-0 border-0",
                        typeConfig.gradient.includes('blue') ? 'bg-blue-50 text-blue-700' :
                        typeConfig.gradient.includes('purple') ? 'bg-purple-50 text-purple-700' :
                        typeConfig.gradient.includes('green') ? 'bg-green-50 text-green-700' :
                        typeConfig.gradient.includes('amber') ? 'bg-amber-50 text-amber-700' :
                        'bg-charcoal-100 text-charcoal-600'
                      )}
                    >
                      {typeConfig.label}
                    </Badge>
                  </div>

                  {/* Size */}
                  <div className="text-right">
                    <span className="text-sm text-charcoal-600 tabular-nums">
                      {formatFileSize(doc.size)}
                    </span>
                  </div>

                  {/* Uploaded */}
                  <div className="text-center">
                    <div className="text-xs text-charcoal-600">
                      <div className="font-medium tabular-nums">{format(new Date(doc.uploadedAt), 'MMM d')}</div>
                      <div className="text-[10px] text-charcoal-400">{format(new Date(doc.uploadedAt), 'yyyy')}</div>
                    </div>
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
                        <DropdownMenuItem
                          onClick={(e) => { e.stopPropagation(); setSelectedDocument(doc); setDeleteDialogOpen(true) }}
                          className="text-error-600 focus:text-error-600 focus:bg-error-50"
                        >
                          <Trash2 className="h-3.5 w-3.5 mr-2" />
                          Delete
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
              {searchQuery || categoryFilter !== 'all' ? 'Try different search terms or filters' : 'Upload resumes, cover letters, contracts, and other files'}
            </p>
            {!searchQuery && categoryFilter === 'all' && (
              <div className="flex items-center justify-center gap-2 mt-4">
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white"
                  onClick={handleOpenAddDialog}
                >
                  <Plus className="h-4 w-4 mr-1.5" />
                  Upload Document
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
          contactId={contactId}
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
  document: ContactDocument
  onClose: () => void
  onPreview: () => void
  onDelete: () => void
  refreshData: () => void
  contactId: string
}

function DocumentDetailBottomPanel({
  document,
  onClose,
  onPreview,
  onDelete,
  refreshData,
  contactId,
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
  const previewInfo = canPreview(document.name, document.url)

  // Calculate KPIs
  const daysOld = differenceInDays(new Date(), new Date(document.uploadedAt))
  const fileExt = document.name.split('.').pop()?.toUpperCase() || 'FILE'

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
              "absolute inset-0 rounded-2xl blur-xl opacity-40 bg-blue-400"
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
              <Badge
                variant="outline"
                className={cn(
                  "text-xs font-semibold border-0 shadow-sm",
                  typeConfig.gradient.includes('blue') ? 'bg-blue-50 text-blue-700' :
                  typeConfig.gradient.includes('purple') ? 'bg-purple-50 text-purple-700' :
                  typeConfig.gradient.includes('green') ? 'bg-green-50 text-green-700' :
                  'bg-charcoal-100 text-charcoal-600'
                )}
              >
                {typeConfig.label}
              </Badge>
            </div>
            <div className="flex items-center gap-4 mt-2 text-sm text-charcoal-500">
              <span className="flex items-center gap-1.5">
                <span className="w-1 h-1 rounded-full bg-charcoal-300" />
                {typeConfig.fullLabel}
              </span>
              <span className="text-charcoal-400">{formatFileSize(document.size)}</span>
              <span className="text-charcoal-400">•</span>
              <span className="text-charcoal-400">{fileExt}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-8 py-6">
        {/* KPI Cards */}
        <div
          className="grid grid-cols-3 gap-4 mb-8"
          style={{ animation: 'fadeInUp 0.4s ease-out 0.1s forwards', opacity: 0 }}
        >
          {/* File Size */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
            <div className="absolute inset-0 bg-blue-500 opacity-[0.02]" />
            <p className="text-2xl font-black tracking-tight text-blue-600 relative">
              {formatFileSize(document.size)}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">File Size</p>
          </div>

          {/* Days Old */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-charcoal-200/60 transition-all duration-300">
            <div className="absolute inset-0 bg-charcoal-500 opacity-[0.02]" />
            <p className="text-3xl font-black tracking-tight text-charcoal-500 relative">
              {daysOld}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">Days Old</p>
          </div>

          {/* File Type */}
          <div className="group relative rounded-2xl bg-white border border-charcoal-100/60 p-5 text-center overflow-hidden hover:shadow-lg hover:border-purple-200/60 transition-all duration-300">
            <div className="absolute inset-0 bg-purple-500 opacity-[0.02]" />
            <p className="text-xl font-bold text-purple-600 relative">
              {fileExt}
            </p>
            <p className="text-[10px] text-charcoal-400 font-semibold uppercase tracking-[0.15em] mt-2 relative">File Type</p>
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
              <DetailRow label="Name" value={document.name} />
              <DetailRow label="Type" value={typeConfig.fullLabel} />
              <DetailRow label="Extension" value={fileExt} />
              <DetailRow label="Size" value={formatFileSize(document.size)} />
            </div>
          </div>

          {/* Column 2 - Upload Info */}
          <div
            className="space-y-4"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.2s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-green-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Upload Info</h4>
            </div>
            <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
              <DetailRow label="Uploaded By" value={document.uploadedBy} />
              <DetailRow label="Date" value={format(new Date(document.uploadedAt), 'MMM d, yyyy')} />
              <DetailRow label="Time" value={format(new Date(document.uploadedAt), 'h:mm a')} />
              <DetailRow label="Days Ago" value={`${daysOld} days`} />
            </div>
          </div>

          {/* Column 3 - Preview Info */}
          <div
            className="space-y-4"
            style={{ animation: 'fadeInUp 0.5s ease-out 0.25s forwards', opacity: 0 }}
          >
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-500" />
              <h4 className="text-[11px] font-bold text-charcoal-500 tracking-[0.1em] uppercase">Preview</h4>
            </div>
            <div className="space-y-0 rounded-2xl border border-charcoal-100/50 overflow-hidden">
              <DetailRow label="Previewable" value={previewInfo.previewable ? 'Yes' : 'No'} />
              <DetailRow label="Preview Type" value={previewInfo.type !== 'none' ? previewInfo.type.toUpperCase() : '—'} />
              <DetailRow label="Has URL" value={document.url ? 'Yes' : 'No'} />
            </div>
          </div>
        </div>

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
  document: ContactDocument
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
  const typeConfig = DOCUMENT_TYPE_CONFIG[document.type?.toLowerCase() || 'other'] || DOCUMENT_TYPE_CONFIG.other
  const TypeIcon = typeConfig.icon

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[90vh] p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 border-b border-charcoal-100 bg-charcoal-50/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={cn(
                "w-10 h-10 rounded-lg bg-gradient-to-br flex items-center justify-center shadow-sm",
                typeConfig.gradient
              )}>
                <TypeIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <DialogTitle className="text-lg font-semibold">{document.name}</DialogTitle>
                <DialogDescription className="text-sm text-charcoal-500">
                  {typeConfig.fullLabel} • {formatFileSize(document.size)}
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
      <span className="text-sm font-medium text-charcoal-800 truncate max-w-[200px]">{value || '—'}</span>
    </div>
  )
}

export default ContactDocumentsSection
