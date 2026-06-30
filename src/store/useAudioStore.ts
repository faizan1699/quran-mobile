import { create } from 'zustand';
import { Platform, Alert } from 'react-native';
import {
  createAudioPlayer,
  setAudioModeAsync,
  AudioPlayer,
  AudioStatus,
} from 'expo-audio';
import { TimedWord, QuranAyah } from '@shared-types';
import { quranService } from '@/services/quranService';
import { getReciter, ayahAudioUrl, ttsAudioUrl, splitForTts } from '@/data/reciters';
import { getSurahMeta } from '@/data/surahMeta';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useUserStore } from '@/store/useUserStore';
import { useAudioDownloadStore } from '@/store/useAudioDownloadStore';

type SpeechModule = {
  speak: (text: string, options?: Record<string, unknown>) => void;
  stop: () => void;
  getAvailableVoicesAsync?: () => Promise<Array<{ language?: string }>>;
};

let speechModule: SpeechModule | null = null;
let speechResolved = false;
let ttsVoiceWarned = false;

function getSpeech(): SpeechModule | null {
  if (!speechResolved) {
    speechResolved = true;
    try {
      speechModule = require('expo-speech') as SpeechModule;
    } catch {
      speechModule = null;
    }
  }
  return speechModule;
}

function stopSpeech(): void {
  if (Platform.OS === 'web') {
    try {
      getSynth()?.cancel();
    } catch {}
    return;
  }
  try {
    getSpeech()?.stop();
  } catch {}
}

function notifyNoVoice(langPrefix: string): void {
  if (ttsVoiceWarned) return;
  ttsVoiceWarned = true;
  const isUrdu = langPrefix.startsWith('ur');
  Alert.alert(
    isUrdu ? 'اردو آواز دستیاب نہیں' : 'Voice not available',
    isUrdu
      ? 'ترجمہ سننے کے لیے اردو ٹیکسٹ ٹو اسپیچ آواز درکار ہے۔ موبائل: Settings → System → Languages → Text-to-speech (Google) → اردو ڈاؤن لوڈ کریں۔ براؤزر: اکثر ڈیسک ٹاپ براؤزرز میں اردو آواز نہیں ہوتی، فون پر آزمائیں۔'
      : 'To hear the translation, an Urdu Text-to-speech voice must be installed on this device/browser.'
  );
}

async function warnIfNoVoice(langPrefix: string): Promise<void> {
  if (ttsVoiceWarned || Platform.OS === 'web') return;
  const speech = getSpeech();
  if (!speech?.getAvailableVoicesAsync) return;
  try {
    const voices = await speech.getAvailableVoicesAsync();
    const has = voices.some((v) =>
      (v.language || '').toLowerCase().startsWith(langPrefix.toLowerCase())
    );
    if (!has) notifyNoVoice(langPrefix);
  } catch {}
}

type WebVoice = { lang?: string; name?: string };
let webVoicesPromise: Promise<WebVoice[]> | null = null;

function getSynth(): any {
  const g = globalThis as any;
  return g.speechSynthesis && g.SpeechSynthesisUtterance ? g.speechSynthesis : null;
}

function loadWebVoices(): Promise<WebVoice[]> {
  const synth = getSynth();
  if (!synth) return Promise.resolve([]);
  const existing = synth.getVoices();
  if (existing && existing.length) return Promise.resolve(existing);
  if (!webVoicesPromise) {
    webVoicesPromise = new Promise((resolve) => {
      let done = false;
      const finish = () => {
        if (done) return;
        done = true;
        resolve(synth.getVoices() || []);
      };
      try {
        synth.addEventListener('voiceschanged', finish, { once: true });
      } catch {}
      setTimeout(finish, 1500);
    });
  }
  return webVoicesPromise;
}

