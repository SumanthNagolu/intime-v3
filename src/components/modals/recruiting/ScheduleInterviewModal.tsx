"use client";

import * as React from "react";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  Plus,
  Trash2,
  Calendar,
  Clock,
  Video,
  Phone,
  Building,
  Users,
  Monitor,
  Target,
  MessageCircle,
  Sparkles,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

type InterviewType =
  | "phone_screen"
  | "video_call"
  | "in_person"
  | "panel"
  | "technical"
  | "behavioral"
  | "final_round";

const INTERVIEW_TYPES: {
  value: InterviewType;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  description: string;
}[] = [
  { value: "phone_screen", label: "Phone Screen", icon: Phone, description: "Initial phone call" },
  { value: "video_call", label: "Video Call", icon: Video, description: "Remote video interview" },
  { value: "in_person", label: "In-Person", icon: Building, description: "On-site interview" },
  { value: "panel", label: "Panel Interview", icon: Users, description: "Multiple interviewers" },
  { value: "technical", label: "Technical", icon: Monitor, description: "Coding/technical assessment" },
  { value: "behavioral", label: "Behavioral", icon: MessageCircle, description: "Culture fit, soft skills" },
  { value: "final_round", label: "Final Round", icon: Target, description: "Decision-making interview" },
];

const DURATION_OPTIONS = [30, 45, 60, 90, 120];

interface ProposedTime {
  id: string;
  date: string;
  time: string;
}

interface Interviewer {
  id: string;
  name: string;
  email: string;
  title?: string;
}

interface ScheduleInterviewFormData {
  interviewType: InterviewType;
  roundNumber: number;
  durationMinutes: number;
  description?: string;
  timezone: string;
  proposedTimes: ProposedTime[];
  interviewers: Interviewer[];
  meetingLink?: string;
  meetingLocation?: string;
  internalNotes?: string;
}

const STEPS = [
  { id: 1, label: "Details" },
  { id: 2, label: "Schedule" },
  { id: 3, label: "Participants" },
];

export interface ScheduleInterviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  candidateName: string;
  jobTitle: string;
  onSubmit: (data: ScheduleInterviewFormData) => Promise<void>;
  generateMeetingLink?: (platform: "zoom" | "meet" | "teams") => Promise<string>;
}

