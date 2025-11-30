'use client';


import React, { useState } from 'react';
import { Play, ChevronRight, CheckCircle, Users, Star, ShieldCheck, X, AlertCircle } from 'lucide-react';

export const PublicAcademy: React.FC = () => {
  const [showDemo, setShowDemo] = useState(false);
  const [showApply, setShowApply] = useState(false);
  const [applicationStep, setApplicationStep] = useState<'form' | 'success'>('form');
  const [formData, setFormData] = useState({ name: '', email: '', interest: '' });
  const [error, setError] = useState<string | null>(null);

  const handleSubmitApplication = (e: React.FormEvent) => {
      e.preventDefault();
      if (formData.interest.length < 200) {
          setError("Please tell us more about your background (min 200 characters). We are selective.");
          return;
      }
      setApplicationStep('success');
      setError(null);
  };

  return (
    <div className="animate-fade-in min-h-screen bg-ivory">
      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-20 lg:pt-32 lg:pb-28">
        <div className="relative container mx-auto px-4 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-rust/10 text-rust text-xs font-bold uppercase tracking-widest mb-8 border border-rust/20">
                <span className="w-2 h-2 rounded-full bg-rust animate-pulse"></span>
                Now Enrolling for November Cohort
            </div>
            
            <h1 className="text-6xl md:text-7xl font-serif font-bold text-charcoal mb-8 leading-tight">
                The <span className="italic text-rust">Harvard</span> of <br/>
                Guidewire Training.
            </h1>
            
            <p className="max-w-2xl mx-auto text-xl text-stone-500 mb-12 leading-relaxed font-light">
                We don&apos;t sell courses. We manufacture Senior Developers.
                Join the only program that gives you a 7-year experience profile on Day 1.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <button 
                    onClick={() => setShowApply(true)}
                    className="px-10 py-5 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-xl hover:shadow-rust/30 flex items-center gap-2"
                >
                    Apply for Cohort
                    <ChevronRight size={16} />
                </button>
                <button 
                    onClick={() => setShowDemo(true)}
                    className="px-10 py-5 bg-white text-charcoal border border-stone-200 rounded-full text-sm font-bold uppercase tracking-widest hover:border-rust hover:text-rust transition-all flex items-center gap-2 group"
                >
                    <Play size={16} className="group-hover:fill-rust transition-colors" />
                    Watch Demo
                </button>
            </div>
        </div>
      </div>

      {/* Social Proof */}
      <div className="bg-charcoal py-16 overflow-hidden relative">
          <div className="absolute inset-0 bg-noise opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10">
              <p className="text-center text-stone-500 text-xs font-bold uppercase tracking-[0.3em] mb-10">Trusted by Hiring Managers At</p>
              <div className="flex flex-wrap justify-center gap-12 md:gap-24 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                  {['Deloitte', 'Capgemini', 'PwC', 'Accenture', 'Cognizant'].map(brand => (
                      <span key={brand} className="text-2xl font-serif font-bold text-white">{brand}</span>
                  ))}
              </div>
          </div>
      </div>

      {/* Methodology Grid */}
      <div className="py-24 container mx-auto px-4">
         <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
             {[
                 { icon: ShieldCheck, title: "Senior Identity", desc: "You don&apos;t start as a student. You start as &apos;Priya Sharma, Sr. Developer&apos;. We give you the resume first, then fill in the skills." },
                 { icon: Users, title: "Peer Pressure", desc: "No self-paced isolation. You join a Sprint Team. If you miss a deadline, your team sees it. Accountability is the only way." },
                 { icon: Star, title: "The Blueprint", desc: "Walk away with a 60-page technical specification document authored by you. Proof of experience that beats any certificate." }
             ].map((item, i) => (
                 <div key={i} className="p-8 bg-white rounded-[2rem] border border-stone-100 shadow-xl shadow-stone-200/50 hover:border-rust/30 transition-all group">
                     <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-charcoal mb-6 group-hover:bg-rust group-hover:text-white transition-colors">
                         <item.icon size={28} />
                     </div>
                     <h3 className="text-xl font-serif font-bold text-charcoal mb-4">{item.title}</h3>
                     <p className="text-stone-500 leading-relaxed">{item.desc}</p>
                 </div>
             ))}
         </div>
      </div>

      {/* Video Modal */}
      {showDemo && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4 backdrop-blur-md" onClick={() => setShowDemo(false)}>
              <div className="bg-black w-full max-w-4xl aspect-video rounded-2xl overflow-hidden relative shadow-2xl border border-white/10" onClick={e => e.stopPropagation()}>
                  <div className="absolute inset-0 flex items-center justify-center">
                      <div className="text-center">
                          <div className="w-20 h-20 rounded-full border-4 border-white/20 flex items-center justify-center text-white mb-4">
                              <Play size={32} fill="currentColor" />
                          </div>
                          <p className="text-white/50 font-mono text-sm">Demo Video Placeholder</p>
                      </div>
                  </div>
                  <button onClick={() => setShowDemo(false)} className="absolute top-4 right-4 text-white/50 hover:text-white">Close</button>
              </div>
          </div>
      )}

      {/* Application Modal */}
      {showApply && (
          <div className="fixed inset-0 bg-charcoal/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setShowApply(false)}>
              <div className="bg-white w-full max-w-lg rounded-3xl p-10 shadow-2xl relative animate-slide-up" onClick={e => e.stopPropagation()}>
                  <button onClick={() => setShowApply(false)} className="absolute top-6 right-6 text-stone-300 hover:text-charcoal">
                      <X size={24} />
                  </button>

                  {applicationStep === 'form' ? (
                      <form onSubmit={handleSubmitApplication}>
                          <h3 className="text-3xl font-serif font-bold text-charcoal mb-2">Request Access</h3>
                          <p className="text-stone-500 mb-8">We only accept 20 students per cohort to maintain quality.</p>
                          
                          {error && (
                              <div className="mb-6 p-4 bg-red-50 text-red-600 text-xs font-bold rounded-xl flex items-center gap-2 border border-red-100">
                                  <AlertCircle size={16} /> {error}
                              </div>
                          )}

                          <div className="space-y-6">
                              <div>
                                  <label className="block text-xs font-bold text-charcoal uppercase tracking-widest mb-2">Full Name</label>
                                  <input 
                                    required 
                                    type="text" 
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-rust/20" 
                                    placeholder="e.g. John Doe"
                                    value={formData.name}
                                    onChange={e => setFormData({...formData, name: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-charcoal uppercase tracking-widest mb-2">Email Address</label>
                                  <input 
                                    required 
                                    type="email" 
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-rust/20" 
                                    placeholder="john@example.com"
                                    value={formData.email}
                                    onChange={e => setFormData({...formData, email: e.target.value})}
                                  />
                              </div>
                              <div>
                                  <label className="block text-xs font-bold text-charcoal uppercase tracking-widest mb-2">Why InTime? (Min 200 chars)</label>
                                  <textarea 
                                    required 
                                    className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 focus:outline-none focus:ring-2 focus:ring-rust/20 h-32 resize-none text-sm" 
                                    placeholder="Tell us about your career goals and why you are ready for this intensity..."
                                    value={formData.interest}
                                    onChange={e => setFormData({...formData, interest: e.target.value})}
                                  />
                                  <p className="text-right text-[10px] text-stone-400 mt-1">{formData.interest.length} / 200</p>
                              </div>
                          </div>

                          <button type="submit" className="w-full py-4 bg-rust text-white rounded-xl font-bold uppercase tracking-widest hover:bg-[#B8421E] transition-colors mt-6 shadow-lg">
                              Submit Application
                          </button>
                      </form>
                  ) : (
                      <div className="text-center py-8">
                          <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                              <CheckCircle size={40} />
                          </div>
                          <h3 className="text-3xl font-serif font-bold text-charcoal mb-4">Application Received</h3>
                          <p className="text-stone-500 mb-8">
                              Thank you for your interest in InTime Academy. Our admissions team will review your profile and contact you within 24 hours.
                          </p>
                          <button onClick={() => setShowApply(false)} className="px-8 py-3 bg-stone-100 text-stone-600 rounded-full text-xs font-bold uppercase tracking-widest hover:bg-stone-200 transition-colors">
                              Close
                          </button>
                      </div>
                  )}
              </div>
          </div>
      )}
    </div>
  );
};
