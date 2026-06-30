/**
 * "Flashes" — the auto-rotating highlight cards on the Home screen
 * (announcements, events, featured verses, reminders).
 *
 * This is mock data shaped exactly like an admin-managed feed would be, so the
 * carousel can later be driven by the backend (e.g. GET /flashes) without any
 * UI change. `accent` is used for the icon chip / progress so each flash keeps
 * a distinct identity while staying on-brand.
 */
export type FlashKind = 'announcement' | 'event' | 'verse' | 'reminder';

export interface Flash {
  id: string;
  kind: FlashKind;
  icon: string;
  /** Card background and a lighter accent used for the icon chip + dots. */
  bg: string;
  accent: string;
  title: string;
  titleUrdu: string;
  subtitle: string;
  subtitleUrdu: string;
  /** Optional Arabic line (used for featured-verse flashes). */
  arabic?: string;
  cta?: { label: string; labelUrdu: string };
}

export const FLASHES: Flash[] = [
  {
    id: 'f1',
    kind: 'announcement',
    icon: '🌙',
    bg: '#1B4332',
    accent: '#3A9E6E',
    title: 'Welcome to Dawat-e-Islam',
    titleUrdu: 'دعوت اسلام میں خوش آمدید',
    subtitle: 'Read, listen and reflect — all in one place.',
    subtitleUrdu: 'پڑھیں، سنیں اور غور کریں — سب ایک جگہ۔',
    cta: { label: 'Start reading', labelUrdu: 'پڑھنا شروع کریں' },
  },
  {
    id: 'f2',
    kind: 'verse',
    icon: '📖',
    bg: '#0D2B1E',
    accent: '#C9A84C',
    title: 'Verse of the day',
    titleUrdu: 'آج کی آیت',
    subtitle: 'Indeed, with hardship comes ease.',
    subtitleUrdu: 'بے شک تنگی کے ساتھ آسانی ہے۔',
    arabic: 'إِنَّ مَعَ ٱلْعُسْرِ يُسْرًا',
    cta: { label: 'Open Al-Quran', labelUrdu: 'قرآن کھولیں' },
  },
  {
    id: 'f3',
    kind: 'event',
    icon: '🕌',
    bg: '#215C3F',
    accent: '#E0CA8A',
    title: 'Jumu’ah reminder',
    titleUrdu: 'جمعہ کی یاد دہانی',
    subtitle: 'Send blessings upon the Prophet ﷺ abundantly today.',
    subtitleUrdu: 'آج نبی ﷺ پر کثرت سے درود بھیجیں۔',
    cta: { label: 'Read Surah Al-Kahf', labelUrdu: 'سورہ الکہف پڑھیں' },
  },
  {
    id: 'f4',
    kind: 'reminder',
    icon: '🤲',
    bg: '#2D7A54',
    accent: '#F5ECD0',
    title: 'Daily Dua',
    titleUrdu: 'روزانہ کی دعا',
    subtitle: 'My Lord, increase me in knowledge.',
    subtitleUrdu: 'اے میرے رب! میرے علم میں اضافہ فرما۔',
    arabic: 'رَّبِّ زِدْنِي عِلْمًا',
    cta: { label: 'Open Duas', labelUrdu: 'دعائیں کھولیں' },
  },
];
