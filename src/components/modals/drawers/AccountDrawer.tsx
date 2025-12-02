"use client";

import * as React from "react";
import {
  Building,
  Globe,
  Phone,
  Mail,
  MapPin,
  Users,
  Briefcase,
  DollarSign,
  Activity,
  Edit,
  Archive,
  Trash2,
  Clock,
  Calendar,
} from "lucide-react";
import { EntityDrawerBase, type EntityAction, type EntityTab } from "./EntityDrawerBase";
import { cn } from "@/lib/utils";

interface Contact {
  id: string;
  name: string;
  email: string;
  phone?: string;
  title?: string;
  isPrimary: boolean;
}

interface Deal {
  id: string;
  name: string;
  amount: number;
  stage: string;
  probability: number;
  closeDate?: string;
}

interface Job {
  id: string;
  title: string;
  status: string;
  openings: number;
  filled: number;
}

interface AccountData {
  id: string;
  name: string;
  type: "prospect" | "client" | "partner" | "vendor" | "former_client";
  industry?: string;
  website?: string;
  phone?: string;
  email?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zip?: string;
    country?: string;
  };
  employeeCount?: number;
  annualRevenue?: number;
  description?: string;
  status: "active" | "inactive";
  tier?: "enterprise" | "mid_market" | "small_business";
  ownerId?: string;
  ownerName?: string;
  contacts: Contact[];
  deals: Deal[];
  jobs: Job[];
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

export interface AccountDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  account: AccountData | null;
  isLoading?: boolean;
  error?: string | null;
  onEdit?: () => void;
  onArchive?: () => void;
  onDelete?: () => void;
  onPrevious?: () => void;
  onNext?: () => void;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

const TYPE_CONFIG = {
  prospect: { label: "Prospect", color: "bg-yellow-100 text-yellow-700" },
  client: { label: "Client", color: "bg-green-100 text-green-700" },
  partner: { label: "Partner", color: "bg-blue-100 text-blue-700" },
  vendor: { label: "Vendor", color: "bg-purple-100 text-purple-700" },
  former_client: { label: "Former Client", color: "bg-gray-100 text-gray-700" },
};

const TIER_CONFIG = {
  enterprise: { label: "Enterprise", color: "text-purple-600" },
  mid_market: { label: "Mid-Market", color: "text-blue-600" },
  small_business: { label: "Small Business", color: "text-gray-600" },
};

