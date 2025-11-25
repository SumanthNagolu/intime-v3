'use client';

import React from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { ChevronLeft, MapPin, DollarSign, Calendar, Users, Briefcase } from 'lucide-react';

export const ClientJobDetail: React.FC = () => {
  const { id } = useParams();

  const candidates = [
    { id: '1', name: 'John Smith', status: 'Submitted', date: 'Nov 20' },
    { id: '2', name: 'Sarah Johnson', status: 'Interview', date: 'Nov 18' },
    { id: '3', name: 'Mike Chen', status: 'Offer', date: 'Nov 15' },
  ];

  return (
    <div className="animate-fade-in pt-4">
      <Link href="/client/jobs" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Jobs
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden">
        <div className="p-10 border-b border-stone-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Briefcase size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">Senior Full Stack Developer</h1>
                <div className="flex items-center gap-4 text-sm text-stone-500">
                  <div className="flex items-center gap-1">
                    <MapPin size={14} />
                    Remote
                  </div>
                  <div className="flex items-center gap-1">
                    <DollarSign size={14} />
                    $120-150k
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    Posted Nov 10
                  </div>
                </div>
              </div>
            </div>
            <span className="px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">
              Active
            </span>
          </div>

          <div className="prose max-w-none">
            <h3 className="text-lg font-serif font-bold text-charcoal mb-3">Job Description</h3>
            <p className="text-stone-600">
              We are seeking an experienced Full Stack Developer to join our team. The ideal candidate will have 5+ years of experience with React, Node.js, and modern web technologies.
            </p>
          </div>
        </div>

        <div className="p-10">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-serif font-bold text-charcoal">Candidates ({candidates.length})</h3>
            <Link href="/client/pipeline" className="text-xs font-bold text-rust hover:text-[#B8421E] uppercase tracking-widest">
              View Pipeline →
            </Link>
          </div>

          <div className="space-y-3">
            {candidates.map((candidate) => (
              <Link key={candidate.id} href={`/client/candidate/${candidate.id}`} className="flex items-center justify-between p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-rust text-white rounded-full flex items-center justify-center font-bold">
                    {candidate.name.charAt(0)}
                  </div>
                  <div>
                    <div className="font-bold text-charcoal">{candidate.name}</div>
                    <div className="text-xs text-stone-500">{candidate.date}</div>
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest ${
                  candidate.status === 'Offer' ? 'bg-green-50 text-green-700' :
                  candidate.status === 'Interview' ? 'bg-blue-50 text-blue-700' :
                  'bg-stone-100 text-stone-600'
                }`}>
                  {candidate.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
