import { apiClient, getBaseUrl } from './apiClient';
import { cached } from './offlineCache';

export interface ScTrack {
  trackId: number;
  title: string;
  duration: number | null;
}

async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

export const audioContentService = {
  async getTilawat(surah: number): Promise<ScTrack[]> {
    return cached(`audio:tilawat:${surah}`, () =>
      unwrap<ScTrack[]>(apiClient.get(`/quran/audio/tilawat/${surah}`))
    );
  },

  async getTafseer(surah: number): Promise<ScTrack[]> {
    return cached(`audio:tafseer:${surah}`, () =>
      unwrap<ScTrack[]>(apiClient.get(`/quran/audio/tafseer/${surah}`))
    );
  },
};

export function scStreamUrl(trackId: number): string {
  return `${getBaseUrl()}/quran/audio/stream/${trackId}`;
}
