'use client'

import { useRef, useState, useCallback } from 'react'
import { BuilderNode } from './BuilderNode'
import { cn } from '@/lib/utils'
import type { BuilderNodeConfig, BuilderConnectionConfig, BuilderToolConfig } from './types'

interface BuilderCanvasProps {
  nodes: BuilderNodeConfig[]
  connections: BuilderConnectionConfig[]
  selectedNodeId?: string
  onSelectNode?: (nodeId: string | null) => void
  onMoveNode?: (nodeId: string, x: number, y: number) => void
  onDeleteNode?: (nodeId: string) => void
  onAddNode?: (tool: BuilderToolConfig, x: number, y: number) => void
  zoom?: number
  showGrid?: boolean
  readOnly?: boolean
  className?: string
}

export function BuilderCanvas({
  nodes,
  connections,
  selectedNodeId,
  onSelectNode,
  onMoveNode,
  onDeleteNode,
  onAddNode,
  zoom = 100,
  showGrid = true,
  readOnly,
  className,
}: BuilderCanvasProps) {
  const canvasRef = useRef<HTMLDivElement>(null)
  const [draggedNode, setDraggedNode] = useState<string | null>(null)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })

  // Handle drag over for adding new nodes
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  // Handle drop for adding new nodes
  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()

      const data = e.dataTransfer.getData('application/json')
      if (!data || !onAddNode) return

      try {
        const tool = JSON.parse(data) as BuilderToolConfig
        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = (e.clientX - rect.left) * (100 / zoom)
        const y = (e.clientY - rect.top) * (100 / zoom)

        onAddNode(tool, x, y)
      } catch {
        // Invalid JSON, ignore
      }
    },
    [onAddNode, zoom]
  )

  // Handle node drag start
  const handleNodeDragStart = useCallback(
    (nodeId: string, e: React.DragEvent) => {
      if (readOnly) return

      const node = nodes.find((n) => n.id === nodeId)
      if (!node) return

      setDraggedNode(nodeId)

      // Calculate offset from mouse to node position
      const rect = (e.target as HTMLElement).getBoundingClientRect()
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      })

      // Set drag image to be transparent
      const img = new Image()
      img.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'
      e.dataTransfer.setDragImage(img, 0, 0)
    },
    [nodes, readOnly]
  )

  // Handle canvas click to deselect
  const handleCanvasClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === canvasRef.current) {
        onSelectNode?.(null)
      }
    },
    [onSelectNode]
  )

  // Render connection lines
  const renderConnections = () => {
    return connections.map((conn) => {
      const sourceNode = nodes.find((n) => n.id === conn.sourceNodeId)
      const targetNode = nodes.find((n) => n.id === conn.targetNodeId)

      if (!sourceNode || !targetNode) return null

      // Simple bezier curve between nodes
      const startX = sourceNode.x + 180 // Right side of node
      const startY = sourceNode.y + 40
      const endX = targetNode.x // Left side of node
      const endY = targetNode.y + 40

      const controlX = (startX + endX) / 2

      return (
        <path
          key={conn.id}
          d={`M ${startX} ${startY} C ${controlX} ${startY}, ${controlX} ${endY}, ${endX} ${endY}`}
          stroke="#94a3b8"
          strokeWidth="2"
          fill="none"
          className="pointer-events-none"
        />
      )
    })
  }

  return (
    <div
      ref={canvasRef}
      className={cn(
        'flex-1 relative overflow-auto',
        showGrid && 'bg-[length:20px_20px]',
        className
      )}
      style={{
        backgroundImage: showGrid
          ? 'radial-gradient(circle, #e2e8f0 1px, transparent 1px)'
          : undefined,
        backgroundSize: showGrid ? `${20 * (zoom / 100)}px ${20 * (zoom / 100)}px` : undefined,
      }}
      onDragOver={handleDragOver}
      onDrop={handleDrop}
      onClick={handleCanvasClick}
    >
      {/* Zoom container */}
      <div
        className="relative min-h-full min-w-full"
        style={{
          transform: `scale(${zoom / 100})`,
          transformOrigin: 'top left',
        }}
      >
        {/* Connections SVG */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {renderConnections()}
        </svg>

        {/* Nodes */}
        {nodes.map((node) => (
          <BuilderNode
            key={node.id}
            node={node}
            isSelected={node.id === selectedNodeId}
            onSelect={() => onSelectNode?.(node.id)}
            onDelete={() => onDeleteNode?.(node.id)}
            onDragStart={(e) => handleNodeDragStart(node.id, e)}
            readOnly={readOnly}
          />
        ))}

        {/* Empty state */}
        {nodes.length === 0 && (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-100 flex items-center justify-center">
                <svg
                  className="w-8 h-8 text-charcoal-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M12 4v16m8-8H4"
                  />
                </svg>
              </div>
              <p className="text-sm font-medium text-charcoal-600">
                Drag tools here to start building
              </p>
              <p className="text-xs text-charcoal-500 mt-1">
                Or click a tool in the sidebar to add it
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

