'use client'

import { Sparkles, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreationPath } from './types'

interface PathSelectorProps {
  value: CreationPath
  onChange: (path: CreationPath) => void
}

export function PathSelector({ value, onChange }: PathSelectorProps) {
  return (
    <div className="flex border-b border-charcoal-200">
      <button
        type="button"
        className={cn(
          'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
          value === 'pattern'
            ? 'border-b-2 border-gold-500 text-gold-700 bg-gold-50/50'
            : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
        )}
        onClick={() => onChange('pattern')}
      >
        <Sparkles className="h-4 w-4" />
        From Pattern
      </button>
      <button
        type="button"
        className={cn(
          'flex-1 px-4 py-3 text-sm font-medium transition-colors flex items-center justify-center gap-2',
          value === 'manual'
            ? 'border-b-2 border-gold-500 text-gold-700 bg-gold-50/50'
            : 'text-charcoal-600 hover:text-charcoal-900 hover:bg-charcoal-50'
        )}
        onClick={() => onChange('manual')}
      >
        <Plus className="h-4 w-4" />
        Manual
      </button>
    </div>
  )
}
