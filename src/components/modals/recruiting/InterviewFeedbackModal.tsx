"use client";

import * as React from "react";
import { Loader2, Star, ThumbsUp, ThumbsDown, Minus, Send } from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

type Recommendation = "strong_yes" | "yes" | "maybe" | "no" | "strong_no";

interface InterviewDetails {
  interviewType: string;
  roundNumber: number;
  date: string;
  time: string;
  interviewers: string[];
}

interface InterviewFeedbackFormData {
  technicalRating: number;
  communicationRating: number;
  cultureFitRating: number;
  recommendation: Recommendation;
  strengths: string;
  areasForImprovement: string;
  detailedNotes: string;
  shareWithTeam: boolean;
}

const RATING_LABELS = ["Poor", "Below Average", "Average", "Good", "Excellent"];

const RECOMMENDATION_OPTIONS: {
  value: Recommendation;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
}[] = [
  { value: "strong_yes", label: "Strong Yes", icon: ThumbsUp, color: "text-green-600" },
  { value: "yes", label: "Yes", icon: ThumbsUp, color: "text-green-500" },
  { value: "maybe", label: "Maybe", icon: Minus, color: "text-yellow-500" },
  { value: "no", label: "No", icon: ThumbsDown, color: "text-orange-500" },
  { value: "strong_no", label: "Strong No", icon: ThumbsDown, color: "text-red-600" },
];

export interface InterviewFeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  interviewId: string;
  candidateName: string;
  interviewDetails: InterviewDetails;
  onSubmit: (data: InterviewFeedbackFormData) => Promise<void>;
}

export function InterviewFeedbackModal({
  isOpen,
  onClose,
  interviewId,
  candidateName,
  interviewDetails,
  onSubmit,
}: InterviewFeedbackModalProps) {
  const [formData, setFormData] = React.useState<InterviewFeedbackFormData>({
    technicalRating: 0,
    communicationRating: 0,
    cultureFitRating: 0,
    recommendation: "maybe",
    strengths: "",
    areasForImprovement: "",
    detailedNotes: "",
    shareWithTeam: true,
  });
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  // Reset on open
  React.useEffect(() => {
    if (isOpen) {
      setFormData({
        technicalRating: 0,
        communicationRating: 0,
        cultureFitRating: 0,
        recommendation: "maybe",
        strengths: "",
        areasForImprovement: "",
        detailedNotes: "",
        shareWithTeam: true,
      });
    }
  }, [isOpen]);

  const isFormValid = (): boolean => {
    return (
      formData.technicalRating > 0 &&
      formData.communicationRating > 0 &&
      formData.cultureFitRating > 0 &&
      Boolean(formData.recommendation) &&
      formData.detailedNotes.length >= 10
    );
  };

  const handleSubmit = async () => {
    if (!isFormValid()) return;

    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to submit feedback:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const RatingInput = ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (value: number) => void;
  }) => (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="text-sm font-medium">{label}</label>
        {value > 0 && (
          <span className="text-sm text-muted-foreground">
            {RATING_LABELS[value - 1]}
          </span>
        )}
      </div>
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((rating) => (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className="p-1"
          >
            <Star
              className={cn(
                "h-6 w-6 transition-colors",
                rating <= value
                  ? "fill-yellow-400 text-yellow-400"
                  : "text-muted-foreground hover:text-yellow-400"
              )}
            />
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Interview Feedback - ${candidateName}`}
      subtitle={`Round ${interviewDetails.roundNumber} - ${interviewDetails.interviewType}`}
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
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Send className="h-4 w-4" />
            )}
            Submit Feedback
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Interview Details */}
        <div className="rounded-md border bg-muted/50 p-3">
          <div className="grid gap-2 text-sm sm:grid-cols-2">
            <div>
              <span className="text-muted-foreground">Date:</span>{" "}
              {interviewDetails.date} at {interviewDetails.time}
            </div>
            <div>
              <span className="text-muted-foreground">Interviewers:</span>{" "}
              {interviewDetails.interviewers.join(", ")}
            </div>
          </div>
        </div>

        {/* Ratings */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Ratings</h4>
          <div className="grid gap-4 sm:grid-cols-3">
            <RatingInput
              label="Technical Skills"
              value={formData.technicalRating}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, technicalRating: value }))
              }
            />
            <RatingInput
              label="Communication"
              value={formData.communicationRating}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, communicationRating: value }))
              }
            />
            <RatingInput
              label="Culture Fit"
              value={formData.cultureFitRating}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, cultureFitRating: value }))
              }
            />
          </div>
        </div>

        {/* Recommendation */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Recommendation *</label>
          <div className="flex flex-wrap gap-2">
            {RECOMMENDATION_OPTIONS.map((option) => {
              const Icon = option.icon;
              return (
                <button
                  key={option.value}
                  type="button"
                  onClick={() =>
                    setFormData((prev) => ({ ...prev, recommendation: option.value }))
                  }
                  className={cn(
                    "flex items-center gap-2 rounded-md border px-3 py-2 text-sm font-medium",
                    "transition-colors",
                    formData.recommendation === option.value
                      ? "border-primary bg-primary/10"
                      : "hover:bg-muted/50"
                  )}
                >
                  <Icon className={cn("h-4 w-4", option.color)} />
                  {option.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Strengths */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Strengths</label>
          <textarea
            value={formData.strengths}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, strengths: e.target.value }))
            }
            placeholder="What did the candidate do well?"
            className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Areas for Improvement */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Areas for Improvement</label>
          <textarea
            value={formData.areasForImprovement}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, areasForImprovement: e.target.value }))
            }
            placeholder="What could the candidate improve on?"
            className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
        </div>

        {/* Detailed Notes */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Detailed Notes *</label>
          <textarea
            value={formData.detailedNotes}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, detailedNotes: e.target.value }))
            }
            placeholder="Provide detailed feedback from the interview..."
            className="min-h-[120px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
          />
          <p className="text-xs text-muted-foreground">
            Minimum 10 characters required
          </p>
        </div>

        {/* Share with Team */}
        <div className="flex items-center gap-2">
          <input
            type="checkbox"
            id="share-team"
            checked={formData.shareWithTeam}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, shareWithTeam: e.target.checked }))
            }
            className="h-4 w-4 rounded border-gray-300"
          />
          <label htmlFor="share-team" className="text-sm">
            Share this feedback with the hiring team
          </label>
        </div>
      </div>
    </Modal>
  );
}

export default InterviewFeedbackModal;
