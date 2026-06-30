import { QuranAyah } from '@shared-types';

export interface AyahTiming {
  id: string;
  ayah: number;
  startSec: number;
  endSec: number;
}

const AR_SEC_PER_WORD = 1.6;
const TR_SEC_PER_WORD = 0.42;
const SEGMENT_BASE_SEC = 0.6;
const BASMALA_AR_WORDS = 4;

function wordCount(text?: string | null): number {
  if (!text) return 0;
  const trimmed = text.trim();
  if (!trimmed) return 0;
  return trimmed.split(/\s+/).length;
}

function ayahWeight(a: QuranAyah): number {
  const arabic = wordCount(a.arabic) * AR_SEC_PER_WORD;
  const translation = wordCount(a.urdu ?? a.translation) * TR_SEC_PER_WORD;
  return SEGMENT_BASE_SEC + arabic + translation;
}

export function computeSurahAyahTimings(
  ayahs: QuranAyah[],
  totalSec: number,
  includeBasmala = false
): AyahTiming[] {
  if (!ayahs.length || !(totalSec > 0)) return [];

  const weights = ayahs.map(ayahWeight);
  const basmalaWeight = includeBasmala
    ? SEGMENT_BASE_SEC + BASMALA_AR_WORDS * AR_SEC_PER_WORD
    : 0;

  const rawTotal = basmalaWeight + weights.reduce((sum, w) => sum + w, 0);
  if (!(rawTotal > 0)) return [];

  const factor = totalSec / rawTotal;
  let cursor = basmalaWeight * factor;

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
