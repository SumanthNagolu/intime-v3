'use client';

/**
 * Admin Users List Renderer
 *
 * A specialized renderer for the admin users list screen with filtering,
 * search, status tabs, and user management actions.
 */

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { trpc } from '@/lib/trpc/client';
import type { ScreenDefinition } from '@/lib/metadata/types';
import { cn } from '@/lib/utils';
import {
  UserPlus,
  Upload,
  Download,
  Search,
  User,
  ChevronRight,
  Loader2,
  AlertCircle,
  UserX,
  UserCheck,
  Key,
  MoreHorizontal,
} from 'lucide-react';

interface AdminUsersListRendererProps {
  /** Screen definition */
  definition: ScreenDefinition;
  /** Additional className */
  className?: string;
}

// Type definitions to match tRPC input schemas
type UserStatus = 'active' | 'pending' | 'inactive' | 'suspended';
type UserRole = 'admin' | 'recruiting_manager' | 'recruiter' | 'bench_sales_manager' | 'bench_sales' | 'hr_manager' | 'ta' | 'cfo' | 'coo' | 'ceo';
type Department = 'recruiting' | 'bench_sales' | 'hr' | 'finance' | 'operations' | 'executive';

// Status badge colors
const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700 border-green-200',
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  inactive: 'bg-stone-100 text-stone-600 border-stone-200',
  suspended: 'bg-red-100 text-red-700 border-red-200',
};

// Role badge colors
const ROLE_COLORS: Record<string, string> = {
  admin: 'bg-red-100 text-red-700 border-red-200',
  recruiting_manager: 'bg-blue-100 text-blue-700 border-blue-200',
  recruiter: 'bg-cyan-100 text-cyan-700 border-cyan-200',
  bench_sales_manager: 'bg-purple-100 text-purple-700 border-purple-200',
  bench_sales: 'bg-violet-100 text-violet-700 border-violet-200',
  hr_manager: 'bg-green-100 text-green-700 border-green-200',
  ta: 'bg-teal-100 text-teal-700 border-teal-200',
  cfo: 'bg-orange-100 text-orange-700 border-orange-200',
  coo: 'bg-orange-100 text-orange-700 border-orange-200',
  ceo: 'bg-orange-100 text-orange-700 border-orange-200',
};

// Format date
function formatDate(date: string | Date | null | undefined): string {
  if (!date) return '-';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Format relative time
function formatRelativeTime(date: string | Date | null | undefined): string {
  if (!date) return 'Never';
  const d = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(date);
}

// Format enum values
function formatEnum(value: string | null | undefined): string {
  if (!value) return '-';
  return value
    .replace(/_/g, ' ')
    .replace(/\b\w/g, (c) => c.toUpperCase());
}

// Get initials from name
function getInitials(name: string | null | undefined): string {
  if (!name) return '?';
  return name
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);
}

/**
 * Admin Users List Renderer Component
 */
