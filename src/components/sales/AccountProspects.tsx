'use client';


import React, { useState } from 'react';
import { Search, Filter, Building2, MapPin, Globe, MoreHorizontal } from 'lucide-react';

export const AccountProspects: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const prospects = [
      { id: 'p1', name: 'Liberty Mutual', industry: 'Insurance', location: 'Boston, MA', employees: '45,000', status: 'Targeted' },
      { id: 'p2', name: 'Farmers Insurance', industry: 'Insurance', location: 'Los Angeles, CA', employees: '21,000', status: 'Contacted' },
      { id: 'p3', name: 'Nationwide', industry: 'Insurance', location: 'Columbus, OH', employees: '25,000', status: 'Meeting Set' },
  ];

  return (
    <div className="animate-fade-in">
      <div className="flex justify-between items-center mb-8">
          <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
              <Search size={18} className="text-stone-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search prospects..." 
                className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <button className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg">
              + Add Prospect
          </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {prospects.map(prospect => (
              <div key={prospect.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative">
                  <div className="absolute top-6 right-6 text-stone-300 group-hover:text-charcoal transition-colors">
                      <MoreHorizontal size={20} />
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-blue-600 group-hover:text-white transition-colors border border-stone-100">
                          <Building2 size={24} />
                      </div>
                      <div>
                          <h3 className="font-serif font-bold text-xl text-charcoal mb-1">{prospect.name}</h3>
                          <div className="text-xs text-stone-500">{prospect.industry}</div>
                      </div>
                  </div>

                  <div className="space-y-3 mb-6">
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <MapPin size={16} className="text-stone-400" /> {prospect.location}
                      </div>
                      <div className="flex items-center gap-3 text-sm text-stone-600">
                          <Globe size={16} className="text-stone-400" /> {prospect.employees} Employees
                      </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          prospect.status === 'Meeting Set' ? 'bg-green-50 text-green-700' : 
                          prospect.status === 'Contacted' ? 'bg-yellow-50 text-yellow-700' :
                          'bg-stone-100 text-stone-500'
                      }`}>
                          {prospect.status}
                      </span>
                      <button className="text-xs font-bold text-charcoal uppercase tracking-widest hover:text-rust transition-colors">
                          View Details
                      </button>
                  </div>
              </div>
          ))}
      </div>
    </div>
  );
};
