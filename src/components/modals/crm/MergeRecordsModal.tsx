"use client";

import * as React from "react";
import { Loader2, ArrowRight, Check, AlertTriangle } from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface RecordField {
  key: string;
  label: string;
  type: "text" | "email" | "phone" | "date" | "number";
}

interface MergeRecord {
  id: string;
  displayName: string;
  createdAt: string;
  [key: string]: unknown;
}

interface MergeRecordsFormData {
  primaryRecordId: string;
  secondaryRecordId: string;
  selectedFields: Record<string, "primary" | "secondary">;
  secondaryDisposition: "delete" | "archive";
}

export interface MergeRecordsModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: string;
  recordA: MergeRecord;
  recordB: MergeRecord;
  fields: RecordField[];
  onSubmit: (data: MergeRecordsFormData) => Promise<{ mergedRecordId: string }>;
}

export function MergeRecordsModal({
  isOpen,
  onClose,
  entityType,
  recordA,
  recordB,
  fields,
  onSubmit,
}: MergeRecordsModalProps) {
  const [primaryId, setPrimaryId] = React.useState(recordA.id);
  const [selectedFields, setSelectedFields] = React.useState<Record<string, "primary" | "secondary">>({});
  const [secondaryDisposition, setSecondaryDisposition] = React.useState<"delete" | "archive">("archive");
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const primaryRecord = primaryId === recordA.id ? recordA : recordB;
  const secondaryRecord = primaryId === recordA.id ? recordB : recordA;

  // Initialize selected fields (default to primary)
  React.useEffect(() => {
    if (isOpen) {
      const defaults: Record<string, "primary" | "secondary"> = {};
      fields.forEach((field) => {
        defaults[field.key] = "primary";
      });
      setSelectedFields(defaults);
      setPrimaryId(recordA.id);
    }
  }, [isOpen, fields, recordA.id]);

  const handleSelectField = (fieldKey: string, source: "primary" | "secondary") => {
    setSelectedFields((prev) => ({
      ...prev,
      [fieldKey]: source,
    }));
  };

  const handleSwapPrimary = () => {
    setPrimaryId((prev) => (prev === recordA.id ? recordB.id : recordA.id));
    // Swap all field selections
    setSelectedFields((prev) => {
      const swapped: Record<string, "primary" | "secondary"> = {};
      Object.entries(prev).forEach(([key, value]) => {
        swapped[key] = value === "primary" ? "secondary" : "primary";
      });
      return swapped;
    });
  };

  const getMergedPreview = () => {
    const merged: Record<string, unknown> = {};
    fields.forEach((field) => {
      const source = selectedFields[field.key] === "secondary" ? secondaryRecord : primaryRecord;
      merged[field.key] = source[field.key];
    });
    return merged;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit({
        primaryRecordId: primaryId,
        secondaryRecordId: secondaryRecord.id,
        selectedFields,
        secondaryDisposition,
      });
      onClose();
    } catch (error) {
      console.error("Failed to merge records:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatValue = (value: unknown): string => {
    if (value === null || value === undefined) return "(empty)";
    if (typeof value === "boolean") return value ? "Yes" : "No";
    if (typeof value === "number") return value.toLocaleString();
    return String(value);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Merge ${entityType}s`}
      subtitle="Select which values to keep for each field"
      size="2xl"
      closeOnEscape={!isSubmitting}
      closeOnOverlay={!isSubmitting}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
            This action cannot be undone
          </div>
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
              disabled={isSubmitting}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md",
                "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                "hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Merge Records
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Primary Record Selection */}
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-3">
          <div className="text-sm">
            <span className="font-medium">Primary record:</span>{" "}
            <span className="text-primary">{primaryRecord.displayName}</span>
          </div>
          <button
            type="button"
            onClick={handleSwapPrimary}
            className="flex items-center gap-1 text-sm text-primary hover:underline"
          >
            <ArrowRight className="h-4 w-4" />
            Swap primary
          </button>
        </div>

        {/* Field-by-field comparison */}
        <div className="space-y-1">
          {/* Header */}
          <div className="grid grid-cols-[1fr,2fr,2fr] gap-2 border-b pb-2 text-sm font-medium">
            <div>Field</div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-primary/10 px-2 py-0.5 text-xs text-primary">
                Primary
              </span>
              {primaryRecord.displayName}
            </div>
            <div className="flex items-center gap-2">
              <span className="rounded bg-muted px-2 py-0.5 text-xs">Secondary</span>
              {secondaryRecord.displayName}
            </div>
          </div>

          {/* Fields */}
          {fields.map((field) => {
            const primaryValue = primaryRecord[field.key];
            const secondaryValue = secondaryRecord[field.key];
            const isDifferent =
              formatValue(primaryValue) !== formatValue(secondaryValue);

            return (
              <div
                key={field.key}
                className={cn(
                  "grid grid-cols-[1fr,2fr,2fr] gap-2 rounded p-2",
                  isDifferent && "bg-yellow-50 dark:bg-yellow-900/10"
                )}
              >
                <div className="flex items-center text-sm font-medium">{field.label}</div>
                <button
                  type="button"
                  onClick={() => handleSelectField(field.key, "primary")}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm",
                    "transition-colors hover:bg-muted/50",
                    selectedFields[field.key] === "primary"
                      ? "border-primary bg-primary/5"
                      : "border-transparent"
                  )}
                >
                  <span
                    className={cn(
                      !primaryValue && "text-muted-foreground italic"
                    )}
                  >
                    {formatValue(primaryValue)}
                  </span>
                  {selectedFields[field.key] === "primary" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => handleSelectField(field.key, "secondary")}
                  className={cn(
                    "flex items-center justify-between rounded-md border px-3 py-2 text-left text-sm",
                    "transition-colors hover:bg-muted/50",
                    selectedFields[field.key] === "secondary"
                      ? "border-primary bg-primary/5"
                      : "border-transparent"
                  )}
                >
                  <span
                    className={cn(
                      !secondaryValue && "text-muted-foreground italic"
                    )}
                  >
                    {formatValue(secondaryValue)}
                  </span>
                  {selectedFields[field.key] === "secondary" && (
                    <Check className="h-4 w-4 text-primary" />
                  )}
                </button>
              </div>
            );
          })}
        </div>

        {/* Secondary Record Disposition */}
        <div className="space-y-2">
          <label className="text-sm font-medium">What to do with secondary record?</label>
          <div className="flex gap-2">
            {(["archive", "delete"] as const).map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => setSecondaryDisposition(option)}
                className={cn(
                  "rounded-md border px-4 py-2 text-sm font-medium capitalize",
                  secondaryDisposition === option
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted/50"
                )}
              >
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Merged Record Preview</label>
          <div className="max-h-[150px] overflow-auto rounded-md border bg-muted/50 p-3">
            <dl className="space-y-1 text-sm">
              {fields.map((field) => {
                const preview = getMergedPreview();
                return (
                  <div key={field.key} className="flex gap-2">
                    <dt className="text-muted-foreground">{field.label}:</dt>
                    <dd className="font-medium">{formatValue(preview[field.key])}</dd>
                  </div>
                );
              })}
            </dl>
          </div>
        </div>
      </div>
    </Modal>
  );
}

export default MergeRecordsModal;
