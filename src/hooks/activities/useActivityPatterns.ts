/**
 * useActivityPatterns Hook
 *
 * Pattern management with recent/favorite patterns and quick create.
 */

import { useMemo, useState, useCallback, useEffect } from 'react';
import {
  ACTIVITY_PATTERNS,
  getPatternsByCategory,
  getPattern,
  getPatternFields,
  getPatternChecklist,
  type ActivityPattern,
  type PatternCategory,
  type PatternField,
  type ChecklistItem,
} from '@/lib/activities/patterns';

// ==========================================
// TYPES
// ==========================================

export interface PatternWithDefaults extends ActivityPattern {
  fields: PatternField[];
  checklist: ChecklistItem[];
}

export interface UseActivityPatternsOptions {
  /** Filter by category */
  category?: PatternCategory;

  /** Include recent patterns from localStorage */
  includeRecent?: boolean;

  /** Include favorite patterns from localStorage */
  includeFavorites?: boolean;

  /** Storage key prefix for user-specific data */
  storageKeyPrefix?: string;
}

export interface UseActivityPatternsReturn {
  /** All available patterns */
  patterns: ActivityPattern[];

  /** Patterns by category */
  patternsByCategory: Record<PatternCategory, ActivityPattern[]>;

  /** Recent patterns */
  recentPatterns: ActivityPattern[];

  /** Favorite patterns */
  favoritePatterns: ActivityPattern[];

  /** Get pattern by ID with full details */
  getPatternWithDefaults: (patternId: string) => PatternWithDefaults | null;

  /** Mark pattern as recently used */
  markAsRecent: (patternId: string) => void;

  /** Toggle pattern as favorite */
  toggleFavorite: (patternId: string) => void;

  /** Check if pattern is favorite */
  isFavorite: (patternId: string) => boolean;

  /** Search patterns */
  searchPatterns: (query: string) => ActivityPattern[];

  /** Categories with counts */
  categories: Array<{
    category: PatternCategory;
    label: string;
    count: number;
  }>;
}

// ==========================================
// CONSTANTS
// ==========================================

const MAX_RECENT_PATTERNS = 5;

const CATEGORY_LABELS: Record<PatternCategory, string> = {
  recruiting: 'Recruiting',
  bench_sales: 'Bench Sales',
  crm: 'CRM',
  hr: 'HR',
  general: 'General',
};

// ==========================================
// HOOK
// ==========================================

export function useActivityPatterns(
  options: UseActivityPatternsOptions = {}
): UseActivityPatternsReturn {
  const {
    category,
    includeRecent = true,
    includeFavorites = true,
    storageKeyPrefix = 'activity_patterns',
  } = options;

  const [recentIds, setRecentIds] = useState<string[]>([]);
  const [favoriteIds, setFavoriteIds] = useState<string[]>([]);

  // Load from localStorage on mount
  useEffect(() => {
    if (typeof window === 'undefined') return;

    try {
      const storedRecent = localStorage.getItem(`${storageKeyPrefix}_recent`);
      if (storedRecent) {
        setRecentIds(JSON.parse(storedRecent));
      }

      const storedFavorites = localStorage.getItem(`${storageKeyPrefix}_favorites`);
      if (storedFavorites) {
        setFavoriteIds(JSON.parse(storedFavorites));
      }
    } catch (e) {
      console.warn('Failed to load pattern preferences from localStorage');
    }
  }, [storageKeyPrefix]);

  // Get all patterns
  const allPatterns = useMemo(() => Object.values(ACTIVITY_PATTERNS), []);

  // Filter by category if specified
  const patterns = useMemo(() => {
    if (category) {
      return getPatternsByCategory(category);
    }
    return allPatterns;
  }, [allPatterns, category]);

  // Group by category
  const patternsByCategory = useMemo(() => {
    const grouped: Record<PatternCategory, ActivityPattern[]> = {
      recruiting: [],
      bench_sales: [],
      crm: [],
      hr: [],
      general: [],
    };

    allPatterns.forEach(pattern => {
      grouped[pattern.category].push(pattern);
    });

    return grouped;
  }, [allPatterns]);

  // Categories with counts
  const categories = useMemo(() => {
    return (Object.keys(CATEGORY_LABELS) as PatternCategory[]).map(cat => ({
      category: cat,
      label: CATEGORY_LABELS[cat],
      count: patternsByCategory[cat].length,
    }));
  }, [patternsByCategory]);

  // Recent patterns
  const recentPatterns = useMemo(() => {
    if (!includeRecent) return [];
    return recentIds
      .map(id => getPattern(id))
      .filter((p): p is ActivityPattern => p !== undefined);
  }, [recentIds, includeRecent]);

  // Favorite patterns
  const favoritePatterns = useMemo(() => {
    if (!includeFavorites) return [];
    return favoriteIds
      .map(id => getPattern(id))
      .filter((p): p is ActivityPattern => p !== undefined);
  }, [favoriteIds, includeFavorites]);

  // Get pattern with defaults
  const getPatternWithDefaults = useCallback((patternId: string): PatternWithDefaults | null => {
    const pattern = getPattern(patternId);
    if (!pattern) return null;

    return {
      ...pattern,
      fields: getPatternFields(patternId),
      checklist: getPatternChecklist(patternId),
    };
  }, []);

  // Mark as recent
  const markAsRecent = useCallback((patternId: string) => {
    setRecentIds(current => {
      const filtered = current.filter(id => id !== patternId);
      const updated = [patternId, ...filtered].slice(0, MAX_RECENT_PATTERNS);

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${storageKeyPrefix}_recent`, JSON.stringify(updated));
      }

      return updated;
    });
  }, [storageKeyPrefix]);

  // Toggle favorite
  const toggleFavorite = useCallback((patternId: string) => {
    setFavoriteIds(current => {
      const isFav = current.includes(patternId);
      const updated = isFav
        ? current.filter(id => id !== patternId)
        : [...current, patternId];

      // Persist to localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem(`${storageKeyPrefix}_favorites`, JSON.stringify(updated));
      }

      return updated;
    });
  }, [storageKeyPrefix]);

  // Check if favorite
  const isFavorite = useCallback((patternId: string): boolean => {
    return favoriteIds.includes(patternId);
  }, [favoriteIds]);

  // Search patterns
  const searchPatterns = useCallback((query: string): ActivityPattern[] => {
    if (!query.trim()) return patterns;

    const lowerQuery = query.toLowerCase();
    return patterns.filter(pattern =>
      pattern.name.toLowerCase().includes(lowerQuery) ||
      pattern.description?.toLowerCase().includes(lowerQuery) ||
      pattern.category.toLowerCase().includes(lowerQuery)
    );
  }, [patterns]);

  return {
    patterns,
    patternsByCategory,
    recentPatterns,
    favoritePatterns,
    getPatternWithDefaults,
    markAsRecent,
    toggleFavorite,
    isFavorite,
    searchPatterns,
    categories,
  };
}

export default useActivityPatterns;
