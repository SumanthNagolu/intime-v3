'use client'

import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  Trophy,
  Award,
  Download,
  Share2,
  CheckCircle,
  BookOpen,
  Clock,
  ChevronRight,
  ChevronDown,
  ExternalLink,
} from 'lucide-react'
import { trpc } from '@/lib/trpc/client'
import { useStudentEnrollment } from '@/hooks/useStudentEnrollment'
import { useAcademyStore } from '@/lib/academy/progress-store'
import { getPathLessons } from '@/lib/academy/learning-paths'
import { evaluateGraduationEligibility } from '@/lib/academy/graduation'

export function GraduationSection() {
  const router = useRouter()
  const { activePath, activePathSlug, isEnrolled } = useStudentEnrollment()
  const lessonProgress = useAcademyStore((s) => s.lessons)
  const [showMissing, setShowMissing] = useState(false)

  const { data: certificates, isLoading: certsLoading } =
    trpc.academy.getMyCertificates.useQuery(undefined, {
      retry: false,
    })

  const pathLessons = activePathSlug ? getPathLessons(activePathSlug) : []
  const eligibility = evaluateGraduationEligibility(pathLessons, lessonProgress)

  const graduateMutation = trpc.academy.requestGraduation.useMutation({
    onSuccess: () => {
      window.location.reload()
    },
  })

  if (!isEnrolled || !activePath) return null

  const hasCertificate = certificates && certificates.length > 0
  const latestCert = hasCertificate ? certificates[0] : null

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-gold-100 flex items-center justify-center">
          <Trophy className="w-5 h-5 text-gold-600" />
        </div>
        <div>
          <h2 className="font-heading font-bold text-lg text-charcoal-900">
            Graduation
          </h2>
          <p className="text-xs text-charcoal-500">{activePath.title}</p>
        </div>
      </div>

      {/* Progress Overview */}
      <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm p-5">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest">
            Path Progress
          </span>
          <span className="text-xl font-bold text-charcoal-900">
            {eligibility.progressPercent}%
          </span>
        </div>
        <div className="h-2.5 bg-charcoal-100 rounded-full overflow-hidden mb-4">
          <div
            className={`h-full rounded-full transition-all duration-700 ${
              eligibility.eligible ? 'bg-green-500' : 'bg-gold-500'
            }`}
            style={{ width: `${eligibility.progressPercent}%` }}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-50">
            <BookOpen className="w-4 h-4 text-charcoal-400" />
            <div>
              <p className="text-[10px] text-charcoal-500">Lessons</p>
              <p className="text-sm font-semibold text-charcoal-900">
                {eligibility.completedLessons} / {eligibility.totalLessons}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3 p-3 rounded-lg bg-charcoal-50">
            <CheckCircle className="w-4 h-4 text-charcoal-400" />
            <div>
              <p className="text-[10px] text-charcoal-500">Assignments</p>
              <p className="text-sm font-semibold text-charcoal-900">
                {eligibility.assignmentsSubmitted} /{' '}
                {eligibility.assignmentsRequired}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Graduation Action */}
      {eligibility.eligible && !hasCertificate && (
        <div className="rounded-xl border-2 border-gold-300 bg-gold-50/50 p-5 text-center">
          <Award className="w-10 h-10 text-gold-600 mx-auto mb-2" />
          <h3 className="font-heading font-bold text-lg text-charcoal-900 mb-1">
            You&apos;re Ready to Graduate!
          </h3>
          <p className="text-sm text-charcoal-600 mb-4">
            You&apos;ve completed all lessons and assignments. Request your
            certificate now.
          </p>
          <button
            onClick={() => {
              if (activePathSlug) {
                graduateMutation.mutate({ pathSlug: activePathSlug })
              }
            }}
            disabled={graduateMutation.isPending}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-charcoal-900 text-white rounded-lg font-semibold text-sm hover:bg-charcoal-800 transition-colors disabled:opacity-50"
          >
            <Award className="w-4 h-4" />
            {graduateMutation.isPending
              ? 'Processing...'
              : 'Request Certificate'}
          </button>
        </div>
      )}

      {/* Certificate Card */}
      {hasCertificate && latestCert && (
        <div className="rounded-xl border border-green-200 bg-white shadow-elevation-sm overflow-hidden">
          <div className="bg-green-50 px-5 py-3 border-b border-green-200">
            <div className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-green-600" />
              <span className="text-sm font-semibold text-green-800">
                Certificate Issued
              </span>
            </div>
          </div>
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 rounded-lg bg-gold-100 flex items-center justify-center shrink-0">
                <Award className="w-6 h-6 text-gold-600" />
              </div>
              <div className="flex-1 min-w-0">
                <h3 className="font-heading font-bold text-charcoal-900">
                  {activePath.title}
                </h3>
                <p className="text-xs text-charcoal-500 mt-0.5 font-mono">
                  {latestCert.certificate_number}
                </p>
                <p className="text-xs text-charcoal-400 mt-1">
                  <Clock className="w-3 h-3 inline mr-1" />
                  Issued{' '}
                  {new Date(latestCert.issued_at).toLocaleDateString('en-US', {
                    dateStyle: 'long',
                  })}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2 mt-4 pt-3 border-t border-charcoal-100">
              {latestCert.pdf_url && (
                <a
                  href={latestCert.pdf_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-3.5 py-2 bg-charcoal-900 text-white rounded-lg text-xs font-medium hover:bg-charcoal-800 transition-colors"
                >
                  <Download className="w-3.5 h-3.5" />
                  Download PDF
                </a>
              )}
              <button
                onClick={() => {
                  const url = `${window.location.origin}/verify-certificate/${latestCert.certificate_number}`
                  navigator.clipboard.writeText(url)
                }}
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-charcoal-200 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors"
              >
                <Share2 className="w-3.5 h-3.5" />
                Copy Link
              </button>
              <a
                href={`/verify-certificate/${latestCert.certificate_number}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 px-3.5 py-2 border border-charcoal-200 rounded-lg text-xs font-medium text-charcoal-700 hover:bg-charcoal-50 transition-colors"
              >
                <ExternalLink className="w-3.5 h-3.5" />
                Verify
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Missing Items (collapsed by default) */}
      {!eligibility.eligible && (
        <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden">
          <button
            onClick={() => setShowMissing(!showMissing)}
            className="w-full flex items-center justify-between px-5 py-4 text-left hover:bg-charcoal-50/50 transition-colors"
          >
            <h3 className="text-sm font-semibold text-charcoal-900">
              Remaining Requirements
            </h3>
            <ChevronDown
              className={`w-4 h-4 text-charcoal-400 transition-transform duration-200 ${
                showMissing ? 'rotate-180' : ''
              }`}
            />
          </button>

          {showMissing && (
            <div className="px-5 pb-4 border-t border-charcoal-100 pt-3">
              {eligibility.missingLessons.length > 0 && (
                <div className="mb-4">
                  <p className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider mb-2">
                    Incomplete Lessons ({eligibility.missingLessons.length})
                  </p>
                  <div className="space-y-1">
                    {eligibility.missingLessons.slice(0, 5).map((lesson) => (
                      <button
                        key={lesson.lessonId}
                        onClick={() =>
                          router.push(
                            `/academy/lesson/${lesson.chapterSlug}/${lesson.lessonNumber}`
                          )
                        }
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-charcoal-50 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-charcoal-100 flex items-center justify-center shrink-0">
                          <span className="text-[9px] font-bold text-charcoal-500">
                            {lesson.lessonNumber}
                          </span>
                        </div>
                        <span className="text-xs text-charcoal-700 truncate flex-1">
                          {lesson.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" />
                      </button>
                    ))}
                    {eligibility.missingLessons.length > 5 && (
                      <p className="text-[10px] text-charcoal-400 pl-8">
                        +{eligibility.missingLessons.length - 5} more
                      </p>
                    )}
                  </div>
                </div>
              )}

              {eligibility.missingAssignments.length > 0 && (
                <div>
                  <p className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider mb-2">
                    Missing Assignments ({eligibility.missingAssignments.length})
                  </p>
                  <div className="space-y-1">
                    {eligibility.missingAssignments.map((lesson) => (
                      <button
                        key={lesson.lessonId}
                        onClick={() =>
                          router.push(
                            `/academy/lesson/${lesson.chapterSlug}/${lesson.lessonNumber}`
                          )
                        }
                        className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left hover:bg-charcoal-50 transition-colors"
                      >
                        <div className="w-5 h-5 rounded-full bg-amber-100 flex items-center justify-center shrink-0">
                          <BookOpen className="w-3 h-3 text-amber-600" />
                        </div>
                        <span className="text-xs text-charcoal-700 truncate flex-1">
                          {lesson.title}
                        </span>
                        <ChevronRight className="w-3.5 h-3.5 text-charcoal-400" />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
