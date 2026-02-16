'use client'

/**
 * CommandPalette - Linear-style command palette (Cmd+K)
 *
 * The command palette is the central navigation hub for the app.
 * Users can search, navigate, and execute actions from anywhere.
 */

import {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
  createContext,
  useContext,
  type ReactNode,
} from 'react'
import { useRouter } from 'next/navigation'
import {
  Search,
  Bell,
  Briefcase,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  FileText,
  Handshake,
  Inbox,
  Mail,
  Moon,
  Phone,
  Plus,
  Settings,
  LayoutDashboard,
  Sun,
  Target,
  User,
  Users,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { getAllSchemas, type EntitySchema } from '@/lib/entity/schema'
import { trpc } from '@/lib/trpc/client'

// ============================================
// Types
// ============================================

interface Command {
  id: string
  label: string
  icon?: React.ComponentType<{ className?: string }>
  shortcut?: string
  category: 'navigation' | 'create' | 'actions' | 'search' | 'settings'
  action: () => void
  keywords?: string[]
}

interface CommandPaletteContextValue {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
  registerCommand: (command: Command) => void
  unregisterCommand: (id: string) => void
}

// ============================================
// Context
// ============================================

const CommandPaletteContext = createContext<CommandPaletteContextValue | null>(null)

export function useCommandPalette() {
  const context = useContext(CommandPaletteContext)
  if (!context) {
    throw new Error('useCommandPalette must be used within CommandPaletteProvider')
  }
  return context
}

// ============================================
// Provider
// ============================================

export function CommandPaletteProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)
  const [commands, setCommands] = useState<Command[]>([])

  const open = useCallback(() => setIsOpen(true), [])
  const close = useCallback(() => setIsOpen(false), [])
  const toggle = useCallback(() => setIsOpen((prev) => !prev), [])

  const registerCommand = useCallback((command: Command) => {
    setCommands((prev) => [...prev.filter((c) => c.id !== command.id), command])
  }, [])

  const unregisterCommand = useCallback((id: string) => {
    setCommands((prev) => prev.filter((c) => c.id !== id))
  }, [])

  // Global keyboard shortcut
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault()
        toggle()
      }
      if (e.key === 'Escape' && isOpen) {
        e.preventDefault()
        close()
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [toggle, close, isOpen])

  return (
    <CommandPaletteContext.Provider
      value={{ isOpen, open, close, toggle, registerCommand, unregisterCommand }}
    >
      {children}
      <CommandPaletteDialog
        isOpen={isOpen}
        onClose={close}
        commands={commands}
      />
    </CommandPaletteContext.Provider>
  )
}

// ============================================
// Dialog Component
// ============================================

interface CommandPaletteDialogProps {
  isOpen: boolean
  onClose: () => void
  commands: Command[]
}

