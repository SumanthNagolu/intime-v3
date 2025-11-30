'use client';


import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, FileText, Mail, Send, Wand2, CheckCircle, Eye, Paperclip, Calendar, MessageSquare, ThumbsUp, ThumbsDown, DollarSign, Award, ArrowRight } from 'lucide-react';
import { Submission } from '../../types';

export const SubmissionBuilder: React.FC = () => {
  const params = useParams();
  const candidateId = typeof params.candidateId === 'string' ? params.candidateId : '';
  const jobId = typeof params.jobId === 'string' ? params.jobId : '';
  const router = useRouter();
  const { candidates, jobs, submissions, updateSubmission, addSubmission } = useAppStore();

  const candidate = candidates.find(c => c.id === candidateId);
  // Ensure we can find jobs even if they are 'external' (mocked by ensuring they exist in store or handling gracefully)
  const job = jobs.find(j => j.id === jobId);
  const existingSubmission = submissions.find(s => s.candidateId === candidateId && s.jobId === jobId);
  
  // Lifecycle State
  const [currentStatus, setCurrentStatus] = useState<Submission['status']>('sourced');
  
  // Builder State
  const [step, setStep] = useState<'resume' | 'documents' | 'email' | 'review'>('resume');
  const [isProcessing, setIsProcessing] = useState(false);
  const [emailBody, setEmailBody] = useState('');
  
  // Interview State
  const [interviewRound, setInterviewRound] = useState(1);
  const [interviewNote, setInterviewNote] = useState('');

  // Document State
  const [documents, setDocuments] = useState([
      { id: 1, name: 'Technical_Assessment.pdf', type: 'Assessment', uploaded: true },
      { id: 2, name: 'Right_to_Represent.pdf', type: 'Compliance', uploaded: false },
      { id: 3, name: 'Certifications.zip', type: 'Credentials', uploaded: false }
  ]);

  useEffect(() => {
      if (existingSubmission) {
          setCurrentStatus(existingSubmission.status);
          // Infer interview round from lastActivity if possible (mock logic)
          if (existingSubmission.lastActivity?.includes('Round 2')) setInterviewRound(2);
          if (existingSubmission.lastActivity?.includes('Round 3')) setInterviewRound(3);
      } else {
          // Default to drafting if no submission exists
          setCurrentStatus('sourced'); 
      }
  }, [existingSubmission]);

  if (!candidate) return <div>Candidate not found</div>;
  if (!job) return <div>Job not found. If this is an external job, ensure it was added to the Market Board first.</div>;

  // --- ACTIONS ---

  const handleGenerateEmail = () => {
      setIsProcessing(true);
      setTimeout(() => {
          setEmailBody(`Subject: Strong Match: Senior PolicyCenter Developer - ${candidate.name}\n\nHi [Hiring Manager Name],\n\nI'm excited to present ${candidate.name} for the ${job.title} role.\n\n${candidate.name} brings ${candidate.experience} of specialized experience in Guidewire implementation, with a strong focus on the exact skills you need: ${candidate.skills.slice(0,3).join(', ')}.\n\nKey Highlights:\n- Led migration project at TechFlow (Directly relevant to your Q4 goals)\n- Certified in PolicyCenter 10\n- Available to start immediately\n\nI've attached the tailored resume and all compliance documents. They are available for an interview this Thursday or Friday.\n\nBest,\n[Your Name]`);
          setIsProcessing(false);
          setStep('documents'); 
      }, 1500);
  };

  const toggleDocument = (id: number) => {
      setDocuments(documents.map(d => d.id === id ? { ...d, uploaded: !d.uploaded } : d));
  };

  const handleFinalSubmit = () => {
      setIsProcessing(true);
      setTimeout(() => {
          if (existingSubmission) {
              updateSubmission({
                  ...existingSubmission,
                  status: 'submitted_to_client',
                  lastActivity: 'Submitted to Client'
              });
          } else {
              const newSubmission: Submission = {
                  id: `sub${Date.now()}`,
                  jobId: jobId,
                  candidateId: candidateId,
                  status: 'submitted_to_client',
                  createdAt: new Date().toLocaleDateString(),
                  lastActivity: 'Submitted to Client',
                  matchScore: candidate.score
              };
              addSubmission(newSubmission);
          }
          setCurrentStatus('submitted_to_client');
          setIsProcessing(false);
      }, 1500);
  };

  const handleStatusUpdate = (newStatus: Submission['status'], activity: string) => {
      if (existingSubmission) {
          updateSubmission({
              ...existingSubmission,
              status: newStatus,
              lastActivity: activity
          });
          setCurrentStatus(newStatus);
          
          // Handle specific navigation
          if (newStatus === 'offer') router.push(`/employee/recruiting/offer/${existingSubmission.id}`);
          if (newStatus === 'placed') router.push(`/employee/recruiting/placement/${existingSubmission.id}`);
      }
  };

  const handleNextRound = () => {
      const nextRound = interviewRound + 1;
      setInterviewRound(nextRound);
      handleStatusUpdate('client_interview', `Completed Round ${interviewRound}, Advancing to Round ${nextRound}`);
      setInterviewNote('');
  };

  // Determine back link based on candidate type (Bench vs Recruiting)
  const backLink = candidate.type === 'internal_bench' 
      ? `/employee/bench/talent/${candidate.id}` 
      : `/employee/recruiting/jobs/${jobId}`;

  // --- RENDERERS ---

  // VIEW: DRAFTING (Sourced, Screening, Submission Ready)
  if (['sourced', 'screening', 'submission_ready'].includes(currentStatus)) {
      return (
        <div className="animate-fade-in pt-4 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
          <div className="mb-8 flex justify-between items-center border-b border-stone-200 pb-6 shrink-0">
              <div className="flex items-center gap-4">
                  <Link href={backLink} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-charcoal">
                      <ChevronLeft size={20} />
                  </Link>
                  <div>
                      <h1 className="text-2xl font-serif font-bold text-charcoal">Submission Builder</h1>
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-medium uppercase tracking-wide mt-1">
                          <span>Preparing: {candidate.name}</span>
                          <span className="text-stone-300">→</span>
                          <span>{job.client} ({job.title})</span>
                      </div>
                  </div>
              </div>
              <div className="flex bg-stone-100 p-1 rounded-full">
                  {['resume', 'documents', 'email', 'review'].map((s) => (
                      <div 
                          key={s}
                          onClick={() => setStep(s as any)}
                          className={`px-6 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all cursor-pointer ${
                              step === s ? 'bg-white text-charcoal shadow-sm' : 'text-stone-400 hover:text-stone-600'
                          }`}
                      >
                          {s}
                      </div>
                  ))}
              </div>
          </div>

          <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-stone-200 overflow-hidden flex flex-col">
              {/* RESUME STEP */}
              {step === 'resume' && (
                  <div className="flex-1 flex">
                      <div className="w-1/2 border-r border-stone-100 p-8 overflow-y-auto bg-stone-50">
                          <div className="flex justify-between items-center mb-6">
                              <h3 className="font-bold text-stone-400 text-xs uppercase tracking-widest">Original Resume</h3>
                              <button className="text-xs font-bold text-rust hover:underline"><Eye size={14} className="inline mr-1"/> View PDF</button>
                          </div>
                          <div className="prose prose-sm prose-stone opacity-60 pointer-events-none select-none">
                              <p><strong>{candidate.name}</strong><br/>{candidate.location} | {candidate.email}</p>
                              <hr/>
                              <p><strong>Summary:</strong> {candidate.notes || "Experienced developer looking for new opportunities..."}</p>
                              <p><strong>Experience:</strong><br/>- TechFlow: Senior Developer (3 yrs)<br/>- Global Insure: Specialist (2 yrs)</p>
                          </div>
                      </div>
                      <div className="w-1/2 p-8 flex flex-col">
                          <div className="mb-6">
                              <h3 className="font-bold text-charcoal text-lg mb-2">AI Formatting Engine</h3>
                              <p className="text-stone-500 text-sm">Optimizing resume for {job.client} requirements.</p>
                          </div>
                          <div className="space-y-4 mb-8">
                              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                                  <div className="flex items-center gap-3">
                                      <CheckCircle size={18} className="text-green-500" />
                                      <span className="text-sm font-bold text-charcoal">Anonymize Contact Info</span>
                                  </div>
                                  <span className="text-xs text-stone-400">Applied</span>
                              </div>
                              <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-200">
                                  <div className="flex items-center gap-3">
                                      <CheckCircle size={18} className="text-green-500" />
                                      <span className="text-sm font-bold text-charcoal">Highlight "Migration" Skills</span>
                                  </div>
                                  <span className="text-xs text-stone-400">Applied (Matches JD)</span>
                              </div>
                          </div>
                          <div className="mt-auto flex justify-end">
                              <button onClick={handleGenerateEmail} disabled={isProcessing} className="px-8 py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2">
                                  {isProcessing ? 'Analyzing...' : 'Next: Documents'} <Wand2 size={16} />
                              </button>
                          </div>
                      </div>
                  </div>
              )}

              {/* DOCUMENTS STEP */}
              {step === 'documents' && (
                  <div className="flex-1 p-12 flex flex-col">
                      <div className="mb-8">
                          <h3 className="font-bold text-charcoal text-lg mb-2">Required Documents</h3>
                          <p className="text-stone-500 text-sm">Ensure all necessary files are attached.</p>
                      </div>
                      <div className="space-y-4 max-w-2xl">
                          {documents.map(doc => (
                              <div key={doc.id} className={`flex items-center justify-between p-4 rounded-xl border transition-colors ${doc.uploaded ? 'bg-stone-50 border-stone-200' : 'bg-white border-stone-200 border-dashed'}`}>
                                  <div className="flex items-center gap-4">
                                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center shadow-sm ${doc.uploaded ? 'bg-white text-stone-500' : 'bg-stone-50 text-stone-300'}`}>
                                          <Paperclip size={20} />
                                      </div>
                                      <div>
                                          <div className="font-bold text-charcoal text-sm">{doc.name}</div>
                                          <div className="text-[10px] font-bold text-stone-400 uppercase tracking-widest">{doc.type}</div>
                                      </div>
                                  </div>
                                  <button onClick={() => toggleDocument(doc.id)} className={`px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${doc.uploaded ? 'text-red-500 hover:bg-red-50' : 'bg-charcoal text-white hover:bg-rust'}`}>
                                      {doc.uploaded ? 'Remove' : 'Upload'}
                                  </button>
                              </div>
                          ))}
                      </div>
                      <div className="mt-auto flex justify-end gap-4">
                          <button onClick={() => setStep('resume')} className="px-6 py-4 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">Back</button>
                          <button onClick={() => setStep('email')} className="px-8 py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2">
                              Next: Draft Email <Mail size={16} />
                          </button>
                      </div>
                  </div>
              )}

              {/* EMAIL STEP */}
              {step === 'email' && (
                  <div className="flex-1 p-12 flex flex-col">
                      <div className="mb-6 flex justify-between items-end">
                          <div>
                              <h3 className="font-bold text-charcoal text-lg mb-2">Submission Email</h3>
                              <p className="text-stone-500 text-sm">AI generated pitch based on match highlights.</p>
                          </div>
                          <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">To: Hiring Manager @ {job.client}</div>
                      </div>
                      <textarea value={emailBody} onChange={(e) => setEmailBody(e.target.value)} className="flex-1 p-6 bg-stone-50 border border-stone-200 rounded-2xl focus:outline-none focus:border-rust font-mono text-sm leading-relaxed resize-none shadow-inner" />
                      <div className="mt-8 flex justify-end gap-4">
                          <button onClick={() => setStep('documents')} className="px-6 py-4 text-stone-500 font-bold text-xs uppercase tracking-widest hover:text-charcoal">Back</button>
                          <button onClick={() => setStep('review')} className="px-8 py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2">
                              Review Package <CheckCircle size={16} />
                          </button>
                      </div>
                  </div>
              )}

              {/* REVIEW STEP */}
              {step === 'review' && (
                  <div className="flex-1 p-12 flex flex-col items-center justify-center text-center">
                      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mb-8">
                          <Send size={40} className="text-green-600 ml-2" />
                      </div>
                      <h3 className="text-3xl font-serif font-bold text-charcoal mb-4">Ready to Submit?</h3>
                      <p className="text-stone-500 max-w-md mb-8">You are about to submit <strong>{candidate.name}</strong> to <strong>{job.client}</strong>. The Hiring Manager will receive the packet immediately.</p>
                      <div className="flex gap-4">
                          <button onClick={() => setStep('email')} className="px-8 py-4 border border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors">Edit Details</button>
                          <button onClick={handleFinalSubmit} disabled={isProcessing} className="px-10 py-4 bg-rust text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#B8421E] transition-all shadow-lg flex items-center gap-2">
                              {isProcessing ? 'Sending...' : 'Confirm Submission'} <Send size={16} />
                          </button>
                      </div>
                  </div>
              )}
          </div>
        </div>
      );
  }

  // VIEW: SUBMITTED
  if (currentStatus === 'submitted_to_client') {
      return (
          <div className="animate-fade-in pt-4 max-w-4xl mx-auto h-[calc(100vh-140px)] flex flex-col">
              <Link href={backLink} className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
                  <ChevronLeft size={14} /> Back to Pipeline
              </Link>
              
              <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden flex flex-col items-center text-center p-16 flex-1 justify-center">
                  <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-8">
                      <CheckCircle size={40} />
                  </div>
                  <h2 className="text-4xl font-serif font-bold text-charcoal mb-2">Submission Sent</h2>
                  <p className="text-stone-500 mb-12 max-w-md">
                      Candidate packet is with the client. Awaiting feedback.
                  </p>

                  <div className="bg-stone-50 p-8 rounded-2xl border border-stone-100 w-full max-w-lg mb-12 text-left">
                      <h3 className="font-bold text-charcoal text-sm mb-4 uppercase tracking-widest">Status Control</h3>
                      <div className="grid grid-cols-2 gap-4">
                          <button 
                            onClick={() => handleStatusUpdate('client_interview', 'Client Requested Interview')}
                            className="p-4 bg-white border border-stone-200 rounded-xl hover:border-rust hover:bg-rust/5 hover:text-rust transition-all group text-center"
                          >
                              <Calendar size={24} className="mx-auto mb-2 text-stone-400 group-hover:text-rust" />
                              <div className="font-bold text-sm">Request Interview</div>
                          </button>
                          <button 
                            onClick={() => handleStatusUpdate('rejected', 'Client Rejected')}
                            className="p-4 bg-white border border-stone-200 rounded-xl hover:border-red-400 hover:bg-red-50 hover:text-red-600 transition-all group text-center"
                          >
                              <FileText size={24} className="mx-auto mb-2 text-stone-400 group-hover:text-red-500" />
                              <div className="font-bold text-sm">Client Rejected</div>
                          </button>
                      </div>
                  </div>
                  
                  <div className="text-xs text-stone-400">
                      Submission ID: {existingSubmission?.id} • {existingSubmission?.createdAt}
                  </div>
              </div>
          </div>
      );
  }

  // VIEW: INTERVIEWING
  if (currentStatus === 'client_interview') {
      return (
          <div className="animate-fade-in pt-4 max-w-5xl mx-auto h-[calc(100vh-140px)] flex flex-col">
              <div className="mb-8 flex justify-between items-center border-b border-stone-200 pb-6">
                  <div className="flex items-center gap-4">
                      <Link href={backLink} className="p-2 hover:bg-stone-100 rounded-full transition-colors text-stone-400 hover:text-charcoal">
                          <ChevronLeft size={20} />
                      </Link>
                      <div>
                          <h1 className="text-2xl font-serif font-bold text-charcoal">Interview Loop</h1>
                          <div className="flex items-center gap-2 text-xs text-stone-500 font-medium uppercase tracking-wide mt-1">
                              <span className="text-purple-600 font-bold">Active Interviewing</span>
                              <span className="text-stone-300">•</span>
                              <span>Round {interviewRound}</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="flex flex-col lg:flex-row gap-8 flex-1">
                  {/* LEFT: Timeline */}
                  <div className="w-full lg:w-1/3 bg-white rounded-[2rem] shadow-lg border border-stone-200 p-8">
                      <h3 className="font-bold text-stone-400 text-xs uppercase tracking-widest mb-6">Process Timeline</h3>
                      <div className="space-y-6 relative">
                          <div className="absolute left-3 top-2 bottom-2 w-px bg-stone-100"></div>
                          {/* History */}
                          <div className="relative pl-8 opacity-50">
                              <div className="absolute left-0 top-0 w-6 h-6 rounded-full bg-stone-200 flex items-center justify-center"><CheckCircle size={12} className="text-white"/></div>
                              <div className="text-sm font-bold text-charcoal">Submission</div>
                              <div className="text-xs text-stone-400">Sent to Manager</div>
                          </div>
                          {/* Current Rounds */}
                          {[...Array(interviewRound)].map((_, i) => (
                              <div key={i} className="relative pl-8">
                                  <div className={`absolute left-0 top-0 w-6 h-6 rounded-full flex items-center justify-center ${i + 1 === interviewRound ? 'bg-purple-600 text-white shadow-lg ring-4 ring-purple-50' : 'bg-green-500 text-white'}`}>
                                      {i + 1 === interviewRound ? <Calendar size={12}/> : <CheckCircle size={12}/>}
                                  </div>
                                  <div className={`text-sm font-bold ${i + 1 === interviewRound ? 'text-purple-700' : 'text-charcoal'}`}>Round {i + 1} Interview</div>
                                  <div className="text-xs text-stone-400">{i + 1 === interviewRound ? 'In Progress' : 'Completed'}</div>
                              </div>
                          ))}
                      </div>
                  </div>

                  {/* RIGHT: Controls */}
                  <div className="flex-1 bg-white rounded-[2rem] shadow-xl border border-stone-200 p-10 flex flex-col">
                      <div className="mb-8">
                          <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">Log Round {interviewRound} Feedback</h2>
                          <p className="text-stone-500">Record the outcome to proceed.</p>
                      </div>

                      <textarea 
                          value={interviewNote}
                          onChange={(e) => setInterviewNote(e.target.value)}
                          placeholder="Enter feedback notes from the client..."
                          className="w-full h-32 p-4 bg-stone-50 border border-stone-200 rounded-xl mb-8 focus:outline-none focus:border-purple-500 resize-none"
                      />

                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <button 
                              onClick={handleNextRound}
                              className="p-4 rounded-xl bg-stone-50 border border-stone-200 hover:bg-white hover:border-purple-500 hover:shadow-lg transition-all group text-left"
                          >
                              <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                  <ArrowRight size={20} />
                              </div>
                              <div className="font-bold text-charcoal text-sm">Next Round</div>
                              <div className="text-[10px] text-stone-400 uppercase tracking-wider mt-1">Schedule</div>
                          </button>

                          <button 
                              onClick={() => handleStatusUpdate('offer', 'Moving to Offer Stage')}
                              className="p-4 rounded-xl bg-stone-50 border border-stone-200 hover:bg-green-50 hover:border-green-500 hover:shadow-lg transition-all group text-left"
                          >
                              <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                  <Award size={20} />
                              </div>
                              <div className="font-bold text-green-800 text-sm">Make Offer</div>
                              <div className="text-[10px] text-green-600 uppercase tracking-wider mt-1">Success</div>
                          </button>

                          <button 
                              onClick={() => handleStatusUpdate('rejected', 'Failed at Interview')}
                              className="p-4 rounded-xl bg-stone-50 border border-stone-200 hover:bg-red-50 hover:border-red-500 hover:shadow-lg transition-all group text-left"
                          >
                              <div className="w-10 h-10 rounded-full bg-red-100 text-red-600 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                                  <ThumbsDown size={20} />
                              </div>
                              <div className="font-bold text-red-800 text-sm">Reject</div>
                              <div className="text-[10px] text-red-600 uppercase tracking-wider mt-1">Archive</div>
                          </button>
                      </div>
                  </div>
              </div>
          </div>
      );
  }

  // VIEW: OFFER / PLACED
  // Normally handled by specific components, but as a fallback/router:
  if (currentStatus === 'offer') {
      // Redirect handled in handleStatusUpdate, but render placeholder if landing directly
      return (
          <div className="flex items-center justify-center h-[60vh]">
              <div className="text-center">
                  <h2 className="text-2xl font-bold text-charcoal mb-4">Offer Stage Active</h2>
                  <Link href={`/employee/recruiting/offer/${existingSubmission?.id}`} className="px-8 py-3 bg-green-600 text-white rounded-full font-bold hover:bg-green-700 transition-colors">
                      Go to Offer Builder
                  </Link>
              </div>
          </div>
      );
  }

  return <div>Loading...</div>;
};
