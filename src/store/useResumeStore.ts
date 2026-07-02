import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { AudioTrackInfo } from '@/store/useAudioStore';

export interface ResumeSession {
  track: AudioTrackInfo;
  queue: AudioTrackInfo[];
  position: number;
  updatedAt: number;
}

interface ResumeState {
  session: ResumeSession | null;
  saveSession: (session: ResumeSession) => void;
  clearSession: () => void;
}

const stripWords = (track: AudioTrackInfo): AudioTrackInfo =>
  track.words ? { ...track, words: undefined } : track;

export const useResumeStore = create<ResumeState>()(
  persist(
    (set) => ({
      session: null,
      saveSession: (session) =>
        set({
          session: {
            track: stripWords(session.track),
            queue: session.queue.map(stripWords),
            position: session.position,
            updatedAt: session.updatedAt,
          },
        }),
      clearSession: () => set({ session: null }),
    }),
    {
      name: 'dawat-resume-storage',
      storage: createJSONStorage(() => AsyncStorage),
      version: 1,
    }
  )
);
