'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter, useParams } from 'next/navigation';
import { useLead, useLeadActivities } from '@/hooks/queries/leads';
import { useUpdateLeadStatus, useConvertLead } from '@/hooks/mutations/leads';
import { ActivityComposer } from '@/components/crm/ActivityComposer';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import {
  ChevronLeft,
  Building2,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  ArrowRight,
  User,
  Linkedin,
  Globe,
  MapPin,
  Briefcase,
  DollarSign,
  Loader2,
  AlertCircle,
  X,
} from 'lucide-react';

type LeadStatus = 'new' | 'warm' | 'hot' | 'cold' | 'converted' | 'lost';

const STATUS_OPTIONS: { value: LeadStatus; label: string; color: string }[] = [
  { value: 'new', label: 'New', color: 'bg-stone-100 text-stone-600' },
  { value: 'warm', label: 'Warm', color: 'bg-orange-100 text-orange-600' },
  { value: 'hot', label: 'Hot', color: 'bg-red-100 text-red-600' },
  { value: 'cold', label: 'Cold', color: 'bg-blue-100 text-blue-600' },
  { value: 'converted', label: 'Converted', color: 'bg-green-100 text-green-600' },
  { value: 'lost', label: 'Lost', color: 'bg-gray-100 text-gray-600' },
];

const LOST_REASONS = [
  'Not a fit',
  'Budget constraints',
  'Went with competitor',
  'No response',
  'Timing not right',
  'Other',
];

