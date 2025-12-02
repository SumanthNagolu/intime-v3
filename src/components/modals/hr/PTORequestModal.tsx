"use client";

import * as React from "react";
import {
  Loader2,
  Calendar,
  Sun,
  Briefcase,
  Heart,
  Clock,
  AlertCircle,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

type PTOType = "vacation" | "sick" | "personal" | "bereavement" | "jury_duty" | "other";

interface PTOBalance {
  type: PTOType;
  label: string;
  available: number;
  used: number;
  pending: number;
  accrual?: number;
}

interface PTORequestFormData {
  type: PTOType;
  startDate: string;
  endDate: string;
  halfDayStart: boolean;
  halfDayEnd: boolean;
  reason: string;
  emergencyContact?: string;
}

interface BlockedDate {
  date: string;
  reason: string;
}

export interface PTORequestModalProps {
  isOpen: boolean;
  onClose: () => void;
  employeeId: string;
  employeeName: string;
  balances: PTOBalance[];
  blockedDates?: BlockedDate[];
  onSubmit: (data: PTORequestFormData) => Promise<{ requestId: string }>;
}

const PTO_TYPE_CONFIG: Record<PTOType, { label: string; icon: React.ReactNode; color: string }> = {
  vacation: {
    label: "Vacation",
    icon: <Sun className="h-4 w-4" />,
    color: "text-yellow-600",
  },
  sick: {
    label: "Sick Leave",
    icon: <Heart className="h-4 w-4" />,
    color: "text-red-600",
  },
  personal: {
    label: "Personal",
    icon: <Calendar className="h-4 w-4" />,
    color: "text-blue-600",
  },
  bereavement: {
    label: "Bereavement",
    icon: <Heart className="h-4 w-4" />,
    color: "text-gray-600",
  },
  jury_duty: {
    label: "Jury Duty",
    icon: <Briefcase className="h-4 w-4" />,
    color: "text-purple-600",
  },
  other: {
    label: "Other",
    icon: <Clock className="h-4 w-4" />,
    color: "text-muted-foreground",
  },
};

export function PTORequestModal({
  isOpen,
  onClose,
  employeeId,
  employeeName,
  balances,
  blockedDates = [],
  onSubmit,
}: PTORequestModalProps) {
  const [formData, setFormData] = React.useState<PTORequestFormData>({
    type: "vacation",
    startDate: "",
    endDate: "",
    halfDayStart: false,
    halfDayEnd: false,
    reason: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      setFormData({
        type: "vacation",
        startDate: tomorrow.toISOString().split("T")[0],
        endDate: tomorrow.toISOString().split("T")[0],
        halfDayStart: false,
        halfDayEnd: false,
        reason: "",
      });
      setErrors({});
    }
  }, [isOpen]);

  // Calculate days requested
  const calculateDays = (): number => {
    if (!formData.startDate || !formData.endDate) return 0;

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);

    if (end < start) return 0;

    let businessDays = 0;
    const current = new Date(start);

    while (current <= end) {
      const dayOfWeek = current.getDay();
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        businessDays++;
      }
      current.setDate(current.getDate() + 1);
    }

    // Adjust for half days
    if (formData.halfDayStart && businessDays > 0) businessDays -= 0.5;
    if (formData.halfDayEnd && businessDays > 0) businessDays -= 0.5;

    return businessDays;
  };

  const daysRequested = calculateDays();

  // Get current balance for selected type
  const currentBalance = balances.find((b) => b.type === formData.type);
  const availableBalance = currentBalance ? currentBalance.available - currentBalance.pending : 0;
  const hasEnoughBalance = daysRequested <= availableBalance;

  // Check for blocked dates
  const checkBlockedDates = (): BlockedDate[] => {
    if (!formData.startDate || !formData.endDate) return [];

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const blocked: BlockedDate[] = [];

    const current = new Date(start);
    while (current <= end) {
      const dateStr = current.toISOString().split("T")[0];
      const blockedDate = blockedDates.find((b) => b.date === dateStr);
      if (blockedDate) {
        blocked.push(blockedDate);
      }
      current.setDate(current.getDate() + 1);
    }

    return blocked;
  };

  const conflictingDates = checkBlockedDates();

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) newErrors.startDate = "Required";
    if (!formData.endDate) newErrors.endDate = "Required";
    if (formData.endDate < formData.startDate) {
      newErrors.endDate = "End date must be after start date";
    }
    if (!hasEnoughBalance) {
      newErrors.balance = "Insufficient PTO balance";
    }
    if (conflictingDates.length > 0) {
      newErrors.dates = "Selected dates conflict with blackout periods";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to submit PTO request:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Request Time Off"
      subtitle={employeeName}
      size="lg"
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
            disabled={isSubmitting || !hasEnoughBalance || conflictingDates.length > 0}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md",
              "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            Submit Request
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Balance Cards */}
        <div className="grid gap-3 sm:grid-cols-3">
          {balances.slice(0, 3).map((balance) => {
            const config = PTO_TYPE_CONFIG[balance.type];
            const isSelected = formData.type === balance.type;

            return (
              <button
                key={balance.type}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, type: balance.type }))}
                className={cn(
                  "rounded-md border p-3 text-left transition-colors",
                  isSelected ? "border-primary bg-primary/5" : "hover:bg-muted/50"
                )}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className={config.color}>{config.icon}</span>
                  <span className="text-sm font-medium">{balance.label}</span>
                </div>
                <div className="text-2xl font-bold">{balance.available}</div>
                <div className="text-xs text-muted-foreground">
                  {balance.pending > 0 && (
                    <span className="text-yellow-600">({balance.pending} pending) </span>
                  )}
                  days available
                </div>
              </button>
            );
          })}
        </div>

        {/* Additional PTO Types */}
        {balances.length > 3 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Other Time Off Types</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData((prev) => ({ ...prev, type: e.target.value as PTOType }))}
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            >
              {balances.map((balance) => (
                <option key={balance.type} value={balance.type}>
                  {balance.label} ({balance.available} days available)
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Date Selection */}
        <div className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date *</label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => {
                  setFormData((prev) => ({
                    ...prev,
                    startDate: e.target.value,
                    endDate: prev.endDate < e.target.value ? e.target.value : prev.endDate,
                  }));
                }}
                min={new Date().toISOString().split("T")[0]}
                className={cn(
                  "h-10 w-full rounded-md border bg-background px-3 text-sm",
                  errors.startDate ? "border-red-500" : "border-input"
                )}
              />
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="half-day-start"
                  checked={formData.halfDayStart}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, halfDayStart: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="half-day-start" className="text-sm text-muted-foreground">
                  Half day (afternoon only)
                </label>
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">End Date *</label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, endDate: e.target.value }))
                }
                min={formData.startDate || new Date().toISOString().split("T")[0]}
                className={cn(
                  "h-10 w-full rounded-md border bg-background px-3 text-sm",
                  errors.endDate ? "border-red-500" : "border-input"
                )}
              />
              {errors.endDate && (
                <span className="text-xs text-red-500">{errors.endDate}</span>
              )}
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="half-day-end"
                  checked={formData.halfDayEnd}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, halfDayEnd: e.target.checked }))
                  }
                  className="h-4 w-4 rounded border-gray-300"
                />
                <label htmlFor="half-day-end" className="text-sm text-muted-foreground">
                  Half day (morning only)
                </label>
              </div>
            </div>
          </div>

          {/* Days Calculation */}
          <div className="rounded-md border bg-muted/50 p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm font-medium">Business Days Requested</div>
                <div className="text-xs text-muted-foreground">
                  Excludes weekends
                </div>
              </div>
              <div className="text-right">
                <div className={cn("text-2xl font-bold", !hasEnoughBalance && "text-red-600")}>
                  {daysRequested}
                </div>
                <div className="text-xs text-muted-foreground">
                  of {availableBalance} available
                </div>
              </div>
            </div>
            {!hasEnoughBalance && (
              <div className="mt-2 flex items-center gap-2 text-sm text-red-600">
                <AlertCircle className="h-4 w-4" />
                Insufficient balance for this request
              </div>
            )}
          </div>
        </div>

        {/* Blocked Dates Warning */}
        {conflictingDates.length > 0 && (
          <div className="rounded-md border border-red-200 bg-red-50 p-3 dark:border-red-800 dark:bg-red-900/20">
            <div className="flex items-start gap-2 text-sm text-red-800 dark:text-red-200">
              <AlertCircle className="h-4 w-4 mt-0.5" />
              <div>
                <div className="font-medium">Blackout Period Conflict</div>
                <ul className="mt-1 list-inside list-disc text-xs">
                  {conflictingDates.map((blocked) => (
                    <li key={blocked.date}>
                      {new Date(blocked.date).toLocaleDateString()}: {blocked.reason}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <label className="text-sm font-medium">
            Reason {formData.type === "other" && "*"}
          </label>
          <textarea
            value={formData.reason}
            onChange={(e) => setFormData((prev) => ({ ...prev, reason: e.target.value }))}
            placeholder="Optional: Add notes or context for your request..."
            className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Emergency Contact for extended leave */}
        {daysRequested > 5 && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Emergency Contact</label>
            <input
              type="text"
              value={formData.emergencyContact || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, emergencyContact: e.target.value }))
              }
              placeholder="Phone number for emergencies during your leave"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
            <p className="text-xs text-muted-foreground">
              Recommended for requests over 5 business days
            </p>
          </div>
        )}

        {/* Balance Impact Preview */}
        {currentBalance && daysRequested > 0 && hasEnoughBalance && (
          <div className="rounded-md border p-3">
            <div className="text-sm font-medium mb-2">Balance After Approval</div>
            <div className="grid gap-2 sm:grid-cols-3 text-sm">
              <div>
                <span className="text-muted-foreground">Current:</span>{" "}
                <span className="font-medium">{currentBalance.available} days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Requested:</span>{" "}
                <span className="font-medium text-yellow-600">-{daysRequested} days</span>
              </div>
              <div>
                <span className="text-muted-foreground">Remaining:</span>{" "}
                <span className="font-medium text-green-600">
                  {currentBalance.available - daysRequested} days
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
}

export default PTORequestModal;
