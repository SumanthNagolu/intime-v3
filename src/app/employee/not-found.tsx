'use client'

/**
 * Portal 404 Not Found Page
 *
 * Displayed when a route doesn't exist within the employee portal.
 * Uses portal navigation and styling (not marketing site).
 */

import Link from 'next/link'
import { Home, ArrowLeft, Search, LayoutDashboard, Briefcase, Users, Building2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TopNavigation } from '@/components/navigation/TopNavigation'

export default function EmployeeNotFound() {
  return (
    <div className="min-h-screen bg-cream flex flex-col">
      <TopNavigation />

      <main className="flex-1 flex items-center justify-center py-16">
        <div className="max-w-lg mx-auto text-center px-6">
          {/* 404 Visual */}
          <div className="relative mb-8">
            <span className="text-[8rem] md:text-[10rem] font-heading font-black text-charcoal-100 leading-none select-none">
              404
            </span>
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 flex items-center justify-center shadow-lg">
                <Search size={36} className="text-white" />
              </div>
            </div>
          </div>

          {/* Message */}
          <h1 className="text-2xl md:text-3xl font-heading font-bold text-charcoal-900 mb-3">
            Page Not Found
          </h1>
          <p className="text-charcoal-500 mb-8 max-w-sm mx-auto">
            The page you&apos;re looking for doesn&apos;t exist or you don&apos;t have access to it.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
            <Button
              variant="default"
              size="lg"
              onClick={() => window.history.back()}
              className="gap-2"
            >
              <ArrowLeft size={18} />
              Go Back
            </Button>

            <Link href="/employee/workspace/dashboard">
              <Button variant="outline" size="lg" className="gap-2">
                <LayoutDashboard size={18} />
                Dashboard
              </Button>
            </Link>
          </div>

          {/* Quick Links */}
          <div className="pt-6 border-t border-charcoal-200">
            <p className="text-sm text-charcoal-400 mb-4">Quick links</p>
            <div className="flex flex-wrap justify-center gap-2">
              <Link
                href="/employee/workspace/dashboard"
                className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-100 text-charcoal-600 rounded-lg text-sm font-medium hover:bg-gold-100 hover:text-gold-700 transition-colors"
              >
                <Home size={16} />
                My Workspace
              </Link>
              <Link
                href="/employee/ats/jobs"
                className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-100 text-charcoal-600 rounded-lg text-sm font-medium hover:bg-gold-100 hover:text-gold-700 transition-colors"
              >
                <Briefcase size={16} />
                Jobs
              </Link>
              <Link
                href="/employee/ats/candidates"
                className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-100 text-charcoal-600 rounded-lg text-sm font-medium hover:bg-gold-100 hover:text-gold-700 transition-colors"
              >
                <Users size={16} />
                Candidates
              </Link>
              <Link
                href="/employee/crm/accounts"
                className="inline-flex items-center gap-2 px-4 py-2 bg-charcoal-100 text-charcoal-600 rounded-lg text-sm font-medium hover:bg-gold-100 hover:text-gold-700 transition-colors"
              >
                <Building2 size={16} />
                Accounts
              </Link>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}
