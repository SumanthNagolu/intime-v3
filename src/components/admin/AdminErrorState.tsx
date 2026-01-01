'use client'

import { AlertTriangle, RefreshCw, Home, LogOut } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface AdminErrorStateProps {
  error: string
  userId: string
  userEmail: string
}

export function AdminErrorState({ error, userId, userEmail }: AdminErrorStateProps) {
  const router = useRouter()

  const handleRefresh = async () => {
    // Clear the org cookie and try again
    try {
      await fetch('/api/auth/set-org-cookie', { method: 'POST' })
      router.refresh()
    } catch {
      router.refresh()
    }
  }

  const handleSignOut = () => {
    // Redirect to auth page which will handle logout
    router.push('/auth?action=logout')
  }

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center p-6">
      <div className="max-w-md w-full bg-white rounded-xl shadow-lg border border-charcoal-100 p-8">
        <div className="flex flex-col items-center text-center">
          <div className="w-16 h-16 rounded-full bg-amber-100 flex items-center justify-center mb-6">
            <AlertTriangle className="w-8 h-8 text-amber-600" />
          </div>
          
          <h1 className="text-xl font-semibold text-charcoal-900 mb-2">
            Admin Access Issue
          </h1>
          
          <p className="text-charcoal-600 mb-6">
            We couldn&apos;t load the admin panel. This usually happens when your organization data needs to be refreshed.
          </p>
          
          <div className="w-full bg-charcoal-50 rounded-lg p-4 mb-6 text-left">
            <p className="text-xs text-charcoal-500 mb-1">Error Details:</p>
            <p className="text-sm font-mono text-charcoal-700 break-all">{error}</p>
            <div className="mt-3 pt-3 border-t border-charcoal-100">
              <p className="text-xs text-charcoal-400">
                User: {userEmail}
              </p>
              <p className="text-xs text-charcoal-400 font-mono truncate">
                ID: {userId}
              </p>
            </div>
          </div>

          <div className="flex flex-col w-full gap-3">
            <Button 
              onClick={handleRefresh}
              className="w-full bg-hublot-900 hover:bg-hublot-800 text-white"
            >
              <RefreshCw className="w-4 h-4 mr-2" />
              Refresh & Retry
            </Button>
            
            <Link href="/employee/workspace/dashboard" className="w-full">
              <Button variant="outline" className="w-full">
                <Home className="w-4 h-4 mr-2" />
                Go to Workspace
              </Button>
            </Link>

            <Button 
              variant="ghost" 
              onClick={handleSignOut}
              className="w-full text-charcoal-500 hover:text-charcoal-700"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out & Re-login
            </Button>
          </div>

          <p className="text-xs text-charcoal-400 mt-6">
            If this issue persists, please contact your system administrator.
          </p>
        </div>
      </div>
    </div>
  )
}

