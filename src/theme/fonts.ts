/**
 * Custom font map for `useFonts` (expo-font).
 *
 * The KEYS here MUST match the family names referenced in
 * `tokens/typography.ts` (`fontFamily.english` = 'Inter',
 * `fontFamily.arabic` = 'Scheherazade New', `fontFamily.urdu` =
 * 'Noto Nastaliq Urdu') so existing styles resolve to real fonts with no
 * style changes.
 *
 * Inter and Noto Nastaliq Urdu are variable fonts (weight axis) — they respond
 * to `fontWeight` on web/iOS; Android falls back to a faux weight, which is
 * acceptable for these families. Scheherazade New is the Quran/Arabic naskh.
 */
import InterFont from '../../assets/fonts/Inter.ttf';
import ScheherazadeNewFont from '../../assets/fonts/ScheherazadeNew-Regular.ttf';
import NotoNastaliqUrduFont from '../../assets/fonts/NotoNastaliqUrdu.ttf';

export const appFonts = {
  Inter: InterFont,
  'Scheherazade New': ScheherazadeNewFont,
  'Noto Nastaliq Urdu': NotoNastaliqUrduFont,
};
