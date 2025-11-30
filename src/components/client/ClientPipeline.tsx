'use client';

import React from 'react';
import Link from 'next/link';

export const ClientPipeline: React.FC = () => {
  const stages = [
    { name: 'Submitted', count: 8, candidates: [
      { id: '1', name: 'John Smith', job: 'Senior Developer' },
      { id: '2', name: 'Jane Doe', job: 'DevOps Engineer' },
    ]},
    { name: 'Interview', count: 5, candidates: [
      { id: '3', name: 'Sarah Johnson', job: 'Senior Developer' },
    ]},
    { name: 'Offer', count: 2, candidates: [
      { id: '4', name: 'Mike Chen', job: 'Product Manager' },
    ]},
    { name: 'Placed', count: 8, candidates: [] },
  ];

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Candidate Pipeline</h1>
        <p className="text-stone-500">Track candidates through the hiring process</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {stages.map((stage, i) => (
          <div key={i} className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
            <div className="p-6 bg-stone-50 border-b border-stone-100">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-charcoal uppercase tracking-widest text-xs">{stage.name}</h3>
                <div className="w-8 h-8 bg-charcoal text-white rounded-full flex items-center justify-center text-sm font-bold">
                  {stage.count}
                </div>
              </div>
            </div>
            <div className="p-4 space-y-3 min-h-[400px]">
              {stage.candidates.map((candidate) => (
                <Link key={candidate.id} href={`/client/candidate/${candidate.id}`} className="block p-4 bg-stone-50 rounded-xl hover:bg-stone-100 transition-colors">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-8 h-8 bg-rust text-white rounded-full flex items-center justify-center text-sm font-bold">
                      {candidate.name.charAt(0)}
                    </div>
                    <div className="font-bold text-charcoal text-sm">{candidate.name}</div>
                  </div>
                  <div className="text-xs text-stone-500">{candidate.job}</div>
                </Link>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