function CommandPaletteDialog({
  isOpen,
  onClose,
  commands,
}: CommandPaletteDialogProps) {
  const router = useRouter()
  const inputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [isDark, setIsDark] = useState(true)
  const [debouncedQuery, setDebouncedQuery] = useState('')

  // Debounce query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(query)
    }, 300)
    return () => clearTimeout(timer)
  }, [query])

  // Search
  const { data: searchResults } = trpc.search.global.useQuery(
    { query: debouncedQuery, limit: 5 },
    { enabled: debouncedQuery.length > 1 }
  )

  // Get entity schemas for navigation commands
  const schemas = useMemo(() => {
    try {
      return getAllSchemas()
    } catch {
      return []
    }
  }, [])

  // Build all available commands
  const allCommands = useMemo<Command[]>(() => {
    const builtinCommands: Command[] = [
      // Navigation
      {
        id: 'nav-dashboard',
        label: 'Go to Dashboard',
        icon: LayoutDashboard,
        shortcut: 'G D',
        category: 'navigation',
        action: () => router.push('/employee/recruiting/dashboard'),
        keywords: ['home', 'overview', 'main'],
      },
      {
        id: 'nav-inbox',
        label: 'Go to Inbox',
        icon: Inbox,
        shortcut: 'G I',
        category: 'navigation',
        action: () => router.push('/employee/inbox'),
        keywords: ['work', 'tasks', 'notifications', 'todo'],
      },
      // Quick inbox actions
      {
        id: 'inbox-overdue',
        label: 'View Overdue Items',
        icon: Clock,
        category: 'actions',
        action: () => router.push('/employee/inbox?dueBy=overdue'),
        keywords: ['overdue', 'late', 'urgent', 'inbox'],
      },
      {
        id: 'inbox-today',
        label: 'View Today\'s Items',
        icon: Calendar,
        category: 'actions',
        action: () => router.push('/employee/inbox?dueBy=today'),
        keywords: ['today', 'due', 'inbox'],
      },
      {
        id: 'inbox-approvals',
        label: 'View Pending Approvals',
        icon: CheckCircle2,
        category: 'actions',
        action: () => router.push('/employee/inbox?type=approval'),
        keywords: ['approvals', 'approve', 'review', 'inbox'],
      },
      // Admin
      {
        id: 'nav-admin-dashboard',
        label: 'Admin Dashboard',
        icon: LayoutDashboard,
        category: 'navigation',
        action: () => router.push('/employee/admin/dashboard'),
        keywords: ['admin', 'system', 'health'],
      },
      {
        id: 'nav-admin-users',
        label: 'User Management',
        icon: Users,
        category: 'navigation',
        action: () => router.push('/employee/admin/users'),
        keywords: ['admin', 'users', 'roles', 'permissions'],
      },
      ...schemas.map(
        (schema): Command => ({
          id: `nav-${schema.type}`,
          label: `Go to ${schema.label.plural}`,
          icon: schema.icon,
          shortcut: `G ${schema.label.singular.charAt(0).toUpperCase()}`,
          category: 'navigation',
          action: () => router.push(schema.basePath),
          keywords: [schema.type, schema.label.singular.toLowerCase()],
        })
      ),
      // Create
      ...schemas.map(
        (schema): Command => ({
          id: `create-${schema.type}`,
          label: `Create ${schema.label.singular}`,
          icon: Plus,
          shortcut: `C ${schema.label.singular.charAt(0).toUpperCase()}`,
          category: 'create',
          action: () => router.push(`${schema.basePath}/new`),
          keywords: ['new', 'add', schema.type],
        })
      ),
      // Quick Actions
      {
        id: 'action-compose-email',
        label: 'Compose Email',
        icon: Mail,
        shortcut: 'C E',
        category: 'actions',
        action: () => console.log('Compose email - to be implemented'),
        keywords: ['email', 'send', 'message', 'compose'],
      },
      {
        id: 'action-log-call',
        label: 'Log a Call',
        icon: Phone,
        category: 'actions',
        action: () => console.log('Log call - to be implemented'),
        keywords: ['call', 'phone', 'log', 'activity'],
      },
      {
        id: 'action-schedule-meeting',
        label: 'Schedule Meeting',
        icon: Calendar,
        category: 'actions',
        action: () => console.log('Schedule meeting - to be implemented'),
        keywords: ['meeting', 'calendar', 'schedule', 'interview'],
      },
      {
        id: 'action-create-activity',
        label: 'Create Activity',
        icon: Bell,
        shortcut: 'C A',
        category: 'actions',
        action: () => router.push('/employee/activities/new'),
        keywords: ['activity', 'task', 'follow-up', 'reminder'],
      },
      // Settings
      {
        id: 'toggle-theme',
        label: isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode',
        icon: isDark ? Sun : Moon,
        shortcut: 'T T',
        category: 'settings',
        action: () => {
          setIsDark(!isDark)
          document.documentElement.classList.toggle('dark')
        },
        keywords: ['theme', 'dark', 'light', 'mode'],
      },
      {
        id: 'settings',
        label: 'Settings',
        icon: Settings,
        shortcut: ',',
        category: 'settings',
        action: () => router.push('/settings'),
        keywords: ['preferences', 'config'],
      },
    ]

    const resultCommands = [...builtinCommands, ...commands]

    if (searchResults && searchResults.length > 0) {
      const searchCommands: Command[] = searchResults.map(item => {
        let Icon = FileText
        if (item.type === 'candidate') Icon = User
        if (item.type === 'job') Icon = Briefcase
        if (item.type === 'account') Icon = Building2

        return {
          id: `search-${item.type}-${item.id}`,
          label: item.title,
          icon: Icon,
          category: 'search', // This ensures they appear in Search category
          action: () => router.push(item.href),
          keywords: [item.type, item.subtitle || ''],
        }
      })
      
      return [...searchCommands, ...resultCommands]
    }

    return resultCommands
  }, [schemas, commands, router, isDark, searchResults])

  // Filter commands based on query
  const filteredCommands = useMemo(() => {
    if (!query) return allCommands

    const lowerQuery = query.toLowerCase()
    return allCommands.filter(
      (cmd) =>
        cmd.label.toLowerCase().includes(lowerQuery) ||
        cmd.keywords?.some((k) => k.includes(lowerQuery))
    )
  }, [allCommands, query])

  // Group commands by category
  const groupedCommands = useMemo(() => {
    const groups: Record<string, Command[]> = {}
    filteredCommands.forEach((cmd) => {
      if (!groups[cmd.category]) {
        groups[cmd.category] = []
      }
      groups[cmd.category].push(cmd)
    })
    return groups
  }, [filteredCommands])

  // Flat list for keyboard navigation
  const flatCommands = useMemo(() => filteredCommands, [filteredCommands])

  // Reset state when dialog opens
  useEffect(() => {
    if (isOpen) {
      setQuery('')
      setSelectedIndex(0)
      setTimeout(() => inputRef.current?.focus(), 0)
    }
  }, [isOpen])

  // Reset selection when results change
  useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev < flatCommands.length - 1 ? prev + 1 : 0
          )
          break
        case 'ArrowUp':
          e.preventDefault()
          setSelectedIndex((prev) =>
            prev > 0 ? prev - 1 : flatCommands.length - 1
          )
          break
        case 'Enter':
          e.preventDefault()
          if (flatCommands[selectedIndex]) {
            flatCommands[selectedIndex].action()
            onClose()
          }
          break
      }
    },
    [flatCommands, selectedIndex, onClose]
  )

  const handleSelect = useCallback(
    (command: Command) => {
      command.action()
      onClose()
    },
    [onClose]
  )

  if (!isOpen) return null

  const categoryLabels: Record<string, string> = {
    navigation: 'Navigation',
    create: 'Create',
    actions: 'Actions',
    search: 'Search',
    settings: 'Settings',
  }

  return (
    <div className="linear-command-palette" onClick={onClose}>
      <div
        className="linear-command-dialog"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search input */}
        <div className="linear-command-input-wrapper">
          <Search className="w-5 h-5 text-[var(--linear-text-muted)]" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search commands..."
            className="linear-command-input"
          />
          <kbd className="linear-kbd">esc</kbd>
        </div>

        {/* Command list */}
        <div className="linear-command-list linear-scrollbar">
          {flatCommands.length === 0 ? (
            <div className="px-4 py-8 text-center text-sm text-[var(--linear-text-muted)]">
              No commands found for &ldquo;{query}&rdquo;
            </div>
          ) : (
            Object.entries(groupedCommands).map(([category, cmds]) => (
              <div key={category} className="linear-command-group">
                <div className="linear-command-group-heading">
                  {categoryLabels[category] || category}
                </div>
                {cmds.map((cmd) => {
                  const globalIndex = flatCommands.indexOf(cmd)
                  return (
                    <div
                      key={cmd.id}
                      className="linear-command-item"
                      data-selected={globalIndex === selectedIndex}
                      onClick={() => handleSelect(cmd)}
                      onMouseEnter={() => setSelectedIndex(globalIndex)}
                    >
                      {cmd.icon && (
                        <cmd.icon className="icon" />
                      )}
                      <span className="label">{cmd.label}</span>
                      {cmd.shortcut && (
                        <div className="shortcut">
                          {cmd.shortcut.split(' ').map((key, i) => (
                            <kbd key={i}>{key}</kbd>
                          ))}
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================
// Hook for registering context-aware commands
// ============================================

export function useRegisterCommand(command: Command | null) {
  const { registerCommand, unregisterCommand } = useCommandPalette()

  useEffect(() => {
    if (command) {
      registerCommand(command)
      return () => unregisterCommand(command.id)
    }
  }, [command, registerCommand, unregisterCommand])
}

export default CommandPaletteProvider
