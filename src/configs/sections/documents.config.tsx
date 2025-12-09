import {
  File,
  FileText,
  FileSpreadsheet,
  FileImage,
  Folder,
  Download,
  Eye,
  User,
  HardDrive,
  Files,
} from 'lucide-react'
import type { ColumnConfig, StatusConfig, StatCardConfig } from '@/configs/entities/types'

// ============================================
// TYPES
// ============================================

export interface DocumentItem extends Record<string, unknown> {
  id: string
  name: string
  filename?: string
  file_name?: string
  fileName?: string
  description?: string
  document_type?: string
  documentType?: string
  category?: string
  file_url?: string
  fileUrl?: string
  file_size?: number
  fileSize?: number
  mime_type?: string
  mimeType?: string
  entity_type?: string
  entityType?: string
  entity_id?: string
  entityId?: string
  uploaded_by?: string
  uploadedBy?: string
  uploader?: {
    id: string
    full_name: string
    avatar_url?: string
  } | null
  created_at: string
  createdAt?: string
  uploaded_at?: string
  uploadedAt?: string
  last_accessed_at?: string
  lastAccessedAt?: string
}

// ============================================
// FILE TYPE ICONS
// ============================================

export const FILE_TYPE_ICONS: Record<string, typeof File> = {
  pdf: FileText,
  doc: FileText,
  docx: FileText,
  txt: FileText,
  xls: FileSpreadsheet,
  xlsx: FileSpreadsheet,
  csv: FileSpreadsheet,
  png: FileImage,
  jpg: FileImage,
  jpeg: FileImage,
  gif: FileImage,
  svg: FileImage,
  webp: FileImage,
  default: File,
}

export function getFileIcon(filename: string): typeof File {
  const ext = filename.split('.').pop()?.toLowerCase() || ''
  return FILE_TYPE_ICONS[ext] || FILE_TYPE_ICONS.default
}

// ============================================
// DOCUMENT TYPE CONFIGURATION (per plan)
// ============================================

export const DOCUMENT_TYPE_CONFIG: Record<string, StatusConfig> = {
  resume: {
    label: 'Resume',
    color: 'bg-blue-100 text-blue-700',
    bgColor: 'bg-blue-100',
    textColor: 'text-blue-700',
    icon: FileText,
  },
  contract: {
    label: 'Contract',
    color: 'bg-purple-100 text-purple-700',
    bgColor: 'bg-purple-100',
    textColor: 'text-purple-700',
    icon: FileText,
  },
  nda: {
    label: 'NDA',
    color: 'bg-amber-100 text-amber-700',
    bgColor: 'bg-amber-100',
    textColor: 'text-amber-700',
    icon: FileText,
  },
  sow: {
    label: 'SOW',
    color: 'bg-green-100 text-green-700',
    bgColor: 'bg-green-100',
    textColor: 'text-green-700',
    icon: FileText,
  },
  invoice: {
    label: 'Invoice',
    color: 'bg-cyan-100 text-cyan-700',
    bgColor: 'bg-cyan-100',
    textColor: 'text-cyan-700',
    icon: FileSpreadsheet,
  },
  report: {
    label: 'Report',
    color: 'bg-rose-100 text-rose-700',
    bgColor: 'bg-rose-100',
    textColor: 'text-rose-700',
    icon: FileText,
  },
  template: {
    label: 'Template',
    color: 'bg-indigo-100 text-indigo-700',
    bgColor: 'bg-indigo-100',
    textColor: 'text-indigo-700',
    icon: FileText,
  },
  collateral: {
    label: 'Collateral',
    color: 'bg-orange-100 text-orange-700',
    bgColor: 'bg-orange-100',
    textColor: 'text-orange-700',
    icon: FileText,
  },
  attachment: {
    label: 'Attachment',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: File,
  },
  other: {
    label: 'Other',
    color: 'bg-charcoal-100 text-charcoal-700',
    bgColor: 'bg-charcoal-100',
    textColor: 'text-charcoal-700',
    icon: File,
  },
}

// ============================================
// STATS CARDS CONFIGURATION (3 cards per plan)
// ============================================

export const DOCUMENTS_STATS_CONFIG: StatCardConfig[] = [
  {
    key: 'total',
    label: 'Total',
    icon: Files,
  },
  {
    key: 'byType',
    label: 'By Type',
    icon: Folder,
    // This will show breakdown - rendered differently
  },
  {
    key: 'storageUsed',
    label: 'Storage Used',
    icon: HardDrive,
    format: (value: number) => formatFileSize(value),
  },
]

