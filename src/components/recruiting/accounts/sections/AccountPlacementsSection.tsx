'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Loader2 } from 'lucide-react'
import { format } from 'date-fns'

interface AccountPlacementsSectionProps {
  accountId: string
}

/**
 * Placements Section - Isolated component with self-contained query
 * Trigger: Rendered when section === 'placements'
 * DB Call: placements.list({ accountId, limit: 50 })
 */
export function AccountPlacementsSection({ accountId }: AccountPlacementsSectionProps) {
  // This query fires when this component is rendered
  const placementsQuery = trpc.ats.placements.list.useQuery({ accountId, limit: 50 })
  const placements = placementsQuery.data?.items || []

  return (
    <Card>
      <CardHeader>
        <CardTitle>Placements</CardTitle>
        <CardDescription>Placement history for this account</CardDescription>
      </CardHeader>
      <CardContent>
        {placementsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : placements.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-charcoal-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No placements yet</p>
            <p className="text-sm text-charcoal-400 mt-1">Placements will appear here once jobs are filled</p>
          </div>
        ) : (
          <div className="space-y-3">
            {placements.map((placement: any) => (
              <Link
                key={placement.id}
                href={`/employee/recruiting/placements/${placement.id}`}
                className="flex items-center justify-between p-4 border rounded-lg hover:border-hublot-300 transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium text-charcoal-900">
                      {placement.candidate?.first_name} {placement.candidate?.last_name}
                    </p>
                    <p className="text-sm text-charcoal-500">
                      {placement.job?.title}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={placement.status === 'active' ? 'default' : 'secondary'}>
                    {placement.status?.replace('_', ' ')}
                  </Badge>
                  <div className="text-sm text-charcoal-500 text-right">
                    {placement.start_date && (
                      <p>{format(new Date(placement.start_date), 'MMM d, yyyy')}</p>
                    )}
                    {placement.end_date && (
                      <p className="text-xs text-charcoal-400">
                        to {format(new Date(placement.end_date), 'MMM d, yyyy')}
                      </p>
                    )}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

