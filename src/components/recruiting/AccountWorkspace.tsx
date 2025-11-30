'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import {
    ChevronLeft,
    Building2,
    Users,
    Briefcase,
    Plus,
    Mail,
    Phone,
    Activity,
    Zap,
    Edit2,
    Star,
    ExternalLink,
    Globe,
    MapPin,
    Handshake,
    Loader2,
    Trash2,
    Check,
    X,
    Target,
    FileText,
    UserCheck,
    Clock,
    Calendar,
    MessageSquare,
    DollarSign,
    Upload,
    File,
    Search,
    ChevronRight,
    AlertCircle,
    CheckCircle2,
    Linkedin,
    Send,
    Award,
    BarChart3,
    Download,
} from 'lucide-react';
import { useAccount, useAccountPocs } from '@/hooks/queries/accounts';
import { useUpdateAccount, useUpdateAccountStatus, useUpdateAccountTier, useDeletePoc, useSetPrimaryPoc } from '@/hooks/mutations/accounts';
import { useDeals } from '@/hooks/queries/deals';
import { useAccountLeads } from '@/hooks/queries/leads';
import { useJobsByClient } from '@/hooks/queries/jobs';
import { CreatePOCModal, CreateLeadModal, CreateDealFromAccountModal, CreateJobFromAccountModal } from './Modals';
import { trpc } from '@/lib/trpc/client';
import type { DisplayAccount, DisplayPointOfContact } from '@/lib/adapters';

// ============================================
// TYPES
// ============================================

type TabKey = 'overview' | 'contacts' | 'leads' | 'deals' | 'jobs' | 'talent' | 'documents' | 'activity';

interface AccountWorkspaceProps {
    accountId: string;
}

// ============================================
// CONSTANTS
// ============================================

const TIER_COLORS: Record<string, string> = {
    platinum: 'bg-gradient-to-r from-slate-400 to-slate-600 text-white',
    gold: 'bg-gradient-to-r from-amber-400 to-amber-600 text-white',
    silver: 'bg-gradient-to-r from-gray-300 to-gray-500 text-white',
    bronze: 'bg-gradient-to-r from-orange-300 to-orange-500 text-white',
};

const STATUS_COLORS: Record<string, string> = {
    Active: 'bg-green-100 text-green-700 border-green-200',
    Prospect: 'bg-blue-100 text-blue-700 border-blue-200',
    Hold: 'bg-amber-100 text-amber-700 border-amber-200',
    Churned: 'bg-red-100 text-red-700 border-red-200',
};

// ============================================
// MAIN COMPONENT
// ============================================

