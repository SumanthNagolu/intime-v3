# Academy Portal Restoration Implementation Plan

## Overview

Restore the archived Academy Portal, a gamified learning management system for IT staffing training. The portal was fully implemented (27/30 user stories) in November 2025 and removed during December 2025 cleanup. Database schema remains intact; we need to restore routes, components, tRPC procedures, and navigation.

## Current State Analysis

### What Exists:
- **Database migrations** (19 files in `supabase/migrations/20251121*.sql`) - Schema is intact
- **Seed data** (`supabase/seeds/021_academy_courses_seed.sql`)
- **Marketing pages** (`src/components/marketing/AcademyLanding.tsx`)
- **Auth type** (`src/lib/auth/client.ts:6`) - PortalType includes 'academy'
- **Archived screen definitions** (7 screens in `.archive/ui-reference/screens/portals/academy/`)
- **Archived layout** (`.archive/ui-reference/layouts/AcademyLayout.tsx`)

### What Needs to be Restored:
- Student portal routes (`/training/*`)
- Admin portal routes (`/employee/academy/*`)
- tRPC academy router with procedures
- Navigation configuration
- Portal layout component
- Dashboard and content components

### Key Discoveries:
- Current `SidebarLayout` uses `SectionSidebar` with auto-detection from path (`src/components/navigation/SectionSidebar.tsx:292-302`)
- Admin layouts use simple pattern: layout imports nav config, wraps children in SidebarLayout (`src/app/employee/admin/layout.tsx:1-14`)
- Screen definitions reference `portal.academy.*` tRPC procedures for data

## Desired End State

After implementation:
1. Students can access training portal at `/training/` with dashboard, courses, certificates
2. Admins can manage academy at `/employee/academy/` with cohorts, students, certificates, courses
3. Both portals have functional navigation and data fetching via tRPC
4. Marketing pages link to working portal

### Verification:
- Navigate to `/training/dashboard` and see student dashboard
- Navigate to `/employee/academy/dashboard` and see admin dashboard
- Course catalog displays seed data courses
- tRPC procedures return data from academy tables

## What We're NOT Doing

- Full metadata-driven rendering system (using direct React components for MVP)
- Advanced gamification features (XP calculations, leaderboards) - placeholder data
- AI mentor system
- Video progress tracking
- Lab environments
- Quiz system (beyond basic structure)
- Certificate PDF generation

## Implementation Approach

Two parallel tracks:
1. **Student Portal** (`/training/*`) - External-facing with PortalLayout
2. **Admin Portal** (`/employee/academy/*`) - Internal with SidebarLayout

Both share the same tRPC router for data.

---

## Phase 1: Foundation - tRPC Router & Types

### Overview
Create the academy tRPC router with procedures for both student and admin portals.

### Changes Required:

#### 1.1 Create Academy Types

**File**: `src/types/academy.ts`
**Changes**: Create TypeScript types for academy entities

```typescript
// Core course types
export interface Course {
  id: string
  title: string
  description: string
  difficulty: 'beginner' | 'intermediate' | 'advanced'
  duration_hours: number
  xp_reward: number
  thumbnail_url?: string
  is_published: boolean
  created_at: string
}

export interface CourseModule {
  id: string
  course_id: string
  title: string
  description?: string
  order_index: number
  xp_reward: number
}

export interface StudentEnrollment {
  id: string
  student_id: string
  course_id: string
  enrolled_at: string
  completed_at?: string
  progress_percent: number
}

export interface StudentProgress {
  readinessScore: number
  totalXP: number
  streakDays: number
  certificateCount: number
  coursesInProgress: number
  coursesCompleted: number
}

export interface Achievement {
  id: string
  name: string
  description: string
  badge_icon: string
  xp_reward: number
  earned_at?: string
}
```

#### 1.2 Create Academy tRPC Router

**File**: `src/server/routers/academy.ts`
**Changes**: Create router with student and admin procedures

