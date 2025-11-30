'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Search, MapPin, Clock, Star, ChevronRight } from 'lucide-react';

export const TalentBoard: React.FC = () => {
  const { candidates, bench } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  // Combine lists for the "Unified Board"
  const allTalent = [
      ...bench.map(b => ({ ...b, source: 'Bench', badge: 'Available' })),
      ...candidates.map(c => ({ ...c, source: 'Pipeline', badge: c.status }))
  ];

  const filtered = allTalent.filter(t => 
      (filterStatus === 'All' || t.status === filterStatus) &&
      (t.name.toLowerCase().includes(searchTerm.toLowerCase()) || t.skills.some(s => s.toLowerCase().includes(searchTerm.toLowerCase())))
  );

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Shared Intelligence</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Unified Talent Board</h1>
        <p className="text-stone-500 mt-2">Cross-pod visibility. One pool for Academy, Bench, and Recruiting.</p>
      </div>

      {/* Search & Filter Bar */}
      <div className="bg-white p-4 rounded-[2rem] border border-stone-200 shadow-lg mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-4 bg-stone-50 px-6 py-3 rounded-full flex-1 border border-stone-100 focus-within:ring-2 focus-within:ring-rust/20 transition-all">
              <Search size={20} className="text-stone-400" />
              <input 
                type="text" 
                placeholder="Search by skill, role, or name..." 
                className="bg-transparent outline-none w-full text-sm font-medium text-charcoal placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {['All', 'bench', 'submitted', 'graduate', 'student'].map(status => (
                  <button
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                        filterStatus === status ? 'bg-charcoal text-white' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                      {status}
                  </button>
              ))}
          </div>
      </div>

      {/* Talent Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((talent, idx) => (
              <div key={idx} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group cursor-pointer">
                  <div className="flex justify-between items-start mb-6">
                      <div className="flex items-center gap-4">
                          <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-serif font-bold text-white ${talent.source === 'Bench' ? 'bg-rust' : 'bg-charcoal'}`}>
                              {talent.name.charAt(0)}
                          </div>
                          <div>
                              <h3 className="font-bold text-charcoal text-lg group-hover:text-rust transition-colors">{talent.name}</h3>
                              <p className="text-xs text-stone-500">{talent.role}</p>
                          </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          talent.source === 'Bench' ? 'bg-green-50 text-green-700 border border-green-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                      }`}>
                          {talent.badge}
                      </span>
                  </div>

                  <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-bold uppercase tracking-wide">
                          <MapPin size={12} /> {talent.location}
                      </div>
                      <div className="flex items-center gap-2 text-xs text-stone-500 font-bold uppercase tracking-wide">
                          <Clock size={12} /> Available: Immediate
                      </div>
                      {talent.source === 'Bench' && (
                          <div className="flex items-center gap-2 text-xs text-stone-500 font-bold uppercase tracking-wide">
                              <Star size={12} className="text-yellow-500 fill-yellow-500" /> AI Score: {talent.score}
                          </div>
                      )}
                  </div>

                  <div className="flex flex-wrap gap-2 mb-6">
                      {talent.skills.slice(0, 3).map(skill => (
                          <span key={skill} className="px-3 py-1 bg-stone-50 text-stone-600 text-[10px] font-bold uppercase tracking-wider rounded border border-stone-100">
                              {skill}
                          </span>
                      ))}
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                      <span className="text-[10px] font-bold text-stone-300 uppercase tracking-widest">Unassigned</span>
                      <button className="text-xs font-bold text-rust uppercase tracking-widest flex items-center gap-1 hover:underline">
                          View Profile <ChevronRight size={12} />
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};
