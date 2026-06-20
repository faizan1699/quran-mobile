/**
 * Gregorian → Hijri (Islamic) date conversion.
 *
 * Uses the standard tabular Kuwaiti algorithm (the same one Microsoft and many
 * Islamic apps use). It needs no native Intl calendar support, so it works on
 * Hermes / Android / web alike. Results can differ by ±1 day from official
 * moon-sighting calendars — acceptable for a display-only Hijri date.
 */

const HIJRI_MONTHS_EN = [
  'Muharram',
  'Safar',
  "Rabi' al-Awwal",
  "Rabi' al-Thani",
  'Jumada al-Awwal',
  'Jumada al-Thani',
  'Rajab',
  "Sha'ban",
  'Ramadan',
  'Shawwal',
  "Dhu al-Qi'dah",
  'Dhu al-Hijjah',
];

const HIJRI_MONTHS_UR = [
  'محرم',
  'صفر',
  'ربیع الاول',
  'ربیع الثانی',
  'جمادی الاول',
  'جمادی الثانی',
  'رجب',
  'شعبان',
  'رمضان',
  'شوال',
  'ذوالقعدہ',
  'ذوالحجہ',
];

export interface HijriDate {
  day: number;
  /** 1-based month index. */
  month: number;
  year: number;
  monthName: string;
  monthNameUrdu: string;
}

const intPart = (n: number): number => (n < 0 ? Math.ceil(n) : Math.floor(n));

export function gregorianToHijri(date: Date): HijriDate {
  const gy = date.getFullYear();
  const gm = date.getMonth() + 1;
  const gd = date.getDate();

  let jd: number;
  if (gy > 1582 || (gy === 1582 && gm > 10) || (gy === 1582 && gm === 10 && gd > 14)) {
    jd =
      intPart((1461 * (gy + 4800 + intPart((gm - 14) / 12))) / 4) +
      intPart((367 * (gm - 2 - 12 * intPart((gm - 14) / 12))) / 12) -
      intPart((3 * intPart((gy + 4900 + intPart((gm - 14) / 12)) / 100)) / 4) +
      gd -
      32075;
  } else {
    jd =
      367 * gy -
      intPart((7 * (gy + 5001 + intPart((gm - 9) / 7))) / 4) +
      intPart((275 * gm) / 9) +
      gd +
      1729777;
  }

  let l = jd - 1948440 + 10632;
  const n = intPart((l - 1) / 10631);
  l = l - 10631 * n + 354;
  const j =
    intPart((10985 - l) / 5316) * intPart((50 * l) / 17719) +
    intPart(l / 5670) * intPart((43 * l) / 15238);
  l =
    l -
    intPart((30 - j) / 15) * intPart((17719 * j) / 50) -
    intPart(j / 16) * intPart((15238 * j) / 43) +
    29;
  const month = intPart((24 * l) / 709);
  const day = l - intPart((709 * month) / 24);
  const year = 30 * n + j - 30;

  return {
    day,
    month,
    year,
    monthName: HIJRI_MONTHS_EN[month - 1] ?? '',
    monthNameUrdu: HIJRI_MONTHS_UR[month - 1] ?? '',
  };
}

/** "4 Muharram 1448" / "۴ محرم ۱۴۴۸" (caller picks language). */
export function formatHijri(date: Date, language: 'en' | 'ur'): string {
  const h = gregorianToHijri(date);
  const name = language === 'ur' ? h.monthNameUrdu : h.monthName;
  return language === 'ur'
    ? `${h.day} ${name} ${h.year} ھ`
    : `${h.day} ${name} ${h.year} AH`;
}
