
import React from 'react';
import Link from 'next/link';
import { CheckCircle, Search, ArrowRight, Shield, Users, Clock, Zap } from 'lucide-react';

export const ClientLanding: React.FC = () => {
  return (
    <div className="animate-fade-in min-h-screen bg-ivory">
      {/* Hero Section */}
      <div className="relative pt-20 pb-20 px-4">
         <div className="container mx-auto max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-50 text-blue-700 text-xs font-bold uppercase tracking-widest mb-8 border border-blue-100">
                <Shield size={12} /> Enterprise Talent Solutions
            </div>
            
            <h1 className="text-5xl md:text-7xl font-serif font-bold text-charcoal mb-8 leading-tight">
               Your Pipeline is <br/> <span className="text-blue-600 italic">Empty.</span> Let's fix that.
            </h1>
            
            <p className="text-xl text-stone-500 font-light max-w-2xl mx-auto leading-relaxed mb-12">
               Access a curated pool of Senior Guidewire Developers who have completed our rigorous 60-day simulation capstone. No fluff. Just code.
            </p>
            
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <Link href="/login" className="px-10 py-5 bg-charcoal text-white rounded-full text-sm font-bold uppercase tracking-widest hover:bg-blue-600 transition-all shadow-xl flex items-center justify-center gap-2">
                    Access Client Portal <ArrowRight size={16} />
                </Link>
                <button className="px-10 py-5 bg-white text-charcoal border border-stone-200 rounded-full text-sm font-bold uppercase tracking-widest hover:border-blue-600 hover:text-blue-600 transition-all">
                    Schedule Demo
                </button>
            </div>
         </div>
      </div>

      {/* Feature Grid */}
      <div className="bg-white py-24 border-y border-stone-100">
         <div className="container mx-auto px-4 grid grid-cols-1 md:grid-cols-3 gap-12">
             <div className="group p-8 rounded-[2rem] hover:bg-stone-50 transition-colors">
                 <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <CheckCircle size={32} />
                 </div>
                 <h3 className="text-2xl font-serif font-bold text-charcoal mb-3">Pre-Vetted Artifacts</h3>
                 <p className="text-stone-500 leading-relaxed">Every candidate has a deployed PolicyCenter artifact (The "HomeProtect" Capstone) you can inspect before the first interview.</p>
             </div>
             
             <div className="group p-8 rounded-[2rem] hover:bg-stone-50 transition-colors">
                 <div className="w-16 h-16 bg-rust/10 text-rust rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Users size={32} />
                 </div>
                 <h3 className="text-2xl font-serif font-bold text-charcoal mb-3">Cultural & Communication</h3>
                 <p className="text-stone-500 leading-relaxed">Soft skills are graded daily by AI Mentors. We provide a full communication score alongside technical capability.</p>
             </div>
             
             <div className="group p-8 rounded-[2rem] hover:bg-stone-50 transition-colors">
                 <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                     <Zap size={32} />
                 </div>
                 <h3 className="text-2xl font-serif font-bold text-charcoal mb-3">Instant Deployment</h3>
                 <p className="text-stone-500 leading-relaxed">Candidates are "Day 1 Ready" with environment setup, Jira workflows, and CI/CD pipelines already mastered.</p>
             </div>
         </div>
      </div>

      {/* Stats Section */}
      <div className="bg-charcoal py-24 text-white relative overflow-hidden">
          <div className="absolute top-0 left-0 w-full h-full bg-noise opacity-10"></div>
          <div className="container mx-auto px-4 relative z-10 grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
              <div>
                  <div className="text-6xl font-serif font-bold mb-2">48h</div>
                  <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">Average Time to Fill</div>
              </div>
              <div>
                  <div className="text-6xl font-serif font-bold mb-2">30%</div>
                  <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">Cost Savings vs Agencies</div>
              </div>
              <div>
                  <div className="text-6xl font-serif font-bold mb-2">100%</div>
                  <div className="text-stone-400 text-xs font-bold uppercase tracking-widest">Satisfaction Guarantee</div>
              </div>
          </div>
      </div>
    </div>
  );
};
