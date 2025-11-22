/**
 * Student Dashboard
 * Story: ACAD-019
 *
 * Comprehensive student dashboard showing:
 * - Course progress and enrollments
 * - XP and level progress
 * - Recent activity and achievements
 * - Next recommended topics
 * - Leaderboard position
 * - Upcoming deadlines
 * - AI mentor quick access
 */

'use client';

import { Suspense } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { BookOpen, Award, TrendingUp } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { CourseProgressCard } from '@/components/academy/CourseProgressCard';
import { NextTopicWidget } from '@/components/academy/NextTopicWidget';
import { RecentActivityWidget } from '@/components/academy/RecentActivityWidget';
import { LeaderboardPositionWidget } from '@/components/academy/LeaderboardPositionWidget';
import { UpcomingDeadlinesWidget } from '@/components/academy/UpcomingDeadlinesWidget';
import { AIMentorQuickAccess } from '@/components/academy/AIMentorQuickAccess';
import { XPProgressCard } from '@/components/academy/XPProgressCard';

function DashboardHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-4xl font-bold mb-2">My Dashboard</h1>
      <p className="text-muted-foreground">
        Track your progress, continue learning, and achieve your goals
      </p>
    </div>
  );
}

function EnrolledCoursesSection() {
  const { data: enrollments, isLoading } = trpc.enrollments.getMyEnrollments.useQuery();

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-5 w-5" />
            My Courses
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <BookOpen className="h-12 w-12 mx-auto mb-4 text-muted-foreground opacity-50" />
            <p className="text-sm text-muted-foreground mb-4">
              You're not enrolled in any courses yet
            </p>
            <Link href="/students/courses" className="text-primary hover:underline">
              Browse Available Courses
            </Link>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <BookOpen className="h-6 w-6" />
          My Courses
        </h2>
        <Link href="/students/courses" className="text-sm text-primary hover:underline">
          View All
        </Link>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrollments.slice(0, 4).map((enrollment) => (
          <CourseProgressCard key={enrollment.id} enrollment={enrollment} />
        ))}
      </div>
    </div>
  );
}

function QuickStatsSection() {
  const { data: xpSummary } = trpc.xpTransactions.getMySummary.useQuery();
  const { data: badgeCount } = trpc.badges.getMyBadges.useQuery({ limit: 100 });
  const { data: enrollmentStats } = trpc.enrollments.getMyStats.useQuery();

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Total XP
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {xpSummary?.total_xp?.toLocaleString() || '0'}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Level {xpSummary?.current_level || 1} - {xpSummary?.level_name || 'Beginner'}
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <Award className="h-4 w-4" />
            Badges Earned
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {badgeCount?.badges?.length || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Keep learning to earn more!
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            Courses Progress
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold">
            {enrollmentStats?.active_count || 0}/{enrollmentStats?.total_count || 0}
          </div>
          <p className="text-xs text-muted-foreground mt-1">
            Active enrollments
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

export default function StudentDashboardPage() {
  return (
    <div className="container max-w-7xl mx-auto">
      <DashboardHeader />

      {/* Quick Stats */}
      <Suspense fallback={<div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
        <Skeleton className="h-32" />
      </div>}>
        <QuickStatsSection />
      </Suspense>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content (2/3 width on large screens) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Enrolled Courses */}
          <Suspense fallback={<Skeleton className="h-96" />}>
            <EnrolledCoursesSection />
          </Suspense>

          {/* Next Topic Recommendation */}
          <Suspense fallback={<Skeleton className="h-64" />}>
            <NextTopicWidget />
          </Suspense>

          {/* Recent Activity */}
          <Suspense fallback={<Skeleton className="h-96" />}>
            <RecentActivityWidget />
          </Suspense>
        </div>

        {/* Right Column - Widgets (1/3 width on large screens) */}
        <div className="space-y-6">
          {/* XP Progress */}
          <Suspense fallback={<Skeleton className="h-80" />}>
            <XPProgressCard />
          </Suspense>

          {/* Leaderboard Position */}
          <Suspense fallback={<Skeleton className="h-64" />}>
            <LeaderboardPositionWidget />
          </Suspense>

          {/* AI Mentor Quick Access */}
          <Suspense fallback={<Skeleton className="h-80" />}>
            <AIMentorQuickAccess />
          </Suspense>

          {/* Upcoming Deadlines */}
          <Suspense fallback={<Skeleton className="h-96" />}>
            <UpcomingDeadlinesWidget />
          </Suspense>
        </div>
      </div>
    </div>
  );
}
