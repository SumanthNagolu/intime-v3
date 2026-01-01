'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ListTodo } from 'lucide-react'
import type { FullGroupData } from '@/types/admin'

interface GroupQueuesTabProps {
  group: FullGroupData
}

/**
 * Group Queues Tab - Work queues assigned to this group
 * Currently a placeholder - queues functionality to be implemented
 */
export function GroupQueuesTab({ group }: GroupQueuesTabProps) {
  const queues = group.queues ?? []

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-semibold uppercase tracking-wider text-charcoal-600">
            Work Queues ({queues.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {queues.length === 0 ? (
            <div className="py-12 text-center">
              <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
                <ListTodo className="w-8 h-8 text-charcoal-400" />
              </div>
              <h3 className="text-lg font-semibold text-charcoal-900 mb-2">No queues</h3>
              <p className="text-charcoal-500">
                This group doesn't have any work queues assigned.
              </p>
            </div>
          ) : (
            <div className="divide-y divide-charcoal-100">
              {queues.map((queue) => (
                <div
                  key={queue.id}
                  className="flex items-center justify-between py-3"
                >
                  <div>
                    <p className="font-medium text-charcoal-900">{queue.name}</p>
                    <p className="text-sm text-charcoal-500">{queue.type}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                      {queue.item_count} items
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
