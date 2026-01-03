'use client'

import { Sparkles, Plus, ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { CreationPath } from './types'

interface PathSelectorProps {
  value: CreationPath
  onChange: (path: CreationPath) => void
  variant?: 'tabs' | 'cards'
}

export function PathSelector({ value, onChange, variant = 'tabs' }: PathSelectorProps) {
  if (variant === 'cards') {
    return (
      <div className="grid grid-cols-2 gap-4">
        <button
          type="button"
          className={cn(
            'group relative flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all duration-200',
            'hover:border-gold-400 hover:bg-gold-50/50 hover:shadow-md',
            value === 'pattern'
              ? 'border-gold-500 bg-gold-50 shadow-md'
              : 'border-charcoal-200 bg-white'
          )}
          onClick={() => onChange('pattern')}
        >
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full transition-colors',
              value === 'pattern'
                ? 'bg-gold-500 text-white'
                : 'bg-charcoal-100 text-charcoal-600 group-hover:bg-gold-100 group-hover:text-gold-600'
            )}
          >
            <Sparkles className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-charcoal-900">From Pattern</h3>
            <p className="text-sm text-charcoal-500 mt-1">
              Use a pre-defined template with checklist and defaults
            </p>
          </div>
          <div
            className={cn(
              'absolute bottom-3 right-3 opacity-0 transform translate-x-1 transition-all',
              'group-hover:opacity-100 group-hover:translate-x-0'
            )}
          >
            <ArrowRight className="h-4 w-4 text-gold-500" />
          </div>
        </button>

        <button
          type="button"
          className={cn(
            'group relative flex flex-col items-center gap-3 p-6 rounded-lg border-2 transition-all duration-200',
            'hover:border-gold-400 hover:bg-gold-50/50 hover:shadow-md',
            value === 'manual'
              ? 'border-gold-500 bg-gold-50 shadow-md'
              : 'border-charcoal-200 bg-white'
          )}
          onClick={() => onChange('manual')}
        >
          <div
            className={cn(
              'flex items-center justify-center w-12 h-12 rounded-full transition-colors',
              value === 'manual'
                ? 'bg-gold-500 text-white'
                : 'bg-charcoal-100 text-charcoal-600 group-hover:bg-gold-100 group-hover:text-gold-600'
            )}
          >
            <Plus className="h-6 w-6" />
          </div>
          <div className="text-center">
            <h3 className="font-semibold text-charcoal-900">Manual</h3>
            <p className="text-sm text-charcoal-500 mt-1">
              Create a custom activity from scratch
            </p>
          </div>
          <div
            className={cn(
              'absolute bottom-3 right-3 opacity-0 transform translate-x-1 transition-all',
              'group-hover:opacity-100 group-hover:translate-x-0'
            )}
          >
            <ArrowRight className="h-4 w-4 text-gold-500" />
          </div>
        </button>
      </div>
    )
  }

  // Default tabs variant
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
