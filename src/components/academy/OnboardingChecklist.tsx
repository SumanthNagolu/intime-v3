/**
 * Onboarding Checklist Component
 * Story: ACAD-024
 *
 * Guides new students through initial setup
 */

'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CheckCircle2,
  Circle,
  ChevronRight,
  Sparkles,
  X,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { toast } from 'sonner';

interface OnboardingChecklistProps {
  enrollmentId: string;
}

export function OnboardingChecklist({ enrollmentId }: OnboardingChecklistProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  const { data: checklist, isLoading, refetch } = trpc.enrollment.getOnboardingChecklist.useQuery(
    { enrollmentId }
  );

  const completeItemMutation = trpc.enrollment.completeChecklistItem.useMutation({
    onSuccess: () => {
      toast.success('Progress updated!');
      refetch();
    },
  });

  if (isDismissed || !checklist) {
    return null;
  }

  if (isLoading) {
    return (
      <Card className="p-6">
        <Skeleton className="h-6 w-48 mb-4" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-20 w-full" />
      </Card>
    );
  }

  const completedCount = checklist.filter((item: any) => item.is_completed).length;
  const totalCount = checklist.length;
  const progress = (completedCount / totalCount) * 100;
  const isCompleted = completedCount === totalCount;

  if (isCompleted) {
    return (
      <Card className="p-6 bg-gradient-to-r from-green-50 to-emerald-50 border-green-200">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-green-500 flex items-center justify-center">
              <CheckCircle2 className="h-6 w-6 text-white" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Onboarding Complete!</h3>
              <p className="text-sm text-gray-600">
                Great job! You're all set to succeed in this course.
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsDismissed(true)}
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6 border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50">
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
            <Sparkles className="h-5 w-5 text-purple-600" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-gray-900">Getting Started</h3>
            <p className="text-sm text-gray-600">
              Complete these steps to get the most out of your course
            </p>
          </div>
        </div>
        <Badge variant="secondary">
          {completedCount} / {totalCount}
        </Badge>
      </div>

      {/* Progress Bar */}
      <div className="mb-4">
        <Progress value={progress} className="h-2" />
      </div>

      {/* Checklist Items */}
      <div className="space-y-2">
        {checklist.map((item: any) => {
          const isCompleted = item.is_completed;

          return (
            <div
              key={item.id}
              className={`flex items-center gap-3 p-3 rounded-lg transition-colors ${
                isCompleted ? 'bg-white/50' : 'bg-white hover:bg-white/80'
              }`}
            >
              <button
                onClick={() => {
                  if (!isCompleted) {
                    completeItemMutation.mutate({
                      enrollmentId,
                      itemKey: item.item_key,
                    });
                  }
                }}
                className="flex-shrink-0"
                disabled={isCompleted}
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-5 w-5 text-green-500" />
                ) : (
                  <Circle className="h-5 w-5 text-gray-400 hover:text-purple-500" />
                )}
              </button>

              <div className="flex-1">
                <p
                  className={`font-medium ${isCompleted ? 'text-gray-500 line-through' : 'text-gray-900'}`}
                >
                  {item.title}
                </p>
                {item.description && (
                  <p className="text-xs text-gray-500">{item.description}</p>
                )}
              </div>

              {!isCompleted && (
                <ChevronRight className="h-4 w-4 text-gray-400" />
              )}
            </div>
          );
        })}
      </div>

      {/* Dismiss Button */}
      <div className="mt-4 pt-4 border-t">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsDismissed(true)}
          className="w-full text-gray-500"
        >
          Dismiss for now
        </Button>
      </div>
    </Card>
  );
}
