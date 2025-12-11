'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { useParams } from 'next/navigation'
import { Clock, Star, BookOpen, PlayCircle } from 'lucide-react'
import { useToast } from '@/components/ui/use-toast'

export default function CourseDetailPage() {
  const params = useParams()
  const courseId = params.id as string
  const { toast } = useToast()

  const { data: course, isLoading } = trpc.academy.getCourseById.useQuery({ id: courseId })
  const enrollMutation = trpc.academy.enrollInCourse.useMutation({
    onSuccess: (result) => {
      if (result.alreadyEnrolled) {
        toast({
          title: 'Already Enrolled',
          description: 'You are already enrolled in this course.',
        })
      } else {
        toast({
          title: 'Enrolled!',
          description: 'You have successfully enrolled in this course.',
        })
      }
    },
    onError: () => {
      toast({
        title: 'Error',
        description: 'Failed to enroll in course. Please try again.',
        variant: 'error',
      })
    },
  })

  const handleEnroll = () => {
    enrollMutation.mutate({ courseId })
  }

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
        <Button
          className="mt-6"
          size="lg"
          onClick={handleEnroll}
          disabled={enrollMutation.isPending}
        >
          {enrollMutation.isPending ? 'Enrolling...' : 'Start Learning'}
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
                .sort((a: { order_index: number }, b: { order_index: number }) => a.order_index - b.order_index)
                .map((module: { id: string; title: string; description?: string; xp_reward: number }, index: number) => (
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
