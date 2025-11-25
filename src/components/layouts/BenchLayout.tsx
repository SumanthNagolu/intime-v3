'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, User, Briefcase, Flame, Target, DollarSign, List } from 'lucide-react';

interface BenchLayoutProps {
  children: React.ReactNode;
}

export const BenchLayout: React.FC<BenchLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="pt-4">
      {/* Context Navigation Header */}
      <div className="mb-10 border-b border-stone-200 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
          <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Bench Sales</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Bench Workspace</h1>
          </div>
        </div>

        {/* Persistent Sub Navigation */}
        <div className="flex gap-8 overflow-x-auto">
          <Link
            href="/employee/bench/dashboard"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('dashboard') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <LayoutDashboard size={14} /> Console
          </Link>
          <Link
            href="/employee/bench/talent"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('talent') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <User size={14} /> Talent
          </Link>
          <Link
            href="/employee/bench/collector"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('collector') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Briefcase size={14} /> Bench Board
          </Link>
          <Link
            href="/employee/bench/hotlist"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('hotlist') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Flame size={14} /> Hotlist
          </Link>
          <Link
            href="/employee/bench/leads"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('leads') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Target size={14} /> Leads
          </Link>
          <Link
            href="/employee/bench/deals"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('deals') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <DollarSign size={14} /> Deals
          </Link>
          <Link
            href="/employee/bench/pipeline"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('pipeline') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <List size={14} /> Pipeline
          </Link>
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
};
