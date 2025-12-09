'use client'

import { useState, useMemo, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
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
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
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
import {
  DOCUMENT_TYPE_CONFIG,
  DOCUMENTS_COLUMNS,
  DOCUMENTS_SORT_FIELD_MAP,
  formatFileSize,
  getFileIcon,
  type DocumentItem,
} from '@/configs/sections/documents.config'

interface DocumentsSectionProps {
  entityType: string
  entityId: string
  documents?: DocumentItem[]
  isLoading?: boolean
  showStats?: boolean
  onUpload?: () => void
  onDownload?: (doc: DocumentItem) => void
  onPreview?: (doc: DocumentItem) => void
  onDelete?: (doc: DocumentItem) => void
}

export function DocumentsSection({
  entityType: _entityType,
  entityId: _entityId,
  documents = [],
  isLoading = false,
  showStats = true,
  onUpload,
  onDownload,
  onPreview,
  onDelete,
}: DocumentsSectionProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [selectedDocId, setSelectedDocId] = useState<string | null>(null)

  // Get current sort state from URL
  const currentSortBy = searchParams.get('docsSortBy') || 'createdAt'
  const currentSortOrder = (searchParams.get('docsSortOrder') || 'desc') as 'asc' | 'desc'

  const selectedDoc = documents.find((d) => d.id === selectedDocId)

  // Listen for document action events (from table action buttons)
  useEffect(() => {
    const handleDocumentAction = (e: Event) => {
      const customEvent = e as CustomEvent<{ action: string; documentId: string }>
      const doc = documents.find(d => d.id === customEvent.detail.documentId)
      if (!doc) return

      if (customEvent.detail.action === 'download' && onDownload) {
        onDownload(doc)
      } else if (customEvent.detail.action === 'preview' && onPreview) {
        onPreview(doc)
      }
    }

    window.addEventListener('documentAction', handleDocumentAction)
    return () => window.removeEventListener('documentAction', handleDocumentAction)
  }, [documents, onDownload, onPreview])

  // Transform and sort documents
  const sortedDocuments = useMemo(() => {
    // Normalize data
    const normalized = documents.map(item => ({
      ...item,
      name: item.name || item.filename || item.file_name || item.fileName || 'Unnamed',
      documentType: item.document_type || item.documentType || item.category || 'other',
      fileSize: item.file_size || item.fileSize || 0,
      createdAt: item.created_at || item.createdAt || item.uploaded_at || item.uploadedAt,
      lastAccessedAt: item.last_accessed_at || item.lastAccessedAt,
      entityType: item.entity_type || item.entityType,
      entityId: item.entity_id || item.entityId,
    }))

    // Sort by selected column
    const sortField = DOCUMENTS_SORT_FIELD_MAP[currentSortBy] || 'created_at'
    return [...normalized].sort((a, b) => {
      let aVal: string | number | undefined
      let bVal: string | number | undefined

      switch (sortField) {
        case 'name':
          aVal = a.name
          bVal = b.name
          break
        case 'document_type':
          aVal = a.documentType
          bVal = b.documentType
          break
        case 'file_size':
          aVal = a.fileSize
          bVal = b.fileSize
          break
        case 'created_at':
          aVal = a.createdAt
          bVal = b.createdAt
          break
        case 'last_accessed_at':
          aVal = a.lastAccessedAt
          bVal = b.lastAccessedAt
          break
        default:
          aVal = a.createdAt
          bVal = b.createdAt
          break
      }

      if (!aVal && !bVal) return 0
      if (!aVal) return 1
      if (!bVal) return -1

      if (typeof aVal === 'number' && typeof bVal === 'number') {
        return currentSortOrder === 'asc' ? aVal - bVal : bVal - aVal
      }

      const comparison = String(aVal).localeCompare(String(bVal))
      return currentSortOrder === 'asc' ? comparison : -comparison
    })
  }, [documents, currentSortBy, currentSortOrder])

  // Calculate stats
  const stats = useMemo(() => {
    const total = documents.length
    const storageUsed = documents.reduce((acc, doc) => acc + (doc.file_size || doc.fileSize || 0), 0)
    const byType: Record<string, number> = {}
    documents.forEach(doc => {
      const type = doc.document_type || doc.documentType || doc.category || 'other'
      byType[type] = (byType[type] || 0) + 1
    })
    return { total, storageUsed, byType }
  }, [documents])

  const handleSort = (columnKey: string) => {
    const params = new URLSearchParams(searchParams.toString())
    const newOrder = currentSortBy === columnKey && currentSortOrder === 'desc' ? 'asc' : 'desc'
    params.set('docsSortBy', columnKey)
    params.set('docsSortOrder', newOrder)
    router.replace(`?${params.toString()}`, { scroll: false })
  }

  const getSortIcon = (columnKey: string) => {
    if (currentSortBy !== columnKey) {
      return <ArrowUpDown className="ml-1 h-3.5 w-3.5 text-charcoal-400" />
    }
    return currentSortOrder === 'asc'
      ? <ArrowUp className="ml-1 h-3.5 w-3.5 text-gold-600" />
      : <ArrowDown className="ml-1 h-3.5 w-3.5 text-gold-600" />
  }

  const formatCellValue = (item: DocumentItem & { name: string; documentType: string; fileSize: number; createdAt?: string; lastAccessedAt?: string }, column: typeof DOCUMENTS_COLUMNS[number]) => {
    const keys = column.key.split('.')
    let value: unknown = item
    for (const key of keys) {
      value = (value as Record<string, unknown>)?.[key]
    }

    // Custom render function takes priority
    if (column.render) {
      return column.render(value, item)
    }

    // Handle null/undefined
    if (value === null || value === undefined) {
      return <span className="text-charcoal-400">—</span>
    }

    // Format based on column type
    switch (column.format) {
      case 'date':
        try {
          return format(new Date(String(value)), 'MMM d, yyyy')
        } catch {
          return String(value)
        }

      case 'relative-date':
        try {
          return formatDistanceToNow(new Date(String(value)), { addSuffix: true })
        } catch {
          return String(value)
        }

      default:
        return String(value)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-4">
        {showStats && (
          <div className="grid grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="bg-white animate-pulse">
                <CardContent className="py-4">
                  <div className="h-16 bg-charcoal-100 rounded" />
                </CardContent>
              </Card>
            ))}
          </div>
        )}
        <Card className="bg-white animate-pulse">
          <CardContent className="py-4">
            <div className="h-64 bg-charcoal-100 rounded" />
          </CardContent>
        </Card>
      </div>
    )
  }

  if (documents.length === 0) {
    return (
      <EmptyState
        config={{
          icon: Folder,
          title: 'No documents yet',
          description: 'Upload documents to keep everything organized',
          action: onUpload ? { label: 'Upload Document', onClick: onUpload } : undefined,
        }}
        variant="inline"
      />
    )
  }

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      {showStats && (
        <div className="grid grid-cols-3 gap-4">
          <Card className="bg-white">
            <CardContent className="py-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-charcoal-100 rounded-lg">
                  <Files className="w-5 h-5 text-charcoal-600" />
                </div>
                <div>
                  <p className="text-2xl font-semibold text-charcoal-900">
                    {stats.total.toLocaleString()}
                  </p>
                  <p className="text-sm text-charcoal-500">Total</p>
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
                    {Object.entries(stats.byType).slice(0, 3).map(([type, count]) => {
                      const config = DOCUMENT_TYPE_CONFIG[type] || DOCUMENT_TYPE_CONFIG.other
                      return (
                        <Badge key={type} className={cn('text-xs', config.color)}>
                          {config.label}: {count}
                        </Badge>
                      )
                    })}
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
                    {formatFileSize(stats.storageUsed)}
                  </p>
                  <p className="text-sm text-charcoal-500">Storage Used</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Table and Inline Panel */}
      <div className="flex gap-4">
        {/* Documents Table */}
        <div
          className={cn(
            'flex-1 transition-all duration-300',
            selectedDocId ? 'max-w-[calc(100%-400px)]' : 'max-w-full'
          )}
        >
          {/* Header */}
          {onUpload && (
            <div className="flex justify-end mb-4">
              <Button onClick={onUpload} size="sm">
                <Upload className="w-4 h-4 mr-1" />
                Upload
              </Button>
            </div>
          )}

          {/* Table */}
          <Card className="bg-white overflow-hidden">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-charcoal-50 border-b border-charcoal-200">
                    {DOCUMENTS_COLUMNS.map((column) => (
                      <TableHead
                        key={column.key}
                        className={cn(
                          'font-semibold text-charcoal-700 text-xs uppercase tracking-wider',
                          column.width,
                          column.align === 'center' && 'text-center',
                          column.align === 'right' && 'text-right',
                          column.sortable && 'cursor-pointer select-none hover:bg-charcoal-100 transition-colors'
                        )}
                        onClick={column.sortable ? () => handleSort(column.key) : undefined}
                      >
                        <span className="flex items-center">
                          {column.header || column.label}
                          {column.sortable && getSortIcon(column.key)}
                        </span>
                      </TableHead>
                    ))}
                    <TableHead className="w-[60px]"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {sortedDocuments.map((doc) => (
                    <TableRow
                      key={doc.id}
                      className={cn(
                        'cursor-pointer transition-colors',
                        selectedDocId === doc.id
                          ? 'bg-gold-50/50'
                          : 'hover:bg-charcoal-50'
                      )}
                      onClick={() => setSelectedDocId(doc.id)}
                    >
                      {DOCUMENTS_COLUMNS.map((column) => (
                        <TableCell
                          key={column.key}
                          className={cn(
                            column.align === 'center' && 'text-center',
                            column.align === 'right' && 'text-right'
                          )}
                        >
                          {formatCellValue(doc, column)}
                        </TableCell>
                      ))}
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {onPreview && (
                              <DropdownMenuItem onClick={() => onPreview(doc)}>
                                <Eye className="w-4 h-4 mr-2" />
                                Preview
                              </DropdownMenuItem>
                            )}
                            {onDownload && (
                              <DropdownMenuItem onClick={() => onDownload(doc)}>
                                <Download className="w-4 h-4 mr-2" />
                                Download
                              </DropdownMenuItem>
                            )}
                            {onDelete && (
                              <>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem className="text-red-600" onClick={() => onDelete(doc)}>
                                  <Trash2 className="w-4 h-4 mr-2" />
                                  Delete
                                </DropdownMenuItem>
                              </>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </Card>
        </div>

        {/* Inline Panel */}
        <InlinePanel
          isOpen={!!selectedDoc}
          onClose={() => setSelectedDocId(null)}
          title={selectedDoc?.name || selectedDoc?.filename || selectedDoc?.file_name || 'Document'}
          description="Document details"
          width="md"
          actions={
            <div className="flex gap-2">
              {onDownload && selectedDoc && (
                <Button variant="outline" className="flex-1" onClick={() => onDownload(selectedDoc)}>
                  <Download className="w-4 h-4 mr-1" />
                  Download
                </Button>
              )}
              {onPreview && selectedDoc && (
                <Button className="flex-1" onClick={() => onPreview(selectedDoc)}>
                  <Eye className="w-4 h-4 mr-1" />
                  Preview
                </Button>
              )}
            </div>
          }
        >
          {selectedDoc && (
            <>
              <InlinePanelSection title="File Information">
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Filename</span>
                    <span className="font-medium truncate max-w-[200px]">
                      {selectedDoc.name || selectedDoc.filename || selectedDoc.file_name}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Size</span>
                    <span className="font-medium">
                      {formatFileSize(selectedDoc.file_size || selectedDoc.fileSize || 0)}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Type</span>
                    <Badge className={DOCUMENT_TYPE_CONFIG[selectedDoc.document_type || selectedDoc.documentType || selectedDoc.category || 'other']?.color || DOCUMENT_TYPE_CONFIG.other.color}>
                      {DOCUMENT_TYPE_CONFIG[selectedDoc.document_type || selectedDoc.documentType || selectedDoc.category || 'other']?.label || DOCUMENT_TYPE_CONFIG.other.label}
                    </Badge>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-charcoal-500">Uploaded</span>
                    <span className="font-medium">
                      {(selectedDoc.created_at || selectedDoc.createdAt || selectedDoc.uploaded_at || selectedDoc.uploadedAt) &&
                        format(new Date(selectedDoc.created_at || selectedDoc.createdAt || selectedDoc.uploaded_at || selectedDoc.uploadedAt!), 'MMM d, yyyy')}
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
                  {(selectedDoc.last_accessed_at || selectedDoc.lastAccessedAt) && (
                    <div className="flex justify-between">
                      <span className="text-charcoal-500">Last accessed</span>
                      <span className="font-medium">
                        {formatDistanceToNow(new Date(selectedDoc.last_accessed_at || selectedDoc.lastAccessedAt!), { addSuffix: true })}
                      </span>
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
