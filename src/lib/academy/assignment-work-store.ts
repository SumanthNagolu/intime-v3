'use client'

import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'
import type { AssignmentWorkRecord, ExerciseWorkRecord } from './types'

const DEFAULT_EXERCISE: ExerciseWorkRecord = {
  exerciseId: '',
  status: 'not_started',
  timeSpentSeconds: 0,
  stepsCompleted: [],
  writeItDownAnswers: {},
  codeSubmissions: {},
  verificationChecks: [],
  hintsRevealed: 0,
  solutionStepsRevealed: 0,
  guruQueriesCount: 0,
}

const DEFAULT_ASSIGNMENT: AssignmentWorkRecord = {
  assignmentId: '',
  status: 'not_started',
  totalTimeSpentSeconds: 0,
  exercises: {},
  totalHintsUsed: 0,
  totalSolutionReveals: 0,
  totalGuruQueries: 0,
  skillsScores: {},
}

interface AssignmentWorkState {
  assignments: Record<string, AssignmentWorkRecord>
  _serverSaveNow?: () => void
}

interface AssignmentWorkActions {
  getAssignment: (assignmentId: string) => AssignmentWorkRecord
  getExercise: (assignmentId: string, exerciseId: string) => ExerciseWorkRecord

  startAssignment: (assignmentId: string) => void
  startExercise: (assignmentId: string, exerciseId: string) => void

  markStepDone: (assignmentId: string, exerciseId: string, stepId: string) => void
  unmarkStepDone: (assignmentId: string, exerciseId: string, stepId: string) => void

  recordWriteItDownAnswer: (
    assignmentId: string,
    exerciseId: string,
    blockId: string,
    answer: string,
    correct?: boolean,
    feedback?: string
  ) => void

  recordCodeSubmission: (
    assignmentId: string,
    exerciseId: string,
    blockId: string,
    code: string,
    feedback?: string,
    score?: number
  ) => void

  checkVerificationStep: (assignmentId: string, exerciseId: string, stepId: string) => void
  uncheckVerificationStep: (assignmentId: string, exerciseId: string, stepId: string) => void

  revealHint: (assignmentId: string, exerciseId: string) => void
  revealSolutionStep: (assignmentId: string, exerciseId: string) => void
  recordGuruQuery: (assignmentId: string, exerciseId: string) => void

  updateTimeSpent: (assignmentId: string, exerciseId: string, seconds: number) => void

  completeExercise: (assignmentId: string, exerciseId: string) => void
  completeAssignment: (assignmentId: string, score?: number) => void
}

type AssignmentWorkStore = AssignmentWorkState & AssignmentWorkActions

function ensureAssignment(
  state: AssignmentWorkState,
  assignmentId: string
): AssignmentWorkRecord {
  return state.assignments[assignmentId] ?? { ...DEFAULT_ASSIGNMENT, assignmentId }
}

function ensureExercise(
  assignment: AssignmentWorkRecord,
  exerciseId: string
): ExerciseWorkRecord {
  return assignment.exercises[exerciseId] ?? { ...DEFAULT_EXERCISE, exerciseId }
}

