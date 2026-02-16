import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// ============================================
// INBOX STORE
// State management for unified inbox
// ============================================

// Types for inbox filters
export type InboxItemType = 'task' | 'follow_up' | 'approval' | 'alert' | 'mention' | 'assignment'
export type InboxPriority = 'low' | 'normal' | 'high' | 'urgent'
export type InboxStatus = 'pending' | 'in_progress' | 'completed' | 'dismissed' | 'snoozed'
export type InboxDueFilter = 'overdue' | 'today' | 'this_week' | 'this_month' | 'all'
export type InboxSortBy = 'due_at' | 'priority' | 'created_at' | 'updated_at'
export type InboxSortOrder = 'asc' | 'desc'
export type InboxGroupBy = 'none' | 'due_date' | 'type' | 'priority' | 'entity_type'

// Filter state
interface InboxFilters {
  status: InboxStatus[]
  types: InboxItemType[]
  priorities: InboxPriority[]
  dueBy: InboxDueFilter
  entityType: string | null
  search: string
}

// Display preferences
interface InboxPreferences {
  sortBy: InboxSortBy
  sortOrder: InboxSortOrder
  groupBy: InboxGroupBy
  showCompleted: boolean
  compactMode: boolean
}

// Selected item state
interface InboxSelection {
  selectedId: string | null
  selectedIds: Set<string>
  isMultiSelect: boolean
}

interface InboxStore {
  // Filters
  filters: InboxFilters

  // Preferences
  preferences: InboxPreferences

  // Selection
  selection: InboxSelection

  // UI state
  filtersOpen: boolean
  isLoading: boolean

  // Filter actions
  setFilter: <K extends keyof InboxFilters>(key: K, value: InboxFilters[K]) => void
  toggleTypeFilter: (type: InboxItemType) => void
  togglePriorityFilter: (priority: InboxPriority) => void
  toggleStatusFilter: (status: InboxStatus) => void
  clearFilters: () => void
  setSearch: (search: string) => void

  // Preference actions
  setPreference: <K extends keyof InboxPreferences>(key: K, value: InboxPreferences[K]) => void
  toggleCompactMode: () => void
  toggleShowCompleted: () => void

  // Selection actions
  selectItem: (id: string) => void
  toggleSelectItem: (id: string) => void
  selectAll: (ids: string[]) => void
  clearSelection: () => void
  enableMultiSelect: () => void
  disableMultiSelect: () => void

  // UI actions
  toggleFiltersOpen: () => void
  setFiltersOpen: (open: boolean) => void
  setLoading: (loading: boolean) => void

  // Reset
  reset: () => void
}

const defaultFilters: InboxFilters = {
  status: ['pending', 'in_progress'],
  types: [],
  priorities: [],
  dueBy: 'all',
  entityType: null,
  search: '',
}

const defaultPreferences: InboxPreferences = {
  sortBy: 'due_at',
  sortOrder: 'asc',
  groupBy: 'due_date',
  showCompleted: false,
  compactMode: false,
}

const defaultSelection: InboxSelection = {
  selectedId: null,
  selectedIds: new Set(),
  isMultiSelect: false,
}

export const useInboxStore = create<InboxStore>()(
  persist(
    (set) => ({
      // Initial state
      filters: defaultFilters,
      preferences: defaultPreferences,
      selection: defaultSelection,
      filtersOpen: false,
      isLoading: false,

      // Filter actions
      setFilter: (key, value) =>
        set((state) => ({
          filters: { ...state.filters, [key]: value },
        })),

      toggleTypeFilter: (type) =>
        set((state) => {
          const types = state.filters.types.includes(type)
            ? state.filters.types.filter((t) => t !== type)
            : [...state.filters.types, type]
          return { filters: { ...state.filters, types } }
        }),

      togglePriorityFilter: (priority) =>
        set((state) => {
          const priorities = state.filters.priorities.includes(priority)
            ? state.filters.priorities.filter((p) => p !== priority)
            : [...state.filters.priorities, priority]
          return { filters: { ...state.filters, priorities } }
        }),

      toggleStatusFilter: (status) =>
        set((state) => {
          const statuses = state.filters.status.includes(status)
            ? state.filters.status.filter((s) => s !== status)
            : [...state.filters.status, status]
          return { filters: { ...state.filters, status: statuses } }
        }),

      clearFilters: () =>
        set({
          filters: defaultFilters,
        }),

      setSearch: (search) =>
        set((state) => ({
          filters: { ...state.filters, search },
        })),

      // Preference actions
      setPreference: (key, value) =>
        set((state) => ({
          preferences: { ...state.preferences, [key]: value },
        })),

      toggleCompactMode: () =>
        set((state) => ({
          preferences: { ...state.preferences, compactMode: !state.preferences.compactMode },
        })),

      toggleShowCompleted: () =>
        set((state) => ({
          preferences: { ...state.preferences, showCompleted: !state.preferences.showCompleted },
        })),

      // Selection actions
      selectItem: (id) =>
        set((state) => ({
          selection: {
            ...state.selection,
            selectedId: id,
            selectedIds: state.selection.isMultiSelect
              ? new Set([...state.selection.selectedIds, id])
              : new Set([id]),
          },
        })),

      toggleSelectItem: (id) =>
        set((state) => {
          const newIds = new Set(state.selection.selectedIds)
          if (newIds.has(id)) {
            newIds.delete(id)
          } else {
            newIds.add(id)
          }
          return {
            selection: {
              ...state.selection,
              selectedId: newIds.size > 0 ? id : null,
              selectedIds: newIds,
            },
          }
        }),

      selectAll: (ids) =>
        set((state) => ({
          selection: {
            ...state.selection,
            selectedId: ids[0] ?? null,
            selectedIds: new Set(ids),
            isMultiSelect: true,
          },
        })),

      clearSelection: () =>
        set((state) => ({
          selection: {
            ...state.selection,
            selectedId: null,
            selectedIds: new Set(),
          },
        })),

      enableMultiSelect: () =>
        set((state) => ({
          selection: { ...state.selection, isMultiSelect: true },
        })),

      disableMultiSelect: () =>
        set((state) => ({
          selection: {
            ...state.selection,
            isMultiSelect: false,
            selectedIds: state.selection.selectedId
              ? new Set([state.selection.selectedId])
              : new Set(),
          },
        })),

      // UI actions
      toggleFiltersOpen: () =>
        set((state) => ({
          filtersOpen: !state.filtersOpen,
        })),

      setFiltersOpen: (open) =>
        set({
          filtersOpen: open,
        }),

      setLoading: (loading) =>
        set({
          isLoading: loading,
        }),

      // Reset
      reset: () =>
        set({
          filters: defaultFilters,
          preferences: defaultPreferences,
          selection: defaultSelection,
          filtersOpen: false,
          isLoading: false,
        }),
    }),
    {
      name: 'inbox-preferences',
      // Only persist preferences, not filters or selection
      partialize: (state) => ({
        preferences: state.preferences,
      }),
    }
  )
)
