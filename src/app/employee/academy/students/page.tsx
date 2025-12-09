'use client'

import { trpc } from '@/lib/trpc/client'
import { Card, CardContent } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { Users } from 'lucide-react'

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
          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
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
