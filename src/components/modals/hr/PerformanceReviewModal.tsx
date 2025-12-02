"use client";

import * as React from "react";
import {
  Loader2,
  Target,
  Star,
  MessageSquare,
  TrendingUp,
  AlertCircle,
  Check,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import { Modal } from "../Modal";
import { cn } from "@/lib/utils";

interface Goal {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: "not_started" | "in_progress" | "completed" | "blocked";
  weight: number;
  selfRating?: number;
  managerRating?: number;
  comments?: string;
}

interface Competency {
  id: string;
  name: string;
  description: string;
  category: string;
  selfRating?: number;
  managerRating?: number;
  comments?: string;
}

interface Employee {
  id: string;
  name: string;
  title: string;
  department: string;
  hireDate: string;
  managerId: string;
  managerName: string;
}

interface ReviewPeriod {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
}

interface PerformanceReviewFormData {
  goalRatings: Record<string, { rating: number; comments: string }>;
  competencyRatings: Record<string, { rating: number; comments: string }>;
  overallRating: number;
  strengths: string;
  areasForImprovement: string;
  developmentPlan: string;
  managerComments: string;
  employeeComments: string;
  recommendPromotion: boolean;
  promotionNotes?: string;
}

export interface PerformanceReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  employee: Employee;
  reviewPeriod: ReviewPeriod;
  goals: Goal[];
  competencies: Competency[];
  existingReview?: Partial<PerformanceReviewFormData>;
  isManager: boolean;
  onSubmit: (data: PerformanceReviewFormData) => Promise<void>;
  onSaveDraft?: (data: PerformanceReviewFormData) => Promise<void>;
}

const RATING_LABELS: Record<number, { label: string; color: string }> = {
  1: { label: "Needs Improvement", color: "text-red-600" },
  2: { label: "Below Expectations", color: "text-orange-600" },
  3: { label: "Meets Expectations", color: "text-yellow-600" },
  4: { label: "Exceeds Expectations", color: "text-green-600" },
  5: { label: "Outstanding", color: "text-emerald-600" },
};

