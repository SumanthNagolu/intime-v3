'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowUpRight,
  Star,
  Zap,
  Target,
  Brain,
  Sparkles,
  TrendingUp,
  BookOpen,
  AlertCircle,
  X
} from 'lucide-react';
import { useBiometric, useGamification } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './BiometricBackground';
import { StreakFlame } from './StreakFlame';
import { getXPToNextRank } from '@/lib/academy/gamification';

interface AcademyPortalProps {
  error?: string;
}

/**
 * AcademyPortal - Simplified Entry Point
 *
 * Clean landing page with:
 * - 3 key metrics (Readiness Score, XP, Streak)
 * - AI Twin notes for the day
 * - Single dashboard button
 */
export function AcademyPortal({ error }: AcademyPortalProps) {
  const router = useRouter();
  const { score, state, theme, statusMessage } = useBiometric();
  const { xp, rank, streakDays } = useGamification();
  const xpProgress = getXPToNextRank(xp);
  const [showError, setShowError] = React.useState(!!error);

  // Get greeting based on time
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
  };

  // Determine motivational message based on state
  const motivationalMessages: Record<typeof state, string> = {
    ember: "Every expert was once a beginner. Let&apos;s build momentum today.",
    neutral: "Consistency beats intensity. Your next lesson awaits.",
    ascent: "You&apos;re building something special. Keep the momentum going.",
    apex: "You&apos;re performing at elite level. Time to push your limits."
  };

  return (
    <div className="min-h-screen bg-ivory flex flex-col lg:flex-row">

      {/* Error Banner - Wrong Portal */}
      {showError && error === 'wrong_portal' && (
        <div className="fixed top-0 left-0 right-0 z-50 bg-amber-50 border-b border-amber-200 px-4 py-3">
          <div className="max-w-4xl mx-auto flex items-center gap-3">
            <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <p className="text-amber-800 text-sm flex-1">
              <span className="font-semibold">Wrong portal:</span> You tried to access the Employee Portal, but your account is registered as a student. You&apos;ve been redirected to the Academy Portal.
            </p>
            <button
              onClick={() => setShowError(false)}
              className="p-1 hover:bg-amber-100 rounded transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4 text-amber-600" />
            </button>
          </div>
        </div>
      )}

      {/* Left side - Branding & greeting */}
      <div className="lg:w-[45%] px-8 md:px-12 lg:px-16 py-12 lg:py-16 flex flex-col">
        <Link href="/" className="text-charcoal-400 text-sm hover:text-charcoal-900 transition-colors mb-auto">
          ← Home
        </Link>

        <div className="my-auto">
          <div className="font-heading text-6xl md:text-7xl lg:text-8xl text-forest-900 tracking-tight leading-none">
            In<span className="text-gold-600">Time</span>
          </div>

          <div className="mt-8">
            <p className="text-gold-700 font-mono text-sm font-semibold tracking-widest uppercase">
              Training Academy
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-charcoal-900 leading-[1.1] mt-3">
              {getGreeting()},<br />Candidate<span className="text-gold-600">.</span>
            </h1>
          </div>

          {/* Biometric Status */}
          <div className="mt-8">
            <BiometricStatusIndicator state={state} statusMessage={statusMessage} />
          </div>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg mt-6 leading-relaxed font-heading italic border-l-2 pl-4"
            style={{ borderColor: theme.pulseColor }}>
            &ldquo;{motivationalMessages[state]}&rdquo;
          </p>
        </div>

        <div className="mt-auto pt-8 text-xs text-charcoal-400 font-mono tracking-wider">
          SOC 2 · GDPR · CCPA
        </div>
      </div>

      {/* Right side - Metrics, AI Notes, and Dashboard button */}
      <div className="lg:w-[55%] bg-white lg:rounded-tl-[4rem] flex flex-col">

        {/* 3 Key Metrics */}
        <div className="px-8 md:px-12 py-8 lg:py-10 border-b border-charcoal-100">
          <p className="text-charcoal-400 text-sm font-medium mb-5">Your Progress</p>
          <div className="grid grid-cols-3 gap-4">
            {/* Readiness Score */}
            <div
              className="rounded-2xl p-5 border-2"
              style={{
                backgroundColor: `${theme.pulseColor}10`,
                borderColor: `${theme.pulseColor}30`
              }}
            >
              <div className="flex items-center gap-2 mb-3">
                <div
                  className="w-8 h-8 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: theme.pulseColor }}
                >
                  <Target size={16} className="text-white" />
                </div>
              </div>
              <div
                className="text-3xl font-bold mb-1"
                style={{ color: theme.pulseColor }}
              >
                {score}%
              </div>
              <div className="text-charcoal-500 text-xs font-medium">
                Readiness Score
              </div>
              <div className="text-charcoal-400 text-xs mt-2">
                {statusMessage}
              </div>
            </div>

            {/* XP */}
            <div className="bg-gold-50 rounded-2xl p-5 border border-gold-200/50">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center">
                  <Star size={16} className="text-white" />
                </div>
              </div>
              <div className="text-3xl font-bold text-gold-700 mb-1">
                {xp.toLocaleString()}
              </div>
              <div className="text-charcoal-500 text-xs font-medium">
                Total XP
              </div>
              <div className="text-gold-600 text-xs mt-2 font-medium flex items-center gap-1">
                <span>{rank.badge}</span> {rank.title}
              </div>
            </div>

            {/* Streak */}
            <div className="bg-charcoal-50 rounded-2xl p-5">
              <div className="flex items-center gap-2 mb-3">
                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
                  <Zap size={16} className="text-white" />
                </div>
              </div>
              {streakDays > 0 ? (
                <>
                  <div className="text-3xl font-bold text-orange-600 mb-1">
                    {streakDays}
                  </div>
                  <div className="text-charcoal-500 text-xs font-medium">
                    Day Streak
                  </div>
                  <div className="mt-2">
                    <StreakFlame streakDays={streakDays} size="sm" />
                  </div>
                </>
              ) : (
                <>
                  <div className="text-3xl font-bold text-charcoal-400 mb-1">
                    0
                  </div>
                  <div className="text-charcoal-500 text-xs font-medium">
                    Day Streak
                  </div>
                  <div className="text-charcoal-400 text-xs mt-2">
                    Start your streak today!
                  </div>
                </>
              )}
            </div>
          </div>

          {/* XP Progress Bar */}
          <div className="mt-5 bg-charcoal-50 rounded-xl p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-charcoal-500 font-medium">Next Rank Progress</span>
              <span className="text-xs text-charcoal-600 font-bold">{xpProgress.current}/{xpProgress.required} XP</span>
            </div>
            <div className="h-2 bg-charcoal-200 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${xpProgress.percentage}%`,
                  background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`
                }}
              />
            </div>
          </div>
        </div>

        {/* AI Twin Notes Section */}
        <div className="flex-1 px-8 md:px-12 py-8">
          <div className="flex items-center gap-2 mb-5">
            <Brain size={16} className="text-gold-600" />
            <p className="text-charcoal-400 text-sm font-medium">AI Mentor Notes</p>
          </div>

          <div className="space-y-4">
            {/* Today's Focus */}
            <div className="bg-gradient-to-br from-forest-50 to-forest-100/50 rounded-2xl p-5 border border-forest-200/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-forest-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Sparkles size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 mb-1">Today&apos;s Focus</h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    Continue with Module 3: API Integration. You&apos;re 60% through and showing strong comprehension.
                    Complete 2 more lessons to unlock the practice project.
                  </p>
                </div>
              </div>
            </div>

            {/* Learning Insight */}
            <div className="bg-charcoal-50 rounded-2xl p-5">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-charcoal-200 rounded-lg flex items-center justify-center flex-shrink-0">
                  <BookOpen size={14} className="text-charcoal-600" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 mb-1">Learning Pattern</h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    You perform best in morning sessions (9-11am). Consider scheduling your hardest topics during this window.
                  </p>
                </div>
              </div>
            </div>

            {/* Progress Insight */}
            <div className="bg-gold-50 rounded-2xl p-5 border border-gold-200/50">
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-gold-500 rounded-lg flex items-center justify-center flex-shrink-0">
                  <TrendingUp size={14} className="text-white" />
                </div>
                <div>
                  <h3 className="font-semibold text-charcoal-900 mb-1">Week Progress</h3>
                  <p className="text-charcoal-600 text-sm leading-relaxed">
                    You&apos;ve completed 8 lessons this week, earning 450 XP. Just 2 more lessons to hit your weekly goal!
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Go to Dashboard Button */}
        <div className="px-8 md:px-12 py-6 border-t border-charcoal-200 bg-charcoal-50">
          <button
            onClick={() => router.push('/academy/dashboard')}
            className="w-full flex items-center justify-center gap-3 px-6 py-5 bg-forest-600 hover:bg-forest-700 text-white rounded-2xl font-semibold text-lg transition-colors shadow-lg shadow-forest-600/20"
          >
            Open Mission Control
            <ArrowUpRight size={20} />
          </button>
        </div>
      </div>
    </div>
  );
}

export default AcademyPortal;









