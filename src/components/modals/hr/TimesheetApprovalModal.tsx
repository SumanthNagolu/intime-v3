"use client";

import * as React from "react";
import {
  Loader2,
  Check,
  X,
  RotateCcw,
  Clock,
  Calendar,
  User,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface TimeEntry {
  date: string;
  regularHours: number;
  overtimeHours: number;
  ptoHours: number;
  notes?: string;
}

interface TimesheetData {
  id: string;
  employeeId: string;
  employeeName: string;
  employeeTitle: string;
  department: string;
  periodStart: string;
  periodEnd: string;
  status: "pending" | "approved" | "rejected" | "revision_requested";
  entries: TimeEntry[];
  totalRegularHours: number;
  totalOvertimeHours: number;
  totalPtoHours: number;
  submittedAt: string;
}

type ApprovalAction = "approve" | "reject" | "request_revision";

interface ApprovalFormData {
  action: ApprovalAction;
  comments: string;
  adjustedEntries?: TimeEntry[];
}

export interface TimesheetApprovalModalProps {
  isOpen: boolean;
  onClose: () => void;
  timesheet: TimesheetData;
  onSubmit: (data: ApprovalFormData) => Promise<void>;
}

const DAYS_OF_WEEK = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function TimesheetApprovalModal({
  isOpen,
  onClose,
  timesheet,
  onSubmit,
}: TimesheetApprovalModalProps) {
  const [action, setAction] = React.useState<ApprovalAction | null>(null);
  const [comments, setComments] = React.useState("");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [selectedDay, setSelectedDay] = React.useState<string | null>(null);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setAction(null);
      setComments("");
      setSelectedDay(null);
    }
  }, [isOpen]);

  const handleSubmit = async () => {
    if (!action) return;

    setIsSubmitting(true);
    try {
      await onSubmit({
        action,
        comments,
      });
      onClose();
    } catch (error) {
      console.error("Failed to process timesheet:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
  };

  const getDayOfWeek = (dateStr: string) => {
    const date = new Date(dateStr);
    return DAYS_OF_WEEK[date.getDay()];
  };

  const isWeekend = (dateStr: string) => {
    const date = new Date(dateStr);
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  const totalHours = timesheet.totalRegularHours + timesheet.totalOvertimeHours;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Timesheet Approval"
      subtitle={`${timesheet.employeeName} - ${formatDate(timesheet.periodStart)} to ${formatDate(timesheet.periodEnd)}`}
      size="xl"
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
            disabled={isSubmitting || !action}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md px-4 py-2 text-sm font-medium",
              action === "approve" && "bg-green-600 text-white hover:bg-green-700",
              action === "reject" && "bg-red-600 text-white hover:bg-red-700",
              action === "request_revision" && "bg-yellow-600 text-white hover:bg-yellow-700",
              !action && "bg-primary text-primary-foreground hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {action === "approve" && "Approve Timesheet"}
            {action === "reject" && "Reject Timesheet"}
            {action === "request_revision" && "Request Revision"}
            {!action && "Select Action"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <div className="font-medium">{timesheet.employeeName}</div>
              <div className="text-sm text-muted-foreground">
                {timesheet.employeeTitle} • {timesheet.department}
              </div>
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Submitted</div>
            <div className="text-sm">
              {new Date(timesheet.submittedAt).toLocaleString()}
            </div>
          </div>
        </div>

        {/* Hours Summary */}
        <div className="grid gap-4 sm:grid-cols-4">
          <div className="rounded-md border p-3 text-center">
            <div className="text-2xl font-bold text-primary">{totalHours}</div>
            <div className="text-xs text-muted-foreground">Total Hours</div>
          </div>
          <div className="rounded-md border p-3 text-center">
            <div className="text-2xl font-bold">{timesheet.totalRegularHours}</div>
            <div className="text-xs text-muted-foreground">Regular</div>
          </div>
          <div className="rounded-md border p-3 text-center">
            <div className="text-2xl font-bold text-orange-600">{timesheet.totalOvertimeHours}</div>
            <div className="text-xs text-muted-foreground">Overtime</div>
          </div>
          <div className="rounded-md border p-3 text-center">
            <div className="text-2xl font-bold text-blue-600">{timesheet.totalPtoHours}</div>
            <div className="text-xs text-muted-foreground">PTO</div>
          </div>
        </div>

        {/* Calendar View */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4" />
            Daily Breakdown
          </div>
          <div className="rounded-md border overflow-hidden">
            <div className="grid grid-cols-7 gap-px bg-muted">
              {DAYS_OF_WEEK.map((day) => (
                <div
                  key={day}
                  className="bg-muted px-2 py-1 text-center text-xs font-medium text-muted-foreground"
                >
                  {day}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-px bg-muted">
              {timesheet.entries.map((entry) => {
                const totalDayHours = entry.regularHours + entry.overtimeHours + entry.ptoHours;
                const isSelected = selectedDay === entry.date;
                const weekend = isWeekend(entry.date);

                return (
                  <button
                    key={entry.date}
                    type="button"
                    onClick={() => setSelectedDay(isSelected ? null : entry.date)}
                    className={cn(
                      "relative bg-background p-2 text-left transition-colors",
                      "hover:bg-muted/50",
                      isSelected && "ring-2 ring-primary ring-inset",
                      weekend && "bg-muted/30"
                    )}
                  >
                    <div className="text-xs text-muted-foreground">{formatDate(entry.date)}</div>
                    <div className={cn("text-lg font-semibold", totalDayHours === 0 && "text-muted-foreground")}>
                      {totalDayHours || "-"}
                    </div>
                    {entry.overtimeHours > 0 && (
                      <div className="absolute bottom-1 right-1">
                        <span className="rounded bg-orange-100 px-1 text-[10px] text-orange-700">
                          +{entry.overtimeHours} OT
                        </span>
                      </div>
                    )}
                    {entry.ptoHours > 0 && (
                      <div className="absolute top-1 right-1">
                        <span className="rounded bg-blue-100 px-1 text-[10px] text-blue-700">
                          PTO
                        </span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Selected Day Details */}
        {selectedDay && (
          <div className="rounded-md border bg-muted/50 p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="font-medium">
                {getDayOfWeek(selectedDay)}, {formatDate(selectedDay)}
              </div>
              <button
                type="button"
                onClick={() => setSelectedDay(null)}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                Close
              </button>
            </div>
            {(() => {
              const entry = timesheet.entries.find((e) => e.date === selectedDay);
              if (!entry) return null;
              return (
                <div className="space-y-2">
                  <div className="grid gap-2 sm:grid-cols-3">
                    <div className="flex items-center gap-2">
                      <Clock className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">Regular: {entry.regularHours}h</span>
                    </div>
                    <div className="flex items-center gap-2 text-orange-600">
                      <Clock className="h-4 w-4" />
                      <span className="text-sm">Overtime: {entry.overtimeHours}h</span>
                    </div>
                    <div className="flex items-center gap-2 text-blue-600">
                      <Calendar className="h-4 w-4" />
                      <span className="text-sm">PTO: {entry.ptoHours}h</span>
                    </div>
                  </div>
                  {entry.notes && (
                    <div className="text-sm text-muted-foreground mt-2">
                      <span className="font-medium">Notes:</span> {entry.notes}
                    </div>
                  )}
                </div>
              );
            })()}
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Action *</label>
          <div className="grid gap-2 sm:grid-cols-3">
            <button
              type="button"
              onClick={() => setAction("approve")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border p-3 transition-colors",
                action === "approve"
                  ? "border-green-500 bg-green-50 text-green-700 dark:bg-green-900/20"
                  : "hover:bg-muted/50"
              )}
            >
              <Check className="h-5 w-5" />
              <span className="font-medium">Approve</span>
            </button>
            <button
              type="button"
              onClick={() => setAction("request_revision")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border p-3 transition-colors",
                action === "request_revision"
                  ? "border-yellow-500 bg-yellow-50 text-yellow-700 dark:bg-yellow-900/20"
                  : "hover:bg-muted/50"
              )}
            >
              <RotateCcw className="h-5 w-5" />
              <span className="font-medium">Request Revision</span>
            </button>
            <button
              type="button"
              onClick={() => setAction("reject")}
              className={cn(
                "flex items-center justify-center gap-2 rounded-md border p-3 transition-colors",
                action === "reject"
                  ? "border-red-500 bg-red-50 text-red-700 dark:bg-red-900/20"
                  : "hover:bg-muted/50"
              )}
            >
              <X className="h-5 w-5" />
              <span className="font-medium">Reject</span>
            </button>
          </div>
        </div>

        {/* Comments */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Comments {(action === "reject" || action === "request_revision") && "*"}
          </label>
          <textarea
            value={comments}
            onChange={(e) => setComments(e.target.value)}
            placeholder={
              action === "request_revision"
                ? "Explain what changes are needed..."
                : action === "reject"
                ? "Provide reason for rejection..."
                : "Add optional comments..."
            }
            className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
    </Modal>
  );
}

export default TimesheetApprovalModal;
