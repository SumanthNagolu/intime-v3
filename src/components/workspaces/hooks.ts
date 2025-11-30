/**
 * Workspace Hooks
 *
 * Custom hooks for workspace context and role-based functionality
 */

'use client';

import { useMemo } from 'react';
import { useWorkspaceStore } from '@/stores/workspace-store';
import { roleConfigs, type WorkspaceRole } from '@/lib/workspace/role-config';
import { type EntityType } from '@/lib/workspace/entity-registry';

// ============================================
// TYPES
// ============================================

export type WorkspaceContext = 'recruiting' | 'bench' | 'ta' | 'manager' | 'executive';

export interface WorkspaceContextResult {
  context: WorkspaceContext;
  role: WorkspaceRole;
  canEdit: boolean;
  canDelete: boolean;
  isLoading: boolean;
  permissions: {
    create: boolean;
    approve: boolean;
    view: boolean;
    export: boolean;
  };
}

// ============================================
// WORKSPACE CONTEXT HOOK
// ============================================

/**
 * Get workspace context for an entity
 * Returns role-based permissions and context
 */
export function useWorkspaceContext(
  _entityType: EntityType | string,
  _entityId?: string
): WorkspaceContextResult {
  const store = useWorkspaceStore();

  // Get the current role from store or default to recruiting
  // Handle SSR/hydration case where store might not be fully initialized
  const hasRoleDefaults = store && typeof store === 'object' && 'roleDefaults' in store && store.roleDefaults;
  const role = (hasRoleDefaults && store.roleDefaults?.recruiting?.defaultEntityType ? 'recruiting' : 'recruiting') as WorkspaceRole;

  // Get role configuration
  const roleConfig = roleConfigs?.[role] || roleConfigs?.recruiting || {
    permissions: {
      canCreateLeads: true,
      canCreateAccounts: true,
      canCreateDeals: true,
      canCreateJobs: true,
      canCreateSubmissions: true,
      canApproveSubmissions: false,
      canViewAnalytics: true,
      canExport: true
    },
  };

  // Map role permissions to workspace permissions
  const permissions = {
    create: roleConfig?.permissions?.canCreateSubmissions || roleConfig?.permissions?.canCreateJobs || false,
    approve: roleConfig?.permissions?.canApproveSubmissions || false,
    view: roleConfig?.permissions?.canViewAnalytics || true,
    export: roleConfig?.permissions?.canExport || true,
  };

  // Map role to context
  const contextMap: Record<WorkspaceRole, WorkspaceContext> = {
    recruiting: 'recruiting',
    bench: 'bench',
    ta: 'ta',
    manager: 'manager',
    executive: 'executive',
  };

  return {
    context: contextMap[role] || 'recruiting',
    role,
    canEdit: permissions.create,
    canDelete: permissions.approve, // Only approvers can delete
    isLoading: false,
    permissions,
  };
}

// ============================================
// CONTEXT TABS HOOK
// ============================================

/**
 * Get tab configuration based on context and entity type
 */
export function useContextTabs(entityType: EntityType | string, context: WorkspaceContext) {
  const roleConfig = useMemo(() => {
    const roleMap: Record<WorkspaceContext, WorkspaceRole> = {
      recruiting: 'recruiting',
      bench: 'bench',
      ta: 'ta',
      manager: 'manager',
      executive: 'executive',
    };
    return roleConfigs[roleMap[context]] || roleConfigs.recruiting;
  }, [context]);

  // Get default tabs for this entity type from role config
  const defaultTabs = useMemo(() => {
    if (!roleConfig?.defaultTabs) return [];
    const entityTabs = roleConfig.defaultTabs[entityType as EntityType];
    return entityTabs || [];
  }, [roleConfig, entityType]);

  return {
    tabs: defaultTabs,
    defaultTab: defaultTabs[0]?.id || 'overview',
  };
}

// ============================================
// ACTIVE ENTITY HOOK
// ============================================

/**
 * Get and set the active entity in workspace
 */
export function useActiveEntity() {
  const store = useWorkspaceStore();

  return {
    activeType: store?.activeEntityType || null,
    activeId: store?.selectedEntityId || null,
    setActiveEntity: (type: EntityType, id: string) => {
      store?.selectEntity?.(type, id);
    },
    clearActiveEntity: () => {
      store?.clearSelection?.();
    },
  };
}

// ============================================
// RECENT ITEMS HOOK
// ============================================

/**
 * Manage recently viewed items
 */
export function useRecentItems() {
  const store = useWorkspaceStore();

  return {
    items: store?.recentlyViewed || [],
    addItem: (item: { id: string; type: EntityType; title: string; subtitle?: string }) => {
      store?.addRecentItem?.(item);
    },
    clearItems: () => {
      store?.clearRecentItems?.();
    },
  };
}

// ============================================
// PINNED ITEMS HOOK
// ============================================

/**
 * Manage pinned items
 */
export function usePinnedItems() {
  const store = useWorkspaceStore();

  return {
    items: store?.pinnedItems || [],
    isPinned: (type: EntityType, id: string) => store?.isPinned?.(type, id) || false,
    togglePin: (item: { id: string; type: EntityType; title: string; subtitle?: string }) => {
      const isPinned = store?.isPinned?.(item.type, item.id);
      if (isPinned) {
        store?.unpinItem?.(item.type, item.id);
      } else {
        store?.pinItem?.(item);
      }
    },
    pinItem: (item: { id: string; type: EntityType; title: string; subtitle?: string }) => {
      store?.pinItem?.(item);
    },
    unpinItem: (type: EntityType, id: string) => {
      store?.unpinItem?.(type, id);
    },
  };
}

// ============================================
// QUICK ACTIONS HOOK
// ============================================

/**
 * Get quick actions for current context
 */
export function useQuickActions(entityType: EntityType | string, context: WorkspaceContext) {
  const roleConfig = useMemo(() => {
    const roleMap: Record<WorkspaceContext, WorkspaceRole> = {
      recruiting: 'recruiting',
      bench: 'bench',
      ta: 'ta',
      manager: 'manager',
      executive: 'executive',
    };
    return roleConfigs[roleMap[context]] || roleConfigs.recruiting;
  }, [context]);

  return roleConfig?.quickActions || [];
}

// ============================================
// VIEW MODE HOOK
// ============================================

/**
 * Manage view mode (list, kanban, grid, graph)
 */
export function useViewMode() {
  const store = useWorkspaceStore();

  return {
    mode: store?.viewMode || 'list',
    setMode: (mode: 'list' | 'kanban' | 'grid' | 'graph') => {
      store?.setViewMode?.(mode);
    },
  };
}

// ============================================
// FILTERS HOOK
// ============================================

/**
 * Manage workspace filters
 */
export function useFilters(entityType?: EntityType) {
  const store = useWorkspaceStore();

  return {
    filters: entityType && store?.activeFilters ? store.activeFilters[entityType] || {} : store?.activeFilters || {},
    searchQuery: store?.searchQuery || '',
    setFilter: (type: EntityType, filters: Record<string, unknown>) => {
      store?.setFilters?.(type, filters);
    },
    setSearchQuery: (query: string) => {
      store?.setSearchQuery?.(query);
    },
    clearFilters: (type?: EntityType) => {
      store?.clearFilters?.(type);
    },
  };
}
