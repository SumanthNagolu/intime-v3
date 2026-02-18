'use client'

import { useRef, useEffect } from 'react'
import { Lightbulb, AlertTriangle, AlertCircle, Bug } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CalloutBlock, CalloutVariant } from '@/lib/academy/implementation-blocks'

const VARIANTS: { value: CalloutVariant; label: string; icon: React.ElementType; color: string }[] = [
  { value: 'tip', label: 'Tip', icon: Lightbulb, color: 'text-blue-600 bg-blue-50 border-blue-200' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: 'text-amber-600 bg-amber-50 border-amber-200' },
  { value: 'important', label: 'Important', icon: AlertCircle, color: 'text-red-600 bg-red-50 border-red-200' },
  { value: 'gotcha', label: 'Gotcha', icon: Bug, color: 'text-purple-600 bg-purple-50 border-purple-200' },
]

interface CalloutBlockEditorProps {
  block: CalloutBlock
  onChange: (updates: Partial<CalloutBlock>) => void
}

export function CalloutBlockEditor({ block, onChange }: CalloutBlockEditorProps) {
  const contentRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (contentRef.current) {
      contentRef.current.style.height = 'auto'
      contentRef.current.style.height = contentRef.current.scrollHeight + 'px'
    }
  }, [block.content])

  return (
    <div className="space-y-2">
      {/* Variant picker */}
      <div className="flex gap-1.5">
        {VARIANTS.map(({ value, label, icon: Icon, color }) => (
          <button
            key={value}
            onClick={() => onChange({ variant: value })}
            className={cn(
              'flex items-center gap-1 px-2 py-1 rounded-lg text-[10px] font-medium border transition-all',
              block.variant === value ? color : 'text-charcoal-400 bg-white border-charcoal-200 hover:border-charcoal-300'
            )}
          >
            <Icon className="w-3 h-3" />
            {label}
          </button>
        ))}
      </div>

      {/* Title */}
      <input
        type="text"
        value={block.title}
        onChange={(e) => onChange({ title: e.target.value })}
        placeholder="Callout title (optional)"
        className="w-full px-2.5 py-1.5 rounded-lg border border-charcoal-200 bg-white text-xs font-medium text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-charcoal-400"
      />

      {/* Content */}
      <textarea
        ref={contentRef}
        value={block.content}
        onChange={(e) => onChange({ content: e.target.value })}
        placeholder="Write the callout content..."
        rows={2}
        className="w-full px-2.5 py-1.5 rounded-lg border border-charcoal-200 bg-white text-xs text-charcoal-600 resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 leading-relaxed placeholder:text-charcoal-400"
      />
    </div>
  )
}
