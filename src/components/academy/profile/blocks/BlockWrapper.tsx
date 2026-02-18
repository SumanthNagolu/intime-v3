'use client'

import {
  ChevronUp,
  ChevronDown,
  Trash2,
  AlignLeft,
  Code2,
  ImageIcon,
  Columns2,
  AlertTriangle,
  FolderGit2,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { BlockType } from '@/lib/academy/implementation-blocks'

const BLOCK_META: Record<BlockType, { label: string; icon: React.ElementType }> = {
  text: { label: 'Text', icon: AlignLeft },
  code: { label: 'Code', icon: Code2 },
  image: { label: 'Screenshot', icon: ImageIcon },
  'before-after': { label: 'Before / After', icon: Columns2 },
  callout: { label: 'Callout', icon: AlertTriangle },
  'file-changes': { label: 'File Changes', icon: FolderGit2 },
}

interface BlockWrapperProps {
  blockType: BlockType
  blockNumber: number
  isFirst: boolean
  isLast: boolean
  onMoveUp: () => void
  onMoveDown: () => void
  onDelete: () => void
  children: React.ReactNode
}

export function BlockWrapper({
  blockType,
  blockNumber,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  onDelete,
  children,
}: BlockWrapperProps) {
  const meta = BLOCK_META[blockType]
  const Icon = meta.icon

  return (
    <div className="group/block relative rounded-lg border border-charcoal-200/60 bg-white overflow-hidden hover:border-charcoal-300 transition-colors">
      {/* Header bar */}
      <div className="flex items-center gap-2 px-3 py-1.5 bg-charcoal-50/60 border-b border-charcoal-100">
        <span className="text-[9px] font-bold text-charcoal-300 tabular-nums w-4 text-center">
          {blockNumber}
        </span>
        <Icon className="w-3 h-3 text-charcoal-400" />
        <span className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider flex-1">
          {meta.label}
        </span>

        {/* Controls */}
        <div className="flex items-center gap-0.5 opacity-0 group-hover/block:opacity-100 transition-opacity">
          <button
            onClick={onMoveUp}
            disabled={isFirst}
            className={cn(
              'p-1 rounded text-charcoal-400 transition-colors',
              isFirst ? 'opacity-30 cursor-not-allowed' : 'hover:text-charcoal-700 hover:bg-charcoal-100'
            )}
            title="Move up"
          >
            <ChevronUp className="w-3 h-3" />
          </button>
          <button
            onClick={onMoveDown}
            disabled={isLast}
            className={cn(
              'p-1 rounded text-charcoal-400 transition-colors',
              isLast ? 'opacity-30 cursor-not-allowed' : 'hover:text-charcoal-700 hover:bg-charcoal-100'
            )}
            title="Move down"
          >
            <ChevronDown className="w-3 h-3" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 rounded text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors"
            title="Delete block"
          >
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      </div>

      {/* Content */}
      <div className="p-3">
        {children}
      </div>
    </div>
  )
}
