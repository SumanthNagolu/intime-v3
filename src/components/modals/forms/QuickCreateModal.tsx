"use client";

import * as React from "react";
import { Loader2, Plus, ExternalLink } from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

export type QuickCreateEntityType =
  | "job"
  | "candidate"
  | "contact"
  | "lead"
  | "deal"
  | "task"
  | "activity"
  | "account"
  | "consultant";

export interface QuickCreateField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "number" | "select" | "textarea" | "date";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  defaultValue?: string;
}

export interface QuickCreateModalProps {
  isOpen: boolean;
  onClose: () => void;
  entityType: QuickCreateEntityType;
  title?: string;
  fields: QuickCreateField[];
  onSubmit: (data: Record<string, unknown>) => Promise<{ id: string } | void>;
  onCreateAndOpen?: (id: string) => void;
}

const entityLabels: Record<QuickCreateEntityType, string> = {
  job: "Job",
  candidate: "Candidate",
  contact: "Contact",
  lead: "Lead",
  deal: "Deal",
  task: "Task",
  activity: "Activity",
  account: "Account",
  consultant: "Consultant",
};

export function QuickCreateModal({
  isOpen,
  onClose,
  entityType,
  title,
  fields,
  onSubmit,
  onCreateAndOpen,
}: QuickCreateModalProps) {
  const [formData, setFormData] = React.useState<Record<string, unknown>>({});
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [submitAction, setSubmitAction] = React.useState<"close" | "open">("close");

  // Initialize form data with defaults
  React.useEffect(() => {
    if (isOpen) {
      const defaults: Record<string, unknown> = {};
      fields.forEach((field) => {
        if (field.defaultValue) {
          defaults[field.id] = field.defaultValue;
        }
      });
      setFormData(defaults);
      setErrors({});
    }
  }, [isOpen, fields]);

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => ({ ...prev, [fieldId]: value }));
    // Clear error when user types
    if (errors[fieldId]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[fieldId];
        return next;
      });
    }
  };

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    fields.forEach((field) => {
      if (field.required && !formData[field.id]) {
        newErrors[field.id] = `${field.label} is required`;
      }
      if (field.type === "email" && formData[field.id]) {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(formData[field.id] as string)) {
          newErrors[field.id] = "Invalid email address";
        }
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (action: "close" | "open") => {
    if (!validate()) return;

    setIsSubmitting(true);
    setSubmitAction(action);

    try {
      const result = await onSubmit(formData);
      if (action === "open" && result?.id && onCreateAndOpen) {
        onCreateAndOpen(result.id);
      }
      onClose();
    } catch (error) {
      console.error("Failed to create:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderField = (field: QuickCreateField) => {
    const baseInputClass = cn(
      "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm",
      "ring-offset-background placeholder:text-muted-foreground",
      "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
      "disabled:cursor-not-allowed disabled:opacity-50",
      errors[field.id] && "border-red-500 focus:ring-red-500"
    );

    switch (field.type) {
      case "select":
        return (
          <select
            id={field.id}
            value={(formData[field.id] as string) || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            className={baseInputClass}
            disabled={isSubmitting}
          >
            <option value="">Select {field.label.toLowerCase()}...</option>
            {field.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "textarea":
        return (
          <textarea
            id={field.id}
            value={(formData[field.id] as string) || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={cn(baseInputClass, "min-h-[80px] resize-none")}
            disabled={isSubmitting}
          />
        );

      default:
        return (
          <input
            id={field.id}
            type={field.type}
            value={(formData[field.id] as string) || ""}
            onChange={(e) => handleFieldChange(field.id, e.target.value)}
            placeholder={field.placeholder}
            className={baseInputClass}
            disabled={isSubmitting}
          />
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title || `Create ${entityLabels[entityType]}`}
      subtitle={`Add a new ${entityLabels[entityType].toLowerCase()} with minimal details`}
      size="md"
      closeOnEscape={!isSubmitting}
      closeOnOverlay={!isSubmitting}
      footer={
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className={cn(
              "inline-flex h-10 items-center justify-center rounded-md border border-input",
              "bg-background px-4 py-2 text-sm font-medium",
              "hover:bg-accent hover:text-accent-foreground",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            Cancel
          </button>
          {onCreateAndOpen && (
            <button
              type="button"
              onClick={() => handleSubmit("open")}
              disabled={isSubmitting}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input",
                "bg-background px-4 py-2 text-sm font-medium",
                "hover:bg-accent hover:text-accent-foreground",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isSubmitting && submitAction === "open" && (
                <Loader2 className="h-4 w-4 animate-spin" />
              )}
              <ExternalLink className="h-4 w-4" />
              Create & Open
            </button>
          )}
          <button
            type="button"
            onClick={() => handleSubmit("close")}
            disabled={isSubmitting}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md",
              "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90",
              "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isSubmitting && submitAction === "close" && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}
            <Plus className="h-4 w-4" />
            Create
          </button>
        </div>
      }
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleSubmit("close");
        }}
        className="space-y-4"
      >
        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <label
              htmlFor={field.id}
              className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
            >
              {field.label}
              {field.required && <span className="ml-1 text-red-500">*</span>}
            </label>
            {renderField(field)}
            {errors[field.id] && (
              <p className="text-sm text-red-500">{errors[field.id]}</p>
            )}
          </div>
        ))}
      </form>
    </Modal>
  );
}

export default QuickCreateModal;
