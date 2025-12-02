"use client";

import * as React from "react";
import {
  Briefcase,
  MapPin,
  DollarSign,
  Calendar,
  Users,
  Building,
  Clock,
  FileText,
  Activity,
  Edit,
  Copy,
  Archive,
  Trash2,
} from "lucide-react";
import { EntityDrawerBase, type EntityAction, type EntityTab } from "./EntityDrawerBase";
import { cn } from "@/lib/utils";

interface Submission {
  id: string;
  candidateName: string;
  status: string;
  submittedAt: string;
  stage: string;
}

interface JobData {
  id: string;
  title: string;
  status: "draft" | "open" | "on_hold" | "filled" | "cancelled";
  priority: "low" | "normal" | "high" | "urgent";
  accountId: string;
  accountName: string;
  contactName?: string;
  location: string;
  locationType: "onsite" | "remote" | "hybrid";
  employmentType: "full_time" | "contract" | "contract_to_hire";
  rateMin?: number;
  rateMax?: number;
  rateType?: "hourly" | "salary";
  startDate?: string;
  endDate?: string;
  openings: number;
  filledCount: number;
  description: string;
  requirements: string[];
  skills: string[];
  benefits?: string[];
  assignedTo?: string;
  createdAt: string;
  updatedAt: string;
  submissions: Submission[];
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}

export interface JobDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  job: JobData | null;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: () => void;
  onDuplicate?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const STATUS_CONFIG = {
  draft: { label: "Draft", color: "bg-gray-100 text-gray-700" },
  open: { label: "Open", color: "bg-green-100 text-green-700" },
  on_hold: { label: "On Hold", color: "bg-yellow-100 text-yellow-700" },
  filled: { label: "Filled", color: "bg-blue-100 text-blue-700" },
  cancelled: { label: "Cancelled", color: "bg-red-100 text-red-700" },
};

const PRIORITY_CONFIG = {
  low: { label: "Low", color: "text-gray-500" },
  normal: { label: "Normal", color: "text-blue-500" },
  high: { label: "High", color: "text-orange-500" },
  urgent: { label: "Urgent", color: "text-red-500" },
};

