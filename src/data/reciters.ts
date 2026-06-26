export interface Reciter {
  id: string;
  name: string;
  nameUrdu: string;
  folder: string;
}

export const RECITERS: Reciter[] = [
  {
    id: 'shuraim',
    name: 'Saud Al-Shuraim',
    nameUrdu: 'سعود الشریم',
    folder: 'Saood_ash-Shuraym_128kbps',
  },
  {
    id: 'sudais',
    name: 'Abdurrahman As-Sudais',
    nameUrdu: 'عبدالرحمٰن السدیس',
    folder: 'Abdurrahmaan_As-Sudais_192kbps',
  },
  {
    id: 'alafasy',
    name: 'Mishary Rashid Alafasy',
    nameUrdu: 'مشاری راشد العفاسی',
    folder: 'Alafasy_128kbps',
  },
  {
    id: 'abdulbasit',
    name: 'Abdul Basit (Murattal)',
    nameUrdu: 'عبدالباسط (مرتل)',
    folder: 'Abdul_Basit_Murattal_64kbps',
  },
  {
    id: 'husary',
    name: 'Mahmoud Khalil Al-Husary',
    nameUrdu: 'محمود خلیل الحصری',
    folder: 'Husary_128kbps',
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
