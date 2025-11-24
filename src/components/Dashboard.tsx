'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_MODULES, COHORT_ACTIVITY } from '@/lib/constants';
import { ChevronRight, Lock, Clock, Target, Briefcase, Activity, Users, Zap, Calendar, Check, Loader2, ArrowUpRight, Terminal } from 'lucide-react';
import { Module } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { cn } from '@/lib/utils';

export const Dashboard: React.FC = () => {
  const router = useRouter();
  const { isSprintActive, joinSprint, academyProgress, initializeAcademy } = useAppStore();
  const [modules, setModules] = useState<Module[]>(MOCK_MODULES);
  const [isSyncing, setIsSyncing] = useState(false);
  const [liveActivity, setLiveActivity] = useState(COHORT_ACTIVITY);
  
  useEffect(() => {
    if (Object.keys(academyProgress).length === 0) {
        initializeAcademy();
    }
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

  let currentModule = mergedModules.find(m => m.progress < 100) || mergedModules[mergedModules.length - 1];
  let currentLesson = currentModule.lessons.find(l => l.status === 'unlocked' || l.status === 'current') || currentModule.lessons[currentModule.lessons.length - 1];
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

  const handleNavigateToLesson = (moduleId: number, lessonId: string) => {
      navigate(`/academy/lesson/${moduleId}/${lessonId}`);
  };

  const handleJoinSprint = () => {
      setIsSyncing(true);
      setTimeout(() => {
          setIsSyncing(false);
          joinSprint();
      }, 1500);
  };

  return (
    <div className="animate-fade-in pt-4">
      
      {/* Architectural Header */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b-2 border-charcoal pb-8">
        <div>
          <div className="font-mono text-charcoal font-bold text-[10px] uppercase tracking-widest mb-3 flex items-center gap-3">
             <span className={cn("w-2 h-2 rounded-none border border-charcoal", isSprintActive ? 'bg-rust animate-pulse' : 'bg-stone-300')}></span>
             {isSprintActive ? 'STATUS: SPRINT_ACTIVE' : 'STATUS: SELF_PACED'}
             <span className="text-stone-400">|</span>
             <span>DAY_23</span>
          </div>
          <h1 className="text-5xl md:text-7xl font-serif font-bold text-charcoal mb-4 tracking-tighter leading-none">Candidate<br/>Dashboard</h1>
          <p className="text-stone-600 text-lg max-w-xl leading-relaxed font-serif italic border-l-2 border-rust pl-4 mt-6">
            "Consistency is the bridge between where you are and where you want to be."
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="relative inline-block border-2 border-charcoal p-6 bg-white shadow-sharp">
             <div className="text-6xl font-mono font-bold text-charcoal mb-1 leading-none tracking-tighter">{stats.overall}<span className="text-2xl align-top">%</span></div>
             <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold flex items-center justify-end gap-2 mt-2">
                Readiness Index
             </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: The Work */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Hero Card: Today's Focus */}
          <div className="group relative cursor-pointer" onClick={() => handleNavigateToLesson(currentModule.id, currentLesson.id)}>
            <div className="relative bg-charcoal text-ivory rounded-none border-2 border-charcoal p-12 shadow-sharp overflow-hidden flex flex-col justify-between min-h-[400px] transition-transform hover:-translate-y-1 hover:shadow-premium">
              
              {/* Grid Texture */}
              <div className="absolute inset-0 opacity-10 pointer-events-none" style={{ backgroundImage: 'linear-gradient(#ffffff 1px, transparent 1px), linear-gradient(90deg, #ffffff 1px, transparent 1px)', backgroundSize: '40px 40px' }}></div>

              <div className="relative z-10 flex justify-between items-start">
                <div className="flex items-center gap-3 px-3 py-1 border border-white/30 rounded-none bg-white/5 backdrop-blur-sm">
                    <span className="w-1.5 h-1.5 bg-rust animate-pulse"></span>
                    <span className="text-[10px] font-mono text-stone-300 uppercase tracking-widest">Protocol_Active</span>
                </div>
                <div className="font-mono text-xs text-stone-400">{currentModule.week.toUpperCase()}</div>
              </div>
              
              <div className="relative z-10 max-w-2xl mt-8">
                 <h2 className="text-4xl md:text-6xl font-serif font-medium text-white mb-6 leading-tight">{currentLesson.title}</h2>
                 <p className="text-stone-400 text-lg font-light leading-relaxed">{currentLesson.description || currentModule.description}</p>
              </div>
              
              <div className="relative z-10 flex justify-between items-end mt-12">
                 <div className="flex gap-3">
                     {currentLesson.type === 'lab' && (
                       <div className="px-3 py-1.5 border border-blue-500 text-blue-300 text-[10px] font-mono uppercase tracking-widest flex items-center gap-2 rounded-none bg-blue-900/20">
                         <Briefcase size={12} /> Portfolio Asset
                       </div>
                     )}
                     <div className="px-3 py-1.5 border border-white/20 text-stone-400 text-[10px] font-mono uppercase tracking-widest rounded-none">
                         Est. {currentLesson.duration}
                     </div>
                 </div>

                 <button className="flex items-center gap-3 px-8 py-4 bg-white text-charcoal text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all rounded-none border-2 border-white">
                    {currentLesson.status === 'completed' ? 'Review Protocol' : 'Initialize'} <ChevronRight size={14} />
                 </button>
              </div>
            </div>
          </div>

          {/* Curriculum Horizon */}
          <div className="bg-white border-2 border-stone-200 p-8 shadow-sharp-sm">
             <div className="flex items-center justify-between mb-6 border-b-2 border-stone-100 pb-4">
                 <h3 className="text-lg font-serif font-bold text-charcoal">Curriculum Map</h3>
                 <span className="text-[10px] font-mono text-stone-400 uppercase">8_WEEK_PROGRAM</span>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {mergedModules.map((m) => (
                     <div key={m.id} className={`p-4 border transition-all relative overflow-hidden group ${m.progress === 100 ? 'bg-stone-50 border-stone-300' : m.progress > 0 ? 'bg-white border-charcoal shadow-sharp-sm' : 'bg-white border-stone-200 opacity-60'}`}>
                         <div className="text-[9px] font-mono text-stone-400 mb-2">{m.week}</div>
                         <div className="font-bold text-xs text-charcoal leading-tight mb-4 pr-2 font-mono">{m.title}</div>
                         <div className="h-1 bg-stone-100 w-full overflow-hidden absolute bottom-0 left-0">
                             <div className={`h-full ${m.progress === 100 ? 'bg-forest' : 'bg-charcoal'}`} style={{ width: `${m.progress}%` }}></div>
                         </div>
                     </div>
                 ))}
             </div>
          </div>

        </div>

        {/* Right Column: Metrics & Log */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Stats Box */}
           <div className="bg-white border-2 border-charcoal p-8 shadow-sharp">
              <h3 className="font-serif text-xl text-charcoal mb-6 border-b-2 border-stone-100 pb-4 flex items-center justify-between">
                  Employability
                  <Terminal size={16} className="text-stone-400"/>
              </h3>
              
              <div className="space-y-6">
                 {[
                     { label: 'Technical', val: stats.techScore, color: 'bg-charcoal' },
                     { label: 'Communication', val: stats.commScore, color: 'bg-rust' },
                     { label: 'Portfolio', val: stats.portfolioScore, color: 'bg-stone-400' }
                 ].map(stat => (
                     <div key={stat.label}>
                        <div className="flex justify-between text-[10px] font-mono uppercase tracking-widest text-stone-500 mb-2">
                          {stat.label}
                          <span className="text-charcoal font-bold">{stat.val}%</span>
                        </div>
                        <div className="h-2 bg-stone-200 w-full overflow-hidden border border-stone-200">
                          <div className={`h-full ${stat.color}`} style={{ width: `${stat.val}%` }}></div>
                        </div>
                     </div>
                 ))}
              </div>

              <div className="mt-8 pt-6 border-t-2 border-stone-100 flex items-center gap-4">
                 <div className="p-3 border-2 border-stone-200 text-rust">
                    <Target size={18} />
                 </div>
                 <div>
                    <div className="text-[9px] font-mono text-stone-400 uppercase tracking-widest">Next Milestone</div>
                    <div className="text-xs font-bold text-charcoal font-mono">Rules Engine Cert.</div>
                 </div>
              </div>
           </div>

           {/* Sprint Log */}
           <div className="bg-white border-2 border-stone-200 p-8 shadow-sharp-sm">
              <div className="flex items-center justify-between mb-6">
                  <h3 className="font-serif text-xl text-charcoal">Cohort Log</h3>
                  <div className="w-2 h-2 bg-green-500 animate-pulse rounded-none"></div>
              </div>
              
              {isSprintActive ? (
                 <div className="space-y-0 relative">
                    <div className="absolute left-[5px] top-2 bottom-2 w-px bg-stone-200"></div>
                    {liveActivity.map((activity, i) => (
                         <div key={i} className="relative pl-6 py-3 border-b border-stone-50 last:border-0">
                             <div className="absolute left-0 top-4 w-2.5 h-2.5 bg-white border-2 border-stone-300 z-10"></div>
                             <div>
                                 <p className="text-xs text-charcoal font-medium font-mono">
                                     <span className="font-bold">{activity.user}</span> {activity.action}
                                 </p>
                                 <p className="text-[9px] font-mono text-stone-400 mt-1 uppercase">{activity.time}</p>
                             </div>
                         </div>
                    ))}
                 </div>
              ) : (
                 <div className="text-center py-8">
                     <p className="text-stone-400 text-xs mb-6 font-mono">SYNC_REQUIRED</p>
                     <button 
                        onClick={handleJoinSprint}
                        disabled={isSyncing}
                        className="w-full py-3 border-2 border-charcoal text-charcoal text-xs font-bold uppercase tracking-widest hover:bg-charcoal hover:text-white transition-all"
                     >
                        {isSyncing ? 'Connecting...' : 'Join Real-time Sprint'}
                     </button>
                 </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};
