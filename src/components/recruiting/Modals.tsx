'use client';


import React, { useState } from 'react';
import { X, Building2, GraduationCap, User, CheckCircle, Search, Linkedin, Globe, MapPin, DollarSign, ChevronDown, ChevronUp, Loader2, Zap } from 'lucide-react';
import { Lead, Deal, Account } from '../../types';
import { useAppStore } from '../../lib/store';
import { trpc } from '../../lib/trpc/client';

type LeadType = 'company' | 'person';

// Industry options for staffing/recruiting
const INDUSTRIES = [
  'Insurance (P&C)',
  'Insurance (Life)',
  'Insurance (Health)',
  'Financial Services',
  'Banking',
  'Healthcare',
  'Technology',
  'Manufacturing',
  'Retail',
  'Government',
  'Other'
];

// Company size options
const COMPANY_SIZES = [
  '1-50 employees',
  '51-200 employees',
  '201-500 employees',
  '501-1000 employees',
  '1001-5000 employees',
  '5000+ employees'
];

// Lead sources
const LEAD_SOURCES = [
  'Cold Outreach',
  'LinkedIn',
  'LinkedIn Sales Navigator',
  'Referral',
  'Website Inquiry',
  'Job Board',
  'Conference/Event',
  'Email Campaign',
  'Partner Referral',
  'Existing Client',
  'Other'
];

// Account tiers
const ACCOUNT_TIERS = ['Enterprise', 'Mid-Market', 'SMB', 'Strategic'];

// Decision authority levels
const DECISION_AUTHORITY = ['Decision Maker', 'Influencer', 'Gatekeeper', 'End User', 'Champion'];

// Preferred contact methods
const CONTACT_METHODS = ['Email', 'Phone', 'LinkedIn', 'Text'];

