'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { ChevronDown, ChevronRight, User, LogOut, Clock, Command, Menu, X, Search } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { topNavigationTabs, getActiveTabFromPath } from '@/lib/navigation/top-navigation'
import { useEntityNavigationSafe } from '@/lib/navigation/EntityNavigationContext'
import { ENTITY_BASE_PATHS, EntityType } from '@/lib/navigation/entity-navigation.types'
import { formatDistanceToNow } from 'date-fns'

export function TopNavigation() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null)
  const [focusedIndex, setFocusedIndex] = useState<number>(-1)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [dropdownSearch, setDropdownSearch] = useState('')
  const pathname = usePathname()
  const router = useRouter()
  const entityNav = useEntityNavigationSafe()

  const dropdownRefs = useRef<Record<string, HTMLDivElement | null>>({})
  const menuItemRefs = useRef<Record<string, (HTMLAnchorElement | HTMLButtonElement | null)[]>>({})
  const userMenuRef = useRef<HTMLDivElement>(null)
  const userMenuItemRefs = useRef<(HTMLAnchorElement | HTMLButtonElement | null)[]>([])
  const closeTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Auth state management
  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setIsLoading(false)
    })
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null)
    })
    return () => subscription.unsubscribe()
  }, [])

  // Close dropdowns when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (activeDropdown) {
        const ref = dropdownRefs.current[activeDropdown]
        if (ref && !ref.contains(event.target as Node)) {
          setActiveDropdown(null)
        }
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [activeDropdown])

  // Close dropdown on route change
  useEffect(() => {
    setActiveDropdown(null)
    setMobileMenuOpen(false)
  }, [pathname])

  // Reset focused index when dropdown changes
  useEffect(() => {
    setFocusedIndex(-1)
  }, [activeDropdown, userMenuOpen])

  // Cleanup close timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) {
        clearTimeout(closeTimerRef.current)
      }
    }
  }, [])

  // Get navigable items count for current dropdown
  const getNavigableItemsCount = useCallback((tabId: string | null): number => {
    if (!tabId) return 0
    const tab = topNavigationTabs.find(t => t.id === tabId)
    if (!tab) return 0

    const recentEntities = entityNav?.recentEntities[tab.entityType] || []
    let count = 0

    for (const item of tab.dropdown) {
      if (item.type === 'link') count++
      if (item.type === 'recent' && recentEntities.length > 0) {
        count += Math.min(recentEntities.length, 5)
      }
    }
    return count
  }, [entityNav])

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Escape closes everything
      if (event.key === 'Escape') {
        setActiveDropdown(null)
        setUserMenuOpen(false)
        setMobileMenuOpen(false)
        setFocusedIndex(-1)
        return
      }

      // Handle entity dropdown navigation
      if (activeDropdown) {
        const itemCount = getNavigableItemsCount(activeDropdown)
        const items = menuItemRefs.current[activeDropdown] || []

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          const newIndex = focusedIndex < itemCount - 1 ? focusedIndex + 1 : 0
          setFocusedIndex(newIndex)
          items[newIndex]?.focus()
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          const newIndex = focusedIndex > 0 ? focusedIndex - 1 : itemCount - 1
          setFocusedIndex(newIndex)
          items[newIndex]?.focus()
        } else if (event.key === 'Tab') {
          // Close dropdown on tab
          setActiveDropdown(null)
          setFocusedIndex(-1)
        } else if (event.key === 'Home') {
          event.preventDefault()
          setFocusedIndex(0)
          items[0]?.focus()
        } else if (event.key === 'End') {
          event.preventDefault()
          setFocusedIndex(itemCount - 1)
          items[itemCount - 1]?.focus()
        }
        return
      }

      // Handle user menu navigation
      if (userMenuOpen) {
        const items = userMenuItemRefs.current
        const itemCount = items.filter(Boolean).length

        if (event.key === 'ArrowDown') {
          event.preventDefault()
          const newIndex = focusedIndex < itemCount - 1 ? focusedIndex + 1 : 0
          setFocusedIndex(newIndex)
          items[newIndex]?.focus()
        } else if (event.key === 'ArrowUp') {
          event.preventDefault()
          const newIndex = focusedIndex > 0 ? focusedIndex - 1 : itemCount - 1
          setFocusedIndex(newIndex)
          items[newIndex]?.focus()
        } else if (event.key === 'Tab') {
          setUserMenuOpen(false)
          setFocusedIndex(-1)
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [activeDropdown, userMenuOpen, focusedIndex, getNavigableItemsCount])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/login')
    router.refresh()
  }

  const toggleDropdown = (tabId: string) => {
    const newState = activeDropdown === tabId ? null : tabId
    setActiveDropdown(newState)
    // Initialize refs array for this dropdown
    if (newState && !menuItemRefs.current[newState]) {
      menuItemRefs.current[newState] = []
    }
  }

  // Handle tab click - navigate to most recent entity or default href
  const handleTabClick = (tab: typeof topNavigationTabs[0]) => {
    const recentEntities = getRecentEntities(tab.entityType)
    if (recentEntities.length > 0) {
      // Navigate to most recent entity
      router.push(getEntityHref(tab.entityType, recentEntities[0].id))
    } else if (tab.defaultHref) {
      // Navigate to default href
      router.push(tab.defaultHref)
    }
    setActiveDropdown(null)
  }

  // Handle dropdown toggle via chevron click
  const handleDropdownToggle = (e: React.MouseEvent, tabId: string) => {
    e.stopPropagation() // Prevent tab click navigation
    toggleDropdown(tabId)
  }

  // Handle inline search in dropdown
  const handleSearchSubmit = (tabId: string) => {
    const tab = topNavigationTabs.find(t => t.id === tabId)
    if (tab?.defaultHref && dropdownSearch.trim()) {
      router.push(`${tab.defaultHref}?search=${encodeURIComponent(dropdownSearch.trim())}`)
      setActiveDropdown(null)
      setDropdownSearch('')
    }
  }

  const activeTab = getActiveTabFromPath(pathname)

  // Get recent entities from context (or empty if context not available)
  const getRecentEntities = (entityType: EntityType) => {
    if (!entityNav) return []
    return entityNav.recentEntities[entityType] || []
  }

  // Get entity URL for recent items
  const getEntityHref = (entityType: EntityType, entityId: string) => {
    return `${ENTITY_BASE_PATHS[entityType]}/${entityId}`
  }

  return (
    <header className="bg-hublot-900 text-white z-50 shadow-lg flex-shrink-0">
      <div className="px-4 lg:px-6">
        <div className="flex items-center h-14">
          {/* Logo */}
          <Link href="/employee/workspace/dashboard" className="flex items-center gap-2 mr-6 lg:mr-8">
            <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-lg flex items-center justify-center">
              <span className="font-heading font-bold italic text-sm text-hublot-900">I</span>
            </div>
            <span className="text-lg font-heading font-bold text-white hidden sm:block">InTime</span>
          </Link>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-lg mr-2"
            aria-label={mobileMenuOpen ? 'Close menu' : 'Open menu'}
          >
            {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          {/* Entity Navigation Tabs - Desktop */}
          <nav className="hidden lg:flex items-center gap-1 flex-1">
            {topNavigationTabs.map((tab) => {
              const Icon = tab.icon
              const isActive = activeTab === tab.id
              const isOpen = activeDropdown === tab.id
              const recentEntities = getRecentEntities(tab.entityType)

              return (
                <div
                  key={tab.id}
                  ref={(el) => { dropdownRefs.current[tab.id] = el }}
                  className="relative"
                  onMouseEnter={() => {
                    // Clear any pending close timer
                    if (closeTimerRef.current) {
                      clearTimeout(closeTimerRef.current)
                      closeTimerRef.current = null
                    }
                    if (!menuItemRefs.current[tab.id]) {
                      menuItemRefs.current[tab.id] = []
                    }
                    setActiveDropdown(tab.id)
                  }}
                  onMouseLeave={() => {
                    // Add 150ms delay before closing
                    closeTimerRef.current = setTimeout(() => {
                      setActiveDropdown(null)
                    }, 150)
                  }}
                >
                  <div
                    className={cn(
                      'flex items-center rounded-lg text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-white/15 text-white'
                        : 'text-white/70 hover:text-white hover:bg-white/5',
                      isOpen && 'bg-white/15'
                    )}
                    aria-expanded={isOpen}
                    aria-haspopup="true"
                  >
                    {/* Main clickable area - navigates to recent/default */}
                    <button
                      onClick={() => handleTabClick(tab)}
                      className="flex items-center gap-2 px-3 py-2"
                    >
                      <Icon className="w-4 h-4" />
                      <span>{tab.label}</span>
                    </button>
                    {/* Chevron - toggles dropdown */}
                    <button
                      onClick={(e) => handleDropdownToggle(e, tab.id)}
                      className="pr-2 py-2 hover:bg-white/10 rounded-r-lg"
                    >
                      <ChevronDown
                        className={cn(
                          'w-3 h-3 transition-transform duration-200',
                          isOpen && 'rotate-180'
                        )}
                      />
                    </button>
                  </div>

                  {/* Dropdown Menu */}
                  <div
                    className={cn(
                      'absolute left-0 top-full pt-1 w-64 bg-white rounded-lg shadow-xl py-2 border border-charcoal-100/50 z-50 transition-all duration-200',
                      isOpen
                        ? 'opacity-100 visible translate-y-0'
                        : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                    )}
                    role="menu"
                    aria-label={`${tab.label} menu`}
                  >
                    {(() => {
                      let itemIndex = 0
                      // Initialize refs array for this tab
                      if (!menuItemRefs.current[tab.id]) {
                        menuItemRefs.current[tab.id] = []
                      }

                      return tab.dropdown.map((item) => {
                        if (item.type === 'divider') {
                          return <div key={item.id} className="my-2 border-t border-charcoal-100" role="separator" />
                        }

                        if (item.type === 'search') {
                          return (
                            <div key={item.id} className="px-2 py-2">
                              <form
                                onSubmit={(e) => {
                                  e.preventDefault()
                                  handleSearchSubmit(tab.id)
                                }}
                                className="relative"
                              >
                                <Search className="absolute left-3 top-2.5 w-4 h-4 text-charcoal-400" />
                                <input
                                  type="text"
                                  placeholder={item.placeholder || 'Search...'}
                                  value={dropdownSearch}
                                  onChange={(e) => setDropdownSearch(e.target.value)}
                                  className="w-full pl-9 pr-10 py-2 text-sm text-charcoal-900 border border-charcoal-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gold-500/50 focus:border-gold-500"
                                  onClick={(e) => e.stopPropagation()}
                                />
                                <button
                                  type="submit"
                                  className="absolute right-2 top-1.5 p-1 rounded hover:bg-charcoal-100 transition-colors"
                                >
                                  <ChevronRight className="w-4 h-4 text-charcoal-400" />
                                </button>
                              </form>
                            </div>
                          )
                        }

                        if (item.type === 'recent') {
                          if (recentEntities.length === 0) return null

                          return (
                            <div key={item.id}>
                              <div className="px-3 py-1.5 text-xs font-medium text-charcoal-500 uppercase tracking-wide">
                                Recent
                              </div>
                              {recentEntities.slice(0, 5).map((entity) => {
                                const currentIndex = itemIndex++
                                return (
                                  <Link
                                    key={entity.id}
                                    ref={(el) => { menuItemRefs.current[tab.id][currentIndex] = el }}
                                    href={getEntityHref(tab.entityType, entity.id)}
                                    className={cn(
                                      "flex items-center gap-3 px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors focus:bg-charcoal-50 focus:outline-none",
                                      focusedIndex === currentIndex && isOpen && "bg-charcoal-50"
                                    )}
                                    onClick={() => setActiveDropdown(null)}
                                    role="menuitem"
                                    tabIndex={isOpen ? 0 : -1}
                                  >
                                    <Clock className="w-4 h-4 text-charcoal-400" />
                                    <div className="flex-1 min-w-0">
                                      <p className="font-medium truncate">{entity.name}</p>
                                      {entity.subtitle && (
                                        <p className="text-xs text-charcoal-500 truncate">{entity.subtitle}</p>
                                      )}
                                    </div>
                                    <span className="text-xs text-charcoal-400 flex-shrink-0">
                                      {formatDistanceToNow(new Date(entity.viewedAt), { addSuffix: false })}
                                    </span>
                                  </Link>
                                )
                              })}
                            </div>
                          )
                        }

                        const ItemIcon = item.icon
                        const currentIndex = itemIndex++
                        return (
                          <Link
                            key={item.id}
                            ref={(el) => { menuItemRefs.current[tab.id][currentIndex] = el }}
                            href={item.href || '#'}
                            className={cn(
                              "flex items-center gap-3 px-3 py-2 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors focus:bg-charcoal-50 focus:outline-none",
                              focusedIndex === currentIndex && isOpen && "bg-charcoal-50"
                            )}
                            onClick={() => setActiveDropdown(null)}
                            role="menuitem"
                            tabIndex={isOpen ? 0 : -1}
                          >
                            {ItemIcon && <ItemIcon className="w-4 h-4 text-charcoal-400" />}
                            <span>{item.label}</span>
                            {item.badge && (
                              <span className="ml-auto text-xs bg-gold-100 text-gold-700 px-2 py-0.5 rounded-full">
                                {item.badge}
                              </span>
                            )}
                          </Link>
                        )
                      })
                    })()}
                  </div>
                </div>
              )
            })}
          </nav>

          {/* Right Side: Command Palette Hint + User Menu */}
          <div className="flex items-center gap-2 ml-auto">
            {/* Command Palette Hint */}
            <button
              onClick={() => {
                // Dispatch keyboard event to open CommandPalette
                document.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))
              }}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/10 rounded-lg text-sm text-white/70 hover:text-white hover:bg-white/20 transition-colors"
              title="Quick Search (⌘K)"
            >
              <Command className="w-4 h-4" />
              <span className="text-xs">⌘K</span>
            </button>

            {/* User Menu */}
            {isLoading ? (
              <div className="w-8 h-8 bg-white/20 rounded-full animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-2 py-1.5 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                  aria-expanded={userMenuOpen}
                  aria-haspopup="true"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-gold-400 to-gold-600 rounded-full flex items-center justify-center">
                    <User size={14} className="text-hublot-900" />
                  </div>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-white/70 transition-transform hidden sm:block',
                      userMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                <div
                  className={cn(
                    'absolute right-0 top-full mt-2 w-56 bg-white rounded-lg shadow-xl py-2 border border-charcoal-100/50 z-50 transition-all duration-200',
                    userMenuOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  )}
                  role="menu"
                  aria-label="User menu"
                >
                  <div className="px-4 py-3 border-b border-charcoal-100">
                    <p className="text-sm font-semibold text-charcoal-900 truncate">
                      {user.email}
                    </p>
                    <p className="text-xs text-charcoal-500">Superuser</p>
                  </div>
                  <Link
                    ref={(el) => { userMenuItemRefs.current[0] = el }}
                    href="/employee/admin/settings/organization"
                    className={cn(
                      "flex items-center gap-3 px-4 py-2.5 text-sm text-charcoal-700 hover:bg-charcoal-50 transition-colors focus:bg-charcoal-50 focus:outline-none",
                      focusedIndex === 0 && userMenuOpen && "bg-charcoal-50"
                    )}
                    onClick={() => setUserMenuOpen(false)}
                    role="menuitem"
                    tabIndex={userMenuOpen ? 0 : -1}
                  >
                    <User size={16} />
                    Profile Settings
                  </Link>
                  <button
                    ref={(el) => { userMenuItemRefs.current[1] = el }}
                    onClick={handleSignOut}
                    className={cn(
                      "w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors focus:bg-red-50 focus:outline-none",
                      focusedIndex === 1 && userMenuOpen && "bg-red-50"
                    )}
                    role="menuitem"
                    tabIndex={userMenuOpen ? 0 : -1}
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-4 py-2 bg-gradient-to-r from-gold-400 to-gold-600 text-hublot-900 rounded-lg font-bold text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      <div
        className={cn(
          'lg:hidden fixed inset-x-0 top-14 bottom-0 bg-hublot-900/95 backdrop-blur-sm z-40 transition-all duration-300',
          mobileMenuOpen
            ? 'opacity-100 visible'
            : 'opacity-0 invisible pointer-events-none'
        )}
      >
        <nav className="p-4 overflow-y-auto h-full">
          {topNavigationTabs.map((tab) => {
            const Icon = tab.icon
            const isActive = activeTab === tab.id

            return (
              <div key={tab.id} className="mb-4">
                <button
                  onClick={() => {
                    handleTabClick(tab)
                    setMobileMenuOpen(false)
                  }}
                  className={cn(
                    'w-full flex items-center gap-3 px-4 py-3 rounded-lg text-left',
                    isActive ? 'bg-white/15' : 'bg-white/5'
                  )}
                >
                  <Icon className="w-5 h-5 text-gold-400" />
                  <span className="font-medium text-white">{tab.label}</span>
                </button>
                <div className="mt-2 pl-4 space-y-1">
                  {tab.dropdown
                    .filter(item => item.type === 'link')
                    .map((item) => {
                      const ItemIcon = item.icon
                      return (
                        <Link
                          key={item.id}
                          href={item.href || '#'}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-white/70 hover:text-white hover:bg-white/5 rounded-lg transition-colors"
                          onClick={() => setMobileMenuOpen(false)}
                        >
                          {ItemIcon && <ItemIcon className="w-4 h-4" />}
                          <span>{item.label}</span>
                        </Link>
                      )
                    })}
                </div>
              </div>
            )
          })}
        </nav>
      </div>
    </header>
  )
}
