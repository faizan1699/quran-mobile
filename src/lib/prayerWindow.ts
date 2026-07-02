import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Madhab,
  PrayerTimes,
} from 'adhan';

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

export type PrayerMode = 'auto' | 'manual';

export interface ManualRange {
  start: string;
  end: string;
}

export type ManualTimes = Record<PrayerKey, ManualRange>;

export const PRAYER_ORDER: PrayerKey[] = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'];

export function emptyManualTimes(): ManualTimes {
  return {
    fajr: { start: '', end: '' },
    dhuhr: { start: '', end: '' },
    asr: { start: '', end: '' },
    maghrib: { start: '', end: '' },
    isha: { start: '', end: '' },
  };
}

type CalculationMethodKey =
  | 'MuslimWorldLeague'
  | 'Egyptian'
  | 'Karachi'
  | 'UmmAlQura'
  | 'Dubai'
  | 'Qatar'
  | 'Kuwait'
  | 'MoonsightingCommittee'
  | 'Singapore'
  | 'Turkey'
  | 'Tehran'
  | 'NorthAmerica';

const METHOD_BUILDERS: Record<CalculationMethodKey, () => CalculationParameters> = {
  MuslimWorldLeague: CalculationMethod.MuslimWorldLeague,
  Egyptian: CalculationMethod.Egyptian,
  Karachi: CalculationMethod.Karachi,
  UmmAlQura: CalculationMethod.UmmAlQura,
  Dubai: CalculationMethod.Dubai,
  Qatar: CalculationMethod.Qatar,
  Kuwait: CalculationMethod.Kuwait,
  MoonsightingCommittee: CalculationMethod.MoonsightingCommittee,
  Singapore: CalculationMethod.Singapore,
  Turkey: CalculationMethod.Turkey,
  Tehran: CalculationMethod.Tehran,
  NorthAmerica: CalculationMethod.NorthAmerica,
};

export function buildPrayerParams(
  calculationMethod: string,
  fiqh: string,
): CalculationParameters {
  const build =
    METHOD_BUILDERS[calculationMethod as CalculationMethodKey] ?? METHOD_BUILDERS.Karachi;
  const params = build();
  params.madhab = fiqh === 'Hanafi' ? Madhab.Hanafi : Madhab.Shafi;
  return params;
}

export interface PrayerWindow {
  times: Record<PrayerKey | 'sunrise', Date>;
  activeKey: PrayerKey | null;
  activeEndsAt: Date | null;
  activeRemainingMs: number;
  next: { key: PrayerKey; time: Date };
  countdownMs: number;
}

export interface PrayerWindowOptions {
  mode?: PrayerMode;
  manualTimes?: ManualTimes;
}

const DAY_MS = 24 * 60 * 60 * 1000;

function computedRange(
  key: PrayerKey,
  times: PrayerTimes,
  nextTimes: PrayerTimes,
): { start: Date; end: Date } {
  switch (key) {
    case 'fajr':
      return { start: times.fajr, end: times.sunrise };
    case 'dhuhr':
      return { start: times.dhuhr, end: times.asr };
    case 'asr':
      return { start: times.asr, end: times.maghrib };
    case 'maghrib':
      return { start: times.maghrib, end: times.isha };
    case 'isha':
    default:
      return { start: times.isha, end: nextTimes.fajr };
  }
}

function parseHhmm(dayRef: Date, value: string | undefined): Date | null {
  if (!value) {
    return null;
  }
  const match = /^([01]?\d|2[0-3]):([0-5]\d)$/.exec(value.trim());
  if (!match) {
    return null;
  }
  const date = new Date(dayRef);
  date.setHours(Number(match[1]), Number(match[2]), 0, 0);
  return date;
}

function effectiveRange(
  key: PrayerKey,
  dayRef: Date,
  computed: { start: Date; end: Date },
  manual: ManualTimes | undefined,
  manualMode: boolean,
): { key: PrayerKey; start: Date; end: Date } {
  let start = computed.start;
  let end = computed.end;

  if (manualMode && manual) {
    const manualStart = parseHhmm(dayRef, manual[key]?.start);
    const manualEnd = parseHhmm(dayRef, manual[key]?.end);
    if (manualStart) {
      start = manualStart;
    }
    if (manualEnd) {
      end = manualEnd;
    }
  }

  if (end.getTime() <= start.getTime()) {
    end = new Date(end.getTime() + DAY_MS);
  }

  return { key, start, end };
}

export function computePrayerWindow(
  latitude: number,
  longitude: number,
  now: Date,
  params: CalculationParameters,
  options: PrayerWindowOptions = {},
): PrayerWindow {
  const coords = new Coordinates(latitude, longitude);
  const manualMode = options.mode === 'manual';
  const manual = options.manualTimes;

  const dayTimes = (offset: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    return new PrayerTimes(coords, date, params);
  };
  const dayRef = (offset: number) => {
    const date = new Date(now);
    date.setDate(date.getDate() + offset);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const windows: { key: PrayerKey; start: Date; end: Date }[] = [];
  for (const offset of [-1, 0, 1]) {
    const times = dayTimes(offset);
    const nextTimes = dayTimes(offset + 1);
    const ref = dayRef(offset);
    for (const key of PRAYER_ORDER) {
      windows.push(effectiveRange(key, ref, computedRange(key, times, nextTimes), manual, manualMode));
    }
  }

  const t0 = dayTimes(0);
  const t1 = dayTimes(1);
  const ref0 = dayRef(0);
  const displayTimes = { sunrise: t0.sunrise } as Record<PrayerKey | 'sunrise', Date>;
  for (const key of PRAYER_ORDER) {
    displayTimes[key] = effectiveRange(
      key,
      ref0,
      computedRange(key, t0, t1),
      manual,
      manualMode,
    ).start;
  }

  const n = now.getTime();

  let active: { key: PrayerKey; start: Date; end: Date } | null = null;
  let next: { key: PrayerKey; start: Date; end: Date } | null = null;

  for (const window of windows) {
    if (window.start.getTime() <= n && n < window.end.getTime()) {
      if (!active || window.start.getTime() > active.start.getTime()) {
        active = window;
      }
    }
    if (window.start.getTime() > n) {
      if (!next || window.start.getTime() < next.start.getTime()) {
        next = window;
      }
    }
  }

  const nextWindow = next ?? windows[0];

  return {
    times: displayTimes,
    activeKey: active ? active.key : null,
    activeEndsAt: active ? active.end : null,
    activeRemainingMs: active ? Math.max(0, active.end.getTime() - n) : 0,
    next: { key: nextWindow.key, time: nextWindow.start },
    countdownMs: Math.max(0, nextWindow.start.getTime() - n),
  };
}

export function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const hours = Math.floor(total / 3600);
  const minutes = Math.floor((total % 3600) / 60);
  const seconds = total % 60;

  const pad = (value: number) => String(value).padStart(2, '0');

  if (hours > 0) {
    return `${hours}h ${pad(minutes)}m ${pad(seconds)}s`;
  }
  if (minutes > 0) {
    return `${minutes}m ${pad(seconds)}s`;
  }
  return `${seconds}s`;
}
