import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

/** Where the user last left off reading, used for "Continue reading". */
export interface LastRead {
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  updatedAt: number;
}

export interface QuranBookmark {
  id: string;
  surahNumber: number;
  surahName: string;
  ayahNumber: number;
  snippet: string; // short Arabic preview
}

interface QuranState {
  lastRead: LastRead | null;
  bookmarks: QuranBookmark[];

  setLastRead: (lastRead: Omit<LastRead, 'updatedAt'>) => void;
  toggleBookmark: (bookmark: QuranBookmark) => void;
  isBookmarked: (ayahId: string) => boolean;
}

export const useQuranStore = create<QuranState>()(
  persist(
    (set, get) => ({
      lastRead: null,
      bookmarks: [],

      setLastRead: (lastRead) =>
        set({ lastRead: { ...lastRead, updatedAt: Date.now() } }),

      toggleBookmark: (bookmark) =>
        set((state) => {
          const exists = state.bookmarks.some((b) => b.id === bookmark.id);
          return {
            bookmarks: exists
              ? state.bookmarks.filter((b) => b.id !== bookmark.id)
              : [bookmark, ...state.bookmarks],
          };
        }),

      isBookmarked: (ayahId) => get().bookmarks.some((b) => b.id === ayahId),
    }),
    {
      name: 'dawat-quran-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
