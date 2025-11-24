'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, MapPin, Briefcase, DollarSign, Mail, Phone, Calendar, Clock, FileText, Star, Send, Plus, CheckCircle } from 'lucide-react';
import { CommunicationLog } from '../shared/CommunicationLog';

export const CandidateDetail: React.FC = () => {
  const { candidateId } = useParams();
  const router = useRouter();
  const { candidates, jobs, submissions } = useAppStore();
  const candidate = candidates.find(c => c.id === candidateId);
  const [selectedJobId, setSelectedJobId] = useState('');

  if (!candidate) return <div>Candidate not found</div>;

  // History of this candidate
  const candidateSubmissions = submissions.filter(s => s.candidateId === candidate.id);

  const handleSubmitToJob = () => {
      if (selectedJobId) {
          navigate(`/employee/recruiting/submit/${candidate.id}/${selectedJobId}`);
      }
  };

  const mockLogs = [
      { id: '1', type: 'note', content: 'Screened by Sarah - Strong cultural fit.', date: '2 days ago', author: 'Sarah Lao' }
  ];

  return (
    <div className="animate-fade-in">
      <button onClick={() => navigate(-1)} className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Profile Card */}
          <div className="lg:w-1/3 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-200 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-stone-100 z-0"></div>
                  <div className="relative z-10">
                      <div className="w-32 h-32 mx-auto bg-charcoal text-white rounded-full flex items-center justify-center text-4xl font-serif font-bold mb-4 border-4 border-white shadow-xl">
                          {candidate.name.charAt(0)}
                      </div>
                      <h1 className="text-2xl font-serif font-bold text-charcoal mb-1">{candidate.name}</h1>
                      <p className="text-stone-500 font-medium mb-6">{candidate.role}</p>
                      
                      <div className="grid grid-cols-2 gap-4 text-left text-sm text-stone-600 mb-8 bg-stone-50 p-4 rounded-xl border border-stone-100">
                          <div className="flex items-center gap-2"><MapPin size={14} className="text-stone-400"/> {candidate.location}</div>
                          <div className="flex items-center gap-2"><Briefcase size={14} className="text-stone-400"/> {candidate.experience}</div>
                          <div className="flex items-center gap-2"><DollarSign size={14} className="text-stone-400"/> {candidate.rate}</div>
                          <div className="flex items-center gap-2"><Star size={14} className="text-yellow-500"/> {candidate.score} Score</div>
                      </div>

                      <div className="space-y-3">
                          <div className="flex items-center gap-3 text-sm text-stone-600 justify-center">
                              <Mail size={14} className="text-stone-400"/> {candidate.email}
                          </div>
                          <div className="flex items-center gap-3 text-sm text-stone-600 justify-center">
                              <Phone size={14} className="text-stone-400"/> +1 (555) 012-3456
                          </div>
                      </div>
                  </div>
              </div>

              {/* Quick Actions */}
              <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-bold text-charcoal text-sm mb-4">Quick Actions</h3>
                  <div className="space-y-4">
                      <div>
                          <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">Submit to Job</label>
                          <div className="flex gap-2">
                              <select 
                                value={selectedJobId}
                                onChange={(e) => setSelectedJobId(e.target.value)}
                                className="flex-1 bg-stone-50 border border-stone-200 rounded-lg text-sm p-2 outline-none focus:border-rust"
                              >
                                  <option value="">Select Open Job...</option>
                                  {jobs.filter(j => j.status === 'open' || j.status === 'urgent').map(j => (
                                      <option key={j.id} value={j.id}>{j.title}</option>
                                  ))}
                              </select>
                              <button 
                                onClick={handleSubmitToJob}
                                disabled={!selectedJobId}
                                className="bg-charcoal text-white p-2.5 rounded-lg hover:bg-rust disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                  <Send size={16} />
                              </button>
                          </div>
                      </div>
                      <button className="w-full py-3 border border-stone-200 rounded-xl text-xs font-bold text-stone-500 hover:text-charcoal hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                          <Calendar size={14} /> Schedule Screening
                      </button>
                  </div>
              </div>
          </div>

          {/* Right: Resume & Activity */}
          <div className="flex-1 space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-center mb-6">
                      <h3 className="font-serif text-xl font-bold text-charcoal">Resume & Skills</h3>
                      <button className="text-xs font-bold text-rust hover:underline flex items-center gap-1">
                          <FileText size={14} /> View PDF
                      </button>
                  </div>
                  
                  <div className="mb-8">
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Summary</h4>
                      <p className="text-stone-600 leading-relaxed text-sm">
                          {candidate.notes || "Senior Guidewire Developer with deep expertise in PolicyCenter configuration. Proven track record of delivering complex migration projects for Tier 1 insurers."}
                      </p>
                  </div>

                  <div>
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Skills</h4>
                      <div className="flex flex-wrap gap-2">
                          {candidate.skills.map(skill => (
                              <span key={skill} className="px-3 py-1 bg-stone-50 text-stone-600 text-xs font-bold rounded border border-stone-100">
                                  {skill}
                              </span>
                          ))}
                      </div>
                  </div>
              </div>

              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Submission History</h3>
                  <div className="space-y-6 relative">
                      <div className="absolute left-4 top-2 bottom-2 w-px bg-stone-100"></div>
                      
                      {candidateSubmissions.map((sub, i) => {
                          const job = jobs.find(j => j.id === sub.jobId);
                          return (
                              <div key={sub.id} className="relative pl-10">
                                  <div className="absolute left-0 top-0 w-8 h-8 bg-blue-50 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-blue-600">
                                      <Briefcase size={14} />
                                  </div>
                                  <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                      <div className="flex justify-between mb-1">
                                          <span className="text-sm font-bold text-charcoal">Submitted to {job?.title}</span>
                                          <span className="text-[10px] text-stone-400">{sub.createdAt}</span>
                                      </div>
                                      <div className="flex justify-between items-center">
                                          <p className="text-xs text-stone-500">Status: <span className="uppercase font-bold">{sub.status.replace(/_/g, ' ')}</span></p>
                                          {sub.status === 'placed' && <CheckCircle size={14} className="text-green-600"/>}
                                      </div>
                                  </div>
                              </div>
                          )
                      })}

                      <div className="relative pl-10">
                          <div className="absolute left-0 top-0 w-8 h-8 bg-stone-100 rounded-full flex items-center justify-center border-2 border-white shadow-sm text-stone-400">
                              <Plus size={14} />
                          </div>
                          <div className="pt-1">
                              <span className="text-sm font-bold text-stone-400">Profile Created</span>
                              <p className="text-xs text-stone-300">Source: {candidate.source}</p>
                          </div>
                      </div>
                  </div>
              </div>

              <CommunicationLog logs={mockLogs as any} />
          </div>
      </div>
    </div>
  );
};
