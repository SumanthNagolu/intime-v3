'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Briefcase, MapPin, DollarSign, Users, Loader2, AlertCircle,
  Building2, Search, ChevronRight, MoreHorizontal, Target
} from 'lucide-react';
import { useJobs } from '@/hooks/queries/jobs';

// Status filter options
const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Open', value: 'open' },
  { label: 'Draft', value: 'draft' },
  { label: 'On Hold', value: 'on_hold' },
  { label: 'Filled', value: 'filled' },
];

// Status colors for jobs
const JOB_STATUS_COLORS: Record<string, { bg: string; text: string }> = {
  open: { bg: 'bg-green-50', text: 'text-green-700' },
  draft: { bg: 'bg-stone-100', text: 'text-stone-600' },
  on_hold: { bg: 'bg-amber-50', text: 'text-amber-700' },
  filled: { bg: 'bg-blue-50', text: 'text-blue-700' },
  closed: { bg: 'bg-stone-100', text: 'text-stone-600' },
  urgent: { bg: 'bg-red-50', text: 'text-red-700' },
};

// Job type badge colors
const JOB_TYPE_COLORS: Record<string, string> = {
  'Contract': 'bg-blue-50 text-blue-700',
  'Full-time': 'bg-emerald-50 text-emerald-700',
  'C2H': 'bg-purple-50 text-purple-700',
};

export const RecruitingJobsList: React.FC = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { jobs, isLoading, isError, error } = useJobs({
    limit: 50,
    status: statusFilter === 'all' ? undefined : statusFilter as 'draft' | 'open' | 'on_hold' | 'filled' | 'closed',
  });

  // Filter jobs locally for search
  const displayJobs = searchTerm
    ? jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.client?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        job.requiredSkills?.some((skill: string) => skill.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : jobs;

  // Format rate display
  const formatRate = (job: typeof jobs[0]) => {
    if (!job.rateMin && !job.rateMax) return null;
    const min = job.rateMin ? `$${job.rateMin}` : '';
    const max = job.rateMax ? `$${job.rateMax}` : '';
    const type = job.rateType === 'hourly' ? '/hr' : job.rateType === 'annual' ? '/yr' : '';
    if (min && max) return `${min}-${max}${type}`;
    if (min) return `${min}+${type}`;
    return `Up to ${max}${type}`;
  };

  return (
    <div className="animate-fade-in">
      {/* Top Bar with Search */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
        {/* Search */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
          <Search size={18} className="text-stone-400 ml-2" />
          <input
            type="text"
            placeholder="Search jobs..."
            className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex justify-between items-center mb-8">
        <div className="flex gap-2 overflow-x-auto">
          {STATUS_FILTERS.map(({ label, value }) => (
            <button
              key={value}
              onClick={() => setStatusFilter(value)}
              className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
                statusFilter === value
                  ? 'bg-charcoal text-white'
                  : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Loading State */}
      {isLoading && (
        <div className="flex justify-center items-center py-16">
          <Loader2 size={32} className="animate-spin text-stone-400" />
        </div>
      )}

      {/* Error State */}
      {isError && (
        <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
          <AlertCircle size={32} className="mx-auto text-red-500 mb-3" />
          <p className="text-red-600 mb-2">Failed to load jobs</p>
          <p className="text-red-400 text-sm">{error?.message || 'An error occurred'}</p>
        </div>
      )}

      {/* Jobs Grid */}
      {!isLoading && !isError && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayJobs.map((job) => {
            const statusColors = JOB_STATUS_COLORS[job.status] || JOB_STATUS_COLORS.open;
            const rate = formatRate(job);
            const typeColor = JOB_TYPE_COLORS[job.type] || 'bg-stone-100 text-stone-600';

            return (
              <Link
                href={`/employee/recruiting/jobs/${job.id}`}
                key={job.id}
                className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative"
              >
                <div className="absolute top-6 right-6 text-stone-300 group-hover:text-charcoal transition-colors">
                  <MoreHorizontal size={20} />
                </div>

                {/* Header */}
                <div className="flex items-center gap-4 mb-5">
                  <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-rust group-hover:text-white transition-colors border border-stone-100">
                    <Briefcase size={24} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors truncate">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-stone-500">
                      {job.client && (
                        <span className="flex items-center gap-1 truncate">
                          <Building2 size={12} /> {job.client}
                        </span>
                      )}
                      {job.type && (
                        <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${typeColor}`}>
                          {job.type}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Location & Rate */}
                <div className="space-y-2 mb-5">
                  {job.location && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <MapPin size={14} className="text-stone-400 flex-shrink-0" />
                      <span className="truncate">{job.location}</span>
                      {job.isRemote && <span className="text-blue-600 text-xs flex-shrink-0">(Remote)</span>}
                    </div>
                  )}
                  {rate && (
                    <div className="flex items-center gap-2 text-sm text-stone-600">
                      <DollarSign size={14} className="text-stone-400 flex-shrink-0" />
                      <span className="font-medium text-charcoal">{rate}</span>
                    </div>
                  )}
                </div>

                {/* Stats */}
                <div className="flex gap-3 mb-5">
                  <div className="bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 flex items-center gap-2">
                    <Users size={14} className="text-stone-400" />
                    <span className="text-xs font-bold text-charcoal">{job.pipelineCount || 0} Pipeline</span>
                  </div>
                  <div className="bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 flex items-center gap-2">
                    <Target size={14} className="text-stone-400" />
                    <span className="text-xs font-bold text-charcoal">
                      {job.positionsFilled || 0}/{job.positionsCount || 1} Filled
                    </span>
                  </div>
                </div>

                {/* Skills Preview */}
                {job.requiredSkills && job.requiredSkills.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mb-5">
                    {job.requiredSkills.slice(0, 4).map((skill: string, idx: number) => (
                      <span key={idx} className="px-2 py-0.5 bg-rust/10 text-rust rounded text-[10px] font-medium">
                        {skill}
                      </span>
                    ))}
                    {job.requiredSkills.length > 4 && (
                      <span className="text-[10px] text-stone-400 flex items-center">+{job.requiredSkills.length - 4} more</span>
                    )}
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                  <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${statusColors.bg} ${statusColors.text}`}>
                    {job.status.replace(/_/g, ' ')}
                  </span>
                  <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                    View Job <ChevronRight size={12} />
                  </div>
                </div>
              </Link>
            );
          })}

          {/* Empty State */}
          {displayJobs.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
              <Briefcase size={48} className="mx-auto text-stone-300 mb-4" />
              <h2 className="text-xl font-bold text-charcoal mb-2">
                {searchTerm ? 'No jobs found' : 'No Jobs Yet'}
              </h2>
              <p className="text-stone-500 mb-4">
                {searchTerm
                  ? 'Try adjusting your search or filters'
                  : 'Create your first job requisition to start recruiting'}
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
