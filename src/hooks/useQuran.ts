import { useQuery } from '@tanstack/react-query';
import { quranService } from '@/services/quranService';
import { Book, Chapter, Content } from '@shared-types';

/** The Quran book record (resolved once, cached for the session). */
export function useQuranBook() {
  return useQuery({
    queryKey: ['quran', 'book'],
    queryFn: () => quranService.getQuranBook(),
    staleTime: Infinity,
  });
}

/** Quran book + its surahs in one convenient hook for the surah index. */
export function useSurahs(): {
  book: Book | null;
  surahs: Chapter[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const bookQuery = useQuranBook();
  const bookId = bookQuery.data?.id;

  const surahsQuery = useQuery({
    queryKey: ['quran', 'surahs', bookId],
    queryFn: () => quranService.getSurahs(bookId as string),
    enabled: !!bookId,
    staleTime: Infinity,
  });

  return {
    book: bookQuery.data ?? null,
    surahs: surahsQuery.data ?? [],
    isLoading: bookQuery.isLoading || (!!bookId && surahsQuery.isLoading),
    isError: bookQuery.isError || surahsQuery.isError,
    refetch: () => {
      void bookQuery.refetch();
      void surahsQuery.refetch();
    },
  };
}

/** Ayahs of a single surah. */
export function useSurahAyahs(bookId?: string, chapterId?: string) {
  return useQuery<Content[]>({
    queryKey: ['quran', 'ayahs', bookId, chapterId],
    queryFn: () => quranService.getSurahAyahs(bookId as string, chapterId as string),
    enabled: !!bookId && !!chapterId,
    staleTime: Infinity,
  });
}
