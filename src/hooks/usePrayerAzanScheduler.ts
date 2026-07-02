import { useEffect, useRef } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import { Coordinates, PrayerTimes } from 'adhan';
import { buildPrayerParams } from '@/lib/prayerWindow';
import { useUserStore } from '@/store/useUserStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useAudioStore, State } from '@/store/useAudioStore';
import { playAzan, stopAzan } from '@/services/azanPlayer';

const FALLBACK_LAT = 21.4225;
const FALLBACK_LNG = 39.8262;

const PRAYER_SEQUENCE = ['fajr', 'dhuhr', 'asr', 'maghrib', 'isha'] as const;
type PrayerName = (typeof PRAYER_SEQUENCE)[number];

const PRAYER_LABELS: Record<PrayerName, { en: string; ur: string }> = {
  fajr: { en: 'Fajr', ur: 'فجر' },
  dhuhr: { en: 'Dhuhr', ur: 'ظہر' },
  asr: { en: 'Asr', ur: 'عصر' },
  maghrib: { en: 'Maghrib', ur: 'مغرب' },
  isha: { en: 'Isha', ur: 'عشاء' },
};

interface NextAzan {
  name: PrayerName;
  time: Date;
}

export function usePrayerAzanScheduler(): void {
  const prayerAlerts = usePreferencesStore((s) => s.prayerAlerts);
  const location = useUserStore((s) => s.location);
  const fiqhMethod = useUserStore((s) => s.fiqhMethod);
  const calculationMethod = useUserStore((s) => s.calculationMethod);
  const language = useUserStore((s) => s.language);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastFiredKey = useRef<string | null>(null);

  useEffect(() => {
    if (!prayerAlerts) {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      stopAzan();
      return;
    }

    const lat = location?.latitude ?? FALLBACK_LAT;
    const lng = location?.longitude ?? FALLBACK_LNG;
    const coords = new Coordinates(lat, lng);
    const params = buildPrayerParams(calculationMethod, fiqhMethod);

    const nextAzan = (from: Date): NextAzan => {
      const today = new PrayerTimes(coords, from, params);
      for (const name of PRAYER_SEQUENCE) {
        const time = today[name] as Date;
        if (time.getTime() > from.getTime()) return { name, time };
      }
      const tomorrow = new Date(from);
      tomorrow.setDate(tomorrow.getDate() + 1);
      const next = new PrayerTimes(coords, tomorrow, params);
      return { name: 'fajr', time: next.fajr };
    };

    const fireAzan = (name: PrayerName) => {
      const key = `${new Date().toDateString()}:${name}`;
      if (lastFiredKey.current === key) return;
      lastFiredKey.current = key;

      const audio = useAudioStore.getState();
      if (audio.playbackState === State.Playing) {
        void audio.togglePlay();
      }

      void playAzan();

      const label = PRAYER_LABELS[name][language === 'ur' ? 'ur' : 'en'];
      const title = language === 'ur' ? 'اذان کا وقت' : 'Time for Azan';
      const body =
        language === 'ur' ? `${label} کی اذان کا وقت ہو گیا ہے` : `It's time for ${label} prayer`;
      Alert.alert(title, body, [
        {
          text: language === 'ur' ? 'بند کریں' : 'Stop',
          onPress: () => stopAzan(),
          style: 'cancel',
        },
      ]);
    };

    const schedule = () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      const now = new Date();
      const target = nextAzan(now);
      const delay = Math.max(0, target.time.getTime() - now.getTime());
      timerRef.current = setTimeout(() => {
        fireAzan(target.name);
        schedule();
      }, delay);
    };

    schedule();

    const onAppStateChange = (status: AppStateStatus) => {
      if (status === 'active') schedule();
    };
    const sub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
      timerRef.current = null;
      sub.remove();
    };
  }, [prayerAlerts, location, fiqhMethod, calculationMethod, language]);
}
