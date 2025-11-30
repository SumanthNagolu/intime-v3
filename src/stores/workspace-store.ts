/**
 * Workspace State Store
 *
 * Zustand store for managing unified workspace state.
 * Handles entity selection, view modes, filters, and recently viewed items.
 */

import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { immer } from 'zustand/middleware/immer';
import type { EntityType } from '@/lib/workspace/entity-registry';

// =====================================================
// TYPES
// =====================================================

export type ViewMode = 'list' | 'kanban' | 'graph' | 'grid';

export interface RecentItem {
  type: EntityType;
  id: string;
  title: string;
  subtitle?: string;
  timestamp: number;
}

export interface PinnedItem {
  type: EntityType;
  id: string;
  title: string;
  subtitle?: string;
  pinnedAt: number;
}

export interface WorkspaceFilters {
  status?: string[];
  owner?: string[];
  dateRange?: {
    start: string;
    end: string;
  };
  custom?: Record<string, unknown>;
}

export interface WorkspaceState {
  // Current selection
  activeEntityType: EntityType | null;
  selectedEntityId: string | null;

  // View settings
  viewMode: ViewMode;
  listWidth: number;
  isListCollapsed: boolean;

  // Search & filters
  searchQuery: string;
  activeFilters: Record<EntityType, WorkspaceFilters>;

  // Recently viewed (persisted)
  recentlyViewed: RecentItem[];
  maxRecentItems: number;

  // Pinned items (persisted)
  pinnedItems: PinnedItem[];
  maxPinnedItems: number;

  // Role-specific defaults
  roleDefaults: Record<string, {
    defaultEntityType: EntityType;
    defaultViewMode: ViewMode;
  }>;
}

export interface WorkspaceActions {
  // Selection
  selectEntity: (type: EntityType, id: string | null) => void;
  setActiveEntityType: (type: EntityType) => void;
  clearSelection: () => void;

  // View settings
  setViewMode: (mode: ViewMode) => void;
  setListWidth: (width: number) => void;
  toggleListCollapsed: () => void;

  // Search & filters
  setSearchQuery: (query: string) => void;
  setFilters: (type: EntityType, filters: WorkspaceFilters) => void;
  clearFilters: (type?: EntityType) => void;

  // Recently viewed
  addRecentItem: (item: Omit<RecentItem, 'timestamp'>) => void;
  clearRecentItems: () => void;

  // Pinned items
  pinItem: (item: Omit<PinnedItem, 'pinnedAt'>) => void;
  unpinItem: (type: EntityType, id: string) => void;
  isPinned: (type: EntityType, id: string) => boolean;

  // Reset
  reset: () => void;
}

// =====================================================
// INITIAL STATE
// =====================================================

const initialState: WorkspaceState = {
  activeEntityType: null,
  selectedEntityId: null,
  viewMode: 'list',
  listWidth: 320,
  isListCollapsed: false,
  searchQuery: '',
  activeFilters: {} as Record<EntityType, WorkspaceFilters>,
  recentlyViewed: [],
  maxRecentItems: 20,
  pinnedItems: [],
  maxPinnedItems: 10,
  roleDefaults: {
    recruiting: { defaultEntityType: 'job', defaultViewMode: 'kanban' },
    bench: { defaultEntityType: 'talent', defaultViewMode: 'list' },
    ta: { defaultEntityType: 'lead', defaultViewMode: 'kanban' },
    manager: { defaultEntityType: 'submission', defaultViewMode: 'kanban' },
    executive: { defaultEntityType: 'deal', defaultViewMode: 'kanban' },
  },
};

// =====================================================
// STORE
// =====================================================