export function ScheduleInterviewModal({
  isOpen,
  onClose,
  submissionId,
  candidateName,
  jobTitle,
  onSubmit,
  generateMeetingLink,
}: ScheduleInterviewModalProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isGeneratingLink, setIsGeneratingLink] = React.useState(false);

  const [formData, setFormData] = React.useState<ScheduleInterviewFormData>({
    interviewType: "phone_screen",
    roundNumber: 1,
    durationMinutes: 60,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    proposedTimes: [
      { id: "1", date: "", time: "" },
      { id: "2", date: "", time: "" },
      { id: "3", date: "", time: "" },
    ],
    interviewers: [{ id: "1", name: "", email: "", title: "" }],
  });

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        interviewType: "phone_screen",
        roundNumber: 1,
        durationMinutes: 60,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        proposedTimes: [
          { id: "1", date: "", time: "" },
          { id: "2", date: "", time: "" },
          { id: "3", date: "", time: "" },
        ],
        interviewers: [{ id: "1", name: "", email: "", title: "" }],
      });
    }
  }, [isOpen]);

  const handleAddProposedTime = () => {
    if (formData.proposedTimes.length >= 5) return;
    setFormData((prev) => ({
      ...prev,
      proposedTimes: [
        ...prev.proposedTimes,
        { id: String(Date.now()), date: "", time: "" },
      ],
    }));
  };

  const handleRemoveProposedTime = (id: string) => {
    if (formData.proposedTimes.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      proposedTimes: prev.proposedTimes.filter((t) => t.id !== id),
    }));
  };

  const handleUpdateProposedTime = (id: string, field: "date" | "time", value: string) => {
    setFormData((prev) => ({
      ...prev,
      proposedTimes: prev.proposedTimes.map((t) =>
        t.id === id ? { ...t, [field]: value } : t
      ),
    }));
  };

  const handleAddInterviewer = () => {
    if (formData.interviewers.length >= 10) return;
    setFormData((prev) => ({
      ...prev,
      interviewers: [
        ...prev.interviewers,
        { id: String(Date.now()), name: "", email: "", title: "" },
      ],
    }));
  };

  const handleRemoveInterviewer = (id: string) => {
    if (formData.interviewers.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      interviewers: prev.interviewers.filter((i) => i.id !== id),
    }));
  };

  const handleUpdateInterviewer = (
    id: string,
    field: keyof Interviewer,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      interviewers: prev.interviewers.map((i) =>
        i.id === id ? { ...i, [field]: value } : i
      ),
    }));
  };

  const handleGenerateLink = async (platform: "zoom" | "meet" | "teams") => {
    if (!generateMeetingLink) return;

    setIsGeneratingLink(true);
    try {
      const link = await generateMeetingLink(platform);
      setFormData((prev) => ({ ...prev, meetingLink: link }));
    } catch (error) {
      console.error("Failed to generate link:", error);
    } finally {
      setIsGeneratingLink(false);
    }
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.interviewType && formData.durationMinutes > 0);
      case 2:
        return formData.proposedTimes.every((t) => t.date && t.time);
      case 3:
        return formData.interviewers.every((i) => i.name && i.email);
      default:
        return false;
    }
  };

  const canGoNext = isStepValid(currentStep);

  const handleNext = () => {
    if (currentStep < 3 && canGoNext) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to schedule interview:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Interview Type *</label>
              <div className="grid gap-2 sm:grid-cols-2">
                {INTERVIEW_TYPES.map((type) => {
                  const Icon = type.icon;
                  return (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() =>
                        setFormData((prev) => ({ ...prev, interviewType: type.value }))
                      }
                      className={cn(
                        "flex items-center gap-3 rounded-md border p-3 text-left",
                        "transition-colors hover:bg-muted/50",
                        formData.interviewType === type.value &&
                          "border-primary bg-primary/10"
                      )}
                    >
                      <Icon className="h-5 w-5 text-muted-foreground" />
                      <div>
                        <div className="text-sm font-medium">{type.label}</div>
                        <div className="text-xs text-muted-foreground">
                          {type.description}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Interview Round *</label>
              <div className="flex gap-2">
                {[1, 2, 3, 4].map((round) => (
                  <button
                    key={round}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, roundNumber: round }))
                    }
                    className={cn(
                      "flex h-10 w-16 items-center justify-center rounded-md border text-sm font-medium",
                      formData.roundNumber === round
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-muted/50"
                    )}
                  >
                    Round {round}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Duration</label>
              <div className="flex flex-wrap gap-2">
                {DURATION_OPTIONS.map((duration) => (
                  <button
                    key={duration}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, durationMinutes: duration }))
                    }
                    className={cn(
                      "rounded-md border px-3 py-1 text-sm",
                      formData.durationMinutes === duration
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {duration} min
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Description (Optional)</label>
              <textarea
                value={formData.description || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, description: e.target.value }))
                }
                placeholder="e.g., Technical screening, Culture fit assessment..."
                className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Timezone</label>
              <select
                value={formData.timezone}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, timezone: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="America/New_York">Eastern (EST/EDT)</option>
                <option value="America/Chicago">Central (CST/CDT)</option>
                <option value="America/Denver">Mountain (MST/MDT)</option>
                <option value="America/Los_Angeles">Pacific (PST/PDT)</option>
                <option value="America/Phoenix">Arizona (MST)</option>
                <option value="Europe/London">London (GMT/BST)</option>
                <option value="Asia/Kolkata">India (IST)</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Proposed Times *</label>
              <p className="text-xs text-muted-foreground">
                Propose at least 3 time slots for the client to choose from
              </p>
              <div className="space-y-3">
                {formData.proposedTimes.map((time, index) => (
                  <div key={time.id} className="flex items-center gap-2">
                    <span className="w-16 text-sm text-muted-foreground">
                      Option {index + 1}
                    </span>
                    <div className="relative flex-1">
                      <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="date"
                        value={time.date}
                        onChange={(e) =>
                          handleUpdateProposedTime(time.id, "date", e.target.value)
                        }
                        min={new Date().toISOString().split("T")[0]}
                        className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm"
                      />
                    </div>
                    <div className="relative w-32">
                      <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                      <input
                        type="time"
                        value={time.time}
                        onChange={(e) =>
                          handleUpdateProposedTime(time.id, "time", e.target.value)
                        }
                        className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm"
                      />
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveProposedTime(time.id)}
                      disabled={formData.proposedTimes.length <= 1}
                      className="text-muted-foreground hover:text-destructive disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {formData.proposedTimes.length < 5 && (
                <button
                  type="button"
                  onClick={handleAddProposedTime}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Option
                </button>
              )}
            </div>
          </div>
        );

      case 3:
        const needsMeetingLink = ["video_call", "phone_screen", "panel", "technical"].includes(
          formData.interviewType
        );
        const needsLocation = formData.interviewType === "in_person";

        return (
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Interviewers (Client Side) *</label>
              <div className="space-y-3">
                {formData.interviewers.map((interviewer, index) => (
                  <div key={interviewer.id} className="space-y-2 rounded-md border p-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Interviewer {index + 1}</span>
                      {formData.interviewers.length > 1 && (
                        <button
                          type="button"
                          onClick={() => handleRemoveInterviewer(interviewer.id)}
                          className="text-muted-foreground hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      )}
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      <input
                        type="text"
                        value={interviewer.name}
                        onChange={(e) =>
                          handleUpdateInterviewer(interviewer.id, "name", e.target.value)
                        }
                        placeholder="Name"
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      />
                      <input
                        type="email"
                        value={interviewer.email}
                        onChange={(e) =>
                          handleUpdateInterviewer(interviewer.id, "email", e.target.value)
                        }
                        placeholder="Email"
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      />
                      <input
                        type="text"
                        value={interviewer.title || ""}
                        onChange={(e) =>
                          handleUpdateInterviewer(interviewer.id, "title", e.target.value)
                        }
                        placeholder="Title (optional)"
                        className="h-9 rounded-md border border-input bg-background px-3 text-sm"
                      />
                    </div>
                  </div>
                ))}
              </div>
              {formData.interviewers.length < 10 && (
                <button
                  type="button"
                  onClick={handleAddInterviewer}
                  className="flex items-center gap-1 text-sm text-primary hover:underline"
                >
                  <Plus className="h-4 w-4" />
                  Add Another Interviewer
                </button>
              )}
            </div>

            {needsMeetingLink && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Meeting Link</label>
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={formData.meetingLink || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, meetingLink: e.target.value }))
                    }
                    placeholder="https://meet.google.com/..."
                    className="h-10 flex-1 rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                {generateMeetingLink && (
                  <div className="flex gap-2">
                    {(["zoom", "meet", "teams"] as const).map((platform) => (
                      <button
                        key={platform}
                        type="button"
                        onClick={() => handleGenerateLink(platform)}
                        disabled={isGeneratingLink}
                        className="flex items-center gap-1 text-sm text-primary hover:underline"
                      >
                        {isGeneratingLink ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <Sparkles className="h-3 w-3" />
                        )}
                        Generate {platform.charAt(0).toUpperCase() + platform.slice(1)}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}

            {needsLocation && (
              <div className="space-y-2">
                <label className="text-sm font-medium">Meeting Location</label>
                <input
                  type="text"
                  value={formData.meetingLocation || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, meetingLocation: e.target.value }))
                  }
                  placeholder="e.g., 1600 Amphitheatre Pkwy, Mountain View, CA"
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            )}

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
      title={`Schedule Interview - ${candidateName}`}
      subtitle={jobTitle}
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

          {currentStep < 3 ? (
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
                <Check className="h-4 w-4" />
              )}
              Schedule Interview
            </button>
          )}
        </div>
      }
    >
      {/* Step Indicator */}
      <div className="mb-6 flex items-center justify-center gap-4">
        {STEPS.map((step, index) => (
          <React.Fragment key={step.id}>
            <div
              className={cn(
                "flex items-center gap-2",
                currentStep === step.id && "text-primary",
                currentStep > step.id && "text-green-500",
                currentStep < step.id && "text-muted-foreground"
              )}
            >
              <div
                className={cn(
                  "flex h-8 w-8 items-center justify-center rounded-full border-2 text-sm font-medium",
                  currentStep === step.id && "border-primary bg-primary/10",
                  currentStep > step.id && "border-green-500 bg-green-500 text-white",
                  currentStep < step.id && "border-muted"
                )}
              >
                {currentStep > step.id ? <Check className="h-4 w-4" /> : step.id}
              </div>
              <span className="hidden text-sm sm:inline">{step.label}</span>
            </div>
            {index < STEPS.length - 1 && (
              <div
                className={cn(
                  "h-0.5 w-8 bg-muted",
                  currentStep > step.id && "bg-green-500"
                )}
              />
            )}
          </React.Fragment>
        ))}
      </div>

      {renderStepContent()}
    </Modal>
  );
}

export default ScheduleInterviewModal;
