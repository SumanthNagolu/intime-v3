'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, CheckCircle, XCircle, Zap, Briefcase, User, Search, Globe, Linkedin, ArrowRight } from 'lucide-react';

export const SourcingRoom: React.FC = () => {
  const { candidateId, jobId } = useParams();
  const router = useRouter();
  const { candidates, jobs, submissions, updateSubmission } = useAppStore();
  const candidate = candidates.find(c => c.id === candidateId);
  const job = jobs.find(j => j.id === jobId);
  const submission = submissions.find(s => s.candidateId === candidateId && s.jobId === jobId);
  
  const [activeTab, setActiveTab] = useState<'Evaluation' | 'Research'>('Evaluation');
  const [notes, setNotes] = useState('');
  const [decision, setDecision] = useState<'pending' | 'shortlist' | 'reject'>('pending');

  if (!candidate || !job || !submission) return <div>Not found</div>;

  // Mock Basic Qualifications logic
  const qualifications = [
      { text: 'Location Match', met: candidate.location.includes('Remote') || candidate.location === job.location },
      { text: 'Rate within Budget', met: true },
      { text: 'Experience Level', met: true },
      { text: 'Visa Status', met: candidate.type !== 'internal_bench' || (candidate as any).visaStatus === 'H-1B' },
  ];

  const handleShortlistToScreening = () => {
      setDecision('shortlist');
      // Update status to 'screening' to move them to the next tab in JobDetail
      updateSubmission({ ...submission, status: 'screening', lastActivity: 'Sourcing Cleared' });
      
      setTimeout(() => {
          navigate(`/employee/recruiting/jobs/${jobId}`);
      }, 800);
  };

  const handleReject = () => {
      setDecision('reject');
      updateSubmission({ ...submission, status: 'rejected', lastActivity: 'Rejected at Sourcing' });
      setTimeout(() => {
          navigate(`/employee/recruiting/jobs/${jobId}`);
      }, 800);
  };

  return (
    <div className="animate-fade-in pt-4 h-[calc(100vh-140px)] flex flex-col">
      {/* Header */}
      <div className="mb-6 flex justify-between items-center border-b border-stone-200 pb-4 shrink-0">
          <div className="flex items-center gap-4">
              <Link href={`/employee/recruiting/jobs/${jobId}`} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-charcoal">
                  <ChevronLeft size={20} />
              </Link>
              <div>
                  <h1 className="text-2xl font-serif font-bold text-charcoal flex items-center gap-2">
                      Sourcing Room
                      <span className="text-sm font-sans font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Initial Validation</span>
                  </h1>
                  <p className="text-xs text-stone-500 font-medium uppercase tracking-wide">
                      {candidate.name} <span className="mx-2 text-stone-300">|</span> {job.title}
                  </p>
              </div>
          </div>
          
          <div className="flex gap-3">
              <button 
                onClick={handleReject}
                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors border flex items-center gap-2 ${decision === 'reject' ? 'bg-red-600 text-white border-red-600' : 'border-stone-200 text-stone-500 hover:border-red-400 hover:text-red-500'}`}
              >
                  <XCircle size={16} /> Reject
              </button>
              <button 
                onClick={handleShortlistToScreening}
                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg ${decision === 'shortlist' ? 'bg-green-600 text-white' : 'bg-charcoal text-white hover:bg-rust'}`}
              >
                  <CheckCircle size={16} /> Move to Screening
              </button>
          </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex gap-6 overflow-hidden">
          
          {/* Left: Resume View */}
          <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      <User size={14} /> Candidate Profile
                  </div>
                  <div className="flex gap-2">
                      <span className="text-xs bg-stone-200 px-2 py-1 rounded text-stone-600">{candidate.source}</span>
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                  <div className="prose prose-stone max-w-none">
                      <div className="mb-6 p-4 bg-stone-50 rounded-xl border border-stone-100">
                          <h3 className="text-lg font-bold text-charcoal m-0 mb-1">{candidate.name}</h3>
                          <p className="text-sm text-stone-500 m-0">{candidate.location} • {candidate.experience} Exp • {candidate.rate}</p>
                      </div>
                      
                      <h3>Summary</h3>
                      <p>{candidate.notes || "Experienced developer with strong background in enterprise systems..."}</p>
                      
                      <h3>Skills</h3>
                      <div className="flex flex-wrap gap-2 not-prose">
                          {candidate.skills.map(s => (
                              <span key={s} className="px-2 py-1 bg-stone-100 rounded text-xs font-bold text-stone-600">{s}</span>
                          ))}
                      </div>

                      <h3>Work History</h3>
                      <p className="italic text-stone-400 text-sm">[Resume Parsing Preview]</p>
                      <ul>
                          <li><strong>Senior Developer</strong> - TechFlow (2021-Present)</li>
                          <li><strong>Java Developer</strong> - Global Systems (2018-2021)</li>
                      </ul>
                  </div>
              </div>
          </div>

          {/* Right: Sourcing Playground */}
          <div className="w-96 bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden flex flex-col">
              
              {/* Playground Tabs */}
              <div className="flex border-b border-stone-100">
                  <button 
                    onClick={() => setActiveTab('Evaluation')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'Evaluation' ? 'bg-stone-50 text-charcoal border-b-2 border-rust' : 'text-stone-400 hover:text-charcoal'}`}
                  >
                      Evaluation
                  </button>
                  <button 
                    onClick={() => setActiveTab('Research')}
                    className={`flex-1 py-3 text-xs font-bold uppercase tracking-widest ${activeTab === 'Research' ? 'bg-stone-50 text-charcoal border-b-2 border-rust' : 'text-stone-400 hover:text-charcoal'}`}
                  >
                      Research
                  </button>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {activeTab === 'Evaluation' && (
                      <>
                          {/* AI Match Insight */}
                          <div className="p-4 bg-purple-50 rounded-xl border border-purple-100">
                              <div className="flex items-center gap-2 text-purple-800 font-bold text-xs uppercase tracking-widest mb-2">
                                  <Zap size={14} /> Quick Match: {candidate.score}%
                              </div>
                              <p className="text-xs text-purple-700 leading-relaxed">
                                  Resume keywords highly correlate with job description. Location and rate are within acceptable range.
                              </p>
                          </div>

                          {/* Basic Quals */}
                          <div>
                              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                                  <Briefcase size={12} /> Basic Qualifications
                              </h4>
                              <div className="space-y-2">
                                  {qualifications.map((q, i) => (
                                      <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-stone-50 border border-stone-100">
                                          <span className="text-sm font-medium text-charcoal">{q.text}</span>
                                          {q.met ? <CheckCircle size={16} className="text-green-500" /> : <XCircle size={16} className="text-red-400" />}
                                      </div>
                                  ))}
                              </div>
                          </div>

                          {/* Sourcing Notes */}
                          <div>
                              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Sourcing Notes</h4>
                              <textarea 
                                className="w-full h-32 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                                placeholder="Why is this candidate a good fit?"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                              />
                          </div>
                      </>
                  )}

                  {activeTab === 'Research' && (
                      <div className="space-y-4">
                          <p className="text-xs text-stone-500 mb-4">Quick links to verify candidate presence.</p>
                          
                          <button className="w-full flex items-center justify-between p-4 bg-blue-50 border border-blue-100 rounded-xl hover:bg-blue-100 transition-colors group">
                              <div className="flex items-center gap-3">
                                  <Linkedin size={18} className="text-blue-700" />
                                  <span className="text-sm font-bold text-blue-900">LinkedIn Profile</span>
                              </div>
                              <ArrowRight size={14} className="text-blue-400 group-hover:text-blue-700" />
                          </button>

                          <button className="w-full flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors group">
                              <div className="flex items-center gap-3">
                                  <Globe size={18} className="text-stone-500" />
                                  <span className="text-sm font-bold text-charcoal">Google Search</span>
                              </div>
                              <ArrowRight size={14} className="text-stone-300 group-hover:text-charcoal" />
                          </button>

                          <button className="w-full flex items-center justify-between p-4 bg-stone-50 border border-stone-200 rounded-xl hover:bg-stone-100 transition-colors group">
                              <div className="flex items-center gap-3">
                                  <Search size={18} className="text-stone-500" />
                                  <span className="text-sm font-bold text-charcoal">Check Internal DB</span>
                              </div>
                              <span className="text-xs font-bold text-stone-400 group-hover:text-rust">No duplicates</span>
                          </button>
                      </div>
                  )}

              </div>
          </div>
      </div>
    </div>
  );
};
