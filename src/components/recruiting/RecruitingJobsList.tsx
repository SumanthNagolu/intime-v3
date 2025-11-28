'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, DollarSign, Users } from 'lucide-react';

export const RecruitingJobsList: React.FC = () => {
  const jobs = [
    { id: '1', title: 'Senior Full Stack Developer', client: 'Tech Corp', location: 'Remote', budget: '$120-150k', candidates: 8, status: 'Active' },
    { id: '2', title: 'DevOps Engineer', client: 'Cloud Solutions', location: 'New York, NY', budget: '$130-160k', candidates: 5, status: 'Active' },
    { id: '3', title: 'Product Manager', client: 'Startup Inc', location: 'San Francisco, CA', budget: '$140-180k', candidates: 12, status: 'Filled' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="space-y-4">
        {jobs.map((job) => (
          <Link key={job.id} href={`/employee/recruiting/jobs/${job.id}`} className="block bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-charcoal">{job.title}</h3>
                    <div className="text-sm text-stone-600 mb-2">{job.client}</div>
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {job.budget}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className={`inline-flex px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest mb-2 ${
                  job.status === 'Active' ? 'bg-green-50 text-green-700' : 'bg-stone-100 text-stone-600'
                }`}>
                  {job.status}
                </div>
                <div className="flex items-center gap-2 text-stone-500 text-sm">
                  <Users size={14} />
                  <span className="font-bold text-charcoal">{job.candidates}</span> in pipeline
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
