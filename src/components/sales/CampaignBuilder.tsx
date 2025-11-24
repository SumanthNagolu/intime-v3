'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { UserPlus, Linkedin, Mail, Sparkles, Target, Send, ChevronLeft, CheckCircle, Users, ArrowRight, Wand2, LayoutTemplate } from 'lucide-react';

export const CampaignBuilder: React.FC = () => {
  const router = useRouter();
  const [step, setStep] = useState(1);
  const [channel, setChannel] = useState<'linkedin' | 'email'>('linkedin');
  const [targetType, setTargetType] = useState<'Client' | 'Candidate'>('Candidate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedContent, setGeneratedContent] = useState('');

  const handleGenerate = () => {
      setIsGenerating(true);
      setTimeout(() => {
          setGeneratedContent(
              targetType === 'Candidate' 
              ? "Hi {{FirstName}}, came across your profile and noticed your deep expertise in Guidewire PolicyCenter. We are building a specialized practice and looking for leaders. Would you be open to a chat?" 
              : "Hi {{FirstName}}, I noticed {{Company}} is undergoing digital transformation. We have a bench of Senior PC 10 Certified devs ready to deploy in 48 hours. Worth a discussion?"
          );
          setIsGenerating(false);
      }, 1500);
  };

  const handleLaunch = () => {
      alert("Campaign Launched!");
      router.push('/employee/ta/dashboard');
  };

  return (
    <div className="animate-fade-in pt-4 max-w-5xl mx-auto">
      <Link href="/employee/ta/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-2xl border border-stone-200 overflow-hidden flex flex-col min-h-[700px]">
          
          {/* Header / Stepper */}
          <div className="bg-stone-50 px-12 py-8 border-b border-stone-100 flex justify-between items-center">
              <div>
                  <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Campaign Builder</div>
                  <h1 className="text-3xl font-serif font-bold text-charcoal">New Outreach</h1>
              </div>
              <div className="flex items-center gap-4">
                  {[1, 2, 3].map(s => (
                      <div key={s} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all ${
                          step >= s ? 'bg-charcoal text-white' : 'bg-white border-2 border-stone-200 text-stone-300'
                      }`}>
                          {step > s ? <CheckCircle size={16}/> : s}
                      </div>
                  ))}
              </div>
          </div>

          <div className="flex-1 p-12">
              {step === 1 && (
                  <div className="max-w-2xl mx-auto space-y-10 animate-slide-up">
                      <div className="text-center mb-8">
                          <h2 className="text-2xl font-bold text-charcoal mb-2">Strategy & Targeting</h2>
                          <p className="text-stone-500">Define who you are hunting.</p>
                      </div>

                      <div className="grid grid-cols-2 gap-6">
                          <button 
                            onClick={() => setTargetType('Candidate')}
                            className={`p-6 rounded-2xl border-2 text-center transition-all group ${targetType === 'Candidate' ? 'border-rust bg-rust/5' : 'border-stone-100 hover:border-stone-300'}`}
                          >
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${targetType === 'Candidate' ? 'bg-rust text-white' : 'bg-stone-100 text-stone-400'}`}>
                                  <UserPlus size={24} />
                              </div>
                              <div className="font-bold text-charcoal">Candidates</div>
                              <div className="text-xs text-stone-400 mt-1">Sourcing Talent</div>
                          </button>
                          <button 
                            onClick={() => setTargetType('Client')}
                            className={`p-6 rounded-2xl border-2 text-center transition-all group ${targetType === 'Client' ? 'border-blue-600 bg-blue-50' : 'border-stone-100 hover:border-stone-300'}`}
                          >
                              <div className={`w-14 h-14 rounded-full flex items-center justify-center mx-auto mb-4 ${targetType === 'Client' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                                  <Target size={24} />
                              </div>
                              <div className="font-bold text-charcoal">Clients</div>
                              <div className="text-xs text-stone-400 mt-1">Business Dev</div>
                          </button>
                      </div>

                      <div className="space-y-6">
                          <div>
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Campaign Name</label>
                              <input className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-bold text-charcoal" placeholder="e.g. Q4 Senior Dev Hunt" />
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Primary Channel</label>
                              <div className="flex gap-4">
                                  <button 
                                    onClick={() => setChannel('linkedin')}
                                    className={`flex-1 py-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${channel === 'linkedin' ? 'border-blue-600 bg-blue-50 text-blue-700' : 'border-stone-200 text-stone-400 hover:border-stone-300'}`}
                                  >
                                      <Linkedin size={20} /> LinkedIn
                                  </button>
                                  <button 
                                    onClick={() => setChannel('email')}
                                    className={`flex-1 py-4 rounded-xl border transition-all flex items-center justify-center gap-2 ${channel === 'email' ? 'border-charcoal bg-stone-100 text-charcoal' : 'border-stone-200 text-stone-400 hover:border-stone-300'}`}
                                  >
                                      <Mail size={20} /> Email
                                  </button>
                              </div>
                          </div>
                      </div>
                  </div>
              )}

              {step === 2 && (
                  <div className="max-w-4xl mx-auto flex gap-12 animate-slide-up">
                      <div className="flex-1 space-y-8">
                          <div className="mb-6">
                              <h2 className="text-2xl font-bold text-charcoal mb-2">AI Content Studio</h2>
                              <p className="text-stone-500">Generate high-conversion outreach messages.</p>
                          </div>

                          <div className="bg-white p-6 rounded-2xl border border-stone-200 shadow-lg">
                              <div className="flex justify-between items-center mb-4">
                                  <div className="flex items-center gap-2">
                                      <Sparkles size={18} className="text-purple-500" />
                                      <span className="text-sm font-bold text-charcoal">Message Generator</span>
                                  </div>
                                  <button onClick={handleGenerate} disabled={isGenerating} className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full hover:bg-purple-100 transition-colors">
                                      {isGenerating ? 'Writing...' : 'Auto-Write'}
                                  </button>
                              </div>
                              <textarea 
                                value={generatedContent}
                                onChange={(e) => setGeneratedContent(e.target.value)}
                                className="w-full h-64 p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-purple-500 resize-none font-mono text-sm leading-relaxed"
                                placeholder="Click Auto-Write or type your message..."
                              />
                          </div>
                      </div>

                      <div className="w-80 bg-stone-50 rounded-2xl p-6 border border-stone-200 h-fit">
                          <h3 className="font-bold text-charcoal text-sm mb-4">Merge Tags</h3>
                          <div className="space-y-2">
                              {['{{FirstName}}', '{{Company}}', '{{JobTitle}}', '{{Location}}'].map(tag => (
                                  <div key={tag} className="p-2 bg-white border border-stone-200 rounded-lg text-xs font-mono text-stone-500 cursor-pointer hover:border-rust hover:text-rust transition-colors">
                                      {tag}
                                  </div>
                              ))}
                          </div>
                          
                          <h3 className="font-bold text-charcoal text-sm mt-8 mb-4">AI Tips</h3>
                          <p className="text-xs text-stone-500 leading-relaxed">
                              Keep subject lines under 50 characters. Mentioning the candidate's specific tech stack increases reply rates by 22%.
                          </p>
                      </div>
                  </div>
              )}

              {step === 3 && (
                  <div className="max-w-3xl mx-auto text-center animate-slide-up">
                      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-8">
                          <Target size={40} className="text-green-600" />
                      </div>
                      <h2 className="text-4xl font-serif font-bold text-charcoal mb-4">Ready to Launch?</h2>
                      <p className="text-xl text-stone-500 mb-12">
                          You are targeting <strong className="text-charcoal">142 profiles</strong>. 
                          Estimated first replies in <strong className="text-charcoal">4 hours</strong>.
                      </p>

                      <div className="bg-white border border-stone-200 rounded-2xl p-8 text-left max-w-lg mx-auto mb-12 shadow-sm">
                          <h4 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-4">Campaign Summary</h4>
                          <div className="space-y-3 text-sm">
                              <div className="flex justify-between border-b border-stone-100 pb-2">
                                  <span className="text-stone-500">Target</span>
                                  <span className="font-bold text-charcoal">{targetType}s</span>
                              </div>
                              <div className="flex justify-between border-b border-stone-100 pb-2">
                                  <span className="text-stone-500">Channel</span>
                                  <span className="font-bold text-charcoal capitalize">{channel}</span>
                              </div>
                              <div className="flex justify-between">
                                  <span className="text-stone-500">Audience Size</span>
                                  <span className="font-bold text-charcoal">142</span>
                              </div>
                          </div>
                      </div>
                  </div>
              )}
          </div>

          {/* Footer Controls */}
          <div className="p-8 border-t border-stone-100 bg-stone-50 flex justify-between items-center">
              {step > 1 ? (
                  <button onClick={() => setStep(step - 1)} className="px-8 py-4 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-200 rounded-xl transition-colors">
                      Back
                  </button>
              ) : (
                  <div></div>
              )}

              {step < 3 ? (
                  <button onClick={() => setStep(step + 1)} className="px-10 py-4 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2">
                      Next Step <ArrowRight size={16} />
                  </button>
              ) : (
                  <button onClick={handleLaunch} className="px-12 py-4 bg-rust text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-[#B8421E] transition-all shadow-lg flex items-center gap-2">
                      Launch Campaign <Send size={16} />
                  </button>
              )}
          </div>
      </div>
    </div>
  );
};
