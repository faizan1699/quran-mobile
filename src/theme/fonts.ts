/**
 * Custom font map for `useFonts` (expo-font).
 *
 * The KEYS here are the family names referenced via `fontFamily`. The base
 * faces match `tokens/typography.ts` (`fontFamily.english` = 'Inter',
 * `fontFamily.arabic` = 'Scheherazade New', `fontFamily.urdu` =
 * 'Noto Nastaliq Urdu') so existing styles resolve with no changes.
 *
 * The extra Arabic (Amiri, Noto Naskh Arabic, Lateef) and Urdu (Gulzar,
 * Lateef) faces are user-selectable from the Appearance screen and applied
 * live via the font-family remap in `fontScalePatch.ts`.
 */
import InterFont from '../../assets/fonts/Inter.ttf';
import ScheherazadeNewFont from '../../assets/fonts/ScheherazadeNew-Regular.ttf';
import NotoNastaliqUrduFont from '../../assets/fonts/NotoNastaliqUrdu.ttf';
import AmiriFont from '../../assets/fonts/Amiri-Regular.ttf';
import NotoNaskhArabicFont from '../../assets/fonts/NotoNaskhArabic-Regular.ttf';
import LateefFont from '../../assets/fonts/Lateef-Regular.ttf';
import GulzarFont from '../../assets/fonts/Gulzar-Regular.ttf';

export const appFonts = {
  Inter: InterFont,
  'Scheherazade New': ScheherazadeNewFont,
  'Noto Nastaliq Urdu': NotoNastaliqUrduFont,
  Amiri: AmiriFont,
  'Noto Naskh Arabic': NotoNaskhArabicFont,
  Lateef: LateefFont,
  Gulzar: GulzarFont,
  // Preview-only aliases for the two base faces. Identical fonts under names
  // that are never remap keys, so the default-font cards in the picker always
  // render their true face even while the base family is remapped elsewhere.
  ScheherazadePreview: ScheherazadeNewFont,
  NastaliqPreview: NotoNastaliqUrduFont,
};
