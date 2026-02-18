'use client'

import { useState } from 'react'
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter'
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism'
import { Copy, Check, FileCode } from 'lucide-react'
import type { CodeBlock } from '@/lib/academy/implementation-blocks'

interface CodeBlockViewProps {
  block: CodeBlock
}

export function CodeBlockView({ block }: CodeBlockViewProps) {
  const [copied, setCopied] = useState(false)

  if (!block.code) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(block.code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <div className="rounded-lg overflow-hidden border border-charcoal-200/60">
      {/* File header */}
      {block.filename && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-charcoal-800 border-b border-charcoal-700">
          <FileCode className="w-3 h-3 text-charcoal-400" />
          <span className="text-[11px] font-mono text-charcoal-300 flex-1">{block.filename}</span>
          <button
            onClick={handleCopy}
            className="flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
            {copied ? 'Copied' : 'Copy'}
          </button>
        </div>
      )}

      {/* Code */}
      <div className="relative">
        {!block.filename && (
          <button
            onClick={handleCopy}
            className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 rounded text-[10px] text-charcoal-400 hover:text-white hover:bg-charcoal-700 transition-colors z-10"
          >
            {copied ? <Check className="w-3 h-3 text-green-400" /> : <Copy className="w-3 h-3" />}
          </button>
        )}
        <SyntaxHighlighter
          language={block.language}
          style={oneDark}
          customStyle={{
            margin: 0,
            borderRadius: block.filename ? 0 : undefined,
            fontSize: '12px',
            lineHeight: '1.6',
          }}
          showLineNumbers
        >
          {block.code}
        </SyntaxHighlighter>
      </div>

      {/* Explanation */}
      {block.explanation && (
        <div className="px-3 py-2 bg-charcoal-50 border-t border-charcoal-200 text-xs text-charcoal-600 leading-relaxed">
          {block.explanation}
        </div>
      )}
    </div>
  )
}
