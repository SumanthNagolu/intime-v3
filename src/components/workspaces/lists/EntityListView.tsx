/**
 * EntityListView Component
 *
 * A unified list view component that renders entity lists for the workspace.
 * Connects to the database via tRPC hooks and displays entities in a grid.
 *
 * Supports: leads, accounts, deals, jobs, talent, submissions, contacts, job-orders, campaigns
 */

'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  ChevronRight,
  Building2,
  Mail,
  Phone,
  User,
  Loader2,
  TrendingUp,
  Users,
  Target,
  DollarSign,
  Briefcase,
  FileText,
  MapPin,
  Calendar,
  Clock,
  Crown,
  CheckCircle,
  AlertCircle,
  ClipboardList,
  Megaphone,
  Plus,
} from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { OwnershipFilter } from '@/lib/validations/ownership';

// Hooks
import { useLeads, useLeadStats } from '@/hooks/queries/leads';
import { useAccounts, useAccountStats } from '@/hooks/queries/accounts';
import { useDeals, useDealStats } from '@/hooks/queries/deals';
import { trpc } from '@/lib/trpc/client';

// Types for tRPC data
interface JobData {
  id: string;
  title: string | null;
  location: string | null;
  status: string | null;
  jobType: string | null;
  billRate?: string | number | null;
  openPositions?: number | null;
}

interface CandidateData {
  id: string;
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  title: string | null;
  location: string | null;
  status: string | null;
  visaStatus?: string | null;
}

interface SubmissionData {
  id: string;
  candidateName: string | null;
  jobTitle: string | null;
  status: string | null;
  createdAt: string;
  billRate?: string | number | null;
  stage?: string | null;
}

// ============================================
// TYPES
// ============================================

export type EntityListType =
  | 'leads'
  | 'accounts'
  | 'deals'
  | 'jobs'
  | 'talent'
  | 'submissions'
  | 'contacts'
  | 'job-orders'
  | 'campaigns';

interface EntityListViewProps {
  type: EntityListType;
  onCreateNew?: () => void;
}

// ============================================
// CONFIGURATION
// ============================================

const ENTITY_CONFIG = {
  leads: {
    singular: 'Lead',
    plural: 'Leads',
    icon: Target,
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
    description: 'Track and qualify potential clients',
    statusFilters: [
      { label: 'All', value: 'all' },
      { label: 'New', value: 'new' },
      { label: 'Warm', value: 'warm' },
      { label: 'Hot', value: 'hot' },
      { label: 'Cold', value: 'cold' },
      { label: 'Converted', value: 'converted' },
      { label: 'Lost', value: 'lost' },
    ],
  },
  accounts: {
    singular: 'Account',
    plural: 'Accounts',
    icon: Building2,
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    description: 'Client company profiles and relationships',
    statusFilters: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Prospect', value: 'prospect' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  deals: {
    singular: 'Deal',
    plural: 'Deals',
    icon: Briefcase,
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    description: 'Manage opportunities and pipeline',
    statusFilters: [
      { label: 'All', value: 'all' },
      { label: 'Discovery', value: 'discovery' },
      { label: 'Proposal', value: 'proposal' },
      { label: 'Negotiation', value: 'negotiation' },
      { label: 'Won', value: 'closed_won' },
      { label: 'Lost', value: 'closed_lost' },
    ],
  },
  jobs: {
    singular: 'Job',
    plural: 'Jobs',
    icon: Briefcase,
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
    description: 'Open requisitions and job orders',
    statusFilters: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'On Hold', value: 'on_hold' },
      { label: 'Filled', value: 'filled' },
      { label: 'Closed', value: 'closed' },
    ],
  },
  talent: {
    singular: 'Talent',
    plural: 'Talent',
    icon: Users,
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
    description: 'Candidates and consultants',
    statusFilters: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Available', value: 'available' },
      { label: 'Placed', value: 'placed' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  submissions: {
    singular: 'Submission',
    plural: 'Submissions',
    icon: FileText,
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    description: 'Candidate submissions to jobs',
    statusFilters: [
      { label: 'All', value: 'all' },
      { label: 'Submitted', value: 'submitted' },
      { label: 'Interviewing', value: 'interviewing' },
      { label: 'Offered', value: 'offered' },
      { label: 'Placed', value: 'placed' },
      { label: 'Rejected', value: 'rejected' },
    ],
  },
  contacts: {
    singular: 'Contact',
    plural: 'Contacts',
    icon: User,
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    description: 'Universal contact directory',
    statusFilters: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Inactive', value: 'inactive' },
    ],
  },
  'job-orders': {
    singular: 'Job Order',
    plural: 'Job Orders',
    icon: ClipboardList,
    color: 'text-emerald-600',
    bgColor: 'bg-emerald-100',
    description: 'Confirmed client orders and placements',
    statusFilters: [
      { label: 'All', value: 'all' },
      { label: 'Open', value: 'open' },
      { label: 'In Progress', value: 'in_progress' },
      { label: 'Filled', value: 'filled' },
      { label: 'Closed', value: 'closed' },
    ],
  },
  campaigns: {
    singular: 'Campaign',
    plural: 'Campaigns',
    icon: Megaphone,
    color: 'text-rose-600',
    bgColor: 'bg-rose-100',
    description: 'Talent sourcing and outreach campaigns',
    statusFilters: [
      { label: 'All', value: 'all' },
      { label: 'Active', value: 'active' },
      { label: 'Paused', value: 'paused' },
      { label: 'Completed', value: 'completed' },
    ],
  },
} as const;

