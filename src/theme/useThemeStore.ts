import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { ThemeMode } from './themes';

interface ThemeState {
  mode: ThemeMode;
  accentColor: string | null;
  backgroundColor: string | null;
  glass: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string | null) => void;
  setBackgroundColor: (color: string | null) => void;
  setGlass: (glass: boolean) => void;
  resetAppearance: () => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      mode: 'system',
      accentColor: null,
      backgroundColor: null,
      glass: false,
      setMode: (mode) => set({ mode }),
      setAccentColor: (accentColor) => set({ accentColor }),
      setBackgroundColor: (backgroundColor) => set({ backgroundColor }),
      setGlass: (glass) => set({ glass }),
      resetAppearance: () =>
        set({ accentColor: null, backgroundColor: null, glass: false }),
    }),
    {
      name: 'dawat-theme-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
