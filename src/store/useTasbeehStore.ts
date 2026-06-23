import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { adhkar } from '@/data/adhkar';

interface TasbeehState {
  count: number;
  target: number;
  rounds: number;
  lifetimeTotal: number;
  dhikrIndex: number;
  vibrationEnabled: boolean;

  increment: () => boolean;
  decrement: () => void;
  resetCount: () => void;
  selectDhikr: (index: number) => void;
  setTarget: (target: number) => void;
  toggleVibration: () => void;
}

export const useTasbeehStore = create<TasbeehState>()(
  persist(
    (set, get) => ({
      count: 0,
      target: adhkar[0].defaultTarget,
      rounds: 0,
      lifetimeTotal: 0,
      dhikrIndex: 0,
      vibrationEnabled: true,

      increment: () => {
        const { count, target } = get();
        const next = count + 1;
        const completedLoop = next >= target;
        set((s) => ({
          count: completedLoop ? 0 : next,
          rounds: completedLoop ? s.rounds + 1 : s.rounds,
          lifetimeTotal: s.lifetimeTotal + 1,
        }));
        return completedLoop;
      },

      decrement: () =>
        set((s) => ({
          count: Math.max(0, s.count - 1),
          lifetimeTotal: s.count > 0 ? Math.max(0, s.lifetimeTotal - 1) : s.lifetimeTotal,
        })),

      resetCount: () => set({ count: 0, rounds: 0 }),

      selectDhikr: (index) => {
        const dhikr = adhkar[index];
        if (!dhikr) {
          return;
        }
        set({ dhikrIndex: index, target: dhikr.defaultTarget, count: 0, rounds: 0 });
      },

      setTarget: (target) =>
        set({ target: Math.max(1, Math.round(target)), count: 0, rounds: 0 }),

      toggleVibration: () => set((s) => ({ vibrationEnabled: !s.vibrationEnabled })),
    }),
    {
      name: 'dawat-tasbeeh-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