const GOAL_STATUS_CONFIG = {
  not_started: { label: "Not Started", color: "bg-gray-100 text-gray-700" },
  in_progress: { label: "In Progress", color: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", color: "bg-green-100 text-green-700" },
  blocked: { label: "Blocked", color: "bg-red-100 text-red-700" },
};

export function PerformanceReviewModal({
  isOpen,
  onClose,
  employee,
  reviewPeriod,
  goals,
  competencies,
  existingReview,
  isManager,
  onSubmit,
  onSaveDraft,
}: PerformanceReviewModalProps) {
  const [activeTab, setActiveTab] = React.useState<"goals" | "competencies" | "summary">("goals");
  const [formData, setFormData] = React.useState<PerformanceReviewFormData>({
    goalRatings: {},
    competencyRatings: {},
    overallRating: 3,
    strengths: "",
    areasForImprovement: "",
    developmentPlan: "",
    managerComments: "",
    employeeComments: "",
    recommendPromotion: false,
  });
  const [expandedGoals, setExpandedGoals] = React.useState<Set<string>>(new Set());
  const [expandedCompetencies, setExpandedCompetencies] = React.useState<Set<string>>(new Set());
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isSaving, setIsSaving] = React.useState(false);

  // Initialize form data
  React.useEffect(() => {
    if (isOpen) {
      const initialGoalRatings: Record<string, { rating: number; comments: string }> = {};
      goals.forEach((goal) => {
        initialGoalRatings[goal.id] = {
          rating: isManager ? goal.managerRating || 3 : goal.selfRating || 3,
          comments: goal.comments || "",
        };
      });

      const initialCompetencyRatings: Record<string, { rating: number; comments: string }> = {};
      competencies.forEach((comp) => {
        initialCompetencyRatings[comp.id] = {
          rating: isManager ? comp.managerRating || 3 : comp.selfRating || 3,
          comments: comp.comments || "",
        };
      });

      setFormData({
        goalRatings: initialGoalRatings,
        competencyRatings: initialCompetencyRatings,
        overallRating: existingReview?.overallRating || 3,
        strengths: existingReview?.strengths || "",
        areasForImprovement: existingReview?.areasForImprovement || "",
        developmentPlan: existingReview?.developmentPlan || "",
        managerComments: existingReview?.managerComments || "",
        employeeComments: existingReview?.employeeComments || "",
        recommendPromotion: existingReview?.recommendPromotion || false,
        promotionNotes: existingReview?.promotionNotes,
      });
      setActiveTab("goals");
      setExpandedGoals(new Set());
      setExpandedCompetencies(new Set());
    }
  }, [isOpen, goals, competencies, existingReview, isManager]);

  const toggleGoalExpanded = (goalId: string) => {
    setExpandedGoals((prev) => {
      const next = new Set(prev);
      if (next.has(goalId)) {
        next.delete(goalId);
      } else {
        next.add(goalId);
      }
      return next;
    });
  };

  const toggleCompetencyExpanded = (compId: string) => {
    setExpandedCompetencies((prev) => {
      const next = new Set(prev);
      if (next.has(compId)) {
        next.delete(compId);
      } else {
        next.add(compId);
      }
      return next;
    });
  };

  const updateGoalRating = (goalId: string, updates: Partial<{ rating: number; comments: string }>) => {
    setFormData((prev) => ({
      ...prev,
      goalRatings: {
        ...prev.goalRatings,
        [goalId]: {
          ...prev.goalRatings[goalId],
          ...updates,
        },
      },
    }));
  };

  const updateCompetencyRating = (compId: string, updates: Partial<{ rating: number; comments: string }>) => {
    setFormData((prev) => ({
      ...prev,
      competencyRatings: {
        ...prev.competencyRatings,
        [compId]: {
          ...prev.competencyRatings[compId],
          ...updates,
        },
      },
    }));
  };

  // Calculate average ratings
  const calculateAverageGoalRating = (): number => {
    const ratings = Object.values(formData.goalRatings).map((r) => r.rating);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  };

  const calculateAverageCompetencyRating = (): number => {
    const ratings = Object.values(formData.competencyRatings).map((r) => r.rating);
    if (ratings.length === 0) return 0;
    return ratings.reduce((sum, r) => sum + r, 0) / ratings.length;
  };

  const handleSaveDraft = async () => {
    if (!onSaveDraft) return;

    setIsSaving(true);
    try {
      await onSaveDraft(formData);
    } catch (error) {
      console.error("Failed to save draft:", error);
    } finally {
      setIsSaving(false);
    }
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error("Failed to submit review:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStarRating = (
    value: number,
    onChange: (value: number) => void,
    readOnly = false
  ) => (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button
          key={star}
          type="button"
          disabled={readOnly}
          onClick={() => !readOnly && onChange(star)}
          className={cn(
            "p-0.5 transition-colors",
            readOnly ? "cursor-default" : "cursor-pointer hover:scale-110"
          )}
        >
          <Star
            className={cn(
              "h-5 w-5",
              star <= value ? "fill-yellow-400 text-yellow-400" : "text-gray-300"
            )}
          />
        </button>
      ))}
      <span className={cn("ml-2 text-sm", RATING_LABELS[value]?.color)}>
        {RATING_LABELS[value]?.label}
      </span>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Performance Review"
      subtitle={`${employee.name} - ${reviewPeriod.name}`}
      size="2xl"
      closeOnEscape={!isSubmitting && !isSaving}
      closeOnOverlay={!isSubmitting && !isSaving}
      footer={
        <div className="flex w-full items-center justify-between">
          {onSaveDraft && (
            <button
              type="button"
              onClick={handleSaveDraft}
              disabled={isSubmitting || isSaving}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md border border-input",
                "bg-background px-4 py-2 text-sm font-medium",
                "hover:bg-accent hover:text-accent-foreground",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isSaving && <Loader2 className="h-4 w-4 animate-spin" />}
              Save Draft
            </button>
          )}
          <div className="flex gap-2 ml-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting || isSaving}
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
              disabled={isSubmitting || isSaving}
              className={cn(
                "inline-flex h-10 items-center justify-center gap-2 rounded-md",
                "bg-primary px-4 py-2 text-sm font-medium text-primary-foreground",
                "hover:bg-primary/90",
                "disabled:cursor-not-allowed disabled:opacity-50"
              )}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Submit Review
            </button>
          </div>
        </div>
      }
    >
      <div className="space-y-6">
        {/* Employee Info */}
        <div className="flex items-center justify-between rounded-md border bg-muted/50 p-4">
          <div>
            <div className="font-medium">{employee.name}</div>
            <div className="text-sm text-muted-foreground">
              {employee.title} • {employee.department}
            </div>
            <div className="text-xs text-muted-foreground">
              Reports to: {employee.managerName}
            </div>
          </div>
          <div className="text-right">
            <div className="text-sm text-muted-foreground">Review Period</div>
            <div className="text-sm">
              {new Date(reviewPeriod.startDate).toLocaleDateString()} -{" "}
              {new Date(reviewPeriod.endDate).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b">
          {[
            { id: "goals", label: "Goals", icon: <Target className="h-4 w-4" /> },
            { id: "competencies", label: "Competencies", icon: <Star className="h-4 w-4" /> },
            { id: "summary", label: "Summary", icon: <MessageSquare className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={cn(
                "flex items-center gap-2 px-4 py-2 text-sm font-medium border-b-2 -mb-px transition-colors",
                activeTab === tab.id
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              )}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="min-h-[400px]">
          {activeTab === "goals" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average Goal Rating:</span>
                <span className="font-medium">
                  {calculateAverageGoalRating().toFixed(1)} / 5.0
                </span>
              </div>
              {goals.map((goal) => {
                const isExpanded = expandedGoals.has(goal.id);
                const rating = formData.goalRatings[goal.id];
                const statusConfig = GOAL_STATUS_CONFIG[goal.status];

                return (
                  <div key={goal.id} className="rounded-md border">
                    <button
                      type="button"
                      onClick={() => toggleGoalExpanded(goal.id)}
                      className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{goal.title}</span>
                          <span
                            className={cn("rounded-full px-2 py-0.5 text-xs", statusConfig.color)}
                          >
                            {statusConfig.label}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Weight: {goal.weight}% • Due: {new Date(goal.dueDate).toLocaleDateString()}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {rating && (
                          <div className="flex gap-0.5">
                            {[1, 2, 3, 4, 5].map((star) => (
                              <Star
                                key={star}
                                className={cn(
                                  "h-3 w-3",
                                  star <= rating.rating
                                    ? "fill-yellow-400 text-yellow-400"
                                    : "text-gray-300"
                                )}
                              />
                            ))}
                          </div>
                        )}
                        {isExpanded ? (
                          <ChevronUp className="h-4 w-4" />
                        ) : (
                          <ChevronDown className="h-4 w-4" />
                        )}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="border-t p-3 space-y-3 bg-muted/30">
                        <p className="text-sm text-muted-foreground">{goal.description}</p>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">
                            {isManager ? "Manager Rating" : "Self Rating"}
                          </label>
                          {renderStarRating(
                            rating?.rating || 3,
                            (value) => updateGoalRating(goal.id, { rating: value })
                          )}
                        </div>
                        <div className="space-y-2">
                          <label className="text-sm font-medium">Comments</label>
                          <textarea
                            value={rating?.comments || ""}
                            onChange={(e) =>
                              updateGoalRating(goal.id, { comments: e.target.value })
                            }
                            placeholder="Add comments about this goal..."
                            className="min-h-[60px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}

          {activeTab === "competencies" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Average Competency Rating:</span>
                <span className="font-medium">
                  {calculateAverageCompetencyRating().toFixed(1)} / 5.0
                </span>
              </div>
              {Object.entries(
                competencies.reduce((acc, comp) => {
                  if (!acc[comp.category]) acc[comp.category] = [];
                  acc[comp.category].push(comp);
                  return acc;
                }, {} as Record<string, Competency[]>)
              ).map(([category, comps]) => (
                <div key={category} className="space-y-2">
                  <h4 className="text-sm font-medium text-muted-foreground">{category}</h4>
                  {comps.map((comp) => {
                    const isExpanded = expandedCompetencies.has(comp.id);
                    const rating = formData.competencyRatings[comp.id];

                    return (
                      <div key={comp.id} className="rounded-md border">
                        <button
                          type="button"
                          onClick={() => toggleCompetencyExpanded(comp.id)}
                          className="flex w-full items-center justify-between p-3 text-left hover:bg-muted/50"
                        >
                          <span className="font-medium">{comp.name}</span>
                          <div className="flex items-center gap-2">
                            {rating && (
                              <div className="flex gap-0.5">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star
                                    key={star}
                                    className={cn(
                                      "h-3 w-3",
                                      star <= rating.rating
                                        ? "fill-yellow-400 text-yellow-400"
                                        : "text-gray-300"
                                    )}
                                  />
                                ))}
                              </div>
                            )}
                            {isExpanded ? (
                              <ChevronUp className="h-4 w-4" />
                            ) : (
                              <ChevronDown className="h-4 w-4" />
                            )}
                          </div>
                        </button>
                        {isExpanded && (
                          <div className="border-t p-3 space-y-3 bg-muted/30">
                            <p className="text-sm text-muted-foreground">{comp.description}</p>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">
                                {isManager ? "Manager Rating" : "Self Rating"}
                              </label>
                              {renderStarRating(
                                rating?.rating || 3,
                                (value) => updateCompetencyRating(comp.id, { rating: value })
                              )}
                            </div>
                            <div className="space-y-2">
                              <label className="text-sm font-medium">Comments</label>
                              <textarea
                                value={rating?.comments || ""}
                                onChange={(e) =>
                                  updateCompetencyRating(comp.id, { comments: e.target.value })
                                }
                                placeholder="Add comments about this competency..."
                                className="min-h-[60px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ))}
            </div>
          )}

          {activeTab === "summary" && (
            <div className="space-y-4">
              {/* Overall Rating */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Overall Rating *</label>
                {renderStarRating(
                  formData.overallRating,
                  (value) => setFormData((prev) => ({ ...prev, overallRating: value }))
                )}
              </div>

              {/* Strengths */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Key Strengths</label>
                <textarea
                  value={formData.strengths}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, strengths: e.target.value }))
                  }
                  placeholder="What does this employee do exceptionally well?"
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
                  placeholder="What areas should the employee focus on improving?"
                  className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Development Plan */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Development Plan</label>
                <textarea
                  value={formData.developmentPlan}
                  onChange={(e) =>
                    setFormData((prev) => ({ ...prev, developmentPlan: e.target.value }))
                  }
                  placeholder="What training, projects, or experiences would help this employee grow?"
                  className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Manager/Employee Comments */}
              <div className="space-y-2">
                <label className="text-sm font-medium">
                  {isManager ? "Manager Comments" : "Employee Comments"}
                </label>
                <textarea
                  value={isManager ? formData.managerComments : formData.employeeComments}
                  onChange={(e) =>
                    setFormData((prev) => ({
                      ...prev,
                      [isManager ? "managerComments" : "employeeComments"]: e.target.value,
                    }))
                  }
                  placeholder="Any additional comments or feedback..."
                  className="min-h-[80px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
                />
              </div>

              {/* Promotion Recommendation (Manager only) */}
              {isManager && (
                <div className="space-y-2 rounded-md border p-4">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="recommend-promotion"
                      checked={formData.recommendPromotion}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, recommendPromotion: e.target.checked }))
                      }
                      className="h-4 w-4 rounded border-gray-300"
                    />
                    <label htmlFor="recommend-promotion" className="text-sm font-medium">
                      Recommend for Promotion
                    </label>
                  </div>
                  {formData.recommendPromotion && (
                    <textarea
                      value={formData.promotionNotes || ""}
                      onChange={(e) =>
                        setFormData((prev) => ({ ...prev, promotionNotes: e.target.value }))
                      }
                      placeholder="Provide justification for promotion recommendation..."
                      className="min-h-[60px] w-full resize-y rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
}

export default PerformanceReviewModal;
