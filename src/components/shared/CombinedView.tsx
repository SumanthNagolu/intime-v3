'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Search, Zap, AlertTriangle, Send, ArrowRight, Globe } from 'lucide-react';

export const CombinedView: React.FC = () => {
  const { jobs, bench, candidates } = useAppStore();
  const [selectedJobId, setSelectedJobId] = useState<string | null>(jobs[0]?.id || null);

  const selectedJob = jobs.find(j => j.id === selectedJobId);
  
  // Simple matching logic for demo (in real app this is AI powered)
  const matchingTalent = [...bench, ...candidates].map(talent => {
      let score = 75; // Base score
      if (talent.role.includes(selectedJob?.title.split(' ')[0] || '')) score += 15;
      if (talent.skills.some(s => selectedJob?.title.includes(s))) score += 10;
      return { ...talent, matchScore: Math.min(99, score) };
  }).sort((a, b) => b.matchScore - a.matchScore).slice(0, 3);

  return (
    <div className="animate-fade-in pt-4 h-[calc(100vh-140px)] flex flex-col">
      <div className="mb-8 flex justify-between items-end border-b border-stone-200 pb-6 shrink-0">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Cross-Pollination Engine</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Combined Intelligence</h1>
        </div>
        <div className="flex items-center gap-2 bg-purple-50 text-purple-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-purple-100">
            <Zap size={14} className="fill-purple-700" /> AI Matching Active
        </div>
      </div>

      <div className="flex-1 flex gap-8 overflow-hidden">
          
          {/* Left Panel: Jobs List */}
          <div className="w-1/3 flex flex-col bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden">
              <div className="p-6 border-b border-stone-100 bg-stone-50">
                  <div className="relative">
                      <Search size={18} className="absolute left-4 top-3.5 text-stone-400" />
                      <input 
                        type="text" 
                        placeholder="Filter all jobs (Direct + Market)..." 
                        className="w-full pl-12 pr-4 py-3 rounded-xl border border-stone-200 focus:outline-none focus:border-rust bg-white text-sm font-medium"
                      />
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-4 space-y-3">
                  {jobs.map(job => {
                      const isMarket = job.ownerId === 'market';
                      return (
                          <div 
                            key={job.id} 
                            onClick={() => setSelectedJobId(job.id)}
                            className={`p-6 rounded-2xl border cursor-pointer transition-all group ${
                                selectedJobId === job.id 
                                ? 'bg-charcoal text-white border-charcoal shadow-lg' 
                                : 'bg-white border-stone-100 hover:border-rust/50 hover:bg-stone-50'
                            }`}
                          >
                              <div className="flex justify-between items-start mb-2">
                                  <div className="flex items-center gap-2">
                                      {isMarket ? (
                                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${selectedJobId === job.id ? 'bg-white/20 text-white' : 'bg-blue-50 text-blue-600'}`}>Market</span>
                                      ) : (
                                          <span className={`text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${selectedJobId === job.id ? 'bg-rust text-white' : 'bg-rust/10 text-rust'}`}>Direct</span>
                                      )}
                                      <span className={`text-xs font-bold uppercase tracking-widest ${selectedJobId === job.id ? 'text-stone-400' : 'text-stone-400'}`}>{job.client}</span>
                                  </div>
                                  {selectedJobId === job.id && <div className="w-2 h-2 bg-rust rounded-full animate-pulse"></div>}
                              </div>
                              <h3 className={`font-serif font-bold text-lg mb-4 ${selectedJobId === job.id ? 'text-white' : 'text-charcoal'}`}>{job.title}</h3>
                              <div className="flex items-center gap-3 text-xs font-medium opacity-70">
                                  <span>{job.location}</span>
                                  <span>•</span>
                                  <span>{job.rate}</span>
                              </div>
                          </div>
                      )
                  })}
              </div>
          </div>

          {/* Center: Connector */}
          <div className="flex flex-col justify-center items-center text-stone-300">
              <div className="h-full w-px bg-stone-200 my-4 relative">
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-white border border-stone-200 p-2 rounded-full shadow-sm z-10">
                      <ArrowRight size={20} className="text-rust" />
                  </div>
              </div>
          </div>

          {/* Right Panel: Matching Talent */}
          <div className="flex-1 flex flex-col bg-stone-50 rounded-[2.5rem] border border-stone-200 overflow-hidden relative">
              <div className="absolute inset-0 bg-noise opacity-5 pointer-events-none"></div>
              
              <div className="p-8 border-b border-stone-200 flex justify-between items-center bg-white">
                  <h2 className="font-serif text-2xl font-bold text-charcoal">
                      Top Matches for <span className="text-rust border-b-2 border-rust/20">{selectedJob?.title}</span>
                  </h2>
                  <span className="bg-green-50 text-green-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest border border-green-100">
                      {matchingTalent.length} Strong Matches
                  </span>
              </div>

              <div className="flex-1 overflow-y-auto p-8 space-y-6">
                  {selectedJob?.ownerId === 'market' && (
                      <div className="p-4 bg-blue-50 border border-blue-100 rounded-xl flex items-center gap-3 mb-4">
                          <Globe size={20} className="text-blue-600" />
                          <div className="text-sm text-blue-800">
                              <strong>Market Source:</strong> This is an external job. Matches should be vetted for interest before submission.
                          </div>
                      </div>
                  )}

                  {matchingTalent.map(talent => (
                      <div key={talent.id} className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-200 hover:shadow-xl hover:border-rust/30 transition-all group relative overflow-hidden">
                          <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-rust/10 to-transparent -mr-6 -mt-6 rounded-full group-hover:scale-110 transition-transform"></div>
                          
                          <div className="flex gap-6 relative z-10">
                              <div className="w-16 h-16 rounded-full bg-stone-100 flex items-center justify-center text-2xl font-serif font-bold text-charcoal border-4 border-white shadow-md">
                                  {talent.name.charAt(0)}
                              </div>
                              <div className="flex-1">
                                  <div className="flex justify-between items-start mb-2">
                                      <h3 className="text-xl font-bold text-charcoal">{talent.name}</h3>
                                      <div className="flex items-center gap-1 text-green-600 font-bold text-lg">
                                          {talent.matchScore}% <span className="text-[10px] uppercase text-stone-400 font-normal mt-1">Match</span>
                                      </div>
                                  </div>
                                  <p className="text-stone-500 text-sm mb-4">{talent.role} • {talent.experience} Exp</p>
                                  
                                  <div className="flex flex-wrap gap-2 mb-6">
                                      {talent.skills.map(s => (
                                          <span key={s} className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wide border ${
                                              selectedJob?.title.includes(s) 
                                              ? 'bg-green-50 text-green-700 border-green-100' 
                                              : 'bg-stone-50 text-stone-500 border-stone-100'
                                          }`}>
                                              {s}
                                          </span>
                                      ))}
                                  </div>

                                  <div className="flex gap-3">
                                      <button className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center justify-center gap-2">
                                          Submit to Client <Send size={14} />
                                      </button>
                                      <button className="px-6 py-3 bg-white border border-stone-200 text-stone-600 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-charcoal hover:text-charcoal transition-colors">
                                          View Profile
                                      </button>
                                  </div>
                              </div>
                          </div>
                      </div>
                  ))}

                  <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 flex items-start gap-4">
                      <AlertTriangle size={20} className="text-blue-600 shrink-0 mt-1" />
                      <div>
                          <h4 className="font-bold text-blue-900 text-sm mb-1">Pipeline Gap Detected</h4>
                          <p className="text-blue-800 text-xs leading-relaxed mb-3">
                              We have 2 other jobs similar to this but no exact matches in the bench.
                              Recommendation: Trigger a TA campaign for &quot;Senior PolicyCenter Developers&quot;.
                          </p>
                          <button className="text-xs font-bold text-blue-700 underline hover:text-blue-900">Launch Campaign</button>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
