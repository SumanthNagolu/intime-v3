---
date: 2025-12-08T14:37:36-05:00
researcher: Claude
git_commit: bfba1ba
branch: main
repository: intime-v3
topic: "Restoring the Archived Academy Portal"
tags: [research, codebase, academy, portal, training, lms]
status: complete
last_updated: 2025-12-08
last_updated_by: Claude
---

# Research: Restoring the Archived Academy Portal

**Date**: 2025-12-08T14:37:36-05:00
**Researcher**: Claude
**Git Commit**: bfba1ba
**Branch**: main
**Repository**: intime-v3

## Research Question

Understand how the academy portal system works and identify all files and line numbers relevant to restoring the archived academy portal.

## Summary

The academy portal was fully implemented (27/30 user stories) in November 2025 and then entirely removed in December 2025 during a codebase cleanup. The database schema remains intact in migrations, marketing pages still exist, and complete screen definitions are preserved in `.archive/ui-reference/`. Restoring the portal requires understanding three layers: database schema (intact), archived UI components/screens, and the navigation/routing system.

## Detailed Findings

### 1. What Was Deleted (Git History)

The academy portal was implemented in commit `762ba3a` (November 21, 2025) and deleted in commits `3f1cd4e`, `9bb65b6`, `84afac4`, `85842a8` (December 3-4, 2025).

**Deleted Application Routes:**
- `src/app/academy/page.tsx` - Main landing page
- `src/app/academy/dashboard/page.tsx` - Student dashboard
- `src/app/academy/modules/page.tsx` - Course modules listing
- `src/app/academy/lesson/[moduleId]/[lessonId]/page.tsx` - Lesson viewer
- `src/app/academy/portal/page.tsx` - Portal entry
- `src/app/academy/profile/page.tsx` - Student profile
- `src/app/academy/assistant/page.tsx` - AI mentor
- `src/app/academy/blueprint/page.tsx` - Learning path
- `src/app/academy/dojo/page.tsx` - Interview practice
- `src/app/academy/identity/page.tsx` - Biometric features
- `src/app/academy/studio/page.tsx` - Content studio
- `src/app/academy/notifications/page.tsx` - Notifications
- `src/app/auth/academy/page.tsx` - Academy auth

**Deleted Admin Routes:**
- `src/app/employee/academy/admin/certificates/page.tsx`
- `src/app/employee/academy/admin/cohorts/page.tsx`
- `src/app/employee/academy/admin/cohorts/[id]/page.tsx`
- `src/app/employee/academy/admin/students/page.tsx`

**Deleted Server Actions:**
- `src/app/actions/academy.ts`
- `src/app/actions/academy-courses.ts`
- `src/app/actions/academy-enrollments.ts`
- `src/app/actions/academy-progress.ts`

**Deleted Components (22 files in `src/components/academy/`):**
- `AcademyDashboard.tsx`, `AcademyLayout.tsx`, `AcademyModals.tsx`
- `AcademyModules.tsx`, `AcademyPortal.tsx`, `BiometricBackground.tsx`
- `CandidateDashboard.tsx`, `CertificateGenerator.tsx`, `CertificateManager.tsx`
- `CertificateVerification.tsx`, `CohortDetail.tsx`, `CohortsList.tsx`
- `InstructorDashboard.tsx`, `InterviewDojo.tsx`, `ScheduleSessionModal.tsx`
- `StreakFlame.tsx`, `StudentDemoPage.tsx`, `StudentInstructorView.tsx`
- `XPProgress.tsx`, `index.ts`

**Deleted Library Code:**
- `src/lib/academy/biometric.ts` - Biometric features
- `src/lib/academy/constants.ts` - Constants
- `src/lib/academy/gamification.ts` - Gamification system
- `src/lib/academy/queries.ts` - Database queries
- `src/lib/academy/types.ts` - TypeScript types
- `src/lib/academy/unlock-checker.ts` - Prerequisite checker
- `src/lib/db/schema/academy.ts` - Drizzle ORM schema
- `src/lib/store/academy-store.ts` - Zustand store
- `src/types/academy.ts` - Type definitions
- `src/server/trpc/routers/academy.ts` - tRPC router

