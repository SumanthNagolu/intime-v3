'use client';

import React from 'react';
import { SENIOR_PERSONA } from '@/lib/academy/constants';
import { Shield, Briefcase, CheckCircle, AlertCircle } from 'lucide-react';
import { useNavigate } from 'next/navigation';

export default function PersonaView() {
  const router = useRouter();

  return (
    <div className="animate-fade-in pt-4 pb-12">
      <div className="mb-10 text-center">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-3">Target Identity</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-4">The 7-Year Promise</h1>
        <p className="text-stone-500 max-w-xl mx-auto">
          This is not a template. This is <span className="text-charcoal font-bold">you</span> on graduation day. 
          Every lab you complete fills a line item in this document.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 max-w-6xl mx-auto">
        
        {/* The Resume (The Promise) */}
        <div className="bg-white p-12 rounded-[2px] shadow-2xl shadow-stone-300/50 relative min-h-[800px] border border-stone-200">
            {/* Watermark */}
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.03] z-0">
                <span className="text-9xl font-serif font-bold -rotate-45">CONFIDENTIAL</span>
            </div>

            <div className="relative z-10">
                <div className="border-b-2 border-charcoal pb-8 mb-8 flex justify-between items-start">
                    <div>
                        <h2 className="text-4xl font-serif font-bold text-charcoal uppercase tracking-wide">{SENIOR_PERSONA.name}</h2>
                        <p className="text-xl text-stone-600 font-light mt-2">{SENIOR_PERSONA.title}</p>
                    </div>
                    <div className="text-right">
                        <div className="inline-flex items-center gap-2 bg-forest/10 text-forest px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2">
                            <Shield size={12} /> Verified Pro
                        </div>
                        <p className="text-stone-400 text-sm">{SENIOR_PERSONA.experienceLevel} Experience</p>
                    </div>
                </div>

                <div className="mb-10">
                    <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest border-b border-stone-200 pb-2 mb-4">Professional Summary</h3>
                    <p className="text-stone-700 leading-relaxed font-serif">
                        Senior Guidewire Developer with 7 years of specialized experience in PolicyCenter configuration and integration. 
                        Proven track record of delivering complex digital transformation projects for Tier-1 carriers. 
                        Expert in Gosu, Product Model architecture, and REST API integration patterns.
                    </p>
                </div>

                <div className="mb-10">
                    <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest border-b border-stone-200 pb-2 mb-4">Experience</h3>
                    <div className="space-y-8">
                        {SENIOR_PERSONA.companies.map((job, i) => (
                            <div key={i}>
                                <div className="flex justify-between mb-1">
                                    <h4 className="font-bold text-charcoal text-lg">{job.role}</h4>
                                    <span className="text-stone-500 text-sm italic">{job.duration}</span>
                                </div>
                                <div className="text-rust font-medium text-sm mb-2">{job.name}</div>
                                <p className="text-stone-600 text-sm leading-relaxed">{job.description}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div>
                    <h3 className="text-sm font-bold text-charcoal uppercase tracking-widest border-b border-stone-200 pb-2 mb-4">Technical Arsenal</h3>
                    <div className="flex flex-wrap gap-2">
                        {SENIOR_PERSONA.skills.map(skill => (
                            <span key={skill} className="px-3 py-1 bg-stone-100 text-stone-700 text-xs font-medium rounded-md hover:bg-rust/10 hover:text-rust transition-colors cursor-default">
                                {skill}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>

        {/* The Reality Gap (The Progress) */}
        <div className="flex flex-col justify-center space-y-8">
            <div className="bg-stone-900 text-white p-8 rounded-3xl shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-rust/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
                <h3 className="font-serif text-2xl mb-6 relative z-10">Identity Gap Analysis</h3>
                
                <div className="space-y-6 relative z-10">
                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10">
                        <div className="w-10 h-10 rounded-full bg-green-500/20 text-green-500 flex items-center justify-center shrink-0">
                            <CheckCircle size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Foundation Layer</p>
                            <p className="text-xs text-stone-400">Core terminology & data model concepts acquired.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-rust/20 rounded-xl border border-rust/30 animate-pulse-slow">
                        <div className="w-10 h-10 rounded-full bg-rust text-white flex items-center justify-center shrink-0">
                            <Briefcase size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm text-rust">Active Target: TechFlow Project</p>
                            <p className="text-xs text-stone-300">Missing: "Reinsurance Integration" evidence.</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10 opacity-50">
                        <div className="w-10 h-10 rounded-full bg-stone-700 text-stone-500 flex items-center justify-center shrink-0">
                            <AlertCircle size={20} />
                        </div>
                        <div>
                            <p className="font-bold text-sm">Leadership Narratives</p>
                            <p className="text-xs text-stone-400">Locked until Module 6.</p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="bg-white p-8 rounded-3xl border border-stone-200 shadow-lg text-center">
                <h3 className="font-serif text-xl font-bold text-charcoal mb-2">Close the Gap</h3>
                <p className="text-stone-500 mb-6 text-sm">You need to complete the <strong className="text-charcoal">Coverage Config Lab</strong> to validate the "Configuration Specialist" claim.</p>
                <button 
                   onClick={() => router.push('/students/lesson/3/l3')}
                   className="w-full py-3 bg-charcoal text-white rounded-full font-bold hover:bg-rust transition-colors shadow-lg hover:shadow-rust/30"
                >
                    Enter Lab: Coverage Configuration
                </button>
            </div>
        </div>
      </div>
    </div>
  );
};