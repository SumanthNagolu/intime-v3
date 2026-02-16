'use client'

import { useEffect, useRef, useCallback } from 'react'
import { useAcademyStore } from './progress-store'
import { trpc } from '@/lib/trpc/client'
import type { LessonProgress, LessonStatus, KnowledgeCheckAnswer } from './types'

// ============================================================
// High-water-mark merge: progress never goes backward
// ============================================================

const STATUS_RANK: Record<LessonStatus, number> = {
  locked: 0,
  available: 1,
  in_progress: 2,
  completed: 3,
}

function mergeLesson(local: LessonProgress | undefined, server: LessonProgress | undefined): LessonProgress {
  if (!local && !server) {
    return { status: 'locked', scrollProgress: 0, checkpointsCompleted: [], videosWatched: [], assignmentSubmitted: false }
  }
  if (!local) return server!
  if (!server) return local

  // Status: higher rank wins
  const localRank = STATUS_RANK[local.status] ?? 0
  const serverRank = STATUS_RANK[server.status] ?? 0
  const status = localRank >= serverRank ? local.status : server.status

  // Scroll progress: max wins
  const scrollProgress = Math.max(local.scrollProgress ?? 0, server.scrollProgress ?? 0)

  // Arrays: set union
  const checkpointsCompleted = Array.from(new Set([
    ...(local.checkpointsCompleted ?? []),
    ...(server.checkpointsCompleted ?? []),
  ]))
  const videosWatched = Array.from(new Set([
    ...(local.videosWatched ?? []),
    ...(server.videosWatched ?? []),
  ]))
  const slidesVisited = Array.from(new Set([
    ...(local.slidesVisited ?? []),
    ...(server.slidesVisited ?? []),
  ]))
  const blocksVisited = Array.from(new Set([
    ...(local.blocksVisited ?? []),
    ...(server.blocksVisited ?? []),
  ]))

  // Assignment: logical OR
  const assignmentSubmitted = local.assignmentSubmitted || server.assignmentSubmitted
  const assignmentResponse = local.assignmentResponse ?? server.assignmentResponse

  // Knowledge check answers: merge objects, local overrides for same key
  const knowledgeCheckAnswers: Record<string, KnowledgeCheckAnswer> = {
    ...(server.knowledgeCheckAnswers ?? {}),
    ...(local.knowledgeCheckAnswers ?? {}),
  }

  // CompletedAt: earliest non-null
  const completedAt = local.completedAt ?? server.completedAt

  // Score: max
  const score = Math.max(local.score ?? 0, server.score ?? 0) || undefined

  return {
    status,
    scrollProgress,
    checkpointsCompleted,
    videosWatched,
    slidesVisited: slidesVisited.length > 0 ? slidesVisited : undefined,
    blocksVisited: blocksVisited.length > 0 ? blocksVisited : undefined,
    assignmentSubmitted,
    assignmentResponse,
    knowledgeCheckAnswers: Object.keys(knowledgeCheckAnswers).length > 0 ? knowledgeCheckAnswers : undefined,
    completedAt,
    score,
  }
}

export function mergeProgress(
  local: Record<string, LessonProgress>,
  server: Record<string, LessonProgress>,
): Record<string, LessonProgress> {
  const allKeys = new Set([...Object.keys(local), ...Object.keys(server)])
  const merged: Record<string, LessonProgress> = {}
  for (const key of allKeys) {
    merged[key] = mergeLesson(local[key], server[key])
  }
  return merged
}

// ============================================================
// useProgressSync — mounts in academy pages
// ============================================================

export function useProgressSync() {
  const hasMergedRef = useRef(false)
  const isSavingRef = useRef(false)

  const { data: serverData, isLoading } = trpc.academy.guidewire.getProgress.useQuery(
    undefined,
    { staleTime: Infinity, refetchOnWindowFocus: false }
  )

  const saveMutation = trpc.academy.guidewire.saveProgress.useMutation()
  const saveMutationRef = useRef(saveMutation)
  saveMutationRef.current = saveMutation

  const saveToServer = useCallback(() => {
    if (isSavingRef.current) return
    isSavingRef.current = true

    const state = useAcademyStore.getState()
    const payload = {
      lessonProgress: state.lessons as Record<string, unknown>,
      currentLesson: state.currentLesson,
      streakCount: state.streak,
      lastActiveDate: state.lastActiveDate,
      readinessIndex: state.readinessIndex,
    }

    saveMutationRef.current.mutate(payload, {
      onSettled: () => {
        isSavingRef.current = false
      },
    })
  }, [])

  // Merge on first successful fetch
  useEffect(() => {
    if (isLoading || hasMergedRef.current || !serverData) return
    hasMergedRef.current = true

    const localState = useAcademyStore.getState()
    const serverLessons = (serverData.lessonProgress ?? {}) as Record<string, LessonProgress>
    const merged = mergeProgress(localState.lessons, serverLessons)

    // Apply merged state
    useAcademyStore.setState({
      lessons: merged,
      currentLesson: localState.currentLesson ?? serverData.currentLesson,
      streak: Math.max(localState.streak, serverData.streakCount),
      lastActiveDate: localState.lastActiveDate ?? serverData.lastActiveDate,
      readinessIndex: Math.max(localState.readinessIndex, serverData.readinessIndex),
    })

    // Recalculate derived state
    const recalc = (useAcademyStore.getState() as Record<string, unknown>).recalculateProgress
    if (typeof recalc === 'function') recalc()
  }, [isLoading, serverData])

  // Wire up the _serverSaveNow callback for immediate saves
  useEffect(() => {
    useAcademyStore.setState({ _serverSaveNow: saveToServer })
    return () => {
      useAcademyStore.setState({ _serverSaveNow: undefined })
    }
  }, [saveToServer])

  // Periodic save every 30s
  useEffect(() => {
    const interval = setInterval(saveToServer, 30_000)
    return () => clearInterval(interval)
  }, [saveToServer])

  // Save on tab hide + beforeunload
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden') {
        saveToServer()
      }
    }
    const handleBeforeUnload = () => {
      // Use sendBeacon-style: fire and forget
      saveToServer()
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('beforeunload', handleBeforeUnload)
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('beforeunload', handleBeforeUnload)
    }
  }, [saveToServer])
}
