'use client';


import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Users, Briefcase, Search, Zap, Shield } from 'lucide-react';

export const ClientWelcome: React.FC = () => {
  const router = useRouter();

  return (
    <div className="animate-fade-in min-h-[75vh] flex flex-col justify-center">
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Side */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest mb-6 border border-blue-100">
                    <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                    Talent Engine Active
                </div>
                <h1 className="text-6xl font-serif font-bold text-charcoal mb-6 leading-tight">
                    Welcome back, <br/>
                    <span className="italic text-stone-400">Partner.</span>
                </h1>
                <p className="text-xl text-stone-500 font-light mb-10 max-w-md leading-relaxed">
                    Your requisition pipeline is updated. New pre-vetted candidates match your criteria.
                </p>
                
                <button 
                    onClick={() => router.push('/client/dashboard')}
                    className="group flex items-center gap-4 px-10 py-5 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-2xl hover:shadow-blue-200 hover:-translate-y-1"
                >
                    Access Dashboard
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Visual Side - "System Status" Card */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200 border border-stone-100 p-10 relative overflow-hidden bg-noise group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-blue-100 transition-colors duration-700"></div>
                
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-6">
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Account Tier</div>
                            <div className="text-2xl font-serif font-bold text-charcoal">Enterprise</div>
                        </div>
                        <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-charcoal">
                            <Shield size={24} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center">
                                <Briefcase size={18} />
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-400">Active Requisitions</div>
                                <div className="font-bold text-charcoal text-sm">3 Open Roles</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center">
                                <Users size={18} />
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-400">New Matches</div>
                                <div className="font-bold text-charcoal text-sm">12 Candidates Found</div>
                            </div>
                        </div>

                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100">
                            <div className="w-10 h-10 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center">
                                <Zap size={18} />
                            </div>
                            <div>
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-400">AI Sourcing</div>
                                <div className="font-bold text-charcoal text-sm">Running...</div>
                            </div>
                        </div>
                    </div>
                    
                    <div className="pt-6 text-center">
                         <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-300">
                             <Search size={10} /> Real-time Indexing • v3.2.0
                         </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