export const useAssignmentWorkStore = create<AssignmentWorkStore>()(
  persist(
    (set, get) => ({
      assignments: {},

      getAssignment: (assignmentId) => {
        return get().assignments[assignmentId] ?? { ...DEFAULT_ASSIGNMENT, assignmentId }
      },

      getExercise: (assignmentId, exerciseId) => {
        const assignment = get().assignments[assignmentId]
        if (!assignment) return { ...DEFAULT_EXERCISE, exerciseId }
        return assignment.exercises[exerciseId] ?? { ...DEFAULT_EXERCISE, exerciseId }
      },

      startAssignment: (assignmentId) => {
        set((state) => {
          const existing = ensureAssignment(state, assignmentId)
          if (existing.status !== 'not_started') return state
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...existing,
                status: 'in_progress',
                startedAt: new Date().toISOString(),
              },
            },
          }
        })
      },

      startExercise: (assignmentId, exerciseId) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          if (exercise.status !== 'not_started') return state
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                status: assignment.status === 'not_started' ? 'in_progress' : assignment.status,
                startedAt: assignment.startedAt ?? new Date().toISOString(),
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    status: 'in_progress',
                    startedAt: new Date().toISOString(),
                  },
                },
              },
            },
          }
        })
      },

      markStepDone: (assignmentId, exerciseId, stepId) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          const completed = new Set(exercise.stepsCompleted)
          completed.add(stepId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    stepsCompleted: Array.from(completed),
                    status: exercise.status === 'not_started' ? 'in_progress' : exercise.status,
                    startedAt: exercise.startedAt ?? new Date().toISOString(),
                  },
                },
              },
            },
          }
        })
      },

      unmarkStepDone: (assignmentId, exerciseId, stepId) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    stepsCompleted: exercise.stepsCompleted.filter((s) => s !== stepId),
                  },
                },
              },
            },
          }
        })
      },

      recordWriteItDownAnswer: (assignmentId, exerciseId, blockId, answer, correct, feedback) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          const existing = exercise.writeItDownAnswers[blockId]
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    writeItDownAnswers: {
                      ...exercise.writeItDownAnswers,
                      [blockId]: {
                        answer,
                        correct,
                        feedback,
                        gradedAt: correct !== undefined ? new Date().toISOString() : undefined,
                        attempts: (existing?.attempts ?? 0) + 1,
                      },
                    },
                  },
                },
              },
            },
          }
        })
        setTimeout(() => get()._serverSaveNow?.(), 0)
      },

      recordCodeSubmission: (assignmentId, exerciseId, blockId, code, feedback, score) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    codeSubmissions: {
                      ...exercise.codeSubmissions,
                      [blockId]: {
                        code,
                        feedback,
                        score,
                        submittedAt: new Date().toISOString(),
                      },
                    },
                  },
                },
              },
            },
          }
        })
        setTimeout(() => get()._serverSaveNow?.(), 0)
      },

      checkVerificationStep: (assignmentId, exerciseId, stepId) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          const checks = new Set(exercise.verificationChecks)
          checks.add(stepId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    verificationChecks: Array.from(checks),
                  },
                },
              },
            },
          }
        })
      },

      uncheckVerificationStep: (assignmentId, exerciseId, stepId) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    verificationChecks: exercise.verificationChecks.filter((s) => s !== stepId),
                  },
                },
              },
            },
          }
        })
      },

      revealHint: (assignmentId, exerciseId) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                totalHintsUsed: assignment.totalHintsUsed + 1,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    hintsRevealed: exercise.hintsRevealed + 1,
                  },
                },
              },
            },
          }
        })
      },

      revealSolutionStep: (assignmentId, exerciseId) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                totalSolutionReveals: assignment.totalSolutionReveals + 1,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    solutionStepsRevealed: exercise.solutionStepsRevealed + 1,
                  },
                },
              },
            },
          }
        })
      },

      recordGuruQuery: (assignmentId, exerciseId) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                totalGuruQueries: assignment.totalGuruQueries + 1,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    guruQueriesCount: exercise.guruQueriesCount + 1,
                  },
                },
              },
            },
          }
        })
      },

      updateTimeSpent: (assignmentId, exerciseId, seconds) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                totalTimeSpentSeconds: assignment.totalTimeSpentSeconds + seconds,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    timeSpentSeconds: exercise.timeSpentSeconds + seconds,
                  },
                },
              },
            },
          }
        })
      },

      completeExercise: (assignmentId, exerciseId) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          const exercise = ensureExercise(assignment, exerciseId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                exercises: {
                  ...assignment.exercises,
                  [exerciseId]: {
                    ...exercise,
                    status: 'completed',
                    completedAt: new Date().toISOString(),
                  },
                },
              },
            },
          }
        })
        setTimeout(() => get()._serverSaveNow?.(), 0)
      },

      completeAssignment: (assignmentId, score) => {
        set((state) => {
          const assignment = ensureAssignment(state, assignmentId)
          return {
            assignments: {
              ...state.assignments,
              [assignmentId]: {
                ...assignment,
                status: 'completed',
                completedAt: new Date().toISOString(),
                overallScore: score,
              },
            },
          }
        })
        setTimeout(() => get()._serverSaveNow?.(), 0)
      },
    }),
    {
      name: 'gw-academy-assignments',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        assignments: state.assignments,
      }),
    }
  )
)
