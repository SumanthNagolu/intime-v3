'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'next/navigation';
import { MOCK_MODULES } from '@/lib/academy/constants';
import { ChevronRight, ChevronLeft, CheckCircle, PlayCircle, Lock, Terminal, BookOpen, Star, ShieldCheck, Play, Pause, Copy, Volume2, VolumeX } from 'lucide-react';
import { AcademyLesson } from '@/lib/academy/types';

type Stage = 'theory' | 'demo' | 'quiz' | 'lab';

export default function LessonView() {
  const { moduleId, lessonId } = useParams();
  const router = useRouter();
  const [activeLesson, setActiveLesson] = useState<AcademyLesson | null>(null);
  const [currentStage, setCurrentStage] = useState<Stage>('theory');
  const [completedStages, setCompletedStages] = useState<Stage[]>([]);
  
  // Theory State
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isCoachMode, setIsCoachMode] = useState(true);

  // Demo State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Quiz State
  const [quizAnswer, setQuizAnswer] = useState<string | null>(null);
  const [quizPassed, setQuizPassed] = useState(false);

  // Lab State
  const [copied, setCopied] = useState(false);

  const module = MOCK_MODULES.find(m => m.id === Number(moduleId));

  useEffect(() => {
    if (module && lessonId) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setActiveLesson(lesson);
        // In a real app, fetch completed stages from DB
        if (lesson.status === 'completed') {
            setCompletedStages(['theory', 'demo', 'quiz', 'lab']);
            setCurrentStage('lab');
        } else {
            setCompletedStages([]);
            setCurrentStage('theory');
        }
      }
    }
  }, [moduleId, lessonId, module]);

  const completeStage = (stage: Stage) => {
    if (!completedStages.includes(stage)) {
      setCompletedStages([...completedStages, stage]);
    }
    
    // Auto-advance
    if (stage === 'theory') setCurrentStage('demo');
    if (stage === 'demo') setCurrentStage('quiz');
    if (stage === 'quiz') setCurrentStage('lab');
    if (stage === 'lab') {
        // Find next lesson
        const currentIdx = module?.lessons.findIndex(l => l.id === lessonId) ?? -1;
        const nextLesson = module?.lessons[currentIdx + 1];
        if (nextLesson) {
           navigate(`/academy/lesson/${moduleId}/${nextLesson.id}`);
        } else {
           router.push('/academy/modules');
        }
    }
  };

  const handleCopyCode = () => {
     if (activeLesson?.content.lab.codeSnippet) {
         navigator.clipboard.writeText(activeLesson.content.lab.codeSnippet);
         setCopied(true);
         setTimeout(() => setCopied(false), 2000);
     }
  };

  if (!activeLesson) return <div>Loading...</div>;

  const stages: { id: Stage; label: string; icon: React.ElementType }[] = [
    { id: 'theory', label: 'Theory', icon: BookOpen },
    { id: 'demo', label: 'Demo', icon: PlayCircle },
    { id: 'quiz', label: 'Verify', icon: ShieldCheck },
    { id: 'lab', label: 'Build', icon: Terminal },
  ];

  return (
    <div className="h-[calc(100vh-120px)] flex flex-col gap-6 animate-fade-in pt-4">
      
      {/* The Protocol Bar */}
      <div className="bg-white/80 backdrop-blur-sm rounded-[2rem] p-6 shadow-lg shadow-stone-200/50 border border-stone-200 flex flex-col md:flex-row justify-between items-center z-10 gap-4">
         <div>
            <div className="text-[10px] uppercase tracking-[0.2em] text-stone-400 font-bold mb-2 text-center md:text-left">Current Protocol</div>
            <h1 className="text-2xl font-serif font-bold text-charcoal italic text-center md:text-left">{activeLesson.title}</h1>
         </div>
         <div className="flex items-center bg-stone-100 p-1.5 rounded-full border border-stone-200 overflow-x-auto max-w-full">
            {stages.map((stage, idx) => {
                const isCompleted = completedStages.includes(stage.id);
                const isCurrent = currentStage === stage.id;
                const isLocked = !isCompleted && !isCurrent;
                
                return (
                    <div key={stage.id} className="flex items-center shrink-0">
                        <button 
                            onClick={() => !isLocked && setCurrentStage(stage.id)}
                            disabled={isLocked}
                            className={`flex items-center gap-2 px-5 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 ${
                                isCurrent ? 'bg-charcoal text-white shadow-lg scale-105' :
                                isCompleted ? 'text-forest hover:bg-stone-200' :
                                'text-stone-400 opacity-50 cursor-not-allowed'
                            }`}
                        >
                            {isCompleted ? <CheckCircle size={14} /> : <stage.icon size={14} />}
                            {stage.label}
                        </button>
                        {idx < stages.length - 1 && (
                            <div className="w-4 md:w-6 h-px bg-stone-300 mx-1 md:mx-2"></div>
                        )}
                    </div>
                );
            })}
         </div>
      </div>

      {/* Main Stage Content */}
      <div className="flex-1 bg-white rounded-[2.5rem] border border-stone-200 shadow-2xl shadow-stone-200/50 overflow-hidden relative flex flex-col bg-noise">
         
         {/* THEORY - SMART DECK */}
         {currentStage === 'theory' && (
             <div className="flex-1 flex flex-col lg:flex-row h-full">
                 {/* Slide View */}
                 <div className="flex-1 bg-charcoal text-ivory p-12 flex flex-col relative overflow-hidden">
                    {/* Slide Content */}
                    <div className="flex-1 flex flex-col justify-center relative z-10">
                       <span className="text-rust font-mono text-xs mb-4 block">SLIDE 0{currentSlide + 1} / 0{activeLesson.content.theory.slides.length}</span>
                       <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-8">
                           {typeof activeLesson.content.theory.slides[currentSlide] === 'string' 
                             ? activeLesson.content.theory.slides[currentSlide] 
                             : (activeLesson.content.theory.slides[currentSlide] as any).title}
                       </h2>
                       <div className="space-y-4">
                          {(activeLesson.content.theory.slides[currentSlide] as any).bullets?.map((bullet: string, i: number) => (
                              <div key={i} className="flex items-start gap-3 text-stone-300 text-lg font-light">
                                 <div className="w-1.5 h-1.5 bg-rust rounded-full mt-2.5 shrink-0"></div>
                                 <p>{bullet}</p>
                              </div>
                          ))}
                       </div>
                    </div>
                    
                    {/* Controls */}
                    <div className="flex justify-between items-center mt-8 pt-8 border-t border-white/10 z-10">
                        <button 
                          onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                          disabled={currentSlide === 0}
                          className="p-3 rounded-full hover:bg-white/10 disabled:opacity-30 transition"
                        >
                           <ChevronLeft size={24} />
                        </button>
                        
                        <div className="flex gap-2">
                           {activeLesson.content.theory.slides.map((_, idx) => (
                              <div key={idx} className={`h-1 rounded-full transition-all duration-300 ${idx === currentSlide ? 'w-8 bg-rust' : 'w-2 bg-white/20'}`}></div>
                           ))}
                        </div>

                        <button 
                          onClick={() => {
                              if (currentSlide < activeLesson.content.theory.slides.length - 1) {
                                  setCurrentSlide(currentSlide + 1);
                              } else {
                                  completeStage('theory');
                              }
                          }}
                          className="flex items-center gap-2 px-6 py-3 bg-white text-charcoal rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all"
                        >
                           {currentSlide === activeLesson.content.theory.slides.length - 1 ? 'Complete' : 'Next'} 
                           <ChevronRight size={16} />
                        </button>
                    </div>

                    {/* Background decoration */}
                    <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                 </div>

                 {/* Deep Dive Context Panel */}
                 <div className="w-full lg:w-1/3 bg-ivory border-l border-stone-200 p-8 flex flex-col">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                           <Star size={14} className="text-rust" />
                           Senior Context
                        </div>
                        <button 
                          onClick={() => setIsCoachMode(!isCoachMode)}
                          className={`p-2 rounded-full transition-colors ${isCoachMode ? 'bg-rust/10 text-rust' : 'bg-stone-100 text-stone-400'}`}
                          title="Toggle Coach Audio"
                        >
                           {isCoachMode ? <Volume2 size={16} /> : <VolumeX size={16} />}
                        </button>
                     </div>

                     <div className={`flex-1 overflow-y-auto transition-opacity duration-500 ${isCoachMode ? 'opacity-100' : 'opacity-30 blur-sm'}`}>
                        <p className="font-serif text-xl text-charcoal leading-relaxed mb-6">
                           "{(activeLesson.content.theory.slides[currentSlide] as any).context || "Focus on the relationship between these entities. In a production environment, misconfiguring this leads to significant performance drag."}"
                        </p>
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                           <h4 className="font-bold text-xs uppercase text-stone-400 mb-2">Real World Impact</h4>
                           <p className="text-stone-600 text-sm leading-relaxed">
                              Getting this wrong typically results in 200-300ms latency per quote. Junior devs often overlook the index configuration here.
                           </p>
                        </div>
                     </div>
                 </div>
             </div>
         )}

         {/* DEMO */}
         {currentStage === 'demo' && (
             <div className="flex-1 bg-stone-950 flex flex-col relative group">
                 {/* Mock Video Player */}
                 <div className="absolute inset-0 flex items-center justify-center">
                     {!isVideoPlaying ? (
                         <div className="text-center z-10">
                             <button 
                               onClick={() => setIsVideoPlaying(true)}
                               className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center text-white mb-6 cursor-pointer hover:scale-110 hover:bg-white hover:text-charcoal hover:border-white transition-all duration-500 bg-white/5 backdrop-blur-md shadow-2xl"
                             >
                                 <Play size={32} fill="currentColor" className="ml-1" />
                             </button>
                             <p className="text-stone-400 text-sm font-mono tracking-widest uppercase">Start Interactive Demo</p>
                         </div>
                     ) : (
                         <div 
                            className="absolute inset-0 bg-transparent cursor-pointer flex items-center justify-center group/video"
                            onClick={() => setIsVideoPlaying(false)}
                         >
                             <div className="opacity-0 group-hover/video:opacity-100 transition-opacity bg-black/50 p-4 rounded-full backdrop-blur">
                                 <Pause size={48} className="text-white fill-white" />
                             </div>
                         </div>
                     )}
                 </div>

                 {/* Transcript / Controls */}
                 {activeLesson.content.demo.transcript && (
                     <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-12 pt-32 transition-transform duration-500 ${isVideoPlaying ? 'translate-y-full group-hover:translate-y-0' : 'translate-y-0'}`}>
                         <p className="text-stone-300 font-serif text-2xl leading-relaxed max-w-3xl mx-auto text-center italic opacity-80">
                             "{activeLesson.content.demo.transcript}"
                         </p>
                         <div className="mt-12 flex justify-center">
                             <button onClick={() => completeStage('demo')} className="bg-white text-black px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all duration-300 shadow-lg hover:shadow-rust/50">
                                 Complete Observation
                             </button>
                         </div>
                     </div>
                 )}
             </div>
         )}

         {/* QUIZ */}
         {currentStage === 'quiz' && (
             <div className="flex-1 p-12 bg-stone-50 flex items-center justify-center relative overflow-hidden">
                 <div className="absolute top-0 left-0 w-full h-full opacity-5 bg-noise"></div>
                 
                 <div className="max-w-3xl w-full bg-white p-12 rounded-[2rem] shadow-xl shadow-stone-200 border border-stone-200 relative z-10">
                     <div className="flex items-center gap-4 mb-10 pb-8 border-b border-stone-100">
                         <div className="w-12 h-12 bg-rust text-white rounded-xl flex items-center justify-center shadow-lg shadow-rust/30">
                            <ShieldCheck size={24} />
                         </div>
                         <div>
                            <h2 className="text-2xl font-serif font-bold text-charcoal">Verification Gate</h2>
                            <p className="text-sm text-stone-400">Pass this to unlock the Lab Environment.</p>
                         </div>
                     </div>
                     
                     {activeLesson.content.quiz.questions.map((q) => (
                         <div key={q.id} className="mb-10">
                             <p className="text-xl font-medium text-charcoal mb-8 leading-relaxed font-serif">"{q.question}"</p>
                             <div className="space-y-4">
                                 {q.options.map(opt => (
                                     <button
                                         key={opt.id}
                                         onClick={() => setQuizAnswer(opt.id)}
                                         className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-300 flex items-center justify-between group ${
                                             quizAnswer === opt.id 
                                             ? 'border-charcoal bg-charcoal text-white shadow-xl' 
                                             : 'border-stone-100 hover:border-rust/30 hover:bg-stone-50'
                                         }`}
                                     >
                                         <span className="font-medium">{opt.text}</span>
                                         {quizAnswer === opt.id && <CheckCircle size={20} className="text-rust" />}
                                     </button>
                                 ))}
                             </div>
                         </div>
                     ))}
                     
                     <button 
                        onClick={() => {
                            // Mock validation
                            setQuizPassed(true);
                            setTimeout(() => completeStage('quiz'), 1500);
                        }}
                        disabled={!quizAnswer}
                        className={`w-full py-5 rounded-xl text-sm font-bold uppercase tracking-widest text-white transition-all duration-500 shadow-xl ${quizPassed ? 'bg-forest' : 'bg-rust hover:bg-[#B8421E] disabled:opacity-50 disabled:cursor-not-allowed'}`}
                     >
                        {quizPassed ? 'Verified. Accessing Lab...' : 'Verify Understanding'}
                     </button>
                 </div>
             </div>
         )}

         {/* LAB */}
         {currentStage === 'lab' && (
             <div className="flex-1 flex flex-col lg:flex-row h-full">
                 <div className="w-full lg:w-1/3 bg-white border-r border-stone-200 p-10 overflow-y-auto scrollbar-hide">
                     <div className="mb-8">
                         <div className="flex items-center gap-2 mb-3">
                            <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase tracking-widest">Jira Ticket</span>
                            <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">User Story {activeLesson.content.lab.userStoryId}</span>
                         </div>
                         <h2 className="text-3xl font-serif font-bold text-charcoal mt-2 leading-tight">{activeLesson.content.lab.title}</h2>
                     </div>
                     
                     <div className="prose prose-stone prose-sm mb-10">
                         <p className="text-stone-600 leading-relaxed text-base">{activeLesson.content.lab.instructions}</p>
                     </div>
                     
                     <div className="bg-blue-50 p-6 rounded-2xl border border-blue-100 mb-10 shadow-sm relative overflow-hidden">
                         <div className="absolute -right-4 -top-4 w-16 h-16 bg-blue-200 rounded-full opacity-20 blur-xl"></div>
                         <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-wider mb-3 relative z-10">
                             <Star size={14} className="fill-blue-800" /> Senior Persona Context
                         </div>
                         <p className="text-blue-900 text-lg italic font-serif leading-relaxed relative z-10">
                             "At TechFlow, we strictly used this pattern to avoid performance issues during renewal quoting. Don't forget the 'existence' flag."
                         </p>
                     </div>
                     
                     <button onClick={() => completeStage('lab')} className="w-full py-4 bg-charcoal text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg hover:shadow-rust/30">
                         Submit Deliverable
                     </button>
                 </div>
                 
                 <div className="flex-1 bg-[#0c0a09] p-8 overflow-hidden flex flex-col relative">
                     <div className="absolute top-0 right-0 p-4 flex items-center gap-4">
                        <button 
                           onClick={handleCopyCode}
                           className="flex items-center gap-2 text-[10px] text-stone-400 uppercase tracking-widest font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10 hover:bg-white/10 transition-colors"
                        >
                           {copied ? <CheckCircle size={12} className="text-green-500"/> : <Copy size={12} />}
                           {copied ? 'Copied!' : 'Copy Snippet'}
                        </button>
                        <div className="text-[10px] text-stone-500 uppercase tracking-widest font-bold bg-white/5 px-3 py-1 rounded-full border border-white/10">Read-Only Preview</div>
                     </div>
                     <div className="flex items-center gap-2 text-stone-500 border-b border-stone-800 pb-4 mb-4 font-mono text-xs">
                         <Terminal size={14} />
                         <span>coverage-config.xml</span>
                     </div>
                     <pre className="font-mono text-sm text-stone-300 overflow-auto flex-1 leading-relaxed selection:bg-rust selection:text-white scrollbar-hide p-4">
                         {activeLesson.content.lab.codeSnippet}
                     </pre>
                 </div>
             </div>
         )}

      </div>
    </div>
  );
};