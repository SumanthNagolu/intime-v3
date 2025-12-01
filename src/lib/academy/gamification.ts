/**
 * Gamification System
 * XP, Ranks, Achievements, Streaks, and Challenges
 */

// ============================================
// RANK SYSTEM
// ============================================

export interface Rank {
  level: number;
  title: string;
  badge: string;
  xpRequired: number;
  color: string;
}

export const RANKS: Rank[] = [
  { level: 1, title: 'Initiate', badge: '⬡', xpRequired: 0, color: 'charcoal-400' },
  { level: 2, title: 'Apprentice', badge: '⬢', xpRequired: 500, color: 'charcoal-500' },
  { level: 3, title: 'Practitioner', badge: '◆', xpRequired: 1500, color: 'blue-500' },
  { level: 4, title: 'Specialist', badge: '◇', xpRequired: 3500, color: 'purple-500' },
  { level: 5, title: 'Expert', badge: '★', xpRequired: 7000, color: 'gold-500' },
  { level: 6, title: 'Master', badge: '✦', xpRequired: 12000, color: 'amber-500' },
  { level: 7, title: 'Legend', badge: '♛', xpRequired: 20000, color: 'emerald-500' },
];

export function getRankFromXP(xp: number): Rank {
  for (let i = RANKS.length - 1; i >= 0; i--) {
    if (xp >= RANKS[i].xpRequired) {
      return RANKS[i];
    }
  }
  return RANKS[0];
}

export function getNextRank(currentRank: Rank): Rank | null {
  const index = RANKS.findIndex(r => r.level === currentRank.level);
  return index < RANKS.length - 1 ? RANKS[index + 1] : null;
}

export function getXPToNextRank(xp: number): { current: number; required: number; percentage: number } {
  const currentRank = getRankFromXP(xp);
  const nextRank = getNextRank(currentRank);
  
  if (!nextRank) {
    return { current: xp, required: xp, percentage: 100 };
  }
  
  const xpInCurrentLevel = xp - currentRank.xpRequired;
  const xpRequiredForNext = nextRank.xpRequired - currentRank.xpRequired;
  
  return {
    current: xpInCurrentLevel,
    required: xpRequiredForNext,
    percentage: Math.round((xpInCurrentLevel / xpRequiredForNext) * 100),
  };
}

// ============================================
// XP REWARDS
// ============================================

export const XP_ACTIONS = {
  LESSON_COMPLETE: 50,
  QUIZ_PASS: 75,
  QUIZ_PERFECT: 150,
  LAB_COMPLETE: 200,
  LAB_EARLY: 50,        // Bonus for completing before deadline
  STREAK_DAILY: 25,
  STREAK_WEEKLY: 100,   // Bonus for 7-day streak
  STREAK_MONTHLY: 500,  // Bonus for 30-day streak
  COHORT_HELP: 75,
  INTERVIEW_PRACTICE: 100,
  FIRST_LESSON: 100,    // First blood bonus
  MODULE_COMPLETE: 300,
  CERTIFICATE_EARNED: 1000,
} as const;

// ============================================
// ACHIEVEMENTS
// ============================================

export type AchievementRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Achievement {
  id: string;
  name: string;
  description: string;
  icon: string;
  rarity: AchievementRarity;
  xpReward: number;
  unlockedAt?: Date;
}

export const ACHIEVEMENTS: Achievement[] = [
  // Progress Achievements
  { id: 'first_blood', name: 'First Blood', description: 'Complete your first lesson', icon: 'Sword', rarity: 'common', xpReward: 50 },
  { id: 'week_warrior', name: 'Week Warrior', description: '7-day learning streak', icon: 'Flame', rarity: 'uncommon', xpReward: 100 },
  { id: 'iron_will', name: 'Iron Will', description: '30-day learning streak', icon: 'Shield', rarity: 'rare', xpReward: 500 },
  { id: 'unstoppable', name: 'Unstoppable', description: '60-day learning streak', icon: 'Zap', rarity: 'epic', xpReward: 1000 },
  
  // Performance Achievements
  { id: 'perfectionist', name: 'Perfectionist', description: '100% on 5 quizzes', icon: 'Target', rarity: 'rare', xpReward: 300 },
  { id: 'speed_demon', name: 'Speed Demon', description: 'Complete lab in under 15 min', icon: 'Zap', rarity: 'epic', xpReward: 250 },
  { id: 'flawless', name: 'Flawless Victory', description: 'Complete module with all perfect scores', icon: 'Crown', rarity: 'legendary', xpReward: 1000 },
  
  // Social Achievements
  { id: 'helpful', name: 'Helpful Hand', description: 'Answer 3 cohort questions', icon: 'Heart', rarity: 'uncommon', xpReward: 75 },
  { id: 'mentor', name: 'Mentor', description: 'Help 10 cohort members', icon: 'Users', rarity: 'rare', xpReward: 200 },
  { id: 'legend', name: 'Legend', description: 'Top 1% of all students', icon: 'Trophy', rarity: 'legendary', xpReward: 2000 },
  
  // Milestone Achievements
  { id: 'halfway', name: 'Halfway There', description: 'Complete 50% of curriculum', icon: 'Mountain', rarity: 'uncommon', xpReward: 150 },
  { id: 'graduate', name: 'Graduate', description: 'Complete the full curriculum', icon: 'GraduationCap', rarity: 'epic', xpReward: 1500 },
  { id: 'certified', name: 'Certified Pro', description: 'Earn your certification', icon: 'Award', rarity: 'legendary', xpReward: 2000 },
];