### 2. What Still Exists

#### Database Migrations (Intact)
Location: `supabase/migrations/`

| File | Description |
|------|-------------|
| `20251121000000_create_academy_courses.sql` | Core tables: courses, course_modules |
| `20251121010000_create_student_enrollments.sql` | Student enrollments |
| `20251121020000_create_progress_tracking.sql` | Progress tracking |
| `20251121030000_create_content_assets.sql` | Content assets |
| `20251121040000_create_prerequisite_views.sql` | Prerequisites |
| `20251121050000_create_video_progress.sql` | Video progress |
| `20251121060000_create_lab_environments.sql` | Lab environments |
| `20251121070000_create_reading_progress.sql` | Reading progress |
| `20251121080000_create_quiz_system.sql` | Quiz system |
| `20251121090000_create_capstone_system.sql` | Capstone projects |
| `20251121100000_create_ai_mentor_system.sql` | AI mentor |
| `20251121110000_create_escalation_system.sql` | Support escalation |
| `20251121120000_create_ai_analytics_enhancements.sql` | AI analytics |
| `20251121130000_create_achievement_system.sql` | Achievements/badges |
| `20251121130001_seed_badges.sql` | Badge seed data |
| `20251121150000_create_leaderboards.sql` | Leaderboards |
| `20251121160000_create_pricing_tiers.sql` | Course pricing |
| `20251121170000_create_revenue_analytics.sql` | Revenue analytics |
| `20251121180000_create_student_interventions.sql` | Interventions |
| `20251201010003_academy_with_enums.sql` | Learning paths |

#### Seed Data
- `supabase/seeds/021_academy_courses_seed.sql`

#### Marketing Component (Active)
- `src/components/marketing/AcademyLanding.tsx:1-800` - Full marketing page with course categories, testimonials, enrollment CTA

#### Auth Type Definition
- `src/lib/auth/client.ts:6` - PortalType includes 'academy'

### 3. Archived Screen Definitions

Location: `.archive/ui-reference/screens/portals/academy/`

| File | Screen ID | Type | Description |
|------|-----------|------|-------------|
| `academy-dashboard.screen.ts:11-242` | `academy-dashboard` | dashboard | Mission Control with XP, streaks, courses, achievements |
| `academy-courses-catalog.screen.ts:9-24` | `academy-courses-catalog` | list | Course catalog with filters |
| `academy-course-detail.screen.ts` | `academy-course-detail` | detail | Individual course details |
| `academy-lesson-view.screen.ts` | `academy-lesson-view` | detail | Lesson viewer |
| `academy-my-learning.screen.ts` | `academy-my-learning` | list | Student's enrolled courses |
| `academy-certificates.screen.ts` | `academy-certificates` | list | Certificates list |
| `academy-achievements.screen.ts` | `academy-achievements` | list | Achievements/badges |
| `index.ts:1-14` | - | - | Screen exports |

**Screen Registry** (`.archive/ui-reference/screens/portals/index.ts:96-104`):
```typescript
export const academyPortalScreens = {
  dashboard: 'academy-dashboard',
  coursesCatalog: 'academy-courses-catalog',
  courseDetail: 'academy-course-detail',
  lessonView: 'academy-lesson-view',
  myLearning: 'academy-my-learning',
  certificates: 'academy-certificates',
  achievements: 'academy-achievements',
}
```

### 4. Archived Layout Component

Location: `.archive/ui-reference/layouts/AcademyLayout.tsx:1-138`

Navigation sections defined at lines 32-51:
```typescript
const academySections: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Console', href: '/employee/academy/dashboard', icon: LayoutDashboard },
      { id: 'learning', label: 'My Learning', href: '/employee/academy/learning', icon: BookOpen },
    ],
  },
  {
    id: 'management',
    label: 'Management',
    items: [
      { id: 'cohorts', label: 'Cohorts', href: '/employee/academy/cohorts', icon: GraduationCap },
      { id: 'students', label: 'Students', href: '/employee/academy/students', icon: Users },
      { id: 'certificates', label: 'Certificates', href: '/employee/academy/certificates', icon: Award },
      { id: 'courses', label: 'Course Builder', href: '/employee/academy/courses', icon: PenTool },
    ],
  },
]
```

