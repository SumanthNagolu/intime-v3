'use client'

import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Slider } from '@/components/ui/slider'
import {
  Star,
  TrendingUp,
  Target,
  Users,
  ChevronRight,
  Edit3,
  Loader2,
} from 'lucide-react'
import { cn } from '@/lib/utils'

interface Employee {
  id: string
  job_title: string
  department?: string
  department_id?: string
  user: {
    full_name: string
    avatar_url?: string | null
  }
}

interface Review {
  id: string
  overall_rating: number | null
  potential_rating: number | null
  calibrated_rating: number | null
  nine_box_position: string | null
  employee: Employee
}

interface NineBoxGridProps {
  grid: Record<string, Review[]>
  total: number
  onUpdateCalibration?: (
    reviewId: string,
    calibratedRating: number,
    nineBoxPosition?: string,
    notes?: string
  ) => Promise<void>
  isUpdating?: boolean
}

const BOX_CONFIG: Record<
  string,
  {
    label: string
    sublabel: string
    color: string
    bgColor: string
    borderColor: string
    description: string
  }
> = {
  'high-high': {
    label: 'Stars',
    sublabel: 'High Potential, High Performance',
    color: 'text-emerald-700',
    bgColor: 'bg-emerald-50',
    borderColor: 'border-emerald-200',
    description: 'Top talent - ready for leadership roles',
  },
  'high-medium': {
    label: 'High Potentials',
    sublabel: 'High Potential, Medium Performance',
    color: 'text-sky-700',
    bgColor: 'bg-sky-50',
    borderColor: 'border-sky-200',
    description: 'Develop and stretch with challenging assignments',
  },
  'high-low': {
    label: 'Enigmas',
    sublabel: 'High Potential, Low Performance',
    color: 'text-amber-700',
    bgColor: 'bg-amber-50',
    borderColor: 'border-amber-200',
    description: 'Investigate barriers and provide support',
  },
  'medium-high': {
    label: 'Solid Performers',
    sublabel: 'Medium Potential, High Performance',
    color: 'text-teal-700',
    bgColor: 'bg-teal-50',
    borderColor: 'border-teal-200',
    description: 'Recognize and retain with growth opportunities',
  },
  'medium-medium': {
    label: 'Core Players',
    sublabel: 'Medium Potential, Medium Performance',
    color: 'text-charcoal-700',
    bgColor: 'bg-charcoal-50',
    borderColor: 'border-charcoal-200',
    description: 'Develop skills and clarify expectations',
  },
  'medium-low': {
    label: 'Grinders',
    sublabel: 'Medium Potential, Low Performance',
    color: 'text-orange-700',
    bgColor: 'bg-orange-50',
    borderColor: 'border-orange-200',
    description: 'Performance improvement needed',
  },
  'low-high': {
    label: 'Workhorses',
    sublabel: 'Low Potential, High Performance',
    color: 'text-violet-700',
    bgColor: 'bg-violet-50',
    borderColor: 'border-violet-200',
    description: 'Maintain engagement and appreciate contributions',
  },
  'low-medium': {
    label: 'Dilemmas',
    sublabel: 'Low Potential, Medium Performance',
    color: 'text-pink-700',
    bgColor: 'bg-pink-50',
    borderColor: 'border-pink-200',
    description: 'Assess fit and consider role changes',
  },
  'low-low': {
    label: 'Underperformers',
    sublabel: 'Low Potential, Low Performance',
    color: 'text-red-700',
    bgColor: 'bg-red-50',
    borderColor: 'border-red-200',
    description: 'Urgent intervention or separation required',
  },
}

const POTENTIAL_LEVELS = ['low', 'medium', 'high']
const PERFORMANCE_LEVELS = ['low', 'medium', 'high']