async function webSpeak(
  text: string,
  langPrefix: string,
  rate: number,
  onDone: () => void,
  onError: () => void
): Promise<void> {
  const synth = getSynth();
  if (!synth) {
    onError();
    return;
  }
  const voices = await loadWebVoices();
  const lp = langPrefix.toLowerCase();
  const base = lp.split('-')[0];
  const voice =
    voices.find((v) => (v.lang || '').toLowerCase().replace('_', '-').startsWith(lp)) ||
    voices.find((v) => (v.lang || '').toLowerCase().startsWith(base));
  try {
    synth.cancel();
  } catch {}
  const utter = new (globalThis as any).SpeechSynthesisUtterance(text);
  if (voice) utter.voice = voice;
  utter.lang = (voice && voice.lang) || (base === 'ur' ? 'ur-PK' : 'en-US');
  utter.rate = rate || 1;
  utter.onend = onDone;
  utter.onerror = onError;
  setTimeout(() => {
    try {
      synth.speak(utter);
    } catch {
      onError();
    }
  }, 130);
  if (!voice) notifyNoVoice(langPrefix);
}

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
  surahNumber?: number;
  arabic?: string;
  translation?: string;
  subtitle?: string;
  words?: TimedWord[];
  tts?: boolean;
  ttsLang?: string;
  ttsText?: string;
  durationMs?: number;
  surahSync?: boolean;
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
  playbackRate: number;
  autoAdvanceSurah: boolean;

  playTrack: (track: AudioTrackInfo, startSeconds?: number) => Promise<void>;
  togglePlay: () => Promise<void>;
  setQueue: (tracks: AudioTrackInfo[]) => Promise<void>;
  setAutoAdvanceSurah: (enabled: boolean) => void;
  skipToNext: () => Promise<void>;
  skipToPrevious: () => Promise<void>;
  toggleShuffle: () => void;
  toggleRepeat: () => void;
  setPlaybackRate: (rate: number) => void;
  resetPlayer: () => Promise<void>;
  seekTo: (seconds: number) => Promise<void>;
  seekGlobal: (seconds: number) => Promise<void>;
}

export const PLAYBACK_RATES = [0.75, 1, 1.25, 1.5, 2] as const;

type StatusSub = { remove: () => void };

let player: AudioPlayer | null = null;
let statusSub: StatusSub | null = null;
let pendingSeekSeconds = 0;
let audioModeReady = false;
let audioModePromise: Promise<void> | null = null;
let advancing = false;
let continuousAdvance = false;
let prefetchTimer: ReturnType<typeof setTimeout> | null = null;
let shouldBePlaying = false;
let loadWatchdog: ReturnType<typeof setTimeout> | null = null;
let loadRetries = 0;
let lastTrack: AudioTrackInfo | null = null;
let lastStartSeconds = 0;
let ttsTimer: ReturnType<typeof setInterval> | null = null;
let ttsWatchdog: ReturnType<typeof setTimeout> | null = null;

const LOAD_TIMEOUT_MS = 9000;
const MAX_LOAD_RETRIES = 2;

function ttsTextOf(track: AudioTrackInfo): string {
  return (track.ttsText || track.translation || '').trim();
}

function estimateTtsSeconds(text: string, rate: number): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  const base = Math.max(2, words / 2.2);
  return base / (rate > 0 ? rate : 1);
}

function clearTtsTimer(): void {
  if (ttsTimer) {
    clearInterval(ttsTimer);
    ttsTimer = null;
  }
  if (ttsWatchdog) {
    clearTimeout(ttsWatchdog);
    ttsWatchdog = null;
  }
}

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
  if (!audioModePromise) {
    audioModePromise = setAudioModeAsync({
      allowsRecording: false,
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
      interruptionMode: 'duckOthers',
    })
      .then(() => {
        audioModeReady = true;
      })
      .catch(() => {
        audioModePromise = null;
      });
  }
  await audioModePromise;
}

const LAST_SURAH_NUMBER = 114;

async function buildSurahTracks(surahNumber: number): Promise<AudioTrackInfo[]> {
  const ayahs = await quranService.getSurahAyahs(surahNumber);
  if (!ayahs || ayahs.length === 0) {
    return [];
  }

  const reciter = getReciter(usePreferencesStore.getState().reciterId);
  const playTranslation = usePreferencesStore.getState().playTranslation;
  const language = useUserStore.getState().language;
  const meta = getSurahMeta(surahNumber);
  const surahName = meta?.englishName ?? `Surah ${surahNumber}`;
  const translationLabel = language === 'ur' ? 'ترجمہ' : 'Translation';
  const translationTextFor = (a: QuranAyah) => (language === 'ur' ? a.urdu : a.translation);

  const tracks: AudioTrackInfo[] = [];
  for (const a of ayahs) {
    tracks.push({
      id: a.id,
      url: ayahAudioUrl(reciter, surahNumber, a.ayah),
      title: `${surahName} ${surahNumber}:${a.ayah}`,
      artist: reciter.name,
      arabic: a.arabic,
      translation: translationTextFor(a) ?? undefined,
      subtitle: `${surahName} • ${surahNumber}:${a.ayah}`,
      surahNumber,
    });

    const translationText = translationTextFor(a);
    if (playTranslation && translationText) {
      const chunks = splitForTts(translationText);
      chunks.forEach((chunk, i) => {
        tracks.push({
          id: chunks.length > 1 ? `${a.id}::${language}::${i}` : `${a.id}::${language}`,
          url: ttsAudioUrl(chunk, language),
          title: `${surahName} ${surahNumber}:${a.ayah} — ${translationLabel}`,
          artist: language === 'ur' ? 'اردو ترجمہ (آواز)' : 'Translation (Voice)',
          arabic: a.arabic,
          translation: translationText,
          subtitle: `${surahName} • ${surahNumber}:${a.ayah} • ${translationLabel}`,
          surahNumber,
        });
      });
    }
  }

  return tracks;
}

