export interface Reciter {
  id: string;
  name: string;
  nameUrdu: string;
  folder: string;
  quranComId: number;
}

export const RECITERS: Reciter[] = [
  {
    id: 'shuraim',
    name: 'Saud Al-Shuraim',
    nameUrdu: 'سعود الشریم',
    folder: 'Saood_ash-Shuraym_128kbps',
    quranComId: 10,
  },
  {
    id: 'sudais',
    name: 'Abdurrahman As-Sudais',
    nameUrdu: 'عبدالرحمٰن السدیس',
    folder: 'Abdurrahmaan_As-Sudais_192kbps',
    quranComId: 3,
  },
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    nameUrdu: 'مشاری راشد العفاسی',
    folder: 'Alafasy_128kbps',
    quranComId: 7,
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit (Murattal)',
    nameUrdu: 'عبدالباسط (مرتل)',
    folder: 'Abdul_Basit_Murattal_64kbps',
    quranComId: 2,
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    nameUrdu: 'محمود خلیل الحصری',
    folder: 'Husary_128kbps',
    quranComId: 6,
  },
];

export const DEFAULT_RECITER_ID = 'shuraim';

export const DEFAULT_RECITER: Reciter =
  RECITERS.find((r) => r.id === DEFAULT_RECITER_ID) ?? RECITERS[0];

export function getReciter(id: string | null | undefined): Reciter {
  return RECITERS.find((r) => r.id === id) ?? DEFAULT_RECITER;
}

function pad3(value: number): string {
  return value.toString().padStart(3, '0');
}

export function ayahAudioUrl(
  reciter: Reciter,
  surahNumber: number,
  ayahNumber: number
): string {
  return `https://everyayah.com/data/${reciter.folder}/${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
}

export interface TranslationReciter {
  id: string;
  name: string;
  nameUrdu: string;
  folder: string;
}

export const URDU_TRANSLATION: TranslationReciter = {
  id: 'urdu_shamshad',
  name: 'Urdu Translation (Shamshad Ali Khan)',
  nameUrdu: 'اردو ترجمہ (شمشاد علی خان)',
  folder: 'translations/Urdu_Shamshad_Ali_Khan_46kbps',
};

export const ENGLISH_TRANSLATION: TranslationReciter = {
  id: 'english_ibrahim_walk',
  name: 'English Translation (Saheeh International)',
  nameUrdu: 'انگریزی ترجمہ (صحیح انٹرنیشنل)',
  folder: 'English/Sahih_Intnl_Ibrahim_Walk_192kbps',
};

export function translationReciterFor(
  language: 'en' | 'ur'
): TranslationReciter {
  return language === 'ur' ? URDU_TRANSLATION : ENGLISH_TRANSLATION;
}

export function translationAudioUrl(
  surahNumber: number,
  ayahNumber: number,
  language: 'en' | 'ur' = 'ur'
): string {
  const reciter = translationReciterFor(language);
  return `https://everyayah.com/data/${reciter.folder}/${pad3(surahNumber)}${pad3(ayahNumber)}.mp3`;
}
