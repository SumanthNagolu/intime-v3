'use client';

import React from 'react';
import { useAppStore } from '../../lib/store';
import { Network, Users, User, ChevronDown, Briefcase } from 'lucide-react';

export const OrgChart: React.FC = () => {
  const { employees } = useAppStore();

  const getPodMembers = (podName: string) => employees.filter(e => e.pod === podName);

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">PeopleOS</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Organizational Structure</h1>
        <p className="text-stone-500 mt-2">Visualizing the InTime "Two-Person Pod" Scalable Architecture</p>
      </div>

      <div className="overflow-x-auto pb-12">
          <div className="min-w-[1000px] flex flex-col items-center">
              
              {/* Level 1: Leadership */}
              <div className="flex flex-col items-center mb-12 relative">
                  <div className="bg-charcoal text-white p-6 rounded-2xl shadow-xl w-64 text-center z-10">
                      <div className="w-16 h-16 mx-auto bg-stone-700 rounded-full flex items-center justify-center text-xl font-serif font-bold mb-3 border-2 border-white/20">
                          CEO
                      </div>
                      <h3 className="font-bold text-lg">Executive Office</h3>
                      <p className="text-xs text-stone-400 uppercase tracking-widest mt-1">Leadership</p>
                  </div>
                  <div className="h-12 w-px bg-stone-300"></div>
              </div>

              {/* Level 2: Departments */}
              <div className="flex justify-center gap-16 relative mb-16">
                  {/* Connector Line */}
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-px bg-stone-300 -mt-px"></div>
                  
                  {['Recruiting', 'Bench Sales', 'Engineering', 'HR & Ops'].map((dept, i) => (
                      <div key={dept} className="flex flex-col items-center relative">
                          <div className="h-8 w-px bg-stone-300 absolute -top-8 left-1/2"></div>
                          <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-sm w-48 text-center z-10">
                              <div className="flex items-center justify-center gap-2 font-bold text-charcoal text-sm mb-1">
                                  <BuildingIcon dept={dept} /> {dept}
                              </div>
                              <div className="text-[10px] text-stone-400 font-bold uppercase tracking-widest">Department</div>
                          </div>
                          <div className="h-8 w-px bg-stone-300"></div>
                      </div>
                  ))}
              </div>

              {/* Level 3: The Pods (Focusing on Recruiting/Sales for this view) */}
              <div className="flex justify-center gap-8">
                  {/* Recruiting Pod A */}
                  <div className="flex flex-col items-center">
                      <div className="bg-stone-100 p-6 rounded-[2rem] border border-stone-200 w-80 relative">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-rust border border-stone-200">
                              Recruiting Pod A
                          </div>
                          
                          {/* Senior */}
                          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-rust mb-4 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-rust text-white flex items-center justify-center font-bold">D</div>
                               <div>
                                   <div className="font-bold text-charcoal text-sm">David Kim</div>
                                   <div className="text-[10px] text-stone-400 uppercase tracking-widest">Senior Account Mgr</div>
                               </div>
                          </div>

                          {/* Connector */}
                          <div className="h-6 w-px bg-stone-300 mx-auto my-[-10px]"></div>

                          {/* Junior */}
                          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-stone-300 mt-4 flex items-center gap-4 opacity-80">
                               <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center font-bold">S</div>
                               <div>
                                   <div className="font-bold text-charcoal text-sm">Sarah Lao</div>
                                   <div className="text-[10px] text-stone-400 uppercase tracking-widest">Technical Recruiter</div>
                               </div>
                          </div>
                      </div>
                  </div>

                  {/* Bench Sales Pod 1 */}
                  <div className="flex flex-col items-center">
                      <div className="bg-stone-100 p-6 rounded-[2rem] border border-stone-200 w-80 relative">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-blue-600 border border-stone-200">
                              Sales Pod 1
                          </div>
                          
                          {/* Senior */}
                          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-blue-600 mb-4 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold">J</div>
                               <div>
                                   <div className="font-bold text-charcoal text-sm">James Wilson</div>
                                   <div className="text-[10px] text-stone-400 uppercase tracking-widest">Bench Sales Lead</div>
                               </div>
                          </div>
                           {/* Connector */}
                           <div className="h-6 w-px bg-stone-300 mx-auto my-[-10px]"></div>

                          {/* Placeholder Junior */}
                          <div className="bg-stone-50 p-4 rounded-xl border border-dashed border-stone-300 mt-4 flex items-center justify-center gap-2 text-stone-400">
                               <PlusIcon /> <span className="text-xs font-bold uppercase tracking-widest">Open Position</span>
                          </div>
                      </div>
                  </div>

                  {/* Recruiting Pod B */}
                  <div className="flex flex-col items-center">
                      <div className="bg-stone-100 p-6 rounded-[2rem] border border-stone-200 w-80 relative">
                          <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-white px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest text-rust border border-stone-200">
                              Recruiting Pod B
                          </div>
                          
                          {/* Senior (Empty/Hiring) */}
                          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-rust mb-4 flex items-center gap-4">
                               <div className="w-10 h-10 rounded-full bg-stone-100 text-stone-400 flex items-center justify-center font-bold">?</div>
                               <div>
                                   <div className="font-bold text-charcoal text-sm">Hiring Senior</div>
                                   <div className="text-[10px] text-stone-400 uppercase tracking-widest">Pod Lead</div>
                               </div>
                          </div>

                           {/* Connector */}
                           <div className="h-6 w-px bg-stone-300 mx-auto my-[-10px]"></div>

                          {/* Junior */}
                          <div className="bg-white p-4 rounded-xl shadow-sm border-l-4 border-stone-300 mt-4 flex items-center gap-4 opacity-80">
                               <div className="w-10 h-10 rounded-full bg-stone-200 text-stone-500 flex items-center justify-center font-bold">M</div>
                               <div>
                                   <div className="font-bold text-charcoal text-sm">Marcus Johnson</div>
                                   <div className="text-[10px] text-stone-400 uppercase tracking-widest">Junior Recruiter</div>
                               </div>
                          </div>
                      </div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};

const BuildingIcon = ({ dept }: { dept: string }) => {
    if (dept === 'Engineering') return <Network size={14} className="text-purple-500" />;
    if (dept === 'HR & Ops') return <Users size={14} className="text-green-500" />;
    return <Briefcase size={14} className="text-rust" />;
};

const PlusIcon = () => (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="5" x2="12" y2="19"></line>
        <line x1="5" y1="12" x2="19" y2="12"></line>
    </svg>
);