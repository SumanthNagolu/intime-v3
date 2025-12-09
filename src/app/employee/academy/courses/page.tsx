'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import Link from 'next/link'
import { Plus, BookOpen, Clock, Star } from 'lucide-react'

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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
