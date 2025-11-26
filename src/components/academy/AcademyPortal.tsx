'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import {
  ArrowRight,
  Terminal,
  Shield,
  Activity,
  Cpu,
  Star,
  Trophy,
  Zap,
  Target,
  Sparkles,
  TrendingUp,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBiometric, useGamification, useAcademyStore } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './BiometricBackground';
import { StreakFlame } from './StreakFlame';
import { getXPToNextRank } from '@/lib/academy/gamification';

/**
 * AcademyPortal - The Entry Point
 *
 * A dramatic, game-like welcome screen that sets the tone
 * for the student's learning journey. Responds to biometric state.
 */
export function AcademyPortal() {
  const router = useRouter();
  const { score, state, theme, statusMessage } = useBiometric();
  const { xp, rank, streakDays } = useGamification();
  const xpProgress = getXPToNextRank(xp);

  // Determine welcome message based on state
  const welcomeMessages = {
    ember: {
      title: "Time to Rise",
      subtitle: "Your journey continues. Every step forward counts.",
      cta: "Begin Recovery Protocol"
    },
    neutral: {
      title: "Welcome Back",
      subtitle: "Your environment is prepped. Your mentor awaits.",
      cta: "Enter Workspace"
    },
    ascent: {
      title: "You're On Fire",
      subtitle: "Momentum is building. Keep pushing forward.",
      cta: "Continue Ascent"
    },
    apex: {
      title: "Elite Status",
      subtitle: "You've reached the top. Time to dominate.",
      cta: "Enter Command Center"
    }
  };

  const message = welcomeMessages[state];

  return (
    <div className="animate-fade-in pt-4 pb-12">

      {/* ============================================
          HERO HEADER - Mission Control Style
          ============================================ */}
      <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b-2 border-charcoal-100">
        <div>
          {/* Biometric Status */}
          <div className="mb-4">
            <BiometricStatusIndicator state={state} statusMessage={statusMessage} />
          </div>

          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-heading font-black text-charcoal-900 mb-4 tracking-tight leading-none">
            {message.title.split(' ')[0]}<br />
            <span
              className="transition-colors duration-1000"
              style={{ color: theme.pulseColor }}
            >
              {message.title.split(' ').slice(1).join(' ') || 'Candidate.'}
            </span>
          </h1>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
            style={{ borderColor: theme.pulseColor }}>
            &ldquo;{message.subtitle}&rdquo;
          </p>
        </div>

        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Biometric Score - Main Metric */}
          <div
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div
              className="text-5xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {score}<span className="text-xl align-top">%</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              Readiness Score
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>{statusMessage}</span>
            </div>
          </div>

          {/* Rank & Streak Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Current Rank</div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl">{rank.badge}</span>
                  <span className="text-sm font-heading font-bold text-charcoal-900">
                    {rank.title}
                  </span>
                </div>
              </div>
              <div className="pt-2 border-t border-charcoal-100">
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Total XP</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-heading font-bold text-gold-600">
                    {xp.toLocaleString()}
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-body">XP</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

        {/* Left: Quick Stats & CTA */}
        <div className="space-y-6">
          {/* Quick Stats Row */}
          <div className="grid grid-cols-3 gap-4">
            {/* Rank */}
            <div className="bg-white border-2 border-charcoal-100 rounded-2xl p-4 shadow-elevation-sm">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-xl flex items-center justify-center text-xl"
                  style={{
                    background: `linear-gradient(135deg, ${theme.gradientFrom}20, ${theme.gradientTo}10)`
                  }}
                >
                  {rank.badge}
                </div>
                <div>
                  <div className="text-[9px] font-body text-charcoal-400 uppercase tracking-widest font-bold">RANK</div>
                  <div className="font-bold text-charcoal-900 text-sm font-heading">{rank.title}</div>
                </div>
              </div>
            </div>

            {/* XP */}
            <div className="bg-white border-2 border-charcoal-100 rounded-2xl p-4 shadow-elevation-sm">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gold-100 flex items-center justify-center">
                  <Star size={18} className="text-gold-600" />
                </div>
                <div>
                  <div className="text-[9px] font-body text-charcoal-400 uppercase tracking-widest font-bold">XP</div>
                  <div className="font-bold text-charcoal-900 text-sm font-heading">{xp.toLocaleString()}</div>
                </div>
              </div>
            </div>

            {/* Streak */}
            <div className="bg-white border-2 border-charcoal-100 rounded-2xl p-4 shadow-elevation-sm">
              {streakDays > 0 ? (
                <StreakFlame streakDays={streakDays} size="sm" />
              ) : (
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-charcoal-100 flex items-center justify-center">
                    <Zap size={18} className="text-charcoal-400" />
                  </div>
                  <div>
                    <div className="text-[9px] font-body text-charcoal-400 uppercase tracking-widest font-bold">STREAK</div>
                    <div className="font-bold text-charcoal-500 text-sm font-heading">Start Today</div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* XP Progress to Next Rank */}
          <div className="bg-white border-2 border-charcoal-100 rounded-2xl p-6 shadow-elevation-sm">
            <div className="flex items-center justify-between mb-3">
              <span className="text-[10px] font-body text-charcoal-400 uppercase tracking-widest font-bold">Progress to Next Rank</span>
              <span className="text-xs font-body text-charcoal-600 font-bold">{xpProgress.current}/{xpProgress.required} XP</span>
            </div>
            <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width: `${xpProgress.percentage}%`,
                  background: `linear-gradient(90deg, ${theme.gradientFrom}, ${theme.gradientTo})`
                }}
              />
            </div>
          </div>

          {/* CTA Button */}
          <button
            onClick={() => router.push('/academy/dashboard')}
            className="w-full group flex items-center justify-between p-6 bg-charcoal-900 text-white rounded-2xl shadow-elevation-md hover:shadow-elevation-lg transition-all duration-300"
          >
            <div className="flex items-center gap-4">
              <div
                className="w-12 h-12 rounded-xl flex items-center justify-center"
                style={{
                  background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
                }}
              >
                <Sparkles size={24} className="text-white" />
              </div>
              <div className="text-left">
                <div className="font-heading font-bold text-lg">{message.cta}</div>
                <div className="text-charcoal-400 text-sm font-body">Access your Mission Control</div>
              </div>
            </div>
            <ArrowRight
              size={24}
              className="text-charcoal-400 group-hover:translate-x-2 group-hover:text-white transition-all"
            />
          </button>
        </div>

        {/* Right: Pre-flight Check Card */}
        <div
          className="rounded-2xl shadow-elevation-md border-2 overflow-hidden bg-white"
          style={{ borderColor: `${theme.pulseColor}30` }}
        >
          {/* Header */}
          <div className="p-6 border-b border-charcoal-100 flex items-center justify-between">
            <div>
              <div className="text-[10px] font-bold text-charcoal-400 uppercase tracking-widest mb-1 font-body">
                Current Objective
              </div>
              <div className="text-xl font-heading font-bold text-charcoal-900">
                Become Job-Ready
              </div>
            </div>
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center shadow-elevation-sm"
              style={{
                background: `linear-gradient(135deg, ${theme.gradientFrom}, ${theme.gradientTo})`
              }}
            >
              <Shield size={22} className="text-white" />
            </div>
          </div>

          {/* System Status Items */}
          <div className="p-6 space-y-3">
            {[
              {
                icon: Terminal,
                label: 'Lab Environment',
                value: 'Active',
                status: 'success',
                detail: 'Sprint 2'
              },
              {
                icon: Cpu,
                label: 'AI Mentor',
                value: 'Connected',
                status: 'success',
                detail: 'Ready'
              },
              {
                icon: Activity,
                label: 'Biometric',
                value: `${score}%`,
                status: state === 'ember' ? 'warning' : state === 'apex' ? 'success' : 'neutral',
                detail: statusMessage
              },
              {
                icon: Target,
                label: 'Next Milestone',
                value: xpProgress.percentage + '%',
                status: 'neutral',
                detail: `${xpProgress.current}/${xpProgress.required} XP`
              },
            ].map((item, i) => {
              const statusColors = {
                success: 'bg-forest-100 text-forest-700',
                warning: 'bg-gold-100 text-gold-700',
                neutral: 'bg-charcoal-100 text-charcoal-700',
              };

              return (
                <div
                  key={i}
                  className="flex items-center gap-4 p-4 rounded-xl bg-charcoal-50 border border-charcoal-100
                    hover:bg-white hover:shadow-elevation-sm transition-all"
                >
                  <div className={cn(
                    "w-10 h-10 rounded-xl flex items-center justify-center",
                    statusColors[item.status]
                  )}>
                    <item.icon size={18} />
                  </div>
                  <div className="flex-1">
                    <div className="text-[10px] font-bold uppercase tracking-widest text-charcoal-400 font-body">
                      {item.label}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-charcoal-900 font-heading">{item.value}</span>
                      <span className="text-xs text-charcoal-500 font-body">({item.detail})</span>
                    </div>
                  </div>
                  {item.status === 'success' && (
                    <CheckCircle size={16} className="text-forest-500" />
                  )}
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 pb-6">
            <div className="pt-4 text-center border-t border-charcoal-100">
              <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal-400 font-body">
                <Shield size={10} /> Secure Connection • v3.2.0
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          BOTTOM: Achievement Preview (for Apex state)
          ============================================ */}
      {state === 'apex' && (
        <div className="mt-12 text-center animate-slide-up">
          <div className="inline-flex items-center gap-4 px-8 py-4 bg-white rounded-2xl shadow-elevation-md border-2 border-gold-200">
            <Trophy size={20} className="text-gold-500" />
            <span className="text-charcoal-900 font-bold font-heading">Elite Status Unlocked</span>
            <div className="w-px h-6 bg-charcoal-200" />
            <span className="text-charcoal-500 text-sm font-body">You&apos;re in the top 10% of all students</span>
          </div>
        </div>
      )}
    </div>
  );
}

export default AcademyPortal;


