import { create } from 'zustand';
import { Platform } from 'react-native';
import { Audio, AVPlaybackStatus } from 'expo-av';

export enum PlaybackState {
  None = 'none',
  Playing = 'playing',
  Paused = 'paused',
  Buffering = 'buffering',
}

// Emulate TrackPlayer.State for UI compatibility
export const State = PlaybackState;

interface AudioTrackInfo {
  id: string; // matches contentId
  url: string;
  title: string;
  artist: string;
  chapterId: string;
  bookId: string;
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

let soundInstance: Audio.Sound | null = null;
let positionTimer: ReturnType<typeof setInterval> | null = null;

async function fetchDurationSeconds(url: string): Promise<number> {
  if (Platform.OS !== 'web') return 0;
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

export const useAudioStore = create<AudioState>((set, get) => {

  const prefetchDurations = async (tracks: AudioTrackInfo[]) => {
    if (Platform.OS !== 'web') return;
    const todo = tracks.filter((t) => !(get().durations[t.id] > 0));
    const CONCURRENCY = 6;
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

  const stopTicker = () => {
    if (positionTimer) {
      clearInterval(positionTimer);
      positionTimer = null;
    }
  };

  const startTicker = () => {
    if (positionTimer) return;
    positionTimer = setInterval(async () => {
      if (!soundInstance || get().playbackState !== PlaybackState.Playing) return;
      try {
        const status = await soundInstance.getStatusAsync();
        if (status.isLoaded) {
          set({ position: status.positionMillis / 1000 });
        }
      } catch {
        return;
      }
    }, 1000);
  };

  const handleTrackFinished = async () => {
    if (get().isRepeatEnabled && soundInstance) {
      await soundInstance.replayAsync();
      return;
    }
    const { queue, currentTrack } = get();
    const idx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
    if (idx >= 0 && idx < queue.length - 1) {
      await get().skipToNext();
    } else {
      stopTicker();
      set({ playbackState: PlaybackState.Paused });
    }
  };

  const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Playback error: ${status.error}`);
      }
      return;
    }

    const durationSeconds = (status.durationMillis || 0) / 1000;

    set({
      position: status.positionMillis / 1000,
      duration: durationSeconds,
      playbackState: status.isBuffering
        ? PlaybackState.Buffering
        : status.isPlaying
        ? PlaybackState.Playing
        : PlaybackState.Paused,
    });

    const current = get().currentTrack;
    if (current && durationSeconds > 0 && get().durations[current.id] !== durationSeconds) {
      set({ durations: { ...get().durations, [current.id]: durationSeconds } });
    }

    if (status.didJustFinish && Platform.OS !== 'web') {
      await handleTrackFinished();
    }
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

        await Audio.setAudioModeAsync({
          allowsRecordingIOS: false,
          staysActiveInBackground: true,
          playsInSilentModeIOS: true,
          playThroughEarpieceAndroid: false,
        });

        if (!soundInstance) {
          soundInstance = new Audio.Sound();
          soundInstance.setOnPlaybackStatusUpdate(onPlaybackStatusUpdate);
        } else {
          await soundInstance.unloadAsync();
        }

        await soundInstance.loadAsync(
          { uri: track.url },
          { shouldPlay: true, positionMillis: Math.round(startSeconds * 1000) }
        );
        set({ playbackState: PlaybackState.Playing });
        startTicker();

        if (Platform.OS === 'web') {
          const el: any = (soundInstance as any)._key;
          if (el && typeof el.addEventListener === 'function') {
            el.addEventListener('ended', () => handleTrackFinished());
          }
        }
      } catch (error) {
        console.error('Error playing track via expo-av:', error);
      }
    },

    togglePlay: async () => {
      try {
        const { currentTrack, playbackState } = get();
        if (!soundInstance) {
          if (currentTrack) await get().playTrack(currentTrack);
          return;
        }
        if (playbackState === PlaybackState.Playing) {
          await soundInstance.pauseAsync();
          set({ playbackState: PlaybackState.Paused });
          stopTicker();
        } else {
          await soundInstance.playAsync();
          set({ playbackState: PlaybackState.Playing });
          startTicker();
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
        stopTicker();
        set({ currentTrack: null, queue: [], position: 0, duration: 0, playbackState: PlaybackState.None });
        if (soundInstance) {
          await soundInstance.unloadAsync();
          soundInstance = null;
        }
      } catch (error) {
        console.error('Error resetting player:', error);
      }
    },

    seekTo: async (seconds) => {
      try {
        set({ position: seconds });
        if (soundInstance) {
          await soundInstance.setPositionAsync(seconds * 1000);
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
