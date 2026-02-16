'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AcademyProgressState, LessonProgress, LessonStatus, ChapterProgress, KnowledgeCheckAnswer } from './types'
import { CHAPTERS, CHAPTER_LESSONS, getAllLessons } from './curriculum'

// Default lesson progress
const DEFAULT_LESSON_PROGRESS: LessonProgress = {
  status: 'locked',
  scrollProgress: 0,
  checkpointsCompleted: [],
  videosWatched: [],
  assignmentSubmitted: false,
}

interface AcademyStore extends AcademyProgressState {
  // Server sync callback (injected by useProgressSync)
  _serverSaveNow?: () => void

  // Lesson actions
  updateLessonStatus: (lessonId: string, status: LessonStatus) => void
  updateScrollProgress: (lessonId: string, progress: number) => void
  markSlideVisited: (lessonId: string, slideNumber: number, totalSlides: number) => void
  markBlockVisited: (lessonId: string, blockId: string) => void
  completeCheckpoint: (lessonId: string, checkpointId: string) => void
  markVideoWatched: (lessonId: string, videoFilename: string) => void
  submitAssignment: (lessonId: string, response: string) => void
  recordKnowledgeCheckAnswer: (lessonId: string, questionKey: string, answer: string, correct: boolean, feedback: string) => void
  getKnowledgeCheckScore: (lessonId: string) => { correct: number; total: number }
  completeLesson: (lessonId: string, score?: number) => void
  setCurrentLesson: (lessonId: string) => void

  // Navigation helpers
  getLessonProgress: (lessonId: string) => LessonProgress
  getChapterProgress: (chapterId: number) => ChapterProgress
  isLessonAvailable: (lessonId: string) => boolean

  // Initialization
  initializeProgress: () => void
  resetAllProgress: () => void
}

