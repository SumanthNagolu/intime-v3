
import React from 'react';
import Link from 'next/link';
import { ChevronLeft, TrendingUp, Clock, DollarSign, Users, BarChart3 } from 'lucide-react';

export const BenchAnalytics: React.FC = () => {
  return (
    <div className="animate-fade-in pt-4">
      <Link href="/employee/bench/dashboard" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Dashboard
      </Link>

      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Bench Performance</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Utilization Metrics</h1>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
              { label: 'Avg Bench Time', value: '18 Days', status: 'warning', color: 'text-yellow-600', icon: Clock },
              { label: 'Placement Rate', value: '65%', status: 'good', color: 'text-green-600', icon: TrendingUp },
              { label: 'Interviews / Wk', value: '4.2', status: 'neutral', color: 'text-blue-600', icon: Users },
              { label: 'Revenue (MoM)', value: '$45k', status: 'good', color: 'text-charcoal', icon: DollarSign },
          ].map((stat, i) => (
              <div key={i} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
                  <div className="flex justify-between items-start mb-4">
                      <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">{stat.label}</div>
                      <stat.icon size={16} className="text-stone-300" />
                  </div>
                  <div className={`text-3xl font-serif font-bold ${stat.color}`}>{stat.value}</div>
              </div>
          ))}
      </div>

      {/* Consultant Aging */}
      <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-lg mb-8">
          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Consultant Aging Report</h3>
          <div className="relative h-48 flex items-end gap-4 border-b border-stone-200 pb-4 px-4">
              {[
                  { name: 'Vikram', days: 45 },
                  { name: 'Sarah', days: 12 },
                  { name: 'Amit', days: 28 },
                  { name: 'Mike', days: 5 },
                  { name: 'Emily', days: 60 },
              ].map((c, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center group relative">
                      <div 
                        className={`w-full rounded-t-xl transition-all relative ${c.days > 30 ? 'bg-red-400' : c.days > 14 ? 'bg-yellow-400' : 'bg-green-400'}`} 
                        style={{ height: `${(c.days / 60) * 100}%` }}
                      >
                          <div className="opacity-0 group-hover:opacity-100 absolute -top-8 left-1/2 -translate-x-1/2 bg-charcoal text-white text-xs font-bold px-2 py-1 rounded whitespace-nowrap transition-opacity z-10">
                              {c.days} Days
                          </div>
                      </div>
                      <div className="text-xs font-bold text-stone-500 mt-2 truncate w-full text-center">{c.name}</div>
                  </div>
              ))}
          </div>
          <div className="flex justify-between text-xs text-stone-400 mt-2 uppercase tracking-widest px-4">
              <span>Fresh (&lt;14d)</span>
              <span>Critical (&gt;30d)</span>
          </div>
      </div>
    </div>
  );
};
