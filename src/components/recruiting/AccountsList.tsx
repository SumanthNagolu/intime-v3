'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Search, Building2, ChevronRight, Users, Briefcase, MoreHorizontal, Plus, Loader2 } from 'lucide-react';
import { useAccounts } from '@/hooks/queries/accounts';
import { CreateAccountModal } from './Modals';
import type { AccountStatus } from '@/types/aligned/crm';

const TIME_FILTERS = ['Current Sprint', 'This Month', 'This Quarter', 'YTD', 'All Time'];

// Status filter options with mapping to database values
const STATUS_FILTERS: { label: string; value: AccountStatus | 'all' }[] = [
    { label: 'All', value: 'all' },
    { label: 'Active', value: 'active' },
    { label: 'Prospect', value: 'prospect' },
    { label: 'Churned', value: 'churned' },
    { label: 'Hold', value: 'inactive' },
];

// Tier badge colors
const TIER_COLORS: Record<string, string> = {
    platinum: 'bg-gradient-to-r from-slate-400 to-slate-600 text-white',
    gold: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white',
    silver: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',
    bronze: 'bg-gradient-to-r from-orange-300 to-orange-500 text-white',
};

export const AccountsList: React.FC = () => {
    const router = useRouter();
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<AccountStatus | 'all'>('all');
    const [timeFilter, setTimeFilter] = useState('All Time');
    const [showCreateModal, setShowCreateModal] = useState(false);

    // Use tRPC query with filters
    const { accounts, isLoading, error, refetch } = useAccounts({
        status: statusFilter === 'all' ? undefined : statusFilter,
        search: searchTerm.length >= 2 ? searchTerm : undefined,
        limit: 100,
    });

    // Handle successful account creation
    const handleAccountCreated = (account: { id: string }) => {
        refetch();
        router.push(`/employee/recruiting/accounts/${account.id}`);
    };

    // Filter accounts locally for search when less than 2 chars (API search requires 2+ chars)
    const displayAccounts = searchTerm.length < 2
        ? accounts.filter(a =>
            a.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (a.industry && a.industry.toLowerCase().includes(searchTerm.toLowerCase()))
        )
        : accounts;

    return (
        <div className="animate-fade-in">
            {/* Top Bar with Search and Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
                {/* Search */}
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

                {/* Time Filter */}
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

            {/* Status Filter + New Account Button */}
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

                <button
                    onClick={() => setShowCreateModal(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg shrink-0"
                >
                    <Plus size={14} />
                    New Account
                </button>
            </div>

            {/* Loading State */}
            {isLoading && (
                <div className="flex justify-center items-center py-16">
                    <Loader2 size={32} className="animate-spin text-stone-400" />
                </div>
            )}

            {/* Error State */}
            {error && (
                <div className="text-center py-12 bg-red-50 rounded-2xl border border-red-200">
                    <p className="text-red-600 mb-4">Failed to load accounts</p>
                    <button
                        onClick={() => refetch()}
                        className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            )}

            {/* Accounts Grid */}
            {!isLoading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {displayAccounts.map(account => (
                        <Link
                            href={`/employee/recruiting/accounts/${account.id}`}
                            key={account.id}
                            className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative"
                        >
                            <div className="absolute top-6 right-6 text-stone-300 group-hover:text-charcoal transition-colors">
                                <MoreHorizontal size={20} />
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                <div className="w-14 h-14 bg-stone-50 rounded-2xl flex items-center justify-center text-stone-400 group-hover:bg-rust group-hover:text-white transition-colors border border-stone-100">
                                    <Building2 size={24} />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors truncate">
                                        {account.name}
                                    </h3>
                                    <div className="text-xs text-stone-500 flex items-center gap-2">
                                        {account.industry || 'No industry'}
                                        {account.tier && (
                                            <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase ${TIER_COLORS[account.tier.toLowerCase()] || 'bg-stone-200 text-stone-600'}`}>
                                                {account.tier}
                                            </span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-4 mb-6">
                                <div className="bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 flex items-center gap-2">
                                    <Briefcase size={14} className="text-stone-400" />
                                    <span className="text-xs font-bold text-charcoal">- Jobs</span>
                                </div>
                                <div className="bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-100 flex items-center gap-2">
                                    <Users size={14} className="text-stone-400" />
                                    <span className="text-xs font-bold text-charcoal">- POCs</span>
                                </div>
                            </div>

                            <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${
                                    account.status === 'Active' ? 'bg-green-50 text-green-700' :
                                    account.status === 'Churned' ? 'bg-red-50 text-red-700' :
                                    account.status === 'Hold' ? 'bg-amber-50 text-amber-700' :
                                    account.status === 'Prospect' ? 'bg-blue-50 text-blue-700' :
                                    'bg-stone-100 text-stone-500'
                                }`}>
                                    {account.status}
                                </span>
                                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                                    Hub View <ChevronRight size={12} />
                                </div>
                            </div>
                        </Link>
                    ))}

                    {displayAccounts.length === 0 && !isLoading && (
                        <div className="col-span-full text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
                            <Building2 size={32} className="mx-auto text-stone-300 mb-3" />
                            <p className="text-stone-500 mb-4">
                                {searchTerm ? 'No accounts found matching your search.' : 'No accounts yet.'}
                            </p>
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors"
                            >
                                Create First Account
                            </button>
                        </div>
                    )}
                </div>
            )}

            {/* Create Account Modal */}
            {showCreateModal && (
                <CreateAccountModal
                    onClose={() => setShowCreateModal(false)}
                    onSuccess={handleAccountCreated}
                />
            )}
        </div>
    );
};

export default AccountsList;
