'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  ChevronRight, 
  Target, 
  Briefcase, 
  Terminal, 
  Trophy,
  Users,
  TrendingUp,
  Play,
  CheckCircle,
  Award
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAcademyStore, useBiometric } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './BiometricBackground';
import { MOCK_MODULES, COHORT_ACTIVITY } from '@/lib/academy/constants';

// ============================================
// CANDIDATE SCORE SYSTEM (Replaces XP)
// ============================================

interface CandidateScore {
  overall: number;           // Readiness/Employability score 0-100
  technical: number;         // Quiz + Lab performance
  communication: number;     // Interview prep, practice sessions
  portfolio: number;         // Labs completed, artifacts built
  cohortPosition: number;    // Rank in cohort (1-based)
  cohortSize: number;        // Total in cohort
  overallPosition: number;   // Global rank
  totalCandidates: number;   // Total candidates globally
}

// Calculate candidate scores from progress
function calculateCandidateScore(
  academyProgress: Record<string, { status: string; quizScore?: number; labArtifact?: string }>,
  streakDays: number
): CandidateScore {
  const progress = Object.values(academyProgress);
  const totalLessons = 40; // Approximate
  const completedLessons = progress.filter(p => p.status === 'completed').length;
  
  // Technical: Quiz scores + lesson completion
  const quizScores = progress.filter(p => p.quizScore !== undefined).map(p => p.quizScore!);
  const avgQuizScore = quizScores.length > 0 ? quizScores.reduce((a, b) => a + b, 0) / quizScores.length : 0;
  const lessonProgress = (completedLessons / totalLessons) * 100;
  const technical = Math.round((avgQuizScore * 0.6 + lessonProgress * 0.4));

  // Communication: Interview prep (streaks as proxy for now)
  const streakBonus = Math.min(streakDays * 5, 50); // Max 50 from streaks
  const communication = Math.min(streakBonus + completedLessons * 2, 100);

  // Portfolio: Labs completed
  const labsCompleted = progress.filter(p => p.labArtifact).length;
  const totalLabs = 15;
  const portfolio = Math.round((labsCompleted / totalLabs) * 100);

  // Overall (weighted average)
  const overall = Math.round(technical * 0.4 + communication * 0.35 + portfolio * 0.25);

  return {
    overall,
    technical,
    communication,
    portfolio,
    cohortPosition: 3,       // Mock - would come from backend
    cohortSize: 24,
    overallPosition: 127,    // Mock - would come from backend
    totalCandidates: 2500,
  };
}

// ============================================
// SCORE PROGRESS BAR COMPONENT
// ============================================

function ScoreProgressBar({ 
  label, 
  score, 
  color 
}: { 
  label: string; 
  score: number; 
  color: string;
}) {
  return (
    <div className="py-4 border-b border-charcoal-100 last:border-0">
      <div className="flex items-center justify-between mb-2">
        <span className="text-[11px] font-bold uppercase tracking-[0.15em] text-charcoal-500 font-body">
          {label}
        </span>
        <span className="text-sm font-bold text-charcoal-900 font-heading">{score}%</span>
      </div>
      <div className="h-2 bg-charcoal-100 rounded-full overflow-hidden">
        <div 
          className="h-full transition-all duration-700 ease-out rounded-full"
          style={{ 
            width: `${score}%`,
            backgroundColor: color
          }}
        />
      </div>
    </div>
  );
}

// ============================================
// MOCK LEADERBOARD DATA
// ============================================

