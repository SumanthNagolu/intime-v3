'use client'

import { LayoutGrid, Table2, BarChart3 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

export type PipelineViewMode = 'kanban' | 'table' | 'chart'

interface PipelineViewToggleProps {
  view: PipelineViewMode
  onViewChange: (view: PipelineViewMode) => void
}

const VIEW_OPTIONS: { value: PipelineViewMode; label: string; icon: typeof LayoutGrid }[] = [
  { value: 'kanban', label: 'Kanban', icon: LayoutGrid },
  { value: 'table', label: 'Table', icon: Table2 },
  { value: 'chart', label: 'Chart', icon: BarChart3 },
]

export function PipelineViewToggle({ view, onViewChange }: PipelineViewToggleProps) {
  return (
    <div className="inline-flex rounded-lg border border-charcoal-200 bg-white p-1 gap-1">
      {VIEW_OPTIONS.map(({ value, label, icon: Icon }) => (
        <Button
          key={value}
          variant="ghost"
          size="sm"
          onClick={() => onViewChange(value)}
          className={cn(
            'h-8 px-3 gap-1.5',
            view === value
              ? 'bg-charcoal-900 text-white hover:bg-charcoal-800 hover:text-white'
              : 'text-charcoal-600 hover:bg-charcoal-50'
          )}
        >
          <Icon className="w-4 h-4" />
          <span className="text-sm">{label}</span>
        </Button>
      ))}
    </div>
  )
}
