import { typography } from '@/tokens';

export interface ScriptFontOption {
  family: string;
  label: string;
  sample: string;
  /** Non-remapped alias used to render this option's preview (see fonts.ts). */
  previewFamily?: string;
}

export const DEFAULT_ARABIC_FONT = typography.fontFamily.arabic;
export const DEFAULT_URDU_FONT = typography.fontFamily.urdu;

const ARABIC_SAMPLE = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const URDU_SAMPLE = 'اللہ کے نام سے جو نہایت مہربان ہے';

export const ARABIC_FONTS: ScriptFontOption[] = [
  {
    family: 'Scheherazade New',
    label: 'Scheherazade',
    sample: ARABIC_SAMPLE,
    previewFamily: 'ScheherazadePreview',
  },
  { family: 'Amiri', label: 'Amiri', sample: ARABIC_SAMPLE },
  { family: 'Noto Naskh Arabic', label: 'Noto Naskh', sample: ARABIC_SAMPLE },
  { family: 'Lateef', label: 'Lateef', sample: ARABIC_SAMPLE },
];

export const URDU_FONTS: ScriptFontOption[] = [
  {
    family: 'Noto Nastaliq Urdu',
    label: 'Noto Nastaliq',
    sample: URDU_SAMPLE,
    previewFamily: 'NastaliqPreview',
  },
  { family: 'Gulzar', label: 'Gulzar', sample: URDU_SAMPLE },
  { family: 'Lateef', label: 'Lateef', sample: URDU_SAMPLE },
];

export function isKnownArabicFont(family: string): boolean {
  return ARABIC_FONTS.some((f) => f.family === family);
}

export function isKnownUrduFont(family: string): boolean {
  return URDU_FONTS.some((f) => f.family === family);
}
