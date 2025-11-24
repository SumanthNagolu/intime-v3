
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, TrendingUp, Users, Clock, Target, DollarSign, Activity } from 'lucide-react';

export const RecruiterAnalytics: React.FC = () => {
  return (
    <div className="animate-fade-in pt-4">
      <Link href="/employee/recruiting/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Performance</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Recruiter Analytics</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
              { label: 'Placements YTD', value: '12', change: '+2 vs Q3', color: 'text-charcoal', icon: Users },
              { label: 'Submission Ratio', value: '3:1', change: 'Optimal', color: 'text-green-600', icon: Activity },
              { label: 'Time to Fill', value: '18d', change: '-2 days', color: 'text-blue-600', icon: Clock },
              { label: 'Pipeline Value', value: '$180k', change: 'Q4 Forecast', color: 'text-rust', icon: DollarSign },
          ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm relative overflow-hidden">
                  <div className="flex justify-between items-start mb-4">
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">{stat.label}</div>
                      <stat.icon size={16} className="text-stone-300" />
                  </div>
                  <div className={`text-4xl font-serif font-bold mb-2 ${stat.color}`}>{stat.value}</div>
                  <div className="text-xs font-medium text-stone-500 bg-stone-50 px-2 py-1 rounded inline-block">{stat.change}</div>
              </div>
          ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Funnel Chart */}
          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Submission Funnel</h3>
              <div className="space-y-4">
                  {[
                      { stage: 'Sourced', count: 120, pct: 100, color: 'bg-stone-200' },
                      { stage: 'Screened', count: 45, pct: 37.5, color: 'bg-blue-200' },
                      { stage: 'Submitted', count: 28, pct: 23.3, color: 'bg-blue-400' },
                      { stage: 'Interview', count: 12, pct: 10, color: 'bg-purple-400' },
                      { stage: 'Offer', count: 5, pct: 4.1, color: 'bg-green-400' },
                      { stage: 'Placed', count: 4, pct: 3.3, color: 'bg-green-600' },
                  ].map((step) => (
                      <div key={step.stage}>
                          <div className="flex justify-between text-sm font-bold text-charcoal mb-1">
                              <span>{step.stage}</span>
                              <span>{step.count}</span>
                          </div>
                          <div className="h-3 bg-stone-50 rounded-full overflow-hidden">
                              <div className={`h-full ${step.color} rounded-full`} style={{ width: `${step.pct}%` }}></div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>

          {/* Source Effectiveness */}
          <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg">
              <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Source Effectiveness</h3>
              <div className="space-y-6">
                  {[
                      { source: 'LinkedIn Recruiter', hires: 6, qual: 92 },
                      { source: 'Internal Bench', hires: 4, qual: 98 },
                      { source: 'Referrals', hires: 2, qual: 85 },
                  ].map((src, i) => (
                      <div key={i} className="flex items-center justify-between p-4 border border-stone-100 rounded-xl hover:bg-stone-50 transition-colors">
                          <div>
                              <div className="font-bold text-charcoal text-sm">{src.source}</div>
                              <div className="text-xs text-stone-500">{src.hires} Hires YTD</div>
                          </div>
                          <div className="text-right">
                              <div className="text-lg font-bold text-green-600">{src.qual}%</div>
                              <div className="text-[10px] text-stone-400 uppercase tracking-widest">Quality Score</div>
                          </div>
                      </div>
                  ))}
              </div>
          </div>
      </div>
    </div>
  );
};
