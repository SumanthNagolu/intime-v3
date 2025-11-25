'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ChevronLeft, Database, ArrowRight, Cpu, CheckCircle, Loader2, Briefcase, User, Zap, Plus, ExternalLink, Search, Filter } from 'lucide-react';
import { useAppStore } from '../../lib/store';
import { Job } from '../../types';

export const JobCollector: React.FC = () => {
  const router = useRouter();
  const { bench, jobs, addJob } = useAppStore();
  const [rawText, setRawText] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  
  // This view focuses on "External" or "Market" jobs.
  // We filter jobs where the owner is 'market' or source is external to simulate the "Central DB"
  const marketJobs = jobs.filter(j => j.ownerId === 'market');

  // Stats
  const jobsToday = marketJobs.length; // Mock stats
  const unmatchedJobs = marketJobs.length - 1; // Mock stats

  const handleProcess = () => {
      if (!rawText) return;
      setIsProcessing(true);
      
      // Mock AI Extraction from text
      setTimeout(() => {
          const newJob: Job = {
              id: `ext-${Date.now()}`,
              title: 'Extracted Guidewire Role',
              client: 'Parsed Client Inc.',
              location: 'Remote',
              rate: 'Market',
              status: 'open',
              type: 'Contract',
              ownerId: 'market',
              accountId: 'ext',
              description: rawText
          };
          addJob(newJob);
          setRawText('');
          setIsProcessing(false);
      }, 1500);
  };

  const handleApply = (jobId: string, candidateId: string) => {
      router.push(`/employee/recruiting/submit/${candidateId}/${jobId}`);
  };

  // Simple Match Logic
  const getBestMatch = (job: Job) => {
      // Find bench consultant with matching skills in title
      const match = bench.find(c => job.title.includes(c.role.split(' ')[0]) || job.description?.includes(c.skills[0]));
      return match || null; // Return null if no strong match
  };

  return (
    <div className="animate-fade-in pt-4 max-w-6xl mx-auto h-[calc(100vh-140px)] flex flex-col">
        {/* Header */}
        <div className="mb-8 flex flex-col md:flex-row justify-between items-end border-b border-stone-200 pb-6 shrink-0 gap-6">
            <div className="flex items-center gap-4">
                <Link href="/employee/bench/dashboard" className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-charcoal">
                    <ChevronLeft size={20} />
                </Link>
                <div>
                    <h1 className="text-2xl font-serif font-bold text-charcoal">Bench Job Board</h1>
                    <p className="text-xs text-stone-500 font-medium uppercase tracking-wide mt-1">
                        Market / External Portal Postings
                    </p>
                </div>
            </div>
            
            <div className="flex gap-4">
                <div className="bg-white border border-stone-200 px-4 py-2 rounded-xl shadow-sm text-center">
                    <div className="text-xl font-bold text-charcoal">{jobsToday}</div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Jobs Active</div>
                </div>
                <div className="bg-white border border-stone-200 px-4 py-2 rounded-xl shadow-sm text-center">
                    <div className="text-xl font-bold text-rust">{unmatchedJobs}</div>
                    <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">Unmatched</div>
                </div>
            </div>
        </div>

        {/* Main UI */}
        <div className="flex-1 flex flex-col lg:flex-row gap-8 overflow-hidden">
            
            {/* Quick Add / Parser */}
            <div className="w-full lg:w-1/3 flex flex-col shrink-0">
                <div className="bg-white rounded-[2rem] border border-stone-200 shadow-lg flex-1 flex flex-col overflow-hidden">
                    <div className="p-6 border-b border-stone-100 bg-stone-50">
                        <h3 className="font-serif text-lg font-bold text-charcoal mb-1">Quick Add</h3>
                        <p className="text-xs text-stone-500">Paste job description, email content, or URL from portals.</p>
                    </div>
                    <textarea 
                        className="flex-1 p-6 bg-white resize-none focus:outline-none text-sm leading-relaxed font-mono text-charcoal placeholder-stone-300"
                        placeholder="Paste raw job data here..."
                        value={rawText}
                        onChange={(e) => setRawText(e.target.value)}
                    />
                    <div className="p-4 border-t border-stone-100 bg-stone-50">
                        <button 
                            onClick={handleProcess}
                            disabled={isProcessing || !rawText}
                            className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isProcessing ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            {isProcessing ? 'Parsing...' : 'Add to Bench Board'}
                        </button>
                    </div>
                </div>
            </div>

            {/* The Feed (Central DB) */}
            <div className="flex-1 flex flex-col bg-stone-50 rounded-[2rem] border border-stone-200 overflow-hidden relative">
                <div className="p-4 bg-white border-b border-stone-200 flex justify-between items-center">
                    <div className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest">
                        <Database size={14} /> Market Feed
                    </div>
                    <div className="flex gap-2">
                        <button className="p-2 hover:bg-stone-100 rounded-full text-stone-400"><Search size={16}/></button>
                        <button className="p-2 hover:bg-stone-100 rounded-full text-stone-400"><Filter size={16}/></button>
                    </div>
                </div>

                <div className="flex-1 overflow-y-auto p-6 space-y-4">
                    {marketJobs.length > 0 ? marketJobs.map(job => {
                        const match = getBestMatch(job);
                        
                        return (
                            <div key={job.id} className="bg-white p-5 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all group relative">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <div className="flex items-center gap-2 mb-1">
                                            <span className="text-[10px] font-bold uppercase tracking-widest bg-blue-50 text-blue-600 px-2 py-0.5 rounded">
                                                Market / Portal
                                            </span>
                                            <span className="text-[10px] text-stone-300 uppercase tracking-widest">
                                                {job.client}
                                            </span>
                                        </div>
                                        <h3 className="font-bold text-charcoal text-base">{job.title}</h3>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-charcoal">{job.rate}</div>
                                        <div className="text-xs text-stone-400">{job.location}</div>
                                    </div>
                                </div>

                                {/* Bench Match Section */}
                                <div className="pt-3 border-t border-stone-100">
                                    {match ? (
                                        <div className="flex items-center justify-between bg-green-50 p-3 rounded-xl border border-green-100">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-green-600 text-white rounded-full flex items-center justify-center font-serif font-bold text-xs">
                                                    {match.name.charAt(0)}
                                                </div>
                                                <div>
                                                    <div className="text-[10px] font-bold text-green-800 uppercase tracking-wide">Best Bench Fit</div>
                                                    <div className="text-xs font-bold text-green-700">{match.name}</div>
                                                </div>
                                            </div>
                                            <button 
                                                onClick={() => handleApply(job.id, match.id)}
                                                className="bg-white border border-green-200 px-4 py-2 rounded-lg text-green-700 hover:bg-green-600 hover:text-white shadow-sm text-xs font-bold transition-all flex items-center gap-2"
                                            >
                                                Prep Submission <ArrowRight size={12} />
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-between p-2">
                                            <span className="text-xs text-stone-400 italic flex items-center gap-1">
                                                <User size={12} /> No direct bench match found.
                                            </span>
                                            <button className="text-xs font-bold text-stone-400 hover:text-charcoal uppercase tracking-widest">
                                                Manual Assign
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    }) : (
                        <div className="text-center py-12 text-stone-400">
                            <Database size={48} className="mx-auto mb-4 opacity-20" />
                            <p>No market jobs collected yet.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    </div>
  );
};
