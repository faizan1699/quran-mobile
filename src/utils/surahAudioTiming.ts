import { QuranAyah } from '@shared-types';

export interface AyahTiming {
  id: string;
  ayah: number;
  startSec: number;
  endSec: number;
}

const AR_SEC_PER_LETTER = 0.25;
const TR_SEC_PER_WORD = 0.35;
const SEGMENT_BASE_SEC = 8;
const BASMALA_LEAD_SEC = 12;

const ARABIC_LETTERS = /[ء-يٱ-ۓۺ-ۿ]/g;

function arabicLetterCount(text?: string | null): number {
  if (!text) return 0;
  const matched = text.match(ARABIC_LETTERS);
  return matched ? matched.length : 0;
}

function wordCount(text?: string | null): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function ayahWeight(a: QuranAyah): number {
  const recitation = arabicLetterCount(a.arabic) * AR_SEC_PER_LETTER;
  const translation = wordCount(a.urdu ?? a.translation) * TR_SEC_PER_WORD;
  return SEGMENT_BASE_SEC + recitation + translation;
}

export function computeSurahAyahTimings(
  ayahs: QuranAyah[],
  totalSec: number,
  includeBasmala = false
): AyahTiming[] {
  if (!ayahs.length || !(totalSec > 0)) return [];

  const leadSec = includeBasmala ? Math.min(BASMALA_LEAD_SEC, totalSec * 0.5) : 0;
  const usableSec = totalSec - leadSec;
  if (!(usableSec > 0)) return [];

  const weights = ayahs.map(ayahWeight);
  const rawTotal = weights.reduce((sum, w) => sum + w, 0);
  if (!(rawTotal > 0)) return [];

  const factor = usableSec / rawTotal;
  let cursor = leadSec;

  return ayahs.map((a, i) => {
    const startSec = cursor;
    cursor += weights[i] * factor;
    return { id: a.id, ayah: a.ayah, startSec, endSec: cursor };
  });
}

export function activeTimingIndex(timings: AyahTiming[], positionSec: number): number {
  if (!timings.length) return -1;
  if (positionSec <= timings[0].startSec) return 0;
  for (let i = 0; i < timings.length; i++) {
    if (positionSec < timings[i].endSec) return i;
  }
  return timings.length - 1;
}
