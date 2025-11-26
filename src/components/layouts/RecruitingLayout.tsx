'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface RecruitingLayoutProps {
  children: React.ReactNode;
}

export const RecruitingLayout: React.FC<RecruitingLayoutProps> = ({ children }) => {
  const router = useRouter();

  return (
    <div className="pt-4">
      {/* Context Header - No tabs, those are in navbar now */}
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6">
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
      </div>

      {/* Page Content */}
      {children}
    </div>
  );
};
