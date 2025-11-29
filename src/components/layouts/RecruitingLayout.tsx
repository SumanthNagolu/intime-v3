'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Target, DollarSign, Briefcase, List, Plus, X, Loader2, Calendar } from 'lucide-react';
import { CreateLeadModal } from '../recruiting/Modals';
import { useAppStore } from '../../lib/store';
import { Lead, Account } from '../../types';
import { useAccounts } from '@/hooks/queries/accounts';
import { useCreateDeal } from '@/hooks/mutations/deals';

interface RecruitingLayoutProps {
  children: React.ReactNode;
}

export const RecruitingLayout: React.FC<RecruitingLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { addLead, addAccount } = useAppStore();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);

  // New Deal Modal State
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealValue, setNewDealValue] = useState('');
  const [newDealAccountId, setNewDealAccountId] = useState('');
  const [newDealDescription, setNewDealDescription] = useState('');
  const [newDealExpectedClose, setNewDealExpectedClose] = useState('');

  const isActive = (path: string) => pathname.includes(path);
  const isLeadsPage = pathname.includes('/leads');
  const isDealsPage = pathname.includes('/deals') && !pathname.includes('/deals/');

  // Fetch accounts for deal modal
  const { accounts } = useAccounts({ limit: 100, enabled: showDealModal });
  const createDeal = useCreateDeal();

  const handleCreateLead = (newLead: Lead, newAccount?: Account) => {
    // If a company lead was created, also add the account
    if (newAccount) {
      addAccount(newAccount);
    }
    addLead(newLead);
  };

  const handleCreateDeal = async () => {
    if (!newDealTitle.trim()) return;

    try {
      const result = await createDeal.mutateAsync({
        title: newDealTitle.trim(),
        value: newDealValue ? parseFloat(newDealValue) : undefined,
        accountId: newDealAccountId || undefined,
        description: newDealDescription.trim() || undefined,
        expectedCloseDate: newDealExpectedClose ? new Date(newDealExpectedClose) : undefined,
        stage: 'discovery',
        probability: 10,
      });

      // Reset form and close modal
      setShowDealModal(false);
      setNewDealTitle('');
      setNewDealValue('');
      setNewDealAccountId('');
      setNewDealDescription('');
      setNewDealExpectedClose('');

      // Navigate to the new deal
      router.push(`/employee/recruiting/deals/${result.id}`);
    } catch (error) {
      console.error('Failed to create deal:', error);
      alert('Failed to create deal. Please try again.');
    }
  };

  const handleActionClick = () => {
    if (isLeadsPage) {
      setShowLeadModal(true);
    } else if (isDealsPage) {
      setShowDealModal(true);
    } else {
      router.push('/employee/recruiting/post');
    }
  };

  const getActionButtonLabel = () => {
    if (isLeadsPage) return 'New Lead';
    if (isDealsPage) return 'New Deal';
    return 'New Requisition';
  };

  return (
    <div className="pt-4">
      {/* Context Navigation Header */}
      <div className="mb-10 border-b border-stone-200 pb-0">
        <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-6">
          <div>
            <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-2">Internal Recruiting</div>
            <h1 className="text-4xl font-serif font-bold text-charcoal">Recruiter Workspace</h1>
          </div>
          <button
            onClick={handleActionClick}
            className="px-6 py-3 bg-charcoal text-white font-bold text-sm uppercase tracking-wider rounded-lg hover:bg-rust transition-colors flex items-center gap-2"
          >
            <Plus size={18} />
            {getActionButtonLabel()}
          </button>
        </div>

        {/* Persistent Sub Navigation */}
        <div className="flex gap-8 overflow-x-auto">
          <Link
            href="/employee/recruiting/dashboard"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('dashboard') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <LayoutDashboard size={14} /> Console
          </Link>
          <Link
            href="/employee/recruiting/accounts"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('accounts') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Building2 size={14} /> Accounts
          </Link>
          <Link
            href="/employee/recruiting/leads"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('leads') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Target size={14} /> Leads
          </Link>
          <Link
            href="/employee/recruiting/deals"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('deals') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <DollarSign size={14} /> Deals
          </Link>
          <Link
            href="/employee/recruiting/jobs"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('jobs') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Briefcase size={14} /> Jobs
          </Link>
          <Link
            href="/employee/recruiting/pipeline"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('pipeline') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <List size={14} /> Pipeline
          </Link>
        </div>
      </div>

      {/* Page Content */}
      {children}

      {/* Create Lead Modal */}
      {showLeadModal && (
        <CreateLeadModal
          onClose={() => setShowLeadModal(false)}
          onSave={handleCreateLead}
        />
      )}

      {/* Create Deal Modal */}
      {showDealModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-lg w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-serif font-bold text-charcoal flex items-center gap-2">
                <Briefcase className="text-rust" size={20} /> New Deal
              </h3>
              <button
                onClick={() => setShowDealModal(false)}
                className="text-stone-400 hover:text-charcoal"
              >
                <X size={20} />
              </button>
            </div>

            <div className="space-y-4">
              {/* Deal Title */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                  Deal Title *
                </label>
                <input
                  type="text"
                  value={newDealTitle}
                  onChange={(e) => setNewDealTitle(e.target.value)}
                  placeholder="e.g., Software Development Contract"
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  autoFocus
                />
              </div>

              {/* Account Selection */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                  Account <span className="font-normal text-stone-400">(optional)</span>
                </label>
                <select
                  value={newDealAccountId}
                  onChange={(e) => setNewDealAccountId(e.target.value)}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust bg-white"
                >
                  <option value="">Select an account...</option>
                  {accounts.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Deal Value */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                  Deal Value <span className="font-normal text-stone-400">(optional)</span>
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                  <input
                    type="number"
                    value={newDealValue}
                    onChange={(e) => setNewDealValue(e.target.value)}
                    placeholder="0"
                    className="w-full pl-8 p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  />
                </div>
              </div>

              {/* Expected Close Date */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                  Expected Close Date <span className="font-normal text-stone-400">(optional)</span>
                </label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
                  <input
                    type="date"
                    value={newDealExpectedClose}
                    onChange={(e) => setNewDealExpectedClose(e.target.value)}
                    className="w-full pl-10 p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  />
                </div>
              </div>

              {/* Description */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                  Description <span className="font-normal text-stone-400">(optional)</span>
                </label>
                <textarea
                  value={newDealDescription}
                  onChange={(e) => setNewDealDescription(e.target.value)}
                  placeholder="Brief description of the deal..."
                  rows={3}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                />
              </div>
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-6 mb-6">
              <p className="text-xs text-blue-700">
                New deals start in <span className="font-bold">Discovery</span> stage with 10% probability. You can update the stage and other details after creation.
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-4">
              <button
                onClick={() => setShowDealModal(false)}
                className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateDeal}
                disabled={!newDealTitle.trim() || createDeal.isPending}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createDeal.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Create Deal
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
