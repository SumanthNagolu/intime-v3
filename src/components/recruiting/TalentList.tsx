'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  Search, User, ChevronRight, MapPin, Briefcase, Clock,
  MoreHorizontal, Plus, Loader2, Building2, Filter, Users
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

// Status filter options
const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Active', value: 'active' },
  { label: 'Bench', value: 'bench' },
  { label: 'Placed', value: 'placed' },
  { label: 'Inactive', value: 'inactive' },
];

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

// Availability badges
const AVAILABILITY_CONFIG: Record<string, { label: string; color: string }> = {
  immediate: { label: 'Immediate', color: 'bg-green-50 text-green-700' },
  '2_weeks': { label: '2 Weeks', color: 'bg-amber-50 text-amber-700' },
  '1_month': { label: '1 Month', color: 'bg-orange-50 text-orange-700' },
};

// Source type filters (internal bench vs third-party)
const SOURCE_FILTERS = [
  { label: 'All Sources', value: 'all' },
  { label: 'Internal Bench', value: 'internal' },
  { label: 'Third Party', value: 'third_party' },
];

interface AddTalentModalProps {
  onClose: () => void;
  onSuccess: (talent: { id: string }) => void;
}

const AddTalentModal: React.FC<AddTalentModalProps> = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    candidateSkills: [] as string[],
    candidateExperienceYears: 5,
    candidateCurrentVisa: 'H1B' as const,
    candidateVisaExpiry: '',
    candidateHourlyRate: '',
    candidateAvailability: 'immediate' as const,
    candidateLocation: '',
    candidateWillingToRelocate: false,
  });
  const [skillInput, setSkillInput] = useState('');

  const createCandidate = trpc.ats.candidates.create.useMutation({
    onSuccess: (data) => {
      onSuccess(data);
    },
  });

  const addSkill = () => {
    if (skillInput.trim() && !formData.candidateSkills.includes(skillInput.trim())) {
      setFormData(prev => ({
        ...prev,
        candidateSkills: [...prev.candidateSkills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill: string) => {
    setFormData(prev => ({
      ...prev,
      candidateSkills: prev.candidateSkills.filter(s => s !== skill)
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCandidate.mutate({
      ...formData,
      candidateHourlyRate: formData.candidateHourlyRate ? parseFloat(formData.candidateHourlyRate) : undefined,
      candidateVisaExpiry: formData.candidateVisaExpiry ? new Date(formData.candidateVisaExpiry) : undefined,
    });
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl p-8 max-w-2xl w-full shadow-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-serif font-bold text-charcoal">Add New Talent</h2>
            <p className="text-sm text-stone-500">Add a candidate to your talent pool</p>
          </div>
          <button onClick={onClose} className="text-stone-400 hover:text-charcoal">
            <MoreHorizontal size={20} />
          </button>
        </div>

        {createCandidate.error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
            {createCandidate.error.message}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <User size={14} /> Personal Information
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">First Name *</label>
                <input
                  type="text"
                  required
                  value={formData.firstName}
                  onChange={(e) => setFormData(prev => ({ ...prev, firstName: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Last Name *</label>
                <input
                  type="text"
                  required
                  value={formData.lastName}
                  onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Email *</label>
                <input
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Phone</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>
            </div>
          </div>

          {/* Skills & Experience */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <Briefcase size={14} /> Skills & Experience
            </h3>
            <div>
              <label className="text-xs text-stone-500 mb-1 block">Technical Skills *</label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                  placeholder="e.g., Java, AWS, React"
                  className="flex-1 p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
                <button
                  type="button"
                  onClick={addSkill}
                  className="px-4 py-2 bg-stone-100 rounded-xl text-sm font-bold hover:bg-stone-200"
                >
                  Add
                </button>
              </div>
              {formData.candidateSkills.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {formData.candidateSkills.map(skill => (
                    <span key={skill} className="px-3 py-1 bg-rust/10 text-rust rounded-full text-xs font-medium flex items-center gap-1">
                      {skill}
                      <button type="button" onClick={() => removeSkill(skill)} className="hover:text-red-600">&times;</button>
                    </span>
                  ))}
                </div>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="50"
                  value={formData.candidateExperienceYears}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateExperienceYears: parseInt(e.target.value) || 0 }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Hourly Rate ($)</label>
                <input
                  type="number"
                  min="0"
                  value={formData.candidateHourlyRate}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateHourlyRate: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>
            </div>
          </div>

          {/* Immigration Status */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500">Immigration Status</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Visa Type *</label>
                <select
                  value={formData.candidateCurrentVisa}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateCurrentVisa: e.target.value as typeof formData.candidateCurrentVisa }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust bg-white"
                >
                  <option value="H1B">H-1B</option>
                  <option value="GC">Green Card</option>
                  <option value="USC">US Citizen</option>
                  <option value="OPT">OPT</option>
                  <option value="CPT">CPT</option>
                  <option value="TN">TN Visa</option>
                  <option value="L1">L-1</option>
                  <option value="EAD">EAD</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Visa Expiry</label>
                <input
                  type="date"
                  value={formData.candidateVisaExpiry}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateVisaExpiry: e.target.value }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>
            </div>
          </div>

          {/* Availability & Location */}
          <div className="space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-widest text-stone-500 flex items-center gap-2">
              <MapPin size={14} /> Availability & Location
            </h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Availability *</label>
                <select
                  value={formData.candidateAvailability}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateAvailability: e.target.value as typeof formData.candidateAvailability }))}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust bg-white"
                >
                  <option value="immediate">Immediate</option>
                  <option value="2_weeks">2 Weeks Notice</option>
                  <option value="1_month">1 Month Notice</option>
                </select>
              </div>
              <div>
                <label className="text-xs text-stone-500 mb-1 block">Location</label>
                <input
                  type="text"
                  value={formData.candidateLocation}
                  onChange={(e) => setFormData(prev => ({ ...prev, candidateLocation: e.target.value }))}
                  placeholder="e.g., Dallas, TX"
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>
            </div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.candidateWillingToRelocate}
                onChange={(e) => setFormData(prev => ({ ...prev, candidateWillingToRelocate: e.target.checked }))}
                className="rounded"
              />
              <span className="text-sm text-stone-600">Willing to relocate</span>
            </label>
          </div>

          {/* Actions */}
          <div className="flex gap-4 pt-4 border-t border-stone-200">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={createCandidate.isPending || formData.candidateSkills.length === 0}
              className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {createCandidate.isPending ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Adding...
                </>
              ) : (
                <>
                  <Plus size={14} /> Add Talent
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export const TalentList: React.FC = () => {
  const router = useRouter();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Fetch candidates using the candidates.search endpoint
  const { data: candidates = [], isLoading, error, refetch } = trpc.ats.candidates.search.useQuery({
    query: searchTerm.length >= 2 ? searchTerm : undefined,
    limit: 50,
  });

  // Filter by status locally
  const displayCandidates = candidates.filter(c => {
    if (statusFilter !== 'all' && c.candidateStatus !== statusFilter) return false;
    // For source filter, we'd need a sourceType field - placeholder for now
    return true;
  });

  const handleTalentCreated = (talent: { id: string }) => {
    refetch();
    router.push(`/employee/recruiting/talent/${talent.id}`);
  };

  return (
    <div className="animate-fade-in">
      {/* Top Bar with Search and Filters */}
      <div className="flex flex-col md:flex-row gap-4 mb-8 justify-between items-end">
        {/* Search */}
        <div className="flex items-center gap-4 bg-white p-3 rounded-full border border-stone-200 shadow-sm flex-1 max-w-md">
          <Search size={18} className="text-stone-400 ml-2" />
          <input
            type="text"
            placeholder="Search by name, skills, or location..."
            className="flex-1 bg-transparent outline-none text-sm font-medium text-charcoal placeholder-stone-400"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>

        {/* Source Filter */}
        <div className="bg-stone-100 p-1 rounded-full flex gap-1 overflow-x-auto max-w-full">
          {SOURCE_FILTERS.map(sf => (
            <button
              key={sf.value}
              onClick={() => setSourceFilter(sf.value)}
              className={`px-4 py-2 rounded-full text-[10px] font-bold uppercase tracking-widest whitespace-nowrap transition-all ${
                sourceFilter === sf.value ? 'bg-white text-charcoal shadow-sm' : 'text-stone-400 hover:text-stone-600'
              }`}
            >
              {sf.label}
            </button>
          ))}
        </div>
      </div>

      {/* Status Filter + New Talent Button */}
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
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-charcoal text-white rounded-full text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors shadow-lg shrink-0"
        >
          <Plus size={14} />
          Add Talent
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
          <p className="text-red-600 mb-4">Failed to load talent pool</p>
          <button
            onClick={() => refetch()}
            className="px-4 py-2 bg-red-100 text-red-700 rounded-lg text-sm font-medium hover:bg-red-200 transition-colors"
          >
            Try Again
          </button>
        </div>
      )}

      {/* Talent Grid */}
      {!isLoading && !error && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayCandidates.map(candidate => (
            <Link
              href={`/employee/recruiting/talent/${candidate.id}`}
              key={candidate.id}
              className="bg-white p-6 rounded-[2rem] border border-stone-200 shadow-sm hover:shadow-xl hover:border-rust/30 transition-all group relative"
            >
              <div className="absolute top-6 right-6 text-stone-300 group-hover:text-charcoal transition-colors">
                <MoreHorizontal size={20} />
              </div>

              {/* Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className="w-14 h-14 bg-gradient-to-br from-rust/20 to-rust/10 rounded-2xl flex items-center justify-center text-rust font-bold text-lg border border-rust/10">
                  {candidate.firstName?.[0]}{candidate.lastName?.[0]}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-serif font-bold text-xl text-charcoal mb-1 group-hover:text-rust transition-colors truncate">
                    {candidate.fullName || `${candidate.firstName} ${candidate.lastName}`}
                  </h3>
                  <div className="flex items-center gap-2 text-xs text-stone-500">
                    {candidate.candidateLocation && (
                      <>
                        <MapPin size={12} />
                        <span className="truncate">{candidate.candidateLocation}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Skills */}
              {candidate.candidateSkills && candidate.candidateSkills.length > 0 && (
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {candidate.candidateSkills.slice(0, 4).map((skill, idx) => (
                    <span key={idx} className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded text-[10px] font-medium">
                      {skill}
                    </span>
                  ))}
                  {candidate.candidateSkills.length > 4 && (
                    <span className="px-2 py-0.5 bg-stone-100 text-stone-400 rounded text-[10px] font-medium">
                      +{candidate.candidateSkills.length - 4}
                    </span>
                  )}
                </div>
              )}

              {/* Info Row */}
              <div className="flex gap-3 mb-4">
                {candidate.candidateCurrentVisa && (
                  <span className={`px-2 py-1 rounded text-[10px] font-bold ${VISA_COLORS[candidate.candidateCurrentVisa] || VISA_COLORS.Other}`}>
                    {candidate.candidateCurrentVisa}
                  </span>
                )}
                {candidate.candidateExperienceYears && (
                  <span className="px-2 py-1 bg-stone-100 rounded text-[10px] font-medium text-stone-600">
                    {candidate.candidateExperienceYears}+ yrs
                  </span>
                )}
                {candidate.candidateHourlyRate && (
                  <span className="px-2 py-1 bg-green-50 rounded text-[10px] font-medium text-green-700">
                    ${candidate.candidateHourlyRate}/hr
                  </span>
                )}
              </div>

              {/* Footer */}
              <div className="pt-4 border-t border-stone-100 flex justify-between items-center">
                <div className="flex items-center gap-2">
                  {candidate.candidateAvailability && AVAILABILITY_CONFIG[candidate.candidateAvailability] && (
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase tracking-widest ${AVAILABILITY_CONFIG[candidate.candidateAvailability].color}`}>
                      <Clock size={10} className="inline mr-1" />
                      {AVAILABILITY_CONFIG[candidate.candidateAvailability].label}
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-xs font-bold text-stone-400 group-hover:text-charcoal transition-colors">
                  Profile <ChevronRight size={12} />
                </div>
              </div>
            </Link>
          ))}

          {displayCandidates.length === 0 && !isLoading && (
            <div className="col-span-full text-center py-12 bg-stone-50 rounded-2xl border border-stone-200">
              <Users size={32} className="mx-auto text-stone-300 mb-3" />
              <p className="text-stone-500 mb-4">
                {searchTerm ? 'No talent found matching your search.' : 'No talent in pool yet.'}
              </p>
              <button
                onClick={() => setShowAddModal(true)}
                className="px-4 py-2 bg-charcoal text-white rounded-lg text-sm font-medium hover:bg-rust transition-colors"
              >
                Add First Talent
              </button>
            </div>
          )}
        </div>
      )}

      {/* Add Talent Modal */}
      {showAddModal && (
        <AddTalentModal
          onClose={() => setShowAddModal(false)}
          onSuccess={handleTalentCreated}
        />
      )}
    </div>
  );
};

export default TalentList;
