'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { LayoutDashboard, Building2, Target, DollarSign, Briefcase, List, Plus, X, Loader2, Calendar, Users, Send, Search, MapPin, User, ChevronRight } from 'lucide-react';
import { CreateLeadModal, CreateAccountModal } from '../recruiting/Modals';
import { useAppStore } from '../../lib/store';
import { Lead, Account } from '../../types';
import { useAccounts } from '@/hooks/queries/accounts';
import { useCreateDeal } from '@/hooks/mutations/deals';
import { trpc } from '@/lib/trpc/client';

// Visa badge colors
const VISA_COLORS: Record<string, string> = {
  H1B: 'bg-blue-100 text-blue-700',
  GC: 'bg-green-100 text-green-700',
  USC: 'bg-amber-100 text-amber-700',
  OPT: 'bg-purple-100 text-purple-700',
  CPT: 'bg-indigo-100 text-indigo-700',
  TN: 'bg-cyan-100 text-cyan-700',
  L1: 'bg-orange-100 text-orange-700',
  EAD: 'bg-teal-100 text-teal-700',
  Other: 'bg-stone-100 text-stone-700',
};

interface RecruitingLayoutProps {
  children: React.ReactNode;
}

export const RecruitingLayout: React.FC<RecruitingLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const { addLead, addAccount } = useAppStore();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [showDealModal, setShowDealModal] = useState(false);
  const [showAccountModal, setShowAccountModal] = useState(false);
  const [showSubmissionModal, setShowSubmissionModal] = useState(false);

  // New Deal Modal State
  const [newDealTitle, setNewDealTitle] = useState('');
  const [newDealValue, setNewDealValue] = useState('');
  const [newDealAccountId, setNewDealAccountId] = useState('');
  const [newDealDescription, setNewDealDescription] = useState('');
  const [newDealExpectedClose, setNewDealExpectedClose] = useState('');

  // New Submission Modal State
  const [submissionStep, setSubmissionStep] = useState<'job' | 'talent'>('job');
  const [jobMode, setJobMode] = useState<'search' | 'create'>('search');
  const [talentMode, setTalentMode] = useState<'search' | 'create'>('search');
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const [selectedCandidateId, setSelectedCandidateId] = useState<string | null>(null);
  const [jobSearchTerm, setJobSearchTerm] = useState('');
  const [talentSearchTerm, setTalentSearchTerm] = useState('');
  const [submissionNotes, setSubmissionNotes] = useState('');

  // New Job form state
  const [newJob, setNewJob] = useState({
    title: '',
    accountId: '',
    jobType: 'contract' as 'contract' | 'fulltime' | 'contract_to_hire' | 'permanent' | 'temp',
    location: '',
    isRemote: true,
    rateMin: '',
  });

  // New Talent form state
  const [newTalent, setNewTalent] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    candidateLocation: '',
    candidateCurrentVisa: 'H1B' as 'H1B' | 'GC' | 'USC' | 'OPT' | 'CPT' | 'TN' | 'L1' | 'EAD' | 'Other',
    candidateHourlyRate: '',
    candidateSkills: [] as string[],
    candidateExperienceYears: 3,
    candidateAvailability: 'immediate' as 'immediate' | '2_weeks' | '1_month',
  });
  const [skillInput, setSkillInput] = useState('');

  const isActive = (path: string) => pathname.includes(path);
  const isLeadsPage = pathname.includes('/leads');
  const isDealsPage = pathname.includes('/deals');
  const isAccountsPage = pathname.includes('/accounts');
  const isTalentPage = pathname.includes('/talent');
  const isSubmissionsPage = pathname.includes('/submissions');

  // Fetch accounts for deal modal
  const { accounts } = useAccounts({ limit: 100, enabled: showDealModal || showSubmissionModal });
  const createDeal = useCreateDeal();

  // Fetch jobs for submission modal
  const { data: jobs = [], isLoading: loadingJobs, refetch: refetchJobs } = trpc.ats.jobs.list.useQuery(
    { status: 'open', limit: 50 },
    { enabled: showSubmissionModal }
  );

  // Fetch candidates for submission modal
  const { data: candidates = [], isLoading: loadingCandidates, refetch: refetchCandidates } = trpc.ats.candidates.search.useQuery(
    { limit: 50 },
    { enabled: showSubmissionModal }
  );

  // Create submission mutation
  const createSubmission = trpc.ats.submissions.create.useMutation({
    onSuccess: (data) => {
      setShowSubmissionModal(false);
      resetSubmissionModal();
      router.push(`/employee/recruiting/submissions/${data.id}`);
    },
  });

  // Create job mutation
  const createJob = trpc.ats.jobs.create.useMutation({
    onSuccess: (data) => {
      setSelectedJobId(data.id);
      refetchJobs();
      setJobMode('search');
      setNewJob({
        title: '',
        accountId: '',
        jobType: 'contract',
        location: '',
        isRemote: true,
        rateMin: '',
      });
    },
  });

  // Create candidate mutation
  const createCandidate = trpc.ats.candidates.create.useMutation({
    onSuccess: (data) => {
      setSelectedCandidateId(data.id);
      refetchCandidates();
      setTalentMode('search');
      setNewTalent({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        candidateLocation: '',
        candidateCurrentVisa: 'H1B',
        candidateHourlyRate: '',
        candidateSkills: [],
        candidateExperienceYears: 3,
        candidateAvailability: 'immediate',
      });
    },
  });

  const resetSubmissionModal = () => {
    setSubmissionStep('job');
    setJobMode('search');
    setTalentMode('search');
    setSelectedJobId(null);
    setSelectedCandidateId(null);
    setJobSearchTerm('');
    setTalentSearchTerm('');
    setSubmissionNotes('');
    setNewJob({
      title: '',
      accountId: '',
      jobType: 'contract',
      location: '',
      isRemote: true,
      rateMin: '',
    });
    setNewTalent({
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      candidateLocation: '',
      candidateCurrentVisa: 'H1B',
      candidateHourlyRate: '',
      candidateSkills: [],
      candidateExperienceYears: 3,
      candidateAvailability: 'immediate',
    });
    setSkillInput('');
  };

  const handleCreateSubmission = () => {
    if (!selectedJobId || !selectedCandidateId) return;
    createSubmission.mutate({
      jobId: selectedJobId,
      candidateId: selectedCandidateId,
      status: 'sourced',
      submissionNotes: submissionNotes || undefined,
    });
  };

  const handleCreateJob = () => {
    if (!newJob.title.trim()) return;
    createJob.mutate({
      title: newJob.title,
      accountId: newJob.accountId || undefined,
      jobType: newJob.jobType,
      location: newJob.location || undefined,
      isRemote: newJob.isRemote,
      rateMin: newJob.rateMin ? parseFloat(newJob.rateMin) : undefined,
      status: 'open',
    });
  };

  const handleCreateTalent = () => {
    if (!newTalent.firstName || !newTalent.lastName || !newTalent.email || newTalent.candidateSkills.length === 0) return;
    createCandidate.mutate({
      firstName: newTalent.firstName,
      lastName: newTalent.lastName,
      email: newTalent.email,
      phone: newTalent.phone || undefined,
      candidateLocation: newTalent.candidateLocation || undefined,
      candidateCurrentVisa: newTalent.candidateCurrentVisa,
      candidateHourlyRate: newTalent.candidateHourlyRate ? parseFloat(newTalent.candidateHourlyRate) : undefined,
      candidateSkills: newTalent.candidateSkills,
      candidateExperienceYears: newTalent.candidateExperienceYears,
      candidateAvailability: newTalent.candidateAvailability,
    });
  };

  const addSkill = () => {
    if (skillInput.trim() && !newTalent.candidateSkills.includes(skillInput.trim())) {
      setNewTalent(prev => ({
        ...prev,
        candidateSkills: [...prev.candidateSkills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setNewTalent(prev => ({
      ...prev,
      candidateSkills: prev.candidateSkills.filter(s => s !== skill)
    }));
  };

  // Filter jobs by search term
  const filteredJobs = jobSearchTerm
    ? jobs.filter(j => j.title?.toLowerCase().includes(jobSearchTerm.toLowerCase()))
    : jobs;

  // Filter candidates by search term
  const filteredCandidates = talentSearchTerm
    ? candidates.filter(c =>
        c.fullName?.toLowerCase().includes(talentSearchTerm.toLowerCase()) ||
        c.candidateSkills?.some(skill => skill.toLowerCase().includes(talentSearchTerm.toLowerCase()))
      )
    : candidates;

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
    } else if (isAccountsPage) {
      setShowAccountModal(true);
    } else if (isSubmissionsPage) {
      setShowSubmissionModal(true);
    } else if (isTalentPage) {
      router.push('/employee/recruiting/talent');
    } else {
      router.push('/employee/recruiting/post');
    }
  };

  const getActionButtonLabel = () => {
    if (isLeadsPage) return 'New Lead';
    if (isDealsPage) return 'New Deal';
    if (isAccountsPage) return 'New Account';
    if (isSubmissionsPage) return 'New Submission';
    if (isTalentPage) return 'Add Talent';
    return 'New Requisition';
  };

  const handleAccountCreated = (account: { id: string }) => {
    setShowAccountModal(false);
    router.push(`/employee/recruiting/accounts/${account.id}`);
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
            href="/employee/recruiting/talent"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('talent') && !isActive('submissions') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Users size={14} /> Talent
          </Link>
          <Link
            href="/employee/recruiting/submissions"
            className={`pb-4 text-xs font-bold uppercase tracking-widest border-b-2 transition-colors flex items-center gap-2 whitespace-nowrap ${
              isActive('submissions') ? 'border-rust text-rust' : 'border-transparent text-stone-400 hover:text-charcoal'
            }`}
          >
            <Send size={14} /> Submissions
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

      {/* Create Account Modal */}
      {showAccountModal && (
        <CreateAccountModal
          onClose={() => setShowAccountModal(false)}
          onSuccess={handleAccountCreated}
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

      {/* Create Submission Modal */}
      {showSubmissionModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h3 className="text-xl font-serif font-bold text-charcoal flex items-center gap-2">
                  <Send className="text-rust" size={20} /> New Submission
                </h3>
                <p className="text-sm text-stone-500 mt-1">Match a candidate to a job opening</p>
              </div>
              <button
                onClick={() => {
                  setShowSubmissionModal(false);
                  resetSubmissionModal();
                }}
                className="text-stone-400 hover:text-charcoal"
              >
                <X size={20} />
              </button>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center gap-4 mb-6">
              <button
                onClick={() => setSubmissionStep('job')}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  submissionStep === 'job'
                    ? 'bg-charcoal text-white'
                    : selectedJobId
                    ? 'bg-green-100 text-green-700'
                    : 'bg-stone-100 text-stone-500'
                }`}
              >
                <Briefcase size={14} />
                1. Select Job
                {selectedJobId && submissionStep !== 'job' && <span className="ml-1">✓</span>}
              </button>
              <ChevronRight size={16} className="text-stone-300" />
              <button
                onClick={() => selectedJobId && setSubmissionStep('talent')}
                disabled={!selectedJobId}
                className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-widest transition-all ${
                  submissionStep === 'talent'
                    ? 'bg-charcoal text-white'
                    : selectedCandidateId
                    ? 'bg-green-100 text-green-700'
                    : 'bg-stone-100 text-stone-500'
                } ${!selectedJobId ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <User size={14} />
                2. Select Talent
                {selectedCandidateId && submissionStep !== 'talent' && <span className="ml-1">✓</span>}
              </button>
            </div>

            {/* Job Selection Step */}
            {submissionStep === 'job' && (
              <>
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setJobMode('search')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      jobMode === 'search' ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Search size={14} /> Search Existing
                  </button>
                  <button
                    onClick={() => setJobMode('create')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      jobMode === 'create' ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Plus size={14} /> Create New
                  </button>
                </div>

                {jobMode === 'search' ? (
                  <>
                    <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 mb-4">
                      <Search size={18} className="text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search jobs by title..."
                        className="flex-1 bg-transparent outline-none text-sm"
                        value={jobSearchTerm}
                        onChange={(e) => setJobSearchTerm(e.target.value)}
                      />
                    </div>

                    {loadingJobs ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-stone-400" />
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                        {filteredJobs.length === 0 ? (
                          <div className="text-center py-8 text-stone-400">
                            <Briefcase size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No open jobs found</p>
                            <button
                              onClick={() => setJobMode('create')}
                              className="text-rust text-sm font-bold mt-2 hover:underline"
                            >
                              Create a new job
                            </button>
                          </div>
                        ) : (
                          filteredJobs.map((job) => (
                            <button
                              key={job.id}
                              onClick={() => setSelectedJobId(job.id)}
                              className={`w-full text-left p-4 rounded-xl border transition-all ${
                                selectedJobId === job.id
                                  ? 'border-rust bg-rust/5'
                                  : 'border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h4 className="font-bold text-charcoal">{job.title}</h4>
                                  <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                                      job.jobType === 'contract' ? 'bg-blue-100 text-blue-700' :
                                      job.jobType === 'fulltime' || job.jobType === 'permanent' ? 'bg-green-100 text-green-700' :
                                      'bg-purple-100 text-purple-700'
                                    }`}>
                                      {job.jobType?.replace('_', ' ').toUpperCase() || 'CONTRACT'}
                                    </span>
                                    {job.isRemote ? (
                                      <span className="flex items-center gap-1 text-blue-600">Remote</span>
                                    ) : job.location ? (
                                      <span className="flex items-center gap-1">
                                        <MapPin size={10} /> {job.location}
                                      </span>
                                    ) : null}
                                    {job.rateMin && (
                                      <span className="text-green-600 font-medium">${job.rateMin}/hr</span>
                                    )}
                                  </div>
                                </div>
                                {selectedJobId === job.id && (
                                  <div className="w-6 h-6 bg-rust rounded-full flex items-center justify-center text-white text-xs">✓</div>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 mb-4">
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Job Title *</label>
                      <input
                        type="text"
                        value={newJob.title}
                        onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                        placeholder="e.g., Senior React Developer"
                        className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Job Type</label>
                        <select
                          value={newJob.jobType}
                          onChange={(e) => setNewJob({ ...newJob, jobType: e.target.value as typeof newJob.jobType })}
                          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust bg-white"
                        >
                          <option value="contract">Contract</option>
                          <option value="fulltime">Full Time</option>
                          <option value="contract_to_hire">Contract to Hire</option>
                          <option value="permanent">Permanent</option>
                          <option value="temp">Temp</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Remote?</label>
                        <div className="flex items-center gap-4 p-3 border border-stone-200 rounded-xl">
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={newJob.isRemote}
                              onChange={() => setNewJob({ ...newJob, isRemote: true })}
                              className="text-rust"
                            />
                            <span className="text-sm">Remote</span>
                          </label>
                          <label className="flex items-center gap-2 cursor-pointer">
                            <input
                              type="radio"
                              checked={!newJob.isRemote}
                              onChange={() => setNewJob({ ...newJob, isRemote: false })}
                              className="text-rust"
                            />
                            <span className="text-sm">On-site/Hybrid</span>
                          </label>
                        </div>
                      </div>
                    </div>
                    {!newJob.isRemote && (
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Location</label>
                        <input
                          type="text"
                          value={newJob.location}
                          onChange={(e) => setNewJob({ ...newJob, location: e.target.value })}
                          placeholder="City, State"
                          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                        />
                      </div>
                    )}
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Client/Account</label>
                        <select
                          value={newJob.accountId}
                          onChange={(e) => setNewJob({ ...newJob, accountId: e.target.value })}
                          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust bg-white"
                        >
                          <option value="">Select account...</option>
                          {accounts.map((account) => (
                            <option key={account.id} value={account.id}>{account.name}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Rate (min)</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                          <input
                            type="number"
                            value={newJob.rateMin}
                            onChange={(e) => setNewJob({ ...newJob, rateMin: e.target.value })}
                            placeholder="0"
                            className="w-full pl-8 p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                          />
                          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 text-sm">/hr</span>
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={handleCreateJob}
                      disabled={!newJob.title.trim() || createJob.isPending}
                      className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {createJob.isPending ? (
                        <><Loader2 size={14} className="animate-spin" /> Creating...</>
                      ) : (
                        <><Plus size={14} /> Create Job & Select</>
                      )}
                    </button>
                  </div>
                )}

                <div className="flex gap-4">
                  <button
                    onClick={() => {
                      setShowSubmissionModal(false);
                      resetSubmissionModal();
                    }}
                    className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => setSubmissionStep('talent')}
                    disabled={!selectedJobId}
                    className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    Next: Select Talent <ChevronRight size={14} />
                  </button>
                </div>
              </>
            )}

            {/* Talent Selection Step */}
            {submissionStep === 'talent' && (
              <>
                {/* Mode Toggle */}
                <div className="flex gap-2 mb-4">
                  <button
                    onClick={() => setTalentMode('search')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      talentMode === 'search' ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Search size={14} /> Search Existing
                  </button>
                  <button
                    onClick={() => setTalentMode('create')}
                    className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
                      talentMode === 'create' ? 'bg-charcoal text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    <Plus size={14} /> Create New
                  </button>
                </div>

                {talentMode === 'search' ? (
                  <>
                    <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 mb-4">
                      <Search size={18} className="text-stone-400" />
                      <input
                        type="text"
                        placeholder="Search by name or skills..."
                        className="flex-1 bg-transparent outline-none text-sm"
                        value={talentSearchTerm}
                        onChange={(e) => setTalentSearchTerm(e.target.value)}
                      />
                    </div>

                    {loadingCandidates ? (
                      <div className="flex justify-center py-8">
                        <Loader2 size={24} className="animate-spin text-stone-400" />
                      </div>
                    ) : (
                      <div className="space-y-2 max-h-64 overflow-y-auto mb-4">
                        {filteredCandidates.length === 0 ? (
                          <div className="text-center py-8 text-stone-400">
                            <User size={32} className="mx-auto mb-2 opacity-50" />
                            <p className="text-sm">No candidates found</p>
                            <button
                              onClick={() => setTalentMode('create')}
                              className="text-rust text-sm font-bold mt-2 hover:underline"
                            >
                              Add a new candidate
                            </button>
                          </div>
                        ) : (
                          filteredCandidates.map((candidate) => (
                            <button
                              key={candidate.id}
                              onClick={() => setSelectedCandidateId(candidate.id)}
                              className={`w-full text-left p-4 rounded-xl border transition-all ${
                                selectedCandidateId === candidate.id
                                  ? 'border-rust bg-rust/5'
                                  : 'border-stone-200 hover:border-stone-300'
                              }`}
                            >
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-rust/20 to-rust/10 rounded-lg flex items-center justify-center text-rust font-bold text-sm">
                                    {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                                  </div>
                                  <div>
                                    <h4 className="font-bold text-charcoal">{candidate.fullName}</h4>
                                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                                      {candidate.candidateLocation && (
                                        <span className="flex items-center gap-1">
                                          <MapPin size={10} /> {candidate.candidateLocation}
                                        </span>
                                      )}
                                      {candidate.candidateCurrentVisa && (
                                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${VISA_COLORS[candidate.candidateCurrentVisa] || VISA_COLORS.Other}`}>
                                          {candidate.candidateCurrentVisa}
                                        </span>
                                      )}
                                      {candidate.candidateHourlyRate && (
                                        <span className="text-green-600 font-medium">${candidate.candidateHourlyRate}/hr</span>
                                      )}
                                    </div>
                                    {candidate.candidateSkills && candidate.candidateSkills.length > 0 && (
                                      <div className="flex gap-1 mt-2 flex-wrap">
                                        {candidate.candidateSkills.slice(0, 4).map((skill) => (
                                          <span key={skill} className="px-2 py-0.5 bg-stone-100 rounded text-[10px] text-stone-600">
                                            {skill}
                                          </span>
                                        ))}
                                        {candidate.candidateSkills.length > 4 && (
                                          <span className="text-[10px] text-stone-400">+{candidate.candidateSkills.length - 4}</span>
                                        )}
                                      </div>
                                    )}
                                  </div>
                                </div>
                                {selectedCandidateId === candidate.id && (
                                  <div className="w-6 h-6 bg-rust rounded-full flex items-center justify-center text-white text-xs">✓</div>
                                )}
                              </div>
                            </button>
                          ))
                        )}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="space-y-4 mb-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">First Name *</label>
                        <input
                          type="text"
                          value={newTalent.firstName}
                          onChange={(e) => setNewTalent({ ...newTalent, firstName: e.target.value })}
                          placeholder="John"
                          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Last Name *</label>
                        <input
                          type="text"
                          value={newTalent.lastName}
                          onChange={(e) => setNewTalent({ ...newTalent, lastName: e.target.value })}
                          placeholder="Doe"
                          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Email *</label>
                      <input
                        type="email"
                        value={newTalent.email}
                        onChange={(e) => setNewTalent({ ...newTalent, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Phone</label>
                        <input
                          type="tel"
                          value={newTalent.phone}
                          onChange={(e) => setNewTalent({ ...newTalent, phone: e.target.value })}
                          placeholder="+1 (555) 123-4567"
                          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                        />
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Location</label>
                        <input
                          type="text"
                          value={newTalent.candidateLocation}
                          onChange={(e) => setNewTalent({ ...newTalent, candidateLocation: e.target.value })}
                          placeholder="City, State"
                          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Visa Status</label>
                        <select
                          value={newTalent.candidateCurrentVisa}
                          onChange={(e) => setNewTalent({ ...newTalent, candidateCurrentVisa: e.target.value as typeof newTalent.candidateCurrentVisa })}
                          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust bg-white"
                        >
                          <option value="H1B">H1B</option>
                          <option value="GC">Green Card</option>
                          <option value="USC">US Citizen</option>
                          <option value="OPT">OPT</option>
                          <option value="CPT">CPT</option>
                          <option value="TN">TN</option>
                          <option value="L1">L1</option>
                          <option value="EAD">EAD</option>
                          <option value="Other">Other</option>
                        </select>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Rate</label>
                        <div className="relative">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400">$</span>
                          <input
                            type="number"
                            value={newTalent.candidateHourlyRate}
                            onChange={(e) => setNewTalent({ ...newTalent, candidateHourlyRate: e.target.value })}
                            placeholder="0"
                            className="w-full pl-8 p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Experience</label>
                        <select
                          value={newTalent.candidateExperienceYears}
                          onChange={(e) => setNewTalent({ ...newTalent, candidateExperienceYears: parseInt(e.target.value) })}
                          className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust bg-white"
                        >
                          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((y) => (
                            <option key={y} value={y}>{y}+ years</option>
                          ))}
                        </select>
                      </div>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Availability *</label>
                      <select
                        value={newTalent.candidateAvailability}
                        onChange={(e) => setNewTalent({ ...newTalent, candidateAvailability: e.target.value as typeof newTalent.candidateAvailability })}
                        className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust bg-white"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="2_weeks">2 Weeks</option>
                        <option value="1_month">1 Month</option>
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Skills *</label>
                      <div className="flex gap-2 mb-2">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => setSkillInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                          placeholder="Add a skill..."
                          className="flex-1 p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                        />
                        <button
                          type="button"
                          onClick={addSkill}
                          className="px-4 py-3 bg-stone-100 rounded-xl text-sm font-bold hover:bg-stone-200"
                        >
                          Add
                        </button>
                      </div>
                      {newTalent.candidateSkills.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {newTalent.candidateSkills.map((skill) => (
                            <span key={skill} className="px-3 py-1 bg-rust/10 text-rust rounded-full text-xs font-medium flex items-center gap-1">
                              {skill}
                              <button onClick={() => removeSkill(skill)} className="hover:text-red-600">×</button>
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <button
                      onClick={handleCreateTalent}
                      disabled={!newTalent.firstName || !newTalent.lastName || !newTalent.email || newTalent.candidateSkills.length === 0 || createCandidate.isPending}
                      className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      {createCandidate.isPending ? (
                        <><Loader2 size={14} className="animate-spin" /> Creating...</>
                      ) : (
                        <><Plus size={14} /> Create Candidate & Select</>
                      )}
                    </button>
                    {newTalent.candidateSkills.length === 0 && (
                      <p className="text-xs text-amber-600 text-center">At least one skill is required</p>
                    )}
                  </div>
                )}

                {/* Notes */}
                <div className="mb-4">
                  <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Submission Notes (optional)</label>
                  <textarea
                    value={submissionNotes}
                    onChange={(e) => setSubmissionNotes(e.target.value)}
                    placeholder="Add any notes about this submission..."
                    rows={2}
                    className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                  />
                </div>

                <div className="flex gap-4">
                  <button
                    onClick={() => setSubmissionStep('job')}
                    className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
                  >
                    Back to Job
                  </button>
                  <button
                    onClick={handleCreateSubmission}
                    disabled={!selectedJobId || !selectedCandidateId || createSubmission.isPending}
                    className="flex-1 py-3 bg-rust text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-charcoal disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {createSubmission.isPending ? (
                      <><Loader2 size={14} className="animate-spin" /> Creating...</>
                    ) : (
                      <><Send size={14} /> Create Submission</>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
