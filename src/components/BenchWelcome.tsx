'use client';


import React from 'react';
import { useRouter } from 'next/navigation';
import { ArrowRight, Eye, Layout, Briefcase, Globe, CheckCircle } from 'lucide-react';

export const BenchWelcome: React.FC = () => {
  const router = useRouter();

  return (
    <div className="animate-fade-in min-h-[75vh] flex flex-col justify-center">
        <div className="max-w-5xl mx-auto w-full grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
            {/* Text Side */}
            <div>
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-widest mb-6 border border-purple-100">
                    <span className="w-2 h-2 rounded-full bg-purple-600 animate-pulse"></span>
                    Marketplace Live
                </div>
                <h1 className="text-6xl font-serif font-bold text-charcoal mb-6 leading-tight">
                    Welcome back, <br/>
                    <span className="italic text-stone-400">Consultant.</span>
                </h1>
                <p className="text-xl text-stone-500 font-light mb-10 max-w-md leading-relaxed">
                    Your profile is currently visible to 14 active hiring partners. 3 new opportunities match your skill stack.
                </p>
                
                <button 
                    onClick={() => router.push('/talent/dashboard')}
                    className="group flex items-center gap-4 px-10 py-5 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-purple-600 transition-all shadow-2xl hover:shadow-purple-200 hover:-translate-y-1"
                >
                    Enter Dashboard
                    <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                </button>
            </div>

            {/* Visual Side - "Consultant Status" Card */}
            <div className="bg-white rounded-[2.5rem] shadow-2xl shadow-stone-200 border border-stone-100 p-10 relative overflow-hidden bg-noise group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-purple-50 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-purple-100 transition-colors duration-700"></div>
                
                <div className="relative z-10 space-y-8">
                    <div className="flex items-center justify-between border-b border-stone-100 pb-6">
                        <div>
                            <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">Current Status</div>
                            <div className="text-2xl font-serif font-bold text-charcoal">Available / On Bench</div>
                        </div>
                        <div className="w-12 h-12 bg-stone-50 rounded-2xl flex items-center justify-center text-charcoal">
                            <Layout size={24} />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <div 
                            onClick={() => router.push('/talent/dashboard')}
                            className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-purple-50 hover:border-purple-100 transition-all cursor-pointer group/item"
                        >
                            <div className="w-10 h-10 rounded-full bg-purple-100 text-purple-700 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                <Eye size={18} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-400 group-hover/item:text-purple-600">Profile Visibility</div>
                                <div className="font-bold text-charcoal text-sm">45 Views this Week</div>
                            </div>
                            <ArrowRight size={14} className="text-stone-300 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                        </div>

                        <div 
                             onClick={() => router.push('/talent/jobs')}
                             className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-blue-50 hover:border-blue-100 transition-all cursor-pointer group/item"
                        >
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                <Briefcase size={18} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-400 group-hover/item:text-blue-600">Job Matches</div>
                                <div className="font-bold text-charcoal text-sm">8 High-Fit Roles</div>
                            </div>
                             <ArrowRight size={14} className="text-stone-300 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                        </div>

                        <div 
                             onClick={() => router.push('/talent/profile')}
                             className="flex items-center gap-4 p-4 rounded-2xl bg-stone-50 border border-stone-100 hover:bg-green-50 hover:border-green-100 transition-all cursor-pointer group/item"
                        >
                            <div className="w-10 h-10 rounded-full bg-green-100 text-green-700 flex items-center justify-center group-hover/item:scale-110 transition-transform">
                                <CheckCircle size={18} />
                            </div>
                            <div className="flex-1">
                                <div className="text-xs font-bold uppercase tracking-wide text-stone-400 group-hover/item:text-green-600">Resume Status</div>
                                <div className="font-bold text-charcoal text-sm">Verified & Indexed</div>
                            </div>
                             <ArrowRight size={14} className="text-stone-300 opacity-0 group-hover/item:opacity-100 -translate-x-2 group-hover/item:translate-x-0 transition-all" />
                        </div>
                    </div>
                    
                    <div className="pt-6 text-center">
                         <div className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-stone-300">
                             <Globe size={10} /> Global Talent Pool • v3.2.0
                         </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
  );
};