const MOCK_LEADERBOARD = [
  { id: '1', name: 'Jordan P.', score: 87, progress: 78, isCurrentUser: false },
  { id: '2', name: 'Alex M.', score: 82, progress: 72, isCurrentUser: false },
  { id: '3', name: 'You', score: 0, progress: 0, isCurrentUser: true },
  { id: '4', name: 'Taylor S.', score: 68, progress: 45, isCurrentUser: false },
  { id: '5', name: 'Casey L.', score: 54, progress: 38, isCurrentUser: false },
];

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export function AcademyDashboard() {
  const router = useRouter();
  const { score: biometricScore, state: biometricState, theme, statusMessage } = useBiometric();
  const { academyProgress, isSprintActive, joinSprint, streakDays } = useAcademyStore();
  
  const [liveActivity, setLiveActivity] = useState(COHORT_ACTIVITY);
  const [isSyncing, setIsSyncing] = useState(false);

  // Calculate candidate scores
  const candidateScore = useMemo(() => 
    calculateCandidateScore(academyProgress, streakDays), 
    [academyProgress, streakDays]
  );

  // Calculate module progress
  const mergedModules = useMemo(() => {
    return MOCK_MODULES.map(m => {
      const lessonStatuses = m.lessons.map(l => academyProgress[`${m.id}-${l.id}`]?.status || 'locked');
      const completedCount = lessonStatuses.filter(s => s === 'completed').length;
      const progress = Math.round((completedCount / m.lessons.length) * 100);
      
      return {
        ...m,
        progress,
        lessons: m.lessons.map(l => ({
          ...l,
          status: academyProgress[`${m.id}-${l.id}`]?.status || (l.id === 'm1-l1' ? 'unlocked' : 'locked')
        }))
      };
    });
  }, [academyProgress]);

  // Current lesson to work on
  const currentModule = mergedModules.find(m => m.progress < 100) || mergedModules[mergedModules.length - 1];
  const currentLesson = currentModule?.lessons.find(l => l.status === 'unlocked' || l.status === 'current') || currentModule?.lessons[0];

  // Overall progress
  const totalLessons = mergedModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = mergedModules.reduce((acc, m) => 
    acc + m.lessons.filter(l => l.status === 'completed').length, 0
  );
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);

  // Update leaderboard with current user data
  const leaderboard = MOCK_LEADERBOARD.map(entry => 
    entry.isCurrentUser 
      ? { ...entry, score: candidateScore.overall, progress: overallProgress }
      : entry
  ).sort((a, b) => b.score - a.score);

  const userRank = leaderboard.findIndex(e => e.isCurrentUser) + 1;

  // Live cohort activity simulation
  useEffect(() => {
    if (!isSprintActive) return;
    
    const activities = [
      { user: "Jordan P.", action: "submitted Lab 2.3", type: "lab" as const },
      { user: "Alex M.", action: "earned 'Perfectionist' badge", type: "milestone" as const },
      { user: "Taylor S.", action: "started Module 4", type: "milestone" as const },
      { user: "Casey L.", action: "passed Quiz 3.1", type: "quiz" as const },
    ];
    
    const interval = setInterval(() => {
      const randomActivity = activities[Math.floor(Math.random() * activities.length)];
      const newEntry = { ...randomActivity, time: "Just now" };
      setLiveActivity(prev => [newEntry, ...prev].slice(0, 5));
    }, 15000);
    
    return () => clearInterval(interval);
  }, [isSprintActive]);

  const handleJoinSprint = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      joinSprint();
    }, 1500);
  };

  const handleNavigateToLesson = () => {
    if (currentModule && currentLesson) {
      router.push(`/academy/lesson/${currentModule.id}/${currentLesson.id}`);
    }
  };

  // Get score-based color
  const getScoreColor = (score: number) => {
    if (score >= 80) return '#047857'; // Emerald for high
    if (score >= 60) return '#0D4C3B'; // Forest for good
    if (score >= 40) return '#C9A961'; // Gold for neutral
    return '#DC2626'; // Red for low
  };

  return (
    <div className="animate-fade-in pt-4 pb-12">
      
      {/* ============================================
          HERO HEADER - Readiness Score Focus
          ============================================ */}
      <div className="mb-12 flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 pb-8 border-b-2 border-charcoal-100">
        <div>
          {/* Biometric Status */}
          <div className="mb-4">
            <BiometricStatusIndicator state={biometricState} statusMessage={statusMessage} />
          </div>
          
          {/* Main Title */}
          <h1 className="text-5xl md:text-7xl font-heading font-black text-charcoal-900 mb-4 tracking-tight leading-none">
            Mission<br/>Control
          </h1>
          
          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
             style={{ borderColor: theme.pulseColor }}>
            &ldquo;Consistency is the bridge between where you are and where you want to be.&rdquo;
          </p>
        </div>
        
        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Readiness Score - Main Metric */}
          <div 
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div 
              className="text-5xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {biometricScore}<span className="text-xl align-top">%</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              Readiness Score
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>#{candidateScore.cohortPosition} in cohort</span>
            </div>
          </div>

          {/* Positions Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Cohort Rank</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-heading font-black text-charcoal-900">
                    #{candidateScore.cohortPosition}
                  </span>
                  <span className="text-xs text-charcoal-400 font-body">/ {candidateScore.cohortSize}</span>
                </div>
              </div>
              <div className="pt-2 border-t border-charcoal-100">
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Global Rank</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-lg font-heading font-bold text-charcoal-700">
                    #{candidateScore.overallPosition}
                  </span>
                  <span className="text-[10px] text-charcoal-400 font-body">/ {candidateScore.totalCandidates.toLocaleString()}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ============================================
          MAIN CONTENT GRID
          ============================================ */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Primary Actions */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* ============================================
              MISSION CARD - Today's Focus
              ============================================ */}
          <div 
            className="group relative cursor-pointer"
            onClick={handleNavigateToLesson}
          >
            <div 
              className={cn(
                "relative border-2 rounded-2xl p-8 lg:p-12 overflow-hidden flex flex-col justify-between min-h-[340px]",
                "transition-all duration-500 hover:shadow-elevation-lg"
              )}
              style={{
                background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
                borderColor: theme.gradientFrom,
              }}
            >
              {/* Grid Texture */}
              <div 
                className="absolute inset-0 opacity-10 pointer-events-none"
                style={{ 
                  backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)',
                  backgroundSize: '40px 40px'
                }}
              />
              
              {/* Status Indicator */}
              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3 px-4 py-2 rounded-xl border border-white/30 bg-white/10 backdrop-blur-sm">
                  <span 
                    className="w-2 h-2 rounded-full animate-pulse"
                    style={{ backgroundColor: biometricState === 'ember' ? '#DC2626' : '#10B981' }}
                  />
                  <span className="text-[10px] font-body text-white/80 uppercase tracking-widest font-bold">
                    MISSION_ACTIVE
                  </span>
                </div>
                <div className="font-body text-xs text-white/60 font-medium">
                  {currentModule?.week.toUpperCase()}
                </div>
              </div>
              
              {/* Mission Content */}
              <div className="relative z-10 max-w-2xl mt-8">
                <div className="text-white/60 font-body text-xs uppercase tracking-widest mb-2 font-bold">
                  NEXT OBJECTIVE
                </div>
                <h2 className="text-3xl md:text-5xl font-heading font-bold text-white mb-4 leading-tight">
                  {currentLesson?.title || 'Start Your Journey'}
                </h2>
                <p className="text-white/70 text-lg font-body font-light leading-relaxed">
                  {currentLesson?.description || currentModule?.description}
                </p>
              </div>
              
              {/* Bottom Bar */}
              <div className="relative z-10 flex flex-wrap justify-between items-end mt-8 gap-4">
                <div className="flex gap-3">
                  {currentLesson?.type === 'lab' && (
                    <div className="px-3 py-1.5 rounded-lg border border-cyan-400/50 text-cyan-300 text-[10px] font-body font-bold uppercase tracking-widest flex items-center gap-2 bg-cyan-900/30">
                      <Briefcase size={12} /> Portfolio Asset
                    </div>
                  )}
                  <div className="px-3 py-1.5 rounded-lg border border-white/20 text-white/60 text-[10px] font-body font-bold uppercase tracking-widest">
                    Est. {currentLesson?.duration || '30 min'}
                  </div>
                </div>
                
                <button 
                  className="flex items-center gap-3 px-8 py-4 bg-white rounded-xl text-charcoal-900 text-xs font-bold uppercase tracking-widest 
                    hover:bg-gold-500 transition-colors border-2 border-white group-hover:border-gold-500 font-body"
                >
                  <Play size={14} />
                  Begin Mission
                  <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>

          {/* ============================================
              CURRICULUM MAP
              ============================================ */}
          <div className="bg-white border-2 border-charcoal-100 rounded-2xl p-6 shadow-elevation-sm">
            <div className="flex items-center justify-between mb-6 pb-4 border-b border-charcoal-100">
              <h3 className="font-heading font-bold text-charcoal-900 text-lg">Curriculum Map</h3>
              <span className="text-[10px] font-body text-charcoal-400 uppercase tracking-widest font-bold">
                8_WEEK_PROGRAM
              </span>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {mergedModules.map((m) => (
                <Link
                  key={m.id}
                  href={`/academy/modules#module-${m.id}`}
                  className={cn(
                    "p-4 border-2 rounded-xl transition-all relative overflow-hidden group",
                    m.progress === 100 
                      ? "bg-forest-50 border-forest-200" 
                      : m.progress > 0 
                        ? "bg-white border-charcoal-900 shadow-elevation-sm hover:shadow-elevation-md" 
                        : "bg-charcoal-50 border-charcoal-100 opacity-60"
                  )}
                >
                  <div className="text-[9px] font-body text-charcoal-400 mb-2 font-medium">{m.week}</div>
                  <div className="font-bold text-xs text-charcoal-900 leading-tight mb-4 pr-2 font-body">
                    {m.title}
                  </div>
                  
                  {/* Progress indicator */}
                  {m.progress > 0 && (
                    <div className="flex items-center gap-2 mb-2">
                      <span className={cn(
                        "text-[10px] font-bold font-body",
                        m.progress === 100 ? "text-forest-600" : "text-charcoal-600"
                      )}>
                        {m.progress}%
                      </span>
                      {m.progress === 100 && <CheckCircle size={12} className="text-forest-500" />}
                    </div>
                  )}
                  
                  {/* Progress bar */}
                  <div className="h-1 bg-charcoal-100 w-full overflow-hidden absolute bottom-0 left-0 rounded-b-xl">
                    <div 
                      className={cn(
                        "h-full transition-all duration-500",
                        m.progress === 100 ? "bg-forest-500" : "bg-charcoal-900"
                      )}
                      style={{ width: `${m.progress}%` }}
                    />
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* ============================================
            RIGHT COLUMN: Scores & Social
            ============================================ */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* ============================================
              EMPLOYABILITY BREAKDOWN
              ============================================ */}
          <div className="bg-white border-2 border-charcoal-100 rounded-2xl p-6 shadow-elevation-sm">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-heading text-lg font-bold text-charcoal-900">Employability</h3>
              <button className="text-charcoal-400 hover:text-charcoal-600 transition-colors">
                <Terminal size={16} />
              </button>
            </div>
            
            <div className="border-t border-charcoal-100 mt-4">
              <ScoreProgressBar 
                label="Technical" 
                score={candidateScore.technical} 
                color={getScoreColor(candidateScore.technical)}
              />
              <ScoreProgressBar 
                label="Communication" 
                score={candidateScore.communication} 
                color={getScoreColor(candidateScore.communication)}
              />
              <ScoreProgressBar 
                label="Portfolio" 
                score={candidateScore.portfolio} 
                color={getScoreColor(candidateScore.portfolio)}
              />
            </div>

            {/* Next Milestone */}
            <div className="mt-6 pt-4 border-t border-charcoal-100">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-charcoal-100 flex items-center justify-center">
                  <Target size={24} className="text-charcoal-500" />
                </div>
                <div>
                  <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body font-bold">
                    Next Milestone
                  </div>
                  <div className="font-heading font-bold text-charcoal-900">
                    Rules Engine Cert.
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ============================================
              SPRINT LEADERBOARD
              ============================================ */}
          <div 
            className="p-6 rounded-2xl relative overflow-hidden border-2"
            style={{
              background: `linear-gradient(135deg, ${theme.gradientFrom} 0%, ${theme.gradientTo} 100%)`,
              borderColor: theme.gradientFrom,
            }}
          >
            {/* Glow effect */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-white/10 rounded-full blur-3xl" />
            
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h3 className="font-heading text-lg font-bold text-white flex items-center gap-2">
                <Trophy size={18} className="text-gold-400" />
                Sprint Leaderboard
              </h3>
              <span className="text-[10px] font-body text-white/60 uppercase tracking-widest font-bold">
                WEEK 3 OF 8
              </span>
            </div>
            
            <div className="space-y-2 relative z-10">
              {leaderboard.slice(0, 5).map((student, i) => (
                <div 
                  key={student.id}
                  className={cn(
                    "flex items-center gap-3 p-3 rounded-xl transition-all",
                    i === 0 && "bg-gold-500/20 border border-gold-500/30",
                    i === 1 && "bg-white/10",
                    i === 2 && "bg-white/5",
                    student.isCurrentUser && "ring-2 ring-white/50"
                  )}
                >
                  {/* Rank Badge */}
                  <div className={cn(
                    "w-7 h-7 rounded-lg flex items-center justify-center font-black text-xs font-heading",
                    i === 0 && "bg-gold-500 text-charcoal-900",
                    i === 1 && "bg-white/30 text-white",
                    i === 2 && "bg-white/20 text-white",
                    i > 2 && "bg-white/10 text-white/60"
                  )}>
                    {i + 1}
                  </div>
                  
                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className={cn(
                        "font-bold text-sm truncate font-body",
                        student.isCurrentUser ? "text-gold-300" : "text-white"
                      )}>
                        {student.name}
                      </span>
                    </div>
                    <div className="text-[10px] text-white/50 font-body">
                      {student.score}% Ready
                    </div>
                  </div>
                  
                  {/* Progress */}
                  <div className="text-right">
                    <div className="text-lg font-heading font-bold text-white">
                      {student.progress}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
            
            {/* Your position if not in top 5 */}
            {userRank > 5 && (
              <div className="mt-4 pt-4 border-t border-white/10 relative z-10">
                <div className="text-center text-white/60 text-xs">
                  You are ranked <span className="text-gold-400 font-bold">#{userRank}</span>
                </div>
              </div>
            )}
          </div>

          {/* ============================================
              COHORT ACTIVITY
              ============================================ */}
          <div className="bg-white border-2 border-charcoal-100 rounded-2xl p-6 shadow-elevation-sm">
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-heading text-lg font-bold text-charcoal-900 flex items-center gap-2">
                <Users size={18} className="text-charcoal-500" />
                Cohort Activity
              </h3>
              <div 
                className={cn(
                  "w-2 h-2 rounded-full",
                  isSprintActive ? "bg-emerald-500 animate-pulse" : "bg-charcoal-300"
                )}
              />
            </div>
            
            {isSprintActive ? (
              <div className="space-y-0 relative">
                <div className="absolute left-[5px] top-2 bottom-2 w-px bg-charcoal-200" />
                {liveActivity.map((activity, i) => (
                  <div key={i} className="relative pl-6 py-3 border-b border-charcoal-50 last:border-0">
                    <div className="absolute left-0 top-4 w-2.5 h-2.5 bg-white border-2 border-charcoal-300 z-10 rounded-full" />
                    <div>
                      <p className="text-xs text-charcoal-900 font-medium font-body">
                        <span className="font-bold">{activity.user}</span>{' '}
                        <span className="text-charcoal-500">{activity.action}</span>
                      </p>
                      <p className="text-[9px] font-body text-charcoal-400 mt-1 uppercase font-medium">
                        {activity.time}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <div className="w-12 h-12 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Users size={20} className="text-charcoal-400" />
                </div>
                <p className="text-charcoal-500 text-sm mb-6 font-body">
                  Join the sprint to see live cohort activity
                </p>
                <button
                  onClick={handleJoinSprint}
                  disabled={isSyncing}
                  className={cn(
                    "w-full py-3 rounded-xl border-2 text-xs font-bold uppercase tracking-widest transition-all font-body",
                    isSyncing 
                      ? "border-charcoal-200 text-charcoal-400 cursor-wait"
                      : "border-charcoal-900 text-charcoal-900 hover:bg-charcoal-900 hover:text-white"
                  )}
                >
                  {isSyncing ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="w-4 h-4 border-2 border-charcoal-400 border-t-transparent rounded-full animate-spin" />
                      Connecting...
                    </span>
                  ) : (
                    'Join Real-time Sprint'
                  )}
                </button>
              </div>
            )}
          </div>

          {/* ============================================
              QUICK LINKS
              ============================================ */}
          <div className="grid grid-cols-2 gap-3">
            {[
              { href: '/academy/dojo', icon: Terminal, label: 'Interview Dojo', color: 'text-purple-600 bg-purple-50' },
              { href: '/academy/blueprint', icon: Briefcase, label: 'My Blueprint', color: 'text-blue-600 bg-blue-50' },
              { href: '/academy/identity', icon: Award, label: 'Identity Forge', color: 'text-gold-600 bg-gold-50' },
              { href: '/academy/profile', icon: TrendingUp, label: 'Profile', color: 'text-forest-600 bg-forest-50' },
            ].map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="flex items-center gap-3 p-4 bg-white border-2 border-charcoal-100 rounded-xl hover:border-charcoal-300 
                  hover:shadow-elevation-sm transition-all group"
              >
                <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", link.color)}>
                  <link.icon size={18} />
                </div>
                <span className="text-xs font-bold text-charcoal-900 group-hover:text-charcoal-700 font-body">
                  {link.label}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademyDashboard;
