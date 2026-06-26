import { apiClient } from './apiClient';
import { cached, cachedRevalidate } from './offlineCache';
import {
  Book,
  BookCategory,
  Chapter,
  Content,
  QuranTafseerSection,
} from '@shared-types';
import {
  mockQuranBook,
  mockSurahs,
  mockAyahsForChapter,
} from '@/data/quranMockSource';

const USE_MOCK = false;

const MOCK_LATENCY_MS = 250;
const settle = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));

async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

export const quranService = {
  async getQuranBook(): Promise<Book | null> {
    if (USE_MOCK) return settle(mockQuranBook);
    return cached('quran:book', async () => {
      const books = await unwrap<Book[]>(
        apiClient.get('/books', {
          params: { category: BookCategory.QURAN, limit: 1 },
        })
      );
      return books && books.length > 0 ? books[0] : null;
    });
  },

  async getSurahs(bookId: string): Promise<Chapter[]> {
    if (USE_MOCK) return settle(mockSurahs);
    return cachedRevalidate(`quran:surahs:${bookId}`, () =>
      unwrap<Chapter[]>(apiClient.get(`/books/${bookId}/chapters`))
    );
  },

  async getSurahAyahs(bookId: string, chapterId: string): Promise<Content[]> {
    if (USE_MOCK) return settle(mockAyahsForChapter(chapterId));
    return cachedRevalidate(`quran:ayahs:${bookId}:${chapterId}`, async () => {
      const limit = 100;
      const all: Content[] = [];
      for (let page = 1; page <= 50; page++) {
        const batch = await unwrap<Content[]>(
          apiClient.get(`/books/${bookId}/chapters/${chapterId}/contents`, {
            params: { page, limit },
          })
        );
        all.push(...batch);
        if (batch.length < limit) break;
      }
      return all;
    });
  },

  async getTafseerSections(surah: number): Promise<QuranTafseerSection[]> {
    return cachedRevalidate(`quran:tafseer:${surah}`, () =>
      unwrap<QuranTafseerSection[]>(apiClient.get(`/quran/tafseer/${surah}`))
    );
  },
};
