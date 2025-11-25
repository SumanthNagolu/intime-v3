'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LayoutDashboard, Award, Users, GraduationCap } from 'lucide-react';

interface AcademyLayoutProps {
  children: React.ReactNode;
}

export const AcademyLayout: React.FC<AcademyLayoutProps> = ({ children }) => {
  const pathname = usePathname();

  const isActive = (path: string) => pathname.includes(path);

  return (
    <div className="pt-4">
      {/* Context Navigation Header */}
      <div className="mb-10 border-b border-stone-200 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
          <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Academy Admin</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Academy Administration</h1>
          </div>
        </div>

        {/* Persistent Sub Navigation */}
        <div className="flex gap-8 overflow-x-auto">
          <Link
            href="/employee/academy/admin/cohorts"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('cohorts') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <GraduationCap size={14} /> Cohorts
          </Link>
          <Link
            href="/employee/academy/admin/students"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('students') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Users size={14} /> Students
          </Link>
          <Link
            href="/employee/academy/admin/certificates"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('certificates') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Award size={14} /> Certificates
          </Link>
        </div>
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
};
