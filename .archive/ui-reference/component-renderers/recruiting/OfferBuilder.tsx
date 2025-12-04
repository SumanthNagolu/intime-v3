'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, DollarSign, Calendar, Send, Download } from 'lucide-react';
import { useAppStore } from '../../lib/store';

export const OfferBuilder: React.FC = () => {
  const { submissionId } = useParams(); // Submission ID passed in URL
  const router = useRouter();
  const { submissions, updateSubmission } = useAppStore();
  const [step, setStep] = useState<'draft' | 'review' | 'sent'>('draft');
  
  const [formData, setFormData] = useState({
      salary: '$110,000',
      bonus: '10%',
      equity: '0.05%',
      startDate: '',
      benefits: 'Standard Package A'
  });

  const submission = submissions.find(s => s.id === submissionId);

  const handleSendOffer = () => {
      if (submission) {
          updateSubmission({ 
              ...submission, 
              status: 'offer', 
              lastActivity: 'Offer Sent' 
          });
      }
      setTimeout(() => setStep('sent'), 1500);
  };

  if (!submission) return <div>Submission Context Not Found</div>;

  return (
    <div className="animate-fade-in pt-4 max-w-4xl mx-auto">
      <Link href="/employee/recruiting/pipeline" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Pipeline
      </Link>

      {step === 'sent' ? (
          <div className="bg-white rounded-[2.5rem] p-16 shadow-2xl text-center border border-stone-200">
              <div className="w-24 h-24 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 animate-bounce">
                  <Send size={40} />
              </div>
              <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">Offer Sent!</h1>
              <p className="text-stone-500 max-w-md mx-auto mb-10 text-lg">
                  The candidate has received the digital offer packet via email and SMS. 
                  You will be notified immediately upon view and signature.
              </p>
              <div className="flex justify-center gap-4">
                  <button onClick={() => router.push('/employee/recruiting/dashboard')} className="px-8 py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg">
                      Return to Dashboard
                  </button>
                  <button onClick={() => router.push('/employee/recruiting/pipeline')} className="px-8 py-4 bg-stone-50 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-100 transition-colors">
                      View Pipeline
                  </button>
              </div>
          </div>
      ) : (
          <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden flex flex-col md:flex-row min-h-[700px]">
              
              {/* Left: Form */}
              <div className="w-full md:w-1/2 p-10 border-r border-stone-100 flex flex-col">
                  <div className="mb-8">
                      <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Closing</div>
                      <h1 className="text-3xl font-serif font-bold text-charcoal">Offer Builder</h1>
                  </div>

                  <div className="space-y-6 flex-1">
                      <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Base Salary (Annual)</label>
                          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200 focus-within:border-rust focus-within:ring-2 focus-within:ring-rust/20 transition-all">
                              <DollarSign size={18} className="text-stone-400" />
                              <input 
                                value={formData.salary} 
                                onChange={e => setFormData({...formData, salary: e.target.value})}
                                className="bg-transparent outline-none font-bold text-charcoal w-full" 
                              />
                          </div>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <div>
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Target Bonus</label>
                              <input 
                                value={formData.bonus}
                                onChange={e => setFormData({...formData, bonus: e.target.value})}
                                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-rust" 
                              />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Equity / Options</label>
                              <input 
                                value={formData.equity}
                                onChange={e => setFormData({...formData, equity: e.target.value})}
                                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-rust" 
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Start Date</label>
                          <div className="flex items-center gap-3 p-4 bg-stone-50 rounded-xl border border-stone-200">
                              <Calendar size={18} className="text-stone-400" />
                              <input 
                                type="date"
                                value={formData.startDate}
                                onChange={e => setFormData({...formData, startDate: e.target.value})}
                                className="bg-transparent outline-none font-bold text-charcoal w-full" 
                              />
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Benefits Package</label>
                          <select 
                            value={formData.benefits}
                            onChange={e => setFormData({...formData, benefits: e.target.value})}
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-rust"
                          >
                              <option>Standard Package A</option>
                              <option>Executive Package B</option>
                              <option>Contractor (None)</option>
                          </select>
                      </div>
                  </div>
              </div>

              {/* Right: Preview */}
              <div className="w-full md:w-1/2 bg-stone-50 p-10 flex flex-col">
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-stone-200 flex-1 mb-8 relative overflow-hidden">
                      <div className="absolute top-0 left-0 w-full h-1 bg-charcoal"></div>
                      <div className="text-right mb-8">
                          <div className="text-2xl font-serif font-bold text-charcoal">InTime</div>
                      </div>
                      <div className="space-y-6 opacity-80 select-none pointer-events-none">
                          <p className="text-xs font-bold uppercase tracking-widest text-stone-400">Private & Confidential</p>
                          <p className="font-serif text-lg">Dear Candidate,</p>
                          <p className="text-sm leading-relaxed">
                              We are pleased to offer you the position of <strong>Senior Developer</strong>. 
                              Your starting salary will be <strong>{formData.salary}</strong> per year, 
                              commencing on <strong>{formData.startDate || '[Date]'}</strong>.
                          </p>
                          <div className="bg-stone-50 p-4 rounded-lg border border-stone-100 text-sm space-y-2">
                              <div className="flex justify-between"><span>Bonus:</span> <span>{formData.bonus}</span></div>
                              <div className="flex justify-between"><span>Equity:</span> <span>{formData.equity}</span></div>
                              <div className="flex justify-between"><span>Benefits:</span> <span>{formData.benefits}</span></div>
                          </div>
                      </div>
                  </div>

                  <div className="flex flex-col gap-4">
                      <button className="flex items-center justify-center gap-2 w-full py-3 bg-white border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:border-charcoal transition-colors">
                          <Download size={16} /> Preview PDF
                      </button>
                      <button 
                        onClick={handleSendOffer}
                        className="flex items-center justify-center gap-2 w-full py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-600 transition-all shadow-lg"
                      >
                          Send Offer <Send size={16} />
                      </button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};
