'use client'

import { useMemo } from 'react'
import { FileText, Pencil } from 'lucide-react'
import type { ContentBlock, BlockType } from '@/lib/academy/implementation-blocks'
import { BlockToolbar } from './blocks/BlockToolbar'
import { BlockWrapper } from './blocks/BlockWrapper'
import { TextBlockEditor } from './blocks/TextBlockEditor'
import { CodeBlockEditor } from './blocks/CodeBlockEditor'
import { ImageBlockEditor } from './blocks/ImageBlockEditor'
import { BeforeAfterEditor } from './blocks/BeforeAfterEditor'
import { CalloutBlockEditor } from './blocks/CalloutBlockEditor'
import { FileChangesEditor } from './blocks/FileChangesEditor'

interface ImplementationDocBuilderProps {
  blocks: ContentBlock[]
  onAdd: (type: BlockType) => void
  onUpdate: (blockId: string, updates: Partial<ContentBlock>) => void
  onRemove: (blockId: string) => void
  onMove: (blockId: string, direction: 'up' | 'down') => void
}

export function ImplementationDocBuilder({
  blocks,
  onAdd,
  onUpdate,
  onRemove,
  onMove,
}: ImplementationDocBuilderProps) {
  const sorted = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks]
  )

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="w-3.5 h-3.5 text-charcoal-400" />
          <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-[0.1em]">
            Design Document
          </span>
          {sorted.length > 0 && (
            <span className="text-[9px] text-charcoal-400 tabular-nums">
              ({sorted.length} block{sorted.length !== 1 ? 's' : ''})
            </span>
          )}
        </div>
        <div className="flex items-center gap-1 text-[9px] text-charcoal-400">
          <Pencil className="w-2.5 h-2.5" />
          Editing
        </div>
      </div>

      {/* Empty state */}
      {sorted.length === 0 && (
        <div className="rounded-lg border border-dashed border-charcoal-300 bg-white p-5 text-center">
          <div className="w-9 h-9 rounded-lg bg-charcoal-100 flex items-center justify-center mx-auto mb-2">
            <FileText className="w-4 h-4 text-charcoal-400" />
          </div>
          <p className="text-xs font-medium text-charcoal-600">Document your implementation</p>
          <p className="text-[10px] text-charcoal-400 mt-0.5 max-w-[280px] mx-auto leading-relaxed">
            Add code snippets, screenshots, before/after comparisons, and file change manifests to create a rich design document.
          </p>
        </div>
      )}

      {/* Block list */}
      {sorted.length > 0 && (
        <div className="space-y-2">
          {sorted.map((block, idx) => (
            <BlockWrapper
              key={block.id}
              blockType={block.type}
              blockNumber={idx + 1}
              isFirst={idx === 0}
              isLast={idx === sorted.length - 1}
              onMoveUp={() => onMove(block.id, 'up')}
              onMoveDown={() => onMove(block.id, 'down')}
              onDelete={() => onRemove(block.id)}
            >
              <BlockEditor block={block} onUpdate={onUpdate} />
            </BlockWrapper>
          ))}
        </div>
      )}

      {/* Add block toolbar */}
      <BlockToolbar onAdd={onAdd} />
    </div>
  )
}

function BlockEditor({
  block,
  onUpdate,
}: {
  block: ContentBlock
  onUpdate: (blockId: string, updates: Partial<ContentBlock>) => void
}) {
  const handleChange = (updates: Partial<ContentBlock>) => {
    onUpdate(block.id, updates)
  }

  switch (block.type) {
    case 'text':
      return <TextBlockEditor block={block} onChange={handleChange} />
    case 'code':
      return <CodeBlockEditor block={block} onChange={handleChange} />
    case 'image':
      return <ImageBlockEditor block={block} onChange={handleChange} />
    case 'before-after':
      return <BeforeAfterEditor block={block} onChange={handleChange} />
    case 'callout':
      return <CalloutBlockEditor block={block} onChange={handleChange} />
    case 'file-changes':
      return <FileChangesEditor block={block} onChange={handleChange} />
    default: {
      const _exhaustive: never = block
      return null
    }
  }
}