export function JobDrawer({
  isOpen,
  onClose,
  job,
  isLoading = false,
  error = null,
  onEdit,
  onDuplicate,
  onArchive,
  onDelete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: JobDrawerProps) {
  if (!job && !isLoading) {
    return null;
  }

  const actions: EntityAction[] = [
    ...(onEdit
      ? [{ id: "edit", label: "Edit Job", icon: <Edit className="h-4 w-4" />, onClick: onEdit }]
      : []),
    ...(onDuplicate
      ? [{ id: "duplicate", label: "Duplicate", icon: <Copy className="h-4 w-4" />, onClick: onDuplicate }]
      : []),
    ...(onArchive
      ? [{ id: "archive", label: "Archive", icon: <Archive className="h-4 w-4" />, onClick: onArchive }]
      : []),
    ...(onDelete
      ? [
          {
            id: "delete",
            label: "Delete",
            icon: <Trash2 className="h-4 w-4" />,
            variant: "destructive" as const,
            onClick: onDelete,
          },
        ]
      : []),
  ];

  const tabs: EntityTab[] = job
    ? [
        {
          id: "overview",
          label: "Overview",
          icon: <Briefcase className="h-4 w-4" />,
          content: <JobOverviewTab job={job} />,
        },
        {
          id: "submissions",
          label: "Submissions",
          icon: <Users className="h-4 w-4" />,
          badge: job.submissions.length,
          content: <JobSubmissionsTab submissions={job.submissions} />,
        },
        {
          id: "description",
          label: "Description",
          icon: <FileText className="h-4 w-4" />,
          content: <JobDescriptionTab job={job} />,
        },
        {
          id: "activity",
          label: "Activity",
          icon: <Activity className="h-4 w-4" />,
          badge: job.activities.length,
          content: <JobActivityTab activities={job.activities} />,
        },
      ]
    : [];

  const statusConfig = job ? STATUS_CONFIG[job.status] : null;

  const headerContent = job ? (
    <div className="flex flex-wrap items-center gap-2">
      {statusConfig && (
        <span className={cn("rounded-full px-2 py-1 text-xs font-medium", statusConfig.color)}>
          {statusConfig.label}
        </span>
      )}
      <span className={cn("text-sm font-medium", PRIORITY_CONFIG[job.priority].color)}>
        {PRIORITY_CONFIG[job.priority].label} Priority
      </span>
      <span className="text-sm text-muted-foreground">
        {job.filledCount}/{job.openings} filled
      </span>
    </div>
  ) : null;

  return (
    <EntityDrawerBase
      isOpen={isOpen}
      onClose={onClose}
      title={job?.title || "Loading..."}
      subtitle={job ? `${job.accountName} • ${job.location}` : undefined}
      entityType="Job"
      entityId={job?.id || ""}
      isLoading={isLoading}
      error={error}
      tabs={tabs}
      actions={actions}
      headerContent={headerContent}
      onPrevious={onPrevious}
      onNext={onNext}
      hasPrevious={hasPrevious}
      hasNext={hasNext}
      size="lg"
    />
  );
}

function JobOverviewTab({ job }: { job: JobData }) {
  const formatRate = () => {
    if (!job.rateMin && !job.rateMax) return "Not specified";
    const type = job.rateType === "salary" ? "/year" : "/hour";
    if (job.rateMin && job.rateMax) {
      return `$${job.rateMin.toLocaleString()} - $${job.rateMax.toLocaleString()}${type}`;
    }
    return `$${(job.rateMin || job.rateMax)?.toLocaleString()}${type}`;
  };

  return (
    <div className="space-y-6">
      {/* Key Details Grid */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <Building className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Client</div>
            <div className="font-medium">{job.accountName}</div>
            {job.contactName && (
              <div className="text-sm text-muted-foreground">{job.contactName}</div>
            )}
          </div>
        </div>
        <div className="flex items-start gap-3">
          <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Location</div>
            <div className="font-medium">{job.location}</div>
            <div className="text-sm text-muted-foreground capitalize">
              {job.locationType.replace("_", " ")}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Compensation</div>
            <div className="font-medium">{formatRate()}</div>
            <div className="text-sm text-muted-foreground capitalize">
              {job.employmentType.replace(/_/g, " ")}
            </div>
          </div>
        </div>
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Duration</div>
            <div className="font-medium">
              {job.startDate
                ? new Date(job.startDate).toLocaleDateString()
                : "Immediate"}
              {job.endDate && ` - ${new Date(job.endDate).toLocaleDateString()}`}
            </div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {job.skills.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Required Skills</h4>
          <div className="flex flex-wrap gap-2">
            {job.skills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-primary/10 px-3 py-1 text-sm text-primary"
              >
                {skill}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex gap-4 text-xs text-muted-foreground pt-4 border-t">
        <span>Created: {new Date(job.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(job.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function JobSubmissionsTab({ submissions }: { submissions: Submission[] }) {
  if (submissions.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No submissions yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {submissions.map((submission) => (
        <div
          key={submission.id}
          className="flex items-center justify-between rounded-md border p-3"
        >
          <div>
            <div className="font-medium">{submission.candidateName}</div>
            <div className="text-sm text-muted-foreground">
              {submission.stage} • {new Date(submission.submittedAt).toLocaleDateString()}
            </div>
          </div>
          <span className="rounded-full bg-muted px-2 py-1 text-xs">
            {submission.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function JobDescriptionTab({ job }: { job: JobData }) {
  return (
    <div className="space-y-6">
      <div>
        <h4 className="text-sm font-medium mb-2">Description</h4>
        <div className="prose prose-sm max-w-none text-muted-foreground">
          {job.description || "No description provided"}
        </div>
      </div>

      {job.requirements.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Requirements</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {job.requirements.map((req, i) => (
              <li key={i}>{req}</li>
            ))}
          </ul>
        </div>
      )}

      {job.benefits && job.benefits.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Benefits</h4>
          <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
            {job.benefits.map((benefit, i) => (
              <li key={i}>{benefit}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function JobActivityTab({
  activities,
}: {
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
}) {
  if (activities.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {activities.map((activity) => (
        <div key={activity.id} className="flex gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
            <Clock className="h-4 w-4 text-muted-foreground" />
          </div>
          <div className="flex-1">
            <div className="text-sm">{activity.description}</div>
            <div className="text-xs text-muted-foreground">
              {activity.user} • {new Date(activity.timestamp).toLocaleString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

export default JobDrawer;
