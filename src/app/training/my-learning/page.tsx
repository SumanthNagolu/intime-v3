'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
            <p className="text-charcoal-500 mb-4">You haven&apos;t enrolled in any courses yet</p>
            <Button asChild>
              <Link href="/training/courses">Browse Courses</Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
