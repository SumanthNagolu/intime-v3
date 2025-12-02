"use client";

import * as React from "react";
import {
  Loader2,
  Building,
  User,
  DollarSign,
  ChevronRight,
  Check,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface Lead {
  id: string;
  name: string;
  email: string;
  company?: string;
  phone?: string;
  title?: string;
  source?: string;
  notes?: string;
}

interface ConvertLeadFormData {
  createAccount: boolean;
  createContact: boolean;
  createDeal: boolean;
  accountName: string;
  accountWebsite?: string;
  accountIndustry?: string;
  contactName: string;
  contactEmail: string;
  contactPhone?: string;
  contactTitle?: string;
  dealName?: string;
  dealAmount?: number;
  dealStage?: string;
  assignedTo?: string;
}

interface User {
  id: string;
  name: string;
}

export interface ConvertLeadModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  users: User[];
  onSubmit: (data: ConvertLeadFormData) => Promise<{
    accountId?: string;
    contactId?: string;
    dealId?: string;
  }>;
}

const DEAL_STAGES = [
  { value: "qualification", label: "Qualification" },
  { value: "needs_analysis", label: "Needs Analysis" },
  { value: "proposal", label: "Proposal" },
  { value: "negotiation", label: "Negotiation" },
];

export function ConvertLeadModal({
  isOpen,
  onClose,
  lead,
  users,
  onSubmit,
}: ConvertLeadModalProps) {
  const [formData, setFormData] = React.useState<ConvertLeadFormData>({
    createAccount: true,
    createContact: true,
    createDeal: false,
    accountName: "",
    contactName: "",
    contactEmail: "",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Pre-fill from lead data
  React.useEffect(() => {
    if (isOpen && lead) {
      setFormData({
        createAccount: true,
        createContact: true,
        createDeal: false,
        accountName: lead.company || "",
        contactName: lead.name,
        contactEmail: lead.email,
        contactPhone: lead.phone,
        contactTitle: lead.title,
      });
    }
  }, [isOpen, lead]);

  const isFormValid = (): boolean => {
    if (formData.createAccount && !formData.accountName) return false;
    if (formData.createContact && (!formData.contactName || !formData.contactEmail))
      return false;
    if (formData.createDeal && !formData.dealName) return false;
    return formData.createAccount || formData.createContact || formData.createDeal;
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to convert lead:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Convert Lead"
      subtitle={`Converting: ${lead.name}`}
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
            disabled={isSubmitting || !isFormValid()}
            className={cn(
              "inline-flex h-10 items-center justify-center gap-2 rounded-md",
              "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
              "hover:bg-primary/90",
              "disabled:cursor-not-allowed disabled:opacity-50"
            )}
          >
            {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
            <ChevronRight className="h-4 w-4" />
            Convert
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Lead Summary */}
        <div className="rounded-md border bg-muted/50 p-4">
          <h4 className="text-sm font-medium">Lead Information</h4>
          <dl className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <dt className="text-muted-foreground">Name:</dt>
              <dd className="font-medium">{lead.name}</dd>
            </div>
            <div>
              <dt className="text-muted-foreground">Email:</dt>
              <dd>{lead.email}</dd>
            </div>
            {lead.company && (
              <div>
                <dt className="text-muted-foreground">Company:</dt>
                <dd>{lead.company}</dd>
              </div>
            )}
            {lead.source && (
              <div>
                <dt className="text-muted-foreground">Source:</dt>
                <dd className="capitalize">{lead.source}</dd>
              </div>
            )}
          </dl>
        </div>

        {/* Conversion Options */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Convert To</h4>

          {/* Account */}
          <div
            className={cn(
              "rounded-md border p-4 transition-colors",
              formData.createAccount && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="create-account"
                checked={formData.createAccount}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, createAccount: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="create-account"
                className="flex cursor-pointer items-center gap-2 font-medium"
              >
                <Building className="h-5 w-5 text-muted-foreground" />
                Account
              </label>
            </div>

            {formData.createAccount && (
              <div className="ml-7 mt-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Account Name *</label>
                  <input
                    type="text"
                    value={formData.accountName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, accountName: e.target.value }))
                    }
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Website</label>
                    <input
                      type="url"
                      value={formData.accountWebsite || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, accountWebsite: e.target.value }))
                      }
                      placeholder="https://..."
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Industry</label>
                    <select
                      value={formData.accountIndustry || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, accountIndustry: e.target.value }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      <option value="">Select industry...</option>
                      <option value="technology">Technology</option>
                      <option value="healthcare">Healthcare</option>
                      <option value="finance">Finance</option>
                      <option value="manufacturing">Manufacturing</option>
                      <option value="retail">Retail</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Contact */}
          <div
            className={cn(
              "rounded-md border p-4 transition-colors",
              formData.createContact && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="create-contact"
                checked={formData.createContact}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, createContact: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="create-contact"
                className="flex cursor-pointer items-center gap-2 font-medium"
              >
                <User className="h-5 w-5 text-muted-foreground" />
                Contact
              </label>
            </div>

            {formData.createContact && (
              <div className="ml-7 mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Name *</label>
                    <input
                      type="text"
                      value={formData.contactName}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, contactName: e.target.value }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email *</label>
                    <input
                      type="email"
                      value={formData.contactEmail}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, contactEmail: e.target.value }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <input
                      type="tel"
                      value={formData.contactPhone || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, contactPhone: e.target.value }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Title</label>
                    <input
                      type="text"
                      value={formData.contactTitle || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, contactTitle: e.target.value }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Deal */}
          <div
            className={cn(
              "rounded-md border p-4 transition-colors",
              formData.createDeal && "border-primary bg-primary/5"
            )}
          >
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="create-deal"
                checked={formData.createDeal}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, createDeal: e.target.checked }))
                }
                className="h-4 w-4 rounded border-gray-300"
              />
              <label
                htmlFor="create-deal"
                className="flex cursor-pointer items-center gap-2 font-medium"
              >
                <DollarSign className="h-5 w-5 text-muted-foreground" />
                Deal (Optional)
              </label>
            </div>

            {formData.createDeal && (
              <div className="ml-7 mt-4 space-y-3">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Deal Name *</label>
                  <input
                    type="text"
                    value={formData.dealName || ""}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, dealName: e.target.value }))
                    }
                    placeholder={`${lead.company || lead.name} - New Opportunity`}
                    className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                  />
                </div>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Amount</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                        $
                      </span>
                      <input
                        type="number"
                        value={formData.dealAmount || ""}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            dealAmount: parseFloat(e.target.value) || 0,
                          }))
                        }
                        className="h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 text-sm"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Stage</label>
                    <select
                      value={formData.dealStage || "qualification"}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, dealStage: e.target.value }))
                      }
                      className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
                    >
                      {DEAL_STAGES.map((stage) => (
                        <option key={stage.value} value={stage.value}>
                          {stage.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Owner Assignment */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Assign To</label>
          <select
            value={formData.assignedTo || ""}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, assignedTo: e.target.value }))
            }
            className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
          >
            <option value="">Current user (me)</option>
            {users.map((user) => (
              <option key={user.id} value={user.id}>
                {user.name}
              </option>
            ))}
          </select>
        </div>
      </div>
    </Modal>
  );
}

export default ConvertLeadModal;
