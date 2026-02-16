'use client'

import type { GuruMessage } from './types'
import { getAllLessons } from './curriculum'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface GuruSource {
  source_type: string
  chapter?: string
  chapter_title?: string
  score: number
}

export interface GuruResponse {
  answer: string
  sources: GuruSource[]
}

// ---------------------------------------------------------------------------
// API call
// ---------------------------------------------------------------------------

export async function generateGuruResponse(
  messages: GuruMessage[],
  newMessage: string,
  currentLessonId?: string
): Promise<GuruResponse> {
  try {
    const conversationHistory = messages.slice(-8).map((msg) => ({
      role: msg.role,
      content: msg.content,
    }))

    const res = await fetch('/api/ai/guru', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: newMessage,
        conversationHistory,
        lessonId: currentLessonId,
      }),
    })

    if (!res.ok) {
      const errorData = await res.json().catch(() => ({}))
      throw new Error(errorData.error || `HTTP ${res.status}`)
    }

    const data = await res.json()
    return {
      answer: data.answer || "Let me think about that... Could you rephrase your question?",
      sources: data.sources || [],
    }
  } catch (error) {
    console.error('Guru API error:', error)
    return {
      answer: "I'm having trouble connecting right now. Please try again in a moment.",
      sources: [],
    }
  }
}

// ---------------------------------------------------------------------------
// Quick topic suggestions (unchanged, runs client-side)
// ---------------------------------------------------------------------------

export function getQuickTopicSuggestions(lessonId?: string): string[] {
  const allLessons = getAllLessons()
  const lesson = lessonId
    ? allLessons.find((l) => l.lessonId === lessonId)
    : null

  const general = [
    'What is the Guidewire data model?',
    'Explain PolicyCenter accounts',
    'How does rating work in Guidewire?',
    'What is Gosu and how is it used?',
    'Explain the PCF framework',
    'What are the key differences between PolicyCenter and ClaimCenter?',
  ]

  if (!lesson) return general

  return [
    `Explain the key concepts in "${lesson.title}"`,
    `What are common interview questions about ${lesson.title}?`,
    `Give me a code example related to ${lesson.title}`,
    `What assignments help practice ${lesson.title}?`,
    ...general.slice(0, 2),
  ]
}
