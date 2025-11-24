
import React from 'react';
import Link from 'next/link';
import { BookOpen, Briefcase, Users, ArrowRight, ShieldCheck } from 'lucide-react';

export const Home: React.FC = () => {
  return (
    <div className="animate-fade-in min-h-screen bg-ivory">
      {/* Hero */}
      <div className="relative pt-20 pb-20 lg:pt-32 lg:pb-32 px-4 overflow-hidden">
         <div className="absolute top-[-20%] right-[-10%] w-[800px] h-[800px] bg-rust/5 rounded-full blur-3xl pointer-events-none"></div>
         
         <div className="container mx-auto max-w-7xl text-center relative z-10">
            <h1 className="text-6xl md:text-8xl font-serif font-bold text-charcoal mb-8 tracking-tight leading-none">
              InTime <span className="text-rust italic">Solutions</span>
            </h1>
            <p className="text-2xl md:text-3xl text-stone-500 font-light max-w-3xl mx-auto leading-relaxed mb-12">
               The Operating System for the <span className="text-charcoal font-medium">Guidewire Ecosystem</span>.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
               {/* Academy Card */}
               <Link href="/academy" className="group flex flex-col items-center p-8 bg-white rounded-[2.5rem] shadow-xl border border-stone-200 hover:border-rust/30 hover:-translate-y-1 transition-all relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-rust transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                   <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-charcoal mb-6 group-hover:bg-rust group-hover:text-white transition-colors">
                       <BookOpen size={32} />
                   </div>
                   <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">Academy</h2>
                   <p className="text-sm text-stone-500 mb-8 px-4">For Career Changers seeking a path to Senior Developer.</p>
                   <span className="w-full py-4 rounded-xl bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-widest group-hover:bg-charcoal group-hover:text-white transition-colors flex items-center justify-center gap-2">
                      Start Learning <ArrowRight size={14} />
                   </span>
               </Link>

               {/* Client Portal Card */}
               <Link href="/clients" className="group flex flex-col items-center p-8 bg-white rounded-[2.5rem] shadow-xl border border-stone-200 hover:border-rust/30 hover:-translate-y-1 transition-all relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-blue-600 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                   <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-charcoal mb-6 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                       <Briefcase size={32} />
                   </div>
                   <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">Client Portal</h2>
                   <p className="text-sm text-stone-500 mb-8 px-4">For Hiring Managers looking for pre-vetted talent.</p>
                   <span className="w-full py-4 rounded-xl bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-widest group-hover:bg-blue-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                      Find Talent <ArrowRight size={14} />
                   </span>
               </Link>
               
               {/* Talent Portal (Formerly Bench) */}
               <Link href="/login" className="group flex flex-col items-center p-8 bg-white rounded-[2.5rem] shadow-xl border border-stone-200 hover:border-rust/30 hover:-translate-y-1 transition-all relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-purple-600 transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                   <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-charcoal mb-6 group-hover:bg-purple-600 group-hover:text-white transition-colors">
                       <Users size={32} />
                   </div>
                   <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">Talent Portal</h2>
                   <p className="text-sm text-stone-500 mb-8 px-4">For Consultants managing assignments and profiles.</p>
                   <span className="w-full py-4 rounded-xl bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-widest group-hover:bg-purple-600 group-hover:text-white transition-colors flex items-center justify-center gap-2">
                      Consultant Login <ArrowRight size={14} />
                   </span>
               </Link>

               {/* In-Time OS (Formerly Employee/HR) */}
               <Link href="/login" className="group flex flex-col items-center p-8 bg-white rounded-[2.5rem] shadow-xl border border-stone-200 hover:border-rust/30 hover:-translate-y-1 transition-all relative overflow-hidden">
                   <div className="absolute top-0 left-0 w-full h-1 bg-charcoal transform scale-x-0 group-hover:scale-x-100 transition-transform"></div>
                   <div className="w-16 h-16 bg-stone-50 rounded-2xl flex items-center justify-center text-charcoal mb-6 group-hover:bg-charcoal group-hover:text-white transition-colors">
                       <ShieldCheck size={32} />
                   </div>
                   <h2 className="text-2xl font-serif font-bold text-charcoal mb-2">In-Time OS</h2>
                   <p className="text-sm text-stone-500 mb-8 px-4">Internal Operations & Corporate Admin.</p>
                   <span className="w-full py-4 rounded-xl bg-stone-50 text-stone-600 text-xs font-bold uppercase tracking-widest group-hover:bg-charcoal group-hover:text-white transition-colors flex items-center justify-center gap-2">
                      Staff Access <ArrowRight size={14} />
                   </span>
               </Link>
            </div>
         </div>
      </div>

      {/* Corporate Footer */}
      <div className="bg-charcoal text-white py-16">
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-12 text-center md:text-left">
             <div className="col-span-1 md:col-span-1">
                 <div className="flex items-center justify-center md:justify-start gap-2 mb-4">
                     <div className="w-8 h-8 bg-rust rounded-lg flex items-center justify-center font-serif font-bold italic">I</div>
                     <span className="font-bold text-lg tracking-tight">InTime Solutions</span>
                 </div>
                 <p className="text-stone-500 text-sm leading-relaxed">
                     Building the future of insurance technology workforce. One developer at a time.
                 </p>
             </div>
             <div>
                 <h4 className="font-bold uppercase tracking-widest text-xs text-stone-400 mb-4">Platform</h4>
                 <ul className="space-y-2 text-sm text-stone-300">
                     <li><Link href="/academy" className="hover:text-white">Academy</Link></li>
                     <li><Link href="/clients" className="hover:text-white">Talent Search</Link></li>
                     <li><Link href="/login" className="hover:text-white">Consultant Access</Link></li>
                 </ul>
             </div>
             <div>
                 <h4 className="font-bold uppercase tracking-widest text-xs text-stone-400 mb-4">Company</h4>
                 <ul className="space-y-2 text-sm text-stone-300">
                     <li><a href="#" className="hover:text-white">About Us</a></li>
                     <li><a href="#" className="hover:text-white">Careers</a></li>
                     <li><a href="#" className="hover:text-white">Contact</a></li>
                 </ul>
             </div>
             <div>
                 <h4 className="font-bold uppercase tracking-widest text-xs text-stone-400 mb-4">Legal</h4>
                 <ul className="space-y-2 text-sm text-stone-300">
                     <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
                     <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                 </ul>
             </div>
         </div>
         <div className="container mx-auto px-4 mt-12 pt-8 border-t border-white/10 text-center text-xs text-stone-500">
             © 2024 InTime Solutions Inc. All rights reserved.
         </div>
      </div>
    </div>
  );
};
