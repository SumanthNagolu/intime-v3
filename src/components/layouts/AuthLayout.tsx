'use client';

import React from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';

interface AuthLayoutProps {
  children: React.ReactNode;
  /** Optional title displayed above the card */
  title?: string;
  /** Optional subtitle */
  subtitle?: string;
  className?: string;
}

/**
 * Auth layout for login/signup pages
 * Centered card with no sidebar/header, branded background
 */
export function AuthLayout({
  children,
  title,
  subtitle,
  className,
}: AuthLayoutProps) {
  return (
    <div
      className={cn(
        'min-h-screen flex flex-col items-center justify-center',
        'bg-gradient-to-br from-stone-50 to-stone-100',
        'px-4 py-12',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-pattern opacity-5" />

      {/* Logo */}
      <Link href="/" className="flex items-center gap-3 mb-8 relative z-10">
        <div className="w-12 h-12 bg-forest rounded-xl flex items-center justify-center">
          <span className="text-white font-bold text-lg">IT</span>
        </div>
        <span className="font-heading font-bold text-2xl text-charcoal">
          InTime
        </span>
      </Link>

      {/* Title */}
      {(title || subtitle) && (
        <div className="text-center mb-6 relative z-10">
          {title && (
            <h1 className="text-2xl font-heading font-bold text-charcoal">
              {title}
            </h1>
          )}
          {subtitle && (
            <p className="text-muted-foreground mt-2">{subtitle}</p>
          )}
        </div>
      )}

      {/* Card */}
      <div
        className={cn(
          'w-full max-w-md',
          'bg-white rounded-2xl shadow-lg',
          'border border-border',
          'p-8',
          'relative z-10'
        )}
      >
        {children}
      </div>

      {/* Footer */}
      <p className="mt-8 text-sm text-muted-foreground relative z-10">
        &copy; {new Date().getFullYear()} InTime Solutions. All rights reserved.
      </p>
    </div>
  );
}
