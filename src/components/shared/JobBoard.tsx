'use client';


import React, { useState } from 'react';
import { useAppStore } from '../../lib/store';
import { Search, Briefcase, MapPin, DollarSign, Clock, ChevronRight, Sparkles } from 'lucide-react';

export const JobBoard: React.FC = () => {
  const { jobs } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterClient, setFilterClient] = useState('All');

  const filtered = jobs.filter(j => 
      (filterClient === 'All' || j.client === filterClient) &&
      (j.title.toLowerCase().includes(searchTerm.toLowerCase()) || j.client.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 border-b border-stone-200 pb-6">
        <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Shared Intelligence</div>
        <h1 className="text-4xl font-serif font-bold text-charcoal">Job Board</h1>
        <p className="text-stone-500 mt-2">Visibility across all pods. Find opportunities for your talent.</p>
      </div>

      {/* Search & Filter */}
      <div className="bg-white p-4 rounded-[2rem] border border-stone-200 shadow-lg mb-8 flex flex-col md:flex-row gap-4">
          <div className="flex items-center gap-4 bg-stone-50 px-6 py-3 rounded-full flex-1 border border-stone-100 focus-within:ring-2 focus-within:ring-rust/20 transition-all">
              <Search size={20} className="text-stone-400" />
              <input 
                type="text" 
                placeholder="Search jobs by title, client, or skill..." 
                className="bg-transparent outline-none w-full text-sm font-medium text-charcoal placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0">
              {['All', 'Acme Insurance', 'TechFlow', 'Global Mutual'].map(client => (
                  <button
                    key={client}
                    onClick={() => setFilterClient(client)}
                    className={`px-6 py-3 rounded-full text-xs font-bold uppercase tracking-widest whitespace-nowrap transition-colors ${
                        filterClient === client ? 'bg-charcoal text-white' : 'bg-stone-50 text-stone-500 hover:bg-stone-100'
                    }`}
                  >
                      {client}
                  </button>
              ))}
          </div>
      </div>

      {/* Jobs Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(job => (
              <div key={job.id} className="bg-white p-8 rounded-[2.5rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative">
                  
                  <div className="flex justify-between items-start mb-6">
                      <div>
                          <div className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-1">{job.client}</div>
                          <h3 className="font-serif font-bold text-xl text-charcoal group-hover:text-rust transition-colors">{job.title}</h3>
                      </div>
                      <div className="w-10 h-10 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400">
                          <Briefcase size={20} />
                      </div>
                  </div>

                  <div className="space-y-3 mb-8">
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <MapPin size={16} className="text-rust" /> {job.location}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <DollarSign size={16} className="text-rust" /> {job.rate}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <Clock size={16} className="text-rust" /> Posted 2 days ago
                      </div>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-xl mb-6 border border-stone-100">
                      <div className="flex items-center gap-2 mb-2">
                          <Sparkles size={14} className="text-purple-500 fill-purple-500" />
                          <span className="text-xs font-bold uppercase tracking-widest text-purple-700">AI Insight</span>
                      </div>
                      <p className="text-xs text-stone-500 leading-relaxed">
                          &quot;3 bench consultants match this role. Recommend submitting Amit Kumar.&quot;
                      </p>
                  </div>

                  <div className="flex items-center justify-between pt-6 border-t border-stone-100">
                      <div className="text-[10px] font-bold uppercase tracking-widest text-stone-400">
                          Owner: Unassigned
                      </div>
                      <button className="text-xs font-bold text-charcoal uppercase tracking-widest hover:text-rust transition-colors flex items-center gap-1">
                          View Details <ChevronRight size={12} />
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};
