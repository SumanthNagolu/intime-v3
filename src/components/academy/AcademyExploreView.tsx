'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  ChevronDown,
  ChevronRight,
  Clock,
  BookOpen,
  Layers,
  Sparkles,
  ArrowRight,
  GraduationCap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { TRACKS, type TrackDefinition } from '@/lib/academy/tracks'
import {
  getPathChapters,
  getPathTotalLessons,
  getPathEstimatedHours,
  type LearningPathDefinition,
} from '@/lib/academy/learning-paths'
import { getLessonsForChapter } from '@/lib/academy/curriculum'
import { EnrollmentRequestForm } from '@/components/academy/EnrollmentRequestForm'
import { useStudentEnrollment } from '@/hooks/useStudentEnrollment'

export function AcademyExploreView() {
  const router = useRouter()
  const { isEnrolled, isLoading } = useStudentEnrollment()
  const [expandedTrack, setExpandedTrack] = useState<string | null>(null)
  const [enrollPath, setEnrollPath] = useState<{
    slug: string
    title: string
  } | null>(null)

  // Redirect enrolled users to learn page
  useEffect(() => {
    if (!isLoading && isEnrolled) {
      router.replace('/academy/learn')
    }
  }, [isLoading, isEnrolled, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="animate-spin w-8 h-8 border-2 border-gold-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  if (isEnrolled) return null

  return (
    <div className="animate-fade-in max-w-5xl mx-auto">
      {/* Hero */}
      <div className="text-center mb-12">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gold-50 text-gold-700 text-[10px] font-bold uppercase tracking-widest mb-4">
          <Sparkles size={12} />
          Training Tracks
        </div>
        <h1 className="font-heading font-black text-4xl md:text-5xl text-charcoal-900 tracking-tight mb-4">
          Choose Your Track
        </h1>
        <p className="text-charcoal-500 text-lg max-w-2xl mx-auto leading-relaxed">
          Explore our career training programs. Each track is designed to take
          you from zero to production-ready with hands-on projects and expert
          mentorship.
        </p>
      </div>

      {/* Track Cards */}
      <div className="space-y-4">
        {TRACKS.map((track) => (
          <TrackCard
            key={track.slug}
            track={track}
            isExpanded={expandedTrack === track.slug}
            onToggle={() =>
              setExpandedTrack(
                expandedTrack === track.slug ? null : track.slug
              )
            }
            onApply={(pathSlug, pathTitle) =>
              setEnrollPath({ slug: pathSlug, title: pathTitle })
            }
          />
        ))}
      </div>

      {/* Enrollment Form Modal */}
      {enrollPath && (
        <EnrollmentRequestForm
          pathSlug={enrollPath.slug}
          pathTitle={enrollPath.title}
          onClose={() => setEnrollPath(null)}
        />
      )}
    </div>
  )
}

// --- Track Card ---

function TrackCard({
  track,
  isExpanded,
  onToggle,
  onApply,
}: {
  track: TrackDefinition
  isExpanded: boolean
  onToggle: () => void
  onApply: (pathSlug: string, pathTitle: string) => void
}) {
  const isLive = track.status === 'live'

  return (
    <div
      className={cn(
        'rounded-xl border overflow-hidden transition-all duration-300',
        isLive
          ? 'border-charcoal-200/60 bg-white shadow-elevation-sm hover:shadow-elevation-md'
          : 'border-charcoal-200/40 bg-charcoal-50/50'
      )}
    >
      {/* Card Header */}
      <button
        onClick={isLive ? onToggle : undefined}
        disabled={!isLive}
        className={cn(
          'w-full flex items-center gap-5 p-6 text-left transition-colors',
          isLive && 'hover:bg-charcoal-50/50 cursor-pointer',
          !isLive && 'cursor-default'
        )}
      >
        {/* Icon */}
        <div
          className={cn(
            'w-14 h-14 rounded-xl flex items-center justify-center text-2xl shrink-0',
            isLive
              ? `bg-gradient-to-br ${track.coverGradient} text-white shadow-lg`
              : 'bg-charcoal-200/60 grayscale'
          )}
        >
          {track.icon}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-1">
            <h2
              className={cn(
                'font-heading font-bold text-xl',
                isLive ? 'text-charcoal-900' : 'text-charcoal-400'
              )}
            >
              {track.title}
            </h2>
            {isLive ? (
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-success-50 text-success-700 border border-success-200">
                <span className="w-1.5 h-1.5 rounded-full bg-success-500" />
                Live
              </span>
            ) : (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-charcoal-100 text-charcoal-500">
                Coming {track.comingSoonDate}
              </span>
            )}
          </div>
          <p
            className={cn(
              'text-sm leading-relaxed',
              isLive ? 'text-charcoal-500' : 'text-charcoal-400'
            )}
          >
            {track.description}
          </p>
        </div>

        {/* Expand Indicator */}
        {isLive && (
          <div className="shrink-0">
            <ChevronDown
              className={cn(
                'w-5 h-5 text-charcoal-400 transition-transform duration-300',
                isExpanded && 'rotate-180'
              )}
            />
          </div>
        )}
      </button>

      {/* Expanded: Learning Paths */}
      {isLive && isExpanded && track.paths && (
        <div className="border-t border-charcoal-200/60 bg-charcoal-50/30">
          <div className="p-6">
            <h3 className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-4">
              {track.paths.length} Learning Paths Available
            </h3>
            <div className="grid md:grid-cols-2 gap-4">
              {track.paths.map((path) => (
                <PathCard
                  key={path.slug}
                  path={path}
                  onApply={() => onApply(path.slug, path.title)}
                />
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

// --- Path Card (within expanded track) ---

function PathCard({
  path,
  onApply,
}: {
  path: LearningPathDefinition
  onApply: () => void
}) {
  const chapters = getPathChapters(path.slug)
  const totalLessons = getPathTotalLessons(path.slug)
  const estimatedHours = getPathEstimatedHours(path.slug)

  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden hover:shadow-elevation-md hover:-translate-y-0.5 transition-all duration-300">
      <div className="p-5">
        {/* Header */}
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="text-2xl">{path.icon}</span>
            <div>
              <h4 className="font-heading font-bold text-charcoal-900">
                {path.title}
              </h4>
              <span className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">
                {path.difficulty}
              </span>
            </div>
          </div>
        </div>

        {/* Description */}
        <p className="text-xs text-charcoal-500 leading-relaxed mb-4 line-clamp-2">
          {path.description}
        </p>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-2 mb-4">
          <div className="text-center p-2 rounded-lg bg-charcoal-50">
            <div className="text-sm font-bold text-charcoal-900">
              {chapters.length}
            </div>
            <div className="text-[9px] font-medium text-charcoal-400 uppercase tracking-wider">
              Chapters
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-charcoal-50">
            <div className="text-sm font-bold text-charcoal-900">
              {totalLessons}
            </div>
            <div className="text-[9px] font-medium text-charcoal-400 uppercase tracking-wider">
              Lessons
            </div>
          </div>
          <div className="text-center p-2 rounded-lg bg-charcoal-50">
            <div className="text-sm font-bold text-charcoal-900">
              {estimatedHours}h
            </div>
            <div className="text-[9px] font-medium text-charcoal-400 uppercase tracking-wider">
              Duration
            </div>
          </div>
        </div>

        {/* Chapter Preview */}
        <div className="mb-4">
          <div className="space-y-1">
            {chapters.slice(0, 4).map((ch, i) => (
              <div
                key={ch.slug}
                className="flex items-center gap-2 text-[11px] text-charcoal-600"
              >
                <span className="w-4 h-4 rounded-full bg-charcoal-100 flex items-center justify-center text-[9px] font-bold text-charcoal-500 shrink-0">
                  {i + 1}
                </span>
                <span className="truncate">{ch.title}</span>
              </div>
            ))}
            {chapters.length > 4 && (
              <div className="text-[10px] text-charcoal-400 font-medium pl-6">
                +{chapters.length - 4} more chapters
              </div>
            )}
          </div>
        </div>

        {/* Apply Button */}
        <button
          onClick={onApply}
          className="flex items-center justify-center gap-2 w-full py-2.5 bg-charcoal-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all duration-300"
        >
          Apply
          <ArrowRight size={14} />
        </button>
      </div>
    </div>
  )
}
