'use client';


import React, { useState } from 'react';
import { X, Building2, GraduationCap, User, CheckCircle, Search, Linkedin, Globe, MapPin, DollarSign, Users, ChevronDown, ChevronUp, Loader2 } from 'lucide-react';
import { Lead, Deal, Account, Candidate } from '../../types';
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

export const CreateLeadModal: React.FC<{ onClose: () => void, onSave: (lead: Lead, account?: Account) => void }> = ({ onClose, onSave }) => {
    const { accounts, addLead } = useAppStore();
    const [leadType, setLeadType] = useState<LeadType>('company');
    const [selectedAccountId, setSelectedAccountId] = useState<string>('');
    const [showAccountSearch, setShowAccountSearch] = useState(false);
    const [accountSearch, setAccountSearch] = useState('');
    const [showAdvanced, setShowAdvanced] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);

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
                contact: dbLead.fullName || dbLead.companyName || '',
                status: dbLead.status as any,
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

    const filteredAccounts = accounts.filter(a =>
        a.name.toLowerCase().includes(accountSearch.toLowerCase())
    );

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
            const leadData: any = {
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
                                                    <div className="text-[10px] text-stone-400">{selectedAccount.industry} • {selectedAccount.type}</div>
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

export const CreateDealModal: React.FC<{ leads: any[], onClose: () => void, onSave: (deal: Deal) => void }> = ({ leads, onClose, onSave }) => {
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

export const CreateAccountModal: React.FC<{ onClose: () => void, onSave: (account: Account) => void }> = ({ onClose, onSave }) => {
    const [form, setForm] = useState({
        name: '',
        industry: '',
        type: 'Direct Client'
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newAccount: Account = {
            id: `a${Date.now()}`,
            ...form,
            status: 'Prospect',
            accountManagerId: 'current-user',
            responsiveness: 'Medium',
            preference: 'Quality',
            pocs: [],
            type: form.type as any
        };
        onSave(newAccount);
        onClose();
    };

    return (
        <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
            <div className="bg-white w-full max-w-lg rounded-[2rem] p-8 shadow-2xl relative">
                <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal transition-colors">
                    <X size={24} />
                </button>
                
                <h2 className="text-2xl font-serif font-bold text-charcoal mb-6">Add Account</h2>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Account Name</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.name} onChange={e => setForm({...form, name: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Industry</label>
                        <input required className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.industry} onChange={e => setForm({...form, industry: e.target.value})} />
                    </div>
                    <div>
                        <label className="block text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">Type</label>
                        <select className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust" value={form.type} onChange={e => setForm({...form, type: e.target.value})}>
                            <option>Direct Client</option>
                            <option>Implementation Partner</option>
                            <option>MSP/VMS</option>
                        </select>
                    </div>
                    <div className="flex gap-3 mt-6">
                        <button type="button" onClick={onClose} className="flex-1 py-3 text-stone-500 font-bold text-xs uppercase tracking-widest hover:bg-stone-50 rounded-xl">Cancel</button>
                        <button type="submit" className="flex-1 py-3 bg-charcoal text-white font-bold text-xs uppercase tracking-widest rounded-xl hover:bg-rust transition-colors shadow-lg">Save Account</button>
                    </div>
                </form>
            </div>
        </div>
    );
};

interface ConvertOutcomeProps {
    deal: Deal;
    onClose: () => void;
    onConvert: (type: 'account' | 'bench' | 'academy', data: any) => void;
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
                            <p className="text-xs text-stone-500 mt-3">Will be added to CRM as an Active Account with 'Direct Client' status.</p>
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
