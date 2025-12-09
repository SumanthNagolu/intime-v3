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
