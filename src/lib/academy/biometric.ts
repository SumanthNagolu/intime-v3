/**
 * Biometric Environment System
 * The living organism that responds to student performance
 */

export type BiometricState = 'ember' | 'neutral' | 'ascent' | 'apex';

export interface BiometricScore {
  moduleProgress: number;      // 0-100
  quizPerformance: number;     // Average quiz scores 0-100
  labCompletions: number;      // Percentage of labs completed on time
  streakDays: number;          // Consecutive learning days
  cohortRank: number;          // Position in cohort (percentile 0-100)
  interviewReadiness: number;  // AI-assessed interview confidence 0-100
}

export interface BiometricTheme {
  state: BiometricState;
  primaryColor: string;
  secondaryColor: string;
  pulseColor: string;
  gradientFrom: string;
  gradientTo: string;
  statusMessage: string;
  glowIntensity: number;
  particleCount: number;
}

// Calculate overall biometric score from components
export function calculateBiometricScore(scores: Partial<BiometricScore>): number {
  const weights = {
    moduleProgress: 0.25,
    quizPerformance: 0.20,
    labCompletions: 0.20,
    streakDays: 0.15,
    cohortRank: 0.10,
    interviewReadiness: 0.10,
  };

  // Normalize streak days (7 days = 100%)
  const normalizedStreak = Math.min((scores.streakDays || 0) / 7, 1) * 100;

  const totalScore = 
    (scores.moduleProgress || 0) * weights.moduleProgress +
    (scores.quizPerformance || 0) * weights.quizPerformance +
    (scores.labCompletions || 0) * weights.labCompletions +
    normalizedStreak * weights.streakDays +
    (scores.cohortRank || 0) * weights.cohortRank +
    (scores.interviewReadiness || 0) * weights.interviewReadiness;

  return Math.round(totalScore);
}

// Determine biometric state from score
export function getBiometricState(score: number): BiometricState {
  if (score >= 90) return 'apex';
  if (score >= 70) return 'ascent';
  if (score >= 40) return 'neutral';
  return 'ember';
}

// Get theme configuration for a biometric state
export function getBiometricTheme(state: BiometricState): BiometricTheme {
  const themes: Record<BiometricState, BiometricTheme> = {
    ember: {
      state: 'ember',
      primaryColor: 'rgba(220, 38, 38, 0.12)',
      secondaryColor: 'rgba(234, 88, 12, 0.08)',
      pulseColor: '#DC2626',
      gradientFrom: '#7F1D1D',
      gradientTo: '#991B1B',
      statusMessage: 'RECOVERY PROTOCOL',
      glowIntensity: 0.8,
      particleCount: 0,
    },
    neutral: {
      state: 'neutral',
      primaryColor: 'rgba(201, 169, 97, 0.10)',
      secondaryColor: 'rgba(212, 175, 55, 0.06)',
      pulseColor: '#D4AF37',
      gradientFrom: '#C9A961',
      gradientTo: '#B8964E',
      statusMessage: 'IN PROGRESS',
      glowIntensity: 0.5,
      particleCount: 0,
    },
    ascent: {
      state: 'ascent',
      primaryColor: 'rgba(13, 76, 59, 0.12)',
      secondaryColor: 'rgba(16, 185, 129, 0.08)',
      pulseColor: '#0D4C3B',
      gradientFrom: '#065F46',
      gradientTo: '#047857',
      statusMessage: 'ACCELERATING',
      glowIntensity: 0.6,
      particleCount: 5,
    },
    apex: {
      state: 'apex',
      primaryColor: 'rgba(16, 185, 129, 0.15)',
      secondaryColor: 'rgba(52, 211, 153, 0.10)',
      pulseColor: '#10B981',
      gradientFrom: '#047857',
      gradientTo: '#10B981',
      statusMessage: 'ELITE STATUS',
      glowIntensity: 1.0,
      particleCount: 15,
    },
  };

  return themes[state];
}

// CSS custom properties for theming
export function getBiometricCSSVariables(theme: BiometricTheme): Record<string, string> {
  return {
    '--biometric-primary': theme.primaryColor,
    '--biometric-secondary': theme.secondaryColor,
    '--biometric-pulse': theme.pulseColor,
    '--biometric-gradient-from': theme.gradientFrom,
    '--biometric-gradient-to': theme.gradientTo,
    '--biometric-glow-intensity': String(theme.glowIntensity),
  };
}

// Transition timing for state changes (creates smooth morphing)
export const BIOMETRIC_TRANSITION = 'all 2s cubic-bezier(0.4, 0, 0.2, 1)';











