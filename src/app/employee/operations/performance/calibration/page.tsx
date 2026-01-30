'use client'

import { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, Loader2, Filter, Building2 } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { NineBoxGrid } from '@/components/hr/performance/NineBoxGrid'
import { trpc } from '@/lib/trpc/client'

export default function CalibrationPage() {
  const [selectedCycleId, setSelectedCycleId] = useState<string>('')
  const [selectedDepartmentId, setSelectedDepartmentId] = useState<string>('')

  const utils = trpc.useUtils()

  const { data: cycles, isLoading: cyclesLoading } = trpc.performance.cycles.list.useQuery({
    status: undefined,
    page: 1,
    pageSize: 10,
  })

  const { data: departments } = trpc.departments.list.useQuery({})

  const { data: gridData, isLoading: gridLoading } = trpc.performance.calibration.getNineBoxGrid.useQuery(
    {
      cycleId: selectedCycleId,
      departmentId: selectedDepartmentId || undefined,
    },
    { enabled: !!selectedCycleId }
  )

  const updateCalibrationMutation = trpc.performance.calibration.updateCalibration.useMutation({
    onSuccess: () => {
      utils.performance.calibration.getNineBoxGrid.invalidate({
        cycleId: selectedCycleId,
        departmentId: selectedDepartmentId || undefined,
      })
    },
  })

  const handleUpdateCalibration = async (
    reviewId: string,
    calibratedRating: number,
    nineBoxPosition?: string,
    notes?: string
  ) => {
    await updateCalibrationMutation.mutateAsync({
      reviewId,
      calibratedRating,
      nineBoxPosition,
      calibrationNotes: notes,
    })
  }

  // Auto-select first active cycle
  const activeCycles = cycles?.items.filter(c =>
    ['self_review', 'manager_review', 'calibration'].includes(c.status)
  ) ?? []

  if (activeCycles.length > 0 && !selectedCycleId) {
    setSelectedCycleId(activeCycles[0].id)
  }

  return (
    <div className="min-h-screen bg-cream">
      {/* Header */}
      <div className="bg-white border-b border-charcoal-100 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Link href="/employee/operations/performance">
                <Button variant="ghost" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back
                </Button>
              </Link>
              <div className="h-6 w-px bg-charcoal-200" />
              <div>
                <h1 className="text-h4 font-heading font-semibold text-charcoal-900">
                  Performance Calibration
                </h1>
                <p className="text-sm text-charcoal-500 mt-0.5">
                  9-Box talent assessment and rating calibration
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <Filter className="h-4 w-4 text-charcoal-400" />
                <Select value={selectedCycleId} onValueChange={setSelectedCycleId}>
                  <SelectTrigger className="w-[200px]">
                    <SelectValue placeholder="Select cycle" />
                  </SelectTrigger>
                  <SelectContent>
                    {cycles?.items.map((cycle) => (
                      <SelectItem key={cycle.id} value={cycle.id}>
                        {cycle.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex items-center gap-2">
                <Building2 className="h-4 w-4 text-charcoal-400" />
                <Select value={selectedDepartmentId} onValueChange={setSelectedDepartmentId}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="All departments" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Departments</SelectItem>
                    {departments?.items?.map((dept) => (
                      <SelectItem key={dept.id} value={dept.id}>
                        {dept.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-6 py-6">
        {cyclesLoading || gridLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-charcoal-400" />
          </div>
        ) : !selectedCycleId ? (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-charcoal-500">
                Select a review cycle to view the calibration grid.
              </p>
            </CardContent>
          </Card>
        ) : gridData ? (
          <Card>
            <CardContent className="p-6">
              <NineBoxGrid
                grid={gridData.grid}
                total={gridData.total}
                onUpdateCalibration={handleUpdateCalibration}
                isUpdating={updateCalibrationMutation.isPending}
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-charcoal-500">
                No reviews available for calibration in this cycle.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
