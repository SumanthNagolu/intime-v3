'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { MOCK_MODULES } from '@/lib/constants';
import { CheckCircle, Lock, PlayCircle, ChevronRight, Code, Star, Search } from 'lucide-react';
import { useAppStore } from '@/lib/store';

export const ModulesList: React.FC = () => {
  const { academyProgress } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');

  // Merge store progress with module structure
  const mergedModules = MOCK_MODULES.map(m => {
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

  // Filter Logic
  const filteredModules = mergedModules.map(m => {
      const matchesModule = m.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchingLessons = m.lessons.filter(l => l.title.toLowerCase().includes(searchTerm.toLowerCase()));
      
      if (matchesModule) return m;
      if (matchingLessons.length > 0) return { ...m, lessons: matchingLessons };
      return null;
  }).filter(Boolean) as typeof mergedModules;

  return (
    <div className="animate-fade-in max-w-3xl mx-auto py-8">
      <div className="mb-8 text-center">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-3">Guidewire Developer Track</div>
        <h1 className="text-5xl font-serif font-bold text-charcoal mb-4">The Path</h1>
        <p className="text-stone-500 text-lg font-light">One curriculum. One goal. Your new career.</p>
      </div>

      <div className="mb-10 sticky top-24 z-20">
          <div className="relative max-w-md mx-auto">
              <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                  <Search size={18} className="text-stone-400" />
              </div>
              <input 
                  type="text"
                  placeholder="Search modules or lessons..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-6 py-4 rounded-full border border-stone-200 bg-white/90 backdrop-blur shadow-lg focus:outline-none focus:border-rust text-charcoal font-medium transition-all"
              />
          </div>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-8 top-0 bottom-0 w-px bg-stone-200 hidden md:block"></div>

        <div className="space-y-12">
          {filteredModules.length > 0 ? filteredModules.map((module) => (
            <div key={module.id} className={`relative md:pl-24 transition-all duration-500 ${module.progress === 0 ? 'opacity-90' : 'opacity-100'}`}>
              
              {/* Timeline Node */}
              <div className="absolute left-0 w-16 h-16 hidden md:flex items-center justify-center z-10">
                 <div className={`w-16 h-16 rounded-full border-4 flex items-center justify-center shadow-sm bg-white transition-colors ${
                   module.progress === 100 ? 'border-forest text-forest' :
                   module.progress > 0 ? 'border-rust text-rust' : 'border-stone-200 text-stone-300'
                 }`}>
                    {module.progress === 100 ? <CheckCircle size={28} /> : 
                     module.progress === 0 ? <Lock size={24} /> : 
                     <span className="font-serif font-bold text-xl">{module.id}</span>}
                 </div>
              </div>

              {/* Content Card */}
              <div className="bg-white rounded-[2rem] p-8 shadow-xl shadow-stone-200/40 border border-stone-100 group hover:border-rust/30 transition-all">
                <div className="flex justify-between items-start mb-4">
                   <div>
                      <h3 className="text-2xl font-serif font-bold text-charcoal mb-1 group-hover:text-rust transition-colors">{module.title}</h3>
                      <p className="text-stone-500 text-sm leading-relaxed max-w-md">{module.description}</p>
                   </div>
                   {module.progress > 0 && (
                     <span className="text-xs font-bold bg-stone-50 px-3 py-1 rounded-full border border-stone-100 text-stone-500">
                       {module.progress}% Done
                     </span>
                   )}
                </div>

                {/* Lesson Chain */}
                <div className="space-y-3 mt-6">
                   {module.lessons.map((lesson) => (
                     <div key={lesson.id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-stone-50 transition-colors">
                        <div className="shrink-0">
                           {lesson.status === 'completed' ? <div className="w-6 h-6 rounded-full bg-forest/10 text-forest flex items-center justify-center"><CheckCircle size={14} /></div> :
                            lesson.status === 'unlocked' ? <div className="w-6 h-6 rounded-full border-2 border-rust flex items-center justify-center"><div className="w-2 h-2 bg-rust rounded-full"></div></div> :
                            <div className="w-6 h-6 rounded-full border border-stone-200 flex items-center justify-center"><Lock size={14} className="text-stone-300" /></div>}
                        </div>
                        <div className="flex-1">
                           <div className="flex items-center gap-2">
                              <span className={`text-sm font-medium ${lesson.status === 'completed' ? 'text-stone-400' : 'text-charcoal'}`}>{lesson.title}</span>
                              {lesson.type === 'lab' && <Code size={12} className="text-blue-500" />}
                              {lesson.type === 'quiz' && <Star size={12} className="text-yellow-500" />}
                           </div>
                        </div>
                        {(lesson.status !== 'locked') && (
                           <Link href={`/academy/lesson/${module.id}/${lesson.id}`} className="w-8 h-8 flex items-center justify-center rounded-full bg-white border border-stone-200 text-stone-400 hover:border-rust hover:text-rust hover:bg-rust/5 transition-all">
                              <PlayCircle size={16} />
                           </Link>
                        )}
                     </div>
                   ))}
                </div>

                {/* CTA */}
                {module.progress > 0 && module.progress < 100 && (
                   <div className="mt-6 pt-6 border-t border-stone-100">
                      <Link href={`/academy/lesson/${module.id}/${module.lessons.find(l => l.status === 'unlocked')?.id}`}
                        className="w-full py-3 bg-charcoal text-white rounded-xl font-medium flex items-center justify-center gap-2 hover:bg-rust transition-colors"
                      >
                        Continue Journey <ChevronRight size={16} />
                      </Link>
                   </div>
                )}
              </div>
            </div>
          )) : (
              <div className="text-center py-12 text-stone-400">
                  <p>No modules found matching &quot;{searchTerm}&quot;</p>
              </div>
          )}
        </div>
        
        <div className="mt-12 text-center pb-12">
           <div className="inline-flex flex-col items-center gap-2 text-stone-400">
              <div className="w-1 h-8 bg-stone-200"></div>
              <span className="text-xs uppercase tracking-widest">More Coming Soon</span>
           </div>
        </div>
      </div>
    </div>
  );
};