export const useAcademyStore = create<AcademyStore>()(
  persist(
    (set, get) => ({
      lessons: {},
      chapters: {},
      currentLesson: null,
      readinessIndex: 0,
      streak: 0,
      lastActiveDate: null,

      // --- Lesson Actions ---

      updateLessonStatus: (lessonId, status) => {
        set((state) => ({
          lessons: {
            ...state.lessons,
            [lessonId]: {
              ...(state.lessons[lessonId] || DEFAULT_LESSON_PROGRESS),
              status,
            },
          },
        }))
        get().recalculateProgress()
      },

      updateScrollProgress: (lessonId, progress) => {
        set((state) => {
          const current = state.lessons[lessonId] || DEFAULT_LESSON_PROGRESS
          return {
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...current,
                scrollProgress: Math.max(current.scrollProgress, progress),
                status: current.status === 'available' ? 'in_progress' : current.status,
              },
            },
          }
        })
      },

      markSlideVisited: (lessonId, slideNumber, totalSlides) => {
        set((state) => {
          const current = state.lessons[lessonId] || DEFAULT_LESSON_PROGRESS
          const visited = new Set(current.slidesVisited ?? [])
          visited.add(slideNumber)
          const visitedArr = Array.from(visited)
          const syntheticProgress = totalSlides > 0 ? Math.round((visitedArr.length / totalSlides) * 100) : 0
          return {
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...current,
                slidesVisited: visitedArr,
                scrollProgress: Math.max(current.scrollProgress, syntheticProgress),
                status: current.status === 'available' ? 'in_progress' : current.status,
              },
            },
          }
        })
      },

      markBlockVisited: (lessonId, blockId) => {
        set((state) => {
          const current = state.lessons[lessonId] || DEFAULT_LESSON_PROGRESS
          const visited = new Set(current.blocksVisited ?? [])
          visited.add(blockId)
          return {
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...current,
                blocksVisited: Array.from(visited),
                status: current.status === 'available' ? 'in_progress' : current.status,
              },
            },
          }
        })
      },

      completeCheckpoint: (lessonId, checkpointId) => {
        set((state) => {
          const current = state.lessons[lessonId] || DEFAULT_LESSON_PROGRESS
          const completed = new Set(current.checkpointsCompleted)
          completed.add(checkpointId)
          return {
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...current,
                checkpointsCompleted: Array.from(completed),
              },
            },
          }
        })
      },

      markVideoWatched: (lessonId, videoFilename) => {
        set((state) => {
          const current = state.lessons[lessonId] || DEFAULT_LESSON_PROGRESS
          const watched = new Set(current.videosWatched)
          watched.add(videoFilename)
          return {
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...current,
                videosWatched: Array.from(watched),
              },
            },
          }
        })
      },

      submitAssignment: (lessonId, response) => {
        set((state) => ({
          lessons: {
            ...state.lessons,
            [lessonId]: {
              ...(state.lessons[lessonId] || DEFAULT_LESSON_PROGRESS),
              assignmentSubmitted: true,
              assignmentResponse: response,
            },
          },
        }))
        setTimeout(() => get()._serverSaveNow?.(), 0)
      },

      recordKnowledgeCheckAnswer: (lessonId, questionKey, answer, correct, feedback) => {
        set((state) => {
          const current = state.lessons[lessonId] || DEFAULT_LESSON_PROGRESS
          const existing = current.knowledgeCheckAnswers || {}
          return {
            lessons: {
              ...state.lessons,
              [lessonId]: {
                ...current,
                knowledgeCheckAnswers: {
                  ...existing,
                  [questionKey]: {
                    answer,
                    correct,
                    feedback,
                    gradedAt: new Date().toISOString(),
                  },
                },
              },
            },
          }
        })
        setTimeout(() => get()._serverSaveNow?.(), 0)
      },

      getKnowledgeCheckScore: (lessonId) => {
        const lesson = get().lessons[lessonId]
        const answers = lesson?.knowledgeCheckAnswers || {}
        const entries = Object.values(answers)
        return {
          correct: entries.filter((a) => a.correct).length,
          total: entries.length,
        }
      },

      completeLesson: (lessonId, score) => {
        set((state) => {
          const current = state.lessons[lessonId] || DEFAULT_LESSON_PROGRESS
          const updated = {
            ...state.lessons,
            [lessonId]: {
              ...current,
              status: 'completed' as LessonStatus,
              scrollProgress: 100,
              completedAt: new Date().toISOString(),
              score: score ?? current.score,
            },
          }

          // Unlock next lesson
          const allLessons = getAllLessons()
          const idx = allLessons.findIndex(l => l.lessonId === lessonId)
          if (idx >= 0 && idx < allLessons.length - 1) {
            const nextId = allLessons[idx + 1].lessonId
            const nextProgress = updated[nextId] || DEFAULT_LESSON_PROGRESS
            if (nextProgress.status === 'locked') {
              updated[nextId] = { ...nextProgress, status: 'available' }
            }
          }

          return { lessons: updated }
        })

        // Update streak
        const today = new Date().toISOString().split('T')[0]
        const lastDate = get().lastActiveDate
        set((state) => {
          if (lastDate === today) return {}
          const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0]
          return {
            streak: lastDate === yesterday ? state.streak + 1 : 1,
            lastActiveDate: today,
          }
        })

        get().recalculateProgress()
        setTimeout(() => get()._serverSaveNow?.(), 0)
      },

      setCurrentLesson: (lessonId) => set({ currentLesson: lessonId }),

      // --- Getters ---

      getLessonProgress: (lessonId) => {
        return get().lessons[lessonId] || DEFAULT_LESSON_PROGRESS
      },

      getChapterProgress: (chapterId) => {
        const chapter = CHAPTERS.find(c => c.id === chapterId)
        if (!chapter) return { lessonsCompleted: 0, totalLessons: 0, progress: 0 }

        const lessons = CHAPTER_LESSONS[chapter.slug] || []
        const state = get()
        const completed = lessons.filter(l => state.lessons[l.lessonId]?.status === 'completed').length

        return {
          lessonsCompleted: completed,
          totalLessons: lessons.length,
          progress: lessons.length > 0 ? Math.round((completed / lessons.length) * 100) : 0,
        }
      },

      isLessonAvailable: (lessonId) => {
        const progress = get().lessons[lessonId]
        if (!progress) {
          // First lesson of first chapter is always available
          const allLessons = getAllLessons()
          return allLessons.length > 0 && allLessons[0].lessonId === lessonId
        }
        return progress.status !== 'locked'
      },

      // --- Initialization ---

      initializeProgress: () => {
        const state = get()
        if (Object.keys(state.lessons).length > 0) return // Already initialized

        // Make the first lesson available
        const allLessons = getAllLessons()
        if (allLessons.length > 0) {
          set({
            lessons: {
              [allLessons[0].lessonId]: { ...DEFAULT_LESSON_PROGRESS, status: 'available' },
            },
            currentLesson: allLessons[0].lessonId,
          })
        }
      },

      resetAllProgress: () => {
        const allLessons = getAllLessons()
        set({
          lessons: allLessons.length > 0
            ? { [allLessons[0].lessonId]: { ...DEFAULT_LESSON_PROGRESS, status: 'available' } }
            : {},
          chapters: {},
          currentLesson: allLessons[0]?.lessonId || null,
          readinessIndex: 0,
          streak: 0,
          lastActiveDate: null,
        })
      },
    }),
    {
      name: 'gw-academy-progress',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        lessons: state.lessons,
        currentLesson: state.currentLesson,
        readinessIndex: state.readinessIndex,
        streak: state.streak,
        lastActiveDate: state.lastActiveDate,
      }),
    }
  )
)

// Add recalculateProgress as a non-persisted method
const recalculateProgress = () => {
  const state = useAcademyStore.getState()
  const allLessons = getAllLessons()
  const completed = allLessons.filter(l => state.lessons[l.lessonId]?.status === 'completed').length
  const readiness = allLessons.length > 0 ? Math.round((completed / allLessons.length) * 100) : 0

  useAcademyStore.setState({ readinessIndex: readiness })
}

// Attach to store prototype
Object.assign(useAcademyStore.getState(), { recalculateProgress })
