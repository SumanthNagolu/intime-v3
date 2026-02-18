'use client'

import { useMemo } from 'react'
import { FileText } from 'lucide-react'
import type { ContentBlock } from '@/lib/academy/implementation-blocks'
import { TextBlockView } from './blocks/TextBlockView'
import { CodeBlockView } from './blocks/CodeBlockView'
import { ImageBlockView } from './blocks/ImageBlockView'
import { BeforeAfterView } from './blocks/BeforeAfterView'
import { CalloutBlockView } from './blocks/CalloutBlockView'
import { FileChangesView } from './blocks/FileChangesView'

interface ImplementationDocViewerProps {
  blocks: ContentBlock[]
}

export function ImplementationDocViewer({ blocks }: ImplementationDocViewerProps) {
  const sorted = useMemo(
    () => [...blocks].sort((a, b) => a.sortOrder - b.sortOrder),
    [blocks]
  )

  // Filter out truly empty blocks
  const nonEmpty = useMemo(
    () => sorted.filter((b) => {
      switch (b.type) {
        case 'text': return !!b.content
        case 'code': return !!b.code
        case 'image': return !!b.dataUrl
        case 'before-after': return !!(b.before || b.after)
        case 'callout': return !!(b.content || b.title)
        case 'file-changes': return b.files.length > 0
        default: return true
      }
    }),
    [sorted]
  )

  if (nonEmpty.length === 0) return null

  return (
    <div className="space-y-3">
      {/* Section header */}
      <div className="flex items-center gap-2">
        <FileText className="w-3.5 h-3.5 text-charcoal-400" />
        <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-[0.1em]">
          Design Document
        </span>
        <div className="h-px flex-1 bg-charcoal-200/60" />
      </div>

      {/* Rendered blocks */}
      <div className="space-y-4">
        {nonEmpty.map((block) => (
          <BlockViewer key={block.id} block={block} />
        ))}
      </div>
    </div>
  )
}

function BlockViewer({ block }: { block: ContentBlock }) {
  switch (block.type) {
    case 'text':
      return <TextBlockView block={block} />
    case 'code':
      return <CodeBlockView block={block} />
    case 'image':
      return <ImageBlockView block={block} />
    case 'before-after':
      return <BeforeAfterView block={block} />
    case 'callout':
      return <CalloutBlockView block={block} />
    case 'file-changes':
      return <FileChangesView block={block} />
    default: {
      const _exhaustive: never = block
      return null
    }
  }
}
