'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ArrowLeft, User, MapPin, Briefcase, Clock, Phone, Mail, Calendar,
  FileText, Activity, Building2, DollarSign, ChevronRight, Plus,
  Loader2, X, Search, ExternalLink, Edit, MoreHorizontal
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface TalentWorkspaceProps {
  talentId: string;
}

// Visa type colors
const VISA_COLORS: Record<string, string> = {
  H1B: 'bg-blue-100 text-blue-700',
  GC: 'bg-green-100 text-green-700',
  USC: 'bg-emerald-100 text-emerald-700',
  OPT: 'bg-amber-100 text-amber-700',
  CPT: 'bg-orange-100 text-orange-700',
  TN: 'bg-purple-100 text-purple-700',
  L1: 'bg-indigo-100 text-indigo-700',
  EAD: 'bg-cyan-100 text-cyan-700',
  Other: 'bg-gray-100 text-gray-700',
};

// Availability config
const AVAILABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  immediate: { label: 'Immediate', color: 'bg-green-50 text-green-700 border-green-200' },
  '2_weeks': { label: '2 Weeks', color: 'bg-amber-50 text-amber-700 border-amber-200' },
  '1_month': { label: '1 Month', color: 'bg-orange-50 text-orange-700 border-orange-200' },
};

// Status colors for submissions
const STATUS_COLORS: Record<string, string> = {
  sourced: 'bg-gray-100 text-gray-700',
  screening: 'bg-blue-100 text-blue-700',
  submitted_to_client: 'bg-purple-100 text-purple-700',
  client_review: 'bg-indigo-100 text-indigo-700',
  client_interview: 'bg-cyan-100 text-cyan-700',
  offer_stage: 'bg-amber-100 text-amber-700',
  placed: 'bg-green-100 text-green-700',
  rejected: 'bg-red-100 text-red-700',
  withdrawn: 'bg-stone-100 text-stone-700',
};

type TabType = 'overview' | 'jobs' | 'submissions' | 'documents' | 'activity';