### 5. Archived Navigation Configuration

Location: `.archive/ui-reference/navigation/navConfig.ts:1270-1345`

**Academy Navigation** (lines 1270-1288):
```typescript
export const academyNav: NavSection[] = [
  {
    id: 'main',
    label: 'Main',
    items: [
      { id: 'dashboard', label: 'Dashboard', href: '/training/dashboard' },
      { id: 'my-learning', label: 'My Learning', href: '/training/my-learning' },
    ],
  },
  {
    id: 'courses',
    label: 'Courses',
    items: [
      { id: 'catalog', label: 'Catalog', href: '/training/courses' },
      { id: 'certificates', label: 'Certificates', href: '/training/certificates' },
      { id: 'achievements', label: 'Achievements', href: '/training/achievements' },
    ],
  },
]
```

**Portal Navigation Getter** (lines 1334-1345):
```typescript
export function getPortalNavigation(portal: 'client' | 'talent' | 'academy'): NavSection[]
```

### 6. Portal Route Patterns

Based on how client/talent portals are structured in archived reference:

**Expected Academy Routes (Student-Facing):**
- `/training` or `/academy` - Dashboard
- `/training/courses` - Course catalog
- `/training/courses/[id]` - Course detail
- `/training/courses/[id]/lessons/[lessonId]` - Lesson viewer
- `/training/my-learning` - Enrolled courses
- `/training/certificates` - Certificates
- `/training/achievements` - Achievements/badges

**Expected Admin Routes (Employee-Facing):**
- `/employee/academy/dashboard` - Admin dashboard
- `/employee/academy/cohorts` - Cohort management
- `/employee/academy/students` - Student management
- `/employee/academy/certificates` - Certificate management
- `/employee/academy/courses` - Course builder

### 7. tRPC Procedure Patterns

Based on archived screen definitions, expected procedures:

**Student Portal (`portal.academy.*`):**
- `portal.academy.getProgressSummary` - Learning progress
- `portal.academy.getActiveCourses` - In-progress courses
- `portal.academy.getRecommendedCourses` - Recommendations
- `portal.academy.getRecentAchievements` - Badges/achievements
- `portal.academy.getLeaderboard` - XP leaderboard
- `portal.academy.getCourses` - Course catalog

**Dashboard Data Source** (academy-dashboard.screen.ts:18-27):
```typescript
dataSource: {
  type: 'aggregate',
  queries: [
    { key: 'progress', procedure: 'portal.academy.getProgressSummary' },
    { key: 'activeCourses', procedure: 'portal.academy.getActiveCourses' },
    { key: 'recommended', procedure: 'portal.academy.getRecommendedCourses' },
    { key: 'achievements', procedure: 'portal.academy.getRecentAchievements' },
    { key: 'leaderboard', procedure: 'portal.academy.getLeaderboard' },
  ],
}
```

### 8. Custom Components Required

Based on archived screen definitions, these custom components are referenced:

**Dashboard Widgets:**
- `AcademyProgressHero` - Readiness score, XP, streak, rank
- `ActiveCoursesCarousel` - In-progress courses with progress bars
- `AchievementsBadges` - Badge/achievement display
- `CourseCardsGrid` - Course cards with difficulty, duration, XP
- `LeaderboardWidget` - Top users with XP and rank

**Catalog/List Widgets:**
- `CourseCardsList` - Course listing in catalog
- `CourseSortOptions` - Sort/filter controls

**Detail/Lesson Widgets:**
- `LessonViewer` - Video/reading/quiz content viewer
- `ProgressIndicator` - Module/lesson progress

### 9. Key Database Tables

From migrations, the core schema includes:

**Course Structure:**
- `courses` - Course catalog with pricing, prerequisites
- `course_modules` - Modules within courses
- `module_topics` - Topics within modules
- `topic_lessons` - Individual lessons (video, reading, quiz, lab)

**Student Data:**
- `student_enrollments` - Course enrollments
- `video_progress` - Video watch progress
- `reading_progress` - Reading completion
- `quiz_attempts` - Quiz results
- `lab_submissions` - Lab completions
- `capstone_submissions` - Project submissions

