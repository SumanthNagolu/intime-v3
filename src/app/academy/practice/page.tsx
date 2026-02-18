'use client'

export const dynamic = 'force-dynamic'
import { PracticeHub } from '@/components/academy/practice/PracticeHub'
import { AppLayout } from '@/components/AppLayout'
import { useStudentEnrollment } from '@/hooks/useStudentEnrollment'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

export default function Page() {
  const router = useRouter()
  const { isEnrolled, isLoading } = useStudentEnrollment()

  useEffect(() => {
    if (!isLoading && !isEnrolled) {
      router.replace('/academy/explore')
    }
  }, [isLoading, isEnrolled, router])

  if (isLoading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-[50vh]">
          <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
        </div>
      </AppLayout>
    )
  }

  if (!isEnrolled) return null

  return (
    <AppLayout>
      <PracticeHub />
    </AppLayout>
  )
}
