'use client';

import React from 'react';
import Link from 'next/link';
import { Search, Home } from 'lucide-react';
import { cn } from '@/lib/utils';
import { UserMenu } from './UserMenu';
import { NotificationsDropdown } from './NotificationsDropdown';
import { layoutTokens } from '@/lib/navigation';

interface HeaderProps {
  onSearchClick?: () => void;
  className?: string;
}

/**
 * Application header component
 * Based on 01-LAYOUT-SHELL.md header specification
 * Height: 56px, fixed top, white background with bottom border
 */
export function Header({ onSearchClick, className }: HeaderProps) {
  return (
    <header
      className={cn(
        'h-14 bg-white border-b border-border fixed top-0 left-0 right-0 z-50',
        'flex items-center justify-between px-4',
        className
      )}
      style={{ height: layoutTokens.header.height }}
    >
      {/* Left Section - Logo & Navigation */}
      <div className="flex items-center gap-4">
        {/* Logo */}
        <Link
          href="/employee/workspace"
          className="flex items-center gap-3 hover:opacity-80 transition-opacity"
        >
          <div className="w-8 h-8 bg-forest rounded-lg flex items-center justify-center">
            <span className="text-white font-bold text-sm">IT</span>
          </div>
          <span className="font-heading font-bold text-lg text-charcoal hidden sm:block">
            InTime
          </span>
        </Link>

        {/* Divider */}
        <div className="h-6 w-px bg-border mx-2 hidden sm:block" />

        {/* Home Link */}
        <Link
          href="/employee/portal"
          className="flex items-center gap-2 text-muted-foreground hover:text-charcoal transition-colors hidden sm:flex"
        >
          <Home size={16} />
          <span className="text-sm">Home</span>
        </Link>
      </div>

      {/* Center Section - Search */}
      <div className="flex-1 max-w-md mx-4">
        <button
          onClick={onSearchClick}
          className={cn(
            'w-full h-9 bg-stone-50 border border-border rounded-lg',
            'flex items-center gap-2 px-3',
            'text-sm text-muted-foreground',
            'hover:border-forest/50 focus:ring-2 focus:ring-forest/20 focus:border-forest',
            'transition-all'
          )}
        >
          <Search size={16} className="text-muted-foreground" />
          <span className="hidden sm:inline">Search jobs, talent, accounts...</span>
          <span className="sm:hidden">Search...</span>
          <kbd className="ml-auto hidden md:inline-flex h-5 items-center gap-1 rounded border bg-muted px-1.5 font-mono text-xs">
            <span className="text-xs">⌘</span>K
          </kbd>
        </button>
      </div>

      {/* Right Section - Actions */}
      <div className="flex items-center gap-2">
        <NotificationsDropdown />
        <UserMenu />
      </div>
    </header>
  );
}
