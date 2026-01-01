'use client'

import { ReactNode } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { ChevronLeft, Building2 } from 'lucide-react'

interface EditLayoutProps {
  children: ReactNode
}

export default function EditLayout({ children }: EditLayoutProps) {
  const params = useParams()
  const accountId = params.id as string

  return (
    <div className="min-h-screen bg-cream">
      {/* Simplified header for wizard */}
      <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href={`/employee/recruiting/accounts/${accountId}`}>
                <Button variant="ghost" size="sm">
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Back to Account
                </Button>
              </Link>
              <div className="h-6 w-px bg-charcoal-200" />
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-hublot-700" />
                <span className="font-heading font-semibold text-lg">Edit Account</span>
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


