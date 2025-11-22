/**
 * Grading Queue Widget
 * Story: ACAD-025
 *
 * Shows ungraded capstone submissions and labs
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Clock,
  ExternalLink,
  Calendar,
  User,
  BookOpen,
  ChevronRight,
  AlertCircle,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface GradingQueueWidgetProps {
  initialData: any[];
}

export function GradingQueueWidget({ initialData }: GradingQueueWidgetProps) {
  const { data: queue, isLoading } = trpc.capstone.getGradingQueue.useQuery(undefined, {
    initialData,
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-32 w-full" />
        ))}
      </div>
    );
  }

  if (!queue || queue.length === 0) {
    return (
      <Card className="p-12 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
          <Clock className="h-8 w-8 text-green-600" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 mb-2">All Caught Up!</h3>
        <p className="text-gray-600">No submissions pending grading at this time.</p>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      {queue.map((submission: any) => {
        const waitDays = Math.floor(
          (Date.now() - new Date(submission.submitted_at).getTime()) / (1000 * 60 * 60 * 24)
        );
        const isUrgent = waitDays >= 3;

        return (
          <Card
            key={submission.id}
            className={`p-6 hover:shadow-md transition-shadow ${isUrgent ? 'border-orange-300 bg-orange-50' : ''}`}
          >
            <div className="flex items-start justify-between">
              {/* Main Info */}
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {submission.course_title}
                  </h3>
                  {isUrgent && (
                    <Badge variant="destructive">
                      <AlertCircle className="h-3 w-3 mr-1" />
                      Urgent
                    </Badge>
                  )}
                  <Badge variant="secondary">{submission.status}</Badge>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <User className="h-4 w-4" />
                    <span>{submission.student_name}</span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar className="h-4 w-4" />
                    <span>
                      Submitted {new Date(submission.submitted_at).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock className="h-4 w-4" />
                    <span>Waiting {waitDays} days</span>
                  </div>
                  {submission.peer_review_count > 0 && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <BookOpen className="h-4 w-4" />
                      <span>{submission.peer_review_count} peer reviews</span>
                    </div>
                  )}
                </div>

                {submission.description && (
                  <p className="text-sm text-gray-700 line-clamp-2 mb-3">
                    {submission.description}
                  </p>
                )}

                <div className="flex items-center gap-2">
                  <Link href={submission.repository_url} target="_blank">
                    <Button variant="outline" size="sm">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Repository
                    </Button>
                  </Link>
                  {submission.demo_video_url && (
                    <Link href={submission.demo_video_url} target="_blank">
                      <Button variant="outline" size="sm">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Demo Video
                      </Button>
                    </Link>
                  )}
                </div>
              </div>

              {/* Action */}
              <Link href={`/trainer/grade/${submission.id}`}>
                <Button>
                  Grade Now
                  <ChevronRight className="h-4 w-4 ml-2" />
                </Button>
              </Link>
            </div>
          </Card>
        );
      })}

      {queue.length >= 10 && (
        <div className="text-center pt-4">
          <Button variant="outline">Load More</Button>
        </div>
      )}
    </div>
  );
}