```typescript
import { router, orgProtectedProcedure } from '../trpc/init'
import { z } from 'zod'
import { getAdminClient } from '@/lib/supabase/admin'

export const academyRouter = router({
  // Student Portal Procedures
  getProgressSummary: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { orgId, user } = ctx

    // Query student progress from academy tables
    // For MVP, return placeholder data
    return {
      readinessScore: 75,
      totalXP: 1250,
      streakDays: 7,
      certificateCount: 2,
      coursesInProgress: 3,
      coursesCompleted: 5,
      recentlyCompleted: [],
    }
  }),

  getActiveCourses: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { orgId, user } = ctx

    const { data: enrollments } = await adminClient
      .from('student_enrollments')
      .select(`
        id,
        progress_percent,
        enrolled_at,
        courses (
          id,
          title,
          description,
          difficulty,
          duration_hours,
          xp_reward,
          thumbnail_url
        )
      `)
      .eq('student_id', user?.id)
      .is('completed_at', null)
      .limit(10)

    return enrollments || []
  }),

  getCourses: orgProtectedProcedure
    .input(z.object({
      difficulty: z.enum(['beginner', 'intermediate', 'advanced']).optional(),
      search: z.string().optional(),
      limit: z.number().default(20),
      offset: z.number().default(0),
    }).optional())
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      let query = adminClient
        .from('courses')
        .select('*', { count: 'exact' })
        .eq('org_id', orgId)
        .eq('is_published', true)

      if (input?.difficulty) {
        query = query.eq('difficulty', input.difficulty)
      }
      if (input?.search) {
        query = query.ilike('title', `%${input.search}%`)
      }

      const { data, count } = await query
        .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 20) - 1)
        .order('created_at', { ascending: false })

      return { courses: data || [], total: count || 0 }
    }),

  getCourseById: orgProtectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      const adminClient = getAdminClient()

      const { data: course } = await adminClient
        .from('courses')
        .select(`
          *,
          course_modules (
            id,
            title,
            description,
            order_index,
            xp_reward
          )
        `)
        .eq('id', input.id)
        .single()

      return course
    }),

  getRecentAchievements: orgProtectedProcedure.query(async ({ ctx }) => {
    // For MVP, return placeholder achievements
    return [
      { id: '1', name: 'First Course', description: 'Complete your first course', badge_icon: '🎓', xp_reward: 100, earned_at: new Date().toISOString() },
      { id: '2', name: 'Week Streak', description: 'Learn for 7 days in a row', badge_icon: '🔥', xp_reward: 50, earned_at: new Date().toISOString() },
    ]
  }),

  getCertificates: orgProtectedProcedure.query(async ({ ctx }) => {
    const adminClient = getAdminClient()
    const { user } = ctx

    const { data } = await adminClient
      .from('student_certificates')
      .select(`
        id,
        issued_at,
        certificate_number,
        courses (
          id,
          title
        )
      `)
      .eq('student_id', user?.id)
      .order('issued_at', { ascending: false })

    return data || []
  }),

  // Admin Portal Procedures
  admin: router({
    getDashboardStats: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const [coursesResult, enrollmentsResult, certificatesResult] = await Promise.all([
        adminClient.from('courses').select('id', { count: 'exact' }).eq('org_id', orgId),
        adminClient.from('student_enrollments').select('id', { count: 'exact' }),
        adminClient.from('student_certificates').select('id', { count: 'exact' }),
      ])

      return {
        totalCourses: coursesResult.count || 0,
        activeEnrollments: enrollmentsResult.count || 0,
        certificatesIssued: certificatesResult.count || 0,
        activeStudents: 0, // Would need distinct count
      }
    }),

    getCohorts: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const { data } = await adminClient
        .from('cohorts')
        .select('*')
        .eq('org_id', orgId)
        .order('start_date', { ascending: false })

      return data || []
    }),

    getStudents: orgProtectedProcedure
      .input(z.object({
        cohortId: z.string().optional(),
        limit: z.number().default(50),
        offset: z.number().default(0),
      }).optional())
      .query(async ({ ctx, input }) => {
        const adminClient = getAdminClient()
        const { orgId } = ctx

        // Query students with their progress
        // For MVP, return basic user data with enrollment info
        const { data, count } = await adminClient
          .from('student_enrollments')
          .select(`
            student_id,
            users!student_enrollments_student_id_fkey (
              id,
              email,
              full_name
            ),
            courses (
              title
            ),
            progress_percent,
            enrolled_at
          `, { count: 'exact' })
          .range(input?.offset || 0, (input?.offset || 0) + (input?.limit || 50) - 1)

        return { students: data || [], total: count || 0 }
      }),

    getAllCourses: orgProtectedProcedure.query(async ({ ctx }) => {
      const adminClient = getAdminClient()
      const { orgId } = ctx

      const { data } = await adminClient
        .from('courses')
        .select('*')
        .eq('org_id', orgId)
        .order('created_at', { ascending: false })

      return data || []
    }),
  }),
})
```

#### 1.3 Register Academy Router

**File**: `src/server/trpc/root.ts`
**Changes**: Add academy router to app router

