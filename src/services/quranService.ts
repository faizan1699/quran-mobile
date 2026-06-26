import { apiClient } from './apiClient';
import { cached, cachedRevalidate } from './offlineCache';
import { QuranAyah, QuranSurahSummary, QuranTafseerSection } from '@shared-types';

async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

export const quranService = {
  async getSurahs(): Promise<QuranSurahSummary[]> {
    return cached('quran:surahs', () =>
      unwrap<QuranSurahSummary[]>(apiClient.get('/quran/surahs'))
    );
  },

  async getSurahAyahs(surah: number): Promise<QuranAyah[]> {
    return cachedRevalidate(`quran:ayahs:${surah}`, () =>
      unwrap<QuranAyah[]>(apiClient.get(`/quran/surah/${surah}`))
    );
  },

  async getTafseerSections(surah: number): Promise<QuranTafseerSection[]> {
    return cachedRevalidate(`quran:tafseer:${surah}`, () =>
      unwrap<QuranTafseerSection[]>(apiClient.get(`/quran/tafseer/${surah}`))
    );
  },
};