const STATUS_COLORS: Record<string, string> = {
  // Leads
  new: 'bg-emerald-50 text-emerald-600 border-emerald-200',
  warm: 'bg-amber-50 text-amber-600 border-amber-200',
  hot: 'bg-red-50 text-red-600 border-red-200',
  cold: 'bg-blue-50 text-blue-600 border-blue-200',
  converted: 'bg-green-50 text-green-600 border-green-200',
  lost: 'bg-stone-50 text-stone-500 border-stone-200',
  // Accounts/General
  active: 'bg-green-50 text-green-600 border-green-200',
  prospect: 'bg-blue-50 text-blue-600 border-blue-200',
  inactive: 'bg-stone-50 text-stone-500 border-stone-200',
  // Deals
  discovery: 'bg-blue-50 text-blue-600 border-blue-200',
  qualification: 'bg-cyan-50 text-cyan-600 border-cyan-200',
  proposal: 'bg-amber-50 text-amber-600 border-amber-200',
  negotiation: 'bg-orange-50 text-orange-600 border-orange-200',
  closed_won: 'bg-green-50 text-green-600 border-green-200',
  closed_lost: 'bg-red-50 text-red-600 border-red-200',
  // Jobs
  on_hold: 'bg-amber-50 text-amber-600 border-amber-200',
  filled: 'bg-green-50 text-green-600 border-green-200',
  closed: 'bg-stone-50 text-stone-500 border-stone-200',
  // Submissions
  submitted: 'bg-blue-50 text-blue-600 border-blue-200',
  interviewing: 'bg-purple-50 text-purple-600 border-purple-200',
  offered: 'bg-amber-50 text-amber-600 border-amber-200',
  placed: 'bg-green-50 text-green-600 border-green-200',
  rejected: 'bg-red-50 text-red-600 border-red-200',
  // Talent
  available: 'bg-green-50 text-green-600 border-green-200',
  // Campaigns
  paused: 'bg-amber-50 text-amber-600 border-amber-200',
  completed: 'bg-green-50 text-green-600 border-green-200',
  // Job Orders
  open: 'bg-blue-50 text-blue-600 border-blue-200',
  in_progress: 'bg-amber-50 text-amber-600 border-amber-200',
};

// ============================================
// HELPER FUNCTIONS
// ============================================

function formatCurrency(value: number | string | null | undefined): string {
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (!num) return '$0';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function getStatusColor(status: string): string {
  return STATUS_COLORS[status] || 'bg-stone-50 text-stone-500 border-stone-200';
}

// ============================================
// SUB-COMPONENTS
// ============================================

interface StatsCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  color?: string;
  isLoading?: boolean;
}

function StatsCard({ label, value, icon, color = 'text-stone-400', isLoading }: StatsCardProps) {
  return (
    <div className="bg-white p-4 rounded-2xl border border-stone-200 shadow-sm">
      <div className={`flex items-center gap-2 ${color} mb-2`}>
        {icon}
        <span className="text-xs font-bold uppercase tracking-widest">{label}</span>
      </div>
      <div className="text-2xl font-serif font-bold text-charcoal">
        {isLoading ? <Loader2 className="animate-spin" size={20} /> : value}
      </div>
    </div>
  );
}

