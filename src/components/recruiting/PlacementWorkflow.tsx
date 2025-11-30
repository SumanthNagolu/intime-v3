'use client';


import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { CheckCircle, Calendar, FileText, Users, PartyPopper, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../lib/store';

export const PlacementWorkflow: React.FC = () => {
  const { submissionId } = useParams();
  const router = useRouter();
  const { submissions, updateSubmission, jobs, updateJob, candidates, updateCandidate } = useAppStore();
  
  const submission = submissions.find(s => s.id === submissionId);
  const [step, setStep] = useState(1);
  const [isComplete, setIsComplete] = useState(false);

  if (!submission) return <div>Submission not found</div>;

  const handleFinish = () => {
      // Update Store
      updateSubmission({ ...submission, status: 'placed', lastActivity: 'Placed today' });
      
      const job = jobs.find(j => j.id === submission.jobId);
      if (job) updateJob({ ...job, status: 'filled' });

      const candidate = candidates.find(c => c.id === submission.candidateId);
      if (candidate) updateCandidate({ ...candidate, status: 'placed' });

      setIsComplete(true);
  };

  const handleNext = () => {
      if (step < 3) setStep(step + 1);
      else handleFinish();
  };

  if (isComplete) {
      return (
          <div className="flex flex-col items-center justify-center min-h-[80vh] animate-fade-in text-center">
              <div className="w-32 h-32 bg-gradient-to-br from-yellow-300 to-orange-400 rounded-full flex items-center justify-center mb-8 shadow-2xl animate-bounce">
                  <PartyPopper size={60} className="text-white" />
              </div>
              <h1 className="text-5xl font-serif font-bold text-charcoal mb-4">Placement Confirmed!</h1>
              <p className="text-xl text-stone-500 mb-12 max-w-xl">
                  Congratulations on the hire. The onboarding workflow has been triggered for HR and IT. 
                  Revenue has been attributed to your dashboard.
              </p>
              <button 
                onClick={() => router.push('/employee/recruiting/dashboard')}
                className="px-12 py-5 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-xl"
              >
                  Back to Dashboard
              </button>
          </div>
      );
  }

  return (
    <div className="animate-fade-in pt-4 max-w-3xl mx-auto">
      <div className="mb-10 text-center">
        <div className="text-green-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">Finalization</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Confirm Placement</h1>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden">
          {/* Progress Bar */}
          <div className="bg-stone-50 p-8 border-b border-stone-100">
              <div className="flex items-center justify-between relative">
                  <div className="absolute left-0 right-0 top-1/2 h-1 bg-stone-200 -z-10"></div>
                  {[1, 2, 3].map(s => (
                      <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          step >= s ? 'bg-charcoal text-white' : 'bg-white border-2 border-stone-200 text-stone-300'
                      }`}>
                          {step > s ? <CheckCircle size={16}/> : s}
                      </div>
                  ))}
              </div>
              <div className="flex justify-between mt-2 text-xs font-bold text-stone-400 uppercase tracking-widest px-2">
                  <span>Start Date</span>
                  <span>Docs</span>
                  <span>Handoff</span>
              </div>
          </div>

          <div className="p-12">
              {step === 1 && (
                  <div className="space-y-8 animate-slide-up">
                      <div className="text-center mb-8">
                          <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Confirm Start Date</h3>
                          <p className="text-stone-500">When is the candidate&apos;s Day 1?</p>
                      </div>
                      
                      <div className="flex justify-center">
                          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 inline-flex items-center gap-4">
                              <Calendar size={24} className="text-rust" />
                              <input type="date" className="bg-transparent text-2xl font-bold text-charcoal outline-none" />
                          </div>
                      </div>

                      <div className="flex items-center gap-3 p-4 bg-yellow-50 rounded-xl border border-yellow-100 text-yellow-800 text-sm max-w-md mx-auto">
                          <div className="w-2 h-2 rounded-full bg-yellow-600 shrink-0"></div>
                          Warning: IT requires 5 days lead time for laptop provisioning.
                      </div>
                  </div>
              )}

              {step === 2 && (
                  <div className="space-y-6 animate-slide-up">
                      <div className="text-center mb-8">
                          <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Document Check</h3>
                          <p className="text-stone-500">Ensure all signed documents are uploaded.</p>
                      </div>

                      <div className="space-y-4 max-w-md mx-auto">
                          {['Signed Offer Letter', 'NDA / IP Agreement', 'Background Check Auth'].map((doc, i) => (
                              <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                                  <div className="flex items-center gap-3">
                                      <FileText size={18} className="text-stone-400" />
                                      <span className="font-bold text-charcoal text-sm">{doc}</span>
                                  </div>
                                  <div className="w-6 h-6 rounded-full bg-green-100 text-green-600 flex items-center justify-center">
                                      <CheckCircle size={14} />
                                  </div>
                              </div>
                          ))}
                      </div>
                  </div>
              )}

              {step === 3 && (
                  <div className="space-y-8 animate-slide-up">
                      <div className="text-center mb-8">
                          <h3 className="text-2xl font-serif font-bold text-charcoal mb-2">Internal Handoff</h3>
                          <p className="text-stone-500">Notify stakeholders.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-4 max-w-lg mx-auto">
                          <div className="p-6 bg-stone-50 rounded-2xl border border-stone-200 text-center opacity-50">
                              <Users size={32} className="mx-auto mb-3 text-stone-400" />
                              <div className="font-bold text-charcoal">HR Manager</div>
                              <div className="text-xs text-stone-400 uppercase tracking-widest mt-1">Notified</div>
                          </div>
                          <div className="p-6 bg-blue-50 rounded-2xl border border-blue-100 text-center">
                              <Users size={32} className="mx-auto mb-3 text-blue-600" />
                              <div className="font-bold text-charcoal">Account Manager</div>
                              <div className="text-xs text-blue-600 uppercase tracking-widest mt-1">Pending</div>
                          </div>
                      </div>
                  </div>
              )}

              <div className="mt-12 flex justify-end pt-8 border-t border-stone-100">
                  <button 
                    onClick={handleNext}
                    className="px-10 py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2"
                  >
                      {step === 3 ? 'Finish & Celebrate' : 'Next Step'} <ArrowRight size={16} />
                  </button>
              </div>
          </div>
      </div>
    </div>
  );
};
