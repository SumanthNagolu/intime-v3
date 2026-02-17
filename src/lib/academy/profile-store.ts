'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import { CHAPTERS, CHAPTER_LESSONS } from './curriculum'
import { useAcademyStore } from './progress-store'

// --- Types ---

export type SkillLevel = 'beginner' | 'intermediate' | 'advanced' | 'expert'
export type SkillCategory = 'guidewire-core' | 'guidewire-development' | 'guidewire-config' | 'integration' | 'methodology' | 'general'

export interface ProfileSkill {
  id: string
  name: string
  level: SkillLevel
  category: SkillCategory
}

export interface Certification {
  id: string
  name: string
  issuer: string
  dateObtained: string
  credentialUrl?: string
}

export interface Implementation {
  id: string
  title: string
  category: string
  problem: string
  solution: string
  technicalDetails: string
  impact: string
  technologies: string[]
  sortOrder: number
}

export interface Project {
  id: string
  name: string
  client: string
  role: string
  startDate: string
  endDate?: string
  isCurrent: boolean
  description: string
  responsibilities: string[]
  technologies: string[]
  implementations: Implementation[]
  sortOrder: number
}

export interface ProfileState {
  name: string
  title: string
  summary: string
  location: string
  yearsExperience: string
  linkedinUrl: string
  githubUrl: string
  portfolioUrl: string
  skills: ProfileSkill[]
  certifications: Certification[]
  projects: Project[]
  isEditMode: boolean
}

interface ProfileActions {
  setField: (field: keyof Omit<ProfileState, 'skills' | 'certifications' | 'projects' | 'isEditMode'>, value: string) => void
  setEditMode: (on: boolean) => void

  // Skills
  addSkill: (skill: Omit<ProfileSkill, 'id'>) => void
  updateSkill: (id: string, updates: Partial<ProfileSkill>) => void
  removeSkill: (id: string) => void
  syncSkillsFromProgress: () => void

  // Certifications
  addCertification: (cert: Omit<Certification, 'id'>) => void
  updateCertification: (id: string, updates: Partial<Certification>) => void
  removeCertification: (id: string) => void

  // Projects
  addProject: (project: Omit<Project, 'id' | 'implementations' | 'sortOrder'>) => void
  updateProject: (id: string, updates: Partial<Omit<Project, 'implementations'>>) => void
  removeProject: (id: string) => void

  // Implementations (nested under projects)
  addImplementation: (projectId: string, impl: Omit<Implementation, 'id' | 'sortOrder'>) => void
  updateImplementation: (projectId: string, implId: string, updates: Partial<Implementation>) => void
  removeImplementation: (projectId: string, implId: string) => void
}

type ProfileStore = ProfileState & ProfileActions

const genId = () => crypto.randomUUID()

// Chapter-to-skill mapping for auto-sync
const CHAPTER_SKILL_MAP: Record<string, { name: string; category: SkillCategory }> = {
  ch01: { name: 'Guidewire Cloud Platform', category: 'guidewire-core' },
  ch02: { name: 'SurePath Methodology', category: 'methodology' },
  ch03: { name: 'Implementation Tools', category: 'methodology' },
  ch04: { name: 'PolicyCenter', category: 'guidewire-core' },
  ch05: { name: 'ClaimCenter', category: 'guidewire-core' },
  ch06: { name: 'BillingCenter', category: 'guidewire-core' },
  ch07: { name: 'InsuranceSuite Development', category: 'guidewire-development' },
  ch08: { name: 'PolicyCenter Configuration', category: 'guidewire-config' },
  ch09: { name: 'ClaimCenter Configuration', category: 'guidewire-config' },
  ch10: { name: 'BillingCenter Configuration', category: 'guidewire-config' },
  ch11: { name: 'Integration & Web Services', category: 'integration' },
  ch12: { name: 'Advanced Product Designer', category: 'guidewire-development' },
  ch13: { name: 'Rating Fundamentals', category: 'guidewire-development' },
  ch14: { name: 'Rating Configuration', category: 'guidewire-config' },
}

function progressToLevel(pct: number): SkillLevel {
  if (pct >= 90) return 'expert'
  if (pct >= 60) return 'advanced'
  if (pct >= 30) return 'intermediate'
  return 'beginner'
}

export const useProfileStore = create<ProfileStore>()(
  persist(
    (set, get) => ({
      // --- State ---
      name: '',
      title: '',
      summary: '',
      location: '',
      yearsExperience: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      skills: [],
      certifications: [],
      projects: [],
      isEditMode: false,

      // --- Actions ---
      setField: (field, value) => set({ [field]: value }),
      setEditMode: (on) => set({ isEditMode: on }),

      // Skills
      addSkill: (skill) =>
        set((s) => ({ skills: [...s.skills, { ...skill, id: genId() }] })),
      updateSkill: (id, updates) =>
        set((s) => ({ skills: s.skills.map((sk) => (sk.id === id ? { ...sk, ...updates } : sk)) })),
      removeSkill: (id) =>
        set((s) => ({ skills: s.skills.filter((sk) => sk.id !== id) })),

      syncSkillsFromProgress: () => {
        const progress = useAcademyStore.getState()
        const synced: ProfileSkill[] = []

        for (const chapter of CHAPTERS) {
          const mapping = CHAPTER_SKILL_MAP[chapter.slug]
          if (!mapping) continue
          const lessons = CHAPTER_LESSONS[chapter.slug] || []
          if (lessons.length === 0) continue
          const completed = lessons.filter(
            (l) => progress.lessons[l.lessonId]?.status === 'completed'
          ).length
          const pct = Math.round((completed / lessons.length) * 100)
          if (pct === 0) continue
          synced.push({
            id: `sync-${chapter.slug}`,
            name: mapping.name,
            level: progressToLevel(pct),
            category: mapping.category,
          })
        }

        // Merge: keep manually-added skills, replace synced ones
        const existing = get().skills.filter((sk) => !sk.id.startsWith('sync-'))
        set({ skills: [...synced, ...existing] })
      },

      // Certifications
      addCertification: (cert) =>
        set((s) => ({ certifications: [...s.certifications, { ...cert, id: genId() }] })),
      updateCertification: (id, updates) =>
        set((s) => ({
          certifications: s.certifications.map((c) => (c.id === id ? { ...c, ...updates } : c)),
        })),
      removeCertification: (id) =>
        set((s) => ({ certifications: s.certifications.filter((c) => c.id !== id) })),

      // Projects
      addProject: (project) =>
        set((s) => ({
          projects: [
            ...s.projects,
            { ...project, id: genId(), implementations: [], sortOrder: s.projects.length },
          ],
        })),
      updateProject: (id, updates) =>
        set((s) => ({
          projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)),
        })),
      removeProject: (id) =>
        set((s) => ({ projects: s.projects.filter((p) => p.id !== id) })),

      // Implementations
      addImplementation: (projectId, impl) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  implementations: [
                    ...p.implementations,
                    { ...impl, id: genId(), sortOrder: p.implementations.length },
                  ],
                }
              : p
          ),
        })),
      updateImplementation: (projectId, implId, updates) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? {
                  ...p,
                  implementations: p.implementations.map((i) =>
                    i.id === implId ? { ...i, ...updates } : i
                  ),
                }
              : p
          ),
        })),
      removeImplementation: (projectId, implId) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, implementations: p.implementations.filter((i) => i.id !== implId) }
              : p
          ),
        })),
    }),
    {
      name: 'gw-academy-profile',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => {
        const { isEditMode, ...rest } = state
        return rest
      },
    }
  )
)