export const useAudioStore = create<AudioState>((set, get) => {

  const prefetchDurations = async (tracks: AudioTrackInfo[]) => {
    const ttsTracks = tracks.filter((t) => t.tts && !(get().durations[t.id] > 0));
    if (ttsTracks.length > 0) {
      const rate = get().playbackRate;
      const next = { ...get().durations };
      for (const t of ttsTracks) {
        next[t.id] = estimateTtsSeconds(ttsTextOf(t) || ' ', rate);
      }
      set({ durations: next });
    }
    const todo = tracks.filter((t) => !t.tts && !(get().durations[t.id] > 0));
    const CONCURRENCY = Platform.OS === 'web' ? 6 : 2;
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

  const scheduleDurationPrefetch = (tracks: AudioTrackInfo[]) => {
    if (prefetchTimer) clearTimeout(prefetchTimer);
    prefetchTimer = setTimeout(() => {
      prefetchTimer = null;
      void prefetchDurations(tracks);
    }, 1200);
  };

  const clearLoadWatchdog = () => {
    if (loadWatchdog) {
      clearTimeout(loadWatchdog);
      loadWatchdog = null;
    }
  };

  const teardownPlayer = () => {
    clearLoadWatchdog();
    clearTtsTimer();
    stopSpeech();
    if (statusSub) {
      try {
        statusSub.remove();
      } catch {}
      statusSub = null;
    }
    if (player) {
      try {
        player.pause();
      } catch {}
      try {
        player.remove();
      } catch {}
      player = null;
    }
  };

  const maybeAutoAdvanceSurah = async (): Promise<boolean> => {
    if (!get().autoAdvanceSurah) {
      return false;
    }
    if (!usePreferencesStore.getState().autoPlayNextSurah) {
      return false;
    }
    const finished = get().currentTrack?.surahNumber;
    if (!finished || finished >= LAST_SURAH_NUMBER) {
      return false;
    }
    try {
      const tracks = await buildSurahTracks(finished + 1);
      if (tracks.length === 0) {
        return false;
      }
      await get().playTrack(tracks[0]);
      await get().setQueue(tracks);
      return true;
    } catch {
      return false;
    }
  };

  const handleTrackFinished = async () => {
    if (advancing) return;
    advancing = true;
    try {
      if (get().isRepeatEnabled && player) {
        await player.seekTo(0);
        player.play();
        return;
      }
      const { queue, currentTrack } = get();
      const idx = currentTrack ? queue.findIndex((t) => t.id === currentTrack.id) : -1;
      const stopHere = () => {
        shouldBePlaying = false;
        clearLoadWatchdog();
        set({ playbackState: PlaybackState.Paused });
      };
      if (idx >= 0 && idx < queue.length - 1) {
        if (usePreferencesStore.getState().autoPlayNextAyah) {
          await get().skipToNext();
        } else {
          stopHere();
        }
      } else {
        const advanced = await maybeAutoAdvanceSurah();
        if (!advanced) {
          stopHere();
        }
      }
    } finally {
      advancing = false;
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

    if (status.playing) {
      clearLoadWatchdog();
      loadRetries = 0;
      continuousAdvance = false;
    } else if (shouldBePlaying && player && !status.isBuffering && !status.didJustFinish) {
      try {
        player.play();
      } catch {}
    }

    const durationSeconds = status.duration || 0;

    set({
      position: status.currentTime,
      duration: durationSeconds,
      playbackState: status.playing
        ? PlaybackState.Playing
        : status.isBuffering
        ? continuousAdvance
          ? PlaybackState.Playing
          : PlaybackState.Buffering
        : shouldBePlaying
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

  const applyRate = (rate: number) => {
    if (!player) return;
    try {
      player.shouldCorrectPitch = true;
      player.setPlaybackRate(rate, 'high');
    } catch {}
  };

  const armLoadWatchdog = (track: AudioTrackInfo, startSeconds: number) => {
    clearLoadWatchdog();
    loadWatchdog = setTimeout(() => {
      loadWatchdog = null;
      if (!shouldBePlaying) return;
      if (player && get().playbackState === PlaybackState.Playing) return;
      if (loadRetries < MAX_LOAD_RETRIES) {
        loadRetries += 1;
        startPlayback(track, startSeconds);
      } else {
        shouldBePlaying = false;
        set({ playbackState: PlaybackState.Paused });
      }
    }, LOAD_TIMEOUT_MS);
  };

  const startTts = (track: AudioTrackInfo) => {
    const text = ttsTextOf(track);
    const rate = get().playbackRate;
    const estimated = estimateTtsSeconds(text || ' ', rate);
    const durations = get().durations;
    set({
      position: 0,
      duration: estimated,
      playbackState: PlaybackState.Playing,
      ...(durations[track.id] !== estimated
        ? { durations: { ...durations, [track.id]: estimated } }
        : {}),
    });

    const lang = track.ttsLang || 'ur';
    const speech = Platform.OS === 'web' ? null : getSpeech();

    if (!text || (Platform.OS !== 'web' && !speech)) {
      void handleTrackFinished();
      return;
    }

    const advanceOnce = () => {
      if (get().currentTrack?.id === track.id) {
        clearTtsTimer();
        void handleTrackFinished();
      }
    };

    clearTtsTimer();
    ttsTimer = setInterval(() => {
      const state = get();
      if (!state.currentTrack || state.currentTrack.id !== track.id) {
        clearTtsTimer();
        return;
      }
      const next = Math.min(estimated, state.position + 0.25);
      set({ position: next });
    }, 250);
    ttsWatchdog = setTimeout(advanceOnce, (estimated * 2 + 6) * 1000);

    if (Platform.OS === 'web') {
      void webSpeak(text, lang, rate, advanceOnce, advanceOnce);
      return;
    }

    try {
      speech!.speak(text, {
        language: lang,
        rate,
        onDone: advanceOnce,
        onError: advanceOnce,
      });
    } catch {
      advanceOnce();
    }
    void warnIfNoVoice(lang);
  };

  const startPlayback = (track: AudioTrackInfo, startSeconds: number) => {
    teardownPlayer();
    lastTrack = track;
    lastStartSeconds = startSeconds;
    if (track.tts) {
      startTts(track);
      return;
    }
    pendingSeekSeconds = startSeconds > 0 ? startSeconds : 0;
    player = createAudioPlayer({ uri: track.url }, { updateInterval: 100 });
    statusSub = player.addListener('playbackStatusUpdate', onPlaybackStatusUpdate);
    applyRate(get().playbackRate);
    player.play();
    armLoadWatchdog(track, startSeconds);
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
    playbackRate: 1,
    autoAdvanceSurah: true,

    playTrack: async (track, startSeconds = 0) => {
      try {
        const prev = get().playbackState;
        const continuingSession =
          shouldBePlaying ||
          prev === PlaybackState.Playing ||
          prev === PlaybackState.Buffering;
        continuousAdvance = continuingSession;
        shouldBePlaying = true;
        loadRetries = 0;
        set({
          currentTrack: track,
          position: startSeconds,
          duration: get().durations[track.id] || 0,
          playbackState: continuingSession
            ? PlaybackState.Playing
            : PlaybackState.Buffering,
        });

        await ensureAudioMode();
        startPlayback(track, startSeconds);

        if (track.id.startsWith('sc-') && /^https?:/i.test(track.url)) {
          const tid = Number(track.id.slice(3));
          const withinAutoCap =
            !track.durationMs || track.durationMs <= 90 * 60 * 1000;
          if (tid > 0 && withinAutoCap) {
            void useAudioDownloadStore
              .getState()
              .ensureCached({ trackId: tid, title: track.title }, track.surahNumber);
          }
        }
      } catch (error) {
        console.error('Error playing track via expo-audio:', error);
      }
    },

    togglePlay: async () => {
      try {
        const { currentTrack, playbackState } = get();
        if (currentTrack?.tts) {
          if (playbackState === PlaybackState.Playing) {
            shouldBePlaying = false;
            continuousAdvance = false;
            clearTtsTimer();
            stopSpeech();
            set({ playbackState: PlaybackState.Paused });
          } else {
            shouldBePlaying = true;
            await ensureAudioMode();
            startTts(currentTrack);
          }
          return;
        }
        if (!player) {
          if (currentTrack) await get().playTrack(currentTrack, get().position);
          return;
        }
        if (playbackState === PlaybackState.Playing) {
          shouldBePlaying = false;
          continuousAdvance = false;
          clearLoadWatchdog();
          player.pause();
          set({ playbackState: PlaybackState.Paused });
        } else {
          shouldBePlaying = true;
          loadRetries = 0;
          await ensureAudioMode();
          player.play();
          armLoadWatchdog(lastTrack ?? currentTrack!, get().position);
          set({ playbackState: PlaybackState.Buffering });
        }
      } catch (error) {
        console.error('Error toggling playback:', error);
      }
    },

    setQueue: async (tracks) => {
      set({ queue: tracks });
      const known = { ...get().durations };
      let changed = false;
      for (const t of tracks) {
        if (t.durationMs && t.durationMs > 0 && !(known[t.id] > 0)) {
          known[t.id] = t.durationMs / 1000;
          changed = true;
        }
      }
      if (changed) set({ durations: known });
      if (tracks.length > 0 && !get().currentTrack) {
        await get().playTrack(tracks[0]);
      }
      scheduleDurationPrefetch(tracks);
    },

    setAutoAdvanceSurah: (enabled) => set({ autoAdvanceSurah: enabled }),

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

    setPlaybackRate: (rate) => {
      set({ playbackRate: rate });
      applyRate(rate);
    },

    resetPlayer: async () => {
      try {
        shouldBePlaying = false;
        continuousAdvance = false;
        loadRetries = 0;
        lastTrack = null;
        if (prefetchTimer) {
          clearTimeout(prefetchTimer);
          prefetchTimer = null;
        }
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

export interface PlaybackTimeline {
  useGlobal: boolean;
  measured: boolean;
  currentIndex: number;
  queueLength: number;
  displayPosition: number;
  totalDuration: number;
  percent: number;
}

export function usePlaybackTimeline(): PlaybackTimeline {
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const position = useAudioStore((s) => s.position);
  const duration = useAudioStore((s) => s.duration);
  const queue = useAudioStore((s) => s.queue);
  const durations = useAudioStore((s) => s.durations);

  const currentIndex = currentTrack
    ? queue.findIndex((t) => t.id === currentTrack.id)
    : -1;
  const useGlobal = queue.length > 1 && currentIndex >= 0;

  if (!useGlobal) {
    const total = duration;
    return {
      useGlobal: false,
      measured: total > 0,
      currentIndex,
      queueLength: queue.length,
      displayPosition: position,
      totalDuration: total,
      percent: total > 0 ? Math.min(100, (position / total) * 100) : 0,
    };
  }

  const measured = queue.every((t) => (durations[t.id] || 0) > 0);
  const elapsedBefore = queue
    .slice(0, currentIndex)
    .reduce((sum, t) => sum + (durations[t.id] || 0), 0);
  const knownTotal = queue.reduce((sum, t) => sum + (durations[t.id] || 0), 0);
  const displayPosition = elapsedBefore + position;
  const totalDuration = measured ? knownTotal : 0;
  const percent =
    totalDuration > 0 ? Math.min(100, (displayPosition / totalDuration) * 100) : 0;

  return {
    useGlobal: true,
    measured,
    currentIndex,
    queueLength: queue.length,
    displayPosition,
    totalDuration,
    percent,
  };
}

declare const module: { hot?: { dispose: (cb: () => void) => void } } | undefined;

if (typeof module !== 'undefined' && module?.hot) {
  module.hot.dispose(() => {
    try {
      statusSub?.remove();
    } catch {}
    try {
      player?.pause();
      player?.remove();
    } catch {}
    stopSpeech();
    if (ttsTimer) {
      clearInterval(ttsTimer);
      ttsTimer = null;
    }
    if (loadWatchdog) {
      clearTimeout(loadWatchdog);
      loadWatchdog = null;
    }
    shouldBePlaying = false;
    continuousAdvance = false;
    player = null;
    statusSub = null;
  });
}
