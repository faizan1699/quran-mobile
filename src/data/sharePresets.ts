export type SharePatternId =
  | 'none'
  | 'stars'
  | 'diamonds'
  | 'lattice'
  | 'dots'
  | 'rings'
  | 'crosshatch'
  | 'quatrefoil'
  | 'chevron'
  | 'trellis';

export interface ShareBgPreset {
  id: string;
  bg: string;
  accent: string;
  pattern?: SharePatternId;
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
  { id: 'emerald-stars', bg: '#0D2B1E', accent: '#D4B96A', pattern: 'stars' },
  { id: 'royal-lattice', bg: '#1A1033', accent: '#E0CA8A', pattern: 'lattice' },
  { id: 'midnight-diamonds', bg: '#0B1220', accent: '#C9B27A', pattern: 'diamonds' },
  { id: 'teal-stars', bg: '#0E3B3B', accent: '#E0CA8A', pattern: 'stars' },
  { id: 'maroon-dots', bg: '#3A1212', accent: '#E0CA8A', pattern: 'dots' },
  { id: 'cream-lattice', bg: '#F5ECD0', accent: '#1B4332', pattern: 'lattice' },
  { id: 'forest', bg: '#07301F', accent: '#E4CF8B' },
  { id: 'pine', bg: '#0A2A22', accent: '#CDB877' },
  { id: 'navy', bg: '#0A1733', accent: '#DCC487' },
  { id: 'sapphire', bg: '#0B1E4D', accent: '#D4B96A' },
  { id: 'slate', bg: '#1E293B', accent: '#CBD5E1' },
  { id: 'plum', bg: '#2A0E2E', accent: '#E6C28A' },
  { id: 'wine', bg: '#45101E', accent: '#E8C49A' },
  { id: 'sand', bg: '#ECE0C2', accent: '#5B3A1E' },
  { id: 'forest-rings', bg: '#07301F', accent: '#E4CF8B', pattern: 'rings' },
  { id: 'navy-stars', bg: '#0A1733', accent: '#DCC487', pattern: 'stars' },
  { id: 'sapphire-diamonds', bg: '#0B1E4D', accent: '#D4B96A', pattern: 'diamonds' },
  { id: 'slate-lattice', bg: '#1E293B', accent: '#CBD5E1', pattern: 'lattice' },
  { id: 'plum-dots', bg: '#2A0E2E', accent: '#E6C28A', pattern: 'dots' },
  { id: 'wine-crosshatch', bg: '#45101E', accent: '#E8C49A', pattern: 'crosshatch' },
  { id: 'charcoal-rings', bg: '#161616', accent: '#C9A84C', pattern: 'rings' },
  { id: 'emerald-crosshatch', bg: '#0D2B1E', accent: '#D4B96A', pattern: 'crosshatch' },
  { id: 'pine-diamonds', bg: '#0A2A22', accent: '#CDB877', pattern: 'diamonds' },
  { id: 'sand-lattice', bg: '#ECE0C2', accent: '#5B3A1E', pattern: 'lattice' },
  { id: 'emerald-quatrefoil', bg: '#0D2B1E', accent: '#D4B96A', pattern: 'quatrefoil' },
  { id: 'teal-quatrefoil', bg: '#0E3B3B', accent: '#E0CA8A', pattern: 'quatrefoil' },
  { id: 'cream-quatrefoil', bg: '#F5ECD0', accent: '#1B4332', pattern: 'quatrefoil' },
  { id: 'royal-chevron', bg: '#1A1033', accent: '#E0CA8A', pattern: 'chevron' },
  { id: 'wine-chevron', bg: '#45101E', accent: '#E8C49A', pattern: 'chevron' },
  { id: 'midnight-trellis', bg: '#0B1220', accent: '#C9B27A', pattern: 'trellis' },
  { id: 'sapphire-trellis', bg: '#0B1E4D', accent: '#D4B96A', pattern: 'trellis' },
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

export type ShareBorderStyle =
  | 'solid'
  | 'dashed'
  | 'dotted'
  | 'double'
  | 'bevel'
  | 'etch'
  | 'frame'
  | 'ornate';

export interface ShareBorderOption {
  id:
    | 'none'
    | 'thin'
    | 'thick'
    | 'dashed'
    | 'dotted'
    | 'double'
    | 'bevel'
    | 'etch'
    | 'frame'
    | 'ornate';
  width: number;
  style: ShareBorderStyle;
}

export const SHARE_BORDERS: ShareBorderOption[] = [
  { id: 'none', width: 0, style: 'solid' },
  { id: 'thin', width: 1.5, style: 'solid' },
  { id: 'thick', width: 3.5, style: 'solid' },
  { id: 'dashed', width: 2, style: 'dashed' },
  { id: 'dotted', width: 2.5, style: 'dotted' },
  { id: 'double', width: 3, style: 'double' },
  { id: 'bevel', width: 4, style: 'bevel' },
  { id: 'etch', width: 3, style: 'etch' },
  { id: 'frame', width: 2.5, style: 'frame' },
  { id: 'ornate', width: 2, style: 'ornate' },
];
