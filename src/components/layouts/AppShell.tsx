'use client';

import React, { useState, useCallback } from 'react';
import { usePathname } from 'next/navigation';
import { TooltipProvider } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { layoutTokens, type NavSection, type UserRole, getNavSectionsForRole } from '@/lib/navigation';
import { Header } from './header';
import { Sidebar } from './sidebar';
import { CommandBar } from './command';

interface AppShellProps {
  children: React.ReactNode;
  /** User role for navigation */
  role?: UserRole;
  /** Base role for managers (recruiter or bench_sales) */
  baseRole?: 'recruiter' | 'bench_sales';
  /** Custom navigation sections (overrides role-based) */
  navSections?: NavSection[];
  /** User info for header */
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
  /** Hide sidebar completely */
  hideSidebar?: boolean;
  /** Hide header completely */
  hideHeader?: boolean;
  className?: string;
}

/**
 * Main application shell component
 * Based on 01-LAYOUT-SHELL.md specification
 * Combines header, sidebar, and main content area
 */
export function AppShell({
  children,
  role = 'recruiter',
  baseRole,
  navSections,
  user,
  defaultCollapsed = false,
  hideSidebar = false,
  hideHeader = false,
  className,
}: AppShellProps) {
  const pathname = usePathname();
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [commandBarOpen, setCommandBarOpen] = useState(false);

  // Get navigation sections based on role or use custom sections
  const sections = navSections || getNavSectionsForRole(role, baseRole);

  // Toggle sidebar collapse
  const handleToggleCollapse = useCallback(() => {
    setIsCollapsed((prev) => !prev);
  }, []);

  // Open command bar
  const handleSearchClick = useCallback(() => {
    setCommandBarOpen(true);
  }, []);

  // Calculate main content offset based on sidebar state
  const sidebarWidth = hideSidebar
    ? 0
    : isCollapsed
    ? layoutTokens.sidebar.widthCollapsed
    : layoutTokens.sidebar.widthExpanded;

  const headerHeight = hideHeader ? 0 : layoutTokens.header.height;

  return (
    <TooltipProvider>
      <div className={cn('min-h-screen bg-background', className)}>
        {/* Header */}
        {!hideHeader && <Header onSearchClick={handleSearchClick} />}

        {/* Sidebar */}
        {!hideSidebar && (
          <Sidebar
            sections={sections}
            isCollapsed={isCollapsed}
            onToggleCollapse={handleToggleCollapse}
            activePath={pathname || ''}
            pinnedItems={[]}
            recentItems={[]}
          />
        )}

        {/* Main Content */}
        <main
          className="transition-all duration-200 ease-in-out"
          style={{
            marginLeft: sidebarWidth,
            marginTop: headerHeight,
            minHeight: `calc(100vh - ${headerHeight}px)`,
          }}
        >
          {children}
        </main>

        {/* Command Bar */}
        <CommandBar open={commandBarOpen} onOpenChange={setCommandBarOpen} />
      </div>
    </TooltipProvider>
  );
}
