'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, MapPin, DollarSign, Clock, Calendar, ArrowRight, MoreHorizontal, Search, Plus, Briefcase, FileText, List, Square, CheckSquare, UserPlus, MessageSquare, CheckCircle, XCircle, X, Settings } from 'lucide-react';
import { InterviewScheduler } from './InterviewScheduler';
import { Submission } from '../../types';

type Tab = 'Sourcing' | 'Screening' | 'Submission Ready' | 'Submitted' | 'Interview';

export const JobDetail: React.FC = () => {
  const { jobId } = useParams();
  const router = useRouter();
  const { jobs, submissions, accounts, candidates, updateSubmission } = useAppStore();
  const [activeTab, setActiveTab] = useState<Tab>('Sourcing');
  const [isInterviewModalOpen, setIsInterviewModalOpen] = useState(false);
  const [selectedCandidateForInterview, setSelectedCandidateForInterview] = useState<{id: string, name: string} | null>(null);
  
  // Bulk Action State
  const [selectedSubmissionIds, setSelectedSubmissionIds] = useState<string[]>([]);

  const job = jobs.find(j => j.id === jobId);
  const account = accounts.find(a => a.id === job?.accountId);
  
  if (!job) return <div>Job not found</div>;

  // Filter Logic
  const getCandidatesInStage = (stage: string) => {
      if (stage === 'Sourcing') return submissions.filter(s => s.jobId === jobId && s.status === 'sourced'); 
      if (stage === 'Screening') return submissions.filter(s => s.jobId === jobId && s.status === 'screening');
      if (stage === 'Submission Ready') return submissions.filter(s => s.jobId === jobId && s.status === 'submission_ready');
      if (stage === 'Submitted') return submissions.filter(s => s.jobId === jobId && s.status === 'submitted_to_client');
      if (stage === 'Interview') return submissions.filter(s => s.jobId === jobId && (s.status === 'client_interview' || s.status === 'offer'));
      return [];
  };

  const currentList = getCandidatesInStage(activeTab);

  const handleScheduleClick = (candidateId: string, candidateName: string) => {
      setSelectedCandidateForInterview({ id: candidateId, name: candidateName });
      setIsInterviewModalOpen(true);
  };

  // Bulk Action Handlers
  const toggleSelection = (id: string) => {
      if (selectedSubmissionIds.includes(id)) {
          setSelectedSubmissionIds(prev => prev.filter(sid => sid !== id));
      } else {
          setSelectedSubmissionIds(prev => [...prev, id]);
      }
  };

  const toggleSelectAll = () => {
      if (selectedSubmissionIds.length === currentList.length) {
          setSelectedSubmissionIds([]);
      } else {
          setSelectedSubmissionIds(currentList.map(s => s.id));
      }
  };

  const executeBulkAction = () => {
      if (activeTab === 'Sourcing') {
          selectedSubmissionIds.forEach(id => {
              const sub = submissions.find(s => s.id === id);
              if (sub) updateSubmission({ ...sub, status: 'screening', lastActivity: 'Batch Moved to Screening' });
          });
      } else if (activeTab === 'Screening') {
           selectedSubmissionIds.forEach(id => {
              const sub = submissions.find(s => s.id === id);
              if (sub) updateSubmission({ ...sub, status: 'submission_ready', lastActivity: 'Batch Shortlisted' });
          });
      }
      setSelectedSubmissionIds([]);
  };

  return (
    <div className="animate-fade-in pt-4 relative">
      
      <InterviewScheduler 
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        candidateName={selectedCandidateForInterview?.name || 'Candidate'}
        jobTitle={job.title}
      />

      <Link href="/employee/recruiting/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      {/* Job Header Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-200 relative overflow-hidden mb-8">
        <div className="absolute top-0 left-0 w-full h-2 bg-rust"></div>
        <div className="flex justify-between items-start">
            <div>
                <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{account?.name}</div>
                <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">{job.title}</h1>
                <div className="flex gap-6 text-sm text-stone-600">
                    <span className="flex items-center gap-2"><MapPin size={16} className="text-rust"/> {job.location}</span>
                    <span className="flex items-center gap-2"><DollarSign size={16} className="text-rust"/> {job.rate}</span>
                    <span className="flex items-center gap-2"><Clock size={16} className="text-rust"/> Open for 3 days</span>
                </div>
            </div>
            <div className="text-right">
                <span className={`inline-block px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest mb-4 ${job.status === 'urgent' ? 'bg-red-50 text-red-600 border border-red-100' : 'bg-green-50 text-green-700 border border-green-100'}`}>
                    {job.status}
                </span>
                <div className="flex -space-x-2 justify-end">
                    {[1,2,3].map(i => (
                        <div key={i} className="w-8 h-8 rounded-full bg-stone-200 border-2 border-white"></div>
                    ))}
                </div>
            </div>
        </div>
      </div>

      {/* Pipeline View */}
      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Pipeline Tabs & List */}
          <div className="flex-1">
              <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
                      {['Sourcing', 'Screening', 'Submission Ready', 'Submitted', 'Interview'].map(tab => (
                          <button
                            key={tab}
                            onClick={() => { setActiveTab(tab as Tab); setSelectedSubmissionIds([]); }}
                            className={`px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                                activeTab === tab 
                                ? 'bg-charcoal text-white shadow-lg' 
                                : 'bg-white text-stone-500 border border-stone-200 hover:border-rust'
                            }`}
                          >
                              {tab}
                              <span className={`ml-2 px-1.5 py-0.5 rounded-full text-[9px] ${activeTab === tab ? 'bg-white/20 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                  {getCandidatesInStage(tab).length}
                              </span>
                          </button>
                      ))}
                  </div>
              </div>

              {/* Bulk Action Bar */}
              {currentList.length > 0 && (
                  <div className="flex items-center justify-between bg-stone-50 px-4 py-2 rounded-xl border border-stone-200 mb-4">
                      <div className="flex items-center gap-3">
                          <button onClick={toggleSelectAll} className="text-stone-400 hover:text-charcoal transition-colors">
                              {selectedSubmissionIds.length === currentList.length && currentList.length > 0 ? <CheckSquare size={20} /> : <Square size={20} />}
                          </button>
                          <span className="text-xs font-bold text-stone-500 uppercase tracking-widest">{selectedSubmissionIds.length} Selected</span>
                      </div>
                      {selectedSubmissionIds.length > 0 && (
                          <div className="flex gap-2">
                              {activeTab === 'Sourcing' && (
                                  <button onClick={executeBulkAction} className="px-4 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white hover:border-rust transition-colors shadow-sm">
                                      Move to Screening
                                  </button>
                              )}
                              {activeTab === 'Screening' && (
                                  <button onClick={executeBulkAction} className="px-4 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-green-600 hover:text-white hover:border-green-600 transition-colors shadow-sm">
                                      Shortlist Selected
                                  </button>
                              )}
                              <button className="px-4 py-1.5 bg-white border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:text-red-600 hover:border-red-200 transition-colors shadow-sm">
                                  Reject
                              </button>
                          </div>
                      )}
                  </div>
              )}

              <div className="space-y-4">
                  {currentList.map((submission) => {
                      const candidate = candidates.find(c => c.id === submission.candidateId);
                      if (!candidate) return null;
                      const isSelected = selectedSubmissionIds.includes(submission.id);

                      return (
                          <div key={submission.id} className={`bg-white p-6 rounded-2xl border shadow-sm hover:shadow-md transition-all group relative ${isSelected ? 'border-rust ring-1 ring-rust' : 'border-stone-200'}`}>
                              <div className="flex justify-between items-start">
                                  <div className="flex items-center gap-4">
                                      <button onClick={() => toggleSelection(submission.id)} className={`text-stone-300 hover:text-charcoal transition-colors ${isSelected ? 'text-rust' : ''}`}>
                                          {isSelected ? <CheckSquare size={20} /> : <Square size={20} />}
                                      </button>
                                      <div className="w-12 h-12 rounded-full bg-stone-100 text-charcoal flex items-center justify-center text-xl font-serif font-bold">
                                          {candidate.name.charAt(0)}
                                      </div>
                                      <div>
                                          <h3 className="font-bold text-charcoal text-lg group-hover:text-rust transition-colors">{candidate.name}</h3>
                                          <div className="flex items-center gap-2 text-xs text-stone-500">
                                              <span>{candidate.role}</span>
                                              <span>•</span>
                                              <span className="text-green-600 font-bold">{candidate.score}% Match</span>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  <div className="flex items-center gap-2">
                                      
                                      {/* Action Buttons based on Stage */}
                                      {activeTab === 'Sourcing' && (
                                          <Link href={`/employee/recruiting/sourcing/${candidate.id}/${job.id}`}
                                            className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-50 hover:text-charcoal transition-colors flex items-center gap-2 hover:border-stone-300 shadow-sm"
                                          >
                                              Source Candidate <UserPlus size={14} />
                                          </Link>
                                      )}

                                      {activeTab === 'Screening' && (
                                          <Link href={`/employee/recruiting/screening/${candidate.id}/${job.id}`} 
                                            className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2 shadow-md"
                                          >
                                              Screen Candidate <Briefcase size={14} />
                                          </Link>
                                      )}

                                      {activeTab === 'Submission Ready' && (
                                          <Link href={`/employee/recruiting/submit/${candidate.id}/${job.id}`}
                                            className="px-4 py-2 bg-rust text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-[#B8421E] transition-colors shadow-md flex items-center gap-2"
                                          >
                                              Submission Room <FileText size={14} />
                                          </Link>
                                      )}

                                      {activeTab === 'Submitted' && (
                                          <Link href={`/employee/recruiting/submit/${candidate.id}/${job.id}`}
                                            className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center gap-2"
                                          >
                                              Manage Submission <Settings size={14} />
                                          </Link>
                                      )}

                                      {activeTab === 'Interview' && (
                                          <>
                                            <button 
                                              onClick={() => handleScheduleClick(candidate.id, candidate.name)}
                                              className="px-4 py-2 bg-white border border-stone-200 text-stone-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center gap-2"
                                            >
                                                <Calendar size={14} /> Schedule
                                            </button>
                                            <Link href={`/employee/recruiting/submit/${candidate.id}/${job.id}`} 
                                              className="px-4 py-2 bg-purple-600 text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-purple-700 transition-colors shadow-md flex items-center gap-2"
                                            >
                                                Manage Status <Settings size={14} />
                                            </Link>
                                          </>
                                      )}
                                      
                                      <Link href={`/employee/recruiting/candidate/${candidate.id}`} className="p-2 text-stone-300 hover:text-charcoal transition-colors">
                                          <MoreHorizontal size={20} />
                                      </Link>
                                  </div>
                              </div>

                              {/* Expanded info based on stage */}
                              <div className="mt-4 pt-4 border-t border-stone-100 flex gap-6 text-xs">
                                  <div className="flex items-center gap-2 text-stone-500">
                                      <Clock size={14} /> Last Activity: {submission.lastActivity}
                                  </div>
                                  <div className="flex items-center gap-2 text-stone-500">
                                      <List size={14} /> Stage: {activeTab}
                                  </div>
                              </div>
                          </div>
                      );
                  })}
                  
                  {currentList.length === 0 && (
                      <div className="text-center py-20 bg-stone-50 rounded-[2rem] border-2 border-dashed border-stone-200 text-stone-400">
                          <Search size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No candidates in this stage.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Sidebar: AI Recommendations */}
          <div className="w-full lg:w-80 shrink-0 space-y-6">
              <div className="bg-purple-50 p-6 rounded-[2rem] border border-purple-100">
                  <h3 className="font-bold text-purple-900 mb-4 text-sm uppercase tracking-widest">AI Recommendations</h3>
                  <p className="text-purple-800 text-xs leading-relaxed mb-4">
                      Based on the "Migration" requirement, I found 3 strong matches in our Bench.
                  </p>
                  <div className="space-y-3">
                      {[1,2,3].map(i => (
                          <div key={i} className="bg-white p-3 rounded-xl shadow-sm flex items-center gap-3 cursor-pointer hover:border-purple-300 border border-transparent transition-all">
                              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center text-xs font-bold text-purple-700">A</div>
                              <div className="flex-1">
                                  <div className="text-xs font-bold text-charcoal">Amit Kumar</div>
                                  <div className="text-[10px] text-stone-400">92% Match</div>
                              </div>
                              <Plus size={14} className="text-stone-400" />
                          </div>
                      ))}
                  </div>
              </div>

              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-bold text-charcoal mb-4 text-sm uppercase tracking-widest">Job Activity</h3>
                  <div className="space-y-4 relative">
                      <div className="absolute left-3 top-2 bottom-2 w-px bg-stone-100"></div>
                      {[
                          { text: "Req created by David", time: "2 days ago" },
                          { text: "3 candidates shortlisted", time: "Yesterday" },
                          { text: "Interview scheduled: Sarah", time: "2h ago" }
                      ].map((act, i) => (
                          <div key={i} className="relative pl-8">
                              <div className="absolute left-1.5 top-1.5 w-3 h-3 bg-stone-200 rounded-full border-2 border-white"></div>
                              <p className="text-xs font-bold text-charcoal">{act.text}</p>
                              <p className="text-stone-400">{act.time}</p>
                          </div>
                      ))}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
