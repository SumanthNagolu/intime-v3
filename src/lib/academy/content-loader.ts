'use client'

import type { ExtractedLesson, InterviewPrepData, KnowledgeChecksData, KnowledgeCheckItem, SynthesizedLesson, InteractiveAssignment } from './types'

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

// Video manifest cache - maps "chapterSlug/filename" to Mux playback ID or URL
let videoManifestCache: Record<string, { playbackId?: string; url?: string }> | null = null
let manifestLoadAttempted = false

async function loadVideoManifest(): Promise<Record<string, { playbackId?: string; url?: string }> | null> {
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

// Sync version - local path only (for backward compat)
export function getVideoPath(chapterSlug: string, videoFilename: string): string {
  return `/academy/guidewire/videos/${chapterSlug}/${videoFilename}`
}

// Async version - returns "mux:<playbackId>" for Mux videos, or a URL/path for fallback
export async function resolveVideoUrl(chapterSlug: string, videoFilename: string): Promise<string> {
  const manifest = await loadVideoManifest()
  const key = `${chapterSlug}/${videoFilename}`

  if (manifest?.[key]) {
    // Mux playback ID takes priority
    if (manifest[key].playbackId) {
      return `mux:${manifest[key].playbackId}`
    }
    // Blob/CDN URL
    if (manifest[key].url) {
      return manifest[key].url
    }
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

// --- Interactive Assignment Loading ---

const ASSIGNMENT_INTERACTIVE_BASE = '/academy/guidewire/assignment-interactive'
const interactiveAssignmentCache = new Map<string, InteractiveAssignment>()

export async function loadInteractiveAssignment(
  chapterSlug: string,
  assignmentNumber: number
): Promise<InteractiveAssignment | null> {
  const key = `${chapterSlug}-a${String(assignmentNumber).padStart(2, '0')}`
  if (interactiveAssignmentCache.has(key)) return interactiveAssignmentCache.get(key)!

  try {
    const url = `${ASSIGNMENT_INTERACTIVE_BASE}/${chapterSlug}/assignment-${String(assignmentNumber).padStart(2, '0')}.json`
    const res = await fetch(url)
    if (!res.ok) return null
    const data: InteractiveAssignment = await res.json()
    interactiveAssignmentCache.set(key, data)
    return data
  } catch {
    return null
  }
}

// --- Slide Image URL ---

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SLIDE_BUCKET = 'academy-slides'

/**
 * Get the URL for a slide image.
 * In production (or when SUPABASE_URL is set), returns a Supabase Storage public URL.
 * Falls back to local path for development without Supabase.
 */
export function getSlideImageUrl(
  chapterSlug: string,
  lessonNumber: number,
  slideNumber: number
): string {
  const lessonPad = String(lessonNumber).padStart(2, '0')
  const slidePad = String(slideNumber).padStart(2, '0')
  const path = `${chapterSlug}/lesson-${lessonPad}/slide-${slidePad}.png`

  if (SUPABASE_URL) {
    return `${SUPABASE_URL}/storage/v1/object/public/${SLIDE_BUCKET}/${path}`
  }

  // Fallback to local path (dev only)
  return `/academy/guidewire/slides/${path}`
}

// Clear caches (useful for development)
export function clearContentCache(): void {
  lessonCache.clear()
  indexCache.clear()
  synthesizedCache.clear()
  interactiveAssignmentCache.clear()
  knowledgeChecksCache = null
}
