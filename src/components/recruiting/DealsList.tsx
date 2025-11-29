'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useDeals, useDealStats } from '@/hooks/queries/deals';
import { Search, ChevronRight, Briefcase, Building2, Loader2, TrendingUp, Trophy, DollarSign, Target } from 'lucide-react';

const TIME_FILTERS = ['Current Sprint', 'This Month', 'This Quarter', 'YTD', 'All Time'];

type DealStage = 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost';

const STAGE_FILTERS: { label: string; value: DealStage | 'all' | 'active' }[] = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Discovery', value: 'discovery' },
  { label: 'Qualification', value: 'qualification' },
  { label: 'Proposal', value: 'proposal' },
  { label: 'Negotiation', value: 'negotiation' },
  { label: 'Won', value: 'closed_won' },
  { label: 'Lost', value: 'closed_lost' },
];

export const DealsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStage, setFilterStage] = useState<DealStage | 'all' | 'active'>('all');
  const [timeFilter, setTimeFilter] = useState('All Time');

  // Map 'active' filter to undefined stage with client-side filtering
  const activeStages = ['discovery', 'qualification', 'proposal', 'negotiation'];
  const stageParam = filterStage === 'all' || filterStage === 'active' ? undefined : filterStage;

  // Fetch deals from database via tRPC
  const { deals, isLoading, isError, error } = useDeals({
    stage: stageParam,
    limit: 100,
  });

  // Fetch stats for dashboard cards
  const { stats, isLoading: statsLoading } = useDealStats();

  // Apply filters
  let filtered = deals;

  // Filter for active stages
  if (filterStage === 'active') {
    filtered = deals.filter(d => activeStages.includes(d.stage));
  }

  // Client-side search filter
  filtered = filtered.filter(d => {
    const searchLower = searchTerm.toLowerCase();
    return (
      (d.title?.toLowerCase().includes(searchLower) || false) ||
      (d.accountName?.toLowerCase().includes(searchLower) || false)
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

  // Get stage styling
  const getStageStyle = (stage: string) => {
    switch (stage) {
      case 'discovery':
        return 'bg-blue-50 text-blue-600';
      case 'qualification':
        return 'bg-purple-50 text-purple-600';
      case 'proposal':
        return 'bg-amber-50 text-amber-600';
      case 'negotiation':
        return 'bg-orange-50 text-orange-600';
      case 'closed_won':
        return 'bg-green-50 text-green-600';
      case 'closed_lost':
        return 'bg-gray-50 text-gray-600';
      default:
        return 'bg-stone-100 text-stone-500';
    }
  };

  // Format stage name for display
  const formatStage = (stage: string) => {
    return stage.replace('_', ' ').replace(/\b\w/g, c => c.toUpperCase());
  };

  // Get count for stage filter
  const getStageCount = (stage: DealStage | 'all' | 'active') => {
    switch (stage) {
      case 'all': return stats.total;
      case 'active': return stats.active;
      case 'discovery': return stats.discovery;
      case 'qualification': return stats.qualification;
      case 'proposal': return stats.proposal;
      case 'negotiation': return stats.negotiation;
      case 'closed_won': return stats.won;
      case 'closed_lost': return stats.lost;
      default: return 0;
    }
  };

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <p>Error loading deals: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-stone-400 mb-2">
            <Briefcase size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Total Deals</span>
          </div>
          <div className="text-2xl font-serif font-bold text-charcoal">
            {statsLoading ? <Loader2 className="animate-spin" size={20} /> : stats.total}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-blue-500 mb-2">
            <Target size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Active</span>
          </div>
          <div className="text-2xl font-serif font-bold text-charcoal">
            {statsLoading ? <Loader2 className="animate-spin" size={20} /> : stats.active}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-green-500 mb-2">
            <Trophy size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Won</span>
          </div>
          <div className="text-2xl font-serif font-bold text-charcoal">
            {statsLoading ? <Loader2 className="animate-spin" size={20} /> : stats.won}
          </div>
        </div>
        <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
          <div className="flex items-center gap-2 text-rust mb-2">
            <DollarSign size={16} />
            <span className="text-xs font-bold uppercase tracking-widest">Pipeline Value</span>
          </div>
          <div className="text-2xl font-serif font-bold text-charcoal">
            {statsLoading ? <Loader2 className="animate-spin" size={20} /> : formatCurrency(stats.pipelineValue)}
          </div>
        </div>
      </div>

      {/* Controls Header */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
        <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
          <Search size={18} className="text-stone-400 ml-2" />
          <input
            type="text"
            placeholder="Search deals..."
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

      {/* Stage Pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto">
        {STAGE_FILTERS.map(stage => (
          <button
            key={stage.value}
            onClick={() => setFilterStage(stage.value)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              filterStage === stage.value ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {stage.label}
            {stage.value !== 'all' && (
              <span className="ml-2 opacity-60">
                ({getStageCount(stage.value)})
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
          {filtered.map(deal => (
            <Link
              href={`/employee/recruiting/deals/${deal.id}`}
              key={deal.id}
              className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative"
            >
              <div className="flex justify-between items-start mb-6">
                <div className="w-12 h-12 bg-stone-50 rounded-xl flex items-center justify-center text-stone-400 group-hover:bg-rust group-hover:text-white transition-colors">
                  <Briefcase size={20} />
                </div>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest ${getStageStyle(deal.stage)}`}>
                  {formatStage(deal.stage)}
                </span>
              </div>

              <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors line-clamp-2">
                {deal.title || 'Untitled Deal'}
              </h3>
              {deal.accountName && (
                <p className="text-sm text-stone-500 mb-4 flex items-center gap-1">
                  <Building2 size={12}/> {deal.accountName}
                </p>
              )}

              <div className="space-y-2 text-xs text-stone-500 mb-6">
                <div className="flex items-center gap-2">
                  <DollarSign size={12} /> Value: {formatCurrency(parseFloat(deal.value) || 0)}
                </div>
                <div className="flex items-center gap-2">
                  <TrendingUp size={12} /> Probability: {deal.probability || 0}%
                </div>
                {deal.expectedCloseDate && (
                  <div className="flex items-center gap-2">
                    <Target size={12} /> Expected Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                  </div>
                )}
              </div>

              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="text-xs font-bold text-charcoal">
                  {formatCurrency(parseFloat(deal.value) || 0)}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                  View Deal <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}

          {filtered.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 text-stone-400">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No deals found matching your criteria.</p>
              <p className="text-sm mt-2">Try adjusting your filters or use the &quot;New Deal&quot; button above to create one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
