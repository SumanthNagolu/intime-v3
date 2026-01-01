'use client'

import * as React from 'react'
import { trpc } from '@/lib/trpc/client'
import { useToast } from '@/components/ui/use-toast'
import { Checkbox } from '@/components/ui/checkbox'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

interface ChecklistItem {
  id: string
  text: string
}

interface ActivityChecklistProps {
  activityId: string
  checklist: ChecklistItem[]
  progress: Record<string, boolean> | null
}

/**
 * ActivityChecklist - Interactive checklist component for activities
 * Updates checklist_progress in the database when items are checked
 */
export function ActivityChecklist({
  activityId,
  checklist,
  progress,
}: ActivityChecklistProps) {
  const { toast } = useToast()
  const utils = trpc.useUtils()

  const [localProgress, setLocalProgress] = React.useState<Record<string, boolean>>(
    progress || {}
  )

  // Update local state when props change
  React.useEffect(() => {
    setLocalProgress(progress || {})
  }, [progress])

  const updateChecklistMutation = trpc.activities.updateChecklist.useMutation({
    onSuccess: (data) => {
      utils.activities.getDetail.invalidate({ id: activityId })
    },
    onError: (error) => {
      toast({ title: 'Error', description: error.message, variant: 'error' })
      // Revert optimistic update
      setLocalProgress(progress || {})
    },
  })

  const handleToggle = (itemId: string, completed: boolean) => {
    // Optimistic update
    setLocalProgress((prev) => ({
      ...prev,
      [itemId]: completed,
    }))

    // Send to server
    updateChecklistMutation.mutate({
      activityId,
      itemId,
      completed,
    })
  }

  // Calculate completion percentage
  const completedCount = Object.values(localProgress).filter(Boolean).length
  const totalCount = checklist.length
  const completionPercentage = totalCount > 0 
    ? Math.round((completedCount / totalCount) * 100) 
    : 0

  return (
    <div className="space-y-4">
      {/* Progress bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-sm">
          <span className="text-charcoal-600">Progress</span>
          <span className="font-medium">
            {completedCount} of {totalCount} ({completionPercentage}%)
          </span>
        </div>
        <Progress value={completionPercentage} className="h-2" />
      </div>

      {/* Checklist items */}
      <div className="space-y-2">
        {checklist.map((item, index) => {
          const isCompleted = localProgress[item.id] || false
          return (
            <div
              key={item.id}
              className={cn(
                "flex items-start gap-3 p-3 rounded-lg border transition-colors",
                isCompleted 
                  ? "bg-success-50 border-success-200" 
                  : "bg-white border-charcoal-200 hover:bg-charcoal-50"
              )}
            >
              <Checkbox
                id={`checklist-${item.id}`}
                checked={isCompleted}
                onCheckedChange={(checked) => handleToggle(item.id, checked as boolean)}
                className={cn(
                  "mt-0.5",
                  isCompleted && "border-success-600 bg-success-600"
                )}
                disabled={updateChecklistMutation.isPending}
              />
              <label
                htmlFor={`checklist-${item.id}`}
                className={cn(
                  "flex-1 text-sm cursor-pointer",
                  isCompleted && "text-charcoal-500 line-through"
                )}
              >
                <span className="font-medium text-charcoal-400 mr-2">
                  {index + 1}.
                </span>
                {item.text}
              </label>
            </div>
          )
        })}
      </div>

      {/* Completion message */}
      {completionPercentage === 100 && (
        <div className="text-center p-4 bg-success-50 rounded-lg border border-success-200">
          <p className="text-success-700 font-medium">
            ✅ All checklist items completed!
          </p>
        </div>
      )}
    </div>
  )
}

export default ActivityChecklist

