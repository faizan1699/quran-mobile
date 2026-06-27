import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Popup } from '@shared-types';

interface PopupRecord {
  count: number;
  lastShownAt: number;
}

interface PopupStoreState {
  history: Record<string, PopupRecord>;
  recordShown: (id: string) => void;
}

const DAY_MS = 24 * 60 * 60 * 1000;
const HOUR_MS = 60 * 60 * 1000;

const shownThisSession = new Set<string>();

export const usePopupStore = create<PopupStoreState>()(
  persist(
    (set) => ({
      history: {},
      recordShown: (id) => {
        shownThisSession.add(id);
        set((state) => {
          const existing = state.history[id];
          return {
            history: {
              ...state.history,
              [id]: {
                count: (existing?.count ?? 0) + 1,
                lastShownAt: Date.now(),
              },
            },
          };
        });
      },
    }),
    {
      name: 'dawat-popup-history',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);

function withinWindow(popup: Popup, now: number): boolean {
  if (popup.startsAt && new Date(popup.startsAt).getTime() > now) {
    return false;
  }

  if (popup.endsAt && new Date(popup.endsAt).getTime() < now) {
    return false;
  }

  return true;
}

export function selectEligiblePopup(
  popups: Popup[],
  history: Record<string, PopupRecord>,
  now: number
): Popup | null {
  for (const popup of popups) {
    if (!popup.active) {
      continue;
    }

    if (!withinWindow(popup, now)) {
      continue;
    }

    if (shownThisSession.has(popup.id)) {
      continue;
    }

    const record = history[popup.id];
    const count = record?.count ?? 0;
    const lastShownAt = record?.lastShownAt ?? 0;

    if (popup.maxShows > 0 && count >= popup.maxShows) {
      continue;
    }

    let eligible = true;

    switch (popup.frequency) {
      case 'ONCE':
        eligible = count < 1;
        break;
      case 'DAILY':
        eligible = now - lastShownAt >= DAY_MS;
        break;
      case 'INTERVAL':
        eligible = now - lastShownAt >= (popup.intervalHours ?? 24) * HOUR_MS;
        break;
      case 'EVERY_LAUNCH':
      default:
        eligible = true;
        break;
    }

    if (eligible) {
      return popup;
    }
  }

  return null;
}
