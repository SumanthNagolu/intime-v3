'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { ChevronLeft, MapPin, DollarSign, Clock, Briefcase, CheckCircle } from 'lucide-react';

export const TalentJobDetail: React.FC = () => {
  const [applied, setApplied] = useState(false);

  const handleApply = () => {
    setApplied(true);
  };

  return (
    <div className="animate-fade-in pt-4">
      <Link href="/talent/jobs" className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6">
        <ChevronLeft size={14} /> Back to Jobs
      </Link>

      <div className="bg-white rounded-[2.5rem] shadow-xl border border-stone-200 overflow-hidden">
        <div className="p-10 border-b border-stone-100">
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-center gap-4 flex-1">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center">
                <Briefcase size={28} />
              </div>
              <div>
                <h1 className="text-3xl font-serif font-bold text-charcoal mb-2">Senior Full Stack Developer</h1>
                <div className="text-lg text-stone-600 mb-3">Tech Corp</div>
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
                    <Clock size={14} />
                    Posted 2 days ago
                  </div>
                </div>
              </div>
            </div>
            <div className="text-right">
              <div className="inline-flex px-4 py-2 bg-green-50 text-green-700 rounded-full text-xs font-bold uppercase tracking-widest mb-3">
                95% Match
              </div>
              {applied ? (
                <div className="flex items-center gap-2 text-green-600 font-bold">
                  <CheckCircle size={20} />
                  Application Submitted
                </div>
              ) : (
                <button onClick={handleApply} className="block w-full px-8 py-4 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all">
                  Apply Now
                </button>
              )}
            </div>
          </div>
        </div>

        <div className="p-10">
          <div className="prose max-w-none mb-8">
            <h3 className="text-lg font-serif font-bold text-charcoal mb-3">Job Description</h3>
            <p className="text-stone-600 mb-4">
              We are seeking an experienced Full Stack Developer to join our growing team. The ideal candidate will have 5+ years of experience with React, Node.js, and modern web technologies.
            </p>

            <h4 className="text-md font-serif font-bold text-charcoal mb-2 mt-6">Requirements</h4>
            <ul className="list-disc list-inside text-stone-600 space-y-2">
              <li>5+ years of experience in full stack development</li>
              <li>Strong proficiency in React and Node.js</li>
              <li>Experience with TypeScript and modern build tools</li>
              <li>Familiarity with cloud platforms (AWS, Azure, or GCP)</li>
            </ul>

            <h4 className="text-md font-serif font-bold text-charcoal mb-2 mt-6">Benefits</h4>
            <ul className="list-disc list-inside text-stone-600 space-y-2">
              <li>Competitive salary and equity package</li>
              <li>Remote work flexibility</li>
              <li>Health, dental, and vision insurance</li>
              <li>401(k) with company match</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};
