/**
 * Course Modules Management Page
 * Story: ACAD-005
 *
 * Placeholder for module CRUD operations
 * Full implementation in future stories
 */

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CourseModulesPage({
  params,
}: {
  params: { courseId: string };
}) {
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from('courses')
    .select('id, title')
    .eq('id', params.courseId)
    .single();

  if (error || !course) {
    notFound();
  }

  const { data: modules } = await supabase
    .from('course_modules')
    .select('*')
    .eq('course_id', params.courseId)
    .order('module_number');

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <Link href={`/admin/courses/${course.id}`}>
          <Button variant="ghost" className="mb-4">
            ← Back to Course
          </Button>
        </Link>
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold">Modules</h1>
            <p className="text-muted-foreground mt-2">{course.title}</p>
          </div>
          <Button size="lg">+ Add Module</Button>
        </div>
      </div>

      {!modules || modules.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold mb-2">No modules yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first module to organize course topics
          </p>
          <Button>Create First Module</Button>
        </Card>
      ) : (
        <div className="grid gap-4">
          {modules.map((module) => (
            <Card key={module.id} className="p-6">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold">
                    Module {module.module_number}: {module.title}
                  </h3>
                  {module.description && (
                    <p className="text-muted-foreground mt-2">{module.description}</p>
                  )}
                  <div className="flex gap-4 mt-3 text-sm text-muted-foreground">
                    {module.estimated_duration_hours && (
                      <span>⏱️ {module.estimated_duration_hours} hours</span>
                    )}
                    <span className={module.is_published ? 'text-green-600' : ''}>
                      {module.is_published ? '✓ Published' : '○ Draft'}
                    </span>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    Edit
                  </Button>
                  <Button variant="outline" size="sm">
                    Topics
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <Card className="p-6 mt-8 bg-blue-50 border-blue-200">
        <h3 className="font-semibold mb-2">🚧 Module Builder Coming Soon</h3>
        <p className="text-sm text-muted-foreground">
          Full module management UI with drag-and-drop reordering, prerequisite setup,
          and topic management will be available in the next iteration.
        </p>
      </Card>
    </div>
  );
}