// ============================================
// ENTITY-SPECIFIC LIST COMPONENTS
// ============================================

function LeadsList({ searchTerm, filterStatus, ownership }: { searchTerm: string; filterStatus: string; ownership: OwnershipFilter }) {
  const { leads, isLoading, isError, error } = useLeads({
    status: filterStatus === 'all' ? undefined : filterStatus,
    limit: 100,
    ownership,
  });
  const { stats, isLoading: statsLoading } = useLeadStats({ ownership });

  const filtered = useMemo(() => {
    if (!searchTerm) return leads;
    const search = searchTerm.toLowerCase();
    return leads.filter(
      (l) =>
        l.companyName?.toLowerCase().includes(search) ||
        l.firstName?.toLowerCase().includes(search) ||
        l.lastName?.toLowerCase().includes(search) ||
        l.email?.toLowerCase().includes(search)
    );
  }, [leads, searchTerm]);

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>Error loading leads: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Leads"
          value={stats.total}
          icon={<Users size={16} />}
          isLoading={statsLoading}
        />
        <StatsCard
          label="Hot Leads"
          value={stats.hot}
          icon={<Target size={16} />}
          color="text-orange-500"
          isLoading={statsLoading}
        />
        <StatsCard
          label="Converted"
          value={stats.converted}
          icon={<TrendingUp size={16} />}
          color="text-green-500"
          isLoading={statsLoading}
        />
        <StatsCard
          label="Pipeline Value"
          value={formatCurrency(stats.totalValue)}
          icon={<DollarSign size={16} />}
          color="text-rust"
          isLoading={statsLoading}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-rust" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((lead) => (
            <Link
              href={`/employee/workspace/leads/${lead.id}`}
              key={lead.id}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 group-hover:bg-rust group-hover:text-white flex items-center justify-center transition-colors">
                  {lead.leadType === 'person' ? <User size={20} /> : <Building2 size={20} />}
                </div>
                <Badge className={`${getStatusColor(lead.status)} border`}>
                  {lead.status}
                </Badge>
              </div>
              <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors">
                {lead.leadType === 'person'
                  ? `${lead.firstName || ''} ${lead.lastName || ''}`.trim() || 'Unknown'
                  : lead.companyName || 'Unknown Company'}
              </h3>
              <p className="text-sm text-stone-500 mb-4 flex items-center gap-1">
                {lead.leadType === 'person' ? (
                  <>
                    <Building2 size={12} /> {lead.companyName || 'No company'}
                  </>
                ) : (
                  <>
                    <User size={12} /> {lead.firstName} {lead.lastName}
                  </>
                )}
              </p>
              <div className="space-y-2 text-xs text-stone-500 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={12} /> {lead.email || 'No email'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} /> {lead.phone || 'No phone'}
                </div>
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="text-xs font-bold text-charcoal">
                  {formatCurrency(lead.estimatedValue)} Est. Value
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                  Details <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-400">
              <Target size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No leads found</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new lead.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function AccountsList({ searchTerm, filterStatus, ownership }: { searchTerm: string; filterStatus: string; ownership: OwnershipFilter }) {
  const { accounts, isLoading, isError, error } = useAccounts({
    status: filterStatus === 'all' ? undefined : filterStatus,
    limit: 100,
    ownership,
  });
  const { stats, isLoading: statsLoading } = useAccountStats({ ownership });

  const filtered = useMemo(() => {
    if (!searchTerm) return accounts;
    const search = searchTerm.toLowerCase();
    return accounts.filter(
      (a) =>
        a.name?.toLowerCase().includes(search) ||
        a.industry?.toLowerCase().includes(search)
    );
  }, [accounts, searchTerm]);

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>Error loading accounts: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Accounts"
          value={stats.total}
          icon={<Building2 size={16} />}
          isLoading={statsLoading}
        />
        <StatsCard
          label="Active Clients"
          value={stats.activeClients}
          icon={<CheckCircle size={16} />}
          color="text-green-500"
          isLoading={statsLoading}
        />
        <StatsCard
          label="Prospects"
          value={stats.byStatus?.prospect || 0}
          icon={<Target size={16} />}
          color="text-blue-500"
          isLoading={statsLoading}
        />
        <StatsCard
          label="Tiers"
          value={Object.keys(stats.byTier || {}).length}
          icon={<TrendingUp size={16} />}
          color="text-purple-500"
          isLoading={statsLoading}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-rust" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((account) => (
            <Link
              href={`/employee/workspace/accounts/${account.id}`}
              key={account.id}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-rust group-hover:text-white flex items-center justify-center transition-colors">
                  <Building2 size={20} />
                </div>
                <Badge className={`${getStatusColor(account.status || 'active')} border`}>
                  {account.status || 'Active'}
                </Badge>
              </div>
              <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors">
                {account.name || 'Unknown Account'}
              </h3>
              <p className="text-sm text-stone-500 mb-4">{account.industry || 'No industry'}</p>
              <div className="space-y-2 text-xs text-stone-500 mb-4">
                {account.website && (
                  <div className="flex items-center gap-2 truncate">
                    <MapPin size={12} /> {account.website}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase size={12} /> {account.type || 'Direct Client'}
                </div>
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                {account.tier && (
                  <Badge variant="outline" className="text-xs">
                    {account.tier}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors ml-auto">
                  Details <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-400">
              <Building2 size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No accounts found</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new account.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function DealsList({ searchTerm, filterStatus, ownership }: { searchTerm: string; filterStatus: string; ownership: OwnershipFilter }) {
  const { deals, isLoading, isError, error } = useDeals({
    stage: filterStatus === 'all' ? undefined : filterStatus,
    limit: 100,
    ownership,
  });
  const { stats, isLoading: statsLoading } = useDealStats({ ownership });

  const filtered = useMemo(() => {
    if (!searchTerm) return deals;
    const search = searchTerm.toLowerCase();
    return deals.filter(
      (d) =>
        d.title?.toLowerCase().includes(search) ||
        d.company?.toLowerCase().includes(search) ||
        d.accountName?.toLowerCase().includes(search)
    );
  }, [deals, searchTerm]);

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>Error loading deals: {error?.message || 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Deals"
          value={stats.total}
          icon={<Briefcase size={16} />}
          isLoading={statsLoading}
        />
        <StatsCard
          label="Active Deals"
          value={stats.active}
          icon={<TrendingUp size={16} />}
          color="text-blue-500"
          isLoading={statsLoading}
        />
        <StatsCard
          label="Pipeline Value"
          value={formatCurrency(stats.pipelineValue)}
          icon={<DollarSign size={16} />}
          color="text-green-500"
          isLoading={statsLoading}
        />
        <StatsCard
          label="Won Value"
          value={formatCurrency(stats.wonValue)}
          icon={<Crown size={16} />}
          color="text-amber-500"
          isLoading={statsLoading}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-rust" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((deal) => (
            <Link
              href={`/employee/workspace/deals/${deal.id}`}
              key={deal.id}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-green-50 text-green-600 group-hover:bg-rust group-hover:text-white flex items-center justify-center transition-colors">
                  <Briefcase size={20} />
                </div>
                <Badge className={`${getStatusColor(deal.stage?.toLowerCase().replace(' ', '_') || 'discovery')} border`}>
                  {deal.stage}
                </Badge>
              </div>
              <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors">
                {deal.title || 'Untitled Deal'}
              </h3>
              <p className="text-sm text-stone-500 mb-4 flex items-center gap-1">
                <Building2 size={12} /> {deal.accountName || deal.company || 'No account'}
              </p>
              <div className="space-y-2 text-xs text-stone-500 mb-4">
                <div className="flex items-center gap-2">
                  <DollarSign size={12} /> {formatCurrency(deal.value)}
                </div>
                <div className="flex items-center gap-2">
                  <Target size={12} /> {deal.probability}% probability
                </div>
                {deal.expectedCloseDate && (
                  <div className="flex items-center gap-2">
                    <Calendar size={12} /> Close: {new Date(deal.expectedCloseDate).toLocaleDateString()}
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="text-xs font-bold text-charcoal">
                  {formatCurrency(deal.value)}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                  Details <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-400">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No deals found</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new deal.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function JobsList({ searchTerm, filterStatus, ownership }: { searchTerm: string; filterStatus: string; ownership: OwnershipFilter }) {
  const { data: jobs, isLoading, isError, error } = trpc.ats.jobs.list.useQuery({
    status: filterStatus === 'all' ? undefined : filterStatus as 'draft' | 'open' | 'on_hold' | 'filled' | 'closed',
    limit: 100,
    ownership,
  });

  const filtered = useMemo(() => {
    if (!jobs || !searchTerm) return jobs || [];
    const search = searchTerm.toLowerCase();
    return jobs.filter(
      (j: JobData) =>
        j.title?.toLowerCase().includes(search) ||
        j.location?.toLowerCase().includes(search)
    );
  }, [jobs, searchTerm]);

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>Error loading jobs: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  const activeCount = jobs?.filter((j: JobData) => j.status === 'active' || j.status === 'open').length || 0;

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Jobs"
          value={jobs?.length || 0}
          icon={<Briefcase size={16} />}
          isLoading={isLoading}
        />
        <StatsCard
          label="Active Jobs"
          value={activeCount}
          icon={<CheckCircle size={16} />}
          color="text-green-500"
          isLoading={isLoading}
        />
        <StatsCard
          label="Filled"
          value={jobs?.filter((j: JobData) => j.status === 'filled').length || 0}
          icon={<Crown size={16} />}
          color="text-purple-500"
          isLoading={isLoading}
        />
        <StatsCard
          label="On Hold"
          value={jobs?.filter((j: JobData) => j.status === 'on_hold').length || 0}
          icon={<Clock size={16} />}
          color="text-amber-500"
          isLoading={isLoading}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-rust" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((job: JobData) => (
            <Link
              href={`/employee/workspace/jobs/${job.id}`}
              key={job.id}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-cyan-50 text-cyan-600 group-hover:bg-rust group-hover:text-white flex items-center justify-center transition-colors">
                  <Briefcase size={20} />
                </div>
                <Badge className={`${getStatusColor(job.status || 'active')} border`}>
                  {job.status || 'Active'}
                </Badge>
              </div>
              <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors">
                {job.title || 'Untitled Job'}
              </h3>
              <div className="space-y-2 text-xs text-stone-500 mb-4">
                {job.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} /> {job.location}
                  </div>
                )}
                <div className="flex items-center gap-2">
                  <Briefcase size={12} /> {job.jobType || 'Full-time'}
                </div>
                {job.billRate && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={12} /> {formatCurrency(job.billRate)}/hr
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="text-xs text-stone-400">
                  {job.openPositions || 1} position(s)
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                  Details <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-400">
              <Briefcase size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No jobs found</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new job.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function TalentList({ searchTerm, filterStatus, ownership }: { searchTerm: string; filterStatus: string; ownership: OwnershipFilter }) {
  const { data: candidates, isLoading, isError, error } = trpc.ats.candidates.list.useQuery({
    status: filterStatus === 'all' ? undefined : filterStatus,
    limit: 100,
    ownership,
  });

  const filtered = useMemo(() => {
    if (!candidates || !searchTerm) return candidates || [];
    const search = searchTerm.toLowerCase();
    return candidates.filter(
      (c: CandidateData) =>
        c.firstName?.toLowerCase().includes(search) ||
        c.lastName?.toLowerCase().includes(search) ||
        c.email?.toLowerCase().includes(search) ||
        c.title?.toLowerCase().includes(search)
    );
  }, [candidates, searchTerm]);

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>Error loading talent: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Talent"
          value={candidates?.length || 0}
          icon={<Users size={16} />}
          isLoading={isLoading}
        />
        <StatsCard
          label="Available"
          value={candidates?.filter((c: CandidateData) => c.status === 'available' || c.status === 'active').length || 0}
          icon={<CheckCircle size={16} />}
          color="text-green-500"
          isLoading={isLoading}
        />
        <StatsCard
          label="Placed"
          value={candidates?.filter((c: CandidateData) => c.status === 'placed').length || 0}
          icon={<Crown size={16} />}
          color="text-purple-500"
          isLoading={isLoading}
        />
        <StatsCard
          label="In Pipeline"
          value={candidates?.filter((c: CandidateData) => c.status === 'interviewing' || c.status === 'submitted').length || 0}
          icon={<TrendingUp size={16} />}
          color="text-blue-500"
          isLoading={isLoading}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-rust" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((candidate: CandidateData) => (
            <Link
              href={`/employee/workspace/talent/${candidate.id}`}
              key={candidate.id}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 group-hover:bg-rust group-hover:text-white flex items-center justify-center transition-colors">
                  <User size={20} />
                </div>
                <Badge className={`${getStatusColor(candidate.status || 'active')} border`}>
                  {candidate.status || 'Active'}
                </Badge>
              </div>
              <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors">
                {candidate.firstName} {candidate.lastName}
              </h3>
              <p className="text-sm text-stone-500 mb-4">{candidate.title || 'No title'}</p>
              <div className="space-y-2 text-xs text-stone-500 mb-4">
                <div className="flex items-center gap-2">
                  <Mail size={12} /> {candidate.email || 'No email'}
                </div>
                <div className="flex items-center gap-2">
                  <Phone size={12} /> {candidate.phone || 'No phone'}
                </div>
                {candidate.location && (
                  <div className="flex items-center gap-2">
                    <MapPin size={12} /> {candidate.location}
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                {candidate.visaStatus && (
                  <Badge variant="outline" className="text-xs">
                    {candidate.visaStatus}
                  </Badge>
                )}
                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors ml-auto">
                  Details <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-400">
              <Users size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No talent found</p>
              <p className="text-sm mt-2">Try adjusting your filters or add new talent.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function SubmissionsList({ searchTerm, filterStatus, ownership }: { searchTerm: string; filterStatus: string; ownership: OwnershipFilter }) {
  const { data: submissions, isLoading, isError, error } = trpc.ats.submissions.list.useQuery({
    status: filterStatus === 'all' ? undefined : filterStatus,
    limit: 100,
    ownership,
  });

  const filtered = useMemo(() => {
    if (!submissions || !searchTerm) return submissions || [];
    const search = searchTerm.toLowerCase();
    return submissions.filter(
      (s: SubmissionData) =>
        s.candidateName?.toLowerCase().includes(search) ||
        s.jobTitle?.toLowerCase().includes(search)
    );
  }, [submissions, searchTerm]);

  if (isError) {
    return (
      <div className="text-center py-12 text-red-500">
        <AlertCircle size={48} className="mx-auto mb-4" />
        <p>Error loading submissions: {error instanceof Error ? error.message : 'Unknown error'}</p>
      </div>
    );
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <StatsCard
          label="Total Submissions"
          value={submissions?.length || 0}
          icon={<FileText size={16} />}
          isLoading={isLoading}
        />
        <StatsCard
          label="Interviewing"
          value={submissions?.filter((s: SubmissionData) => s.status === 'interviewing').length || 0}
          icon={<TrendingUp size={16} />}
          color="text-purple-500"
          isLoading={isLoading}
        />
        <StatsCard
          label="Offered"
          value={submissions?.filter((s: SubmissionData) => s.status === 'offered').length || 0}
          icon={<Target size={16} />}
          color="text-amber-500"
          isLoading={isLoading}
        />
        <StatsCard
          label="Placed"
          value={submissions?.filter((s: SubmissionData) => s.status === 'placed').length || 0}
          icon={<Crown size={16} />}
          color="text-green-500"
          isLoading={isLoading}
        />
      </div>

      {/* List */}
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="animate-spin text-rust" size={32} />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((submission: SubmissionData) => (
            <Link
              href={`/employee/workspace/submissions/${submission.id}`}
              key={submission.id}
              className="bg-white p-6 rounded-2xl border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="w-12 h-12 rounded-xl bg-orange-50 text-orange-600 group-hover:bg-rust group-hover:text-white flex items-center justify-center transition-colors">
                  <FileText size={20} />
                </div>
                <Badge className={`${getStatusColor(submission.status || 'submitted')} border`}>
                  {submission.status || 'Submitted'}
                </Badge>
              </div>
              <h3 className="font-serif font-bold text-lg text-charcoal mb-1 group-hover:text-rust transition-colors">
                {submission.candidateName || 'Unknown Candidate'}
              </h3>
              <p className="text-sm text-stone-500 mb-4 flex items-center gap-1">
                <Briefcase size={12} /> {submission.jobTitle || 'Unknown Job'}
              </p>
              <div className="space-y-2 text-xs text-stone-500 mb-4">
                <div className="flex items-center gap-2">
                  <Calendar size={12} /> Submitted: {new Date(submission.createdAt).toLocaleDateString()}
                </div>
                {submission.billRate && (
                  <div className="flex items-center gap-2">
                    <DollarSign size={12} /> {formatCurrency(submission.billRate)}/hr
                  </div>
                )}
              </div>
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="text-xs text-stone-400">
                  {submission.stage || 'Initial'}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                  Details <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}
          {filtered.length === 0 && (
            <div className="col-span-full text-center py-12 text-stone-400">
              <FileText size={48} className="mx-auto mb-4 opacity-50" />
              <p className="font-medium">No submissions found</p>
              <p className="text-sm mt-2">Try adjusting your filters or create a new submission.</p>
            </div>
          )}
        </div>
      )}
    </>
  );
}

function PlaceholderList({ type }: { type: string }) {
  const config = ENTITY_CONFIG[type as EntityListType] || ENTITY_CONFIG.leads;
  const Icon = config.icon;

  return (
    <div className="text-center py-12 text-stone-400">
      <Icon size={48} className="mx-auto mb-4 opacity-50" />
      <p className="font-medium">No {config.plural.toLowerCase()} found</p>
      <p className="text-sm mt-2">This entity type will be connected soon.</p>
    </div>
  );
}

// ============================================
// MAIN COMPONENT
// ============================================

// Ownership filter options for the toggle
const OWNERSHIP_OPTIONS: { value: OwnershipFilter; label: string }[] = [
  { value: 'my_items', label: 'My Items' },
  { value: 'all_org', label: 'All' },
];

export function EntityListView({ type, onCreateNew }: EntityListViewProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [ownership, setOwnership] = useState<OwnershipFilter>('my_items');

  const config = ENTITY_CONFIG[type] || ENTITY_CONFIG.leads;
  const Icon = config.icon;

  const renderList = () => {
    switch (type) {
      case 'leads':
        return <LeadsList searchTerm={searchTerm} filterStatus={filterStatus} ownership={ownership} />;
      case 'accounts':
        return <AccountsList searchTerm={searchTerm} filterStatus={filterStatus} ownership={ownership} />;
      case 'deals':
        return <DealsList searchTerm={searchTerm} filterStatus={filterStatus} ownership={ownership} />;
      case 'jobs':
        return <JobsList searchTerm={searchTerm} filterStatus={filterStatus} ownership={ownership} />;
      case 'talent':
        return <TalentList searchTerm={searchTerm} filterStatus={filterStatus} ownership={ownership} />;
      case 'submissions':
        return <SubmissionsList searchTerm={searchTerm} filterStatus={filterStatus} ownership={ownership} />;
      default:
        return <PlaceholderList type={type} />;
    }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className={`w-12 h-12 rounded-xl ${config.bgColor} flex items-center justify-center`}>
            <Icon className={`w-6 h-6 ${config.color}`} />
          </div>
          <div>
            <h1 className="text-2xl font-serif font-bold text-charcoal">{config.plural}</h1>
            <p className="text-sm text-stone-500">{config.description}</p>
          </div>
        </div>
        <Button onClick={onCreateNew} className="bg-charcoal hover:bg-rust">
          <Plus className="w-4 h-4 mr-2" />
          New {config.singular}
        </Button>
      </div>

      {/* Search & Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
          <Search size={18} className="text-stone-400 ml-2" />
          <input
            type="text"
            placeholder={`Search ${config.plural.toLowerCase()}...`}
            className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Ownership Toggle */}
        <div className="flex items-center gap-2 bg-white p-1 rounded-full border border-stone-200 shadow-sm">
          {OWNERSHIP_OPTIONS.map((option) => (
            <button
              key={option.value}
              onClick={() => setOwnership(option.value)}
              className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-colors ${
                ownership === option.value
                  ? 'bg-charcoal text-white'
                  : 'text-stone-500 hover:bg-stone-100'
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter Pills */}
      <div className="flex gap-2 mb-8 overflow-x-auto pb-2">
        {config.statusFilters.map((status) => (
          <button
            key={status.value}
            onClick={() => setFilterStatus(status.value)}
            className={`px-5 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-colors whitespace-nowrap ${
              filterStatus === status.value
                ? 'bg-charcoal text-white'
                : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
            }`}
          >
            {status.label}
          </button>
        ))}
      </div>

      {/* Entity List */}
      {renderList()}
    </div>
  );
}

export default EntityListView;
