/**
 * useRCAI Hook
 *
 * Provides RCAI (Responsible, Accountable, Consulted, Informed) ownership management
 * for workspace components
 */

'use client';

import { useMemo, useCallback } from 'react';
import { trpc } from '@/lib/trpc/client';
import type {
  RCAIRoleType,
  RCAIPermissionType,
} from '@/lib/db/schema/raci';

// Entity types supported by the tRPC router
// Must match entityTypeValues in src/server/routers/object-owners.ts
type SupportedEntityType =
  | 'campaign'
  | 'lead'
  | 'deal'
  | 'account'
  | 'job'
  | 'job_order'
  | 'submission'
  | 'contact'
  | 'external_job'
  | 'candidate'
  | 'talent';

export interface RCAIOwner {
  id: string;
  userId: string;
  userName: string;
  userEmail?: string;
  avatarUrl?: string;
  role: RCAIRoleType;
  permission: RCAIPermissionType;
  isPrimary: boolean;
  assignedAt: Date;
  assignedBy?: string;
  notes?: string;
}

export interface UseRCAIResult {
  owners: RCAIOwner[];
  primaryOwner: RCAIOwner | null;
  editors: RCAIOwner[];
  isLoading: boolean;
  error: Error | null;

  // Mutations
  assignOwner: (
    userId: string,
    role: RCAIRoleType,
    options?: { permission?: RCAIPermissionType; notes?: string }
  ) => Promise<void>;
  removeOwner: (userId: string) => Promise<void>;
  transferOwnership: (
    newAccountableId: string,
    keepPreviousAs?: 'responsible' | 'consulted' | 'informed'
  ) => Promise<void>;
  updateOwner: (
    ownerId: string,
    updates: { role?: RCAIRoleType; permission?: RCAIPermissionType; notes?: string }
  ) => Promise<void>;

  // Helpers
  canUserEdit: (userId: string) => boolean;
  getUserRole: (userId: string) => RCAIRoleType | null;
  refetch: () => void;
}

