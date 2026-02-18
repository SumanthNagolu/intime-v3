'use client'

import { cn } from '@/lib/utils'
import type { FileChangesBlock, FileChangeStatus } from '@/lib/academy/implementation-blocks'

const STATUS_BADGE: Record<FileChangeStatus, { label: string; class: string; dotClass: string }> = {
  added: { label: 'A', class: 'bg-green-100 text-green-700 border-green-200', dotClass: 'bg-green-500' },
  modified: { label: 'M', class: 'bg-amber-100 text-amber-700 border-amber-200', dotClass: 'bg-amber-500' },
  deleted: { label: 'D', class: 'bg-red-100 text-red-700 border-red-200', dotClass: 'bg-red-500' },
}

interface FileChangesViewProps {
  block: FileChangesBlock
}

export function FileChangesView({ block }: FileChangesViewProps) {
  if (block.files.length === 0) return null

  return (
    <div className="rounded-lg border border-charcoal-200/60 overflow-hidden">
      <div className="px-3 py-2 bg-charcoal-800 border-b border-charcoal-700 flex items-center justify-between">
        <span className="text-[10px] font-semibold text-charcoal-300 uppercase tracking-wider">
          Files Changed
        </span>
        <span className="text-[10px] text-charcoal-500 tabular-nums">
          {block.files.length} file{block.files.length !== 1 ? 's' : ''}
        </span>
      </div>
      <div className="divide-y divide-charcoal-100 bg-white">
        {block.files.map((file, i) => {
          const badge = STATUS_BADGE[file.status]
          return (
            <div key={i} className="px-3 py-2">
              <div className="flex items-center gap-2">
                <span className={cn('w-[18px] h-[18px] rounded flex items-center justify-center text-[8px] font-bold border shrink-0', badge.class)}>
                  {badge.label}
                </span>
                <span className="text-[12px] font-mono text-charcoal-800 truncate">
                  {file.path || <span className="italic text-charcoal-400">no path</span>}
                </span>
              </div>
              {file.description && (
                <p className="text-[11px] text-charcoal-500 mt-0.5 ml-[26px] leading-relaxed">
                  {file.description}
                </p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
