'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Target, DollarSign, Briefcase, List } from 'lucide-react';

interface RecruitingLayoutProps {
  children: React.ReactNode;
}

export const RecruitingLayout: React.FC<RecruitingLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="pt-4">
      {/* Context Navigation Header */}
      <div className="mb-10 border-b border-stone-200 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
          <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Internal Recruiting</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Recruiter Workspace</h1>
          </div>
          <button
            onClick={() => router.push('/employee/recruiting/post')}
            className="px-6 py-3 bg-charcoal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-rust transition-colors flex items-center gap-2"
          >
            <span className="text-lg">+</span>
            New Requisition
          </button>
        </div>

        {/* Persistent Sub Navigation */}
        <div className="flex gap-8 overflow-x-auto">
          <Link
            href="/employee/recruiting/dashboard"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('dashboard') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <LayoutDashboard size={14} /> Console
          </Link>
          <Link
            href="/employee/recruiting/accounts"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('accounts') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Building2 size={14} /> Accounts
          </Link>
          <Link
            href="/employee/recruiting/leads"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('leads') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Target size={14} /> Leads
          </Link>
          <Link
            href="/employee/recruiting/deals"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('deals') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <DollarSign size={14} /> Deals
          </Link>
          <Link
            href="/employee/recruiting/jobs"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('jobs') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Briefcase size={14} /> Jobs
          </Link>
          <Link
            href="/employee/recruiting/pipeline"
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