export function useRCAI(
  entityType: SupportedEntityType,
  entityId: string
): UseRCAIResult {
  const utils = trpc.useUtils();

  // Query owners for entity
  const {
    data: ownersData,
    isLoading,
    error,
    refetch,
  } = trpc.objectOwners.getByEntity.useQuery(
    { entityType, entityId },
    { enabled: !!entityType && !!entityId }
  );

  // Mutations
  const assignMutation = trpc.objectOwners.assign.useMutation({
    onSuccess: () => {
      utils.objectOwners.getByEntity.invalidate({ entityType, entityId });
    },
  });

  const removeMutation = trpc.objectOwners.remove.useMutation({
    onSuccess: () => {
      utils.objectOwners.getByEntity.invalidate({ entityType, entityId });
    },
  });

  const transferMutation = trpc.objectOwners.transferOwnership.useMutation({
    onSuccess: () => {
      utils.objectOwners.getByEntity.invalidate({ entityType, entityId });
    },
  });

  const updateMutation = trpc.objectOwners.update.useMutation({
    onSuccess: () => {
      utils.objectOwners.getByEntity.invalidate({ entityType, entityId });
    },
  });

  // Transform owners data
  const owners = useMemo((): RCAIOwner[] => {
    if (!ownersData) return [];

    return ownersData.map((owner) => ({
      id: owner.id,
      userId: owner.userId,
      userName: owner.user
        ? `${owner.user.firstName || ''} ${owner.user.lastName || ''}`.trim() || owner.user.email || 'Unknown'
        : 'Unknown',
      userEmail: owner.user?.email || undefined,
      avatarUrl: owner.user?.avatarUrl || undefined,
      role: owner.role as RCAIRoleType,
      permission: owner.permission as RCAIPermissionType,
      isPrimary: owner.isPrimary || false,
      assignedAt: new Date(owner.assignedAt),
      assignedBy: owner.assignedBy || undefined,
      notes: owner.notes || undefined,
    }));
  }, [ownersData]);

  // Get primary owner (accountable)
  const primaryOwner = useMemo(() => {
    return owners.find((o) => o.isPrimary) || owners.find((o) => o.role === 'accountable') || null;
  }, [owners]);

  // Get editors (users with edit permission)
  const editors = useMemo(() => {
    return owners.filter((o) => o.permission === 'edit');
  }, [owners]);

  // Assign owner
  const assignOwner = useCallback(
    async (
      userId: string,
      role: RCAIRoleType,
      options?: { permission?: RCAIPermissionType; notes?: string }
    ) => {
      await assignMutation.mutateAsync({
        entityType,
        entityId,
        userId,
        role,
        permission: options?.permission,
        notes: options?.notes,
        assignmentType: 'manual',
      });
    },
    [assignMutation, entityType, entityId]
  );

  // Remove owner
  const removeOwner = useCallback(
    async (userId: string) => {
      await removeMutation.mutateAsync({
        entityType,
        entityId,
        userId,
      });
    },
    [removeMutation, entityType, entityId]
  );

  // Transfer ownership
  const transferOwnership = useCallback(
    async (
      newAccountableId: string,
      keepPreviousAs?: 'responsible' | 'consulted' | 'informed'
    ) => {
      await transferMutation.mutateAsync({
        entityType,
        entityId,
        newAccountableId,
        keepPreviousAs,
      });
    },
    [transferMutation, entityType, entityId]
  );

  // Update owner
  const updateOwner = useCallback(
    async (
      ownerId: string,
      updates: { role?: RCAIRoleType; permission?: RCAIPermissionType; notes?: string }
    ) => {
      await updateMutation.mutateAsync({
        id: ownerId,
        ...updates,
      });
    },
    [updateMutation]
  );

  // Check if user can edit
  const canUserEdit = useCallback(
    (userId: string): boolean => {
      const owner = owners.find((o) => o.userId === userId);
      return owner?.permission === 'edit';
    },
    [owners]
  );

  // Get user's role
  const getUserRole = useCallback(
    (userId: string): RCAIRoleType | null => {
      const owner = owners.find((o) => o.userId === userId);
      return owner?.role || null;
    },
    [owners]
  );

  return {
    owners,
    primaryOwner,
    editors,
    isLoading,
    error: error as Error | null,
    assignOwner,
    removeOwner,
    transferOwnership,
    updateOwner,
    canUserEdit,
    getUserRole,
    refetch,
  };
}

/**
 * Hook to check user's access to an entity
 */
export function useObjectAccess(
  entityType: SupportedEntityType,
  entityId: string,
  requiredPermission: RCAIPermissionType = 'view'
) {
  const { data, isLoading, error } = trpc.objectOwners.canAccess.useQuery(
    { entityType, entityId, requiredPermission },
    { enabled: !!entityType && !!entityId }
  );

  return {
    hasAccess: data?.hasAccess || false,
    permission: data?.permission as RCAIPermissionType | null,
    role: data?.role as RCAIRoleType | null,
    isLoading,
    error: error as Error | null,
  };
}

/**
 * Hook to get user's owned entities summary
 */
export function useMyOwnedEntities() {
  const { data, isLoading, error, refetch } = trpc.objectOwners.getMySummary.useQuery();

  return {
    summary: data || {},
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

/**
 * Hook to get entities owned by user
 */
export function useUserOwnedEntities(
  userId?: string,
  options?: {
    entityType?: SupportedEntityType;
    role?: RCAIRoleType;
    permission?: RCAIPermissionType;
    limit?: number;
    offset?: number;
  }
) {
  const {
    data,
    isLoading,
    error,
    refetch,
  } = trpc.objectOwners.getByUser.useQuery({
    userId,
    entityType: options?.entityType,
    role: options?.role,
    permission: options?.permission,
    limit: options?.limit || 50,
    offset: options?.offset || 0,
  });

  return {
    items: data?.items || [],
    total: data?.total || 0,
    isLoading,
    error: error as Error | null,
    refetch,
  };
}

export default useRCAI;
