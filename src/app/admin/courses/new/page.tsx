/**
 * Create New Course Page
 * Story: ACAD-005
 */

import { CourseForm } from '@/components/admin/CourseForm';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function NewCoursePage() {
  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/courses">
          <Button variant="ghost" className="mb-4">
            ← Back to Courses
          </Button>
        </Link>
        <h1 className="text-4xl font-bold">Create New Course</h1>
        <p className="text-muted-foreground mt-2">
          Set up a new training course with modules and topics
        </p>
      </div>

      <Card className="p-8">
        <CourseForm />
      </Card>
    </div>
  );
}
