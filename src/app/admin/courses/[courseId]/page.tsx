/**
 * Course Overview Page
 * Story: ACAD-005
 *
 * Shows course details, modules, topics, and publish status
 */

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import { notFound } from 'next/navigation';

export default async function CourseOverviewPage({
  params,
}: {
  params: { courseId: string };
}) {
  const supabase = await createClient();

  const { data: course, error } = await supabase
    .from('courses')
    .select(
      `
      *,
      modules:course_modules(
        id,
        title,
        module_number,
        is_published,
        topics:module_topics(count)
      )
    `
    )
    .eq('id', params.courseId)
    .single();

  if (error || !course) {
    notFound();
  }

  const modules = (course.modules as any[]) || [];

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="mb-8">
        <Link href="/admin/courses">
          <Button variant="ghost" className="mb-4">
            ← Back to Courses
          </Button>
        </Link>

        <div className="flex justify-between items-start">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-4xl font-bold">{course.title}</h1>
              {course.is_published ? (
                <Badge className="bg-green-100 text-green-800">Published</Badge>
              ) : (
                <Badge variant="secondary">Draft</Badge>
              )}
            </div>
            {course.subtitle && (
              <p className="text-xl text-muted-foreground">{course.subtitle}</p>
            )}
          </div>

          <div className="flex gap-2">
            <Link href={`/admin/courses/${course.id}/edit`}>
              <Button variant="outline">Edit Details</Button>
            </Link>
            <Link href={`/admin/courses/${course.id}/modules`}>
              <Button>Manage Modules</Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="p-6">
          <div className="text-3xl font-bold">{course.total_modules}</div>
          <div className="text-sm text-muted-foreground">Modules</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold">{course.total_topics}</div>
          <div className="text-sm text-muted-foreground">Topics</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold">{course.estimated_duration_weeks}</div>
          <div className="text-sm text-muted-foreground">Weeks</div>
        </Card>
        <Card className="p-6">
          <div className="text-3xl font-bold capitalize">{course.skill_level}</div>
          <div className="text-sm text-muted-foreground">Level</div>
        </Card>
      </div>

      <Card className="p-6 mb-8">
        <h2 className="text-2xl font-semibold mb-4">Description</h2>
        <p className="text-muted-foreground whitespace-pre-wrap">{course.description}</p>
      </Card>

      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-semibold">Modules ({modules.length})</h2>
          <Link href={`/admin/courses/${course.id}/modules`}>
            <Button size="sm">+ Add Module</Button>
          </Link>
        </div>

        {modules.length === 0 ? (
          <Card className="p-12 text-center">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-xl font-semibold mb-2">No modules yet</h3>
            <p className="text-muted-foreground mb-6">
              Add modules to organize course content
            </p>
            <Link href={`/admin/courses/${course.id}/modules`}>
              <Button>Add First Module</Button>
            </Link>
          </Card>
        ) : (
          <div className="grid gap-3">
            {modules.map((module: any) => (
              <Card key={module.id} className="p-4">
                <div className="flex justify-between items-center">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold">Module {module.module_number}</span>
                      <span>{module.title}</span>
                      {module.is_published && (
                        <Badge variant="outline" className="text-xs">
                          Published
                        </Badge>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-1">
                      {module.topics?.[0]?.count || 0} topics
                    </p>
                  </div>
                  <Link href={`/admin/courses/${course.id}/modules/${module.id}`}>
                    <Button variant="outline" size="sm">
                      Manage
                    </Button>
                  </Link>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
