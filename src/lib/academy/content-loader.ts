'use client'

import type { ExtractedLesson, InterviewPrepData, KnowledgeChecksData, KnowledgeCheckItem, SynthesizedLesson } from './types'

const CONTENT_BASE = '/academy/guidewire/content'

// Cache for loaded content
const lessonCache = new Map<string, ExtractedLesson>()
const indexCache = new Map<string, any>()
let knowledgeChecksCache: KnowledgeChecksData | null = null

export async function loadLessonContent(
  chapterSlug: string,
  lessonNumber: number
): Promise<ExtractedLesson | null> {
  const key = `${chapterSlug}-l${String(lessonNumber).padStart(2, '0')}`
  if (lessonCache.has(key)) return lessonCache.get(key)!

  try {
    const url = `${CONTENT_BASE}/${chapterSlug}/lesson-${String(lessonNumber).padStart(2, '0')}.json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data: ExtractedLesson = await res.json()
    lessonCache.set(key, data)
    return data
  } catch {
    return null
  }
}

export async function loadChapterIndex(chapterSlug: string): Promise<any | null> {
  if (indexCache.has(chapterSlug)) return indexCache.get(chapterSlug)!

  try {
    const res = await fetch(`${CONTENT_BASE}/${chapterSlug}/index.json`)
    if (!res.ok) return null
    const data = await res.json()
    indexCache.set(chapterSlug, data)
    return data
  } catch {
    return null
  }
}

export async function loadInterviewPrep(): Promise<InterviewPrepData | null> {
  try {
    const res = await fetch(`${CONTENT_BASE}/interview-prep.json`)
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

// Load centralized knowledge checks
async function loadAllKnowledgeChecks(): Promise<KnowledgeChecksData | null> {
  if (knowledgeChecksCache) return knowledgeChecksCache

  try {
    const res = await fetch(`${CONTENT_BASE}/knowledge-checks.json`)
    if (!res.ok) return null
    const data: KnowledgeChecksData = await res.json()
    knowledgeChecksCache = data
    return data
  } catch {
    return null
  }
}

// Get knowledge checks for a specific lesson
export async function loadKnowledgeChecks(lessonId: string): Promise<KnowledgeCheckItem[]> {
  const data = await loadAllKnowledgeChecks()
  if (!data) return []
  return data.lessons[lessonId] ?? []
}

// Get video path for a lesson
export function getVideoPath(chapterSlug: string, videoFilename: string): string {
  return `/academy/guidewire/videos/${chapterSlug}/${videoFilename}`
}

// Get assignment PDF path
export function getAssignmentPath(assignmentFolder: string, filename: string): string {
  return `/academy/guidewire/assignments/${assignmentFolder}/${filename}`
}

// --- Synthesized Lesson Loading ---

const SYNTHESIZED_BASE = '/academy/guidewire/synthesized'
const synthesizedCache = new Map<string, SynthesizedLesson>()

export async function loadSynthesizedLesson(
  chapterSlug: string,
  lessonNumber: number
): Promise<SynthesizedLesson | null> {
  const key = `${chapterSlug}-l${String(lessonNumber).padStart(2, '0')}`
  if (synthesizedCache.has(key)) return synthesizedCache.get(key)!

  try {
    const url = `${SYNTHESIZED_BASE}/${chapterSlug}/lesson-${String(lessonNumber).padStart(2, '0')}.json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data: SynthesizedLesson = await res.json()
    synthesizedCache.set(key, data)
    return data
  } catch {
    return null
  }
}

// Clear caches (useful for development)
export function clearContentCache(): void {
  lessonCache.clear()
  indexCache.clear()
  synthesizedCache.clear()
  knowledgeChecksCache = null
}
