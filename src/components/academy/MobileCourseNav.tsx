/**
 * Mobile Course Navigation Component
 * Story: ACAD-021
 *
 * Responsive navigation that shows as:
 * - Sidebar on desktop (sticky)
 * - Drawer/Sheet on mobile (toggleable)
 */

'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Menu, X } from 'lucide-react';
import { CourseNavigation } from './CourseNavigation';

interface ModuleWithProgress {
  id: string;
  slug: string;
  title: string;
  description?: string;
  module_number: number;
  topics: any[];
  progress_percentage: number;
  completed_topics: number;
  total_topics: number;
}

interface MobileCourseNavProps {
  courseId: string;
  courseSlug: string;
  courseTitle: string;
  modules: ModuleWithProgress[];
  currentTopicId?: string;
}

export function MobileCourseNav({
  courseId,
  courseSlug,
  courseTitle,
  modules,
  currentTopicId,
}: MobileCourseNavProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile Trigger Button */}
      <div className="lg:hidden fixed bottom-4 right-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button size="lg" className="rounded-full shadow-lg h-14 w-14 p-0">
              {isOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-[300px] sm:w-[400px] p-0">
            <SheetHeader className="p-4 border-b">
              <SheetTitle className="text-left line-clamp-2">{courseTitle}</SheetTitle>
            </SheetHeader>
            <CourseNavigation
              courseId={courseId}
              courseSlug={courseSlug}
              modules={modules}
              currentTopicId={currentTopicId}
              className="h-[calc(100vh-5rem)]"
            />
          </SheetContent>
        </Sheet>
      </div>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:block w-80 border-r sticky top-0 h-screen overflow-hidden">
        <div className="p-4 border-b">
          <h2 className="font-semibold text-lg line-clamp-2">{courseTitle}</h2>
        </div>
        <CourseNavigation
          courseId={courseId}
          courseSlug={courseSlug}
          modules={modules}
          currentTopicId={currentTopicId}
          className="h-[calc(100vh-5rem)]"
        />
      </aside>
    </>
  );
}
