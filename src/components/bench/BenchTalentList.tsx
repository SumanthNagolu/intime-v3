'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '../../lib/store';
import { Search, ChevronRight, Clock, MapPin, Briefcase, MoreHorizontal } from 'lucide-react';

const TIME_FILTERS = ['Available', 'Rolling Off', 'Placed'];

export const BenchTalentList: React.FC = () => {
  const { bench } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  // For demo purposes, we treat 'bench' array from store as the source of truth
  const filtered = bench.filter(c => 
      (statusFilter === 'All' || (statusFilter === 'Available' && c.status === 'bench')) &&
      (c.name.toLowerCase().includes(searchTerm.toLowerCase()) || c.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="animate-fade-in">
      
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
          <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
              <Search size={18} className="text-stone-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search consultants..." 
                className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>

          <div className="bg-stone-100 p-1 rounded-full flex gap-1 overflow-x-auto max-w-full">
              {TIME_FILTERS.map(tf => (
                  <button
                    key={tf}
                    // Simplified filter logic for demo
                    onClick={() => setStatusFilter(tf === 'Available' ? 'Available' : 'All')}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                        (tf === 'Available' && statusFilter === 'Available') || (tf !== 'Available' && statusFilter === 'All') 
                        ? 'bg-white text-charcoal shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                      {tf}
                  </button>
              ))}
          </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(consultant => (
              <Link href={`/employee/bench/talent/${consultant.id}`} key={consultant.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative">
                  <div className="absolute top-6 right-6 text-stone-300 group-hover:text-charcoal transition-colors">
                      <MoreHorizontal size={20} />
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-stone-50 rounded-full flex items-center justify-center text-xl font-serif font-bold text-charcoal group-hover:bg-rust group-hover:text-white transition-colors border border-stone-100">
                          {consultant.name.charAt(0)}
                      </div>
                      <div>
                          <h3 className="font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors">{consultant.name}</h3>
                          <div className="text-xs text-stone-500">{consultant.role}</div>
                      </div>
                  </div>

                  <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <MapPin size={14} className="text-stone-400" /> {consultant.location}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <Briefcase size={14} className="text-stone-400" /> {consultant.experience} Exp
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <Clock size={14} className="text-stone-400" /> Bench Age: <span className={consultant.daysOnBench > 30 ? 'text-red-500 font-bold' : 'text-charcoal font-bold'}>{consultant.daysOnBench} Days</span>
                      </div>
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                      {consultant.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-2 py-1 bg-stone-50 border border-stone-100 rounded text-[10px] font-bold text-stone-500 uppercase tracking-wide">
                              {skill}
                          </span>
                      ))}
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                      <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                          consultant.visaStatus === 'H-1B' ? 'bg-blue-50 text-blue-700' : 'bg-stone-100 text-stone-500'
                      }`}>
                          {consultant.visaStatus}
                      </span>
                      <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                          Manage <ChevronRight size={12} />
                      </div>
                  </div>
              </Link>
          ))}
          
          {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-stone-400">
                  <p>No consultants found.</p>
              </div>
          )}
      </div>
    </div>
  );
};
