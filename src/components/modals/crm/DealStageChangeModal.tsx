"use client";

import * as React from "react";
import { Loader2, Upload, ChevronRight, Check } from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

type DealStage =
  | "qualification"
  | "needs_analysis"
  | "proposal"
  | "negotiation"
  | "closed_won"
  | "closed_lost";

interface StageConfig {
  label: string;
  probability: number;
  color: string;
  fields?: string[];
}

const STAGE_CONFIG: Record<DealStage, StageConfig> = {
  qualification: {
    label: "Qualification",
    probability: 10,
    color: "bg-gray-100 text-gray-800",
  },
  needs_analysis: {
    label: "Needs Analysis",
    probability: 30,
    color: "bg-blue-100 text-blue-800",
  },
  proposal: {
    label: "Proposal",
    probability: 50,
    color: "bg-purple-100 text-purple-800",
    fields: ["proposalDoc"],
  },
  negotiation: {
    label: "Negotiation",
    probability: 70,
    color: "bg-yellow-100 text-yellow-800",
    fields: ["competingVendors"],
  },
  closed_won: {
    label: "Closed Won",
    probability: 100,
    color: "bg-green-100 text-green-800",
    fields: ["contractValue", "startDate"],
  },
  closed_lost: {
    label: "Closed Lost",
    probability: 0,
    color: "bg-red-100 text-red-800",
    fields: ["lossReason", "competitor"],
  },
};

const LOSS_REASONS = [
  "Price too high",
  "Competitor selected",
  "Project cancelled",
  "Budget constraints",
  "No decision made",
  "Requirements changed",
  "Other",
];

interface DealStageChangeFormData {
  newStage: DealStage;
  probability?: number;
  proposalDoc?: File;
  competingVendors?: string;
  contractValue?: number;
  startDate?: string;
  lossReason?: string;
  competitor?: string;
  notes?: string;
  updateProbability: "auto" | "manual";
}

export interface DealStageChangeModalProps {
  isOpen: boolean;
  onClose: () => void;
  dealId: string;
  dealName: string;
  currentStage: DealStage;
  currentAmount: number;
  onSubmit: (data: DealStageChangeFormData) => Promise<void>;
}