export const CreateLeadModal: React.FC<{
    onClose: () => void;
    onSave: (lead: Lead, account?: Account) => void;
    defaultAccountId?: string;
}> = ({ onClose, onSave, defaultAccountId }) => {
    const { addLead } = useAppStore();
    const [leadType, setLeadType] = useState<LeadType>(defaultAccountId ? 'person' : 'company');
    const [selectedAccountId, setSelectedAccountId] = useState<string>(defaultAccountId || '');
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [accountSearch, setAccountSearch] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Fetch real accounts from database
    const { data: dbAccounts } = trpc.crm.accounts.list.useQuery(
        { page: 1, pageSize: 100, search: accountSearch || undefined },
        { enabled: leadType === 'person' || !!defaultAccountId } // Fetch when person tab is active OR when defaultAccountId is provided
    );
    const accounts = dbAccounts?.items || [];

    // tRPC mutation for creating leads
    const createLeadMutation = trpc.crm.leads.create.useMutation({
        onSuccess: (dbLead) => {
            // Also add to local store for immediate UI update
            const localLead: Lead = {
                id: dbLead.id,
                company: dbLead.companyName || '',
                firstName: dbLead.firstName || '',
                lastName: dbLead.lastName || '',
                title: dbLead.title || '',
                email: dbLead.email || '',
                phone: dbLead.phone || '',
                value: dbLead.estimatedValue ? `$${Number(dbLead.estimatedValue).toLocaleString()}` : '',
                source: dbLead.source || '',
                contact: (dbLead.firstName && dbLead.lastName)
                    ? `${dbLead.firstName} ${dbLead.lastName}`
                    : dbLead.companyName || '',
                status: dbLead.status as Lead['status'],
                lastAction: 'Created just now',
                notes: dbLead.notes || ''
            };
            addLead(localLead);
            onSave(localLead);
            onClose();
        },
        onError: (err) => {
            setError(err.message || 'Failed to create lead');
            setIsSubmitting(false);
        }
    });

    const [form, setForm] = useState({
        // Company fields
        company: '',
        industry: '',
        companyType: 'Direct Client',
        companySize: '',
        website: '',
        headquarters: '',
        tier: '',
        description: '',
        // Person fields
        firstName: '',
        lastName: '',
        title: '',
        email: '',
        phone: '',
        linkedinUrl: '',
        decisionAuthority: '',
        preferredContact: 'Email',
        // Common fields
        value: '',
        source: '',
        notes: ''
    });

    // Accounts are already filtered server-side based on accountSearch
    const filteredAccounts = accounts;

    const selectedAccount = accounts.find(a => a.id === selectedAccountId);

    // Map form values to API-compatible format
    const mapSourceToApi = (source: string): string => {
        const sourceMap: Record<string, string> = {
            'Cold Outreach': 'cold_outreach',
            'LinkedIn': 'linkedin',
            'LinkedIn Sales Navigator': 'linkedin_sales_navigator',
            'Referral': 'referral',
            'Website Inquiry': 'website_inquiry',
            'Job Board': 'job_board',
            'Conference/Event': 'conference_event',
            'Email Campaign': 'email_campaign',
            'Partner Referral': 'partner_referral',
            'Existing Client': 'existing_client',
            'Other': 'other'
        };
        return sourceMap[source] || 'other';
    };

    const mapCompanyTypeToApi = (type: string): string => {
        const typeMap: Record<string, string> = {
            'Direct Client': 'direct_client',
            'Implementation Partner': 'implementation_partner',
            'MSP/VMS': 'msp_vms',
            'System Integrator': 'system_integrator'
        };
        return typeMap[type] || 'direct_client';
    };

    const mapTierToApi = (tier: string): string => {
        const tierMap: Record<string, string> = {
            'Enterprise': 'enterprise',
            'Mid-Market': 'mid_market',
            'SMB': 'smb',
            'Strategic': 'strategic'
        };
        return tierMap[tier] || '';
    };

    const mapCompanySizeToApi = (size: string): string => {
        const sizeMap: Record<string, string> = {
            '1-50 employees': '1-50',
            '51-200 employees': '51-200',
            '201-500 employees': '201-500',
            '501-1000 employees': '501-1000',
            '1001-5000 employees': '1001-5000',
            '5000+ employees': '5000+'
        };
        return sizeMap[size] || '';
    };

    const mapDecisionAuthorityToApi = (authority: string): string => {
        const authorityMap: Record<string, string> = {
            'Decision Maker': 'decision_maker',
            'Influencer': 'influencer',
            'Gatekeeper': 'gatekeeper',
            'End User': 'end_user',
            'Champion': 'champion'
        };
        return authorityMap[authority] || '';
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            // Prepare the data for the API
            const leadData: Record<string, unknown> = {
                leadType: leadType,
                status: 'new',
                source: form.source ? mapSourceToApi(form.source) : undefined,
                estimatedValue: form.value ? parseFloat(form.value) : undefined,
                notes: form.notes || undefined,
            };

            if (leadType === 'company') {
                leadData.companyName = form.company;
                leadData.industry = form.industry || undefined;
                leadData.companyType = form.companyType ? mapCompanyTypeToApi(form.companyType) : undefined;
                leadData.companySize = form.companySize ? mapCompanySizeToApi(form.companySize) : undefined;
                leadData.website = form.website || undefined;
                leadData.headquarters = form.headquarters || undefined;
                leadData.tier = form.tier ? mapTierToApi(form.tier) : undefined;
                leadData.companyDescription = form.description || undefined;
                // Primary contact (optional for company leads)
                if (form.firstName) leadData.firstName = form.firstName;
                if (form.lastName) leadData.lastName = form.lastName;
                if (form.firstName && form.lastName) leadData.fullName = `${form.firstName} ${form.lastName}`;
                if (form.title) leadData.title = form.title;
                if (form.email) leadData.email = form.email;
                if (form.phone) leadData.phone = form.phone;
                if (form.linkedinUrl) leadData.linkedinUrl = form.linkedinUrl;
                if (form.decisionAuthority) leadData.decisionAuthority = mapDecisionAuthorityToApi(form.decisionAuthority);
            } else {
                // Person lead
                leadData.firstName = form.firstName;
                leadData.lastName = form.lastName;
                leadData.fullName = `${form.firstName} ${form.lastName}`;
                leadData.title = form.title || undefined;
                leadData.email = form.email;
                leadData.phone = form.phone || undefined;
                leadData.linkedinUrl = form.linkedinUrl || undefined;
                leadData.decisionAuthority = form.decisionAuthority ? mapDecisionAuthorityToApi(form.decisionAuthority) : undefined;
                leadData.preferredContactMethod = form.preferredContact.toLowerCase();
                // Link to existing account if selected
                if (selectedAccountId) {
                    leadData.accountId = selectedAccountId;
                    leadData.companyName = selectedAccount?.name;
                }
            }

            // Call tRPC mutation
            await createLeadMutation.mutateAsync(leadData);
        } catch (err) {
            // Error handled in mutation onError
            console.error('Failed to create lead:', err);
        }
    };

    const inputClass = "w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust text-sm";
    const labelClass = "block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative max-h-[90vh] flex flex-col">
                {/* Fixed Header */}
                <div className="p-6 pb-4 border-b border-stone-100">
                    <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>

                    <h2 className="text-2xl font-serif font-bold text-charcoal mb-4">Add New Lead</h2>

                    {/* Lead Type Selector */}
                    <div className="flex gap-3">
                        <button
                            type="button"
                            onClick={() => setLeadType('company')}
                            className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                                leadType === 'company'
                                    ? 'border-charcoal bg-stone-50'
                                    : 'border-stone-200 hover:border-stone-300'
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                leadType === 'company' ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-400'
                            }`}>
                                <Building2 size={16} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm text-charcoal">Company</div>
                                <div className="text-[10px] text-stone-400">New Account + Contact</div>
                            </div>
                        </button>

                        <button
                            type="button"
                            onClick={() => setLeadType('person')}
                            className={`flex-1 p-3 rounded-xl border-2 transition-all flex items-center gap-3 ${
                                leadType === 'person'
                                    ? 'border-rust bg-rust/5'
                                    : 'border-stone-200 hover:border-stone-300'
                            }`}
                        >
                            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                                leadType === 'person' ? 'bg-rust text-white' : 'bg-stone-100 text-stone-400'
                            }`}>
                                <User size={16} />
                            </div>
                            <div className="text-left">
                                <div className="font-bold text-sm text-charcoal">Person</div>
                                <div className="text-[10px] text-stone-400">Contact / POC</div>
                            </div>
                        </button>
                    </div>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="lead-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* ==================== COMPANY LEAD FIELDS ==================== */}
                        {leadType === 'company' && (
                            <div className="space-y-5 animate-fade-in">
                                {/* Company Information Section */}
                                <div className="bg-stone-50 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Building2 size={14} className="text-charcoal" />
                                        <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Company Information</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="col-span-2">
                                            <label className={labelClass}>Company Name *</label>
                                            <input
                                                required
                                                className={inputClass}
                                                placeholder="e.g. Acme Insurance Corp"
                                                value={form.company}
                                                onChange={e => setForm({...form, company: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>Industry *</label>
                                            <select
                                                required
                                                className={inputClass}
                                                value={form.industry}
                                                onChange={e => setForm({...form, industry: e.target.value})}
                                            >
                                                <option value="">Select Industry...</option>
                                                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Company Type *</label>
                                            <select
                                                required
                                                className={inputClass}
                                                value={form.companyType}
                                                onChange={e => setForm({...form, companyType: e.target.value})}
                                            >
                                                <option value="Direct Client">Direct Client</option>
                                                <option value="Implementation Partner">Implementation Partner</option>
                                                <option value="MSP/VMS">MSP / VMS</option>
                                                <option value="System Integrator">System Integrator</option>
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Company Size</label>
                                            <select
                                                className={inputClass}
                                                value={form.companySize}
                                                onChange={e => setForm({...form, companySize: e.target.value})}
                                            >
                                                <option value="">Select Size...</option>
                                                {COMPANY_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>Account Tier</label>
                                            <select
                                                className={inputClass}
                                                value={form.tier}
                                                onChange={e => setForm({...form, tier: e.target.value})}
                                            >
                                                <option value="">Select Tier...</option>
                                                {ACCOUNT_TIERS.map(t => <option key={t} value={t}>{t}</option>)}
                                            </select>
                                        </div>

                                        <div>
                                            <label className={labelClass}>
                                                <Globe size={10} className="inline mr-1" />
                                                Website
                                            </label>
                                            <input
                                                type="url"
                                                className={inputClass}
                                                placeholder="https://www.company.com"
                                                value={form.website}
                                                onChange={e => setForm({...form, website: e.target.value})}
                                            />
                                        </div>

                                        <div>
                                            <label className={labelClass}>
                                                <MapPin size={10} className="inline mr-1" />
                                                Headquarters
                                            </label>
                                            <input
                                                className={inputClass}
                                                placeholder="e.g. Hartford, CT"
                                                value={form.headquarters}
                                                onChange={e => setForm({...form, headquarters: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                {/* Primary Contact Section */}
                                <div className="bg-rust/5 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={14} className="text-rust" />
                                        <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Primary Contact</span>
                                        <span className="text-[10px] text-stone-400 ml-auto">Recommended</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>First Name</label>
                                            <input className={inputClass} placeholder="John" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Last Name</label>
                                            <input className={inputClass} placeholder="Smith" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Job Title</label>
                                            <input className={inputClass} placeholder="VP of Engineering" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Decision Authority</label>
                                            <select className={inputClass} value={form.decisionAuthority} onChange={e => setForm({...form, decisionAuthority: e.target.value})}>
                                                <option value="">Select...</option>
                                                {DECISION_AUTHORITY.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email</label>
                                            <input type="email" className={inputClass} placeholder="john@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Phone</label>
                                            <input type="tel" className={inputClass} placeholder="+1 (555) 123-4567" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                        </div>
                                        <div className="col-span-2">
                                            <label className={labelClass}>
                                                <Linkedin size={10} className="inline mr-1" />
                                                LinkedIn Profile
                                            </label>
                                            <input className={inputClass} placeholder="https://linkedin.com/in/johnsmith" value={form.linkedinUrl} onChange={e => setForm({...form, linkedinUrl: e.target.value})} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ==================== PERSON LEAD FIELDS ==================== */}
                        {leadType === 'person' && (
                            <div className="space-y-5 animate-fade-in">
                                {/* Account Selector */}
                                <div className="bg-stone-50 rounded-xl p-4">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Building2 size={14} className="text-charcoal" />
                                        <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Link to Account</span>
                                        <span className="text-[10px] text-stone-400 ml-auto">Optional</span>
                                    </div>

                                    {selectedAccountId && selectedAccount ? (
                                        <div className="flex items-center justify-between p-3 bg-white border border-stone-200 rounded-xl">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 bg-charcoal text-white rounded-lg flex items-center justify-center">
                                                    <Building2 size={16} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-sm text-charcoal">{selectedAccount.name}</div>
                                                    <div className="text-[10px] text-stone-400">{selectedAccount.industry} • {selectedAccount.companyType}</div>
                                                </div>
                                            </div>
                                            <button
                                                type="button"
                                                onClick={() => { setSelectedAccountId(''); setShowAccountSearch(true); }}
                                                className="text-xs text-rust font-bold hover:underline"
                                            >
                                                Change
                                            </button>
                                        </div>
                                    ) : (
                                        <div className="relative">
                                            <div className="flex items-center gap-2 p-3 bg-white border border-stone-200 rounded-xl">
                                                <Search size={16} className="text-stone-400" />
                                                <input
                                                    className="flex-1 bg-transparent outline-none text-sm"
                                                    placeholder="Search existing accounts..."
                                                    value={accountSearch}
                                                    onChange={e => { setAccountSearch(e.target.value); setShowAccountSearch(true); }}
                                                    onFocus={() => setShowAccountSearch(true)}
                                                />
                                            </div>
                                            {showAccountSearch && accountSearch && (
                                                <div className="absolute z-10 w-full mt-1 bg-white border border-stone-200 rounded-xl shadow-lg max-h-48 overflow-y-auto">
                                                    {filteredAccounts.length > 0 ? (
                                                        filteredAccounts.map(account => (
                                                            <button
                                                                key={account.id}
                                                                type="button"
                                                                onClick={() => {
                                                                    setSelectedAccountId(account.id);
                                                                    setShowAccountSearch(false);
                                                                    setAccountSearch('');
                                                                }}
                                                                className="w-full p-3 text-left hover:bg-stone-50 flex items-center gap-3 border-b border-stone-100 last:border-0"
                                                            >
                                                                <Building2 size={14} className="text-stone-400" />
                                                                <div>
                                                                    <div className="font-medium text-sm text-charcoal">{account.name}</div>
                                                                    <div className="text-[10px] text-stone-400">{account.industry}</div>
                                                                </div>
                                                            </button>
                                                        ))
                                                    ) : (
                                                        <div className="p-3 text-sm text-stone-400 text-center">No accounts found</div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {/* Contact Information */}
                                <div className="bg-rust/5 rounded-xl p-4 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <User size={14} className="text-rust" />
                                        <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Contact Information</span>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelClass}>First Name *</label>
                                            <input required className={inputClass} placeholder="John" value={form.firstName} onChange={e => setForm({...form, firstName: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Last Name *</label>
                                            <input required className={inputClass} placeholder="Smith" value={form.lastName} onChange={e => setForm({...form, lastName: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Job Title *</label>
                                            <input required className={inputClass} placeholder="VP of Engineering" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Decision Authority</label>
                                            <select className={inputClass} value={form.decisionAuthority} onChange={e => setForm({...form, decisionAuthority: e.target.value})}>
                                                <option value="">Select...</option>
                                                {DECISION_AUTHORITY.map(d => <option key={d} value={d}>{d}</option>)}
                                            </select>
                                        </div>
                                        <div>
                                            <label className={labelClass}>Email *</label>
                                            <input type="email" required className={inputClass} placeholder="john@company.com" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Phone</label>
                                            <input type="tel" className={inputClass} placeholder="+1 (555) 123-4567" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>
                                                <Linkedin size={10} className="inline mr-1" />
                                                LinkedIn Profile
                                            </label>
                                            <input className={inputClass} placeholder="https://linkedin.com/in/johnsmith" value={form.linkedinUrl} onChange={e => setForm({...form, linkedinUrl: e.target.value})} />
                                        </div>
                                        <div>
                                            <label className={labelClass}>Preferred Contact</label>
                                            <select className={inputClass} value={form.preferredContact} onChange={e => setForm({...form, preferredContact: e.target.value})}>
                                                {CONTACT_METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ==================== COMMON FIELDS ==================== */}
                        <div className="bg-green-50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <DollarSign size={14} className="text-green-600" />
                                <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Opportunity Details</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Estimated Deal Value</label>
                                    <div className="relative">
                                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">$</span>
                                        <input
                                            type="number"
                                            className={`${inputClass} pl-7`}
                                            placeholder="50,000"
                                            value={form.value}
                                            onChange={e => setForm({...form, value: e.target.value})}
                                        />
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Lead Source *</label>
                                    <select
                                        required
                                        className={inputClass}
                                        value={form.source}
                                        onChange={e => setForm({...form, source: e.target.value})}
                                    >
                                        <option value="">Select Source...</option>
                                        {LEAD_SOURCES.map(s => <option key={s} value={s}>{s}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Advanced / Notes Section */}
                        <div>
                            <button
                                type="button"
                                onClick={() => setShowAdvanced(!showAdvanced)}
                                className="flex items-center gap-2 text-xs font-bold text-stone-400 uppercase tracking-widest hover:text-charcoal transition-colors"
                            >
                                {showAdvanced ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
                                Additional Notes
                            </button>

                            {showAdvanced && (
                                <div className="mt-3 animate-fade-in">
                                    <textarea
                                        className={`${inputClass} min-h-[100px]`}
                                        placeholder="Add any additional context, notes about the lead, or next steps..."
                                        value={form.notes}
                                        onChange={e => setForm({...form, notes: e.target.value})}
                                    />
                                </div>
                            )}
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
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
                            form="lead-form"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                `Create ${leadType === 'company' ? 'Company' : 'Person'} Lead`
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export const CreateDealModal: React.FC<{ leads: Lead[], onClose: () => void, onSave: (deal: Deal) => void }> = ({ leads, onClose, onSave }) => {
    const [form, setForm] = useState({
        title: '',
        leadId: '',
        value: '',
        expectedClose: '',
        probability: 20
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const selectedLead = leads.find(l => l.id === form.leadId);
        const newDeal: Deal = {
            id: `d${Date.now()}`,
            ...form,
            company: selectedLead ? selectedLead.company : 'Unknown',
            stage: 'Prospect',
            ownerId: 'current-user'
        };
        onSave(newDeal);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Start New Deal</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Deal Title</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="e.g. Q4 Staffing Contract" value={form.title} onChange={e => setForm({...form, title: e.target.value})} />
                    </div>
                    
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Related Lead</label>
                        <select required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.leadId} onChange={e => setForm({...form, leadId: e.target.value})}>
                            <option value="">Select Lead...</option>
                            {leads.map(l => <option key={l.id} value={l.id}>{l.company} - {l.contact}</option>)}
                        </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Value ($)</label>
                            <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" placeholder="$0" value={form.value} onChange={e => setForm({...form, value: e.target.value})} />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Close Date</label>
                            <input required type="date" className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.expectedClose} onChange={e => setForm({...form, expectedClose: e.target.value})} />
                        </div>
                    </div>
                    
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-colors shadow-lg">Create Pipeline Deal</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Industry options for accounts
const ACCOUNT_INDUSTRIES = [
    { value: 'technology', label: 'Technology' },
    { value: 'healthcare', label: 'Healthcare' },
    { value: 'finance', label: 'Financial Services' },
    { value: 'banking', label: 'Banking' },
    { value: 'insurance', label: 'Insurance' },
    { value: 'manufacturing', label: 'Manufacturing' },
    { value: 'retail', label: 'Retail' },
    { value: 'consulting', label: 'Consulting' },
    { value: 'government', label: 'Government' },
    { value: 'education', label: 'Education' },
    { value: 'energy', label: 'Energy' },
    { value: 'telecommunications', label: 'Telecommunications' },
    { value: 'pharmaceutical', label: 'Pharmaceutical' },
    { value: 'other', label: 'Other' },
];

// Account tiers
const ACCOUNT_TIERS_OPTIONS = [
    { value: 'enterprise', label: 'Enterprise' },
    { value: 'mid_market', label: 'Mid Market' },
    { value: 'smb', label: 'SMB' },
    { value: 'strategic', label: 'Strategic' },
];

// Account types
const ACCOUNT_TYPES = [
    { value: 'direct_client', label: 'Direct Client' },
    { value: 'vendor', label: 'Vendor' },
    { value: 'implementation_partner', label: 'Implementation Partner' },
    { value: 'msp_vms', label: 'MSP/VMS' },
    { value: 'system_integrator', label: 'System Integrator' },
    { value: 'staffing_agency', label: 'Staffing Agency' },
];

// Responsiveness levels
const RESPONSIVENESS_LEVELS = [
    { value: 'high', label: 'High' },
    { value: 'medium', label: 'Medium' },
    { value: 'low', label: 'Low' },
];

// Quality preference
const QUALITY_PREFERENCES = [
    { value: 'premium', label: 'Quality First' },
    { value: 'standard', label: 'Balanced' },
    { value: 'budget', label: 'Speed First' },
];

export const CreateAccountModal: React.FC<{
    onClose: () => void;
    onSuccess?: (account: { id: string }) => void;
}> = ({ onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        name: '',
        industry: '' as '' | 'technology' | 'healthcare' | 'finance' | 'banking' | 'insurance' | 'manufacturing' | 'retail' | 'consulting' | 'government' | 'education' | 'energy' | 'telecommunications' | 'pharmaceutical' | 'other',
        companyType: 'direct_client' as 'direct_client' | 'implementation_partner' | 'msp_vms' | 'system_integrator' | 'staffing_agency' | 'vendor',
        status: 'prospect' as 'prospect' | 'active' | 'inactive' | 'churned',
        tier: '' as '' | 'enterprise' | 'mid_market' | 'smb' | 'strategic',
        responsiveness: '' as '' | 'high' | 'medium' | 'low',
        preferredQuality: '' as '' | 'premium' | 'standard' | 'budget',
        website: '',
        headquartersLocation: '',
        phone: '',
        description: '',
    });

    // tRPC mutation for creating accounts
    const createAccountMutation = trpc.crm.accounts.create.useMutation({
        onSuccess: (account) => {
            onSuccess?.(account);
            onClose();
        },
        onError: (err) => {
            setError(err.message || 'Failed to create account');
            setIsSubmitting(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await createAccountMutation.mutateAsync({
                name: form.name,
                industry: form.industry || undefined,
                companyType: form.companyType,
                status: form.status,
                tier: form.tier || undefined,
                responsiveness: form.responsiveness || undefined,
                preferredQuality: form.preferredQuality || undefined,
                website: form.website || undefined,
                headquartersLocation: form.headquartersLocation || undefined,
                phone: form.phone || undefined,
                description: form.description || undefined,
            });
        } catch (err) {
            // Error handled in mutation onError
            console.error('Failed to create account:', err);
        }
    };

    const inputClass = "w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust text-sm";
    const labelClass = "block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5";

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative max-h-[90vh] flex flex-col">
                {/* Fixed Header */}
                <div className="p-6 pb-4 border-b border-stone-100">
                    <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-charcoal text-white rounded-xl flex items-center justify-center">
                            <Building2 size={20} />
                        </div>
                        <h2 className="text-2xl font-serif font-bold text-charcoal">New Account</h2>
                    </div>
                    <p className="text-sm text-stone-500">Create a new client account in your CRM</p>
                </div>

                {/* Scrollable Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="account-form" onSubmit={handleSubmit} className="space-y-5">
                        {/* Basic Information */}
                        <div className="bg-stone-50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Building2 size={14} className="text-charcoal" />
                                <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Basic Information</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="col-span-2">
                                    <label className={labelClass}>Account Name *</label>
                                    <input
                                        required
                                        className={inputClass}
                                        placeholder="e.g. Acme Insurance Corp"
                                        value={form.name}
                                        onChange={e => setForm({...form, name: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Industry</label>
                                    <select
                                        className={inputClass}
                                        value={form.industry}
                                        onChange={e => setForm({...form, industry: e.target.value as typeof form.industry})}
                                    >
                                        <option value="">Select Industry...</option>
                                        {ACCOUNT_INDUSTRIES.map(i => <option key={i.value} value={i.value}>{i.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Account Type *</label>
                                    <select
                                        required
                                        className={inputClass}
                                        value={form.companyType}
                                        onChange={e => setForm({...form, companyType: e.target.value as typeof form.companyType})}
                                    >
                                        {ACCOUNT_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Status</label>
                                    <select
                                        className={inputClass}
                                        value={form.status}
                                        onChange={e => setForm({...form, status: e.target.value as typeof form.status})}
                                    >
                                        <option value="prospect">Prospect</option>
                                        <option value="active">Active</option>
                                        <option value="inactive">On Hold</option>
                                        <option value="churned">Churned</option>
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Tier</label>
                                    <select
                                        className={inputClass}
                                        value={form.tier}
                                        onChange={e => setForm({...form, tier: e.target.value as typeof form.tier})}
                                    >
                                        <option value="">Select Tier...</option>
                                        {ACCOUNT_TIERS_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                    </select>
                                </div>
                            </div>
                        </div>

                        {/* Contact Information */}
                        <div className="bg-blue-50/50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Globe size={14} className="text-blue-600" />
                                <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Contact Information</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Website</label>
                                    <input
                                        type="url"
                                        className={inputClass}
                                        placeholder="https://www.company.com"
                                        value={form.website}
                                        onChange={e => setForm({...form, website: e.target.value})}
                                    />
                                </div>

                                <div>
                                    <label className={labelClass}>Phone</label>
                                    <input
                                        type="tel"
                                        className={inputClass}
                                        placeholder="+1 (555) 123-4567"
                                        value={form.phone}
                                        onChange={e => setForm({...form, phone: e.target.value})}
                                    />
                                </div>

                                <div className="col-span-2">
                                    <label className={labelClass}>
                                        <MapPin size={10} className="inline mr-1" />
                                        Headquarters Location
                                    </label>
                                    <input
                                        className={inputClass}
                                        placeholder="e.g. Hartford, CT"
                                        value={form.headquartersLocation}
                                        onChange={e => setForm({...form, headquartersLocation: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Account Intelligence */}
                        <div className="bg-amber-50/50 rounded-xl p-4 space-y-4">
                            <div className="flex items-center gap-2 mb-2">
                                <Zap size={14} className="text-amber-600" />
                                <span className="text-xs font-bold text-charcoal uppercase tracking-widest">Account Intelligence</span>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className={labelClass}>Responsiveness</label>
                                    <select
                                        className={inputClass}
                                        value={form.responsiveness}
                                        onChange={e => setForm({...form, responsiveness: e.target.value as typeof form.responsiveness})}
                                    >
                                        <option value="">Select...</option>
                                        {RESPONSIVENESS_LEVELS.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                    </select>
                                </div>

                                <div>
                                    <label className={labelClass}>Quality Preference</label>
                                    <select
                                        className={inputClass}
                                        value={form.preferredQuality}
                                        onChange={e => setForm({...form, preferredQuality: e.target.value as typeof form.preferredQuality})}
                                    >
                                        <option value="">Select...</option>
                                        {QUALITY_PREFERENCES.map(q => <option key={q.value} value={q.value}>{q.label}</option>)}
                                    </select>
                                </div>

                                <div className="col-span-2">
                                    <label className={labelClass}>Description / Notes</label>
                                    <textarea
                                        className={`${inputClass} min-h-[80px]`}
                                        placeholder="Add any notes about this account..."
                                        value={form.description}
                                        onChange={e => setForm({...form, description: e.target.value})}
                                    />
                                </div>
                            </div>
                        </div>
                    </form>
                </div>

                {/* Fixed Footer */}
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
                            form="account-form"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Account'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// POC (Point of Contact) Modal
export const CreatePOCModal: React.FC<{
    accountId: string;
    accountName?: string;
    onClose: () => void;
    onSuccess?: () => void;
}> = ({ accountId, accountName, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        firstName: '',
        lastName: '',
        title: '',
        role: '' as '' | 'hiring_manager' | 'recruiter' | 'hr_director' | 'vp' | 'c_level' | 'other',
        email: '',
        phone: '',
        linkedinUrl: '',
        preferredContactMethod: 'email' as 'email' | 'phone' | 'linkedin',
        decisionAuthority: '' as '' | 'final_decision_maker' | 'key_influencer' | 'gatekeeper' | 'recommender' | 'end_user',
        isPrimary: false,
        notes: '',
    });

    // tRPC mutation for creating contacts (POCs)
    const createPocMutation = trpc.crm.contacts.create.useMutation({
        onSuccess: () => {
            onSuccess?.();
            onClose();
        },
        onError: (err: unknown) => {
            setError((err as Error).message || 'Failed to create contact');
            setIsSubmitting(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await createPocMutation.mutateAsync({
                accountId,
                firstName: form.firstName,
                lastName: form.lastName,
                title: form.title || undefined,
                email: form.email,
                phone: form.phone || undefined,
                linkedinUrl: form.linkedinUrl || undefined,
                preferredContactMethod: form.preferredContactMethod,
                decisionAuthority: form.decisionAuthority || undefined,
                notes: form.notes || undefined,
            });
        } catch (err) {
            console.error('Failed to create POC:', err);
        }
    };

    const inputClass = "w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust text-sm";
    const labelClass = "block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5";

    const POC_ROLES = [
        { value: 'hiring_manager', label: 'Hiring Manager' },
        { value: 'recruiter', label: 'Recruiter' },
        { value: 'hr_director', label: 'HR Director' },
        { value: 'vp', label: 'VP' },
        { value: 'c_level', label: 'C-Level' },
        { value: 'other', label: 'Other' },
    ];

    const DECISION_AUTHORITY = [
        { value: 'gatekeeper', label: 'Gatekeeper' },
        { value: 'end_user', label: 'End User' },
        { value: 'key_influencer', label: 'Key Influencer' },
        { value: 'recommender', label: 'Recommender' },
        { value: 'final_decision_maker', label: 'Final Decision Maker' },
    ];

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative max-h-[90vh] flex flex-col">
                {/* Header */}
                <div className="p-6 pb-4 border-b border-stone-100">
                    <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                        <X size={24} />
                    </button>

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-rust text-white rounded-xl flex items-center justify-center">
                            <User size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-charcoal">Add Contact</h2>
                            {accountName && <p className="text-xs text-stone-500">for {accountName}</p>}
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="poc-form" onSubmit={handleSubmit} className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>First Name *</label>
                                <input
                                    required
                                    className={inputClass}
                                    placeholder="John"
                                    value={form.firstName}
                                    onChange={e => setForm({...form, firstName: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Last Name *</label>
                                <input
                                    required
                                    className={inputClass}
                                    placeholder="Smith"
                                    value={form.lastName}
                                    onChange={e => setForm({...form, lastName: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Job Title</label>
                                <input
                                    className={inputClass}
                                    placeholder="VP of Engineering"
                                    value={form.title}
                                    onChange={e => setForm({...form, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Role</label>
                                <select
                                    className={inputClass}
                                    value={form.role}
                                    onChange={e => setForm({...form, role: e.target.value as typeof form.role})}
                                >
                                    <option value="">Select...</option>
                                    {POC_ROLES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Email *</label>
                            <input
                                type="email"
                                required
                                className={inputClass}
                                placeholder="john@company.com"
                                value={form.email}
                                onChange={e => setForm({...form, email: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Phone</label>
                                <input
                                    type="tel"
                                    className={inputClass}
                                    placeholder="+1 (555) 123-4567"
                                    value={form.phone}
                                    onChange={e => setForm({...form, phone: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Contact Preference</label>
                                <select
                                    className={inputClass}
                                    value={form.preferredContactMethod}
                                    onChange={e => setForm({...form, preferredContactMethod: e.target.value as typeof form.preferredContactMethod})}
                                >
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="linkedin">LinkedIn</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>
                                <Linkedin size={10} className="inline mr-1" />
                                LinkedIn Profile
                            </label>
                            <input
                                className={inputClass}
                                placeholder="https://linkedin.com/in/johnsmith"
                                value={form.linkedinUrl}
                                onChange={e => setForm({...form, linkedinUrl: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Decision Authority</label>
                            <select
                                className={inputClass}
                                value={form.decisionAuthority}
                                onChange={e => setForm({...form, decisionAuthority: e.target.value as typeof form.decisionAuthority})}
                            >
                                <option value="">Select...</option>
                                {DECISION_AUTHORITY.map(d => <option key={d.value} value={d.value}>{d.label}</option>)}
                            </select>
                        </div>

                        <div className="flex items-center gap-3 p-3 bg-amber-50 rounded-xl border border-amber-200">
                            <input
                                type="checkbox"
                                id="isPrimary"
                                checked={form.isPrimary}
                                onChange={e => setForm({...form, isPrimary: e.target.checked})}
                                className="w-5 h-5 rounded border-stone-300 text-rust focus:ring-rust"
                            />
                            <label htmlFor="isPrimary" className="text-sm text-amber-800 font-medium">
                                Set as primary contact for this account
                            </label>
                        </div>

                        <div>
                            <label className={labelClass}>Notes</label>
                            <textarea
                                className={`${inputClass} min-h-[60px]`}
                                placeholder="Add any notes about this contact..."
                                value={form.notes}
                                onChange={e => setForm({...form, notes: e.target.value})}
                            />
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
                            form="poc-form"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-rust text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-charcoal transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Adding...
                                </>
                            ) : (
                                'Add Contact'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

interface ConvertOutcomeProps {
    deal: Deal;
    onClose: () => void;
    onConvert: (type: 'account' | 'bench' | 'academy', data: Record<string, unknown>) => void;
    prefillData?: { name: string, email?: string };
}

export const ConvertOutcomeModal: React.FC<ConvertOutcomeProps> = ({ deal, onClose, onConvert, prefillData }) => {
    const [selectedPath, setSelectedPath] = useState<'account' | 'bench' | 'academy'>('account');
    
    // Form States
    const [accountName, setAccountName] = useState(deal.company);
    const [candidateName, setCandidateName] = useState(prefillData?.name || '');
    const [startCohort, setStartCohort] = useState('Nov 2025');

    const handleExecute = () => {
        if (selectedPath === 'account') {
            onConvert('account', { name: accountName });
        } else if (selectedPath === 'bench') {
            onConvert('bench', { name: candidateName });
        } else {
            onConvert('academy', { name: candidateName, cohort: startCohort });
        }
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-2xl rounded-[2.5rem] p-10 shadow-2xl relative flex flex-col max-h-[90vh]">
                <button onClick={onClose} className="absolute top-8 right-8 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>

                <div className="mb-8">
                    <div className="text-green-600 font-bold text-xs uppercase tracking-[0.2em] mb-2">Deal Won</div>
                    <h2 className="text-3xl font-serif font-bold text-charcoal">Convert Outcome</h2>
                    <p className="text-stone-500 mt-2">Where should this relationship go next?</p>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-8">
                    <button 
                        onClick={() => setSelectedPath('account')}
                        className={`p-6 rounded-2xl border-2 text-center transition-all group ${selectedPath === 'account' ? 'border-charcoal bg-stone-50' : 'border-stone-100 hover:border-stone-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedPath === 'account' ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <Building2 size={20} />
                        </div>
                        <div className="font-bold text-charcoal text-sm">Client Account</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Recruiting</div>
                    </button>

                    <button 
                        onClick={() => setSelectedPath('bench')}
                        className={`p-6 rounded-2xl border-2 text-center transition-all group ${selectedPath === 'bench' ? 'border-rust bg-rust/5' : 'border-stone-100 hover:border-stone-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedPath === 'bench' ? 'bg-rust text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <User size={20} />
                        </div>
                        <div className="font-bold text-charcoal text-sm">Bench Consultant</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Staffing</div>
                    </button>

                    <button 
                        onClick={() => setSelectedPath('academy')}
                        className={`p-6 rounded-2xl border-2 text-center transition-all group ${selectedPath === 'academy' ? 'border-blue-600 bg-blue-50' : 'border-stone-100 hover:border-stone-300'}`}
                    >
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4 ${selectedPath === 'academy' ? 'bg-blue-600 text-white' : 'bg-stone-100 text-stone-400'}`}>
                            <GraduationCap size={20} />
                        </div>
                        <div className="font-bold text-charcoal text-sm">Academy Student</div>
                        <div className="text-[10px] text-stone-400 uppercase tracking-widest mt-1">Training</div>
                    </button>
                </div>

                <div className="flex-1 bg-stone-50 rounded-2xl p-6 mb-8 border border-stone-100">
                    {selectedPath === 'account' && (
                        <div className="animate-fade-in">
                            <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">New Account Name</label>
                            <input 
                                value={accountName} 
                                onChange={(e) => setAccountName(e.target.value)}
                                className="w-full p-4 bg-white border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-charcoal"
                            />
                            <p className="text-xs text-stone-500 mt-3">Will be added to CRM as an Active Account with &apos;Direct Client&apos; status.</p>
                        </div>
                    )}

                    {selectedPath === 'bench' && (
                        <div className="animate-fade-in space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Consultant Name</label>
                                <input 
                                    value={candidateName} 
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    className="w-full p-4 bg-white border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-rust"
                                />
                            </div>
                            <p className="text-xs text-stone-500">Candidate will be onboarded to Internal Bench and visible in Talent Board.</p>
                        </div>
                    )}

                    {selectedPath === 'academy' && (
                        <div className="animate-fade-in space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Student Name</label>
                                <input 
                                    value={candidateName} 
                                    onChange={(e) => setCandidateName(e.target.value)}
                                    className="w-full p-4 bg-white border border-stone-200 rounded-xl font-bold text-charcoal focus:outline-none focus:border-blue-600"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Assign to Cohort</label>
                                <select 
                                    value={startCohort}
                                    onChange={(e) => setStartCohort(e.target.value)}
                                    className="w-full p-4 bg-white border border-stone-200 rounded-xl font-medium text-charcoal focus:outline-none focus:border-blue-600"
                                >
                                    <option>Nov 2025</option>
                                    <option>Jan 2026</option>
                                    <option>Self-Paced</option>
                                </select>
                            </div>
                        </div>
                    )}
                </div>

                <button
                    onClick={handleExecute}
                    className="w-full py-4 bg-green-600 text-white rounded-xl text-sm font-bold uppercase tracking-widest hover:bg-green-700 transition-all shadow-lg flex items-center justify-center gap-2"
                >
                    <CheckCircle size={18} /> Confirm Conversion
                </button>
            </div>
        </div>
    );
};

// ============================================
// CREATE DEAL FROM ACCOUNT MODAL
// ============================================
export const CreateDealFromAccountModal: React.FC<{
    accountId: string;
    accountName: string;
    onClose: () => void;
    onSuccess?: (dealId: string) => void;
}> = ({ accountId, accountName, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        stage: 'discovery' as 'discovery' | 'qualification' | 'proposal' | 'negotiation' | 'closed_won' | 'closed_lost',
        value: '',
        probability: '20',
        expectedCloseDate: '',
        description: '',
        dealType: 'new_business' as 'new_business' | 'expansion' | 'renewal',
    });

    // Fetch contacts (POCs) for this account
    const { data: pocs = [] } = trpc.crm.contacts.list.useQuery(
        { accountId },
        { enabled: !!accountId }
    );

    const [selectedPocId, setSelectedPocId] = useState<string>('');

    // Create deal mutation
    const createDealMutation = trpc.crm.deals.create.useMutation({
        onSuccess: (deal) => {
            onSuccess?.(deal.id);
            onClose();
        },
        onError: (err) => {
            setError(err.message || 'Failed to create deal');
            setIsSubmitting(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            await createDealMutation.mutateAsync({
                accountId,
                title: form.title,
                stage: form.stage,
                value: form.value ? parseFloat(form.value.replace(/[^0-9.]/g, '')) : undefined,
                probability: parseInt(form.probability),
                expectedCloseDate: form.expectedCloseDate ? new Date(form.expectedCloseDate) : undefined,
                description: form.description || undefined,
            });
        } catch (err) {
            console.error('Failed to create deal:', err);
        }
    };

    const stageOptions = [
        { value: 'prospect', label: 'Prospect', probability: 20 },
        { value: 'discovery', label: 'Discovery', probability: 40 },
        { value: 'proposal', label: 'Proposal', probability: 60 },
        { value: 'negotiation', label: 'Negotiation', probability: 80 },
    ];

    const dealTypes = [
        { value: 'new_business', label: 'New Business' },
        { value: 'expansion', label: 'Expansion' },
        { value: 'renewal', label: 'Renewal' },
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

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
                            <DollarSign size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-charcoal">New Deal</h2>
                            <p className="text-xs text-stone-500">for {accountName}</p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="deal-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={labelClass}>Deal Title *</label>
                            <input
                                required
                                className={inputClass}
                                placeholder="e.g. Q1 2025 Staff Augmentation"
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Deal Type</label>
                                <select
                                    className={inputClass}
                                    value={form.dealType}
                                    onChange={e => setForm({...form, dealType: e.target.value as typeof form.dealType})}
                                >
                                    {dealTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Stage</label>
                                <select
                                    className={inputClass}
                                    value={form.stage}
                                    onChange={e => {
                                        const stage = e.target.value as typeof form.stage;
                                        const stageInfo = stageOptions.find(s => s.value === stage);
                                        setForm({
                                            ...form,
                                            stage,
                                            probability: stageInfo?.probability.toString() || form.probability
                                        });
                                    }}
                                >
                                    {stageOptions.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                                </select>
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Deal Value ($)</label>
                                <input
                                    className={inputClass}
                                    placeholder="50,000"
                                    value={form.value}
                                    onChange={e => setForm({...form, value: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Probability (%)</label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    className={inputClass}
                                    value={form.probability}
                                    onChange={e => setForm({...form, probability: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Expected Close Date</label>
                            <input
                                type="date"
                                className={inputClass}
                                value={form.expectedCloseDate}
                                onChange={e => setForm({...form, expectedCloseDate: e.target.value})}
                            />
                        </div>

                        {pocs.length > 0 && (
                            <div>
                                <label className={labelClass}>Primary Contact</label>
                                <select
                                    className={inputClass}
                                    value={selectedPocId}
                                    onChange={e => setSelectedPocId(e.target.value)}
                                >
                                    <option value="">Select contact...</option>
                                    {pocs.map(poc => (
                                        <option key={poc.id} value={poc.id}>
                                            {poc.firstName} {poc.lastName} - {poc.title || 'No Title'}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                className={`${inputClass} min-h-[80px]`}
                                placeholder="Deal details, requirements, notes..."
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                            />
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
                            form="deal-form"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-green-600 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-green-700 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Deal'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

// ============================================
// CREATE JOB FROM ACCOUNT MODAL
// ============================================
export const CreateJobFromAccountModal: React.FC<{
    accountId: string;
    accountName: string;
    onClose: () => void;
    onSuccess?: (jobId: string) => void;
}> = ({ accountId, accountName, onClose, onSuccess }) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const [form, setForm] = useState({
        title: '',
        description: '',
        jobType: 'contract' as 'contract' | 'fulltime' | 'contract_to_hire',
        location: '',
        isRemote: false,
        rateMin: '',
        rateMax: '',
        rateType: 'hourly' as 'hourly' | 'annual',
        status: 'draft' as 'draft' | 'open',
        positionsCount: '1',
        urgency: 'medium' as 'low' | 'medium' | 'high' | 'urgent',
        requiredSkills: '',
        minExperienceYears: '',
    });

    // Fetch deals for this account (to optionally link job to deal)
    const { data: deals = [] } = trpc.crm.deals.list.useQuery(
        { accountId },
        { enabled: !!accountId }
    );

    const [selectedDealId, setSelectedDealId] = useState<string>('');

    // Create job mutation
    const createJobMutation = trpc.ats.jobs.create.useMutation({
        onSuccess: (job) => {
            onSuccess?.(job.id);
            onClose();
        },
        onError: (err) => {
            setError(err.message || 'Failed to create job');
            setIsSubmitting(false);
        }
    });

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setError(null);

        try {
            const skillsArray = form.requiredSkills
                .split(',')
                .map(s => s.trim())
                .filter(s => s.length > 0);

            await createJobMutation.mutateAsync({
                accountId,
                dealId: selectedDealId || undefined,
                title: form.title,
                description: form.description || undefined,
                jobType: form.jobType,
                location: form.location || undefined,
                isRemote: form.isRemote,
                rateMin: form.rateMin ? parseFloat(form.rateMin) : undefined,
                rateMax: form.rateMax ? parseFloat(form.rateMax) : undefined,
                rateType: form.rateType,
                status: form.status,
                positionsCount: parseInt(form.positionsCount) || 1,
                urgency: form.urgency,
                requiredSkills: skillsArray.length > 0 ? skillsArray : undefined,
                minExperienceYears: form.minExperienceYears ? parseInt(form.minExperienceYears) : undefined,
            });
        } catch (err) {
            console.error('Failed to create job:', err);
        }
    };

    const jobTypes = [
        { value: 'contract', label: 'Contract' },
        { value: 'fulltime', label: 'Full-Time' },
        { value: 'contract_to_hire', label: 'Contract-to-Hire' },
    ];

    const urgencyLevels = [
        { value: 'low', label: 'Low', color: 'bg-stone-100 text-stone-600' },
        { value: 'medium', label: 'Medium', color: 'bg-amber-100 text-amber-700' },
        { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-700' },
        { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-700' },
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

                    <div className="flex items-center gap-3 mb-2">
                        <div className="w-10 h-10 bg-amber-100 text-amber-600 rounded-xl flex items-center justify-center">
                            <Building2 size={20} />
                        </div>
                        <div>
                            <h2 className="text-xl font-serif font-bold text-charcoal">New Job</h2>
                            <p className="text-xs text-stone-500">for {accountName}</p>
                        </div>
                    </div>
                </div>

                {/* Form Content */}
                <div className="flex-1 overflow-y-auto p-6">
                    <form id="job-form" onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label className={labelClass}>Job Title *</label>
                            <input
                                required
                                className={inputClass}
                                placeholder="e.g. Senior Java Developer"
                                value={form.title}
                                onChange={e => setForm({...form, title: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className={labelClass}>Job Type</label>
                                <select
                                    className={inputClass}
                                    value={form.jobType}
                                    onChange={e => setForm({...form, jobType: e.target.value as typeof form.jobType})}
                                >
                                    {jobTypes.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className={labelClass}>Positions</label>
                                <input
                                    type="number"
                                    min="1"
                                    className={inputClass}
                                    value={form.positionsCount}
                                    onChange={e => setForm({...form, positionsCount: e.target.value})}
                                />
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Location</label>
                            <div className="flex gap-3">
                                <input
                                    className={`${inputClass} flex-1`}
                                    placeholder="City, State or Remote"
                                    value={form.location}
                                    onChange={e => setForm({...form, location: e.target.value})}
                                />
                                <label className="flex items-center gap-2 px-4 bg-stone-50 border border-stone-200 rounded-xl cursor-pointer">
                                    <input
                                        type="checkbox"
                                        checked={form.isRemote}
                                        onChange={e => setForm({...form, isRemote: e.target.checked})}
                                        className="w-4 h-4 text-rust focus:ring-rust"
                                    />
                                    <span className="text-xs font-bold text-stone-600">Remote</span>
                                </label>
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4">
                            <div>
                                <label className={labelClass}>Rate Min ($)</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    placeholder="50"
                                    value={form.rateMin}
                                    onChange={e => setForm({...form, rateMin: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Rate Max ($)</label>
                                <input
                                    type="number"
                                    className={inputClass}
                                    placeholder="75"
                                    value={form.rateMax}
                                    onChange={e => setForm({...form, rateMax: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className={labelClass}>Rate Type</label>
                                <select
                                    className={inputClass}
                                    value={form.rateType}
                                    onChange={e => setForm({...form, rateType: e.target.value as typeof form.rateType})}
                                >
                                    <option value="hourly">Hourly</option>
                                    <option value="annual">Annual</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Urgency</label>
                            <div className="flex gap-2">
                                {urgencyLevels.map(u => (
                                    <button
                                        key={u.value}
                                        type="button"
                                        onClick={() => setForm({...form, urgency: u.value as typeof form.urgency})}
                                        className={`flex-1 px-3 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                                            form.urgency === u.value
                                                ? `${u.color} border-current`
                                                : 'bg-white text-stone-400 border-stone-200 hover:border-stone-300'
                                        }`}
                                    >
                                        {u.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div>
                            <label className={labelClass}>Required Skills (comma separated)</label>
                            <input
                                className={inputClass}
                                placeholder="Java, Spring Boot, AWS, Microservices"
                                value={form.requiredSkills}
                                onChange={e => setForm({...form, requiredSkills: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Min Experience (years)</label>
                            <input
                                type="number"
                                min="0"
                                className={inputClass}
                                placeholder="5"
                                value={form.minExperienceYears}
                                onChange={e => setForm({...form, minExperienceYears: e.target.value})}
                            />
                        </div>

                        {deals.length > 0 && (
                            <div>
                                <label className={labelClass}>Link to Deal (Optional)</label>
                                <select
                                    className={inputClass}
                                    value={selectedDealId}
                                    onChange={e => setSelectedDealId(e.target.value)}
                                >
                                    <option value="">No deal selected</option>
                                    {deals.map(deal => (
                                        <option key={deal.id} value={deal.id}>
                                            {deal.title} - ${Number(deal.value).toLocaleString()}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        )}

                        <div>
                            <label className={labelClass}>Description</label>
                            <textarea
                                className={`${inputClass} min-h-[80px]`}
                                placeholder="Job requirements, responsibilities, etc..."
                                value={form.description}
                                onChange={e => setForm({...form, description: e.target.value})}
                            />
                        </div>

                        <div>
                            <label className={labelClass}>Initial Status</label>
                            <div className="flex gap-3">
                                <button
                                    type="button"
                                    onClick={() => setForm({...form, status: 'draft'})}
                                    className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                                        form.status === 'draft'
                                            ? 'bg-stone-100 text-stone-700 border-stone-300'
                                            : 'bg-white text-stone-400 border-stone-200'
                                    }`}
                                >
                                    Save as Draft
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setForm({...form, status: 'open'})}
                                    className={`flex-1 px-4 py-2 rounded-lg text-xs font-bold border-2 transition-all ${
                                        form.status === 'open'
                                            ? 'bg-green-100 text-green-700 border-green-300'
                                            : 'bg-white text-stone-400 border-stone-200'
                                    }`}
                                >
                                    Open Immediately
                                </button>
                            </div>
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
                            form="job-form"
                            disabled={isSubmitting}
                            className="flex-1 py-3 bg-amber-500 text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-amber-600 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {isSubmitting ? (
                                <>
                                    <Loader2 size={14} className="animate-spin" />
                                    Creating...
                                </>
                            ) : (
                                'Create Job'
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};
