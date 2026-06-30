import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type FiqhMethod = 'Hanafi' | 'Shafi' | 'Maliki' | 'Hanbali';

export interface LocationData {
  latitude: number;
  longitude: number;
  name: string;
}

/** Logged-in account profile (UI state — mock auth only). */
export interface AuthUser {
  id: string;
  name: string;
  email?: string;
  phone?: string;
}

interface UserState {
  language: 'en' | 'ur';
  fiqhMethod: FiqhMethod;
  location: LocationData | null;
  isLoggedIn: boolean;
  user: AuthUser | null;
  token: string | null;
  refreshToken: string | null;

  // Actions
  setLanguage: (language: 'en' | 'ur') => void;
  setFiqhMethod: (method: FiqhMethod) => void;
  setLocation: (location: LocationData | null) => void;
  setTokens: (token: string, refreshToken: string) => void;
  signIn: (user: AuthUser) => void;
  clearTokens: () => void;
  logout: () => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      language: 'ur',
      fiqhMethod: 'Hanafi',
      location: {
        latitude: 21.4225, // Default to Mecca
        longitude: 39.8262,
        name: 'Mecca, SA',
      },
      isLoggedIn: false,
      user: null,
      token: null,
      refreshToken: null,

      setLanguage: (language) => set({ language }),
      setFiqhMethod: (fiqhMethod) => set({ fiqhMethod }),
      setLocation: (location) => set({ location }),
      setTokens: (token, refreshToken) => set({ token, refreshToken, isLoggedIn: true }),
      signIn: (user) => set({ user, isLoggedIn: true, token: 'mock-token' }),
      clearTokens: () => set({ token: null, refreshToken: null, isLoggedIn: false }),
      logout: () => set({ user: null, token: null, refreshToken: null, isLoggedIn: false }),
    }),
    {
      name: 'dawat-user-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
      migrate: (persistedState, version) => {
        if (version < 1 && persistedState && typeof persistedState === 'object') {
          (persistedState as UserState).language = 'ur';
        }
        return persistedState as UserState;
      },
    }
  )
);
