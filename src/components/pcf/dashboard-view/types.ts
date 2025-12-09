import { LucideIcon } from 'lucide-react'

// ============================================
// DASHBOARD VIEW CONFIGURATION
// ============================================

export interface DashboardMetricConfig {
  id: string
  label: string
  icon?: LucideIcon
  iconBg?: string
  iconColor?: string
  getValue: () => string | number | undefined
  getChange?: () => { value: number; trend: 'up' | 'down' | 'neutral' }
  format?: 'number' | 'currency' | 'percent' | ((value: number | string) => string)
  href?: string
  tooltip?: string
}

export interface DashboardWidgetConfig {
  id: string
  title: string
  description?: string
  icon?: LucideIcon
  
  // Layout
  colSpan?: 1 | 2 | 3 | 4
  rowSpan?: 1 | 2
  
  // Content
  component?: React.ComponentType<{ data?: unknown }>
  useQuery?: () => { data: unknown; isLoading: boolean; error: unknown }
  
  // Actions
  headerAction?: {
    label: string
    icon?: LucideIcon
    href?: string
    onClick?: () => void
  }
  
  // Empty state
  emptyState?: {
    icon?: LucideIcon
    title: string
    description?: string
  }
}

export interface DashboardActionConfig {
  id: string
  label: string
  icon?: LucideIcon
  variant?: 'default' | 'outline' | 'premium'
  href?: string
  onClick?: () => void
}

export interface DashboardViewConfig {
  // Header
  title: string
  description?: string
  breadcrumbs?: Array<{ label: string; href: string }>
  
  // Date range filter
  dateRangeFilter?: boolean
  defaultDateRange?: '7d' | '30d' | '90d' | 'custom'
  
  // Actions
  actions?: DashboardActionConfig[]
  
  // Metrics (top row of stats cards)
  metrics?: DashboardMetricConfig[]
  metricsColumns?: 2 | 3 | 4 | 5 | 6
  
  // Widgets
  widgets?: DashboardWidgetConfig[]
  widgetColumns?: 2 | 3 | 4
  
  // Refresh
  refreshInterval?: number // milliseconds
  
  // Custom content
  renderCustomHeader?: () => React.ReactNode
  renderCustomContent?: () => React.ReactNode
}

