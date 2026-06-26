import { create } from 'zustand';
import { Platform } from 'react-native';
import {
  createAudioPlayer,
  setAudioModeAsync,
  AudioPlayer,
  AudioStatus,
} from 'expo-audio';

export enum PlaybackState {
  None = 'none',
  Playing = 'playing',
  Paused = 'paused',
  Buffering = 'buffering',
}

export const State = PlaybackState;

interface AudioTrackInfo {
  id: string;
  url: string;
  title: string;
  artist: string;
  chapterId?: string;
  bookId?: string;
  hadithNumber?: number;
}

interface AudioState {
  currentTrack: AudioTrackInfo | null;
  playbackState: PlaybackState;
  position: number;
  duration: number;
  isShuffleEnabled: boolean;
  isRepeatEnabled: boolean;
  queue: AudioTrackInfo[];
  durations: Record<string, number>;

  playTrack: (track: AudioTrackInfo, startSeconds?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  setQueue: (tracks: AudioTrackInfo[]) => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  resetPlayer: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  seekGlobal: (seconds: number) => Promise<void>;
}

type StatusSub = { remove: () => void };

let player: AudioPlayer | null = null;
let statusSub: StatusSub | null = null;
let pendingSeekSeconds = 0;
let audioModeReady = false;

function fetchWebDurationSeconds(url: string): Promise<number> {
  return new Promise((resolve) => {
    try {
      const a: any = new (globalThis as any).Audio();
      a.preload = 'metadata';
      const finish = (value: number) => {
        a.removeAttribute('src');
        resolve(Number.isFinite(value) && value > 0 ? value : 0);
      };
      a.addEventListener('loadedmetadata', () => finish(a.duration), { once: true });
      a.addEventListener('error', () => finish(0), { once: true });
      a.src = url;
    } catch {
      resolve(0);
    }
  });
}

function fetchNativeDurationSeconds(url: string): Promise<number> {
  return new Promise((resolve) => {
    let settled = false;
    let probe: AudioPlayer | null = null;
    let sub: StatusSub | null = null;

    const finish = (value: number) => {
      if (settled) return;
      settled = true;
      clearTimeout(timeout);
      if (sub) sub.remove();
      if (probe) {
        try {
          probe.remove();
        } catch {}
      }
      resolve(Number.isFinite(value) && value > 0 ? value : 0);
    };

    const timeout = setTimeout(() => finish(0), 20000);

    try {
      probe = createAudioPlayer({ uri: url }, { updateInterval: 1000 });
      sub = probe.addListener('playbackStatusUpdate', (status: AudioStatus) => {
        if (status.isLoaded && status.duration > 0) {
          finish(status.duration);
        }
      });
    } catch {
      finish(0);
    }
  });
}

async function fetchDurationSeconds(url: string): Promise<number> {
  return Platform.OS === 'web'
    ? fetchWebDurationSeconds(url)
    : fetchNativeDurationSeconds(url);
}

async function ensureAudioMode(): Promise<void> {
  if (audioModeReady) return;
  audioModeReady = true;
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
      interruptionMode: 'duckOthers',
    });
  } catch {
    audioModeReady = false;
  }
}

