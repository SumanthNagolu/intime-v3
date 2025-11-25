'use client';

import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Search, Filter, MoreHorizontal, MapPin, Clock, CheckCircle, XCircle, Calendar, DollarSign, User, FileText, Edit3, Briefcase, TrendingUp, Star } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { cn } from '../../lib/utils';

const STAGES = ['Sourced', 'Screening', 'Submitted', 'Interview', 'Offer', 'Placed'];

export const PipelineView: React.FC = () => {
  const { submissions, candidates, jobs, accounts } = useAppStore();
  const [activeStage, setActiveStage] = useState('All');
  const [searchTerm, setSearchTerm] = useState('');
  const router = useRouter();

  // Enrich submissions with candidate and job data
  const pipelineItems = submissions.map(sub => {
    const candidate = candidates.find(c => c.id === sub.candidateId);
    const job = jobs.find(j => j.id === sub.jobId);
    const account = accounts.find(a => a.id === job?.accountId);
    return { ...sub, candidate, job, account };
  }).filter(item => item.candidate && item.job);

  const filteredItems = pipelineItems.filter(item => {
    const matchesStage = activeStage === 'All' || 
      (activeStage === 'Sourced' && item.status === 'sourced') ||
      (activeStage === 'Screening' && item.status === 'screening') ||
      (activeStage === 'Submitted' && item.status === 'submitted_to_client') ||
      (activeStage === 'Interview' && item.status === 'client_interview') ||
      (activeStage === 'Offer' && item.status === 'offer') ||
      (activeStage === 'Placed' && item.status === 'placed');

    const matchesSearch = item.candidate?.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          item.job?.title.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesStage && matchesSearch;
  });

  return (
    <div className="animate-fade-in space-y-8">
      {/* Premium Header Controls */}
      <div className="flex flex-col md:flex-row justify-between items-stretch md:items-center gap-6">
        {/* Premium Search Bar */}
        <div className="relative flex-1 max-w-xl">
          <Search size={20} className="absolute left-5 top-1/2 -translate-y-1/2 text-charcoal-400" strokeWidth={2} />
          <input 
            type="text" 
            placeholder="Search candidates, jobs, skills..." 
            className="w-full pl-14 pr-6 py-4 bg-white border-2 border-charcoal-100 rounded-2xl text-sm font-medium text-charcoal-900 placeholder-charcoal-400 focus:outline-none focus:border-forest-500 focus:ring-4 focus:ring-forest-100 transition-all shadow-elevation-sm hover:shadow-elevation-md"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Premium Stage Filter Pills */}
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-premium">
            {['All', ...STAGES].map(stage => (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={cn(
                    "px-5 py-3 rounded-full text-xs font-bold uppercase tracking-wider transition-all duration-300 whitespace-nowrap shadow-elevation-sm",
                    activeStage === stage 
                      ? 'bg-gradient-to-r from-forest-600 to-forest-700 text-white shadow-elevation-md hover:shadow-elevation-lg hover:scale-105' 
                      : 'bg-white text-charcoal-600 border-2 border-charcoal-100 hover:border-forest-300 hover:bg-forest-50 hover:text-forest-700'
                  )}
                >
                    {stage}
                </button>
            ))}
        </div>
      </div>

      {/* Premium Candidate Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredItems.map((item, index) => {
              const isInternal = item.candidate?.type === 'internal_bench';
              const matchScore = item.matchScore || 0;
              const isHighMatch = matchScore >= 80;
              
              return (
              <div 
                key={item.id} 
                onClick={() => router.push(`/employee/recruiting/candidate/${item.candidateId}`)}
                className="group relative bg-white rounded-3xl border-2 border-charcoal-100 p-7 shadow-elevation-md hover:shadow-2xl hover:border-forest-300 hover:-translate-y-1 transition-all duration-300 cursor-pointer overflow-hidden"
                style={{ animationDelay: `${index * 50}ms` }}
              >
                  {/* Premium Background Glow */}
                  <div className="absolute -top-20 -right-20 w-40 h-40 bg-forest-100/30 rounded-full blur-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  {/* More Options Button */}
                  <div className="absolute top-6 right-6 z-10" onClick={(e) => e.stopPropagation()}>
                      <button className="w-9 h-9 rounded-full bg-charcoal-50 hover:bg-charcoal-100 text-charcoal-400 hover:text-charcoal-700 transition-all flex items-center justify-center shadow-sm hover:shadow-md">
                          <MoreHorizontal size={18} strokeWidth={2} />
                      </button>
                  </div>

                  {/* Header with Avatar */}
                  <div className="flex items-start gap-4 mb-5 relative z-10">
                      <div className={cn(
                        "w-16 h-16 rounded-2xl flex items-center justify-center text-2xl font-heading font-black border-4 border-white shadow-lg transition-all duration-300 group-hover:scale-110",
                        isInternal ? 'bg-gradient-to-br from-purple-100 to-purple-200 text-purple-700' : 'bg-gradient-to-br from-forest-100 to-forest-200 text-forest-700'
                      )}>
                          {item.candidate?.name.charAt(0)}
                      </div>
                      <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                              <h3 className="font-heading font-bold text-lg text-charcoal-900 group-hover:text-forest-700 transition-colors truncate">
                                  {item.candidate?.name}
                              </h3>
                              {isInternal && (
                                  <span className="bg-gradient-to-r from-purple-500 to-purple-600 text-white px-2.5 py-1 rounded-full text-[10px] uppercase tracking-wider font-bold shadow-sm shrink-0">
                                      Internal
                                  </span>
                              )}
                          </div>
                          <p className="text-sm text-charcoal-500 font-medium">{item.candidate?.role}</p>
                      </div>
                  </div>

                  {/* Skills Tags - Premium */}
                  <div className="flex flex-wrap gap-2 mb-5 relative z-10">
                      {item.candidate?.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-3 py-1.5 bg-gradient-to-r from-charcoal-50 to-charcoal-100 border border-charcoal-200 rounded-full text-[11px] font-bold text-charcoal-600 uppercase tracking-wide hover:border-forest-300 hover:bg-forest-50 transition-all">
                              {skill}
                          </span>
                      ))}
                      {(item.candidate?.skills.length || 0) > 3 && (
                          <span className="px-3 py-1.5 bg-charcoal-100 border border-charcoal-200 rounded-full text-[11px] font-bold text-charcoal-500 hover:bg-charcoal-200 transition-all">
                              +{item.candidate!.skills.length - 3} more
                          </span>
                      )}
                  </div>

                  {/* Job Context Card - Premium */}
                  <div className="bg-gradient-to-br from-forest-50 to-gold-50/30 p-4 rounded-2xl border-2 border-forest-100 mb-5 relative z-10">
                      <div className="text-[10px] font-bold text-forest-600 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                          <Briefcase size={12} strokeWidth={2.5} />
                          Candidate For
                      </div>
                      <div className="font-heading font-bold text-charcoal-900 text-base mb-1 truncate">
                          {item.job?.title}
                      </div>
                      <div className="text-sm text-gold-700 font-semibold flex items-center gap-1.5">
                          <Building size={14} strokeWidth={2} />
                          {item.account?.name}
                      </div>
                  </div>

                  {/* Stats Row - Premium */}
                  <div className="grid grid-cols-2 gap-3 text-sm mb-6 relative z-10">
                      <div className="flex items-center gap-2 text-charcoal-600">
                          <MapPin size={14} className="text-forest-600" strokeWidth={2} />
                          <span className="font-medium truncate">{item.candidate?.location}</span>
                      </div>
                      <div className="flex items-center gap-2 text-charcoal-600">
                          <Clock size={14} className="text-gold-600" strokeWidth={2} />
                          <span className="font-medium">{item.lastActivity}</span>
                      </div>
                  </div>

                  {/* Match Score Badge - Contextual Colors */}
                  {matchScore > 0 && (
                      <div className={cn(
                        "flex items-center gap-2 px-4 py-2.5 rounded-xl mb-6 font-bold text-sm relative z-10",
                        isHighMatch 
                          ? 'bg-gradient-to-r from-success-50 to-success-100 text-success-700 border-2 border-success-200' 
                          : 'bg-gradient-to-r from-gold-50 to-gold-100 text-gold-700 border-2 border-gold-200'
                      )}>
                          {isHighMatch ? <CheckCircle size={16} strokeWidth={2.5} /> : <Star size={16} strokeWidth={2.5} />}
                          <span>{matchScore}% Match</span>
                          {isHighMatch && (
                              <span className="ml-auto text-xs uppercase tracking-wider">Excellent</span>
                          )}
                      </div>
                  )}

                  {/* Footer with Status & Actions */}
                  <div className="pt-5 border-t-2 border-charcoal-100 flex justify-between items-center relative z-10" onClick={(e) => e.stopPropagation()}>
                      <span className={cn(
                          "px-4 py-2 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm",
                          item.status === 'placed' && 'bg-gradient-to-r from-success-500 to-success-600 text-white',
                          item.status === 'rejected' && 'bg-gradient-to-r from-error-500 to-error-600 text-white',
                          item.status === 'offer' && 'bg-gradient-to-r from-gold-400 to-gold-500 text-charcoal-900',
                          item.status === 'client_interview' && 'bg-gradient-to-r from-forest-500 to-forest-600 text-white',
                          !['placed', 'rejected', 'offer', 'client_interview'].includes(item.status) && 'bg-charcoal-100 text-charcoal-700 border-2 border-charcoal-200'
                      )}>
                          {item.status.replace(/_/g, ' ')}
                      </span>
                      
                      <div className="flex gap-2">
                          {/* Resume Button */}
                          <button 
                            className="w-9 h-9 rounded-full border-2 border-charcoal-200 hover:border-forest-500 hover:bg-forest-50 text-charcoal-500 hover:text-forest-700 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                            title="View Resume"
                          >
                              <FileText size={16} strokeWidth={2} />
                          </button>
                          
                          {/* Edit Button */}
                          <button 
                            onClick={() => router.push(`/employee/recruiting/candidate/${item.candidateId}`)}
                            className="w-9 h-9 rounded-full border-2 border-charcoal-200 hover:border-gold-500 hover:bg-gold-50 text-charcoal-500 hover:text-gold-700 transition-all flex items-center justify-center shadow-sm hover:shadow-md"
                            title="Edit Details"
                          >
                              <Edit3 size={16} strokeWidth={2} />
                          </button>

                          {/* Contextual Action based on status */}
                          {item.status === 'client_interview' && (
                              <Link href={`/employee/recruiting/offer/${item.id}`} 
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-gold-500 to-gold-600 text-white hover:from-gold-600 hover:to-gold-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                                title="Prepare Offer"
                              >
                                  <DollarSign size={16} strokeWidth={2.5} />
                              </Link>
                          )}
                          {item.status === 'offer' && (
                              <Link href={`/employee/recruiting/placement/${item.id}`} 
                                className="w-9 h-9 rounded-full bg-gradient-to-br from-success-500 to-success-600 text-white hover:from-success-600 hover:to-success-700 transition-all shadow-md hover:shadow-lg flex items-center justify-center"
                                title="Finalize Placement"
                              >
                                  <CheckCircle size={16} strokeWidth={2.5} />
                              </Link>
                          )}
                      </div>
                  </div>
              </div>
          )})}
      </div>
      
      {/* Premium Empty State */}
      {filteredItems.length === 0 && (
          <div className="text-center py-24 bg-gradient-to-br from-charcoal-50 to-forest-50/30 rounded-3xl border-2 border-dashed border-charcoal-200">
              <div className="w-20 h-20 bg-charcoal-100 rounded-full flex items-center justify-center mx-auto mb-6">
                  <Filter size={40} className="text-charcoal-300" strokeWidth={1.5} />
              </div>
              <h3 className="font-heading font-bold text-xl text-charcoal-900 mb-2">No candidates found</h3>
              <p className="text-base text-charcoal-500 font-medium">Try adjusting your filters or search criteria</p>
          </div>
      )}
    </div>
  );
};
