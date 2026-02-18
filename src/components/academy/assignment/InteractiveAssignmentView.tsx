'use client'

import React, { useEffect, useMemo, useState, useCallback, useRef } from 'react'
import { Trophy, CheckCircle } from 'lucide-react'
import type {
  InteractiveAssignment,
  ExerciseGroup,
  ExerciseWorkRecord,
} from '@/lib/academy/types'
import { useAssignmentWorkStore } from '@/lib/academy/assignment-work-store'
import { useGuruUI } from '@/lib/academy/guru-ui-store'
import { AssignmentBlockRenderer } from './AssignmentBlockRenderer'
import { AssignmentSidebar } from './AssignmentSidebar'
import { AssignmentTimer } from './AssignmentTimer'

import '../lesson/mentorship.css'
import '../lesson/synthesized/synthesized.css'

interface InteractiveAssignmentViewProps {
  assignment: InteractiveAssignment
}

export function InteractiveAssignmentView({ assignment }: InteractiveAssignmentViewProps) {
  const mainRef = useRef<HTMLDivElement>(null)
  const guruUI = useGuruUI()

  // Store
  const store = useAssignmentWorkStore()
  const workRecord = store.getAssignment(assignment.assignmentId)
  const exerciseRecords = workRecord.exercises

  // Track active exercise by scroll
  const [activeExerciseId, setActiveExerciseId] = useState<string | null>(null)
  const [showCompletion, setShowCompletion] = useState(false)

  // Tracked revealed solution steps (local state synced with store)
  const [revealedSolutionSteps, setRevealedSolutionSteps] = useState<Set<string>>(new Set())

  // Extract exercise groups
  const exercises = useMemo(
    () => assignment.blocks.filter((b): b is ExerciseGroup => b.type === 'exercise_group'),
    [assignment.blocks]
  )

  // Start assignment on mount
  useEffect(() => {
    store.startAssignment(assignment.assignmentId)
  }, [assignment.assignmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Track active exercise via scroll
  useEffect(() => {
    const el = mainRef.current
    if (!el) return

    function handleScroll() {
      const exerciseElements = el!.querySelectorAll('[id^="block-ex-"]')
      let closest: string | null = null
      let closestDist = Infinity

      exerciseElements.forEach((blockEl) => {
        const rect = blockEl.getBoundingClientRect()
        const mainRect = el!.getBoundingClientRect()
        const dist = Math.abs(rect.top - mainRect.top)
        if (dist < closestDist) {
          closestDist = dist
          closest = blockEl.id.replace('block-', '')
        }
      })

      if (closest) {
        setActiveExerciseId(closest)
        store.startExercise(assignment.assignmentId, closest)
      }
    }

    el.addEventListener('scroll', handleScroll, { passive: true })
    return () => el.removeEventListener('scroll', handleScroll)
  }, [assignment.assignmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Scroll to exercise
  const scrollToExercise = useCallback((exerciseId: string) => {
    const el = document.getElementById(`block-${exerciseId}`)
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
  }, [])

  // Handlers
  const handleStepToggle = useCallback((exerciseId: string, stepId: string, done: boolean) => {
    if (done) {
      store.markStepDone(assignment.assignmentId, exerciseId, stepId)
    } else {
      store.unmarkStepDone(assignment.assignmentId, exerciseId, stepId)
    }
  }, [assignment.assignmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleWriteItDownSubmit = useCallback((exerciseId: string, blockId: string, answer: string, correct?: boolean, feedback?: string) => {
    store.recordWriteItDownAnswer(assignment.assignmentId, exerciseId, blockId, answer, correct, feedback)
  }, [assignment.assignmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleCodeSubmit = useCallback((exerciseId: string, blockId: string, code: string, feedback?: string, score?: number) => {
    store.recordCodeSubmission(assignment.assignmentId, exerciseId, blockId, code, feedback, score)
  }, [assignment.assignmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleVerificationToggle = useCallback((exerciseId: string, stepId: string, checked: boolean) => {
    if (checked) {
      store.checkVerificationStep(assignment.assignmentId, exerciseId, stepId)
    } else {
      store.uncheckVerificationStep(assignment.assignmentId, exerciseId, stepId)
    }
  }, [assignment.assignmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRevealHint = useCallback((exerciseId: string) => {
    store.revealHint(assignment.assignmentId, exerciseId)
  }, [assignment.assignmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleRevealSolution = useCallback((exerciseId: string, blockId: string) => {
    store.revealSolutionStep(assignment.assignmentId, exerciseId)
    setRevealedSolutionSteps((prev) => new Set([...prev, blockId]))
  }, [assignment.assignmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  const handleTimeUpdate = useCallback((aid: string, eid: string, secs: number) => {
    store.updateTimeSpent(aid, eid, secs)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // Completion check
  const canComplete = useMemo(() => {
    if (workRecord.status === 'completed') return false
    // Check each exercise has at least some progress
    for (const ex of exercises) {
      const record = exerciseRecords[ex.id]
      if (!record || record.stepsCompleted.length === 0) return false
    }
    return true
  }, [workRecord.status, exercises, exerciseRecords])

  const handleComplete = useCallback(() => {
    store.completeAssignment(assignment.assignmentId)
    setShowCompletion(true)
    setTimeout(() => setShowCompletion(false), 4000)
  }, [assignment.assignmentId]) // eslint-disable-line react-hooks/exhaustive-deps

  // Progress calculation
  const progressStats = useMemo(() => {
    let totalSteps = 0
    let completedSteps = 0
    let totalWriteItDowns = 0
    let answeredWriteItDowns = 0
    let totalCodeTasks = 0
    let submittedCodeTasks = 0

    for (const block of assignment.blocks) {
      if (block.type === 'step' && block.requiresAction) {
        totalSteps++
        const record = exerciseRecords[block.exerciseId]
        if (record?.stepsCompleted.includes(block.id)) completedSteps++
      }
      if (block.type === 'write_it_down') {
        totalWriteItDowns++
        const record = exerciseRecords[block.exerciseId]
        if (record?.writeItDownAnswers[block.id]) answeredWriteItDowns++
      }
      if (block.type === 'code_task') {
        totalCodeTasks++
        const record = exerciseRecords[block.exerciseId]
        if (record?.codeSubmissions[block.id]) submittedCodeTasks++
      }
    }

    const totalItems = totalSteps + totalWriteItDowns + totalCodeTasks
    const completedItems = completedSteps + answeredWriteItDowns + submittedCodeTasks
    const pct = totalItems > 0 ? Math.round((completedItems / totalItems) * 100) : 0

    return { totalItems, completedItems, pct, totalSteps, completedSteps, totalWriteItDowns, answeredWriteItDowns, totalCodeTasks, submittedCodeTasks }
  }, [assignment.blocks, exerciseRecords])

  // SVG ring
  const circumference = 2 * Math.PI * 24
  const dashOffset = circumference * (1 - progressStats.pct / 100)

  const levelLabel = assignment.complexityLevel.charAt(0).toUpperCase() + assignment.complexityLevel.slice(1)

  return (
    <div className="mentorship-view flex-1 flex flex-col overflow-hidden">
      <div className="m-layout">

        {/* LEFT SIDEBAR */}
        <div className="m-sidebar-left">
          <div className="m-sensei-card">
            <div className="m-sensei-avatar">G</div>
            <div style={{ minWidth: 0 }}>
              <div className="m-sensei-name">Guidewire Guru</div>
              <div className="m-sensei-role">Assignment Guide</div>
              <div className="m-sensei-status">Available</div>
            </div>
          </div>

          <AssignmentSidebar
            exercises={exercises}
            exerciseRecords={exerciseRecords}
            activeExerciseId={activeExerciseId}
            onExerciseClick={scrollToExercise}
          />
        </div>

        {/* MAIN CONTENT */}
        <main className="m-main" ref={mainRef}>

          {/* Assignment header */}
          <div className="m-lesson-header" style={{ animation: 'm-gentle-in 0.7s ease both' }}>
            <div className="m-lesson-tag">
              <span className="m-lesson-tag-dot" />
              Hands-On Assignment
            </div>
            <h1 className="m-lesson-title" style={{ fontSize: 32 }}>{assignment.title}</h1>
            <div className="m-time-row">
              <span>~{assignment.estimatedMinutes} minutes</span>
              <span className="m-time-dot" />
              <span>{assignment.totalExercises} exercises</span>
              <span className="m-time-dot" />
              <span>{levelLabel}</span>
              {workRecord.status === 'completed' && (
                <>
                  <span className="m-time-dot" />
                  <span style={{ color: 'var(--m-accent-sage)' }}>Completed</span>
                </>
              )}
            </div>
          </div>

          {/* Render all blocks */}
          {assignment.blocks.map((block) => (
            <AssignmentBlockRenderer
              key={block.id}
              block={block}
              assignmentId={assignment.assignmentId}
              exerciseRecords={exerciseRecords}
              revealedSolutionSteps={revealedSolutionSteps}
              onStepToggle={handleStepToggle}
              onWriteItDownSubmit={handleWriteItDownSubmit}
              onCodeSubmit={handleCodeSubmit}
              onVerificationToggle={handleVerificationToggle}
              onRevealHint={handleRevealHint}
              onRevealSolution={handleRevealSolution}
            />
          ))}

          {/* Complete / Completed */}
          {workRecord.status === 'completed' ? (
            <div className="m-completion">
              <div className="m-completion-icon">
                <CheckCircle size={24} />
              </div>
              <div style={{ flex: 1 }}>
                <h3>Assignment Complete!</h3>
                <p>
                  {workRecord.completedAt
                    ? `Completed on ${new Date(workRecord.completedAt).toLocaleDateString()}`
                    : 'Great work on this assignment!'}
                </p>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '32px 0' }}>
              <button
                className="m-complete-btn"
                onClick={handleComplete}
                disabled={!canComplete}
              >
                <Trophy size={18} />
                Complete Assignment
              </button>
              {!canComplete && (
                <p style={{ fontSize: 12, color: 'var(--m-text-muted)', marginTop: 8 }}>
                  Complete steps in all exercises to finish
                </p>
              )}
            </div>
          )}

          {/* Progress footer */}
          <div className="m-progress-footer">
            <div className="m-progress-bar">
              <div className="m-progress-fill" style={{ width: `${progressStats.pct}%` }} />
            </div>
            <div className="m-progress-label">
              <strong>{progressStats.pct}%</strong> complete
            </div>
          </div>

          <div style={{ height: 40 }} />
        </main>

        {/* RIGHT SIDEBAR */}
        <aside className="m-sidebar-right">

          {/* Progress ring */}
          <div className="m-aside-section">
            <div className="m-aside-label">Your Progress</div>
            <div className="m-progress-block">
              <div style={{ width: 56, height: 56, position: 'relative', flexShrink: 0 }}>
                <svg width="56" height="56" viewBox="0 0 56 56">
                  <circle className="m-ring-bg" cx="28" cy="28" r="24" />
                  <circle
                    className="m-ring-fill"
                    cx="28" cy="28" r="24"
                    strokeDasharray={circumference}
                    strokeDashoffset={dashOffset}
                    transform="rotate(-90 28 28)"
                  />
                </svg>
                <div className="m-ring-text">{progressStats.pct}%</div>
              </div>
              <div className="m-progress-detail">
                <strong>{progressStats.completedItems} of {progressStats.totalItems} items</strong>
                completed so far
              </div>
            </div>
          </div>

          {/* Timer */}
          <div className="m-aside-section">
            <div className="m-aside-label">Time Spent</div>
            <AssignmentTimer
              assignmentId={assignment.assignmentId}
              exerciseId={activeExerciseId}
              onTick={handleTimeUpdate}
              totalTimeSpent={workRecord.totalTimeSpentSeconds}
            />
          </div>

          {/* Skills */}
          {assignment.skillsCovered.length > 0 && (
            <div className="m-aside-section">
              <div className="m-aside-label">Skills Being Tested</div>
              <div className="m-concept-tags">
                {assignment.skillsCovered.map((skill) => (
                  <span key={skill} className="m-concept-pill">{skill}</span>
                ))}
              </div>
            </div>
          )}

          {/* Metrics */}
          <div className="m-aside-section">
            <div className="m-aside-label">Assignment Metrics</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              <MetricRow label="Steps done" value={`${progressStats.completedSteps}/${progressStats.totalSteps}`} />
              <MetricRow label="Questions answered" value={`${progressStats.answeredWriteItDowns}/${progressStats.totalWriteItDowns}`} />
              <MetricRow label="Code submitted" value={`${progressStats.submittedCodeTasks}/${progressStats.totalCodeTasks}`} />
              <MetricRow label="Hints used" value={String(workRecord.totalHintsUsed)} />
              <MetricRow label="Solutions revealed" value={String(workRecord.totalSolutionReveals)} />
            </div>
          </div>

          {/* Ask Guru */}
          <div className="m-aside-section">
            <div className="m-ask-sensei" onClick={() => guruUI.open()}>
              <div className="m-ask-sensei-icon">💬</div>
              <div className="m-ask-sensei-text">
                <strong>Stuck on something?</strong>
                Ask Guidewire Guru for help
              </div>
            </div>
          </div>

        </aside>
      </div>

      {/* Completion toast */}
      {showCompletion && (
        <div className="m-toast">
          <div className="m-toast-inner">
            <div className="m-completion-icon" style={{ width: 40, height: 40 }}>
              <Trophy size={18} />
            </div>
            <div>
              <p className="m-display" style={{ fontWeight: 600, fontSize: 14 }}>Assignment Completed!</p>
              <p style={{ fontSize: 12, color: 'var(--m-text-muted)' }}>Keep up the great work</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

function MetricRow({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span style={{ fontSize: 12, color: 'var(--m-text-muted)' }}>{label}</span>
      <span className="m-mono" style={{ fontSize: 12, fontWeight: 600, color: 'var(--m-text-primary)' }}>
        {value}
      </span>
    </div>
  )
}
