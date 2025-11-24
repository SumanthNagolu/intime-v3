'use client';


import React, { useState } from 'react';
import { Megaphone, Send, Sparkles, Users, Mail, CheckCircle } from 'lucide-react';

export const ClientOutreach: React.FC = () => {
  const [step, setStep] = useState<'setup' | 'draft' | 'review'>('setup');
  const [campaignName, setCampaignName] = useState('');
  const [targetSegment, setTargetSegment] = useState('Previous Clients');
  const [generatedEmail, setGeneratedEmail] = useState('');

  const handleGenerate = () => {
      // Mock AI Generation
      setGeneratedEmail(`Subject: Immediate Availability: Senior Guidewire Developer\n\nHi [Client Name],\n\nI hope you're having a great week.\n\nI wanted to let you know that one of our top Senior PolicyCenter Developers, Vikram Patel, will be coming off a project next week. He has 7 years of experience and specializes in complex rating engine configurations.\n\nWould you have any open requisitions that might be a fit? I can send over his full profile.\n\nBest,\n[Your Name]`);
      setStep('draft');
  };

  return (
    <div className="animate-fade-in pt-4 max-w-4xl mx-auto">
      <div className="mb-10 text-center">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Bench Sales</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Client Outreach</h1>
        <p className="text-stone-500 mt-2">AI-powered campaigns to place bench consultants faster.</p>
      </div>

      <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200 border border-stone-100 overflow-hidden">
          
          {/* Stepper */}
          <div className="bg-stone-50 border-b border-stone-100 p-8 flex justify-center gap-4">
              {['Campaign Setup', 'AI Drafting', 'Review & Launch'].map((s, i) => {
                  const currentIdx = ['setup', 'draft', 'review'].indexOf(step);
                  const isActive = i <= currentIdx;
                  return (
                      <div key={s} className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${isActive ? 'bg-charcoal text-white' : 'bg-stone-200 text-stone-400'}`}>
                              {i + 1}
                          </div>
                          <span className={`text-xs font-bold uppercase tracking-widest ${isActive ? 'text-charcoal' : 'text-stone-300'}`}>{s}</span>
                          {i < 2 && <div className="w-12 h-px bg-stone-200 mx-2"></div>}
                      </div>
                  );
              })}
          </div>

          <div className="p-12">
              {step === 'setup' && (
                  <div className="space-y-8 animate-slide-up">
                      <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Campaign Name</label>
                          <input 
                            value={campaignName}
                            onChange={(e) => setCampaignName(e.target.value)}
                            placeholder="e.g. Q4 Bench Availability Push"
                            className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-medium text-charcoal"
                          />
                      </div>

                      <div className="grid grid-cols-2 gap-8">
                          <div>
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Target Audience</label>
                              <select 
                                value={targetSegment}
                                onChange={(e) => setTargetSegment(e.target.value)}
                                className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-medium text-charcoal"
                              >
                                  <option>Previous Clients</option>
                                  <option>Warm Leads</option>
                                  <option>Cold Outreach (Guidewire Users)</option>
                              </select>
                          </div>
                          <div>
                              <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Focus Consultant</label>
                              <select className="w-full p-4 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust font-medium text-charcoal">
                                  <option>Vikram Patel (PC Dev)</option>
                                  <option>Sarah Lee (BC Architect)</option>
                                  <option>Multiple (General Availability)</option>
                              </select>
                          </div>
                      </div>

                      <div className="pt-8 flex justify-end">
                          <button 
                            onClick={handleGenerate}
                            className="px-8 py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2"
                          >
                              <Sparkles size={16} /> Generate Content
                          </button>
                      </div>
                  </div>
              )}

              {step === 'draft' && (
                  <div className="space-y-8 animate-slide-up">
                      <div className="flex items-start gap-4 p-6 bg-blue-50 border border-blue-100 rounded-2xl">
                          <Sparkles size={20} className="text-blue-600 shrink-0 mt-1" />
                          <div>
                              <h4 className="font-bold text-blue-900 text-sm mb-1">AI Draft Generated</h4>
                              <p className="text-blue-800 text-xs leading-relaxed">
                                  Based on Vikram's profile and the "Previous Clients" segment, I've drafted a personalized email emphasizing his specific rating engine expertise which is in high demand.
                              </p>
                          </div>
                      </div>

                      <div>
                          <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-3">Email Content</label>
                          <textarea 
                            value={generatedEmail}
                            onChange={(e) => setGeneratedEmail(e.target.value)}
                            className="w-full h-64 p-6 bg-white border border-stone-200 rounded-2xl focus:outline-none focus:border-rust font-mono text-sm leading-relaxed shadow-inner resize-none"
                          />
                      </div>

                      <div className="pt-8 flex justify-between">
                          <button onClick={() => setStep('setup')} className="text-stone-400 hover:text-charcoal font-bold text-xs uppercase tracking-widest">Back</button>
                          <button 
                            onClick={() => setStep('review')}
                            className="px-8 py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-lg flex items-center gap-2"
                          >
                              Next: Review
                          </button>
                      </div>
                  </div>
              )}

              {step === 'review' && (
                  <div className="text-center space-y-8 animate-slide-up py-8">
                      <div className="w-24 h-24 bg-green-50 rounded-full flex items-center justify-center mx-auto mb-6">
                          <Megaphone size={40} className="text-green-600" />
                      </div>
                      <h3 className="text-3xl font-serif font-bold text-charcoal">Ready to Launch?</h3>
                      <p className="text-stone-500 max-w-md mx-auto">
                          This campaign will be sent to <strong className="text-charcoal">45 contacts</strong> in your CRM. 
                          Replies will be tracked in the Bench Dashboard.
                      </p>
                      
                      <div className="flex justify-center gap-4">
                          <button onClick={() => setStep('draft')} className="px-8 py-4 border border-stone-200 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors">
                              Edit Message
                          </button>
                          <button onClick={() => alert("Campaign Launched!")} className="px-10 py-4 bg-rust text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-[#B8421E] transition-all shadow-lg flex items-center gap-2">
                              Launch Campaign <Send size={16} />
                          </button>
                      </div>
                  </div>
              )}
          </div>
      </div>
    </div>
  );
};
