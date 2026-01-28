'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { User, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

interface WorkspaceToggleProps {
  className?: string
}

export function WorkspaceToggle({ className }: WorkspaceToggleProps) {
  const pathname = usePathname()

  // Determine current workspace from URL
  const isTeamSpace = pathname.includes('/employee/team')
  const isMySpace = !isTeamSpace && (
    pathname.includes('/employee/workspace') ||
    pathname.includes('/employee/recruiting') ||
    pathname.includes('/employee/crm') ||
    pathname.includes('/employee/contacts')
  )

  return (
    <div className={cn('px-3 py-3 border-b border-charcoal-200/60', className)}>
      <div className="flex gap-1 p-1 bg-charcoal-100/50 rounded-lg">
        {/* My Space Tab */}
        <Link
          href="/employee/workspace"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200',
            isMySpace
              ? 'bg-white text-charcoal-900 shadow-sm'
              : 'text-charcoal-500 hover:text-charcoal-700 hover:bg-white/50'
          )}
        >
          <User className="w-3.5 h-3.5" />
          <span>My Space</span>
        </Link>

        {/* Team Space Tab */}
        <Link
          href="/employee/team"
          className={cn(
            'flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-md text-xs font-semibold uppercase tracking-wider transition-all duration-200',
            isTeamSpace
              ? 'bg-white text-charcoal-900 shadow-sm'
              : 'text-charcoal-500 hover:text-charcoal-700 hover:bg-white/50'
          )}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Team</span>
        </Link>
      </div>
    </div>
  )
}
