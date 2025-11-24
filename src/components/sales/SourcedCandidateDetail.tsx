'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { ChevronLeft, MapPin, Linkedin, Mail, Phone, Calendar, User, ArrowRight, CheckCircle } from 'lucide-react';
import { HandoffModal } from './HandoffModal';

export const SourcedCandidateDetail: React.FC = () => {
  const { id } = useParams();
  const router = useRouter();
  const [isHandoffOpen, setIsHandoffOpen] = useState(false);

  // Mock data - in real app, fetch from store using id
  const candidate = {
      id,
      name: 'David Chen',
      role: 'Senior Java Developer',
      company: 'Oracle',
      location: 'Austin, TX',
      status: 'Identified',
      email: 'david.chen@example.com',
      phone: '+1 (555) 987-6543',
      linkedin: 'linkedin.com/in/davidchen',
      notes: 'Strong background in enterprise systems. Open to relocation.'
  };

  const handleHandoff = (toRole: string, note: string) => {
      // In real app, update store here
      console.log(`Handing off ${candidate.name} to ${toRole} with note: ${note}`);
      setIsHandoffOpen(false);
      router.push('/employee/ta/candidates'); // Return to list
  };

  return (
    <div className="animate-fade-in pt-4">
      <Link href="/employee/ta/candidates" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Sourcing
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
          
          {/* Left: Profile Card */}
          <div className="lg:w-1/3 space-y-6">
              <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-200 text-center relative overflow-hidden">
                  <div className="absolute top-0 left-0 w-full h-32 bg-stone-100 z-0"></div>
                  <div className="relative z-10">
                      <div className="w-32 h-32 mx-auto bg-charcoal text-white rounded-full flex items-center justify-center text-4xl font-serif font-bold mb-4 border-4 border-white shadow-xl">
                          {candidate.name.charAt(0)}
                      </div>
                      <h1 className="text-2xl font-serif font-bold text-charcoal mb-1">{candidate.name}</h1>
                      <p className="text-stone-500 font-medium mb-6">{candidate.role}</p>
                      
                      <div className="flex justify-center gap-2 mb-8">
                          <span className="px-3 py-1 bg-blue-50 text-blue-700 rounded-full text-[10px] font-bold uppercase tracking-widest border border-blue-100">
                              {candidate.status}
                          </span>
                      </div>

                      <div className="space-y-4 text-left border-t border-stone-100 pt-6">
                          <div className="flex items-center gap-3 text-sm text-stone-600">
                              <Linkedin size={16} className="text-blue-700" />
                              <span>{candidate.company}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-stone-600">
                              <MapPin size={16} className="text-stone-400" />
                              <span>{candidate.location}</span>
                          </div>
                          <div className="flex items-center gap-3 text-sm text-stone-600">
                              <Mail size={16} className="text-stone-400" />
                              <span>{candidate.email}</span>
                          </div>
                      </div>
                  </div>
              </div>

              <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-lg">
                  <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400 mb-4">Actions</h3>
                  <button 
                    onClick={() => setIsHandoffOpen(true)}
                    className="w-full py-4 bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all flex items-center justify-center gap-2 mb-3"
                  >
                      Hand Off <ArrowRight size={14} />
                  </button>
                  <button className="w-full py-4 bg-transparent border border-stone-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-800 transition-all flex items-center justify-center gap-2">
                      Log Call <Phone size={14} />
                  </button>
              </div>
          </div>

          {/* Right: Details */}
          <div className="flex-1 bg-white p-10 rounded-[2rem] shadow-sm border border-stone-200">
              <div className="flex justify-between items-center mb-8">
                  <h3 className="font-serif text-xl font-bold text-charcoal">Sourcing Notes</h3>
                  <span className="text-xs text-stone-400">Last updated: Today</span>
              </div>
              <p className="text-stone-600 leading-relaxed mb-8">
                  {candidate.notes}
              </p>

              <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Engagement History</h3>
              <div className="space-y-6 relative">
                  <div className="absolute left-3 top-2 bottom-2 w-px bg-stone-100"></div>
                  <div className="relative pl-8">
                      <div className="absolute left-0 top-0 w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-xs font-bold">1</div>
                      <div className="text-sm font-bold text-charcoal">Added to Database</div>
                      <div className="text-xs text-stone-400">Imported via LinkedIn</div>
                  </div>
                  <div className="relative pl-8">
                      <div className="absolute left-0 top-0 w-6 h-6 bg-stone-100 text-stone-500 rounded-full flex items-center justify-center text-xs font-bold">2</div>
                      <div className="text-sm font-bold text-charcoal">Sent Intro InMail</div>
                      <div className="text-xs text-stone-400">Campaign: "Q4 Tech Leads"</div>
                  </div>
              </div>
          </div>
      </div>

      <HandoffModal 
        isOpen={isHandoffOpen}
        onClose={() => setIsHandoffOpen(false)}
        type="candidate"
        entityName={candidate.name}
        onSubmit={handleHandoff}
      />
    </div>
  );
};
