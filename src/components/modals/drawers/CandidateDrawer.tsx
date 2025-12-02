"use client";

import * as React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  GraduationCap,
  FileText,
  Activity,
  Edit,
  Archive,
  Trash2,
  Download,
  Link as LinkIcon,
  Clock,
  Star,
  DollarSign,
} from "lucide-react";
import { EntityDrawerBase, type EntityAction, type EntityTab } from "./EntityDrawerBase";
import { cn } from "@/lib/utils";

interface WorkExperience {
  id: string;
  company: string;
  title: string;
  startDate: string;
  endDate?: string;
  current: boolean;
  description?: string;
}

interface Education {
  id: string;
  institution: string;
  degree: string;
  field: string;
  graduationDate: string;
}

interface Submission {
  id: string;
  jobTitle: string;
  accountName: string;
  status: string;
  submittedAt: string;
}

interface CandidateData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  portfolioUrl?: string;
  currentTitle?: string;
  currentCompany?: string;
  yearsOfExperience?: number;
  desiredSalary?: number;
  salaryType?: "hourly" | "salary";
  availability?: "immediate" | "2_weeks" | "1_month" | "other";
  status: "active" | "passive" | "not_looking" | "placed" | "archived";
  rating?: number;
  source?: string;
  skills: string[];
  resumeUrl?: string;
  workExperience: WorkExperience[];
  education: Education[];
  submissions: Submission[];
  notes?: string;
  activities: Array<{
    id: string;
    type: string;
    description: string;
    timestamp: string;
    user: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CandidateDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  candidate: CandidateData | null;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onDownloadResume?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const STATUS_CONFIG = {
  active: { label: "Active", color: "bg-green-100 text-green-700" },
  passive: { label: "Passive", color: "bg-blue-100 text-blue-700" },
  not_looking: { label: "Not Looking", color: "bg-gray-100 text-gray-700" },
  placed: { label: "Placed", color: "bg-purple-100 text-purple-700" },
  archived: { label: "Archived", color: "bg-red-100 text-red-700" },
};

const AVAILABILITY_CONFIG = {
  immediate: "Immediately Available",
  "2_weeks": "2 Weeks Notice",
  "1_month": "1 Month Notice",
  other: "Other",
};

export function CandidateDrawer({
  isOpen,
  onClose,
  candidate,
  isLoading = false,
  error = null,
  onEdit,
  onArchive,
  onDelete,
  onDownloadResume,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: CandidateDrawerProps) {
  if (!candidate && !isLoading) {
    return null;
  }

  const actions: EntityAction[] = [
    ...(onEdit
      ? [{ id: "edit", label: "Edit Candidate", icon: <Edit className="h-4 w-4" />, onClick: onEdit }]
      : []),
    ...(onDownloadResume && candidate?.resumeUrl
      ? [
          {
            id: "download",
            label: "Download Resume",
            icon: <Download className="h-4 w-4" />,
            onClick: onDownloadResume,
          },
        ]
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

  const tabs: EntityTab[] = candidate
    ? [
        {
          id: "overview",
          label: "Overview",
          icon: <User className="h-4 w-4" />,
          content: <CandidateOverviewTab candidate={candidate} />,
        },
        {
          id: "experience",
          label: "Experience",
          icon: <Briefcase className="h-4 w-4" />,
          content: <CandidateExperienceTab candidate={candidate} />,
        },
        {
          id: "submissions",
          label: "Submissions",
          icon: <FileText className="h-4 w-4" />,
          badge: candidate.submissions.length,
          content: <CandidateSubmissionsTab submissions={candidate.submissions} />,
        },
        {
          id: "activity",
          label: "Activity",
          icon: <Activity className="h-4 w-4" />,
          badge: candidate.activities.length,
          content: <CandidateActivityTab activities={candidate.activities} />,
        },
      ]
    : [];

  const statusConfig = candidate ? STATUS_CONFIG[candidate.status] : null;

  const headerContent = candidate ? (
    <div className="flex flex-wrap items-center gap-2">
      {statusConfig && (
        <span className={cn("rounded-full px-2 py-1 text-xs font-medium", statusConfig.color)}>
          {statusConfig.label}
        </span>
      )}
      {candidate.rating && (
        <div className="flex items-center gap-1">
          <Star className="h-4 w-4 fill-yellow-400 text-yellow-400" />
          <span className="text-sm font-medium">{candidate.rating.toFixed(1)}</span>
        </div>
      )}
      {candidate.availability && (
        <span className="text-sm text-muted-foreground">
          {AVAILABILITY_CONFIG[candidate.availability]}
        </span>
      )}
    </div>
  ) : null;

  return (
    <EntityDrawerBase
      isOpen={isOpen}
      onClose={onClose}
      title={candidate ? `${candidate.firstName} ${candidate.lastName}` : "Loading..."}
      subtitle={candidate?.currentTitle ? `${candidate.currentTitle} at ${candidate.currentCompany}` : undefined}
      entityType="Candidate"
      entityId={candidate?.id || ""}
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

function CandidateOverviewTab({ candidate }: { candidate: CandidateData }) {
  const formatSalary = () => {
    if (!candidate.desiredSalary) return "Not specified";
    const type = candidate.salaryType === "salary" ? "/year" : "/hour";
    return `$${candidate.desiredSalary.toLocaleString()}${type}`;
  };

  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${candidate.email}`} className="text-sm hover:underline">
              {candidate.email}
            </a>
          </div>
          {candidate.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${candidate.phone}`} className="text-sm hover:underline">
                {candidate.phone}
              </a>
            </div>
          )}
          {candidate.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{candidate.location}</span>
            </div>
          )}
          {candidate.linkedinUrl && (
            <div className="flex items-center gap-3">
              <LinkIcon className="h-4 w-4 text-muted-foreground" />
              <a
                href={candidate.linkedinUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                LinkedIn Profile
              </a>
            </div>
          )}
        </div>
      </div>

      {/* Key Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        {candidate.yearsOfExperience !== undefined && (
          <div className="flex items-start gap-3">
            <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Experience</div>
              <div className="font-medium">{candidate.yearsOfExperience} years</div>
            </div>
          </div>
        )}
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Desired Compensation</div>
            <div className="font-medium">{formatSalary()}</div>
          </div>
        </div>
      </div>

      {/* Skills */}
      {candidate.skills.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {candidate.skills.map((skill) => (
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

      {/* Notes */}
      {candidate.notes && (
        <div>
          <h4 className="text-sm font-medium mb-2">Notes</h4>
          <p className="text-sm text-muted-foreground">{candidate.notes}</p>
        </div>
      )}

      {/* Source */}
      {candidate.source && (
        <div className="text-xs text-muted-foreground">Source: {candidate.source}</div>
      )}

      {/* Timestamps */}
      <div className="flex gap-4 text-xs text-muted-foreground pt-4 border-t">
        <span>Added: {new Date(candidate.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(candidate.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function CandidateExperienceTab({ candidate }: { candidate: CandidateData }) {
  return (
    <div className="space-y-6">
      {/* Work Experience */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <Briefcase className="h-4 w-4" />
          Work Experience
        </h4>
        {candidate.workExperience.length === 0 ? (
          <p className="text-sm text-muted-foreground">No work experience listed</p>
        ) : (
          <div className="space-y-4">
            {candidate.workExperience.map((exp) => (
              <div key={exp.id} className="relative border-l-2 border-muted pl-4">
                <div className="absolute -left-[5px] top-1.5 h-2 w-2 rounded-full bg-primary" />
                <div className="font-medium">{exp.title}</div>
                <div className="text-sm text-muted-foreground">{exp.company}</div>
                <div className="text-xs text-muted-foreground">
                  {new Date(exp.startDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}{" "}
                  -{" "}
                  {exp.current
                    ? "Present"
                    : exp.endDate
                    ? new Date(exp.endDate).toLocaleDateString("en-US", {
                        month: "short",
                        year: "numeric",
                      })
                    : "N/A"}
                </div>
                {exp.description && (
                  <p className="mt-2 text-sm text-muted-foreground">{exp.description}</p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Education */}
      <div>
        <h4 className="text-sm font-medium mb-3 flex items-center gap-2">
          <GraduationCap className="h-4 w-4" />
          Education
        </h4>
        {candidate.education.length === 0 ? (
          <p className="text-sm text-muted-foreground">No education listed</p>
        ) : (
          <div className="space-y-3">
            {candidate.education.map((edu) => (
              <div key={edu.id} className="rounded-md border p-3">
                <div className="font-medium">{edu.degree} in {edu.field}</div>
                <div className="text-sm text-muted-foreground">{edu.institution}</div>
                <div className="text-xs text-muted-foreground">
                  Graduated: {new Date(edu.graduationDate).toLocaleDateString("en-US", {
                    month: "short",
                    year: "numeric",
                  })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CandidateSubmissionsTab({ submissions }: { submissions: Submission[] }) {
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
            <div className="font-medium">{submission.jobTitle}</div>
            <div className="text-sm text-muted-foreground">
              {submission.accountName} • {new Date(submission.submittedAt).toLocaleDateString()}
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

function CandidateActivityTab({
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

export default CandidateDrawer;
