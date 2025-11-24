'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  ChevronLeft, 
  ChevronRight, 
  CheckCircle, 
  PlayCircle, 
  FileText, 
  Menu,
  X
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';
import { VideoPlayer } from '@/components/academy/VideoPlayer';
import { MarkdownReader } from '@/components/academy/MarkdownReader';
import { toast } from 'sonner';
import { trpc } from '@/lib/trpc/client';

interface Lesson {
  id: string;
  title: string;
  lesson_number: number;
  content_type: 'video' | 'markdown' | 'pdf' | 'quiz' | 'lab' | 'external_link';
  content_url: string | null;
  content_markdown: string | null;
  duration_seconds: number | null;
}

interface Topic {
  id: string;
  title: string;
  slug: string;
  lessons: AcademyLesson[];
  is_completed: boolean;
  module: {
    id: string;
    title: string;
    slug: string;
    course: {
      id: string;
      title: string;
      slug: string;
    };
  };
}

interface LessonViewerProps {
  topic: Topic;
  enrollmentId: string;
  userId: string;
  adjacentTopics: {
    next: any;
    previous: any;
  };
}

export function LessonViewer({ topic, enrollmentId, userId, adjacentTopics }: AcademyLessonViewerProps) {
  const router = useRouter();
  const [activeLessonId, setActiveLessonId] = useState<string>(
    topic.lessons.length > 0 ? topic.lessons[0].id : ''
  );
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Get active lesson
  const activeLesson = topic.lessons.find(l => l.id === activeLessonId);

  // Mutation to complete topic
  const completeTopicMutation = trpc.progress.completeTopic.useMutation({
    onSuccess: (data) => {
      toast.success(`Topic completed! +${data.xp_earned} XP`);
      router.refresh();
    },
    onError: (error) => {
      toast.error(`Failed to complete topic: ${error.message}`);
    }
  });

  // Mark lesson as complete
  const markLessonComplete = (lessonId: string) => {
    const newCompleted = new Set(completedLessons);
    newCompleted.add(lessonId);
    setCompletedLessons(newCompleted);
    
    // Persist to local storage (mocking granular backend persistence)
    localStorage.setItem(`lesson_complete_${userId}_${lessonId}`, 'true');

    // Check if all lessons are complete
    const allComplete = topic.lessons.every(l => newCompleted.has(l.id));
    if (allComplete && !topic.is_completed) {
      completeTopicMutation.mutate({
        enrollment_id: enrollmentId,
        topic_id: topic.id,
        time_spent_seconds: 0 // TODO: Track time
      });
    }
  };

  // Load completed lessons from local storage
  useEffect(() => {
    const loaded = new Set<string>();
    topic.lessons.forEach(l => {
      if (localStorage.getItem(`lesson_complete_${userId}_${l.id}`)) {
        loaded.add(l.id);
      }
    });
    setCompletedLessons(loaded);
  }, [topic.lessons, userId]);

  // Navigation handlers
  const handleNext = () => {
    const currentIndex = topic.lessons.findIndex(l => l.id === activeLessonId);
    if (currentIndex < topic.lessons.length - 1) {
      setActiveLessonId(topic.lessons[currentIndex + 1].id);
    } else if (adjacentTopics.next) {
      // Navigate to next topic
      // Need to construct URL: /students/courses/[courseSlug]/learn/[topicId]
      // Note: Topic ID is UUID, URL might use slug if we had topic slugs in URL, 
      // but the page structure we decided is [slug]/learn/[topicId].
      // But adjacentTopics.next has ID.
      router.push(`/students/courses/${topic.module.course.slug}/learn/${adjacentTopics.next.id}`);
    }
  };

  const handlePrevious = () => {
    const currentIndex = topic.lessons.findIndex(l => l.id === activeLessonId);
    if (currentIndex > 0) {
      setActiveLessonId(topic.lessons[currentIndex - 1].id);
    } else if (adjacentTopics.previous) {
      router.push(`/students/courses/${topic.module.course.slug}/learn/${adjacentTopics.previous.id}`);
    }
  };

  // Content Renderer
  const renderContent = () => {
    if (!activeLesson) return <div>No lesson selected</div>;

    switch (activeLesson.content_type) {
      case 'video':
        return (
          <div className="space-y-4">
            <VideoPlayer
              videoUrl={activeLesson.content_url || ''}
              topicId={topic.id}
              enrollmentId={enrollmentId}
              userId={userId}
              onComplete={() => markLessonComplete(activeLesson.id)}
              autoPlay={false}
            />
            <div className="flex justify-end">
               <Button 
                onClick={() => markLessonComplete(activeLesson.id)}
                variant={completedLessons.has(activeLesson.id) ? "outline" : "default"}
                disabled={completedLessons.has(activeLesson.id)}
              >
                {completedLessons.has(activeLesson.id) ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Completed
                  </>
                ) : (
                  "Mark as Complete"
                )}
              </Button>
            </div>
          </div>
        );
      case 'markdown':
        return (
          <div className="space-y-4">
            <MarkdownReader
              content={activeLesson.content_markdown || ''}
              onComplete={() => markLessonComplete(activeLesson.id)}
            />
             <div className="flex justify-end">
               <Button 
                onClick={() => markLessonComplete(activeLesson.id)}
                variant={completedLessons.has(activeLesson.id) ? "outline" : "default"}
                disabled={completedLessons.has(activeLesson.id)}
              >
                {completedLessons.has(activeLesson.id) ? (
                  <>
                    <CheckCircle className="mr-2 h-4 w-4 text-green-500" />
                    Completed
                  </>
                ) : (
                  "Mark as Complete"
                )}
              </Button>
            </div>
          </div>
        );
      case 'pdf':
        return (
          <div className="space-y-4 h-full flex flex-col">
            <div className="flex-1 bg-gray-100 rounded-lg border flex items-center justify-center min-h-[500px]">
              {activeLesson.content_url ? (
                <iframe 
                  src={activeLesson.content_url} 
                  className="w-full h-full rounded-lg"
                  title="PDF Viewer"
                />
              ) : (
                <div className="text-center p-8">
                  <FileText className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                  <p>PDF content not available</p>
                </div>
              )}
            </div>
            <div className="flex justify-end">
              <Button 
                onClick={() => markLessonComplete(activeLesson.id)}
                variant={completedLessons.has(activeLesson.id) ? "outline" : "default"}
              >
                Mark PDF as Read
              </Button>
            </div>
          </div>
        );
      case 'external_link':
        return (
          <div className="space-y-4 h-full flex flex-col items-center justify-center bg-gray-50 dark:bg-gray-800 rounded-lg border border-dashed p-12">
            <FileText className="h-16 w-16 text-blue-500 mb-4" />
            <h3 className="text-xl font-semibold mb-2">External Content</h3>
            <p className="text-gray-500 mb-6 text-center max-w-md">
              This lesson content is available as an external resource or download.
            </p>
            {activeLesson.content_url && (
              <Button asChild size="lg">
                <a href={activeLesson.content_url} target="_blank" rel="noopener noreferrer">
                  Open / Download Content
                </a>
              </Button>
            )}
            
            <div className="mt-12 border-t pt-8 w-full flex justify-center">
              <Button 
                onClick={() => markLessonComplete(activeLesson.id)}
                variant={completedLessons.has(activeLesson.id) ? "outline" : "default"}
              >
                {completedLessons.has(activeLesson.id) ? "Completed" : "Mark as Complete"}
              </Button>
            </div>
          </div>
        );
      default:
        // Fallback for PPTX if mapped to 'other' or just not matching specific types
        return (
          <div className="p-8 text-center bg-gray-50 rounded-lg border">
            <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <h3 className="text-lg font-medium mb-2">Lesson Content</h3>
            <p className="text-gray-500 mb-6">Type: {activeLesson.content_type}</p>
            
            {activeLesson.content_url && (
              <Button asChild className="mb-6">
                <a href={activeLesson.content_url} target="_blank" rel="noopener noreferrer">
                  Download / View Content
                </a>
              </Button>
            )}

            <div>
              <Button onClick={() => markLessonComplete(activeLesson.id)} variant="outline">
                Mark as Complete
              </Button>
            </div>
          </div>
        );
    }
  };

  // Sidebar List Item
  const LessonItem = ({ lesson }: { lesson: AcademyLesson }) => {
    const isActive = lesson.id === activeLessonId;
    const isCompleted = completedLessons.has(lesson.id);

    return (
      <button
        onClick={() => {
          setActiveLessonId(lesson.id);
          setIsSidebarOpen(false); // Close on mobile selection
        }}
        className={cn(
          "w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors",
          isActive ? "bg-blue-50 dark:bg-blue-900/20 border-l-4 border-blue-500" : "hover:bg-gray-100 dark:hover:bg-gray-800"
        )}
      >
        <div className="flex-shrink-0">
          {isCompleted ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : lesson.content_type === 'video' ? (
            <PlayCircle className={cn("h-5 w-5", isActive ? "text-blue-500" : "text-gray-400")} />
          ) : (
            <FileText className={cn("h-5 w-5", isActive ? "text-blue-500" : "text-gray-400")} />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className={cn("text-sm font-medium truncate", isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-700 dark:text-gray-300")}>
            {lesson.title}
          </p>
          <p className="text-xs text-gray-500">
            {lesson.duration_seconds ? `${Math.round(lesson.duration_seconds / 60)} min` : 'Reading'}
          </p>
        </div>
      </button>
    );
  };

  return (
    <div className="flex h-[calc(100vh-64px)]">
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex w-80 flex-col border-r bg-white dark:bg-gray-900">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg truncate">{topic.title}</h2>
          <p className="text-sm text-gray-500">{topic.module.title}</p>
        </div>
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-1">
            {topic.lessons.map(lesson => (
              <AcademyLessonItem key={lesson.id} lesson={lesson} />
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50 dark:bg-gray-950">
        {/* Mobile Header */}
        <div className="lg:hidden p-4 bg-white dark:bg-gray-900 border-b flex items-center gap-3">
          <Sheet open={isSidebarOpen} onOpenChange={setIsSidebarOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <Menu className="h-6 w-6" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80 p-0">
              <div className="p-4 border-b">
                <h2 className="font-semibold text-lg">{topic.title}</h2>
              </div>
              <ScrollArea className="h-[calc(100vh-64px)] p-4">
                <div className="space-y-1">
                  {topic.lessons.map(lesson => (
                    <AcademyLessonItem key={lesson.id} lesson={lesson} />
                  ))}
                </div>
              </ScrollArea>
            </SheetContent>
          </Sheet>
          <h1 className="font-semibold truncate">{activeLesson?.title}</h1>
        </div>

        {/* Content Area */}
        <div className="flex-1 p-4 lg:p-8 overflow-y-auto">
          <div className="max-w-4xl mx-auto bg-white dark:bg-gray-900 rounded-xl shadow-sm border p-6 min-h-[500px]">
            <h1 className="text-2xl font-bold mb-6">{activeLesson?.title}</h1>
            {renderContent()}
          </div>
        </div>

        {/* Footer Navigation */}
        <div className="p-4 bg-white dark:bg-gray-900 border-t flex justify-between items-center">
          <Button 
            variant="ghost" 
            onClick={handlePrevious}
            disabled={!adjacentTopics.previous && topic.lessons.indexOf(activeLesson!) === 0}
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Previous
          </Button>
          
          <Button onClick={handleNext}>
            {topic.lessons.indexOf(activeLesson!) === topic.lessons.length - 1 && !adjacentTopics.next ? "Finish" : "Next"}
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}

