/**
 * tRPC Client
 *
 * Type-safe tRPC React client.
 * Import and use this in your components.
 */

import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '@/server/trpc/root';

/**
 * tRPC React hooks
 *
 * Usage:
 * ```ts
 * const { data } = trpc.users.me.useQuery();
 * const mutation = trpc.users.updateProfile.useMutation();
 * ```
 */
export const trpc = createTRPCReact<AppRouter>();
