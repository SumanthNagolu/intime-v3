'use client';


import React, { useState } from 'react';
import Link from 'next/link';
import { Plus, Search, MoreHorizontal, Users, Mail, Calendar, ArrowRight } from 'lucide-react';
import { useAppStore } from '../../lib/store';

export const CampaignManager: React.FC = () => {
  const { campaigns } = useAppStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  return (
    <div className="animate-fade-in pt-4">
      <div className="mb-10 flex justify-between items-end border-b border-stone-200 pb-6">
        <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Talent Acquisition</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Campaigns</h1>
            <p className="text-stone-500 mt-2">Manage outbound efforts for Clients and Candidates.</p>
        </div>
        <Link href="/employee/ta/campaigns/new" className="px-6 py-3 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg flex items-center gap-2">
            <Plus size={16} /> New Campaign
        </Link>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8">
          <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
              <Search size={18} className="text-stone-400 ml-2" />
              <input 
                type="text" 
                placeholder="Search campaigns..." 
                className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
          </div>
          <div className="flex gap-2">
              {['All', 'Active', 'Draft', 'Completed'].map(status => (
                  <button 
                    key={status}
                    onClick={() => setFilterStatus(status)}
                    className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors ${
                        filterStatus === status ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                    }`}
                  >
                      {status}
                  </button>
              ))}
          </div>
      </div>

      {/* Campaign Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {campaigns.map(camp => (
              <div key={camp.id} className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group cursor-pointer relative">
                  <div className="absolute top-6 right-6">
                      <button className="text-stone-300 hover:text-charcoal transition-colors">
                          <MoreHorizontal size={20} />
                      </button>
                  </div>

                  <div className="flex items-center gap-4 mb-6">
                      <div className={`w-14 h-14 rounded-2xl flex items-center justify-center shadow-sm border ${
                          camp.channel === 'LinkedIn' ? 'bg-blue-50 border-blue-100 text-blue-600' : 'bg-orange-50 border-orange-100 text-orange-600'
                      }`}>
                          {camp.channel === 'LinkedIn' ? <Users size={24} /> : <Mail size={24} />}
                      </div>
                      <div>
                          <div className={`inline-block px-2 py-0.5 rounded text-[9px] font-bold uppercase tracking-widest mb-1 ${
                              camp.status === 'Active' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'
                          }`}>
                              {camp.status}
                          </div>
                          <h3 className="font-serif font-bold text-lg text-charcoal leading-tight group-hover:text-rust transition-colors">{camp.name}</h3>
                      </div>
                  </div>

                  {/* Metrics */}
                  <div className="grid grid-cols-3 gap-2 mb-6 border-t border-b border-stone-100 py-4">
                      <div className="text-center border-r border-stone-100">
                          <div className="text-xl font-bold text-charcoal">{camp.leads}</div>
                          <div className="text-[9px] text-stone-400 uppercase tracking-widest">Leads</div>
                      </div>
                      <div className="text-center border-r border-stone-100">
                          <div className="text-xl font-bold text-charcoal">{camp.responseRate}%</div>
                          <div className="text-[9px] text-stone-400 uppercase tracking-widest">Reply</div>
                      </div>
                      <div className="text-center">
                          <div className="text-xl font-bold text-charcoal">12</div>
                          <div className="text-[9px] text-stone-400 uppercase tracking-widest">Conv.</div>
                      </div>
                  </div>

                  <div className="flex justify-between items-center text-xs font-bold text-stone-400 uppercase tracking-widest">
                      <div className="flex items-center gap-2">
                          <Calendar size={12} /> Started 2d ago
                      </div>
                      <div className="flex items-center gap-1 group-hover:text-charcoal transition-colors">
                          Analytics <ArrowRight size={12} />
                      </div>
                  </div>
              </div>
          ))}

          {/* Add New Placeholder */}
          <Link href="/employee/ta/campaigns/new" className="border-2 border-dashed border-stone-200 rounded-[2rem] flex flex-col items-center justify-center p-8 text-stone-400 hover:text-rust hover:border-rust hover:bg-rust/5 transition-all group">
              <div className="w-16 h-16 rounded-full bg-stone-50 group-hover:bg-white flex items-center justify-center mb-4 transition-colors shadow-sm">
                  <Plus size={32} />
              </div>
              <span className="font-serif font-bold text-lg">Create Campaign</span>
          </Link>
      </div>
    </div>
  );
};
