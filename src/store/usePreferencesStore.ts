import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_RECITER_ID } from '@/data/reciters';

/**
 * App-wide text size preference. Maps to a multiplier applied to every
 * `fontSize` via the global Text patch in `App.tsx` (see `FONT_SCALE_VALUES`).
 */
export type FontScale = 'small' | 'default' | 'large' | 'xlarge';

/** Multiplier applied to all text for each font-scale choice. */
export const FONT_SCALE_VALUES: Record<FontScale, number> = {
  small: 0.9,
  default: 1,
  large: 1.15,
  xlarge: 1.3,
};

/**
 * User preferences for notifications / alerts, reading, downloads and the
 * app-wide text size.
 *
 * These toggles are persisted and drive the UI now (mock). Wiring the
 * notification toggles to real OS notifications is a follow-up that needs
 * `expo-notifications` (not yet installed) — the persisted flags here are the
 * single source of truth the scheduler will read once added.
 */
interface PreferencesState {
  // Notifications & alerts
  prayerAlerts: boolean;
  dailyAyahReminder: boolean;
  jummahReminder: boolean;
  // Reading & audio
  autoPlayNextAyah: boolean;
  keepScreenOn: boolean;
  playTranslation: boolean;
  highlightWords: boolean;
  reciterId: string;
  // Downloads
  downloadOverWifiOnly: boolean;
  /** Surah/book ids the user has "downloaded" for offline use (mock). */
  downloadedIds: string[];
  // Appearance
  fontScale: FontScale;

  setPref: (
    key:
      | 'prayerAlerts'
      | 'dailyAyahReminder'
      | 'jummahReminder'
      | 'autoPlayNextAyah'
      | 'keepScreenOn'
      | 'playTranslation'
      | 'highlightWords'
      | 'downloadOverWifiOnly',
    value: boolean
  ) => void;
  setFontScale: (scale: FontScale) => void;
  setReciterId: (id: string) => void;
  toggleDownloaded: (id: string) => void;
  isDownloaded: (id: string) => boolean;
}

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set, get) => ({
      prayerAlerts: true,
      dailyAyahReminder: true,
      jummahReminder: true,
      autoPlayNextAyah: true,
      keepScreenOn: false,
      playTranslation: false,
      highlightWords: false,
      reciterId: DEFAULT_RECITER_ID,
      downloadOverWifiOnly: true,
      downloadedIds: [],
      fontScale: 'default',

      setPref: (key, value) => set({ [key]: value } as Partial<PreferencesState>),

      setFontScale: (fontScale) => set({ fontScale }),

      setReciterId: (reciterId) => set({ reciterId }),

      toggleDownloaded: (id) =>
        set((state) => ({
          downloadedIds: state.downloadedIds.includes(id)
            ? state.downloadedIds.filter((d) => d !== id)
            : [id, ...state.downloadedIds],
        })),

      isDownloaded: (id) => get().downloadedIds.includes(id),
    }),
    {
      name: 'dawat-preferences-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