// ============================================
// HELPER FUNCTIONS
// ============================================

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B'
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(1)} GB`
}

// ============================================
// COLUMNS CONFIGURATION (8 columns per plan)
// ============================================

export const DOCUMENTS_COLUMNS: ColumnConfig<DocumentItem>[] = [
  {
    key: 'name',
    header: 'Name',
    label: 'Name',
    sortable: true,
    width: 'min-w-[200px]',
    render: (value, item) => {
      const name = (value as string) || item.filename || item.file_name || item.fileName || 'Unnamed'
      const FileIcon = getFileIcon(name)
      return (
        <div className="flex items-center gap-2">
          <div className="p-1.5 bg-charcoal-100 rounded">
            <FileIcon className="w-4 h-4 text-charcoal-600" />
          </div>
          <span className="font-medium text-charcoal-900 truncate" title={name}>
            {name}
          </span>
        </div>
      )
    },
  },
  {
    key: 'documentType',
    header: 'Type',
    label: 'Type',
    sortable: true,
    width: 'w-[100px]',
    render: (value, item) => {
      const type = (value as string) || item.document_type || item.category || 'other'
      const config = DOCUMENT_TYPE_CONFIG[type] || DOCUMENT_TYPE_CONFIG.other
      return (
        <span className={`inline-flex px-2 py-0.5 rounded text-xs font-medium ${config.color}`}>
          {config.label}
        </span>
      )
    },
  },
  {
    key: 'fileSize',
    header: 'Size',
    label: 'Size',
    sortable: true,
    width: 'w-[80px]',
    align: 'right' as const,
    render: (value, item) => {
      const size = (value as number) || item.file_size || 0
      return (
        <span className="text-charcoal-600 text-sm">
          {formatFileSize(size)}
        </span>
      )
    },
  },
  {
    key: 'entityType',
    header: 'Related To',
    label: 'Related To',
    sortable: true,
    width: 'w-[150px]',
    render: (value, item) => {
      const entityType = value as string | undefined
      const entityId = item.entityId || item.entity_id
      if (!entityType || !entityId) return <span className="text-charcoal-400">—</span>
      return (
        <span className="text-charcoal-600 capitalize">
          {entityType.replace('_', ' ')}
        </span>
      )
    },
  },
  {
    key: 'uploader',
    header: 'Uploaded By',
    label: 'Uploaded By',
    sortable: true,
    width: 'w-[130px]',
    render: (value) => {
      const uploader = value as DocumentItem['uploader']
      if (!uploader) return <span className="text-charcoal-400">—</span>
      return (
        <div className="flex items-center gap-2">
          {uploader.avatar_url ? (
            <img
              src={uploader.avatar_url}
              alt={uploader.full_name}
              className="w-5 h-5 rounded-full"
            />
          ) : (
            <div className="w-5 h-5 rounded-full bg-charcoal-200 flex items-center justify-center">
              <User className="w-3 h-3 text-charcoal-500" />
            </div>
          )}
          <span className="text-sm truncate">{uploader.full_name}</span>
        </div>
      )
    },
  },
  {
    key: 'createdAt',
    header: 'Uploaded',
    label: 'Uploaded',
    sortable: true,
    width: 'w-[100px]',
    format: 'relative-date' as const,
  },
  {
    key: 'lastAccessedAt',
    header: 'Last Accessed',
    label: 'Last Accessed',
    sortable: true,
    width: 'w-[110px]',
    format: 'relative-date' as const,
  },
  {
    key: 'actions',
    header: 'Actions',
    label: 'Actions',
    width: 'w-[100px]',
    align: 'center' as const,
    render: (_value, item) => {
      // Actions will be handled by the component via callbacks
      return (
        <div className="flex items-center justify-center gap-1">
          <button
            className="p-1.5 hover:bg-charcoal-100 rounded transition-colors"
            title="Download"
            onClick={(e) => {
              e.stopPropagation()
              // Will be handled by parent component
              window.dispatchEvent(new CustomEvent('documentAction', {
                detail: { action: 'download', documentId: item.id }
              }))
            }}
          >
            <Download className="w-4 h-4 text-charcoal-500" />
          </button>
          <button
            className="p-1.5 hover:bg-charcoal-100 rounded transition-colors"
            title="Preview"
            onClick={(e) => {
              e.stopPropagation()
              window.dispatchEvent(new CustomEvent('documentAction', {
                detail: { action: 'preview', documentId: item.id }
              }))
            }}
          >
            <Eye className="w-4 h-4 text-charcoal-500" />
          </button>
        </div>
      )
    },
  },
]

// ============================================
// SORT FIELD MAPPING
// ============================================

export const DOCUMENTS_SORT_FIELD_MAP: Record<string, string> = {
  name: 'name',
  documentType: 'document_type',
  fileSize: 'file_size',
  entityType: 'entity_type',
  uploader: 'uploaded_by',
  createdAt: 'created_at',
  lastAccessedAt: 'last_accessed_at',
}

// ============================================
// EMPTY STATE CONFIG
// ============================================

export const DOCUMENTS_EMPTY_STATE = {
  icon: Folder,
  title: 'No documents yet',
  description: 'Upload documents to keep everything organized',
}
