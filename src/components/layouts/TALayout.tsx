'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Target, DollarSign, Megaphone, Users, Building2 } from 'lucide-react';

interface TALayoutProps {
  children: React.ReactNode;
}

export const TALayout: React.FC<TALayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="pt-4">
      {/* Context Navigation Header */}
      <div className="mb-10 border-b border-stone-200 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
          <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Talent Acquisition</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">TA Workspace</h1>
          </div>
        </div>

        {/* Persistent Sub Navigation */}
        <div className="flex gap-8 overflow-x-auto">
          <Link
            href="/employee/ta/dashboard"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('dashboard') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <LayoutDashboard size={14} /> Console
          </Link>
          <Link
            href="/employee/ta/campaigns"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('campaigns') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Megaphone size={14} /> Campaigns
          </Link>
          <Link
            href="/employee/ta/prospects"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('prospects') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Building2 size={14} /> Prospects
          </Link>
          <Link
            href="/employee/ta/candidates"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('candidates') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Users size={14} /> Candidates
          </Link>
          <Link
            href="/employee/ta/leads"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('leads') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Target size={14} /> Leads
          </Link>
          <Link
            href="/employee/ta/deals"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('deals') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <DollarSign size={14} /> Deals
          </Link>
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
};
