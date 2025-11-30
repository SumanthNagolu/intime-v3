'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  ArrowLeft, User, MapPin, Briefcase, Clock, Phone, Mail, Calendar,
  FileText, Activity, Building2, DollarSign, ChevronRight, Plus,
  Loader2, X, Search, Edit, Upload, CheckCircle, Send,
  PhoneCall, Eye, Download, History, Sparkles, Copy, RefreshCw, FileUp, ChevronDown
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';
import { EditTalentModal } from './EditTalentModal';

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

// Resume Upload Modal Component with Versioning Support
const ResumeUploadModal: React.FC<{
  talentId: string;
  talentName: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ talentId, _talentName, onClose, onSuccess }) => {
  const [step, setStep] = useState<'upload' | 'uploading' | 'success'>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const [resumeType, setResumeType] = useState<'master' | 'formatted' | 'client_specific'>('master');
  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const utils = trpc.useUtils();
  const getUploadUrl = trpc.files.getUploadUrl.useMutation();
  const recordUpload = trpc.files.recordUpload.useMutation();
  const createResume = trpc.ats.resumes.create.useMutation();

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) return;
    setStep('uploading');
    setError(null);

    try {
      // 1. Get upload URL
      const { uploadUrl, filePath, bucket } = await getUploadUrl.mutateAsync({
        fileName: selectedFile.name,
        mimeType: selectedFile.type,
        entityType: 'candidate_resume',
        entityId: talentId,
      });

      // 2. Upload file to storage
      const uploadResponse = await fetch(uploadUrl, {
        method: 'PUT',
        body: selectedFile,
        headers: {
          'Content-Type': selectedFile.type,
        },
      });

      if (!uploadResponse.ok) {
        throw new Error('Failed to upload file to storage');
      }

      // 3. Record the file upload
      await recordUpload.mutateAsync({
        bucket,
        filePath,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        entityType: 'candidate_resume',
        entityId: talentId,
        metadata: { resumeType, title, notes },
      });

      // 4. Create resume version record
      await createResume.mutateAsync({
        candidateId: talentId,
        bucket,
        filePath,
        fileName: selectedFile.name,
        fileSize: selectedFile.size,
        mimeType: selectedFile.type,
        resumeType,
        title: title || undefined,
        notes: notes || undefined,
      });

      // Invalidate queries to refresh data
      utils.ats.resumes.list.invalidate({ candidateId: talentId });

      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    } catch (err) {
      console.error('Upload failed:', err);
      setError(err instanceof Error ? err.message : 'Upload failed. Please try again.');
      setStep('upload');
    }
  };

  const resumeTypeOptions = [
    { value: 'master', label: 'Master Resume', description: 'Original/primary resume' },
    { value: 'formatted', label: 'Formatted', description: 'Internal formatted version' },
    { value: 'client_specific', label: 'Client-Specific', description: 'Tailored for specific client' },
  ] as const;

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-lg rounded-[2rem] shadow-2xl relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal z-10">
          <X size={24} />
        </button>

        {step === 'upload' && (
          <>
            <div className="p-8 pb-4">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-rust/10 text-rust rounded-xl flex items-center justify-center">
                  <FileUp size={20} />
                </div>
                <div>
                  <h2 className="text-2xl font-serif font-bold text-charcoal">Upload Resume</h2>
                  <p className="text-xs text-stone-500">New version for {_talentName}</p>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-8 pb-8 space-y-5">
              {error && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
                  {error}
                </div>
              )}

              {/* File Drop Zone */}
              <div
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
                  dragActive
                    ? 'border-rust bg-rust/10'
                    : selectedFile
                      ? 'border-green-400 bg-green-50'
                      : 'border-stone-300 bg-stone-50 hover:border-rust hover:bg-rust/5'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileChange}
                  className="hidden"
                />
                {selectedFile ? (
                  <>
                    <CheckCircle size={28} className="mx-auto text-green-500 mb-2" />
                    <p className="text-sm font-medium text-charcoal">{selectedFile.name}</p>
                    <p className="text-xs text-stone-500 mt-1">
                      {(selectedFile.size / 1024).toFixed(1)} KB • Click to change
                    </p>
                  </>
                ) : (
                  <>
                    <Upload size={28} className="mx-auto text-stone-400 mb-2" />
                    <p className="text-xs font-bold text-stone-500 uppercase tracking-widest">Drag & Drop or Click</p>
                    <p className="text-xs text-stone-400 mt-2">PDF, DOC, DOCX (Max 10MB)</p>
                  </>
                )}
              </div>

              {/* Resume Type Selection */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Resume Type
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {resumeTypeOptions.map((option) => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setResumeType(option.value)}
                      className={`p-3 rounded-xl border text-left transition-all ${
                        resumeType === option.value
                          ? 'border-rust bg-rust/5 ring-1 ring-rust'
                          : 'border-stone-200 hover:border-stone-300'
                      }`}
                    >
                      <div className="text-xs font-bold text-charcoal">{option.label}</div>
                      <div className="text-[10px] text-stone-500 mt-0.5">{option.description}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Optional Title */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Title (Optional)
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Java Developer Resume - Updated Skills"
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>

              {/* Optional Notes */}
              <div>
                <label className="block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Any notes about this version..."
                  rows={2}
                  className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                />
              </div>

              {/* Version Notice */}
              <div className="flex items-start gap-2 p-3 bg-blue-50 rounded-xl border border-blue-100">
                <History size={16} className="text-blue-600 mt-0.5 flex-shrink-0" />
                <p className="text-xs text-blue-700">
                  Previous versions are preserved and can be accessed from the version history.
                </p>
              </div>

              <button
                onClick={handleUpload}
                disabled={!selectedFile}
                className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
              >
                <FileUp size={14} /> Upload New Version
              </button>
            </div>
          </>
        )}

        {step === 'uploading' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-stone-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Loader2 size={32} className="text-rust animate-spin" />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Uploading...</h3>
            <p className="text-stone-500 text-sm mt-2">Please wait while we process your resume.</p>
          </div>
        )}

        {step === 'success' && (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Upload Complete</h3>
            <p className="text-stone-500 text-sm mt-2">
              Resume v{resumeType === 'master' ? 'new' : resumeType} has been added to the profile.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// EditTalentModal is now imported from ./EditTalentModal.tsx

// Email Composer Modal Component
const EmailComposerModal: React.FC<{
  recipientEmail: string;
  recipientName: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ recipientEmail, recipientName, onClose, onSuccess }) => {
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [isSending, setIsSending] = useState(false);
  const [step, setStep] = useState<'compose' | 'success'>('compose');

  const templates = [
    { label: 'Introduction', subject: 'Job Opportunity - InTime Solutions', body: `Hi ${recipientName.split(' ')[0]},\n\nI hope this message finds you well. I came across your profile and wanted to reach out regarding an exciting opportunity that matches your skill set.\n\nWould you be available for a brief call to discuss further?\n\nBest regards` },
    { label: 'Follow Up', subject: `Following Up - ${recipientName}`, body: `Hi ${recipientName.split(' ')[0]},\n\nI wanted to follow up on my previous message regarding the job opportunity.\n\nAre you still interested in exploring this position? Please let me know a convenient time to connect.\n\nBest regards` },
    { label: 'Interview Confirmation', subject: 'Interview Confirmation', body: `Hi ${recipientName.split(' ')[0]},\n\nI'm pleased to confirm your interview scheduled for [DATE] at [TIME].\n\nPlease join using the following link: [MEETING LINK]\n\nLet me know if you have any questions.\n\nBest regards` },
  ];

  const handleSend = () => {
    if (!subject || !body) return;
    setIsSending(true);

    // Simulate sending
    setTimeout(() => {
      setIsSending(false);
      setStep('success');
      setTimeout(() => {
        onSuccess();
        onClose();
      }, 1500);
    }, 1000);
  };

  const applyTemplate = (template: typeof templates[0]) => {
    setSubject(template.subject);
    setBody(template.body);
  };

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-2xl rounded-[2rem] shadow-2xl relative max-h-[90vh] flex flex-col" onClick={e => e.stopPropagation()}>
        <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal z-10">
          <X size={24} />
        </button>

        {step === 'compose' ? (
          <>
            <div className="p-6 pb-4 border-b border-stone-100">
              <h2 className="text-2xl font-serif font-bold text-charcoal">Send Email</h2>
              <p className="text-sm text-stone-500">to {recipientEmail}</p>
            </div>

            <div className="flex-1 overflow-y-auto p-6 space-y-4">
              {/* Quick Templates */}
              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Quick Templates</label>
                <div className="flex gap-2">
                  {templates.map((template, idx) => (
                    <button
                      key={idx}
                      onClick={() => applyTemplate(template)}
                      className="px-3 py-1.5 text-xs font-medium bg-stone-100 hover:bg-rust/10 hover:text-rust rounded-lg transition-colors"
                    >
                      {template.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Subject</label>
                <input
                  value={subject}
                  onChange={(e) => setSubject(e.target.value)}
                  placeholder="Email subject..."
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust"
                />
              </div>

              <div>
                <label className="text-xs font-bold uppercase tracking-widest text-stone-500 mb-2 block">Message</label>
                <textarea
                  value={body}
                  onChange={(e) => setBody(e.target.value)}
                  placeholder="Write your message..."
                  rows={10}
                  className="w-full p-3 border border-stone-200 rounded-xl text-sm focus:outline-none focus:border-rust resize-none"
                />
              </div>
            </div>

            <div className="p-6 pt-4 border-t border-stone-100 flex gap-4">
              <button
                onClick={onClose}
                className="flex-1 py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSend}
                disabled={!subject || !body || isSending}
                className="flex-1 py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {isSending ? (
                  <>
                    <Loader2 size={14} className="animate-spin" /> Sending...
                  </>
                ) : (
                  <>
                    <Send size={14} /> Send Email
                  </>
                )}
              </button>
            </div>
          </>
        ) : (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle size={32} />
            </div>
            <h3 className="text-xl font-bold text-charcoal">Email Sent</h3>
            <p className="text-stone-500 text-sm mt-2">Your message has been sent to {recipientName}.</p>
          </div>
        )}
      </div>
    </div>
  );
};

// Resume Preview Component
const ResumePreviewSection: React.FC<{
  talentId: string;
  talentName: string;
  onUploadClick: () => void;
}> = ({ talentId, _talentName, onUploadClick }) => {
  const [showVersions, setShowVersions] = useState(false);

  // Fetch resumes for this candidate
  const { data: resumes = [], isLoading } = trpc.ats.resumes.list.useQuery(
    { candidateId: talentId },
    { enabled: !!talentId }
  );

  const latestResume = resumes.find(r => r.isLatest);
  const olderVersions = resumes.filter(r => !r.isLatest);

  const getDownloadUrl = trpc.files.getDownloadUrl.useMutation();

  const handleDownload = async (fileId: string) => {
    try {
      const result = await getDownloadUrl.mutateAsync({ fileId });
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Failed to get download URL:', error);
    }
  };

  const handlePreview = async (fileId: string) => {
    try {
      const result = await getDownloadUrl.mutateAsync({ fileId });
      window.open(result.url, '_blank');
    } catch (error) {
      console.error('Failed to get preview URL:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-2xl p-6 border border-stone-100 animate-pulse">
        <div className="h-6 bg-stone-100 rounded w-32 mb-4" />
        <div className="h-48 bg-stone-50 rounded-xl" />
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl p-6 border border-stone-100">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-charcoal flex items-center gap-2">
          <FileText size={16} /> Resume
        </h3>
        <button
          onClick={onUploadClick}
          className="text-xs font-bold text-rust hover:underline flex items-center gap-1"
        >
          <FileUp size={12} /> New Version
        </button>
      </div>

      {latestResume ? (
        <div className="space-y-4">
          {/* Current Resume Card */}
          <div className="bg-gradient-to-br from-stone-50 to-stone-100/50 rounded-xl p-4 border border-stone-200">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-white rounded-lg border border-stone-200 flex items-center justify-center">
                  <FileText size={20} className="text-rust" />
                </div>
                <div>
                  <p className="font-medium text-charcoal text-sm">{latestResume.fileName}</p>
                  <p className="text-xs text-stone-500">
                    v{latestResume.version} • {(latestResume.fileSize / 1024).toFixed(1)} KB
                  </p>
                </div>
              </div>
              <span className="px-2 py-0.5 bg-green-100 text-green-700 rounded text-[10px] font-bold uppercase">
                Latest
              </span>
            </div>

            {/* Resume Type Badge */}
            <div className="flex gap-2 mb-3">
              <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${
                latestResume.resumeType === 'master' ? 'bg-blue-100 text-blue-700' :
                latestResume.resumeType === 'formatted' ? 'bg-purple-100 text-purple-700' :
                'bg-amber-100 text-amber-700'
              }`}>
                {latestResume.resumeType?.replace('_', ' ') || 'Master'}
              </span>
              {latestResume.title && (
                <span className="px-2 py-1 bg-stone-100 text-stone-600 rounded text-[10px]">
                  {latestResume.title}
                </span>
              )}
            </div>

            {/* AI Summary if available */}
            {latestResume.aiSummary && (
              <div className="mb-3 p-3 bg-white rounded-lg border border-stone-100">
                <p className="text-xs text-stone-600 line-clamp-3">{latestResume.aiSummary}</p>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-2">
              <button
                onClick={() => handlePreview(latestResume.id)}
                className="flex-1 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors flex items-center justify-center gap-2"
              >
                <Eye size={12} /> View
              </button>
              <button
                onClick={() => handleDownload(latestResume.id)}
                className="flex-1 py-2 border border-stone-200 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
              >
                <Download size={12} /> Download
              </button>
            </div>
          </div>

          {/* Version History Toggle */}
          {olderVersions.length > 0 && (
            <div>
              <button
                onClick={() => setShowVersions(!showVersions)}
                className="w-full flex items-center justify-between py-2 text-xs text-stone-500 hover:text-charcoal transition-colors"
              >
                <span className="flex items-center gap-1">
                  <History size={12} /> {olderVersions.length} previous version{olderVersions.length > 1 ? 's' : ''}
                </span>
                <ChevronDown size={14} className={`transition-transform ${showVersions ? 'rotate-180' : ''}`} />
              </button>

              {showVersions && (
                <div className="space-y-2 mt-2">
                  {olderVersions.map((resume) => (
                    <div key={resume.id} className="flex items-center justify-between p-3 bg-stone-50 rounded-lg border border-stone-100">
                      <div>
                        <p className="text-xs font-medium text-charcoal">{resume.fileName}</p>
                        <p className="text-[10px] text-stone-500">
                          v{resume.version} • {new Date(resume.uploadedAt).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => handlePreview(resume.id)}
                          className="p-1.5 hover:bg-stone-200 rounded transition-colors"
                          title="View"
                        >
                          <Eye size={12} className="text-stone-500" />
                        </button>
                        <button
                          onClick={() => handleDownload(resume.id)}
                          className="p-1.5 hover:bg-stone-200 rounded transition-colors"
                          title="Download"
                        >
                          <Download size={12} className="text-stone-500" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-8 bg-stone-50 rounded-xl border border-dashed border-stone-200">
          <FileText size={32} className="mx-auto text-stone-300 mb-2" />
          <p className="text-sm text-stone-500 mb-3">No resume uploaded</p>
          <button
            onClick={onUploadClick}
            className="px-4 py-2 bg-charcoal text-white rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-rust transition-colors"
          >
            Upload Resume
          </button>
        </div>
      )}
    </div>
  );
};

// Submission Write-Up Component
const SubmissionWriteUpSection: React.FC<{
  talent: {
    fullName?: string | null;
    firstName?: string | null;
    lastName?: string | null;
    candidateLocation?: string | null;
    candidateCurrentVisa?: string | null;
    candidateExperienceYears?: number | null;
    candidateHourlyRate?: string | null;
    candidateAvailability?: string | null;
    candidateSkills?: string[] | null;
  };
}> = ({ talent }) => {
  const [copied, setCopied] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [customWriteUp, setCustomWriteUp] = useState('');

  const name = talent.fullName || `${talent.firstName} ${talent.lastName}`;
  const availability = talent.candidateAvailability?.replace('_', ' ') || 'Available';

  const defaultWriteUp = `**${name}**
${talent.candidateLocation ? `Location: ${talent.candidateLocation}` : ''}
${talent.candidateCurrentVisa ? `Visa: ${talent.candidateCurrentVisa}` : ''}
${talent.candidateExperienceYears ? `Experience: ${talent.candidateExperienceYears}+ years` : ''}
${talent.candidateHourlyRate ? `Rate: $${talent.candidateHourlyRate}/hr` : ''}
Availability: ${availability}

${talent.candidateSkills?.length ? `**Key Skills:** ${talent.candidateSkills.slice(0, 8).join(', ')}` : ''}

---
*Submitted by InTime Solutions*`;

  const writeUp = customWriteUp || defaultWriteUp;

  const handleCopy = () => {
    navigator.clipboard.writeText(writeUp);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleGenerate = async () => {
    setIsGenerating(true);
    // Simulate AI generation - in production this would call an AI endpoint
    await new Promise(resolve => setTimeout(resolve, 1500));
    setCustomWriteUp(`**${name}** is a highly skilled ${talent.candidateCurrentVisa || ''} professional with ${talent.candidateExperienceYears || 'several'}+ years of hands-on experience. ${talent.candidateLocation ? `Based in ${talent.candidateLocation}, ` : ''}they are ${availability.toLowerCase()} to start and seeking ${talent.candidateHourlyRate ? `$${talent.candidateHourlyRate}/hr` : 'competitive compensation'}.

${talent.candidateSkills?.length ? `Their core competencies include ${talent.candidateSkills.slice(0, 5).join(', ')}, making them an excellent fit for roles requiring deep technical expertise.` : ''}

*Recommended for immediate consideration.*`);
    setIsGenerating(false);
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/50 to-amber-100/30 rounded-2xl p-6 border border-amber-100/50">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-bold text-charcoal flex items-center gap-2">
          <Sparkles size={16} className="text-amber-600" /> Submission Write-Up
        </h3>
        <button
          onClick={handleGenerate}
          disabled={isGenerating}
          className="text-xs font-bold text-amber-700 hover:text-amber-900 flex items-center gap-1 disabled:opacity-50"
        >
          {isGenerating ? (
            <>
              <Loader2 size={12} className="animate-spin" /> Generating...
            </>
          ) : (
            <>
              <RefreshCw size={12} /> AI Generate
            </>
          )}
        </button>
      </div>

      <div className="bg-white rounded-xl p-4 border border-amber-100 mb-3 max-h-48 overflow-y-auto">
        <pre className="text-xs text-stone-700 whitespace-pre-wrap font-sans leading-relaxed">
          {writeUp}
        </pre>
      </div>

      <button
        onClick={handleCopy}
        className="w-full py-2.5 bg-amber-600 text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-amber-700 transition-colors flex items-center justify-center gap-2"
      >
        {copied ? (
          <>
            <CheckCircle size={14} /> Copied!
          </>
        ) : (
          <>
            <Copy size={14} /> Copy to Clipboard
          </>
        )}
      </button>
    </div>
  );
};

// Quick Job Creation Modal
const CreateQuickJobModal: React.FC<{
  onClose: () => void;
  onSuccess: (jobId: string) => void;
}> = ({ onClose, onSuccess }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [form, setForm] = useState({
    title: '',
    location: '',
    isRemote: false,
    jobType: 'contract' as 'contract' | 'fulltime' | 'contract_to_hire',
    rateMin: '',
    rateMax: '',
    rateType: 'hourly' as 'hourly' | 'annual',
    status: 'open' as 'draft' | 'open',
  });

  const createJobMutation = trpc.ats.jobs.create.useMutation({
    onSuccess: (job) => {
      onSuccess(job.id);
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
      await createJobMutation.mutateAsync({
        title: form.title,
        location: form.location || undefined,
        isRemote: form.isRemote,
        jobType: form.jobType,
        rateMin: form.rateMin ? parseFloat(form.rateMin) : undefined,
        rateMax: form.rateMax ? parseFloat(form.rateMax) : undefined,
        rateType: form.rateType,
        status: form.status,
      });
    } catch (err) {
      console.error('Failed to create job:', err);
    }
  };

  const inputClass = "w-full p-3 bg-stone-50 border border-stone-200 rounded-xl focus:outline-none focus:border-rust text-sm";
  const labelClass = "block text-[10px] font-bold text-stone-400 uppercase tracking-widest mb-1.5";

  return (
    <div className="fixed inset-0 bg-charcoal/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4 animate-fade-in" onClick={onClose}>
      <div className="bg-white w-full max-w-md rounded-[2rem] shadow-2xl relative" onClick={e => e.stopPropagation()}>
        <div className="p-6 pb-4 border-b border-stone-100">
          <button onClick={onClose} className="absolute top-6 right-6 text-stone-400 hover:text-charcoal">
            <X size={24} />
          </button>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-green-100 text-green-600 rounded-xl flex items-center justify-center">
              <Briefcase size={20} />
            </div>
            <div>
              <h2 className="text-xl font-serif font-bold text-charcoal">Quick Add Job</h2>
              <p className="text-xs text-stone-500">Create a new job opening</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
              {error}
            </div>
          )}

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
              <label className={labelClass}>Location</label>
              <input
                className={inputClass}
                placeholder="e.g. Houston, TX"
                value={form.location}
                onChange={e => setForm({...form, location: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Job Type</label>
              <select
                className={inputClass}
                value={form.jobType}
                onChange={e => setForm({...form, jobType: e.target.value as typeof form.jobType})}
              >
                <option value="contract">Contract</option>
                <option value="fulltime">Full-Time</option>
                <option value="contract_to_hire">Contract-to-Hire</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="isRemote"
              checked={form.isRemote}
              onChange={e => setForm({...form, isRemote: e.target.checked})}
              className="w-4 h-4 rounded border-stone-300 text-rust focus:ring-rust"
            />
            <label htmlFor="isRemote" className="text-sm text-charcoal">Remote position</label>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className={labelClass}>Min Rate</label>
              <input
                type="number"
                className={inputClass}
                placeholder="50"
                value={form.rateMin}
                onChange={e => setForm({...form, rateMin: e.target.value})}
              />
            </div>
            <div>
              <label className={labelClass}>Max Rate</label>
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

          <button
            type="submit"
            disabled={!form.title || isSubmitting}
            className="w-full py-3 bg-charcoal text-white rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-rust disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isSubmitting ? (
              <>
                <Loader2 size={14} className="animate-spin" /> Creating...
              </>
            ) : (
              <>
                <Plus size={14} /> Create Job
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};

// Attach Job Modal Component
const AttachJobModal: React.FC<{
  talentId: string;
  onClose: () => void;
  onSuccess: () => void;
}> = ({ talentId, onClose, onSuccess }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedJob, setSelectedJob] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [showCreateJobModal, setShowCreateJobModal] = useState(false);

  // Fetch open jobs
  const { data: jobs = [], isLoading: loadingJobs, refetch: refetchJobs } = trpc.ats.jobs.list.useQuery({
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

  const handleJobCreated = (jobId: string) => {
    setSelectedJob(jobId);
    refetchJobs();
    setShowCreateJobModal(false);
  };

  return (
    <>
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

          {/* Search and Add Job */}
          <div className="flex gap-3 mb-4">
            <div className="flex-1 flex items-center gap-3 bg-stone-50 p-3 rounded-xl border border-stone-200">
              <Search size={18} className="text-stone-400" />
              <input
                type="text"
                placeholder="Search jobs by title or location..."
                className="flex-1 bg-transparent outline-none text-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <button
              onClick={() => setShowCreateJobModal(true)}
              className="px-4 py-3 bg-green-100 text-green-700 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-200 transition-colors flex items-center gap-2 whitespace-nowrap"
            >
              <Plus size={14} /> New Job
            </button>
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
                  <p>No open jobs found</p>
                  <button
                    onClick={() => setShowCreateJobModal(true)}
                    className="mt-2 text-rust font-bold hover:underline text-sm"
                  >
                    Create a new job
                  </button>
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

      {/* Create Job Modal */}
      {showCreateJobModal && (
        <CreateQuickJobModal
          onClose={() => setShowCreateJobModal(false)}
          onSuccess={handleJobCreated}
        />
      )}
    </>
  );
};

export const TalentWorkspace: React.FC<TalentWorkspaceProps> = ({ talentId }) => {
  const [activeTab, setActiveTab] = useState<TabType>('overview');
  const [showAttachJobModal, setShowAttachJobModal] = useState(false);
  const [showResumeUploadModal, setShowResumeUploadModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);

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
        <p className="text-stone-500 mb-4">The talent profile you&apos;re looking for doesn&apos;t exist.</p>
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
              <button
                onClick={() => setShowEditModal(true)}
                className="p-2 text-stone-400 hover:text-charcoal hover:bg-stone-100 rounded-lg transition-colors"
                title="Edit Profile"
              >
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

              {/* Right Column - Actions & Resume */}
              <div className="space-y-6">
                {/* Quick Actions */}
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
                    <button
                      onClick={() => setShowResumeUploadModal(true)}
                      className="w-full py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center justify-center gap-2"
                    >
                      <FileUp size={14} /> Upload Resume
                    </button>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => setShowEmailModal(true)}
                        disabled={!talent.email}
                        className="py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-stone-50 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        <Mail size={14} /> Email
                      </button>
                      <a
                        href={talent.phone ? `tel:${talent.phone}` : '#'}
                        onClick={(e) => {
                          if (!talent.phone) {
                            e.preventDefault();
                            return;
                          }
                        }}
                        className={`py-3 border border-stone-200 rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-green-50 hover:border-green-200 hover:text-green-700 transition-colors flex items-center justify-center gap-2 ${
                          !talent.phone ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <PhoneCall size={14} /> Call
                      </a>
                    </div>
                  </div>
                </div>

                {/* Resume Preview */}
                <ResumePreviewSection
                  talentId={talentId}
                  talentName={talent.fullName || `${talent.firstName} ${talent.lastName}`}
                  onUploadClick={() => setShowResumeUploadModal(true)}
                />

                {/* Submission Write-Up */}
                <SubmissionWriteUpSection talent={talent} />

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

      {/* Resume Upload Modal */}
      {showResumeUploadModal && (
        <ResumeUploadModal
          talentId={talentId}
          talentName={talent.fullName || `${talent.firstName} ${talent.lastName}`}
          onClose={() => setShowResumeUploadModal(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}

      {/* Email Composer Modal */}
      {showEmailModal && talent.email && (
        <EmailComposerModal
          recipientEmail={talent.email}
          recipientName={talent.fullName || `${talent.firstName} ${talent.lastName}`}
          onClose={() => setShowEmailModal(false)}
          onSuccess={() => {
            // Could log activity here
          }}
        />
      )}

      {/* Edit Talent Modal */}
      {showEditModal && talent && (
        <EditTalentModal
          talentId={talent.id}
          talentName={talent.fullName || `${talent.firstName} ${talent.lastName}`}
          onClose={() => setShowEditModal(false)}
          onSuccess={() => {
            refetch();
          }}
        />
      )}
    </div>
  );
};

export default TalentWorkspace;