```typescript
// Add import at top
import { academyRouter } from '../routers/academy'

// Add to router object
export const appRouter = router({
  // ... existing routers
  academy: academyRouter,
})
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] No linting errors: `pnpm lint`
- [ ] Server starts successfully: `pnpm dev`

#### Manual Verification:
- [ ] tRPC procedures are accessible via React Query hooks
- [ ] `trpc.academy.getCourses.useQuery()` returns data

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 2: Student Portal - Layout & Navigation

### Overview
Create the student-facing portal at `/training/*` with its own layout and navigation.

### Changes Required:

#### 2.1 Create Training Portal Layout

**File**: `src/app/training/layout.tsx`
**Changes**: Create portal layout with sidebar navigation

```typescript
'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  BookOpen,
  GraduationCap,
  Award,
  Trophy,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

const navItems = [
  { id: 'dashboard', label: 'Dashboard', href: '/training/dashboard', icon: LayoutDashboard },
  { id: 'my-learning', label: 'My Learning', href: '/training/my-learning', icon: BookOpen },
  { id: 'courses', label: 'Course Catalog', href: '/training/courses', icon: GraduationCap },
  { id: 'certificates', label: 'Certificates', href: '/training/certificates', icon: Award },
  { id: 'achievements', label: 'Achievements', href: '/training/achievements', icon: Trophy },
]

export default function TrainingLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-cream">
      {/* Top Header */}
      <header className="h-16 bg-white border-b border-charcoal-100 flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <GraduationCap className="w-8 h-8 text-gold-500" />
          <div>
            <h1 className="font-heading font-bold text-charcoal-900">InTime Academy</h1>
            <p className="text-xs text-charcoal-500">Training Portal</p>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/employee/workspace/dashboard">
              <LogOut className="w-4 h-4 mr-2" />
              Back to Workspace
            </Link>
          </Button>
        </div>
      </header>

      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r border-charcoal-100 min-h-[calc(100vh-64px)] flex-shrink-0">
          <nav className="p-4 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = pathname === item.href || pathname.startsWith(item.href + '/')
              return (
                <Link
                  key={item.id}
                  href={item.href}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-300',
                    isActive
                      ? 'bg-gold-50 text-gold-700 font-medium border-l-2 border-gold-500'
                      : 'text-charcoal-600 hover:bg-charcoal-50 hover:text-charcoal-900'
                  )}
                >
                  <Icon className="w-5 h-5" />
                  <span>{item.label}</span>
                </Link>
              )
            })}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  )
}
```

#### 2.2 Create Training Dashboard Page

**File**: `src/app/training/dashboard/page.tsx`
**Changes**: Create student dashboard with progress overview

```typescript
'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import {
  Target,
  Star,
  Zap,
  Award,
  BookOpen,
  ArrowRight,
} from 'lucide-react'

