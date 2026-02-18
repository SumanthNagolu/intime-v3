'use client'

import React, { useState, useMemo, useEffect } from 'react'
import {
  Award,
  BookOpen,
  Briefcase,
  CheckCircle,
  ChevronDown,
  ChevronRight,
  ClipboardList,
  Code2,
  ExternalLink,
  FileText,
  Flame,
  Github,
  Globe,
  GraduationCap,
  Image,
  Layers,
  Linkedin,
  MapPin,
  Minus,
  Plus,
  RefreshCw,
  Sparkles,
  Target,
  Trash2,
  User,
  X,
  Zap,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  useProfileStore,
  type SkillLevel,
  type SkillCategory,
  type ProfileSkill,
  type Certification,
  type Project,
  type Implementation,
} from '@/lib/academy/profile-store'
import { useAcademyStore } from '@/lib/academy/progress-store'
import { TOTAL_LESSONS, CHAPTERS, CHAPTER_LESSONS } from '@/lib/academy/curriculum'
import type { SubmissionBlock } from '@/lib/academy/types'
import { ImplementationDocBuilder } from '@/components/academy/profile/ImplementationDocBuilder'
import { ImplementationDocViewer } from '@/components/academy/profile/ImplementationDocViewer'
import { GraduationSection } from '@/components/academy/profile/GraduationSection'

// ============================================================
// Constants
// ============================================================

const SKILL_CATEGORIES: { value: SkillCategory; label: string }[] = [
  { value: 'guidewire-core', label: 'Guidewire Core' },
  { value: 'guidewire-development', label: 'Development' },
  { value: 'guidewire-config', label: 'Configuration' },
  { value: 'integration', label: 'Integration' },
  { value: 'methodology', label: 'Methodology' },
  { value: 'general', label: 'General' },
]

const SKILL_LEVELS: SkillLevel[] = ['beginner', 'intermediate', 'advanced', 'expert']

const IMPL_CATEGORIES = [
  'UI Customization',
  'Business Rules',
  'Data Model',
  'Integration',
  'Rating',
  'Workflow',
  'Reporting',
  'Performance',
  'Migration',
  'Other',
]

// ============================================================
// Helpers
// ============================================================

function useProfileCompletion() {
  const store = useProfileStore()
  const fields = [
    store.name,
    store.title,
    store.summary,
    store.location,
    store.yearsExperience,
  ]
  const filledFields = fields.filter(Boolean).length
  const hasSkills = store.skills.length > 0
  const hasCerts = store.certifications.length > 0
  const hasProjects = store.projects.length > 0
  const hasSocial = !!(store.linkedinUrl || store.githubUrl || store.portfolioUrl)

  const total = 9
  const filled = filledFields + (hasSkills ? 1 : 0) + (hasCerts ? 1 : 0) + (hasProjects ? 1 : 0) + (hasSocial ? 1 : 0)
  return Math.round((filled / total) * 100)
}

function useIsProfileEmpty() {
  const store = useProfileStore()
  return !store.name && !store.title && !store.summary && store.skills.length === 0 && store.projects.length === 0
}

// ============================================================
// Main Component - Resume Style Layout
// ============================================================

