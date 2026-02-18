'use client'

import type { CodeBlock } from '@/lib/academy/implementation-blocks'
import { CODE_LANGUAGES } from '@/lib/academy/implementation-blocks'

interface CodeBlockEditorProps {
  block: CodeBlock
  onChange: (updates: Partial<CodeBlock>) => void
}

export function CodeBlockEditor({ block, onChange }: CodeBlockEditorProps) {
  return (
    <div className="space-y-2">
      {/* Language + Filename row */}
      <div className="flex gap-2">
        <select
          value={block.language}
          onChange={(e) => onChange({ language: e.target.value })}
          className="px-2.5 py-1.5 rounded-lg border border-charcoal-200 bg-white text-xs text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          {CODE_LANGUAGES.map((lang) => (
            <option key={lang.value} value={lang.value}>
              {lang.label}
            </option>
          ))}
        </select>
        <input
          type="text"
          value={block.filename}
          onChange={(e) => onChange({ filename: e.target.value })}
          placeholder="filename (e.g. ClaimValidation.gs)"
          className="flex-1 px-2.5 py-1.5 rounded-lg border border-charcoal-200 bg-white text-xs text-charcoal-600 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-charcoal-400"
        />
      </div>

      {/* Code textarea (dark) */}
      <textarea
        value={block.code}
        onChange={(e) => onChange({ code: e.target.value })}
        placeholder="Paste or type your code here..."
        rows={8}
        className="w-full px-3 py-2.5 rounded-lg bg-charcoal-900 text-green-400 font-mono text-xs resize-y border border-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-500/30 leading-relaxed placeholder:text-charcoal-600"
        spellCheck={false}
      />

      {/* Explanation */}
      <textarea
        value={block.explanation}
        onChange={(e) => onChange({ explanation: e.target.value })}
        placeholder="Optional: Explain what this code does and why..."
        rows={2}
        className="w-full px-2.5 py-1.5 rounded-lg border border-charcoal-200 bg-white text-xs text-charcoal-600 resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 leading-relaxed placeholder:text-charcoal-400"
      />
    </div>
  )
}