export const AccountWorkspace: React.FC<AccountWorkspaceProps> = ({ accountId }) => {
    const [activeTab, setActiveTab] = useState<TabKey>('overview');
    const [showPocModal, setShowPocModal] = useState(false);
    const [showLeadModal, setShowLeadModal] = useState(false);
    const [showDealModal, setShowDealModal] = useState(false);
    const [showJobModal, setShowJobModal] = useState(false);
    const [isEditingDetails, setIsEditingDetails] = useState(false);
    const [editForm, setEditForm] = useState<Partial<DisplayAccount>>({});

    // ============================================
    // QUERIES
    // ============================================
    const { account, isLoading, error, refetch } = useAccount(accountId);
    const { pocs, refetch: refetchPocs, isLoading: pocsLoading } = useAccountPocs(accountId);
    const { deals, isLoading: dealsLoading, refetch: refetchDeals } = useDeals({ accountId, enabled: !!accountId });
    const { leads, isLoading: leadsLoading, refetch: refetchLeads } = useAccountLeads(accountId);
    const { jobs, isLoading: jobsLoading, refetch: refetchJobs } = useJobsByClient(accountId);

    // Activities query
    const activitiesQuery = trpc.activities.list.useQuery(
        { entityType: 'account', entityId: accountId, limit: 50 },
        { enabled: !!accountId }
    );

    // ============================================
    // MUTATIONS
    // ============================================
    const { updateAccount, isUpdating } = useUpdateAccount({
        onSuccess: () => {
            setIsEditingDetails(false);
            refetch();
        }
    });
    const { updateStatus } = useUpdateAccountStatus();
    const { updateTier } = useUpdateAccountTier();
    const { deletePoc, isDeleting: isDeletingPoc } = useDeletePoc({
        onSuccess: () => refetchPocs()
    });
    const { setPrimary } = useSetPrimaryPoc({
        onSuccess: () => refetchPocs()
    });

    // ============================================
    // COMPUTED VALUES
    // ============================================
    const stats = useMemo(() => ({
        contacts: pocs.length,
        leads: leads?.length || 0,
        deals: deals?.length || 0,
        jobs: jobs?.length || 0,
        openJobs: jobs?.filter(j => j.status === 'open').length || 0,
        totalDealValue: deals?.reduce((sum, d) => sum + (Number(d.value) || 0), 0) || 0,
    }), [pocs, leads, deals, jobs]);

    // ============================================
    // HANDLERS
    // ============================================
    const handleStatusChange = async (action: 'activate' | 'hold' | 'churn' | 'prospect') => {
        try {
            await updateStatus(accountId, action);
            refetch();
        } catch (err) {
            console.error('Failed to update status:', err);
        }
    };

    const handleTierChange = async (tier: 'platinum' | 'gold' | 'silver' | 'bronze') => {
        try {
            await updateTier(accountId, tier);
            refetch();
        } catch (err) {
            console.error('Failed to update tier:', err);
        }
    };

    const startEditing = () => {
        setEditForm({
            name: account?.name,
            industry: account?.industry,
            type: account?.type,
            description: account?.description,
            website: account?.website,
            phone: account?.phone,
            headquartersLocation: account?.headquartersLocation,
        });
        setIsEditingDetails(true);
    };

    const saveDetails = async () => {
        try {
            await updateAccount({
                id: accountId,
                name: editForm.name,
                industry: editForm.industry,
                description: editForm.description,
                website: editForm.website,
                phone: editForm.phone,
                headquartersLocation: editForm.headquartersLocation,
            });
        } catch (err) {
            console.error('Failed to update account:', err);
        }
    };

    // ============================================
    // LOADING & ERROR STATES
    // ============================================
    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
            </div>
        );
    }

    if (error || !account) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] gap-4">
                <AlertCircle className="w-12 h-12 text-red-400" />
                <div className="text-red-500 text-lg font-medium">Failed to load account</div>
                <button
                    onClick={() => refetch()}
                    className="px-4 py-2 bg-stone-100 rounded-lg text-sm font-medium hover:bg-stone-200 transition-colors"
                >
                    Try Again
                </button>
            </div>
        );
    }

    // ============================================
    // TABS CONFIG
    // ============================================
    const tabs: { key: TabKey; label: string; icon: React.ReactNode; count?: number }[] = [
        { key: 'overview', label: 'Overview', icon: <Activity size={14} /> },
        { key: 'contacts', label: 'Contacts', icon: <Users size={14} />, count: stats.contacts },
        { key: 'leads', label: 'Leads', icon: <Target size={14} />, count: stats.leads },
        { key: 'deals', label: 'Deals', icon: <Handshake size={14} />, count: stats.deals },
        { key: 'jobs', label: 'Jobs', icon: <Briefcase size={14} />, count: stats.jobs },
        { key: 'talent', label: 'Talent', icon: <UserCheck size={14} /> },
        { key: 'documents', label: 'Documents', icon: <FileText size={14} /> },
        { key: 'activity', label: 'Activity', icon: <Clock size={14} /> },
    ];

    // ============================================
    // RENDER
    // ============================================
    return (
        <div className="animate-fade-in">
            {/* Back link */}
            <Link
                href="/employee/recruiting/accounts"
                className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-4 transition-colors"
            >
                <ChevronLeft size={14} /> Back to Accounts
            </Link>

            {/* Compact Header */}
            <div className="bg-white rounded-2xl shadow-lg border border-stone-200 mb-6 overflow-hidden">
                <div className="bg-gradient-to-r from-charcoal to-stone-800 h-1.5" />

                <div className="p-6">
                    <div className="flex items-start gap-6">
                        {/* Logo */}
                        <div className="w-16 h-16 bg-stone-100 rounded-2xl flex items-center justify-center text-stone-400 border border-stone-200 shrink-0">
                            <Building2 size={28} />
                        </div>

                        {/* Main Info */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-start justify-between gap-4">
                                <div className="flex-1 min-w-0">
                                    {isEditingDetails ? (
                                        <input
                                            className="text-2xl font-serif font-bold text-charcoal bg-stone-50 border border-stone-200 rounded-lg px-3 py-1 w-full max-w-md mb-2"
                                            value={editForm.name || ''}
                                            onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                                        />
                                    ) : (
                                        <h1 className="text-2xl font-serif font-bold text-charcoal mb-1 truncate">
                                            {account.name}
                                        </h1>
                                    )}

                                    <div className="flex flex-wrap items-center gap-2 text-sm">
                                        {account.industry && (
                                            <span className="bg-stone-100 px-2 py-0.5 rounded text-xs font-medium text-stone-600">
                                                {account.industry}
                                            </span>
                                        )}
                                        {account.type && (
                                            <span className="text-stone-500">• {account.type}</span>
                                        )}
                                        {account.tier && (
                                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${TIER_COLORS[account.tier.toLowerCase()] || 'bg-stone-200 text-stone-600'}`}>
                                                {account.tier}
                                            </span>
                                        )}
                                    </div>

                                    {/* Contact row */}
                                    <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-stone-500">
                                        {account.website && (
                                            <a href={account.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-rust">
                                                <Globe size={12} /> Website <ExternalLink size={10} />
                                            </a>
                                        )}
                                        {account.phone && (
                                            <span className="flex items-center gap-1"><Phone size={12} /> {account.phone}</span>
                                        )}
                                        {account.headquartersLocation && (
                                            <span className="flex items-center gap-1"><MapPin size={12} /> {account.headquartersLocation}</span>
                                        )}
                                    </div>
                                </div>

                                {/* Status & Actions */}
                                <div className="flex flex-col items-end gap-2 shrink-0">
                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase border ${STATUS_COLORS[account.status] || 'bg-stone-100 text-stone-500 border-stone-200'}`}>
                                        {account.status}
                                    </span>

                                    <div className="flex items-center gap-1">
                                        {isEditingDetails ? (
                                            <>
                                                <button onClick={() => setIsEditingDetails(false)} className="p-1.5 text-stone-400 hover:text-charcoal">
                                                    <X size={16} />
                                                </button>
                                                <button onClick={saveDetails} disabled={isUpdating} className="flex items-center gap-1 px-2 py-1 bg-green-500 text-white rounded text-xs font-bold hover:bg-green-600 disabled:opacity-50">
                                                    {isUpdating ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                                                </button>
                                            </>
                                        ) : (
                                            <button onClick={startEditing} className="flex items-center gap-1 text-xs font-bold text-rust hover:underline">
                                                <Edit2 size={12} /> Edit
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Quick Actions Row */}
                            <div className="flex items-center gap-3 mt-4 pt-4 border-t border-stone-100">
                                <div className="flex gap-1">
                                    <span className="text-xs text-stone-400 mr-1">Status:</span>
                                    {(['activate', 'hold', 'churn'] as const).map(action => {
                                        const config = {
                                            activate: { label: 'Activate', current: 'Active', color: 'text-green-600 bg-green-50 hover:bg-green-100' },
                                            hold: { label: 'Hold', current: 'Hold', color: 'text-amber-600 bg-amber-50 hover:bg-amber-100' },
                                            churn: { label: 'Churn', current: 'Churned', color: 'text-red-600 bg-red-50 hover:bg-red-100' },
                                        }[action];
                                        if (account.status === config.current) return null;
                                        return (
                                            <button
                                                key={action}
                                                onClick={() => handleStatusChange(action)}
                                                className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${config.color}`}
                                            >
                                                {config.label}
                                            </button>
                                        );
                                    })}
                                </div>

                                <div className="w-px h-4 bg-stone-200" />

                                <div className="flex gap-1">
                                    <span className="text-xs text-stone-400 mr-1">Tier:</span>
                                    {(['platinum', 'gold', 'silver', 'bronze'] as const).map(tier => (
                                        <button
                                            key={tier}
                                            onClick={() => handleTierChange(tier)}
                                            className={`px-2 py-0.5 text-[9px] font-bold uppercase rounded transition-all ${
                                                account.tier?.toLowerCase() === tier
                                                    ? TIER_COLORS[tier]
                                                    : 'bg-stone-100 text-stone-400 hover:bg-stone-200'
                                            }`}
                                        >
                                            {tier}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Content: Tabs + Content Area */}
            <div className="flex gap-6">
                {/* Left Sidebar: Tabs */}
                <div className="w-48 shrink-0">
                    <nav className="bg-white rounded-xl border border-stone-200 shadow-sm overflow-hidden sticky top-4">
                        {tabs.map(tab => (
                            <button
                                key={tab.key}
                                onClick={() => setActiveTab(tab.key)}
                                className={`w-full flex items-center justify-between px-4 py-3 text-sm font-medium transition-colors border-l-2 ${
                                    activeTab === tab.key
                                        ? 'bg-rust/5 text-rust border-rust'
                                        : 'text-stone-600 hover:bg-stone-50 border-transparent hover:border-stone-200'
                                }`}
                            >
                                <span className="flex items-center gap-2">
                                    {tab.icon}
                                    {tab.label}
                                </span>
                                {tab.count !== undefined && (
                                    <span className={`text-xs px-1.5 py-0.5 rounded-full ${
                                        activeTab === tab.key ? 'bg-rust/20 text-rust' : 'bg-stone-100 text-stone-500'
                                    }`}>
                                        {tab.count}
                                    </span>
                                )}
                            </button>
                        ))}
                    </nav>

                    {/* Quick Stats */}
                    <div className="bg-stone-900 text-white rounded-xl p-4 mt-4 shadow-lg">
                        <h4 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-3">Quick Stats</h4>
                        <div className="space-y-2 text-sm">
                            <div className="flex justify-between">
                                <span className="text-stone-400">Open Jobs</span>
                                <span className="font-bold">{stats.openJobs}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-stone-400">Active Deals</span>
                                <span className="font-bold">{stats.deals}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-stone-400">Pipeline</span>
                                <span className="font-bold text-green-400">${stats.totalDealValue.toLocaleString()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Main Content Area */}
                <div className="flex-1 min-w-0">
                    {activeTab === 'overview' && (
                        <OverviewTab
                            account={account}
                            pocs={pocs}
                            stats={stats}
                            onAddPoc={() => setShowPocModal(true)}
                            onTabChange={setActiveTab}
                        />
                    )}

                    {activeTab === 'contacts' && (
                        <ContactsTab
                            accountId={accountId}
                            accountName={account.name}
                            pocs={pocs}
                            isLoading={pocsLoading}
                            onAddPoc={() => setShowPocModal(true)}
                            onDeletePoc={deletePoc}
                            onSetPrimary={(pocId) => setPrimary(pocId, accountId)}
                            isDeleting={isDeletingPoc}
                        />
                    )}

                    {activeTab === 'leads' && (
                        <LeadsTab
                            accountId={accountId}
                            accountName={account.name}
                            leads={leads || []}
                            isLoading={leadsLoading}
                            onNewLead={() => setShowLeadModal(true)}
                        />
                    )}

                    {activeTab === 'deals' && (
                        <DealsTab
                            accountId={accountId}
                            accountName={account.name}
                            deals={deals || []}
                            isLoading={dealsLoading}
                            onNewDeal={() => setShowDealModal(true)}
                        />
                    )}

                    {activeTab === 'jobs' && (
                        <JobsTab
                            accountId={accountId}
                            accountName={account.name}
                            jobs={jobs || []}
                            isLoading={jobsLoading}
                            onNewJob={() => setShowJobModal(true)}
                        />
                    )}

                    {activeTab === 'talent' && (
                        <TalentTab accountId={accountId} accountName={account.name} />
                    )}

                    {activeTab === 'documents' && (
                        <DocumentsTab accountId={accountId} accountName={account.name} />
                    )}

                    {activeTab === 'activity' && (
                        <ActivityTab
                            accountId={accountId}
                            activities={activitiesQuery.data || []}
                            isLoading={activitiesQuery.isLoading}
                            refetch={activitiesQuery.refetch}
                        />
                    )}
                </div>
            </div>

            {/* Modals */}
            {showPocModal && (
                <CreatePOCModal
                    accountId={accountId}
                    accountName={account.name}
                    onClose={() => setShowPocModal(false)}
                    onSuccess={() => refetchPocs()}
                />
            )}

            {showLeadModal && (
                <CreateLeadModal
                    onClose={() => setShowLeadModal(false)}
                    onSave={() => {
                        setShowLeadModal(false);
                        refetchLeads();
                    }}
                    defaultAccountId={accountId}
                />
            )}

            {showDealModal && (
                <CreateDealFromAccountModal
                    accountId={accountId}
                    accountName={account.name}
                    onClose={() => setShowDealModal(false)}
                    onSuccess={() => {
                        setShowDealModal(false);
                        refetchDeals();
                    }}
                />
            )}

            {showJobModal && (
                <CreateJobFromAccountModal
                    accountId={accountId}
                    accountName={account.name}
                    onClose={() => setShowJobModal(false)}
                    onSuccess={() => {
                        setShowJobModal(false);
                        refetchJobs();
                    }}
                />
            )}
        </div>
    );
};

// ============================================
// OVERVIEW TAB
// ============================================
const OverviewTab: React.FC<{
    account: DisplayAccount;
    pocs: DisplayPointOfContact[];
    stats: { contacts: number; leads: number; deals: number; jobs: number; openJobs: number; totalDealValue: number };
    onAddPoc: () => void;
    onTabChange: (tab: TabKey) => void;
}> = ({ account, pocs, stats, onAddPoc, onTabChange }) => {
    return (
        <div className="space-y-6">
            {/* Stats Row */}
            <div className="grid grid-cols-4 gap-4">
                {[
                    { label: 'Contacts', value: stats.contacts, icon: Users, color: 'bg-blue-50 text-blue-600', tab: 'contacts' as TabKey },
                    { label: 'Leads', value: stats.leads, icon: Target, color: 'bg-purple-50 text-purple-600', tab: 'leads' as TabKey },
                    { label: 'Deals', value: stats.deals, icon: Handshake, color: 'bg-green-50 text-green-600', tab: 'deals' as TabKey },
                    { label: 'Open Jobs', value: stats.openJobs, icon: Briefcase, color: 'bg-amber-50 text-amber-600', tab: 'jobs' as TabKey },
                ].map(stat => (
                    <button
                        key={stat.label}
                        onClick={() => onTabChange(stat.tab)}
                        className="bg-white p-4 rounded-xl border border-stone-200 hover:border-rust/30 hover:shadow-md transition-all text-left group"
                    >
                        <div className={`w-10 h-10 rounded-lg ${stat.color} flex items-center justify-center mb-3`}>
                            <stat.icon size={20} />
                        </div>
                        <div className="text-2xl font-bold text-charcoal">{stat.value}</div>
                        <div className="text-xs text-stone-500 group-hover:text-rust transition-colors">{stat.label} →</div>
                    </button>
                ))}
            </div>

            <div className="grid grid-cols-2 gap-6">
                {/* Account Intelligence */}
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
                        <Zap size={16} className="text-rust" /> Account Intelligence
                    </h3>

                    <div className="grid grid-cols-3 gap-3 mb-4">
                        <div className="p-3 bg-stone-50 rounded-lg text-center">
                            <div className="text-[10px] font-bold uppercase text-stone-400 mb-1">Response</div>
                            <div className={`font-bold ${
                                account.responsiveness === 'High' ? 'text-green-600' :
                                account.responsiveness === 'Medium' ? 'text-amber-600' : 'text-red-600'
                            }`}>
                                {account.responsiveness || '-'}
                            </div>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg text-center">
                            <div className="text-[10px] font-bold uppercase text-stone-400 mb-1">Priority</div>
                            <div className="font-bold text-charcoal">{account.preference || '-'}</div>
                        </div>
                        <div className="p-3 bg-stone-50 rounded-lg text-center">
                            <div className="text-[10px] font-bold uppercase text-stone-400 mb-1">Tier</div>
                            <div className="font-bold text-charcoal capitalize">{account.tier || '-'}</div>
                        </div>
                    </div>

                    {/* Strategy tip */}
                    <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex gap-3">
                            <Zap size={16} className="text-blue-600 shrink-0 mt-0.5" />
                            <div>
                                <h4 className="font-bold text-blue-900 text-sm mb-1">Strategy Tip</h4>
                                <p className="text-blue-800 text-xs leading-relaxed">
                                    {account.preference === 'Quality' ? (
                                        <>Prioritize <strong>quality</strong> candidates. Thorough vetting is expected.</>
                                    ) : account.preference === 'Speed' ? (
                                        <>Fast turnaround is key. Submit quickly and in volume.</>
                                    ) : (
                                        <>Build relationships and understand their specific hiring needs.</>
                                    )}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Key Stakeholders */}
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                    <div className="flex justify-between items-center mb-4">
                        <h3 className="font-bold text-charcoal flex items-center gap-2">
                            <Users size={16} className="text-rust" /> Key Stakeholders
                        </h3>
                        <button onClick={onAddPoc} className="text-xs font-bold text-rust hover:underline flex items-center gap-1">
                            <Plus size={12} /> Add
                        </button>
                    </div>

                    <div className="space-y-3">
                        {pocs.length > 0 ? (
                            pocs.slice(0, 4).map(poc => (
                                <div key={poc.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center font-bold text-sm text-charcoal border border-stone-200">
                                            {poc.firstName?.charAt(0)}{poc.lastName?.charAt(0)}
                                        </div>
                                        <div>
                                            <div className="font-medium text-sm text-charcoal flex items-center gap-1">
                                                {poc.firstName} {poc.lastName}
                                                {poc.isPrimary && <Star size={10} className="text-amber-500 fill-amber-500" />}
                                            </div>
                                            <div className="text-xs text-stone-500">{poc.title || poc.role}</div>
                                        </div>
                                    </div>
                                    <div className="flex gap-1">
                                        {poc.email && <a href={`mailto:${poc.email}`}><Mail size={14} className="text-stone-400 hover:text-charcoal" /></a>}
                                        {poc.phone && <a href={`tel:${poc.phone}`}><Phone size={14} className="text-stone-400 hover:text-charcoal" /></a>}
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-stone-400 text-sm italic text-center py-4">No contacts yet</p>
                        )}
                    </div>

                    {pocs.length > 4 && (
                        <button onClick={() => onTabChange('contacts')} className="mt-3 text-xs font-bold text-rust hover:underline w-full text-center">
                            View all {pocs.length} contacts →
                        </button>
                    )}
                </div>
            </div>

            {/* Description */}
            {account.description && (
                <div className="bg-white p-6 rounded-xl border border-stone-200 shadow-sm">
                    <h3 className="font-bold text-charcoal mb-3 flex items-center gap-2">
                        <FileText size={16} className="text-rust" /> About
                    </h3>
                    <p className="text-stone-600 text-sm leading-relaxed">{account.description}</p>
                </div>
            )}
        </div>
    );
};

// ============================================
// CONTACTS TAB
// ============================================
const ContactsTab: React.FC<{
    accountId: string;
    accountName: string;
    pocs: DisplayPointOfContact[];
    isLoading: boolean;
    onAddPoc: () => void;
    onDeletePoc: (id: string) => Promise<unknown>;
    onSetPrimary: (pocId: string) => Promise<unknown>;
    isDeleting: boolean;
}> = ({ accountId: _accountId, accountName, pocs, isLoading, onAddPoc, onDeletePoc, onSetPrimary, isDeleting }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredPocs = pocs.filter(poc =>
        `${poc.firstName} ${poc.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poc.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        poc.title?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal">Contacts</h2>
                    <p className="text-sm text-stone-500">{pocs.length} contacts at {accountName}</p>
                </div>
                <button
                    onClick={onAddPoc}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-bold hover:bg-rust transition-colors"
                >
                    <Plus size={16} /> Add Contact
                </button>
            </div>

            {/* Search */}
            <div className="flex items-center gap-3 bg-white p-3 rounded-lg border border-stone-200">
                <Search size={16} className="text-stone-400" />
                <input
                    type="text"
                    placeholder="Search contacts..."
                    className="flex-1 bg-transparent outline-none text-sm"
                    value={searchTerm}
                    onChange={e => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Contacts Grid */}
            {isLoading ? (
                <div className="flex justify-center py-12">
                    <Loader2 className="w-8 h-8 animate-spin text-stone-400" />
                </div>
            ) : filteredPocs.length > 0 ? (
                <div className="grid gap-4">
                    {filteredPocs.map(poc => (
                        <div key={poc.id} className="bg-white p-5 rounded-xl border border-stone-200 hover:shadow-md transition-all">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center font-serif font-bold text-charcoal text-lg">
                                        {poc.firstName?.charAt(0)}{poc.lastName?.charAt(0)}
                                    </div>
                                    <div>
                                        <div className="font-bold text-charcoal flex items-center gap-2">
                                            {poc.firstName} {poc.lastName}
                                            {poc.isPrimary && (
                                                <span className="flex items-center gap-1 text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">
                                                    <Star size={10} className="fill-amber-500" /> Primary
                                                </span>
                                            )}
                                        </div>
                                        <div className="text-sm text-stone-500">{poc.title}</div>
                                        {poc.decisionAuthority && (
                                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded mt-1 inline-block">
                                                {poc.decisionAuthority}
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-center gap-1">
                                    {!poc.isPrimary && (
                                        <button onClick={() => onSetPrimary(poc.id)} className="p-2 text-stone-400 hover:text-amber-500" title="Set as primary">
                                            <Star size={16} />
                                        </button>
                                    )}
                                    <button onClick={() => onDeletePoc(poc.id)} disabled={isDeleting} className="p-2 text-stone-400 hover:text-red-500 disabled:opacity-50">
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-4 pt-4 border-t border-stone-100 flex flex-wrap gap-4 text-sm">
                                {poc.email && (
                                    <a href={`mailto:${poc.email}`} className="flex items-center gap-1 text-stone-600 hover:text-rust">
                                        <Mail size={14} /> {poc.email}
                                    </a>
                                )}
                                {poc.phone && (
                                    <a href={`tel:${poc.phone}`} className="flex items-center gap-1 text-stone-600 hover:text-rust">
                                        <Phone size={14} /> {poc.phone}
                                    </a>
                                )}
                                {poc.linkedinUrl && (
                                    <a href={poc.linkedinUrl} target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 text-stone-600 hover:text-blue-600">
                                        <Linkedin size={14} /> LinkedIn
                                    </a>
                                )}
                            </div>

                            {poc.notes && (
                                <div className="mt-3 text-sm text-stone-500 italic bg-stone-50 p-3 rounded-lg">&quot;{poc.notes}&quot;</div>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                    <Users size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-stone-500 mb-4">{searchTerm ? 'No contacts match your search' : 'No contacts added yet'}</p>
                    {!searchTerm && (
                        <button onClick={onAddPoc} className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors">
                            Add First Contact
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

// ============================================
// LEADS TAB
// ============================================
const LeadsTab: React.FC<{
    accountId: string;
    accountName: string;
    leads: Array<{ id: string; companyName: string; firstName: string; lastName: string; status: string; estimatedValue?: number }>;
    isLoading: boolean;
    onNewLead: () => void;
}> = ({ accountId: _accountId, accountName, leads, isLoading, onNewLead }) => {

    const statusColors: Record<string, string> = {
        new: 'bg-blue-100 text-blue-700',
        warm: 'bg-amber-100 text-amber-700',
        hot: 'bg-red-100 text-red-700',
        cold: 'bg-slate-100 text-slate-700',
        converted: 'bg-green-100 text-green-700',
        lost: 'bg-stone-100 text-stone-700',
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal">Leads</h2>
                    <p className="text-sm text-stone-500">{leads.length} leads linked to {accountName}</p>
                </div>
                <button onClick={onNewLead} className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-bold hover:bg-rust transition-colors">
                    <Plus size={16} /> New Lead
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>
            ) : leads.length > 0 ? (
                <div className="grid gap-3">
                    {leads.map(lead => (
                        <Link
                            key={lead.id}
                            href={`/employee/recruiting/leads/${lead.id}`}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:shadow-md hover:border-rust/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                                    <Target size={20} className="text-purple-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-charcoal group-hover:text-rust transition-colors">
                                        {lead.firstName} {lead.lastName}
                                    </div>
                                    <div className="text-sm text-stone-500">{lead.companyName}</div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {lead.estimatedValue && (
                                    <span className="text-sm font-medium text-green-600">${lead.estimatedValue.toLocaleString()}</span>
                                )}
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[lead.status] || 'bg-stone-100 text-stone-600'}`}>
                                    {lead.status}
                                </span>
                                <ChevronRight size={16} className="text-stone-300 group-hover:text-charcoal" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                    <Target size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-stone-500 mb-4">No leads for this account yet</p>
                    <button onClick={onNewLead} className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors">
                        Create First Lead
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================
// DEALS TAB
// ============================================
const DealsTab: React.FC<{
    accountId: string;
    accountName: string;
    deals: Array<{ id: string; title: string; value: string; stage: string }>;
    isLoading: boolean;
    onNewDeal: () => void;
}> = ({ accountId: _accountId, accountName, deals, isLoading, onNewDeal }) => {

    const stageColors: Record<string, string> = {
        discovery: 'bg-blue-100 text-blue-700',
        qualification: 'bg-indigo-100 text-indigo-700',
        proposal: 'bg-purple-100 text-purple-700',
        negotiation: 'bg-amber-100 text-amber-700',
        closed_won: 'bg-green-100 text-green-700',
        closed_lost: 'bg-red-100 text-red-700',
        prospect: 'bg-stone-100 text-stone-600',
        Discovery: 'bg-blue-100 text-blue-700',
        Proposal: 'bg-purple-100 text-purple-700',
        Negotiation: 'bg-amber-100 text-amber-700',
        Won: 'bg-green-100 text-green-700',
        Lost: 'bg-red-100 text-red-700',
    };

    const totalValue = deals.reduce((sum, d) => sum + (Number(d.value) || 0), 0);

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal">Deals</h2>
                    <p className="text-sm text-stone-500">
                        {deals.length} deals • ${totalValue.toLocaleString()} total pipeline
                    </p>
                </div>
                <button
                    onClick={onNewDeal}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-bold hover:bg-rust transition-colors"
                >
                    <Plus size={16} /> New Deal
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>
            ) : deals.length > 0 ? (
                <div className="grid gap-3">
                    {deals.map(deal => (
                        <Link
                            key={deal.id}
                            href={`/employee/recruiting/deals/${deal.id}`}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:shadow-md hover:border-rust/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                                    <Handshake size={20} className="text-green-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-charcoal group-hover:text-rust transition-colors">{deal.title}</div>
                                    <div className="text-sm text-stone-500">
                                        {deal.value && deal.value !== '0' ? `$${Number(deal.value).toLocaleString()}` : 'No value set'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${stageColors[deal.stage] || 'bg-stone-100 text-stone-600'}`}>
                                    {deal.stage.replace('_', ' ')}
                                </span>
                                <ChevronRight size={16} className="text-stone-300 group-hover:text-charcoal" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                    <Handshake size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-stone-500 mb-4">No deals yet for {accountName}</p>
                    <button onClick={onNewDeal} className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors">
                        Create First Deal
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================
// JOBS TAB
// ============================================
const JobsTab: React.FC<{
    accountId: string;
    accountName: string;
    jobs: Array<{ id: string; title: string; status: string; location?: string; jobType?: string }>;
    isLoading: boolean;
    onNewJob: () => void;
}> = ({ accountId: _accountId, accountName, jobs, isLoading, onNewJob }) => {

    const statusColors: Record<string, string> = {
        draft: 'bg-stone-100 text-stone-600',
        open: 'bg-green-100 text-green-700',
        on_hold: 'bg-amber-100 text-amber-700',
        filled: 'bg-blue-100 text-blue-700',
        closed: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal">Jobs</h2>
                    <p className="text-sm text-stone-500">
                        {jobs.length} jobs • {jobs.filter(j => j.status === 'open').length} currently open
                    </p>
                </div>
                <button
                    onClick={onNewJob}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-bold hover:bg-rust transition-colors"
                >
                    <Plus size={16} /> New Job
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>
            ) : jobs.length > 0 ? (
                <div className="grid gap-3">
                    {jobs.map(job => (
                        <Link
                            key={job.id}
                            href={`/employee/recruiting/jobs/${job.id}`}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:shadow-md hover:border-rust/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                                    <Briefcase size={20} className="text-amber-600" />
                                </div>
                                <div>
                                    <div className="font-bold text-charcoal group-hover:text-rust transition-colors">{job.title}</div>
                                    <div className="text-sm text-stone-500 flex items-center gap-2">
                                        {job.location && <span className="flex items-center gap-1"><MapPin size={12} /> {job.location}</span>}
                                        {job.jobType && <span>• {job.jobType}</span>}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[job.status] || 'bg-stone-100 text-stone-600'}`}>
                                    {job.status.replace('_', ' ')}
                                </span>
                                <ChevronRight size={16} className="text-stone-300 group-hover:text-charcoal" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                    <Briefcase size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-stone-500 mb-4">No jobs yet for {accountName}</p>
                    <button onClick={onNewJob} className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors">
                        Create First Job
                    </button>
                </div>
            )}
        </div>
    );
};

// ============================================
// TALENT TAB
// ============================================
const TalentTab: React.FC<{ accountId: string; accountName: string }> = ({ accountId, accountName }) => {
    const [activeFilter, setActiveFilter] = useState<'all' | 'submitted' | 'interviewing' | 'placed'>('all');
    const [showAddTalentModal, setShowAddTalentModal] = useState(false);
    const [showLinkCandidateModal, setShowLinkCandidateModal] = useState(false);

    // Fetch submissions for this account
    const submissionsQuery = trpc.ats.submissions.listByAccount.useQuery(
        { accountId, limit: 100 },
        { enabled: !!accountId }
    );

    // Fetch placements for this account
    const placementsQuery = trpc.ats.placements.listByAccount.useQuery(
        { accountId, limit: 50 },
        { enabled: !!accountId }
    );

    const submissions = useMemo(() => submissionsQuery.data || [], [submissionsQuery.data]);
    const placements = useMemo(() => placementsQuery.data || [], [placementsQuery.data]);
    const isLoading = submissionsQuery.isLoading || placementsQuery.isLoading;

    const refetchAll = () => {
        submissionsQuery.refetch();
        placementsQuery.refetch();
    };

    // Filter submissions based on active filter
    const filteredSubmissions = useMemo(() => {
        if (activeFilter === 'all') return submissions;
        if (activeFilter === 'submitted') return submissions.filter(s => ['submitted_to_client', 'client_review'].includes(s.status));
        if (activeFilter === 'interviewing') return submissions.filter(s => s.status === 'client_interview');
        if (activeFilter === 'placed') return submissions.filter(s => s.status === 'placed');
        return submissions;
    }, [submissions, activeFilter]);

    const statusColors: Record<string, string> = {
        sourced: 'bg-stone-100 text-stone-600',
        screening: 'bg-blue-100 text-blue-700',
        submission_ready: 'bg-indigo-100 text-indigo-700',
        submitted_to_client: 'bg-purple-100 text-purple-700',
        client_review: 'bg-amber-100 text-amber-700',
        client_interview: 'bg-orange-100 text-orange-700',
        offer_stage: 'bg-emerald-100 text-emerald-700',
        placed: 'bg-green-100 text-green-700',
        rejected: 'bg-red-100 text-red-700',
    };

    const stats = {
        total: submissions.length,
        submitted: submissions.filter(s => ['submitted_to_client', 'client_review'].includes(s.status)).length,
        interviewing: submissions.filter(s => s.status === 'client_interview').length,
        placed: placements.filter(p => p.status === 'active').length,
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal">Talent Pool</h2>
                    <p className="text-sm text-stone-500">Candidates submitted or placed at {accountName}</p>
                </div>
                <div className="flex gap-2">
                    <button
                        onClick={() => setShowLinkCandidateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-white border border-stone-300 text-charcoal rounded-lg text-sm font-medium hover:bg-stone-50 transition-colors"
                    >
                        <Search size={16} /> Link Existing
                    </button>
                    <button
                        onClick={() => setShowAddTalentModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-bold hover:bg-rust transition-colors"
                    >
                        <Plus size={16} /> Add Candidate
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-4 gap-3">
                {[
                    { label: 'Total', value: stats.total, filter: 'all' as const, color: 'bg-stone-100' },
                    { label: 'Submitted', value: stats.submitted, filter: 'submitted' as const, color: 'bg-purple-100' },
                    { label: 'Interviewing', value: stats.interviewing, filter: 'interviewing' as const, color: 'bg-orange-100' },
                    { label: 'Placed', value: stats.placed, filter: 'placed' as const, color: 'bg-green-100' },
                ].map(stat => (
                    <button
                        key={stat.label}
                        onClick={() => setActiveFilter(stat.filter)}
                        className={`p-3 rounded-xl border transition-all ${
                            activeFilter === stat.filter
                                ? 'border-rust bg-rust/5 shadow-sm'
                                : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                    >
                        <div className="text-2xl font-bold text-charcoal">{stat.value}</div>
                        <div className="text-xs text-stone-500">{stat.label}</div>
                    </button>
                ))}
            </div>

            {/* Submissions List */}
            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>
            ) : filteredSubmissions.length > 0 ? (
                <div className="space-y-3">
                    {filteredSubmissions.map(submission => (
                        <Link
                            key={submission.id}
                            href={`/employee/recruiting/submissions/${submission.id}`}
                            className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:shadow-md hover:border-rust/30 transition-all group"
                        >
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 bg-stone-100 rounded-full flex items-center justify-center font-bold text-charcoal">
                                    {submission.candidateName?.split(' ').map(n => n[0]).join('') || 'C'}
                                </div>
                                <div>
                                    <div className="font-bold text-charcoal group-hover:text-rust transition-colors">
                                        {submission.candidateName || 'Unknown Candidate'}
                                    </div>
                                    <div className="text-sm text-stone-500 flex items-center gap-2">
                                        <Briefcase size={12} /> {submission.jobTitle || 'No Job'}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                {submission.aiMatchScore && (
                                    <div className="flex items-center gap-1 text-sm">
                                        <BarChart3 size={14} className="text-stone-400" />
                                        <span className={`font-bold ${
                                            submission.aiMatchScore >= 80 ? 'text-green-600' :
                                            submission.aiMatchScore >= 60 ? 'text-amber-600' : 'text-stone-500'
                                        }`}>
                                            {submission.aiMatchScore}%
                                        </span>
                                    </div>
                                )}
                                <span className={`px-2 py-1 rounded text-xs font-bold uppercase ${statusColors[submission.status] || 'bg-stone-100 text-stone-600'}`}>
                                    {submission.status.replace(/_/g, ' ')}
                                </span>
                                <ChevronRight size={16} className="text-stone-300 group-hover:text-charcoal" />
                            </div>
                        </Link>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                    <UserCheck size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-stone-500 mb-2">
                        {activeFilter === 'all' ? 'No candidates submitted to this account yet' : `No ${activeFilter} candidates`}
                    </p>
                    <p className="text-xs text-stone-400 mb-4">Add talent to build your account&apos;s candidate pool</p>
                    <button
                        onClick={() => setShowAddTalentModal(true)}
                        className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors"
                    >
                        Add First Candidate
                    </button>
                </div>
            )}

            {/* Active Placements Section */}
            {placements.length > 0 && (
                <div className="mt-6">
                    <h3 className="font-bold text-charcoal mb-3 flex items-center gap-2">
                        <Award size={16} className="text-green-600" /> Active Placements ({placements.filter(p => p.status === 'active').length})
                    </h3>
                    <div className="grid gap-3">
                        {placements.filter(p => p.status === 'active').map(placement => (
                            <div key={placement.id} className="p-4 bg-green-50 rounded-xl border border-green-200">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-green-100 rounded-full flex items-center justify-center">
                                            <Award size={20} className="text-green-600" />
                                        </div>
                                        <div>
                                            <div className="font-bold text-charcoal">{placement.candidateName}</div>
                                            <div className="text-sm text-stone-500">{placement.jobTitle}</div>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-sm font-bold text-green-600">
                                            ${Number(placement.billRate).toLocaleString()}/hr
                                        </div>
                                        <div className="text-xs text-stone-400">
                                            Started {new Date(placement.startDate).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Add Talent Modal */}
            {showAddTalentModal && (
                <AddTalentModal
                    accountId={accountId}
                    accountName={accountName}
                    onClose={() => setShowAddTalentModal(false)}
                    onSuccess={() => {
                        setShowAddTalentModal(false);
                        refetchAll();
                    }}
                />
            )}

            {/* Link Existing Candidate Modal */}
            {showLinkCandidateModal && (
                <LinkCandidateModal
                    accountId={accountId}
                    onClose={() => setShowLinkCandidateModal(false)}
                    onSuccess={() => {
                        setShowLinkCandidateModal(false);
                        refetchAll();
                    }}
                />
            )}
        </div>
    );
};

// ============================================
// ADD TALENT MODAL (Senior Bench Specialist Fields)
// ============================================
const AddTalentModal: React.FC<{
    accountId: string;
    accountName: string;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ accountId, accountName, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [skillsInput, setSkillsInput] = useState('');

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        candidateSkills: [] as string[],
        candidateExperienceYears: 5,
        candidateCurrentVisa: 'H1B' as 'H1B' | 'GC' | 'USC' | 'OPT' | 'CPT' | 'TN' | 'L1' | 'EAD' | 'Other',
        candidateVisaExpiry: '',
        candidateHourlyRate: 0,
        candidateAvailability: 'immediate' as 'immediate' | '2_weeks' | '1_month',
        candidateLocation: '',
        candidateWillingToRelocate: false,
        submissionNotes: '',
    });

    const createCandidate = trpc.ats.candidates.create.useMutation({
        onSuccess: () => {
            onSuccess();
        },
        onError: (err) => {
            setError(err.message);
            setIsSubmitting(false);
        },
    });

    const handleAddSkill = () => {
        const skill = skillsInput.trim();
        if (skill && !form.candidateSkills.includes(skill)) {
            setForm(f => ({ ...f, candidateSkills: [...f.candidateSkills, skill] }));
            setSkillsInput('');
        }
    };

    const handleRemoveSkill = (skill: string) => {
        setForm(f => ({ ...f, candidateSkills: f.candidateSkills.filter(s => s !== skill) }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!form.firstName || !form.lastName || !form.email) {
            setError('Please fill in all required fields');
            return;
        }

        if (form.candidateSkills.length === 0) {
            setError('Please add at least one skill');
            return;
        }

        setIsSubmitting(true);

        createCandidate.mutate({
            ...form,
            candidateVisaExpiry: form.candidateVisaExpiry ? new Date(form.candidateVisaExpiry) : undefined,
            candidateHourlyRate: form.candidateHourlyRate || undefined,
            accountId,
        });
    };

    const visaTypes = [
        { value: 'H1B', label: 'H-1B' },
        { value: 'GC', label: 'Green Card' },
        { value: 'USC', label: 'US Citizen' },
        { value: 'OPT', label: 'OPT' },
        { value: 'CPT', label: 'CPT' },
        { value: 'TN', label: 'TN Visa' },
        { value: 'L1', label: 'L-1' },
        { value: 'EAD', label: 'EAD' },
        { value: 'Other', label: 'Other' },
    ];

    const availabilityOptions = [
        { value: 'immediate', label: 'Immediate' },
        { value: '2_weeks', label: '2 Weeks Notice' },
        { value: '1_month', label: '1 Month Notice' },
    ];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
                <div className="sticky top-0 bg-white border-b border-stone-200 p-4 flex justify-between items-center">
                    <div>
                        <h2 className="text-xl font-serif font-bold text-charcoal">Add Candidate</h2>
                        <p className="text-sm text-stone-500">Adding to {accountName}&apos;s talent pool</p>
                    </div>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg">
                        <X size={20} className="text-stone-500" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {/* Personal Info Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-charcoal flex items-center gap-2">
                            <Users size={16} className="text-rust" /> Personal Information
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">First Name *</label>
                                <input
                                    type="text"
                                    value={form.firstName}
                                    onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                    placeholder="John"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Last Name *</label>
                                <input
                                    type="text"
                                    value={form.lastName}
                                    onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                    placeholder="Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Email *</label>
                                <input
                                    type="email"
                                    value={form.email}
                                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                    placeholder="john.doe@email.com"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Phone</label>
                                <input
                                    type="tel"
                                    value={form.phone}
                                    onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                    placeholder="+1 (555) 123-4567"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Skills Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-charcoal flex items-center gap-2">
                            <Zap size={16} className="text-rust" /> Skills & Experience
                        </h3>
                        <div>
                            <label className="block text-xs font-bold text-stone-600 mb-1">Technical Skills *</label>
                            <div className="flex gap-2">
                                <input
                                    type="text"
                                    value={skillsInput}
                                    onChange={e => setSkillsInput(e.target.value)}
                                    onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), handleAddSkill())}
                                    className="flex-1 px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                    placeholder="e.g., Java, AWS, React, Python"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddSkill}
                                    className="px-4 py-2 bg-stone-100 text-charcoal rounded-lg hover:bg-stone-200 font-medium"
                                >
                                    Add
                                </button>
                            </div>
                            {form.candidateSkills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mt-2">
                                    {form.candidateSkills.map(skill => (
                                        <span
                                            key={skill}
                                            className="inline-flex items-center gap-1 px-2 py-1 bg-rust/10 text-rust rounded text-sm"
                                        >
                                            {skill}
                                            <button type="button" onClick={() => handleRemoveSkill(skill)} className="hover:text-red-700">
                                                <X size={14} />
                                            </button>
                                        </span>
                                    ))}
                                </div>
                            )}
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Years of Experience</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={form.candidateExperienceYears}
                                    onChange={e => setForm(f => ({ ...f, candidateExperienceYears: parseInt(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Hourly Rate ($)</label>
                                <input
                                    type="number"
                                    min="0"
                                    value={form.candidateHourlyRate || ''}
                                    onChange={e => setForm(f => ({ ...f, candidateHourlyRate: parseFloat(e.target.value) || 0 }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                    placeholder="85"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Immigration Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-charcoal flex items-center gap-2">
                            <Globe size={16} className="text-rust" /> Immigration Status
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Visa Type *</label>
                                <select
                                    value={form.candidateCurrentVisa}
                                    onChange={e => setForm(f => ({ ...f, candidateCurrentVisa: e.target.value as typeof form.candidateCurrentVisa }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust bg-white"
                                >
                                    {visaTypes.map(v => (
                                        <option key={v.value} value={v.value}>{v.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Visa Expiry</label>
                                <input
                                    type="date"
                                    value={form.candidateVisaExpiry}
                                    onChange={e => setForm(f => ({ ...f, candidateVisaExpiry: e.target.value }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Availability Section */}
                    <div className="space-y-4">
                        <h3 className="font-bold text-charcoal flex items-center gap-2">
                            <Clock size={16} className="text-rust" /> Availability & Location
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Availability *</label>
                                <select
                                    value={form.candidateAvailability}
                                    onChange={e => setForm(f => ({ ...f, candidateAvailability: e.target.value as typeof form.candidateAvailability }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust bg-white"
                                >
                                    {availabilityOptions.map(a => (
                                        <option key={a.value} value={a.value}>{a.label}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-600 mb-1">Current Location</label>
                                <input
                                    type="text"
                                    value={form.candidateLocation}
                                    onChange={e => setForm(f => ({ ...f, candidateLocation: e.target.value }))}
                                    className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                    placeholder="e.g., New York, NY"
                                />
                            </div>
                        </div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.candidateWillingToRelocate}
                                onChange={e => setForm(f => ({ ...f, candidateWillingToRelocate: e.target.checked }))}
                                className="w-4 h-4 text-rust border-stone-300 rounded focus:ring-rust"
                            />
                            <span className="text-sm text-stone-600">Willing to relocate</span>
                        </label>
                    </div>

                    {/* Notes Section */}
                    <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">Notes</label>
                        <textarea
                            value={form.submissionNotes}
                            onChange={e => setForm(f => ({ ...f, submissionNotes: e.target.value }))}
                            rows={3}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust resize-none"
                            placeholder="Any additional notes about this candidate..."
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="flex items-center gap-2 px-6 py-2 bg-charcoal text-white rounded-lg font-bold hover:bg-rust transition-colors disabled:opacity-50"
                        >
                            {isSubmitting ? <Loader2 size={16} className="animate-spin" /> : <Plus size={16} />}
                            Add Candidate
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// ============================================
// LINK CANDIDATE MODAL (Search & Link Existing)
// ============================================
const LinkCandidateModal: React.FC<{
    accountId: string;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ accountId, onClose, onSuccess }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [error, setError] = useState<string | null>(null);

    const searchResults = trpc.ats.candidates.search.useQuery(
        { query: searchQuery, limit: 10 },
        { enabled: searchQuery.length >= 2 }
    );

    const linkCandidate = trpc.ats.candidates.linkToAccount.useMutation({
        onSuccess: () => {
            onSuccess();
        },
        onError: (err) => {
            setError(err.message);
        },
    });

    const handleLink = () => {
        if (!selectedCandidate) {
            setError('Please select a candidate');
            return;
        }
        setError(null);
        linkCandidate.mutate({
            candidateId: selectedCandidate,
            accountId,
            notes,
        });
    };

    const candidates = searchResults.data || [];

    return (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg">
                <div className="border-b border-stone-200 p-4 flex justify-between items-center">
                    <h2 className="text-xl font-serif font-bold text-charcoal">Link Existing Candidate</h2>
                    <button onClick={onClose} className="p-2 hover:bg-stone-100 rounded-lg">
                        <X size={20} className="text-stone-500" />
                    </button>
                </div>

                <div className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm flex items-center gap-2">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">Search Candidates</label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                            <input
                                type="text"
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust"
                                placeholder="Search by name, email, or skill..."
                            />
                        </div>
                    </div>

                    {searchQuery.length >= 2 && (
                        <div className="max-h-60 overflow-y-auto border border-stone-200 rounded-lg divide-y divide-stone-100">
                            {searchResults.isLoading ? (
                                <div className="p-4 text-center text-stone-500">
                                    <Loader2 className="w-5 h-5 animate-spin mx-auto" />
                                </div>
                            ) : candidates.length > 0 ? (
                                candidates.map(candidate => (
                                    <button
                                        key={candidate.id}
                                        onClick={() => setSelectedCandidate(candidate.id)}
                                        className={`w-full p-3 text-left hover:bg-stone-50 transition-colors ${
                                            selectedCandidate === candidate.id ? 'bg-rust/5 border-l-2 border-rust' : ''
                                        }`}
                                    >
                                        <div className="font-medium text-charcoal">{candidate.fullName}</div>
                                        <div className="text-sm text-stone-500 flex items-center gap-2">
                                            <span>{candidate.email}</span>
                                            {candidate.candidateCurrentVisa && (
                                                <span className="px-1.5 py-0.5 bg-stone-100 rounded text-xs">
                                                    {candidate.candidateCurrentVisa}
                                                </span>
                                            )}
                                        </div>
                                        {candidate.candidateSkills && candidate.candidateSkills.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {candidate.candidateSkills.slice(0, 3).map(skill => (
                                                    <span key={skill} className="text-xs bg-stone-100 text-stone-600 px-1.5 py-0.5 rounded">
                                                        {skill}
                                                    </span>
                                                ))}
                                                {candidate.candidateSkills.length > 3 && (
                                                    <span className="text-xs text-stone-400">+{candidate.candidateSkills.length - 3}</span>
                                                )}
                                            </div>
                                        )}
                                    </button>
                                ))
                            ) : (
                                <div className="p-4 text-center text-stone-500 text-sm">
                                    No candidates found
                                </div>
                            )}
                        </div>
                    )}

                    <div>
                        <label className="block text-xs font-bold text-stone-600 mb-1">Notes (Optional)</label>
                        <textarea
                            value={notes}
                            onChange={e => setNotes(e.target.value)}
                            rows={2}
                            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:border-rust resize-none"
                            placeholder="Any notes about this candidate for this account..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-stone-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-stone-600 hover:bg-stone-100 rounded-lg font-medium"
                        >
                            Cancel
                        </button>
                        <button
                            onClick={handleLink}
                            disabled={!selectedCandidate || linkCandidate.isPending}
                            className="flex items-center gap-2 px-6 py-2 bg-charcoal text-white rounded-lg font-bold hover:bg-rust transition-colors disabled:opacity-50"
                        >
                            {linkCandidate.isPending ? <Loader2 size={16} className="animate-spin" /> : <Handshake size={16} />}
                            Link Candidate
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// DOCUMENTS TAB
// ============================================
interface DocumentFile {
    id: string;
    bucket: string;
    filePath: string;
    fileName: string;
    fileSize: number;
    mimeType: string;
    entityType: string | null;
    entityId: string | null;
    uploadedBy: string;
    uploadedAt: Date;
    metadata: unknown;
    uploaderName: string | null;
}

const DocumentsTab: React.FC<{ accountId: string; accountName: string }> = ({ accountId, accountName }) => {
    const [dragOver, setDragOver] = useState(false);
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
    const [showUploadModal, setShowUploadModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [editingDoc, setEditingDoc] = useState<DocumentFile | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);
    const [isUploading, setIsUploading] = useState(false);
    const fileInputRef = React.useRef<HTMLInputElement>(null);

    // Fetch documents from database
    const { data: documents = [], isLoading, refetch } = trpc.files.list.useQuery({
        entityType: 'account',
        entityId: accountId,
        limit: 100,
    });

    // Mutations
    const getUploadUrl = trpc.files.getUploadUrl.useMutation();
    const recordUpload = trpc.files.recordUpload.useMutation({
        onSuccess: () => refetch(),
    });
    const getDownloadUrlMutation = trpc.files.getDownloadUrl.useMutation();
    const deleteFile = trpc.files.delete.useMutation({
        onSuccess: () => refetch(),
    });
    const updateMetadata = trpc.files.updateMetadata.useMutation({
        onSuccess: () => refetch(),
    });

    const documentCategories = [
        { key: 'contract', label: 'Contracts', icon: FileText, color: 'bg-blue-100 text-blue-600' },
        { key: 'sow', label: 'SOWs', icon: File, color: 'bg-green-100 text-green-600' },
        { key: 'nda', label: 'NDAs', icon: FileText, color: 'bg-purple-100 text-purple-600' },
        { key: 'proposal', label: 'Proposals', icon: Send, color: 'bg-amber-100 text-amber-600' },
        { key: 'invoice', label: 'Invoices', icon: DollarSign, color: 'bg-emerald-100 text-emerald-600' },
        { key: 'other', label: 'Other', icon: File, color: 'bg-stone-100 text-stone-600' },
    ];

    const handleFileDrop = (e: React.DragEvent) => {
        e.preventDefault();
        setDragOver(false);
        const files = Array.from(e.dataTransfer.files);
        handleFilesSelected(files);
    };

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = e.target.files ? Array.from(e.target.files) : [];
        handleFilesSelected(files);
    };

    const handleFilesSelected = (files: File[]) => {
        // Filter valid files (under 10MB)
        const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
        if (validFiles.length < files.length) {
            alert('Some files exceeded the 10MB limit and were not added.');
        }
        if (validFiles.length > 0) {
            setPendingFiles(validFiles);
            setShowUploadModal(true);
        }
    };

    const handleUploadWithMetadata = async (metadata: { category: string; description?: string; tags?: string[] }) => {
        setIsUploading(true);
        try {
            for (const file of pendingFiles) {
                // Get presigned upload URL
                const { uploadUrl, filePath, bucket } = await getUploadUrl.mutateAsync({
                    fileName: file.name,
                    mimeType: file.type || 'application/octet-stream',
                    entityType: 'account',
                    entityId: accountId,
                });

                // Upload file to storage
                const uploadResponse = await fetch(uploadUrl, {
                    method: 'PUT',
                    body: file,
                    headers: {
                        'Content-Type': file.type || 'application/octet-stream',
                    },
                });

                if (!uploadResponse.ok) {
                    throw new Error(`Failed to upload ${file.name}`);
                }

                // Record upload in database with metadata
                await recordUpload.mutateAsync({
                    bucket,
                    filePath,
                    fileName: file.name,
                    fileSize: file.size,
                    mimeType: file.type || 'application/octet-stream',
                    entityType: 'account',
                    entityId: accountId,
                    metadata: {
                        category: metadata.category,
                        description: metadata.description || '',
                        tags: metadata.tags || [],
                    },
                });
            }
            setPendingFiles([]);
            setShowUploadModal(false);
        } catch (error) {
            console.error('Upload error:', error);
            alert('Failed to upload some files. Please try again.');
        } finally {
            setIsUploading(false);
        }
    };

    const handleDownload = async (fileId: string) => {
        try {
            const { url, fileName } = await getDownloadUrlMutation.mutateAsync({ fileId });
            // Open in new tab or trigger download
            const link = document.createElement('a');
            link.href = url;
            link.download = fileName;
            link.target = '_blank';
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        } catch (error) {
            console.error('Download error:', error);
            alert('Failed to download file');
        }
    };

    const handleDelete = async (fileId: string, fileName: string) => {
        if (confirm(`Delete "${fileName}"? This cannot be undone.`)) {
            try {
                await deleteFile.mutateAsync({ fileId });
            } catch (error) {
                console.error('Delete error:', error);
                alert('Failed to delete file');
            }
        }
    };

    const handleEditMetadata = (doc: DocumentFile) => {
        setEditingDoc(doc);
        setShowEditModal(true);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const getFileIcon = (mimeType: string) => {
        if (mimeType.includes('pdf')) return <FileText size={20} className="text-red-500" />;
        if (mimeType.includes('word') || mimeType.includes('document')) return <FileText size={20} className="text-blue-500" />;
        if (mimeType.includes('sheet') || mimeType.includes('excel')) return <FileText size={20} className="text-green-500" />;
        if (mimeType.includes('presentation') || mimeType.includes('powerpoint')) return <FileText size={20} className="text-orange-500" />;
        return <File size={20} className="text-stone-500" />;
    };

    const getMetadata = (doc: DocumentFile): { category?: string; description?: string; tags?: string[] } | null => {
        if (doc.metadata && typeof doc.metadata === 'object' && doc.metadata !== null) {
            return doc.metadata as { category?: string; description?: string; tags?: string[] };
        }
        return null;
    };

    const filteredDocs = selectedCategory
        ? documents.filter(d => {
            const meta = getMetadata(d);
            return meta?.category === selectedCategory;
        })
        : documents;

    const getCategoryCount = (key: string) => documents.filter(d => {
        const meta = getMetadata(d);
        return meta?.category === key;
    }).length;

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal">Documents</h2>
                    <p className="text-sm text-stone-500">Contracts, SOWs, and files for {accountName}</p>
                </div>
                <button
                    onClick={() => fileInputRef.current?.click()}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-bold hover:bg-rust transition-colors"
                >
                    <Upload size={16} /> Upload
                </button>
                <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.zip"
                    className="hidden"
                    onChange={handleFileSelect}
                />
            </div>

            {/* Upload Area */}
            <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors cursor-pointer ${
                    dragOver ? 'border-rust bg-rust/5' : 'border-stone-200 bg-white hover:border-stone-300'
                }`}
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleFileDrop}
                onClick={() => fileInputRef.current?.click()}
            >
                <Upload size={32} className="mx-auto text-stone-400 mb-3" />
                <p className="text-stone-600 font-medium mb-1">Drop files here or click to upload</p>
                <p className="text-xs text-stone-400">PDF, DOC, XLS, PPT up to 10MB</p>
            </div>

            {/* Document Categories */}
            <div className="grid grid-cols-6 gap-3">
                {documentCategories.map(cat => (
                    <button
                        key={cat.key}
                        onClick={() => setSelectedCategory(selectedCategory === cat.key ? null : cat.key)}
                        className={`p-3 rounded-xl border text-center transition-all ${
                            selectedCategory === cat.key
                                ? 'border-rust bg-rust/5 shadow-sm'
                                : 'border-stone-200 bg-white hover:border-stone-300'
                        }`}
                    >
                        <div className={`w-8 h-8 rounded-lg ${cat.color} flex items-center justify-center mx-auto mb-2`}>
                            <cat.icon size={16} />
                        </div>
                        <div className="text-xs font-medium text-charcoal">{cat.label}</div>
                        <div className="text-[10px] text-stone-400">{getCategoryCount(cat.key)} files</div>
                    </button>
                ))}
            </div>

            {/* Documents List */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <Loader2 className="animate-spin text-stone-400" size={32} />
                </div>
            ) : filteredDocs.length > 0 ? (
                <div className="space-y-2">
                    {filteredDocs.map(doc => {
                        const meta = doc.metadata as { category?: string; description?: string; tags?: string[] } | null;
                        return (
                            <div key={doc.id} className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:shadow-sm transition-all group">
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 bg-stone-100 rounded-lg flex items-center justify-center">
                                        {getFileIcon(doc.mimeType)}
                                    </div>
                                    <div>
                                        <div className="font-medium text-charcoal">{doc.fileName}</div>
                                        <div className="text-xs text-stone-400 flex items-center gap-2">
                                            <span>{formatFileSize(doc.fileSize)}</span>
                                            <span>•</span>
                                            <span>Uploaded {new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                            {doc.uploaderName && (
                                                <>
                                                    <span>•</span>
                                                    <span>by {doc.uploaderName}</span>
                                                </>
                                            )}
                                        </div>
                                        {meta?.description && (
                                            <div className="text-xs text-stone-500 mt-1 italic">{meta.description}</div>
                                        )}
                                        {meta?.tags && meta.tags.length > 0 && (
                                            <div className="flex gap-1 mt-1">
                                                {meta.tags.map((tag, i) => (
                                                    <span key={i} className="px-1.5 py-0.5 bg-blue-50 text-blue-600 text-[10px] rounded">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    {meta?.category && (
                                        <span className="px-2 py-1 bg-stone-100 text-stone-600 text-xs rounded font-medium capitalize">
                                            {meta.category}
                                        </span>
                                    )}
                                    <button
                                        onClick={() => handleDownload(doc.id)}
                                        className="p-2 text-stone-400 hover:text-charcoal transition-colors opacity-0 group-hover:opacity-100"
                                        title="Download"
                                    >
                                        <Download size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleEditMetadata(doc)}
                                        className="p-2 text-stone-400 hover:text-charcoal transition-colors opacity-0 group-hover:opacity-100"
                                        title="Edit Details"
                                    >
                                        <Edit2 size={16} />
                                    </button>
                                    <button
                                        onClick={() => handleDelete(doc.id, doc.fileName)}
                                        className="p-2 text-stone-400 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                                        title="Delete"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            ) : (
                <div className="text-center py-8 bg-stone-50 rounded-xl">
                    <FileText size={32} className="mx-auto text-stone-300 mb-2" />
                    <p className="text-stone-500 text-sm">
                        {selectedCategory ? `No ${selectedCategory} documents uploaded yet` : 'No documents uploaded yet'}
                    </p>
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        className="mt-3 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors"
                    >
                        Upload First Document
                    </button>
                </div>
            )}

            {/* Upload Modal with Metadata */}
            {showUploadModal && (
                <DocumentUploadModal
                    files={pendingFiles}
                    categories={documentCategories}
                    isUploading={isUploading}
                    onUpload={handleUploadWithMetadata}
                    onCancel={() => { setShowUploadModal(false); setPendingFiles([]); }}
                />
            )}

            {/* Edit Metadata Modal */}
            {showEditModal && editingDoc && (
                <DocumentEditModal
                    document={editingDoc}
                    categories={documentCategories}
                    onSave={async (metadata) => {
                        try {
                            await updateMetadata.mutateAsync({
                                fileId: editingDoc.id,
                                metadata: {
                                    category: metadata.category,
                                    description: metadata.description || '',
                                    tags: metadata.tags || [],
                                },
                            });
                            setShowEditModal(false);
                            setEditingDoc(null);
                        } catch (error) {
                            console.error('Failed to update metadata:', error);
                            alert('Failed to update document details');
                        }
                    }}
                    onCancel={() => { setShowEditModal(false); setEditingDoc(null); }}
                />
            )}
        </div>
    );
};

// Document Upload Modal Component
const DocumentUploadModal: React.FC<{
    files: File[];
    categories: Array<{ key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }>;
    isUploading: boolean;
    onUpload: (metadata: { category: string; description?: string; tags?: string[] }) => void;
    onCancel: () => void;
}> = ({ files, categories, isUploading, onUpload, onCancel }) => {
    const [category, setCategory] = useState('other');
    const [description, setDescription] = useState('');
    const [tagsInput, setTagsInput] = useState('');

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    const handleSubmit = () => {
        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
        onUpload({ category, description: description || undefined, tags: tags.length > 0 ? tags : undefined });
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-serif font-bold text-charcoal">Upload Documents</h2>
                        <button onClick={onCancel} className="text-stone-400 hover:text-charcoal">
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-sm text-stone-500 mt-1">{files.length} file(s) selected</p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Files Preview */}
                    <div className="space-y-2 max-h-32 overflow-y-auto">
                        {files.map((file, i) => (
                            <div key={i} className="flex items-center gap-3 p-2 bg-stone-50 rounded-lg">
                                <FileText size={16} className="text-stone-400" />
                                <span className="text-sm text-charcoal truncate flex-1">{file.name}</span>
                                <span className="text-xs text-stone-400">{formatFileSize(file.size)}</span>
                            </div>
                        ))}
                    </div>

                    {/* Category Selection */}
                    <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                            Category *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => setCategory(cat.key)}
                                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                                        category === cat.key
                                            ? 'border-rust bg-rust/10 text-rust'
                                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                            Description (Optional)
                        </label>
                        <textarea
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:border-rust"
                            rows={2}
                            placeholder="Brief description of the document..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                            Tags (Optional, comma separated)
                        </label>
                        <input
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                            placeholder="e.g. Q4 2024, Renewal, Amendment"
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-stone-100 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        disabled={isUploading}
                        className="px-4 py-2 text-stone-600 hover:text-charcoal transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        disabled={isUploading}
                        className="px-6 py-2 bg-charcoal text-white rounded-lg font-bold hover:bg-rust transition-colors disabled:opacity-50 flex items-center gap-2"
                    >
                        {isUploading ? (
                            <>
                                <Loader2 size={16} className="animate-spin" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload size={16} />
                                Upload
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

// Document Edit Modal Component
const DocumentEditModal: React.FC<{
    document: DocumentFile;
    categories: Array<{ key: string; label: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }>;
    onSave: (metadata: { category: string; description?: string; tags?: string[] }) => void;
    onCancel: () => void;
}> = ({ document, categories, onSave, onCancel }) => {
    const meta = (document.metadata && typeof document.metadata === 'object' && document.metadata !== null)
        ? document.metadata as { category?: string; description?: string; tags?: string[] }
        : null;
    const [category, setCategory] = useState(meta?.category || 'other');
    const [description, setDescription] = useState(meta?.description || '');
    const [tagsInput, setTagsInput] = useState((meta?.tags || []).join(', '));

    const handleSubmit = () => {
        const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
        onSave({ category, description: description || undefined, tags: tags.length > 0 ? tags : undefined });
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
                <div className="p-6 border-b border-stone-100">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-serif font-bold text-charcoal">Edit Document Details</h2>
                        <button onClick={onCancel} className="text-stone-400 hover:text-charcoal">
                            <X size={24} />
                        </button>
                    </div>
                    <p className="text-sm text-stone-500 mt-1">{document.fileName}</p>
                </div>

                <div className="p-6 space-y-4">
                    {/* Category Selection */}
                    <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                            Category *
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                            {categories.map(cat => (
                                <button
                                    key={cat.key}
                                    type="button"
                                    onClick={() => setCategory(cat.key)}
                                    className={`p-2 rounded-lg border text-center text-xs font-medium transition-all ${
                                        category === cat.key
                                            ? 'border-rust bg-rust/10 text-rust'
                                            : 'border-stone-200 text-stone-600 hover:border-stone-300'
                                    }`}
                                >
                                    {cat.label}
                                </button>
                            ))}
                        </div>
                    </div>

                    {/* Description */}
                    <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                            Description
                        </label>
                        <textarea
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm resize-none focus:outline-none focus:border-rust"
                            rows={2}
                            placeholder="Brief description of the document..."
                            value={description}
                            onChange={e => setDescription(e.target.value)}
                        />
                    </div>

                    {/* Tags */}
                    <div>
                        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                            Tags (comma separated)
                        </label>
                        <input
                            className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                            placeholder="e.g. Q4 2024, Renewal, Amendment"
                            value={tagsInput}
                            onChange={e => setTagsInput(e.target.value)}
                        />
                    </div>
                </div>

                <div className="p-6 border-t border-stone-100 flex justify-end gap-3">
                    <button
                        onClick={onCancel}
                        className="px-4 py-2 text-stone-600 hover:text-charcoal transition-colors font-medium"
                    >
                        Cancel
                    </button>
                    <button
                        onClick={handleSubmit}
                        className="px-6 py-2 bg-charcoal text-white rounded-lg font-bold hover:bg-rust transition-colors flex items-center gap-2"
                    >
                        <Check size={16} />
                        Save Changes
                    </button>
                </div>
            </div>
        </div>
    );
};

// ============================================
// ACTIVITY TAB
// ============================================
// Activity type from the unified activities API
type ApiActivity = {
    id: string;
    orgId: string;
    entityType: string;
    entityId: string;
    activityType: string;
    status: string;
    priority: string;
    subject: string | null;
    body: string | null;
    direction: string | null;
    dueDate: Date | null;
    scheduledAt: Date | null;
    completedAt: Date | null;
    skippedAt: Date | null;
    escalationDate: Date | null;
    durationMinutes: number | null;
    outcome: string | null;
    assignedTo: string | null;
    performedBy: string | null;
    pocId: string | null;
    parentActivityId: string | null;
    createdAt: Date | string;
    updatedAt: Date | null;
    createdBy: string | null;
};

const ActivityTab: React.FC<{
    accountId: string;
    activities: ApiActivity[];
    isLoading: boolean;
    refetch: () => void;
}> = ({ accountId, activities, isLoading, refetch }) => {
    const [showLogForm, setShowLogForm] = useState(false);
    const [selectedActivityType, setSelectedActivityType] = useState<'call' | 'email' | 'meeting' | 'note' | 'linkedin_message' | null>(null);

    const activityIcons: Record<string, React.ReactNode> = {
        email: <Mail size={16} className="text-blue-600" />,
        call: <Phone size={16} className="text-green-600" />,
        meeting: <Calendar size={16} className="text-purple-600" />,
        note: <MessageSquare size={16} className="text-amber-600" />,
        linkedin_message: <Linkedin size={16} className="text-blue-500" />,
        task: <CheckCircle2 size={16} className="text-orange-500" />,
        follow_up: <Clock size={16} className="text-red-500" />,
    };

    const handleQuickLog = (type: 'call' | 'email' | 'meeting' | 'note' | 'linkedin_message') => {
        setSelectedActivityType(type);
        setShowLogForm(true);
    };

    const outcomeColors: Record<string, string> = {
        positive: 'bg-green-100 text-green-700',
        neutral: 'bg-stone-100 text-stone-600',
        negative: 'bg-red-100 text-red-700',
    };

    return (
        <div className="space-y-4">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-xl font-serif font-bold text-charcoal">Activity Timeline</h2>
                    <p className="text-sm text-stone-500">{activities.length} activities logged</p>
                </div>
                <button
                    onClick={() => { setSelectedActivityType(null); setShowLogForm(true); }}
                    className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-bold hover:bg-rust transition-colors"
                >
                    <Plus size={16} /> Log Activity
                </button>
            </div>

            {/* Quick Log Buttons */}
            <div className="flex gap-2 flex-wrap">
                {[
                    { type: 'call' as const, label: 'Log Call', icon: Phone, color: 'bg-green-100 text-green-700 hover:bg-green-200' },
                    { type: 'email' as const, label: 'Log Email', icon: Mail, color: 'bg-blue-100 text-blue-700 hover:bg-blue-200' },
                    { type: 'meeting' as const, label: 'Log Meeting', icon: Calendar, color: 'bg-purple-100 text-purple-700 hover:bg-purple-200' },
                    { type: 'note' as const, label: 'Add Note', icon: MessageSquare, color: 'bg-amber-100 text-amber-700 hover:bg-amber-200' },
                ].map(btn => (
                    <button
                        key={btn.type}
                        onClick={() => handleQuickLog(btn.type)}
                        className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold ${btn.color} transition-colors`}
                    >
                        <btn.icon size={14} /> {btn.label}
                    </button>
                ))}
            </div>

            {/* Timeline */}
            {isLoading ? (
                <div className="flex justify-center py-12"><Loader2 className="w-8 h-8 animate-spin text-stone-400" /></div>
            ) : activities.length > 0 ? (
                <div className="space-y-3">
                    {activities.map((activity, idx) => (
                        <div key={activity.id} className="flex gap-4">
                            <div className="flex flex-col items-center">
                                <div className="w-8 h-8 bg-white rounded-full border border-stone-200 flex items-center justify-center">
                                    {activityIcons[activity.activityType] || <Activity size={16} className="text-stone-400" />}
                                </div>
                                {idx < activities.length - 1 && <div className="w-px flex-1 bg-stone-200 my-1" />}
                            </div>
                            <div className="flex-1 pb-4">
                                <div className="bg-white p-4 rounded-xl border border-stone-200 hover:shadow-sm transition-all">
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="flex items-center gap-2">
                                            <span className="font-medium text-charcoal capitalize">{activity.activityType.replace('_', ' ')}</span>
                                            {activity.direction && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${
                                                    activity.direction === 'outbound' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'
                                                }`}>
                                                    {activity.direction}
                                                </span>
                                            )}
                                            {activity.outcome && (
                                                <span className={`text-[10px] px-1.5 py-0.5 rounded ${outcomeColors[activity.outcome]}`}>
                                                    {activity.outcome}
                                                </span>
                                            )}
                                        </div>
                                        <div className="flex items-center gap-2">
                                            {activity.durationMinutes && (
                                                <span className="text-xs text-stone-400">{activity.durationMinutes} min</span>
                                            )}
                                            <span className="text-xs text-stone-400">
                                                {new Date(activity.createdAt).toLocaleDateString('en-US', {
                                                    month: 'short',
                                                    day: 'numeric',
                                                    hour: 'numeric',
                                                    minute: '2-digit',
                                                })}
                                            </span>
                                        </div>
                                    </div>
                                    {activity.subject && (
                                        <div className="font-medium text-sm text-charcoal mb-1">{activity.subject}</div>
                                    )}
                                    {activity.body && (
                                        <p className="text-sm text-stone-600 whitespace-pre-wrap">{activity.body}</p>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                    <Clock size={40} className="mx-auto text-stone-300 mb-3" />
                    <p className="text-stone-500 mb-4">No activity logged yet</p>
                    <p className="text-xs text-stone-400">Start by logging a call, email, or meeting</p>
                </div>
            )}

            {/* Log Activity Modal */}
            {showLogForm && (
                <LogActivityModal
                    accountId={accountId}
                    defaultType={selectedActivityType}
                    onClose={() => { setShowLogForm(false); setSelectedActivityType(null); }}
                    onSuccess={() => { setShowLogForm(false); setSelectedActivityType(null); refetch(); }}
                />
            )}
        </div>
    );
};

// ============================================
// LOG ACTIVITY MODAL
// ============================================
const LogActivityModal: React.FC<{
    accountId: string;
    defaultType?: 'call' | 'email' | 'meeting' | 'note' | 'linkedin_message' | null;
    onClose: () => void;
    onSuccess: () => void;
}> = ({ accountId, defaultType, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        activityType: defaultType || 'call' as 'call' | 'email' | 'meeting' | 'note' | 'linkedin_message',
        subject: '',
        body: '',
        direction: 'outbound' as 'inbound' | 'outbound',
        durationMinutes: '',
        outcome: '' as '' | 'positive' | 'neutral' | 'negative',
        createFollowUp: false,
        followUpSubject: '',
        followUpDays: '3',
    });

    const logActivityMutation = trpc.activities.log.useMutation({
        onSuccess: () => {
            onSuccess();
        },
        onError: (err) => {
            setError(err.message || 'Failed to log activity');
            setIsSubmitting(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const followUpDate = form.createFollowUp
                ? new Date(Date.now() + parseInt(form.followUpDays) * 24 * 60 * 60 * 1000)
                : undefined;

            await logActivityMutation.mutateAsync({
                entityType: 'account',
                entityId: accountId,
                activityType: form.activityType,
                subject: form.subject || undefined,
                body: form.body || undefined,
                direction: form.direction,
                durationMinutes: form.durationMinutes ? parseInt(form.durationMinutes) : undefined,
                outcome: form.outcome || undefined,
                createFollowUp: form.createFollowUp,
                followUpSubject: form.followUpSubject || undefined,
                followUpDueDate: followUpDate,
            });
        } catch (err) {
            console.error('Failed to log activity:', err);
        }
    };

    const activityTypeOptions = [
        { value: 'call', label: 'Phone Call', icon: Phone, color: 'bg-green-100 text-green-600' },
        { value: 'email', label: 'Email', icon: Mail, color: 'bg-blue-100 text-blue-600' },
        { value: 'meeting', label: 'Meeting', icon: Calendar, color: 'bg-purple-100 text-purple-600' },
        { value: 'note', label: 'Note', icon: MessageSquare, color: 'bg-amber-100 text-amber-600' },
        { value: 'linkedin_message', label: 'LinkedIn', icon: Linkedin, color: 'bg-sky-100 text-sky-600' },
    ];

    const inputClass = "w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust text-sm";
    const labelClass = "block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-stone-100">
                    <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-10 h-10 bg-rust text-white rounded-xl flex items-center justify-center">
                            <Clock size={20} />
                        </div>
                        <h2 className="text-xl font-serif font-bold text-charcoal">Log Activity</h2>
                    </div>

                    {/* Activity Type Selector */}
                    <div className="flex gap-2">
                        {activityTypeOptions.map(opt => (
                            <button
                                key={opt.value}
                                type="button"
                                onClick={() => setForm({ ...form, activityType: opt.value as typeof form.activityType })}
                                className={`flex-1 p-2 rounded-xl border-2 transition-all flex flex-col items-center gap-1 ${
                                    form.activityType === opt.value
                                        ? 'border-charcoal bg-stone-50'
                                        : 'border-stone-100 hover:border-stone-200'
                                }`}
                            >
                                <div className={`w-8 h-8 rounded-lg ${opt.color} flex items-center justify-center`}>
                                    <opt.icon size={16} />
                                </div>
                                <span className="text-[10px] font-bold text-charcoal">{opt.label}</span>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="activity-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={labelClass}>Subject</label>
                            <input
                                className={inputClass}
                                placeholder={`${form.activityType === 'call' ? 'Call regarding...' : form.activityType === 'meeting' ? 'Meeting about...' : 'Subject...'}`}
                                value={form.subject}
                                onChange={e => setForm({ ...form, subject: e.target.value })}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Notes / Details</label>
                            <textarea
                                className={`${inputClass} min-h-[100px]`}
                                placeholder="What was discussed? Key points, action items..."
                                value={form.body}
                                onChange={e => setForm({ ...form, body: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Direction</label>
                                <select
                                    className={inputClass}
                                    value={form.direction}
                                    onChange={e => setForm({ ...form, direction: e.target.value as 'inbound' | 'outbound' })}
                                >
                                    <option value="outbound">Outbound (You initiated)</option>
                                    <option value="inbound">Inbound (They initiated)</option>
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Duration (minutes)</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    placeholder="15"
                                    value={form.durationMinutes}
                                    onChange={e => setForm({ ...form, durationMinutes: e.target.value })}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Outcome</label>
                            <div className="flex gap-2">
                                {[
                                    { value: 'positive', label: 'Positive', color: 'bg-green-100 text-green-700 border-green-200' },
                                    { value: 'neutral', label: 'Neutral', color: 'bg-stone-100 text-stone-700 border-stone-200' },
                                    { value: 'negative', label: 'Negative', color: 'bg-red-100 text-red-700 border-red-200' },
                                ].map(opt => (
                                    <button
                                        key={opt.value}
                                        type="button"
                                        onClick={() => setForm({ ...form, outcome: form.outcome === opt.value ? '' : opt.value as typeof form.outcome })}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                                            form.outcome === opt.value
                                                ? `${opt.color} border-current`
                                                : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                                        }`}
                                    >
                                        {opt.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Follow-up Section */}
                        <div className="bg-amber-50 rounded-xl p-4 space-y-3">
                            <label className="flex items-center gap-3 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={form.createFollowUp}
                                    onChange={e => setForm({ ...form, createFollowUp: e.target.checked })}
                                    className="w-5 h-5 rounded border-stone-300 text-rust focus:ring-rust"
                                />
                                <span className="text-sm font-bold text-amber-800">Schedule a follow-up</span>
                            </label>

                            {form.createFollowUp && (
                                <div className="space-y-3 pl-8 animate-fade-in">
                                    <div>
                                        <label className={labelClass}>Follow-up Subject</label>
                                        <input
                                            className={inputClass}
                                            placeholder="Follow up on..."
                                            value={form.followUpSubject}
                                            onChange={e => setForm({ ...form, followUpSubject: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className={labelClass}>Days until follow-up</label>
                                        <select
                                            className={inputClass}
                                            value={form.followUpDays}
                                            onChange={e => setForm({ ...form, followUpDays: e.target.value })}
                                        >
                                            <option value="1">Tomorrow</option>
                                            <option value="2">In 2 days</option>
                                            <option value="3">In 3 days</option>
                                            <option value="5">In 5 days</option>
                                            <option value="7">In 1 week</option>
                                            <option value="14">In 2 weeks</option>
                                        </select>
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Footer */}
                <div className="p-6 pt-4 border-t border-stone-100">
                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isSubmitting}
                            className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            form="activity-form"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-rust text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-charcoal transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Logging...
                                </>
                            ) : (
                                'Log Activity'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AccountWorkspace;
