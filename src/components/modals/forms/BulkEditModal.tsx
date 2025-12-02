"use client";

import * as React from "react";
import { Loader2, ChevronDown, ChevronRight, Check, AlertCircle } from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

export interface BulkEditField {
  id: string;
  label: string;
  type: "text" | "select" | "date" | "number";
  options?: { value: string; label: string }[];
  placeholder?: string;
}

export interface BulkEditRecord {
  id: string;
  displayName: string;
  [key: string]: unknown;
}

export interface BulkEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  records: BulkEditRecord[];
  availableFields: BulkEditField[];
  onSubmit: (
    selectedFields: Record<string, unknown>,
    recordIds: string[]
  ) => Promise<{ success: number; failed: number }>;
}

export function BulkEditModal({
  isOpen,
  onClose,
  title = "Bulk Edit",
  records,
  availableFields,
  onSubmit,
}: BulkEditModalProps) {
  const [selectedFields, setSelectedFields] = React.useState<Set<string>>(new Set());
  const [fieldValues, setFieldValues] = React.useState<Record<string, unknown>>({});
  const [showPreview, setShowPreview] = React.useState(false);
  const [step, setStep] = React.useState<"fields" | "preview" | "progress">("fields");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [result, setResult] = React.useState<{ success: number; failed: number } | null>(
    null
  );

  // Reset state when modal opens
  React.useEffect(() => {
    if (isOpen) {
      setSelectedFields(new Set());
      setFieldValues({});
      setShowPreview(false);
      setStep("fields");
      setResult(null);
    }
  }, [isOpen]);

  const handleToggleField = (fieldId: string) => {
    setSelectedFields((prev) => {
      const next = new Set(prev);
      if (next.has(fieldId)) {
        next.delete(fieldId);
        // Also clear the value
        setFieldValues((fv) => {
          const updated = { ...fv };
          delete updated[fieldId];
          return updated;
        });
      } else {
        next.add(fieldId);
      }
      return next;
    });
  };

  const handleFieldValueChange = (fieldId: string, value: unknown) => {
    setFieldValues((prev) => ({ ...prev, [fieldId]: value }));
  };

  const handlePreview = () => {
    setStep("preview");
    setShowPreview(true);
  };

  const handleBack = () => {
    setStep("fields");
    setShowPreview(false);
  };

  const handleSubmit = async () => {
    if (selectedFields.size === 0) return;

    setStep("progress");
    setIsSubmitting(true);

    try {
      const updates: Record<string, unknown> = {};
      selectedFields.forEach((fieldId) => {
        updates[fieldId] = fieldValues[fieldId];
      });

      const result = await onSubmit(
        updates,
        records.map((r) => r.id)
      );
      setResult(result);
    } catch (error) {
      console.error("Bulk edit failed:", error);
      setResult({ success: 0, failed: records.length });
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderFieldInput = (field: BulkEditField) => {
    const baseInputClass = cn(
      "flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm",
      "ring-offset-background placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50"
    );

    switch (field.type) {
      case "select":
        return (
          <select
            value={(fieldValues[field.id] as string) || ""}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            className={baseInputClass}
          >
            <option value="">Select...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );
      default:
        return (
          <input
            type={field.type}
            value={(fieldValues[field.id] as string) || ""}
            onChange={(e) => handleFieldValueChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
          />
        );
    }
  };

  const renderFieldSelection = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-md bg-muted p-3 text-sm">
        <span className="font-medium">{records.length}</span>
        <span className="text-muted-foreground">records selected</span>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-medium">Select fields to update</h4>
        <p className="text-xs text-muted-foreground">
          Choose which fields you want to modify for all selected records
        </p>
      </div>

      <div className="space-y-2">
        {availableFields.map((field) => (
          <div
            key={field.id}
            className={cn(
              "rounded-md border p-3 transition-colors",
              selectedFields.has(field.id)
                ? "border-primary bg-primary/5"
                : "border-border hover:bg-muted/50"
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id={`field-${field.id}`}
                checked={selectedFields.has(field.id)}
                onChange={() => handleToggleField(field.id)}
                className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              />
              <label
                htmlFor={`field-${field.id}`}
                className="flex-1 cursor-pointer text-sm font-medium"
              >
                {field.label}
              </label>
            </div>

            {selectedFields.has(field.id) && (
              <div className="ml-7 mt-3">{renderFieldInput(field)}</div>
            )}
          </div>
        ))}
      </div>
    </div>
  );

  const renderPreview = () => (
    <div className="space-y-4">
      <div className="flex items-center gap-2 rounded-md bg-yellow-50 p-3 text-sm text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-200">
        <AlertCircle className="h-4 w-4" />
        <span>Review changes before applying to {records.length} records</span>
      </div>

      <div className="space-y-1">
        <h4 className="text-sm font-medium">Changes to apply</h4>
        <div className="rounded-md border">
          {Array.from(selectedFields).map((fieldId) => {
            const field = availableFields.find((f) => f.id === fieldId);
            if (!field) return null;
            const value = fieldValues[fieldId];
            const displayValue =
              field.type === "select"
                ? field.options?.find((o) => o.value === value)?.label || value
                : value;

            return (
              <div
                key={fieldId}
                className="flex items-center justify-between border-b p-3 last:border-b-0"
              >
                <span className="text-sm font-medium">{field.label}</span>
                <span className="text-sm text-muted-foreground">
                  {String(displayValue) || "(empty)"}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div className="space-y-1">
        <button
          type="button"
          onClick={() => setShowPreview(!showPreview)}
          className="flex items-center gap-1 text-sm font-medium text-muted-foreground hover:text-foreground"
        >
          {showPreview ? (
            <ChevronDown className="h-4 w-4" />
          ) : (
            <ChevronRight className="h-4 w-4" />
          )}
          Affected records ({records.length})
        </button>
        {showPreview && (
          <div className="max-h-[200px] overflow-auto rounded-md border">
            {records.map((record, index) => (
              <div
                key={record.id}
                className={cn(
                  "px-3 py-2 text-sm",
                  index % 2 === 0 ? "bg-muted/50" : ""
                )}
              >
                {record.displayName}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  const renderProgress = () => (
    <div className="flex flex-col items-center justify-center py-8">
      {isSubmitting ? (
        <>
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
          <p className="mt-4 text-sm text-muted-foreground">
            Updating {records.length} records...
          </p>
        </>
      ) : result ? (
        <>
          <div
            className={cn(
              "flex h-12 w-12 items-center justify-center rounded-full",
              result.failed === 0 ? "bg-green-100" : "bg-yellow-100"
            )}
          >
            {result.failed === 0 ? (
              <Check className="h-6 w-6 text-green-600" />
            ) : (
              <AlertCircle className="h-6 w-6 text-yellow-600" />
            )}
          </div>
          <p className="mt-4 text-sm font-medium">
            {result.success} of {records.length} records updated
          </p>
          {result.failed > 0 && (
            <p className="mt-1 text-sm text-muted-foreground">
              {result.failed} records failed to update
            </p>
          )}
        </>
      ) : null}
    </div>
  );

  const getFooter = () => {
    if (step === "progress" && !isSubmitting) {
      return (
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-md",
            "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
            "hover:bg-primary/90"
          )}
        >
          Done
        </button>
      );
    }

    if (step === "preview") {
      return (
        <div className="flex w-full justify-between">
          <button
            type="button"
            onClick={handleBack}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md border border-input",
              "bg-background px-4 py-2 text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground"
            )}
          >
            Back
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md",
              "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90"
            )}
          >
            Confirm & Update {records.length} Records
          </button>
        </div>
      );
    }

    return (
      <div className="flex gap-2">
        <button
          type="button"
          onClick={onClose}
          className={cn(
            "inline-flex h-10 items-center justify-center rounded-md border border-input",
            "bg-background px-4 py-2 text-sm font-medium",
            "hover:bg-accent hover:text-accent-foreground"
          )}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handlePreview}
          disabled={selectedFields.size === 0}
          className={cn(
            "inline-flex h-10 items-center justify-center gap-2 rounded-md",
            "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
            "hover:bg-primary/90",
            "disabled:cursor-not-allowed disabled:opacity-50"
          )}
        >
          Preview Changes
        </button>
      </div>
    );
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={step === "progress" && isSubmitting ? () => {} : onClose}
      title={title}
      subtitle={`Update ${records.length} records at once`}
      size="lg"
      closeOnEscape={step !== "progress"}
      closeOnOverlay={step !== "progress"}
      footer={getFooter()}
    >
      {step === "fields" && renderFieldSelection()}
      {step === "preview" && renderPreview()}
      {step === "progress" && renderProgress()}
    </Modal>
  );
}

export default BulkEditModal;
