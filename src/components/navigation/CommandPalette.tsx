"use client"

import * as React from "react"
import { useRouter } from "next/navigation"
import {
  Search,
  Briefcase,
  Users,
  Building2,
  FileText,
  DollarSign,
  Send,
  Plus,
  ArrowRight,
  Clock,
  Settings,
  LayoutDashboard,
  Calendar,
  UserPlus,
  LucideIcon,
  Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { ScrollArea } from "@/components/ui/scroll-area"

// Types
interface CommandItem {
  id: string
  type: "navigation" | "action" | "recent"
  title: string
  subtitle?: string
  icon: LucideIcon
  href?: string
  action?: () => void
  keywords?: string[]
}

interface CommandCategory {
  id: string
  label: string
  items: CommandItem[]
}

interface CommandPaletteProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

// Default navigation items
const navigationItems: CommandItem[] = [
  {
    id: "dashboard",
    type: "navigation",
    title: "Dashboard",
    icon: LayoutDashboard,
    href: "/employee/recruiting/dashboard",
    keywords: ["home", "overview", "main"],
  },
  {
    id: "jobs",
    type: "navigation",
    title: "Jobs",
    subtitle: "View all job requisitions",
    icon: Briefcase,
    href: "/employee/recruiting/jobs",
    keywords: ["jobs", "positions", "requisitions", "openings"],
  },
  {
    id: "candidates",
    type: "navigation",
    title: "Candidates",
    subtitle: "Browse candidate profiles",
    icon: Users,
    href: "/employee/recruiting/talent",
    keywords: ["candidates", "talent", "people", "applicants"],
  },
  {
    id: "accounts",
    type: "navigation",
    title: "Accounts",
    subtitle: "Manage client accounts",
    icon: Building2,
    href: "/employee/recruiting/accounts",
    keywords: ["accounts", "clients", "companies", "customers"],
  },
  {
    id: "deals",
    type: "navigation",
    title: "Deals",
    subtitle: "Track deal pipeline",
    icon: DollarSign,
    href: "/employee/recruiting/deals",
    keywords: ["deals", "opportunities", "sales", "revenue"],
  },
  {
    id: "submissions",
    type: "navigation",
    title: "Submissions",
    subtitle: "View candidate submissions",
    icon: Send,
    href: "/employee/recruiting/submissions",
    keywords: ["submissions", "submittals", "sent"],
  },
  {
    id: "interviews",
    type: "navigation",
    title: "Interviews",
    subtitle: "Scheduled interviews",
    icon: Calendar,
    href: "/employee/recruiting/interviews",
    keywords: ["interviews", "schedule", "calendar", "meetings"],
  },
  // Admin navigation items
  {
    id: "admin-dashboard",
    type: "navigation",
    title: "Admin Dashboard",
    subtitle: "System overview and health",
    icon: LayoutDashboard,
    href: "/employee/admin/dashboard",
    keywords: ["admin", "dashboard", "system", "health", "overview"],
  },
  {
    id: "admin-users",
    type: "navigation",
    title: "User Management",
    subtitle: "Manage users and invitations",
    icon: Users,
    href: "/employee/admin/users",
    keywords: ["admin", "users", "manage", "invitations"],
  },
  {
    id: "admin-roles",
    type: "navigation",
    title: "Role Management",
    subtitle: "Configure roles and permissions",
    icon: Shield,
    href: "/employee/admin/roles",
    keywords: ["admin", "roles", "permissions", "access"],
  },
  {
    id: "admin-audit",
    type: "navigation",
    title: "Audit Logs",
    subtitle: "View system audit trail",
    icon: FileText,
    href: "/employee/admin/audit",
    keywords: ["admin", "audit", "logs", "trail", "history"],
  },
]

// Quick action items
const actionItems: CommandItem[] = [
  {
    id: "new-job",
    type: "action",
    title: "Create New Job",
    subtitle: "Add a new job requisition",
    icon: Plus,
    href: "/employee/recruiting/jobs/new",
    keywords: ["new", "create", "add", "job"],
  },
  {
    id: "new-candidate",
    type: "action",
    title: "Add Candidate",
    subtitle: "Add a new candidate profile",
    icon: UserPlus,
    href: "/employee/recruiting/talent/new",
    keywords: ["new", "create", "add", "candidate", "talent"],
  },
  {
    id: "submit-candidate",
    type: "action",
    title: "Submit Candidate",
    subtitle: "Submit a candidate to a job",
    icon: ArrowRight,
    keywords: ["submit", "send", "candidate"],
  },
  {
    id: "settings",
    type: "action",
    title: "System Settings",
    subtitle: "Configure system settings",
    icon: Settings,
    href: "/employee/admin/settings",
    keywords: ["settings", "preferences", "config", "admin"],
  },
  {
    id: "admin-add-user",
    type: "action",
    title: "Add User",
    subtitle: "Create a new user account",
    icon: UserPlus,
    href: "/employee/admin/users/new",
    keywords: ["admin", "add", "create", "user", "new"],
  },
]

// Recent items are session-only (no localStorage persistence)
const MAX_RECENT_ITEMS = 10

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter()
  const [query, setQuery] = React.useState("")
  const [selectedIndex, setSelectedIndex] = React.useState(0)
  const [recentItems, setRecentItems] = React.useState<CommandItem[]>([])
  const inputRef = React.useRef<HTMLInputElement>(null)

  // Add item to session-only recent list
  const addRecentItem = React.useCallback((item: CommandItem) => {
    setRecentItems((prev) => {
      // Remove if already exists, add to front with "recent" type
      const filtered = prev.filter((i) => i.id !== item.id)
      const recentItem = { ...item, type: "recent" as const }
      return [recentItem, ...filtered].slice(0, MAX_RECENT_ITEMS)
    })
  }, [])

  // Build categories based on query
  const categories = React.useMemo(() => {
    const searchQuery = query.toLowerCase().trim()
    const result: CommandCategory[] = []

    // Filter function
    const matchesQuery = (item: CommandItem) => {
      if (!searchQuery) return true
      const matchTitle = item.title.toLowerCase().includes(searchQuery)
      const matchSubtitle = item.subtitle?.toLowerCase().includes(searchQuery)
      const matchKeywords = item.keywords?.some((k) =>
        k.toLowerCase().includes(searchQuery)
      )
      return matchTitle || matchSubtitle || matchKeywords
    }

    // Show recent items when no query
    if (!searchQuery && recentItems.length > 0) {
      result.push({
        id: "recent",
        label: "Recent",
        items: recentItems,
      })
    }

    // Navigation
    const filteredNav = navigationItems.filter(matchesQuery)
    if (filteredNav.length > 0) {
      result.push({
        id: "navigation",
        label: "Navigation",
        items: filteredNav,
      })
    }

    // Actions
    const filteredActions = actionItems.filter(matchesQuery)
    if (filteredActions.length > 0) {
      result.push({
        id: "actions",
        label: "Quick Actions",
        items: filteredActions,
      })
    }

    return result
  }, [query, recentItems])

  // Flatten all items for keyboard navigation
  const allItems = React.useMemo(() => {
    return categories.flatMap((c) => c.items)
  }, [categories])

  // Reset selection when query or categories change
  React.useEffect(() => {
    setSelectedIndex(0)
  }, [query])

  // Focus input when dialog opens
  React.useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 0)
    } else {
      setQuery("")
      setSelectedIndex(0)
    }
  }, [open])

  // Handle item selection
  const handleSelect = React.useCallback(
    (item: CommandItem) => {
      addRecentItem(item)

      if (item.href) {
        router.push(item.href)
      } else if (item.action) {
        item.action()
      }

      onOpenChange(false)
      setQuery("")
    },
    [router, onOpenChange, addRecentItem]
  )

  // Handle keyboard navigation
  const handleKeyDown = React.useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault()
          setSelectedIndex((i) => (i + 1) % Math.max(allItems.length, 1))
          break
        case "ArrowUp":
          e.preventDefault()
          setSelectedIndex((i) => (i - 1 + allItems.length) % Math.max(allItems.length, 1))
          break
        case "Enter":
          e.preventDefault()
          if (allItems[selectedIndex]) {
            handleSelect(allItems[selectedIndex])
          }
          break
        case "Escape":
          e.preventDefault()
          onOpenChange(false)
          break
      }
    },
    [allItems, selectedIndex, handleSelect, onOpenChange]
  )

  // Global keyboard shortcut (Cmd+K / Ctrl+K)
  React.useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault()
        onOpenChange(!open)
      }
    }

    document.addEventListener("keydown", handleGlobalKeyDown)
    return () => document.removeEventListener("keydown", handleGlobalKeyDown)
  }, [open, onOpenChange])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-[640px] p-0 gap-0 overflow-hidden">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 h-14 border-b border-charcoal-100">
          <Search className="h-5 w-5 text-charcoal-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Search commands, pages, or actions..."
            className="flex-1 h-full bg-transparent text-base text-charcoal-900 outline-none placeholder:text-charcoal-400"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="text-xs text-charcoal-500 hover:text-charcoal-700 transition-colors"
            >
              Clear
            </button>
          )}
        </div>

        {/* Results */}
        <ScrollArea className="max-h-[400px]">
          <div className="p-2">
            {categories.length === 0 ? (
              <div className="py-12 text-center">
                <FileText className="h-10 w-10 mx-auto text-charcoal-300 mb-3" />
                <p className="text-sm text-charcoal-600">No results found</p>
                <p className="text-xs text-charcoal-400 mt-1">
                  Try a different search term
                </p>
              </div>
            ) : (
              categories.map((category) => (
                <div key={category.id} className="mb-4 last:mb-0">
                  <div className="px-3 py-2">
                    <span className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider">
                      {category.label}
                    </span>
                  </div>
                  {category.items.map((item) => {
                    const globalIndex = allItems.indexOf(item)
                    const isSelected = globalIndex === selectedIndex
                    const Icon = item.icon

                    return (
                      <button
                        key={`${category.id}-${item.id}`}
                        className={cn(
                          "w-full flex items-center gap-3 px-3 py-2.5 rounded-lg",
                          "text-left transition-all duration-150",
                          isSelected
                            ? "bg-forest-50 text-forest-900"
                            : "hover:bg-charcoal-50 text-charcoal-700"
                        )}
                        onClick={() => handleSelect(item)}
                        onMouseEnter={() => setSelectedIndex(globalIndex)}
                      >
                        <div
                          className={cn(
                            "w-9 h-9 rounded-lg flex items-center justify-center shrink-0 transition-colors",
                            item.type === "action"
                              ? "bg-forest-100 text-forest-600"
                              : item.type === "recent"
                              ? "bg-gold-100 text-gold-600"
                              : "bg-charcoal-100 text-charcoal-600",
                            isSelected && "bg-forest-200 text-forest-700"
                          )}
                        >
                          {item.type === "recent" ? (
                            <Clock className="h-4 w-4" />
                          ) : (
                            <Icon className="h-4 w-4" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">
                            {item.title}
                          </p>
                          {item.subtitle && (
                            <p className="text-xs text-charcoal-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          )}
                        </div>
                        {item.type === "navigation" && (
                          <ArrowRight
                            className={cn(
                              "h-4 w-4 shrink-0 transition-colors",
                              isSelected ? "text-forest-600" : "text-charcoal-400"
                            )}
                          />
                        )}
                        {item.type === "action" && (
                          <kbd
                            className={cn(
                              "h-5 px-1.5 text-[10px] font-medium rounded border transition-colors",
                              isSelected
                                ? "bg-forest-100 border-forest-200 text-forest-700"
                                : "bg-charcoal-50 border-charcoal-200 text-charcoal-500"
                            )}
                          >
                            Go
                          </kbd>
                        )}
                      </button>
                    )
                  })}
                </div>
              ))
            )}
          </div>
        </ScrollArea>

        {/* Footer */}
        <div className="px-4 py-2.5 border-t border-charcoal-100 bg-charcoal-50/50 flex items-center gap-4 text-xs text-charcoal-500">
          <div className="flex items-center gap-1.5">
            <kbd className="h-5 px-1.5 bg-white rounded border border-charcoal-200 font-medium">
              ↑↓
            </kbd>
            <span>Navigate</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="h-5 px-1.5 bg-white rounded border border-charcoal-200 font-medium">
              ↵
            </kbd>
            <span>Select</span>
          </div>
          <div className="flex items-center gap-1.5">
            <kbd className="h-5 px-1.5 bg-white rounded border border-charcoal-200 font-medium">
              esc
            </kbd>
            <span>Close</span>
          </div>
          <div className="ml-auto flex items-center gap-1.5">
            <kbd className="h-5 px-1.5 bg-white rounded border border-charcoal-200 font-medium">
              ⌘K
            </kbd>
            <span>Toggle</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

// Hook for using command palette
export function useCommandPalette() {
  const [open, setOpen] = React.useState(false)

  return {
    open,
    setOpen,
    toggle: () => setOpen((prev) => !prev),
  }
}
