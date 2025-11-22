/**
 * Course Progress Card Component
 * ACAD-019
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
        return <Badge variant="default" className="bg-green-600">Completed</Badge>;
      case 'active':
        return <Badge variant="default" className="bg-blue-600">In Progress</Badge>;
      case 'pending':
        return <Badge variant="secondary">Not Started</Badge>;
      case 'dropped':
        return <Badge variant="destructive">Dropped</Badge>;
      case 'expired':
        return <Badge variant="outline">Expired</Badge>;
      default:
        return <Badge variant="secondary">{enrollment.status}</Badge>;
    }
  };

  const getProgressColor = () => {
    if (isCompleted) return 'bg-green-600';
    if (enrollment.completion_percentage >= 75) return 'bg-blue-600';
    if (enrollment.completion_percentage >= 50) return 'bg-yellow-600';
    return 'bg-gray-600';
  };

  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <CardTitle className="flex items-center gap-2 mb-2">
              <BookOpen className="h-5 w-5 text-primary" />
              {enrollment.course_title}
            </CardTitle>
            <div className="flex items-center gap-2">
              {getStatusBadge()}
              <span className="text-sm text-muted-foreground flex items-center gap-1">
                <Clock className="h-3 w-3" />
                Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
              </span>
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium flex items-center gap-1">
              <TrendingUp className="h-4 w-4" />
              Progress
            </span>
            <span className="text-sm font-bold">
              {enrollment.completion_percentage}%
            </span>
          </div>
          <Progress
            value={enrollment.completion_percentage}
            className={`h-2 ${getProgressColor()}`}
          />
          {enrollment.modules_completed !== undefined && enrollment.total_modules !== undefined && (
            <p className="text-xs text-muted-foreground">
              {enrollment.modules_completed} of {enrollment.total_modules} modules completed
            </p>
          )}
        </div>

        {/* Current Progress */}
        {isActive && enrollment.current_topic_name && (
          <div className="pt-4 border-t">
            <p className="text-sm font-medium mb-2">Currently Studying</p>
            <div className="flex items-start gap-2 p-3 rounded-lg bg-muted">
              <PlayCircle className="h-5 w-5 text-primary mt-0.5" />
              <div>
                {enrollment.current_module_name && (
                  <p className="text-xs text-muted-foreground">
                    {enrollment.current_module_name}
                  </p>
                )}
                <p className="text-sm font-medium">
                  {enrollment.current_topic_name}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Completion Message */}
        {isCompleted && (
          <div className="flex items-center gap-2 p-3 rounded-lg bg-green-50 dark:bg-green-950 border border-green-200 dark:border-green-800">
            <CheckCircle2 className="h-5 w-5 text-green-600" />
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Course completed! Great work!
            </p>
          </div>
        )}
      </CardContent>

      <CardFooter>
        <Link href={`/courses/${enrollment.course_id}`} className="w-full">
          <Button className="w-full" variant={isActive ? 'default' : 'outline'}>
            {isCompleted ? 'Review Course' : isActive ? 'Continue Learning' : 'Start Course'}
          </Button>
        </Link>
      </CardFooter>
    </Card>
  );
}
