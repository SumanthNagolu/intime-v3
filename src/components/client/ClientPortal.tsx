'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, Users, TrendingUp, FileText } from 'lucide-react';

export const ClientPortal: React.FC = () => {
  const cards = [
    { title: 'Active Jobs', count: '3', icon: Briefcase, href: '/client/jobs', color: 'bg-blue-50 text-blue-600' },
    { title: 'Candidates', count: '12', icon: Users, href: '/client/pipeline', color: 'bg-green-50 text-green-600' },
    { title: 'Placements', count: '8', icon: TrendingUp, href: '/client/pipeline', color: 'bg-purple-50 text-purple-600' },
    { title: 'Documents', count: '24', icon: FileText, href: '/client/portal', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Client Portal</h1>
        <p className="text-stone-500">Manage your job orders and candidate pipeline</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((card, i) => (
          <Link key={i} href={card.href} className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all">
            <div className={`w-12 h-12 rounded-xl ${card.color} flex items-center justify-center mb-4`}>
              <card.icon size={24} />
            </div>
            <div className="text-3xl font-serif font-bold text-charcoal mb-1">{card.count}</div>
            <div className="text-sm font-bold text-stone-400 uppercase tracking-widest">{card.title}</div>
          </Link>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Recent Activity</h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div>
                <div className="font-bold text-charcoal">New candidate submitted</div>
                <div className="text-xs text-stone-500">Senior Developer role</div>
              </div>
              <div className="text-xs text-stone-400">2 hours ago</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-stone-50 rounded-xl">
              <div>
                <div className="font-bold text-charcoal">Interview scheduled</div>
                <div className="text-xs text-stone-500">Full Stack Engineer</div>
              </div>
              <div className="text-xs text-stone-400">5 hours ago</div>
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Quick Actions</h3>
          <div className="space-y-3">
            <Link href="/client/post" className="block w-full py-4 bg-charcoal text-white rounded-xl text-center text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all">
              Post New Job
            </Link>
            <Link href="/client/jobs" className="block w-full py-4 bg-stone-50 border border-stone-200 text-charcoal rounded-xl text-center text-xs font-bold uppercase tracking-widest hover:border-rust transition-all">
              View All Jobs
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};
