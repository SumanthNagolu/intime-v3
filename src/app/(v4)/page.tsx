'use client'

/**
 * V4 Home / Dashboard Page
 *
 * Redirects to inbox by default, or shows a dashboard overview.
 */

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function V4HomePage() {
  const router = useRouter()

  useEffect(() => {
    // Redirect to inbox by default
    router.replace('/inbox')
  }, [router])

  return (
    <div className="flex items-center justify-center h-full">
      <div className="w-6 h-6 border-2 border-[var(--linear-accent)] border-t-transparent rounded-full animate-spin" />
    </div>
  )
}
