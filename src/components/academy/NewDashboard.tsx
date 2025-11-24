'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { MOCK_MODULES, COHORT_ACTIVITY } from '@/lib/academy/constants';
import { ChevronRight, Lock, Clock, Target, Briefcase, Activity, Users, Zap, Calendar, Check, Loader2, ArrowUpRight } from 'lucide-react';
import { AcademyModule } from '@/types/academy';
import { useAppStore } from '@/lib/store/academy-store';
import { cn } from '@/lib/utils/cn';

export default function Dashboard() {
  const router = useRouter();
  const [modules, setModules] = useState<AcademyModule[]>(MOCK_MODULES);
  const { isSprintActive, joinSprint } = useAppStore();
  const [isSyncing, setIsSyncing] = useState(false);

  // Mock data - will be replaced with real database calls later
  useEffect(() => {
    setModules(MOCK_MODULES);
  }, []);

  // Find current module and lesson
  const currentModule = modules.find(m => m.lessons.some(l => l.status === 'current')) || modules[0];
  const currentLesson = currentModule.lessons.find(l => l.status === 'current') || currentModule.lessons[0];
  
  // Calculate stats dynamically
  const calculateEmployability = () => {
      const totalLabs = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'lab').length, 0);
      const completedLabs = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'lab' && l.status === 'completed').length, 0);
      
      const totalStandard = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'standard').length, 0);
      const completedStandard = modules.reduce((acc, m) => acc + m.lessons.filter(l => l.type === 'standard' && l.status === 'completed').length, 0);
      
      const techScore = totalStandard > 0 ? Math.round((completedStandard / totalStandard) * 100) : 0;
      const portfolioScore = totalLabs > 0 ? Math.round((completedLabs / totalLabs) * 100) : 0;
      // Mock communication score based on progress
      const commScore = Math.min(100, Math.round(techScore * 0.8));
      
      const overall = Math.round((techScore + portfolioScore + commScore) / 3);
      
      return { techScore, portfolioScore, commScore, overall };
  };

  const stats = calculateEmployability();

  const handleNavigateToLesson = (moduleId: number, lessonId: string) => {
      navigate(`/students/lesson/${moduleId}/${lessonId}`);
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
      
      {/* Header / Motivation Block */}
      <div className="mb-12 flex flex-col md:flex-row justify-between items-end gap-6 border-b border-stone-200 pb-8">
        <div>
          <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
             <span className={cn("w-2 h-2 rounded-full", isSprintActive ? 'bg-rust animate-pulse' : 'bg-stone-300')}></span>
             {isSprintActive ? 'Sprint 2: Configuration • Day 23 of 60' : 'Self-Paced Mode'}
          </div>
          <h1 className="text-5xl md:text-6xl font-serif text-charcoal mb-4 italic">Transformation in Progress.</h1>
          <p className="text-stone-500 text-lg font-light max-w-xl leading-relaxed">
            Consistency is the bridge between where you are and where you want to be. 
            Your goal: <span className="text-charcoal font-medium border-b border-rust/30">Guidewire Developer @ $90k/yr</span>.
          </p>
        </div>
        <div className="text-right hidden md:block">
          <div className="relative inline-block">
             <div className="text-7xl font-serif text-forest mb-1 relative z-10">{stats.overall}%</div>
             <div className="absolute -top-2 -right-4 w-3 h-3 bg-rust rounded-full animate-pulse-slow"></div>
          </div>
          <div className="text-xs uppercase tracking-widest text-stone-400 font-medium flex items-center justify-end gap-2">
             <Activity size={12} className="text-rust" />
             Job Readiness Score
          </div>
          <div className="text-[10px] text-stone-300 mt-1">Top 15% of Cohort</div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        
        {/* Left Column: The Work */}
        <div className="lg:col-span-8 flex flex-col gap-12">
          
          {/* Hero Card: Today's Focus */}
          <div className="group relative cursor-pointer" onClick={() => handleNavigateToLesson(currentModule.id, currentLesson.id)}>
            <div className="absolute -inset-0.5 bg-gradient-to-r from-rust/20 to-clay/20 rounded-[2.5rem] blur opacity-0 group-hover:opacity-100 transition duration-1000"></div>
            <div className="relative bg-white rounded-[2.5rem] p-10 shadow-2xl shadow-stone-200/50 border border-stone-100 overflow-hidden bg-noise transform transition duration-500 group-hover:-translate-y-1 min-h-[400px] flex flex-col justify-center">
              
              {/* Background decoration */}
              <div className="absolute top-0 right-0 w-96 h-96 bg-rust/5 rounded-full translate-x-1/3 -translate-y-1/3 blur-3xl"></div>

              <div className="relative z-10">
                <div className="flex items-center justify-between mb-8">
                  <div className="flex items-center gap-3 px-4 py-1.5 bg-rust/5 rounded-full border border-rust/10">
                    <span className="w-1.5 h-1.5 bg-rust rounded-full animate-pulse"></span>
                    <span className="text-[10px] font-bold text-rust uppercase tracking-widest">Today's Focus</span>
                  </div>
                  <div className="flex items-center gap-3">
                     <span className="text-xs font-bold text-red-400 uppercase tracking-widest flex items-center gap-1">
                        <Calendar size={12} /> {isSprintActive ? 'Sprint ends in 3 days' : 'No Deadline Set'}
                     </span>
                  </div>
                </div>
                
                <h2 className="text-5xl font-serif font-bold text-charcoal mb-4 leading-tight max-w-lg">{currentLesson.title}</h2>
                <p className="text-stone-600 mb-10 text-xl font-light max-w-2xl leading-relaxed">{currentLesson.description}</p>
                
                <div className="flex flex-wrap items-center gap-4 mb-12">
                   <div className="px-4 py-2 rounded-full bg-stone-50 border border-stone-100 text-stone-600 text-xs font-bold uppercase tracking-wide">
                     Module {currentModule.id}
                   </div>
                   {currentLesson.type === 'lab' && (
                     <div className="px-4 py-2 rounded-full bg-blue-50 border border-blue-100 text-blue-700 text-xs font-bold uppercase tracking-wide flex items-center gap-2">
                       <Briefcase size={14} />
                       Portfolio Asset
                     </div>
                   )}
                </div>

                <button 
                  className="inline-flex items-center gap-4 px-12 py-5 bg-charcoal text-white rounded-full font-bold tracking-wide group-hover:bg-rust transition-all duration-500 shadow-xl hover:shadow-rust/30 group-hover:translate-x-2"
                >
                  Enter The Protocol
                  <ChevronRight size={20} />
                </button>
              </div>
            </div>
          </div>

          {/* Curriculum Horizon (Visual Roadmap) */}
          <div className="pt-8 border-t border-stone-200">
             <div className="flex items-center gap-2 mb-6">
                 <h3 className="text-xl font-serif text-charcoal italic">Curriculum Horizon</h3>
                 <span className="text-[10px] uppercase font-bold tracking-widest text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">8 Weeks</span>
             </div>
             <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                 {modules.map((m) => (
                     <div key={m.id} className={`p-4 rounded-xl border ${m.progress === 100 ? 'bg-forest/5 border-forest/20' : m.progress > 0 ? 'bg-white border-rust/30 shadow-sm' : 'bg-stone-50 border-stone-100 opacity-60'}`}>
                         <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400 mb-1">{m.week}</div>
                         <div className="font-serif font-bold text-sm text-charcoal leading-tight mb-2 truncate">{m.title}</div>
                         <div className="h-1 bg-stone-200 rounded-full overflow-hidden">
                             <div className={`h-full rounded-full ${m.progress === 100 ? 'bg-forest' : 'bg-rust'}`} style={{ width: `${m.progress}%` }}></div>
                         </div>
                     </div>
                 ))}
                 {/* Placeholders for visual depth */}
                 {[4, 5, 6, 7, 8].map(i => (
                     <div key={i} className="p-4 rounded-xl border border-stone-100 bg-stone-50 opacity-40">
                         <div className="text-[10px] font-bold uppercase tracking-widest text-stone-300 mb-1">Week {i}</div>
                         <div className="h-4 bg-stone-200 rounded w-3/4 mb-2"></div>
                         <div className="h-1 bg-stone-200 rounded-full w-full"></div>
                     </div>
                 ))}
             </div>
          </div>

        </div>

        {/* Right Column: Stats & Sprint Backlog */}
        <div className="lg:col-span-4 space-y-8">
           
           {/* Employability Stats */}
           <div className="bg-charcoal text-ivory rounded-[2.5rem] p-8 shadow-2xl shadow-stone-900/20 relative overflow-hidden bg-noise">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-rust/20 to-transparent rounded-full -mr-10 -mt-10 blur-3xl"></div>
              
              <h3 className="font-serif text-2xl mb-8 relative z-10 italic">Employability Matrix</h3>
              
              <div className="space-y-8 relative z-10">
                 <div>
                    <div className="flex justify-between text-xs uppercase tracking-widest text-stone-400 mb-3">
                      Technical Skills
                      <span className="text-white font-mono">{stats.techScore}%</span>
                    </div>
                    <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-forest to-emerald-400 rounded-full shadow-[0_0_10px_rgba(77,124,15,0.5)]" style={{ width: `${stats.techScore}%` }}></div>
                    </div>
                 </div>
                 
                 <div>
                    <div className="flex justify-between text-xs uppercase tracking-widest text-stone-400 mb-3">
                      Communication
                      <span className="text-white font-mono">{stats.commScore}%</span>
                    </div>
                    <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-rust to-orange-400 rounded-full shadow-[0_0_10px_rgba(234,88,12,0.5)]" style={{ width: `${stats.commScore}%` }}></div>
                    </div>
                 </div>

                 <div>
                    <div className="flex justify-between text-xs uppercase tracking-widest text-stone-400 mb-3">
                      Portfolio Quality
                      <span className="text-white font-mono">{stats.portfolioScore}%</span>
                    </div>
                    <div className="h-1.5 bg-stone-800 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 rounded-full" style={{ width: `${stats.portfolioScore}%` }}></div>
                    </div>
                    <p className="text-[10px] text-stone-500 mt-3 leading-relaxed">
                        Impact: High. Complete the "HomeProtect" capstone to boost this significantly.
                    </p>
                 </div>
              </div>

              <div className="mt-10 pt-6 border-t border-white/10">
                 <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-rust/20 text-rust rounded-full flex items-center justify-center border border-rust/20 animate-pulse-slow">
                       <Target size={18} />
                    </div>
                    <div>
                       <div className="text-xs uppercase tracking-widest text-stone-400 mb-1">Next Milestone</div>
                       <div className="text-sm font-bold text-white font-serif tracking-wide">Rules Engine Certification</div>
                    </div>
                 </div>
              </div>
           </div>

           {/* Sprint Backlog (Up Next) */}
           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50 border border-stone-100 bg-noise relative">
              <div className="flex items-center justify-between mb-6">
                 <h3 className="font-serif text-xl font-bold text-charcoal italic">Sprint Backlog</h3>
                 <span className="text-xs font-bold text-rust uppercase tracking-wider">Up Next</span>
              </div>

              <div className="space-y-4">
                 {currentModule.lessons.filter(l => l.status !== 'completed' && l.id !== currentLesson.id).slice(0, 4).map((lesson, i) => (
                   <div 
                     key={i} 
                     onClick={() => lesson.status !== 'locked' && handleNavigateToLesson(currentModule.id, lesson.id)}
                     className={cn("p-4 rounded-xl border flex flex-col gap-2 transition-all",
                         lesson.status === 'locked' 
                         ? 'bg-stone-50 border-stone-100 opacity-60 cursor-not-allowed' 
                         : 'bg-white border-stone-200 cursor-pointer hover:border-rust hover:shadow-md'
                     )}
                   >
                      <div className="flex justify-between items-start">
                          <h4 className="font-serif font-bold text-charcoal text-sm leading-tight">{lesson.title}</h4>
                          {lesson.status === 'locked' ? <Lock size={12} className="text-stone-300" /> : <ArrowUpRight size={14} className="text-rust" />}
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-stone-400 font-bold uppercase tracking-wider">
                          <Clock size={10} /> {lesson.duration}
                      </div>
                   </div>
                 ))}
                 
                 <Link href="/students/modules" className="block text-center py-3 text-xs font-bold uppercase tracking-widest text-stone-400 hover:text-charcoal transition-colors border-t border-stone-100 mt-2">
                     View Full Sprint
                 </Link>
              </div>
           </div>

           {/* Live Cohort Pulse */}
           <div className="bg-white rounded-[2.5rem] p-8 shadow-xl shadow-stone-200/50 border border-stone-100 bg-noise relative overflow-hidden">
              <div className="flex items-center gap-3 mb-6 relative z-10">
                  <div className={cn("w-8 h-8 rounded-full flex items-center justify-center transition-colors", isSprintActive ? 'bg-forest/10 text-forest' : 'bg-blue-50 text-blue-600')}>
                      <Users size={14} />
                  </div>
                  <h3 className="font-serif text-xl font-bold text-charcoal">
                      {isSprintActive ? 'Sprint Team: Active' : 'Live Cohort Pulse'}
                  </h3>
              </div>
              
              {isSprintActive ? (
                 <div className="space-y-6 relative z-10">
                    <div className="absolute left-3 top-2 bottom-2 w-px bg-stone-100"></div>
                    {COHORT_ACTIVITY.map((activity, i) => (
                         <div key={i} className="relative pl-8 flex items-start gap-3">
                             <div className={cn("absolute left-1.5 top-1.5 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                                 activity.type === 'lab' ? 'bg-blue-500' :
                                 activity.type === 'milestone' ? 'bg-rust' :
                                 'bg-forest'
                             )}></div>
                             <div>
                                 <p className="text-sm text-charcoal">
                                     <span className="font-bold">{activity.user}</span> {activity.action}
                                 </p>
                                 <p className="text-xs text-stone-400 mt-0.5">{activity.time}</p>
                             </div>
                         </div>
                    ))}
                 </div>
              ) : (
                 <div className="text-center py-4 relative z-10">
                     <p className="text-stone-500 text-sm mb-6">23 students are currently active in Sprint 2. Join them to unlock live metrics.</p>
                     <button 
                        onClick={handleJoinSprint}
                        disabled={isSyncing}
                        className="w-full py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all flex items-center justify-center gap-2 shadow-lg"
                     >
                        {isSyncing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                        {isSyncing ? 'Syncing Team...' : 'Join The Sprint'}
                     </button>
                 </div>
              )}
           </div>

        </div>
      </div>
    </div>
  );
};