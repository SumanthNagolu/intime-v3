'use client'

import { useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Loader2 } from 'lucide-react'

/**
 * Redirect /candidates/[id]/edit to /candidates/new?edit=[id]
 * The edit functionality is handled by the new page with edit query param
 */
export default function CandidateEditRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const candidateId = params.id as string

  useEffect(() => {
    if (candidateId) {
      router.replace(`/employee/recruiting/candidates/new?edit=${candidateId}`)
    }
  }, [candidateId, router])

  return (
    <div className="min-h-screen bg-cream flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-gold-500 mx-auto mb-4" />
        <p className="text-charcoal-600">Loading candidate editor...</p>
      </div>
    </div>
  )
}
