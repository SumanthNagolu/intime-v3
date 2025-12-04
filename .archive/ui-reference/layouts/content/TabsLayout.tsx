'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { cn } from '@/lib/utils';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';

interface Tab {
  id: string;
  label: string;
  icon?: React.ReactNode;
  badge?: number | string;
  content: React.ReactNode;
  /** Lazy load content */
  lazy?: boolean;
}

interface TabsLayoutProps {
  tabs: Tab[];
  /** Default active tab (if not URL-synced) */
  defaultTab?: string;
  /** Sync active tab with URL query param */
  syncWithUrl?: boolean;
  /** URL query param name */
  urlParam?: string;
  /** Callback when tab changes */
  onTabChange?: (tabId: string) => void;
  /** Show loading state */
  isLoading?: boolean;
  className?: string;
}

/**
 * Tabbed content layout with optional URL sync
 */
export function TabsLayout({
  tabs,
  defaultTab,
  syncWithUrl = false,
  urlParam = 'tab',
  onTabChange,
  isLoading,
  className,
}: TabsLayoutProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Get current tab from URL or default
  const currentTab = syncWithUrl
    ? searchParams.get(urlParam) || defaultTab || tabs[0]?.id
    : defaultTab || tabs[0]?.id;

  // Handle tab change
  const handleTabChange = (tabId: string) => {
    if (syncWithUrl) {
      const params = new URLSearchParams(searchParams.toString());
      params.set(urlParam, tabId);
      router.push(`?${params.toString()}`, { scroll: false });
    }
    onTabChange?.(tabId);
  };

  if (tabs.length === 0) {
    return null;
  }

  return (
    <Tabs
      value={currentTab}
      onValueChange={handleTabChange}
      className={cn('w-full', className)}
    >
      <TabsList className="mb-4">
        {tabs.map((tab) => (
          <TabsTrigger
            key={tab.id}
            value={tab.id}
            className="gap-2"
          >
            {tab.icon}
            <span>{tab.label}</span>
            {tab.badge !== undefined && (
              <Badge variant="secondary" className="ml-1 h-5 px-1.5 text-xs">
                {tab.badge}
              </Badge>
            )}
          </TabsTrigger>
        ))}
      </TabsList>

      {tabs.map((tab) => (
        <TabsContent key={tab.id} value={tab.id}>
          {isLoading ? (
            <Skeleton className="h-[300px] w-full" />
          ) : (
            tab.content
          )}
        </TabsContent>
      ))}
    </Tabs>
  );
}
