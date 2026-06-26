import { apiClient } from './apiClient';
import { cached, readCache, writeCache } from './offlineCache';
import { Book, BookCategory, Chapter, Content, Duaa } from '@shared-types';

export interface OfflineBook {
  id: string;
  title: string;
  titleUrdu: string | null;
  author: string;
  category: BookCategory;
  coverImage: string | null;
}

export interface OfflineChapter {
  id: string;
  bookId: string;
  chapterName: string;
  chapterNameUrdu: string | null;
  sequenceOrder: number;
}

export interface OfflineContent {
  id: string;
  chapterId: string;
  verseText: string;
  translationText: string | null;
  urduText: string | null;
  audioUrl: string | null;
  sequenceNumber: number;
  hadithNumber?: number | null;
  narrator?: string | null;
}

export interface OfflineDuaa {
  id: string;
  title: string;
  titleUrdu: string | null;
  arabicText: string;
  translation: string;
  urduText: string | null;
  category: string;
  isFavorite: boolean;
  audioUrl?: string | null;
}

const DUAA_CACHE_KEY = 'offline:duaa:all';
const BOOKS_CACHE_KEY = 'offline:books:all';
const PAGE_LIMIT = 100;

async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

async function fetchAllPages<T>(path: string): Promise<T[]> {
  const all: T[] = [];
  for (let page = 1; page <= 100; page++) {
    const batch = await unwrap<T[]>(
      apiClient.get(path, { params: { page, limit: PAGE_LIMIT } })
    );
    all.push(...batch);
    if (batch.length < PAGE_LIMIT) break;
  }
  return all;
}

function toOfflineBook(book: Book): OfflineBook {
  return {
    id: book.id,
    title: book.title,
    titleUrdu: book.titleUrdu ?? null,
    author: book.author,
    category: book.category,
    coverImage: book.coverImage ?? null,
  };
}

function toOfflineChapter(chapter: Chapter): OfflineChapter {
  return {
    id: chapter.id,
    bookId: chapter.bookId,
    chapterName: chapter.chapterName,
    chapterNameUrdu: chapter.chapterNameUrdu ?? null,
    sequenceOrder: chapter.sequenceOrder,
  };
}

function toOfflineContent(content: Content): OfflineContent {
  return {
    id: content.id,
    chapterId: content.chapterId,
    verseText: content.verseText,
    translationText: content.translationText ?? null,
    urduText: content.urduText ?? null,
    audioUrl: content.audioUrl ?? null,
    sequenceNumber: content.sequenceNumber,
    hadithNumber: content.hadithNumber ?? null,
    narrator: content.narrator ?? null,
  };
}

function toOfflineDuaa(duaa: Duaa): OfflineDuaa {
  return {
    id: duaa.id,
    title: duaa.title,
    titleUrdu: duaa.titleUrdu ?? null,
    arabicText: duaa.arabicText,
    translation: duaa.translation,
    urduText: duaa.urduText ?? null,
    category: duaa.category,
    isFavorite: duaa.isFavorite,
    audioUrl: duaa.audioUrl ?? null,
  };
}

class OfflineStorageService {
  async getBooks(): Promise<OfflineBook[]> {
    return cached(BOOKS_CACHE_KEY, async () => {
      const books = await fetchAllPages<Book>('/books');
      return books.map(toOfflineBook);
    });
  }

  async getBookById(id: string): Promise<OfflineBook | null> {
    const books = await this.getBooks();
    return books.find((b) => b.id === id) ?? null;
  }

  async getChapters(bookId: string): Promise<OfflineChapter[]> {
    return cached(`offline:chapters:${bookId}`, async () => {
      const chapters = await unwrap<Chapter[]>(
        apiClient.get(`/books/${bookId}/chapters`)
      );
      return chapters.map(toOfflineChapter);
    });
  }

  async getChapterContents(
    bookId: string,
    chapterId: string
  ): Promise<OfflineContent[]> {
    return cached(`offline:contents:${bookId}:${chapterId}`, async () => {
      const contents = await fetchAllPages<Content>(
        `/books/${bookId}/chapters/${chapterId}/contents`
      );
      return contents.map(toOfflineContent);
    });
  }

  async getDuaas(): Promise<OfflineDuaa[]> {
    return cached(DUAA_CACHE_KEY, async () => {
      const duaas = await fetchAllPages<Duaa>('/duaa');
      return duaas.map(toOfflineDuaa);
    });
  }

  async toggleDuaaFavorite(id: string): Promise<OfflineDuaa | null> {
    const list = await this.getDuaas();
    let updated: OfflineDuaa | null = null;
    const next = list.map((d) => {
      if (d.id !== id) {
        return d;
      }
      updated = { ...d, isFavorite: !d.isFavorite };
      return updated;
    });
    if (!updated) {
      return null;
    }
    await writeCache(DUAA_CACHE_KEY, next);
    return updated;
  }

  async searchOffline(query: string): Promise<{
    books: OfflineBook[];
    duaas: OfflineDuaa[];
  }> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { books: [], duaas: [] };
    }

    const [books, duaas] = await Promise.all([
      readCache<OfflineBook[]>(BOOKS_CACHE_KEY),
      readCache<OfflineDuaa[]>(DUAA_CACHE_KEY),
    ]);

    const filteredBooks = (books ?? []).filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.titleUrdu && b.titleUrdu.includes(q)) ||
        b.author.toLowerCase().includes(q)
    );

    const filteredDuaas = (duaas ?? []).filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.titleUrdu && d.titleUrdu.includes(q)) ||
        d.arabicText.includes(q) ||
        d.translation.toLowerCase().includes(q) ||
        (d.urduText && d.urduText.includes(q))
    );

    return { books: filteredBooks, duaas: filteredDuaas };
  }
}

export const offlineStorageService = new OfflineStorageService();
