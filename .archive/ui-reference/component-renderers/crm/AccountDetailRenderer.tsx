'use client';

/**
 * Account Detail Renderer
 *
 * A specialized renderer for the account detail screen with improved layout,
 * RACI-based data loading, and better styling.
 */

import React, { useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import { cn } from '@/lib/utils';
import {
  Building2,
  Phone,
  Globe,
  MapPin,
  Users,
  Briefcase,
  Target,
  FileText,
  Calendar,
  DollarSign,
  Edit,
  Trash2,
  ChevronLeft,
  Loader2,
  AlertCircle,
  Mail,
  User,
  Clock,
  TrendingUp,
  Settings,
} from 'lucide-react';

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  prospect: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  inactive: 'bg-stone-100 text-stone-600 border-stone-200',
  churned: 'bg-red-100 text-red-700 border-red-200',
};

// Tier badge colors
const TIER_COLORS: Record<string, string> = {
  enterprise: 'bg-purple-100 text-purple-700 border-purple-200',
  mid_market: 'bg-blue-100 text-blue-700 border-blue-200',
  smb: 'bg-stone-100 text-stone-600 border-stone-200',
  strategic: 'bg-amber-100 text-amber-700 border-amber-200',
};

// Format currency
function formatCurrency(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === '') return '-';
  const num = typeof value === 'string' ? parseFloat(value) : value;
  if (isNaN(num)) return '-';
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

// Format date
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format relative date
function formatRelativeDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diff = now.getTime() - d.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days === 0) return 'Today';
  if (days === 1) return 'Yesterday';
  if (days < 7) return `${days} days ago`;
  if (days < 30) return `${Math.floor(days / 7)} weeks ago`;
  if (days < 365) return `${Math.floor(days / 30)} months ago`;
  return `${Math.floor(days / 365)} years ago`;
}