export function AdminUsersListRenderer({ definition, className }: AdminUsersListRendererProps) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<UserStatus | null>(null);
  const [roleFilter, setRoleFilter] = useState<UserRole | null>(null);
  const [departmentFilter, setDepartmentFilter] = useState<Department | null>(null);
  const [page, setPage] = useState(1);
  const pageSize = 25;

  // Fetch users list
  const usersQuery = trpc.admin.users.list.useQuery(
    {
      page,
      pageSize,
      search: searchQuery || undefined,
      sortBy: 'fullName',
      sortDirection: 'asc',
      filters: {
        status: statusFilter || undefined,
        role: roleFilter ? [roleFilter] : undefined,
        department: departmentFilter ? [departmentFilter] : undefined,
      },
    },
    {
      refetchInterval: 30000,
    }
  );

  // Fetch user statistics
  const statsQuery = trpc.admin.users.stats.useQuery(undefined, {
    refetchInterval: 60000,
  });

  // Deactivate mutation
  const deactivateMutation = trpc.admin.users.deactivate.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      statsQuery.refetch();
    },
  });

  // Reactivate mutation
  const reactivateMutation = trpc.admin.users.reactivate.useMutation({
    onSuccess: () => {
      usersQuery.refetch();
      statsQuery.refetch();
    },
  });

  // Process data
  const users = usersQuery.data?.items ?? [];
  const total = usersQuery.data?.total ?? 0;
  const stats = statsQuery.data;

  // Loading state
  const isLoading = usersQuery.isLoading;

  // Error state
  if (usersQuery.error) {
    return (
      <div className={cn('p-6 bg-red-50 border border-red-200 rounded-lg', className)}>
        <div className="flex items-start gap-3">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h2 className="text-lg font-semibold text-red-800">Error Loading Users</h2>
            <p className="mt-2 text-red-700">{usersQuery.error.message}</p>
          </div>
        </div>
      </div>
    );
  }

  // Handle user deactivation
  const handleDeactivate = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to deactivate this user? They will lose access to the system.')) {
      await deactivateMutation.mutateAsync({ id: userId });
    }
  };

  // Handle user reactivation
  const handleReactivate = async (userId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    await reactivateMutation.mutateAsync({ id: userId });
  };

  return (
    <div className={cn('admin-users-list space-y-6', className)}>
      {/* Header */}
      <header>
        <div className="flex items-start justify-between gap-4">
          <div>
            <nav className="mb-2">
              <ol className="flex items-center gap-2 text-sm text-stone-500">
                <li>Admin</li>
                <li>/</li>
                <li className="text-stone-900">Users</li>
              </ol>
            </nav>
            <h1 className="text-2xl font-bold text-stone-900">Users</h1>
            <p className="mt-1 text-stone-500">
              Manage user accounts and access
            </p>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2">
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              <Upload size={16} />
              Import
            </button>
            <button
              className="px-4 py-2 rounded-lg text-sm font-medium bg-stone-100 hover:bg-stone-200 transition-colors flex items-center gap-2"
            >
              <Download size={16} />
              Export
            </button>
            <Link
              href="/employee/admin/users/invite"
              className="px-4 py-2 rounded-lg text-sm font-medium bg-rust text-white hover:bg-rust/90 transition-colors flex items-center gap-2"
            >
              <UserPlus size={16} />
              Invite User
            </Link>
          </div>
        </div>
      </header>

      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Total Users
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-900">
            {isLoading ? '-' : stats?.total ?? 0}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Active
          </div>
          <div className="mt-1 text-2xl font-bold text-green-600">
            {isLoading ? '-' : stats?.active ?? 0}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Pending
          </div>
          <div className="mt-1 text-2xl font-bold text-yellow-600">
            {isLoading ? '-' : stats?.pending ?? 0}
          </div>
        </div>
        <div className="bg-white border border-stone-200 rounded-xl p-4">
          <div className="text-xs text-stone-500 uppercase tracking-wide font-medium">
            Inactive
          </div>
          <div className="mt-1 text-2xl font-bold text-stone-600">
            {isLoading ? '-' : stats?.inactive ?? 0}
          </div>
        </div>
      </div>

      {/* Status Tabs */}
      <div className="flex items-center gap-2 border-b border-stone-200 pb-4">
        <button
          onClick={() => setStatusFilter(null)}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            !statusFilter ? 'bg-rust text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
        >
          All ({stats?.total ?? 0})
        </button>
        <button
          onClick={() => setStatusFilter('active')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            statusFilter === 'active' ? 'bg-green-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
        >
          Active ({stats?.active ?? 0})
        </button>
        <button
          onClick={() => setStatusFilter('pending')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            statusFilter === 'pending' ? 'bg-yellow-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
        >
          Pending ({stats?.pending ?? 0})
        </button>
        <button
          onClick={() => setStatusFilter('inactive')}
          className={cn(
            'px-4 py-2 text-sm font-medium rounded-lg transition-colors',
            statusFilter === 'inactive' ? 'bg-stone-600 text-white' : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
          )}
        >
          Inactive ({stats?.inactive ?? 0})
        </button>
      </div>

      {/* Search and Filters */}
      <div className="flex items-center gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" size={18} />
          <input
            type="text"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none"
          />
        </div>

        <select
          value={roleFilter ?? ''}
          onChange={(e) => setRoleFilter((e.target.value || null) as UserRole | null)}
          className="px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none bg-white"
        >
          <option value="">All Roles</option>
          <option value="admin">Admin</option>
          <option value="recruiting_manager">Recruiting Manager</option>
          <option value="recruiter">Recruiter</option>
          <option value="bench_sales_manager">Bench Sales Manager</option>
          <option value="bench_sales">Bench Sales</option>
          <option value="hr_manager">HR Manager</option>
          <option value="ta">Talent Acquisition</option>
        </select>

        <select
          value={departmentFilter ?? ''}
          onChange={(e) => setDepartmentFilter((e.target.value || null) as Department | null)}
          className="px-4 py-2 border border-stone-200 rounded-lg focus:ring-2 focus:ring-rust/20 focus:border-rust outline-none bg-white"
        >
          <option value="">All Departments</option>
          <option value="recruiting">Recruiting</option>
          <option value="bench_sales">Bench Sales</option>
          <option value="hr">Human Resources</option>
          <option value="finance">Finance</option>
          <option value="operations">Operations</option>
          <option value="executive">Executive</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-white border border-stone-200 rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="animate-spin text-rust" size={32} />
          </div>
        ) : users.length === 0 ? (
          <div className="text-center py-12">
            <User className="mx-auto text-stone-300" size={48} />
            <p className="mt-4 text-stone-500">No users found</p>
            {searchQuery && (
              <p className="text-sm text-stone-400">Try adjusting your search terms</p>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-stone-50 border-b border-stone-200">
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Role
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Department
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Pod
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Last Active
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-stone-500 uppercase tracking-wider">
                    Created
                  </th>
                  <th className="px-4 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {users.map((user) => (
                  <tr
                    key={user.id}
                    onClick={() => router.push(`/employee/admin/users/${user.id}`)}
                    className="hover:bg-stone-50 cursor-pointer transition-colors group"
                    data-testid="user-row"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-rust/10 flex items-center justify-center text-rust font-medium">
                          {getInitials(user.fullName)}
                        </div>
                        <div>
                          <div className="font-medium text-stone-900">{user.fullName || 'Unknown'}</div>
                          <div className="text-sm text-stone-500">{user.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                          ROLE_COLORS[user.role ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                        )}
                      >
                        {formatEnum(user.role)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-600">
                        {formatEnum(user.department)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-600">
                        {user.pod?.name ?? '-'}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span
                        className={cn(
                          'inline-flex px-2.5 py-1 text-xs font-medium rounded-full border',
                          STATUS_COLORS[user.status ?? ''] ?? 'bg-stone-100 text-stone-600 border-stone-200'
                        )}
                      >
                        {formatEnum(user.status)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-500">
                        {formatRelativeTime(user.lastLoginAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <span className="text-sm text-stone-500">
                        {formatDate(user.createdAt)}
                      </span>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-1">
                        {user.status === 'active' && (
                          <button
                            onClick={(e) => handleDeactivate(user.id, e)}
                            className="p-1.5 text-stone-400 hover:text-red-600 rounded transition-colors"
                            title="Deactivate"
                          >
                            <UserX size={16} />
                          </button>
                        )}
                        {user.status === 'inactive' && (
                          <button
                            onClick={(e) => handleReactivate(user.id, e)}
                            className="p-1.5 text-stone-400 hover:text-green-600 rounded transition-colors"
                            title="Reactivate"
                          >
                            <UserCheck size={16} />
                          </button>
                        )}
                        <ChevronRight
                          className="text-stone-300 group-hover:text-stone-500 transition-colors"
                          size={20}
                        />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && users.length > 0 && (
        <div className="flex items-center justify-between">
          <div className="text-sm text-stone-500">
            Showing {(page - 1) * pageSize + 1} - {Math.min(page * pageSize, total)} of {total} users
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1.5 text-sm font-medium rounded border border-stone-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
            >
              Previous
            </button>
            <span className="text-sm text-stone-600">
              Page {page} of {Math.ceil(total / pageSize)}
            </span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={page >= Math.ceil(total / pageSize)}
              className="px-3 py-1.5 text-sm font-medium rounded border border-stone-200 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-stone-50"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default AdminUsersListRenderer;
