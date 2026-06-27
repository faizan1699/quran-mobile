export type ShareKind = 'ayah' | 'dua' | 'hadith';

export interface ShareContent {
  kind: ShareKind;
  arabic?: string | null;
  english?: string | null;
  urdu?: string | null;
  reference?: string | null;
  referenceUrdu?: string | null;
}

export type ShareMode = 'arabic' | 'both';
export type ShareLang = 'en' | 'ur';
