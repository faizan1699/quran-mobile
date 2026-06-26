import { create } from 'zustand';
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
  position: number; // in seconds
  duration: number; // in seconds
  isShuffleEnabled: boolean;
  isRepeatEnabled: boolean;
  queue: AudioTrackInfo[];
  
  // Actions
  playTrack: (track: AudioTrackInfo) => Promise<void>;
  togglePlay: () => Promise<void>;
  setQueue: (tracks: AudioTrackInfo[]) => Promise<void>;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  resetPlayer: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
}

let soundInstance: Audio.Sound | null = null;

export const useAudioStore = create<AudioState>((set, get) => {
  
  // Internal playback status update listener
  const onPlaybackStatusUpdate = async (status: AVPlaybackStatus) => {
    if (!status.isLoaded) {
      if (status.error) {
        console.error(`Playback error: ${status.error}`);
      }
      return;
    }

    set({
      position: status.positionMillis / 1000,
      duration: (status.durationMillis || 0) / 1000,
      playbackState: status.isBuffering
        ? PlaybackState.Buffering
        : status.isPlaying
        ? PlaybackState.Playing
        : PlaybackState.Paused,
    });

    if (status.didJustFinish) {
      if (get().isRepeatEnabled && soundInstance) {
        await soundInstance.replayAsync();
      } else {
        await get().skipToNext();
      }
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

    playTrack: async (track) => {
      try {
        set({ currentTrack: track, position: 0, duration: 0 });

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

        await soundInstance.loadAsync({ uri: track.url }, { shouldPlay: true });
      } catch (error) {
        console.error('Error playing track via expo-av:', error);
      }
    },

    togglePlay: async () => {
      try {
        if (!soundInstance) return;
        const status = await soundInstance.getStatusAsync();
        if (status.isLoaded) {
          if (status.isPlaying) {
            await soundInstance.pauseAsync();
          } else {
            await soundInstance.playAsync();
          }
        }
      } catch (error) {
        console.error('Error toggling playback:', error);
      }
    },

    setQueue: async (tracks) => {
      set({ queue: tracks });
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
        if (soundInstance) {
          await soundInstance.setPositionAsync(seconds * 1000);
        }
      } catch (error) {
        console.error('Error seeking track:', error);
      }
    },
  };
});
