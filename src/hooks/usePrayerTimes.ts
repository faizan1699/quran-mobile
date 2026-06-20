import { useMemo } from 'react';
import {
  Coordinates,
  CalculationMethod,
  CalculationParameters,
  Madhab,
  PrayerTimes,
} from 'adhan';
import { useUserStore, FiqhMethod } from '@/store/useUserStore';

interface FormattedPrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
  nextPrayerName: string;
  nextPrayerTime: string;
}

// Mecca fallback when the user has no location yet.
const FALLBACK_LAT = 21.4225;
const FALLBACK_LNG = 39.8262;

// Format Date object into human-readable HH:MM AM/PM format
function formatTime(date: Date): string {
  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });
}

// Map a user-facing fiqh to Adhan calculation parameters.
// The madhab only changes the Asr time (Hanafi uses a longer shadow length);
// Maliki/Hanbali follow the standard (Shafi) Asr height.
function getAdhanParams(method: FiqhMethod): CalculationParameters {
  switch (method) {
    case 'Hanafi': {
      const params = CalculationMethod.MuslimWorldLeague();
      params.madhab = Madhab.Hanafi;
      return params;
    }
    case 'Shafi': {
      const params = CalculationMethod.Egyptian();
      params.madhab = Madhab.Shafi;
      return params;
    }
    case 'Maliki': {
      const params = CalculationMethod.MoonsightingCommittee();
      params.madhab = Madhab.Shafi;
      return params;
    }
    case 'Hanbali': {
      const params = CalculationMethod.NorthAmerica();
      params.madhab = Madhab.Shafi;
      return params;
    }
    default: {
      const params = CalculationMethod.MuslimWorldLeague();
      params.madhab = Madhab.Hanafi;
      return params;
    }
  }
}

// Adhan prayer codes -> the capitalised keys the UI uses for highlighting.
const PRAYER_LABELS: Record<string, string> = {
  fajr: 'Fajr',
  sunrise: 'Sunrise',
  dhuhr: 'Dhuhr',
  asr: 'Asr',
  maghrib: 'Maghrib',
  isha: 'Isha',
};

const DEFAULT_TIMES: FormattedPrayerTimes = {
  fajr: '--:--',
  sunrise: '--:--',
  dhuhr: '--:--',
  asr: '--:--',
  maghrib: '--:--',
  isha: '--:--',
  nextPrayerName: 'Fajr',
  nextPrayerTime: '--:--',
};

/**
 * Calculates today's prayer times from the user's stored location and fiqh.
 * Uses the pure-JS `adhan` library so the same code runs on iOS, Android and
 * the web (Expo web) without a native module.
 */
export function usePrayerTimes(): FormattedPrayerTimes {
  const location = useUserStore((state) => state.location);
  const fiqhMethod = useUserStore((state) => state.fiqhMethod);

  return useMemo<FormattedPrayerTimes>(() => {
    const lat = location?.latitude ?? FALLBACK_LAT;
    const lng = location?.longitude ?? FALLBACK_LNG;

    try {
      const coordinates = new Coordinates(lat, lng);
      const params = getAdhanParams(fiqhMethod);
      const now = new Date();
      const prayerTimes = new PrayerTimes(coordinates, now, params);

      const formatted = {
        fajr: formatTime(prayerTimes.fajr),
        sunrise: formatTime(prayerTimes.sunrise),
        dhuhr: formatTime(prayerTimes.dhuhr),
        asr: formatTime(prayerTimes.asr),
        maghrib: formatTime(prayerTimes.maghrib),
        isha: formatTime(prayerTimes.isha),
      };

      const nextCode = prayerTimes.nextPrayer(now);

      let nextPrayerName: string;
      let nextPrayerTime: string;

      if (nextCode === 'none') {
        // Isha has passed: next prayer is tomorrow's Fajr.
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        const tomorrowTimes = new PrayerTimes(coordinates, tomorrow, params);
        nextPrayerName = 'Fajr';
        nextPrayerTime = formatTime(tomorrowTimes.fajr);
      } else {
        const time = prayerTimes.timeForPrayer(nextCode) ?? prayerTimes.fajr;
        nextPrayerName = PRAYER_LABELS[nextCode] ?? 'Fajr';
        nextPrayerTime = formatTime(time);
      }

      return { ...formatted, nextPrayerName, nextPrayerTime };
    } catch (error) {
      console.error('Failed to calculate prayer times:', error);
      return DEFAULT_TIMES;
    }
  }, [location, fiqhMethod]);
}
