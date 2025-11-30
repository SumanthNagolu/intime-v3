'use client';

import React, { useState, useEffect } from 'react';
import { X, Loader2, Save, User, GraduationCap, Shield, DollarSign, AlertCircle, Plus, Trash2, FileText } from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import type { Address, CandidateEducation, CandidateWorkHistory, CandidateWorkAuthorization, CandidateCertification, CandidateReference, CandidateResume, CandidateBackgroundCheck, CandidateComplianceDocument } from '@/lib/db/schema/ats';

interface EditTalentModalProps {
  talentId: string;
  talentName: string;
  onClose: () => void;
  onSuccess: () => void;
}

// Type for form data used in the component
interface TalentFormData {
  firstName?: string;
  middleName?: string;
  lastName?: string;
  preferredName?: string;
  dateOfBirth?: string;
  gender?: string;
  nationality?: string;
  email?: string;
  emailSecondary?: string;
  phone?: string;
  phoneHome?: string;
  phoneWork?: string;
  preferredContactMethod?: string;
  preferredCallTime?: string;
  doNotContact?: boolean;
  doNotEmail?: boolean;
  doNotText?: boolean;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  emergencyContactName?: string;
  emergencyContactRelationship?: string;
  emergencyContactPhone?: string;
  emergencyContactEmail?: string;
  professionalHeadline?: string;
  professionalSummary?: string;
  careerObjectives?: string;
  candidateSkills?: string[];
  candidateExperienceYears?: number;
  candidateStatus?: string;
  candidateAvailability?: string;
  currentEmploymentStatus?: string;
  noticePeriodDays?: number;
  earliestStartDate?: string;
  preferredEmploymentType?: string[];
  candidateWillingToRelocate?: boolean;
  preferredLocations?: string[];
  relocationAssistanceRequired?: boolean;
  candidateHourlyRate?: string | number;
  minimumHourlyRate?: string | number;
  desiredSalaryAnnual?: string | number;
  minimumAnnualSalary?: string | number;
  desiredSalaryCurrency?: string;
  benefitsRequired?: string[];
  compensationNotes?: string;
  leadSource?: string;
  leadSourceDetail?: string;
  marketingStatus?: string;
  isOnHotlist?: boolean;
  hotlistNotes?: string;
  languages?: string[];
  recruiterRating?: number;
  recruiterRatingNotes?: string;
  tags?: string[];
}

// Consolidated tabs: 5 tabs instead of 12
type TabType = 'profile' | 'background' | 'workAuth' | 'compensation' | 'documents';

const TABS: { id: TabType; label: string; icon: React.ReactNode }[] = [
  { id: 'profile', label: 'Profile', icon: <User className="w-4 h-4" /> },
  { id: 'background', label: 'Background', icon: <GraduationCap className="w-4 h-4" /> },
  { id: 'workAuth', label: 'Work Auth', icon: <Shield className="w-4 h-4" /> },
  { id: 'compensation', label: 'Compensation', icon: <DollarSign className="w-4 h-4" /> },
  { id: 'documents', label: 'Documents', icon: <FileText className="w-4 h-4" /> },
];

// Country options for address forms
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'CA', name: 'Canada' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'IN', name: 'India' },
  { code: 'DE', name: 'Germany' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'AE', name: 'UAE' },
  { code: 'NL', name: 'Netherlands' },
  { code: 'FR', name: 'France' },
];

const VISA_TYPES = [
  'H1B', 'H1B1', 'H4_EAD', 'L1A', 'L1B', 'L2_EAD', 'O1', 'TN',
  'F1_OPT', 'F1_CPT', 'F1_STEM_OPT', 'GC_EAD', 'OTHER'
];

const DEGREE_TYPES = [
  { value: 'high_school', label: 'High School' },
  { value: 'associate', label: 'Associate' },
  { value: 'bachelor', label: "Bachelor's" },
  { value: 'master', label: "Master's" },
  { value: 'doctorate', label: 'Doctorate' },
  { value: 'bootcamp', label: 'Bootcamp' },
  { value: 'certificate', label: 'Certificate' },
];

const EMPLOYMENT_TYPES = [
  { value: 'full_time', label: 'Full Time' },
  { value: 'part_time', label: 'Part Time' },
  { value: 'contract', label: 'Contract' },
  { value: 'freelance', label: 'Freelance' },
  { value: 'internship', label: 'Internship' },
];

