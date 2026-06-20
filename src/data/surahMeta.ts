/**
 * Static surah metadata (revelation place, English meaning, ayah count).
 * This never changes, so it is bundled with the app and merged with the
 * ayah content fetched from the backend. Keyed by surah number
 * (which maps to a Chapter's `sequenceOrder`).
 *
 * Only the surahs currently seeded in the backend are listed here; the
 * lookup helpers fall back gracefully to backend data when an entry is
 * missing, so this can be extended to all 114 surahs later.
 */
export interface SurahMeta {
  number: number;
  englishName: string;
  arabicName: string;
  meaning: string;
  meaningUrdu: string;
  revelation: 'Makki' | 'Madani';
  ayahCount: number;
}

export const SURAH_META: Record<number, SurahMeta> = {
  1: {
    number: 1,
    englishName: 'Al-Fatihah',
    arabicName: 'الفاتحة',
    meaning: 'The Opening',
    meaningUrdu: 'سورۃ فاتحہ',
    revelation: 'Makki',
    ayahCount: 7,
  },
  2: {
    number: 2,
    englishName: 'Al-Baqarah',
    arabicName: 'البقرة',
    meaning: 'The Cow',
    meaningUrdu: 'گائے',
    revelation: 'Madani',
    ayahCount: 286,
  },
  3: {
    number: 3,
    englishName: 'Aal-e-Imran',
    arabicName: 'آل عمران',
    meaning: 'Family of Imran',
    meaningUrdu: 'آلِ عمران',
    revelation: 'Madani',
    ayahCount: 200,
  },
  4: {
    number: 4,
    englishName: 'An-Nisa',
    arabicName: 'النساء',
    meaning: 'The Women',
    meaningUrdu: 'عورتیں',
    revelation: 'Madani',
    ayahCount: 176,
  },
  103: {
    number: 103,
    englishName: 'Al-Asr',
    arabicName: 'العصر',
    meaning: 'The Declining Day',
    meaningUrdu: 'زمانہ',
    revelation: 'Makki',
    ayahCount: 3,
  },
  108: {
    number: 108,
    englishName: 'Al-Kawthar',
    arabicName: 'الكوثر',
    meaning: 'Abundance',
    meaningUrdu: 'حوضِ کوثر',
    revelation: 'Makki',
    ayahCount: 3,
  },
  112: {
    number: 112,
    englishName: 'Al-Ikhlas',
    arabicName: 'الإخلاص',
    meaning: 'Sincerity',
    meaningUrdu: 'اخلاص',
    revelation: 'Makki',
    ayahCount: 4,
  },
  113: {
    number: 113,
    englishName: 'Al-Falaq',
    arabicName: 'الفلق',
    meaning: 'The Daybreak',
    meaningUrdu: 'صبح',
    revelation: 'Makki',
    ayahCount: 5,
  },
  114: {
    number: 114,
    englishName: 'An-Nas',
    arabicName: 'الناس',
    meaning: 'Mankind',
    meaningUrdu: 'لوگ',
    revelation: 'Makki',
    ayahCount: 6,
  },
};

export function getSurahMeta(surahNumber: number): SurahMeta | undefined {
  return SURAH_META[surahNumber];
}
