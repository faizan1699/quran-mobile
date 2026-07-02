import {
  CalculationMethod,
  CalculationParameters,
  Coordinates,
  Madhab,
  PrayerTimes,
} from 'adhan';

export type PrayerKey = 'fajr' | 'dhuhr' | 'asr' | 'maghrib' | 'isha';

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

export function computePrayerWindow(
  latitude: number,
  longitude: number,
  now: Date,
  params: CalculationParameters,
): PrayerWindow {
  const coords = new Coordinates(latitude, longitude);
  const t = new PrayerTimes(coords, now, params);

  const times = {
    fajr: t.fajr,
    sunrise: t.sunrise,
    dhuhr: t.dhuhr,
    asr: t.asr,
    maghrib: t.maghrib,
    isha: t.isha,
  } as Record<PrayerKey | 'sunrise', Date>;

  const n = now.getTime();

  let activeKey: PrayerKey | null;
  let activeEndsAt: Date | null;
  let nextKey: PrayerKey;
  let nextTime: Date;

  if (n < t.fajr.getTime()) {
    activeKey = 'isha';
    activeEndsAt = t.fajr;
    nextKey = 'fajr';
    nextTime = t.fajr;
  } else if (n < t.sunrise.getTime()) {
    activeKey = 'fajr';
    activeEndsAt = t.sunrise;
    nextKey = 'dhuhr';
    nextTime = t.dhuhr;
  } else if (n < t.dhuhr.getTime()) {
    activeKey = null;
    activeEndsAt = null;
    nextKey = 'dhuhr';
    nextTime = t.dhuhr;
  } else if (n < t.asr.getTime()) {
    activeKey = 'dhuhr';
    activeEndsAt = t.asr;
    nextKey = 'asr';
    nextTime = t.asr;
  } else if (n < t.maghrib.getTime()) {
    activeKey = 'asr';
    activeEndsAt = t.maghrib;
    nextKey = 'maghrib';
    nextTime = t.maghrib;
  } else if (n < t.isha.getTime()) {
    activeKey = 'maghrib';
    activeEndsAt = t.isha;
    nextKey = 'isha';
    nextTime = t.isha;
  } else {
    activeKey = 'isha';
    nextKey = 'fajr';
    const tomorrow = new Date(now);
    tomorrow.setDate(tomorrow.getDate() + 1);
    nextTime = new PrayerTimes(coords, tomorrow, params).fajr;
    activeEndsAt = nextTime;
  }

  return {
    times,
    activeKey,
    activeEndsAt,
    activeRemainingMs: activeEndsAt ? Math.max(0, activeEndsAt.getTime() - n) : 0,
    next: { key: nextKey, time: nextTime },
    countdownMs: Math.max(0, nextTime.getTime() - n),
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
