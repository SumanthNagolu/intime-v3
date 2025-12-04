/**
 * Navigation types for InTime v3 application
 * Supports role-based navigation with dynamic badges
 */

import type { LucideIcon } from 'lucide-react';

export type UserRole =
  | 'recruiter'
  | 'bench_sales'
  | 'hr_manager'
  | 'ta_specialist'
  | 'manager'
  | 'cfo'
  | 'coo'
  | 'ceo'
  | 'admin';

export type BadgeType =
  | 'taskCount'
  | 'openJobsCount'
  | 'pendingSubmissions'
  | 'onBenchCount'
  | 'immigrationAlerts'
  | 'pendingOnboarding'
  | 'escalationCount'
  | 'pendingApprovals'
  | 'overdueActivities'
  | 'awaitingInput'
  // TA-specific badges
  | 'openLeadsCount'
  | 'openDealsCount'
  | 'activeCampaigns'
  | 'pendingApplications'
  | 'activeEnrollments'
  | 'openInternalJobs'
  | null;

export interface NavItem {
  id: string;
  label: string;
  icon: LucideIcon;
  href: string;
  badge?: BadgeType;
  /** Permission required to see this item */
  permission?: UserRole | UserRole[];
  /** Nested items for expandable navigation */
  children?: NavItem[];
  /** External link opens in new tab */
  external?: boolean;
}

export interface NavSection {
  id: string;
  label: string;
  /** Permission required to see this section */
  permission?: UserRole | UserRole[];
  items: NavItem[];
  /** Whether section is collapsible */
  collapsible?: boolean;
  /** Default expanded state */
  defaultOpen?: boolean;
}

export interface NavConfig {
  sections: NavSection[];
}

export interface PinnedItem {
  id: string;
  entityType: 'job' | 'candidate' | 'account' | 'contact' | 'deal' | 'submission';
  title: string;
  href: string;
}

export interface RecentItem {
  id: string;
  entityType: 'job' | 'candidate' | 'account' | 'contact' | 'deal' | 'submission';
  title: string;
  href: string;
  viewedAt: Date;
}

export interface NavigationState {
  isCollapsed: boolean;
  activePath: string;
  expandedSections: string[];
  pinnedItems: PinnedItem[];
  recentItems: RecentItem[];
}

export interface CommandItem {
  id: string;
  type: 'entity' | 'action' | 'navigation';
  category: string;
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  href?: string;
  action?: () => void;
  keywords?: string[];
}

export interface CommandCategory {
  id: string;
  label: string;
  items: CommandItem[];
}

export interface NotificationItem {
  id: string;
  type: 'task_due' | 'submission_update' | 'mention' | 'system';
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
  href?: string;
}
