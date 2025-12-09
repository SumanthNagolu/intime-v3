'use client'

import { GripVertical, AlertCircle, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import { cn } from '@/lib/utils'
import type { BuilderNodeConfig } from './types'

interface BuilderNodeProps {
  node: BuilderNodeConfig
  isSelected?: boolean
  onSelect?: () => void
  onDelete?: () => void
  onDragStart?: (e: React.DragEvent) => void
  readOnly?: boolean
  className?: string
}

export function BuilderNode({
  node,
  isSelected,
  onSelect,
  onDelete,
  onDragStart,
  readOnly,
  className,
}: BuilderNodeProps) {
  const Icon = node.icon

  return (
    <TooltipProvider>
      <div
        className={cn(
          'absolute bg-white rounded-lg border-2 shadow-sm transition-all duration-150',
          'min-w-[180px] max-w-[280px]',
          isSelected
            ? 'border-gold-500 shadow-md ring-2 ring-gold-500/20'
            : 'border-charcoal-200 hover:border-charcoal-300',
          !node.isValid && 'border-red-300',
          className
        )}
        style={{
          left: node.x,
          top: node.y,
        }}
        onClick={onSelect}
        draggable={!readOnly}
        onDragStart={onDragStart}
      >
        {/* Header */}
        <div
          className={cn(
            'flex items-center gap-2 px-3 py-2 rounded-t-lg',
            node.bgColor || 'bg-charcoal-50'
          )}
        >
          {!readOnly && (
            <GripVertical className="w-4 h-4 text-charcoal-400 cursor-grab flex-shrink-0" />
          )}
          {Icon && (
            <Icon className={cn('w-4 h-4 flex-shrink-0', node.color || 'text-charcoal-600')} />
          )}
          <span className="text-sm font-medium text-charcoal-800 truncate flex-1">
            {node.label}
          </span>

          {/* Error indicator */}
          {!node.isValid && node.errors && node.errors.length > 0 && (
            <Tooltip>
              <TooltipTrigger asChild>
                <AlertCircle className="w-4 h-4 text-red-500 flex-shrink-0" />
              </TooltipTrigger>
              <TooltipContent side="top" className="max-w-[200px]">
                <ul className="text-xs space-y-1">
                  {node.errors.map((error, i) => (
                    <li key={i}>{error}</li>
                  ))}
                </ul>
              </TooltipContent>
            </Tooltip>
          )}

          {/* Delete button */}
          {!readOnly && isSelected && onDelete && (
            <Button
              variant="ghost"
              size="icon"
              className="h-5 w-5 text-charcoal-400 hover:text-red-500"
              onClick={(e) => {
                e.stopPropagation()
                onDelete()
              }}
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>

        {/* Body */}
        <div className="px-3 py-2">
          {/* Input ports */}
          {node.inputs && node.inputs.length > 0 && (
            <div className="space-y-1 mb-2">
              {node.inputs.map((input) => (
                <div key={input} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-charcoal-300 border-2 border-white shadow-sm -ml-4" />
                  <span className="text-xs text-charcoal-500">{input}</span>
                </div>
              ))}
            </div>
          )}

          {/* Node content preview */}
          {node.data && Object.keys(node.data).length > 0 && (
            <div className="text-xs text-charcoal-500 truncate">
              {Object.entries(node.data)
                .slice(0, 2)
                .map(([key, value]) => (
                  <div key={key} className="truncate">
                    <span className="font-medium">{key}:</span>{' '}
                    {typeof value === 'string' ? value : JSON.stringify(value)}
                  </div>
                ))}
            </div>
          )}

          {/* Output ports */}
          {node.outputs && node.outputs.length > 0 && (
            <div className="space-y-1 mt-2">
              {node.outputs.map((output) => (
                <div key={output} className="flex items-center justify-end gap-2">
                  <span className="text-xs text-charcoal-500">{output}</span>
                  <div className="w-3 h-3 rounded-full bg-gold-400 border-2 border-white shadow-sm -mr-4" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </TooltipProvider>
  )
}

