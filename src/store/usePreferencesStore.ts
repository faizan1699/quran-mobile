import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { DEFAULT_RECITER_ID } from '@/data/reciters';
import {
  DEFAULT_ARABIC_FONT,
  DEFAULT_URDU_FONT,
  DEFAULT_ENGLISH_FONT,
  applySelectedFonts,
} from '@/theme/scriptFonts';

/**
 * Per-script text size preference. Maps to a multiplier applied to matching
 * `fontSize` via the global Text patch in `App.tsx` (see `FONT_SCALE_VALUES`).
 */
export type FontScale = 'small' | 'default' | 'large' | 'xlarge';

/** Multiplier applied to text for each font-scale choice. */
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
  autoPlayNextSurah: boolean;
  autoOpenPlayer: boolean;
  keepScreenOn: boolean;
  playTranslation: boolean;
  highlightWords: boolean;
  reciterId: string;
  // Downloads
  downloadOverWifiOnly: boolean;
  /** Surah/book ids the user has "downloaded" for offline use (mock). */
  downloadedIds: string[];
  // Appearance
  /** Text size for Arabic / Quran text. */
  arabicFontScale: FontScale;
  /** Text size for Urdu text. */
  urduFontScale: FontScale;
  /** Text size for English / UI text. */
  englishFontScale: FontScale;
  /** Font family used for Arabic / Quran text (live-swapped app-wide). */
  arabicFont: string;
  /** Font family used for Urdu text (live-swapped app-wide). */
  urduFont: string;
  /** Font family used for English / UI text (live-swapped app-wide). */
  englishFont: string;

  setPref: (
    key:
      | 'prayerAlerts'
      | 'dailyAyahReminder'
      | 'jummahReminder'
      | 'autoPlayNextAyah'
      | 'autoPlayNextSurah'
      | 'autoOpenPlayer'
      | 'keepScreenOn'
      | 'playTranslation'
      | 'highlightWords'
      | 'downloadOverWifiOnly',
    value: boolean
  ) => void;
  setArabicFontScale: (scale: FontScale) => void;
  setUrduFontScale: (scale: FontScale) => void;
  setEnglishFontScale: (scale: FontScale) => void;
  setArabicFont: (family: string) => void;
  setUrduFont: (family: string) => void;
  setEnglishFont: (family: string) => void;
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
      autoPlayNextSurah: true,
      autoOpenPlayer: true,
      keepScreenOn: false,
      playTranslation: false,
      highlightWords: false,
      reciterId: DEFAULT_RECITER_ID,
      downloadOverWifiOnly: true,
      downloadedIds: [],
      arabicFontScale: 'default',
      urduFontScale: 'default',
      englishFontScale: 'default',
      arabicFont: DEFAULT_ARABIC_FONT,
      urduFont: DEFAULT_URDU_FONT,
      englishFont: DEFAULT_ENGLISH_FONT,

      setPref: (key, value) => set({ [key]: value } as Partial<PreferencesState>),

      setArabicFontScale: (arabicFontScale) => set({ arabicFontScale }),
      setUrduFontScale: (urduFontScale) => set({ urduFontScale }),
      setEnglishFontScale: (englishFontScale) => set({ englishFontScale }),

      setArabicFont: (arabicFont) => {
        set({ arabicFont });
        applySelectedFonts(arabicFont, get().urduFont, get().englishFont);
      },

      setUrduFont: (urduFont) => {
        set({ urduFont });
        applySelectedFonts(get().arabicFont, urduFont, get().englishFont);
      },

      setEnglishFont: (englishFont) => {
        set({ englishFont });
        applySelectedFonts(get().arabicFont, get().urduFont, englishFont);
      },

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
      version: 2,
      migrate: (persisted, version) => {
        const state = persisted as Partial<PreferencesState> & {
          fontScale?: FontScale;
        };
        if (version < 1 && state && state.fontScale) {
          state.arabicFontScale = state.fontScale;
          state.urduFontScale = state.fontScale;
          state.englishFontScale = state.fontScale;
          delete state.fontScale;
        }
        if (version < 2 && state) {
          if (state.arabicFont === 'Scheherazade New') {
            state.arabicFont = DEFAULT_ARABIC_FONT;
          }
          if (state.urduFont === 'Noto Nastaliq Urdu') {
            state.urduFont = DEFAULT_URDU_FONT;
          }
          if (state.englishFont === 'Inter') {
            state.englishFont = DEFAULT_ENGLISH_FONT;
          }
        }
        return state as PreferencesState;
      },
      onRehydrateStorage: () => (state) => {
        if (state) {
          applySelectedFonts(state.arabicFont, state.urduFont, state.englishFont);
        }
      },
    }
  )
);
