'use client'

import { CheckSquare, FileText, Clock, AlertTriangle } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { SelectedPattern } from './types'

interface PatternPreviewProps {
  pattern: SelectedPattern
  className?: string
}

export function PatternPreview({ pattern, className }: PatternPreviewProps) {
  const hasContent = pattern.instructions || pattern.hasChecklist || pattern.escalationDays

  if (!hasContent) {
    return null
  }

  return (
    <div className={cn('space-y-3', className)}>
      <h4 className="text-xs font-medium text-charcoal-500 uppercase tracking-wide flex items-center gap-2">
        <FileText className="h-3 w-3" />
        Pattern Includes
      </h4>

      <div className="space-y-2">
        {/* Instructions */}
        {pattern.instructions && (
          <div className="bg-charcoal-50 rounded-lg p-3">
            <h5 className="text-xs font-medium text-charcoal-600 mb-1 flex items-center gap-1">
              <FileText className="h-3 w-3" />
              Instructions (Read-Only)
            </h5>
            <p className="text-sm text-charcoal-700 whitespace-pre-wrap leading-relaxed">
              {pattern.instructions}
            </p>
          </div>
        )}

        {/* Checklist Preview */}
        {pattern.hasChecklist && pattern.checklist && pattern.checklist.length > 0 && (
          <div className="bg-charcoal-50 rounded-lg p-3">
            <h5 className="text-xs font-medium text-charcoal-600 mb-2 flex items-center gap-1">
              <CheckSquare className="h-3 w-3" />
              Checklist ({pattern.checklistCount} items)
            </h5>
            <ul className="space-y-1">
              {pattern.checklist.slice(0, 5).map((item, index) => (
                <li
                  key={item.id || index}
                  className="flex items-start gap-2 text-sm text-charcoal-600"
                >
                  <div className="w-4 h-4 rounded border border-charcoal-300 flex-shrink-0 mt-0.5" />
                  <span className={cn(item.required && 'font-medium')}>
                    {item.text}
                    {item.required && <span className="text-red-500 ml-1">*</span>}
                  </span>
                </li>
              ))}
              {pattern.checklist.length > 5 && (
                <li className="text-xs text-charcoal-500 pl-6">
                  +{pattern.checklist.length - 5} more items
                </li>
              )}
            </ul>
          </div>
        )}

        {/* Auto-escalation notice */}
        {pattern.escalationDays && (
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <AlertTriangle className="h-4 w-4 text-amber-600 flex-shrink-0 mt-0.5" />
              <div>
                <h5 className="text-xs font-medium text-amber-700">Auto-Escalation</h5>
                <p className="text-sm text-amber-600">
                  This activity will auto-escalate after {pattern.escalationDays} day
                  {pattern.escalationDays > 1 ? 's' : ''} if not completed.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
