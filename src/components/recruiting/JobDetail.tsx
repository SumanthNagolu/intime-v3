'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, MapPin, DollarSign, Clock, Calendar, ArrowRight, MoreHorizontal, Search, Plus, Briefcase, FileText, List, Square, CheckSquare, UserPlus, MessageSquare, CheckCircle, XCircle, X, Settings, Building2, TrendingUp, Users, Sparkles } from 'lucide-react';
import { cn } from '../../lib/utils';
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
    <div className="animate-fade-in space-y-8">
      
      <InterviewScheduler 
        isOpen={isInterviewModalOpen}
        onClose={() => setIsInterviewModalOpen(false)}
        candidateName={selectedCandidateForInterview?.name || 'Candidate'}
        jobTitle={job.title}
      />

      {/* Premium Back Navigation */}
      <Link href="/employee/recruiting/dashboard" className="inline-flex items-center gap-2 text-charcoal-400 hover:text-forest-700 text-sm font-bold tracking-wide transition-colors group">
        <ChevronLeft size={18} strokeWidth={2.5} className="group-hover:-translate-x-1 transition-transform" />
        Back to Dashboard
      </Link>

      {/* Premium Job Header Card */}
      <div className="relative bg-white rounded-3xl shadow-2xl border-2 border-charcoal-100 overflow-hidden">
        {/* Premium accent gradient bar */}
        <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-forest-500 via-gold-500 to-forest-500"></div>
        
        {/* Main Header Content */}
        <div className="p-10">
          <div className="flex flex-col lg:flex-row justify-between items-start gap-8">
            {/* Left: Job Info */}
            <div className="flex-1 min-w-0">
              {/* Company Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-forest-50 border-2 border-forest-100 rounded-full mb-4">
                <Building2 size={16} className="text-forest-600" strokeWidth={2} />
                <span className="text-sm font-bold text-forest-700 uppercase tracking-wide">{account?.name}</span>
              </div>
              
              {/* Job Title - Premium Typography */}
              <h1 className="text-5xl font-heading font-black text-charcoal-900 mb-6 tracking-tight leading-tight">
                {job.title}
              </h1>
              
              {/* Job Details Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-forest-100 rounded-xl flex items-center justify-center">
                    <MapPin size={20} className="text-forest-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-0.5">Location</div>
                    <div className="text-sm font-bold text-charcoal-900">{job.location}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-gold-100 rounded-xl flex items-center justify-center">
                    <DollarSign size={20} className="text-gold-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-0.5">Rate</div>
                    <div className="text-sm font-bold text-charcoal-900">{job.rate}</div>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 bg-charcoal-100 rounded-xl flex items-center justify-center">
                    <Clock size={20} className="text-charcoal-600" strokeWidth={2.5} />
                  </div>
                  <div>
                    <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-0.5">Open Since</div>
                    <div className="text-sm font-bold text-charcoal-900">3 days ago</div>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right: Status & Team */}
            <div className="flex flex-col items-end gap-6">
              {/* Status Badge - Contextual */}
              <span className={cn(
                "px-6 py-3 rounded-full text-sm font-bold uppercase tracking-wider shadow-lg border-2",
                job.status === 'urgent' 
                  ? 'bg-gradient-to-r from-error-500 to-error-600 text-white border-error-400'
                  : 'bg-gradient-to-r from-success-500 to-success-600 text-white border-success-400'
              )}>
                {job.status}
              </span>
              
              {/* Team Avatars - Premium Stack */}
              <div>
                <div className="text-xs font-semibold text-charcoal-500 uppercase tracking-wider mb-3 text-right">Working On This</div>
                <div className="flex -space-x-3">
                  {[1,2,3].map(i => (
                    <div key={i} className="w-11 h-11 rounded-full bg-gradient-to-br from-forest-100 to-forest-200 border-4 border-white shadow-lg flex items-center justify-center text-forest-700 font-heading font-black hover:scale-110 transition-transform cursor-pointer">
                      {String.fromCharCode(64 + i)}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Pipeline View - Premium 2-Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
          
          {/* Main Content: Pipeline Tabs & Candidate List - 2/3 width */}
          <div className="lg:col-span-2 space-y-8">
              {/* Premium Pipeline Stage Tabs */}
              <div className="bg-white rounded-2xl p-2 shadow-elevation-md border-2 border-charcoal-100">
                  <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-premium">
                      {['Sourcing', 'Screening', 'Submission Ready', 'Submitted', 'Interview'].map(tab => {
                        const count = getCandidatesInStage(tab).length;
                        const isActive = activeTab === tab;
                        
                        return (
                          <button
                            key={tab}
                            onClick={() => { setActiveTab(tab as Tab); setSelectedSubmissionIds([]); }}
                            className={cn(
                              "flex items-center gap-2 px-5 py-3.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all duration-300 relative",
                              isActive 
                                ? 'bg-gradient-to-r from-forest-600 to-forest-700 text-white shadow-lg scale-105' 
                                : 'text-charcoal-600 hover:bg-charcoal-50'
                            )}
                          >
                              {tab}
                              <span className={cn(
                                "px-2.5 py-1 rounded-full text-[10px] font-black min-w-[24px] text-center",
                                isActive ? 'bg-white/25 text-white' : 'bg-charcoal-100 text-charcoal-700'
                              )}>
                                  {count}
                              </span>
                          </button>
                      )})}
                  </div>
              </div>

              {/* Premium Bulk Action Bar */}
              {currentList.length > 0 && (
                  <div className="flex items-center justify-between bg-gradient-to-r from-charcoal-50 to-forest-50/30 px-6 py-4 rounded-2xl border-2 border-charcoal-100 shadow-elevation-sm">
                      <div className="flex items-center gap-4">
                          <button 
                            onClick={toggleSelectAll} 
                            className="w-10 h-10 rounded-xl bg-white border-2 border-charcoal-200 hover:border-forest-500 text-charcoal-400 hover:text-forest-700 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                          >
                              {selectedSubmissionIds.length === currentList.length && currentList.length > 0 ? <CheckSquare size={20} strokeWidth={2.5} /> : <Square size={20} strokeWidth={2} />}
                          </button>
                          <span className="text-sm font-bold text-charcoal-700 tracking-tight">
                            {selectedSubmissionIds.length} {selectedSubmissionIds.length === 1 ? 'Candidate' : 'Candidates'} Selected
                          </span>
                      </div>
                      {selectedSubmissionIds.length > 0 && (
                          <div className="flex gap-3">
                              {activeTab === 'Sourcing' && (
                                  <button 
                                    onClick={executeBulkAction} 
                                    className="px-5 py-2.5 bg-white border-2 border-charcoal-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gradient-to-r hover:from-forest-600 hover:to-forest-700 hover:text-white hover:border-forest-600 transition-all shadow-sm hover:shadow-md"
                                  >
                                      Move to Screening
                                  </button>
                              )}
                              {activeTab === 'Screening' && (
                                  <button 
                                    onClick={executeBulkAction} 
                                    className="px-5 py-2.5 bg-white border-2 border-charcoal-200 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-gradient-to-r hover:from-success-600 hover:to-success-700 hover:text-white hover:border-success-600 transition-all shadow-sm hover:shadow-md"
                                  >
                                      Shortlist Selected
                                  </button>
                              )}
                              <button className="px-5 py-2.5 bg-white border-2 border-error-200 rounded-xl text-xs font-bold uppercase tracking-wider text-error-600 hover:bg-error-600 hover:text-white transition-all shadow-sm hover:shadow-md">
                                  Reject
                              </button>
                          </div>
                      )}
                  </div>
              )}

              {/* Premium Candidate Cards List */}
              <div className="space-y-5">
                  {currentList.map((submission, index) => {
                      const candidate = candidates.find(c => c.id === submission.candidateId);
                      if (!candidate) return null;
                      const isSelected = selectedSubmissionIds.includes(submission.id);
                      const matchScore = candidate.score || 0;
                      const isHighMatch = matchScore >= 85;

                      return (
                          <div 
                            key={submission.id} 
                            className={cn(
                              "group relative bg-white rounded-2xl p-7 shadow-elevation-md hover:shadow-elevation-lg transition-all duration-300 hover:-translate-y-0.5",
                              isSelected 
                                ? 'border-3 border-forest-500 ring-4 ring-forest-100' 
                                : 'border-2 border-charcoal-100 hover:border-forest-200'
                            )}
                            style={{ animationDelay: `${index * 50}ms` }}
                          >
                              <div className="flex justify-between items-start">
                                  <div className="flex items-start gap-5 flex-1">
                                      {/* Checkbox */}
                                      <button 
                                        onClick={() => toggleSelection(submission.id)} 
                                        className={cn(
                                          "w-10 h-10 rounded-xl flex items-center justify-center transition-all border-2 shadow-sm hover:shadow-md shrink-0",
                                          isSelected 
                                            ? 'bg-gradient-to-br from-forest-500 to-forest-600 border-forest-600 text-white' 
                                            : 'bg-white border-charcoal-200 text-charcoal-300 hover:border-forest-400 hover:text-forest-600'
                                        )}
                                      >
                                          {isSelected ? <CheckSquare size={20} strokeWidth={2.5} /> : <Square size={20} strokeWidth={2} />}
                                      </button>
                                      
                                      {/* Avatar & Info */}
                                      <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-charcoal-100 to-charcoal-200 text-charcoal-700 flex items-center justify-center text-2xl font-heading font-black shadow-md group-hover:scale-110 transition-transform shrink-0">
                                          {candidate.name.charAt(0)}
                                      </div>
                                      
                                      <div className="flex-1 min-w-0">
                                          <h3 className="font-heading font-bold text-xl text-charcoal-900 group-hover:text-forest-700 transition-colors mb-1 truncate">
                                            {candidate.name}
                                          </h3>
                                          <div className="flex items-center gap-3 text-sm text-charcoal-500 mb-4">
                                              <span className="font-medium">{candidate.role}</span>
                                              <span className="text-charcoal-300">•</span>
                                              <div className={cn(
                                                "flex items-center gap-1.5 px-3 py-1 rounded-full font-bold text-xs",
                                                isHighMatch 
                                                  ? 'bg-success-50 text-success-700 border border-success-200' 
                                                  : 'bg-gold-50 text-gold-700 border border-gold-200'
                                              )}>
                                                  {isHighMatch ? <CheckCircle size={12} strokeWidth={2.5} /> : <TrendingUp size={12} strokeWidth={2.5} />}
                                                  {matchScore}% Match
                                              </div>
                                          </div>
                                          
                                          {/* Activity Footer */}
                                          <div className="flex items-center gap-5 text-xs text-charcoal-500">
                                              <div className="flex items-center gap-2">
                                                  <Clock size={14} strokeWidth={2} className="text-charcoal-400" />
                                                  <span className="font-medium">Last Activity: {submission.lastActivity}</span>
                                              </div>
                                              <div className="flex items-center gap-2">
                                                  <List size={14} strokeWidth={2} className="text-charcoal-400" />
                                                  <span className="font-medium">Stage: {activeTab}</span>
                                              </div>
                                          </div>
                                      </div>
                                  </div>
                                  
                                  {/* Action Buttons - Context-Aware */}
                                  <div className="flex items-center gap-3 ml-4">
                                      
                                      {/* Sourcing Stage */}
                                      {activeTab === 'Sourcing' && (
                                          <Link href={`/employee/recruiting/sourcing/${candidate.id}/${job.id}`}
                                            className="px-5 py-3 bg-gradient-to-r from-charcoal-700 to-charcoal-900 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                                          >
                                              Source <UserPlus size={14} strokeWidth={2.5} />
                                          </Link>
                                      )}

                                      {/* Screening Stage */}
                                      {activeTab === 'Screening' && (
                                          <Link href={`/employee/recruiting/screening/${candidate.id}/${job.id}`} 
                                            className="px-5 py-3 bg-gradient-to-r from-forest-600 to-forest-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                                          >
                                              Screen <Briefcase size={14} strokeWidth={2.5} />
                                          </Link>
                                      )}

                                      {/* Submission Ready Stage */}
                                      {activeTab === 'Submission Ready' && (
                                          <Link href={`/employee/recruiting/submit/${candidate.id}/${job.id}`}
                                            className="px-5 py-3 bg-gradient-to-r from-gold-500 to-gold-600 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                                          >
                                              Submit <FileText size={14} strokeWidth={2.5} />
                                          </Link>
                                      )}

                                      {/* Submitted Stage */}
                                      {activeTab === 'Submitted' && (
                                          <Link href={`/employee/recruiting/submit/${candidate.id}/${job.id}`}
                                            className="px-5 py-3 bg-white border-2 border-charcoal-200 text-charcoal-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-charcoal-50 transition-all flex items-center gap-2 hover:border-charcoal-300"
                                          >
                                              Manage <Settings size={14} strokeWidth={2} />
                                          </Link>
                                      )}

                                      {/* Interview Stage */}
                                      {activeTab === 'Interview' && (
                                          <>
                                            <button 
                                              onClick={() => handleScheduleClick(candidate.id, candidate.name)}
                                              className="px-5 py-3 bg-white border-2 border-charcoal-200 text-charcoal-700 rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-charcoal-50 transition-all flex items-center gap-2"
                                            >
                                                <Calendar size={14} strokeWidth={2} /> Schedule
                                            </button>
                                            <Link href={`/employee/recruiting/submit/${candidate.id}/${job.id}`} 
                                              className="px-5 py-3 bg-gradient-to-r from-purple-600 to-purple-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider hover:shadow-lg transition-all flex items-center gap-2 hover:scale-105"
                                            >
                                                Status <Settings size={14} strokeWidth={2.5} />
                                            </Link>
                                          </>
                                      )}
                                      
                                      {/* More Options */}
                                      <Link href={`/employee/recruiting/candidate/${candidate.id}`} className="w-10 h-10 rounded-xl bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-400 hover:text-charcoal-700 transition-all flex items-center justify-center">
                                          <MoreHorizontal size={18} strokeWidth={2} />
                                      </Link>
                                  </div>
                              </div>
                          </div>
                      );
                  })}
                  
                  {/* Premium Empty State */}
                  {currentList.length === 0 && (
                      <div className="text-center py-24 bg-gradient-to-br from-charcoal-50 to-forest-50/20 rounded-3xl border-2 border-dashed border-charcoal-200">
                          <div className="w-20 h-20 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                              <Search size={40} className="text-charcoal-300" strokeWidth={1.5} />
                          </div>
                          <h3 className="font-heading font-bold text-2xl text-charcoal-900 mb-2">No candidates in this stage</h3>
                          <p className="text-base text-charcoal-500 font-medium">Candidates will appear here as they progress through the pipeline.</p>
                      </div>
                  )}
              </div>
          </div>

          {/* Premium Sidebar: AI Recommendations & Activity - 1/3 width */}
          <div className="space-y-8">
              {/* AI Recommendations - Premium Card */}
              <div className="relative bg-gradient-to-br from-purple-50 to-purple-100/50 rounded-3xl p-8 border-2 border-purple-200 shadow-elevation-lg overflow-hidden">
                  {/* Sparkle effect */}
                  <div className="absolute top-6 right-6 w-12 h-12 bg-purple-400/20 rounded-full blur-2xl"></div>
                  
                  <div className="relative z-10">
                      <div className="flex items-center gap-3 mb-4">
                          <div className="w-11 h-11 bg-gradient-to-br from-purple-500 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                              <Sparkles size={22} className="text-white" strokeWidth={2.5} />
                          </div>
                          <h3 className="font-heading font-bold text-lg text-purple-900 uppercase tracking-tight">
                              AI Recommendations
                          </h3>
                      </div>
                      
                      <p className="text-sm text-purple-800 font-medium leading-relaxed mb-6">
                          Based on the "Migration" requirement, I found <span className="font-bold">3 strong matches</span> in our Bench.
                      </p>
                      
                      <div className="space-y-3">
                          {[
                            { name: 'Amit Kumar', match: 92, initial: 'A' },
                            { name: 'Sarah Chen', match: 89, initial: 'S' },
                            { name: 'Mike Rodriguez', match: 85, initial: 'M' }
                          ].map((rec, i) => (
                              <button 
                                key={i}
                                className="w-full bg-white hover:bg-purple-50 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex items-center gap-4 cursor-pointer border-2 border-transparent hover:border-purple-300 group"
                              >
                                  <div className="w-11 h-11 bg-gradient-to-br from-purple-100 to-purple-200 rounded-xl flex items-center justify-center text-base font-heading font-black text-purple-700 shrink-0">
                                      {rec.initial}
                                  </div>
                                  <div className="flex-1 text-left">
                                      <div className="text-sm font-bold text-charcoal-900 mb-0.5">{rec.name}</div>
                                      <div className="text-xs font-bold text-success-600">{rec.match}% Match</div>
                                  </div>
                                  <Plus size={18} className="text-purple-400 group-hover:text-purple-600 transition-colors shrink-0" strokeWidth={2.5} />
                              </button>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Job Activity Timeline - Premium Card */}
              <div className="bg-white rounded-3xl p-8 border-2 border-charcoal-100 shadow-elevation-lg">
                  <div className="flex items-center gap-3 mb-6">
                      <div className="w-11 h-11 bg-gradient-to-br from-charcoal-700 to-charcoal-900 rounded-xl flex items-center justify-center shadow-lg">
                          <Clock size={22} className="text-white" strokeWidth={2.5} />
                      </div>
                      <h3 className="font-heading font-bold text-lg text-charcoal-900 uppercase tracking-tight">
                          Job Activity
                      </h3>
                  </div>
                  
                  <div className="space-y-6 relative">
                      {/* Premium timeline line with gradient */}
                      <div className="absolute left-4 top-4 bottom-4 w-0.5 bg-gradient-to-b from-success-500 via-forest-300 to-charcoal-200"></div>
                      
                      {[
                          { text: "Req created by David", time: "2 days ago", icon: Briefcase, isRecent: false },
                          { text: "3 candidates shortlisted", time: "Yesterday", icon: Users, isRecent: false },
                          { text: "Interview scheduled: Sarah", time: "2h ago", icon: Calendar, isRecent: true }
                      ].map((act, i) => {
                        const Icon = act.icon;
                        return (
                          <div key={i} className="relative pl-12 group">
                              <div className={cn(
                                "absolute left-0 top-0.5 w-8 h-8 rounded-xl border-3 border-white flex items-center justify-center shadow-md transition-all duration-300 group-hover:scale-110",
                                act.isRecent 
                                  ? "bg-gradient-to-br from-success-500 to-success-600" 
                                  : "bg-gradient-to-br from-charcoal-200 to-charcoal-300"
                              )}>
                                  <Icon size={14} className={act.isRecent ? "text-white" : "text-charcoal-600"} strokeWidth={2.5} />
                              </div>
                              <div className="bg-charcoal-50 hover:bg-forest-50 p-4 rounded-xl transition-all border border-charcoal-100 hover:border-forest-200">
                                  <p className="text-sm font-bold text-charcoal-900 mb-1">{act.text}</p>
                                  <p className="text-xs text-charcoal-500 font-medium">{act.time}</p>
                              </div>
                          </div>
                      )})}
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
