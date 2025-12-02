"use client";

import * as React from "react";
import {
  Loader2,
  Check,
  X,
  AlertCircle,
  Clock,
  ThumbsUp,
  ThumbsDown,
  Calendar,
  DollarSign,
  FileText,
  MessageSquare,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

type SubmissionStatus =
  | "submitted"
  | "client_review"
  | "client_interview"
  | "interviewing"
  | "offer_pending"
  | "offer_extended"
  | "offer_accepted"
  | "offer_declined"
  | "placed"
  | "rejected"
  | "withdrawn";

interface StatusConfig {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  bgColor: string;
  fields?: string[];
}

const STATUS_CONFIG: Record<SubmissionStatus, StatusConfig> = {
  submitted: {
    label: "Submitted",
    icon: FileText,
    color: "text-blue-500",
    bgColor: "bg-blue-100",
  },
  client_review: {
    label: "Client Review",
    icon: Clock,
    color: "text-yellow-500",
    bgColor: "bg-yellow-100",
  },
  client_interview: {
    label: "Client Interview",
    icon: Calendar,
    color: "text-purple-500",
    bgColor: "bg-purple-100",
  },
  interviewing: {
    label: "Interviewing",
    icon: MessageSquare,
    color: "text-indigo-500",
    bgColor: "bg-indigo-100",
  },
  offer_pending: {
    label: "Offer Pending",
    icon: Clock,
    color: "text-orange-500",
    bgColor: "bg-orange-100",
  },
  offer_extended: {
    label: "Offer Extended",
    icon: DollarSign,
    color: "text-green-500",
    bgColor: "bg-green-100",
    fields: ["offerAmount", "startDate"],
  },
  offer_accepted: {
    label: "Offer Accepted",
    icon: ThumbsUp,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  offer_declined: {
    label: "Offer Declined",
    icon: ThumbsDown,
    color: "text-red-500",
    bgColor: "bg-red-100",
    fields: ["declineReason"],
  },
  placed: {
    label: "Placed",
    icon: Check,
    color: "text-green-700",
    bgColor: "bg-green-200",
  },
  rejected: {
    label: "Rejected",
    icon: X,
    color: "text-red-600",
    bgColor: "bg-red-100",
    fields: ["rejectionReason", "rejectionNotes"],
  },
  withdrawn: {
    label: "Withdrawn",
    icon: AlertCircle,
    color: "text-gray-500",
    bgColor: "bg-gray-100",
    fields: ["withdrawalReason"],
  },
};

const REJECTION_REASONS = [
  "Not enough experience",
  "Overqualified",
  "Salary expectations too high",
  "Poor culture fit",
  "Better candidate found",
  "Position filled",
  "Position cancelled",
  "Failed background check",
  "Other",
];

const WITHDRAWAL_REASONS = [
  "Candidate accepted another offer",
  "Candidate no longer interested",
  "Candidate unresponsive",
  "Rate negotiation failed",
  "Relocation issues",
  "Other",
];

const DECLINE_REASONS = [
  "Compensation too low",
  "Better offer elsewhere",
  "Role not as expected",
  "Location/commute issues",
  "Personal reasons",
  "Counter offer accepted",
  "Other",
];

interface StatusChangeFormData {
  newStatus: SubmissionStatus;
  rejectionReason?: string;
  rejectionNotes?: string;
  withdrawalReason?: string;
  declineReason?: string;
  offerAmount?: number;
  startDate?: string;
  clientFeedback?: string;
  interviewOutcome?: "passed" | "failed" | "pending";
  notes?: string;
  notifyStakeholders?: boolean;
}

export interface StatusChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissionId: string;
  candidateName: string;
  jobTitle: string;
  currentStatus: SubmissionStatus;
  onSubmit: (data: StatusChangeFormData) => Promise<void>;
}

export function StatusChangeModal({
  isOpen,
  onClose,
  submissionId,
  candidateName,
  jobTitle,
  currentStatus,
  onSubmit,
}: StatusChangeModalProps) {
  const [formData, setFormData] = React.useState<StatusChangeFormData>({
    newStatus: currentStatus,
    notifyStakeholders: true,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        newStatus: currentStatus,
        notifyStakeholders: true,
      });
    }
  }, [isOpen, currentStatus]);

  const handleStatusChange = (status: SubmissionStatus) => {
    setFormData((prev) => ({
      ...prev,
      newStatus: status,
      // Clear status-specific fields when changing status
      rejectionReason: undefined,
      rejectionNotes: undefined,
      withdrawalReason: undefined,
      declineReason: undefined,
      offerAmount: undefined,
      startDate: undefined,
    }));
  };

  const isFormValid = (): boolean => {
    const { newStatus } = formData;

    if (newStatus === currentStatus) return false;

    switch (newStatus) {
      case "rejected":
        return Boolean(formData.rejectionReason);
      case "withdrawn":
        return Boolean(formData.withdrawalReason);
      case "offer_declined":
        return Boolean(formData.declineReason);
      case "offer_extended":
        return Boolean(formData.offerAmount && formData.startDate);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update status:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConfig = STATUS_CONFIG[currentStatus];
  const CurrentIcon = currentConfig.icon;

  // Get available next statuses based on current status
  const getAvailableStatuses = (): SubmissionStatus[] => {
    const transitions: Record<SubmissionStatus, SubmissionStatus[]> = {
      submitted: ["client_review", "rejected", "withdrawn"],
      client_review: ["client_interview", "rejected", "withdrawn"],
      client_interview: ["interviewing", "rejected", "withdrawn"],
      interviewing: ["offer_pending", "rejected", "withdrawn"],
      offer_pending: ["offer_extended", "rejected", "withdrawn"],
      offer_extended: ["offer_accepted", "offer_declined", "withdrawn"],
      offer_accepted: ["placed", "withdrawn"],
      offer_declined: [],
      placed: [],
      rejected: [],
      withdrawn: [],
    };
    return transitions[currentStatus] || [];
  };

  const availableStatuses = getAvailableStatuses();

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Submission Status"
      subtitle={`${candidateName} - ${jobTitle}`}
      size="md"
      closeOnEscape={!isSubmitting}
      closeOnOverlay={!isSubmitting}
      footer={
        <div className="flex gap-2">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md border border-input",
              "bg-background px-4 py-2 text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isSubmitting || !isFormValid()}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md",
              "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Update Status
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Current Status */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Status</label>
          <div
            className={cn(
              "flex items-center gap-2 rounded-md p-3",
              currentConfig.bgColor
            )}
          >
            <CurrentIcon className={cn("h-5 w-5", currentConfig.color)} />
            <span className={cn("font-medium", currentConfig.color)}>
              {currentConfig.label}
            </span>
          </div>
        </div>

        {/* New Status Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">New Status *</label>
          {availableStatuses.length === 0 ? (
            <p className="text-sm text-muted-foreground">
              No status changes available from current status.
            </p>
          ) : (
            <div className="grid gap-2 sm:grid-cols-2">
              {availableStatuses.map((status) => {
                const config = STATUS_CONFIG[status];
                const Icon = config.icon;
                return (
                  <button
                    key={status}
                    type="button"
                    onClick={() => handleStatusChange(status)}
                    className={cn(
                      "flex items-center gap-2 rounded-md border p-3 text-left",
                      "transition-colors hover:bg-muted/50",
                      formData.newStatus === status && "border-primary bg-primary/10"
                    )}
                  >
                    <Icon className={cn("h-5 w-5", config.color)} />
                    <span className="text-sm font-medium">{config.label}</span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Status-specific fields */}
        {formData.newStatus === "rejected" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Rejection Reason *</label>
              <select
                value={formData.rejectionReason || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rejectionReason: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select reason...</option>
                {REJECTION_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea
                value={formData.rejectionNotes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, rejectionNotes: e.target.value }))
                }
                placeholder="Detailed feedback for internal records..."
                className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        )}

        {formData.newStatus === "withdrawn" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Withdrawal Reason *</label>
            <select
              value={formData.withdrawalReason || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, withdrawalReason: e.target.value }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select reason...</option>
              {WITHDRAWAL_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.newStatus === "offer_declined" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Decline Reason *</label>
            <select
              value={formData.declineReason || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, declineReason: e.target.value }))
              }
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              <option value="">Select reason...</option>
              {DECLINE_REASONS.map((reason) => (
                <option key={reason} value={reason}>
                  {reason}
                </option>
              ))}
            </select>
          </div>
        )}

        {formData.newStatus === "offer_extended" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Offer Amount ($/hr) *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  value={formData.offerAmount || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      offerAmount: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 text-sm"
                  placeholder="0.00"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Proposed Start Date *</label>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                min={new Date().toISOString().split("T")[0]}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>
        )}

        {/* Interview outcome for interviewing status */}
        {formData.newStatus === "interviewing" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Interview Outcome</label>
            <div className="flex gap-2">
              {(["passed", "pending", "failed"] as const).map((outcome) => (
                <button
                  key={outcome}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, interviewOutcome: outcome }))
                  }
                  className={cn(
                    "flex-1 rounded-md border px-3 py-2 text-sm font-medium capitalize",
                    formData.interviewOutcome === outcome
                      ? "border-primary bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  )}
                >
                  {outcome}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Client feedback for client_review status */}
        {formData.newStatus === "client_interview" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Client Feedback</label>
            <textarea
              value={formData.clientFeedback || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, clientFeedback: e.target.value }))
              }
              placeholder="Client's feedback on the candidate..."
              className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
            />
          </div>
        )}

        {/* General notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Additional notes about this status change..."
            className="min-h-[60px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Notify stakeholders */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="notify-stakeholders"
            checked={formData.notifyStakeholders}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, notifyStakeholders: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="notify-stakeholders" className="text-sm">
            Notify stakeholders about this change
          </label>
        </div>
      </div>
    </Modal>
  );
}

export default StatusChangeModal;
