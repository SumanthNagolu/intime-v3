import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface AcademyStore {
  // Sprint state
  isSprintActive: boolean;
  joinSprint: () => void;
  leaveSprint: () => void;

  // API Key for Gemini (optional)
  hasApiKey: boolean;
  apiKey: string | null;
  setApiKey: (key: string) => void;
  checkKey: () => void;

  // AI Mentor state
  isMentorOpen: boolean;
  openMentor: () => void;
  closeMentor: () => void;
  toggleMentor: () => void;
}

export const useAppStore = create<AcademyStore>()(
  persist(
    (set, get) => ({
      // Sprint state
      isSprintActive: false,
      joinSprint: () => set({ isSprintActive: true }),
      leaveSprint: () => set({ isSprintActive: false }),

      // API Key
      hasApiKey: false,
      apiKey: null,
      setApiKey: (key: string) => set({ apiKey: key, hasApiKey: true }),
      checkKey: () => {
        const key = localStorage.getItem('gemini-api-key');
        if (key) {
          set({ apiKey: key, hasApiKey: true });
        }
      },

      // AI Mentor
      isMentorOpen: false,
      openMentor: () => set({ isMentorOpen: true }),
      closeMentor: () => set({ isMentorOpen: false }),
      toggleMentor: () => set((state) => ({ isMentorOpen: !state.isMentorOpen })),
    }),
    {
      name: 'academy-storage',
    }
  )
);
