'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
  CheckCircle,
  Lock,
  ChevronRight,
  Code,
  Star,
  Search,
  Flag,
  Trophy,
  Zap,
  Clock,
  Target,
  TrendingUp
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAcademyStore, useBiometric } from '@/lib/store/academy-store';
import { BiometricStatusIndicator } from './BiometricBackground';
import { MOCK_MODULES } from '@/lib/academy/constants';
import { XP_ACTIONS } from '@/lib/academy/gamification';

/**
 * AcademyModules - The Path
 *
 * A visual journey representation where each module is a peak to conquer.
 * The student's path is illuminated based on their progress.
 */
export function AcademyModules() {
  const { academyProgress, streakDays } = useAcademyStore();
  const { state, theme, statusMessage } = useBiometric();
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedModule, setExpandedModule] = useState<number | null>(null);

  // Merge store progress with module structure
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

  // Filter Logic
  const filteredModules = useMemo(() => {
    return mergedModules.map(m => {
      const matchesModule = m.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchingLessons = m.lessons.filter(l =>
        l.title.toLowerCase().includes(searchTerm.toLowerCase())
      );

      if (matchesModule) return m;
      if (matchingLessons.length > 0) return { ...m, lessons: matchingLessons };
      return null;
    }).filter(Boolean) as typeof mergedModules;
  }, [mergedModules, searchTerm]);

  // Find current module
  const currentModuleId = mergedModules.find(m => m.progress > 0 && m.progress < 100)?.id ||
                          mergedModules[0]?.id;

  // Calculate overall progress
  const totalLessons = mergedModules.reduce((acc, m) => acc + m.lessons.length, 0);
  const completedLessons = mergedModules.reduce((acc, m) =>
    acc + m.lessons.filter(l => l.status === 'completed').length, 0
  );
  const overallProgress = Math.round((completedLessons / totalLessons) * 100);
  const peaksConquered = mergedModules.filter(m => m.progress === 100).length;

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
            The Path
          </h1>

          {/* Motivational Quote */}
          <p className="text-charcoal-500 text-lg max-w-xl leading-relaxed font-heading italic border-l-2 pl-4 mt-6"
             style={{ borderColor: theme.pulseColor }}>
            &ldquo;Your path to mastery. Each peak conquered brings you closer to your goal.&rdquo;
          </p>
        </div>

        {/* Primary Score Display */}
        <div className="flex flex-wrap gap-4">
          {/* Journey Progress - Main Metric */}
          <div
            className="relative border-2 rounded-2xl p-6 bg-white shadow-elevation-md min-w-[140px]"
            style={{ borderColor: theme.pulseColor }}
          >
            <div
              className="text-5xl font-heading font-black leading-none tracking-tighter mb-1"
              style={{ color: theme.pulseColor }}
            >
              {overallProgress}<span className="text-xl align-top">%</span>
            </div>
            <div className="text-[10px] uppercase tracking-widest text-charcoal-500 font-bold font-body">
              Journey Complete
            </div>
            {/* Position indicator */}
            <div className="mt-3 pt-3 border-t border-charcoal-100 flex items-center gap-2 text-xs text-charcoal-600 font-body">
              <TrendingUp size={12} />
              <span>{completedLessons}/{totalLessons} lessons</span>
            </div>
          </div>

          {/* Peaks Card */}
          <div className="border-2 border-charcoal-200 rounded-2xl p-4 bg-white shadow-elevation-sm">
            <div className="space-y-3">
              <div>
                <div className="text-[9px] uppercase tracking-widest text-charcoal-400 mb-1 font-body">Peaks Conquered</div>
                <div className="flex items-baseline gap-1">
                  <span className="text-2xl font-heading font-black text-gold-600">
                    {peaksConquered}
                  </span>
                  <span className="text-xs text-charcoal-400 font-body">/ {mergedModules.length}</span>
                </div>
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
          SEARCH BAR
          ============================================ */}
      <div className="mb-8">
        <div className="relative max-w-md">
          <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
            <Search size={18} className="text-charcoal-400" />
          </div>
          <input
            type="text"
            placeholder="Search modules or lessons..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-6 py-4 rounded-2xl border-2 border-charcoal-100 bg-white
              shadow-elevation-sm focus:outline-none focus:border-charcoal-900 text-charcoal-900 font-body font-medium transition-all"
          />
        </div>
      </div>

      {/* ============================================
          THE PATH: Module Timeline
          ============================================ */}
      <div className="relative max-w-4xl">
        {/* Vertical Path Line */}
        <div
          className="absolute left-8 top-0 bottom-0 w-1 hidden md:block rounded-full bg-charcoal-200"
        />

        <div className="space-y-8">
          {filteredModules.length > 0 ? filteredModules.map((module, index) => {
            const isCompleted = module.progress === 100;
            const isCurrent = module.id === currentModuleId;
            const isLocked = module.progress === 0 && index > 0 && filteredModules[index - 1]?.progress !== 100;
            const isExpanded = expandedModule === module.id;

            return (
              <div
                key={module.id}
                id={`module-${module.id}`}
                className={cn(
                  "relative md:pl-24 transition-all duration-500",
                  isLocked ? "opacity-50" : "opacity-100"
                )}
              >
                {/* ============================================
                    Timeline Node (Peak Marker)
                    ============================================ */}
                <div className="absolute left-0 w-16 h-16 hidden md:flex items-center justify-center z-10">
                  <div
                    className={cn(
                      "w-16 h-16 rounded-2xl border-4 flex items-center justify-center shadow-lg transition-all duration-500",
                      isCompleted && "border-forest-500 bg-forest-50 text-forest-600",
                      isCurrent && !isCompleted && "border-charcoal-900 bg-white text-charcoal-900",
                      isLocked && "border-charcoal-200 bg-charcoal-50 text-charcoal-300"
                    )}
                  >
                    {isCompleted ? (
                      <Flag size={24} className="fill-current" />
                    ) : isLocked ? (
                      <Lock size={20} />
                    ) : (
                      <span className="font-heading font-black text-2xl">{module.id}</span>
                    )}
                  </div>
                </div>

                {/* ============================================
                    Module Card
                    ============================================ */}
                <div
                  className={cn(
                    "relative rounded-2xl overflow-hidden transition-all duration-500 cursor-pointer",
                    "bg-white border-2 shadow-elevation-sm hover:shadow-elevation-lg",
                    isCompleted && "border-forest-200 bg-forest-50/30",
                    isCurrent && !isCompleted && "border-charcoal-900 shadow-elevation-md",
                    isLocked && "border-charcoal-100",
                    !isCompleted && !isLocked && !isCurrent && "border-charcoal-100 hover:border-charcoal-300"
                  )}
                  onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                >
                  {/* Left accent bar */}
                  <div
                    className={cn(
                      "absolute top-0 left-0 w-1.5 h-full rounded-l-2xl",
                      isCompleted ? "bg-forest-500" : isCurrent ? "bg-charcoal-900" : "bg-charcoal-200"
                    )}
                  />

                  {/* Content */}
                  <div className="p-8 pl-10">
                    {/* Header */}
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <div className="flex items-center gap-3 mb-2">
                          <span className="text-[10px] font-body font-bold text-charcoal-400 uppercase tracking-widest">
                            {module.week}
                          </span>
                          {isCurrent && !isCompleted && (
                            <span
                              className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-md font-body bg-charcoal-900 text-white"
                            >
                              IN PROGRESS
                            </span>
                          )}
                        </div>
                        <h3 className={cn(
                          "text-2xl font-heading font-bold transition-colors",
                          isCompleted ? "text-forest-700" : "text-charcoal-900"
                        )}>
                          {module.title}
                        </h3>
                        <p className="text-charcoal-500 text-sm font-body leading-relaxed max-w-lg mt-2">
                          {module.description}
                        </p>
                      </div>

                      {/* Progress Indicator */}
                      <div className="text-right flex items-start gap-3">
                        {isCompleted ? (
                          <div className="flex items-center gap-2 bg-forest-100 text-forest-700 px-4 py-2 rounded-xl">
                            <Trophy size={16} />
                            <span className="text-sm font-bold font-body">Conquered</span>
                          </div>
                        ) : module.progress > 0 ? (
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <div className="text-2xl font-heading font-black text-charcoal-900">
                                {module.progress}%
                              </div>
                              <div className="text-[10px] text-charcoal-400 uppercase tracking-widest font-body font-bold">
                                Complete
                              </div>
                            </div>
                            <div className="w-16 h-16 relative">
                              <svg className="w-full h-full -rotate-90">
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  fill="none"
                                  stroke="#E5E7EB"
                                  strokeWidth="4"
                                />
                                <circle
                                  cx="32"
                                  cy="32"
                                  r="28"
                                  fill="none"
                                  stroke="#1F2937"
                                  strokeWidth="4"
                                  strokeDasharray={`${module.progress * 1.76} 176`}
                                  strokeLinecap="round"
                                />
                              </svg>
                            </div>
                          </div>
                        ) : null}
                      </div>
                    </div>

                    {/* Lesson Preview / Expanded View */}
                    <div className={cn(
                      "overflow-hidden transition-all duration-500",
                      isExpanded ? "max-h-[500px] opacity-100 mt-6" : "max-h-0 opacity-0"
                    )}>
                      <div className="pt-6 border-t border-charcoal-100">
                        <div className="space-y-3">
                          {module.lessons.map((lesson) => (
                            <div
                              key={lesson.id}
                              className={cn(
                                "flex items-center gap-4 p-4 rounded-xl transition-all",
                                lesson.status === 'completed' && "bg-forest-50 border border-forest-100",
                                (lesson.status === 'current' || lesson.status === 'unlocked') && "bg-charcoal-50 border border-charcoal-200",
                                lesson.status === 'locked' && "bg-charcoal-50 border border-charcoal-100 opacity-60"
                              )}
                            >
                              {/* Status Icon */}
                              <div className="shrink-0">
                                {lesson.status === 'completed' ? (
                                  <div className="w-8 h-8 rounded-xl bg-forest-100 text-forest-600 flex items-center justify-center">
                                    <CheckCircle size={16} />
                                  </div>
                                ) : lesson.status === 'current' || lesson.status === 'unlocked' ? (
                                  <div className="w-8 h-8 rounded-xl bg-charcoal-900 flex items-center justify-center">
                                    <Zap size={16} className="text-white" />
                                  </div>
                                ) : (
                                  <div className="w-8 h-8 rounded-xl bg-charcoal-100 flex items-center justify-center">
                                    <Lock size={14} className="text-charcoal-400" />
                                  </div>
                                )}
                              </div>

                              {/* Lesson Info */}
                              <div className="flex-1">
                                <div className="flex items-center gap-2">
                                  <span className={cn(
                                    "text-sm font-medium font-body",
                                    lesson.status === 'completed' && "text-forest-700",
                                    lesson.status === 'locked' && "text-charcoal-400"
                                  )}>
                                    {lesson.title}
                                  </span>
                                  {lesson.type === 'lab' && (
                                    <Code size={12} className="text-blue-500" />
                                  )}
                                  {lesson.type === 'quiz' && (
                                    <Target size={12} className="text-gold-500" />
                                  )}
                                </div>
                                <div className="flex items-center gap-3 mt-1 text-[10px] text-charcoal-400 font-body">
                                  <span className="flex items-center gap-1">
                                    <Clock size={10} /> {lesson.duration}
                                  </span>
                                  <span className="flex items-center gap-1">
                                    <Star size={10} /> +{XP_ACTIONS.LESSON_COMPLETE} XP
                                  </span>
                                </div>
                              </div>

                              {/* Action Button */}
                              {lesson.status !== 'locked' && (
                                <Link
                                  href={`/academy/lesson/${module.id}/${lesson.id}`}
                                  className={cn(
                                    "flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest transition-all font-body",
                                    lesson.status === 'completed'
                                      ? "bg-charcoal-100 text-charcoal-600 hover:bg-charcoal-200"
                                      : "bg-charcoal-900 text-white hover:bg-charcoal-800"
                                  )}
                                  onClick={(e) => e.stopPropagation()}
                                >
                                  {lesson.status === 'completed' ? 'Review' : 'Start'}
                                  <ChevronRight size={14} />
                                </Link>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Expand Indicator */}
                    <div className="flex items-center justify-center mt-4">
                      <button className="text-charcoal-400 hover:text-charcoal-600 transition-colors">
                        <ChevronRight
                          size={20}
                          className={cn(
                            "transition-transform duration-300",
                            isExpanded ? "rotate-90" : "rotate-0"
                          )}
                        />
                      </button>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {module.progress > 0 && module.progress < 100 && (
                    <div className="h-1 bg-charcoal-100 rounded-b-2xl overflow-hidden">
                      <div
                        className="h-full transition-all duration-500 bg-charcoal-900"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  )}
                </div>
              </div>
            );
          }) : (
            <div className="text-center py-12 text-charcoal-400">
              <Search size={48} className="mx-auto mb-4 opacity-30" />
              <p className="text-lg font-body">No modules found matching &ldquo;{searchTerm}&rdquo;</p>
            </div>
          )}
        </div>

        {/* End of Path Marker */}
        <div className="mt-12 text-center pb-12">
          <div className="inline-flex flex-col items-center gap-4">
            <div className="w-1 h-12 rounded-full bg-charcoal-200" />
            <div className="flex items-center gap-3 text-charcoal-400">
              <Trophy size={20} />
              <span className="text-sm uppercase tracking-widest font-bold font-body">
                Summit Awaits
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default AcademyModules;
