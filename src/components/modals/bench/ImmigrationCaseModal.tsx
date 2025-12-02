"use client";

import * as React from "react";
import {
  Loader2,
  Upload,
  Calendar,
  AlertTriangle,
  Bell,
  FileText,
  Plus,
  X,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

type VisaType =
  | "h1b"
  | "h1b_transfer"
  | "opt"
  | "opt_stem"
  | "gc_ead"
  | "h4_ead"
  | "l1a"
  | "l1b"
  | "tn"
  | "gc"
  | "usc"
  | "canada_pr"
  | "canada_owp"
  | "canada_closed";

type CaseStatus = "pending" | "filed" | "rfe" | "approved" | "denied" | "expired";

interface Attorney {
  id: string;
  name: string;
  firm: string;
}

interface Milestone {
  id: string;
  label: string;
  date?: string;
  completed: boolean;
}

interface Document {
  id: string;
  type: string;
  fileName: string;
  uploadedAt: string;
}

interface ImmigrationCaseFormData {
  consultantId: string;
  visaType: VisaType;
  caseStatus: CaseStatus;
  filingDate?: string;
  approvalDate?: string;
  expiryDate?: string;
  attorneyId?: string;
  receiptNumber?: string;
  milestones: Milestone[];
  documents: Document[];
  alertDays: number[];
  notes?: string;
}

const VISA_TYPES: { value: VisaType; label: string; category: "us" | "canada" }[] = [
  { value: "h1b", label: "H-1B", category: "us" },
  { value: "h1b_transfer", label: "H-1B Transfer", category: "us" },
  { value: "opt", label: "OPT", category: "us" },
  { value: "opt_stem", label: "OPT STEM", category: "us" },
  { value: "gc_ead", label: "GC-EAD (I-485 Pending)", category: "us" },
  { value: "h4_ead", label: "H4-EAD", category: "us" },
  { value: "l1a", label: "L-1A", category: "us" },
  { value: "l1b", label: "L-1B", category: "us" },
  { value: "tn", label: "TN", category: "us" },
  { value: "gc", label: "Green Card", category: "us" },
  { value: "usc", label: "US Citizen", category: "us" },
  { value: "canada_pr", label: "Canada PR", category: "canada" },
  { value: "canada_owp", label: "Canada Open Work Permit", category: "canada" },
  { value: "canada_closed", label: "Canada Closed Work Permit", category: "canada" },
];

const CASE_STATUSES: { value: CaseStatus; label: string; color: string }[] = [
  { value: "pending", label: "Pending", color: "bg-gray-100 text-gray-800" },
  { value: "filed", label: "Filed", color: "bg-blue-100 text-blue-800" },
  { value: "rfe", label: "RFE Received", color: "bg-yellow-100 text-yellow-800" },
  { value: "approved", label: "Approved", color: "bg-green-100 text-green-800" },
  { value: "denied", label: "Denied", color: "bg-red-100 text-red-800" },
  { value: "expired", label: "Expired", color: "bg-orange-100 text-orange-800" },
];

const DEFAULT_MILESTONES: Milestone[] = [
  { id: "1", label: "Case Initiated", completed: false },
  { id: "2", label: "Documents Collected", completed: false },
  { id: "3", label: "LCA Filed (if H-1B)", completed: false },
  { id: "4", label: "Petition Filed", completed: false },
  { id: "5", label: "Receipt Notice Received", completed: false },
  { id: "6", label: "Approval Notice Received", completed: false },
];

export interface ImmigrationCaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  consultantId: string;
  consultantName: string;
  existingCase?: Partial<ImmigrationCaseFormData>;
  attorneys: Attorney[];
  onSubmit: (data: ImmigrationCaseFormData) => Promise<void>;
  onUploadDocument?: (file: File) => Promise<Document>;
}

