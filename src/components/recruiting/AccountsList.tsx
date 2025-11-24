'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { useAppStore } from '../../lib/store';
import { Search, Building2, ChevronRight, Users, Briefcase, MoreHorizontal } from 'lucide-react';

const TIME_FILTERS = ['Current Sprint', 'This Month', 'This Quarter', 'YTD', 'All Time'];

export const AccountsList: React.FC = () => {
  const { accounts, jobs } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [timeFilter, setTimeFilter] = useState('All Time');

  const filtered = accounts.filter(a => 
      (statusFilter === 'All' || a.status === statusFilter) &&
      (a.name.toLowerCase().includes(searchTerm.toLowerCase()) || a.industry.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="animate-fade-in">
      
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
          <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
              <Search size={18} className="text-stone-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search accounts..." 
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

      <div className="flex gap-2 mb-8 overflow-x-auto">
          {['All', 'Active', 'Prospect', 'Churned', 'Hold'].map(status => (
              <button 
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                    statusFilter === status ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                }`}
              >
                  {status}
              </button>
          ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(account => {
              const openJobs = jobs.filter(j => j.accountId === account.id && (j.status === 'open' || j.status === 'urgent')).length;
              
              return (
                  <Link href={`/employee/recruiting/accounts/${account.id}`} key={account.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative">
                      <div className="absolute top-6 right-6 text-stone-300 group-hover:text-charcoal transition-colors">
                          <MoreHorizontal size={20} />
                      </div>

                      <div className="flex items-center gap-4 mb-6">
                          <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-rust group-hover:text-white transition-colors border border-stone-100">
                              <Building2 size={24} />
                          </div>
                          <div>
                              <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors">{account.name}</h3>
                              <div className="text-xs text-stone-500">{account.industry}</div>
                          </div>
                      </div>

                      <div className="flex gap-4 mb-6">
                          <div className="bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 flex items-center gap-2">
                              <Briefcase size={14} className="text-stone-400" />
                              <span className="text-xs font-bold text-charcoal">{openJobs} Jobs</span>
                          </div>
                          <div className="bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 flex items-center gap-2">
                              <Users size={14} className="text-stone-400" />
                              <span className="text-xs font-bold text-charcoal">{account.pocs.length} POCs</span>
                          </div>
                      </div>

                      <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                          <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                              account.status === 'Active' ? 'bg-green-50 text-green-700' : 
                              account.status === 'Churned' ? 'bg-red-50 text-red-700' :
                              'bg-stone-100 text-stone-500'
                          }`}>
                              {account.status}
                          </span>
                          <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                              Hub View <ChevronRight size={12} />
                          </div>
                      </div>
                  </Link>
              );
          })}
          
          {filtered.length === 0 && (
              <div className="col-span-full text-center py-12 text-stone-400">
                  <p>No accounts found.</p>
              </div>
          )}
      </div>
    </div>
  );
};