export const LeadDetail: React.FC = () => {
  const params = useParams();
  const leadId = params.id as string;
  const router = useRouter();

  // Fetch lead data from database
  const { leadRaw: lead, isLoading, isError, error } = useLead(leadId);
  const { activities, isLoading: activitiesLoading } = useLeadActivities(leadId);

  // Mutations
  const updateStatus = useUpdateLeadStatus();
  const convertLead = useConvertLead();

  // Local state for modals
  const [showLostModal, setShowLostModal] = useState(false);
  const [lostReason, setLostReason] = useState('');
  const [customLostReason, setCustomLostReason] = useState('');
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [convertFormData, setConvertFormData] = useState({
    dealTitle: '',
    dealValue: '',
    createAccount: true,
  });

  // Handle status change
  const handleStatusChange = (newStatus: LeadStatus) => {
    if (newStatus === 'lost') {
      setShowLostModal(true);
      return;
    }

    if (newStatus === 'converted') {
      setShowConvertModal(true);
      return;
    }

    updateStatus.mutate({ id: leadId, status: newStatus });
  };

  // Handle lost confirmation
  const handleConfirmLost = () => {
    const reason = lostReason === 'Other' ? customLostReason : lostReason;
    updateStatus.mutate(
      { id: leadId, status: 'lost', lostReason: reason },
      { onSuccess: () => setShowLostModal(false) }
    );
  };

  // Handle convert to deal
  const handleConvertToDeal = () => {
    if (!convertFormData.dealTitle || !convertFormData.dealValue) return;

    convertLead.mutate(
      {
        leadId,
        dealTitle: convertFormData.dealTitle,
        dealValue: parseFloat(convertFormData.dealValue),
        createAccount: convertFormData.createAccount,
        accountName: lead?.companyName || undefined,
      },
      {
        onSuccess: (result) => {
          setShowConvertModal(false);
          router.push(`/employee/recruiting/deals/${result.deal.id}`);
        },
      }
    );
  };

  // Format currency
  const formatCurrency = (value: string | number | null | undefined) => {
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (!num) return '$0';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(num);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <Loader2 className="animate-spin text-rust" size={48} />
      </div>
    );
  }

  // Error state
  if (isError || !lead) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-500 font-medium">Lead not found</p>
        <p className="text-stone-400 text-sm mt-2">
          {error?.message || `ID: ${leadId}`}
        </p>
        <Link
          href="/employee/recruiting/leads"
          className="inline-flex items-center gap-2 mt-4 text-rust hover:underline"
        >
          <ChevronLeft size={14} /> Back to Leads
        </Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      <Link
        href="/employee/recruiting/leads"
        className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest mb-6"
      >
        <ChevronLeft size={14} /> Back to Leads
      </Link>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left: Info Card */}
        <div className="w-full lg:w-1/3 space-y-6">
          <div className="bg-white p-8 rounded-[2rem] shadow-xl border border-stone-200 relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-32 bg-stone-100 z-0"></div>
            <div className="relative z-10 text-center">
              <div className="w-24 h-24 bg-white rounded-2xl flex items-center justify-center mx-auto mb-6 shadow-lg border border-stone-100">
                <Building2 size={40} className="text-rust" />
              </div>
              <h1 className="text-2xl font-serif font-bold text-charcoal mb-1">
                {lead.companyName || 'Unknown Company'}
              </h1>
              <p className="text-stone-500 text-sm mb-4 flex items-center justify-center gap-2">
                <User size={14} /> {lead.firstName} {lead.lastName}
              </p>

              {/* Status Dropdown */}
              <div className="mb-6">
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                  Status
                </label>
                <div className="flex flex-wrap justify-center gap-2" data-testid="status-dropdown">
                  {STATUS_OPTIONS.map((status) => (
                    <button
                      key={status.value}
                      onClick={() => handleStatusChange(status.value)}
                      disabled={updateStatus.isPending || lead.status === 'converted'}
                      data-testid={`status-${status.value}`}
                      className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest transition-all ${
                        lead.status === status.value
                          ? status.color + ' ring-2 ring-offset-2 ring-charcoal'
                          : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                      } ${lead.status === 'converted' ? 'cursor-not-allowed opacity-50' : ''}`}
                    >
                      {status.label}
                    </button>
                  ))}
                </div>
                <p data-testid="lead-status" className="sr-only">{lead.status}</p>
              </div>

              {lead.source && (
                <span className="inline-block px-3 py-1 bg-stone-50 text-stone-500 rounded-full text-[10px] font-bold uppercase tracking-widest border border-stone-100 mb-6">
                  Source: {lead.source}
                </span>
              )}

              <div className="space-y-4 text-left border-t border-stone-100 pt-6">
                {lead.email && (
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <Mail size={16} className="text-stone-400" />
                    <a href={`mailto:${lead.email}`} className="hover:text-rust">
                      {lead.email}
                    </a>
                  </div>
                )}
                {lead.phone && (
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <Phone size={16} className="text-stone-400" />
                    <a href={`tel:${lead.phone}`} className="hover:text-rust">
                      {lead.phone}
                    </a>
                  </div>
                )}
                {lead.linkedinUrl && (
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <Linkedin size={16} className="text-stone-400" />
                    <a href={lead.linkedinUrl} target="_blank" rel="noopener noreferrer" className="hover:text-rust truncate">
                      LinkedIn Profile
                    </a>
                  </div>
                )}
                {lead.website && (
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <Globe size={16} className="text-stone-400" />
                    <a href={lead.website} target="_blank" rel="noopener noreferrer" className="hover:text-rust truncate">
                      {lead.website}
                    </a>
                  </div>
                )}
                {lead.headquarters && (
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <MapPin size={16} className="text-stone-400" />
                    <span>{lead.headquarters}</span>
                  </div>
                )}
                {lead.title && (
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <Briefcase size={16} className="text-stone-400" />
                    <span>{lead.title}</span>
                  </div>
                )}
                {lead.lastContactedAt && (
                  <div className="flex items-center gap-3 text-sm text-stone-600">
                    <Calendar size={16} className="text-stone-400" />
                    <span>
                      Last Contact: {new Date(lead.lastContactedAt).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>

              {/* Additional Details */}
              {(lead.industry || lead.companySize || lead.tier || lead.companyType) && (
                <div className="mt-6 pt-6 border-t border-stone-100 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                    Company Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    {lead.industry && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Industry</span>
                        <span className="text-charcoal">{lead.industry}</span>
                      </div>
                    )}
                    {lead.companySize && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Size</span>
                        <span className="text-charcoal">{lead.companySize}</span>
                      </div>
                    )}
                    {lead.tier && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Tier</span>
                        <span className="text-charcoal capitalize">{lead.tier}</span>
                      </div>
                    )}
                    {lead.companyType && (
                      <div className="flex justify-between">
                        <span className="text-stone-400">Type</span>
                        <span className="text-charcoal capitalize">{lead.companyType.replace(/_/g, ' ')}</span>
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Notes */}
              {lead.notes && (
                <div className="mt-6 pt-6 border-t border-stone-100 text-left">
                  <h4 className="text-xs font-bold uppercase tracking-widest text-stone-400 mb-3">
                    Notes
                  </h4>
                  <p className="text-sm text-stone-600 whitespace-pre-wrap">{lead.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Value Card */}
          <div className="bg-stone-900 text-white p-8 rounded-[2rem] shadow-lg">
            <div className="flex justify-between items-start mb-6">
              <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">
                Est. Value
              </h3>
              <div className="p-2 bg-white/10 rounded-lg text-green-400">
                <DollarSign size={16} />
              </div>
            </div>
            <div className="text-4xl font-serif font-bold mb-8">
              {formatCurrency(lead.estimatedValue)}
            </div>
            <button
              onClick={() => setShowConvertModal(true)}
              disabled={lead.status === 'converted' || lead.status === 'lost' || convertLead.isPending}
              className="w-full py-4 bg-white text-charcoal rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust hover:text-white transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {convertLead.isPending ? (
                <Loader2 size={14} className="animate-spin" />
              ) : lead.status === 'converted' ? (
                <>
                  <CheckCircle size={14} /> Converted
                </>
              ) : (
                <>
                  Convert to Deal <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right: Activity Area */}
        <div className="flex-1 space-y-6">
          {/* Activity Composer */}
          <ActivityComposer entityType="lead" entityId={leadId} />

          {/* Activity Timeline */}
          <ActivityTimeline activities={activities} isLoading={activitiesLoading} />
        </div>
      </div>

      {/* Lost Reason Modal */}
      {showLostModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-charcoal">Mark Lead as Lost</h3>
              <button onClick={() => setShowLostModal(false)} className="text-stone-400 hover:text-charcoal">
                <X size={20} />
              </button>
            </div>
            <p className="text-stone-600 mb-6">
              Select a reason for losing this lead to help improve future outreach.
            </p>
            <div className="space-y-2 mb-6">
              {LOST_REASONS.map((reason) => (
                <button
                  key={reason}
                  onClick={() => setLostReason(reason)}
                  className={`w-full p-3 text-left rounded-xl border transition-all ${
                    lostReason === reason
                      ? 'border-rust bg-rust/5 text-charcoal'
                      : 'border-stone-200 hover:border-stone-400'
                  }`}
                >
                  {reason}
                </button>
              ))}
            </div>
            {lostReason === 'Other' && (
              <input
                type="text"
                placeholder="Enter custom reason..."
                value={customLostReason}
                onChange={(e) => setCustomLostReason(e.target.value)}
                className="w-full p-3 border border-stone-200 rounded-xl mb-6 focus:outline-none focus:border-rust"
              />
            )}
            <div className="flex gap-4">
              <button
                onClick={() => setShowLostModal(false)}
                className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmLost}
                disabled={!lostReason || (lostReason === 'Other' && !customLostReason) || updateStatus.isPending}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50"
              >
                {updateStatus.isPending ? 'Saving...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Convert to Deal Modal */}
      {showConvertModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-charcoal">Convert to Deal</h3>
              <button onClick={() => setShowConvertModal(false)} className="text-stone-400 hover:text-charcoal">
                <X size={20} />
              </button>
            </div>
            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                  Deal Title
                </label>
                <input
                  type="text"
                  placeholder={`Deal with ${lead.companyName}`}
                  value={convertFormData.dealTitle}
                  onChange={(e) => setConvertFormData({ ...convertFormData, dealTitle: e.target.value })}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                />
              </div>
              <div>
                <label className="block text-xs font-bold uppercase tracking-widest text-stone-400 mb-2">
                  Deal Value ($)
                </label>
                <input
                  type="number"
                  placeholder={lead.estimatedValue || '0'}
                  value={convertFormData.dealValue}
                  onChange={(e) => setConvertFormData({ ...convertFormData, dealValue: e.target.value })}
                  className="w-full p-3 border border-stone-200 rounded-xl focus:outline-none focus:border-rust"
                />
              </div>
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id="createAccount"
                  checked={convertFormData.createAccount}
                  onChange={(e) => setConvertFormData({ ...convertFormData, createAccount: e.target.checked })}
                  className="w-5 h-5 rounded border-stone-300"
                />
                <label htmlFor="createAccount" className="text-sm text-stone-600">
                  Create Account from this lead
                </label>
              </div>
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setShowConvertModal(false)}
                className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleConvertToDeal}
                disabled={!convertFormData.dealTitle || !convertFormData.dealValue || convertLead.isPending}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {convertLead.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Converting...
                  </>
                ) : (
                  <>
                    Convert <ArrowRight size={14} />
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
