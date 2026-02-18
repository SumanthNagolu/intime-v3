'use client'

import React, { useState, useEffect } from 'react'
import {
  FlaskConical,
  Clock,
  ChevronRight,
  Loader2,
  CheckCircle,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { InteractiveAssignment } from '@/lib/academy/types'
import { loadInteractiveAssignment } from '@/lib/academy/content-loader'
import { useAssignmentWorkStore } from '@/lib/academy/assignment-work-store'
import { InteractiveAssignmentView } from '../assignment/InteractiveAssignmentView'

interface LabMeta {
  chapterSlug: string
  assignmentNumber: number
  title: string
  desc: string
  minutes: number
  exercises: number
  level: string
  skills: string[]
}

const AVAILABLE_LABS: LabMeta[] = [
  {
    chapterSlug: 'ch07-insurance-suite-fundamentals',
    assignmentNumber: 1,
    title: 'Introduction to Guidewire Configuration',
    desc: 'Explore PolicyCenter workspace layout and core configuration concepts',
    minutes: 45,
    exercises: 3,
    level: 'Exploratory',
    skills: ['PolicyCenter Navigation', 'Application Fundamentals', 'Workspace Understanding'],
  },
  {
    chapterSlug: 'ch09-claimcenter-configuration',
    assignmentNumber: 4,
    title: 'Writing Gosu Business Rules',
    desc: 'Implement Gosu validation rules for claim submissions',
    minutes: 75,
    exercises: 3,
    level: 'Development',
    skills: ['Gosu Programming', 'Business Rules', 'Validation Rules'],
  },
  {
    chapterSlug: 'ch11-insurance-suite-integration',
    assignmentNumber: 8,
    title: 'RESTful Web Services Integration',
    desc: 'Integrate ClaimCenter with external services via REST APIs',
    minutes: 90,
    exercises: 3,
    level: 'Development',
    skills: ['REST APIs', 'Integration Patterns', 'JSON Handling', 'Error Handling'],
  },
]

function LabCard({
  lab,
  status,
  onStart,
}: {
  lab: LabMeta
  status: 'not_started' | 'in_progress' | 'completed'
  onStart: () => void
}) {
  return (
    <div className="rounded-xl border border-charcoal-200/60 bg-white shadow-elevation-sm overflow-hidden hover:shadow-elevation-md hover:-translate-y-0.5 transition-all">
      <div className="p-6">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-medium bg-charcoal-100 text-charcoal-600 uppercase tracking-wider">
              {lab.level}
            </span>
            {status === 'completed' && (
              <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700 border border-green-200">
                <CheckCircle className="w-3 h-3" />
                Done
              </span>
            )}
            {status === 'in_progress' && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gold-50 text-gold-700 border border-gold-200">
                In Progress
              </span>
            )}
          </div>
          <FlaskConical className="w-5 h-5 text-charcoal-300" />
        </div>

        <h3 className="font-heading font-semibold text-charcoal-900 text-base mb-1.5">
          {lab.title}
        </h3>
        <p className="text-xs text-charcoal-500 leading-relaxed mb-4">
          {lab.desc}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {lab.skills.slice(0, 3).map((skill) => (
            <span
              key={skill}
              className="px-2 py-0.5 rounded text-[10px] bg-charcoal-50 text-charcoal-600 border border-charcoal-100"
            >
              {skill}
            </span>
          ))}
          {lab.skills.length > 3 && (
            <span className="px-2 py-0.5 rounded text-[10px] bg-charcoal-50 text-charcoal-500">
              +{lab.skills.length - 3} more
            </span>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-[10px] text-charcoal-400 uppercase tracking-wider">
            <span className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              ~{lab.minutes} min
            </span>
            <span>&bull;</span>
            <span>{lab.exercises} exercises</span>
          </div>
          <button
            onClick={onStart}
            className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-charcoal-900 text-white text-xs font-medium hover:-translate-y-0.5 hover:shadow-lg transition-all"
          >
            {status === 'not_started' ? 'Start' : status === 'in_progress' ? 'Continue' : 'Review'}
            <ChevronRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  )
}

export function LabsMode() {
  const [activeLab, setActiveLab] = useState<InteractiveAssignment | null>(null)
  const [loadingLab, setLoadingLab] = useState<string | null>(null)
  const workStore = useAssignmentWorkStore()

  const handleStartLab = async (lab: LabMeta) => {
    setLoadingLab(lab.chapterSlug)
    try {
      const assignment = await loadInteractiveAssignment(lab.chapterSlug, lab.assignmentNumber)
      if (assignment) {
        setActiveLab(assignment)
      }
    } finally {
      setLoadingLab(null)
    }
  }

  const getLabStatus = (lab: LabMeta): 'not_started' | 'in_progress' | 'completed' => {
    const chSlug = lab.chapterSlug.replace(/-/g, '').replace(/ch(\d+)/, 'ch$1')
    const possibleIds = [
      `${lab.chapterSlug.match(/ch\d+/)?.[0] ?? ''}-a${String(lab.assignmentNumber).padStart(2, '0')}`,
    ]

    for (const id of possibleIds) {
      const record = workStore.getAssignment(id)
      if (record.status === 'completed') return 'completed'
      if (record.status === 'in_progress') return 'in_progress'
    }
    return 'not_started'
  }

  // Active lab view
  if (activeLab) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center gap-3 px-4 py-2 bg-white border-b border-charcoal-200/60 shrink-0">
          <button
            onClick={() => setActiveLab(null)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-charcoal-600 hover:bg-charcoal-100 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Back to Labs
          </button>
          <span className="text-xs text-charcoal-400">|</span>
          <span className="text-xs font-medium text-charcoal-700 truncate">{activeLab.title}</span>
        </div>
        <div className="flex-1 overflow-hidden">
          <InteractiveAssignmentView assignment={activeLab} />
        </div>
      </div>
    )
  }

  // Labs grid
  return (
    <div className="h-full overflow-y-auto bg-cream">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        <div className="text-center space-y-2">
          <h2 className="font-heading text-xl font-bold text-charcoal-900">Hands-On Labs</h2>
          <p className="text-sm text-charcoal-500">
            Interactive assignments with step-by-step guidance, AI grading, and solution reveals
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4">
          {AVAILABLE_LABS.map((lab) => (
            <LabCard
              key={`${lab.chapterSlug}-${lab.assignmentNumber}`}
              lab={lab}
              status={getLabStatus(lab)}
              onStart={() => handleStartLab(lab)}
            />
          ))}
        </div>

        {loadingLab && (
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-6 h-6 text-gold-500 animate-spin" />
          </div>
        )}

        {AVAILABLE_LABS.length === 0 && (
          <div className="flex flex-col items-center justify-center py-16 space-y-3">
            <FlaskConical className="w-12 h-12 text-charcoal-300" />
            <p className="text-sm text-charcoal-500">No labs available yet.</p>
          </div>
        )}
      </div>
    </div>
  )
}
