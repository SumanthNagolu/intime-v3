/**
 * Escalation Inbox Widget
 * Story: ACAD-025
 *
 * Shows AI mentor escalations that need human review
 */

'use client';

import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  MessageSquare,
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  ChevronRight,
  Brain,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface EscalationInboxWidgetProps {
  initialData: any[];
}

export function EscalationInboxWidget({ initialData }: EscalationInboxWidgetProps) {
  const { data: escalations, isLoading } = trpc.escalation.getQueue.useQuery(undefined, {
    initialData,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-40 w-full" />
        ))}
      </div>
    );
  }

  if (!escalations || escalations.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Pending Escalations</h3>
        <p className="text-gray-600">AI Mentor is handling all student questions.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-gray-600">
          {escalations.length} escalation{escalations.length !== 1 ? 's' : ''} need review
        </p>
      </div>

      {escalations.map((escalation: any) => {
        const waitMinutes = Math.floor(escalation.wait_time_minutes || 0);
        const waitHours = Math.floor(waitMinutes / 60);
        const isUrgent = waitHours >= 2;

        const statusColors: Record<string, string> = {
          pending: 'secondary',
          in_progress: 'default',
          resolved: 'outline',
        };

        return (
          <Card
            key={escalation.id}
            className={`p-6 ${isUrgent ? 'border-orange-300 bg-orange-50' : ''}`}
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <Badge variant={statusColors[escalation.status] as any}>
                    {escalation.status}
                  </Badge>
                  {isUrgent && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                  {escalation.auto_detected && (
                    <Badge variant="outline">
                      <Brain className="h-3 w-3 mr-1" />
                      Auto-detected
                    </Badge>
                  )}
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-1">
                    <User className="h-4 w-4" />
                    <span>{escalation.student_name}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Clock className="h-4 w-4" />
                    <span>
                      {waitHours > 0
                        ? `${waitHours}h ${waitMinutes % 60}m ago`
                        : `${waitMinutes}m ago`}
                    </span>
                  </div>
                </div>
              </div>

              {escalation.confidence && (
                <div className="text-right">
                  <p className="text-xs text-gray-500">Confidence</p>
                  <p className="text-lg font-bold text-gray-900">
                    {Math.round(escalation.confidence * 100)}%
                  </p>
                </div>
              )}
            </div>

            {/* Reason */}
            <div className="mb-4">
              <p className="text-sm font-medium text-gray-700 mb-1">Escalation Reason:</p>
              <p className="text-sm text-gray-900">{escalation.reason}</p>
            </div>

            {/* Topic Context */}
            {escalation.topic_title && (
              <div className="mb-4 text-sm text-gray-600">
                <span className="font-medium">Topic:</span> {escalation.topic_title}
              </div>
            )}

            {/* Triggers */}
            {escalation.triggers && Object.keys(escalation.triggers).length > 0 && (
              <div className="mb-4">
                <p className="text-xs text-gray-500 mb-2">Triggered by:</p>
                <div className="flex flex-wrap gap-2">
                  {Object.entries(escalation.triggers).map(([key, value]) =>
                    value ? (
                      <Badge key={key} variant="outline" className="text-xs">
                        {key.replace(/_/g, ' ')}
                      </Badge>
                    ) : null
                  )}
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-2 pt-4 border-t">
              <Link href={`/trainer/escalations/${escalation.id}`}>
                <Button>
                  Review
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
              <Link href={`/trainer/chat/${escalation.chat_id}`}>
                <Button variant="outline">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  View Chat
                </Button>
              </Link>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
