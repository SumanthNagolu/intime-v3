'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import {
  ChevronLeft,
  Clock,
  BookOpen,
  CheckCircle2,
  ArrowRight,
  GraduationCap,
  Video,
  FileText,
  Sparkles,
} from 'lucide-react'
import { AppLayout } from '@/components/AppLayout'
import { getLearningPath, getPathChapters, getPathTotalLessons, getPathEstimatedHours } from '@/lib/academy/learning-paths'
import { getLessonsForChapter } from '@/lib/academy/curriculum'
import { EnrollmentRequestForm } from '@/components/academy/EnrollmentRequestForm'

export default function PathDetailPage() {
  const params = useParams()
  const pathSlug = params.pathSlug as string
  const path = getLearningPath(pathSlug)
  const [showEnrollForm, setShowEnrollForm] = useState(false)

  if (!path) {
    return (
      <AppLayout>
        <div className="text-center py-20">
          <h1 className="text-2xl font-bold text-charcoal-900 mb-4">Path Not Found</h1>
          <Link href="/academy/catalog" className="text-gold-600 hover:text-gold-700 text-sm font-bold uppercase tracking-wider">
            Back to Catalog
          </Link>
        </div>
      </AppLayout>
    )
  }

  const chapters = getPathChapters(pathSlug)
  const totalLessons = getPathTotalLessons(pathSlug)
  const estimatedHours = getPathEstimatedHours(pathSlug)
  const totalAssignments = chapters.reduce((sum, ch) => {
    const lessons = getLessonsForChapter(ch.slug)
    return sum + lessons.filter(l => l.hasAssignment).length
  }, 0)

  return (
    <AppLayout>
      {/* Breadcrumb */}
      <div className="mb-8">
        <Link
          href="/academy/catalog"
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider text-charcoal-400 hover:text-charcoal-900 transition-colors"
        >
          <ChevronLeft size={12} />
          Back to Catalog
        </Link>
      </div>

      {/* Hero Header */}
      <div className="relative overflow-hidden rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm mb-8">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-charcoal-900 via-gold-500 to-charcoal-900" />
        <div className="p-8">
          <div className="flex items-start gap-6">
            <div className="text-5xl">{path.icon}</div>
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-charcoal-100 text-charcoal-600">
                  {path.difficulty}
                </span>
                <span className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">
                  {path.estimatedWeeks} Weeks
                </span>
              </div>
              <h1 className="font-heading font-black text-3xl text-charcoal-900 tracking-tight mb-2">
                {path.title}
              </h1>
              <p className="text-charcoal-500 text-base leading-relaxed max-w-3xl">
                {path.description}
              </p>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8">
            {[
              { icon: BookOpen, value: `${chapters.length}`, label: 'Chapters' },
              { icon: FileText, value: `${totalLessons}`, label: 'Lessons' },
              { icon: Clock, value: `${estimatedHours}h`, label: 'Duration' },
              { icon: GraduationCap, value: `${totalAssignments}`, label: 'Assignments' },
            ].map((stat) => (
              <div key={stat.label} className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-50">
                <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center border border-charcoal-200/60">
                  <stat.icon size={16} className="text-charcoal-500" />
                </div>
                <div>
                  <div className="text-lg font-bold text-charcoal-900">{stat.value}</div>
                  <div className="text-[10px] text-charcoal-400 uppercase tracking-wider">{stat.label}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Curriculum Breakdown */}
        <div className="lg:col-span-2 space-y-4">
          <h2 className="font-heading font-bold text-xl text-charcoal-900 mb-4">
            Curriculum
          </h2>

          {chapters.map((chapter, idx) => {
            const lessons = getLessonsForChapter(chapter.slug)
            const videoLessons = lessons.filter(l => l.videoCount > 0).length
            const assignmentLessons = lessons.filter(l => l.hasAssignment).length

            return (
              <div
                key={chapter.slug}
                className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden"
              >
                <div className="p-5">
                  <div className="flex items-start gap-4">
                    <div className="w-8 h-8 rounded-full bg-charcoal-900 text-white flex items-center justify-center text-sm font-bold shrink-0">
                      {idx + 1}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-charcoal-900 mb-1">
                        {chapter.title}
                      </h3>
                      <p className="text-sm text-charcoal-500 mb-3">
                        {chapter.description}
                      </p>
                      <div className="flex flex-wrap gap-3 text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">
                        <span className="flex items-center gap-1">
                          <BookOpen size={11} />
                          {lessons.length} Lessons
                        </span>
                        {videoLessons > 0 && (
                          <span className="flex items-center gap-1">
                            <Video size={11} />
                            {videoLessons} Videos
                          </span>
                        )}
                        {assignmentLessons > 0 && (
                          <span className="flex items-center gap-1">
                            <FileText size={11} />
                            {assignmentLessons} Assignments
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock size={11} />
                          {chapter.weekRange}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>

        {/* Sidebar - Enrollment CTA */}
        <div className="space-y-6">
          {/* Apply Card */}
          <div className="sticky top-32 space-y-6">
            <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
              <div className="p-6">
                <h3 className="font-heading font-bold text-lg text-charcoal-900 mb-2">
                  Ready to Start?
                </h3>
                <p className="text-sm text-charcoal-500 mb-6">
                  Submit your enrollment request and our team will review it within 2 business days.
                </p>

                <button
                  onClick={() => setShowEnrollForm(true)}
                  className="flex items-center justify-center gap-2 w-full py-3 bg-charcoal-900 text-white text-xs font-bold uppercase tracking-widest rounded-lg hover:bg-black transition-all duration-300"
                >
                  Apply Now
                  <ArrowRight size={14} />
                </button>

                <div className="mt-6 space-y-3">
                  {[
                    'Structured curriculum with hands-on labs',
                    'AI-powered learning assistant (Guru)',
                    'Progress tracking and certificates',
                    'Assignment grading and feedback',
                  ].map((feature) => (
                    <div key={feature} className="flex items-start gap-2 text-xs text-charcoal-600">
                      <CheckCircle2 size={14} className="text-success-500 mt-0.5 shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* What You'll Learn */}
            <div className="rounded-xl border border-charcoal-200/60 bg-charcoal-50 shadow-elevation-sm overflow-hidden">
              <div className="px-5 py-4 border-b border-charcoal-200/60">
                <div className="flex items-center gap-2">
                  <Sparkles size={14} className="text-charcoal-500" />
                  <h3 className="font-semibold text-charcoal-900 text-sm">What You&apos;ll Learn</h3>
                </div>
              </div>
              <div className="p-5 space-y-3">
                {chapters.slice(0, 5).map((ch) => (
                  <div key={ch.slug} className="flex items-center gap-2 text-xs text-charcoal-600">
                    <div className="w-1.5 h-1.5 rounded-full bg-gold-500 shrink-0" />
                    {ch.title}
                  </div>
                ))}
                {chapters.length > 5 && (
                  <div className="text-[10px] text-charcoal-400 font-medium">
                    And {chapters.length - 5} more...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enrollment Request Modal/Overlay */}
      {showEnrollForm && (
        <EnrollmentRequestForm
          pathSlug={pathSlug}
          pathTitle={path.title}
          onClose={() => setShowEnrollForm(false)}
        />
      )}
    </AppLayout>
  )
}
