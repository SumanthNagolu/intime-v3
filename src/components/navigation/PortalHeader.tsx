'use client'

import Link from 'next/link'
import Image from 'next/image'
import { User, LogOut, ChevronDown } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import type { User as SupabaseUser } from '@supabase/supabase-js'
import { cn } from '@/lib/utils'
import { useBranding } from '@/components/providers/BrandingProvider'

export function PortalHeader() {
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const userMenuRef = useRef<HTMLDivElement>(null)
  const router = useRouter()
  const branding = useBranding()

  // Check auth state on mount
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

  // Close user menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleSignOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setUserMenuOpen(false)
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-charcoal-100 z-50 shadow-sm flex-shrink-0">
      <div className="px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo - Use light mode logo for light navbar, fallback to dark logo or default */}
          <Link href="/employee/admin/dashboard" className="flex items-center gap-3">
            {branding.assets.logoLight || branding.assets.logoDark ? (
              <Image
                src={branding.assets.logoLight || branding.assets.logoDark || ''}
                alt={branding.orgName || 'Logo'}
                width={140}
                height={40}
                className="h-10 w-auto object-contain"
                unoptimized
              />
            ) : (
              <>
                <div className="w-10 h-10 bg-gradient-to-br from-forest-500 to-forest-700 rounded-xl flex items-center justify-center shadow-lg">
                  <span className="font-heading font-bold italic text-lg text-gold-400">I</span>
                </div>
                <div className="flex items-center">
                  <span className="text-xl font-heading font-bold text-forest-600">
                    {branding.orgName || 'InTime'}
                  </span>
                  <span className="text-xl font-heading font-medium text-gold-500 ml-1">Portal</span>
                </div>
              </>
            )}
          </Link>

          {/* User Menu */}
          <div className="flex items-center gap-4">
            {isLoading ? (
              <div className="w-10 h-10 bg-charcoal-100 rounded-full animate-pulse" />
            ) : user ? (
              <div className="relative" ref={userMenuRef}>
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-2 px-3 py-1.5 bg-charcoal-50 hover:bg-charcoal-100 rounded-full transition-colors"
                >
                  <div className="w-8 h-8 bg-gradient-to-br from-forest-500 to-forest-700 rounded-full flex items-center justify-center">
                    <User size={14} className="text-white" />
                  </div>
                  <span className="hidden sm:block text-sm font-medium text-charcoal-700 max-w-[150px] truncate">
                    {user.email?.split('@')[0]}
                  </span>
                  <ChevronDown
                    size={14}
                    className={cn(
                      'text-charcoal-500 transition-transform',
                      userMenuOpen && 'rotate-180'
                    )}
                  />
                </button>

                {/* User Dropdown Menu */}
                <div
                  className={cn(
                    'absolute right-0 top-full mt-2 w-56 bg-white rounded-xl shadow-xl py-2 border border-charcoal-100/50 z-50 transition-all duration-200',
                    userMenuOpen
                      ? 'opacity-100 visible translate-y-0'
                      : 'opacity-0 invisible -translate-y-2 pointer-events-none'
                  )}
                >
                  <div className="px-4 py-3 border-b border-charcoal-100">
                    <p className="text-sm font-semibold text-charcoal-900 truncate">
                      {user.email}
                    </p>
                  </div>
                  <button
                    onClick={handleSignOut}
                    className="w-full flex items-center gap-3 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors"
                  >
                    <LogOut size={16} />
                    Sign Out
                  </button>
                </div>
              </div>
            ) : (
              <Link
                href="/login"
                className="px-5 py-2 bg-gradient-to-r from-gold-500 to-gold-600 text-charcoal-900 rounded-full font-bold text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

