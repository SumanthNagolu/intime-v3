'use client'

import { Shield } from 'lucide-react'
import type { FullOrgGroupData } from '@/types/admin'

interface GroupCodesSectionProps {
  group: FullOrgGroupData
}

/**
 * Guidewire-style Group Producer Codes Tab
 * 
 * Placeholder for producer code management.
 * In Guidewire PolicyCenter, producer codes link agents/producers to groups.
 */
export function GroupCodesSection({ group }: GroupCodesSectionProps) {
  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg border border-charcoal-100 p-12 text-center">
        <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-charcoal-50 flex items-center justify-center">
          <Shield className="w-8 h-8 text-charcoal-400" />
        </div>
        <h3 className="text-lg font-semibold text-charcoal-900 mb-2">
          Producer Codes
        </h3>
        <p className="text-charcoal-500 max-w-md mx-auto">
          Producer codes for this group will appear here. Producer codes are used 
          to link external agents and partners to organizational groups.
        </p>
        <p className="text-sm text-charcoal-400 mt-4">
          Group: {group.name}
        </p>
      </div>
    </div>
  )
}


