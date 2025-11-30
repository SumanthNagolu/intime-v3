/**
 * TabRegistry
 *
 * Provides tab configurations for different entity types.
 * This allows easy customization of which tabs appear for each entity.
 */

import React, { ReactNode } from 'react';
import {
  MessageSquare,
  Users,
  FolderOpen,
  CheckSquare,
  FileText,
  Briefcase,
  Calendar,
  LayoutGrid,
  type LucideIcon,
} from 'lucide-react';
import type { EntityType } from '@/lib/workspace/entity-registry';
import type { WorkspaceTab } from './GenericEntityWorkspace';

// =====================================================
// TYPES
// =====================================================

export interface TabDefinition {
  id: string;
  label: string;
  icon: LucideIcon;
  entityTypes: EntityType[] | 'all';
  order: number;
}

export interface TabConfig {
  id: string;
  label: string;
  icon: LucideIcon;
  count?: number;
  content: ReactNode;
}

// =====================================================
// DEFAULT TAB DEFINITIONS
// =====================================================

export const DEFAULT_TABS: TabDefinition[] = [
  {
    id: 'overview',
    label: 'Overview',
    icon: LayoutGrid,
    entityTypes: 'all',
    order: 0,
  },
  {
    id: 'activity',
    label: 'Activity',
    icon: MessageSquare,
    entityTypes: 'all',
    order: 1,
  },
  {
    id: 'submissions',
    label: 'Submissions',
    icon: Users,
    entityTypes: ['job'],
    order: 2,
  },
  {
    id: 'pipeline',
    label: 'Pipeline',
    icon: Users,
    entityTypes: ['job'],
    order: 2,
  },
  {
    id: 'jobs',
    label: 'Jobs',
    icon: Briefcase,
    entityTypes: ['talent'],
    order: 2,
  },
  {
    id: 'interviews',
    label: 'Interviews',
    icon: Calendar,
    entityTypes: ['submission'],
    order: 2,
  },
  {
    id: 'documents',
    label: 'Documents',
    icon: FolderOpen,
    entityTypes: 'all',
    order: 3,
  },
  {
    id: 'tasks',
    label: 'Tasks',
    icon: CheckSquare,
    entityTypes: 'all',
    order: 4,
  },
];

// =====================================================
// HELPER FUNCTIONS
// =====================================================

/**
 * Get available tabs for an entity type
 */
export function getTabsForEntity(entityType: EntityType): TabDefinition[] {
  return DEFAULT_TABS.filter(
    (tab) => tab.entityTypes === 'all' || tab.entityTypes.includes(entityType)
  ).sort((a, b) => a.order - b.order);
}

/**
 * Build workspace tabs from definitions and content
 */
export function buildWorkspaceTabs(
  entityType: EntityType,
  contentMap: Record<string, { content: ReactNode; count?: number }>
): WorkspaceTab[] {
  const tabDefs = getTabsForEntity(entityType);

  return tabDefs
    .filter((def) => contentMap[def.id])
    .map((def) => ({
      id: def.id,
      label: def.label,
      icon: def.icon,
      count: contentMap[def.id]?.count,
      content: contentMap[def.id]?.content,
    }));
}

// =====================================================
// JOB TABS BUILDER
// =====================================================

export interface JobTabsContentMap {
  overview: ReactNode;
  activity: ReactNode;
  submissions: { content: ReactNode; count?: number };
  pipeline?: ReactNode;
  documents: { content: ReactNode; count?: number };
  tasks: { content: ReactNode; count?: number };
}

