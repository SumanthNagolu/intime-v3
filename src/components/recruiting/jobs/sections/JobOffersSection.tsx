'use client'

import { useRouter } from 'next/navigation'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Gift, Loader2, DollarSign } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'
import { cn } from '@/lib/utils'

interface JobOffersSectionProps {
  jobId: string
}

const offerStatusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-700',
  extended: 'bg-blue-100 text-blue-700',
  accepted: 'bg-green-100 text-green-700',
  declined: 'bg-red-100 text-red-700',
  withdrawn: 'bg-charcoal-200 text-charcoal-600',
  expired: 'bg-charcoal-100 text-charcoal-500',
}

export function JobOffersSection({ jobId }: JobOffersSectionProps) {
  const router = useRouter()

  // Query submissions with offer-related statuses
  const submissionsQuery = trpc.ats.submissions.list.useQuery({ jobId, limit: 100 })
  const submissions = submissionsQuery.data?.items || []

  // Filter to only those with offer statuses
  const offerSubmissions = submissions.filter(
    (s) => ['offer_pending', 'offer_extended', 'placed'].includes(s.status)
  )

  const handleViewSubmission = (submissionId: string) => {
    router.push(`/employee/recruiting/submissions/${submissionId}`)
  }

  return (
    <Card>
      <CardHeader>
        <div>
          <CardTitle className="flex items-center gap-2">
            <Gift className="w-5 h-5" />
            Offers
          </CardTitle>
          <CardDescription>
            {offerSubmissions.length} offer{offerSubmissions.length !== 1 ? 's' : ''} for this job
          </CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        {submissionsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : offerSubmissions.length === 0 ? (
          <div className="text-center py-8">
            <Gift className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No offers yet</p>
            <p className="text-sm text-charcoal-400 mt-1">
              Extend offers from the submissions pipeline
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {offerSubmissions.map((submission) => (
              <div
                key={submission.id}
                className="flex items-start gap-4 p-4 border rounded-lg hover:border-hublot-300 transition-colors"
              >
                <div className="w-10 h-10 rounded-full bg-hublot-100 flex items-center justify-center flex-shrink-0">
                  <span className="text-sm font-medium text-hublot-700">
                    {submission.candidate?.first_name?.[0]}
                    {submission.candidate?.last_name?.[0]}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium text-charcoal-900 truncate">
                      {submission.candidate?.first_name} {submission.candidate?.last_name}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 mt-1">
                    <Badge className={cn('capitalize', offerStatusColors[submission.status] || 'bg-charcoal-100')}>
                      {submission.status === 'placed' ? 'Accepted' : submission.status.replace(/_/g, ' ')}
                    </Badge>
                    {submission.submitted_rate && (
                      <span className="flex items-center gap-1 text-sm text-charcoal-600">
                        <DollarSign className="w-3 h-3" />
                        ${submission.submitted_rate}/hr
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-charcoal-500 mt-2">
                    {formatDistanceToNow(new Date(submission.created_at), { addSuffix: true })}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleViewSubmission(submission.id)}
                  >
                    View Details
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
