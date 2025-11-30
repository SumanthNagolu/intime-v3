'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, Search, MapPin, DollarSign, Briefcase, CheckCircle, ExternalLink, ArrowRight, Database } from 'lucide-react';

export const JobHuntRoom: React.FC = () => {
  const { candidateId } = useParams();
  const router = useRouter();
  const { bench, jobs } = useAppStore();
  const consultant = bench.find(c => c.id === candidateId);
  const [searchTerm, setSearchTerm] = useState('');

  if (!consultant) return <div>Consultant not found</div>;

  // Filter "Market" jobs that are relevant to this consultant
  // In a real app, this would be a more sophisticated query to the Central DB
  const relevantJobs = jobs.filter(j =>
      (j.ownerId === 'market') &&
      (j.title.includes(consultant.role.split(' ')[0]) || consultant.skills.some(s => j.title.includes(s)))
  );

  // Calculate mock match score
  const scoredJobs = relevantJobs.map(j => ({
      ...j,
      matchScore: 85 + Math.floor(Math.random() * 14) // Random 85-99 for demo
  })).sort((a, b) => b.matchScore - a.matchScore);

  const filteredJobs = scoredJobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.client.toLowerCase().includes(searchTerm.toLowerCase()));

  const handleStartSubmission = (jobId: string) => {
      router.push(`/employee/recruiting/submit/${consultant.id}/${jobId}`);
  };

  return (
    <div className="animate-fade-in pt-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4 shrink-0">
          <div className="flex items-center gap-4">
              <Link href={`/employee/bench/talent/${consultant.id}`} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-charcoal">
                  <ChevronLeft size={20} />
              </Link>
              <div>
                  <h1 className="text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
                      Job Hunt Room
                      <span className="text-sm font-sans font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Candidate: {consultant.name}</span>
                  </h1>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                      Filtered view of Central Market Board
                  </p>
              </div>
          </div>
          <Link href="/employee/bench/collector" className="flex items-center gap-2 text-xs font-bold text-rust hover:underline">
              <Database size={14} /> View Full Market Board
          </Link>
      </div>

      <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* Left: Candidate Context */}
          <div className="w-80 bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden flex flex-col shrink-0">
              <div className="p-6 bg-stone-50 border-b border-stone-100">
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Search Parameters</div>
                  <div className="flex flex-wrap gap-2 mb-4">
                      {consultant.skills.slice(0,5).map(s => (
                          <span key={s} className="px-2 py-1 bg-white border border-stone-200 rounded text-[10px] font-bold text-charcoal">{s}</span>
                      ))}
                  </div>
                  <div className="text-sm text-stone-600">
                      <div className="flex items-center gap-2 mb-1"><MapPin size={14}/> {consultant.location}</div>
                      <div className="flex items-center gap-2"><DollarSign size={14}/> {consultant.rate}+</div>
                  </div>
              </div>
              <div className="flex-1 p-6 overflow-y-auto">
                  <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">AI Matching Criteria</h4>
                  <div className="space-y-2">
                      {['PolicyCenter Configuration', 'Gosu', 'InsuranceSuite', 'PC 10', 'REST API'].map(k => (
                          <div key={k} className="flex items-center gap-2 text-sm text-stone-600">
                              <CheckCircle size={14} className="text-green-500" /> {k}
                          </div>
                      ))}
                  </div>
              </div>
          </div>

          {/* Right: Job Feed */}
          <div className="flex-1 flex flex-col bg-stone-50 rounded-[2rem] border border-stone-200 overflow-hidden">
              <div className="p-6 bg-white border-b border-stone-200 flex gap-4 items-center">
                  <Search size={20} className="text-stone-400" />
                  <input 
                    type="text" 
                    placeholder="Refine search..." 
                    className="flex-1 outline-none text-charcoal font-medium"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                  />
              </div>
              
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                  {filteredJobs.map(job => (
                      <div key={job.id} className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-md transition-all group">
                          <div className="flex justify-between items-start">
                              <div>
                                  <div className="flex items-center gap-2 mb-1">
                                      <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded ${
                                          job.ownerId === 'market' ? 'bg-blue-50 text-blue-600' : 'bg-rust/10 text-rust'
                                      }`}>
                                          {job.ownerId === 'market' ? 'External' : 'Internal'}
                                      </span>
                                      <span className="text-xs text-stone-400 font-bold">{job.client}</span>
                                  </div>
                                  <h3 className="text-lg font-bold text-charcoal group-hover:text-rust transition-colors">{job.title}</h3>
                              </div>
                              <div className="text-right">
                                  <div className="text-green-600 font-bold text-lg">{job.matchScore}%</div>
                                  <div className="text-[10px] text-stone-400 uppercase tracking-widest">Match</div>
                              </div>
                          </div>

                          <div className="flex gap-4 text-xs text-stone-500 my-4">
                              <span className="flex items-center gap-1"><MapPin size={12}/> {job.location}</span>
                              <span className="flex items-center gap-1"><DollarSign size={12}/> {job.rate}</span>
                              <span className="flex items-center gap-1"><Briefcase size={12}/> {job.type}</span>
                          </div>

                          <div className="flex justify-end gap-3 pt-4 border-t border-stone-100">
                              {job.ownerId === 'market' && (
                                  <button className="px-4 py-2 text-stone-500 hover:text-charcoal text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                                      View Source <ExternalLink size={12} />
                                  </button>
                              )}
                              <button 
                                onClick={() => handleStartSubmission(job.id)}
                                className="px-6 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2 shadow-md"
                              >
                                  Prep Submission <ArrowRight size={14} />
                              </button>
                          </div>
                      </div>
                  ))}
                  
                  {filteredJobs.length === 0 && (
                      <div className="text-center py-12 text-stone-400">
                          <p>No matching jobs found in the Market Board.</p>
                      </div>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
};