export function buildJobTabs(contentMap: Partial<JobTabsContentMap>): WorkspaceTab[] {
  const tabs: WorkspaceTab[] = [];

  if (contentMap.overview) {
    tabs.push({
      id: 'overview',
      label: 'Overview',
      icon: LayoutGrid,
      content: contentMap.overview,
    });
  }

  if (contentMap.activity) {
    tabs.push({
      id: 'activity',
      label: 'Activity',
      icon: MessageSquare,
      content: contentMap.activity,
    });
  }

  if (contentMap.submissions) {
    tabs.push({
      id: 'submissions',
      label: 'Submissions',
      icon: Users,
      count: contentMap.submissions.count,
      content: contentMap.submissions.content,
    });
  }

  if (contentMap.pipeline) {
    tabs.push({
      id: 'pipeline',
      label: 'Pipeline',
      icon: Users,
      content: contentMap.pipeline,
    });
  }

  if (contentMap.documents) {
    tabs.push({
      id: 'documents',
      label: 'Documents',
      icon: FolderOpen,
      count: contentMap.documents.count,
      content: contentMap.documents.content,
    });
  }

  if (contentMap.tasks) {
    tabs.push({
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      count: contentMap.tasks.count,
      content: contentMap.tasks.content,
    });
  }

  return tabs;
}

// =====================================================
// TALENT TABS BUILDER
// =====================================================

export interface TalentTabsContentMap {
  overview: ReactNode;
  jobs: { content: ReactNode; count?: number };
  activity: ReactNode;
  documents: { content: ReactNode; count?: number };
  tasks: { content: ReactNode; count?: number };
}

export function buildTalentTabs(contentMap: Partial<TalentTabsContentMap>): WorkspaceTab[] {
  const tabs: WorkspaceTab[] = [];

  if (contentMap.overview) {
    tabs.push({
      id: 'overview',
      label: 'Overview',
      icon: LayoutGrid,
      content: contentMap.overview,
    });
  }

  if (contentMap.jobs) {
    tabs.push({
      id: 'jobs',
      label: 'Jobs',
      icon: Briefcase,
      count: contentMap.jobs.count,
      content: contentMap.jobs.content,
    });
  }

  if (contentMap.activity) {
    tabs.push({
      id: 'activity',
      label: 'Activity',
      icon: MessageSquare,
      content: contentMap.activity,
    });
  }

  if (contentMap.documents) {
    tabs.push({
      id: 'documents',
      label: 'Documents',
      icon: FolderOpen,
      count: contentMap.documents.count,
      content: contentMap.documents.content,
    });
  }

  if (contentMap.tasks) {
    tabs.push({
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      count: contentMap.tasks.count,
      content: contentMap.tasks.content,
    });
  }

  return tabs;
}

// =====================================================
// SUBMISSION TABS BUILDER
// =====================================================

export interface SubmissionTabsContentMap {
  overview: ReactNode;
  interviews: { content: ReactNode; count?: number };
  activity: ReactNode;
  documents: { content: ReactNode; count?: number };
  tasks: { content: ReactNode; count?: number };
}

export function buildSubmissionTabs(
  contentMap: Partial<SubmissionTabsContentMap>
): WorkspaceTab[] {
  const tabs: WorkspaceTab[] = [];

  if (contentMap.overview) {
    tabs.push({
      id: 'overview',
      label: 'Overview',
      icon: LayoutGrid,
      content: contentMap.overview,
    });
  }

  if (contentMap.interviews) {
    tabs.push({
      id: 'interviews',
      label: 'Interviews',
      icon: Calendar,
      count: contentMap.interviews.count,
      content: contentMap.interviews.content,
    });
  }

  if (contentMap.activity) {
    tabs.push({
      id: 'activity',
      label: 'Activity',
      icon: MessageSquare,
      content: contentMap.activity,
    });
  }

  if (contentMap.documents) {
    tabs.push({
      id: 'documents',
      label: 'Documents',
      icon: FolderOpen,
      count: contentMap.documents.count,
      content: contentMap.documents.content,
    });
  }

  if (contentMap.tasks) {
    tabs.push({
      id: 'tasks',
      label: 'Tasks',
      icon: CheckSquare,
      count: contentMap.tasks.count,
      content: contentMap.tasks.content,
    });
  }

  return tabs;
}
