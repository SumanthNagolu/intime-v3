'use client';

/**
 * EntityLinkColumn Component
 *
 * Clickable entity reference with icon and truncation.
 */

import * as React from 'react';
import Link from 'next/link';
import {
  Building2,
  Briefcase,
  User,
  FileText,
  Users,
  Target,
  Calendar,
  LucideIcon,
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import type { LinkConfig } from '../types';

// ==========================================
// ENTITY ICONS
// ==========================================

const entityIcons: Record<string, LucideIcon> = {
  account: Building2,
  client: Building2,
  job: Briefcase,
  candidate: User,
  submission: FileText,
  contact: Users,
  lead: Target,
  deal: Target,
  interview: Calendar,
  placement: Briefcase,
};

// ==========================================
// PROPS
// ==========================================

interface EntityLinkColumnProps {
  /** Display value (name/title) */
  value: string | null | undefined;

  /** Entity ID for linking */
  id: string | null | undefined;

  /** Entity type */
  entityType?: string;

  /** Link configuration */
  config?: LinkConfig;

  /** Additional class name */
  className?: string;
}

// ==========================================
// COMPONENT
// ==========================================

export function EntityLinkColumn({
  value,
  id,
  entityType,
  config = {},
  className,
}: EntityLinkColumnProps) {
  if (!value) {
    return <span className="text-muted-foreground">-</span>;
  }

  const {
    route,
    newTab = false,
    icon: CustomIcon,
    truncate,
  } = config;

  const Icon = CustomIcon ?? (entityType ? entityIcons[entityType] : undefined);
  const displayValue = truncate && value.length > truncate
    ? `${value.slice(0, truncate)}...`
    : value;
  const shouldTruncate = truncate && value.length > truncate;

  const content = (
    <span className={cn('flex items-center gap-1.5', className)}>
      {Icon && <Icon className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />}
      <span className="truncate">{displayValue}</span>
    </span>
  );

  // Wrap with tooltip if truncated
  const wrappedContent = shouldTruncate ? (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>{content}</TooltipTrigger>
        <TooltipContent>
          <p>{value}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  ) : (
    content
  );

  // Wrap with link if route provided
  if (route && id) {
    const href = route.replace('{id}', id);
    return (
      <Link
        href={href}
        className="text-primary hover:underline"
        target={newTab ? '_blank' : undefined}
        rel={newTab ? 'noopener noreferrer' : undefined}
        onClick={(e) => e.stopPropagation()} // Prevent row click
      >
        {wrappedContent}
      </Link>
    );
  }

  return wrappedContent;
}

// ==========================================
// SPECIALIZED ENTITY COLUMNS
// ==========================================

interface JobLinkColumnProps {
  job: { id: string; title: string } | null | undefined;
  className?: string;
}

export function JobLinkColumn({ job, className }: JobLinkColumnProps) {
  if (!job) return <span className="text-muted-foreground">-</span>;
  return (
    <EntityLinkColumn
      value={job.title}
      id={job.id}
      entityType="job"
      config={{ route: '/employee/recruiting/jobs/{id}' }}
      className={className}
    />
  );
}

interface AccountLinkColumnProps {
  account: { id: string; name: string } | null | undefined;
  className?: string;
}

export function AccountLinkColumn({ account, className }: AccountLinkColumnProps) {
  if (!account) return <span className="text-muted-foreground">-</span>;
  return (
    <EntityLinkColumn
      value={account.name}
      id={account.id}
      entityType="account"
      config={{ route: '/employee/crm/accounts/{id}' }}
      className={className}
    />
  );
}

interface CandidateLinkColumnProps {
  candidate: { id: string; name: string } | null | undefined;
  className?: string;
}

export function CandidateLinkColumn({ candidate, className }: CandidateLinkColumnProps) {
  if (!candidate) return <span className="text-muted-foreground">-</span>;
  return (
    <EntityLinkColumn
      value={candidate.name}
      id={candidate.id}
      entityType="candidate"
      config={{ route: '/employee/recruiting/candidates/{id}' }}
      className={className}
    />
  );
}

interface ContactLinkColumnProps {
  contact: { id: string; name: string } | null | undefined;
  className?: string;
}

export function ContactLinkColumn({ contact, className }: ContactLinkColumnProps) {
  if (!contact) return <span className="text-muted-foreground">-</span>;
  return (
    <EntityLinkColumn
      value={contact.name}
      id={contact.id}
      entityType="contact"
      config={{ route: '/employee/crm/contacts/{id}' }}
      className={className}
    />
  );
}

export default EntityLinkColumn;
