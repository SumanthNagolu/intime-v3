/**
 * Course Navigation Component
 * Story: ACAD-021
 *
 * Features:
 * - Collapsible module tree
 * - Topic list with completion icons
 * - Locked/unlocked visual indicators
 * - Progress bar per module
 * - Jump to any unlocked topic
 * - Mobile drawer support
 */

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  CheckCircle2,
  Circle,
  Lock,
  ChevronRight,
  ChevronDown,
  BookOpen,
  Video,
  FlaskConical,
  FileText,
  Trophy,
  Brain,
} from 'lucide-react';

interface TopicWithProgress {
  id: string;
  slug: string;
  title: string;
  description?: string;
  topic_number: number;
  content_type: 'video' | 'reading' | 'quiz' | 'lab' | 'project';
  estimated_duration_minutes?: number;
  is_completed: boolean;
  is_unlocked: boolean;
  is_required: boolean;
  completion_data?: {
    completed_at: string;
    xp_earned: number;
    time_spent_seconds: number;
  } | null;
}

interface ModuleWithProgress {
  id: string;
  slug: string;
  title: string;
  description?: string;
  module_number: number;
  topics: TopicWithProgress[];
  progress_percentage: number;
  completed_topics: number;
  total_topics: number;
}

interface CourseNavigationProps {
  courseId: string;
  courseSlug: string;
  modules: ModuleWithProgress[];
  currentTopicId?: string;
  className?: string;
}

const contentTypeIcons = {
  video: Video,
  reading: FileText,
  quiz: Brain,
  lab: FlaskConical,
  project: Trophy,
};

export function CourseNavigation({
  courseId,
  courseSlug,
  modules,
  currentTopicId,
  className,
}: CourseNavigationProps) {
  const pathname = usePathname();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(
    new Set(modules.map((m) => m.id))
  );

  const toggleModule = (moduleId: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(moduleId)) {
        next.delete(moduleId);
      } else {
        next.add(moduleId);
      }
      return next;
    });
  };

  const isTopicActive = (topicId: string) => {
    return currentTopicId === topicId || pathname.includes(topicId);
  };

  return (
    <nav className={cn('course-navigation', className)}>
      <ScrollArea className="h-full">
        <div className="space-y-2 p-4">
          {modules.map((module) => {
            const isExpanded = expandedModules.has(module.id);
            const hasCurrentTopic = module.topics.some((t) => isTopicActive(t.id));

            return (
              <Collapsible
                key={module.id}
                open={isExpanded}
                onOpenChange={() => toggleModule(module.id)}
              >
                <div
                  className={cn(
                    'rounded-lg border transition-colors',
                    hasCurrentTopic ? 'border-primary' : 'border-border'
                  )}
                >
                  {/* Module Header */}
                  <CollapsibleTrigger asChild>
                    <Button
                      variant="ghost"
                      className="w-full justify-between p-4 h-auto hover:bg-accent"
                    >
                      <div className="flex items-start gap-3 text-left flex-1">
                        <div className="mt-0.5">
                          {isExpanded ? (
                            <ChevronDown className="h-5 w-5" />
                          ) : (
                            <ChevronRight className="h-5 w-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <BookOpen className="h-4 w-4 flex-shrink-0" />
                            <span className="font-medium text-sm">
                              Module {module.module_number}
                            </span>
                            <span className="text-xs text-muted-foreground">
                              {module.completed_topics}/{module.total_topics}
                            </span>
                          </div>
                          <h3 className="font-semibold text-base line-clamp-2">
                            {module.title}
                          </h3>
                          {module.description && (
                            <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                              {module.description}
                            </p>
                          )}
                          {/* Progress Bar */}
                          <div className="mt-3">
                            <Progress value={module.progress_percentage} className="h-1.5" />
                            <span className="text-xs text-muted-foreground mt-1 block">
                              {module.progress_percentage}% Complete
                            </span>
                          </div>
                        </div>
                      </div>
                    </Button>
                  </CollapsibleTrigger>

                  {/* Topics List */}
                  <CollapsibleContent className="border-t">
                    <div className="py-2">
                      {module.topics.map((topic) => {
                        const Icon = contentTypeIcons[topic.content_type];
                        const isActive = isTopicActive(topic.id);

                        return (
                          <Link
                            key={topic.id}
                            href={
                              topic.is_unlocked
                                ? `/students/courses/${courseSlug}/topics/${topic.slug}`
                                : '#'
                            }
                            className={cn(
                              'flex items-center gap-3 px-4 py-3 text-sm transition-colors',
                              isActive && 'bg-accent',
                              topic.is_unlocked
                                ? 'hover:bg-accent cursor-pointer'
                                : 'opacity-60 cursor-not-allowed'
                            )}
                            onClick={(e) => {
                              if (!topic.is_unlocked) {
                                e.preventDefault();
                              }
                            }}
                          >
                            {/* Status Icon */}
                            <div className="flex-shrink-0">
                              {topic.is_completed ? (
                                <CheckCircle2 className="h-5 w-5 text-green-500" />
                              ) : !topic.is_unlocked ? (
                                <Lock className="h-5 w-5 text-muted-foreground" />
                              ) : (
                                <Circle className="h-5 w-5 text-muted-foreground" />
                              )}
                            </div>

                            {/* Content Type Icon */}
                            <Icon className="h-4 w-4 flex-shrink-0 text-muted-foreground" />

                            {/* Topic Info */}
                            <div className="flex-1 min-w-0">
                              <div className="flex items-baseline gap-2">
                                <span className="text-xs text-muted-foreground">
                                  {topic.topic_number}.
                                </span>
                                <span
                                  className={cn(
                                    'font-medium line-clamp-1',
                                    isActive && 'text-primary'
                                  )}
                                >
                                  {topic.title}
                                </span>
                              </div>
                              {topic.estimated_duration_minutes && (
                                <span className="text-xs text-muted-foreground">
                                  {topic.estimated_duration_minutes} min
                                </span>
                              )}
                              {topic.completion_data && (
                                <div className="text-xs text-green-600 mt-0.5">
                                  +{topic.completion_data.xp_earned} XP
                                </div>
                              )}
                            </div>

                            {/* Required Badge */}
                            {topic.is_required && !topic.is_completed && (
                              <span className="text-xs bg-orange-100 text-orange-800 px-2 py-0.5 rounded">
                                Required
                              </span>
                            )}
                          </Link>
                        );
                      })}
                    </div>
                  </CollapsibleContent>
                </div>
              </Collapsible>
            );
          })}
        </div>
      </ScrollArea>
    </nav>
  );
}
