import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform, AppState } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import { scStreamUrl } from '@/services/audioContentService';

const DOWNLOAD_DIR = `${FileSystem.documentDirectory ?? ''}sc-audio/`;

function pathFor(trackId: number | string): string {
  return `${DOWNLOAD_DIR}${trackId}.mp3`;
}

const tasks = new Map<string, FileSystem.DownloadResumable>();

interface CacheEntry {
  title: string;
  surah?: number;
  done: boolean;
}

interface TrackRef {
  trackId: number;
  title: string;
}

interface AudioDownloadState {
  entries: Record<string, CacheEntry>;
  resume: Record<string, string>;
  progress: Record<string, number>;
  ensureCached: (track: TrackRef, surah?: number) => Promise<void>;
  pauseActive: () => Promise<void>;
  resumeIncomplete: () => Promise<void>;
  remove: (trackId: number) => Promise<void>;
  isDone: (trackId: number) => boolean;
  localUri: (trackId: number) => string | null;
}

export const useAudioDownloadStore = create<AudioDownloadState>()(
  persist(
    (set, get) => {
      const ensureDir = async () => {
        const info = await FileSystem.getInfoAsync(DOWNLOAD_DIR);
        if (!info.exists) {
          await FileSystem.makeDirectoryAsync(DOWNLOAD_DIR, { intermediates: true });
        }
      };

      const progressCallback =
        (id: string) =>
        (p: { totalBytesWritten: number; totalBytesExpectedToWrite: number }) => {
          const frac =
            p.totalBytesExpectedToWrite > 0
              ? p.totalBytesWritten / p.totalBytesExpectedToWrite
              : 0;
          set((s) => ({ progress: { ...s.progress, [id]: frac } }));
        };

      const runTask = async (
        id: string,
        task: FileSystem.DownloadResumable,
        isResume: boolean,
      ) => {
        tasks.set(id, task);
        try {
          const result = isResume
            ? await task.resumeAsync()
            : await task.downloadAsync();
          if (result?.uri) {
            set((s) => {
              const progress = { ...s.progress };
              delete progress[id];
              const resume = { ...s.resume };
              delete resume[id];
              return {
                entries: {
                  ...s.entries,
                  [id]: { ...s.entries[id], done: true },
                },
                progress,
                resume,
              };
            });
          }
        } catch {
          try {
            const savable = task.savable();
            if (savable?.resumeData) {
              set((s) => ({
                resume: { ...s.resume, [id]: JSON.stringify(savable) },
              }));
            }
          } catch {}
          set((s) => {
            const progress = { ...s.progress };
            delete progress[id];
            return { progress };
          });
        } finally {
          tasks.delete(id);
        }
      };

      return {
        entries: {},
        resume: {},
        progress: {},

        isDone: (trackId) => !!get().entries[String(trackId)]?.done,
        localUri: (trackId) =>
          get().entries[String(trackId)]?.done ? pathFor(trackId) : null,

        ensureCached: async (track, surah) => {
          if (Platform.OS === 'web') return;
          const id = String(track.trackId);
          if (get().entries[id]?.done || tasks.has(id)) return;

          await ensureDir();
          set((s) => ({
            entries: {
              ...s.entries,
              [id]: { title: track.title, surah, done: false },
            },
            progress: { ...s.progress, [id]: s.progress[id] ?? 0 },
          }));

          const savable = get().resume[id];
          if (savable) {
            try {
              const sv = JSON.parse(savable);
              const task = FileSystem.createDownloadResumable(
                sv.url,
                sv.fileUri,
                sv.options,
                progressCallback(id),
                sv.resumeData,
              );
              await runTask(id, task, true);
              return;
            } catch {}
          }

          const task = FileSystem.createDownloadResumable(
            scStreamUrl(track.trackId),
            pathFor(track.trackId),
            {},
            progressCallback(id),
          );
          await runTask(id, task, false);
        },

        pauseActive: async () => {
          const active = Array.from(tasks.entries());
          for (const [id, task] of active) {
            try {
              const savable = await task.pauseAsync();
              if (savable) {
                set((s) => ({
                  resume: { ...s.resume, [id]: JSON.stringify(savable) },
                }));
              }
            } catch {}
          }
          tasks.clear();
        },

        resumeIncomplete: async () => {
          if (Platform.OS === 'web') return;
          const { entries } = get();
          for (const id of Object.keys(entries)) {
            if (!entries[id].done && !tasks.has(id)) {
              void get().ensureCached(
                { trackId: Number(id), title: entries[id].title },
                entries[id].surah,
              );
            }
          }
        },

        remove: async (trackId) => {
          const id = String(trackId);
          const task = tasks.get(id);
          if (task) {
            try {
              await task.pauseAsync();
            } catch {}
            tasks.delete(id);
          }
          try {
            await FileSystem.deleteAsync(pathFor(trackId), { idempotent: true });
          } catch {}
          set((s) => {
            const entries = { ...s.entries };
            delete entries[id];
            const resume = { ...s.resume };
            delete resume[id];
            const progress = { ...s.progress };
            delete progress[id];
            return { entries, resume, progress };
          });
        },
      };
    },
    {
      name: 'sc-audio-downloads',
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ entries: state.entries, resume: state.resume }),
      onRehydrateStorage: () => () => {
        if (Platform.OS === 'web') return;
        setTimeout(() => {
          try {
            void useAudioDownloadStore.getState().resumeIncomplete();
          } catch {}
        }, 1500);
      },
    },
  ),
);

if (Platform.OS !== 'web') {
  AppState.addEventListener('change', (status) => {
    const store = useAudioDownloadStore.getState();
    if (status === 'active') {
      void store.resumeIncomplete();
    } else {
      void store.pauseActive();
    }
  });
}
