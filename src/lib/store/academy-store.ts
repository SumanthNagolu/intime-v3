import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { useMemo } from 'react';
import {
  BiometricState,
  calculateBiometricScore,
  getBiometricState,
  getBiometricTheme
} from '@/lib/academy/biometric';
import {
  getRankFromXP,
  ACHIEVEMENTS,
  XP_ACTIONS
} from '@/lib/academy/gamification';

// ============================================
// TYPES
// ============================================

interface LessonProgress {
  status: 'locked' | 'unlocked' | 'current' | 'completed';
  quizScore?: number;
  labArtifact?: string;
  completedAt?: Date;
  xpEarned?: number;
}

interface AcademyState {
  // Core Progress
  academyProgress: Record<string, LessonProgress>;
  
  // Gamification
  xp: number;
  streakDays: number;
  lastActivityDate: string | null;
  unlockedAchievements: string[];
  
  // Biometric
  biometricScore: number;
  biometricState: BiometricState;
  
  // Cohort
  isSprintActive: boolean;
  cohortId?: string;
  
  // AI Mentor
  mentorContext: string;
  mentorOpen: boolean;
  hasKey: boolean;

  // Daily Challenges
  dailyChallengesCompleted: string[];
  lastChallengeReset: string | null;
}

interface AcademyActions {
  // Progress
  updateLessonStatus: (moduleId: number, lessonId: string, status: string, quizScore?: number, labArtifact?: string) => void;
  
  // Gamification
  addXP: (amount: number, reason?: string) => void;
  updateStreak: () => void;
  unlockAchievement: (achievementId: string) => void;
  checkAchievements: () => void;
  completeDailyChallenge: (challengeId: string) => void;
  
  // Biometric
  recalculateBiometric: () => void;
  
  // Cohort
  joinSprint: () => void;
  leaveSprint: () => void;
  
  // Mentor
  setMentorContext: (ctx: string) => void;
  setMentorOpen: (open: boolean) => void;
  setHasKey: (hasKey: boolean) => void;
  
  // Reset
  resetProgress: () => void;
}

// ============================================
// STORE
// ============================================

const initialState: AcademyState = {
  academyProgress: {
    'm1-l1': { status: 'unlocked' },
  },
  xp: 0,
  streakDays: 0,
  lastActivityDate: null,
  unlockedAchievements: [],
  biometricScore: 40,
  biometricState: 'neutral',
  isSprintActive: false,
  mentorContext: '',
  mentorOpen: false,
  hasKey: false,
  dailyChallengesCompleted: [],
  lastChallengeReset: null,
};