**Gamification:**
- `student_xp` - XP balance
- `student_badges` - Earned badges
- `leaderboard_entries` - Leaderboard positions
- `student_streaks` - Learning streaks

### 10. Marketing References

The marketing site has active links to the academy:

- `src/components/marketing/AcademyLanding.tsx:1-800` - Full landing page
- `src/components/marketing/TrainingPage.tsx:69,222,315,320,529,693,719,726,728-730` - Academy links
- `src/components/marketing/LandingPage.tsx:209,214,319,321,336,595,680` - Academy features
- `src/components/marketing/templates/Footer.tsx:24` - Training Academy link
- `src/components/marketing/templates/MarketingNavbar.tsx:68,247,300,303,404,408` - Academy nav

## Code References

### Archived Screen Definitions
- `.archive/ui-reference/screens/portals/academy/index.ts:1-14` - Screen exports
- `.archive/ui-reference/screens/portals/academy/academy-dashboard.screen.ts:11-242` - Dashboard
- `.archive/ui-reference/screens/portals/academy/academy-courses-catalog.screen.ts:9-24` - Catalog
- `.archive/ui-reference/screens/portals/index.ts:96-104` - Academy screen registry

### Archived Layout
- `.archive/ui-reference/layouts/AcademyLayout.tsx:32-51` - Navigation sections
- `.archive/ui-reference/layouts/AcademyLayout.tsx:57-138` - Layout component

### Archived Navigation
- `.archive/ui-reference/navigation/navConfig.ts:1270-1288` - Academy nav config
- `.archive/ui-reference/navigation/navConfig.ts:1334-1345` - Portal nav getter

### Active Database Migrations
- `supabase/migrations/20251121000000_create_academy_courses.sql` - Core tables
- `supabase/migrations/20251121080000_create_quiz_system.sql` - Quiz system
- `supabase/migrations/20251121130000_create_achievement_system.sql` - Achievements

### Active Marketing
- `src/components/marketing/AcademyLanding.tsx:1-800` - Landing page

### Active Auth Type
- `src/lib/auth/client.ts:6` - PortalType includes 'academy'

## Architecture Documentation

### Portal System Pattern

All portals (client, talent, academy) follow the same metadata-driven architecture:

1. **Screen Definitions**: Declarative JSON-like TypeScript objects defining:
   - Layout (single-column, sidebar-main, tabs)
   - Data sources (tRPC procedures)
   - Sections (info-cards, tables, forms, custom components)
   - Actions (navigate, modal, mutation)
   - Navigation (breadcrumbs)

2. **Rendering Pipeline**:
   ```
   ScreenDefinition → ScreenPage → ScreenRenderer → LayoutRenderer → SectionRenderer → WidgetRenderer
   ```

3. **Data Flow**:
   - Screen defines `dataSource.queries` with tRPC procedure names
   - `ScreenPage` component fetches data
   - Data passed to `ScreenRenderer` as `entity` prop
   - Sections reference data via `{ type: 'field', path: 'data.fieldName' }`

### Navigation System

The navigation system supports:
- Role-based navigation configs per user type
- Entity-aware context (current entity, recent entities)
- Two navigation styles: journey (sequential) and sections (all-access)
- Sidebar layouts with collapsible sections

### Portal Authentication

Portal type is defined in `src/lib/auth/client.ts:6`:
```typescript
type PortalType = 'employee' | 'client' | 'talent' | 'academy'
```

## Historical Context (from thoughts/)

No existing documentation found in the thoughts/ directory about the academy portal.

## Related Research

No previous research documents exist for the academy portal.

## Open Questions

1. **Route Structure**: Should student-facing portal use `/training/*` or `/academy/*`?
2. **Component Recovery**: Can deleted components be recovered from git history, or rebuild from scratch using archived screen definitions?
3. **tRPC Router**: Needs to be rebuilt - what procedures are essential for MVP?
4. **Drizzle Schema**: Was deleted - needs to be recreated from migrations
5. **Custom Components**: Which custom widgets (AcademyProgressHero, etc.) need to be rebuilt?
