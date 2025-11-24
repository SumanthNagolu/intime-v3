# ACAD-021: Course Navigation

**Status:** ✅ Complete

**Story Points:** 4
**Sprint:** Sprint 4 (Week 11-12)
**Priority:** HIGH
**Completed:** 2025-11-21

---

## User Story

As a **Student**,
I want **Module tree, topic breadcrumbs, progress indicators**,
So that **I can track my learning journey and achieve my goals**.

---

## Acceptance Criteria

- [x] Sidebar module tree (collapsible)
- [x] Topic list with completion icons
- [x] Breadcrumb navigation
- [x] Next/Previous topic buttons
- [x] Locked/unlocked visual indicators
- [x] Progress bar per module
- [x] Jump to any unlocked topic
- [x] Mobile drawer navigation

---

## Implementation

```typescript
export function CourseNavigation({ courseId, currentTopicId }: Props) {
  const { data: modules } = trpc.courses.getModules.useQuery({ courseId });

  return (
    <nav className="course-nav">
      {modules?.map(module => (
        <div key={module.id}>
          <h3>{module.title}</h3>
          <ul>
            {module.topics.map(topic => (
              <li key={topic.id} className={topic.isUnlocked ? '' : 'locked'}>
                <Link href={`/courses/${courseId}/topics/${topic.id}`}>
                  {topic.isCompleted && <Check />}
                  {!topic.isUnlocked && <Lock />}
                  {topic.title}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </nav>
  );
}
```

---

## Implementation Summary

### Backend (tRPC Router Endpoints)

**File:** `src/server/trpc/routers/courses.ts`

Added two new endpoints:

1. **`getCourseWithProgress`** - Returns course structure with student progress
   - Input: `courseId`, optional `enrollmentId`
   - Returns: Course with modules and topics, each marked with:
     - `is_completed` - Topic completion status
     - `is_unlocked` - Topic lock status based on prerequisites
     - `completion_data` - XP earned, time spent
     - `progress_percentage` - Per-module progress

2. **`getAdjacentTopics`** - Returns previous and next topics for navigation
   - Input: `courseId`, `currentTopicId`
   - Returns: `previous` and `next` topic objects with unlock status

### Frontend Components

**1. CourseNavigation** (`src/components/academy/CourseNavigation.tsx`)
- Collapsible module tree
- Topic list with status icons (completed, locked, in progress)
- Content type icons (video, reading, quiz, lab, project)
- Progress bar per module
- Click to jump to unlocked topics
- Visual indicators for locked content

**2. CourseBreadcrumb** (`src/components/academy/CourseBreadcrumb.tsx`)
- Shows navigation path: Home > Course > Module > Topic
- Clickable links for parent pages
- Current page highlighted

**3. TopicNavigation** (`src/components/academy/TopicNavigation.tsx`)
- Previous topic button (always enabled if exists)
- Next topic button (disabled if locked)
- Shows topic titles
- Lock icon for locked topics

**4. MobileCourseNav** (`src/components/academy/MobileCourseNav.tsx`)
- Desktop: Fixed sidebar on left (320px wide)
- Mobile: Floating button + drawer/sheet
- Responsive breakpoint: `lg` (1024px)

### Page Integration

**File:** `src/app/students/courses/[courseId]/modules/[moduleId]/topics/[topicId]/page.tsx`

Enhanced with:
- `MobileCourseNav` - Sidebar/drawer navigation
- `CourseBreadcrumb` - Navigation path
- `TopicNavigation` - Next/Previous buttons
- Server-side tRPC calls for navigation data

### Key Features

✅ **Sequential Learning Enforcement**
- Topics locked by prerequisites
- Must complete prerequisite topics to unlock next ones
- Visual lock icons on unavailable content

✅ **Progress Tracking**
- Per-module progress bars
- Completed topics marked with checkmark
- XP earned displayed

✅ **Responsive Design**
- Desktop: Persistent sidebar
- Mobile: Drawer accessible via floating button
- Breadcrumbs truncate on small screens

✅ **Performance**
- Server-side rendering
- Parallel data fetching with Promise.all
- Efficient database queries with Supabase joins

---

**Dependencies:** ACAD-001, ACAD-003, ACAD-006
**Next:** ACAD-022 (Graduation Workflow)
