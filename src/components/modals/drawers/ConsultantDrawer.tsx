"use client";

import * as React from "react";
import {
  User,
  Mail,
  Phone,
  MapPin,
  Briefcase,
  FileText,
  Activity,
  Edit,
  Archive,
  Trash2,
  Clock,
  Calendar,
  Shield,
  DollarSign,
  Building,
} from "lucide-react";
import { EntityDrawerBase, type EntityAction, type EntityTab } from "./EntityDrawerBase";
import { cn } from "@/lib/utils";

interface Placement {
  id: string;
  clientName: string;
  jobTitle: string;
  startDate: string;
  endDate?: string;
  status: "active" | "completed" | "terminated";
  billRate: number;
  payRate: number;
}

interface ImmigrationCase {
  id: string;
  visaType: string;
  status: string;
  expirationDate?: string;
  filingDate?: string;
}

interface HotlistEntry {
  id: string;
  hotlistName: string;
  addedAt: string;
}

interface ConsultantData {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  location?: string;
  currentTitle: string;
  skills: string[];
  yearsOfExperience: number;
  availability: "available" | "placed" | "on_bench" | "unavailable";
  availableDate?: string;
  desiredRate?: number;
  rateType?: "hourly" | "salary";
  workAuthorization: "citizen" | "green_card" | "h1b" | "opt" | "l1" | "other";
  visaStatus?: string;
  visaExpiration?: string;
  resumeUrl?: string;
  status: "active" | "inactive" | "archived";
  placements: Placement[];
  immigrationCases: ImmigrationCase[];
  hotlists: HotlistEntry[];
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

export interface ConsultantDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  consultant: ConsultantData | null;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onAddToHotlist?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const AVAILABILITY_CONFIG = {
  available: { label: "Available", color: "bg-green-100 text-green-700" },
  placed: { label: "Placed", color: "bg-blue-100 text-blue-700" },
  on_bench: { label: "On Bench", color: "bg-yellow-100 text-yellow-700" },
  unavailable: { label: "Unavailable", color: "bg-gray-100 text-gray-700" },
};

const WORK_AUTH_CONFIG = {
  citizen: { label: "US Citizen", color: "text-green-600" },
  green_card: { label: "Green Card", color: "text-green-600" },
  h1b: { label: "H-1B", color: "text-blue-600" },
  opt: { label: "OPT/CPT", color: "text-yellow-600" },
  l1: { label: "L-1", color: "text-purple-600" },
  other: { label: "Other", color: "text-gray-600" },
};

export function ConsultantDrawer({
  isOpen,
  onClose,
  consultant,
  isLoading = false,
  error = null,
  onEdit,
  onArchive,
  onDelete,
  onAddToHotlist,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: ConsultantDrawerProps) {
  if (!consultant && !isLoading) {
    return null;
  }

  const actions: EntityAction[] = [
    ...(onEdit
      ? [{ id: "edit", label: "Edit Consultant", icon: <Edit className="h-4 w-4" />, onClick: onEdit }]
      : []),
    ...(onAddToHotlist
      ? [
          {
            id: "hotlist",
            label: "Add to Hotlist",
            icon: <FileText className="h-4 w-4" />,
            onClick: onAddToHotlist,
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

  const tabs: EntityTab[] = consultant
    ? [
        {
          id: "overview",
          label: "Overview",
          icon: <User className="h-4 w-4" />,
          content: <ConsultantOverviewTab consultant={consultant} />,
        },
        {
          id: "placements",
          label: "Placements",
          icon: <Building className="h-4 w-4" />,
          badge: consultant.placements.length,
          content: <ConsultantPlacementsTab placements={consultant.placements} />,
        },
        {
          id: "immigration",
          label: "Immigration",
          icon: <Shield className="h-4 w-4" />,
          badge: consultant.immigrationCases.length,
          content: <ConsultantImmigrationTab consultant={consultant} />,
        },
        {
          id: "activity",
          label: "Activity",
          icon: <Activity className="h-4 w-4" />,
          content: <ConsultantActivityTab activities={consultant.activities} />,
        },
      ]
    : [];

  const availabilityConfig = consultant ? AVAILABILITY_CONFIG[consultant.availability] : null;
  const workAuthConfig = consultant ? WORK_AUTH_CONFIG[consultant.workAuthorization] : null;

  const headerContent = consultant ? (
    <div className="flex flex-wrap items-center gap-2">
      {availabilityConfig && (
        <span className={cn("rounded-full px-2 py-1 text-xs font-medium", availabilityConfig.color)}>
          {availabilityConfig.label}
        </span>
      )}
      {workAuthConfig && (
        <span className={cn("text-sm font-medium", workAuthConfig.color)}>
          {workAuthConfig.label}
        </span>
      )}
      <span className="text-sm text-muted-foreground">
        {consultant.yearsOfExperience} years exp
      </span>
    </div>
  ) : null;

  return (
    <EntityDrawerBase
      isOpen={isOpen}
      onClose={onClose}
      title={consultant ? `${consultant.firstName} ${consultant.lastName}` : "Loading..."}
      subtitle={consultant?.currentTitle}
      entityType="Consultant"
      entityId={consultant?.id || ""}
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

function ConsultantOverviewTab({ consultant }: { consultant: ConsultantData }) {
  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Contact Information</h4>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a href={`mailto:${consultant.email}`} className="text-sm hover:underline">
              {consultant.email}
            </a>
          </div>
          {consultant.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${consultant.phone}`} className="text-sm hover:underline">
                {consultant.phone}
              </a>
            </div>
          )}
          {consultant.location && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{consultant.location}</span>
            </div>
          )}
        </div>
      </div>

      {/* Key Details */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="flex items-start gap-3">
          <Briefcase className="h-5 w-5 text-muted-foreground mt-0.5" />
          <div>
            <div className="text-sm text-muted-foreground">Experience</div>
            <div className="font-medium">{consultant.yearsOfExperience} years</div>
          </div>
        </div>
        {consultant.desiredRate && (
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Desired Rate</div>
              <div className="font-medium">
                ${consultant.desiredRate}/{consultant.rateType === "salary" ? "yr" : "hr"}
              </div>
            </div>
          </div>
        )}
        {consultant.availableDate && (
          <div className="flex items-start gap-3">
            <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Available From</div>
              <div className="font-medium">
                {new Date(consultant.availableDate).toLocaleDateString()}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Skills */}
      {consultant.skills.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">Skills</h4>
          <div className="flex flex-wrap gap-2">
            {consultant.skills.map((skill) => (
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

      {/* Hotlists */}
      {consultant.hotlists.length > 0 && (
        <div>
          <h4 className="text-sm font-medium mb-2">On Hotlists</h4>
          <div className="flex flex-wrap gap-2">
            {consultant.hotlists.map((entry) => (
              <span
                key={entry.id}
                className="rounded-full border px-3 py-1 text-sm"
              >
                {entry.hotlistName}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Timestamps */}
      <div className="flex gap-4 text-xs text-muted-foreground pt-4 border-t">
        <span>Added: {new Date(consultant.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(consultant.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function ConsultantPlacementsTab({ placements }: { placements: Placement[] }) {
  if (placements.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No placements yet
      </div>
    );
  }

  const statusColors = {
    active: "bg-green-100 text-green-700",
    completed: "bg-blue-100 text-blue-700",
    terminated: "bg-red-100 text-red-700",
  };

  return (
    <div className="space-y-3">
      {placements.map((placement) => (
        <div key={placement.id} className="rounded-md border p-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium">{placement.jobTitle}</div>
              <div className="text-sm text-muted-foreground">{placement.clientName}</div>
            </div>
            <span
              className={cn("rounded-full px-2 py-1 text-xs font-medium", statusColors[placement.status])}
            >
              {placement.status}
            </span>
          </div>
          <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
            <div className="text-muted-foreground">
              {new Date(placement.startDate).toLocaleDateString()} -{" "}
              {placement.endDate ? new Date(placement.endDate).toLocaleDateString() : "Present"}
            </div>
            <div className="text-right">
              <span className="text-green-600">${placement.billRate}/hr</span>
              <span className="text-muted-foreground"> / </span>
              <span>${placement.payRate}/hr</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ConsultantImmigrationTab({ consultant }: { consultant: ConsultantData }) {
  const workAuthConfig = WORK_AUTH_CONFIG[consultant.workAuthorization];

  return (
    <div className="space-y-6">
      {/* Current Status */}
      <div className="rounded-md border p-4">
        <h4 className="text-sm font-medium mb-3">Work Authorization</h4>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <div className="text-sm text-muted-foreground">Type</div>
            <div className={cn("font-medium", workAuthConfig.color)}>{workAuthConfig.label}</div>
          </div>
          {consultant.visaExpiration && (
            <div>
              <div className="text-sm text-muted-foreground">Expiration</div>
              <div className="font-medium">
                {new Date(consultant.visaExpiration).toLocaleDateString()}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Immigration Cases */}
      <div>
        <h4 className="text-sm font-medium mb-3">Immigration Cases</h4>
        {consultant.immigrationCases.length === 0 ? (
          <p className="text-sm text-muted-foreground">No immigration cases</p>
        ) : (
          <div className="space-y-3">
            {consultant.immigrationCases.map((caseItem) => (
              <div key={caseItem.id} className="rounded-md border p-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-medium">{caseItem.visaType}</div>
                    <div className="text-sm text-muted-foreground">{caseItem.status}</div>
                  </div>
                </div>
                <div className="mt-2 flex gap-4 text-xs text-muted-foreground">
                  {caseItem.filingDate && (
                    <span>Filed: {new Date(caseItem.filingDate).toLocaleDateString()}</span>
                  )}
                  {caseItem.expirationDate && (
                    <span>Expires: {new Date(caseItem.expirationDate).toLocaleDateString()}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ConsultantActivityTab({
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

export default ConsultantDrawer;
