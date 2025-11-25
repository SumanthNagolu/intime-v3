'use client';

import React from 'react';
import Link from 'next/link';
import { Briefcase, MapPin, DollarSign, Clock } from 'lucide-react';

export const TalentJobsList: React.FC = () => {
  const jobs = [
    { id: '1', title: 'Senior Full Stack Developer', company: 'Tech Corp', location: 'Remote', salary: '$120-150k', posted: '2 days ago', match: '95%' },
    { id: '2', title: 'DevOps Engineer', company: 'Cloud Solutions', location: 'New York, NY', salary: '$130-160k', posted: '1 week ago', match: '88%' },
    { id: '3', title: 'Frontend Developer', company: 'Startup Inc', location: 'San Francisco, CA', salary: '$110-140k', posted: '3 days ago', match: '92%' },
  ];

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10">
        <h1 className="text-4xl font-serif font-bold text-charcoal mb-2">Job Opportunities</h1>
        <p className="text-stone-500">Positions matched to your skills and experience</p>
      </div>

      <div className="space-y-4">
        {jobs.map((job) => (
          <Link key={job.id} href={`/talent/jobs/${job.id}`} className="block bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-lg transition-all">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                    <Briefcase size={20} />
                  </div>
                  <div>
                    <h3 className="font-serif text-xl font-bold text-charcoal">{job.title}</h3>
                    <div className="text-sm text-stone-600 mb-2">{job.company}</div>
                    <div className="flex items-center gap-4 text-sm text-stone-500">
                      <div className="flex items-center gap-1">
                        <MapPin size={14} />
                        {job.location}
                      </div>
                      <div className="flex items-center gap-1">
                        <DollarSign size={14} />
                        {job.salary}
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock size={14} />
                        {job.posted}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="inline-flex px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest">
                  {job.match} Match
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
};
