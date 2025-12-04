'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useJobRaw } from '@/hooks/queries/jobs';
import { trpc } from '@/lib/trpc/client';
import {
  useCreateActivity,
  useCompleteActivity,
  useCancelActivity,
} from '@/hooks/mutations/activities';
import { ActivityComposer } from '@/components/crm/ActivityComposer';
import { ActivityTimeline } from '@/components/crm/ActivityTimeline';
import {
  ChevronLeft,
  Building2,
  MapPin,
  DollarSign,
  Briefcase,
  Calendar,
  Users,
  FileText,
  Loader2,
  AlertCircle,
  X,
  Plus,
  CheckSquare,
  Square,
  MessageSquare,
  FolderOpen,
  User,
  Search,
  ChevronRight,
  Upload,
  Trash2,
  ExternalLink,
} from 'lucide-react';

interface JobWorkspaceProps {
  jobId: string;
}

// Status colors for jobs
const JOB_STATUS_COLORS: Record<string, string> = {
  open: 'bg-green-100 text-green-700 border-green-200',
  on_hold: 'bg-amber-100 text-amber-700 border-amber-200',
  filled: 'bg-blue-100 text-blue-700 border-blue-200',
  cancelled: 'bg-red-100 text-red-700 border-red-200',
  draft: 'bg-stone-100 text-stone-700 border-stone-200',
  urgent: 'bg-red-100 text-red-700 border-red-200',
};

