"use client";

import * as React from "react";
import {
  Loader2,
  ChevronRight,
  ChevronLeft,
  Check,
  Building,
  User,
  FileText,
  DollarSign,
  ClipboardCheck,
  Upload,
  X,
  Plus,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface VendorCompanyInfo {
  companyName: string;
  website?: string;
  industry?: string;
  address?: string;
  city?: string;
  state?: string;
  zip?: string;
  country: string;
}

interface VendorContact {
  name: string;
  email: string;
  phone?: string;
  title?: string;
  isPrimary: boolean;
}

interface VendorDocument {
  type: "w9" | "coi" | "nda" | "msa" | "other";
  file?: File;
  uploaded: boolean;
  fileName?: string;
}

interface CommissionTerms {
  markupType: "percentage" | "fixed" | "tiered";
  markupValue?: number;
  paymentTerms: "net_30" | "net_45" | "net_60";
  invoiceFrequency: "weekly" | "bi_weekly" | "monthly";
  notes?: string;
}

interface VendorOnboardingFormData {
  companyInfo: VendorCompanyInfo;
  contacts: VendorContact[];
  documents: VendorDocument[];
  commissionTerms: CommissionTerms;
}

const STEPS = [
  { id: 1, label: "Company", icon: Building },
  { id: 2, label: "Contact", icon: User },
  { id: 3, label: "Documents", icon: FileText },
  { id: 4, label: "Terms", icon: DollarSign },
  { id: 5, label: "Review", icon: ClipboardCheck },
];

const DOCUMENT_TYPES = [
  { type: "w9" as const, label: "W-9", required: true },
  { type: "coi" as const, label: "Certificate of Insurance", required: true },
  { type: "nda" as const, label: "NDA", required: true },
  { type: "msa" as const, label: "MSA", required: false },
];

export interface VendorOnboardingWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: VendorOnboardingFormData) => Promise<void>;
}

