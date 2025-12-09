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
import { cn } from '@/lib/utils'

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
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
              {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
