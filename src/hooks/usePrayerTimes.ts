import { useEffect, useMemo, useState } from 'react';
import { useUserStore } from '@/store/useUserStore';
import {
  buildPrayerParams,
  computePrayerWindow,
  formatCountdown,
  PrayerKey,
} from '@/lib/prayerWindow';

interface FormattedPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  activeKey: PrayerKey | null;
  activeRemaining: string;
  nextKey: PrayerKey;
  nextPrayerName: string;
  nextPrayerTime: string;
  countdown: string;
}

const FALLBACK_LAT = 21.4225;
const FALLBACK_LNG = 39.8262;

const PRAYER_LABELS: Record<PrayerKey, string> = {
  fajr: 'Fajr',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

const DEFAULT_TIMES: FormattedPrayerTimes = {
  fajr: '--:--',
  sunrise: '--:--',
  dhuhr: '--:--',
  asr: '--:--',
  maghrib: '--:--',
  isha: '--:--',
  activeKey: null,
  activeRemaining: '',
  nextKey: 'fajr',
  nextPrayerName: 'Fajr',
  nextPrayerTime: '--:--',
  countdown: '',
};

export function usePrayerTimes(): FormattedPrayerTimes {
  const location = useUserStore((state) => state.location);
  const fiqhMethod = useUserStore((state) => state.fiqhMethod);
  const calculationMethod = useUserStore((state) => state.calculationMethod);
  const prayerMode = useUserStore((state) => state.prayerMode);
  const manualTimes = useUserStore((state) => state.manualTimes);

  const [now, setNow] = useState(() => new Date());
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  return useMemo<FormattedPrayerTimes>(() => {
    const lat = location?.latitude ?? FALLBACK_LAT;
    const lng = location?.longitude ?? FALLBACK_LNG;

    try {
      const params = buildPrayerParams(calculationMethod, fiqhMethod);
      const window = computePrayerWindow(lat, lng, now, params, {
        mode: prayerMode,
        manualTimes,
      });

      return {
        fajr: formatTime(window.times.fajr),
        sunrise: formatTime(window.times.sunrise),
        dhuhr: formatTime(window.times.dhuhr),
        asr: formatTime(window.times.asr),
        maghrib: formatTime(window.times.maghrib),
        isha: formatTime(window.times.isha),
        activeKey: window.activeKey,
        activeRemaining: formatCountdown(window.activeRemainingMs),
        nextKey: window.next.key,
        nextPrayerName: PRAYER_LABELS[window.next.key],
        nextPrayerTime: formatTime(window.next.time),
        countdown: formatCountdown(window.countdownMs),
      };
    } catch (error) {
      console.error('Failed to calculate prayer times:', error);
      return DEFAULT_TIMES;
    }
  }, [location, fiqhMethod, calculationMethod, prayerMode, manualTimes, now]);
}
