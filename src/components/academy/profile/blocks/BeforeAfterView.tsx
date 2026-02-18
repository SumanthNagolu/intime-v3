'use client'

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import type { BeforeAfterBlock } from '@/lib/academy/implementation-blocks'

interface BeforeAfterViewProps {
  block: BeforeAfterBlock
}

export function BeforeAfterView({ block }: BeforeAfterViewProps) {
  if (!block.before && !block.after) return null

  const isCode = block.contentType === 'code'

  return (
    <div className="grid grid-cols-2 gap-0 rounded-lg overflow-hidden border border-charcoal-200/60">
      {/* Before */}
      <div className="border-r border-charcoal-200/60">
        <div className="px-3 py-1.5 bg-red-50 border-b border-red-200">
          <span className="text-[10px] font-semibold text-red-600 uppercase tracking-wider">
            {block.beforeLabel || 'Before'}
          </span>
        </div>
        {isCode && block.before ? (
          <SyntaxHighlighter
            language={block.language}
            style={oneDark}
            customStyle={{ margin: 0, borderRadius: 0, fontSize: '11px', lineHeight: '1.5' }}
          >
            {block.before}
          </SyntaxHighlighter>
        ) : (
          <div className="px-3 py-2 bg-red-50/30 text-xs text-charcoal-700 whitespace-pre-wrap leading-relaxed min-h-[60px]">
            {block.before || <span className="italic text-charcoal-400">-</span>}
          </div>
        )}
      </div>

      {/* After */}
      <div>
        <div className="px-3 py-1.5 bg-green-50 border-b border-green-200">
          <span className="text-[10px] font-semibold text-green-600 uppercase tracking-wider">
            {block.afterLabel || 'After'}
          </span>
        </div>
        {isCode && block.after ? (
          <SyntaxHighlighter
            language={block.language}
            style={oneDark}
            customStyle={{ margin: 0, borderRadius: 0, fontSize: '11px', lineHeight: '1.5' }}
          >
            {block.after}
          </SyntaxHighlighter>
        ) : (
          <div className="px-3 py-2 bg-green-50/30 text-xs text-charcoal-700 whitespace-pre-wrap leading-relaxed min-h-[60px]">
            {block.after || <span className="italic text-charcoal-400">-</span>}
          </div>
        )}
      </div>
    </div>
  )
}
