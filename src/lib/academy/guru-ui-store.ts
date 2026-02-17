'use client'

import { create } from 'zustand'

interface GuruUIState {
  isOpen: boolean
  open: () => void
  close: () => void
  toggle: () => void
}

export const useGuruUI = create<GuruUIState>((set) => ({
  isOpen: false,
  open: () => set({ isOpen: true }),
  close: () => set({ isOpen: false }),
  toggle: () => set((s) => ({ isOpen: !s.isOpen })),
}))
