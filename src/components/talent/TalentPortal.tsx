'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, FileText, Award, BookOpen } from 'lucide-react';

export const TalentPortal: React.FC = () => {
  const cards = [
    { title: 'Job Matches', count: '15', icon: Briefcase, href: '/talent/jobs', color: 'bg-blue-50 text-blue-600' },
    { title: 'Applications', count: '3', icon: FileText, href: '/talent/jobs', color: 'bg-green-50 text-green-600' },
    { title: 'Skills', count: '12', icon: Award, href: '/talent/portal', color: 'bg-purple-50 text-purple-600' },
    { title: 'Certifications', count: '4', icon: BookOpen, href: '/talent/portal', color: 'bg-orange-50 text-orange-600' },
  ];

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Talent Portal</h1>
        <p className="text-stone-500">Your career dashboard and job opportunities</p>
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
          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Recent Job Matches</h3>
          <div className="space-y-4">
            <Link href="/talent/jobs/1" className="block p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
              <div className="font-bold text-charcoal mb-1">Senior Full Stack Developer</div>
              <div className="text-xs text-stone-500">Remote • $120-150k • Posted 2 days ago</div>
            </Link>
            <Link href="/talent/jobs/2" className="block p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
              <div className="font-bold text-charcoal mb-1">DevOps Engineer</div>
              <div className="text-xs text-stone-500">New York, NY • $130-160k • Posted 1 week ago</div>
            </Link>
          </div>
        </div>

        <div className="bg-white p-8 rounded-[2rem] border border-stone-200 shadow-sm">
          <h3 className="font-serif text-xl font-bold text-charcoal mb-6">Profile Completion</h3>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-charcoal">Resume</span>
                <span className="text-green-600 font-bold">100%</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-green-500" style={{ width: '100%' }}></div>
              </div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-2">
                <span className="font-bold text-charcoal">Skills Assessment</span>
                <span className="text-blue-600 font-bold">75%</span>
              </div>
              <div className="h-2 bg-stone-100 rounded-full overflow-hidden">
                <div className="h-full bg-blue-500" style={{ width: '75%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
