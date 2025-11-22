/**
 * Next Topic Widget Component
 * ACAD-019
 *
 * Smart recommendations for next topic to study
 */

'use client';

import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { ArrowRight, Lightbulb, BookOpen, Clock } from 'lucide-react';

interface NextTopicWidgetProps {
  recommendations?: Array<{
    course_id: string;
    course_title: string;
    module_name: string;
    topic_id: string;
    topic_title: string;
    topic_type: 'video' | 'reading' | 'quiz' | 'lab';
    estimated_minutes: number;
    reason: string;
  }>;
  isLoading?: boolean;
}

export function NextTopicWidget({ recommendations, isLoading }: NextTopicWidgetProps) {
  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent>
          <Skeleton className="h-24 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!recommendations || recommendations.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            Next Steps
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground">
              No active courses. Enroll in a course to get started!
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  const topRecommendation = recommendations[0];

  const getTopicTypeIcon = (type: string) => {
    switch (type) {
      case 'video':
        return '🎥';
      case 'reading':
        return '📖';
      case 'quiz':
        return '✏️';
      case 'lab':
        return '🔬';
      default:
        return '📚';
    }
  };

  const getTopicTypeBadge = (type: string) => {
    const variants: Record<string, string> = {
      video: 'bg-purple-100 text-purple-800',
      reading: 'bg-blue-100 text-blue-800',
      quiz: 'bg-green-100 text-green-800',
      lab: 'bg-orange-100 text-orange-800',
    };

    return (
      <Badge variant="secondary" className={variants[type] || ''}>
        {type.charAt(0).toUpperCase() + type.slice(1)}
      </Badge>
    );
  };

  return (
    <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lightbulb className="h-5 w-5 text-yellow-500" />
          Recommended Next
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main Recommendation */}
        <div className="p-4 rounded-lg bg-card border">
          <div className="flex items-start gap-3 mb-3">
            <span className="text-3xl">{getTopicTypeIcon(topRecommendation.topic_type)}</span>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                {getTopicTypeBadge(topRecommendation.topic_type)}
                <span className="text-xs text-muted-foreground flex items-center gap-1">
                  <Clock className="h-3 w-3" />
                  {topRecommendation.estimated_minutes} min
                </span>
              </div>
              <h4 className="font-semibold mb-1">{topRecommendation.topic_title}</h4>
              <p className="text-sm text-muted-foreground">
                {topRecommendation.module_name} · {topRecommendation.course_title}
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2 p-2 rounded bg-muted/50 mb-3">
            <Lightbulb className="h-4 w-4 text-yellow-600 mt-0.5" />
            <p className="text-xs text-muted-foreground">
              {topRecommendation.reason}
            </p>
          </div>

          <Link href={`/courses/${topRecommendation.course_id}/topics/${topRecommendation.topic_id}`}>
            <Button className="w-full">
              Start Learning
              <ArrowRight className="h-4 w-4 ml-2" />
            </Button>
          </Link>
        </div>

        {/* Other Recommendations */}
        {recommendations.length > 1 && (
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">
              Other Recommendations
            </p>
            {recommendations.slice(1, 3).map((rec, index) => (
              <Link
                key={index}
                href={`/courses/${rec.course_id}/topics/${rec.topic_id}`}
                className="block"
              >
                <div className="p-3 rounded-lg border bg-card hover:bg-accent transition-colors">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{getTopicTypeIcon(rec.topic_type)}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{rec.topic_title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {rec.module_name}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-muted-foreground" />
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
