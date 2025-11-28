'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useLeads, useLeadStats } from '@/hooks/queries/leads';
import { Search, ChevronRight, Building2, Mail, Phone, User, Loader2, TrendingUp, Users, Target, DollarSign } from 'lucide-react';

const TIME_FILTERS = ['Current Sprint', 'This Month', 'This Quarter', 'YTD', 'All Time'];

type LeadStatus = 'new' | 'warm' | 'hot' | 'cold' | 'converted' | 'lost';

const STATUS_FILTERS: { label: string; value: LeadStatus | 'all' }[] = [
  { label: 'All', value: 'all' },
  { label: 'New', value: 'new' },
  { label: 'Warm', value: 'warm' },
  { label: 'Hot', value: 'hot' },
  { label: 'Cold', value: 'cold' },
  { label: 'Converted', value: 'converted' },
  { label: 'Lost', value: 'lost' },
];

export const LeadsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState<LeadStatus | 'all'>('all');
  const [timeFilter, setTimeFilter] = useState('All Time');

  // Fetch leads from database via tRPC
  const { leads, isLoading, isError, error } = useLeads({
    status: filterStatus === 'all' ? undefined : filterStatus,
    limit: 100,
  });

  // Fetch stats for dashboard cards
  const { stats, isLoading: statsLoading } = useLeadStats();

  // Client-side search filter
  const filtered = leads.filter(l => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (l.companyName?.toLowerCase().includes(searchLower) || false) ||
      (l.firstName?.toLowerCase().includes(searchLower) || false) ||
      (l.lastName?.toLowerCase().includes(searchLower) || false) ||
      (l.email?.toLowerCase().includes(searchLower) || false)
    );
  });

  // Format currency
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(value);
  };

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Error loading leads: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-stone-400 mb-2">
            <Users size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Total Leads</span>
          </div>
          <div className="text-2xl font-serif font-bold text-charcoal">
            {statsLoading ? <Loader2 className="animate-spin" size={20} /> : stats.total}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-orange-500 mb-2">
            <Target size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Hot Leads</span>
          </div>
          <div className="text-2xl font-serif font-bold text-charcoal">
            {statsLoading ? <Loader2 className="animate-spin" size={20} /> : stats.hot}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Converted</span>
          </div>
          <div className="text-2xl font-serif font-bold text-charcoal">
            {statsLoading ? <Loader2 className="animate-spin" size={20} /> : stats.converted}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-rust mb-2">
            <DollarSign size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Pipeline Value</span>
          </div>
          <div className="text-2xl font-serif font-bold text-charcoal">
            {statsLoading ? <Loader2 className="animate-spin" size={20} /> : formatCurrency(stats.totalValue)}
          </div>
        </div>
      </div>

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
        {STATUS_FILTERS.map(status => (
          <button
            key={status.value}
            onClick={() => setFilterStatus(status.value)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              filterStatus === status.value ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {status.label}
            {status.value !== 'all' && (
              <span className="ml-2 opacity-60">
                ({status.value === 'new' ? stats.new :
                  status.value === 'warm' ? stats.warm :
                  status.value === 'hot' ? stats.hot :
                  status.value === 'cold' ? stats.cold :
                  status.value === 'converted' ? stats.converted :
                  stats.lost})
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-rust" size={32} />
        </div>
      )}

      {/* Grid */}
      {!isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(lead => (
            <Link
              href={`/employee/recruiting/leads/${lead.id}`}
              key={lead.id}
              className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-rust group-hover:text-white transition-colors">
                  <Building2 size={20} />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${
                  lead.status === 'warm' ? 'bg-orange-50 text-orange-600' :
                  lead.status === 'hot' ? 'bg-red-50 text-red-600' :
                  lead.status === 'converted' ? 'bg-green-50 text-green-600' :
                  lead.status === 'lost' ? 'bg-gray-50 text-gray-600' :
                  lead.status === 'cold' ? 'bg-blue-50 text-blue-600' :
                  'bg-stone-100 text-stone-500'
                }`}>
                  {lead.status}
                </span>
              </div>

              <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors">
                {lead.companyName || 'Unknown Company'}
              </h3>
              <p className="text-sm text-stone-500 mb-4 flex items-center gap-1">
                <User size={12}/> {lead.firstName} {lead.lastName}
              </p>

              <div className="space-y-2 text-xs text-stone-500 mb-6">
                <div className="flex items-center gap-2">
                  <Mail size={12} /> {lead.email || 'No email'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} /> {lead.phone || 'No phone'}
                </div>
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="text-xs font-bold text-charcoal">
                  {lead.estimatedValue ? formatCurrency(lead.estimatedValue) : '$0'} Est. Value
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                  Details <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 text-stone-400">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No leads found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new lead.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
