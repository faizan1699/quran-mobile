import { Platform } from 'react-native';
import { typography } from '@/tokens';
import { setGlobalFontFamilyMap } from './fontScalePatch';

export interface ScriptFontOption {
  family: string;
  label: string;
  sample: string;
  /** Non-remapped alias used to render this option's preview (see fonts.ts). */
  previewFamily?: string;
}

export const DEFAULT_ARABIC_FONT = typography.fontFamily.arabic;
export const DEFAULT_URDU_FONT = typography.fontFamily.urdu;
export const DEFAULT_ENGLISH_FONT = typography.fontFamily.english;

export const SYSTEM_FONT_FAMILY =
  Platform.select({ ios: 'System', android: 'sans-serif', default: 'system-ui' }) ??
  'System';

const ARABIC_SAMPLE = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';
const URDU_SAMPLE = 'اللہ کے نام سے جو نہایت مہربان ہے';
const ENGLISH_SAMPLE = 'The Quran — Read & Reflect';

export const ARABIC_FONTS: ScriptFontOption[] = [
  {
    family: 'Scheherazade New',
    label: 'Scheherazade',
    sample: ARABIC_SAMPLE,
    previewFamily: 'ScheherazadePreview',
  },
  { family: 'Amiri', label: 'Amiri', sample: ARABIC_SAMPLE },
  { family: 'Noto Naskh Arabic', label: 'Noto Naskh', sample: ARABIC_SAMPLE },
  { family: 'Markazi Text', label: 'Markazi', sample: ARABIC_SAMPLE },
  { family: 'Reem Kufi', label: 'Reem Kufi', sample: ARABIC_SAMPLE },
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
  { family: 'Noto Naskh Arabic', label: 'Noto Naskh', sample: URDU_SAMPLE },
  { family: 'Lateef', label: 'Lateef', sample: URDU_SAMPLE },
];

export const ENGLISH_FONTS: ScriptFontOption[] = [
  {
    family: DEFAULT_ENGLISH_FONT,
    label: 'Inter',
    sample: ENGLISH_SAMPLE,
    previewFamily: 'InterPreview',
  },
  {
    family: 'System',
    label: 'System',
    sample: ENGLISH_SAMPLE,
    previewFamily: SYSTEM_FONT_FAMILY,
  },
  { family: 'Poppins', label: 'Poppins', sample: ENGLISH_SAMPLE },
];

export function isKnownArabicFont(family: string): boolean {
  return ARABIC_FONTS.some((f) => f.family === family);
}

export function isKnownUrduFont(family: string): boolean {
  return URDU_FONTS.some((f) => f.family === family);
}

export function isKnownEnglishFont(family: string): boolean {
  return ENGLISH_FONTS.some((f) => f.family === family);
}

function resolveEnglishTarget(family: string): string {
  return family === 'System' ? SYSTEM_FONT_FAMILY : family;
}

export function applySelectedFonts(
  arabicFont: string,
  urduFont: string,
  englishFont: string
): void {
  setGlobalFontFamilyMap({
    [DEFAULT_ARABIC_FONT]: isKnownArabicFont(arabicFont)
      ? arabicFont
      : DEFAULT_ARABIC_FONT,
    [DEFAULT_URDU_FONT]: isKnownUrduFont(urduFont) ? urduFont : DEFAULT_URDU_FONT,
    [DEFAULT_ENGLISH_FONT]: isKnownEnglishFont(englishFont)
      ? resolveEnglishTarget(englishFont)
      : DEFAULT_ENGLISH_FONT,
  });
}
