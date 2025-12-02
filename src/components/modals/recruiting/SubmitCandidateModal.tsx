"use client";

import * as React from "react";
import {
  Loader2,
  Search,
  Upload,
  ChevronRight,
  ChevronLeft,
  Check,
  Sparkles,
  AlertTriangle,
  User,
  Briefcase,
  FileText,
  DollarSign,
  MessageSquare,
  Send,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface Candidate {
  id: string;
  name: string;
  email: string;
  phone?: string;
  workAuth?: string;
}

interface Job {
  id: string;
  title: string;
  company: string;
  rateMin?: number;
  rateMax?: number;
  status: string;
}

interface Resume {
  id: string;
  name: string;
  version: string;
  uploadedAt: string;
}

type SubmissionMethod = "email" | "vms" | "manual";

interface SubmitCandidateFormData {
  candidateId: string;
  jobId: string;
  resumeId: string;
  payRate: number;
  billRate: number;
  overrideRate: boolean;
  highlights: string;
  internalNotes: string;
  additionalDocs: File[];
  submissionMethod: SubmissionMethod;
}

const STEPS = [
  { id: 1, label: "Candidate", icon: User },
  { id: 2, label: "Job", icon: Briefcase },
  { id: 3, label: "Resume", icon: FileText },
  { id: 4, label: "Rate", icon: DollarSign },
  { id: 5, label: "Details", icon: MessageSquare },
  { id: 6, label: "Submit", icon: Send },
];

export interface SubmitCandidateModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: SubmitCandidateFormData) => Promise<void>;
  // Data fetchers
  searchCandidates: (query: string) => Promise<Candidate[]>;
  searchJobs: (query: string) => Promise<Job[]>;
  getResumes: (candidateId: string) => Promise<Resume[]>;
  uploadResume: (file: File, candidateId: string) => Promise<Resume>;
  generateHighlights: (candidateId: string, jobId: string) => Promise<string>;
  // Pre-selected values (optional)
  preSelectedCandidateId?: string;
  preSelectedJobId?: string;
}

