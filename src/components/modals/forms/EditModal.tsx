"use client";

import * as React from "react";
import { Loader2, Save, AlertTriangle } from "lucide-react";
import { Modal } from "../Modal";
import { useUnsavedChangesConfirm } from "../hooks/useConfirm";
import { cn } from "@/lib/utils";

export interface EditField {
  id: string;
  label: string;
  type: "text" | "email" | "phone" | "number" | "select" | "textarea" | "date" | "checkbox";
  placeholder?: string;
  required?: boolean;
  options?: { value: string; label: string }[];
  disabled?: boolean;
  helpText?: string;
}

export interface EditModalProps<T extends Record<string, unknown>> {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  subtitle?: string;
  fields: EditField[];
  initialData: T | null;
  onSubmit: (data: T) => Promise<void>;
  isLoading?: boolean;
  loadError?: string;
}

export function EditModal<T extends Record<string, unknown>>({
  isOpen,
  onClose,
  title,
  subtitle,
  fields,
  initialData,
  onSubmit,
  isLoading = false,
  loadError,
}: EditModalProps<T>) {
  const [formData, setFormData] = React.useState<T | null>(null);
  const [errors, setErrors] = React.useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isDirty, setIsDirty] = React.useState(false);
  const confirmUnsaved = useUnsavedChangesConfirm();

  // Initialize form data when modal opens or data loads
  React.useEffect(() => {
    if (isOpen && initialData) {
      setFormData(initialData);
      setIsDirty(false);
      setErrors({});
    }
  }, [isOpen, initialData]);

  const handleFieldChange = (fieldId: string, value: unknown) => {
    setFormData((prev) => (prev ? { ...prev, [fieldId]: value } : null));
    setIsDirty(true);
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
    if (!formData) return false;

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

  const handleSubmit = async () => {
    if (!validate() || !formData) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      setIsDirty(false);
      onClose();
    } catch (error) {
      console.error("Failed to save:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = async () => {
    if (isDirty) {
      const shouldClose = await confirmUnsaved();
      if (!shouldClose) return;
    }
    onClose();
  };

  const renderField = (field: EditField) => {
    if (!formData) return null;

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
            disabled={isSubmitting || field.disabled}
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
            className={cn(baseInputClass, "min-h-[100px] resize-y")}
            disabled={isSubmitting || field.disabled}
          />
        );

      case "checkbox":
        return (
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id={field.id}
              checked={Boolean(formData[field.id])}
              onChange={(e) => handleFieldChange(field.id, e.target.checked)}
              className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
              disabled={isSubmitting || field.disabled}
            />
            <label htmlFor={field.id} className="text-sm text-muted-foreground">
              {field.placeholder}
            </label>
          </div>
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
            disabled={isSubmitting || field.disabled}
          />
        );
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      subtitle={subtitle}
      size="lg"
      closeOnEscape={!isSubmitting}
      closeOnOverlay={!isSubmitting}
      footer={
        <div className="flex w-full items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            {isDirty && (
              <>
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                Unsaved changes
              </>
            )}
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleClose}
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
            <button
              type="button"
              onClick={handleSubmit}
              disabled={isSubmitting || isLoading || !isDirty}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md",
                "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                "hover:bg-primary/90",
                "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              <Save className="h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      }
    >
      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : loadError ? (
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <AlertTriangle className="h-10 w-10 text-red-500" />
          <p className="mt-4 text-sm text-muted-foreground">{loadError}</p>
        </div>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSubmit();
          }}
          className="space-y-4"
        >
          {fields.map((field) => (
            <div key={field.id} className="space-y-2">
              {field.type !== "checkbox" && (
                <label
                  htmlFor={field.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  {field.label}
                  {field.required && <span className="ml-1 text-red-500">*</span>}
                </label>
              )}
              {renderField(field)}
              {field.helpText && (
                <p className="text-xs text-muted-foreground">{field.helpText}</p>
              )}
              {errors[field.id] && (
                <p className="text-sm text-red-500">{errors[field.id]}</p>
              )}
            </div>
          ))}
        </form>
      )}
    </Modal>
  );
}

export default EditModal;
