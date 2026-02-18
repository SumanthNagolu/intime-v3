'use client'

import type { BeforeAfterBlock } from '@/lib/academy/implementation-blocks'
import { CODE_LANGUAGES } from '@/lib/academy/implementation-blocks'

interface BeforeAfterEditorProps {
  block: BeforeAfterBlock
  onChange: (updates: Partial<BeforeAfterBlock>) => void
}

export function BeforeAfterEditor({ block, onChange }: BeforeAfterEditorProps) {
  const isCode = block.contentType === 'code'

  return (
    <div className="space-y-2">
      {/* Controls row */}
      <div className="flex items-center gap-2">
        <div className="flex rounded-lg border border-charcoal-200 overflow-hidden">
          <button
            onClick={() => onChange({ contentType: 'code' })}
            className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
              isCode ? 'bg-charcoal-900 text-white' : 'bg-white text-charcoal-500 hover:bg-charcoal-50'
            }`}
          >
            Code
          </button>
          <button
            onClick={() => onChange({ contentType: 'text' })}
            className={`px-2.5 py-1 text-[10px] font-medium transition-colors ${
              !isCode ? 'bg-charcoal-900 text-white' : 'bg-white text-charcoal-500 hover:bg-charcoal-50'
            }`}
          >
            Text
          </button>
        </div>
        {isCode && (
          <select
            value={block.language}
            onChange={(e) => onChange({ language: e.target.value })}
            className="px-2 py-1 rounded-lg border border-charcoal-200 bg-white text-[10px] text-charcoal-700 focus:outline-none"
          >
            {CODE_LANGUAGES.map((lang) => (
              <option key={lang.value} value={lang.value}>{lang.label}</option>
            ))}
          </select>
        )}
      </div>

      {/* Side-by-side panes */}
      <div className="grid grid-cols-2 gap-2">
        {/* Before */}
        <div>
          <input
            type="text"
            value={block.beforeLabel}
            onChange={(e) => onChange({ beforeLabel: e.target.value })}
            className="w-full px-2 py-1 text-[10px] font-semibold text-red-600 uppercase tracking-wider bg-red-50 border border-red-200 rounded-t-lg focus:outline-none"
          />
          <textarea
            value={block.before}
            onChange={(e) => onChange({ before: e.target.value })}
            placeholder={isCode ? 'Original code...' : 'Original text...'}
            rows={6}
            className={`w-full px-2.5 py-2 border border-t-0 border-red-200 rounded-b-lg text-xs resize-y focus:outline-none focus:ring-1 focus:ring-red-300 leading-relaxed placeholder:text-charcoal-400 ${
              isCode ? 'font-mono bg-charcoal-900 text-red-300 placeholder:text-charcoal-600' : 'bg-red-50/30 text-charcoal-700'
            }`}
            spellCheck={!isCode}
          />
        </div>

        {/* After */}
        <div>
          <input
            type="text"
            value={block.afterLabel}
            onChange={(e) => onChange({ afterLabel: e.target.value })}
            className="w-full px-2 py-1 text-[10px] font-semibold text-green-600 uppercase tracking-wider bg-green-50 border border-green-200 rounded-t-lg focus:outline-none"
          />
          <textarea
            value={block.after}
            onChange={(e) => onChange({ after: e.target.value })}
            placeholder={isCode ? 'Updated code...' : 'Updated text...'}
            rows={6}
            className={`w-full px-2.5 py-2 border border-t-0 border-green-200 rounded-b-lg text-xs resize-y focus:outline-none focus:ring-1 focus:ring-green-300 leading-relaxed placeholder:text-charcoal-400 ${
              isCode ? 'font-mono bg-charcoal-900 text-green-300 placeholder:text-charcoal-600' : 'bg-green-50/30 text-charcoal-700'
            }`}
            spellCheck={!isCode}
          />
        </div>
      </div>
    </div>
  )
}
