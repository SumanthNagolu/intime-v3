'use client'

import Link from 'next/link'
import { trpc } from '@/lib/trpc/client'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertTriangle, CheckCircle, Loader2 } from 'lucide-react'
import { formatDistanceToNow } from 'date-fns'

interface AccountEscalationsSectionProps {
  accountId: string
  onCreateEscalation: () => void
}

/**
 * Escalations Section - Isolated component with self-contained query
 * Trigger: Rendered when section === 'escalations'
 * DB Call: escalations.listByAccount({ accountId })
 */
export function AccountEscalationsSection({ accountId, onCreateEscalation }: AccountEscalationsSectionProps) {
  // This query fires when this component is rendered
  const escalationsQuery = trpc.crm.escalations.listByAccount.useQuery({ accountId })
  const escalations = escalationsQuery.data || []

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Escalations</CardTitle>
          <CardDescription>Track and resolve client issues</CardDescription>
        </div>
        <Button onClick={onCreateEscalation} variant="destructive">
          <AlertTriangle className="w-4 h-4 mr-2" />
          Create Escalation
        </Button>
      </CardHeader>
      <CardContent>
        {escalationsQuery.isLoading ? (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        ) : escalations.length === 0 ? (
          <div className="text-center py-8">
            <CheckCircle className="w-12 h-12 text-green-300 mx-auto mb-4" />
            <p className="text-charcoal-500">No escalations - great job!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {escalations.map((escalation: any) => (
              <Link
                key={escalation.id}
                href={`/employee/recruiting/escalations/${escalation.id}`}
                className="block p-4 border rounded-lg hover:border-charcoal-300 transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-charcoal-500">{escalation.escalation_number}</span>
                      <Badge
                        variant={
                          escalation.severity === 'critical' ? 'destructive' :
                          escalation.severity === 'high' ? 'default' :
                          'secondary'
                        }
                      >
                        {escalation.severity}
                      </Badge>
                    </div>
                    <p className="font-medium mt-1">{escalation.issue_summary}</p>
                    <p className="text-sm text-charcoal-500 capitalize mt-1">
                      {escalation.escalation_type.replace('_', ' ')}
                    </p>
                  </div>
                  <Badge
                    variant={
                      escalation.status === 'resolved' || escalation.status === 'closed' ? 'outline' :
                      escalation.status === 'in_progress' ? 'default' :
                      'secondary'
                    }
                  >
                    {escalation.status}
                  </Badge>
                </div>
                <div className="flex items-center gap-4 mt-3 text-xs text-charcoal-500">
                  <span>Created by {escalation.creator?.full_name}</span>
                  <span>&bull;</span>
                  <span>{formatDistanceToNow(new Date(escalation.created_at), { addSuffix: true })}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

