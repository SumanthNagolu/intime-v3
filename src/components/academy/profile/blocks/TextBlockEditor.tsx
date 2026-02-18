'use client'

import { useRef, useEffect } from 'react'
import type { TextBlock } from '@/lib/academy/implementation-blocks'

interface TextBlockEditorProps {
  block: TextBlock
  onChange: (updates: Partial<TextBlock>) => void
}

export function TextBlockEditor({ block, onChange }: TextBlockEditorProps) {
  const ref = useRef<HTMLTextAreaElement>(null)

  // Auto-resize
  useEffect(() => {
    if (ref.current) {
      ref.current.style.height = 'auto'
      ref.current.style.height = ref.current.scrollHeight + 'px'
    }
  }, [block.content])

  return (
    <textarea
      ref={ref}
      value={block.content}
      onChange={(e) => onChange({ content: e.target.value })}
      placeholder="Write your paragraph here... Describe the context, architecture decisions, or technical approach."
      rows={3}
      className="w-full px-0 py-0 bg-transparent text-sm text-charcoal-700 resize-none border-0 focus:outline-none focus:ring-0 leading-relaxed placeholder:text-charcoal-400"
    />
  )
}
