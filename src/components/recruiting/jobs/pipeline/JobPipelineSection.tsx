'use client'

import { useState, useEffect } from 'react'
import { PipelineViewToggle, type PipelineViewMode } from './PipelineViewToggle'
import { JobPipelineKanban } from './JobPipelineKanban'
import { PipelineTableView } from './PipelineTableView'
import { PipelineChartView } from './PipelineChartView'
import type { Submission } from '@/configs/entities/submissions.config'

interface JobPipelineSectionProps {
  jobId: string
  submissions: Submission[]
  onRefresh?: () => void
}

const STORAGE_KEY = 'pipeline-view-preference'

export function JobPipelineSection({ jobId, submissions, onRefresh }: JobPipelineSectionProps) {
  // Initialize view from localStorage
  const [view, setView] = useState<PipelineViewMode>(() => {
    if (typeof window === 'undefined') return 'kanban'
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored && ['kanban', 'table', 'chart'].includes(stored)) {
      return stored as PipelineViewMode
    }
    return 'kanban'
  })

  // Persist view preference
  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, view)
  }, [view])

  return (
    <div className="space-y-4">
      {/* Header with view toggle */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-semibold text-charcoal-900">Pipeline</h2>
          <p className="text-sm text-charcoal-500">
            {submissions.filter((s) => !['rejected', 'withdrawn'].includes(s.status)).length} candidates in pipeline
          </p>
        </div>
        <PipelineViewToggle view={view} onViewChange={setView} />
      </div>

      {/* View content */}
      {view === 'kanban' && (
        <JobPipelineKanban jobId={jobId} submissions={submissions} onRefresh={onRefresh} />
      )}
      {view === 'table' && (
        <PipelineTableView submissions={submissions} onRefresh={onRefresh} />
      )}
      {view === 'chart' && <PipelineChartView submissions={submissions} />}
    </div>
  )
}