export const RARITY_STYLES: Record<AchievementRarity, { border: string; bg: string; glow: string }> = {
  common: { 
    border: 'border-charcoal-300', 
    bg: 'bg-charcoal-50', 
    glow: '' 
  },
  uncommon: { 
    border: 'border-green-400', 
    bg: 'bg-green-50', 
    glow: 'shadow-green-200/50' 
  },
  rare: { 
    border: 'border-blue-500', 
    bg: 'bg-blue-50', 
    glow: 'shadow-blue-300/50' 
  },
  epic: { 
    border: 'border-purple-500', 
    bg: 'bg-purple-50', 
    glow: 'shadow-purple-300/50' 
  },
  legendary: { 
    border: 'border-gold-500', 
    bg: 'bg-gradient-to-br from-gold-50 to-amber-50', 
    glow: 'shadow-gold-300/70 animate-glow' 
  },
};

// ============================================
// STREAK SYSTEM
// ============================================

export interface StreakInfo {
  currentStreak: number;
  longestStreak: number;
  lastActivityDate: Date;
  flameLevel: number;      // 0-4 based on streak weeks
  flameColor: string;
  isAtRisk: boolean;       // True if streak will break soon
}

export function getFlameLevel(streakDays: number): number {
  return Math.min(Math.floor(streakDays / 7), 4);
}

export const FLAME_COLORS = [
  'from-orange-400 to-red-500',      // Week 1: Small ember
  'from-yellow-400 to-orange-500',   // Week 2: Building fire
  'from-cyan-400 to-blue-500',       // Week 3: Blue flame (hotter)
  'from-violet-400 to-purple-600',   // Week 4+: Legendary purple
  'from-emerald-400 to-teal-500',    // Week 5+: Master flame
];

export function getFlameColor(flameLevel: number): string {
  return FLAME_COLORS[Math.min(flameLevel, FLAME_COLORS.length - 1)];
}

// ============================================
// DAILY CHALLENGES
// ============================================

export interface Challenge {
  id: string;
  text: string;
  xpReward: number;
  icon: string;
  isCompleted: boolean;
  expiresAt: Date;
}

export const DAILY_CHALLENGE_TEMPLATES = [
  { id: 'complete_lesson', text: 'Complete 1 lesson', xp: 50, icon: 'BookOpen' },
  { id: 'practice_interview', text: 'Practice interview for 10 min', xp: 75, icon: 'Mic' },
  { id: 'quiz_attempt', text: 'Attempt a quiz (any score)', xp: 25, icon: 'Target' },
  { id: 'review_material', text: 'Review completed material', xp: 30, icon: 'RefreshCw' },
  { id: 'help_peer', text: 'Help a cohort member', xp: 60, icon: 'Users' },
];

export const WEEKLY_QUEST_TEMPLATES = [
  { id: 'complete_module', text: 'Complete an entire module', xp: 500, icon: 'Trophy' },
  { id: 'help_cohort', text: 'Answer 3 cohort questions', xp: 200, icon: 'Users' },
  { id: 'portfolio_piece', text: 'Add lab to portfolio', xp: 300, icon: 'Briefcase' },
  { id: 'perfect_week', text: '7-day streak this week', xp: 250, icon: 'Flame' },
];

// ============================================
// LEADERBOARD
// ============================================

export interface LeaderboardEntry {
  id: string;
  name: string;
  avatar?: string;
  xp: number;
  level: number;
  rank: Rank;
  progress: number;
  streak: number;
  isCurrentUser: boolean;
}












