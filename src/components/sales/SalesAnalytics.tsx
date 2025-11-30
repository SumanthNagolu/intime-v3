
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, Megaphone } from 'lucide-react';

export const SalesAnalytics: React.FC = () => {
  return (
    <div className="animate-fade-in pt-4">
      <Link href="/employee/ta/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Acquisition</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Sourcing Analytics</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Sourcing Funnel */}
          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Candidate Sourcing Funnel</h3>
              <div className="space-y-6">
                  {[
                      { label: 'Identified', count: 450, pct: 100 },
                      { label: 'Contacted', count: 320, pct: 71 },
                      { label: 'Replied', count: 45, pct: 14 },
                      { label: 'Interested', count: 12, pct: 3.7 },
                      { label: 'Handoff to Recruiting', count: 8, pct: 2.5 },
                  ].map((stage, i) => (
                      <div key={i} className="relative">
                          <div className="flex justify-between mb-1 text-sm font-bold text-charcoal">
                              <span>{stage.label}</span>
                              <span>{stage.count}</span>
                          </div>
                          <div className="h-3 bg-stone-100 rounded-full overflow-hidden">
                              <div className="h-full bg-purple-600 rounded-full" style={{ width: `${stage.pct}%` }}></div>
                          </div>
                          <div className="text-right text-[10px] text-stone-400 mt-1">{stage.pct}% Conv.</div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Campaign Performance */}
          <div className="space-y-8">
              <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
                  <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Top Performing Campaigns</h3>
                  <div className="space-y-4">
                      {[
                          { name: 'Senior Guidewire Devs - Q4', open: '68%', reply: '12%' },
                          { name: 'Technical Leads - East Coast', open: '55%', reply: '8%' },
                          { name: 'BillingCenter Architects', open: '72%', reply: '15%' },
                      ].map((camp, i) => (
                          <div key={i} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100">
                              <div>
                                  <div className="font-bold text-sm text-charcoal">{camp.name}</div>
                                  <div className="flex gap-4 mt-1 text-xs text-stone-500">
                                      <span className="flex items-center gap-1"><Megaphone size={10}/> Outbound</span>
                                  </div>
                              </div>
                              <div className="text-right">
                                  <div className="text-sm font-bold text-green-600">{camp.reply} Reply</div>
                                  <div className="text-[10px] text-stone-400">{camp.open} Open Rate</div>
                              </div>
                          </div>
                      ))}
                  </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                  <div className="bg-stone-900 p-6 rounded-2xl text-white">
                      <div className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">Avg Response</div>
                      <div className="text-3xl font-bold text-white">14.2%</div>
                      <div className="text-xs text-green-400 mt-1">+2.1% vs Bench</div>
                  </div>
                  <div className="bg-rust p-6 rounded-2xl text-white">
                      <div className="text-xs font-bold uppercase tracking-widest text-white/80 mb-2">Meetings</div>
                      <div className="text-3xl font-bold text-white">18</div>
                      <div className="text-xs text-white/80 mt-1">Booked this month</div>
                  </div>
              </div>
          </div>
      </div>
    </div>
  );
};
