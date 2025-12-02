'use client';

import React from 'react';
import Link from 'next/link';
import { Home, LogOut } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface PortalLayoutProps {
  children: React.ReactNode;
  /** User info for display */
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  /** Current selected role */
  currentRole?: string;
  className?: string;
}

/**
 * Portal layout for /employee/portal routes
 * Simplified navigation with role selector and module cards
 */
export function PortalLayout({
  children,
  user,
  currentRole,
  className,
}: PortalLayoutProps) {
  return (
    <div className={cn('min-h-screen bg-background', className)}>
      {/* Header */}
      <header className="h-16 bg-white border-b border-border px-6 flex items-center justify-between">
        {/* Logo */}
        <Link href="/employee/portal" className="flex items-center gap-3">
          <div className="w-10 h-10 bg-forest rounded-lg flex items-center justify-center">
            <span className="text-white font-bold">IT</span>
          </div>
          <div>
            <span className="font-heading font-bold text-lg text-charcoal">
              InTime
            </span>
            <span className="text-xs text-muted-foreground ml-2">
              Employee Portal
            </span>
          </div>
        </Link>

        {/* User Menu */}
        <div className="flex items-center gap-4">
          {user?.name && (
            <span className="text-sm text-muted-foreground">
              {user.name}
            </span>
          )}
          <Link href="/employee/workspace">
            <Button variant="outline" size="sm" className="gap-2">
              <Home size={16} />
              Workspace
            </Button>
          </Link>
          <Link href="/api/auth/signout">
            <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground">
              <LogOut size={16} />
              Sign Out
            </Button>
          </Link>
        </div>
      </header>

      {/* Main Content */}
      <main className="p-6 md:p-8 lg:p-12">
        <div className="max-w-6xl mx-auto">{children}</div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-stone-50/50 py-6">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between text-sm text-muted-foreground">
          <p>&copy; {new Date().getFullYear()} InTime Solutions</p>
          <div className="flex gap-4">
            <Link href="/help" className="hover:text-foreground">
              Help
            </Link>
            <Link href="/privacy" className="hover:text-foreground">
              Privacy
            </Link>
            <Link href="/terms" className="hover:text-foreground">
              Terms
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