export function AcademyProfileView() {
  const store = useProfileStore()
  const { isEditMode } = store
  const isEmpty = useIsProfileEmpty()
  const completion = useProfileCompletion()

  useEffect(() => {
    if (isEmpty && !isEditMode) {
      store.setEditMode(true)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div className="min-h-screen bg-cream">
      {/* Floating edit toggle */}
      <div className="sticky top-0 z-20 bg-cream/80 backdrop-blur-sm border-b border-charcoal-200/40">
        <div className="max-w-[960px] mx-auto px-6 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-[11px] font-medium text-charcoal-400 uppercase tracking-wider">
              Developer Profile
            </span>
            <div className="w-20 h-1 rounded-full bg-charcoal-200 overflow-hidden">
              <div
                className="h-full rounded-full bg-gradient-to-r from-gold-500 to-gold-400 transition-all duration-500"
                style={{ width: `${completion}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold text-charcoal-400 tabular-nums">{completion}%</span>
          </div>
          <div className="flex items-center gap-2.5">
            <span className="text-[11px] font-medium text-charcoal-500">
              {isEditMode ? 'Editing' : 'Preview'}
            </span>
            <Switch
              checked={isEditMode}
              onCheckedChange={(v) => store.setEditMode(v)}
            />
          </div>
        </div>
      </div>

      {/* Resume document */}
      <div className="max-w-[960px] mx-auto px-6 py-8">
        {/* Onboarding */}
        {isEmpty && isEditMode && (
          <div className="rounded-xl border border-gold-200 bg-gradient-to-r from-gold-50 to-amber-50 p-5 mb-8 animate-slide-up">
            <div className="flex items-start gap-4">
              <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center shrink-0">
                <Sparkles className="w-5 h-5 text-gold-600" />
              </div>
              <div>
                <h3 className="font-semibold text-charcoal-900 text-sm">Build Your Developer Resume</h3>
                <p className="text-sm text-charcoal-600 mt-1 leading-relaxed">
                  Fill in your details to create a professional Guidewire developer profile.
                  Document your projects and implementations to showcase your expertise.
                  Everything saves automatically.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* The Resume Card */}
        <div className="bg-white rounded-xl shadow-elevation-md overflow-hidden border border-charcoal-200/40 animate-fade-in">

          {/* ═══ HEADER SECTION ═══ */}
          <ResumeHeader />

          {/* ═══ BODY ═══ */}
          <div className="divide-y divide-charcoal-100">
            {/* Summary */}
            <ResumeSummary />

            {/* Academy Progress Strip */}
            <AcademyBadgesStrip />

            {/* Assignment Submissions */}
            <ResumeAssignments />

            {/* Technical Skills */}
            <ResumeSkills />

            {/* Project Experience */}
            <ResumeProjects />

            {/* Certifications */}
            <ResumeCertifications />
          </div>
        </div>

        {/* Graduation & Certificate */}
        <div className="mt-8">
          <GraduationSection />
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Resume Header (dark band)
// ============================================================

function ResumeHeader() {
  const store = useProfileStore()
  const { isEditMode } = store

  const initials = store.name
    ? store.name
        .split(' ')
        .map((w) => w[0])
        .join('')
        .toUpperCase()
        .slice(0, 2)
    : 'GW'

  const hasSocialLinks = !!(store.linkedinUrl || store.githubUrl || store.portfolioUrl)

  return (
    <div className="relative">
      <div className="h-1 bg-gradient-to-r from-gold-500 via-gold-400 to-gold-600" />
      <div className="bg-charcoal-900 text-white relative">
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-800/50 via-transparent to-gold-900/10" />

        <div className="relative px-8 py-8">
          <div className="flex gap-6">
            {/* Avatar */}
            <div className="w-[72px] h-[72px] rounded-xl bg-gradient-to-br from-gold-400 to-gold-600 flex items-center justify-center text-2xl font-heading font-bold text-charcoal-900 shrink-0 shadow-lg shadow-gold-500/20">
              {initials}
            </div>

            {/* Name + Title */}
            <div className="flex-1 min-w-0">
              <InlineEditableField
                value={store.name}
                onChange={(v) => store.setField('name', v)}
                placeholder="Your Full Name"
                viewPlaceholder="Add your name"
                editing={isEditMode}
                className="text-2xl font-heading font-bold text-white tracking-tight"
                placeholderClassName="text-2xl font-heading font-bold text-white/30 italic"
                inputClassName="bg-white/10 border-white/20 text-white placeholder:text-white/40 text-xl"
              />
              <InlineEditableField
                value={store.title}
                onChange={(v) => store.setField('title', v)}
                placeholder="e.g. Guidewire Developer / PolicyCenter Specialist"
                viewPlaceholder="Add your professional title"
                editing={isEditMode}
                className="text-sm text-gold-400 mt-1 font-medium"
                placeholderClassName="text-sm text-white/20 italic mt-1"
                inputClassName="bg-white/10 border-white/20 text-gold-300 placeholder:text-white/30 mt-1"
              />

              {/* Meta row */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-3">
                <div className="flex items-center gap-1.5 text-charcoal-400 text-xs">
                  <MapPin className="w-3 h-3" />
                  <InlineEditableField
                    value={store.location}
                    onChange={(v) => store.setField('location', v)}
                    placeholder="City, Country"
                    viewPlaceholder="Location"
                    editing={isEditMode}
                    className="text-xs text-charcoal-400"
                    placeholderClassName="text-xs text-white/20 italic"
                    inputClassName="bg-white/10 border-white/20 text-charcoal-300 placeholder:text-white/30 w-32 !py-1 !text-xs"
                  />
                </div>
                <div className="flex items-center gap-1.5 text-charcoal-400 text-xs">
                  <Briefcase className="w-3 h-3" />
                  <InlineEditableField
                    value={store.yearsExperience}
                    onChange={(v) => store.setField('yearsExperience', v)}
                    placeholder="e.g. 3 years"
                    viewPlaceholder="Experience"
                    editing={isEditMode}
                    className="text-xs text-charcoal-400"
                    placeholderClassName="text-xs text-white/20 italic"
                    inputClassName="bg-white/10 border-white/20 text-charcoal-300 placeholder:text-white/30 w-24 !py-1 !text-xs"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Social links */}
          {(isEditMode || hasSocialLinks) && (
            <div className="flex flex-wrap gap-4 mt-5 pt-5 border-t border-white/10">
              <SocialLink
                icon={Linkedin}
                value={store.linkedinUrl}
                onChange={(v) => store.setField('linkedinUrl', v)}
                placeholder="LinkedIn URL"
                editing={isEditMode}
              />
              <SocialLink
                icon={Github}
                value={store.githubUrl}
                onChange={(v) => store.setField('githubUrl', v)}
                placeholder="GitHub URL"
                editing={isEditMode}
              />
              <SocialLink
                icon={Globe}
                value={store.portfolioUrl}
                onChange={(v) => store.setField('portfolioUrl', v)}
                placeholder="Portfolio URL"
                editing={isEditMode}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Summary Section
// ============================================================

function ResumeSummary() {
  const store = useProfileStore()
  const { isEditMode } = store

  if (!isEditMode && !store.summary) return null

  return (
    <div className="px-8 py-6">
      <SectionLabel>Professional Summary</SectionLabel>
      <div className="mt-2">
        <InlineEditableTextarea
          value={store.summary}
          onChange={(v) => store.setField('summary', v)}
          placeholder="Brief professional summary highlighting your Guidewire expertise and career goals..."
          viewPlaceholder="Add a professional summary..."
          editing={isEditMode}
          className="text-sm text-charcoal-700 leading-relaxed"
          placeholderClassName="text-sm text-charcoal-400 italic leading-relaxed"
          inputClassName="border-charcoal-200 text-charcoal-700 placeholder:text-charcoal-400"
          rows={3}
        />
      </div>
    </div>
  )
}

// ============================================================
// Academy Progress Strip
// ============================================================

function AcademyBadgesStrip() {
  const { lessons, readinessIndex, streak } = useAcademyStore()
  const completedCount = Object.values(lessons).filter(
    (l) => l.status === 'completed'
  ).length
  const chaptersStarted = new Set(
    Object.keys(lessons)
      .filter((id) => lessons[id].status !== 'locked')
      .map((id) => id.split('-')[0])
  ).size

  const readinessPct = Math.round((readinessIndex ?? 0) * 100)

  // Assignment stats
  const allAssignmentLessons = CHAPTERS.flatMap(ch => (CHAPTER_LESSONS[ch.slug] || []).filter(l => l.hasAssignment))
  const totalAssignments = allAssignmentLessons.length
  const submittedAssignments = allAssignmentLessons.filter(l => lessons[l.lessonId]?.assignmentSubmitted).length

  return (
    <div className="px-8 py-5 bg-charcoal-50/40">
      <div className="flex items-center gap-6 overflow-x-auto">
        <StatChip
          label="Readiness"
          value={`${readinessPct}%`}
          color={readinessPct >= 50 ? 'green' : readinessPct >= 20 ? 'amber' : 'neutral'}
        />
        <div className="w-px h-6 bg-charcoal-200 shrink-0" />
        <StatChip label="Lessons" value={`${completedCount}/${TOTAL_LESSONS}`} color="neutral" />
        <div className="w-px h-6 bg-charcoal-200 shrink-0" />
        <StatChip label="Chapters" value={`${chaptersStarted}/${CHAPTERS.length}`} color="neutral" />
        <div className="w-px h-6 bg-charcoal-200 shrink-0" />
        <StatChip
          label="Assignments"
          value={`${submittedAssignments}/${totalAssignments}`}
          color={submittedAssignments > 0 ? 'green' : 'neutral'}
          icon={submittedAssignments > 0 ? <ClipboardList className="w-3 h-3 text-green-600" /> : undefined}
        />
        <div className="w-px h-6 bg-charcoal-200 shrink-0" />
        <StatChip
          label="Streak"
          value={streak > 0 ? `${streak}d` : '0d'}
          color={streak > 0 ? 'orange' : 'neutral'}
          icon={streak > 0 ? <Flame className="w-3 h-3 text-orange-500" /> : undefined}
        />
      </div>
    </div>
  )
}

function StatChip({
  label,
  value,
  color,
  icon,
}: {
  label: string
  value: string
  color: 'green' | 'amber' | 'orange' | 'neutral'
  icon?: React.ReactNode
}) {
  const colorMap = {
    green: 'text-green-700',
    amber: 'text-amber-700',
    orange: 'text-orange-600',
    neutral: 'text-charcoal-700',
  }
  return (
    <div className="flex items-center gap-2 shrink-0">
      {icon}
      <div>
        <p className="text-[10px] font-medium text-charcoal-400 uppercase tracking-wider">{label}</p>
        <p className={cn('text-sm font-bold tabular-nums', colorMap[color])}>{value}</p>
      </div>
    </div>
  )
}

// ============================================================
// Assignment Submissions Section
// ============================================================

function ResumeAssignments() {
  const { lessons } = useAcademyStore()
  const { isEditMode } = useProfileStore()
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set())

  // Build assignment data grouped by chapter
  const assignmentsByChapter = useMemo(() => {
    return CHAPTERS.map(ch => {
      const chLessons = CHAPTER_LESSONS[ch.slug] || []
      const withAssignment = chLessons.filter(l => l.hasAssignment)
      if (withAssignment.length === 0) return null
      return {
        chapter: ch,
        assignments: withAssignment.map(l => ({
          lesson: l,
          submitted: lessons[l.lessonId]?.assignmentSubmitted ?? false,
          response: lessons[l.lessonId]?.assignmentResponse ?? '',
          blocks: lessons[l.lessonId]?.assignmentBlocks ?? [],
        })),
      }
    }).filter((g): g is NonNullable<typeof g> => g !== null)
  }, [lessons])

  const submittedAssignments = assignmentsByChapter.flatMap(g => g.assignments).filter(a => a.submitted)
  const totalAssignments = assignmentsByChapter.flatMap(g => g.assignments).length

  // In view mode, only show if there are submissions
  if (!isEditMode && submittedAssignments.length === 0) return null

  const toggleExpand = (lessonId: string) => {
    setExpandedIds(prev => {
      const next = new Set(prev)
      if (next.has(lessonId)) {
        next.delete(lessonId)
      } else {
        next.add(lessonId)
      }
      return next
    })
  }

  // Only show chapters that have at least one submission (in view mode)
  // or all chapters with assignments (in edit mode)
  const visibleChapters = isEditMode
    ? assignmentsByChapter
    : assignmentsByChapter.filter(g => g.assignments.some(a => a.submitted))

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Assignment Submissions</SectionLabel>
        <span className="text-[10px] font-medium text-charcoal-400 tabular-nums">
          {submittedAssignments.length}/{totalAssignments} submitted
        </span>
      </div>

      {submittedAssignments.length === 0 ? (
        <EmptyState
          icon={ClipboardList}
          message="No assignments submitted"
          hint="Complete assignments in your lessons to see them here. Your responses will be tracked automatically."
        />
      ) : (
        <div className="mt-4 space-y-5">
          {visibleChapters.map(({ chapter, assignments }) => {
            const chapterSubmitted = assignments.filter(a => a.submitted).length
            if (!isEditMode && chapterSubmitted === 0) return null

            return (
              <div key={chapter.slug}>
                {/* Chapter header */}
                <div className="flex items-center gap-2 mb-2">
                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-charcoal-100 text-charcoal-500 uppercase tracking-wider shrink-0">
                    {chapter.slug}
                  </span>
                  <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider truncate">
                    {chapter.title}
                  </span>
                  <span className="text-[10px] text-charcoal-400 tabular-nums shrink-0">
                    {chapterSubmitted}/{assignments.length}
                  </span>
                </div>

                {/* Assignment entries */}
                <div className="space-y-1.5">
                  {assignments.map(({ lesson, submitted, response, blocks }) => {
                    // In view mode, skip non-submitted
                    if (!isEditMode && !submitted) return null

                    const isExpanded = expandedIds.has(lesson.lessonId)
                    const blockCount = blocks.length
                    const hasScreenshots = blocks.some(b => b.type === 'screenshot')
                    const hasCode = blocks.some(b => b.type === 'code')

                    return (
                      <div
                        key={lesson.lessonId}
                        className={cn(
                          'rounded-lg border overflow-hidden transition-all duration-200',
                          isExpanded ? 'border-charcoal-300 shadow-sm' : 'border-charcoal-200/60',
                          !submitted && 'opacity-60'
                        )}
                      >
                        {/* Row header */}
                        <button
                          onClick={() => submitted && toggleExpand(lesson.lessonId)}
                          disabled={!submitted}
                          className={cn(
                            'w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 transition-colors',
                            submitted && 'hover:bg-charcoal-50/60 cursor-pointer',
                            !submitted && 'cursor-default'
                          )}
                        >
                          {submitted ? (
                            <ChevronRight
                              className={cn(
                                'w-3.5 h-3.5 text-charcoal-400 shrink-0 transition-transform duration-200',
                                isExpanded && 'rotate-90'
                              )}
                            />
                          ) : (
                            <div className="w-3.5 h-3.5 shrink-0" />
                          )}

                          <span className="text-sm text-charcoal-700 truncate flex-1">
                            <span className="text-charcoal-400 tabular-nums text-xs mr-1.5">
                              L{String(lesson.lessonNumber).padStart(2, '0')}
                            </span>
                            {lesson.title}
                          </span>

                          {/* Block type indicators */}
                          {submitted && blockCount > 0 && !isExpanded && (
                            <div className="flex items-center gap-1.5 shrink-0">
                              {hasCode && (
                                <Code2 className="w-3 h-3 text-charcoal-400" />
                              )}
                              {hasScreenshots && (
                                <Image className="w-3 h-3 text-charcoal-400" />
                              )}
                              <span className="text-[9px] font-medium text-charcoal-400 bg-charcoal-100 px-1.5 py-0.5 rounded tabular-nums">
                                {blockCount}
                              </span>
                            </div>
                          )}

                          {/* Status badge */}
                          {submitted ? (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                              Submitted
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-amber-50 text-amber-700 border border-amber-200 shrink-0">
                              <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                              Pending
                            </span>
                          )}
                        </button>

                        {/* Expanded content - render structured blocks */}
                        {isExpanded && submitted && (
                          <div className="border-t border-charcoal-200 bg-charcoal-50/30">
                            {blockCount > 0 ? (
                              <div className="divide-y divide-charcoal-100">
                                {blocks.map((block) => (
                                  <SubmissionBlockRenderer key={block.id} block={block} />
                                ))}
                              </div>
                            ) : response ? (
                              <div className="px-4 py-3">
                                <p className="text-sm text-charcoal-600 leading-relaxed whitespace-pre-wrap">
                                  {response}
                                </p>
                              </div>
                            ) : (
                              <div className="px-4 py-3 text-sm text-charcoal-400 italic">
                                No response content
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}

/** Renders a single submission block (text, code, or screenshot) in the profile view */
function SubmissionBlockRenderer({ block }: { block: SubmissionBlock }) {
  switch (block.type) {
    case 'text':
      return (
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <FileText className="w-3 h-3 text-charcoal-400" />
            <span className="text-[9px] font-semibold text-charcoal-400 uppercase tracking-wider">Notes</span>
          </div>
          <p className="text-sm text-charcoal-600 leading-relaxed whitespace-pre-wrap">
            {block.content}
          </p>
        </div>
      )

    case 'code':
      return (
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Code2 className="w-3 h-3 text-charcoal-400" />
            <span className="text-[9px] font-semibold text-charcoal-400 uppercase tracking-wider">
              {block.language || 'Code'}
            </span>
          </div>
          <pre className="rounded-lg bg-charcoal-900 text-charcoal-100 px-4 py-3 text-xs font-mono leading-relaxed overflow-x-auto">
            <code>{block.content}</code>
          </pre>
        </div>
      )

    case 'screenshot':
      return (
        <div className="px-4 py-3">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Image className="w-3 h-3 text-charcoal-400" />
            <span className="text-[9px] font-semibold text-charcoal-400 uppercase tracking-wider">Screenshot</span>
          </div>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={block.dataUrl}
            alt={block.caption || 'Assignment screenshot'}
            className="rounded-lg border border-charcoal-200 max-w-full max-h-[400px] object-contain bg-white"
          />
          {block.caption && (
            <p className="text-xs text-charcoal-500 mt-1.5 italic">{block.caption}</p>
          )}
        </div>
      )

    default: {
      const _exhaustive: never = block
      return null
    }
  }
}

// ============================================================
// Skills Section
// ============================================================

function ResumeSkills() {
  const store = useProfileStore()
  const { skills, isEditMode } = store
  const [showAdd, setShowAdd] = useState(false)

  const grouped = useMemo(
    () =>
      SKILL_CATEGORIES.map((cat) => ({
        ...cat,
        skills: skills.filter((s) => s.category === cat.value),
      })).filter((g) => g.skills.length > 0),
    [skills]
  )

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Technical Skills</SectionLabel>
        {isEditMode && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => store.syncSkillsFromProgress()}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors"
            >
              <RefreshCw className="w-3 h-3" />
              Sync from Academy
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-charcoal-600 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
            >
              <Plus className="w-3 h-3" />
              Add
            </button>
          </div>
        )}
      </div>

      {grouped.length === 0 && !showAdd ? (
        <EmptyState
          icon={Code2}
          message="No skills documented"
          hint={isEditMode ? 'Sync from your academy progress or add skills manually.' : 'Enable edit mode to add skills.'}
          action={isEditMode ? { label: 'Add Skill', onClick: () => setShowAdd(true), icon: Plus } : undefined}
        />
      ) : (
        <div className="mt-3 space-y-4">
          {grouped.map((group) => (
            <div key={group.value}>
              <p className="text-[10px] font-semibold text-charcoal-400 uppercase tracking-wider mb-2">
                {group.label}
              </p>
              <div className="space-y-1">
                {group.skills.map((skill) => (
                  <SkillBar
                    key={skill.id}
                    skill={skill}
                    editing={isEditMode}
                    onRemove={() => store.removeSkill(skill.id)}
                    onLevelChange={(level) => store.updateSkill(skill.id, { level })}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddSkillForm
          onAdd={(skill) => {
            store.addSkill(skill)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

// ============================================================
// Projects Section (Resume-style timeline)
// ============================================================

function ResumeProjects() {
  const store = useProfileStore()
  const { projects, isEditMode } = store
  const [showAdd, setShowAdd] = useState(false)

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Project Experience</SectionLabel>
        {isEditMode && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-charcoal-600 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add Project
          </button>
        )}
      </div>

      {projects.length === 0 && !showAdd ? (
        <EmptyState
          icon={Layers}
          message="No projects documented"
          hint={isEditMode
            ? 'Document your Guidewire implementations to showcase your expertise.'
            : 'Enable edit mode to add projects.'}
          action={isEditMode ? { label: 'Add Project', onClick: () => setShowAdd(true), icon: Plus } : undefined}
        />
      ) : (
        <div className="mt-4 space-y-0">
          {projects.map((project, idx) => (
            <ResumeProjectEntry key={project.id} project={project} isLast={idx === projects.length - 1} />
          ))}
        </div>
      )}

      {showAdd && (
        <AddProjectForm
          onAdd={(project) => {
            store.addProject(project)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

function ResumeProjectEntry({ project, isLast }: { project: Project; isLast: boolean }) {
  const store = useProfileStore()
  const { isEditMode } = store
  const [showAddImpl, setShowAddImpl] = useState(false)
  const [expandedImpl, setExpandedImpl] = useState<string | null>(null)

  const duration = project.isCurrent
    ? `${project.startDate} - Present`
    : `${project.startDate}${project.endDate ? ` - ${project.endDate}` : ''}`

  return (
    <div className={cn('relative pl-6', !isLast && 'pb-6')}>
      {/* Timeline line */}
      {!isLast && (
        <div className="absolute left-[7px] top-[20px] bottom-0 w-px bg-charcoal-200" />
      )}
      {/* Timeline dot */}
      <div className="absolute left-0 top-[6px] w-[15px] h-[15px] rounded-full border-2 border-gold-500 bg-white" />

      <div className="group">
        {/* Project header */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h4 className="font-heading font-semibold text-charcoal-900 text-[15px] leading-tight">
              {isEditMode ? (
                <input
                  type="text"
                  value={project.name}
                  onChange={(e) => store.updateProject(project.id, { name: e.target.value })}
                  className="w-full bg-transparent border-b border-dashed border-charcoal-200 focus:border-gold-500 focus:outline-none py-0.5 font-heading font-semibold text-charcoal-900 text-[15px]"
                  placeholder="Project name"
                />
              ) : (
                project.name || 'Untitled Project'
              )}
            </h4>
            <div className="flex items-center gap-2 mt-0.5 text-xs text-charcoal-500">
              {isEditMode ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={project.client}
                    onChange={(e) => store.updateProject(project.id, { client: e.target.value })}
                    className="bg-transparent border-b border-dashed border-charcoal-200 focus:border-gold-500 focus:outline-none py-0 text-xs text-charcoal-500 w-28"
                    placeholder="Client"
                  />
                  <span className="text-charcoal-300">&middot;</span>
                  <input
                    type="text"
                    value={project.role}
                    onChange={(e) => store.updateProject(project.id, { role: e.target.value })}
                    className="bg-transparent border-b border-dashed border-charcoal-200 focus:border-gold-500 focus:outline-none py-0 text-xs text-charcoal-500 w-28"
                    placeholder="Role"
                  />
                </div>
              ) : (
                <>
                  {project.client && <span className="font-medium">{project.client}</span>}
                  {project.client && project.role && <span className="text-charcoal-300">&middot;</span>}
                  {project.role && <span>{project.role}</span>}
                </>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <span className="text-[11px] text-charcoal-400 tabular-nums whitespace-nowrap">{duration}</span>
            {isEditMode && (
              <button
                onClick={() => store.removeProject(project.id)}
                className="opacity-0 group-hover:opacity-100 p-1 rounded text-charcoal-400 hover:text-red-500 transition-all"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Description */}
        <div className="mt-2">
          {isEditMode ? (
            <textarea
              value={project.description}
              onChange={(e) => store.updateProject(project.id, { description: e.target.value })}
              placeholder="Describe the project scope and your contribution..."
              className="w-full px-0 py-1 bg-transparent text-sm text-charcoal-600 resize-none border-b border-dashed border-charcoal-200 focus:border-gold-500 focus:outline-none leading-relaxed"
              rows={2}
            />
          ) : project.description ? (
            <p className="text-sm text-charcoal-600 leading-relaxed">{project.description}</p>
          ) : null}
        </div>

        {/* Responsibilities */}
        {(isEditMode || project.responsibilities.length > 0) && (
          <div className="mt-2">
            {isEditMode ? (
              <EditableList
                items={project.responsibilities}
                onChange={(items) => store.updateProject(project.id, { responsibilities: items })}
                placeholder="Add a key responsibility"
              />
            ) : (
              <ul className="space-y-0.5">
                {project.responsibilities.map((r, i) => (
                  <li key={i} className="text-sm text-charcoal-600 flex items-start gap-2">
                    <span className="w-1 h-1 rounded-full bg-charcoal-400 mt-2 shrink-0" />
                    {r}
                  </li>
                ))}
              </ul>
            )}
          </div>
        )}

        {/* Technologies */}
        {(isEditMode || project.technologies.length > 0) && (
          <div className="mt-2">
            {isEditMode ? (
              <TagInput
                tags={project.technologies}
                onChange={(tags) => store.updateProject(project.id, { technologies: tags })}
                placeholder="e.g. PolicyCenter, Gosu, PCF..."
              />
            ) : (
              <div className="flex flex-wrap gap-1">
                {project.technologies.map((t) => (
                  <span key={t} className="px-2 py-0.5 rounded text-[10px] bg-charcoal-100 text-charcoal-600 font-medium">
                    {t}
                  </span>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Implementations */}
        {(isEditMode || project.implementations.length > 0) && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5">
                <Zap className="w-3 h-3 text-gold-500" />
                <span className="text-[10px] font-semibold text-charcoal-500 uppercase tracking-wider">
                  Key Implementations
                </span>
                {project.implementations.length > 0 && (
                  <span className="text-[10px] text-charcoal-400 tabular-nums">
                    ({project.implementations.length})
                  </span>
                )}
              </div>
              {isEditMode && (
                <button
                  onClick={() => setShowAddImpl(true)}
                  className="flex items-center gap-1 text-[10px] font-medium text-gold-700 bg-gold-50 hover:bg-gold-100 px-2 py-0.5 rounded-lg border border-gold-200 transition-colors"
                >
                  <Plus className="w-2.5 h-2.5" />
                  Add
                </button>
              )}
            </div>

            <div className="space-y-2">
              {project.implementations.map((impl) => (
                <ResumeImplementation
                  key={impl.id}
                  impl={impl}
                  projectId={project.id}
                  isExpanded={expandedImpl === impl.id}
                  onToggle={() => setExpandedImpl(expandedImpl === impl.id ? null : impl.id)}
                />
              ))}
            </div>

            {showAddImpl && (
              <GuidedImplementationWizard
                onAdd={(impl) => {
                  store.addImplementation(project.id, impl)
                  setShowAddImpl(false)
                }}
                onCancel={() => setShowAddImpl(false)}
              />
            )}
          </div>
        )}
      </div>
    </div>
  )
}

// ============================================================
// Implementation Card - Resume style with Problem/Solution/Impact
// ============================================================

function ResumeImplementation({
  impl,
  projectId,
  isExpanded,
  onToggle,
}: {
  impl: Implementation
  projectId: string
  isExpanded: boolean
  onToggle: () => void
}) {
  const store = useProfileStore()
  const { isEditMode } = store
  const blockCount = impl.contentBlocks?.length ?? 0
  const hasSummary = !!(impl.problem || impl.solution || impl.technicalDetails || impl.impact)

  return (
    <div className={cn(
      'rounded-lg border overflow-hidden bg-white transition-all duration-200',
      isExpanded ? 'border-charcoal-300 shadow-sm' : 'border-charcoal-200/60'
    )}>
      {/* ── Collapsed Header ── */}
      <button
        onClick={onToggle}
        className="w-full text-left px-3.5 py-2.5 flex items-center gap-2.5 hover:bg-charcoal-50/60 transition-colors"
      >
        <ChevronRight
          className={cn(
            'w-3.5 h-3.5 text-charcoal-400 shrink-0 transition-transform duration-200',
            isExpanded && 'rotate-90'
          )}
        />
        <span className="px-1.5 py-0.5 rounded text-[9px] font-medium bg-gold-100 text-gold-700 border border-gold-200 uppercase tracking-wider shrink-0">
          {impl.category}
        </span>
        <span className="text-sm font-medium text-charcoal-800 truncate flex-1">
          {impl.title || 'Untitled'}
        </span>

        {/* Indicators */}
        <div className="flex items-center gap-2 shrink-0">
          {blockCount > 0 && !isExpanded && (
            <span className="text-[9px] font-medium text-charcoal-400 bg-charcoal-100 px-1.5 py-0.5 rounded tabular-nums">
              {blockCount} block{blockCount !== 1 ? 's' : ''}
            </span>
          )}
          {isEditMode && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                store.removeImplementation(projectId, impl.id)
              }}
              className="p-0.5 rounded text-charcoal-400 hover:text-red-500 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </button>

      {/* ── Expanded Content ── */}
      {isExpanded && (
        <div className="border-t border-charcoal-200">

          {/* ═══════════════════════════════════════════════════════
              ZONE 1: Quick Summary
              ═══════════════════════════════════════════════════════ */}
          <div className="px-4 pt-4 pb-3">
            <div className="flex items-center gap-2 mb-3">
              <Target className="w-3.5 h-3.5 text-charcoal-400" />
              <span className="text-[10px] font-bold text-charcoal-500 uppercase tracking-[0.1em]">
                Summary
              </span>
            </div>

            {/* 2-column grid: Problem | Solution */}
            <div className="grid grid-cols-2 gap-3">
              <ImplField
                label="Problem"
                value={impl.problem}
                editing={isEditMode}
                onChange={(v) => store.updateImplementation(projectId, impl.id, { problem: v })}
                placeholder="What challenge did you face?"
              />
              <ImplField
                label="Solution"
                value={impl.solution}
                editing={isEditMode}
                onChange={(v) => store.updateImplementation(projectId, impl.id, { solution: v })}
                placeholder="How did you solve it?"
              />
            </div>

            {/* 2-column grid: Technical Details | Impact */}
            <div className="grid grid-cols-2 gap-3 mt-3">
              <ImplField
                label="Technical Details"
                value={impl.technicalDetails}
                editing={isEditMode}
                onChange={(v) => store.updateImplementation(projectId, impl.id, { technicalDetails: v })}
                placeholder="Gosu, PCF, entity extensions, plugins..."
              />
              <ImplField
                label="Impact"
                value={impl.impact}
                editing={isEditMode}
                onChange={(v) => store.updateImplementation(projectId, impl.id, { impact: v })}
                placeholder="Business or technical impact?"
              />
            </div>

            {/* Technologies - full width */}
            {(isEditMode || impl.technologies.length > 0) && (
              <div className="mt-3 pt-3 border-t border-charcoal-100">
                <FieldLabel>Technologies</FieldLabel>
                {isEditMode ? (
                  <TagInput
                    tags={impl.technologies}
                    onChange={(tags) => store.updateImplementation(projectId, impl.id, { technologies: tags })}
                    placeholder="Add technology"
                  />
                ) : (
                  <div className="flex flex-wrap gap-1 mt-1">
                    {impl.technologies.map((t) => (
                      <span key={t} className="px-1.5 py-0.5 rounded text-[10px] bg-charcoal-100 text-charcoal-600 font-medium">
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* ═══════════════════════════════════════════════════════
              ZONE 2: Design Document
              ═══════════════════════════════════════════════════════ */}
          <div className="bg-charcoal-50/40 border-t border-charcoal-200 px-4 pt-4 pb-4">
            {isEditMode ? (
              <ImplementationDocBuilder
                blocks={impl.contentBlocks ?? []}
                onAdd={(type) => store.addContentBlock(projectId, impl.id, type)}
                onUpdate={(blockId, updates) => store.updateContentBlock(projectId, impl.id, blockId, updates)}
                onRemove={(blockId) => store.removeContentBlock(projectId, impl.id, blockId)}
                onMove={(blockId, dir) => store.moveContentBlock(projectId, impl.id, blockId, dir)}
              />
            ) : (
              <ImplementationDocViewer blocks={impl.contentBlocks ?? []} />
            )}
          </div>
        </div>
      )}
    </div>
  )
}

// ============================================================
// Guided Implementation Wizard (step-by-step intake)
// ============================================================

function GuidedImplementationWizard({
  onAdd,
  onCancel,
}: {
  onAdd: (impl: Omit<Implementation, 'id' | 'sortOrder'>) => void
  onCancel: () => void
}) {
  const [step, setStep] = useState(0)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState(IMPL_CATEGORIES[0])
  const [problem, setProblem] = useState('')
  const [solution, setSolution] = useState('')
  const [technicalDetails, setTechnicalDetails] = useState('')
  const [impact, setImpact] = useState('')
  const [technologies, setTechnologies] = useState<string[]>([])

  const steps = [
    {
      label: 'What did you build?',
      content: (
        <div className="space-y-3">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Custom Rating Algorithm, Claim Validation Rules..."
            className="w-full px-3 py-2.5 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            autoFocus
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          >
            {IMPL_CATEGORIES.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      ),
      isValid: title.trim().length > 0,
    },
    {
      label: 'What was the problem?',
      content: (
        <textarea
          value={problem}
          onChange={(e) => setProblem(e.target.value)}
          placeholder="Describe the business need or technical challenge you were solving..."
          rows={3}
          className="w-full px-3 py-2.5 rounded-lg border border-charcoal-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
          autoFocus
        />
      ),
      isValid: true,
    },
    {
      label: 'How did you solve it?',
      content: (
        <div className="space-y-3">
          <textarea
            value={solution}
            onChange={(e) => setSolution(e.target.value)}
            placeholder="Explain your approach, the architecture decisions you made..."
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg border border-charcoal-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            autoFocus
          />
          <textarea
            value={technicalDetails}
            onChange={(e) => setTechnicalDetails(e.target.value)}
            placeholder="Technical specifics: Gosu enhancements, PCF changes, plugin implementations, entity extensions..."
            rows={2}
            className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 text-charcoal-500"
          />
        </div>
      ),
      isValid: true,
    },
    {
      label: 'What was the impact?',
      content: (
        <div className="space-y-3">
          <textarea
            value={impact}
            onChange={(e) => setImpact(e.target.value)}
            placeholder="Quantify the results: improved processing time by 40%, reduced errors by 60%, enabled $2M revenue..."
            rows={2}
            className="w-full px-3 py-2.5 rounded-lg border border-charcoal-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
            autoFocus
          />
          <div>
            <p className="text-[10px] font-medium text-charcoal-500 uppercase tracking-wider mb-1.5">Technologies Used</p>
            <TagInput
              tags={technologies}
              onChange={setTechnologies}
              placeholder="e.g. Gosu, PCF, REST API..."
            />
          </div>
        </div>
      ),
      isValid: true,
    },
  ]

  const currentStep = steps[step]
  const isLastStep = step === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      onAdd({
        title: title.trim(),
        category,
        problem: problem.trim(),
        solution: solution.trim(),
        technicalDetails: technicalDetails.trim(),
        impact: impact.trim(),
        technologies,
      })
    } else {
      setStep(step + 1)
    }
  }

  return (
    <div className="mt-3 rounded-lg border border-gold-200 bg-gradient-to-b from-gold-50/60 to-white overflow-hidden">
      {/* Progress dots */}
      <div className="flex items-center gap-1.5 px-4 pt-3">
        {steps.map((_, i) => (
          <div
            key={i}
            className={cn(
              'h-1 flex-1 rounded-full transition-all duration-300',
              i <= step ? 'bg-gold-500' : 'bg-charcoal-200'
            )}
          />
        ))}
      </div>

      <div className="p-4">
        <p className="text-xs font-semibold text-charcoal-700 mb-3">
          Step {step + 1}: {currentStep.label}
        </p>

        {currentStep.content}

        <div className="flex items-center justify-between mt-4">
          <div>
            {step > 0 && (
              <button
                onClick={() => setStep(step - 1)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors"
              >
                Back
              </button>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={onCancel}
              className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleNext}
              disabled={!currentStep.isValid}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-40"
            >
              {isLastStep ? (
                <>
                  <CheckCircle className="w-3 h-3" />
                  Save
                </>
              ) : (
                <>
                  Next
                  <ChevronRight className="w-3 h-3" />
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

// ============================================================
// Certifications Section
// ============================================================

function ResumeCertifications() {
  const store = useProfileStore()
  const { certifications, isEditMode } = store
  const [showAdd, setShowAdd] = useState(false)

  if (!isEditMode && certifications.length === 0) return null

  return (
    <div className="px-8 py-6">
      <div className="flex items-center justify-between">
        <SectionLabel>Certifications</SectionLabel>
        {isEditMode && (
          <button
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[10px] font-medium text-charcoal-600 bg-charcoal-100 hover:bg-charcoal-200 transition-colors"
          >
            <Plus className="w-3 h-3" />
            Add
          </button>
        )}
      </div>

      {certifications.length === 0 ? (
        <EmptyState
          icon={GraduationCap}
          message="No certifications yet"
          hint="Add your Guidewire certifications and credentials."
          action={{ label: 'Add Certification', onClick: () => setShowAdd(true), icon: Plus }}
        />
      ) : (
        <div className="mt-3 space-y-2">
          {certifications.map((cert) => (
            <div key={cert.id} className="flex items-center gap-3 group py-1">
              <GraduationCap className="w-4 h-4 text-gold-500 shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm font-medium text-charcoal-900">{cert.name}</span>
                <span className="text-xs text-charcoal-400 ml-2">
                  {cert.issuer} &middot; {cert.dateObtained}
                </span>
                {cert.credentialUrl && (
                  <a
                    href={cert.credentialUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-0.5 text-[10px] text-gold-600 hover:text-gold-700 ml-2 font-medium"
                  >
                    View <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                )}
              </div>
              {isEditMode && (
                <button
                  onClick={() => store.removeCertification(cert.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 rounded text-charcoal-400 hover:text-red-500 transition-all"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {showAdd && (
        <AddCertificationForm
          onAdd={(cert) => {
            store.addCertification(cert)
            setShowAdd(false)
          }}
          onCancel={() => setShowAdd(false)}
        />
      )}
    </div>
  )
}

// ============================================================
// Shared Sub-components
// ============================================================

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="text-[11px] font-bold text-charcoal-900 uppercase tracking-[0.12em] border-b-2 border-charcoal-900 pb-1 inline-block">
      {children}
    </h3>
  )
}

function FieldLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-[10px] font-medium text-charcoal-500 uppercase tracking-wider">
      {children}
    </p>
  )
}

function InlineEditableField({
  value,
  onChange,
  placeholder,
  viewPlaceholder,
  editing,
  className,
  placeholderClassName,
  inputClassName,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  viewPlaceholder?: string
  editing: boolean
  className?: string
  placeholderClassName?: string
  inputClassName?: string
}) {
  if (editing) {
    return (
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          'w-full px-2.5 py-1.5 rounded-lg border text-sm bg-transparent focus:outline-none focus:ring-2 focus:ring-gold-500/20',
          inputClassName
        )}
      />
    )
  }
  if (!value) {
    if (viewPlaceholder) return <p className={placeholderClassName}>{viewPlaceholder}</p>
    return null
  }
  return <p className={className}>{value}</p>
}

function InlineEditableTextarea({
  value,
  onChange,
  placeholder,
  viewPlaceholder,
  editing,
  className,
  placeholderClassName,
  inputClassName,
  rows = 3,
}: {
  value: string
  onChange: (v: string) => void
  placeholder: string
  viewPlaceholder?: string
  editing: boolean
  className?: string
  placeholderClassName?: string
  inputClassName?: string
  rows?: number
}) {
  if (editing) {
    return (
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        rows={rows}
        className={cn(
          'w-full px-2.5 py-1.5 rounded-lg border text-sm bg-transparent resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20',
          inputClassName
        )}
      />
    )
  }
  if (!value) {
    if (viewPlaceholder) return <p className={placeholderClassName}>{viewPlaceholder}</p>
    return null
  }
  return <p className={className}>{value}</p>
}

function SocialLink({
  icon: Icon,
  value,
  onChange,
  placeholder,
  editing,
}: {
  icon: React.ElementType
  value: string
  onChange: (v: string) => void
  placeholder: string
  editing: boolean
}) {
  if (editing) {
    return (
      <div className="flex items-center gap-2">
        <Icon className="w-4 h-4 text-charcoal-400" />
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          className="px-2.5 py-1.5 rounded-lg border border-white/20 bg-white/10 text-sm text-charcoal-300 placeholder:text-white/30 focus:outline-none focus:ring-2 focus:ring-gold-500/20 w-48"
        />
      </div>
    )
  }
  if (!value) return null
  return (
    <a
      href={value}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 text-sm text-charcoal-400 hover:text-gold-400 transition-colors"
    >
      <Icon className="w-4 h-4" />
      <span className="truncate max-w-[160px]">
        {value.replace(/^https?:\/\/(www\.)?/, '')}
      </span>
      <ExternalLink className="w-3 h-3" />
    </a>
  )
}

function ImplField({
  label,
  value,
  editing,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  editing: boolean
  onChange: (v: string) => void
  placeholder: string
}) {
  return (
    <div className="min-w-0">
      <FieldLabel>{label}</FieldLabel>
      {editing ? (
        <textarea
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          rows={3}
          className="w-full mt-1 px-2.5 py-2 rounded-lg border border-charcoal-200 bg-white text-[13px] text-charcoal-700 resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500 leading-relaxed"
        />
      ) : value ? (
        <p className="text-[13px] text-charcoal-600 mt-1 leading-relaxed">
          {value}
        </p>
      ) : (
        <p className="text-[13px] text-charcoal-400 italic mt-1">Not specified</p>
      )}
    </div>
  )
}

function SkillBar({
  skill,
  editing,
  onRemove,
  onLevelChange,
}: {
  skill: ProfileSkill
  editing: boolean
  onRemove: () => void
  onLevelChange: (level: SkillLevel) => void
}) {
  const levelIdx = SKILL_LEVELS.indexOf(skill.level)

  return (
    <div className="flex items-center gap-3 group py-0.5">
      <span className="text-sm text-charcoal-700 w-48 truncate shrink-0 font-medium">
        {skill.name}
      </span>
      <div className="flex gap-1 flex-1 max-w-[180px]">
        {SKILL_LEVELS.map((lvl, i) => (
          <button
            key={lvl}
            disabled={!editing}
            onClick={() => editing && onLevelChange(lvl)}
            title={lvl.charAt(0).toUpperCase() + lvl.slice(1)}
            className={cn(
              'h-2 flex-1 rounded-sm transition-all duration-200',
              i <= levelIdx
                ? 'bg-gradient-to-r from-gold-500 to-gold-400'
                : 'bg-charcoal-200',
              editing && 'cursor-pointer hover:scale-y-150'
            )}
          />
        ))}
      </div>
      <span className="text-[10px] text-charcoal-400 capitalize w-20 text-right font-medium">
        {skill.level}
      </span>
      {editing && (
        <button
          onClick={onRemove}
          className="opacity-0 group-hover:opacity-100 p-1 rounded text-charcoal-400 hover:text-red-500 transition-all"
        >
          <X className="w-3 h-3" />
        </button>
      )}
    </div>
  )
}

function TagInput({
  tags,
  onChange,
  placeholder,
}: {
  tags: string[]
  onChange: (tags: string[]) => void
  placeholder: string
}) {
  const [input, setInput] = useState('')

  const addTag = () => {
    const trimmed = input.trim()
    if (trimmed && !tags.includes(trimmed)) {
      onChange([...tags, trimmed])
    }
    setInput('')
  }

  return (
    <div className="mt-1 space-y-1.5">
      <div className="flex flex-wrap gap-1">
        {tags.map((tag) => (
          <Badge
            key={tag}
            variant="secondary"
            className="text-[10px] bg-charcoal-100 text-charcoal-600 border-0 gap-1 pr-1 pl-2"
          >
            {tag}
            <button
              onClick={() => onChange(tags.filter((t) => t !== tag))}
              className="ml-0.5 p-0.5 rounded hover:bg-charcoal-200 transition-colors"
            >
              <X className="w-2.5 h-2.5" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addTag()
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white text-sm text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        />
        <button
          onClick={addTag}
          disabled={!input.trim()}
          className="px-3 py-1.5 rounded-lg bg-charcoal-100 text-xs font-medium text-charcoal-600 hover:bg-charcoal-200 transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function EditableList({
  items,
  onChange,
  placeholder,
}: {
  items: string[]
  onChange: (items: string[]) => void
  placeholder: string
}) {
  const [input, setInput] = useState('')

  const addItem = () => {
    const trimmed = input.trim()
    if (trimmed) {
      onChange([...items, trimmed])
      setInput('')
    }
  }

  return (
    <div className="space-y-1">
      {items.map((item, i) => (
        <div key={i} className="flex items-start gap-2 group">
          <span className="w-1 h-1 rounded-full bg-charcoal-400 mt-2 shrink-0" />
          <span className="flex-1 text-sm text-charcoal-600">{item}</span>
          <button
            onClick={() => onChange(items.filter((_, idx) => idx !== i))}
            className="opacity-0 group-hover:opacity-100 p-0.5 rounded text-charcoal-400 hover:text-red-500 transition-all"
          >
            <Minus className="w-3 h-3" />
          </button>
        </div>
      ))}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              addItem()
            }
          }}
          placeholder={placeholder}
          className="flex-1 px-3 py-1.5 rounded-lg border border-charcoal-200 bg-white text-sm text-charcoal-700 focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        />
        <button
          onClick={addItem}
          disabled={!input.trim()}
          className="px-3 py-1.5 rounded-lg bg-charcoal-100 text-xs font-medium text-charcoal-600 hover:bg-charcoal-200 transition-colors disabled:opacity-40"
        >
          Add
        </button>
      </div>
    </div>
  )
}

function EmptyState({
  icon: Icon,
  message,
  hint,
  action,
}: {
  icon: React.ElementType
  message: string
  hint: string
  action?: { label: string; onClick: () => void; icon: React.ElementType }
}) {
  return (
    <div className="text-center py-8">
      <div className="w-10 h-10 rounded-xl bg-charcoal-100 flex items-center justify-center mx-auto mb-2">
        <Icon className="w-5 h-5 text-charcoal-400" />
      </div>
      <p className="text-sm font-medium text-charcoal-600">{message}</p>
      <p className="text-xs text-charcoal-400 mt-1 max-w-xs mx-auto leading-relaxed">{hint}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors"
        >
          <action.icon className="w-3 h-3" />
          {action.label}
        </button>
      )}
    </div>
  )
}

// ============================================================
// Add Forms
// ============================================================

function AddSkillForm({
  onAdd,
  onCancel,
}: {
  onAdd: (skill: Omit<ProfileSkill, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [level, setLevel] = useState<SkillLevel>('beginner')
  const [category, setCategory] = useState<SkillCategory>('general')

  return (
    <div className="mt-4 p-4 rounded-lg border border-gold-200 bg-gold-50/50 space-y-3">
      <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider">Add Skill</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Skill name (e.g. Gosu Programming)"
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        autoFocus
      />
      <div className="flex gap-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as SkillCategory)}
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          {SKILL_CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>{c.label}</option>
          ))}
        </select>
        <select
          value={level}
          onChange={(e) => setLevel(e.target.value as SkillLevel)}
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        >
          {SKILL_LEVELS.map((l) => (
            <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors">Cancel</button>
        <button
          onClick={() => { if (name.trim()) onAdd({ name: name.trim(), level, category }) }}
          disabled={!name.trim()}
          className="px-4 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-40"
        >
          Add Skill
        </button>
      </div>
    </div>
  )
}

function AddCertificationForm({
  onAdd,
  onCancel,
}: {
  onAdd: (cert: Omit<Certification, 'id'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [issuer, setIssuer] = useState('')
  const [date, setDate] = useState('')
  const [url, setUrl] = useState('')

  return (
    <div className="mt-4 p-4 rounded-lg border border-gold-200 bg-gold-50/50 space-y-3">
      <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider">Add Certification</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. Guidewire Certified Associate"
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        autoFocus
      />
      <div className="flex gap-3">
        <input
          type="text"
          value={issuer}
          onChange={(e) => setIssuer(e.target.value)}
          placeholder="Issuing organization"
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
        <input
          type="text"
          value={date}
          onChange={(e) => setDate(e.target.value)}
          placeholder="e.g. Jan 2025"
          className="w-36 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
      </div>
      <input
        type="url"
        value={url}
        onChange={(e) => setUrl(e.target.value)}
        placeholder="Credential URL (optional)"
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors">Cancel</button>
        <button
          onClick={() => {
            if (name.trim() && issuer.trim() && date.trim())
              onAdd({ name: name.trim(), issuer: issuer.trim(), dateObtained: date.trim(), credentialUrl: url.trim() || undefined })
          }}
          disabled={!name.trim() || !issuer.trim() || !date.trim()}
          className="px-4 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-40"
        >
          Add Certification
        </button>
      </div>
    </div>
  )
}

function AddProjectForm({
  onAdd,
  onCancel,
}: {
  onAdd: (project: Omit<Project, 'id' | 'implementations' | 'sortOrder'>) => void
  onCancel: () => void
}) {
  const [name, setName] = useState('')
  const [client, setClient] = useState('')
  const [role, setRole] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [isCurrent, setIsCurrent] = useState(false)
  const [description, setDescription] = useState('')

  return (
    <div className="mt-4 p-4 rounded-lg border border-gold-200 bg-gold-50/50 space-y-3">
      <p className="text-xs font-semibold text-charcoal-700 uppercase tracking-wider">Add Project</p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="e.g. PolicyCenter Cloud Migration"
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20 focus:border-gold-500"
        autoFocus
      />
      <div className="flex gap-3">
        <input
          type="text"
          value={client}
          onChange={(e) => setClient(e.target.value)}
          placeholder="Client / Company"
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
        <input
          type="text"
          value={role}
          onChange={(e) => setRole(e.target.value)}
          placeholder="e.g. GW Developer"
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
      </div>
      <div className="flex gap-3 items-center">
        <input
          type="text"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
          placeholder="Start (e.g. Jan 2024)"
          className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
        />
        {!isCurrent && (
          <input
            type="text"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            placeholder="End (e.g. Dec 2024)"
            className="flex-1 px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-gold-500/20"
          />
        )}
        <label className="flex items-center gap-2 text-xs text-charcoal-600 shrink-0 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={isCurrent}
            onChange={(e) => setIsCurrent(e.target.checked)}
            className="rounded border-charcoal-300"
          />
          Current
        </label>
      </div>
      <textarea
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Describe the project scope, your role, and key outcomes..."
        rows={3}
        className="w-full px-3 py-2 rounded-lg border border-charcoal-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-gold-500/20"
      />
      <div className="flex justify-end gap-2">
        <button onClick={onCancel} className="px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-500 hover:bg-charcoal-100 transition-colors">Cancel</button>
        <button
          onClick={() => {
            if (name.trim())
              onAdd({
                name: name.trim(),
                client: client.trim(),
                role: role.trim(),
                startDate: startDate.trim(),
                endDate: endDate.trim() || undefined,
                isCurrent,
                description: description.trim(),
                responsibilities: [],
                technologies: [],
              })
          }}
          disabled={!name.trim()}
          className="px-4 py-1.5 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:bg-charcoal-800 transition-colors disabled:opacity-40"
        >
          Add Project
        </button>
      </div>
    </div>
  )
}
