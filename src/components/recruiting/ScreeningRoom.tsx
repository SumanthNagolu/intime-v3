'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, CheckCircle, XCircle, Zap, Briefcase, User, HelpCircle, Star } from 'lucide-react';

export const ScreeningRoom: React.FC = () => {
  const { candidateId, jobId } = useParams();
  const router = useRouter();
  const { candidates, jobs, submissions, updateSubmission } = useAppStore();
  const candidate = candidates.find(c => c.id === candidateId);
  const job = jobs.find(j => j.id === jobId);
  const submission = submissions.find(s => s.candidateId === candidateId && s.jobId === jobId);
  
  const [notes, setNotes] = useState('');
  const [decision, setDecision] = useState<'pending' | 'shortlist' | 'reject'>('pending');

  if (!candidate || !job || !submission) return <div>Not found</div>;

  const requirements = [
      { id: 1, text: '3+ years PolicyCenter experience', met: true, evidence: 'Worked at Global Insure for 3 years' },
      { id: 2, text: 'Gosu Certification', met: true, evidence: 'Academy Certified (Module 5)' },
      { id: 3, text: 'Integration Patterns', met: false, evidence: 'Limited mentions in resume' },
      { id: 4, text: 'Agile Methodology', met: true, evidence: 'Mentioned in skills matrix' },
  ];

  const handleShortlist = () => {
      setDecision('shortlist');
      updateSubmission({ ...submission, status: 'submission_ready', lastActivity: 'Shortlisted' });
      // Navigate back to job detail where they will now appear in 'Submission Ready' tab
      setTimeout(() => {
          router.push(`/employee/recruiting/jobs/${jobId}`);
      }, 800);
  };

  const handleReject = () => {
      setDecision('reject');
      updateSubmission({ ...submission, status: 'rejected', lastActivity: 'Rejected' });
      setTimeout(() => {
          router.push(`/employee/recruiting/jobs/${jobId}`);
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
                      Screening Room
                      <span className="text-sm font-sans font-normal text-stone-400 bg-stone-100 px-2 py-0.5 rounded-full">Match Score: {candidate.score}%</span>
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
                onClick={handleShortlist}
                className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 shadow-lg ${decision === 'shortlist' ? 'bg-green-600 text-white' : 'bg-charcoal text-white hover:bg-rust'}`}
              >
                  <CheckCircle size={16} /> Shortlist
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
                  <button className="text-xs font-bold text-rust hover:underline">Open Full Resume</button>
              </div>
              <div className="flex-1 overflow-y-auto p-8">
                  <div className="prose prose-stone max-w-none">
                      <h3>Professional Summary</h3>
                      <p>{candidate.notes || "Experienced developer..."}</p>
                      
                      <h3>Experience</h3>
                      <div className="pl-4 border-l-2 border-stone-200 space-y-4">
                          <div>
                              <h4 className="font-bold">Senior Developer @ TechFlow</h4>
                              <p className="text-sm text-stone-500">2021 - Present</p>
                              <ul className="list-disc pl-5 text-sm">
                                  <li>Led PolicyCenter 10 migration.</li>
                                  <li>Managed team of 4 developers.</li>
                              </ul>
                          </div>
                          <div>
                              <h4 className="font-bold">Config Specialist @ Global Insure</h4>
                              <p className="text-sm text-stone-500">2018 - 2021</p>
                              <ul className="list-disc pl-5 text-sm">
                                  <li>Implemented Personal Auto LOB.</li>
                              </ul>
                          </div>
                      </div>

                      <h3>Skills</h3>
                      <div className="flex flex-wrap gap-2">
                          {candidate.skills.map(s => (
                              <span key={s} className="px-2 py-1 bg-stone-100 rounded text-xs font-bold text-stone-600">{s}</span>
                          ))}
                      </div>
                  </div>
              </div>
          </div>

          {/* Right: Requirements Checklist */}
          <div className="w-96 bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden flex flex-col">
              <div className="p-4 border-b border-stone-100 bg-stone-50 flex justify-between items-center">
                  <div className="flex items-center gap-2 text-xs font-bold text-stone-500 uppercase tracking-widest">
                      <Briefcase size={14} /> Job Requirements
                  </div>
              </div>
              <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  
                  {/* AI Analysis */}
                  <div className="p-4 bg-blue-50 rounded-xl border border-blue-100">
                      <div className="flex items-center gap-2 text-blue-800 font-bold text-xs uppercase tracking-widest mb-2">
                          <Zap size={14} /> AI Fit Analysis
                      </div>
                      <p className="text-xs text-blue-700 leading-relaxed">
                          Strong technical match (92%). Candidate specifically mentions migration experience which is a key plus for this role. Potential gap in integration patterns.
                      </p>
                  </div>

                  {/* Checklist */}
                  <div className="space-y-3">
                      {requirements.map(req => (
                          <div key={req.id} className="p-3 rounded-xl border border-stone-100 hover:bg-stone-50 transition-colors cursor-pointer group">
                              <div className="flex items-start gap-3">
                                  <div className={`mt-0.5 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${req.met ? 'bg-green-500 border-green-500 text-white' : 'border-stone-300'}`}>
                                      {req.met && <CheckCircle size={12} />}
                                  </div>
                                  <div>
                                      <p className="text-sm font-bold text-charcoal leading-tight">{req.text}</p>
                                      <p className="text-xs text-stone-400 mt-1 group-hover:text-stone-500">{req.evidence}</p>
                                  </div>
                              </div>
                          </div>
                      ))}
                  </div>

                  {/* Interview Prep */}
                  <div>
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 flex items-center gap-2">
                          <HelpCircle size={12} /> Recommended Questions
                      </h4>
                      <ul className="space-y-2 text-sm text-stone-600">
                          <li className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                              "Can you elaborate on the specific integration patterns you used at Global Insure?"
                          </li>
                          <li className="p-3 bg-stone-50 rounded-lg border border-stone-100">
                              "Describe a challenging rating engine configuration you solved."
                          </li>
                      </ul>
                  </div>

                  {/* Notes */}
                  <div>
                      <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Recruiter Notes</h4>
                      <textarea 
                        className="w-full h-24 p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                        placeholder="Add internal notes..."
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                      />
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
