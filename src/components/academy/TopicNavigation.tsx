/**
 * Topic Navigation Component
 * Story: ACAD-021
 *
 * Shows next/previous topic buttons at bottom of content
 */

'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChevronLeft, ChevronRight, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Topic {
  id: string;
  slug: string;
  title: string;
  content_type: 'video' | 'reading' | 'quiz' | 'lab' | 'project';
  is_unlocked?: boolean;
}

interface TopicNavigationProps {
  courseSlug: string;
  previousTopic?: Topic | null;
  nextTopic?: Topic | null;
  className?: string;
}

export function TopicNavigation({
  courseSlug,
  previousTopic,
  nextTopic,
  className,
}: TopicNavigationProps) {
  return (
    <nav className={cn('flex items-center justify-between gap-4 mt-8 pt-8 border-t', className)}>
      {/* Previous Topic */}
      <div className="flex-1">
        {previousTopic ? (
          <Link href={`/students/courses/${courseSlug}/topics/${previousTopic.slug}`}>
            <Button variant="outline" className="w-full sm:w-auto">
              <ChevronLeft className="h-4 w-4 mr-2" />
              <div className="text-left">
                <div className="text-xs text-muted-foreground">Previous</div>
                <div className="font-medium text-sm truncate max-w-[200px]">
                  {previousTopic.title}
                </div>
              </div>
            </Button>
          </Link>
        ) : (
          <div /> // Empty div to maintain flexbox spacing
        )}
      </div>

      {/* Next Topic */}
      <div className="flex-1 flex justify-end">
        {nextTopic ? (
          nextTopic.is_unlocked ? (
            <Link href={`/students/courses/${courseSlug}/topics/${nextTopic.slug}`}>
              <Button className="w-full sm:w-auto">
                <div className="text-right">
                  <div className="text-xs opacity-90">Next</div>
                  <div className="font-medium text-sm truncate max-w-[200px]">
                    {nextTopic.title}
                  </div>
                </div>
                <ChevronRight className="h-4 w-4 ml-2" />
              </Button>
            </Link>
          ) : (
            <Button disabled className="w-full sm:w-auto">
              <div className="text-right">
                <div className="text-xs opacity-90">Next (Locked)</div>
                <div className="font-medium text-sm truncate max-w-[200px]">
                  {nextTopic.title}
                </div>
              </div>
              <Lock className="h-4 w-4 ml-2" />
            </Button>
          )
        ) : null}
      </div>
    </nav>
  );
}
