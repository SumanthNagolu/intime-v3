'use client';

import React, { useState, useEffect, useRef } from 'react';
import { INTERVIEW_SCRIPT } from '@/lib/academy/constants';
import { Mic, Play, Pause, RefreshCcw, User, Award, Volume2, Circle } from 'lucide-react';

export default function InterviewStudio() {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentLineIndex, setCurrentLineIndex] = useState(0);
  const [progress, setProgress] = useState(0);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let interval: any;
    if (isPlaying) {
        if (currentLineIndex >= INTERVIEW_SCRIPT.length) {
            setIsPlaying(false);
            return;
        }

        const line = INTERVIEW_SCRIPT[currentLineIndex];
        // progress bar for current line
        const step = 100 / (line.duration / 50); // update every 50ms
        
        interval = setInterval(() => {
            setProgress(p => {
                if (p >= 100) {
                    setCurrentLineIndex(prev => prev + 1);
                    // Scroll logic
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
  }, [isPlaying, currentLineIndex]);

  const reset = () => {
      setIsPlaying(false);
      setCurrentLineIndex(0);
      setProgress(0);
  };

  return (
    <div className="animate-fade-in pt-4 h-[calc(100vh-120px)] flex flex-col">
      <div className="mb-8 flex justify-between items-end">
        <div>
            <div className="flex items-center gap-2 mb-2">
               <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${isPlaying ? 'bg-red-500/10 text-red-500' : 'bg-stone-100 text-stone-400'}`}>
                  <Circle size={8} className={isPlaying ? "fill-red-500 animate-pulse" : "fill-stone-400"} />
                  {isPlaying ? "Live Simulation" : "Standby"}
               </div>
            </div>
            <h1 className="text-4xl font-serif font-bold text-charcoal mb-2 italic">Interview Shadowing</h1>
            <p className="text-stone-500 max-w-2xl text-sm leading-relaxed">
                Internalize the cadence, vocabulary, and confidence of a Senior Developer. 
                <span className="text-charcoal font-semibold"> Read the highlighted lines aloud in real-time.</span>
            </p>
        </div>
        <div className="flex gap-4">
            <button 
                onClick={() => setIsPlaying(!isPlaying)} 
                className={`flex items-center gap-3 px-8 py-4 rounded-full text-sm font-bold uppercase tracking-wider transition-all shadow-xl ${
                    isPlaying 
                    ? 'bg-white text-charcoal border border-stone-200 hover:bg-stone-50' 
                    : 'bg-rust text-white hover:bg-[#B8421E] shadow-rust/30'
                }`}
            >
                {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                {isPlaying ? 'Pause' : 'Start Simulation'}
            </button>
            <button onClick={reset} className="w-14 h-14 flex items-center justify-center rounded-full border border-stone-200 hover:bg-stone-50 text-stone-400 hover:text-charcoal transition-colors">
                <RefreshCcw size={20} />
            </button>
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
          
          {/* The Script (Teleprompter) */}
          <div className="flex-1 bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200/50 border border-stone-200 relative overflow-hidden flex flex-col bg-noise">
             {/* Gradients for focus */}
             <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
             <div className="absolute bottom-0 left-0 right-0 h-40 bg-gradient-to-t from-white via-white/90 to-transparent z-10 pointer-events-none"></div>
             
             <div className="flex-1 overflow-y-auto p-16 space-y-12 scroll-smooth no-scrollbar" ref={scrollRef}>
                 {INTERVIEW_SCRIPT.map((line, idx) => {
                     const isActive = idx === currentLineIndex;
                     const isPast = idx < currentLineIndex;
                     const isSenior = line.speaker === 'SeniorDev';

                     return (
                         <div 
                            id={`line-${idx}`}
                            key={idx} 
                            className={`transition-all duration-700 ease-out ${
                                isActive ? 'scale-105 opacity-100 translate-x-4' : 
                                isPast ? 'opacity-20 blur-[2px] grayscale' : 
                                'opacity-30 grayscale'
                            }`}
                         >
                             <div className="flex items-center gap-3 mb-3">
                                 {isSenior ? (
                                     <div className={`flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest px-3 py-1 rounded-full border ${isActive ? 'bg-rust/10 border-rust/20 text-rust' : 'bg-stone-50 border-stone-100 text-stone-300'}`}>
                                         <Award size={12} /> You (Senior Dev)
                                     </div>
                                 ) : (
                                     <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-300 bg-stone-50 px-3 py-1 rounded-full border border-stone-100">
                                         <User size={12} /> Interviewer
                                     </div>
                                 )}
                             </div>
                             
                             <p className={`font-serif text-4xl leading-tight max-w-3xl ${isActive && isSenior ? 'text-charcoal font-semibold' : isActive ? 'text-stone-600 italic' : 'text-stone-400'}`}>
                                 "{line.text}"
                             </p>

                             {isActive && (
                                 <div className="mt-6 h-1.5 w-full max-w-xl bg-stone-100 rounded-full overflow-hidden">
                                     <div className="h-full bg-rust transition-all duration-75 ease-linear shadow-[0_0_10px_rgba(234,88,12,0.5)]" style={{ width: `${progress}%` }}></div>
                                 </div>
                             )}
                         </div>
                     );
                 })}
                 
                 {/* Spacer for bottom scroll */}
                 <div className="h-[50vh]"></div>
             </div>
          </div>

          {/* Controls / Feedback */}
          <div className="w-80 shrink-0 flex flex-col gap-6">
              <div className="bg-charcoal text-white p-8 rounded-3xl shadow-xl bg-noise relative overflow-hidden">
                  <div className="absolute -top-10 -right-10 w-40 h-40 bg-rust/20 rounded-full blur-3xl"></div>
                  
                  <h3 className="font-serif text-xl font-bold mb-8 relative z-10 italic">Real-time Analysis</h3>
                  <div className="space-y-8 relative z-10">
                      <div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-2">Pacing (WPM)</div>
                          <div className="flex items-end gap-3">
                              <span className="text-5xl font-serif text-forest leading-none">140</span>
                              <span className="text-xs text-stone-400 mb-1 font-medium bg-stone-800 px-2 py-0.5 rounded">Optimal</span>
                          </div>
                      </div>
                      <div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-widest mb-2">Tone Confidence</div>
                          <div className="flex items-center gap-3 text-rust">
                              <Volume2 size={24} />
                              <span className="font-bold text-lg">High</span>
                          </div>
                          <div className="w-full h-1 bg-stone-800 rounded-full mt-2 overflow-hidden">
                              <div className="w-[85%] h-full bg-rust rounded-full"></div>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-blue-50 p-8 rounded-3xl border border-blue-100 flex-1 shadow-inner">
                  <h3 className="font-serif text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      Coach's Note
                  </h3>
                  <p className="text-blue-800 italic text-sm leading-relaxed font-serif">
                      "Notice how the senior developer pivots from the technical detail (JSON vs XML) to the business value (200ms latency reduction). Always tie your code to money or time."
                  </p>
              </div>
          </div>
      </div>
    </div>
  );
};