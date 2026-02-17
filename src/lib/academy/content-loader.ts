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

// Video manifest cache (Blob URLs mapped by relative path)
let videoManifestCache: Record<string, { url: string }> | null = null
let manifestLoadAttempted = false

async function loadVideoManifest(): Promise<Record<string, { url: string }> | null> {
  if (videoManifestCache) return videoManifestCache
  if (manifestLoadAttempted) return null
  manifestLoadAttempted = true

  try {
    const res = await fetch('/academy/guidewire/video-manifest.json')
    if (!res.ok) return null
    const data = await res.json()
    videoManifestCache = data.videos ?? null
    return videoManifestCache
  } catch {
    return null
  }
}

// Get video path - uses Blob URL from manifest if available, falls back to local path
export function getVideoPath(chapterSlug: string, videoFilename: string): string {
  return `/academy/guidewire/videos/${chapterSlug}/${videoFilename}`
}

// Async version that checks Blob manifest first
export async function resolveVideoUrl(chapterSlug: string, videoFilename: string): Promise<string> {
  const manifest = await loadVideoManifest()
  const key = `${chapterSlug}/${videoFilename}`
  if (manifest?.[key]?.url) {
    return manifest[key].url
  }
  // Fallback to local path (works in dev)
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
