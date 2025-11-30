'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { MOCK_MODULES, COHORT_ACTIVITY } from '@/lib/constants';
import { ChevronRight, Clock, Target, Briefcase, Activity, Users, Zap, Check, Loader2, Terminal, TrendingUp, Award, Sparkles } from 'lucide-react';
import { Module } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

export const Dashboard: React.FC = () => {
  const router = useRouter();
  const { isSprintActive, joinSprint, academyProgress, initializeAcademy } = useAppStore();
  const [modules] = useState<Module[]>(MOCK_MODULES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveActivity, setLiveActivity] = useState(COHORT_ACTIVITY);
  const [animatedStats, setAnimatedStats] = useState({ techScore: 0, portfolioScore: 0, commScore: 0, overall: 0 });

  useEffect(() => {
    if (Object.keys(academyProgress).length === 0) {
        initializeAcademy();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!isSprintActive) return;

    const activities = [
        { user: "Jordan P.", action: "submitted Lab 2.3", type: "lab" },
        { user: "Alex M.", action: "earned 'Gosu Wizard' badge", type: "milestone" },
        { user: "Taylor S.", action: "started Module 4", type: "milestone" },
        { user: "Casey L.", action: "passed Quiz 3.1", type: "quiz" },
        { user: "Morgan R.", action: "completed Sprint Review", type: "milestone" }
    ];

    const interval = setInterval(() => {
        const randomActivity = activities[Math.floor(Math.random() * activities.length)];
        const newEntry = { ...randomActivity, time: "Just now" };
        setLiveActivity(prev => [newEntry, ...prev].slice(0, 5));
    }, 15000);

    return () => clearInterval(interval);
  }, [isSprintActive]);

  const mergedModules = modules.map(m => {
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

  const currentModule = mergedModules.find(m => m.progress < 100) || mergedModules[mergedModules.length - 1];
  let currentLesson = currentModule.lessons.find(l => l.status === 'unlocked' || l.status === 'completed') || currentModule.lessons[currentModule.lessons.length - 1];
  if (!currentLesson) currentLesson = currentModule.lessons[0];

  const calculateEmployability = () => {
      const totalLabs = mergedModules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'lab').length, 0);
      const completedLabs = mergedModules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'lab' && l.status === 'completed').length, 0);

      const totalStandard = mergedModules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'standard').length, 0);
      const completedStandard = mergedModules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'standard' && l.status === 'completed').length, 0);

      const techScore = totalStandard > 0 ? Math.round((completedStandard / totalStandard) * 100) : 0;
      const portfolioScore = totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0;
      const commScore = Math.min(100, Math.round(techScore * 0.8 + 20));
      const overall = Math.round((techScore + portfolioScore + commScore) / 3);

      return { techScore, portfolioScore, commScore, overall };
  };

  const stats = calculateEmployability();

  // Animate numbers on mount
  useEffect(() => {
    const duration = 2000;
    const steps = 60;
    const stepDuration = duration / steps;

    let currentStep = 0;

    const interval = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;

      setAnimatedStats({
        techScore: Math.round(stats.techScore * progress),
        portfolioScore: Math.round(stats.portfolioScore * progress),
        commScore: Math.round(stats.commScore * progress),
        overall: Math.round(stats.overall * progress),
      });

      if (currentStep >= steps) {
        clearInterval(interval);
      }
    }, stepDuration);

    return () => clearInterval(interval);
  }, [stats.techScore, stats.portfolioScore, stats.commScore, stats.overall]);

  const handleNavigateToLesson = (moduleId: number, lessonId: string) => {
      router.push(`/academy/lesson/${moduleId}/${lessonId}`);
  };

  const handleJoinSprint = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          joinSprint();
      }, 1500);
  };

  return (
    <div className="animate-fade-in space-y-8">

      {/* Premium Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-8 pb-8 border-b border-charcoal-100">
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-4">
            <div className={cn(
              "px-3 py-1.5 rounded-lg text-caption font-bold flex items-center gap-2 transition-all",
              isSprintActive
                ? "bg-success-50 text-success-700 border border-success-200"
                : "bg-charcoal-100 text-charcoal-600 border border-charcoal-200"
            )}>
              <span className={cn("w-2 h-2 rounded-full", isSprintActive ? "bg-success-500 animate-pulse-slow" : "bg-charcoal-400")}></span>
              {isSprintActive ? 'Sprint Active' : 'Self-Paced'}
            </div>
            <div className="text-caption text-charcoal-400">Day 23</div>
          </div>

          <h1 className="text-h1 font-heading font-black text-charcoal-900 mb-4">
            Your Learning Journey
          </h1>

          <p className="text-body-lg text-charcoal-600 max-w-2xl leading-relaxed border-l-4 border-gold-500 pl-6 italic">
            &quot;Consistency is the bridge between where you are and where you want to be.&quot;
          </p>
        </div>

        {/* Premium Readiness Index */}
        <div className="card-feature relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-gold opacity-10 rounded-full blur-3xl"></div>
          <div className="relative z-10 text-center p-6">
            <div className="text-display font-heading font-black text-charcoal-900 leading-none mb-2">
              {animatedStats.overall}<span className="text-h2 align-top text-gold-600">%</span>
            </div>
            <div className="text-caption text-charcoal-500 font-bold">
              Readiness Index
            </div>
            <div className="mt-4 flex items-center justify-center gap-2 text-caption text-success-600">
              <TrendingUp size={14} strokeWidth={2.5} />
              <span className="font-bold">+12% this week</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

        {/* Left Column: The Work */}
        <div className="lg:col-span-8 space-y-8">

          {/* Premium Hero Card: Today's Focus */}
          <div
            className="group relative cursor-pointer"
            onClick={() => handleNavigateToLesson(currentModule.id, currentLesson.id)}
          >
            <Card className="relative bg-gradient-forest text-white border-0 shadow-premium hover:shadow-premium-lg transition-all duration-500 overflow-hidden min-h-[420px] flex flex-col hover:-translate-y-1">
              {/* Animated Background Pattern */}
              <div className="absolute inset-0 opacity-5 pointer-events-none"
                   style={{
                     backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)',
                     backgroundSize: '40px 40px'
                   }}>
              </div>

              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-br from-forest-500/50 via-forest-600/50 to-forest-900/80 pointer-events-none"></div>

              <CardHeader className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/10 backdrop-blur-sm border border-white/20">
                    <span className="w-2 h-2 bg-gold-400 rounded-full animate-pulse-slow"></span>
                    <span className="text-caption text-white/90 font-bold">In Progress</span>
                  </div>
                  <div className="text-caption text-white/60">{currentModule.week.toUpperCase()}</div>
                </div>

                <CardTitle className="text-h1 text-white mb-4 group-hover:text-gold-100 transition-colors">
                  {currentLesson.title}
                </CardTitle>
                <CardDescription className="text-body-lg text-white/80 leading-relaxed">
                  {currentLesson.description || currentModule.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="relative z-10 mt-auto">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                  <div className="flex flex-wrap gap-2">
                    {currentLesson.type === 'lab' && (
                      <div className="px-3 py-1.5 rounded-lg bg-gold-500/20 border border-gold-400/30 text-gold-100 text-caption font-bold flex items-center gap-2">
                        <Briefcase size={14} strokeWidth={2.5} />
                        Portfolio Asset
                      </div>
                    )}
                    <div className="px-3 py-1.5 rounded-lg bg-white/10 border border-white/20 text-white/80 text-caption font-bold flex items-center gap-2">
                      <Clock size={14} strokeWidth={2} />
                      {currentLesson.duration}
                    </div>
                  </div>

                  <Button
                    variant="gold"
                    size="lg"
                    className="group/btn"
                  >
                    {currentLesson.status === 'completed' ? 'Review Lesson' : 'Start Learning'}
                    <ChevronRight size={18} className="group-hover/btn:translate-x-1 transition-transform" strokeWidth={2.5} />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Premium Curriculum Map */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Curriculum Overview</CardTitle>
                <span className="text-caption text-charcoal-400">8-Week Program</span>
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {mergedModules.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "relative p-5 rounded-xl border-2 transition-all duration-300 group/module overflow-hidden",
                      m.progress === 100
                        ? "bg-success-50 border-success-200 shadow-elevation-xs"
                        : m.progress > 0
                        ? "bg-white border-forest-200 shadow-elevation-sm hover:shadow-elevation-md hover:-translate-y-0.5"
                        : "bg-charcoal-50/50 border-charcoal-200 opacity-70"
                    )}
                  >
                    <div className="text-caption text-charcoal-500 mb-2">{m.week}</div>
                    <div className="text-body-sm font-bold text-charcoal-900 leading-tight mb-4">
                      {m.title}
                    </div>

                    {/* Progress Bar */}
                    <div className="absolute bottom-0 left-0 w-full h-1.5 bg-charcoal-100 overflow-hidden">
                      <div
                        className={cn(
                          "h-full transition-all duration-1000",
                          m.progress === 100 ? "bg-gradient-to-r from-success-500 to-success-600" : "bg-gradient-gold"
                        )}
                        style={{ width: `${m.progress}%` }}
                      ></div>
                    </div>

                    {/* Completion Badge */}
                    {m.progress === 100 && (
                      <div className="absolute top-3 right-3">
                        <div className="w-6 h-6 rounded-full bg-success-500 flex items-center justify-center shadow-elevation-sm">
                          <Check size={14} strokeWidth={3} className="text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column: Metrics & Activity */}
        <div className="lg:col-span-4 space-y-8">

          {/* Premium Stats Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Award size={20} className="text-gold-600" strokeWidth={2.5} />
                  Employability Metrics
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {[
                  { label: 'Technical Skills', val: animatedStats.techScore, color: 'from-forest-500 to-forest-600', icon: Terminal },
                  { label: 'Communication', val: animatedStats.commScore, color: 'from-gold-500 to-gold-600', icon: Users },
                  { label: 'Portfolio', val: animatedStats.portfolioScore, color: 'from-charcoal-600 to-charcoal-700', icon: Briefcase }
                ].map(stat => (
                  <div key={stat.label} className="space-y-3">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <stat.icon size={16} className="text-charcoal-500" strokeWidth={2} />
                        <span className="text-body-sm font-semibold text-charcoal-700">{stat.label}</span>
                      </div>
                      <span className="text-h4 font-heading font-bold text-charcoal-900">{stat.val}%</span>
                    </div>

                    <div className="relative h-3 bg-charcoal-100 rounded-full overflow-hidden shadow-inner-glow">
                      <div
                        className={cn("h-full rounded-full bg-gradient-to-r transition-all duration-1000", stat.color)}
                        style={{ width: `${stat.val}%` }}
                      ></div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="divider-premium my-6"></div>

              <div className="flex items-center gap-4 p-4 rounded-xl bg-gradient-subtle border border-charcoal-100">
                <div className="w-12 h-12 rounded-xl bg-gradient-gold flex items-center justify-center shadow-elevation-sm">
                  <Target size={20} className="text-charcoal-900" strokeWidth={2.5} />
                </div>
                <div>
                  <div className="text-caption text-charcoal-500">Next Milestone</div>
                  <div className="text-body-sm font-bold text-charcoal-900">Rules Engine Certification</div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Premium Cohort Log */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <Activity size={20} className="text-forest-600" strokeWidth={2.5} />
                  Cohort Activity
                </CardTitle>
                {isSprintActive && (
                  <div className="w-2 h-2 bg-success-500 rounded-full animate-pulse-slow shadow-elevation-sm"></div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isSprintActive ? (
                <div className="space-y-0 relative">
                  <div className="absolute left-2 top-3 bottom-3 w-px bg-gradient-to-b from-forest-300 via-charcoal-200 to-transparent"></div>

                  {liveActivity.map((activity, i) => (
                    <div key={i} className="relative pl-8 py-4 hover:bg-charcoal-50/50 rounded-lg transition-colors -mx-2 px-2">
                      <div className={cn(
                        "absolute left-0 top-5 w-4 h-4 rounded-full border-2 bg-white z-10 transition-colors",
                        activity.type === 'milestone' ? "border-gold-500" :
                        activity.type === 'lab' ? "border-forest-500" :
                        "border-charcoal-300"
                      )}></div>

                      <div>
                        <p className="text-body-sm text-charcoal-800 leading-tight">
                          <span className="font-bold text-charcoal-900">{activity.user}</span> {activity.action}
                        </p>
                        <p className="text-caption text-charcoal-400 mt-1">{activity.time}</p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-charcoal-100 flex items-center justify-center">
                    <Sparkles size={28} className="text-charcoal-400" strokeWidth={2} />
                  </div>
                  <p className="text-body text-charcoal-600 mb-6">Join a sprint to see live cohort activity</p>
                  <Button
                    variant="default"
                    onClick={handleJoinSprint}
                    disabled={isSyncing}
                    className="mx-auto"
                  >
                    {isSyncing ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      <>
                        <Zap size={16} strokeWidth={2.5} />
                        Join Sprint
                      </>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