// Status colors for submissions
const SUBMISSION_STATUS_COLORS: Record<string, string> = {
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

type TabType = 'activity' | 'submissions' | 'documents' | 'tasks';

// Attach Candidate Modal Component
const AttachCandidateModal: React.FC<{
  jobId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ jobId, onClose, onSuccess }) => {
  const [mode, setMode] = useState<'search' | 'create'>('search');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCandidate, setSelectedCandidate] = useState<string | null>(null);
  const [notes, setNotes] = useState('');

  // Create new talent form state
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
    candidateWillingToRelocate: false,
  });
  const [skillInput, setSkillInput] = useState('');

  const { data: candidates = [], isLoading: loadingCandidates, refetch: refetchCandidates } = trpc.ats.candidates.search.useQuery({
    limit: 50,
  });

  const createSubmission = trpc.ats.submissions.create.useMutation({
    onSuccess: () => {
      onSuccess();
      onClose();
    },
  });

  const createCandidate = trpc.ats.candidates.create.useMutation({
    onSuccess: (data) => {
      // After creating, select the new candidate and switch back to search mode
      setSelectedCandidate(data.id);
      refetchCandidates();
      setMode('search');
      // Clear form
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
        candidateWillingToRelocate: false,
      });
    },
  });

  const filteredCandidates = searchTerm
    ? candidates.filter((c) =>
        c.fullName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.candidateSkills?.some((skill) => skill.toLowerCase().includes(searchTerm.toLowerCase())) ||
        c.candidateLocation?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : candidates;

  const handleSubmit = () => {
    if (!selectedCandidate) return;
    createSubmission.mutate({
      candidateId: selectedCandidate,
      jobId: jobId,
      status: 'sourced',
      submissionNotes: notes || undefined,
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

  const handleCreateTalent = (e: React.FormEvent) => {
    e.preventDefault();
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
      candidateWillingToRelocate: newTalent.candidateWillingToRelocate,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-charcoal">
              {mode === 'search' ? 'Attach Candidate' : 'Add New Talent'}
            </h2>
            <p className="text-sm text-stone-500">
              {mode === 'search' ? 'Link a candidate from the talent pool to this job' : 'Create a new candidate and attach to this job'}
            </p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-charcoal">
            <X size={20} />
          </button>
        </div>

        {/* Mode Toggle */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setMode('search')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              mode === 'search'
                ? 'bg-charcoal text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Search size={14} /> Search Existing
          </button>
          <button
            onClick={() => setMode('create')}
            className={`flex-1 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2 ${
              mode === 'create'
                ? 'bg-charcoal text-white'
                : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
            }`}
          >
            <Plus size={14} /> Create New
          </button>
        </div>

        {mode === 'search' ? (
          <>
            <div className="flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200 mb-4">
              <Search size={18} className="text-stone-400" />
              <input
                type="text"
                placeholder="Search by name, skills, or location..."
                className="flex-1 bg-transparent outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            {loadingCandidates ? (
              <div className="flex justify-center py-8">
                <Loader2 size={24} className="animate-spin text-stone-400" />
              </div>
            ) : (
              <div className="space-y-2 max-h-64 overflow-y-auto mb-6">
                {filteredCandidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    onClick={() => setSelectedCandidate(candidate.id)}
                    className={`w-full text-left p-4 rounded-xl border transition-all ${
                      selectedCandidate === candidate.id
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
                              <span className="text-green-600 font-medium">
                                ${candidate.candidateHourlyRate}/hr
                              </span>
                            )}
                          </div>
                          {candidate.candidateSkills && candidate.candidateSkills.length > 0 && (
                            <div className="flex gap-1 mt-2">
                              {candidate.candidateSkills.slice(0, 3).map((skill: string, idx: number) => (
                                <span key={idx} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px]">
                                  {skill}
                                </span>
                              ))}
                              {candidate.candidateSkills.length > 3 && (
                                <span className="text-[10px] text-stone-400">+{candidate.candidateSkills.length - 3}</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      {selectedCandidate === candidate.id && (
                        <div className="w-5 h-5 bg-rust rounded-full flex items-center justify-center">
                          <span className="text-white text-xs">✓</span>
                        </div>
                      )}
                    </div>
                  </button>
                ))}
                {filteredCandidates.length === 0 && (
                  <div className="text-center py-8">
                    <Users size={32} className="mx-auto text-stone-300 mb-2" />
                    <p className="text-stone-500 mb-3">No candidates found</p>
                    <button
                      onClick={() => setMode('create')}
                      className="text-rust hover:underline text-sm font-medium"
                    >
                      Create a new talent instead
                    </button>
                  </div>
                )}
              </div>
            )}

            {selectedCandidate && (
              <div className="mb-6">
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">
                  Submission Notes
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add notes about why this candidate is a good fit..."
                  rows={3}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                />
              </div>
            )}

            <div className="flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSubmit}
                disabled={!selectedCandidate || createSubmission.isPending}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createSubmission.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Attaching...
                  </>
                ) : (
                  <>
                    <User size={14} /> Attach Candidate
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          /* Create New Talent Form */
          <form onSubmit={handleCreateTalent} className="space-y-4">
            {createCandidate.error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                {createCandidate.error.message}
              </div>
            )}

            {/* Name Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                  First Name *
                </label>
                <input
                  type="text"
                  value={newTalent.firstName}
                  onChange={(e) => setNewTalent(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  placeholder="John"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Last Name *
                </label>
                <input
                  type="text"
                  value={newTalent.lastName}
                  onChange={(e) => setNewTalent(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            {/* Contact Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Email *
                </label>
                <input
                  type="email"
                  value={newTalent.email}
                  onChange={(e) => setNewTalent(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  placeholder="john@example.com"
                  required
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Phone
                </label>
                <input
                  type="tel"
                  value={newTalent.phone}
                  onChange={(e) => setNewTalent(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </div>

            {/* Location & Visa Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Location
                </label>
                <input
                  type="text"
                  value={newTalent.candidateLocation}
                  onChange={(e) => setNewTalent(prev => ({ ...prev, candidateLocation: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  placeholder="Dallas, TX"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Visa Status
                </label>
                <select
                  value={newTalent.candidateCurrentVisa}
                  onChange={(e) => setNewTalent(prev => ({ ...prev, candidateCurrentVisa: e.target.value as typeof newTalent.candidateCurrentVisa }))}
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
            </div>

            {/* Rate & Experience Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Hourly Rate ($)
                </label>
                <input
                  type="number"
                  value={newTalent.candidateHourlyRate}
                  onChange={(e) => setNewTalent(prev => ({ ...prev, candidateHourlyRate: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  placeholder="75"
                  min="0"
                  step="0.01"
                />
              </div>
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Experience (Years) *
                </label>
                <input
                  type="number"
                  value={newTalent.candidateExperienceYears}
                  onChange={(e) => setNewTalent(prev => ({ ...prev, candidateExperienceYears: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  placeholder="5"
                  min="0"
                  max="50"
                  required
                />
              </div>
            </div>

            {/* Availability & Relocate Row */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                  Availability *
                </label>
                <select
                  value={newTalent.candidateAvailability}
                  onChange={(e) => setNewTalent(prev => ({ ...prev, candidateAvailability: e.target.value as typeof newTalent.candidateAvailability }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust bg-white"
                  required
                >
                  <option value="immediate">Immediate</option>
                  <option value="2_weeks">2 Weeks</option>
                  <option value="1_month">1 Month</option>
                </select>
              </div>
              <div className="flex items-end">
                <label className="flex items-center gap-3 p-3 border border-stone-200 rounded-xl w-full cursor-pointer hover:bg-stone-50">
                  <input
                    type="checkbox"
                    checked={newTalent.candidateWillingToRelocate}
                    onChange={(e) => setNewTalent(prev => ({ ...prev, candidateWillingToRelocate: e.target.checked }))}
                    className="w-4 h-4 text-rust border-stone-300 rounded focus:ring-rust"
                  />
                  <span className="text-sm text-stone-600">Willing to Relocate</span>
                </label>
              </div>
            </div>

            {/* Skills */}
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-1.5 block">
                Skills * <span className="text-stone-400 font-normal">(at least one required)</span>
              </label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  className="flex-1 p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                  placeholder="Add a skill and press Enter"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-stone-100 text-stone-600 rounded-xl hover:bg-stone-200 transition-colors"
                >
                  <Plus size={16} />
                </button>
              </div>
              {newTalent.candidateSkills.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {newTalent.candidateSkills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 bg-rust/10 text-rust rounded-lg text-sm flex items-center gap-2"
                    >
                      {skill}
                      <button
                        type="button"
                        onClick={() => removeSkill(skill)}
                        className="text-rust/60 hover:text-rust"
                      >
                        <X size={12} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="flex gap-4 pt-4 border-t border-stone-200">
              <button
                type="button"
                onClick={() => setMode('search')}
                className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
              >
                Back to Search
              </button>
              <button
                type="submit"
                disabled={!newTalent.firstName || !newTalent.lastName || !newTalent.email || newTalent.candidateSkills.length === 0 || createCandidate.isPending}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {createCandidate.isPending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Creating...
                  </>
                ) : (
                  <>
                    <Plus size={14} /> Create & Select
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

// Upload Metadata Form Component
const UploadMetadataForm: React.FC<{
  files: File[];
  categories: Array<{ key: string; label: string; color: string }>;
  isUploading: boolean;
  onUpload: (metadata: { category: string; description?: string; tags?: string[] }) => void;
  onCancel: () => void;
  formatFileSize: (bytes: number) => string;
}> = ({ files, categories, isUploading, onUpload, onCancel, formatFileSize }) => {
  const [category, setCategory] = useState('other');
  const [description, setDescription] = useState('');
  const [tagsInput, setTagsInput] = useState('');

  const handleSubmit = () => {
    const tags = tagsInput.split(',').map(t => t.trim()).filter(t => t.length > 0);
    onUpload({ category, description: description || undefined, tags: tags.length > 0 ? tags : undefined });
  };

  return (
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
          Document Type *
        </label>
        <div className="grid grid-cols-2 gap-2">
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
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add a brief description of this document..."
          rows={2}
          className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust resize-none"
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
          Tags <span className="font-normal">(comma-separated)</span>
        </label>
        <input
          type="text"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
          placeholder="e.g., resume, java, senior"
          className="w-full p-3 border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-4 border-t border-stone-100">
        <button
          type="button"
          onClick={onCancel}
          disabled={isUploading}
          className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={isUploading}
          className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
        >
          {isUploading ? (
            <>
              <Loader2 size={14} className="animate-spin" /> Uploading...
            </>
          ) : (
            <>
              <Upload size={14} /> Upload
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export const JobWorkspace: React.FC<JobWorkspaceProps> = ({ jobId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('activity');
  const [showAttachCandidateModal, setShowAttachCandidateModal] = useState(false);

  // Fetch job details
  const { data: job, isLoading, error } = useJobRaw(jobId);

  // Fetch submissions for this job
  const { data: submissions = [], refetch: refetchSubmissions } = trpc.ats.submissions.list.useQuery({
    jobId: jobId,
    limit: 50,
  });

  // Fetch account if job has one
  const { data: account } = trpc.crm.accounts.getById.useQuery(
    { id: job?.accountId || '' },
    { enabled: !!job?.accountId }
  );

  // Fetch activities from unified activities system
  const { data: activities, isLoading: activitiesLoading, refetch: refetchActivities } = trpc.activities.list.useQuery(
    { entityType: 'job', entityId: jobId, includeCompleted: true, limit: 50, offset: 0 },
    { enabled: !!jobId }
  );

  // Fetch tasks
  const { data: allTasks, isLoading: tasksLoading, refetch: refetchTasks } = trpc.activities.list.useQuery(
    { entityType: 'job', entityId: jobId, activityTypes: ['task', 'follow_up'], includeCompleted: true, limit: 100, offset: 0 },
    { enabled: !!jobId }
  );

  // Fetch documents
  const { data: documents, isLoading: documentsLoading, refetch: refetchDocuments } = trpc.files.list.useQuery(
    { entityType: 'job', entityId: jobId },
    { enabled: !!jobId }
  );

  // Mutations
  const createTaskMutation = useCreateActivity();
  const completeTaskMutation = useCompleteActivity();
  const cancelTaskMutation = useCancelActivity();

  // File mutations
  const getUploadUrlMutation = trpc.files.getUploadUrl.useMutation();
  const recordUploadMutation = trpc.files.recordUpload.useMutation();
  const deleteFileMutation = trpc.files.delete.useMutation();

  // Task form state
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [newTaskDueDate, setNewTaskDueDate] = useState(new Date(Date.now() + 86400000).toISOString().split('T')[0]);

  // File upload state
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [pendingFiles, setPendingFiles] = useState<File[]>([]);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [selectedDocCategory, setSelectedDocCategory] = useState<string | null>(null);

  // Job document categories
  const documentCategories = [
    { key: 'job_description', label: 'Job Description', color: 'bg-blue-100 text-blue-700' },
    { key: 'requirements', label: 'Requirements', color: 'bg-purple-100 text-purple-700' },
    { key: 'submission', label: 'Submission Docs', color: 'bg-amber-100 text-amber-700' },
    { key: 'candidate', label: 'Candidate Files', color: 'bg-green-100 text-green-700' },
    { key: 'offer', label: 'Offer Letters', color: 'bg-emerald-100 text-emerald-700' },
    { key: 'contract', label: 'Contracts', color: 'bg-indigo-100 text-indigo-700' },
    { key: 'other', label: 'Other', color: 'bg-stone-100 text-stone-600' },
  ];

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="text-center">
          <Loader2 className="animate-spin text-rust mx-auto mb-4" size={48} />
          <p className="text-stone-500 text-sm">Loading job workspace...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error || !job) {
    return (
      <div className="text-center py-12">
        <AlertCircle size={48} className="mx-auto mb-4 text-red-500" />
        <p className="text-red-500 font-medium">Job not found</p>
        <p className="text-stone-400 text-sm mt-2">{error?.message || `ID: ${jobId}`}</p>
        <Link href="/employee/recruiting/jobs" className="inline-flex items-center gap-2 mt-4 text-rust hover:underline">
          <ChevronLeft size={14} /> Back to Jobs
        </Link>
      </div>
    );
  }

  // Format rate
  const formatRate = () => {
    if (!job.rateMin && !job.rateMax) return null;
    const min = job.rateMin ? `$${job.rateMin}` : '';
    const max = job.rateMax ? `$${job.rateMax}` : '';
    const type = job.rateType === 'hourly' ? '/hr' : job.rateType === 'annual' ? '/yr' : '';
    if (min && max) return `${min}-${max}${type}`;
    if (min) return `${min}+${type}`;
    return `Up to ${max}${type}`;
  };

  // Format file size
  const formatFileSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  // Get file icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return '🖼️';
    if (mimeType === 'application/pdf') return '📄';
    if (mimeType.includes('spreadsheet') || mimeType.includes('excel')) return '📊';
    if (mimeType.includes('document') || mimeType.includes('word')) return '📝';
    return '📎';
  };

  // Handle file selection - show modal for metadata
  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files ? Array.from(event.target.files) : [];
    if (files.length === 0) return;

    // Filter valid files (under 10MB)
    const validFiles = files.filter(f => f.size <= 10 * 1024 * 1024);
    if (validFiles.length < files.length) {
      alert('Some files exceeded the 10MB limit and were not added.');
    }
    if (validFiles.length > 0) {
      setPendingFiles(validFiles);
      setShowUploadModal(true);
    }
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Handle file upload with metadata
  const handleUploadWithMetadata = async (metadata: { category: string; description?: string; tags?: string[] }) => {
    setIsUploading(true);
    try {
      for (const file of pendingFiles) {
        const { uploadUrl, filePath, bucket } = await getUploadUrlMutation.mutateAsync({
          fileName: file.name,
          mimeType: file.type || 'application/octet-stream',
          entityType: 'job',
          entityId: jobId,
        });

        const response = await fetch(uploadUrl, {
          method: 'PUT',
          body: file,
          headers: { 'Content-Type': file.type || 'application/octet-stream' },
        });

        if (!response.ok) throw new Error(`Upload failed for ${file.name}`);

        await recordUploadMutation.mutateAsync({
          bucket,
          filePath,
          fileName: file.name,
          fileSize: file.size,
          mimeType: file.type || 'application/octet-stream',
          entityType: 'job',
          entityId: jobId,
          metadata: {
            category: metadata.category,
            description: metadata.description || '',
            tags: metadata.tags || [],
          },
        });
      }
      setPendingFiles([]);
      setShowUploadModal(false);
      refetchDocuments();
    } catch (err) {
      console.error('Upload error:', err);
      alert('Failed to upload file. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  // Handle file download
  const getDownloadUrlMutation = trpc.files.getDownloadUrl.useMutation();
  const handleFileDownload = async (fileId: string) => {
    try {
      const result = await getDownloadUrlMutation.mutateAsync({ fileId });
      window.open(result.url, '_blank');
    } catch (err) {
      console.error('Download error:', err);
      alert('Failed to get download URL.');
    }
  };

  // Handle file delete
  const handleFileDelete = async (fileId: string, fileName: string) => {
    if (!confirm(`Delete "${fileName}"? This cannot be undone.`)) return;
    try {
      await deleteFileMutation.mutateAsync({ fileId });
      refetchDocuments();
    } catch (err) {
      console.error('Delete error:', err);
      alert('Failed to delete file.');
    }
  };

  // Toggle task completion
  const toggleTask = (taskId: string, currentStatus: string) => {
    if (currentStatus === 'completed') return;
    completeTaskMutation.mutate(
      { id: taskId },
      { onSuccess: () => { refetchTasks(); refetchActivities(); } }
    );
  };

  // Add new task
  const addTask = () => {
    if (!newTaskTitle.trim()) return;
    createTaskMutation.mutate(
      {
        entityType: 'job',
        entityId: jobId,
        activityType: 'task',
        subject: newTaskTitle,
        dueDate: new Date(newTaskDueDate),
        priority: newTaskPriority,
        status: 'open',
      },
      {
        onSuccess: () => {
          setNewTaskTitle('');
          setNewTaskPriority('medium');
          setNewTaskDueDate(new Date(Date.now() + 86400000).toISOString().split('T')[0]);
          refetchTasks();
          refetchActivities();
        },
      }
    );
  };

  // Delete task
  const handleDeleteTask = (taskId: string) => {
    cancelTaskMutation.mutate(
      { id: taskId },
      { onSuccess: () => { refetchTasks(); refetchActivities(); } }
    );
  };

  // Group submissions by status for pipeline
  const pipelineStages = [
    { key: 'sourced', label: 'Sourced' },
    { key: 'screening', label: 'Screening' },
    { key: 'submitted_to_client', label: 'Submitted' },
    { key: 'client_interview', label: 'Interview' },
    { key: 'offer_stage', label: 'Offer' },
    { key: 'placed', label: 'Placed' },
  ];

  const taskList = allTasks || [];
  const completedTasks = taskList.filter((t: { status: string }) => t.status === 'completed').length;
  const overdueTasks = taskList.filter((t: { status: string; dueDate?: string | Date | null }) =>
    t.status !== 'completed' && t.dueDate && new Date(t.dueDate) < new Date()
  ).length;

  const activeSubmissions = submissions.filter((s: { status: string }) => s.status !== 'rejected' && s.status !== 'withdrawn');

  return (
    <div className="animate-fade-in pb-12">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <Link
          href="/employee/recruiting/jobs"
          className="inline-flex items-center gap-2 text-stone-400 hover:text-charcoal text-xs font-bold uppercase tracking-widest"
        >
          <ChevronLeft size={14} /> Back to Jobs
        </Link>

        {/* Quick Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowAttachCandidateModal(true)}
            className="px-4 py-2.5 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-all flex items-center gap-2"
          >
            <Plus size={14} /> Attach Candidate
          </button>
        </div>
      </div>

      {/* Pipeline Stage Visualization */}
      <div className="bg-white rounded-2xl border border-stone-200 shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-bold uppercase tracking-widest text-stone-400">Candidate Pipeline</h3>
          <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${JOB_STATUS_COLORS[job.status] || JOB_STATUS_COLORS.open}`}>
            {job.status.replace(/_/g, ' ')}
          </span>
        </div>

        {/* Pipeline Stages */}
        <div className="flex gap-2">
          {pipelineStages.map((stage) => {
            const count = submissions.filter((s: { status: string }) => s.status === stage.key).length;
            return (
              <div key={stage.key} className="flex-1 text-center p-3 bg-stone-50 rounded-xl border border-stone-100">
                <div className="text-lg font-bold text-charcoal">{count}</div>
                <div className="text-[10px] uppercase tracking-widest text-stone-500 font-bold">
                  {stage.label}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-12 gap-6">

        {/* Left Sidebar - Job Info */}
        <div className="col-span-12 lg:col-span-3 space-y-4">

          {/* Job Card */}
          <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
            <div className="h-20 bg-gradient-to-r from-stone-800 to-stone-700"></div>
            <div className="px-6 pb-6 -mt-10">
              <div className="w-20 h-20 bg-white rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg border-4 border-white">
                <Briefcase size={32} className="text-rust" />
              </div>
              <h1 className="text-xl font-serif font-bold text-charcoal text-center mb-1">
                {job.title}
              </h1>
              {account && (
                <Link
                  href={`/employee/recruiting/accounts/${account.id}`}
                  className="flex items-center justify-center gap-1 text-sm text-stone-500 hover:text-rust"
                >
                  <Building2 size={12} /> {account.name}
                </Link>
              )}

              {/* Job Details */}
              <div className="space-y-2 text-sm border-t border-stone-100 pt-4 mt-4">
                {job.location && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <MapPin size={14} className="text-stone-400" />
                    <span>{job.location}</span>
                    {job.isRemote && <span className="text-blue-600">(Remote)</span>}
                  </div>
                )}
                {job.jobType && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Briefcase size={14} className="text-stone-400" />
                    <span className="capitalize">{job.jobType.replace(/_/g, ' ')}</span>
                  </div>
                )}
                {job.createdAt && (
                  <div className="flex items-center gap-2 text-stone-600">
                    <Calendar size={14} className="text-stone-400" />
                    <span>Created {new Date(job.createdAt).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Compensation Card */}
          <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white p-6 rounded-2xl shadow-lg">
            <div className="flex justify-between items-start mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Compensation</span>
              <DollarSign size={16} className="text-green-400" />
            </div>
            <div className="text-2xl font-serif font-bold mb-2">{formatRate() || 'Not specified'}</div>
            <div className="text-xs text-stone-400">
              {job.rateType === 'hourly' ? 'Hourly Rate' : job.rateType === 'annual' ? 'Annual Salary' : 'Rate'}
            </div>
          </div>

          {/* Metrics Card */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Positions</span>
            </div>
            <div className="flex items-center gap-6">
              <div>
                <div className="text-2xl font-bold text-charcoal">{job.positionsFilled || 0}</div>
                <div className="text-xs text-stone-500">Filled</div>
              </div>
              <div className="text-stone-300">/</div>
              <div>
                <div className="text-2xl font-bold text-charcoal">{job.positionsCount || 1}</div>
                <div className="text-xs text-stone-500">Open</div>
              </div>
            </div>
            <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden mt-4">
              <div
                className="absolute inset-y-0 left-0 bg-green-500 rounded-full transition-all"
                style={{ width: `${((job.positionsFilled || 0) / (job.positionsCount || 1)) * 100}%` }}
              />
            </div>
          </div>

          {/* Tasks Summary */}
          <div className="bg-white rounded-2xl border border-stone-200 p-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Tasks</span>
              <span className="text-sm font-medium text-stone-600">{completedTasks}/{taskList.length}</span>
            </div>
            {overdueTasks > 0 && (
              <div className="flex items-center gap-2 text-red-600 text-xs mb-2">
                <AlertCircle size={12} />
                {overdueTasks} overdue
              </div>
            )}
            <div className="relative h-2 bg-stone-100 rounded-full overflow-hidden">
              <div
                className="absolute inset-y-0 left-0 bg-green-500 rounded-full transition-all"
                style={{ width: `${taskList.length ? (completedTasks / taskList.length) * 100 : 0}%` }}
              />
            </div>
          </div>

          {/* Requirements Card */}
          {(job.requiredSkills?.length ?? 0) > 0 && (
            <div className="bg-white rounded-2xl border border-stone-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold uppercase tracking-widest text-stone-400">Required Skills</span>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {job.requiredSkills?.map((skill, idx) => (
                  <span key={idx} className="px-2 py-1 bg-rust/10 text-rust rounded text-xs font-medium">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Main Content Area */}
        <div className="col-span-12 lg:col-span-9 space-y-6">

          {/* Tabs */}
          <div className="bg-white rounded-2xl border border-stone-200 overflow-hidden">
            <div className="flex border-b border-stone-100">
              {[
                { id: 'activity', label: 'Activity', icon: MessageSquare },
                { id: 'submissions', label: 'Submissions', icon: Users, count: activeSubmissions.length },
                { id: 'documents', label: 'Documents', icon: FolderOpen },
                { id: 'tasks', label: 'Tasks', icon: CheckSquare },
              ].map((tab) => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as TabType)}
                    className={`flex-1 py-4 text-xs font-bold uppercase tracking-widest flex items-center justify-center gap-2 transition-all ${
                      activeTab === tab.id
                        ? 'bg-white text-charcoal border-b-2 border-rust'
                        : 'bg-stone-50 text-stone-400 hover:bg-stone-100'
                    }`}
                  >
                    <Icon size={14} /> {tab.label}
                    {tab.count !== undefined && tab.count > 0 && (
                      <span className="px-1.5 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-bold">
                        {tab.count}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            <div className="p-6">
              {/* Activity Tab */}
              {activeTab === 'activity' && (
                <div className="space-y-6">
                  <ActivityComposer entityType="job" entityId={jobId} onActivityCreated={() => refetchActivities()} />
                  <ActivityTimeline
                    activities={activities || []}
                    isLoading={activitiesLoading}
                    onCompleteActivity={(id) => completeTaskMutation.mutate({ id }, { onSuccess: () => { refetchTasks(); refetchActivities(); } })}
                  />
                </div>
              )}

              {/* Submissions Tab */}
              {activeTab === 'submissions' && (
                <div>
                  <div className="flex justify-between items-center mb-6">
                    <h3 className="font-bold text-charcoal">Candidates in Pipeline</h3>
                    <button
                      onClick={() => setShowAttachCandidateModal(true)}
                      className="flex items-center gap-2 px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors"
                    >
                      <Plus size={14} /> Attach Candidate
                    </button>
                  </div>

                  {submissions.length > 0 ? (
                    <div className="space-y-3">
                      {submissions.map((sub: {
                        id: string;
                        candidateId: string;
                        status: string;
                        createdAt?: string | Date | null;
                        submissionNotes?: string | null;
                      }) => (
                        <Link
                          key={sub.id}
                          href={`/employee/recruiting/submissions/${sub.id}`}
                          className="flex items-center justify-between p-4 bg-stone-50 rounded-xl border border-stone-100 hover:border-rust/30 transition-colors"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gradient-to-br from-rust/20 to-rust/10 rounded-lg flex items-center justify-center text-rust font-bold text-sm">
                              {sub.candidateId.slice(0, 2).toUpperCase()}
                            </div>
                            <div>
                              <div className="font-medium text-charcoal">Candidate #{sub.candidateId.slice(0, 8)}</div>
                              <div className="text-xs text-stone-500">
                                Added {sub.createdAt ? new Date(sub.createdAt).toLocaleDateString() : 'N/A'}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${SUBMISSION_STATUS_COLORS[sub.status] || 'bg-stone-100 text-stone-600'}`}>
                              {sub.status.replace(/_/g, ' ')}
                            </span>
                            <ChevronRight size={16} className="text-stone-400" />
                          </div>
                        </Link>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-16 bg-stone-50 rounded-2xl border border-stone-200">
                      <Users size={48} className="mx-auto text-stone-300 mb-4" />
                      <h3 className="font-bold text-charcoal mb-2">No Candidates Yet</h3>
                      <p className="text-stone-500 mb-4">Attach candidates from your talent pool to start the pipeline</p>
                      <button
                        onClick={() => setShowAttachCandidateModal(true)}
                        className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors"
                      >
                        Attach First Candidate
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Documents Tab */}
              {activeTab === 'documents' && (
                <div className="space-y-6">
                  {/* Header with upload button */}
                  <div className="bg-stone-50 rounded-xl border border-stone-200 p-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-bold uppercase tracking-widest text-stone-600">Job Documents</h3>
                        <p className="text-xs text-stone-400 mt-1">
                          Upload job descriptions, requirements, candidate files, and contracts
                        </p>
                      </div>
                      <div>
                        <input
                          ref={fileInputRef}
                          type="file"
                          onChange={handleFileSelect}
                          className="hidden"
                          accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.csv,.png,.jpg,.jpeg"
                          multiple
                        />
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={isUploading}
                          className="px-4 py-2.5 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center gap-2 disabled:opacity-50"
                        >
                          {isUploading ? <Loader2 size={14} className="animate-spin" /> : <Upload size={14} />}
                          Upload Document
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Category Filters */}
                  <div className="flex gap-2 flex-wrap">
                    <button
                      onClick={() => setSelectedDocCategory(null)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-colors ${
                        selectedDocCategory === null
                          ? 'bg-charcoal text-white'
                          : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                      }`}
                    >
                      All ({documents?.length || 0})
                    </button>
                    {documentCategories.map(cat => {
                      const count = documents?.filter(d =>
                        (d.metadata as { category?: string } | null)?.category === cat.key
                      ).length || 0;
                      return (
                        <button
                          key={cat.key}
                          onClick={() => setSelectedDocCategory(cat.key)}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
                            selectedDocCategory === cat.key
                              ? cat.color
                              : 'bg-stone-100 text-stone-500 hover:bg-stone-200'
                          }`}
                        >
                          {cat.label} {count > 0 && `(${count})`}
                        </button>
                      );
                    })}
                  </div>

                  {/* Documents List */}
                  <div className="space-y-3">
                    {documentsLoading ? (
                      <div className="text-center py-8">
                        <Loader2 size={24} className="animate-spin mx-auto text-rust" />
                      </div>
                    ) : (() => {
                      const filteredDocs = selectedDocCategory
                        ? documents?.filter(d =>
                            (d.metadata as { category?: string } | null)?.category === selectedDocCategory
                          )
                        : documents;

                      return filteredDocs && filteredDocs.length > 0 ? (
                        filteredDocs.map(doc => {
                          const meta = doc.metadata as { category?: string; description?: string; tags?: string[] } | null;
                          const category = documentCategories.find(c => c.key === meta?.category);

                          return (
                            <div
                              key={doc.id}
                              className="bg-white rounded-xl border border-stone-200 p-4 hover:border-stone-300 transition-colors group"
                            >
                              <div className="flex items-center gap-4">
                                <div className="w-12 h-12 bg-stone-100 rounded-xl flex items-center justify-center text-2xl flex-shrink-0">
                                  {getFileIcon(doc.mimeType)}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span className="font-medium text-charcoal truncate">{doc.fileName}</span>
                                    {category && (
                                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${category.color}`}>
                                        {category.label}
                                      </span>
                                    )}
                                  </div>
                                  <div className="text-xs text-stone-400 flex items-center gap-3 mt-1">
                                    <span>{formatFileSize(doc.fileSize)}</span>
                                    <span>•</span>
                                    <span>{new Date(doc.uploadedAt).toLocaleDateString()}</span>
                                    {doc.uploaderName && (
                                      <>
                                        <span>•</span>
                                        <span>by {doc.uploaderName}</span>
                                      </>
                                    )}
                                  </div>
                                  {meta?.description && (
                                    <p className="text-xs text-stone-500 mt-1 truncate">{meta.description}</p>
                                  )}
                                  {meta?.tags && meta.tags.length > 0 && (
                                    <div className="flex gap-1 mt-1">
                                      {meta.tags.slice(0, 3).map((tag, i) => (
                                        <span key={i} className="px-1.5 py-0.5 bg-stone-100 text-stone-500 rounded text-[10px]">
                                          {tag}
                                        </span>
                                      ))}
                                      {meta.tags.length > 3 && (
                                        <span className="text-[10px] text-stone-400">+{meta.tags.length - 3}</span>
                                      )}
                                    </div>
                                  )}
                                </div>
                                <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                                  <button
                                    onClick={() => handleFileDownload(doc.id)}
                                    className="p-2 text-stone-400 hover:text-charcoal hover:bg-stone-100 rounded-lg transition-colors"
                                    title="Download"
                                  >
                                    <ExternalLink size={16} />
                                  </button>
                                  <button
                                    onClick={() => handleFileDelete(doc.id, doc.fileName)}
                                    disabled={deleteFileMutation.isPending}
                                    className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                                    title="Delete"
                                  >
                                    <Trash2 size={16} />
                                  </button>
                                </div>
                              </div>
                            </div>
                          );
                        })
                      ) : (
                        <div className="text-center py-12 bg-white rounded-xl border border-stone-200">
                          <FolderOpen size={48} className="mx-auto mb-4 text-stone-300" />
                          <p className="text-stone-500 font-medium">
                            {selectedDocCategory ? `No ${documentCategories.find(c => c.key === selectedDocCategory)?.label} documents yet` : 'No documents yet'}
                          </p>
                          <p className="text-sm text-stone-400 mt-1">Upload your first document to get started</p>
                          <button
                            onClick={() => fileInputRef.current?.click()}
                            className="mt-4 px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors"
                          >
                            Upload Document
                          </button>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Upload Modal with Metadata */}
                  {showUploadModal && (
                    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                      <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl">
                        <div className="p-6 border-b border-stone-100">
                          <div className="flex items-center justify-between">
                            <h2 className="text-xl font-serif font-bold text-charcoal">Upload Documents</h2>
                            <button onClick={() => { setShowUploadModal(false); setPendingFiles([]); }} className="text-stone-400 hover:text-charcoal">
                              <X size={24} />
                            </button>
                          </div>
                          <p className="text-sm text-stone-500 mt-1">{pendingFiles.length} file(s) selected</p>
                        </div>

                        <UploadMetadataForm
                          files={pendingFiles}
                          categories={documentCategories}
                          isUploading={isUploading}
                          onUpload={handleUploadWithMetadata}
                          onCancel={() => { setShowUploadModal(false); setPendingFiles([]); }}
                          formatFileSize={formatFileSize}
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Tasks Tab */}
              {activeTab === 'tasks' && (
                <div className="space-y-6">
                  {/* Add Task Form */}
                  <div className="bg-stone-50 border border-stone-200 rounded-xl p-4 space-y-3">
                    <input
                      type="text"
                      placeholder="Add a new task..."
                      value={newTaskTitle}
                      onChange={(e) => setNewTaskTitle(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addTask()}
                      className="w-full p-3 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                    />
                    <div className="flex gap-3">
                      <div className="flex-1">
                        <label className="text-xs text-stone-500 mb-1 block">Due Date</label>
                        <input
                          type="date"
                          value={newTaskDueDate}
                          onChange={(e) => setNewTaskDueDate(e.target.value)}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                        />
                      </div>
                      <div className="flex-1">
                        <label className="text-xs text-stone-500 mb-1 block">Priority</label>
                        <select
                          value={newTaskPriority}
                          onChange={(e) => setNewTaskPriority(e.target.value as 'low' | 'medium' | 'high')}
                          className="w-full p-2 bg-white border border-stone-200 rounded-lg text-sm focus:outline-none focus:border-rust"
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <div className="flex items-end">
                        <button
                          onClick={addTask}
                          disabled={!newTaskTitle.trim() || createTaskMutation.isPending}
                          className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors disabled:opacity-50 flex items-center gap-2"
                        >
                          {createTaskMutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <Plus size={14} />}
                          Add
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Task List */}
                  <div className="space-y-2">
                    {tasksLoading ? (
                      <div className="text-center py-8">
                        <Loader2 size={24} className="animate-spin mx-auto text-rust" />
                      </div>
                    ) : taskList.length > 0 ? (
                      taskList.map((task: {
                        id: string;
                        subject?: string | null;
                        status: string;
                        dueDate?: string | Date | null;
                        priority?: string | null;
                      }) => {
                        const isCompleted = task.status === 'completed';
                        const isOverdue = !isCompleted && task.dueDate && new Date(task.dueDate) < new Date();
                        return (
                          <div
                            key={task.id}
                            className={`flex items-center gap-3 p-3 rounded-xl border transition-all ${
                              isCompleted
                                ? 'bg-green-50 border-green-200'
                                : isOverdue
                                ? 'bg-red-50 border-red-200'
                                : 'bg-white border-stone-200'
                            }`}
                          >
                            <button
                              onClick={() => toggleTask(task.id, task.status)}
                              className="flex-shrink-0"
                              disabled={completeTaskMutation.isPending || isCompleted}
                            >
                              {isCompleted ? (
                                <CheckSquare size={20} className="text-green-600" />
                              ) : (
                                <Square size={20} className="text-stone-400 hover:text-charcoal" />
                              )}
                            </button>
                            <div className="flex-1 min-w-0">
                              <div className={`text-sm font-medium ${isCompleted ? 'line-through text-stone-400' : 'text-charcoal'}`}>
                                {task.subject || 'Untitled Task'}
                              </div>
                              <div className={`text-xs ${isOverdue ? 'text-red-600' : 'text-stone-400'}`}>
                                Due: {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'No date'}
                                {isOverdue && ' (Overdue)'}
                              </div>
                            </div>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                task.priority === 'high' || task.priority === 'urgent'
                                  ? 'bg-red-100 text-red-600'
                                  : task.priority === 'medium'
                                  ? 'bg-amber-100 text-amber-600'
                                  : 'bg-stone-100 text-stone-600'
                              }`}
                            >
                              {task.priority || 'medium'}
                            </span>
                            <button
                              onClick={() => handleDeleteTask(task.id)}
                              disabled={cancelTaskMutation.isPending}
                              className="text-stone-400 hover:text-red-500 transition-colors p-1"
                            >
                              <X size={16} />
                            </button>
                          </div>
                        );
                      })
                    ) : (
                      <div className="text-center py-8 text-stone-400">
                        <CheckSquare size={32} className="mx-auto mb-2 opacity-50" />
                        <p className="text-sm">No tasks yet. Add your first task above.</p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Attach Candidate Modal */}
      {showAttachCandidateModal && (
        <AttachCandidateModal
          jobId={jobId}
          onClose={() => setShowAttachCandidateModal(false)}
          onSuccess={() => refetchSubmissions()}
        />
      )}
    </div>
  );
};

export default JobWorkspace;
