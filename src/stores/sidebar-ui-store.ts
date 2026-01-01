import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Branded type for type-safe width values (Boris Cherny principle)
export type SidebarWidth = number & { readonly __brand: 'SidebarWidth' }

// Constants for width constraints
export const DEFAULT_WIDTH = 256 // matches Tailwind w-64 (16rem)
export const MIN_WIDTH = 200
export const MAX_WIDTH = 400
export const COLLAPSED_WIDTH = 64

// Helper to create branded SidebarWidth
function createSidebarWidth(width: number): SidebarWidth {
  const clamped = Math.max(MIN_WIDTH, Math.min(MAX_WIDTH, width))
  return clamped as SidebarWidth
}

// Discriminated union for sidebar state (Boris Cherny principle)
export type SidebarState =
  | { readonly mode: 'expanded'; readonly width: SidebarWidth }
  | { readonly mode: 'collapsed' }

interface SidebarUIStore {
  // State
  readonly state: SidebarState

  // Actions
  toggleCollapsed: () => void
  setWidth: (width: number) => void
  resetToDefault: () => void
}

export const useSidebarUI = create<SidebarUIStore>()(
  persist(
    (set) => ({
      // Initial state: expanded with default width
      state: {
        mode: 'expanded',
        width: createSidebarWidth(DEFAULT_WIDTH),
      },

      // Toggle between collapsed and expanded
      toggleCollapsed: () =>
        set((prev) => {
          if (prev.state.mode === 'collapsed') {
            // Expand to previous width or default
            return {
              state: {
                mode: 'expanded',
                width: createSidebarWidth(DEFAULT_WIDTH),
              },
            }
          } else {
            // Collapse
            return {
              state: { mode: 'collapsed' },
            }
          }
        }),

      // Set width (only when expanded)
      setWidth: (width: number) =>
        set((prev) => {
          if (prev.state.mode === 'expanded') {
            return {
              state: {
                mode: 'expanded',
                width: createSidebarWidth(width),
              },
            }
          }
          return prev
        }),

      // Reset to default width and expand
      resetToDefault: () =>
        set({
          state: {
            mode: 'expanded',
            width: createSidebarWidth(DEFAULT_WIDTH),
          },
        }),
    }),
    {
      name: 'sidebar-ui-preferences',
      // Only persist the state
      partialize: (state) => ({ state: state.state }),
    }
  )
)