// Capitalize and format enum values
function formatEnum(value: string | null | undefined): string {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Tab types
type TabId = 'overview' | 'contacts' | 'deals' | 'jobs' | 'activity';

interface TabDefinition {
  id: TabId;
  label: string;
  icon: React.ReactNode;
}

const TABS: TabDefinition[] = [
  { id: 'overview', label: 'Overview', icon: <Building2 size={16} /> },
  { id: 'contacts', label: 'Contacts', icon: <Users size={16} /> },
  { id: 'deals', label: 'Deals', icon: <Briefcase size={16} /> },
  { id: 'jobs', label: 'Jobs', icon: <Target size={16} /> },
  { id: 'activity', label: 'Activity', icon: <Clock size={16} /> },
];

/**
 * Account Detail Renderer Component
 */
export function AccountDetailRenderer() {
  const router = useRouter();
  const params = useParams();
  const accountId = params?.id as string;

  const [activeTab, setActiveTab] = useState<TabId>('overview');

  // Fetch account detail with RACI-based filtering
  const accountQuery = trpc.crm.accounts.getById.useQuery(
    { id: accountId },
    { enabled: !!accountId }
  );

  const account = accountQuery.data;
  const isLoading = accountQuery.isLoading;
  const error = accountQuery.error;

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-rust" size={40} />
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="p-6 bg-red-50 border border-red-200 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-red-800">Error Loading Account</h2>
            <p className="mt-2 text-red-700">{error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Not found state
  if (!account) {
    return (
      <div className="p-6 bg-stone-50 border border-stone-200 rounded-lg text-center">
        <Building2 className="mx-auto text-stone-300" size={48} />
        <h2 className="mt-4 text-lg font-semibold text-stone-800">Account Not Found</h2>
        <p className="mt-2 text-stone-600">The account you're looking for doesn't exist or you don't have access to it.</p>
        <Link
          href="/employee/recruiting/accounts"
          className="mt-4 inline-flex items-center gap-2 text-rust hover:underline"
        >
          <ChevronLeft size={16} />
          Back to Accounts
        </Link>
      </div>
    );
  }

  return (
    <div className="account-detail space-y-6">
      {/* Header */}
      <header>
        <Link
          href="/employee/recruiting/accounts"
          className="inline-flex items-center gap-2 text-stone-500 hover:text-stone-700 mb-4"
        >
          <ChevronLeft size={20} />
          Back to Accounts
        </Link>

        <div className="flex items-start justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="w-16 h-16 rounded-xl bg-rust/10 flex items-center justify-center">
              <Building2 className="text-rust" size={32} />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-stone-900">{account.name}</h1>
              <div className="flex items-center gap-3 mt-2">
                <span
                  className={cn(
                    'inline-flex px-3 py-1 text-sm font-medium rounded-full border',
                    STATUS_COLORS[account.status ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                  )}
                >
                  {formatEnum(account.status)}
                </span>
                {account.tier && (
                  <span
                    className={cn(
                      'inline-flex px-3 py-1 text-sm font-medium rounded-full border',
                      TIER_COLORS[account.tier] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                    )}
                  >
                    {formatEnum(account.tier)}
                  </span>
                )}
                {account.industry && (
                  <span className="text-stone-500">{formatEnum(account.industry)}</span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push(`/employee/recruiting/accounts/${accountId}/edit`)}
              className="px-4 py-2 rounded-lg text-sm font-medium bg-rust text-white hover:bg-rust/90 transition-colors flex items-center gap-2"
            >
              <Edit size={16} />
              Edit
            </button>
          </div>
        </div>
      </header>

      {/* Tab Navigation */}
      <div className="border-b border-stone-200">
        <nav className="flex gap-1">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                'flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors',
                activeTab === tab.id
                  ? 'border-rust text-rust'
                  : 'border-transparent text-stone-500 hover:text-stone-700 hover:border-stone-300'
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'overview' && (
            <>
              {/* Company Information */}
              <section className="bg-white border border-stone-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <Building2 size={20} className="text-rust" />
                  Company Information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Company Name</label>
                    <p className="mt-1 text-stone-900">{account.name}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Industry</label>
                    <p className="mt-1 text-stone-900">{formatEnum(account.industry)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Company Type</label>
                    <p className="mt-1 text-stone-900">{formatEnum(account.companyType)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Status</label>
                    <p className="mt-1">
                      <span
                        className={cn(
                          'inline-flex px-2 py-0.5 text-xs font-medium rounded-full border',
                          STATUS_COLORS[account.status ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                        )}
                      >
                        {formatEnum(account.status)}
                      </span>
                    </p>
                  </div>
                  {account.description && (
                    <div className="col-span-2">
                      <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Description</label>
                      <p className="mt-1 text-stone-700">{account.description}</p>
                    </div>
                  )}
                </div>
              </section>

              {/* Contact Information */}
              <section className="bg-white border border-stone-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <Phone size={20} className="text-rust" />
                  Contact Information
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Phone</label>
                    {account.phone ? (
                      <a href={`tel:${account.phone}`} className="mt-1 text-rust hover:underline flex items-center gap-2">
                        <Phone size={14} />
                        {account.phone}
                      </a>
                    ) : (
                      <p className="mt-1 text-stone-400">-</p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Website</label>
                    {account.website ? (
                      <a href={account.website} target="_blank" rel="noopener noreferrer" className="mt-1 text-rust hover:underline flex items-center gap-2">
                        <Globe size={14} />
                        {account.website.replace(/^https?:\/\//, '')}
                      </a>
                    ) : (
                      <p className="mt-1 text-stone-400">-</p>
                    )}
                  </div>
                  <div className="col-span-2">
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Headquarters</label>
                    {account.headquartersLocation ? (
                      <p className="mt-1 text-stone-900 flex items-center gap-2">
                        <MapPin size={14} className="text-stone-400" />
                        {account.headquartersLocation}
                      </p>
                    ) : (
                      <p className="mt-1 text-stone-400">-</p>
                    )}
                  </div>
                </div>
              </section>

              {/* Business Terms */}
              <section className="bg-white border border-stone-200 rounded-xl p-6">
                <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                  <DollarSign size={20} className="text-rust" />
                  Business Terms
                </h2>
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Contract Start</label>
                    <p className="mt-1 text-stone-900">{formatDate(account.contractStartDate)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Contract End</label>
                    <p className="mt-1 text-stone-900">{formatDate(account.contractEndDate)}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Payment Terms</label>
                    <p className="mt-1 text-stone-900">{account.paymentTermsDays ? `${account.paymentTermsDays} days` : '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Markup</label>
                    <p className="mt-1 text-stone-900">{account.markupPercentage ? `${account.markupPercentage}%` : '-'}</p>
                  </div>
                  <div>
                    <label className="text-xs text-stone-500 uppercase tracking-wide font-medium">Annual Revenue Target</label>
                    <p className="mt-1 text-stone-900 font-semibold">{formatCurrency(account.annualRevenueTarget)}</p>
                  </div>
                </div>
              </section>
            </>
          )}

          {activeTab === 'contacts' && (
            <section className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                  <Users size={20} className="text-rust" />
                  Points of Contact
                </h2>
                <button className="px-3 py-1.5 text-sm font-medium bg-rust text-white rounded-lg hover:bg-rust/90 transition-colors">
                  Add Contact
                </button>
              </div>
              <div className="text-center py-8 text-stone-500">
                <Users className="mx-auto text-stone-300" size={40} />
                <p className="mt-2">No contacts added yet</p>
              </div>
            </section>
          )}

          {activeTab === 'deals' && (
            <section className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                  <Briefcase size={20} className="text-rust" />
                  Deals
                </h2>
                <button className="px-3 py-1.5 text-sm font-medium bg-rust text-white rounded-lg hover:bg-rust/90 transition-colors">
                  Create Deal
                </button>
              </div>
              <div className="text-center py-8 text-stone-500">
                <Briefcase className="mx-auto text-stone-300" size={40} />
                <p className="mt-2">No deals created yet</p>
              </div>
            </section>
          )}

          {activeTab === 'jobs' && (
            <section className="bg-white border border-stone-200 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-stone-900 flex items-center gap-2">
                  <Target size={20} className="text-rust" />
                  Jobs
                </h2>
                <button className="px-3 py-1.5 text-sm font-medium bg-rust text-white rounded-lg hover:bg-rust/90 transition-colors">
                  Add Job
                </button>
              </div>
              <div className="text-center py-8 text-stone-500">
                <Target className="mx-auto text-stone-300" size={40} />
                <p className="mt-2">No jobs associated yet</p>
              </div>
            </section>
          )}

          {activeTab === 'activity' && (
            <section className="bg-white border border-stone-200 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-stone-900 mb-4 flex items-center gap-2">
                <Clock size={20} className="text-rust" />
                Activity Timeline
              </h2>
              <div className="text-center py-8 text-stone-500">
                <Clock className="mx-auto text-stone-300" size={40} />
                <p className="mt-2">No activity recorded yet</p>
              </div>
            </section>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Quick Info Card */}
          <aside className="bg-white border border-stone-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">Quick Info</h3>
            <div className="space-y-4">
              <div>
                <label className="text-xs text-stone-400">Status</label>
                <p className="mt-1">
                  <span
                    className={cn(
                      'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                      STATUS_COLORS[account.status ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                    )}
                  >
                    {formatEnum(account.status)}
                  </span>
                </p>
              </div>
              <div>
                <label className="text-xs text-stone-400">Tier</label>
                <p className="mt-1">
                  {account.tier ? (
                    <span
                      className={cn(
                        'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                        TIER_COLORS[account.tier] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                      )}
                    >
                      {formatEnum(account.tier)}
                    </span>
                  ) : (
                    <span className="text-stone-400">-</span>
                  )}
                </p>
              </div>
              <div>
                <label className="text-xs text-stone-400">Account Manager</label>
                <p className="mt-1 text-stone-900 flex items-center gap-2">
                  <User size={14} className="text-stone-400" />
                  {account.accountManager?.fullName || '-'}
                </p>
              </div>
              <div>
                <label className="text-xs text-stone-400">Revenue Target</label>
                <p className="mt-1 text-stone-900 font-semibold flex items-center gap-2">
                  <TrendingUp size={14} className="text-green-500" />
                  {formatCurrency(account.annualRevenueTarget)}
                </p>
              </div>
              <div>
                <label className="text-xs text-stone-400">Responsiveness</label>
                <p className="mt-1 text-stone-900">{formatEnum(account.responsiveness)}</p>
              </div>
              <div>
                <label className="text-xs text-stone-400">Preferred Quality</label>
                <p className="mt-1 text-stone-900">{formatEnum(account.preferredQuality)}</p>
              </div>
              <div className="pt-4 border-t border-stone-100">
                <label className="text-xs text-stone-400">Created</label>
                <p className="mt-1 text-stone-600 text-sm">{formatRelativeDate(account.createdAt)}</p>
              </div>
              <div>
                <label className="text-xs text-stone-400">Last Updated</label>
                <p className="mt-1 text-stone-600 text-sm">{formatRelativeDate(account.updatedAt)}</p>
              </div>
            </div>
          </aside>

          {/* Quick Actions */}
          <aside className="bg-white border border-stone-200 rounded-xl p-6">
            <h3 className="text-sm font-semibold text-stone-500 uppercase tracking-wide mb-4">Quick Actions</h3>
            <div className="space-y-2">
              {account.phone && (
                <a
                  href={`tel:${account.phone}`}
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Phone size={18} className="text-rust" />
                  <span className="text-sm font-medium">Call Account</span>
                </a>
              )}
              {account.website && (
                <a
                  href={account.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  <Globe size={18} className="text-rust" />
                  <span className="text-sm font-medium">Visit Website</span>
                </a>
              )}
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors text-left">
                <FileText size={18} className="text-rust" />
                <span className="text-sm font-medium">Create Note</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-stone-50 transition-colors text-left">
                <Calendar size={18} className="text-rust" />
                <span className="text-sm font-medium">Schedule Meeting</span>
              </button>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default AccountDetailRenderer;