export default function TrainingDashboard() {
  const { data: progress, isLoading: progressLoading } = trpc.academy.getProgressSummary.useQuery()
  const { data: activeCourses, isLoading: coursesLoading } = trpc.academy.getActiveCourses.useQuery()
  const { data: achievements, isLoading: achievementsLoading } = trpc.academy.getRecentAchievements.useQuery()

  return (
    <div className="space-y-6">
      {/* Welcome Header */}
      <div className="bg-gradient-to-r from-hublot-900 to-charcoal-800 rounded-lg p-6 text-white">
        <h1 className="font-heading text-2xl font-bold mb-2">Mission Control</h1>
        <p className="text-white/80">Welcome back! Continue your learning journey.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Readiness Score"
          value={progressLoading ? null : `${progress?.readinessScore || 0}%`}
          icon={Target}
          color="green"
        />
        <StatCard
          label="Total XP"
          value={progressLoading ? null : progress?.totalXP?.toLocaleString()}
          icon={Star}
          color="gold"
        />
        <StatCard
          label="Day Streak"
          value={progressLoading ? null : progress?.streakDays}
          icon={Zap}
          color="orange"
        />
        <StatCard
          label="Certificates"
          value={progressLoading ? null : progress?.certificateCount}
          icon={Award}
          color="purple"
        />
      </div>

      {/* Active Courses */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Continue Learning</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/training/my-learning">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {coursesLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-20 w-full" />
              ))}
            </div>
          ) : activeCourses && activeCourses.length > 0 ? (
            <div className="space-y-4">
              {activeCourses.slice(0, 3).map((enrollment: any) => (
                <div
                  key={enrollment.id}
                  className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-lg"
                >
                  <BookOpen className="w-10 h-10 text-gold-500" />
                  <div className="flex-1">
                    <h4 className="font-medium text-charcoal-900">
                      {enrollment.courses?.title || 'Course'}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 h-2 bg-charcoal-200 rounded-full">
                        <div
                          className="h-full bg-gold-500 rounded-full"
                          style={{ width: `${enrollment.progress_percent || 0}%` }}
                        />
                      </div>
                      <span className="text-sm text-charcoal-500">
                        {enrollment.progress_percent || 0}%
                      </span>
                    </div>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/training/courses/${enrollment.courses?.id}`}>
                      Continue
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <BookOpen className="w-12 h-12 text-charcoal-300 mx-auto mb-3" />
              <p className="text-charcoal-500 mb-4">No courses in progress</p>
              <Button asChild>
                <Link href="/training/courses">Browse Courses</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Achievements */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="font-heading">Recent Achievements</CardTitle>
          <Button variant="ghost" size="sm" asChild>
            <Link href="/training/achievements">
              View All <ArrowRight className="w-4 h-4 ml-1" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {achievementsLoading ? (
            <div className="flex gap-4">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} className="h-24 w-24" />
              ))}
            </div>
          ) : achievements && achievements.length > 0 ? (
            <div className="flex gap-4 flex-wrap">
              {achievements.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-4 bg-charcoal-50 rounded-lg w-24"
                >
                  <span className="text-3xl mb-2">{achievement.badge_icon}</span>
                  <span className="text-xs text-center text-charcoal-700 font-medium">
                    {achievement.name}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-charcoal-500">No achievements yet. Keep learning!</p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
  color,
}: {
  label: string
  value: string | number | null | undefined
  icon: React.ElementType
  color: string
}) {
  const colorClasses: Record<string, string> = {
    green: 'text-green-600 bg-green-50',
    gold: 'text-gold-600 bg-gold-50',
    orange: 'text-orange-600 bg-orange-50',
    purple: 'text-purple-600 bg-purple-50',
  }

  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className={cn('p-3 rounded-lg', colorClasses[color])}>
          <Icon className="w-6 h-6" />
        </div>
        <div>
          <p className="text-sm text-charcoal-500">{label}</p>
          {value === null ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-charcoal-900">{value}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 2.3 Create Training Portal Root Redirect

**File**: `src/app/training/page.tsx`
**Changes**: Redirect root to dashboard

```typescript
import { redirect } from 'next/navigation'

export default function TrainingPortalPage() {
  redirect('/training/dashboard')
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] No linting errors: `pnpm lint`
- [ ] Build succeeds: `pnpm build`

#### Manual Verification:
- [ ] Navigate to `/training` redirects to `/training/dashboard`
- [ ] Dashboard displays stat cards and sections
- [ ] Navigation sidebar works correctly
- [ ] Layout follows design system (gold accents, 300ms transitions)

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 3: Student Portal - Content Pages

### Overview
Create the remaining student portal pages: courses catalog, my learning, certificates, achievements.

### Changes Required:

#### 3.1 Create Course Catalog Page

**File**: `src/app/training/courses/page.tsx`
**Changes**: Course catalog with filters and search

```typescript
'use client'

import { useState } from 'react'
import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Search, Clock, Star, GraduationCap } from 'lucide-react'

const difficultyColors: Record<string, string> = {
  beginner: 'bg-green-100 text-green-700',
  intermediate: 'bg-yellow-100 text-yellow-700',
  advanced: 'bg-red-100 text-red-700',
}

export default function CourseCatalogPage() {
  const [search, setSearch] = useState('')
  const [difficulty, setDifficulty] = useState<string | undefined>()

  const { data, isLoading } = trpc.academy.getCourses.useQuery({
    search: search || undefined,
    difficulty: difficulty as any,
    limit: 20,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">Course Catalog</h1>
        <p className="text-charcoal-500 mt-1">Explore our training courses and start learning</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-charcoal-400" />
          <Input
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <div className="flex gap-2">
          <Button
            variant={difficulty === undefined ? 'default' : 'outline'}
            size="sm"
            onClick={() => setDifficulty(undefined)}
          >
            All Levels
          </Button>
          {['beginner', 'intermediate', 'advanced'].map((level) => (
            <Button
              key={level}
              variant={difficulty === level ? 'default' : 'outline'}
              size="sm"
              onClick={() => setDifficulty(level)}
            >
              {level.charAt(0).toUpperCase() + level.slice(1)}
            </Button>
          ))}
        </div>
      </div>

      {/* Course Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-64" />
          ))}
        </div>
      ) : data?.courses && data.courses.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data.courses.map((course: any) => (
            <Card key={course.id} className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
              <div className="h-32 bg-gradient-to-br from-hublot-900 to-charcoal-700 flex items-center justify-center">
                <GraduationCap className="w-12 h-12 text-white/50" />
              </div>
              <CardContent className="p-4">
                <Badge className={difficultyColors[course.difficulty] || 'bg-charcoal-100'}>
                  {course.difficulty}
                </Badge>
                <h3 className="font-heading font-bold text-lg mt-2 text-charcoal-900">
                  {course.title}
                </h3>
                <p className="text-sm text-charcoal-500 mt-1 line-clamp-2">
                  {course.description}
                </p>
                <div className="flex items-center justify-between mt-4 pt-4 border-t border-charcoal-100">
                  <div className="flex items-center gap-4 text-sm text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold-500" />
                      {course.xp_reward} XP
                    </span>
                  </div>
                  <Button size="sm" asChild>
                    <Link href={`/training/courses/${course.id}`}>View</Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <GraduationCap className="w-12 h-12 text-charcoal-300 mb-4" />
            <p className="text-charcoal-500">No courses found</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

#### 3.2 Create My Learning Page

**File**: `src/app/training/my-learning/page.tsx`
**Changes**: Display enrolled courses with progress

```typescript
'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { BookOpen, Clock, Star } from 'lucide-react'

export default function MyLearningPage() {
  const { data: activeCourses, isLoading } = trpc.academy.getActiveCourses.useQuery()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">My Learning</h1>
        <p className="text-charcoal-500 mt-1">Track your enrolled courses and progress</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-32" />
          ))}
        </div>
      ) : activeCourses && activeCourses.length > 0 ? (
        <div className="space-y-4">
          {activeCourses.map((enrollment: any) => (
            <Card key={enrollment.id}>
              <CardContent className="flex items-center gap-6 p-6">
                <div className="w-16 h-16 bg-gradient-to-br from-hublot-900 to-charcoal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-8 h-8 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-heading font-bold text-lg text-charcoal-900">
                    {enrollment.courses?.title || 'Course'}
                  </h3>
                  <p className="text-sm text-charcoal-500 mt-1 line-clamp-1">
                    {enrollment.courses?.description}
                  </p>
                  <div className="flex items-center gap-4 mt-3">
                    <div className="flex-1 max-w-xs">
                      <Progress value={enrollment.progress_percent || 0} className="h-2" />
                    </div>
                    <span className="text-sm font-medium text-charcoal-700">
                      {enrollment.progress_percent || 0}% complete
                    </span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <div className="flex items-center gap-3 text-sm text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {enrollment.courses?.duration_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4 text-gold-500" />
                      {enrollment.courses?.xp_reward} XP
                    </span>
                  </div>
                  <Button asChild>
                    <Link href={`/training/courses/${enrollment.courses?.id}`}>
                      Continue
                    </Link>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-charcoal-300 mb-4" />
            <p className="text-charcoal-500 mb-4">You haven't enrolled in any courses yet</p>
            <Button asChild>
              <Link href="/training/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

#### 3.3 Create Certificates Page

**File**: `src/app/training/certificates/page.tsx`
**Changes**: Display earned certificates

```typescript
'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Award, Download, Calendar } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { format } from 'date-fns'

export default function CertificatesPage() {
  const { data: certificates, isLoading } = trpc.academy.getCertificates.useQuery()

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">My Certificates</h1>
        <p className="text-charcoal-500 mt-1">View and download your earned certificates</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-40" />
          ))}
        </div>
      ) : certificates && certificates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {certificates.map((cert: any) => (
            <Card key={cert.id} className="overflow-hidden">
              <div className="h-2 bg-gradient-to-r from-gold-400 to-gold-600" />
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-gold-50 rounded-lg">
                    <Award className="w-8 h-8 text-gold-600" />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading font-bold text-lg text-charcoal-900">
                      {cert.courses?.title || 'Certificate'}
                    </h3>
                    <p className="text-sm text-charcoal-500 mt-1">
                      Certificate #{cert.certificate_number}
                    </p>
                    <div className="flex items-center gap-2 mt-2 text-sm text-charcoal-500">
                      <Calendar className="w-4 h-4" />
                      <span>Issued {format(new Date(cert.issued_at), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full mt-4">
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Award className="w-12 h-12 text-charcoal-300 mb-4" />
            <p className="text-charcoal-500">No certificates earned yet</p>
            <p className="text-sm text-charcoal-400 mt-1">Complete courses to earn certificates</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

#### 3.4 Create Achievements Page

**File**: `src/app/training/achievements/page.tsx`
**Changes**: Display badges and achievements

```typescript
'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Trophy, Lock } from 'lucide-react'

export default function AchievementsPage() {
  const { data: achievements, isLoading } = trpc.academy.getRecentAchievements.useQuery()

  // Placeholder for locked achievements
  const lockedAchievements = [
    { id: 'l1', name: 'Speed Learner', description: 'Complete 5 courses in one month', badge_icon: '⚡' },
    { id: 'l2', name: 'Perfect Score', description: 'Get 100% on any quiz', badge_icon: '💯' },
    { id: 'l3', name: 'Night Owl', description: 'Study after midnight', badge_icon: '🦉' },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">Achievements</h1>
        <p className="text-charcoal-500 mt-1">Track your badges and milestones</p>
      </div>

      {/* Earned Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Trophy className="w-5 h-5 text-gold-500" />
            Earned
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-32" />
              ))}
            </div>
          ) : achievements && achievements.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {achievements.map((achievement: any) => (
                <div
                  key={achievement.id}
                  className="flex flex-col items-center p-4 bg-gold-50 rounded-lg border border-gold-200"
                >
                  <span className="text-4xl mb-2">{achievement.badge_icon}</span>
                  <span className="text-sm font-medium text-center text-charcoal-900">
                    {achievement.name}
                  </span>
                  <span className="text-xs text-charcoal-500 mt-1">
                    +{achievement.xp_reward} XP
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-charcoal-500 text-center py-8">
              No achievements earned yet. Keep learning!
            </p>
          )}
        </CardContent>
      </Card>

      {/* Locked Achievements */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading flex items-center gap-2">
            <Lock className="w-5 h-5 text-charcoal-400" />
            Locked
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {lockedAchievements.map((achievement) => (
              <div
                key={achievement.id}
                className="flex flex-col items-center p-4 bg-charcoal-50 rounded-lg border border-charcoal-200 opacity-60"
              >
                <span className="text-4xl mb-2 grayscale">{achievement.badge_icon}</span>
                <span className="text-sm font-medium text-center text-charcoal-700">
                  {achievement.name}
                </span>
                <span className="text-xs text-charcoal-500 mt-1 text-center">
                  {achievement.description}
                </span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
```

#### 3.5 Create Course Detail Page

**File**: `src/app/training/courses/[id]/page.tsx`
**Changes**: Course detail with modules list

```typescript
'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams } from 'next/navigation'
import { Clock, Star, BookOpen, PlayCircle, CheckCircle } from 'lucide-react'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string

  const { data: course, isLoading } = trpc.academy.getCourseById.useQuery({ id: courseId })

  if (isLoading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-32 w-full" />
        <Skeleton className="h-64 w-full" />
      </div>
    )
  }

  if (!course) {
    return (
      <Card>
        <CardContent className="py-12 text-center">
          <p className="text-charcoal-500">Course not found</p>
        </CardContent>
      </Card>
    )
  }

  const difficultyColors: Record<string, string> = {
    beginner: 'bg-green-100 text-green-700',
    intermediate: 'bg-yellow-100 text-yellow-700',
    advanced: 'bg-red-100 text-red-700',
  }

  return (
    <div className="space-y-6">
      {/* Course Header */}
      <div className="bg-gradient-to-r from-hublot-900 to-charcoal-800 rounded-lg p-8 text-white">
        <Badge className={difficultyColors[course.difficulty] || 'bg-charcoal-100'}>
          {course.difficulty}
        </Badge>
        <h1 className="font-heading text-3xl font-bold mt-4">{course.title}</h1>
        <p className="text-white/80 mt-2 max-w-2xl">{course.description}</p>
        <div className="flex items-center gap-6 mt-6">
          <span className="flex items-center gap-2">
            <Clock className="w-5 h-5" />
            {course.duration_hours} hours
          </span>
          <span className="flex items-center gap-2">
            <Star className="w-5 h-5 text-gold-400" />
            {course.xp_reward} XP
          </span>
          <span className="flex items-center gap-2">
            <BookOpen className="w-5 h-5" />
            {course.course_modules?.length || 0} modules
          </span>
        </div>
        <Button className="mt-6" size="lg">
          Start Learning
        </Button>
      </div>

      {/* Course Modules */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Course Content</CardTitle>
        </CardHeader>
        <CardContent>
          {course.course_modules && course.course_modules.length > 0 ? (
            <div className="space-y-2">
              {course.course_modules
                .sort((a: any, b: any) => a.order_index - b.order_index)
                .map((module: any, index: number) => (
                  <div
                    key={module.id}
                    className="flex items-center gap-4 p-4 bg-charcoal-50 rounded-lg hover:bg-charcoal-100 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-full bg-charcoal-200 flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-charcoal-900">{module.title}</h4>
                      {module.description && (
                        <p className="text-sm text-charcoal-500 mt-1">{module.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-charcoal-500">
                      <Star className="w-4 h-4 text-gold-500" />
                      {module.xp_reward} XP
                    </div>
                    <PlayCircle className="w-6 h-6 text-charcoal-400" />
                  </div>
                ))}
            </div>
          ) : (
            <p className="text-charcoal-500 text-center py-8">
              No modules available yet
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] No linting errors: `pnpm lint`
- [ ] Build succeeds: `pnpm build`

#### Manual Verification:
- [ ] Course catalog page loads with filters
- [ ] My Learning page shows enrolled courses
- [ ] Certificates page displays earned certificates
- [ ] Achievements page shows earned and locked achievements
- [ ] Course detail page shows modules

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 4: Admin Portal - Layout & Pages

### Overview
Create the admin-facing portal at `/employee/academy/*` for managing courses, students, cohorts.

### Changes Required:

#### 4.1 Add Academy Section to SectionSidebar

**File**: `src/components/navigation/SectionSidebar.tsx`
**Changes**: Add academy section configuration and path detection

Add to `sectionConfigs` object (around line 125):
```typescript
academy: {
  id: 'academy',
  title: 'Academy Admin',
  icon: GraduationCap,
  basePath: '/employee/academy',
  quickActions: [
    { id: 'new-course', label: 'New Course', icon: Plus, href: '/employee/academy/courses/new' },
  ],
  navLinks: [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard, href: '/employee/academy/dashboard' },
    { id: 'courses', label: 'Courses', icon: BookOpen, href: '/employee/academy/courses' },
    { id: 'students', label: 'Students', icon: Users, href: '/employee/academy/students' },
    { id: 'cohorts', label: 'Cohorts', icon: GraduationCap, href: '/employee/academy/cohorts' },
    { id: 'certificates', label: 'Certificates', icon: Award, href: '/employee/academy/certificates' },
  ],
},
```

Add to `detectSectionFromPath` function (around line 300):
```typescript
if (pathname.includes('/employee/academy')) return 'academy'
```

Add imports at top:
```typescript
import { GraduationCap, Award, BookOpen } from 'lucide-react'
```

#### 4.2 Create Academy Admin Layout

**File**: `src/app/employee/academy/layout.tsx`
**Changes**: Create layout using SidebarLayout

```typescript
'use client'

import { SidebarLayout } from '@/components/layouts/SidebarLayout'
import type { ReactNode } from 'react'

export default function AcademyAdminLayout({ children }: { children: ReactNode }) {
  return (
    <SidebarLayout sectionId="academy">
      {children}
    </SidebarLayout>
  )
}
```

#### 4.3 Create Academy Admin Dashboard

**File**: `src/app/employee/academy/dashboard/page.tsx`
**Changes**: Admin dashboard with stats

```typescript
'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Users, GraduationCap, Award } from 'lucide-react'

export default function AcademyAdminDashboard() {
  const { data: stats, isLoading } = trpc.academy.admin.getDashboardStats.useQuery()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">Academy Administration</h1>
        <p className="text-charcoal-500 mt-1">Manage courses, students, and training programs</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Total Courses"
          value={isLoading ? null : stats?.totalCourses}
          icon={BookOpen}
        />
        <StatCard
          label="Active Enrollments"
          value={isLoading ? null : stats?.activeEnrollments}
          icon={GraduationCap}
        />
        <StatCard
          label="Active Students"
          value={isLoading ? null : stats?.activeStudents}
          icon={Users}
        />
        <StatCard
          label="Certificates Issued"
          value={isLoading ? null : stats?.certificatesIssued}
          icon={Award}
        />
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="font-heading">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-wrap gap-4">
          <a
            href="/employee/academy/courses/new"
            className="flex items-center gap-2 px-4 py-2 bg-hublot-900 text-white rounded-lg hover:bg-hublot-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Create Course
          </a>
          <a
            href="/employee/academy/cohorts/new"
            className="flex items-center gap-2 px-4 py-2 bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Create Cohort
          </a>
        </CardContent>
      </Card>
    </div>
  )
}

function StatCard({
  label,
  value,
  icon: Icon,
}: {
  label: string
  value: number | null | undefined
  icon: React.ElementType
}) {
  return (
    <Card>
      <CardContent className="flex items-center gap-4 p-4">
        <div className="p-3 rounded-lg bg-gold-50">
          <Icon className="w-6 h-6 text-gold-600" />
        </div>
        <div>
          <p className="text-sm text-charcoal-500">{label}</p>
          {value === null ? (
            <Skeleton className="h-7 w-16 mt-1" />
          ) : (
            <p className="text-2xl font-bold text-charcoal-900">{value ?? 0}</p>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
```

#### 4.4 Create Academy Admin Redirect

**File**: `src/app/employee/academy/page.tsx`
**Changes**: Redirect to dashboard

```typescript
import { redirect } from 'next/navigation'

export default function AcademyAdminPage() {
  redirect('/employee/academy/dashboard')
}
```

#### 4.5 Create Courses List Page

**File**: `src/app/employee/academy/courses/page.tsx`
**Changes**: Admin courses list

```typescript
'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Plus, BookOpen, Clock, Star, Users } from 'lucide-react'

export default function AcademyCoursesPage() {
  const { data: courses, isLoading } = trpc.academy.admin.getAllCourses.useQuery()

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-heading text-2xl font-bold text-charcoal-900">Courses</h1>
          <p className="text-charcoal-500 mt-1">Manage training courses</p>
        </div>
        <Button asChild>
          <Link href="/employee/academy/courses/new">
            <Plus className="w-4 h-4 mr-2" />
            New Course
          </Link>
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      ) : courses && courses.length > 0 ? (
        <div className="space-y-4">
          {courses.map((course: any) => (
            <Card key={course.id}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-12 h-12 bg-gradient-to-br from-hublot-900 to-charcoal-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen className="w-6 h-6 text-white/70" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-charcoal-900">{course.title}</h3>
                    <Badge variant={course.is_published ? 'default' : 'secondary'}>
                      {course.is_published ? 'Published' : 'Draft'}
                    </Badge>
                  </div>
                  <div className="flex items-center gap-4 mt-1 text-sm text-charcoal-500">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {course.duration_hours}h
                    </span>
                    <span className="flex items-center gap-1">
                      <Star className="w-4 h-4" />
                      {course.xp_reward} XP
                    </span>
                    <span className="capitalize">{course.difficulty}</span>
                  </div>
                </div>
                <Button variant="outline" size="sm" asChild>
                  <Link href={`/employee/academy/courses/${course.id}`}>
                    Edit
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BookOpen className="w-12 h-12 text-charcoal-300 mb-4" />
            <p className="text-charcoal-500">No courses created yet</p>
            <Button className="mt-4" asChild>
              <Link href="/employee/academy/courses/new">Create First Course</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

#### 4.6 Create Students List Page

**File**: `src/app/employee/academy/students/page.tsx`
**Changes**: Admin students list

```typescript
'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users, BookOpen, GraduationCap } from 'lucide-react'

export default function AcademyStudentsPage() {
  const { data, isLoading } = trpc.academy.admin.getStudents.useQuery()

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">Students</h1>
        <p className="text-charcoal-500 mt-1">View and manage enrolled students</p>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4, 5].map((i) => (
            <Skeleton key={i} className="h-20" />
          ))}
        </div>
      ) : data?.students && data.students.length > 0 ? (
        <div className="space-y-2">
          {data.students.map((enrollment: any, index: number) => (
            <Card key={index}>
              <CardContent className="flex items-center gap-4 p-4">
                <div className="w-10 h-10 bg-charcoal-100 rounded-full flex items-center justify-center">
                  <Users className="w-5 h-5 text-charcoal-500" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-charcoal-900">
                    {enrollment.users?.full_name || enrollment.users?.email || 'Unknown User'}
                  </p>
                  <p className="text-sm text-charcoal-500">
                    {enrollment.courses?.title}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-medium text-charcoal-700">
                    {enrollment.progress_percent || 0}% complete
                  </p>
                  <p className="text-xs text-charcoal-500">
                    Enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                  </p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Users className="w-12 h-12 text-charcoal-300 mb-4" />
            <p className="text-charcoal-500">No students enrolled yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
```

#### 4.7 Create Placeholder Pages

**File**: `src/app/employee/academy/cohorts/page.tsx`
```typescript
import { Card, CardContent } from '@/components/ui/card'
import { GraduationCap } from 'lucide-react'

export default function AcademyCohortsPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">Cohorts</h1>
        <p className="text-charcoal-500 mt-1">Manage student cohorts and groups</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <GraduationCap className="w-12 h-12 text-charcoal-300 mb-4" />
          <p className="text-charcoal-500">Cohort management coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

**File**: `src/app/employee/academy/certificates/page.tsx`
```typescript
import { Card, CardContent } from '@/components/ui/card'
import { Award } from 'lucide-react'

export default function AcademyCertificatesAdminPage() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="font-heading text-2xl font-bold text-charcoal-900">Certificates</h1>
        <p className="text-charcoal-500 mt-1">Manage certificate templates and issuance</p>
      </div>
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Award className="w-12 h-12 text-charcoal-300 mb-4" />
          <p className="text-charcoal-500">Certificate management coming soon</p>
        </CardContent>
      </Card>
    </div>
  )
}
```

### Success Criteria:

#### Automated Verification:
- [ ] TypeScript compiles without errors: `pnpm tsc --noEmit`
- [ ] No linting errors: `pnpm lint`
- [ ] Build succeeds: `pnpm build`

#### Manual Verification:
- [ ] `/employee/academy` redirects to dashboard
- [ ] Admin dashboard shows stats
- [ ] SectionSidebar shows academy navigation
- [ ] Courses list displays seed data courses
- [ ] Students list shows enrollments

**Implementation Note**: After completing this phase and all automated verification passes, pause here for manual confirmation before proceeding to the next phase.

---

## Phase 5: Integration & Polish

### Overview
Connect marketing pages to the portal and ensure navigation works throughout the app.

### Changes Required:

#### 5.1 Update Marketing Links

**File**: `src/components/marketing/AcademyLanding.tsx`
**Changes**: Ensure CTA links point to `/training`

Verify enrollment buttons link to `/training/courses` or `/training/dashboard`.

#### 5.2 Add Academy to Top Navigation (Optional)

If not already present, consider adding academy link to employee navigation for users with academy access.

### Success Criteria:

#### Automated Verification:
- [ ] Full build succeeds: `pnpm build`
- [ ] No console errors on pages

#### Manual Verification:
- [ ] Marketing page "Explore Academy" links to `/training`
- [ ] Navigation between portals works correctly
- [ ] All pages render without errors

---

## Testing Strategy

### Unit Tests:
- tRPC procedures return expected data shapes
- Navigation detection logic for academy paths

### Integration Tests:
- Student portal navigation flow
- Admin portal navigation flow

### Manual Testing Steps:
1. Navigate to `/training` - should redirect to dashboard
2. Browse course catalog at `/training/courses`
3. View a course detail page
4. Check certificates and achievements pages
5. Navigate to `/employee/academy` - should see admin dashboard
6. View courses list in admin
7. View students list in admin

## Performance Considerations

- Course catalog should implement pagination (already in tRPC procedure)
- Dashboard queries should be optimized with proper indexes
- Consider caching for course data that changes infrequently

## Migration Notes

- Database schema already exists from migrations
- Seed data provides initial courses
- No data migration needed

## References

- Research: `thoughts/shared/research/2025-12-08-academy-portal-restoration.md`
- Archived screens: `.archive/ui-reference/screens/portals/academy/`
- Archived layout: `.archive/ui-reference/layouts/AcademyLayout.tsx`
- Database migrations: `supabase/migrations/20251121*.sql`
