'use client';

import React, { useState } from 'react';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { layoutTokens } from '@/lib/navigation';
import { Button } from '@/components/ui/button';

interface WelcomeBannerProps {
  title: string;
  message?: string;
  onDismiss?: () => void;
}

function WelcomeBanner({ title, message, onDismiss }: WelcomeBannerProps) {
  return (
    <div className="relative bg-gradient-to-r from-forest to-forest/80 rounded-xl p-6 text-white mb-6">
      <div className="pr-8">
        <h2 className="text-xl font-heading font-bold">{title}</h2>
        {message && <p className="text-white/80 mt-1">{message}</p>}
      </div>
      {onDismiss && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute top-4 right-4 text-white/70 hover:text-white hover:bg-white/10"
          onClick={onDismiss}
        >
          <X size={16} />
        </Button>
      )}
    </div>
  );
}

interface StatCardProps {
  label: string;
  value: string | number;
  change?: {
    value: number;
    direction: 'up' | 'down';
  };
  icon?: React.ReactNode;
}

function StatCard({ label, value, change, icon }: StatCardProps) {
  return (
    <div className="bg-white rounded-xl border border-border p-4">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm text-muted-foreground">{label}</span>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </div>
      <div className="flex items-end gap-2">
        <span className="text-2xl font-bold text-charcoal">{value}</span>
        {change && (
          <span
            className={cn(
              'text-sm font-medium',
              change.direction === 'up' ? 'text-green-600' : 'text-red-600'
            )}
          >
            {change.direction === 'up' ? '+' : '-'}
            {Math.abs(change.value)}%
          </span>
        )}
      </div>
    </div>
  );
}

interface DashboardLayoutProps {
  children: React.ReactNode;
  /** Page title */
  title?: string;
  /** Welcome banner config */
  welcomeBanner?: {
    title: string;
    message?: string;
    dismissKey?: string; // localStorage key for dismissal
  };
  /** Quick stats to display */
  stats?: StatCardProps[];
  /** Number of columns for widget grid */
  columns?: 2 | 3;
  className?: string;
}

/**
 * Dashboard page layout
 * Provides optional welcome banner, stats row, and widget grid
 */
export function DashboardLayout({
  children,
  title,
  welcomeBanner,
  stats,
  columns = 2,
  className,
}: DashboardLayoutProps) {
  const [showBanner, setShowBanner] = useState(() => {
    if (!welcomeBanner) return false;
    if (typeof window === 'undefined') return true;
    if (!welcomeBanner.dismissKey) return true;
    return localStorage.getItem(welcomeBanner.dismissKey) !== 'dismissed';
  });

  const handleDismissBanner = () => {
    setShowBanner(false);
    if (welcomeBanner?.dismissKey) {
      localStorage.setItem(welcomeBanner.dismissKey, 'dismissed');
    }
  };

  return (
    <div
      className={cn('min-h-full', className)}
      style={{
        padding: `${layoutTokens.page.paddingY}px ${layoutTokens.page.paddingX}px`,
      }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Page Title */}
        {title && (
          <h1 className="text-2xl font-heading font-bold text-charcoal mb-6">
            {title}
          </h1>
        )}

        {/* Welcome Banner */}
        {welcomeBanner && showBanner && (
          <WelcomeBanner
            title={welcomeBanner.title}
            message={welcomeBanner.message}
            onDismiss={handleDismissBanner}
          />
        )}

        {/* Stats Row */}
        {stats && stats.length > 0 && (
          <div
            className={cn(
              'grid gap-4 mb-6',
              stats.length === 2 && 'grid-cols-2',
              stats.length === 3 && 'grid-cols-3',
              stats.length >= 4 && 'grid-cols-2 lg:grid-cols-4'
            )}
          >
            {stats.map((stat, index) => (
              <StatCard key={index} {...stat} />
            ))}
          </div>
        )}

        {/* Widget Grid */}
        <div
          className={cn(
            'grid gap-6',
            columns === 2 && 'grid-cols-1 lg:grid-cols-2',
            columns === 3 && 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3'
          )}
        >
          {children}
        </div>
      </div>
    </div>
  );
}

export { StatCard, WelcomeBanner };
