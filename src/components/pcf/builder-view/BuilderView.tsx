'use client'

import { useState, useCallback } from 'react'
import { toast } from 'sonner'
import { BuilderToolbar } from './BuilderToolbar'
import { BuilderSidebar } from './BuilderSidebar'
import { BuilderCanvas } from './BuilderCanvas'
import { BuilderViewSkeleton } from './BuilderViewSkeleton'
import { cn } from '@/lib/utils'
import type {
  BuilderViewConfig,
  BuilderNodeConfig,
  BuilderConnectionConfig,
  BuilderToolConfig,
} from './types'

interface BuilderViewProps {
  config: BuilderViewConfig
  isLoading?: boolean
  className?: string
}

export function BuilderView({ config, isLoading, className }: BuilderViewProps) {
  // State
  const [nodes, setNodes] = useState<BuilderNodeConfig[]>(config.initialNodes || [])
  const [connections, setConnections] = useState<BuilderConnectionConfig[]>(
    config.initialConnections || []
  )
  const [selectedNodeId, setSelectedNodeId] = useState<string | null>(null)
  const [zoom, setZoom] = useState(100)
  const [showGrid, setShowGrid] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isDirty, setIsDirty] = useState(false)
  const [isValid, setIsValid] = useState<boolean | undefined>(undefined)

  // History for undo/redo
  const [history, setHistory] = useState<Array<{ nodes: BuilderNodeConfig[]; connections: BuilderConnectionConfig[] }>>([])
  const [historyIndex, setHistoryIndex] = useState(-1)

  // Save to history
  const saveToHistory = useCallback(() => {
    const newHistory = history.slice(0, historyIndex + 1)
    newHistory.push({ nodes: [...nodes], connections: [...connections] })
    setHistory(newHistory)
    setHistoryIndex(newHistory.length - 1)
    setIsDirty(true)
  }, [history, historyIndex, nodes, connections])

  // Add node
  const handleAddNode = useCallback(
    (tool: BuilderToolConfig, x: number, y: number) => {
      const newNode: BuilderNodeConfig = {
        id: `node-${Date.now()}`,
        type: tool.type,
        label: tool.label,
        icon: tool.icon,
        x,
        y,
        data: tool.defaultData || {},
        inputs: ['input'],
        outputs: ['output'],
        isValid: true,
      }
      setNodes((prev) => [...prev, newNode])
      saveToHistory()
    },
    [saveToHistory]
  )

  // Move node
  const handleMoveNode = useCallback(
    (nodeId: string, x: number, y: number) => {
      setNodes((prev) =>
        prev.map((node) => (node.id === nodeId ? { ...node, x, y } : node))
      )
      setIsDirty(true)
    },
    []
  )

  // Delete node
  const handleDeleteNode = useCallback(
    (nodeId: string) => {
      setNodes((prev) => prev.filter((node) => node.id !== nodeId))
      setConnections((prev) =>
        prev.filter(
          (conn) => conn.sourceNodeId !== nodeId && conn.targetNodeId !== nodeId
        )
      )
      setSelectedNodeId(null)
      saveToHistory()
    },
    [saveToHistory]
  )

  // Zoom controls
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 10, config.canvasConfig?.zoomMax || 200))
  }, [config.canvasConfig?.zoomMax])

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 10, config.canvasConfig?.zoomMin || 25))
  }, [config.canvasConfig?.zoomMin])

  const handleZoomReset = useCallback(() => {
    setZoom(100)
  }, [])

  // Undo/Redo
  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1]
      setNodes(prev.nodes)
      setConnections(prev.connections)
      setHistoryIndex(historyIndex - 1)
    }
  }, [history, historyIndex])

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1]
      setNodes(next.nodes)
      setConnections(next.connections)
      setHistoryIndex(historyIndex + 1)
    }
  }, [history, historyIndex])

  // Validate
  const handleValidate = useCallback(() => {
    if (!config.onValidate) return

    const errors = config.onValidate(nodes, connections)
    setIsValid(errors.length === 0)

    if (errors.length > 0) {
      toast.error(`Found ${errors.length} error${errors.length > 1 ? 's' : ''}`)
    } else {
      toast.success('No errors found')
    }
  }, [config, nodes, connections])

  // Save
  const handleSave = useCallback(async () => {
    if (!config.onSave) return

    setIsSaving(true)
    try {
      await config.onSave(nodes, connections)
      setIsDirty(false)
      toast.success('Saved successfully')
    } catch (error) {
      toast.error('Failed to save')
    } finally {
      setIsSaving(false)
    }
  }, [config, nodes, connections])

  if (isLoading) {
    return <BuilderViewSkeleton />
  }

  return (
    <div className={cn('h-full flex flex-col bg-charcoal-50', className)}>
      {/* Toolbar */}
      <BuilderToolbar
        title={config.title}
        breadcrumbs={config.breadcrumbs}
        zoom={zoom}
        onZoomIn={handleZoomIn}
        onZoomOut={handleZoomOut}
        onZoomReset={handleZoomReset}
        showGrid={showGrid}
        onToggleGrid={() => setShowGrid((prev) => !prev)}
        canUndo={historyIndex > 0}
        canRedo={historyIndex < history.length - 1}
        onUndo={handleUndo}
        onRedo={handleRedo}
        onSave={config.onSave ? handleSave : undefined}
        onPreview={config.onPreview}
        onValidate={config.onValidate ? handleValidate : undefined}
        isSaving={isSaving}
        isDirty={isDirty}
        isValid={isValid}
        readOnly={config.readOnly}
      />

      {/* Main Content */}
      <div className="flex-1 flex overflow-hidden">
        {/* Tools Sidebar */}
        {!config.readOnly && (
          <BuilderSidebar
            tools={config.tools}
            categories={config.toolCategories}
            onToolClick={(tool) => handleAddNode(tool, 100, 100)}
          />
        )}

        {/* Canvas */}
        <BuilderCanvas
          nodes={nodes}
          connections={connections}
          selectedNodeId={selectedNodeId || undefined}
          onSelectNode={setSelectedNodeId}
          onMoveNode={handleMoveNode}
          onDeleteNode={handleDeleteNode}
          onAddNode={handleAddNode}
          zoom={zoom}
          showGrid={showGrid}
          readOnly={config.readOnly}
        />
      </div>
    </div>
  )
}

// Re-export components
export { BuilderToolbar } from './BuilderToolbar'
export { BuilderSidebar } from './BuilderSidebar'
export { BuilderCanvas } from './BuilderCanvas'
export { BuilderNode } from './BuilderNode'

