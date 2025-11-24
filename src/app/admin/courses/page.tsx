/**
 * Course Admin List Page
 * Story: ACAD-005
 *
 * Lists all courses with create/edit/manage actions
 */

import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';

export default async function CoursesAdminPage() {
  const supabase = await createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .is('deleted_at', null)
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8 max-w-6xl">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-4xl font-bold">Courses</h1>
          <p className="text-muted-foreground mt-2">
            Manage training academy courses, modules, and content
          </p>
        </div>
        <Link href="/admin/courses/new">
          <Button size="lg">+ Create Course</Button>
        </Link>
      </div>

      {!courses || courses.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold mb-2">No courses yet</h2>
          <p className="text-muted-foreground mb-6">
            Create your first course to start building curriculum
          </p>
          <Link href="/admin/courses/new">
            <Button>Create First Course</Button>
          </Link>
        </Card>
      ) : (
        <div className="grid gap-4">
          {courses?.map((course) => (
            <Card key={course.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex justify-between items-start gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h2 className="text-2xl font-semibold">{course.title}</h2>
                    {course.is_published ? (
                      <Badge className="bg-green-100 text-green-800">Published</Badge>
                    ) : (
                      <Badge variant="secondary">Draft</Badge>
                    )}
                    {course.is_featured && (
                      <Badge className="bg-purple-100 text-purple-800">Featured</Badge>
                    )}
                  </div>

                  {course.subtitle && (
                    <p className="text-muted-foreground mb-3">{course.subtitle}</p>
                  )}

                  <div className="flex gap-6 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      📊 {course.total_modules} modules
                    </span>
                    <span className="flex items-center gap-1">
                      📝 {course.total_topics} topics
                    </span>
                    <span className="flex items-center gap-1">
                      ⏱️ {course.estimated_duration_weeks} weeks
                    </span>
                    <span className="flex items-center gap-1">
                      🎓 {course.skill_level}
                    </span>
                  </div>

                  {(course.price_monthly || course.price_one_time) && (
                    <div className="flex gap-4 mt-3 text-sm">
                      {course.price_monthly && (
                        <span className="font-semibold text-green-600">
                          ${course.price_monthly}/month
                        </span>
                      )}
                      {course.price_one_time && (
                        <span className="font-semibold text-blue-600">
                          ${course.price_one_time} one-time
                        </span>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex gap-2">
                  <Link href={`/admin/courses/${course.id}/edit`}>
                    <Button variant="outline" size="sm">
                      ✏️ Edit
                    </Button>
                  </Link>
                  <Link href={`/admin/courses/${course.id}/modules`}>
                    <Button variant="outline" size="sm">
                      📚 Modules
                    </Button>
                  </Link>
                  <Link href={`/admin/courses/${course.id}`}>
                    <Button variant="outline" size="sm">
                      👁️ View
                    </Button>
                  </Link>
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