export function SubmitCandidateModal({
  isOpen,
  onClose,
  onSubmit,
  searchCandidates,
  searchJobs,
  getResumes,
  uploadResume,
  generateHighlights,
  preSelectedCandidateId,
  preSelectedJobId,
}: SubmitCandidateModalProps) {
  // Wizard state
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Form data
  const [formData, setFormData] = React.useState<Partial<SubmitCandidateFormData>>({
    overrideRate: false,
    additionalDocs: [],
    submissionMethod: "email",
  });

  // Search states
  const [candidateSearch, setCandidateSearch] = React.useState("");
  const [jobSearch, setJobSearch] = React.useState("");
  const [candidates, setCandidates] = React.useState<Candidate[]>([]);
  const [jobs, setJobs] = React.useState<Job[]>([]);
  const [resumes, setResumes] = React.useState<Resume[]>([]);
  const [selectedCandidate, setSelectedCandidate] = React.useState<Candidate | null>(null);
  const [selectedJob, setSelectedJob] = React.useState<Job | null>(null);

  // Loading states
  const [isSearchingCandidates, setIsSearchingCandidates] = React.useState(false);
  const [isSearchingJobs, setIsSearchingJobs] = React.useState(false);
  const [isLoadingResumes, setIsLoadingResumes] = React.useState(false);
  const [isGeneratingHighlights, setIsGeneratingHighlights] = React.useState(false);
  const [isUploadingResume, setIsUploadingResume] = React.useState(false);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        candidateId: preSelectedCandidateId || "",
        jobId: preSelectedJobId || "",
        overrideRate: false,
        additionalDocs: [],
        submissionMethod: "email",
      });
      setCandidateSearch("");
      setJobSearch("");
      setCandidates([]);
      setJobs([]);
      setResumes([]);
      setSelectedCandidate(null);
      setSelectedJob(null);
    }
  }, [isOpen, preSelectedCandidateId, preSelectedJobId]);

  // Search candidates
  React.useEffect(() => {
    if (candidateSearch.length < 2) {
      setCandidates([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingCandidates(true);
      try {
        const results = await searchCandidates(candidateSearch);
        setCandidates(results);
      } catch (error) {
        console.error("Failed to search candidates:", error);
      } finally {
        setIsSearchingCandidates(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [candidateSearch, searchCandidates]);

  // Search jobs
  React.useEffect(() => {
    if (jobSearch.length < 2) {
      setJobs([]);
      return;
    }

    const timer = setTimeout(async () => {
      setIsSearchingJobs(true);
      try {
        const results = await searchJobs(jobSearch);
        setJobs(results);
      } catch (error) {
        console.error("Failed to search jobs:", error);
      } finally {
        setIsSearchingJobs(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [jobSearch, searchJobs]);

  // Load resumes when candidate selected
  React.useEffect(() => {
    if (selectedCandidate) {
      setIsLoadingResumes(true);
      getResumes(selectedCandidate.id)
        .then((results) => setResumes(results))
        .catch((error) => console.error("Failed to load resumes:", error))
        .finally(() => setIsLoadingResumes(false));
    }
  }, [selectedCandidate, getResumes]);

  const handleSelectCandidate = (candidate: Candidate) => {
    setSelectedCandidate(candidate);
    setFormData((prev) => ({ ...prev, candidateId: candidate.id }));
    setCandidateSearch(candidate.name);
  };

  const handleSelectJob = (job: Job) => {
    setSelectedJob(job);
    setFormData((prev) => ({ ...prev, jobId: job.id }));
    setJobSearch(job.title);
  };

  const handleGenerateHighlights = async () => {
    if (!formData.candidateId || !formData.jobId) return;

    setIsGeneratingHighlights(true);
    try {
      const highlights = await generateHighlights(formData.candidateId, formData.jobId);
      setFormData((prev) => ({ ...prev, highlights }));
    } catch (error) {
      console.error("Failed to generate highlights:", error);
    } finally {
      setIsGeneratingHighlights(false);
    }
  };

  const handleUploadResume = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !formData.candidateId) return;

    setIsUploadingResume(true);
    try {
      const newResume = await uploadResume(file, formData.candidateId);
      setResumes((prev) => [newResume, ...prev]);
      setFormData((prev) => ({ ...prev, resumeId: newResume.id }));
    } catch (error) {
      console.error("Failed to upload resume:", error);
    } finally {
      setIsUploadingResume(false);
    }
  };

  const calculateMargin = () => {
    const { payRate, billRate } = formData;
    if (!payRate || !billRate || billRate === 0) return 0;
    return ((billRate - payRate) / billRate) * 100;
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.candidateId);
      case 2:
        return Boolean(formData.jobId);
      case 3:
        return Boolean(formData.resumeId);
      case 4:
        return Boolean(formData.payRate && formData.billRate);
      case 5:
        return Boolean(formData.highlights && formData.highlights.length >= 50);
      case 6:
        return Boolean(formData.submissionMethod);
      default:
        return false;
    }
  };

  const canGoNext = isStepValid(currentStep);

  const handleNext = () => {
    if (currentStep < 6 && canGoNext) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    if (!formData.candidateId || !formData.jobId || !formData.resumeId) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData as SubmitCandidateFormData);
      onClose();
    } catch (error) {
      console.error("Submission failed:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={candidateSearch}
                onChange={(e) => setCandidateSearch(e.target.value)}
                placeholder="Search candidates by name or email..."
                className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm"
              />
              {isSearchingCandidates && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
              )}
            </div>

            {candidates.length > 0 && (
              <div className="max-h-[300px] overflow-auto rounded-md border">
                {candidates.map((candidate) => (
                  <button
                    key={candidate.id}
                    type="button"
                    onClick={() => handleSelectCandidate(candidate)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b p-3 text-left last:border-b-0",
                      "hover:bg-muted/50",
                      formData.candidateId === candidate.id && "bg-primary/10"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <User className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{candidate.name}</div>
                      <div className="text-sm text-muted-foreground">{candidate.email}</div>
                    </div>
                    {candidate.workAuth && (
                      <span className="rounded-full bg-muted px-2 py-1 text-xs">
                        {candidate.workAuth}
                      </span>
                    )}
                    {formData.candidateId === candidate.id && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </button>
                ))}
              </div>
            )}

            {selectedCandidate && (
              <div className="rounded-md border bg-muted/50 p-4">
                <div className="text-sm font-medium">Selected Candidate</div>
                <div className="mt-1 text-lg font-semibold">{selectedCandidate.name}</div>
                <div className="text-sm text-muted-foreground">{selectedCandidate.email}</div>
              </div>
            )}
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={jobSearch}
                onChange={(e) => setJobSearch(e.target.value)}
                placeholder="Search jobs by title or company..."
                className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm"
              />
              {isSearchingJobs && (
                <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin" />
              )}
            </div>

            {jobs.length > 0 && (
              <div className="max-h-[300px] overflow-auto rounded-md border">
                {jobs.map((job) => (
                  <button
                    key={job.id}
                    type="button"
                    onClick={() => handleSelectJob(job)}
                    className={cn(
                      "flex w-full items-center gap-3 border-b p-3 text-left last:border-b-0",
                      "hover:bg-muted/50",
                      formData.jobId === job.id && "bg-primary/10"
                    )}
                  >
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
                      <Briefcase className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <div className="flex-1">
                      <div className="font-medium">{job.title}</div>
                      <div className="text-sm text-muted-foreground">{job.company}</div>
                    </div>
                    <span
                      className={cn(
                        "rounded-full px-2 py-1 text-xs",
                        job.status === "open" && "bg-green-100 text-green-800",
                        job.status === "urgent" && "bg-red-100 text-red-800"
                      )}
                    >
                      {job.status}
                    </span>
                    {formData.jobId === job.id && <Check className="h-5 w-5 text-primary" />}
                  </button>
                ))}
              </div>
            )}

            {selectedJob && (
              <div className="rounded-md border bg-muted/50 p-4">
                <div className="text-sm font-medium">Selected Job</div>
                <div className="mt-1 text-lg font-semibold">{selectedJob.title}</div>
                <div className="text-sm text-muted-foreground">{selectedJob.company}</div>
                {selectedJob.rateMin && selectedJob.rateMax && (
                  <div className="mt-2 text-sm">
                    Rate Range: ${selectedJob.rateMin} - ${selectedJob.rateMax}/hr
                  </div>
                )}
              </div>
            )}
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            {isLoadingResumes ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : (
              <>
                <div className="space-y-2">
                  {resumes.map((resume) => (
                    <label
                      key={resume.id}
                      className={cn(
                        "flex cursor-pointer items-center gap-3 rounded-md border p-3",
                        "hover:bg-muted/50",
                        formData.resumeId === resume.id && "border-primary bg-primary/10"
                      )}
                    >
                      <input
                        type="radio"
                        name="resume"
                        checked={formData.resumeId === resume.id}
                        onChange={() =>
                          setFormData((prev) => ({ ...prev, resumeId: resume.id }))
                        }
                        className="h-4 w-4"
                      />
                      <FileText className="h-5 w-5 text-muted-foreground" />
                      <div className="flex-1">
                        <div className="font-medium">{resume.name}</div>
                        <div className="text-sm text-muted-foreground">
                          Version {resume.version} - Uploaded {resume.uploadedAt}
                        </div>
                      </div>
                    </label>
                  ))}
                </div>

                <div className="relative">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleUploadResume}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label
                    htmlFor="resume-upload"
                    className={cn(
                      "flex cursor-pointer items-center justify-center gap-2 rounded-md border-2 border-dashed p-4",
                      "text-sm text-muted-foreground hover:border-primary hover:text-primary"
                    )}
                  >
                    {isUploadingResume ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload new resume
                  </label>
                </div>
              </>
            )}
          </div>
        );

      case 4:
        const margin = calculateMargin();
        const isMarginLow = margin < 18;
        const isOutsideRange =
          selectedJob?.rateMin &&
          selectedJob?.rateMax &&
          formData.billRate &&
          (formData.billRate < selectedJob.rateMin || formData.billRate > selectedJob.rateMax);

        return (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium">Pay Rate ($/hr)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.payRate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        payRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Bill Rate ($/hr)</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    $
                  </span>
                  <input
                    type="number"
                    value={formData.billRate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({
                        ...prev,
                        billRate: parseFloat(e.target.value) || 0,
                      }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 text-sm"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="override-rate"
                checked={formData.overrideRate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, overrideRate: e.target.checked }))
                }
                className="h-4 w-4"
              />
              <label htmlFor="override-rate" className="text-sm">
                Override standard margin calculation
              </label>
            </div>

            <div className="rounded-md border p-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-muted-foreground">Margin</span>
                <span
                  className={cn(
                    "text-lg font-semibold",
                    isMarginLow ? "text-red-500" : "text-green-500"
                  )}
                >
                  {margin.toFixed(1)}%
                </span>
              </div>
              {isMarginLow && (
                <div className="mt-2 flex items-center gap-2 text-sm text-red-500">
                  <AlertTriangle className="h-4 w-4" />
                  Margin is below minimum threshold (18%)
                </div>
              )}
            </div>

            {isOutsideRange && (
              <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
                <AlertTriangle className="h-4 w-4" />
                Bill rate is outside job rate range (${selectedJob?.rateMin} - $
                {selectedJob?.rateMax})
              </div>
            )}
          </div>
        );

      case 5:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">
                  Candidate Highlights <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={handleGenerateHighlights}
                  disabled={isGeneratingHighlights}
                  className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  {isGeneratingHighlights ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Sparkles className="h-4 w-4" />
                  )}
                  AI Assist
                </button>
              </div>
              <textarea
                value={formData.highlights || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, highlights: e.target.value }))
                }
                placeholder="Describe why this candidate is a great fit for this role..."
                className="min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
              <div className="text-xs text-muted-foreground">
                {(formData.highlights?.length || 0)}/50 minimum characters
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Internal Notes (not sent to client)</label>
              <textarea
                value={formData.internalNotes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, internalNotes: e.target.value }))
                }
                placeholder="Any internal notes for the team..."
                className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Documents</label>
              <input
                type="file"
                multiple
                onChange={(e) => {
                  const files = Array.from(e.target.files || []);
                  setFormData((prev) => ({
                    ...prev,
                    additionalDocs: [...(prev.additionalDocs || []), ...files],
                  }));
                }}
                className="text-sm"
              />
            </div>
          </div>
        );

      case 6:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Submission Method</label>
              <div className="space-y-2">
                {[
                  { value: "email", label: "Email", description: "Send via email to client" },
                  { value: "vms", label: "VMS", description: "Submit through vendor management system" },
                  { value: "manual", label: "Manual", description: "Mark as manually submitted" },
                ].map((option) => (
                  <label
                    key={option.value}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-md border p-3",
                      "hover:bg-muted/50",
                      formData.submissionMethod === option.value && "border-primary bg-primary/10"
                    )}
                  >
                    <input
                      type="radio"
                      name="submissionMethod"
                      value={option.value}
                      checked={formData.submissionMethod === option.value}
                      onChange={(e) =>
                        setFormData((prev) => ({
                          ...prev,
                          submissionMethod: e.target.value as SubmissionMethod,
                        }))
                      }
                      className="h-4 w-4"
                    />
                    <div>
                      <div className="font-medium">{option.label}</div>
                      <div className="text-sm text-muted-foreground">{option.description}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div className="rounded-md border bg-muted/50 p-4">
              <h4 className="font-medium">Submission Summary</h4>
              <div className="mt-3 space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Candidate:</span>
                  <span className="font-medium">{selectedCandidate?.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Job:</span>
                  <span className="font-medium">{selectedJob?.title}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Pay Rate:</span>
                  <span className="font-medium">${formData.payRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Bill Rate:</span>
                  <span className="font-medium">${formData.billRate}/hr</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Margin:</span>
                  <span className="font-medium">{calculateMargin().toFixed(1)}%</span>
                </div>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Submit Candidate"
      subtitle={`Step ${currentStep} of ${STEPS.length}: ${STEPS[currentStep - 1]?.label}`}
      size="lg"
      closeOnEscape={!isSubmitting}
      closeOnOverlay={!isSubmitting}
      footer={
        <div className="flex w-full justify-between">
          <button
            type="button"
            onClick={handleBack}
            disabled={currentStep === 1 || isSubmitting}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input",
              "bg-background px-4 py-2 text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>

          {currentStep < 6 ? (
            <button
              type="button"
              onClick={handleNext}
              disabled={!canGoNext}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md",
                "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                "hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || !canGoNext}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md",
                "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                "hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Submit
            </button>
          )}
        </div>
      }
    >
      {/* Step Indicator */}
      <div className="mb-6 flex justify-between">
        {STEPS.map((step) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <div
              key={step.id}
              className={cn(
                "flex flex-col items-center gap-1",
                isActive && "text-primary",
                isCompleted && "text-green-500",
                !isActive && !isCompleted && "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2",
                  isActive && "border-primary bg-primary/10",
                  isCompleted && "border-green-500 bg-green-500/10",
                  !isActive && !isCompleted && "border-muted"
                )}
              >
                {isCompleted ? (
                  <Check className="h-4 w-4" />
                ) : (
                  <Icon className="h-4 w-4" />
                )}
              </div>
              <span className="text-xs">{step.label}</span>
            </div>
          );
        })}
      </div>

      {renderStepContent()}
    </Modal>
  );
}

export default SubmitCandidateModal;
