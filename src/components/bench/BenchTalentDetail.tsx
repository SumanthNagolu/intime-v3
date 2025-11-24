'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, MapPin, Briefcase, DollarSign, Mail, Phone, Calendar, Clock, FileText, Star, Send, Plus, CheckCircle, Globe, Search, ArrowRight } from 'lucide-react';

export const BenchTalentDetail: React.FC = () => {
  const { candidateId } = useParams();
  const router = useRouter();
  const { bench, submissions, jobs } = useAppStore();
  
  // Find in bench store
  const consultant = bench.find(c => c.id === candidateId);
  
  const [activeTab, setActiveTab] = useState<'Overview' | 'Job Hunt' | 'Pipeline'>('Overview');

  if (!consultant) return <div className="p-8 text-center">Consultant not found.</div>;

  // Pipeline History for this consultant
  const consultantSubmissions = submissions.filter(s => s.candidateId === consultant.id);

  return (
    <div className="animate-fade-in">
      <Link href="/employee/bench/talent" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Roster
      </Link>

      {/* Header Card */}
      <div className="bg-white p-8 rounded-[2.5rem] shadow-xl border border-stone-200 relative overflow-hidden mb-8">
          <div className="absolute top-0 left-0 w-full h-2 bg-rust"></div>
          <div className="flex flex-col md:flex-row justify-between items-start gap-6">
              <div className="flex gap-6 items-center">
                  <div className="w-24 h-24 bg-stone-100 rounded-full flex items-center justify-center text-4xl font-serif font-bold text-charcoal border-4 border-white shadow-lg">
                      {consultant.name.charAt(0)}
                  </div>
                  <div>
                      <h1 className="text-4xl font-serif font-bold text-charcoal mb-1">{consultant.name}</h1>
                      <p className="text-xl text-stone-500">{consultant.role}</p>
                      <div className="flex gap-4 mt-3 text-sm font-medium text-stone-600">
                          <span className="flex items-center gap-1"><MapPin size={14}/> {consultant.location}</span>
                          <span className="flex items-center gap-1"><Briefcase size={14}/> {consultant.experience} Exp</span>
                          <span className="flex items-center gap-1 text-rust font-bold"><Clock size={14}/> {consultant.daysOnBench} Days Aged</span>
                      </div>
                  </div>
              </div>
              <div className="text-right flex flex-col items-end gap-3">
                  <div className="inline-flex items-center gap-2 bg-green-50 text-green-700 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest border border-green-100">
                      <CheckCircle size={14}/> Available
                  </div>
                  <button 
                    onClick={() => navigate(`/employee/bench/hunt/${consultant.id}`)}
                    className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2"
                  >
                      Start Job Hunt <Search size={14} />
                  </button>
              </div>
          </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-6 border-b border-stone-200 mb-8">
          {['Overview', 'Job Hunt', 'Pipeline'].map(tab => (
              <button
                 key={tab}
                 onClick={() => {
                     if (tab === 'Job Hunt') navigate(`/employee/bench/hunt/${consultant.id}`);
                     else setActiveTab(tab as any);
                 }}
                 className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors ${
                     activeTab === tab ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
                 }`}
              >
                  {tab}
              </button>
          ))}
      </div>

      {activeTab === 'Overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Resume & Skills */}
              <div className="lg:col-span-2 space-y-8">
                  <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
                      <div className="flex justify-between items-center mb-6">
                          <h3 className="font-serif text-xl font-bold text-charcoal">Profile Summary</h3>
                          <button className="text-xs font-bold text-rust hover:underline flex items-center gap-1">
                              <FileText size={14} /> Download PDF
                          </button>
                      </div>
                      <p className="text-stone-600 leading-relaxed text-sm mb-8">
                          Senior Guidewire Developer with 8 years of experience. Strong background in PolicyCenter configuration (v8, v9, v10) and integration using Gosu, Java, and REST APIs. Certified in PC 10. Available immediately for remote or hybrid roles.
                      </p>

                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Core Competencies</h4>
                      <div className="flex flex-wrap gap-2">
                          {consultant.skills.map(skill => (
                              <span key={skill} className="px-3 py-1 bg-stone-50 text-stone-600 text-xs font-bold rounded border border-stone-100">
                                  {skill}
                              </span>
                          ))}
                      </div>
                  </div>
              </div>

              {/* Sidebar Info */}
              <div className="space-y-6">
                  <div className="bg-stone-50 p-6 rounded-[2rem] border border-stone-200">
                      <h4 className="font-bold text-charcoal mb-4 text-sm uppercase tracking-widest">Admin Details</h4>
                      <div className="space-y-4 text-sm">
                          <div className="flex justify-between border-b border-stone-200 pb-2">
                              <span className="text-stone-500">Visa Status</span>
                              <span className="font-bold text-charcoal">{consultant.visaStatus}</span>
                          </div>
                          <div className="flex justify-between border-b border-stone-200 pb-2">
                              <span className="text-stone-500">Min Rate</span>
                              <span className="font-bold text-charcoal">{consultant.rate}</span>
                          </div>
                          <div className="flex justify-between border-b border-stone-200 pb-2">
                              <span className="text-stone-500">Last Project</span>
                              <span className="font-bold text-charcoal">Global Insure</span>
                          </div>
                          <div className="flex justify-between">
                              <span className="text-stone-500">Last Contact</span>
                              <span className="font-bold text-charcoal">{consultant.lastContact}</span>
                          </div>
                      </div>
                  </div>

                  <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                      <h4 className="font-bold text-charcoal mb-4 text-sm uppercase tracking-widest">Contact</h4>
                      <div className="space-y-3 text-sm">
                          <div className="flex items-center gap-3">
                              <Mail size={16} className="text-stone-400" /> {consultant.email}
                          </div>
                          <div className="flex items-center gap-3">
                              <Phone size={16} className="text-stone-400" /> +1 (555) 123-4567
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      )}

      {activeTab === 'Pipeline' && (
          <div className="space-y-6">
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Submission History</h3>
                  
                  {consultantSubmissions.length > 0 ? (
                      <div className="space-y-6 relative">
                          <div className="absolute left-4 top-2 bottom-2 w-px bg-stone-100"></div>
                          {consultantSubmissions.map(sub => {
                              const job = jobs.find(j => j.id === sub.jobId);
                              return (
                                  <div key={sub.id} className="relative pl-10">
                                      <div className={`absolute left-0 top-0 w-8 h-8 rounded-full flex items-center justify-center border-2 border-white shadow-sm ${
                                          sub.status === 'placed' ? 'bg-green-50 text-green-600' : 'bg-blue-50 text-blue-600'
                                      }`}>
                                          <Send size={14} />
                                      </div>
                                      <div className="bg-stone-50 p-4 rounded-xl border border-stone-100">
                                          <div className="flex justify-between mb-1">
                                              <span className="text-sm font-bold text-charcoal">{job?.title} @ {job?.client}</span>
                                              <span className="text-[10px] text-stone-400">{sub.createdAt}</span>
                                          </div>
                                          <div className="flex justify-between items-center">
                                              <p className="text-xs text-stone-500">Status: <span className="uppercase font-bold">{sub.status.replace(/_/g, ' ')}</span></p>
                                              <Link href={`/employee/recruiting/submit/${consultant.id}/${job?.id}`} className="text-[10px] font-bold text-rust hover:underline">
                                                  View Submission
                                              </Link>
                                          </div>
                                      </div>
                                  </div>
                              )
                          })}
                      </div>
                  ) : (
                      <div className="text-center py-12 text-stone-400">
                          <Send size={48} className="mx-auto mb-4 opacity-20" />
                          <p>No active submissions. Start a Job Hunt.</p>
                          <button onClick={() => navigate(`/employee/bench/hunt/${consultant.id}`)} className="mt-4 text-rust font-bold hover:underline">Find Jobs</button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
