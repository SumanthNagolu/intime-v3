'use client'

import {
  AlignLeft,
  Code2,
  ImageIcon,
  Columns2,
  AlertTriangle,
  FolderGit2,
  Plus,
} from 'lucide-react'
import type { BlockType } from '@/lib/academy/implementation-blocks'

const BLOCK_OPTIONS: { type: BlockType; label: string; icon: React.ElementType; hint: string }[] = [
  { type: 'text', label: 'Text', icon: AlignLeft, hint: 'Paragraph' },
  { type: 'code', label: 'Code', icon: Code2, hint: 'Snippet' },
  { type: 'image', label: 'Image', icon: ImageIcon, hint: 'Screenshot' },
  { type: 'before-after', label: 'Compare', icon: Columns2, hint: 'Side-by-side' },
  { type: 'callout', label: 'Callout', icon: AlertTriangle, hint: 'Tip / Warning' },
  { type: 'file-changes', label: 'Files', icon: FolderGit2, hint: 'Changed files' },
]

interface BlockToolbarProps {
  onAdd: (type: BlockType) => void
}

export function BlockToolbar({ onAdd }: BlockToolbarProps) {
  return (
    <div className="rounded-lg border border-dashed border-charcoal-300 bg-white/60 px-3 py-2.5">
      <div className="flex items-center gap-1">
        <Plus className="w-3 h-3 text-charcoal-400 mr-1 shrink-0" />
        {BLOCK_OPTIONS.map(({ type, label, icon: Icon, hint }) => (
          <button
            key={type}
            onClick={() => onAdd(type)}
            title={hint}
            className="flex items-center gap-1 px-2 py-1.5 rounded-md text-[11px] font-medium text-charcoal-500 hover:bg-gold-50 hover:text-gold-700 hover:border-gold-300 border border-transparent transition-all duration-200"
          >
            <Icon className="w-3 h-3" />
            <span className="hidden sm:inline">{label}</span>
          </button>
        ))}
      </div>
    </div>
  )
}
