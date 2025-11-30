/**
 * Accounts Mutation Hooks
 *
 * React Query hooks for account-related mutations.
 * Handles create, update, delete, and POC management.
 */

import { trpc } from '@/lib/trpc/client';
import { type CreateAccountInput, type CreatePOCInput } from '@/lib/adapters';
import { useInvalidateAccounts } from '../queries/accounts';

// ============================================
// CREATE HOOK
// ============================================

export interface CreateAccountOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
}

/**
 * Create a new account
 *
 * @example
 * ```tsx
 * const { createAccount, isCreating } = useCreateAccount();
 *
 * await createAccount({
 *   name: 'Tech Corp',
 *   industry: 'Technology',
 *   status: 'Prospect',
 *   type: 'Direct Client',
 * });
 * ```
 */
export function useCreateAccount(options: CreateAccountOptions = {}) {
  const invalidate = useInvalidateAccounts();

  const mutation = trpc.crm.accounts.create.useMutation({
    onSuccess: (data) => {
      invalidate.invalidateAll();
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    createAccount: async (input: CreateAccountInput) => {
      return mutation.mutateAsync(input as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================
// UPDATE HOOK
// ============================================

export interface UpdateAccountInput extends Partial<CreateAccountInput> {
  id: string;
}

export interface UpdateAccountOptions {
  onSuccess?: (data: unknown) => void;
  onError?: (error: Error) => void;
  optimistic?: boolean;
}

/**
 * Update an existing account
 *
 * @example
 * ```tsx
 * const { updateAccount, isUpdating } = useUpdateAccount();
 *
 * await updateAccount({
 *   id: 'account-id',
 *   status: 'Active',
 *   tier: 'gold',
 * });
 * ```
 */
export function useUpdateAccount(options: UpdateAccountOptions = {}) {
  const invalidate = useInvalidateAccounts();
  const utils = trpc.useUtils();

  const mutation = trpc.crm.accounts.update.useMutation({
    onMutate: async (newData) => {
      if (!options.optimistic) return;

      await utils.crm.accounts.getById.cancel({ id: newData.id });
      const previousAccount = utils.crm.accounts.getById.getData({ id: newData.id });

      if (previousAccount) {
        utils.crm.accounts.getById.setData(
          { id: newData.id },
          { ...previousAccount, ...newData }
        );
      }

      return { previousAccount };
    },
    onError: (error, newData, context) => {
      if (options.optimistic && context?.previousAccount) {
        utils.crm.accounts.getById.setData(
          { id: newData.id },
          context.previousAccount
        );
      }
      options.onError?.(error as unknown as Error);
    },
    onSuccess: (data, variables) => {
      invalidate.invalidateAll();
      invalidate.invalidateAccount(variables.id);
      options.onSuccess?.(data);
    },
  });

  return {
    updateAccount: async (input: UpdateAccountInput) => {
      return mutation.mutateAsync(input as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isUpdating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================
// DELETE HOOK
// ============================================

export interface DeleteAccountOptions {
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

/**
 * Delete an account (soft delete)
 *
 * @example
 * ```tsx
 * const { deleteAccount, isDeleting } = useDeleteAccount();
 *
 * await deleteAccount('account-id');
 * ```
 */
export function useDeleteAccount(options: DeleteAccountOptions = {}) {
  const invalidate = useInvalidateAccounts();

  const mutation = trpc.crm.accounts.delete.useMutation({
    onSuccess: () => {
      invalidate.invalidateAll();
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    deleteAccount: async (id: string) => {
      return mutation.mutateAsync({ id });
    },
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

// ============================================
// STATUS UPDATE HOOKS
// ============================================

export type AccountStatusAction = 'activate' | 'hold' | 'churn' | 'prospect';

/**
 * Quick status update for accounts
 *
 * @example
 * ```tsx
 * const { updateStatus } = useUpdateAccountStatus();
 *
 * await updateStatus('account-id', 'activate');
 * ```
 */
export function useUpdateAccountStatus(options: UpdateAccountOptions = {}) {
  const { updateAccount, isUpdating, error } = useUpdateAccount(options);

  const statusMap: Record<AccountStatusAction, CreateAccountInput['status']> = {
    activate: 'Active',
    hold: 'Hold',
    churn: 'Churned',
    prospect: 'Prospect',
  };

  return {
    updateStatus: async (id: string, action: AccountStatusAction) => {
      return updateAccount({
        id,
        status: statusMap[action],
      });
    },
    isUpdating,
    error,
  };
}

// ============================================
// TIER UPDATE HOOK
// ============================================

export type AccountTier = 'platinum' | 'gold' | 'silver' | 'bronze';

/**
 * Update account tier
 *
 * @example
 * ```tsx
 * const { updateTier } = useUpdateAccountTier();
 *
 * await updateTier('account-id', 'platinum');
 * ```
 */
export function useUpdateAccountTier(options: UpdateAccountOptions = {}) {
  const { updateAccount, isUpdating, error } = useUpdateAccount(options);

  return {
    updateTier: async (id: string, tier: AccountTier) => {
      return updateAccount({ id, tier });
    },
    isUpdating,
    error,
  };
}

// ============================================
// POC (POINT OF CONTACT) MUTATIONS
// ============================================

/**
 * Create a new POC for an account
 *
 * @example
 * ```tsx
 * const { createPoc, isCreating } = useCreatePoc();
 *
 * await createPoc({
 *   accountId: 'account-id',
 *   name: 'John Smith',
 *   email: 'john@example.com',
 *   role: 'Hiring Manager',
 *   influence: 'Decision Maker',
 * });
 * ```
 */
export function useCreatePoc(options: { onSuccess?: (data: unknown) => void; onError?: (error: Error) => void } = {}) {
  const invalidate = useInvalidateAccounts();

  const mutation = trpc.crm.pocs.create.useMutation({
    onSuccess: (data, variables) => {
      invalidate.invalidatePocs(variables.accountId);
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    createPoc: async (input: CreatePOCInput) => {
      // Transform CreatePOCInput to match backend schema
      const [firstName, ...lastNameParts] = input.name.split(' ');
      const lastName = lastNameParts.join(' ') || firstName;

      return mutation.mutateAsync({
        accountId: input.accountId,
        firstName,
        lastName,
        email: input.email,
        phone: input.phone,
        title: input.role,
        isPrimary: input.isPrimary,
      } as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isCreating: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

export interface UpdatePOCInput extends Partial<CreatePOCInput> {
  id: string;
}

/**
 * Update an existing POC
 */
export function useUpdatePoc(options: { onSuccess?: (data: unknown) => void; onError?: (error: Error) => void } = {}) {
  const invalidate = useInvalidateAccounts();

  const mutation = trpc.crm.pocs.update.useMutation({
    onSuccess: (data, _variables) => {
      // POC update needs accountId for cache invalidation
      // This might need adjustment based on actual return type
      invalidate.invalidateAll();
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    updatePoc: async (input: UpdatePOCInput) => {
      return mutation.mutateAsync(input as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isUpdating: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Delete a POC
 */
export function useDeletePoc(options: { onSuccess?: () => void; onError?: (error: Error) => void } = {}) {
  const invalidate = useInvalidateAccounts();

  const mutation = trpc.crm.pocs.delete.useMutation({
    onSuccess: () => {
      invalidate.invalidateAll();
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    deletePoc: async (id: string) => {
      return mutation.mutateAsync({ id });
    },
    isDeleting: mutation.isPending,
    error: mutation.error,
  };
}

/**
 * Set POC as primary contact
 */
export function useSetPrimaryPoc(options: { onSuccess?: () => void; onError?: (error: Error) => void } = {}) {
  const { updatePoc, isUpdating, error } = useUpdatePoc(options);

  return {
    setPrimary: async (id: string, accountId: string) => {
      return updatePoc({ id, accountId, isPrimary: true });
    },
    isUpdating,
    error,
  };
}

// ============================================
// BULK OPERATIONS
// ============================================

export interface BulkUpdateAccountsInput {
  ids: string[];
  update: Partial<CreateAccountInput>;
}

/**
 * Bulk update multiple accounts (client-side iteration)
 */
export function useBulkUpdateAccounts(options: UpdateAccountOptions = {}) {
  const { updateAccount, isUpdating } = useUpdateAccount(options);
  const invalidate = useInvalidateAccounts();

  return {
    bulkUpdate: async (input: BulkUpdateAccountsInput) => {
      const results = await Promise.allSettled(
        input.ids.map(id =>
          updateAccount({ id, ...input.update })
        )
      );

      invalidate.invalidateAll();

      const successful = results.filter(r => r.status === 'fulfilled').length;
      const failed = results.filter(r => r.status === 'rejected').length;

      return { successful, failed, total: input.ids.length };
    },
    isUpdating,
  };
}

/**
 * Bulk assign account manager to multiple accounts (server-side)
 * More efficient than client-side iteration for large batches
 *
 * @example
 * ```tsx
 * const { bulkAssign, isAssigning } = useBulkAssignAccounts();
 *
 * await bulkAssign({
 *   accountIds: ['id1', 'id2', 'id3'],
 *   accountManagerId: 'manager-id',
 * });
 * ```
 */
export function useBulkAssignAccounts(options: { onSuccess?: (data: unknown) => void; onError?: (error: Error) => void } = {}) {
  const invalidate = useInvalidateAccounts();

  const mutation = trpc.crm.accounts.bulkAssign.useMutation({
    onSuccess: (data) => {
      invalidate.invalidateAll();
      options.onSuccess?.(data);
    },
    onError: (error) => {
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    bulkAssign: async (input: { accountIds: string[]; accountManagerId: string }) => {
      return mutation.mutateAsync(input);
    },
    isAssigning: mutation.isPending,
    error: mutation.error,
    reset: mutation.reset,
  };
}

// ============================================
// ACTIVITY LOG
// ============================================

export interface LogActivityInput {
  accountId: string;
  type: 'call' | 'email' | 'meeting' | 'note';
  description: string;
}

/**
 * Log activity for an account
 *
 * @example
 * ```tsx
 * const { logActivity } = useLogAccountActivity();
 *
 * await logActivity({
 *   accountId: 'account-id',
 *   type: 'call',
 *   description: 'Discussed Q4 hiring plans',
 * });
 * ```
 */
export function useLogAccountActivity(options: { onSuccess?: () => void; onError?: (error: Error) => void } = {}) {
  const invalidate = useInvalidateAccounts();

  const mutation = trpc.crm.activities.create.useMutation({
    onSuccess: (data, variables) => {
      invalidate.invalidateAccount(variables.entityId);
      options.onSuccess?.();
    },
    onError: (error) => {
      options.onError?.(error as unknown as Error);
    },
  });

  return {
    logActivity: async (input: LogActivityInput) => {
      return mutation.mutateAsync({
        entityType: 'account',
        entityId: input.accountId,
        activityType: input.type,
        body: input.description,
      } as Parameters<typeof mutation.mutateAsync>[0]);
    },
    isLogging: mutation.isPending,
    error: mutation.error,
  };
}
