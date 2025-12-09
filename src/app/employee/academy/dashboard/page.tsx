'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { BookOpen, Users, GraduationCap, Award } from 'lucide-react'
import Link from 'next/link'

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
          <Link
            href="/employee/academy/courses/new"
            className="flex items-center gap-2 px-4 py-2 bg-hublot-900 text-white rounded-lg hover:bg-hublot-800 transition-colors"
          >
            <BookOpen className="w-4 h-4" />
            Create Course
          </Link>
          <Link
            href="/employee/academy/cohorts/new"
            className="flex items-center gap-2 px-4 py-2 bg-charcoal-100 text-charcoal-700 rounded-lg hover:bg-charcoal-200 transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            Create Cohort
          </Link>
          <Link
            href="/training"
            className="flex items-center gap-2 px-4 py-2 bg-gold-50 text-gold-700 rounded-lg hover:bg-gold-100 transition-colors"
          >
            <GraduationCap className="w-4 h-4" />
            View Student Portal
          </Link>
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
