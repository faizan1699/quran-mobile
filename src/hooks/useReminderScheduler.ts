import { useEffect } from 'react';
import { Alert, AppState, AppStateStatus } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useUserStore } from '@/store/useUserStore';

const DAILY_AYAH_HOUR = 6;
const JUMMAH_HOUR = 9;
const FRIDAY = 5;
const CHECK_INTERVAL_MS = 60 * 1000;
const STARTUP_DELAY_MS = 2500;
const DAY_MS = 24 * 60 * 60 * 1000;

const DAILY_KEY = 'reminder.dailyAyah.lastShown';
const JUMMAH_KEY = 'reminder.jummah.lastShown';

interface ReminderAyah {
  arabic: string;
  english: string;
  urdu: string;
  reference: string;
}

const DAILY_AYAHS: ReminderAyah[] = [
  {
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    english: 'It is You we worship and You we ask for help.',
    urdu: 'ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔',
    reference: 'Al-Fatiha 1:5',
  },
  {
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
    english: 'And when My servants ask you concerning Me, indeed I am near.',
    urdu: 'اور جب میرے بندے آپ سے میرے بارے میں پوچھیں، تو یقیناً میں قریب ہوں۔',
    reference: 'Al-Baqarah 2:186',
  },
  {
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    english: 'Allah does not burden a soul beyond that it can bear.',
    urdu: 'اللہ کسی جان پر اس کی طاقت سے زیادہ بوجھ نہیں ڈالتا۔',
    reference: 'Al-Baqarah 2:286',
  },
  {
    arabic: 'فَإِنَّ مَعَ الْعُسْرِ يُسْرًا',
    english: 'For indeed, with hardship comes ease.',
    urdu: 'پس بے شک ہر مشکل کے ساتھ آسانی ہے۔',
    reference: 'Ash-Sharh 94:5',
  },
  {
    arabic: 'وَاذْكُر رَّبَّكَ إِذَا نَسِيتَ',
    english: 'And remember your Lord when you forget.',
    urdu: 'اور جب تم بھول جاؤ تو اپنے رب کو یاد کرو۔',
    reference: 'Al-Kahf 18:24',
  },
];

export function useReminderScheduler(): void {
  const dailyAyahReminder = usePreferencesStore((s) => s.dailyAyahReminder);
  const jummahReminder = usePreferencesStore((s) => s.jummahReminder);

  useEffect(() => {
    if (!dailyAyahReminder && !jummahReminder) return;

    let cancelled = false;
    let busy = false;

    const showDailyAyah = (lang: 'ur' | 'en') => {
      const ayah = DAILY_AYAHS[Math.floor(Date.now() / DAY_MS) % DAILY_AYAHS.length];
      const title = lang === 'ur' ? 'آج کی آیت' : "Today's Ayah";
      const body =
        lang === 'ur'
          ? `${ayah.arabic}\n\n${ayah.urdu}\n\n﴿${ayah.reference}﴾`
          : `${ayah.arabic}\n\n${ayah.english}\n\n— ${ayah.reference}`;
      Alert.alert(title, body, [{ text: lang === 'ur' ? 'الحمدللہ' : 'Ameen' }]);
    };

    const showJummah = (lang: 'ur' | 'en') => {
      const title = lang === 'ur' ? 'جمعہ مبارک' : 'Jumu’ah Mubarak';
      const body =
        lang === 'ur'
          ? 'آج جمعہ ہے — سورہ الکہف کی تلاوت کرنا نہ بھولیں۔'
          : "It's Friday — don't forget to read Surah Al-Kahf.";
      Alert.alert(title, body, [{ text: lang === 'ur' ? 'ٹھیک ہے' : 'OK' }]);
    };

    const check = async () => {
      if (cancelled || busy) return;
      busy = true;
      try {
        const now = new Date();
        const key = now.toDateString();
        const lang = useUserStore.getState().language === 'ur' ? 'ur' : 'en';

        if (dailyAyahReminder && now.getHours() >= DAILY_AYAH_HOUR) {
          const last = await AsyncStorage.getItem(DAILY_KEY);
          if (last !== key) {
            await AsyncStorage.setItem(DAILY_KEY, key);
            if (!cancelled) showDailyAyah(lang);
            return;
          }
        }

        if (
          jummahReminder &&
          now.getDay() === FRIDAY &&
          now.getHours() >= JUMMAH_HOUR
        ) {
          const last = await AsyncStorage.getItem(JUMMAH_KEY);
          if (last !== key) {
            await AsyncStorage.setItem(JUMMAH_KEY, key);
            if (!cancelled) showJummah(lang);
          }
        }
      } finally {
        busy = false;
      }
    };

    const startup = setTimeout(check, STARTUP_DELAY_MS);
    const interval = setInterval(check, CHECK_INTERVAL_MS);
    const onAppStateChange = (status: AppStateStatus) => {
      if (status === 'active') void check();
    };
    const sub = AppState.addEventListener('change', onAppStateChange);

    return () => {
      cancelled = true;
      clearTimeout(startup);
      clearInterval(interval);
      sub.remove();
    };
  }, [dailyAyahReminder, jummahReminder]);
}