export function ImmigrationCaseModal({
  isOpen,
  onClose,
  consultantId,
  consultantName,
  existingCase,
  attorneys,
  onSubmit,
  onUploadDocument,
}: ImmigrationCaseModalProps) {
  const [formData, setFormData] = React.useState<ImmigrationCaseFormData>({
    consultantId,
    visaType: "h1b",
    caseStatus: "pending",
    milestones: DEFAULT_MILESTONES,
    documents: [],
    alertDays: [30, 60, 90],
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isUploading, setIsUploading] = React.useState(false);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        consultantId,
        visaType: existingCase?.visaType || "h1b",
        caseStatus: existingCase?.caseStatus || "pending",
        filingDate: existingCase?.filingDate,
        approvalDate: existingCase?.approvalDate,
        expiryDate: existingCase?.expiryDate,
        attorneyId: existingCase?.attorneyId,
        receiptNumber: existingCase?.receiptNumber,
        milestones: existingCase?.milestones || DEFAULT_MILESTONES,
        documents: existingCase?.documents || [],
        alertDays: existingCase?.alertDays || [30, 60, 90],
        notes: existingCase?.notes,
      });
    }
  }, [isOpen, consultantId, existingCase]);

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !onUploadDocument) return;

    setIsUploading(true);
    try {
      const doc = await onUploadDocument(file);
      setFormData((prev) => ({
        ...prev,
        documents: [...prev.documents, doc],
      }));
    } catch (error) {
      console.error("Failed to upload document:", error);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveDocument = (docId: string) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.filter((d) => d.id !== docId),
    }));
  };

  const handleToggleMilestone = (milestoneId: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) =>
        m.id === milestoneId
          ? { ...m, completed: !m.completed, date: !m.completed ? new Date().toISOString() : undefined }
          : m
      ),
    }));
  };

  const handleAddMilestone = () => {
    setFormData((prev) => ({
      ...prev,
      milestones: [
        ...prev.milestones,
        { id: String(Date.now()), label: "", completed: false },
      ],
    }));
  };

  const handleUpdateMilestoneLabel = (id: string, label: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.map((m) => (m.id === id ? { ...m, label } : m)),
    }));
  };

  const handleRemoveMilestone = (id: string) => {
    setFormData((prev) => ({
      ...prev,
      milestones: prev.milestones.filter((m) => m.id !== id),
    }));
  };

  const handleToggleAlert = (days: number) => {
    setFormData((prev) => ({
      ...prev,
      alertDays: prev.alertDays.includes(days)
        ? prev.alertDays.filter((d) => d !== days)
        : [...prev.alertDays, days].sort((a, b) => b - a),
    }));
  };

  const isFormValid = (): boolean => {
    return Boolean(formData.visaType && formData.caseStatus);
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to save case:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Calculate days until expiry
  const daysUntilExpiry = formData.expiryDate
    ? Math.ceil(
        (new Date(formData.expiryDate).getTime() - new Date().getTime()) /
          (1000 * 60 * 60 * 24)
      )
    : null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={existingCase ? "Edit Immigration Case" : "Create Immigration Case"}
      subtitle={consultantName}
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
            disabled={isSubmitting || !isFormValid()}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md",
              "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {existingCase ? "Save Changes" : "Create Case"}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Expiry Warning */}
        {daysUntilExpiry !== null && daysUntilExpiry <= 90 && (
          <div
            className={cn(
              "flex items-center gap-2 rounded-md p-3 text-sm",
              daysUntilExpiry <= 30
                ? "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-200"
                : daysUntilExpiry <= 60
                  ? "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-200"
                  : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-200"
            )}
          >
            <AlertTriangle className="h-4 w-4" />
            {daysUntilExpiry <= 0
              ? "Work authorization has expired!"
              : `Work authorization expires in ${daysUntilExpiry} days`}
          </div>
        )}

        <div className="grid gap-6 sm:grid-cols-2">
          {/* Left Column */}
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Visa/Work Authorization Type *</label>
              <select
                value={formData.visaType}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, visaType: e.target.value as VisaType }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <optgroup label="US Work Authorization">
                  {VISA_TYPES.filter((v) => v.category === "us").map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
                <optgroup label="Canada Work Authorization">
                  {VISA_TYPES.filter((v) => v.category === "canada").map((type) => (
                    <option key={type.value} value={type.value}>
                      {type.label}
                    </option>
                  ))}
                </optgroup>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Case Status *</label>
              <div className="flex flex-wrap gap-2">
                {CASE_STATUSES.map((status) => (
                  <button
                    key={status.value}
                    type="button"
                    onClick={() =>
                      setFormData((prev) => ({ ...prev, caseStatus: status.value }))
                    }
                    className={cn(
                      "rounded-full px-3 py-1 text-xs font-medium transition-colors",
                      formData.caseStatus === status.value
                        ? status.color
                        : "bg-muted hover:bg-muted/80"
                    )}
                  >
                    {status.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">Filing Date</label>
                <div className="relative">
                  <Calendar className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <input
                    type="date"
                    value={formData.filingDate || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, filingDate: e.target.value }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Approval Date</label>
                <input
                  type="date"
                  value={formData.approvalDate || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, approvalDate: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">Expiry Date</label>
                <input
                  type="date"
                  value={formData.expiryDate || ""}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, expiryDate: e.target.value }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Attorney</label>
              <select
                value={formData.attorneyId || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, attorneyId: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select attorney...</option>
                {attorneys.map((attorney) => (
                  <option key={attorney.id} value={attorney.id}>
                    {attorney.name} - {attorney.firm}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Receipt Number</label>
              <input
                type="text"
                value={formData.receiptNumber || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, receiptNumber: e.target.value }))
                }
                placeholder="e.g., EAC-XX-XXX-XXXXX"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>

          {/* Right Column */}
          <div className="space-y-4">
            {/* Milestones */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Timeline Milestones</label>
              <div className="max-h-[200px] space-y-2 overflow-auto">
                {formData.milestones.map((milestone) => (
                  <div key={milestone.id} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={milestone.completed}
                      onChange={() => handleToggleMilestone(milestone.id)}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <input
                      type="text"
                      value={milestone.label}
                      onChange={(e) =>
                        handleUpdateMilestoneLabel(milestone.id, e.target.value)
                      }
                      placeholder="Milestone description"
                      className={cn(
                        "h-8 flex-1 rounded-md border border-input bg-background px-2 text-sm",
                        milestone.completed && "line-through text-muted-foreground"
                      )}
                    />
                    <button
                      type="button"
                      onClick={() => handleRemoveMilestone(milestone.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              <button
                type="button"
                onClick={handleAddMilestone}
                className="flex items-center gap-1 text-sm text-primary hover:underline"
              >
                <Plus className="h-4 w-4" />
                Add Milestone
              </button>
            </div>

            {/* Documents */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Documents</label>
              <div className="space-y-2">
                {formData.documents.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex items-center justify-between rounded-md border p-2"
                  >
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="text-sm">{doc.fileName}</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleRemoveDocument(doc.id)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
              {onUploadDocument && (
                <label className="cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.jpg,.png"
                    onChange={handleFileUpload}
                    className="hidden"
                  />
                  <div className="flex items-center gap-1 text-sm text-primary hover:underline">
                    {isUploading ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      <Upload className="h-4 w-4" />
                    )}
                    Upload Document
                  </div>
                </label>
              )}
            </div>

            {/* Alert Reminders */}
            <div className="space-y-2">
              <label className="text-sm font-medium">
                <Bell className="mr-1 inline h-4 w-4" />
                Alert Reminders (days before expiry)
              </label>
              <div className="flex flex-wrap gap-2">
                {[30, 60, 90, 120, 180].map((days) => (
                  <button
                    key={days}
                    type="button"
                    onClick={() => handleToggleAlert(days)}
                    className={cn(
                      "rounded-md border px-3 py-1 text-sm",
                      formData.alertDays.includes(days)
                        ? "border-primary bg-primary/10 text-primary"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {days} days
                  </button>
                ))}
              </div>
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Notes</label>
              <textarea
                value={formData.notes || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, notes: e.target.value }))
                }
                placeholder="Additional notes about this case..."
                className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default ImmigrationCaseModal;
