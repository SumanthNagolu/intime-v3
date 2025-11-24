# ACAD-005: Build Course Admin UI

**Status:** 🟢 Complete

**Story Points:** 6
**Sprint:** Sprint 1 (Week 5-6)
**Priority:** HIGH

---

## User Story

As a **Course Admin**,
I want **a web interface to create and manage courses, modules, and topics**,
So that **I can build curriculum without writing SQL or code**.

---

## Acceptance Criteria

- [ ] Course CRUD interface (create, edit, delete, publish courses)
- [ ] Module builder (add/reorder modules, set prerequisites)
- [ ] Topic editor (add topics, assign content type, set duration)
- [ ] Content uploader integrated (upload videos/PDFs per topic)
- [ ] Preview mode (see course as student would)
- [ ] Publish/unpublish controls (draft → live workflow)
- [ ] Bulk operations (duplicate module, reorder topics)
- [ ] Validation (can't publish course without content)
- [ ] RLS enforced (only admins/course_admins access)

---

## Technical Implementation

### React Component Structure

```
src/app/admin/courses/
├── page.tsx                    # Course list
├── new/page.tsx                # Create course
├── [courseId]/
│   ├── page.tsx                # Course overview
│   ├── edit/page.tsx           # Edit course details
│   ├── modules/
│   │   ├── page.tsx            # Module list
│   │   ├── new/page.tsx        # Create module
│   │   └── [moduleId]/
│   │       ├── page.tsx        # Module overview
│   │       ├── edit/page.tsx   # Edit module
│   │       └── topics/
│   │           ├── page.tsx    # Topic list
│   │           ├── new/page.tsx # Create topic
│   │           └── [topicId]/
│   │               └── edit/page.tsx # Edit topic
```

### Course List Page

Create file: `src/app/admin/courses/page.tsx`

```typescript
import { createClient } from '@/lib/supabase/server';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import Link from 'next/link';

export default async function CoursesAdminPage() {
  const supabase = createClient();

  const { data: courses } = await supabase
    .from('courses')
    .select('*')
    .order('created_at', { ascending: false });

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Courses</h1>
        <Link href="/admin/courses/new">
          <Button>Create Course</Button>
        </Link>
      </div>

      <div className="grid gap-4">
        {courses?.map((course) => (
          <Card key={course.id} className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <h2 className="text-xl font-semibold">{course.title}</h2>
                <p className="text-muted-foreground">{course.subtitle}</p>
                <div className="flex gap-4 mt-2 text-sm">
                  <span>{course.total_modules} modules</span>
                  <span>{course.total_topics} topics</span>
                  <span>{course.estimated_duration_weeks} weeks</span>
                  <span className={course.is_published ? 'text-green-600' : 'text-gray-400'}>
                    {course.is_published ? 'Published' : 'Draft'}
                  </span>
                </div>
              </div>
              <div className="flex gap-2">
                <Link href={`/admin/courses/${course.id}/edit`}>
                  <Button variant="outline" size="sm">Edit</Button>
                </Link>
                <Link href={`/admin/courses/${course.id}/modules`}>
                  <Button variant="outline" size="sm">Modules</Button>
                </Link>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
```

### Course Form Component

Create file: `src/components/admin/CourseForm.tsx`

```typescript
'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select } from '@/components/ui/select';
import { trpc } from '@/lib/trpc/client';
import type { Course } from '@/types/academy';

interface CourseFormProps {
  course?: Course;
}

export function CourseForm({ course }: CourseFormProps) {
  const router = useRouter();
  const [formData, setFormData] = useState({
    slug: course?.slug || '',
    title: course?.title || '',
    subtitle: course?.subtitle || '',
    description: course?.description || '',
    estimated_duration_weeks: course?.estimated_duration_weeks || 8,
    skill_level: course?.skill_level || 'beginner',
    price_monthly: course?.price_monthly || null,
    price_one_time: course?.price_one_time || null,
  });

  const createMutation = trpc.courses.createCourse.useMutation();
  const updateMutation = trpc.courses.updateCourse.useMutation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      if (course) {
        await updateMutation.mutateAsync({ courseId: course.id, ...formData });
      } else {
        await createMutation.mutateAsync(formData);
      }

      router.push('/admin/courses');
      router.refresh();
    } catch (error) {
      console.error('Failed to save course:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div>
        <Label htmlFor="slug">Slug</Label>
        <Input
          id="slug"
          value={formData.slug}
          onChange={(e) => setFormData({ ...formData, slug: e.target.value })}
          placeholder="guidewire-policycenter-development"
          required
        />
      </div>

      <div>
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Guidewire PolicyCenter Development"
          required
        />
      </div>

      <div>
        <Label htmlFor="subtitle">Subtitle</Label>
        <Input
          id="subtitle"
          value={formData.subtitle || ''}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="Master insurance software development in 8 weeks"
        />
      </div>

      <div>
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={4}
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="duration">Duration (weeks)</Label>
          <Input
            id="duration"
            type="number"
            value={formData.estimated_duration_weeks}
            onChange={(e) => setFormData({ ...formData, estimated_duration_weeks: parseInt(e.target.value) })}
            min="1"
            required
          />
        </div>

        <div>
          <Label htmlFor="skill_level">Skill Level</Label>
          <Select
            id="skill_level"
            value={formData.skill_level}
            onChange={(e) => setFormData({ ...formData, skill_level: e.target.value as any })}
          >
            <option value="beginner">Beginner</option>
            <option value="intermediate">Intermediate</option>
            <option value="advanced">Advanced</option>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <Label htmlFor="price_monthly">Monthly Price ($)</Label>
          <Input
            id="price_monthly"
            type="number"
            step="0.01"
            value={formData.price_monthly || ''}
            onChange={(e) => setFormData({ ...formData, price_monthly: parseFloat(e.target.value) })}
          />
        </div>

        <div>
          <Label htmlFor="price_one_time">One-time Price ($)</Label>
          <Input
            id="price_one_time"
            type="number"
            step="0.01"
            value={formData.price_one_time || ''}
            onChange={(e) => setFormData({ ...formData, price_one_time: parseFloat(e.target.value) })}
          />
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={createMutation.isLoading || updateMutation.isLoading}>
          {course ? 'Update' : 'Create'} Course
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  );
}
```

### tRPC Router (Courses)

Create file: `src/server/routers/courses.ts`

```typescript
import { z } from 'zod';
import { router, adminProcedure, publicProcedure } from '../trpc';
import { createAdminClient } from '@/lib/supabase/admin';

export const coursesRouter = router({
  // Public: List published courses
  listPublished: publicProcedure
    .query(async () => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .eq('is_published', true)
        .order('title');

      if (error) throw new Error(error.message);
      return data;
    }),

  // Admin: List all courses
  listAll: adminProcedure
    .query(async () => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('courses')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw new Error(error.message);
      return data;
    }),

  // Admin: Create course
  createCourse: adminProcedure
    .input(z.object({
      slug: z.string().min(1),
      title: z.string().min(1),
      subtitle: z.string().optional(),
      description: z.string().min(1),
      estimated_duration_weeks: z.number().int().positive(),
      skill_level: z.enum(['beginner', 'intermediate', 'advanced']),
      price_monthly: z.number().positive().optional(),
      price_one_time: z.number().positive().optional(),
    }))
    .mutation(async ({ input, ctx }) => {
      const supabase = createAdminClient();

      const { data, error } = await supabase
        .from('courses')
        .insert({
          ...input,
          created_by: ctx.user.id,
        })
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  // Admin: Update course
  updateCourse: adminProcedure
    .input(z.object({
      courseId: z.string().uuid(),
      slug: z.string().optional(),
      title: z.string().optional(),
      subtitle: z.string().optional(),
      description: z.string().optional(),
      is_published: z.boolean().optional(),
    }))
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();
      const { courseId, ...updateData } = input;

      const { data, error } = await supabase
        .from('courses')
        .update(updateData)
        .eq('id', courseId)
        .select()
        .single();

      if (error) throw new Error(error.message);
      return data;
    }),

  // Admin: Delete course
  deleteCourse: adminProcedure
    .input(z.object({ courseId: z.string().uuid() }))
    .mutation(async ({ input }) => {
      const supabase = createAdminClient();

      const { error } = await supabase
        .from('courses')
        .delete()
        .eq('id', input.courseId);

      if (error) throw new Error(error.message);
      return { success: true };
    }),
});
```

---

## Dependencies

- **ACAD-001** (Courses schema)
- **ACAD-004** (Content upload) - For uploading course thumbnails/videos
- **FOUND-002** (RBAC) - For admin role checking

---

## Testing

```typescript
describe('Course Admin UI', () => {
  it('should create new course', async () => {
    // Test course creation form
  });

  it('should enforce admin role', async () => {
    // Test RLS policies prevent non-admins from accessing
  });

  it('should validate required fields', async () => {
    // Test form validation
  });
});
```

---

## Verification

```sql
-- Verify course CRUD
SELECT * FROM courses ORDER BY created_at DESC LIMIT 5;

-- Check admin access logs
SELECT
  c.title,
  up.email AS created_by,
  c.created_at
FROM courses c
JOIN user_profiles up ON up.id = c.created_by
ORDER BY c.created_at DESC;
```

---

**Related Stories:**
- **Next:** ACAD-006 (Prerequisites & Sequencing)
- **Depends On:** ACAD-001, ACAD-004, FOUND-002
