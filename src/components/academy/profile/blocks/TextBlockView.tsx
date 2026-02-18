'use client'

import type { TextBlock } from '@/lib/academy/implementation-blocks'

interface TextBlockViewProps {
  block: TextBlock
}

export function TextBlockView({ block }: TextBlockViewProps) {
  if (!block.content) return null

  return (
    <div className="text-[13px] text-charcoal-700 leading-[1.7] whitespace-pre-wrap">
      {block.content}
    </div>
  )
}
