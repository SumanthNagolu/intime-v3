'use client'

import { ListTodo } from 'lucide-react'
import type { FullOrgGroupData } from '@/types/admin'

interface GroupQueuesSectionProps {
  group: FullOrgGroupData
}

/**
 * Guidewire-style Group Queues Tab
 * 
 * Placeholder for work queue management.
 * In Guidewire PolicyCenter, queues are used for work assignment.
 */
export function GroupQueuesSection({ group }: GroupQueuesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-charcoal-100 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
          <ListTodo className="w-8 h-8 text-charcoal-400" />
        </div>
        <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
          Work Queues
        </h3>
        <p className="text-charcoal-500 max-w-md mx-auto">
          Work queues for this group will appear here. Queues are used to manage 
          and distribute work assignments among group members.
        </p>
        <p className="text-sm text-charcoal-400 mt-4">
          Group: {group.name}
        </p>
      </div>
    </div>
  )
}