export const useAudioStore = create<AudioState>((set, get) => {

  const prefetchDurations = async (tracks: AudioTrackInfo[]) => {
    const todo = tracks.filter((t) => !(get().durations[t.id] > 0));
    const CONCURRENCY = Platform.OS === 'web' ? 6 : 4;
    for (let i = 0; i < todo.length; i += CONCURRENCY) {
      const batch = todo.slice(i, i + CONCURRENCY);
      const results = await Promise.all(
        batch.map((t) => fetchDurationSeconds(t.url).then((d) => [t.id, d] as const))
      );
      const next = { ...get().durations };
      let changed = false;
      for (const [id, d] of results) {
        if (d > 0 && next[id] !== d) {
          next[id] = d;
          changed = true;
        }
      }
      if (changed) set({ durations: next });
    }
  };

  const teardownPlayer = () => {
    if (statusSub) {
      statusSub.remove();
      statusSub = null;
    }
    if (player) {
      try {
        player.remove();
      } catch {}
      player = null;
    }
  };

  const handleTrackFinished = async () => {
    if (get().isRepeatEnabled && player) {
      await player.seekTo(0);
      player.play();
      return;
    }
    const { queue, currentTrack } = get();
    const idx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
    if (idx >= 0 && idx < queue.length - 1) {
      await get().skipToNext();
    } else {
      set({ playbackState: PlaybackState.Paused });
    }
  };

  const onPlaybackStatusUpdate = (status: AudioStatus) => {
    if (!status.isLoaded) {
      return;
    }

    if (pendingSeekSeconds > 0 && player) {
      const seconds = pendingSeekSeconds;
      pendingSeekSeconds = 0;
      void player.seekTo(seconds);
    }

    const durationSeconds = status.duration || 0;

    set({
      position: status.currentTime,
      duration: durationSeconds,
      playbackState: status.isBuffering
        ? PlaybackState.Buffering
        : status.playing
        ? PlaybackState.Playing
        : PlaybackState.Paused,
    });

    const current = get().currentTrack;
    if (current && durationSeconds > 0 && get().durations[current.id] !== durationSeconds) {
      set({ durations: { ...get().durations, [current.id]: durationSeconds } });
    }

    if (status.didJustFinish) {
      void handleTrackFinished();
    }
  };

  const startPlayback = (track: AudioTrackInfo, startSeconds: number) => {
    teardownPlayer();
    pendingSeekSeconds = startSeconds > 0 ? startSeconds : 0;
    player = createAudioPlayer({ uri: track.url }, { updateInterval: 100 });
    statusSub = player.addListener('playbackStatusUpdate', onPlaybackStatusUpdate);
    player.play();
  };

  return {
    currentTrack: null,
    playbackState: PlaybackState.None,
    position: 0,
    duration: 0,
    isShuffleEnabled: false,
    isRepeatEnabled: false,
    queue: [],
    durations: {},

    playTrack: async (track, startSeconds = 0) => {
      try {
        set({
          currentTrack: track,
          position: startSeconds,
          duration: get().durations[track.id] || 0,
          playbackState: PlaybackState.Buffering,
        });

        await ensureAudioMode();
        startPlayback(track, startSeconds);
        set({ playbackState: PlaybackState.Playing });
      } catch (error) {
        console.error('Error playing track via expo-audio:', error);
      }
    },

    togglePlay: async () => {
      try {
        const { currentTrack, playbackState } = get();
        if (!player) {
          if (currentTrack) await get().playTrack(currentTrack);
          return;
        }
        if (playbackState === PlaybackState.Playing) {
          player.pause();
          set({ playbackState: PlaybackState.Paused });
        } else {
          player.play();
          set({ playbackState: PlaybackState.Playing });
        }
      } catch (error) {
        console.error('Error toggling playback:', error);
      }
    },

    setQueue: async (tracks) => {
      set({ queue: tracks });
      prefetchDurations(tracks);
      if (tracks.length > 0 && !get().currentTrack) {
        await get().playTrack(tracks[0]);
      }
    },

    skipToNext: async () => {
      try {
        const { queue, currentTrack } = get();
        if (queue.length === 0 || !currentTrack) return;

        const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
        if (currentIndex !== -1 && currentIndex < queue.length - 1) {
          const nextTrack = queue[currentIndex + 1];
          await get().playTrack(nextTrack);
        }
      } catch (error) {
        console.error('Error skipping to next:', error);
      }
    },

    skipToPrevious: async () => {
      try {
        const { queue, currentTrack } = get();
        if (queue.length === 0 || !currentTrack) return;

        const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
        if (currentIndex > 0) {
          const prevTrack = queue[currentIndex - 1];
          await get().playTrack(prevTrack);
        }
      } catch (error) {
        console.error('Error skipping to previous:', error);
      }
    },

    toggleShuffle: () => {
      set((state) => ({ isShuffleEnabled: !state.isShuffleEnabled }));
    },

    toggleRepeat: () => {
      set((state) => ({ isRepeatEnabled: !state.isRepeatEnabled }));
    },

    resetPlayer: async () => {
      try {
        teardownPlayer();
        pendingSeekSeconds = 0;
        set({ currentTrack: null, queue: [], position: 0, duration: 0, playbackState: PlaybackState.None });
      } catch (error) {
        console.error('Error resetting player:', error);
      }
    },

    seekTo: async (seconds) => {
      try {
        set({ position: seconds });
        if (player) {
          await player.seekTo(seconds);
        }
      } catch (error) {
        console.error('Error seeking track:', error);
      }
    },

    seekGlobal: async (seconds) => {
      try {
        const { queue, durations, currentTrack } = get();
        if (queue.length === 0) return;
        let acc = 0;
        for (let i = 0; i < queue.length; i++) {
          const d = durations[queue[i].id] || 0;
          if (seconds < acc + d || i === queue.length - 1) {
            const offset = Math.max(0, seconds - acc);
            const target = queue[i];
            if (currentTrack && currentTrack.id === target.id) {
              await get().seekTo(offset);
            } else {
              await get().playTrack(target, offset);
            }
            return;
          }
          acc += d;
        }
      } catch (error) {
        console.error('Error seeking surah:', error);
      }
    },
  };
});