function getInitials(name: string) {
  return name
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

export function NineBoxGrid({
  grid,
  total,
  onUpdateCalibration,
  isUpdating,
}: NineBoxGridProps) {
  const [selectedReview, setSelectedReview] = useState<Review | null>(null)
  const [calibrationDialog, setCalibrationDialog] = useState(false)
  const [calibratedRating, setCalibratedRating] = useState(3)
  const [calibrationNotes, setCalibrationNotes] = useState('')
  const [newPosition, setNewPosition] = useState<string>('')

  const handleOpenCalibration = (review: Review) => {
    setSelectedReview(review)
    setCalibratedRating(review.calibrated_rating ?? review.overall_rating ?? 3)
    setNewPosition(review.nine_box_position ?? '')
    setCalibrationNotes('')
    setCalibrationDialog(true)
  }

  const handleSaveCalibration = async () => {
    if (selectedReview && onUpdateCalibration) {
      await onUpdateCalibration(
        selectedReview.id,
        calibratedRating,
        newPosition || undefined,
        calibrationNotes || undefined
      )
      setCalibrationDialog(false)
      setSelectedReview(null)
    }
  }

  return (
    <TooltipProvider>
      <div className="space-y-6">
        {/* Grid Header */}
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-heading font-semibold text-charcoal-900">
              9-Box Talent Grid
            </h3>
            <p className="text-sm text-charcoal-500">
              {total} employees in calibration
            </p>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-charcoal-500">
              <Target className="h-4 w-4" />
              <span>Performance →</span>
            </div>
          </div>
        </div>

        {/* Y-Axis Label */}
        <div className="flex gap-4">
          <div className="flex flex-col justify-center items-center gap-2 w-8">
            <TrendingUp className="h-4 w-4 text-charcoal-400 rotate-90" />
            <span className="text-xs text-charcoal-500 writing-mode-vertical">
              Potential ↑
            </span>
          </div>

          {/* Grid */}
          <div className="flex-1">
            <div className="grid grid-cols-3 gap-2">
              {/* Header Row - Performance Labels */}
              <div className="col-span-3 grid grid-cols-3 gap-2 mb-2">
                {PERFORMANCE_LEVELS.map((level) => (
                  <div
                    key={level}
                    className="text-center text-xs font-medium text-charcoal-500 uppercase tracking-wider"
                  >
                    {level}
                  </div>
                ))}
              </div>

              {/* Grid Cells - Reversed to show High at top */}
              {[...POTENTIAL_LEVELS].reverse().map((potential) => (
                PERFORMANCE_LEVELS.map((performance) => {
                  const key = `${potential}-${performance}`
                  const config = BOX_CONFIG[key]
                  const reviews = grid[key] ?? []

                  return (
                    <div
                      key={key}
                      className={cn(
                        'relative min-h-[140px] rounded-lg border-2 p-3 transition-all hover:shadow-md',
                        config.bgColor,
                        config.borderColor
                      )}
                    >
                      {/* Box Header */}
                      <div className="flex items-center justify-between mb-2">
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <span
                              className={cn(
                                'text-xs font-semibold cursor-help',
                                config.color
                              )}
                            >
                              {config.label}
                            </span>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="max-w-xs">
                            <p className="font-medium">{config.sublabel}</p>
                            <p className="text-xs mt-1">{config.description}</p>
                          </TooltipContent>
                        </Tooltip>
                        <Badge
                          variant="outline"
                          className={cn('text-xs', config.borderColor, config.color)}
                        >
                          {reviews.length}
                        </Badge>
                      </div>

                      {/* Employees */}
                      <div className="space-y-1.5">
                        {reviews.slice(0, 4).map((review) => (
                          <Tooltip key={review.id}>
                            <TooltipTrigger asChild>
                              <button
                                onClick={() => handleOpenCalibration(review)}
                                className="flex items-center gap-2 w-full p-1.5 rounded hover:bg-white/60 transition-colors text-left"
                              >
                                <Avatar className="h-6 w-6">
                                  <AvatarImage
                                    src={review.employee.user.avatar_url || undefined}
                                  />
                                  <AvatarFallback className="text-[10px] bg-white">
                                    {getInitials(review.employee.user.full_name)}
                                  </AvatarFallback>
                                </Avatar>
                                <div className="flex-1 min-w-0">
                                  <p className="text-xs font-medium text-charcoal-900 truncate">
                                    {review.employee.user.full_name}
                                  </p>
                                </div>
                                {review.calibrated_rating && (
                                  <div className="flex items-center gap-0.5">
                                    <Star className="h-3 w-3 text-amber-500 fill-amber-500" />
                                    <span className="text-[10px] font-medium text-charcoal-600">
                                      {review.calibrated_rating}
                                    </span>
                                  </div>
                                )}
                              </button>
                            </TooltipTrigger>
                            <TooltipContent side="right">
                              <div className="space-y-1">
                                <p className="font-medium">
                                  {review.employee.user.full_name}
                                </p>
                                <p className="text-xs text-charcoal-500">
                                  {review.employee.job_title}
                                </p>
                                <div className="flex items-center gap-3 pt-1">
                                  <span className="text-xs">
                                    Perf: {review.overall_rating ?? '—'}
                                  </span>
                                  <span className="text-xs">
                                    Pot: {review.potential_rating ?? '—'}
                                  </span>
                                  {review.calibrated_rating && (
                                    <span className="text-xs text-amber-600 font-medium">
                                      Cal: {review.calibrated_rating}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </TooltipContent>
                          </Tooltip>
                        ))}
                        {reviews.length > 4 && (
                          <button className="flex items-center gap-1 text-xs text-charcoal-500 hover:text-charcoal-700 pl-1.5">
                            <Users className="h-3 w-3" />
                            +{reviews.length - 4} more
                            <ChevronRight className="h-3 w-3" />
                          </button>
                        )}
                      </div>
                    </div>
                  )
                })
              ))}
            </div>

            {/* Potential Labels on Left */}
            <div className="absolute left-0 top-0 flex flex-col justify-around h-full">
              {[...POTENTIAL_LEVELS].reverse().map((level) => (
                <span
                  key={level}
                  className="text-xs font-medium text-charcoal-500 uppercase tracking-wider"
                >
                  {level}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Legend */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t border-charcoal-100">
          {Object.entries(BOX_CONFIG).slice(0, 3).map(([key, config]) => (
            <div key={key} className="flex items-start gap-2">
              <div
                className={cn(
                  'w-3 h-3 rounded-sm flex-shrink-0 mt-0.5',
                  config.bgColor,
                  'border',
                  config.borderColor
                )}
              />
              <div>
                <p className={cn('text-xs font-medium', config.color)}>
                  {config.label}
                </p>
                <p className="text-[10px] text-charcoal-500">{config.description}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Calibration Dialog */}
        <Dialog open={calibrationDialog} onOpenChange={setCalibrationDialog}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Calibrate Rating</DialogTitle>
              <DialogDescription>
                Adjust the rating for {selectedReview?.employee.user.full_name}
              </DialogDescription>
            </DialogHeader>

            {selectedReview && (
              <div className="space-y-6 py-4">
                {/* Employee Info */}
                <div className="flex items-center gap-3 p-3 bg-charcoal-50 rounded-lg">
                  <Avatar className="h-10 w-10">
                    <AvatarImage
                      src={selectedReview.employee.user.avatar_url || undefined}
                    />
                    <AvatarFallback>
                      {getInitials(selectedReview.employee.user.full_name)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <p className="font-medium text-charcoal-900">
                      {selectedReview.employee.user.full_name}
                    </p>
                    <p className="text-sm text-charcoal-500">
                      {selectedReview.employee.job_title}
                    </p>
                  </div>
                </div>

                {/* Current Ratings */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                      Performance
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <Star
                            key={i}
                            className={cn(
                              'h-4 w-4',
                              i <= (selectedReview.overall_rating ?? 0)
                                ? 'text-amber-500 fill-amber-500'
                                : 'text-charcoal-200'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {selectedReview.overall_rating ?? '—'}
                      </span>
                    </div>
                  </div>
                  <div className="p-3 bg-charcoal-50 rounded-lg">
                    <p className="text-xs text-charcoal-500 uppercase tracking-wider mb-1">
                      Potential
                    </p>
                    <div className="flex items-center gap-2">
                      <div className="flex">
                        {[1, 2, 3, 4, 5].map((i) => (
                          <TrendingUp
                            key={i}
                            className={cn(
                              'h-4 w-4',
                              i <= (selectedReview.potential_rating ?? 0)
                                ? 'text-sky-500'
                                : 'text-charcoal-200'
                            )}
                          />
                        ))}
                      </div>
                      <span className="text-sm font-medium">
                        {selectedReview.potential_rating ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Calibrated Rating */}
                <div>
                  <Label>Calibrated Rating</Label>
                  <div className="mt-3 space-y-3">
                    <Slider
                      value={[calibratedRating]}
                      onValueChange={([v]) => setCalibratedRating(v)}
                      min={1}
                      max={5}
                      step={0.5}
                      className="w-full"
                    />
                    <div className="flex justify-between text-xs text-charcoal-500">
                      <span>1 - Needs Improvement</span>
                      <span className="font-semibold text-lg text-charcoal-900">
                        {calibratedRating}
                      </span>
                      <span>5 - Exceptional</span>
                    </div>
                  </div>
                </div>

                {/* 9-Box Position Override */}
                <div>
                  <Label>9-Box Position (Optional)</Label>
                  <Select value={newPosition} onValueChange={setNewPosition}>
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Auto-calculated" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Auto-calculate</SelectItem>
                      {Object.entries(BOX_CONFIG).map(([key, config]) => (
                        <SelectItem key={key} value={key}>
                          {config.label} - {config.sublabel}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Notes */}
                <div>
                  <Label>Calibration Notes</Label>
                  <Textarea
                    value={calibrationNotes}
                    onChange={(e) => setCalibrationNotes(e.target.value)}
                    placeholder="Add notes about this calibration decision..."
                    className="mt-2"
                    rows={3}
                  />
                </div>
              </div>
            )}

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setCalibrationDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveCalibration} disabled={isUpdating}>
                {isUpdating ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Edit3 className="h-4 w-4 mr-2" />
                )}
                Save Calibration
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </TooltipProvider>
  )
}
