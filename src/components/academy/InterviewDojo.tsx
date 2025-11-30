'use client';

import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  Pause,
  RefreshCcw,
  User,
  Award,
  Volume2,
  Circle,
  Zap,
  Target,
  Shield,
  Swords,
  Timer,
  TrendingUp,
  CheckCircle,
  Star
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useBiometric, useGamification, useAcademyStore } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './BiometricBackground';
import { INTERVIEW_SCRIPT } from '@/lib/academy/constants';
import { XP_ACTIONS } from '@/lib/academy/gamification';

// Belt ranks for the dojo
const BELT_RANKS = [
  { level: 0, name: 'White Belt', color: 'bg-white border-charcoal-200', textColor: 'text-charcoal-600', sessions: 0 },
  { level: 1, name: 'Yellow Belt', color: 'bg-yellow-400', textColor: 'text-yellow-900', sessions: 3 },
  { level: 2, name: 'Orange Belt', color: 'bg-orange-500', textColor: 'text-white', sessions: 7 },
  { level: 3, name: 'Green Belt', color: 'bg-green-600', textColor: 'text-white', sessions: 15 },
  { level: 4, name: 'Blue Belt', color: 'bg-blue-600', textColor: 'text-white', sessions: 25 },
  { level: 5, name: 'Purple Belt', color: 'bg-purple-600', textColor: 'text-white', sessions: 40 },
  { level: 6, name: 'Brown Belt', color: 'bg-amber-800', textColor: 'text-white', sessions: 60 },
  { level: 7, name: 'Black Belt', color: 'bg-charcoal-900', textColor: 'text-white', sessions: 100 },
];

// Training modes
const TRAINING_MODES = [
  {
    id: 'shadow',
    name: 'Shadow Practice',
    description: 'Follow along with a senior developer interview',
    icon: User,
    requiredBelt: 0,
    xp: XP_ACTIONS.INTERVIEW_PRACTICE
  },
  {
    id: 'technical',
    name: 'Technical Kata',
    description: 'Answer rapid-fire technical questions',
    icon: Zap,
    requiredBelt: 1,
    xp: XP_ACTIONS.INTERVIEW_PRACTICE + 50
  },
  {
    id: 'behavioral',
    name: 'Behavioral Sparring',
    description: 'Practice STAR method responses',
    icon: Target,
    requiredBelt: 2,
    xp: XP_ACTIONS.INTERVIEW_PRACTICE + 75
  },
  {
    id: 'live',
    name: 'Live Kumite',
    description: 'AI-powered mock interview simulation',
    icon: Swords,
    requiredBelt: 3,
    xp: XP_ACTIONS.INTERVIEW_PRACTICE + 100
  },
];

