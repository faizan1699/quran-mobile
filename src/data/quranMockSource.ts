/**
 * Mock Quran source.
 *
 * Transforms the bundled `quran.json` (raw surah/ayah data) into the exact
 * `Book` / `Chapter` / `Content` shapes the backend `/books` endpoints return,
 * so the Quran screens render fully offline with no API running.
 *
 * Because the shapes are identical to the live API, swapping back to the real,
 * admin-managed backend later is a single flag flip in `quranService.ts`
 * (USE_MOCK = false) — no screen or hook changes required. That is what keeps
 * the user UI responsive regardless of where the content comes from.
 */
import { Book, BookCategory, Chapter, Content, ContentStatus } from '@shared-types';
import quranJson from '@/data/quran.json';

interface RawAyah {
  n: number;
  arabic: string;
  en: string;
  urdu: string;
  urduSrc?: string;
}

interface RawSurah {
  number: number;
  name: string;
  nameUrdu: string;
  ayahs: RawAyah[];
}

const SURAHS = quranJson as unknown as RawSurah[];

export const QURAN_BOOK_ID = 'quran-book';
const RECITER = 'Mishary Rashid Alafasy';
// A stable, content-independent timestamp keeps these mock records pure so the
// list never re-orders between renders.
const STAMP = '2024-01-01T00:00:00.000Z';

const pad3 = (n: number): string => String(n).padStart(3, '0');

/** Per-ayah recitation from the public EveryAyah CDN (Alafasy, 128kbps). */
function ayahAudioUrl(surah: number, ayah: number): string {
  return `https://everyayah.com/data/Alafasy_128kbps/${pad3(surah)}${pad3(ayah)}.mp3`;
}

export const surahChapterId = (surahNumber: number): string => `surah-${surahNumber}`;
const ayahContentId = (surahNumber: number, ayahNumber: number): string =>
  `ayah-${surahNumber}-${ayahNumber}`;

/**
 * Lightweight mock tafseer. The opening ayahs of Al-Fatihah carry a short,
 * authentic-flavoured note; everything else gets a contextual placeholder so
 * the Tafseer toggle always has something to show in the demo.
 */
const TAFSEER_SEED: Record<string, { en: string; ur: string }> = {
  'ayah-1-1': {
    en: 'Every act is begun in the name of Allah, invoking His mercy (Rahman — universal, Rahim — special to the believers) before any undertaking.',
    ur: 'ہر کام اللہ کے نام سے شروع کیا جاتا ہے، اس کی رحمت کو طلب کرتے ہوئے — رحمٰن (سب کے لیے عام) اور رحیم (مومنوں کے لیے خاص)۔',
  },
  'ayah-1-2': {
    en: 'All praise belongs to Allah alone, the Sustainer and Nurturer of every world and all that exists within them.',
    ur: 'ہر قسم کی تعریف صرف اللہ کے لیے ہے، جو تمام جہانوں کا پالنے والا اور پروردگار ہے۔',
  },
  'ayah-1-5': {
    en: 'The heart of the surah: worship and reliance are directed to Allah alone — a daily renewal of pure monotheism (tawhid).',
    ur: 'سورہ کا مرکز: عبادت اور مدد صرف اللہ سے مانگی جاتی ہے — یہ خالص توحید کی روزانہ تجدید ہے۔',
  },
};

function buildTafseer(surah: RawSurah, ayah: RawAyah): string {
  const key = ayahContentId(surah.number, ayah.n);
  const seed = TAFSEER_SEED[key];
  if (seed) return `${seed.en}\n\n${seed.ur}`;
  // Contextual placeholder built from the ayah's own translation.
  return (
    `Tafseer (sample): This verse of Surah ${surah.name} (${surah.number}:${ayah.n}) ` +
    `reminds the believer — "${ayah.en}" — and its detailed commentary is part of the ` +
    `Tafseer collection synced from the library.\n\n` +
    `تفسیر (نمونہ): سورہ ${surah.nameUrdu} کی یہ آیت (${surah.number}:${ayah.n}) ` +
    `مومن کو یاد دلاتی ہے، اور اس کی مکمل تفسیر لائبریری سے منسلک ہے۔`
  );
}

function toContent(surah: RawSurah, ayah: RawAyah): Content {
  return {
    id: ayahContentId(surah.number, ayah.n),
    chapterId: surahChapterId(surah.number),
    verseText: ayah.arabic,
    translationText: ayah.en,
    urduText: ayah.urdu,
    tafseerText: buildTafseer(surah, ayah),
    audioUrl: ayahAudioUrl(surah.number, ayah.n),
    sequenceNumber: ayah.n,
    hadithNumber: null,
    narrator: RECITER,
    status: ContentStatus.PUBLISHED,
    createdAt: STAMP,
  };
}

function toChapter(surah: RawSurah): Chapter {
  return {
    id: surahChapterId(surah.number),
    bookId: QURAN_BOOK_ID,
    chapterName: surah.name,
    chapterNameUrdu: surah.nameUrdu,
    sequenceOrder: surah.number,
  };
}

export const mockQuranBook: Book = {
  id: QURAN_BOOK_ID,
  title: 'Al-Quran al-Kareem',
  titleUrdu: 'القرآن الكريم',
  author: 'Divine Revelation',
  authorUrdu: 'وحی الٰہی',
  personalityId: null,
  category: BookCategory.QURAN,
  coverImage: null,
  status: ContentStatus.PUBLISHED,
  sequence: 1,
  createdAt: STAMP,
  updatedAt: STAMP,
};

export const mockSurahs: Chapter[] = SURAHS.map(toChapter);

const ayahsBySurah: Record<number, Content[]> = SURAHS.reduce(
  (acc, surah) => {
    acc[surah.number] = surah.ayahs.map((a) => toContent(surah, a));
    return acc;
  },
  {} as Record<number, Content[]>
);

/** Ayahs for a chapter id like `surah-2`. Returns a copy to stay immutable. */
export function mockAyahsForChapter(chapterId: string): Content[] {
  const match = chapterId.match(/^surah-(\d+)$/);
  if (!match) return [];
  return ayahsBySurah[Number(match[1])] ?? [];
}
