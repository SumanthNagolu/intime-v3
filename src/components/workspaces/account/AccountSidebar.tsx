'use client'

import * as React from 'react'
import {
  Building2,
  Users,
  Briefcase,
  UserCheck,
  MapPin,
  Calendar,
  AlertTriangle,
  Activity,
  StickyNote,
  FileText,
  History,
  Plus,
  ChevronDown,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface SidebarSection {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  count?: number
  group: 'sections' | 'tools'
}

const SIDEBAR_SECTIONS: SidebarSection[] = [
  // Main sections
  { id: 'summary', label: 'Summary', icon: Building2, group: 'sections' },
  { id: 'contacts', label: 'Contacts', icon: Users, group: 'sections' },
  { id: 'jobs', label: 'Jobs', icon: Briefcase, group: 'sections' },
  { id: 'placements', label: 'Placements', icon: UserCheck, group: 'sections' },
  { id: 'addresses', label: 'Addresses', icon: MapPin, group: 'sections' },
  { id: 'meetings', label: 'Meetings', icon: Calendar, group: 'sections' },
  { id: 'escalations', label: 'Escalations', icon: AlertTriangle, group: 'sections' },
  // Tools
  { id: 'activities', label: 'Activities', icon: Activity, group: 'tools' },
  { id: 'notes', label: 'Notes', icon: StickyNote, group: 'tools' },
  { id: 'documents', label: 'Documents', icon: FileText, group: 'tools' },
  { id: 'history', label: 'History', icon: History, group: 'tools' },
]

interface AccountSidebarProps {
  accountId: string
  currentSection: string
  onSectionChange: (section: string) => void
  counts: Record<string, number>
  onAction?: (action: string) => void
}

/**
 * AccountSidebar - Workspace sidebar with Actions, Sections, and Tools
 *
 * Matches Guidewire wireframe structure:
 * - Actions dropdown at top
 * - SECTIONS group (Summary, Contacts, Jobs, etc.)
 * - TOOLS group (Activities, Notes, Documents, History)
 */
export function AccountSidebar({
  accountId,
  currentSection,
  onSectionChange,
  counts,
  onAction,
}: AccountSidebarProps) {
  const sections = SIDEBAR_SECTIONS.filter(s => s.group === 'sections')
  const tools = SIDEBAR_SECTIONS.filter(s => s.group === 'tools')

  const handleAction = (action: string) => {
    onAction?.(action)
  }

  return (
    <aside className="w-64 border-r border-charcoal-200 bg-white flex-shrink-0 overflow-y-auto">
      <div className="p-4 space-y-6">
        {/* Actions Dropdown */}
        <div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="w-full justify-between">
                <span className="flex items-center gap-2">
                  <Plus className="h-4 w-4" />
                  Actions
                </span>
                <ChevronDown className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start" className="w-56">
              <DropdownMenuItem onClick={() => handleAction('addContact')}>
                <Users className="h-4 w-4 mr-2" />
                New Contact
              </DropdownMenuItem>
              <DropdownMenuSub>
                <DropdownMenuSubTrigger>
                  <Activity className="h-4 w-4 mr-2" />
                  Log Activity
                </DropdownMenuSubTrigger>
                <DropdownMenuSubContent>
                  <DropdownMenuItem onClick={() => handleAction('logCall')}>
                    Call
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('logEmail')}>
                    Email
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('logMeeting')}>
                    Meeting
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => handleAction('logTask')}>
                    Task
                  </DropdownMenuItem>
                </DropdownMenuSubContent>
              </DropdownMenuSub>
              <DropdownMenuItem onClick={() => handleAction('createJob')}>
                <Briefcase className="h-4 w-4 mr-2" />
                Create Job
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('scheduleMeeting')}>
                <Calendar className="h-4 w-4 mr-2" />
                Schedule Meeting
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction('addNote')}>
                <StickyNote className="h-4 w-4 mr-2" />
                Add Note
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction('uploadDocument')}>
                <FileText className="h-4 w-4 mr-2" />
                Upload Document
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => handleAction('createEscalation')}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Create Escalation
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        {/* Sections */}
        <div>
          <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
            Sections
          </h3>
          <nav className="space-y-1">
            {sections.map((section) => {
              const Icon = section.icon
              const isActive = currentSection === section.id
              const count = counts[section.id]

              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md',
                    'transition-colors duration-200',
                    isActive
                      ? 'bg-gold-50 text-gold-700 font-medium border-l-[3px] border-gold-500 -ml-[3px] pl-[15px]'
                      : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </span>
                  {count !== undefined && count > 0 && (
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full',
                      isActive
                        ? 'bg-gold-200 text-gold-800'
                        : 'bg-charcoal-100 text-charcoal-600'
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>

        {/* Tools */}
        <div>
          <h3 className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-2">
            Tools
          </h3>
          <nav className="space-y-1">
            {tools.map((section) => {
              const Icon = section.icon
              const isActive = currentSection === section.id
              const count = counts[section.id]

              return (
                <button
                  key={section.id}
                  onClick={() => onSectionChange(section.id)}
                  className={cn(
                    'w-full flex items-center justify-between px-3 py-2 text-sm rounded-md',
                    'transition-colors duration-200',
                    isActive
                      ? 'bg-gold-50 text-gold-700 font-medium border-l-[3px] border-gold-500 -ml-[3px] pl-[15px]'
                      : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                  )}
                >
                  <span className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    {section.label}
                  </span>
                  {count !== undefined && count > 0 && (
                    <span className={cn(
                      'text-xs px-1.5 py-0.5 rounded-full',
                      isActive
                        ? 'bg-gold-200 text-gold-800'
                        : 'bg-charcoal-100 text-charcoal-600'
                    )}>
                      {count}
                    </span>
                  )}
                </button>
              )
            })}
          </nav>
        </div>
      </div>
    </aside>
  )
}

export default AccountSidebar