export function VendorOnboardingWizard({
  isOpen,
  onClose,
  onSubmit,
}: VendorOnboardingWizardProps) {
  const [currentStep, setCurrentStep] = React.useState(1);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const [formData, setFormData] = React.useState<VendorOnboardingFormData>({
    companyInfo: {
      companyName: "",
      country: "US",
    },
    contacts: [{ name: "", email: "", isPrimary: true }],
    documents: DOCUMENT_TYPES.map((dt) => ({
      type: dt.type,
      uploaded: false,
    })),
    commissionTerms: {
      markupType: "percentage",
      paymentTerms: "net_30",
      invoiceFrequency: "monthly",
    },
  });

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setCurrentStep(1);
      setFormData({
        companyInfo: {
          companyName: "",
          country: "US",
        },
        contacts: [{ name: "", email: "", isPrimary: true }],
        documents: DOCUMENT_TYPES.map((dt) => ({
          type: dt.type,
          uploaded: false,
        })),
        commissionTerms: {
          markupType: "percentage",
          paymentTerms: "net_30",
          invoiceFrequency: "monthly",
        },
      });
    }
  }, [isOpen]);

  const updateCompanyInfo = (field: keyof VendorCompanyInfo, value: string) => {
    setFormData((prev) => ({
      ...prev,
      companyInfo: { ...prev.companyInfo, [field]: value },
    }));
  };

  const updateContact = (index: number, field: keyof VendorContact, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.map((c, i) => (i === index ? { ...c, [field]: value } : c)),
    }));
  };

  const addContact = () => {
    setFormData((prev) => ({
      ...prev,
      contacts: [...prev.contacts, { name: "", email: "", isPrimary: false }],
    }));
  };

  const removeContact = (index: number) => {
    if (formData.contacts.length <= 1) return;
    setFormData((prev) => ({
      ...prev,
      contacts: prev.contacts.filter((_, i) => i !== index),
    }));
  };

  const handleFileUpload = (type: VendorDocument["type"], file: File) => {
    setFormData((prev) => ({
      ...prev,
      documents: prev.documents.map((d) =>
        d.type === type ? { ...d, file, uploaded: true, fileName: file.name } : d
      ),
    }));
  };

  const updateCommissionTerms = (field: keyof CommissionTerms, value: unknown) => {
    setFormData((prev) => ({
      ...prev,
      commissionTerms: { ...prev.commissionTerms, [field]: value },
    }));
  };

  const isStepValid = (step: number): boolean => {
    switch (step) {
      case 1:
        return Boolean(formData.companyInfo.companyName);
      case 2:
        return formData.contacts.every((c) => c.name && c.email);
      case 3:
        // At least required documents should be uploaded
        const requiredDocs = DOCUMENT_TYPES.filter((dt) => dt.required);
        return requiredDocs.every((rd) =>
          formData.documents.find((d) => d.type === rd.type && d.uploaded)
        );
      case 4:
        return Boolean(
          formData.commissionTerms.markupType &&
            formData.commissionTerms.paymentTerms &&
            formData.commissionTerms.invoiceFrequency
        );
      case 5:
        return true;
      default:
        return false;
    }
  };

  const canGoNext = isStepValid(currentStep);

  const handleNext = () => {
    if (currentStep < 5 && canGoNext) {
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
      console.error("Failed to onboard vendor:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Company Name *</label>
              <input
                type="text"
                value={formData.companyInfo.companyName}
                onChange={(e) => updateCompanyInfo("companyName", e.target.value)}
                placeholder="e.g., TechStaff Solutions Inc."
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Website</label>
              <input
                type="url"
                value={formData.companyInfo.website || ""}
                onChange={(e) => updateCompanyInfo("website", e.target.value)}
                placeholder="https://www.example.com"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Industry</label>
              <select
                value={formData.companyInfo.industry || ""}
                onChange={(e) => updateCompanyInfo("industry", e.target.value)}
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select industry...</option>
                <option value="staffing">Staffing & Recruiting</option>
                <option value="technology">Technology</option>
                <option value="consulting">Consulting</option>
                <option value="healthcare">Healthcare</option>
                <option value="finance">Finance</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Address</label>
              <input
                type="text"
                value={formData.companyInfo.address || ""}
                onChange={(e) => updateCompanyInfo("address", e.target.value)}
                placeholder="Street address"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              <div className="space-y-2">
                <label className="text-sm font-medium">City</label>
                <input
                  type="text"
                  value={formData.companyInfo.city || ""}
                  onChange={(e) => updateCompanyInfo("city", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">State</label>
                <input
                  type="text"
                  value={formData.companyInfo.state || ""}
                  onChange={(e) => updateCompanyInfo("state", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">ZIP</label>
                <input
                  type="text"
                  value={formData.companyInfo.zip || ""}
                  onChange={(e) => updateCompanyInfo("zip", e.target.value)}
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-4">
            {formData.contacts.map((contact, index) => (
              <div key={index} className="space-y-3 rounded-md border p-4">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">
                    Contact {index + 1}
                    {contact.isPrimary && (
                      <span className="ml-2 text-xs text-primary">(Primary)</span>
                    )}
                  </span>
                  {formData.contacts.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeContact(index)}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <input
                      type="text"
                      value={contact.name}
                      onChange={(e) => updateContact(index, "name", e.target.value)}
                      placeholder="Full name"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <input
                      type="email"
                      value={contact.email}
                      onChange={(e) => updateContact(index, "email", e.target.value)}
                      placeholder="email@company.com"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      type="tel"
                      value={contact.phone || ""}
                      onChange={(e) => updateContact(index, "phone", e.target.value)}
                      placeholder="(555) 123-4567"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <input
                      type="text"
                      value={contact.title || ""}
                      onChange={(e) => updateContact(index, "title", e.target.value)}
                      placeholder="e.g., Account Manager"
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={contact.isPrimary}
                    onChange={(e) => {
                      // Only one can be primary
                      setFormData((prev) => ({
                        ...prev,
                        contacts: prev.contacts.map((c, i) => ({
                          ...c,
                          isPrimary: i === index ? e.target.checked : false,
                        })),
                      }));
                    }}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                  <label className="text-sm">Set as primary contact</label>
                </div>
              </div>
            ))}

            <button
              type="button"
              onClick={addContact}
              className="flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Plus className="h-4 w-4" />
              Add Another Contact
            </button>
          </div>
        );

      case 3:
        return (
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              Upload required documents to complete vendor onboarding.
            </p>

            {DOCUMENT_TYPES.map((docType) => {
              const doc = formData.documents.find((d) => d.type === docType.type);
              return (
                <div
                  key={docType.type}
                  className={cn(
                    "rounded-md border p-4",
                    doc?.uploaded && "border-green-500 bg-green-50 dark:bg-green-900/20"
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-medium">{docType.label}</span>
                      {docType.required && (
                        <span className="ml-1 text-red-500">*</span>
                      )}
                      {doc?.fileName && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {doc.fileName}
                        </p>
                      )}
                    </div>
                    {doc?.uploaded ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <label className="cursor-pointer">
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleFileUpload(docType.type, file);
                          }}
                          className="hidden"
                        />
                        <div className="flex items-center gap-1 text-sm text-primary hover:underline">
                          <Upload className="h-4 w-4" />
                          Upload
                        </div>
                      </label>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        );

      case 4:
        return (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Markup Type *</label>
              <div className="flex gap-2">
                {(["percentage", "fixed", "tiered"] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => updateCommissionTerms("markupType", type)}
                    className={cn(
                      "flex-1 rounded-md border px-3 py-2 text-sm font-medium capitalize",
                      formData.commissionTerms.markupType === type
                        ? "border-primary bg-primary text-primary-foreground"
                        : "hover:bg-muted/50"
                    )}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {formData.commissionTerms.markupType !== "tiered" && (
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  Markup Value{" "}
                  {formData.commissionTerms.markupType === "percentage" ? "(%)" : "($)"}
                </label>
                <input
                  type="number"
                  value={formData.commissionTerms.markupValue || ""}
                  onChange={(e) =>
                    updateCommissionTerms("markupValue", parseFloat(e.target.value) || 0)
                  }
                  placeholder={
                    formData.commissionTerms.markupType === "percentage"
                      ? "e.g., 15"
                      : "e.g., 10"
                  }
                  className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            )}

            <div className="space-y-2">
              <label className="text-sm font-medium">Payment Terms *</label>
              <select
                value={formData.commissionTerms.paymentTerms}
                onChange={(e) =>
                  updateCommissionTerms(
                    "paymentTerms",
                    e.target.value as CommissionTerms["paymentTerms"]
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="net_30">Net 30</option>
                <option value="net_45">Net 45</option>
                <option value="net_60">Net 60</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Invoice Frequency *</label>
              <select
                value={formData.commissionTerms.invoiceFrequency}
                onChange={(e) =>
                  updateCommissionTerms(
                    "invoiceFrequency",
                    e.target.value as CommissionTerms["invoiceFrequency"]
                  )
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="weekly">Weekly</option>
                <option value="bi_weekly">Bi-Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Additional Notes</label>
              <textarea
                value={formData.commissionTerms.notes || ""}
                onChange={(e) => updateCommissionTerms("notes", e.target.value)}
                placeholder="Any special terms or conditions..."
                className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="space-y-6">
            <div className="rounded-md border p-4">
              <h4 className="font-medium">Company Information</h4>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Company:</dt>
                  <dd className="font-medium">{formData.companyInfo.companyName}</dd>
                </div>
                {formData.companyInfo.website && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Website:</dt>
                    <dd>{formData.companyInfo.website}</dd>
                  </div>
                )}
                {formData.companyInfo.industry && (
                  <div className="flex justify-between">
                    <dt className="text-muted-foreground">Industry:</dt>
                    <dd className="capitalize">{formData.companyInfo.industry}</dd>
                  </div>
                )}
              </dl>
            </div>

            <div className="rounded-md border p-4">
              <h4 className="font-medium">Contacts</h4>
              <div className="mt-2 space-y-2">
                {formData.contacts.map((contact, index) => (
                  <div key={index} className="text-sm">
                    <span className="font-medium">{contact.name}</span>
                    {contact.isPrimary && (
                      <span className="ml-1 text-xs text-primary">(Primary)</span>
                    )}
                    <br />
                    <span className="text-muted-foreground">{contact.email}</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="rounded-md border p-4">
              <h4 className="font-medium">Documents</h4>
              <div className="mt-2 flex flex-wrap gap-2">
                {formData.documents
                  .filter((d) => d.uploaded)
                  .map((doc) => (
                    <span
                      key={doc.type}
                      className="flex items-center gap-1 rounded-full bg-green-100 px-2 py-0.5 text-xs text-green-800 dark:bg-green-900/50 dark:text-green-200"
                    >
                      <Check className="h-3 w-3" />
                      {doc.type.toUpperCase()}
                    </span>
                  ))}
              </div>
            </div>

            <div className="rounded-md border p-4">
              <h4 className="font-medium">Commission Terms</h4>
              <dl className="mt-2 space-y-1 text-sm">
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Markup:</dt>
                  <dd className="font-medium capitalize">
                    {formData.commissionTerms.markupType}
                    {formData.commissionTerms.markupValue &&
                      ` - ${formData.commissionTerms.markupValue}${
                        formData.commissionTerms.markupType === "percentage" ? "%" : "$"
                      }`}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Payment Terms:</dt>
                  <dd>{formData.commissionTerms.paymentTerms.replace("_", " ")}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-muted-foreground">Invoice Frequency:</dt>
                  <dd className="capitalize">
                    {formData.commissionTerms.invoiceFrequency.replace("_", "-")}
                  </dd>
                </div>
              </dl>
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
      title="Vendor Onboarding"
      subtitle={`Step ${currentStep} of ${STEPS.length}: ${STEPS[currentStep - 1]?.label}`}
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

          {currentStep < 5 ? (
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
              disabled={isSubmitting}
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
              Complete Onboarding
            </button>
          )}
        </div>
      }
    >
      {/* Progress Indicator */}
      <div className="mb-6 flex items-center justify-center gap-2">
        {STEPS.map((step, index) => {
          const Icon = step.icon;
          const isActive = currentStep === step.id;
          const isCompleted = currentStep > step.id;

          return (
            <React.Fragment key={step.id}>
              <div
                className={cn(
                  "flex items-center gap-1",
                  isActive && "text-primary",
                  isCompleted && "text-green-500",
                  !isActive && !isCompleted && "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-full border-2",
                    isActive && "border-primary bg-primary/10",
                    isCompleted && "border-green-500 bg-green-500 text-white",
                    !isActive && !isCompleted && "border-muted"
                  )}
                >
                  {isCompleted ? (
                    <Check className="h-4 w-4" />
                  ) : (
                    <Icon className="h-4 w-4" />
                  )}
                </div>
              </div>
              {index < STEPS.length - 1 && (
                <div
                  className={cn(
                    "h-0.5 w-6 bg-muted",
                    currentStep > step.id && "bg-green-500"
                  )}
                />
              )}
            </React.Fragment>
          );
        })}
      </div>

      {renderStepContent()}
    </Modal>
  );
}

export default VendorOnboardingWizard;