export function InterviewDojo() {
  const { state, theme, statusMessage } = useBiometric();
  const { addXP } = useGamification();
  const { streakDays } = useAcademyStore();

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const [sessionsCompleted, setSessionsCompleted] = useState(12); // Mock
  const [selectedMode, setSelectedMode] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Calculate current belt
  const currentBelt = BELT_RANKS.reduce((acc, belt) =>
    sessionsCompleted >= belt.sessions ? belt : acc
    , BELT_RANKS[0]);

  const nextBelt = BELT_RANKS[currentBelt.level + 1];

  // Video/teleprompter simulation
  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    if (isPlaying) {
      if (currentLineIndex >= INTERVIEW_SCRIPT.length) {
        setIsPlaying(false);
        // Award XP for completing session
        addXP(XP_ACTIONS.INTERVIEW_PRACTICE);
        setSessionsCompleted(prev => prev + 1);
        return;
      }

      const line = INTERVIEW_SCRIPT[currentLineIndex];
      const step = 100 / (line.duration / 50);

      interval = setInterval(() => {
        setProgress(p => {
          if (p >= 100) {
            setCurrentLineIndex(prev => prev + 1);
            if (scrollRef.current) {
              const activeEl = document.getElementById(`line-${currentLineIndex + 1}`);
              if (activeEl) activeEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return 0;
          }
          return p + step;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [isPlaying, currentLineIndex, addXP]);

  const reset = () => {
    setIsPlaying(false);
    setCurrentLineIndex(0);
    setProgress(0);
  };

  const startMode = (modeId: string) => {
    setSelectedMode(modeId);
    reset();
  };

  // Calculate confidence score
  const confidenceScore = Math.min(50 + sessionsCompleted * 3, 100);

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
            Interview<br />Dojo
          </h1>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
            style={{ borderColor: theme.pulseColor }}>
            &ldquo;Practice makes perfect. Master the art of the technical interview.&rdquo;
          </p>
        </div>

        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Confidence Score - Main Metric */}
          <div
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div
              className="text-5xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {confidenceScore}<span className="text-xl align-top">%</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              Confidence Score
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>{sessionsCompleted} sessions</span>
            </div>
          </div>

          {/* Belt & Streak Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Current Rank</div>
                <div className="flex items-center gap-2">
                  <div
                    className={cn(
                      "w-8 h-2 rounded-sm border",
                      currentBelt.color
                    )}
                  />
                  <span className="text-sm font-heading font-bold text-charcoal-900">
                    {currentBelt.name}
                  </span>
                </div>
                {nextBelt && (
                  <div className="text-[10px] text-charcoal-400 mt-1 font-body">
                    {nextBelt.sessions - sessionsCompleted} to {nextBelt.name}
                  </div>
                )}
              </div>
              <div className="pt-2 border-t border-charcoal-100">
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Streak Days</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-heading font-bold text-charcoal-700">
                    {streakDays}
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-body">days</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          STATS ROW
          ============================================ */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Sessions Completed', value: sessionsCompleted, icon: CheckCircle },
          { label: 'Current Streak', value: `${streakDays} days`, icon: Zap },
          { label: 'Avg. Confidence', value: `${confidenceScore}%`, icon: TrendingUp },
          { label: 'XP Earned', value: `${(sessionsCompleted * XP_ACTIONS.INTERVIEW_PRACTICE).toLocaleString()}`, icon: Star },
        ].map((stat, i) => (
          <div key={i} className="bg-white border-2 border-charcoal-100 rounded-2xl p-4 shadow-elevation-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-charcoal-100 flex items-center justify-center">
                <stat.icon size={18} className="text-charcoal-600" />
              </div>
              <div>
                <div className="text-[9px] font-body text-charcoal-400 uppercase tracking-widest font-bold">
                  {stat.label}
                </div>
                <div className="text-charcoal-900 font-heading font-bold">{stat.value}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ============================================
          TRAINING MODES
          ============================================ */}
      {!selectedMode && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {TRAINING_MODES.map((mode) => {
            const isLocked = currentBelt.level < mode.requiredBelt;
            const requiredBeltInfo = BELT_RANKS[mode.requiredBelt];

            return (
              <button
                key={mode.id}
                onClick={() => !isLocked && startMode(mode.id)}
                disabled={isLocked}
                className={cn(
                  "relative p-6 rounded-2xl border-2 text-left transition-all duration-300 group",
                  isLocked
                    ? "bg-charcoal-50 border-charcoal-100 opacity-60 cursor-not-allowed"
                    : "bg-white border-charcoal-100 hover:border-charcoal-900 hover:shadow-elevation-lg cursor-pointer"
                )}
              >
                {/* XP Badge */}
                {!isLocked && (
                  <div className="absolute top-4 right-4 flex items-center gap-1 px-2 py-1 bg-gold-100 text-gold-700 text-[10px] font-bold rounded-lg font-body">
                    <Star size={10} />
                    +{mode.xp} XP
                  </div>
                )}

                <div className={cn(
                  "w-12 h-12 rounded-xl flex items-center justify-center mb-4",
                  isLocked ? "bg-charcoal-100 text-charcoal-400" : "bg-charcoal-900 text-white"
                )}>
                  <mode.icon size={24} />
                </div>

                <h3 className={cn(
                  "font-heading font-bold text-lg mb-2",
                  isLocked ? "text-charcoal-400" : "text-charcoal-900"
                )}>
                  {mode.name}
                </h3>

                <p className="text-sm text-charcoal-500 mb-4 font-body">
                  {mode.description}
                </p>

                {isLocked && (
                  <div className="flex items-center gap-2 text-xs text-charcoal-400 font-body">
                    <Shield size={12} />
                    Requires {requiredBeltInfo.name}
                  </div>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* ============================================
          SHADOW PRACTICE MODE
          ============================================ */}
      {selectedMode === 'shadow' && (
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Back Button */}
          <button
            onClick={() => setSelectedMode(null)}
            className="absolute top-4 left-4 text-charcoal-500 hover:text-charcoal-900 transition-colors font-body text-sm"
          >
            ← Back to modes
          </button>

          {/* Main Teleprompter */}
          <div className="flex-1 bg-white rounded-2xl shadow-elevation-md border-2 border-charcoal-100 relative overflow-hidden flex flex-col min-h-[500px]">

            {/* Controls Header */}
            <div className="p-6 border-b border-charcoal-100 flex justify-between items-center">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest font-body",
                  isPlaying ? "bg-forest-100 text-forest-700" : "bg-charcoal-100 text-charcoal-500"
                )}>
                  <Circle size={8} className={isPlaying ? "fill-forest-500 animate-pulse" : "fill-charcoal-400"} />
                  {isPlaying ? "Live Simulation" : "Ready"}
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setIsPlaying(!isPlaying)}
                  className={cn(
                    "flex items-center gap-2 px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-widest transition-all font-body",
                    isPlaying
                      ? "bg-charcoal-100 text-charcoal-700 hover:bg-charcoal-200"
                      : "bg-charcoal-900 text-white hover:bg-charcoal-800 shadow-elevation-sm"
                  )}
                >
                  {isPlaying ? <Pause size={16} /> : <Play size={16} />}
                  {isPlaying ? 'Pause' : 'Start'}
                </button>
                <button
                  onClick={reset}
                  className="w-12 h-12 flex items-center justify-center rounded-xl border-2 border-charcoal-200
                    hover:bg-charcoal-50 text-charcoal-400 hover:text-charcoal-700 transition-colors"
                >
                  <RefreshCcw size={18} />
                </button>
              </div>
            </div>

            {/* Script Area */}
            <div className="flex-1 relative overflow-hidden">
              {/* Gradients for focus */}
              <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-white via-white/90 to-transparent z-10 pointer-events-none" />
              <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white via-white/90 to-transparent z-10 pointer-events-none" />

              <div
                className="h-full overflow-y-auto p-12 space-y-12 scroll-smooth"
                ref={scrollRef}
              >
                {INTERVIEW_SCRIPT.map((line, idx) => {
                  const isActive = idx === currentLineIndex;
                  const isPast = idx < currentLineIndex;
                  const isSenior = line.speaker === 'SeniorDev';

                  return (
                    <div
                      id={`line-${idx}`}
                      key={idx}
                      className={cn(
                        "transition-all duration-700 ease-out",
                        isActive && "scale-105 opacity-100 translate-x-4",
                        isPast && "opacity-20 blur-[2px] grayscale",
                        !isActive && !isPast && "opacity-30 grayscale"
                      )}
                    >
                      <div className="flex items-center gap-3 mb-3">
                        {isSenior ? (
                          <div className={cn(
                            "flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-lg border font-body",
                            isActive
                              ? "bg-charcoal-900 border-charcoal-900 text-white"
                              : "bg-charcoal-50 border-charcoal-100 text-charcoal-400"
                          )}>
                            <Award size={12} /> You (Senior Dev)
                          </div>
                        ) : (
                          <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-charcoal-400 bg-charcoal-50 px-3 py-1 rounded-lg border border-charcoal-100 font-body">
                            <User size={12} /> Interviewer
                          </div>
                        )}
                      </div>

                      <p className={cn(
                        "font-heading text-3xl leading-tight max-w-3xl",
                        isActive && isSenior && "text-charcoal-900 font-bold",
                        isActive && !isSenior && "text-charcoal-600 italic",
                        !isActive && "text-charcoal-400"
                      )}>
                        &ldquo;{line.text}&rdquo;
                      </p>

                      {isActive && (
                        <div className="mt-6 h-1.5 w-full max-w-xl bg-charcoal-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-charcoal-900 transition-all duration-75 ease-linear"
                            style={{ width: `${progress}%` }}
                          />
                        </div>
                      )}
                    </div>
                  );
                })}

                {/* Spacer */}
                <div className="h-[50vh]" />
              </div>
            </div>
          </div>

          {/* Right Panel: Real-time Analysis */}
          <div className="w-full lg:w-80 shrink-0 flex flex-col gap-6">
            <div
              className="p-8 rounded-2xl relative overflow-hidden border-2"
              style={{
                background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
                borderColor: theme.gradientFrom,
              }}
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />

              <h3 className="font-heading text-xl font-bold text-white mb-8 relative z-10">
                Real-time Analysis
              </h3>

              <div className="space-y-8 relative z-10">
                <div>
                  <div className="text-[10px] text-white/50 uppercase tracking-widest mb-2 font-body font-bold">
                    Pacing (WPM)
                  </div>
                  <div className="flex items-end gap-3">
                    <span className="text-5xl font-heading font-black text-emerald-400 leading-none">140</span>
                    <span className="text-xs text-white/60 mb-1 font-medium bg-white/10 px-2 py-0.5 rounded-lg font-body">
                      Optimal
                    </span>
                  </div>
                </div>

                <div>
                  <div className="text-[10px] text-white/50 uppercase tracking-widest mb-2 font-body font-bold">
                    Tone Confidence
                  </div>
                  <div className="flex items-center gap-3 text-gold-400">
                    <Volume2 size={24} />
                    <span className="font-bold text-lg font-body">High</span>
                  </div>
                  <div className="w-full h-1.5 bg-white/10 rounded-full mt-2 overflow-hidden">
                    <div className="w-[85%] h-full bg-gold-500 rounded-full" />
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-white p-8 rounded-2xl border-2 border-charcoal-100 shadow-elevation-sm flex-1">
              <h3 className="font-heading text-lg font-bold text-charcoal-900 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-charcoal-900 rounded-full" />
                Sensei&apos;s Note
              </h3>
              <p className="text-charcoal-600 italic text-sm leading-relaxed font-body">
                &ldquo;Notice how the senior developer pivots from the technical detail
                (JSON vs XML) to the business value (200ms latency reduction).
                Always tie your code to money or time.&rdquo;
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Placeholder for other modes */}
      {selectedMode && selectedMode !== 'shadow' && (
        <div className="text-center py-20">
          <div className="w-20 h-20 bg-charcoal-100 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Timer size={32} className="text-charcoal-400" />
          </div>
          <h2 className="text-2xl font-heading font-bold text-charcoal-900 mb-2">
            Coming Soon
          </h2>
          <p className="text-charcoal-500 mb-6 font-body">
            The {TRAINING_MODES.find(m => m.id === selectedMode)?.name} mode is under development.
          </p>
          <button
            onClick={() => setSelectedMode(null)}
            className="px-6 py-3 bg-charcoal-900 text-white rounded-xl font-bold text-xs uppercase tracking-widest hover:bg-charcoal-800 transition-colors font-body"
          >
            Back to Modes
          </button>
        </div>
      )}
    </div>
  );
}

export default InterviewDojo;
