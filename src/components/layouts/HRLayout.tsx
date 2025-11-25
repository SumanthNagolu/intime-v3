'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Users, GitBranch, Clock, DollarSign, FileText, TrendingUp, GraduationCap, UserPlus, BarChart3 } from 'lucide-react';

interface HRLayoutProps {
  children: React.ReactNode;
}

export const HRLayout: React.FC<HRLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="pt-4">
      {/* Context Navigation Header */}
      <div className="mb-10 border-b border-stone-200 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
          <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Human Resources</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">HR Workspace</h1>
          </div>
        </div>

        {/* Persistent Sub Navigation */}
        <div className="flex gap-8 overflow-x-auto">
          <Link
            href="/employee/hr/dashboard"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('dashboard') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <LayoutDashboard size={14} /> Console
          </Link>
          <Link
            href="/employee/hr/people"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('people') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Users size={14} /> People
          </Link>
          <Link
            href="/employee/hr/org"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('org') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <GitBranch size={14} /> Org Chart
          </Link>
          <Link
            href="/employee/hr/time"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('time') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Clock size={14} /> Time
          </Link>
          <Link
            href="/employee/hr/payroll"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('payroll') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <DollarSign size={14} /> Payroll
          </Link>
          <Link
            href="/employee/hr/documents"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('documents') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <FileText size={14} /> Documents
          </Link>
          <Link
            href="/employee/hr/performance"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('performance') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <TrendingUp size={14} /> Performance
          </Link>
          <Link
            href="/employee/hr/learning"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('learning') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <GraduationCap size={14} /> Learning
          </Link>
          <Link
            href="/employee/hr/recruitment"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('recruitment') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <UserPlus size={14} /> Recruitment
          </Link>
          <Link
            href="/employee/hr/analytics"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('analytics') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <BarChart3 size={14} /> Analytics
          </Link>
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
};
