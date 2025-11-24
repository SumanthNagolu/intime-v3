/**
 * Edit Course Page
 * Story: ACAD-005
 */

import { createClient } from '@/lib/supabase/server';
import { CourseForm } from '@/components/admin/CourseForm';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { notFound } from 'next/navigation';

export default async function EditCoursePage({
  params,
}: {
  params: { courseId: string };
}) {
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from('courses')
    .select('*')
    .eq('id', params.courseId)
    .single();

  if (error || !course) {
    notFound();
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      <div className="mb-8">
        <Link href="/admin/courses">
          <Button variant="ghost" className="mb-4">
            ← Back to Courses
          </Button>
        </Link>
        <h1 className="text-4xl font-bold">Edit Course</h1>
        <p className="text-muted-foreground mt-2">{course.title}</p>
      </div>

      <Card className="p-8">
        <CourseForm course={course as any} />
      </Card>
    </div>
  );
}
