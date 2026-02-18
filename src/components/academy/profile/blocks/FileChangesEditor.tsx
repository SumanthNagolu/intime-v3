'use client'

import { Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { FileChangesBlock, FileChange, FileChangeStatus } from '@/lib/academy/implementation-blocks'

const STATUS_OPTIONS: { value: FileChangeStatus; label: string; color: string }[] = [
  { value: 'added', label: 'Added', color: 'bg-green-100 text-green-700 border-green-200' },
  { value: 'modified', label: 'Modified', color: 'bg-amber-100 text-amber-700 border-amber-200' },
  { value: 'deleted', label: 'Deleted', color: 'bg-red-100 text-red-700 border-red-200' },
]

interface FileChangesEditorProps {
  block: FileChangesBlock
  onChange: (updates: Partial<FileChangesBlock>) => void
}

export function FileChangesEditor({ block, onChange }: FileChangesEditorProps) {
  const updateFile = (index: number, updates: Partial<FileChange>) => {
    const updated = block.files.map((f, i) => (i === index ? { ...f, ...updates } : f))
    onChange({ files: updated })
  }

  const removeFile = (index: number) => {
    onChange({ files: block.files.filter((_, i) => i !== index) })
  }

  const addFile = () => {
    onChange({ files: [...block.files, { path: '', status: 'modified', description: '' }] })
  }

  return (
    <div className="space-y-2">
      {block.files.map((file, i) => (
        <div key={i} className="flex items-start gap-2 group/file">
          {/* Status dropdown */}
          <select
            value={file.status}
            onChange={(e) => updateFile(i, { status: e.target.value as FileChangeStatus })}
            className={cn(
              'px-1.5 py-1.5 rounded-lg border text-[10px] font-semibold focus:outline-none shrink-0 w-[88px]',
              STATUS_OPTIONS.find((s) => s.value === file.status)?.color
            )}
          >
            {STATUS_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>{s.label}</option>
            ))}
          </select>

          {/* File path */}
          <input
            type="text"
            value={file.path}
            onChange={(e) => updateFile(i, { path: e.target.value })}
            placeholder="modules/configuration/claim/..."
            className="flex-1 px-2 py-1.5 rounded-lg border border-charcoal-200 bg-white text-xs font-mono text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-charcoal-400 min-w-0"
          />

          {/* Description */}
          <input
            type="text"
            value={file.description}
            onChange={(e) => updateFile(i, { description: e.target.value })}
            placeholder="What changed?"
            className="flex-1 px-2 py-1.5 rounded-lg border border-charcoal-200 bg-white text-xs text-charcoal-600 focus:outline-none focus:ring-2 focus:ring-gold-500/20 placeholder:text-charcoal-400 min-w-0"
          />

          {/* Remove */}
          <button
            onClick={() => removeFile(i)}
            className="p-1.5 rounded text-charcoal-400 hover:text-red-500 hover:bg-red-50 transition-colors opacity-0 group-hover/file:opacity-100 shrink-0"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
      ))}

      <button
        onClick={addFile}
        className="flex items-center gap-1 text-[10px] font-medium text-charcoal-500 hover:text-charcoal-700 px-2 py-1 rounded-lg hover:bg-charcoal-100 transition-colors"
      >
        <Plus className="w-3 h-3" />
        Add file
      </button>
    </div>
  )
}
