import { LucideIcon } from 'lucide-react'

// ============================================
// BUILDER VIEW CONFIGURATION
// ============================================

export interface BuilderNodeConfig {
  id: string
  type: string
  label: string
  icon?: LucideIcon
  color?: string
  bgColor?: string
  
  // Position
  x: number
  y: number
  
  // Data
  data?: Record<string, unknown>
  
  // Ports
  inputs?: string[]
  outputs?: string[]
  
  // State
  isSelected?: boolean
  isValid?: boolean
  errors?: string[]
}

export interface BuilderConnectionConfig {
  id: string
  sourceNodeId: string
  sourcePort: string
  targetNodeId: string
  targetPort: string
  label?: string
}

export interface BuilderToolConfig {
  id: string
  label: string
  icon: LucideIcon
  type: string
  category?: string
  description?: string
  defaultData?: Record<string, unknown>
}

export interface BuilderPropertiesPanelConfig {
  title: string
  sections: Array<{
    id: string
    label: string
    fields: Array<{
      key: string
      label: string
      type: 'text' | 'textarea' | 'number' | 'select' | 'switch' | 'json'
      options?: Array<{ value: string; label: string }>
      placeholder?: string
      description?: string
    }>
  }>
}

export interface BuilderViewConfig {
  // Header
  title: string
  description?: string
  breadcrumbs?: Array<{ label: string; href: string }>
  
  // Entity info
  entityType: string
  entityId?: string
  
  // Tools palette
  tools: BuilderToolConfig[]
  toolCategories?: Array<{ id: string; label: string; icon?: LucideIcon }>
  
  // Canvas
  canvasConfig?: {
    gridSize?: number
    snapToGrid?: boolean
    zoomMin?: number
    zoomMax?: number
    showMinimap?: boolean
  }
  
  // Properties panel
  propertiesPanel?: BuilderPropertiesPanelConfig
  
  // Actions
  onSave?: (nodes: BuilderNodeConfig[], connections: BuilderConnectionConfig[]) => Promise<void>
  onPreview?: () => void
  onValidate?: (nodes: BuilderNodeConfig[], connections: BuilderConnectionConfig[]) => string[]
  
  // Initial data
  initialNodes?: BuilderNodeConfig[]
  initialConnections?: BuilderConnectionConfig[]
  
  // Read-only mode
  readOnly?: boolean
}

