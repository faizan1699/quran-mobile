export interface Dhikr {
  id: string;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningUr: string;
  defaultTarget: number;
}

export const adhkar: Dhikr[] = [
  {
    id: 'subhanallah',
    arabic: 'سُبْحَانَ اللَّهِ',
    transliteration: 'SubhanAllah',
    meaningEn: 'Glory be to Allah',
    meaningUr: 'اللہ پاک ہے',
    defaultTarget: 33,
  },
  {
    id: 'alhamdulillah',
    arabic: 'الْحَمْدُ لِلَّهِ',
    transliteration: 'Alhamdulillah',
    meaningEn: 'All praise is due to Allah',
    meaningUr: 'تمام تعریفیں اللہ کے لیے ہیں',
    defaultTarget: 33,
  },
  {
    id: 'allahuakbar',
    arabic: 'اللَّهُ أَكْبَرُ',
    transliteration: 'Allahu Akbar',
    meaningEn: 'Allah is the Greatest',
    meaningUr: 'اللہ سب سے بڑا ہے',
    defaultTarget: 34,
  },
  {
    id: 'tahlil',
    arabic: 'لَا إِلَٰهَ إِلَّا اللَّهُ',
    transliteration: 'La ilaha illa Allah',
    meaningEn: 'There is no god but Allah',
    meaningUr: 'اللہ کے سوا کوئی معبود نہیں',
    defaultTarget: 100,
  },
  {
    id: 'astaghfirullah',
    arabic: 'أَسْتَغْفِرُ اللَّهَ',
    transliteration: 'Astaghfirullah',
    meaningEn: 'I seek forgiveness from Allah',
    meaningUr: 'میں اللہ سے بخشش مانگتا ہوں',
    defaultTarget: 100,
  },
  {
    id: 'hamdala',
    arabic: 'سُبْحَانَ اللَّهِ وَبِحَمْدِهِ',
    transliteration: 'SubhanAllahi wa bihamdihi',
    meaningEn: 'Glory be to Allah and praise to Him',
    meaningUr: 'اللہ پاک ہے اور اسی کی تعریف ہے',
    defaultTarget: 100,
  },
  {
    id: 'hawqala',
    arabic: 'لَا حَوْلَ وَلَا قُوَّةَ إِلَّا بِاللَّهِ',
    transliteration: 'La hawla wala quwwata illa billah',
    meaningEn: 'There is no power nor strength except with Allah',
    meaningUr: 'اللہ کے سوا کوئی طاقت و قوت نہیں',
    defaultTarget: 100,
  },
];