export function AccountDrawer({
  isOpen,
  onClose,
  account,
  isLoading = false,
  error = null,
  onEdit,
  onArchive,
  onDelete,
  onPrevious,
  onNext,
  hasPrevious,
  hasNext,
}: AccountDrawerProps) {
  if (!account && !isLoading) {
    return null;
  }

  const actions: EntityAction[] = [
    ...(onEdit
      ? [{ id: "edit", label: "Edit Account", icon: <Edit className="h-4 w-4" />, onClick: onEdit }]
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

  const tabs: EntityTab[] = account
    ? [
        {
          id: "overview",
          label: "Overview",
          icon: <Building className="h-4 w-4" />,
          content: <AccountOverviewTab account={account} />,
        },
        {
          id: "contacts",
          label: "Contacts",
          icon: <Users className="h-4 w-4" />,
          badge: account.contacts.length,
          content: <AccountContactsTab contacts={account.contacts} />,
        },
        {
          id: "deals",
          label: "Deals",
          icon: <DollarSign className="h-4 w-4" />,
          badge: account.deals.length,
          content: <AccountDealsTab deals={account.deals} />,
        },
        {
          id: "jobs",
          label: "Jobs",
          icon: <Briefcase className="h-4 w-4" />,
          badge: account.jobs.length,
          content: <AccountJobsTab jobs={account.jobs} />,
        },
        {
          id: "activity",
          label: "Activity",
          icon: <Activity className="h-4 w-4" />,
          content: <AccountActivityTab activities={account.activities} />,
        },
      ]
    : [];

  const typeConfig = account ? TYPE_CONFIG[account.type] : null;

  const headerContent = account ? (
    <div className="flex flex-wrap items-center gap-2">
      {typeConfig && (
        <span className={cn("rounded-full px-2 py-1 text-xs font-medium", typeConfig.color)}>
          {typeConfig.label}
        </span>
      )}
      {account.tier && (
        <span className={cn("text-sm font-medium", TIER_CONFIG[account.tier].color)}>
          {TIER_CONFIG[account.tier].label}
        </span>
      )}
      {account.industry && (
        <span className="text-sm text-muted-foreground">{account.industry}</span>
      )}
    </div>
  ) : null;

  return (
    <EntityDrawerBase
      isOpen={isOpen}
      onClose={onClose}
      title={account?.name || "Loading..."}
      subtitle={account?.ownerName ? `Owner: ${account.ownerName}` : undefined}
      entityType="Account"
      entityId={account?.id || ""}
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

function AccountOverviewTab({ account }: { account: AccountData }) {
  const formatAddress = () => {
    if (!account.address) return null;
    const parts = [
      account.address.street,
      account.address.city,
      account.address.state,
      account.address.zip,
      account.address.country,
    ].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : null;
  };

  const address = formatAddress();

  return (
    <div className="space-y-6">
      {/* Contact Info */}
      <div className="space-y-3">
        <h4 className="text-sm font-medium">Contact Information</h4>
        <div className="space-y-2">
          {account.website && (
            <div className="flex items-center gap-3">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <a
                href={account.website}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-primary hover:underline"
              >
                {account.website}
              </a>
            </div>
          )}
          {account.phone && (
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${account.phone}`} className="text-sm hover:underline">
                {account.phone}
              </a>
            </div>
          )}
          {account.email && (
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${account.email}`} className="text-sm hover:underline">
                {account.email}
              </a>
            </div>
          )}
          {address && (
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm">{address}</span>
            </div>
          )}
        </div>
      </div>

      {/* Company Info */}
      <div className="grid gap-4 sm:grid-cols-2">
        {account.employeeCount !== undefined && (
          <div className="flex items-start gap-3">
            <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Employees</div>
              <div className="font-medium">{account.employeeCount.toLocaleString()}</div>
            </div>
          </div>
        )}
        {account.annualRevenue !== undefined && (
          <div className="flex items-start gap-3">
            <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
            <div>
              <div className="text-sm text-muted-foreground">Annual Revenue</div>
              <div className="font-medium">${(account.annualRevenue / 1000000).toFixed(1)}M</div>
            </div>
          </div>
        )}
      </div>

      {/* Description */}
      {account.description && (
        <div>
          <h4 className="text-sm font-medium mb-2">About</h4>
          <p className="text-sm text-muted-foreground">{account.description}</p>
        </div>
      )}

      {/* Summary Stats */}
      <div className="grid gap-4 sm:grid-cols-3 pt-4 border-t">
        <div className="text-center">
          <div className="text-2xl font-bold text-primary">{account.contacts.length}</div>
          <div className="text-xs text-muted-foreground">Contacts</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold text-green-600">
            ${account.deals.reduce((sum, d) => sum + d.amount, 0).toLocaleString()}
          </div>
          <div className="text-xs text-muted-foreground">Pipeline Value</div>
        </div>
        <div className="text-center">
          <div className="text-2xl font-bold">{account.jobs.filter((j) => j.status === "open").length}</div>
          <div className="text-xs text-muted-foreground">Open Jobs</div>
        </div>
      </div>

      {/* Timestamps */}
      <div className="flex gap-4 text-xs text-muted-foreground pt-4 border-t">
        <span>Created: {new Date(account.createdAt).toLocaleDateString()}</span>
        <span>Updated: {new Date(account.updatedAt).toLocaleDateString()}</span>
      </div>
    </div>
  );
}

function AccountContactsTab({ contacts }: { contacts: Contact[] }) {
  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No contacts yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {contacts.map((contact) => (
        <div key={contact.id} className="rounded-md border p-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-medium">{contact.name}</span>
                {contact.isPrimary && (
                  <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs text-primary">
                    Primary
                  </span>
                )}
              </div>
              {contact.title && (
                <div className="text-sm text-muted-foreground">{contact.title}</div>
              )}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap gap-3 text-sm">
            <a href={`mailto:${contact.email}`} className="text-primary hover:underline">
              {contact.email}
            </a>
            {contact.phone && (
              <a href={`tel:${contact.phone}`} className="text-muted-foreground hover:underline">
                {contact.phone}
              </a>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}

function AccountDealsTab({ deals }: { deals: Deal[] }) {
  if (deals.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No deals yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {deals.map((deal) => (
        <div key={deal.id} className="rounded-md border p-3">
          <div className="flex items-start justify-between">
            <div>
              <div className="font-medium">{deal.name}</div>
              <div className="text-sm text-muted-foreground">{deal.stage}</div>
            </div>
            <div className="text-right">
              <div className="font-medium text-green-600">${deal.amount.toLocaleString()}</div>
              <div className="text-xs text-muted-foreground">{deal.probability}% probability</div>
            </div>
          </div>
          {deal.closeDate && (
            <div className="mt-2 flex items-center gap-1 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              Close: {new Date(deal.closeDate).toLocaleDateString()}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

function AccountJobsTab({ jobs }: { jobs: Job[] }) {
  if (jobs.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        No jobs yet
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {jobs.map((job) => (
        <div key={job.id} className="flex items-center justify-between rounded-md border p-3">
          <div>
            <div className="font-medium">{job.title}</div>
            <div className="text-sm text-muted-foreground">
              {job.filled}/{job.openings} filled
            </div>
          </div>
          <span
            className={cn(
              "rounded-full px-2 py-1 text-xs font-medium",
              job.status === "open" ? "bg-green-100 text-green-700" : "bg-gray-100 text-gray-700"
            )}
          >
            {job.status}
          </span>
        </div>
      ))}
    </div>
  );
}

function AccountActivityTab({
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

export default AccountDrawer;
