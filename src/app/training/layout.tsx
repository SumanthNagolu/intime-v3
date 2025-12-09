'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  Trophy,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/training/dashboard', icon: LayoutDashboard },
  { id: 'my-learning', label: 'My Learning', href: '/training/my-learning', icon: BookOpen },
  { id: 'courses', label: 'Course Catalog', href: '/training/courses', icon: GraduationCap },
  { id: 'certificates', label: 'Certificates', href: '/training/certificates', icon: Award },
  { id: 'achievements', label: 'Achievements', href: '/training/achievements', icon: Trophy },
]

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-cream">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-charcoal-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-gold-500" />
          <div>
            <h1 className="font-heading font-bold text-charcoal-900">InTime Academy</h1>
            <p className="text-xs text-charcoal-500">Training Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/employee/workspace/dashboard">
              <LogOut className="w-4 h-4 mr-2" />
              Back to Workspace
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-charcoal-100 min-h-[calc(100vh-64px)] flex-shrink-0">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                    isActive
                      ? 'bg-gold-50 text-gold-700 font-medium border-l-2 border-gold-500'
                      : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
