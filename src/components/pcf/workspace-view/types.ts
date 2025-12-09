import { LucideIcon } from 'lucide-react'
import type { ColumnConfig, RowAction, EmptyStateConfig } from '@/configs/entities/types'

// ============================================
// WORKSPACE VIEW CONFIGURATION
// ============================================

export interface WorkspaceSummaryConfig {
  id: string
  label: string
  icon?: LucideIcon
  iconBg?: string
  iconColor?: string
  getValue: () => number | string | undefined
  href?: string
  tooltip?: string
}

export interface WorkspaceTabConfig<T = unknown> {
  id: string
  label: string
  icon?: LucideIcon
  badge?: () => number | undefined
  
  // Data
  useQuery: () => {
    data: { items: T[]; total: number } | T[] | undefined
    isLoading: boolean
    error: unknown
  }
  
  // Table configuration
  columns: ColumnConfig<T>[]
  rowActions?: RowAction<T>[]
  onRowClick?: (item: T) => void
  getRowHref?: (item: T) => string
  
  // Empty state
  emptyState?: EmptyStateConfig
  
  // Pagination
  pageSize?: number
  showPagination?: boolean
}

export interface WorkspaceViewConfig {
  // Header
  title?: string
  description?: string
  showGreeting?: boolean // "Good morning, {name}"
  
  // Summary metrics (top cards)
  summary?: WorkspaceSummaryConfig[]
  summaryColumns?: 2 | 3 | 4 | 5 | 6
  
  // Tabs
  tabs: WorkspaceTabConfig[]
  defaultTab?: string
  
  // Actions
  quickActions?: Array<{
    id: string
    label: string
    icon?: LucideIcon
    variant?: 'default' | 'outline' | 'premium'
    onClick?: () => void
    href?: string
  }>
  
  // Layout
  layout?: 'tabs' | 'split' // tabs = full width tabs, split = side-by-side tables
}