// Attach Job Modal Component
const AttachJobModal: React.FC<{
  talentId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ talentId, onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Fetch open jobs
  const { data: jobs = [], isLoading: loadingJobs } = trpc.ats.jobs.list.useQuery({
    status: 'open',
    limit: 50,
  });

  const createSubmission = trpc.ats.submissions.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const filteredJobs = searchTerm
    ? jobs.filter(j =>
        j.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (j.location && j.location.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : jobs;

  const handleSubmit = () => {
    if (!selectedJob) return;

    createSubmission.mutate({
      candidateId: talentId,
      jobId: selectedJob,
      status: 'sourced',
      submissionNotes: notes || undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-charcoal">Attach to Job</h2>
            <p className="text-sm text-stone-500">Link this talent to a job opportunity</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-charcoal">
            <X size={20} />
          </button>
        </div>

        {/* Search */}
        <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 mb-4">
          <Search size={18} className="text-stone-400" />
          <input
            type="text"
            placeholder="Search jobs by title or location..."
            className="flex-1 bg-transparent outline-none text-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Jobs List */}
        {loadingJobs ? (
          <div className="flex justify-center py-8">
            <Loader2 size={24} className="animate-spin text-stone-400" />
          </div>
        ) : (
          <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
            {filteredJobs.map(job => (
              <button
                key={job.id}
                onClick={() => setSelectedJob(job.id)}
                className={`w-full text-left p-4 rounded-xl border transition-all ${
                  selectedJob === job.id
                    ? 'border-rust bg-rust/5'
                    : 'border-stone-200 hover:border-stone-300'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-bold text-charcoal">{job.title}</h4>
                    <div className="flex items-center gap-3 text-xs text-stone-500 mt-1">
                      {job.location && (
                        <span className="flex items-center gap-1">
                          <MapPin size={10} /> {job.location}
                        </span>
                      )}
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        job.status === 'open' ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-600'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  {selectedJob === job.id && (
                    <div className="w-5 h-5 bg-rust rounded-full flex items-center justify-center">
                      <span className="text-white text-xs">✓</span>
                    </div>
                  )}
                </div>
              </button>
            ))}
            {filteredJobs.length === 0 && (
              <div className="text-center py-8 text-stone-500">
                No open jobs found
              </div>
            )}
          </div>
        )}

        {/* Notes */}
        {selectedJob && (
          <div className="mb-6">
            <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
              Submission Notes
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Add notes about why this talent is a good fit..."
              rows={3}
              className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSubmit}
            disabled={!selectedJob || createSubmission.isPending}
            className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {createSubmission.isPending ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Attaching...
              </>
            ) : (
              <>
                <Briefcase size={14} /> Attach to Job
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export const TalentWorkspace: React.FC<TalentWorkspaceProps> = ({ talentId }) => {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAttachJobModal, setShowAttachJobModal] = useState(false);

  // Fetch talent details
  const { data: talent, isLoading, error, refetch } = trpc.ats.candidates.getById.useQuery({ id: talentId });

  // Fetch submissions for this candidate
  const { data: submissions = [], refetch: refetchSubmissions } = trpc.ats.submissions.list.useQuery({
    candidateId: talentId,
    limit: 50,
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 size={32} className="animate-spin text-stone-400" />
      </div>
    );
  }

  if (error || !talent) {
    return (
      <div className="text-center py-24">
        <User size={48} className="mx-auto text-stone-300 mb-4" />
        <h2 className="text-xl font-bold text-charcoal mb-2">Talent Not Found</h2>
        <p className="text-stone-500 mb-4">The talent profile you're looking for doesn't exist.</p>
        <Link
          href="/employee/recruiting/talent"
          className="text-rust font-bold hover:underline"
        >
          Back to Talent Pool
        </Link>
      </div>
    );
  }

  const tabs: { id: TabType; label: string; icon: React.ReactNode; count?: number }[] = [
    { id: 'overview', label: 'Overview', icon: <User size={14} /> },
    { id: 'jobs', label: 'Jobs', icon: <Briefcase size={14} />, count: submissions.length },
    { id: 'submissions', label: 'Submissions', icon: <Building2 size={14} />, count: submissions.length },
    { id: 'documents', label: 'Documents', icon: <FileText size={14} /> },
    { id: 'activity', label: 'Activity', icon: <Activity size={14} /> },
  ];

  const handleJobAttached = () => {
    refetchSubmissions();
  };

  return (
    <div className="animate-fade-in">
      {/* Back Link */}
      <Link
        href="/employee/recruiting/talent"
        className="inline-flex items-center gap-2 text-stone-500 hover:text-charcoal mb-6 text-sm font-medium"
      >
        <ArrowLeft size={16} /> Back to Talent Pool
      </Link>

      {/* Header */}
      <div className="bg-white rounded-[2rem] border border-stone-200 p-8 mb-6 shadow-sm">
        <div className="flex items-start gap-6">
          {/* Avatar */}
          <div className="w-24 h-24 bg-gradient-to-br from-rust/20 to-rust/10 rounded-2xl flex items-center justify-center text-rust font-bold text-3xl border border-rust/10">
            {talent.firstName?.[0]}{talent.lastName?.[0]}
          </div>

          {/* Info */}
          <div className="flex-1">
            <div className="flex items-start justify-between mb-2">
              <div>
                <h1 className="text-3xl font-serif font-bold text-charcoal">
                  {talent.fullName || `${talent.firstName} ${talent.lastName}`}
                </h1>
                <div className="flex items-center gap-4 text-stone-500 mt-1">
                  {talent.candidateLocation && (
                    <span className="flex items-center gap-1 text-sm">
                      <MapPin size={14} /> {talent.candidateLocation}
                    </span>
                  )}
                  {talent.email && (
                    <span className="flex items-center gap-1 text-sm">
                      <Mail size={14} /> {talent.email}
                    </span>
                  )}
                  {talent.phone && (
                    <span className="flex items-center gap-1 text-sm">
                      <Phone size={14} /> {talent.phone}
                    </span>
                  )}
                </div>
              </div>
              <button className="p-2 text-stone-400 hover:text-charcoal hover:bg-stone-100 rounded-lg transition-colors">
                <Edit size={18} />
              </button>
            </div>

            {/* Status Row */}
            <div className="flex flex-wrap gap-3 mt-4">
              {talent.candidateCurrentVisa && (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold ${VISA_COLORS[talent.candidateCurrentVisa] || VISA_COLORS.Other}`}>
                  {talent.candidateCurrentVisa}
                </span>
              )}
              {talent.candidateAvailability && AVAILABILITY_CONFIG[talent.candidateAvailability] && (
                <span className={`px-3 py-1.5 rounded-lg text-xs font-bold border ${AVAILABILITY_CONFIG[talent.candidateAvailability].color}`}>
                  <Clock size={12} className="inline mr-1" />
                  {AVAILABILITY_CONFIG[talent.candidateAvailability].label}
                </span>
              )}
              {talent.candidateExperienceYears && (
                <span className="px-3 py-1.5 bg-stone-100 rounded-lg text-xs font-bold text-stone-700">
                  {talent.candidateExperienceYears}+ Years Experience
                </span>
              )}
              {talent.candidateHourlyRate && (
                <span className="px-3 py-1.5 bg-green-50 border border-green-200 rounded-lg text-xs font-bold text-green-700">
                  <DollarSign size={12} className="inline" />{talent.candidateHourlyRate}/hr
                </span>
              )}
            </div>

            {/* Skills */}
            {talent.candidateSkills && talent.candidateSkills.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-4">
                {talent.candidateSkills.map((skill, idx) => (
                  <span key={idx} className="px-3 py-1 bg-rust/10 text-rust rounded-full text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white rounded-[2rem] border border-stone-200 shadow-sm overflow-hidden">
        <div className="flex border-b border-stone-200">
          <nav className="flex gap-0 overflow-x-auto">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-4 text-xs font-bold uppercase tracking-widest transition-colors flex items-center gap-2 border-b-2 whitespace-nowrap ${
                  activeTab === tab.id
                    ? 'border-rust text-rust bg-rust/5'
                    : 'border-transparent text-stone-400 hover:text-charcoal hover:bg-stone-50'
                }`}
              >
                {tab.icon}
                {tab.label}
                {tab.count !== undefined && tab.count > 0 && (
                  <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </nav>

          {/* Quick Stats */}
          <div className="ml-auto pr-6 flex items-center gap-6 border-l border-stone-100">
            <div className="text-center px-4">
              <div className="text-xs text-stone-500 uppercase tracking-widest">Active Jobs</div>
              <div className="text-xl font-bold text-charcoal">{submissions.filter(s => s.status !== 'rejected' && s.status !== 'withdrawn').length}</div>
            </div>
            <div className="text-center px-4">
              <div className="text-xs text-stone-500 uppercase tracking-widest">Placements</div>
              <div className="text-xl font-bold text-charcoal">{submissions.filter(s => s.status === 'placed').length}</div>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column - Details */}
              <div className="lg:col-span-2 space-y-6">
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
                    <User size={16} /> Profile Summary
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Experience</div>
                      <div className="text-sm font-medium text-charcoal">{talent.candidateExperienceYears || 0} Years</div>
                    </div>
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Hourly Rate</div>
                      <div className="text-sm font-medium text-charcoal">${talent.candidateHourlyRate || 'N/A'}/hr</div>
                    </div>
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Visa Status</div>
                      <div className="text-sm font-medium text-charcoal">{talent.candidateCurrentVisa || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Availability</div>
                      <div className="text-sm font-medium text-charcoal capitalize">
                        {talent.candidateAvailability?.replace('_', ' ') || 'N/A'}
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Location</div>
                      <div className="text-sm font-medium text-charcoal">{talent.candidateLocation || 'N/A'}</div>
                    </div>
                    <div>
                      <div className="text-xs text-stone-500 uppercase tracking-widest mb-1">Willing to Relocate</div>
                      <div className="text-sm font-medium text-charcoal">
                        {talent.candidateWillingToRelocate ? 'Yes' : 'No'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Recent Submissions */}
                <div className="bg-stone-50 rounded-2xl p-6 border border-stone-100">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-charcoal flex items-center gap-2">
                      <Briefcase size={16} /> Active Submissions
                    </h3>
                    <button
                      onClick={() => setShowAttachJobModal(true)}
                      className="text-xs font-bold text-rust hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Attach to Job
                    </button>
                  </div>
                  {submissions.length > 0 ? (
                    <div className="space-y-3">
                      {submissions.slice(0, 5).map(sub => (
                        <Link
                          key={sub.id}
                          href={`/employee/recruiting/submissions/${sub.id}`}
                          className="flex items-center justify-between p-3 bg-white rounded-xl border border-stone-100 hover:border-rust/30 transition-colors"
                        >
                          <div>
                            <div className="font-medium text-charcoal text-sm">Job #{sub.jobId.slice(0, 8)}</div>
                            <div className="text-xs text-stone-500">Submitted {new Date(sub.createdAt || '').toLocaleDateString()}</div>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[sub.status] || 'bg-stone-100 text-stone-600'}`}>
                              {sub.status.replace(/_/g, ' ')}
                            </span>
                            <ChevronRight size={14} className="text-stone-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-stone-500">
                      <Briefcase size={24} className="mx-auto mb-2 text-stone-300" />
                      <p className="text-sm">No active submissions</p>
                      <button
                        onClick={() => setShowAttachJobModal(true)}
                        className="mt-2 text-xs font-bold text-rust hover:underline"
                      >
                        Attach to first job
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Column - Actions */}
              <div className="space-y-6">
                <div className="bg-rust/5 rounded-2xl p-6 border border-rust/10">
                  <h3 className="font-bold text-charcoal mb-4 flex items-center gap-2">
                    <Activity size={16} /> Quick Actions
                  </h3>
                  <div className="space-y-2">
                    <button
                      onClick={() => setShowAttachJobModal(true)}
                      className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center justify-center gap-2"
                    >
                      <Briefcase size={14} /> Attach to Job
                    </button>
                    <button className="w-full py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                      <FileText size={14} /> Upload Resume
                    </button>
                    <button className="w-full py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center justify-center gap-2">
                      <Mail size={14} /> Send Email
                    </button>
                  </div>
                </div>

                {/* Visa Expiry Warning */}
                {talent.candidateVisaExpiry && (
                  <div className="bg-amber-50 rounded-2xl p-6 border border-amber-100">
                    <h3 className="font-bold text-amber-800 mb-2 flex items-center gap-2">
                      <Calendar size={16} /> Visa Expiry
                    </h3>
                    <p className="text-sm text-amber-700">
                      {talent.candidateCurrentVisa} expires on{' '}
                      {new Date(talent.candidateVisaExpiry).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === 'jobs' && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-charcoal">Attached Jobs</h3>
                <button
                  onClick={() => setShowAttachJobModal(true)}
                  className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors"
                >
                  <Plus size={14} /> Attach Job
                </button>
              </div>

              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map(sub => (
                    <Link
                      key={sub.id}
                      href={`/employee/recruiting/submissions/${sub.id}`}
                      className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-rust/30 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <div className="w-10 h-10 bg-white rounded-lg border border-stone-200 flex items-center justify-center">
                          <Briefcase size={18} className="text-stone-400" />
                        </div>
                        <div>
                          <div className="font-medium text-charcoal">Job #{sub.jobId.slice(0, 8)}</div>
                          <div className="text-xs text-stone-500">
                            Submitted {new Date(sub.createdAt || '').toLocaleDateString()}
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[sub.status] || 'bg-stone-100 text-stone-600'}`}>
                          {sub.status.replace(/_/g, ' ')}
                        </span>
                        <ChevronRight size={16} className="text-stone-400" />
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
                  <Briefcase size={48} className="mx-auto text-stone-300 mb-4" />
                  <h3 className="font-bold text-charcoal mb-2">No Jobs Attached</h3>
                  <p className="text-stone-500 mb-4">Attach this talent to job opportunities</p>
                  <button
                    onClick={() => setShowAttachJobModal(true)}
                    className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors"
                  >
                    Attach First Job
                  </button>
                </div>
              )}
            </div>
          )}

          {activeTab === 'submissions' && (
            <div>
              <h3 className="font-bold text-charcoal mb-6">Submission History</h3>
              {submissions.length > 0 ? (
                <div className="space-y-3">
                  {submissions.map(sub => (
                    <Link
                      key={sub.id}
                      href={`/employee/recruiting/submissions/${sub.id}`}
                      className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-rust/30 transition-colors"
                    >
                      <div>
                        <div className="font-medium text-charcoal">Job #{sub.jobId.slice(0, 8)}</div>
                        <div className="text-xs text-stone-500 mt-1">
                          {sub.submissionNotes || 'No notes'}
                        </div>
                      </div>
                      <div className="text-right">
                        <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${STATUS_COLORS[sub.status] || 'bg-stone-100 text-stone-600'}`}>
                          {sub.status.replace(/_/g, ' ')}
                        </span>
                        <div className="text-xs text-stone-400 mt-1">
                          {new Date(sub.createdAt || '').toLocaleDateString()}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
                  <Building2 size={48} className="mx-auto text-stone-300 mb-4" />
                  <p className="text-stone-500">No submission history</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'documents' && (
            <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
              <FileText size={48} className="mx-auto text-stone-300 mb-4" />
              <h3 className="font-bold text-charcoal mb-2">Documents</h3>
              <p className="text-stone-500 mb-4">Upload resume, certificates, and other documents</p>
              <button className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors">
                Upload Document
              </button>
            </div>
          )}

          {activeTab === 'activity' && (
            <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
              <Activity size={48} className="mx-auto text-stone-300 mb-4" />
              <h3 className="font-bold text-charcoal mb-2">Activity Timeline</h3>
              <p className="text-stone-500">Activity history will appear here</p>
            </div>
          )}
        </div>
      </div>

      {/* Attach Job Modal */}
      {showAttachJobModal && (
        <AttachJobModal
          talentId={talentId}
          onClose={() => setShowAttachJobModal(false)}
          onSuccess={handleJobAttached}
        />
      )}
    </div>
  );
};

export default TalentWorkspace;
