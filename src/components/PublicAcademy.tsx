'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Play, ChevronRight, CheckCircle, Users, Star, ShieldCheck, X, AlertCircle } from 'lucide-react';
import { TRACKS } from '@/lib/academy/tracks';

export const PublicAcademy: React.FC = () => {
  const router = useRouter();
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
                Now Enrolling
            </div>

            <h1 className="text-6xl md:text-7xl font-serif font-bold text-charcoal mb-8 leading-tight">
                The <span className="italic text-rust">Harvard</span> of <br/>
                Tech Training.
            </h1>

            <p className="max-w-2xl mx-auto text-xl text-stone-500 mb-12 leading-relaxed font-light">
                We don&apos;t sell courses. We manufacture Senior Developers.
                Join the only program that gives you a production-ready experience profile on Day 1.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
                <Link
                    href="/login"
                    className="px-10 py-5 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-rust transition-all shadow-xl hover:shadow-rust/30 flex items-center gap-2"
                >
                    Get Started
                    <ChevronRight size={16} />
                </Link>
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

      {/* Training Tracks Showcase */}
      <div className="py-24 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <p className="text-xs font-bold text-stone-400 uppercase tracking-[0.3em] mb-4">Training Programs</p>
            <h2 className="text-4xl font-serif font-bold text-charcoal mb-4">Career Training Tracks</h2>
            <p className="text-stone-500 max-w-xl mx-auto">
              Structured programs designed to take you from zero to production-ready, with hands-on projects and expert mentorship.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto">
            {TRACKS.map((track) => {
              const isLive = track.status === 'live';
              return (
                <div
                  key={track.slug}
                  className={`relative p-6 rounded-2xl border transition-all group ${
                    isLive
                      ? 'bg-white border-stone-200 shadow-xl shadow-stone-200/50 hover:border-rust/30 hover:-translate-y-1'
                      : 'bg-stone-50 border-stone-100'
                  }`}
                >
                  {/* Status Badge */}
                  <div className="flex items-center justify-between mb-4">
                    <div className={`text-3xl ${!isLive ? 'grayscale opacity-60' : ''}`}>
                      {track.icon}
                    </div>
                    {isLive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-green-50 text-green-700 border border-green-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                        Live
                      </span>
                    ) : (
                      <span className="inline-flex items-center px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-stone-100 text-stone-500">
                        {track.comingSoonDate}
                      </span>
                    )}
                  </div>

                  <h3 className={`text-lg font-serif font-bold mb-2 ${isLive ? 'text-charcoal' : 'text-stone-400'}`}>
                    {track.title}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isLive ? 'text-stone-500' : 'text-stone-400'}`}>
                    {track.description}
                  </p>

                  {isLive && track.paths && (
                    <div className="mt-4 pt-4 border-t border-stone-100">
                      <p className="text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                        {track.paths.length} Learning Paths
                      </p>
                      <div className="space-y-1">
                        {track.paths.slice(0, 3).map((path) => (
                          <div key={path.slug} className="flex items-center gap-2 text-xs text-stone-600">
                            <span>{path.icon}</span>
                            <span className="truncate">{path.shortTitle}</span>
                          </div>
                        ))}
                        {track.paths.length > 3 && (
                          <p className="text-[10px] text-stone-400 pl-5">+{track.paths.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
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
                 { icon: ShieldCheck, title: "Senior Identity", desc: "You don't start as a student. You start as 'Priya Sharma, Sr. Developer'. We give you the resume first, then fill in the skills." },
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
