"use client";

import * as React from "react";
import { Loader2, Calendar, Clock, Plus, Trash2 } from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface ProposedTime {
  id: string;
  date: string;
  time: string;
}

interface CurrentSchedule {
  date: string;
  time: string;
  timezone: string;
  interviewType: string;
  interviewers: string[];
}

interface RescheduleFormData {
  reason: string;
  proposedTimes: ProposedTime[];
  notifyAttendees: boolean;
  updateCalendarInvites: boolean;
}

const RESCHEDULE_REASONS = [
  "Candidate requested",
  "Client requested",
  "Interviewer unavailable",
  "Scheduling conflict",
  "Emergency",
  "Other",
];

export interface RescheduleModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
  candidateName: string;
  currentSchedule: CurrentSchedule;
  onSubmit: (data: RescheduleFormData) => Promise<void>;
}

export function RescheduleModal({
  isOpen,
  onClose,
  interviewId,
  candidateName,
  currentSchedule,
  onSubmit,
}: RescheduleModalProps) {
  const [formData, setFormData] = React.useState<RescheduleFormData>({
    reason: "",
    proposedTimes: [
      { id: "1", date: "", time: "" },
      { id: "2", date: "", time: "" },
      { id: "3", date: "", time: "" },
    ],
    notifyAttendees: true,
    updateCalendarInvites: true,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        reason: "",
        proposedTimes: [
          { id: "1", date: "", time: "" },
          { id: "2", date: "", time: "" },
          { id: "3", date: "", time: "" },
        ],
        notifyAttendees: true,
        updateCalendarInvites: true,
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

  const isFormValid = (): boolean => {
    return (
      Boolean(formData.reason) &&
      formData.proposedTimes.some((t) => t.date && t.time)
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to reschedule:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reschedule Interview"
      subtitle={candidateName}
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
            Send Rescheduled Invites
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Current Schedule */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Schedule</label>
          <div className="rounded-md border bg-muted/50 p-3">
            <div className="flex items-center gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <span>
                {currentSchedule.date} at {currentSchedule.time}{" "}
                {currentSchedule.timezone}
              </span>
            </div>
            <div className="mt-1 text-sm text-muted-foreground">
              {currentSchedule.interviewType} with{" "}
              {currentSchedule.interviewers.join(", ")}
            </div>
          </div>
        </div>

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Reason for Reschedule *</label>
          <select
            value={formData.reason}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, reason: e.target.value }))
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Select reason...</option>
            {RESCHEDULE_REASONS.map((reason) => (
              <option key={reason} value={reason}>
                {reason}
              </option>
            ))}
          </select>
        </div>

        {/* New Proposed Times */}
        <div className="space-y-2">
          <label className="text-sm font-medium">New Proposed Times *</label>
          <p className="text-xs text-muted-foreground">
            Propose at least one new time slot
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

        {/* Options */}
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="notify-attendees"
              checked={formData.notifyAttendees}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notifyAttendees: e.target.checked }))
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="notify-attendees" className="text-sm">
              Notify all attendees
            </label>
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="update-calendar"
              checked={formData.updateCalendarInvites}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  updateCalendarInvites: e.target.checked,
                }))
              }
              className="h-4 w-4 rounded border-gray-300"
            />
            <label htmlFor="update-calendar" className="text-sm">
              Update calendar invites
            </label>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default RescheduleModal;
