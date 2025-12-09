import { LucideIcon } from 'lucide-react'

// ============================================
// LIBRARY VIEW CONFIGURATION
// ============================================

export interface LibraryItemConfig {
  id: string
  title: string
  description?: string
  category?: string
  tags?: string[]
  icon?: LucideIcon
  thumbnail?: string
  
  // Metadata
  author?: string
  createdAt?: string
  updatedAt?: string
  usageCount?: number
  rating?: number
  
  // State
  isSystem?: boolean // Built-in vs user-created
  isFavorite?: boolean
  
  // Data
  data?: Record<string, unknown>
}

export interface LibraryCategoryConfig {
  id: string
  label: string
  icon?: LucideIcon
  count?: number
}

export interface LibraryFilterConfig {
  id: string
  label: string
  type: 'select' | 'multi-select' | 'toggle'
  options?: Array<{ value: string; label: string }>
  defaultValue?: string | string[] | boolean
}

export interface LibraryViewConfig<T extends LibraryItemConfig = LibraryItemConfig> {
  // Header
  title: string
  description?: string
  breadcrumbs?: Array<{ label: string; href: string }>
  
  // Data
  useQuery: (filters: Record<string, unknown>) => {
    data: T[] | { items: T[]; total: number } | undefined
    isLoading: boolean
    error: unknown
  }
  
  // Categories
  categories?: LibraryCategoryConfig[]
  showCategorySidebar?: boolean
  
  // Filters
  filters?: LibraryFilterConfig[]
  searchPlaceholder?: string
  
  // Display
  displayMode?: 'grid' | 'list'
  gridColumns?: 2 | 3 | 4
  showThumbnails?: boolean
  
  // Preview
  enablePreview?: boolean
  renderPreview?: (item: T) => React.ReactNode
  
  // Actions
  onSelect?: (item: T) => void
  onUse?: (item: T) => void
  onEdit?: (item: T) => void
  onDelete?: (item: T) => void
  onDuplicate?: (item: T) => void
  onFavorite?: (item: T, isFavorite: boolean) => void
  
  // Create action
  createAction?: {
    label: string
    icon?: LucideIcon
    onClick?: () => void
    href?: string
  }
  
  // Empty state
  emptyState?: {
    icon?: LucideIcon
    title: string
    description?: string
    action?: {
      label: string
      onClick?: () => void
      href?: string
    }
  }
}

