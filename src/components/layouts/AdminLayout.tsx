'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
  LayoutDashboard,
  Settings,
  Users,
  Shield,
  AlertTriangle,
  Loader2,
  UserCog,
  Briefcase,
  Flag,
  Activity,
  GitBranch,
  Plug,
  Bell,
  Database,
  FileSearch,
  Terminal,
  ChevronDown,
  ChevronRight,
  Mail,
  Lock,
  Globe,
  Key,
} from 'lucide-react';
import { trpc } from '@/lib/trpc/client';

interface AdminLayoutProps {
  children: React.ReactNode;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ElementType;
}

interface NavSection {
  title: string;
  icon: React.ElementType;
  items?: NavItem[];
  href?: string;
}

export const AdminLayout: React.FC<AdminLayoutProps> = ({ children }) => {
  const pathname = usePathname();
  const router = useRouter();
  const [expandedSections, setExpandedSections] = useState<Set<string>>(
    new Set(['Dashboard', 'User Management', 'Configuration', 'Integrations', 'Data Management', 'Audit & System'])
  );

  // Check if user has admin access using the database function
  const adminQuery = trpc.users.isAdmin.useQuery(undefined, {
    retry: false,
    refetchOnWindowFocus: false,
  });

  // Show loading state
  if (adminQuery.isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="animate-spin text-rust" size={32} />
      </div>
    );
  }

  // Show access denied if user doesn't have admin role
  if (!adminQuery.data?.isAdmin) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
        <AlertTriangle className="text-red-500 mb-4" size={48} />
        <h1 className="text-2xl font-bold text-stone-900 mb-2">Access Denied</h1>
        <p className="text-stone-600 mb-4">
          You do not have permission to access the admin area.
        </p>
        <button
          onClick={() => router.push('/employee/workspace')}
          className="px-4 py-2 bg-rust text-white rounded-lg hover:bg-rust/90 transition-colors"
        >
          Go to Workspace
        </button>
      </div>
    );
  }

  const toggleSection = (title: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(title)) {
      newExpanded.delete(title);
    } else {
      newExpanded.add(title);
    }
    setExpandedSections(newExpanded);
  };

  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/');

  const navigationSections: NavSection[] = [
    {
      title: 'Dashboard',
      icon: LayoutDashboard,
      href: '/employee/admin/dashboard',
    },
    {
      title: 'User Management',
      icon: Users,
      items: [
        { title: 'Users List', href: '/employee/admin/users', icon: Users },
        { title: 'Roles', href: '/employee/admin/roles', icon: Shield },
        { title: 'Pods', href: '/employee/admin/pods', icon: Briefcase },
        { title: 'Pending Invitations', href: '/employee/admin/pending-invitations', icon: Mail },
      ],
    },
    {
      title: 'Configuration',
      icon: Settings,
      items: [
        { title: 'Settings', href: '/employee/admin/settings', icon: Settings },
        { title: 'Permissions', href: '/employee/admin/permissions', icon: Shield },
        { title: 'Feature Flags', href: '/employee/admin/feature-flags', icon: Flag },
        { title: 'Activity Patterns', href: '/employee/admin/activity-patterns', icon: Activity },
        { title: 'SLA Config', href: '/employee/admin/sla', icon: UserCog },
        { title: 'Workflows', href: '/employee/admin/workflows', icon: GitBranch },
      ],
    },
    {
      title: 'Integrations',
      icon: Plug,
      items: [
        { title: 'Integrations Hub', href: '/employee/admin/integrations', icon: Plug },
        { title: 'Notifications', href: '/employee/admin/notifications', icon: Bell },
      ],
    },
    {
      title: 'Data Management',
      icon: Database,
      items: [
        { title: 'Data Hub', href: '/employee/admin/data', icon: Database },
      ],
    },
    {
      title: 'Audit & System',
      icon: FileSearch,
      items: [
        { title: 'Audit Logs', href: '/employee/admin/audit', icon: FileSearch },
        { title: 'System Logs', href: '/employee/admin/system-logs', icon: Terminal },
      ],
    },
  ];

  return (
    <div className="flex min-h-screen bg-stone-50">
      {/* Left Sidebar */}
      <aside className="w-64 bg-white border-r border-stone-200 flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-stone-200">
          <div className="text-rust font-bold text-xs uppercase tracking-[0.2em] mb-1">System Admin</div>
          <h2 className="text-lg font-serif font-bold text-charcoal">Admin Workspace</h2>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto py-4">
          {navigationSections.map((section) => (
            <div key={section.title} className="mb-2">
              {section.href ? (
                // Single link section (Dashboard)
                <Link
                  href={section.href}
                  className={`flex items-center gap-3 px-6 py-2.5 text-sm font-medium transition-colors ${
                    isActive(section.href)
                      ? 'text-rust bg-rust/5 border-r-2 border-rust'
                      : 'text-stone-700 hover:text-charcoal hover:bg-stone-50'
                  }`}
                >
                  <section.icon size={18} />
                  {section.title}
                </Link>
              ) : (
                // Collapsible section
                <>
                  <button
                    onClick={() => toggleSection(section.title)}
                    className="flex items-center justify-between w-full px-6 py-2.5 text-sm font-semibold text-stone-700 hover:text-charcoal hover:bg-stone-50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <section.icon size={18} />
                      {section.title}
                    </div>
                    {expandedSections.has(section.title) ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {expandedSections.has(section.title) && section.items && (
                    <div className="mt-1">
                      {section.items.map((item) => (
                        <Link
                          key={item.href}
                          href={item.href}
                          className={`flex items-center gap-3 pl-12 pr-6 py-2 text-sm transition-colors ${
                            isActive(item.href)
                              ? 'text-rust bg-rust/5 border-r-2 border-rust font-medium'
                              : 'text-stone-600 hover:text-charcoal hover:bg-stone-50'
                          }`}
                        >
                          <item.icon size={16} />
                          {item.title}
                        </Link>
                      ))}
                    </div>
                  )}
                </>
              )}
            </div>
          ))}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
};