export const useWorkspaceStore = create<WorkspaceState & WorkspaceActions>()(
  persist(
    immer((set, get) => ({
      ...initialState,

      // Selection
      selectEntity: (type, id) => {
        set((state) => {
          state.activeEntityType = type;
          state.selectedEntityId = id;
        });
      },

      setActiveEntityType: (type) => {
        set((state) => {
          state.activeEntityType = type;
          state.selectedEntityId = null;
        });
      },

      clearSelection: () => {
        set((state) => {
          state.selectedEntityId = null;
        });
      },

      // View settings
      setViewMode: (mode) => {
        set((state) => {
          state.viewMode = mode;
        });
      },

      setListWidth: (width) => {
        set((state) => {
          state.listWidth = width;
        });
      },

      toggleListCollapsed: () => {
        set((state) => {
          state.isListCollapsed = !state.isListCollapsed;
        });
      },

      // Search & filters
      setSearchQuery: (query) => {
        set((state) => {
          state.searchQuery = query;
        });
      },

      setFilters: (type, filters) => {
        set((state) => {
          state.activeFilters[type] = filters;
        });
      },

      clearFilters: (type) => {
        set((state) => {
          if (type) {
            delete state.activeFilters[type];
          } else {
            state.activeFilters = {} as Record<EntityType, WorkspaceFilters>;
          }
          state.searchQuery = '';
        });
      },

      // Recently viewed
      addRecentItem: (item) => {
        set((state) => {
          // Remove existing entry for same item
          state.recentlyViewed = state.recentlyViewed.filter(
            (r: RecentItem) => !(r.type === item.type && r.id === item.id)
          );

          // Add to front with timestamp
          state.recentlyViewed.unshift({
            ...item,
            timestamp: Date.now(),
          });

          // Trim to max
          if (state.recentlyViewed.length > state.maxRecentItems) {
            state.recentlyViewed = state.recentlyViewed.slice(0, state.maxRecentItems);
          }
        });
      },

      clearRecentItems: () => {
        set((state) => {
          state.recentlyViewed = [];
        });
      },

      // Pinned items
      pinItem: (item) => {
        set((state) => {
          // Check if already pinned
          const exists = state.pinnedItems.some(
            (p: PinnedItem) => p.type === item.type && p.id === item.id
          );
          if (exists) return;

          // Add to front
          state.pinnedItems.unshift({
            ...item,
            pinnedAt: Date.now(),
          });

          // Trim to max
          if (state.pinnedItems.length > state.maxPinnedItems) {
            state.pinnedItems = state.pinnedItems.slice(0, state.maxPinnedItems);
          }
        });
      },

      unpinItem: (type, id) => {
        set((state) => {
          state.pinnedItems = state.pinnedItems.filter(
            (p: PinnedItem) => !(p.type === type && p.id === id)
          );
        });
      },

      isPinned: (type, id) => {
        return get().pinnedItems.some((p: PinnedItem) => p.type === type && p.id === id);
      },

      // Reset
      reset: () => {
        set(initialState);
      },
    })),
    {
      name: 'intime-workspace',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        // Only persist these fields
        viewMode: state.viewMode,
        listWidth: state.listWidth,
        recentlyViewed: state.recentlyViewed,
        pinnedItems: state.pinnedItems,
      }),
    }
  )
);

// =====================================================
// SELECTORS
// =====================================================

export const selectActiveEntity = (state: WorkspaceState) => ({
  type: state.activeEntityType,
  id: state.selectedEntityId,
});

export const selectFiltersForType = (type: EntityType) => (state: WorkspaceState) =>
  state.activeFilters[type] || {};

export const selectRecentByType = (type: EntityType) => (state: WorkspaceState) =>
  state.recentlyViewed.filter((r) => r.type === type);

export const selectPinnedByType = (type: EntityType) => (state: WorkspaceState) =>
  state.pinnedItems.filter((p) => p.type === type);

// =====================================================
// HOOKS
// =====================================================

export function useActiveEntity() {
  return useWorkspaceStore((state) => selectActiveEntity(state));
}

export function useFilters(type: EntityType) {
  return useWorkspaceStore(selectFiltersForType(type));
}

export function useRecentItems(type?: EntityType) {
  return useWorkspaceStore((state) =>
    type ? selectRecentByType(type)(state) : state.recentlyViewed
  );
}

export function usePinnedItems(type?: EntityType) {
  return useWorkspaceStore((state) =>
    type ? selectPinnedByType(type)(state) : state.pinnedItems
  );
}