export function DealStageChangeModal({
  isOpen,
  onClose,
  dealId,
  dealName,
  currentStage,
  currentAmount,
  onSubmit,
}: DealStageChangeModalProps) {
  const [formData, setFormData] = React.useState<DealStageChangeFormData>({
    newStage: currentStage,
    updateProbability: "auto",
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        newStage: currentStage,
        probability: STAGE_CONFIG[currentStage].probability,
        updateProbability: "auto",
      });
    }
  }, [isOpen, currentStage]);

  // Update probability when stage changes (if auto)
  React.useEffect(() => {
    if (formData.updateProbability === "auto") {
      setFormData((prev) => ({
        ...prev,
        probability: STAGE_CONFIG[prev.newStage].probability,
      }));
    }
  }, [formData.newStage, formData.updateProbability]);

  const handleStageChange = (stage: DealStage) => {
    setFormData((prev) => ({
      ...prev,
      newStage: stage,
      // Clear stage-specific fields
      proposalDoc: undefined,
      competingVendors: undefined,
      contractValue: undefined,
      startDate: undefined,
      lossReason: undefined,
      competitor: undefined,
    }));
  };

  const isFormValid = (): boolean => {
    if (formData.newStage === currentStage) return false;

    switch (formData.newStage) {
      case "closed_won":
        return Boolean(formData.contractValue && formData.startDate);
      case "closed_lost":
        return Boolean(formData.lossReason);
      default:
        return true;
    }
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to update stage:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const currentConfig = STAGE_CONFIG[currentStage];
  const newConfig = STAGE_CONFIG[formData.newStage];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Update Deal Stage"
      subtitle={dealName}
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
            Update Stage
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Current Stage */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Current Stage</label>
          <div
            className={cn("inline-flex rounded-full px-3 py-1 text-sm font-medium", currentConfig.color)}
          >
            {currentConfig.label}
          </div>
        </div>

        {/* Stage Selection - Visual Pipeline */}
        <div className="space-y-2">
          <label className="text-sm font-medium">New Stage *</label>
          <div className="grid gap-2 sm:grid-cols-3">
            {(Object.entries(STAGE_CONFIG) as [DealStage, StageConfig][]).map(
              ([stage, config]) => (
                <button
                  key={stage}
                  type="button"
                  onClick={() => handleStageChange(stage)}
                  className={cn(
                    "flex flex-col items-center gap-1 rounded-md border p-3",
                    "transition-colors hover:bg-muted/50",
                    formData.newStage === stage && "border-primary bg-primary/10"
                  )}
                >
                  <span
                    className={cn("rounded-full px-2 py-0.5 text-xs font-medium", config.color)}
                  >
                    {config.probability}%
                  </span>
                  <span className="text-sm font-medium">{config.label}</span>
                </button>
              )
            )}
          </div>
        </div>

        {/* Stage-specific fields */}
        {formData.newStage === "proposal" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Upload Proposal</label>
            <input
              type="file"
              accept=".pdf,.doc,.docx"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) setFormData((prev) => ({ ...prev, proposalDoc: file }));
              }}
              className="text-sm"
            />
          </div>
        )}

        {formData.newStage === "negotiation" && (
          <div className="space-y-2">
            <label className="text-sm font-medium">Competing Vendors</label>
            <input
              type="text"
              value={formData.competingVendors || ""}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, competingVendors: e.target.value }))
              }
              placeholder="e.g., Competitor A, Competitor B"
              className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </div>
        )}

        {formData.newStage === "closed_won" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Contract Value *</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                  $
                </span>
                <input
                  type="number"
                  value={formData.contractValue || currentAmount}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      contractValue: parseFloat(e.target.value) || 0,
                    }))
                  }
                  className="h-10 w-full rounded-md border border-input bg-background pl-7 pr-3 text-sm"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Start Date *</label>
              <input
                type="date"
                value={formData.startDate || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, startDate: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>
        )}

        {formData.newStage === "closed_lost" && (
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Loss Reason *</label>
              <select
                value={formData.lossReason || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, lossReason: e.target.value }))
                }
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="">Select reason...</option>
                {LOSS_REASONS.map((reason) => (
                  <option key={reason} value={reason}>
                    {reason}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Competitor (if applicable)</label>
              <input
                type="text"
                value={formData.competitor || ""}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, competitor: e.target.value }))
                }
                placeholder="Who won the deal?"
                className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          </div>
        )}

        {/* Probability */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Probability</label>
          <div className="flex gap-2">
            {(["auto", "manual"] as const).map((mode) => (
              <button
                key={mode}
                type="button"
                onClick={() =>
                  setFormData((prev) => ({ ...prev, updateProbability: mode }))
                }
                className={cn(
                  "rounded-md border px-3 py-1 text-sm capitalize",
                  formData.updateProbability === mode
                    ? "border-primary bg-primary text-primary-foreground"
                    : "hover:bg-muted/50"
                )}
              >
                {mode}
              </button>
            ))}
            {formData.updateProbability === "manual" && (
              <input
                type="number"
                value={formData.probability || 0}
                onChange={(e) =>
                  setFormData((prev) => ({
                    ...prev,
                    probability: parseInt(e.target.value) || 0,
                  }))
                }
                min={0}
                max={100}
                className="h-8 w-20 rounded-md border border-input bg-background px-2 text-sm"
              />
            )}
            <span className="flex items-center text-lg font-semibold text-primary">
              {formData.probability}%
            </span>
          </div>
        </div>

        {/* Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Notes</label>
          <textarea
            value={formData.notes || ""}
            onChange={(e) => setFormData((prev) => ({ ...prev, notes: e.target.value }))}
            placeholder="Add any notes about this stage change..."
            className="min-h-[60px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>
      </div>
    </Modal>
  );
}

export default DealStageChangeModal;
