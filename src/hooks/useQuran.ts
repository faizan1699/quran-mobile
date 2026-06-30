import { useQuery } from '@tanstack/react-query';
import { quranService } from '@/services/quranService';
import { audioContentService, ScTrack } from '@/services/audioContentService';
import { QuranAyah, QuranSurahSummary, QuranTafseerSection } from '@shared-types';

/** Surah index (number + ayah count) sourced from the QuranAyah table. */
export function useSurahs(): {
  surahs: QuranSurahSummary[];
  isLoading: boolean;
  isError: boolean;
  refetch: () => void;
} {
  const query = useQuery({
    queryKey: ['quran', 'surahs'],
    queryFn: () => quranService.getSurahs(),
    staleTime: Infinity,
  });

  return {
    surahs: query.data ?? [],
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
  };
}

/** Ayahs of a single surah from the QuranAyah table. */
export function useSurahAyahs(surah?: number) {
  return useQuery<QuranAyah[]>({
    queryKey: ['quran', 'ayahs', surah],
    queryFn: () => quranService.getSurahAyahs(surah as number),
    enabled: !!surah,
    staleTime: Infinity,
  });
}

/** Taleem-ul-Quran tafseer sections (ayah-range based) for a surah. */
export function useTafseerSections(surahNumber?: number) {
  return useQuery<QuranTafseerSection[]>({
    queryKey: ['quran', 'tafseer', surahNumber],
    queryFn: () => quranService.getTafseerSections(surahNumber as number),
    enabled: !!surahNumber,
    staleTime: Infinity,
  });
}

/** Sheikh Saeed tilaawat + tarjumah audio tracks (SoundCloud) for a surah. */
export function useTilawatTracks(surah?: number) {
  return useQuery<ScTrack[]>({
    queryKey: ['audio', 'tilawat', surah],
    queryFn: () => audioContentService.getTilawat(surah as number),
    enabled: !!surah,
    staleTime: Infinity,
  });
}

/** Sheikh Saeed tafseer lesson audio tracks (SoundCloud) for a surah. */
export function useTafseerAudioTracks(surah?: number) {
  return useQuery<ScTrack[]>({
    queryKey: ['audio', 'tafseer', surah],
    queryFn: () => audioContentService.getTafseer(surah as number),
    enabled: !!surah,
    staleTime: Infinity,
  });
}
