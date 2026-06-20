import { apiClient } from './apiClient';
import { Book, BookCategory, Chapter, Content } from '@shared-types';
import {
  mockQuranBook,
  mockSurahs,
  mockAyahsForChapter,
} from '@/data/quranMockSource';

/**
 * While `USE_MOCK` is true the Quran reads from the bundled `quran.json`
 * (see quranMockSource.ts) so the whole flow works without a backend. Flip it
 * to false to read the live, admin-managed content from the API — the return
 * shapes are identical, so no hook or screen changes are needed.
 */
const USE_MOCK = false;

/** Small artificial latency so loading spinners still get exercised. */
const MOCK_LATENCY_MS = 250;
const settle = <T>(value: T): Promise<T> =>
  new Promise((resolve) => setTimeout(() => resolve(value), MOCK_LATENCY_MS));

/**
 * The axios response interceptor (see apiClient.ts) unwraps the
 * `{ success, data }` envelope and resolves with the payload itself, so the
 * resolved value of each request is already the data — not an AxiosResponse.
 * This helper restores the correct static type.
 */
async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

/**
 * The Quran is modeled on the generic Book -> Chapter -> Content schema:
 *   Quran = a Book (category QURAN), Surah = Chapter, Ayah = Content.
 * These calls reuse the existing /books endpoints.
 */
export const quranService = {
  /** Resolve the published Quran book (category QURAN). */
  async getQuranBook(): Promise<Book | null> {
    if (USE_MOCK) return settle(mockQuranBook);
    const books = await unwrap<Book[]>(
      apiClient.get('/books', {
        params: { category: BookCategory.QURAN, limit: 1 },
      })
    );
    return books && books.length > 0 ? books[0] : null;
  },

  /** All surahs (chapters) of the Quran book, ordered by surah number. */
  async getSurahs(bookId: string): Promise<Chapter[]> {
    if (USE_MOCK) return settle(mockSurahs);
    return unwrap<Chapter[]>(apiClient.get(`/books/${bookId}/chapters`));
  },

  /**
   * All ayahs (content) of a surah. The API caps page size at 100, so for
   * long surahs (e.g. Al-Baqarah, 286 ayahs) we page through until a short
   * page is returned. The response interceptor drops pagination meta, so we
   * detect the end by a batch smaller than the page size.
   */
  async getSurahAyahs(bookId: string, chapterId: string): Promise<Content[]> {
    if (USE_MOCK) return settle(mockAyahsForChapter(chapterId));
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
  },
};
