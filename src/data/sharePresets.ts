export interface ShareBgPreset {
  id: string;
  bg: string;
  accent: string;
}

export const SHARE_BG_PRESETS: ShareBgPreset[] = [
  { id: 'emerald', bg: '#0D2B1E', accent: '#D4B96A' },
  { id: 'midnight', bg: '#0B1220', accent: '#D4B96A' },
  { id: 'charcoal', bg: '#161616', accent: '#C9A84C' },
  { id: 'teal', bg: '#0E3B3B', accent: '#E0CA8A' },
  { id: 'royal', bg: '#1A1033', accent: '#E0CA8A' },
  { id: 'maroon', bg: '#3A1212', accent: '#E0CA8A' },
  { id: 'cream', bg: '#F5ECD0', accent: '#1B4332' },
  { id: 'paper', bg: '#FFFFFF', accent: '#1B4332' },
];

export interface ShareFontSize {
  id: 'sm' | 'md' | 'lg' | 'xl';
  arabic: number;
  translation: number;
  reference: number;
}

export const SHARE_FONT_SIZES: ShareFontSize[] = [
  { id: 'sm', arabic: 26, translation: 15, reference: 12 },
  { id: 'md', arabic: 32, translation: 17, reference: 13 },
  { id: 'lg', arabic: 40, translation: 19, reference: 14 },
  { id: 'xl', arabic: 48, translation: 22, reference: 15 },
];

export const SHARE_RADII: number[] = [0, 18, 30, 44];

export interface ShareBorderOption {
  id: 'none' | 'thin' | 'thick' | 'dashed' | 'dotted';
  width: number;
  style: 'solid' | 'dashed' | 'dotted';
}

export const SHARE_BORDERS: ShareBorderOption[] = [
  { id: 'none', width: 0, style: 'solid' },
  { id: 'thin', width: 1.5, style: 'solid' },
  { id: 'thick', width: 3.5, style: 'solid' },
  { id: 'dashed', width: 2, style: 'dashed' },
  { id: 'dotted', width: 2.5, style: 'dotted' },
];