export const EditTalentModal: React.FC<EditTalentModalProps> = ({
  talentId,
  talentName,
  onClose,
  onSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<TabType>('profile');
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasChanges, setHasChanges] = useState(false);

  // Form state for the main profile
  const [formData, setFormData] = useState<TalentFormData>({});

  // Fetch full profile data
  const { data: profile, isLoading, refetch } = trpc.ats.candidates.getFullProfile.useQuery(
    { id: talentId },
    { enabled: !!talentId }
  );

  // Mutations
  const updateProfile = trpc.ats.candidates.updateProfile.useMutation();
  const createAddress = trpc.ats.addresses.create.useMutation();
  const updateAddress = trpc.ats.addresses.update.useMutation();
  const deleteAddress = trpc.ats.addresses.delete.useMutation();
  const createEducation = trpc.ats.education.create.useMutation();
  const updateEducation = trpc.ats.education.update.useMutation();
  const deleteEducation = trpc.ats.education.delete.useMutation();
  const createWorkHistory = trpc.ats.workHistory.create.useMutation();
  const updateWorkHistory = trpc.ats.workHistory.update.useMutation();
  const deleteWorkHistory = trpc.ats.workHistory.delete.useMutation();
  const createWorkAuth = trpc.ats.workAuthorizations.create.useMutation();
  const updateWorkAuth = trpc.ats.workAuthorizations.update.useMutation();
  const createCertification = trpc.ats.certifications.create.useMutation();
  const updateCertification = trpc.ats.certifications.update.useMutation();
  const deleteCertification = trpc.ats.certifications.delete.useMutation();
  const createReference = trpc.ats.references.create.useMutation();
  const updateReference = trpc.ats.references.update.useMutation();
  const deleteReference = trpc.ats.references.delete.useMutation();

  // Initialize form data when profile loads
  useEffect(() => {
    if (profile) {
      setFormData({
        // Personal
        firstName: profile.firstName || '',
        middleName: profile.middleName || '',
        lastName: profile.lastName || '',
        preferredName: profile.preferredName || '',
        dateOfBirth: profile.dateOfBirth || '',
        gender: profile.gender || '',
        nationality: profile.nationality || '',

        // Contact
        email: profile.email || '',
        emailSecondary: profile.emailSecondary || '',
        phone: profile.phone || '',
        phoneHome: profile.phoneHome || '',
        phoneWork: profile.phoneWork || '',
        preferredContactMethod: profile.preferredContactMethod || 'email',
        preferredCallTime: profile.preferredCallTime || '',
        doNotContact: profile.doNotContact || false,
        doNotEmail: profile.doNotEmail || false,
        doNotText: profile.doNotText || false,
        linkedinUrl: profile.linkedinUrl || '',
        githubUrl: profile.githubUrl || '',
        portfolioUrl: profile.portfolioUrl || '',

        // Emergency Contact
        emergencyContactName: profile.emergencyContactName || '',
        emergencyContactRelationship: profile.emergencyContactRelationship || '',
        emergencyContactPhone: profile.emergencyContactPhone || '',
        emergencyContactEmail: profile.emergencyContactEmail || '',

        // Professional
        professionalHeadline: profile.professionalHeadline || '',
        professionalSummary: profile.professionalSummary || '',
        careerObjectives: profile.careerObjectives || '',
        candidateSkills: profile.candidateSkills || [],
        candidateExperienceYears: profile.candidateExperienceYears || 0,
        candidateStatus: profile.candidateStatus || 'active',
        candidateAvailability: profile.candidateAvailability || 'immediate',
        currentEmploymentStatus: profile.currentEmploymentStatus || '',
        noticePeriodDays: profile.noticePeriodDays || 0,
        earliestStartDate: profile.earliestStartDate || '',
        preferredEmploymentType: profile.preferredEmploymentType || [],
        candidateWillingToRelocate: profile.candidateWillingToRelocate || false,
        preferredLocations: profile.preferredLocations || [],
        relocationAssistanceRequired: profile.relocationAssistanceRequired || false,

        // Compensation
        candidateHourlyRate: profile.candidateHourlyRate || '',
        minimumHourlyRate: profile.minimumHourlyRate || '',
        desiredSalaryAnnual: profile.desiredSalaryAnnual || '',
        minimumAnnualSalary: profile.minimumAnnualSalary || '',
        desiredSalaryCurrency: profile.desiredSalaryCurrency || 'USD',
        benefitsRequired: profile.benefitsRequired || [],
        compensationNotes: profile.compensationNotes || '',

        // Source
        leadSource: profile.leadSource || '',
        leadSourceDetail: profile.leadSourceDetail || '',
        marketingStatus: profile.marketingStatus || 'active',
        isOnHotlist: profile.isOnHotlist || false,
        hotlistNotes: profile.hotlistNotes || '',

        // Languages
        languages: profile.languages || [],

        // Rating
        recruiterRating: profile.recruiterRating || 0,
        recruiterRatingNotes: profile.recruiterRatingNotes || '',

        // Tags
        tags: profile.tags || [],
      });
    }
  }, [profile]);

  const handleFieldChange = (field: string, value: unknown) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setHasChanges(true);
  };

  const handleSaveProfile = async () => {
    setIsSaving(true);
    setError(null);
    try {
      await updateProfile.mutateAsync({
        id: talentId,
        ...formData,
        candidateExperienceYears: formData.candidateExperienceYears ? Number(formData.candidateExperienceYears) : undefined,
        noticePeriodDays: formData.noticePeriodDays ? Number(formData.noticePeriodDays) : undefined,
        candidateHourlyRate: formData.candidateHourlyRate ? Number(formData.candidateHourlyRate) : undefined,
        minimumHourlyRate: formData.minimumHourlyRate ? Number(formData.minimumHourlyRate) : undefined,
        desiredSalaryAnnual: formData.desiredSalaryAnnual ? Number(formData.desiredSalaryAnnual) : undefined,
        minimumAnnualSalary: formData.minimumAnnualSalary ? Number(formData.minimumAnnualSalary) : undefined,
        recruiterRating: formData.recruiterRating ? Number(formData.recruiterRating) : undefined,
      });
      setHasChanges(false);
      refetch();
      onSuccess();
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to save profile';
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
        <div className="bg-white rounded-lg p-8">
          <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto" />
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-6xl max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50 rounded-t-xl">
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Edit Talent Profile</h2>
            <p className="text-sm text-gray-500">{talentName}</p>
          </div>
          <div className="flex items-center gap-3">
            {hasChanges && (
              <span className="text-sm text-amber-600 flex items-center gap-1">
                <AlertCircle className="w-4 h-4" />
                Unsaved changes
              </span>
            )}
            <button
              onClick={handleSaveProfile}
              disabled={isSaving || !hasChanges}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              Save Changes
            </button>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-200 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Error display */}
        {error && (
          <div className="px-6 py-3 bg-red-50 border-b border-red-100">
            <p className="text-sm text-red-600 flex items-center gap-2">
              <AlertCircle className="w-4 h-4" />
              {error}
            </p>
          </div>
        )}

        {/* Content */}
        <div className="flex flex-1 overflow-hidden">
          {/* Sidebar Tabs */}
          <div className="w-48 bg-gray-50 border-r overflow-y-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`w-full flex items-center gap-2 px-4 py-3 text-sm text-left transition-colors ${
                  activeTab === tab.id
                    ? 'bg-white text-blue-600 border-r-2 border-blue-600 font-medium'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {tab.icon}
                {tab.label}
              </button>
            ))}
          </div>

          {/* Tab Content - Consolidated into 5 tabs */}
          <div className="flex-1 overflow-y-auto p-6">
            {/* Profile Tab: Personal + Contact + Professional */}
            {activeTab === 'profile' && (
              <div className="space-y-8">
                <PersonalTab formData={formData} onChange={handleFieldChange} />
                <hr className="border-gray-200" />
                <ContactTab formData={formData} onChange={handleFieldChange} />
                <hr className="border-gray-200" />
                <ProfessionalTab formData={formData} onChange={handleFieldChange} />
              </div>
            )}

            {/* Background Tab: Education + Experience + Certifications */}
            {activeTab === 'background' && profile && (
              <div className="space-y-8">
                <EducationTab
                  candidateId={talentId}
                  education={profile.education}
                  onCreate={createEducation.mutateAsync}
                  onUpdate={updateEducation.mutateAsync}
                  onDelete={deleteEducation.mutateAsync}
                  onRefresh={refetch}
                />
                <hr className="border-gray-200" />
                <ExperienceTab
                  candidateId={talentId}
                  workHistory={profile.workHistory}
                  onCreate={createWorkHistory.mutateAsync}
                  onUpdate={updateWorkHistory.mutateAsync}
                  onDelete={deleteWorkHistory.mutateAsync}
                  onRefresh={refetch}
                />
                <hr className="border-gray-200" />
                <CertificationsTab
                  candidateId={talentId}
                  certifications={profile.certifications}
                  onCreate={createCertification.mutateAsync}
                  onUpdate={updateCertification.mutateAsync}
                  onDelete={deleteCertification.mutateAsync}
                  onRefresh={refetch}
                />
              </div>
            )}

            {/* Work Auth Tab: Addresses + Work Authorizations */}
            {activeTab === 'workAuth' && profile && (
              <div className="space-y-8">
                <AddressesTab
                  candidateId={talentId}
                  addresses={profile.addresses}
                  onCreate={createAddress.mutateAsync}
                  onUpdate={updateAddress.mutateAsync}
                  onDelete={deleteAddress.mutateAsync}
                  onRefresh={refetch}
                />
                <hr className="border-gray-200" />
                <WorkAuthTab
                  candidateId={talentId}
                  workAuthorizations={profile.workAuthorizations}
                  onCreate={createWorkAuth.mutateAsync}
                  onUpdate={updateWorkAuth.mutateAsync}
                  onRefresh={refetch}
                />
              </div>
            )}

            {/* Compensation Tab: Compensation + Source */}
            {activeTab === 'compensation' && (
              <div className="space-y-8">
                <CompensationTab formData={formData} onChange={handleFieldChange} />
                <hr className="border-gray-200" />
                <SourceTab formData={formData} onChange={handleFieldChange} />
              </div>
            )}

            {/* Documents Tab: References + Compliance (BGV + Documents) + Resumes */}
            {activeTab === 'documents' && profile && (
              <div className="space-y-8">
                <DocumentsSection resumes={profile.resumes} candidateId={talentId} onRefresh={refetch} />
                <hr className="border-gray-200" />
                <ReferencesTab
                  candidateId={talentId}
                  references={profile.references}
                  onCreate={createReference.mutateAsync}
                  onUpdate={updateReference.mutateAsync}
                  onDelete={deleteReference.mutateAsync}
                  onRefresh={refetch}
                />
                <hr className="border-gray-200" />
                <ComplianceTab
                  candidateId={talentId}
                  backgroundChecks={profile.backgroundChecks}
                  complianceDocuments={profile.complianceDocuments}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================
// TAB COMPONENTS
// ============================================

const PersonalTab: React.FC<{ formData: TalentFormData; onChange: (field: string, value: unknown) => void }> = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Personal Information</h3>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
        <input
          type="text"
          value={formData.firstName}
          onChange={e => onChange('firstName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
        <input
          type="text"
          value={formData.middleName}
          onChange={e => onChange('middleName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
        <input
          type="text"
          value={formData.lastName}
          onChange={e => onChange('lastName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Name</label>
        <input
          type="text"
          value={formData.preferredName}
          onChange={e => onChange('preferredName', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="Nickname or preferred name"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
        <input
          type="date"
          value={formData.dateOfBirth}
          onChange={e => onChange('dateOfBirth', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
        <select
          value={formData.gender}
          onChange={e => onChange('gender', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select...</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
          <option value="non_binary">Non-Binary</option>
          <option value="prefer_not_to_say">Prefer not to say</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Nationality</label>
        <input
          type="text"
          value={formData.nationality}
          onChange={e => onChange('nationality', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    {/* Emergency Contact */}
    <div className="border-t pt-6 mt-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">Emergency Contact</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          <input
            type="text"
            value={formData.emergencyContactName}
            onChange={e => onChange('emergencyContactName', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
          <input
            type="text"
            value={formData.emergencyContactRelationship}
            onChange={e => onChange('emergencyContactRelationship', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            value={formData.emergencyContactPhone}
            onChange={e => onChange('emergencyContactPhone', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            value={formData.emergencyContactEmail}
            onChange={e => onChange('emergencyContactEmail', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  </div>
);

const ContactTab: React.FC<{ formData: TalentFormData; onChange: (field: string, value: unknown) => void }> = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Contact Information</h3>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Primary Email *</label>
        <input
          type="email"
          value={formData.email}
          onChange={e => onChange('email', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Secondary Email</label>
        <input
          type="email"
          value={formData.emailSecondary}
          onChange={e => onChange('emailSecondary', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div className="grid grid-cols-3 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Mobile Phone</label>
        <input
          type="tel"
          value={formData.phone}
          onChange={e => onChange('phone', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Home Phone</label>
        <input
          type="tel"
          value={formData.phoneHome}
          onChange={e => onChange('phoneHome', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Work Phone</label>
        <input
          type="tel"
          value={formData.phoneWork}
          onChange={e => onChange('phoneWork', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Contact Method</label>
        <select
          value={formData.preferredContactMethod}
          onChange={e => onChange('preferredContactMethod', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="email">Email</option>
          <option value="phone">Phone</option>
          <option value="text">Text</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Preferred Call Time</label>
        <input
          type="text"
          value={formData.preferredCallTime}
          onChange={e => onChange('preferredCallTime', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Weekdays 9am-5pm EST"
        />
      </div>
    </div>

    {/* Do Not Contact Flags */}
    <div className="border-t pt-6 mt-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">Contact Preferences</h4>
      <div className="flex gap-6">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.doNotContact}
            onChange={e => onChange('doNotContact', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Do Not Contact</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.doNotEmail}
            onChange={e => onChange('doNotEmail', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Do Not Email</span>
        </label>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.doNotText}
            onChange={e => onChange('doNotText', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Do Not Text</span>
        </label>
      </div>
    </div>

    {/* Social Links */}
    <div className="border-t pt-6 mt-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">Social & Professional Links</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn URL</label>
          <input
            type="url"
            value={formData.linkedinUrl}
            onChange={e => onChange('linkedinUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://linkedin.com/in/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
          <input
            type="url"
            value={formData.githubUrl}
            onChange={e => onChange('githubUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="https://github.com/..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Portfolio URL</label>
          <input
            type="url"
            value={formData.portfolioUrl}
            onChange={e => onChange('portfolioUrl', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>
  </div>
);

const ProfessionalTab: React.FC<{ formData: TalentFormData; onChange: (field: string, value: unknown) => void }> = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Professional Information</h3>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Headline</label>
      <input
        type="text"
        value={formData.professionalHeadline}
        onChange={e => onChange('professionalHeadline', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="e.g., Senior Full Stack Developer with 8+ years experience"
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Professional Summary</label>
      <textarea
        value={formData.professionalSummary}
        onChange={e => onChange('professionalSummary', e.target.value)}
        rows={4}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Brief summary of professional background and expertise..."
      />
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Years of Experience</label>
        <input
          type="number"
          value={formData.candidateExperienceYears}
          onChange={e => onChange('candidateExperienceYears', e.target.value)}
          min="0"
          max="50"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
        <select
          value={formData.candidateStatus}
          onChange={e => onChange('candidateStatus', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="active">Active</option>
          <option value="bench">On Bench</option>
          <option value="placed">Placed</option>
          <option value="inactive">Inactive</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current Employment Status</label>
        <select
          value={formData.currentEmploymentStatus}
          onChange={e => onChange('currentEmploymentStatus', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select...</option>
          <option value="employed">Currently Employed</option>
          <option value="unemployed">Unemployed</option>
          <option value="student">Student</option>
          <option value="freelance">Freelance/Consulting</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
        <select
          value={formData.candidateAvailability}
          onChange={e => onChange('candidateAvailability', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="immediate">Immediate</option>
          <option value="2_weeks">2 Weeks</option>
          <option value="1_month">1 Month</option>
        </select>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notice Period (Days)</label>
        <input
          type="number"
          value={formData.noticePeriodDays}
          onChange={e => onChange('noticePeriodDays', e.target.value)}
          min="0"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Earliest Start Date</label>
        <input
          type="date"
          value={formData.earliestStartDate}
          onChange={e => onChange('earliestStartDate', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        />
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.candidateWillingToRelocate}
            onChange={e => onChange('candidateWillingToRelocate', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Willing to Relocate</span>
        </label>
      </div>
      <div>
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.relocationAssistanceRequired}
            onChange={e => onChange('relocationAssistanceRequired', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Relocation Assistance Required</span>
        </label>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Skills (comma-separated)</label>
      <textarea
        value={Array.isArray(formData.candidateSkills) ? formData.candidateSkills.join(', ') : ''}
        onChange={e => onChange('candidateSkills', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="React, Node.js, Python, AWS, Docker..."
      />
    </div>
  </div>
);

const CompensationTab: React.FC<{ formData: TalentFormData; onChange: (field: string, value: unknown) => void }> = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Compensation & Benefits</h3>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Current/Target Hourly Rate</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            type="number"
            value={formData.candidateHourlyRate}
            onChange={e => onChange('candidateHourlyRate', e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Hourly Rate</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            type="number"
            value={formData.minimumHourlyRate}
            onChange={e => onChange('minimumHourlyRate', e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Desired Annual Salary</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            type="number"
            value={formData.desiredSalaryAnnual}
            onChange={e => onChange('desiredSalaryAnnual', e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Minimum Annual Salary</label>
        <div className="relative">
          <span className="absolute left-3 top-2.5 text-gray-500">$</span>
          <input
            type="number"
            value={formData.minimumAnnualSalary}
            onChange={e => onChange('minimumAnnualSalary', e.target.value)}
            className="w-full pl-8 pr-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Currency</label>
      <select
        value={formData.desiredSalaryCurrency}
        onChange={e => onChange('desiredSalaryCurrency', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="USD">USD - US Dollar</option>
        <option value="CAD">CAD - Canadian Dollar</option>
        <option value="GBP">GBP - British Pound</option>
        <option value="EUR">EUR - Euro</option>
        <option value="INR">INR - Indian Rupee</option>
        <option value="AUD">AUD - Australian Dollar</option>
        <option value="SGD">SGD - Singapore Dollar</option>
      </select>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Benefits Required (comma-separated)</label>
      <input
        type="text"
        value={Array.isArray(formData.benefitsRequired) ? formData.benefitsRequired.join(', ') : ''}
        onChange={e => onChange('benefitsRequired', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Health Insurance, 401k, PTO..."
      />
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Compensation Notes</label>
      <textarea
        value={formData.compensationNotes}
        onChange={e => onChange('compensationNotes', e.target.value)}
        rows={3}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        placeholder="Any additional notes about compensation expectations..."
      />
    </div>
  </div>
);

const SourceTab: React.FC<{ formData: TalentFormData; onChange: (field: string, value: unknown) => void }> = ({ formData, onChange }) => (
  <div className="space-y-6">
    <h3 className="text-lg font-medium text-gray-900">Source & Marketing</h3>

    <div className="grid grid-cols-2 gap-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lead Source</label>
        <select
          value={formData.leadSource}
          onChange={e => onChange('leadSource', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">Select...</option>
          <option value="job_board">Job Board</option>
          <option value="linkedin">LinkedIn</option>
          <option value="referral">Referral</option>
          <option value="direct">Direct Application</option>
          <option value="agency">Agency</option>
          <option value="career_fair">Career Fair</option>
          <option value="social_media">Social Media</option>
          <option value="other">Other</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Source Detail</label>
        <input
          type="text"
          value={formData.leadSourceDetail}
          onChange={e => onChange('leadSourceDetail', e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="e.g., Indeed, Employee Name, etc."
        />
      </div>
    </div>

    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">Marketing Status</label>
      <select
        value={formData.marketingStatus}
        onChange={e => onChange('marketingStatus', e.target.value)}
        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      >
        <option value="active">Active - Can market to clients</option>
        <option value="passive">Passive - Occasional outreach only</option>
        <option value="do_not_contact">Do Not Contact</option>
      </select>
    </div>

    <div className="border-t pt-6 mt-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">Hotlist</h4>
      <div className="space-y-4">
        <label className="flex items-center gap-2">
          <input
            type="checkbox"
            checked={formData.isOnHotlist}
            onChange={e => onChange('isOnHotlist', e.target.checked)}
            className="rounded border-gray-300"
          />
          <span className="text-sm text-gray-700">Add to Hotlist (Priority candidates)</span>
        </label>
        {formData.isOnHotlist && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Hotlist Notes</label>
            <textarea
              value={formData.hotlistNotes}
              onChange={e => onChange('hotlistNotes', e.target.value)}
              rows={2}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Why is this candidate on the hotlist?"
            />
          </div>
        )}
      </div>
    </div>

    <div className="border-t pt-6 mt-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">Recruiter Rating</h4>
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating (1-5)</label>
          <select
            value={formData.recruiterRating}
            onChange={e => onChange('recruiterRating', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="0">Not Rated</option>
            <option value="1">1 - Poor</option>
            <option value="2">2 - Below Average</option>
            <option value="3">3 - Average</option>
            <option value="4">4 - Good</option>
            <option value="5">5 - Excellent</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Rating Notes</label>
          <input
            type="text"
            value={formData.recruiterRatingNotes}
            onChange={e => onChange('recruiterRatingNotes', e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
      </div>
    </div>

    <div className="border-t pt-6 mt-6">
      <h4 className="text-md font-medium text-gray-900 mb-4">Tags</h4>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
        <input
          type="text"
          value={Array.isArray(formData.tags) ? formData.tags.join(', ') : ''}
          onChange={e => onChange('tags', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          placeholder="hot_candidate, referred, priority..."
        />
      </div>
    </div>
  </div>
);

// ============================================
// LIST-BASED TAB COMPONENTS (Addresses, Education, etc.)
// ============================================

const AddressesTab: React.FC<{
  candidateId: string;
  addresses: Address[];
  onCreate: (data: unknown) => Promise<unknown>;
  onUpdate: (data: unknown) => Promise<unknown>;
  onDelete: (data: { id: string }) => Promise<unknown>;
  onRefresh: () => void;
}> = ({ candidateId: _candidateId, addresses, onCreate, onUpdate, onDelete, onRefresh: _onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    addressType: 'current',
    addressLine1: '',
    addressLine2: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    countryCode: 'US',
    isPrimary: false,
  });

  const resetForm = () => {
    setForm({
      addressType: 'current',
      addressLine1: '',
      addressLine2: '',
      city: '',
      stateProvince: '',
      postalCode: '',
      countryCode: 'US',
      isPrimary: false,
    });
    setIsAdding(false);
    setEditingId(null);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      if (editingId) {
        await onUpdate({ id: editingId, ...form });
      } else {
        await onCreate({
          entityType: 'candidate' as const,
          entityId: candidateId,
          ...form,
        });
      }
      resetForm();
      onRefresh();
    } catch (err) {
      console.error('Failed to save address:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleEdit = (addr: Address) => {
    setForm({
      addressType: addr.addressType || 'current',
      addressLine1: addr.addressLine1 || '',
      addressLine2: addr.addressLine2 || '',
      city: addr.city || '',
      stateProvince: addr.stateProvince || '',
      postalCode: addr.postalCode || '',
      countryCode: addr.countryCode || 'US',
      isPrimary: addr.isPrimary || false,
    });
    setEditingId(addr.id);
    setIsAdding(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this address?')) {
      await onDelete({ id });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Addresses</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Address
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Address Type</label>
              <select
                value={form.addressType}
                onChange={e => setForm(f => ({ ...f, addressType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="current">Current</option>
                <option value="permanent">Permanent</option>
                <option value="mailing">Mailing</option>
                <option value="work">Work</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={form.countryCode}
                onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 1</label>
            <input
              type="text"
              value={form.addressLine1}
              onChange={e => setForm(f => ({ ...f, addressLine1: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Address Line 2</label>
            <input
              type="text"
              value={form.addressLine2}
              onChange={e => setForm(f => ({ ...f, addressLine2: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={form.city}
                onChange={e => setForm(f => ({ ...f, city: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">State/Province</label>
              <input
                type="text"
                value={form.stateProvince}
                onChange={e => setForm(f => ({ ...f, stateProvince: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
              <input
                type="text"
                value={form.postalCode}
                onChange={e => setForm(f => ({ ...f, postalCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isPrimary}
              onChange={e => setForm(f => ({ ...f, isPrimary: e.target.checked }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Primary Address</span>
          </label>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : editingId ? 'Update' : 'Add'}
            </button>
            <button
              onClick={resetForm}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Address List */}
      <div className="space-y-3">
        {addresses.length === 0 && !isAdding && (
          <p className="text-gray-500 text-sm">No addresses added yet.</p>
        )}
        {addresses.map(addr => (
          <div key={addr.id} className="bg-white border rounded-lg p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900 capitalize">{addr.addressType} Address</span>
                {addr.isPrimary && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Primary</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {addr.addressLine1}
                {addr.addressLine2 && `, ${addr.addressLine2}`}
              </p>
              <p className="text-sm text-gray-600">
                {addr.city}, {addr.stateProvince} {addr.postalCode}
              </p>
              <p className="text-sm text-gray-500">
                {COUNTRIES.find(c => c.code === addr.countryCode)?.name || addr.countryCode}
              </p>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => handleEdit(addr)}
                className="p-2 hover:bg-gray-100 rounded-lg text-gray-600"
              >
                <span className="text-xs">Edit</span>
              </button>
              <button
                onClick={() => handleDelete(addr.id)}
                className="p-2 hover:bg-red-100 rounded-lg text-red-600"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Similar pattern for other list-based tabs...

const WorkAuthTab: React.FC<{
  candidateId: string;
  workAuthorizations: CandidateWorkAuthorization[];
  onCreate: (data: unknown) => Promise<unknown>;
  onUpdate: (data: unknown) => Promise<unknown>;
  onRefresh: () => void;
}> = ({ candidateId, workAuthorizations, onCreate, onUpdate: _onUpdate, onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    authorizationType: 'citizen',
    visaType: '',
    countryCode: 'US',
    status: 'active',
    validFrom: '',
    validUntil: '',
    i9Completed: false,
    sponsorshipRequired: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onCreate({
        candidateId,
        ...form,
        validFrom: form.validFrom ? new Date(form.validFrom) : undefined,
        validUntil: form.validUntil ? new Date(form.validUntil) : undefined,
      });
      setIsAdding(false);
      setForm({
        authorizationType: 'citizen',
        visaType: '',
        countryCode: 'US',
        status: 'active',
        validFrom: '',
        validUntil: '',
        i9Completed: false,
        sponsorshipRequired: false,
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to save work authorization:', err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Work Authorizations</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Work Authorization
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Authorization Type</label>
              <select
                value={form.authorizationType}
                onChange={e => setForm(f => ({ ...f, authorizationType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="citizen">Citizen</option>
                <option value="permanent_resident">Permanent Resident</option>
                <option value="visa">Visa</option>
                <option value="work_permit">Work Permit</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={form.countryCode}
                onChange={e => setForm(f => ({ ...f, countryCode: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          {form.authorizationType === 'visa' && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Visa Type</label>
              <select
                value={form.visaType}
                onChange={e => setForm(f => ({ ...f, visaType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="">Select...</option>
                {VISA_TYPES.map(v => (
                  <option key={v} value={v}>{v}</option>
                ))}
              </select>
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid From</label>
              <input
                type="date"
                value={form.validFrom}
                onChange={e => setForm(f => ({ ...f, validFrom: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Valid Until</label>
              <input
                type="date"
                value={form.validUntil}
                onChange={e => setForm(f => ({ ...f, validUntil: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-4">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.i9Completed}
                onChange={e => setForm(f => ({ ...f, i9Completed: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">I-9 Completed</span>
            </label>
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={form.sponsorshipRequired}
                onChange={e => setForm(f => ({ ...f, sponsorshipRequired: e.target.checked }))}
                className="rounded border-gray-300"
              />
              <span className="text-sm text-gray-700">Sponsorship Required</span>
            </label>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Add'}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Work Auth List */}
      <div className="space-y-3">
        {workAuthorizations.length === 0 && !isAdding && (
          <p className="text-gray-500 text-sm">No work authorizations added yet.</p>
        )}
        {workAuthorizations.map(auth => (
          <div key={auth.id} className="bg-white border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {auth.authorizationType?.replace('_', ' ')}
                  </span>
                  {auth.visaType && (
                    <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">
                      {auth.visaType}
                    </span>
                  )}
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    auth.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                  }`}>
                    {auth.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">
                  {COUNTRIES.find(c => c.code === auth.countryCode)?.name || auth.countryCode}
                  {auth.validUntil && ` • Expires: ${new Date(auth.validUntil).toLocaleDateString()}`}
                </p>
                <div className="flex gap-4 mt-2 text-xs text-gray-500">
                  {auth.i9Completed && <span className="text-green-600">I-9 Complete</span>}
                  {auth.sponsorshipRequired && <span className="text-amber-600">Sponsorship Required</span>}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const EducationTab: React.FC<{
  candidateId: string;
  education: CandidateEducation[];
  onCreate: (data: unknown) => Promise<unknown>;
  onUpdate: (data: unknown) => Promise<unknown>;
  onDelete: (data: { id: string }) => Promise<unknown>;
  onRefresh: () => void;
}> = ({ candidateId: _candidateId, education, onCreate, onUpdate: _onUpdate, onDelete, onRefresh: _onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    institutionName: '',
    degreeType: 'bachelor',
    degreeName: '',
    fieldOfStudy: '',
    major: '',
    graduationDate: '',
    institutionCountry: 'US',
    gpa: '',
    isPrimary: false,
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onCreate({
        candidateId,
        ...form,
        gpa: form.gpa ? parseFloat(form.gpa) : undefined,
        graduationDate: form.graduationDate ? new Date(form.graduationDate) : undefined,
      });
      setIsAdding(false);
      setForm({
        institutionName: '',
        degreeType: 'bachelor',
        degreeName: '',
        fieldOfStudy: '',
        major: '',
        graduationDate: '',
        institutionCountry: 'US',
        gpa: '',
        isPrimary: false,
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to save education:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this education record?')) {
      await onDelete({ id });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Education</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Education
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Institution Name *</label>
            <input
              type="text"
              value={form.institutionName}
              onChange={e => setForm(f => ({ ...f, institutionName: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Degree Type *</label>
              <select
                value={form.degreeType}
                onChange={e => setForm(f => ({ ...f, degreeType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {DEGREE_TYPES.map(d => (
                  <option key={d.value} value={d.value}>{d.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={form.institutionCountry}
                onChange={e => setForm(f => ({ ...f, institutionCountry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Field of Study / Major</label>
              <input
                type="text"
                value={form.major}
                onChange={e => setForm(f => ({ ...f, major: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Computer Science"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Graduation Date</label>
              <input
                type="date"
                value={form.graduationDate}
                onChange={e => setForm(f => ({ ...f, graduationDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
              <input
                type="number"
                step="0.01"
                min="0"
                max="4"
                value={form.gpa}
                onChange={e => setForm(f => ({ ...f, gpa: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div className="flex items-end">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={form.isPrimary}
                  onChange={e => setForm(f => ({ ...f, isPrimary: e.target.checked }))}
                  className="rounded border-gray-300"
                />
                <span className="text-sm text-gray-700">Primary Degree</span>
              </label>
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !form.institutionName}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Add'}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Education List */}
      <div className="space-y-3">
        {education.length === 0 && !isAdding && (
          <p className="text-gray-500 text-sm">No education records added yet.</p>
        )}
        {education.map(edu => (
          <div key={edu.id} className="bg-white border rounded-lg p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{edu.institutionName}</span>
                {edu.isPrimary && (
                  <span className="px-2 py-0.5 bg-blue-100 text-blue-700 text-xs rounded-full">Primary</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {DEGREE_TYPES.find(d => d.value === edu.degreeType)?.label || edu.degreeType}
                {edu.major && ` in ${edu.major}`}
              </p>
              <p className="text-sm text-gray-500">
                {edu.graduationDate && `Graduated: ${new Date(edu.graduationDate).toLocaleDateString()}`}
                {edu.gpa && ` • GPA: ${edu.gpa}`}
              </p>
            </div>
            <button
              onClick={() => handleDelete(edu.id)}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ExperienceTab: React.FC<{
  candidateId: string;
  workHistory: CandidateWorkHistory[];
  onCreate: (data: unknown) => Promise<unknown>;
  onUpdate: (data: unknown) => Promise<unknown>;
  onDelete: (data: { id: string }) => Promise<unknown>;
  onRefresh: () => void;
}> = ({ candidateId: _candidateId, workHistory, onCreate, onUpdate: _onUpdate, onDelete, onRefresh: _onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    companyName: '',
    title: '',
    employmentType: 'full_time',
    startDate: '',
    endDate: '',
    isCurrentJob: false,
    description: '',
    companyCountry: 'US',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onCreate({
        candidateId,
        ...form,
        startDate: form.startDate ? new Date(form.startDate) : new Date(),
        endDate: form.endDate ? new Date(form.endDate) : undefined,
      });
      setIsAdding(false);
      setForm({
        companyName: '',
        title: '',
        employmentType: 'full_time',
        startDate: '',
        endDate: '',
        isCurrentJob: false,
        description: '',
        companyCountry: 'US',
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to save work history:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this work history?')) {
      await onDelete({ id });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Work Experience</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Experience
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company Name *</label>
              <input
                type="text"
                value={form.companyName}
                onChange={e => setForm(f => ({ ...f, companyName: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Job Title *</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Employment Type</label>
              <select
                value={form.employmentType}
                onChange={e => setForm(f => ({ ...f, employmentType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {EMPLOYMENT_TYPES.map(e => (
                  <option key={e.value} value={e.value}>{e.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
              <select
                value={form.companyCountry}
                onChange={e => setForm(f => ({ ...f, companyCountry: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                {COUNTRIES.map(c => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date *</label>
              <input
                type="date"
                value={form.startDate}
                onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
              <input
                type="date"
                value={form.endDate}
                onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))}
                disabled={form.isCurrentJob}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.isCurrentJob}
              onChange={e => setForm(f => ({ ...f, isCurrentJob: e.target.checked, endDate: '' }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Current Job</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={form.description}
              onChange={e => setForm(f => ({ ...f, description: e.target.value }))}
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="Key responsibilities and achievements..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !form.companyName || !form.title || !form.startDate}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Add'}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Work History List */}
      <div className="space-y-3">
        {workHistory.length === 0 && !isAdding && (
          <p className="text-gray-500 text-sm">No work experience added yet.</p>
        )}
        {workHistory.map(work => (
          <div key={work.id} className="bg-white border rounded-lg p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{work.title}</span>
                {work.isCurrentJob && (
                  <span className="px-2 py-0.5 bg-green-100 text-green-700 text-xs rounded-full">Current</span>
                )}
              </div>
              <p className="text-sm text-gray-600 mt-1">{work.companyName}</p>
              <p className="text-sm text-gray-500">
                {work.startDate && new Date(work.startDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                {' - '}
                {work.isCurrentJob ? 'Present' : work.endDate && new Date(work.endDate).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                {' • '}
                {EMPLOYMENT_TYPES.find(e => e.value === work.employmentType)?.label}
              </p>
            </div>
            <button
              onClick={() => handleDelete(work.id)}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const CertificationsTab: React.FC<{
  candidateId: string;
  certifications: CandidateCertification[];
  onCreate: (data: unknown) => Promise<unknown>;
  onUpdate: (data: unknown) => Promise<unknown>;
  onDelete: (data: { id: string }) => Promise<unknown>;
  onRefresh: () => void;
}> = ({ candidateId: _candidateId, certifications, onCreate, onUpdate: _onUpdate, onDelete, onRefresh: _onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    type: 'professional',
    issuingOrganization: '',
    issueDate: '',
    expiryDate: '',
    doesNotExpire: false,
    credentialUrl: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onCreate({
        candidateId,
        ...form,
        issueDate: form.issueDate ? new Date(form.issueDate) : undefined,
        expiryDate: form.expiryDate ? new Date(form.expiryDate) : undefined,
      });
      setIsAdding(false);
      setForm({
        name: '',
        type: 'professional',
        issuingOrganization: '',
        issueDate: '',
        expiryDate: '',
        doesNotExpire: false,
        credentialUrl: '',
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to save certification:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this certification?')) {
      await onDelete({ id });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">Certifications & Licenses</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Certification
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Certification Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="e.g., AWS Solutions Architect"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select
                value={form.type}
                onChange={e => setForm(f => ({ ...f, type: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="professional">Professional</option>
                <option value="technical">Technical</option>
                <option value="vendor">Vendor</option>
                <option value="government">Government</option>
                <option value="academic">Academic</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issuing Organization</label>
              <input
                type="text"
                value={form.issuingOrganization}
                onChange={e => setForm(f => ({ ...f, issuingOrganization: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Amazon Web Services"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Issue Date</label>
              <input
                type="date"
                value={form.issueDate}
                onChange={e => setForm(f => ({ ...f, issueDate: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Expiry Date</label>
              <input
                type="date"
                value={form.expiryDate}
                onChange={e => setForm(f => ({ ...f, expiryDate: e.target.value }))}
                disabled={form.doesNotExpire}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg disabled:bg-gray-100"
              />
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={form.doesNotExpire}
              onChange={e => setForm(f => ({ ...f, doesNotExpire: e.target.checked, expiryDate: '' }))}
              className="rounded border-gray-300"
            />
            <span className="text-sm text-gray-700">Does not expire</span>
          </label>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Credential URL</label>
            <input
              type="url"
              value={form.credentialUrl}
              onChange={e => setForm(f => ({ ...f, credentialUrl: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              placeholder="https://..."
            />
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !form.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Add'}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Certifications List */}
      <div className="space-y-3">
        {certifications.length === 0 && !isAdding && (
          <p className="text-gray-500 text-sm">No certifications added yet.</p>
        )}
        {certifications.map(cert => (
          <div key={cert.id} className="bg-white border rounded-lg p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{cert.name}</span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  cert.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                }`}>
                  {cert.status}
                </span>
              </div>
              {cert.issuingOrganization && (
                <p className="text-sm text-gray-600 mt-1">{cert.issuingOrganization}</p>
              )}
              <p className="text-sm text-gray-500">
                {cert.issueDate && `Issued: ${new Date(cert.issueDate).toLocaleDateString()}`}
                {cert.expiryDate && ` • Expires: ${new Date(cert.expiryDate).toLocaleDateString()}`}
                {cert.doesNotExpire && ' • No expiration'}
              </p>
            </div>
            <button
              onClick={() => handleDelete(cert.id)}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

const ReferencesTab: React.FC<{
  candidateId: string;
  references: CandidateReference[];
  onCreate: (data: unknown) => Promise<unknown>;
  onUpdate: (data: unknown) => Promise<unknown>;
  onDelete: (data: { id: string }) => Promise<unknown>;
  onRefresh: () => void;
}> = ({ candidateId: _candidateId, references, onCreate, onUpdate: _onUpdate, onDelete, onRefresh: _onRefresh }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const [form, setForm] = useState({
    name: '',
    referenceType: 'professional',
    title: '',
    company: '',
    relationship: '',
    email: '',
    phone: '',
    yearsKnown: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await onCreate({
        candidateId,
        ...form,
        yearsKnown: form.yearsKnown ? parseInt(form.yearsKnown) : undefined,
      });
      setIsAdding(false);
      setForm({
        name: '',
        referenceType: 'professional',
        title: '',
        company: '',
        relationship: '',
        email: '',
        phone: '',
        yearsKnown: '',
      });
      onRefresh();
    } catch (err) {
      console.error('Failed to save reference:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm('Are you sure you want to delete this reference?')) {
      await onDelete({ id });
      onRefresh();
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium text-gray-900">References</h3>
        {!isAdding && (
          <button
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Plus className="w-4 h-4" />
            Add Reference
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 rounded-lg p-4 space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
              <input
                type="text"
                value={form.name}
                onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Reference Type</label>
              <select
                value={form.referenceType}
                onChange={e => setForm(f => ({ ...f, referenceType: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              >
                <option value="professional">Professional</option>
                <option value="supervisor">Supervisor</option>
                <option value="peer">Peer/Colleague</option>
                <option value="client">Client</option>
                <option value="personal">Personal</option>
                <option value="academic">Academic</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <input
                type="text"
                value={form.title}
                onChange={e => setForm(f => ({ ...f, title: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <input
                type="text"
                value={form.company}
                onChange={e => setForm(f => ({ ...f, company: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                value={form.email}
                onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
              <input
                type="tel"
                value={form.phone}
                onChange={e => setForm(f => ({ ...f, phone: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Relationship</label>
              <input
                type="text"
                value={form.relationship}
                onChange={e => setForm(f => ({ ...f, relationship: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
                placeholder="e.g., Direct Manager, Colleague"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Years Known</label>
              <input
                type="number"
                value={form.yearsKnown}
                onChange={e => setForm(f => ({ ...f, yearsKnown: e.target.value }))}
                min="0"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg"
              />
            </div>
          </div>

          <div className="flex gap-2">
            <button
              onClick={handleSave}
              disabled={isSaving || !form.name}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
            >
              {isSaving ? 'Saving...' : 'Add'}
            </button>
            <button
              onClick={() => setIsAdding(false)}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* References List */}
      <div className="space-y-3">
        {references.length === 0 && !isAdding && (
          <p className="text-gray-500 text-sm">No references added yet.</p>
        )}
        {references.map(ref => (
          <div key={ref.id} className="bg-white border rounded-lg p-4 flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium text-gray-900">{ref.name}</span>
                <span className="px-2 py-0.5 bg-gray-100 text-gray-700 text-xs rounded-full capitalize">
                  {ref.referenceType}
                </span>
                <span className={`px-2 py-0.5 text-xs rounded-full ${
                  ref.status === 'verified' ? 'bg-green-100 text-green-700' :
                  ref.status === 'received' ? 'bg-blue-100 text-blue-700' :
                  'bg-gray-100 text-gray-700'
                }`}>
                  {ref.status}
                </span>
              </div>
              <p className="text-sm text-gray-600 mt-1">
                {ref.title && ref.company ? `${ref.title} at ${ref.company}` : ref.title || ref.company}
              </p>
              {ref.relationship && (
                <p className="text-sm text-gray-500">Relationship: {ref.relationship}</p>
              )}
              <p className="text-sm text-gray-500">
                {ref.email && <span>{ref.email}</span>}
                {ref.email && ref.phone && ' • '}
                {ref.phone && <span>{ref.phone}</span>}
              </p>
            </div>
            <button
              onClick={() => handleDelete(ref.id)}
              className="p-2 hover:bg-red-100 rounded-lg text-red-600"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

// Documents Section - Shows resumes and allows uploads
const DocumentsSection: React.FC<{
  resumes: CandidateResume[];
  candidateId: string;
  onRefresh: () => void;
}> = ({ resumes, candidateId: _candidateId, onRefresh: _onRefresh }) => {
  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-medium text-gray-900">Resumes & Documents</h3>
        <button className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 flex items-center gap-1">
          <Plus className="w-4 h-4" />
          Upload Document
        </button>
      </div>

      {resumes.length === 0 ? (
        <div className="text-center py-8 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
          <FileText className="w-12 h-12 mx-auto text-gray-400 mb-2" />
          <p className="text-gray-500">No documents uploaded yet.</p>
          <p className="text-sm text-gray-400 mt-1">Upload resumes, cover letters, or other documents</p>
        </div>
      ) : (
        <div className="space-y-3">
          {resumes.map((resume: CandidateResume) => (
            <div key={resume.id} className="bg-white border rounded-lg p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <FileText className="w-8 h-8 text-blue-500" />
                <div>
                  <p className="font-medium text-gray-900">{resume.fileName || 'Resume'}</p>
                  <p className="text-sm text-gray-500">
                    Version {resume.version} • Uploaded {new Date(resume.createdAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {resume.isLatest && (
                  <span className="px-2 py-0.5 text-xs bg-green-100 text-green-700 rounded-full">Latest</span>
                )}
                <button className="text-blue-600 hover:text-blue-700 text-sm">View</button>
                <button className="text-gray-400 hover:text-red-600 text-sm">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

const ComplianceTab: React.FC<{
  candidateId: string;
  backgroundChecks: CandidateBackgroundCheck[];
  complianceDocuments: CandidateComplianceDocument[];
}> = ({ candidateId: _candidateId, backgroundChecks, complianceDocuments }) => {
  return (
    <div className="space-y-8">
      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Background Checks</h3>
        {backgroundChecks.length === 0 ? (
          <p className="text-gray-500 text-sm">No background checks on record.</p>
        ) : (
          <div className="space-y-3">
            {backgroundChecks.map(check => (
              <div key={check.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {check.checkType?.replace('_', ' ')}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    check.status === 'completed' ? 'bg-green-100 text-green-700' :
                    check.status === 'in_progress' ? 'bg-blue-100 text-blue-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {check.status}
                  </span>
                  {check.result && (
                    <span className={`px-2 py-0.5 text-xs rounded-full ${
                      check.result === 'clear' ? 'bg-green-100 text-green-700' :
                      check.result === 'consider' ? 'bg-amber-100 text-amber-700' :
                      'bg-red-100 text-red-700'
                    }`}>
                      {check.result}
                    </span>
                  )}
                </div>
                {check.provider && <p className="text-sm text-gray-500 mt-1">Provider: {check.provider}</p>}
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-lg font-medium text-gray-900 mb-4">Compliance Documents</h3>
        {complianceDocuments.length === 0 ? (
          <p className="text-gray-500 text-sm">No compliance documents on record.</p>
        ) : (
          <div className="space-y-3">
            {complianceDocuments.map(doc => (
              <div key={doc.id} className="bg-white border rounded-lg p-4">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-gray-900 capitalize">
                    {doc.documentType?.replace('_', ' ') || doc.documentName}
                  </span>
                  <span className={`px-2 py-0.5 text-xs rounded-full ${
                    doc.status === 'approved' ? 'bg-green-100 text-green-700' :
                    doc.status === 'submitted' ? 'bg-blue-100 text-blue-700' :
                    doc.status === 'rejected' ? 'bg-red-100 text-red-700' :
                    'bg-gray-100 text-gray-700'
                  }`}>
                    {doc.status}
                  </span>
                </div>
                {doc.dueDate && (
                  <p className="text-sm text-gray-500 mt-1">
                    Due: {new Date(doc.dueDate).toLocaleDateString()}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default EditTalentModal;
