'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { usePathname } from 'next/navigation';
import type { NavigationState, PinnedItem, RecentItem, UserRole } from './types';
import { getNavSectionsForRole } from './navConfig';

const STORAGE_KEY_COLLAPSED = 'intime-sidebar-collapsed';
const STORAGE_KEY_PINNED = 'intime-pinned-items';
const STORAGE_KEY_RECENT = 'intime-recent-items';
const MAX_RECENT_ITEMS = 5;
const MAX_PINNED_ITEMS = 5;

interface UseNavigationOptions {
  /** User role for navigation */
  role?: UserRole;
  /** Base role for managers */
  baseRole?: 'recruiter' | 'bench_sales';
  /** Initial collapsed state */
  defaultCollapsed?: boolean;
}

interface UseNavigationReturn {
  /** Current navigation state */
  state: NavigationState;
  /** Navigation sections for current role */
  sections: ReturnType<typeof getNavSectionsForRole>;
  /** Toggle sidebar collapse */
  toggleCollapse: () => void;
  /** Set collapsed state */
  setCollapsed: (collapsed: boolean) => void;
  /** Pin an item */
  pinItem: (item: Omit<PinnedItem, 'id'>) => void;
  /** Unpin an item */
  unpinItem: (id: string) => void;
  /** Check if item is pinned */
  isPinned: (entityType: string, entityId: string) => boolean;
  /** Add to recent items */
  addRecentItem: (item: Omit<RecentItem, 'viewedAt'>) => void;
  /** Clear recent items */
  clearRecentItems: () => void;
  /** Badge counts for navigation items */
  badgeCounts: Record<string, number>;
  /** Update badge count */
  updateBadgeCount: (key: string, count: number) => void;
}

/**
 * Navigation state management hook
 * Handles sidebar collapse, pinned items, recent items, and badge counts
 */
export function useNavigation(options: UseNavigationOptions = {}): UseNavigationReturn {
  const { role = 'recruiter', baseRole, defaultCollapsed = false } = options;
  const pathname = usePathname();

  // Collapsed state with localStorage persistence
  const [isCollapsed, setIsCollapsed] = useState(() => {
    if (typeof window === 'undefined') return defaultCollapsed;
    const stored = localStorage.getItem(STORAGE_KEY_COLLAPSED);
    return stored ? JSON.parse(stored) : defaultCollapsed;
  });

  // Pinned items with localStorage persistence
  const [pinnedItems, setPinnedItems] = useState<PinnedItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY_PINNED);
    return stored ? JSON.parse(stored) : [];
  });

  // Recent items with localStorage persistence
  const [recentItems, setRecentItems] = useState<RecentItem[]>(() => {
    if (typeof window === 'undefined') return [];
    const stored = localStorage.getItem(STORAGE_KEY_RECENT);
    return stored ? JSON.parse(stored).map((item: RecentItem) => ({
      ...item,
      viewedAt: new Date(item.viewedAt),
    })) : [];
  });

  // Badge counts (typically from API)
  const [badgeCounts, setBadgeCounts] = useState<Record<string, number>>({});

  // Get navigation sections for role
  const sections = useMemo(() => {
    return getNavSectionsForRole(role, baseRole);
  }, [role, baseRole]);

  // Persist collapsed state
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_COLLAPSED, JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  // Persist pinned items
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_PINNED, JSON.stringify(pinnedItems));
    }
  }, [pinnedItems]);

  // Persist recent items
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_RECENT, JSON.stringify(recentItems));
    }
  }, [recentItems]);

  // Toggle sidebar collapse
  const toggleCollapse = useCallback(() => {
    setIsCollapsed((prev: boolean) => !prev);
  }, []);

  // Set collapsed state
  const setCollapsed = useCallback((collapsed: boolean) => {
    setIsCollapsed(collapsed);
  }, []);

  // Pin an item
  const pinItem = useCallback((item: Omit<PinnedItem, 'id'>) => {
    const id = `${item.entityType}-${item.title.toLowerCase().replace(/\s+/g, '-')}`;
    setPinnedItems((prev) => {
      // Don't add duplicates
      if (prev.some((p) => p.id === id)) return prev;
      // Limit to max items
      const newItems = [{ ...item, id }, ...prev].slice(0, MAX_PINNED_ITEMS);
      return newItems;
    });
  }, []);

  // Unpin an item
  const unpinItem = useCallback((id: string) => {
    setPinnedItems((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Check if item is pinned
  const isPinned = useCallback(
    (entityType: string, entityId: string) => {
      return pinnedItems.some(
        (item) => item.entityType === entityType && item.id.includes(entityId)
      );
    },
    [pinnedItems]
  );

  // Add to recent items
  const addRecentItem = useCallback((item: Omit<RecentItem, 'viewedAt'>) => {
    setRecentItems((prev) => {
      // Remove existing entry for same item
      const filtered = prev.filter((r) => r.id !== item.id);
      // Add to front with current timestamp
      const newItems = [
        { ...item, viewedAt: new Date() },
        ...filtered,
      ].slice(0, MAX_RECENT_ITEMS);
      return newItems;
    });
  }, []);

  // Clear recent items
  const clearRecentItems = useCallback(() => {
    setRecentItems([]);
  }, []);

  // Update badge count
  const updateBadgeCount = useCallback((key: string, count: number) => {
    setBadgeCounts((prev) => ({ ...prev, [key]: count }));
  }, []);

  // Build navigation state
  const state: NavigationState = useMemo(() => ({
    isCollapsed,
    activePath: pathname || '',
    expandedSections: [],
    pinnedItems,
    recentItems,
  }), [isCollapsed, pathname, pinnedItems, recentItems]);

  return {
    state,
    sections,
    toggleCollapse,
    setCollapsed,
    pinItem,
    unpinItem,
    isPinned,
    addRecentItem,
    clearRecentItems,
    badgeCounts,
    updateBadgeCount,
  };
}
