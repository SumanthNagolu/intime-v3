'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Search, Filter, MoreHorizontal, MapPin, Clock, CheckCircle, XCircle, Calendar, DollarSign, User, FileText, Edit3, Briefcase } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

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
    <div className="animate-fade-in">
      {/* Header Controls */}
      <div className="mb-8 flex flex-col md:flex-row justify-between items-end gap-4">
        <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
            <Search size={18} className="text-stone-400 ml-2" />
            <input 
              type="text" 
              placeholder="Search candidate, job, or skill..." 
              className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
        </div>
        
        <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
            {['All', ...STAGES].map(stage => (
                <button
                  key={stage}
                  onClick={() => setActiveStage(stage)}
                  className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                      activeStage === stage ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                  }`}
                >
                    {stage}
                </button>
            ))}
        </div>
      </div>

      {/* Kanban / Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredItems.map(item => {
              const isInternal = item.candidate?.type === 'internal_bench';
              
              return (
              <div 
                key={item.id} 
                onClick={() => navigate(`/employee/recruiting/candidate/${item.candidateId}`)}
                className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative cursor-pointer"
              >
                  <div className="absolute top-6 right-6" onClick={(e) => e.stopPropagation()}>
                      <button className="text-stone-300 hover:text-charcoal transition-colors">
                          <MoreHorizontal size={20} />
                      </button>
                  </div>

                  <div className="flex items-center gap-4 mb-4">
                      <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-serif font-bold border-4 border-white shadow-md ${isInternal ? 'bg-purple-100 text-purple-700' : 'bg-stone-100 text-charcoal'}`}>
                          {item.candidate?.name.charAt(0)}
                      </div>
                      <div>
                          <h3 className="font-bold text-charcoal text-lg leading-tight group-hover:text-rust transition-colors flex items-center gap-2">
                              {item.candidate?.name}
                              {isInternal && (
                                  <span className="bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 rounded-full text-[9px] uppercase tracking-wide font-bold">
                                      Internal
                                  </span>
                              )}
                          </h3>
                          <p className="text-xs text-stone-500">{item.candidate?.role}</p>
                      </div>
                  </div>

                  {/* Skills */}
                  <div className="flex flex-wrap gap-1 mb-4">
                      {item.candidate?.skills.slice(0, 3).map((skill, i) => (
                          <span key={i} className="px-2 py-1 bg-stone-50 border border-stone-100 rounded text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                              {skill}
                          </span>
                      ))}
                      {(item.candidate?.skills.length || 0) > 3 && (
                          <span className="px-2 py-1 bg-stone-50 border border-stone-100 rounded text-[10px] font-bold text-stone-400">
                              +{item.candidate!.skills.length - 3}
                          </span>
                      )}
                  </div>

                  <div className="bg-stone-50 p-3 rounded-xl border border-stone-100 mb-4">
                      <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1">Candidate For</div>
                      <div className="flex justify-between items-center">
                          <div>
                              <div className="font-bold text-charcoal text-sm truncate">{item.job?.title}</div>
                              <div className="text-xs text-rust font-medium flex items-center gap-1">
                                  <Briefcase size={10} /> {item.account?.name}
                              </div>
                          </div>
                      </div>
                  </div>

                  <div className="flex flex-wrap gap-4 text-xs text-stone-500 mb-6">
                      <div className="flex items-center gap-1">
                          <MapPin size={12} /> {item.candidate?.location}
                      </div>
                      <div className="flex items-center gap-1">
                          <Clock size={12} /> {item.lastActivity}
                      </div>
                      <div className="flex items-center gap-1 font-bold text-green-600">
                          <CheckCircle size={12} /> {item.matchScore}% Match
                      </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center" onClick={(e) => e.stopPropagation()}>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          item.status === 'placed' ? 'bg-green-50 text-green-700' :
                          item.status === 'rejected' ? 'bg-red-50 text-red-700' :
                          'bg-blue-50 text-blue-700'
                      }`}>
                          {item.status.replace(/_/g, ' ')}
                      </span>
                      
                      <div className="flex gap-2">
                          {/* Resume Button */}
                          <button 
                            className="p-2 rounded-full border border-stone-200 hover:border-blue-400 hover:text-blue-500 text-stone-400 transition-colors"
                            title="View Resume"
                          >
                              <FileText size={14} />
                          </button>
                          
                          {/* Edit Button */}
                          <button 
                            onClick={() => navigate(`/employee/recruiting/candidate/${item.candidateId}`)} // Using detail as edit for now
                            className="p-2 rounded-full border border-stone-200 hover:border-orange-400 hover:text-orange-500 text-stone-400 transition-colors"
                            title="Edit Details"
                          >
                              <Edit3 size={14} />
                          </button>

                          {/* Contextual Action based on status */}
                          {item.status === 'client_interview' && (
                              <Link href={`/employee/recruiting/offer/${item.id}`} 
                                className="p-2 rounded-full bg-charcoal text-white hover:bg-rust transition-colors shadow-md"
                                title="Prepare Offer"
                              >
                                  <DollarSign size={14} />
                              </Link>
                          )}
                          {item.status === 'offer' && (
                              <Link href={`/employee/recruiting/placement/${item.id}`} 
                                className="p-2 rounded-full bg-green-600 text-white hover:bg-green-700 transition-colors shadow-md"
                                title="Finalize Placement"
                              >
                                  <CheckCircle size={14} />
                              </Link>
                          )}
                      </div>
                  </div>
              </div>
          )})}
      </div>
      
      {filteredItems.length === 0 && (
          <div className="text-center py-20 text-stone-400">
              <Filter size={48} className="mx-auto mb-4 opacity-20" />
              <p>No candidates found in this stage.</p>
          </div>
      )}
    </div>
  );
};
