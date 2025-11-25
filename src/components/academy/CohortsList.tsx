'use client';

import React from 'react';
import Link from 'next/link';
import { Users, Calendar, Award, TrendingUp, Plus } from 'lucide-react';

export const CohortsList: React.FC = () => {
  const cohorts = [
    { id: 'c1', name: 'Nov 2025 - Guidewire PolicyCenter', students: 24, startDate: 'Nov 1, 2025', endDate: 'Dec 27, 2025', status: 'Active', progress: 65 },
    { id: 'c2', name: 'Oct 2025 - Full Stack Development', students: 18, startDate: 'Oct 1, 2025', endDate: 'Nov 26, 2025', status: 'Active', progress: 85 },
    { id: 'c3', name: 'Sep 2025 - DevOps Engineering', students: 15, startDate: 'Sep 1, 2025', endDate: 'Oct 25, 2025', status: 'Completed', progress: 100 },
  ];

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Training Cohorts</h1>
          <p className="text-stone-500">Manage and track all training cohorts</p>
        </div>
        <Link href="/employee/academy/admin/cohorts/new" className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all flex items-center gap-2">
          <Plus size={16} /> New Cohort
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
              <Users size={20} />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-charcoal">57</div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Active Students</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-green-50 text-green-600 rounded-xl flex items-center justify-center">
              <Award size={20} />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-charcoal">15</div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Completed</div>
            </div>
          </div>
        </div>
        <div className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center">
              <TrendingUp size={20} />
            </div>
            <div>
              <div className="text-2xl font-serif font-bold text-charcoal">83%</div>
              <div className="text-xs font-bold text-stone-400 uppercase tracking-widest">Avg Progress</div>
            </div>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {cohorts.map((cohort) => (
          <Link key={cohort.id} href={`/employee/academy/admin/cohorts/${cohort.id}`} className="block bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <h3 className="font-serif text-xl font-bold text-charcoal mb-2">{cohort.name}</h3>
                <div className="flex items-center gap-4 text-sm text-stone-500">
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    {cohort.startDate} - {cohort.endDate}
                  </div>
                  <div className="flex items-center gap-1">
                    <Users size={14} />
                    {cohort.students} students
                  </div>
                </div>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                cohort.status === 'Active' ? 'bg-green-50 text-green-700' :
                cohort.status === 'Completed' ? 'bg-blue-50 text-blue-700' :
                'bg-stone-100 text-stone-600'
              }`}>
                {cohort.status}
              </span>
            </div>
            <div>
              <div className="flex justify-between text-xs font-bold text-charcoal mb-1">
                <span>Overall Progress</span>
                <span>{cohort.progress}%</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className={`h-full ${cohort.status === 'Completed' ? 'bg-green-500' : 'bg-blue-500'}`} style={{ width: `${cohort.progress}%` }}></div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