export const useAcademyStore = create<AcademyState & AcademyActions>()(
  persist(
    (set, get) => ({
      ...initialState,

      // ============================================
      // PROGRESS ACTIONS
      // ============================================
      
      updateLessonStatus: (moduleId, lessonId, status, quizScore, labArtifact) => {
        const key = `${moduleId}-${lessonId}`;
        
        set((state) => {
          const prev = state.academyProgress[key] || {};
          const isNewCompletion = status === 'completed' && prev.status !== 'completed';
          
          let xpToAdd = 0;
          if (isNewCompletion) {
            xpToAdd += XP_ACTIONS.LESSON_COMPLETE;
            if (quizScore === 100) {
              xpToAdd += XP_ACTIONS.QUIZ_PERFECT;
            } else if (quizScore && quizScore >= 70) {
              xpToAdd += XP_ACTIONS.QUIZ_PASS;
            }
            if (labArtifact) {
              xpToAdd += XP_ACTIONS.LAB_COMPLETE;
            }
          }

          return {
            academyProgress: {
              ...state.academyProgress,
              [key]: {
                ...prev,
                status: status as LessonProgress['status'],
                quizScore: quizScore ?? prev.quizScore,
                labArtifact: labArtifact ?? prev.labArtifact,
                completedAt: isNewCompletion ? new Date() : prev.completedAt,
                xpEarned: isNewCompletion ? xpToAdd : prev.xpEarned,
              },
            },
            xp: state.xp + xpToAdd,
          };
        });

        // Recalculate biometric after update
        get().recalculateBiometric();
        get().updateStreak();
        get().checkAchievements();
      },

      // ============================================
      // GAMIFICATION ACTIONS
      // ============================================

      addXP: (amount, _reason) => {
        set((state) => ({ xp: state.xp + amount }));
        get().recalculateBiometric();
      },

      updateStreak: () => {
        const today = new Date().toDateString();
        const lastActivity = get().lastActivityDate;
        
        if (lastActivity === today) {
          // Already active today, no change
          return;
        }
        
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toDateString();
        
        set((state) => {
          if (lastActivity === yesterdayStr) {
            // Consecutive day - increase streak
            const newStreak = state.streakDays + 1;
            let bonusXP = XP_ACTIONS.STREAK_DAILY;
            
            // Weekly bonus
            if (newStreak % 7 === 0) {
              bonusXP += XP_ACTIONS.STREAK_WEEKLY;
            }
            // Monthly bonus
            if (newStreak === 30) {
              bonusXP += XP_ACTIONS.STREAK_MONTHLY;
            }
            
            return {
              streakDays: newStreak,
              lastActivityDate: today,
              xp: state.xp + bonusXP,
            };
          } else if (!lastActivity || lastActivity !== today) {
            // Streak broken or first activity
            return {
              streakDays: 1,
              lastActivityDate: today,
              xp: state.xp + XP_ACTIONS.STREAK_DAILY,
            };
          }
          return state;
        });
      },

      unlockAchievement: (achievementId) => {
        const state = get();
        if (state.unlockedAchievements.includes(achievementId)) return;
        
        const achievement = ACHIEVEMENTS.find(a => a.id === achievementId);
        if (!achievement) return;
        
        set((state) => ({
          unlockedAchievements: [...state.unlockedAchievements, achievementId],
          xp: state.xp + achievement.xpReward,
        }));
      },

      checkAchievements: () => {
        const state = get();
        const progress = state.academyProgress;
        
        // First Blood
        const completedLessons = Object.values(progress).filter(p => p.status === 'completed').length;
        if (completedLessons >= 1) {
          get().unlockAchievement('first_blood');
        }
        
        // Week Warrior
        if (state.streakDays >= 7) {
          get().unlockAchievement('week_warrior');
        }
        
        // Iron Will
        if (state.streakDays >= 30) {
          get().unlockAchievement('iron_will');
        }
        
        // Perfectionist
        const perfectQuizzes = Object.values(progress).filter(p => p.quizScore === 100).length;
        if (perfectQuizzes >= 5) {
          get().unlockAchievement('perfectionist');
        }
        
        // Halfway
        const totalLessons = 40; // Approximate total
        if (completedLessons >= totalLessons / 2) {
          get().unlockAchievement('halfway');
        }
      },

      completeDailyChallenge: (challengeId) => {
        const today = new Date().toDateString();
        const state = get();
        
        // Reset challenges if it's a new day
        if (state.lastChallengeReset !== today) {
          set({
            dailyChallengesCompleted: [challengeId],
            lastChallengeReset: today,
          });
        } else if (!state.dailyChallengesCompleted.includes(challengeId)) {
          set({
            dailyChallengesCompleted: [...state.dailyChallengesCompleted, challengeId],
          });
        }
      },

      // ============================================
      // BIOMETRIC ACTIONS
      // ============================================

      recalculateBiometric: () => {
        const state = get();
        const progress = Object.values(state.academyProgress);
        
        const totalLessons = 40; // Approximate
        const completedLessons = progress.filter(p => p.status === 'completed').length;
        const moduleProgress = (completedLessons / totalLessons) * 100;
        
        const quizScores = progress.filter(p => p.quizScore !== undefined).map(p => p.quizScore!);
        const quizPerformance = quizScores.length > 0 
          ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length 
          : 50;
        
        const labsCompleted = progress.filter(p => p.labArtifact).length;
        const totalLabs = 15; // Approximate
        const labCompletions = (labsCompleted / totalLabs) * 100;
        
        const biometricScoreValue = calculateBiometricScore({
          moduleProgress,
          quizPerformance,
          labCompletions,
          streakDays: state.streakDays,
          cohortRank: 50, // Default to middle
          interviewReadiness: Math.min(completedLessons * 3, 100),
        });
        
        const newState = getBiometricState(biometricScoreValue);
        
        set({
          biometricScore: biometricScoreValue,
          biometricState: newState,
        });
      },

      // ============================================
      // COHORT ACTIONS
      // ============================================

      joinSprint: () => set({ isSprintActive: true }),
      leaveSprint: () => set({ isSprintActive: false }),

      // ============================================
      // MENTOR ACTIONS
      // ============================================

      setMentorContext: (ctx) => set({ mentorContext: ctx }),
      setMentorOpen: (open) => set({ mentorOpen: open }),
      setHasKey: (hasKey) => set({ hasKey }),

      // ============================================
      // RESET
      // ============================================

      resetProgress: () => set(initialState),
    }),
    {
      name: 'academy-store',
      partialize: (state) => ({
        academyProgress: state.academyProgress,
        xp: state.xp,
        streakDays: state.streakDays,
        lastActivityDate: state.lastActivityDate,
        unlockedAchievements: state.unlockedAchievements,
        biometricScore: state.biometricScore,
        biometricState: state.biometricState,
        dailyChallengesCompleted: state.dailyChallengesCompleted,
        lastChallengeReset: state.lastChallengeReset,
        hasKey: state.hasKey,
      }),
    }
  )
);

// Convenience hook for biometric data
// IMPORTANT: Uses individual selectors and useMemo to prevent unnecessary re-renders
export function useBiometric() {
  const biometricScore = useAcademyStore((state) => state.biometricScore);
  const biometricState = useAcademyStore((state) => state.biometricState);

  // Memoize theme calculation to avoid recalculating on every render
  const theme = useMemo(() => getBiometricTheme(biometricState), [biometricState]);
  const statusMessage = useMemo(() => theme.statusMessage, [theme]);

  // Memoize the return object to prevent new object creation on every render
  return useMemo(() => ({
    score: biometricScore,
    state: biometricState,
    theme,
    statusMessage,
  }), [biometricScore, biometricState, theme, statusMessage]);
}

// Convenience hook for gamification
// IMPORTANT: Uses individual selectors and useMemo to prevent unnecessary re-renders
export function useGamification() {
  const xp = useAcademyStore((state) => state.xp);
  const streakDays = useAcademyStore((state) => state.streakDays);
  const unlockedAchievements = useAcademyStore((state) => state.unlockedAchievements);
  const addXP = useAcademyStore((state) => state.addXP);

  // Memoize rank calculation to avoid recalculating on every render
  const rank = useMemo(() => getRankFromXP(xp), [xp]);

  // Memoize the return object to prevent new object creation on every render
  return useMemo(() => ({
    xp,
    rank,
    streakDays,
    unlockedAchievements,
    addXP,
  }), [xp, rank, streakDays, unlockedAchievements, addXP]);
}

// Re-export for backwards compatibility
export const useAppStore = useAcademyStore;
