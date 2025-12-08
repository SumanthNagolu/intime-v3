'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Briefcase } from 'lucide-react'

interface IntakeLayoutProps {
  children: ReactNode
}

export default function IntakeLayout({ children }: IntakeLayoutProps) {
  return (
    <div className="min-h-screen bg-cream">
      {/* Simplified header for wizard */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/employee/recruiting/jobs">
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Jobs
                </Button>
              </Link>
              <div className="h-6 w-px bg-charcoal-200" />
              <div className="flex items-center gap-2">
                <Briefcase className="w-5 h-5 text-hublot-700" />
                <span className="font-heading font-semibold text-lg">Job Intake Wizard</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="container mx-auto px-6 py-8">
        {children}
      </main>
    </div>
  )
}
