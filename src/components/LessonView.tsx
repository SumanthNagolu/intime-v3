'use client';


import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'next/navigation';
import { MOCK_MODULES } from '@/lib/constants';
import { ChevronRight, ChevronLeft, CheckCircle, PlayCircle, Lock, Terminal, BookOpen, Star, ShieldCheck, Play, Pause, Copy, RotateCcw, Upload, FileCode, Sparkles, Maximize2, Monitor, Download, FileText, Server, Database } from 'lucide-react';
import { Lesson } from '@/lib/types';
import { useAppStore } from '@/lib/store';
import { generateMentorResponse } from '@/services/geminiService';

type Stage = 'theory' | 'demo' | 'quiz' | 'lab';

// Shuffle utility
const shuffleArray = (array: any[]) => {
    let currentIndex = array.length, randomIndex;
    while (currentIndex !== 0) {
        randomIndex = Math.floor(Math.random() * currentIndex);
        currentIndex--;
        [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
};

export const LessonView: React.FC = () => {
  const { moduleId, lessonId } = useParams();
  const router = useRouter();
  const { updateLessonStatus, academyProgress, setMentorContext, setMentorOpen, hasKey } = useAppStore();
  
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [currentStage, setCurrentStage] = useState<Stage>('theory');
  const [completedStages, setCompletedStages] = useState<Stage[]>([]);
  
  // Theory State
  const [currentSlide, setCurrentSlide] = useState(0);

  // Demo State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [videoProgress, setVideoProgress] = useState(0);
  const [canCompleteDemo, setCanCompleteDemo] = useState(false);

  // Quiz State
  const [randomizedQuestions, setRandomizedQuestions] = useState<any[]>([]);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<string, string>>({});
  const [showQuizFeedback, setShowQuizFeedback] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizPassed, setQuizPassed] = useState(false);

  // Lab State
  const [labCode, setLabCode] = useState('');
  const [isSubmittingLab, setIsSubmittingLab] = useState(false);
  const [submissionStep, setSubmissionStep] = useState<string>('');
  const [labFeedback, setLabFeedback] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<string | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const module = MOCK_MODULES.find(m => m.id === Number(moduleId));
  const lessonKey = `${moduleId}-${lessonId}`;

  useEffect(() => {
    if (module && lessonId) {
      const lesson = module.lessons.find(l => l.id === lessonId);
      if (lesson) {
        setActiveLesson(lesson);
        // Load progress from store
        const progress = academyProgress[lessonKey];
        if (progress?.status === 'completed') {
            setCompletedStages(['theory', 'demo', 'quiz', 'lab']);
        }
        
        // Initialize lab code
        if (lesson.content.lab.codeSnippet && !labCode) {
            setLabCode(lesson.content.lab.codeSnippet);
        }
      }
    }
  }, [moduleId, lessonId, module, academyProgress, lessonKey]);

  // Initialize Quiz with Randomization
  useEffect(() => {
      if (activeLesson && currentStage === 'quiz') {
          setRandomizedQuestions(shuffleArray([...activeLesson.content.quiz.questions]));
      }
  }, [currentStage, activeLesson]);

  // Video Simulator Logic
  useEffect(() => {
      let interval: any;
      if (isVideoPlaying && videoProgress < 100) {
          interval = setInterval(() => {
              setVideoProgress(p => {
                  const newP = p + 0.5; // Speed up for demo
                  if (newP >= 80 && !canCompleteDemo) setCanCompleteDemo(true);
                  if (newP >= 100) setIsVideoPlaying(false);
                  return Math.min(newP, 100);
              });
          }, 50);
      }
      return () => clearInterval(interval);
  }, [isVideoPlaying, videoProgress, canCompleteDemo]);

  const completeStage = (stage: Stage) => {
    if (!completedStages.includes(stage)) {
      setCompletedStages([...completedStages, stage]);
    }
    
    // Auto-advance logic
    if (stage === 'theory') setCurrentStage('demo');
    if (stage === 'demo') setCurrentStage('quiz');
    if (stage === 'quiz') setCurrentStage('lab');
    
    if (stage === 'lab') {
        // Mark lesson as complete in store
        updateLessonStatus(Number(moduleId), lessonId!, 'completed', quizScore, labCode);
        
        // Find next lesson to unlock
        const currentIdx = module?.lessons.findIndex(l => l.id === lessonId) ?? -1;
        const nextLesson = module?.lessons[currentIdx + 1];
        
        if (nextLesson) {
           updateLessonStatus(Number(moduleId), nextLesson.id, 'unlocked');
        }

        // Show confetti or success modal here (optional), then redirect
        setTimeout(() => {
            if (nextLesson) {
               router.push(`/academy/lesson/${moduleId}/${nextLesson.id}`);
               // Reset local state for next lesson
               setCurrentStage('theory');
               setCompletedStages([]);
               setVideoProgress(0);
               setQuizPassed(false);
               setCurrentSlide(0);
               setLabFeedback(null);
               setUploadedFile(null);
            } else {
               router.push('/academy/modules');
            }
        }, 2000);
    }
  };

  const handleQuizAnswer = (questionId: string, optionId: string) => {
      setSelectedAnswers(prev => ({...prev, [questionId]: optionId}));
  };

  const submitQuiz = () => {
      if (!activeLesson) return;
      const questions = activeLesson.content.quiz.questions;
      let correct = 0;
      questions.forEach(q => {
          if (selectedAnswers[q.id] === q.correctOptionId) correct++;
      });
      
      const score = Math.round((correct / questions.length) * 100);
      setQuizScore(score);
      setShowQuizFeedback(true);
      
      if (score >= activeLesson.content.quiz.passingScore) {
          setQuizPassed(true);
      }
  };

  const retryQuiz = () => {
      setSelectedAnswers({});
      setShowQuizFeedback(false);
      setQuizPassed(false);
      setQuizScore(0);
      setRandomizedQuestions(shuffleArray([...randomizedQuestions])); // Reshuffle
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (e.target.files && e.target.files[0]) {
          setUploadedFile(e.target.files[0].name);
          // Simulate reading content if needed, but visual is enough for demo
      }
  };

  const submitLab = async () => {
      setIsSubmittingLab(true);
      
      // Simulation Steps
      const steps = ["Compiling Gosu...", "Running Unit Tests...", "Validating PCF...", "Deploying to Dev..."];
      for (const step of steps) {
          setSubmissionStep(step);
          await new Promise(r => setTimeout(r, 800));
      }
      
      let feedback = "Code submitted successfully. Moving to next lesson...";
      
      // Use Gemini if available for feedback
      if (hasKey) {
          try {
              setSubmissionStep("AI Mentor Reviewing...");
              const prompt = `You are a Guidewire Technical Instructor. Review this XML configuration against the user story.
              
              Lesson Context: ${activeLesson?.title}
              User Story Requirements: ${activeLesson?.content.lab.instructions}
              
              Student Code Submission:
              ${labCode}
              
              Task:
              1. Does this code roughly meet the requirements? (Yes/No)
              2. Provide 1 sentence of constructive feedback or praise.
              
              Output format: "Approved: [feedback]" or "Needs Revision: [feedback]"
              `;
              
              const aiResponse = await generateMentorResponse([{role: 'user', content: prompt}], prompt);
              feedback = aiResponse;
          } catch (e) {
              console.log("AI grading failed, using mock");
          }
      } else {
          // Mock Logic for demo
          feedback = "Approved: Great job configuring the Coverage Pattern. You correctly set the existence type to 'Electable' and included the required OptionCovTerm.";
      }

      setLabFeedback(feedback);
      setIsSubmittingLab(false);
      setSubmissionStep('');
      
      // In a real app, we might block if "Needs Revision", but for demo we auto-pass
      if (feedback.toLowerCase().includes('approved') || !hasKey) {
          setTimeout(() => completeStage('lab'), 3000);
      }
  };

  const handleAskMentor = () => {
      if (!activeLesson) return;
      const context = `I am working on Lesson: ${activeLesson.title}. I am currently in the ${currentStage} phase. 
      Content Context: ${JSON.stringify(activeLesson.content[currentStage])}`;
      setMentorContext(context);
      setMentorOpen(true);
  };

  const getLineNumbers = () => {
      const lines = labCode.split('\n').length;
      return Array.from({ length: Math.max(lines, 10) }, (_, i) => i + 1).join('\n');
  };

  if (!activeLesson) return <div className="flex items-center justify-center h-screen">Loading Lesson...</div>;

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
         <div className="flex items-center bg-stone-100 p-1.5 rounded-full border border-stone-200 overflow-x-auto max-w-full scrollbar-hide">
            {stages.map((stage, idx) => {
                const isCompleted = completedStages.includes(stage.id);
                const isCurrent = currentStage === stage.id;
                // Allow navigation if previous stage is completed OR if the lesson is already fully completed
                const isUnlockable = idx === 0 || completedStages.includes(stages[idx-1]?.id) || activeLesson.status === 'completed';
                
                return (
                    <div key={stage.id} className="flex items-center shrink-0">
                        <button 
                            onClick={() => isUnlockable && setCurrentStage(stage.id)}
                            disabled={!isUnlockable}
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
                    <div className="flex-1 flex flex-col justify-center relative z-10">
                       <span className="text-rust font-mono text-xs mb-4 block">SLIDE 0{currentSlide + 1} / 0{activeLesson.content.theory.slides.length}</span>
                       <h2 className="text-4xl md:text-5xl font-serif font-bold leading-tight mb-8">
                           {typeof activeLesson.content.theory.slides[currentSlide] === 'string' 
                             ? activeLesson.content.theory.slides[currentSlide] 
                             : (activeLesson.content.theory.slides[currentSlide] as any).title}
                       </h2>
                       <div className="space-y-6">
                          {(activeLesson.content.theory.slides[currentSlide] as any).bullets?.map((bullet: string, i: number) => (
                              <div key={i} className="flex items-start gap-4 text-stone-300 text-lg font-light animate-slide-up" style={{animationDelay: `${i * 100}ms`}}>
                                 <div className="w-1.5 h-1.5 bg-rust rounded-full mt-2.5 shrink-0"></div>
                                 <p>{bullet}</p>
                              </div>
                          ))}
                       </div>
                    </div>
                    
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
                    <div className="absolute -right-20 -bottom-20 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
                 </div>

                 {/* Context Panel */}
                 <div className="w-full lg:w-1/3 bg-ivory border-l border-stone-200 p-8 flex flex-col">
                     <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-widest text-stone-400">
                           <Star size={14} className="text-rust" /> Senior Context
                        </div>
                        <button onClick={handleAskMentor} className="text-xs font-bold text-rust hover:underline">Ask Mentor</button>
                     </div>

                     <div className={`flex-1 overflow-y-auto`}>
                        <p className="font-serif text-xl text-charcoal leading-relaxed mb-6">
                           "{(activeLesson.content.theory.slides[currentSlide] as any).context || "Focus on the relationship between these entities. In a production environment, misconfiguring this leads to significant performance drag."}"
                        </p>
                        <div className="bg-white p-6 rounded-xl border border-stone-100 shadow-sm">
                           <h4 className="font-bold text-xs uppercase text-stone-400 mb-2">Real World Impact</h4>
                           <p className="text-stone-600 text-sm leading-relaxed">
                              Senior devs know that failing to normalize this data early leads to messy migration scripts later. Pay attention to the foreign key constraints.
                           </p>
                        </div>
                     </div>
                 </div>
             </div>
         )}

         {/* DEMO */}
         {currentStage === 'demo' && (
             <div className="flex-1 bg-stone-950 flex flex-col relative group">
                 <div className="absolute inset-0 flex items-center justify-center bg-black">
                     {/* Placeholder for Real Video Embed */}
                     <div className="w-full h-full relative">
                         <div className="absolute inset-0 bg-gradient-to-br from-stone-900 to-black opacity-80"></div>
                         
                         {/* Simulated Video Content */}
                         <div className="absolute inset-0 flex flex-col items-center justify-center">
                             {!isVideoPlaying && videoProgress === 0 && (
                                 <div className="text-center z-10">
                                     <button 
                                       onClick={() => setIsVideoPlaying(true)}
                                       className="w-24 h-24 rounded-full border-2 border-white/20 flex items-center justify-center text-white mb-6 cursor-pointer hover:scale-110 hover:bg-white hover:text-charcoal hover:border-white transition-all duration-500 bg-white/5 backdrop-blur-md shadow-2xl"
                                     >
                                         <Play size={32} fill="currentColor" className="ml-1" />
                                     </button>
                                     <p className="text-stone-400 text-sm font-mono tracking-widest uppercase">Start Interactive Demo</p>
                                 </div>
                             )}
                             
                             {/* Video Progress Simulation */}
                             {(isVideoPlaying || videoProgress > 0) && (
                                 <div className="w-full max-w-4xl aspect-video bg-stone-800 rounded-xl overflow-hidden relative shadow-2xl border border-stone-700 flex items-center justify-center group/video-container">
                                     {/* Mock Screen Content */}
                                     <div className="text-stone-500 font-mono text-lg text-center p-4">
                                         <Monitor size={48} className="mx-auto mb-4 text-stone-600" />
                                         <div>[ Guidewire Product Designer Demo ]</div>
                                         <div className="text-xs text-stone-600 mt-2">
                                             Simulating playback... {Math.round(videoProgress)}%
                                         </div>
                                     </div>
                                     
                                     {/* Controls Overlay */}
                                     <div 
                                        className="absolute inset-0 bg-transparent cursor-pointer flex items-center justify-center"
                                        onClick={() => setIsVideoPlaying(!isVideoPlaying)}
                                     >
                                         {isVideoPlaying && (
                                             <div className="opacity-0 group-hover/video-container:opacity-100 transition-opacity bg-black/50 p-4 rounded-full backdrop-blur">
                                                 <Pause size={48} className="text-white fill-white" />
                                             </div>
                                         )}
                                         {!isVideoPlaying && videoProgress > 0 && (
                                             <div className="bg-black/50 p-4 rounded-full backdrop-blur">
                                                 <Play size={48} className="text-white fill-white" />
                                             </div>
                                         )}
                                     </div>

                                     {/* Progress Bar */}
                                     <div className="absolute bottom-0 left-0 w-full h-1.5 bg-stone-700">
                                         <div className="h-full bg-rust transition-all duration-100" style={{ width: `${videoProgress}%` }}></div>
                                     </div>
                                 </div>
                             )}
                         </div>
                     </div>
                 </div>

                 {/* Downloads Panel (Overlay) */}
                 <div className="absolute top-8 right-8 z-20">
                     <div className="bg-white/10 backdrop-blur-md border border-white/20 p-4 rounded-2xl max-w-xs opacity-90 hover:opacity-100 transition-opacity">
                         <h4 className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-3">Resource Bundle</h4>
                         <div className="space-y-2">
                             <button className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-stone-300 hover:text-white transition-colors group/dl">
                                 <FileText size={16} className="text-rust group-hover/dl:text-white" />
                                 <span className="text-xs font-bold">Slide Deck.pdf</span>
                                 <Download size={12} className="ml-auto opacity-50" />
                             </button>
                             <button className="flex items-center gap-3 w-full text-left p-2 hover:bg-white/10 rounded-lg text-stone-300 hover:text-white transition-colors group/dl">
                                 <FileCode size={16} className="text-blue-400 group-hover/dl:text-white" />
                                 <span className="text-xs font-bold">Source Code.zip</span>
                                 <Download size={12} className="ml-auto opacity-50" />
                             </button>
                         </div>
                     </div>
                 </div>

                 {/* Completion Gate */}
                 <div className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black via-black/90 to-transparent p-12 pt-32 transition-transform duration-500 ${canCompleteDemo ? 'translate-y-0' : 'translate-y-full opacity-0'}`}>
                     <div className="flex flex-col items-center text-center">
                         <p className="text-stone-300 font-serif text-2xl leading-relaxed max-w-3xl italic opacity-80 mb-8">
                             "Notice how we defined the Coverage Pattern before adding the Option terms. That hierarchy is critical."
                         </p>
                         <button 
                            onClick={() => completeStage('demo')}
                            className="bg-green-600 text-white px-10 py-4 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-green-500 transition-all duration-300 shadow-lg flex items-center gap-2 animate-slide-up"
                         >
                             <CheckCircle size={16} /> Complete Observation
                         </button>
                     </div>
                 </div>
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
                            <p className="text-sm text-stone-400">Score {activeLesson.content.quiz.passingScore}%+ to unlock the Lab.</p>
                         </div>
                         {showQuizFeedback && (
                             <div className={`ml-auto px-4 py-2 rounded-full font-bold text-sm ${quizPassed ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                 Score: {quizScore}%
                             </div>
                         )}
                     </div>
                     
                     {!showQuizFeedback ? (
                         <div className="space-y-8">
                             {randomizedQuestions.map((q, idx) => (
                                 <div key={q.id} className="animate-slide-up" style={{ animationDelay: `${idx * 100}ms` }}>
                                     <p className="text-lg font-medium text-charcoal mb-4 font-serif"><span className="text-rust mr-2">{idx+1}.</span> {q.question}</p>
                                     <div className="space-y-3 pl-6">
                                         {q.options.map((opt: any) => (
                                             <button
                                                 key={opt.id}
                                                 onClick={() => handleQuizAnswer(q.id, opt.id)}
                                                 className={`w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between group ${
                                                     selectedAnswers[q.id] === opt.id 
                                                     ? 'border-charcoal bg-charcoal text-white' 
                                                     : 'border-stone-200 hover:border-rust/50 hover:bg-stone-50'
                                                 }`}
                                             >
                                                 <span className="font-medium text-sm">{opt.text}</span>
                                                 {selectedAnswers[q.id] === opt.id && <CheckCircle size={16} className="text-rust" />}
                                             </button>
                                         ))}
                                     </div>
                                 </div>
                             ))}
                             <button 
                                onClick={submitQuiz}
                                disabled={Object.keys(selectedAnswers).length !== activeLesson.content.quiz.questions.length}
                                className="w-full py-5 mt-8 bg-rust hover:bg-[#B8421E] disabled:bg-stone-200 disabled:cursor-not-allowed text-white rounded-xl text-sm font-bold uppercase tracking-widest transition-all shadow-xl"
                             >
                                Submit Answers
                             </button>
                         </div>
                     ) : (
                         <div className="text-center py-8 animate-fade-in">
                             {quizPassed ? (
                                 <>
                                     <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                         <CheckCircle size={40} />
                                     </div>
                                     <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Gate Passed!</h3>
                                     <p className="text-stone-500 mb-8">You have demonstrated sufficient understanding to proceed to the hands-on environment.</p>
                                     <button onClick={() => completeStage('quiz')} className="px-10 py-4 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all">
                                         Enter Lab Environment
                                     </button>
                                 </>
                             ) : (
                                 <>
                                     <div className="w-20 h-20 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto mb-6">
                                         <RotateCcw size={40} />
                                     </div>
                                     <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Review Needed</h3>
                                     <p className="text-stone-500 mb-8">You need {activeLesson.content.quiz.passingScore}% to pass. Review the theory slides and try again.</p>
                                     <button onClick={retryQuiz} className="px-10 py-4 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all">
                                         Retry Assessment
                                     </button>
                                 </>
                             )}
                         </div>
                     )}
                 </div>
             </div>
         )}

         {/* LAB */}
         {currentStage === 'lab' && (
             <div className="flex-1 flex flex-col lg:flex-row h-full">
                 {/* Left Panel: Instructions */}
                 <div className="w-full lg:w-1/3 bg-white border-r border-stone-200 p-8 flex flex-col">
                     <div className="flex-1 overflow-y-auto scrollbar-hide">
                         <div className="mb-6">
                             <div className="flex items-center gap-2 mb-3">
                                <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-100 rounded text-[10px] font-bold uppercase tracking-widest">Jira Ticket</span>
                                <span className="text-xs font-bold text-stone-400 uppercase tracking-widest">Story {activeLesson.content.lab.userStoryId}</span>
                             </div>
                             <h2 className="text-2xl font-serif font-bold text-charcoal mt-2 leading-tight">{activeLesson.content.lab.title}</h2>
                         </div>
                         
                         <div className="prose prose-stone prose-sm mb-8">
                             <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Acceptance Criteria</h4>
                             <p className="text-stone-600 leading-relaxed">{activeLesson.content.lab.instructions}</p>
                         </div>
                         
                         <div className="bg-stone-50 p-4 rounded-xl border border-stone-100 mb-6">
                             <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2 flex items-center gap-2"><Upload size={12}/> File Upload</h4>
                             <div className="relative border-2 border-dashed border-stone-200 rounded-lg p-4 text-center cursor-pointer hover:bg-white transition-colors group">
                                 <input 
                                    type="file" 
                                    onChange={handleFileUpload}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                 />
                                 <div className="flex flex-col items-center gap-2 text-stone-500 group-hover:text-rust">
                                     {uploadedFile ? (
                                         <>
                                            <FileCode size={24} className="text-forest" />
                                            <span className="text-xs font-bold text-forest">{uploadedFile}</span>
                                         </>
                                     ) : (
                                         <>
                                            <Upload size={20} />
                                            <span className="text-xs">Drag & drop XML/Gosu files</span>
                                         </>
                                     )}
                                 </div>
                             </div>
                         </div>

                         {labFeedback && (
                             <div className={`p-4 rounded-xl mb-6 text-sm leading-relaxed ${labFeedback.includes('Approved') ? 'bg-green-50 text-green-800 border border-green-100' : 'bg-yellow-50 text-yellow-800 border border-yellow-100'}`}>
                                 <div className="font-bold mb-1 flex items-center gap-2">
                                     <Sparkles size={14} /> AI Review:
                                 </div>
                                 {labFeedback}
                             </div>
                         )}
                     </div>
                     
                     <button 
                        onClick={submitLab}
                        disabled={isSubmittingLab}
                        className="w-full py-4 bg-charcoal text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg hover:shadow-rust/30 disabled:opacity-70 flex items-center justify-center gap-2"
                     >
                         {isSubmittingLab ? (
                             <span className="flex items-center gap-2 animate-pulse">
                                <Server size={14} /> {submissionStep}
                             </span>
                         ) : (
                             <>Submit for Review <Terminal size={14} /></>
                         )}
                     </button>
                 </div>
                 
                 {/* Right Panel: Code Editor */}
                 <div className="flex-1 bg-[#1e1e1e] flex flex-col relative group/editor">
                     <div className="flex items-center justify-between bg-[#252526] px-4 py-2 border-b border-black/20">
                        <div className="flex items-center gap-2 text-stone-400 font-mono text-xs">
                             <FileCode size={14} />
                             <span>coverage-config.xml</span>
                        </div>
                        <button 
                           onClick={() => {
                               navigator.clipboard.writeText(labCode);
                               setCopied(true);
                               setTimeout(() => setCopied(false), 2000);
                           }}
                           className="text-[10px] text-stone-500 uppercase tracking-widest font-bold hover:text-stone-300 transition-colors flex items-center gap-1"
                        >
                           {copied ? <CheckCircle size={10} /> : <Copy size={10} />} {copied ? 'Copied' : 'Copy'}
                        </button>
                     </div>
                     
                     <div className="flex-1 flex overflow-hidden relative">
                         {/* Line Numbers */}
                         <div className="w-12 bg-[#1e1e1e] text-stone-600 text-right pr-3 pt-4 font-mono text-sm select-none border-r border-white/5">
                             <pre>{getLineNumbers()}</pre>
                         </div>
                         
                         <textarea 
                            ref={textareaRef}
                            value={labCode}
                            onChange={(e) => setLabCode(e.target.value)}
                            spellCheck={false}
                            className="flex-1 w-full bg-[#1e1e1e] text-stone-300 font-mono text-sm p-4 resize-none focus:outline-none leading-relaxed"
                            placeholder="<!-- Enter your configuration XML here -->"
                         />
                     </div>
                 </div>
             </div>
         )}

      </div>
    </div>
  );
};
