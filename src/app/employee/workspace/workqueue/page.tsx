'use client'

import * as React from 'react'
import { TeamWorkqueueView } from '@/components/workqueue/TeamWorkqueueView'

/**
 * Team Workqueue Page
 * Guidewire-inspired team activity queue with claim/release functionality
 */
export default function WorkqueuePage() {
  return (
    <div className="min-h-screen bg-cream">
      <div className="p-6">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-charcoal-900">Team Workqueue</h1>
          <p className="text-charcoal-600">
            View and claim activities from your team's queues
          </p>
        </div>
        
        <TeamWorkqueueView />
      </div>
    </div>
  )
}







