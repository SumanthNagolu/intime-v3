// ============================================================
// Training Track Definitions
// Each track represents a career training program offered by InTime Academy
// ============================================================

import { LEARNING_PATHS, type LearningPathDefinition } from './learning-paths'

export interface TrackDefinition {
  slug: string
  title: string
  description: string
  icon: string
  coverGradient: string
  status: 'live' | 'coming_soon'
  paths?: LearningPathDefinition[]
  comingSoonDate?: string
}

export const TRACKS: TrackDefinition[] = [
  {
    slug: 'guidewire',
    title: 'Guidewire InsuranceSuite',
    description:
      'Master PolicyCenter, ClaimCenter, BillingCenter, and Integration development. The only program that gives you a 7-year experience profile on Day 1.',
    icon: '\u{1F6E1}\u{FE0F}',
    coverGradient: 'from-blue-600 via-indigo-600 to-purple-700',
    status: 'live',
    paths: LEARNING_PATHS,
  },
  {
    slug: 'ai-ml',
    title: 'AI & Machine Learning',
    description:
      'Build production AI systems: LLM integration, RAG pipelines, fine-tuning, MLOps, and agent architectures. From prompt engineering to deployment.',
    icon: '\u{1F916}',
    coverGradient: 'from-emerald-600 via-teal-600 to-cyan-700',
    status: 'coming_soon',
    comingSoonDate: 'Q3 2026',
  },
  {
    slug: 'salesforce',
    title: 'Salesforce Development',
    description:
      'End-to-end Salesforce mastery: Apex, Lightning Web Components, integrations, CPQ, and platform architecture. Enterprise CRM at scale.',
    icon: '\u{2601}\u{FE0F}',
    coverGradient: 'from-sky-500 via-blue-500 to-indigo-600',
    status: 'coming_soon',
    comingSoonDate: 'Q4 2026',
  },
  {
    slug: 'fullstack-ai',
    title: 'Full Stack AI Engineering',
    description:
      'Build complete AI-powered applications: Next.js, Python backends, vector databases, streaming UIs, and production deployment patterns.',
    icon: '\u{1F680}',
    coverGradient: 'from-orange-500 via-red-500 to-rose-600',
    status: 'coming_soon',
    comingSoonDate: '2027',
  },
]

export function getTrack(slug: string): TrackDefinition | undefined {
  return TRACKS.find((t) => t.slug === slug)
}

export function getLiveTracks(): TrackDefinition[] {
  return TRACKS.filter((t) => t.status === 'live')
}

export function getComingSoonTracks(): TrackDefinition[] {
  return TRACKS.filter((t) => t.status === 'coming_soon')
}
