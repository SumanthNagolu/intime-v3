'use client';

import React from 'react';
import { AppShell } from './AppShell';
import type { UserRole } from '@/lib/navigation';

interface WorkspaceLayoutProps {
  children: React.ReactNode;
  /** User role for navigation */
  role?: UserRole;
  /** Base role for managers */
  baseRole?: 'recruiter' | 'bench_sales';
  /** User info */
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
}

/**
 * Workspace layout wrapper for /employee/workspace routes
 * Provides AppShell with role-based navigation
 */
export function WorkspaceLayout({
  children,
  role = 'recruiter',
  baseRole,
  user,
}: WorkspaceLayoutProps) {
  return (
    <AppShell role={role} baseRole={baseRole} user={user}>
      {children}
    </AppShell>
  );
}
