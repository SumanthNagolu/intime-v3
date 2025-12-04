'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useAppStore } from '../../lib/store';
import { ChevronLeft, Briefcase, DollarSign, Calendar, CheckCircle, ArrowRight, Percent, TrendingUp } from 'lucide-react';
import { Account, Candidate } from '../../types';
import { ConvertOutcomeModal } from './Modals';

const STAGES = ['Prospect', 'Discovery', 'Proposal', 'Negotiation', 'Won', 'Lost'];

export const DealDetail: React.FC = () => {
  const { dealId } = useParams();
  const router = useRouter();
  const { deals, leads, updateDeal, addAccount, addCandidate } = useAppStore();
  const deal = deals.find(d => d.id === dealId);
  // Find underlying lead to get contact name
  const lead = leads.find(l => l.id === deal?.leadId);
  
  const [isConvertModalOpen, setIsConvertModalOpen] = useState(false);
  
  if (!deal) return <div className="p-8 text-center text-stone-500">Deal not found. Check ID: {dealId}</div>;

  const handleStageChange = (newStage: string) => {
      updateDeal({ ...deal, stage: newStage as 'Prospect' | 'Discovery' | 'Proposal' | 'Negotiation' | 'Won' | 'Lost' });
  };

  const handleConversion = (type: 'account' | 'bench' | 'academy', data: Record<string, unknown>) => {
      const { name } = data as { name: string };
      updateDeal({ ...deal, stage: 'Won' });

      if (type === 'account') {
          const newAccount: Account = {
              id: `a${Date.now()}`,
              name: name,
              industry: 'Insurance', // Default
              status: 'Active',
              accountManagerId: 'current-user',
              type: 'Direct Client',
              responsiveness: 'Medium',
              preference: 'Quality',
              pocs: []
          };
          addAccount(newAccount);
          setIsConvertModalOpen(false);
          router.push(`/employee/recruiting/accounts/${newAccount.id}`);
      } else {
          // Both Bench and Academy create a Candidate record
          const newCandidate: Candidate = {
              id: `c${Date.now()}`,
              name: name,
              role: type === 'bench' ? 'Guidewire Consultant' : 'Trainee',
              status: type === 'bench' ? 'bench' : 'active',
              type: type === 'bench' ? 'internal_bench' : 'student',
              skills: [],
              experience: '0 Yrs',
              location: 'Remote',
              rate: 'TBD',
              email: lead?.email || '',
              score: 0,
              source: type === 'bench' ? 'Recruiting' : 'Academy Sales'
          };
          addCandidate(newCandidate);
          setIsConvertModalOpen(false);
          // Navigate to relevant dashboard
          if (type === 'bench') router.push('/employee/bench/dashboard');
          else router.push('/academy/admin/dashboard'); // Or wherever trainee list is
      }
  };

  return (
    <div className="animate-fade-in">
      <Link href="/employee/recruiting/deals" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Pipeline
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 p-8 mb-8">
          <div className="flex justify-between items-start mb-8">
              <div>
                  <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">{deal.company}</div>
                  <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">{deal.title}</h1>
                  <div className="flex gap-6 text-sm text-stone-600">
                      <span className="flex items-center gap-2"><DollarSign size={16} className="text-green-600"/> {deal.value}</span>
                      <span className="flex items-center gap-2"><Calendar size={16} className="text-rust"/> Close: {deal.expectedClose}</span>
                      <span className="flex items-center gap-2"><Percent size={16} className="text-blue-600"/> {deal.probability}% Probability</span>
                  </div>
              </div>
              <div className="flex gap-3">
                  {deal.stage === 'Won' ? (
                      <button 
                        className="px-6 py-2 bg-green-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest shadow-lg flex items-center gap-2 cursor-default"
                      >
                          <CheckCircle size={14}/> Deal Won
                      </button>
                  ) : (
                      <>
                        <button onClick={() => handleStageChange('Lost')} className="px-4 py-2 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-red-50 hover:text-red-600 hover:border-red-100 transition-colors">Mark Lost</button>
                        <button onClick={() => setIsConvertModalOpen(true)} className="px-6 py-2 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-600 transition-colors shadow-lg flex items-center gap-2">
                            Mark Won & Convert <ArrowRight size={14} />
                        </button>
                      </>
                  )}
              </div>
          </div>

          {/* Stage Stepper */}
          <div className="relative flex justify-between items-center mb-8 px-10">
              <div className="absolute top-1/2 left-0 w-full h-1 bg-stone-100 -z-10"></div>
              {STAGES.map((stage, i) => {
                  const isCompleted = STAGES.indexOf(deal.stage) >= i;
                  const isCurrent = deal.stage === stage;
                  
                  return (
                      <button 
                        key={stage}
                        onClick={() => handleStageChange(stage)}
                        className="flex flex-col items-center gap-2 group"
                      >
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold border-4 transition-all ${
                              isCurrent ? 'bg-rust border-white shadow-lg text-white scale-125' : 
                              isCompleted ? 'bg-charcoal border-white text-white' : 
                              'bg-stone-100 border-white text-stone-400'
                          }`}>
                              {isCompleted ? <CheckCircle size={12} /> : i + 1}
                          </div>
                          <span className={`text-[10px] font-bold uppercase tracking-widest ${isCurrent ? 'text-rust' : 'text-stone-400'}`}>{stage}</span>
                      </button>
                  )
              })}
          </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 bg-white rounded-[2rem] border border-stone-200 shadow-lg p-8">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Deal Details</h3>
              <div className="space-y-6">
                  <div className="p-4 bg-stone-50 rounded-xl border border-stone-100">
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Notes</div>
                      <p className="text-sm text-stone-600 leading-relaxed">{deal.notes || "No notes added."}</p>
                  </div>
                  {/* Placeholder for more details */}
                  <div className="flex items-center gap-4 p-4 border-2 border-dashed border-stone-100 rounded-xl text-stone-400 justify-center">
                      <Briefcase size={20} />
                      <span className="text-sm font-bold">Contract Documents (Coming Soon)</span>
                  </div>
              </div>
          </div>

          <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-xl relative overflow-hidden bg-noise">
              <div className="absolute top-0 right-0 w-32 h-32 bg-rust/20 rounded-full blur-2xl -mr-6 -mt-6"></div>
              <h3 className="font-serif text-xl font-bold mb-6 relative z-10">Probability Analysis</h3>
              
              <div className="relative z-10 space-y-6">
                  <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center">
                          <TrendingUp size={24} />
                      </div>
                      <div>
                          <div className="text-2xl font-bold">{deal.probability}%</div>
                          <div className="text-xs text-stone-400">Likelihood to Close</div>
                      </div>
                  </div>
                  
                  <div className="p-4 bg-white/10 rounded-xl border border-white/10">
                      <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Next Best Action</div>
                      <p className="text-sm leading-relaxed">Schedule follow-up meeting with stakeholders to discuss pricing tiers.</p>
                  </div>
              </div>
          </div>
      </div>

      {/* Convert Modal */}
      {isConvertModalOpen && (
          <ConvertOutcomeModal 
            deal={deal} 
            onClose={() => setIsConvertModalOpen(false)}
            onConvert={handleConversion}
            prefillData={{ name: lead?.contact || '' }}
          />
      )}
    </div>
  );
};
