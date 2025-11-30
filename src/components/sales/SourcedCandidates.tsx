'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { Search, MapPin, Linkedin, MoreHorizontal } from 'lucide-react';

export const SourcedCandidates: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const candidates = [
      { id: 'sc1', name: 'David Chen', role: 'Senior Java Developer', company: 'Oracle', location: 'Austin, TX', status: 'Identified' },
      { id: 'sc2', name: 'Sarah Miller', role: 'Guidewire Architect', company: 'Accenture', location: 'Chicago, IL', status: 'Contacted' },
      { id: 'sc3', name: 'James Wilson', role: 'PolicyCenter Lead', company: 'Deloitte', location: 'Remote', status: 'Interested' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
              <Search size={18} className="text-stone-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search sourced talent..." 
                className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <button className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg">
              + Add Candidate
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {candidates.map(c => (
              <Link href={`/employee/ta/candidate/${c.id}`} key={c.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-purple-300 transition-all group relative">
                  <div className="absolute top-6 right-6 text-stone-300 group-hover:text-charcoal transition-colors">
                      <MoreHorizontal size={20} />
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center text-xl font-serif font-bold text-charcoal group-hover:bg-purple-600 group-hover:text-white transition-colors border border-stone-100">
                          {c.name.charAt(0)}
                      </div>
                      <div>
                          <h3 className="font-bold text-xl text-charcoal mb-1 group-hover:text-purple-600 transition-colors">{c.name}</h3>
                          <div className="text-xs text-stone-500">{c.role}</div>
                      </div>
                  </div>

                  <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <MapPin size={14} className="text-stone-400" /> {c.location}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <Linkedin size={14} className="text-stone-400" /> {c.company}
                      </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          c.status === 'Interested' ? 'bg-green-50 text-green-700' : 
                          c.status === 'Contacted' ? 'bg-blue-50 text-blue-700' :
                          'bg-stone-100 text-stone-500'
                      }`}>
                          {c.status}
                      </span>
                      <div className="text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                          View Details
                      </div>
                  </div>
              </Link>
          ))}
      </div>
    </div>
  );
};
