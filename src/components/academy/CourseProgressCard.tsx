/**
 * Course Progress Card Component
 * ACAD-019
 * Design System V2 (Ivory/Forest/Rust)
 *
 * Displays individual course enrollment with progress and next steps
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { BookOpen, Clock, PlayCircle, CheckCircle2, TrendingUp } from 'lucide-react';

interface CourseProgressCardProps {
  enrollment: {
    id: string;
    course_id: string;
    course_title: string;
    completion_percentage: number;
    status: string;
    enrolled_at: string;
    current_module_name?: string;
    current_topic_name?: string;
    modules_completed?: number;
    total_modules?: number;
  };
}

export function CourseProgressCard({ enrollment }: CourseProgressCardProps) {
  const isCompleted = enrollment.status === 'completed';
  const isActive = enrollment.status === 'active';

  const getStatusBadge = () => {
    switch (enrollment.status) {
      case 'completed':
        return <Badge variant="default" className="bg-forest-500 hover:bg-forest-600">Completed</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-blue-600 hover:bg-blue-700">In Progress</Badge>;
      case 'pending':
        return <Badge variant="secondary" className="bg-gray-100 text-gray-700">Not Started</Badge>;
      case 'dropped':
        return <Badge variant="destructive">Dropped</Badge>;
      case 'expired':
        return <Badge variant="outline" className="border-gray-300 text-gray-500">Expired</Badge>;
      default:
        return <Badge variant="secondary">{enrollment.status}</Badge>;
    }
  };

  const getProgressColor = () => {
    if (isCompleted) return 'bg-forest-500';
    if (enrollment.completion_percentage >= 75) return 'bg-blue-500';
    if (enrollment.completion_percentage >= 50) return 'bg-yellow-500';
    return 'bg-gray-400';
  };

  return (
    <Card className="hover:shadow-elevation-md transition-shadow border-gray-200">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2 text-charcoal font-heading text-lg">
              <BookOpen className="h-5 w-5 text-forest-600" />
              {enrollment.course_title}
            </CardTitle>
            <div className="flex items-center gap-3">
              {getStatusBadge()}
              <span className="text-xs text-gray-500 flex items-center gap-1 font-medium">
                <Clock className="h-3 w-3" />
                Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-5">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-600 flex items-center gap-1">
              <TrendingUp className="h-4 w-4 text-forest-500" />
              Progress
            </span>
            <span className="text-sm font-bold text-charcoal">
              {enrollment.completion_percentage}%
            </span>
          </div>
          <Progress
            value={enrollment.completion_percentage}
            className={`h-2 bg-gray-100 [&>div]:${getProgressColor()}`}
          />
          {enrollment.modules_completed !== undefined && enrollment.total_modules !== undefined && (
            <p className="text-xs text-gray-500 text-right">
              {enrollment.modules_completed} of {enrollment.total_modules} modules completed
            </p>
          )}
        </div>

        {/* Current Progress */}
        {isActive && enrollment.current_topic_name && (
          <div className="pt-4 border-t border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-3">Currently Studying</p>
            <div className="flex items-start gap-3 p-3 rounded-lg bg-forest-50/50 border border-forest-100">
              <PlayCircle className="h-5 w-5 text-forest-600 mt-0.5 flex-shrink-0" />
              <div>
                {enrollment.current_module_name && (
                  <p className="text-xs text-forest-500 mb-0.5 font-medium">
                    {enrollment.current_module_name}
                  </p>
                )}
                <p className="text-sm font-semibold text-charcoal line-clamp-1">
                  {enrollment.current_topic_name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-forest-50 border border-forest-200">
            <CheckCircle2 className="h-5 w-5 text-forest-600" />
            <p className="text-sm font-medium text-forest-800">
              Course completed! Great work!
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter className="pt-0">
        <Link href={`/courses/${enrollment.course_id}`} className="w-full">
          <Button className="w-full" variant={isActive ? 'default' : 'outline'}>
            {isCompleted ? 'Review Course' : isActive ? 'Continue Learning' : 'Start Course'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
