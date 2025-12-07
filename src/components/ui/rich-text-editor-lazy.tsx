'use client'

import dynamic from 'next/dynamic'
import { cn } from '@/lib/utils'

interface RichTextEditorProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  className?: string
  variables?: string[]
  onInsertVariable?: (variable: string) => void
}

// Loading skeleton component (inline to avoid importing the main module)
function EditorSkeleton({ className }: { className?: string }) {
  return (
    <div className={cn('border border-charcoal-200 rounded-lg overflow-hidden bg-white', className)}>
      <div className="flex flex-wrap items-center gap-1 p-2 border-b border-charcoal-200 bg-charcoal-50 h-12">
        <div className="animate-pulse bg-charcoal-200 rounded h-8 w-32" />
      </div>
      <div className="min-h-[300px] p-4 animate-pulse">
        <div className="bg-charcoal-100 rounded h-4 w-3/4 mb-2" />
        <div className="bg-charcoal-100 rounded h-4 w-1/2" />
      </div>
    </div>
  )
}

// Lazy-loaded RichTextEditor - loads Tiptap only when rendered
export const LazyRichTextEditor = dynamic<RichTextEditorProps>(
  () => import('./rich-text-editor').then((mod) => mod.RichTextEditor),
  {
    loading: ({ isLoading }) => (isLoading ? <EditorSkeleton /> : null),
    ssr: false,
  }
)

// Re-export for convenience
export type { RichTextEditorProps }
