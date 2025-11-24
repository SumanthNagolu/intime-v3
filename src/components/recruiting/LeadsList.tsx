'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '../../lib/store';
import { Search, ChevronRight, Building2, Mail, Phone, User } from 'lucide-react';

const TIME_FILTERS = ['Current Sprint', 'This Month', 'This Quarter', 'YTD', 'All Time'];

export const LeadsList: React.FC = () => {
  const { leads } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All Time');

  const filtered = leads.filter(l => 
      (filterStatus === 'All' || l.status === filterStatus.toLowerCase()) &&
      (l.company.toLowerCase().includes(searchTerm.toLowerCase()) || l.contact.toLowerCase().includes(searchTerm.toLowerCase()))
      // Time filter logic would go here
  );

  return (
    <div className="animate-fade-in">
      
      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
          <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
              <Search size={18} className="text-stone-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search leads..." 
                className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>

          <div className="bg-stone-100 p-1 rounded-full flex gap-1 overflow-x-auto max-w-full">
              {TIME_FILTERS.map(tf => (
                  <button
                    key={tf}
                    onClick={() => setTimeFilter(tf)}
                    className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                        timeFilter === tf ? 'bg-white text-charcoal shadow-sm' : 'text-stone-400 hover:text-stone-600'
                    }`}
                  >
                      {tf}
                  </button>
              ))}
          </div>
      </div>

      {/* Category Pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
          {['All', 'New', 'Warm', 'Cold', 'Converted'].map(status => (
              <button 
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                    filterStatus === status ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                  {status}
              </button>
          ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(lead => (
              <Link href={`/employee/recruiting/leads/${lead.id}`} key={lead.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative">
                  <div className="flex justify-between items-start mb-6">
                      <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-rust group-hover:text-white transition-colors">
                          <Building2 size={20} />
                      </div>
                      <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                          lead.status === 'warm' ? 'bg-orange-50 text-orange-600' :
                          lead.status === 'hot' ? 'bg-red-50 text-red-600' :
                          lead.status === 'converted' ? 'bg-green-50 text-green-600' :
                          'bg-stone-100 text-stone-500'
                      }`}>
                          {lead.status}
                      </span>
                  </div>
                  
                  <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors">{lead.company}</h3>
                  <p className="text-sm text-stone-500 mb-4 flex items-center gap-1"><User size={12}/> {lead.firstName} {lead.lastName}</p>
                  
                  <div className="space-y-2 text-xs text-stone-500 mb-6">
                      <div className="flex items-center gap-2">
                          <Mail size={12} /> {lead.email || 'No email'}
                      </div>
                      <div className="flex items-center gap-2">
                          <Phone size={12} /> {lead.phone || 'No phone'}
                      </div>
                  </div>

                  <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                      <div className="text-xs font-bold text-charcoal">{lead.value} Est. Value</div>
                      <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                          Details <ChevronRight size={12} />
                      </div>
                  </div>
              </Link>
          ))}
          
          {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-stone-400">
                  <p>No leads found matching your criteria.</p>
              </div>
          )}
      </div>
    </div>
  );
};
