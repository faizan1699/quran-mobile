export type GuideId = 'hajj' | 'umrah' | 'fasting' | 'janaza';

export interface GuideSection {
  heading: string;
  headingUr: string;
  body?: string;
  bodyUr?: string;
  arabic?: string;
  transliteration?: string;
  translationEn?: string;
  translationUr?: string;
}

export interface Guide {
  id: GuideId;
  title: string;
  titleUr: string;
  icon: string;
  intro: string;
  introUr: string;
  sections: GuideSection[];
}

export const guides: Record<GuideId, Guide> = {
  fasting: {
    id: 'fasting',
    title: 'Fasting (Sawm)',
    titleUr: 'روزہ',
    icon: '🌙',
    intro:
      'Fasting in Ramadan is the fourth pillar of Islam. A fasting person abstains from food, drink, and intimacy from dawn (Fajr) until sunset (Maghrib), seeking the pleasure of Allah.',
    introUr:
      'رمضان کے روزے اسلام کا چوتھا رکن ہیں۔ روزہ دار صبح صادق (فجر) سے غروبِ آفتاب (مغرب) تک کھانے، پینے اور ازدواجی تعلق سے رضائے الٰہی کے لیے رک جاتا ہے۔',
    sections: [
      {
        heading: 'Intention (Niyyah)',
        headingUr: 'نیت',
        body: 'The intention to fast is made in the heart before dawn. Many recite the following words.',
        bodyUr: 'روزے کی نیت دل میں صبح صادق سے پہلے کی جاتی ہے۔ بہت سے لوگ یہ الفاظ پڑھتے ہیں۔',
        arabic: 'وَبِصَوْمِ غَدٍ نَّوَيْتُ مِنْ شَهْرِ رَمَضَانَ',
        transliteration: 'Wa bisawmi ghadin nawaytu min shahri Ramadan',
        translationEn: 'I intend to keep the fast for tomorrow in the month of Ramadan.',
        translationUr: 'میں نے رمضان کے مہینے کے کل کے روزے کی نیت کی۔',
      },
      {
        heading: 'Suhoor (Pre-dawn meal)',
        headingUr: 'سحری',
        body: 'Eating Suhoor before Fajr is a blessed Sunnah. The Prophet ﷺ said there is blessing (barakah) in Suhoor, even if it is only a sip of water.',
        bodyUr: 'فجر سے پہلے سحری کھانا مبارک سنت ہے۔ نبی ﷺ نے فرمایا کہ سحری میں برکت ہے، چاہے ایک گھونٹ پانی ہی کیوں نہ ہو۔',
      },
      {
        heading: 'Breaking the fast (Iftar)',
        headingUr: 'افطار',
        body: 'The fast is opened at sunset, preferably with dates and water, while reciting this dua.',
        bodyUr: 'روزہ غروبِ آفتاب پر کھولا جاتا ہے، بہتر یہ ہے کہ کھجور اور پانی سے، اور یہ دعا پڑھتے ہوئے۔',
        arabic: 'اللَّهُمَّ إِنِّي لَكَ صُمْتُ وَبِكَ آمَنْتُ وَعَلَى رِزْقِكَ أَفْطَرْتُ',
        transliteration: "Allahumma inni laka sumtu wa bika aamantu wa 'ala rizqika aftartu",
        translationEn: 'O Allah, I fasted for You, I believe in You, and I break my fast with Your provision.',
        translationUr: 'اے اللہ! میں نے تیرے لیے روزہ رکھا، تجھ پر ایمان لایا، اور تیرے رزق سے افطار کیا۔',
      },
      {
        heading: 'What breaks the fast',
        headingUr: 'روزہ توڑنے والی چیزیں',
        body: 'Deliberately eating or drinking, intimacy, deliberate vomiting, and menstruation invalidate the fast and require it to be made up.',
        bodyUr: 'جان بوجھ کر کھانا پینا، ازدواجی تعلق، قصداً قے کرنا، اور حیض روزے کو باطل کر دیتے ہیں اور ان کی قضا لازم ہوتی ہے۔',
      },
      {
        heading: 'What does not break the fast',
        headingUr: 'جن سے روزہ نہیں ٹوٹتا',
        body: 'Eating or drinking forgetfully, using miswak, rinsing the mouth, and unintentional vomiting do not break the fast.',
        bodyUr: 'بھول کر کھانا پینا، مسواک کرنا، کلی کرنا، اور بے ارادہ قے آنا روزے کو نہیں توڑتے۔',
      },
      {
        heading: 'Recommended acts',
        headingUr: 'مستحب اعمال',
        body: 'Increase recitation of the Quran, perform Taraweeh, give charity, make abundant dua, and seek Laylat al-Qadr in the last ten nights.',
        bodyUr: 'قرآن کی تلاوت بڑھائیں، تراویح پڑھیں، صدقہ دیں، کثرت سے دعا کریں، اور آخری دس راتوں میں شبِ قدر تلاش کریں۔',
      },
    ],
  },

  hajj: {
    id: 'hajj',
    title: 'Hajj Guide',
    titleUr: 'حج',
    icon: '🕋',
    intro:
      'Hajj is the fifth pillar of Islam, an obligation once in a lifetime upon every Muslim who is able. It is performed in the month of Dhul-Hijjah at Makkah and its surrounding sacred sites.',
    introUr:
      'حج اسلام کا پانچواں رکن ہے، جو ہر اس مسلمان پر زندگی میں ایک بار فرض ہے جو استطاعت رکھتا ہو۔ یہ ذوالحجہ کے مہینے میں مکہ اور اس کے گرد مقاماتِ مقدسہ میں ادا کیا جاتا ہے۔',
    sections: [
      {
        heading: 'The Talbiyah',
        headingUr: 'تلبیہ',
        body: 'Upon entering Ihram, the pilgrim recites the Talbiyah frequently.',
        bodyUr: 'احرام باندھنے کے بعد حاجی کثرت سے تلبیہ پڑھتا ہے۔',
        arabic:
          'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لَا شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لَا شَرِيكَ لَكَ',
        transliteration:
          "Labbayka Allahumma labbayk, labbayka la sharika laka labbayk, inna al-hamda wan-ni'mata laka wal-mulk, la sharika lak",
        translationEn:
          'Here I am, O Allah, here I am. You have no partner. All praise, grace, and sovereignty belong to You. You have no partner.',
        translationUr:
          'حاضر ہوں اے اللہ! حاضر ہوں۔ تیرا کوئی شریک نہیں۔ بے شک تمام تعریف، نعمت اور بادشاہی تیری ہی ہے۔ تیرا کوئی شریک نہیں۔',
      },
      {
        heading: '1. Ihram',
        headingUr: '۱۔ احرام',
        body: 'At the Miqat, the pilgrim makes the intention for Hajj, wears the Ihram (two white unstitched sheets for men), and begins the Talbiyah.',
        bodyUr: 'میقات پر حاجی حج کی نیت کرتا ہے، احرام باندھتا ہے (مردوں کے لیے دو بغیر سلی سفید چادریں)، اور تلبیہ شروع کرتا ہے۔',
      },
      {
        heading: '2. Day of Tarwiyah (8th Dhul-Hijjah)',
        headingUr: '۲۔ یومِ ترویہ (۸ ذوالحجہ)',
        body: 'The pilgrims proceed to Mina and spend the day and night there, offering the five prayers.',
        bodyUr: 'حجاج منیٰ کی طرف روانہ ہوتے ہیں اور دن رات وہاں گزارتے ہوئے پانچ نمازیں ادا کرتے ہیں۔',
      },
      {
        heading: '3. Day of Arafah (9th Dhul-Hijjah)',
        headingUr: '۳۔ یومِ عرفہ (۹ ذوالحجہ)',
        body: 'Standing at Arafah is the greatest pillar of Hajj. Pilgrims gather in dua, dhikr, and repentance until sunset. Hajj is Arafah.',
        bodyUr: 'عرفات میں وقوف حج کا سب سے بڑا رکن ہے۔ حجاج غروبِ آفتاب تک دعا، ذکر اور توبہ میں مشغول رہتے ہیں۔ حج عرفہ ہے۔',
      },
      {
        heading: '4. Muzdalifah',
        headingUr: '۴۔ مزدلفہ',
        body: 'After sunset, pilgrims travel to Muzdalifah, combine Maghrib and Isha, spend the night, and gather pebbles for the stoning.',
        bodyUr: 'غروبِ آفتاب کے بعد حجاج مزدلفہ جاتے ہیں، مغرب و عشاء ملا کر پڑھتے ہیں، رات گزارتے ہیں، اور رمی کے لیے کنکریاں چنتے ہیں۔',
      },
      {
        heading: '5. Day of Sacrifice (10th Dhul-Hijjah)',
        headingUr: '۵۔ یومِ نحر (۱۰ ذوالحجہ)',
        body: 'Pilgrims stone Jamrat al-Aqabah, offer the sacrifice (Qurbani), shave or trim the hair (Halq/Taqsir), then perform Tawaf al-Ifadah and Sa’i.',
        bodyUr: 'حجاج جمرۂ عقبہ کو کنکریاں مارتے ہیں، قربانی کرتے ہیں، سر منڈواتے یا بال کتراتے ہیں، پھر طوافِ افاضہ اور سعی کرتے ہیں۔',
      },
      {
        heading: '6. Days of Tashreeq (11th–13th)',
        headingUr: '۶۔ ایامِ تشریق (۱۱ تا ۱۳)',
        body: 'Pilgrims stay in Mina and stone the three Jamarat each day after Zawal.',
        bodyUr: 'حجاج منیٰ میں ٹھہرتے ہیں اور ہر دن زوال کے بعد تینوں جمرات کو کنکریاں مارتے ہیں۔',
      },
      {
        heading: '7. Farewell Tawaf',
        headingUr: '۷۔ طوافِ وداع',
        body: 'Before leaving Makkah, the pilgrim performs Tawaf al-Wada, the final circumambulation of the Ka’bah.',
        bodyUr: 'مکہ چھوڑنے سے پہلے حاجی طوافِ وداع کرتا ہے، جو کعبہ کا آخری طواف ہے۔',
      },
    ],
  },

  umrah: {
    id: 'umrah',
    title: 'Umrah Guide',
    titleUr: 'عمرہ',
    icon: '🕌',
    intro:
      'Umrah is the lesser pilgrimage and may be performed at any time of the year. It consists of Ihram, Tawaf, Sa’i, and shaving or trimming the hair.',
    introUr:
      'عمرہ چھوٹی زیارت ہے جو سال میں کسی بھی وقت کی جا سکتی ہے۔ یہ احرام، طواف، سعی، اور بال منڈوانے یا کترانے پر مشتمل ہے۔',
    sections: [
      {
        heading: '1. Ihram',
        headingUr: '۱۔ احرام',
        body: 'At the Miqat, make the intention for Umrah, wear the Ihram, and recite the Talbiyah.',
        bodyUr: 'میقات پر عمرہ کی نیت کریں، احرام باندھیں، اور تلبیہ پڑھیں۔',
        arabic: 'لَبَّيْكَ اللَّهُمَّ بِعُمْرَةٍ',
        transliteration: "Labbayka Allahumma bi 'Umrah",
        translationEn: 'Here I am, O Allah, for Umrah.',
        translationUr: 'حاضر ہوں اے اللہ! عمرہ کے لیے۔',
      },
      {
        heading: '2. Tawaf',
        headingUr: '۲۔ طواف',
        body: 'Circle the Ka’bah seven times, beginning and ending at the Black Stone (Hajar al-Aswad), keeping it to your left.',
        bodyUr: 'کعبہ کے گرد سات چکر لگائیں، حجرِ اسود سے شروع اور وہیں ختم کریں، اسے اپنی بائیں طرف رکھتے ہوئے۔',
      },
      {
        heading: '3. Two Rak’ahs',
        headingUr: '۳۔ دو رکعت',
        body: 'After Tawaf, pray two rak’ahs behind Maqam Ibrahim if possible, then drink Zamzam water.',
        bodyUr: 'طواف کے بعد اگر ممکن ہو تو مقامِ ابراہیم کے پیچھے دو رکعت پڑھیں، پھر آبِ زمزم پئیں۔',
      },
      {
        heading: "4. Sa'i",
        headingUr: '۴۔ سعی',
        body: 'Walk between the hills of Safa and Marwah seven times, beginning at Safa, in remembrance of Hajar (عليها السلام).',
        bodyUr: 'صفا و مروہ کی پہاڑیوں کے درمیان سات بار چلیں، صفا سے شروع کرتے ہوئے، حضرت ہاجرہ کی یاد میں۔',
      },
      {
        heading: '5. Halq or Taqsir',
        headingUr: '۵۔ حلق یا تقصیر',
        body: 'Men shave (Halq) or trim (Taqsir) the hair; women trim a fingertip length. This completes the Umrah and exits the state of Ihram.',
        bodyUr: 'مرد سر منڈوائیں (حلق) یا بال کتروائیں (تقصیر)؛ عورتیں ایک پور کے برابر بال کاٹیں۔ اس سے عمرہ مکمل ہوتا ہے اور احرام کھل جاتا ہے۔',
      },
    ],
  },

  janaza: {
    id: 'janaza',
    title: 'Funeral Prayer (Janazah)',
    titleUr: 'نمازِ جنازہ',
    icon: '🕊',
    intro:
      'The funeral prayer is a communal obligation (Fard Kifayah). It is performed standing, with four Takbeers, and contains no Ruku or Sujood. It is a supplication for the deceased.',
    introUr:
      'نمازِ جنازہ فرضِ کفایہ ہے۔ یہ کھڑے ہو کر چار تکبیروں کے ساتھ ادا کی جاتی ہے، اس میں رکوع و سجود نہیں ہوتے۔ یہ میت کے لیے دعا ہے۔',
    sections: [
      {
        heading: 'First Takbeer — Thana',
        headingUr: 'پہلی تکبیر — ثنا',
        body: 'After the intention and first Takbeer, raise the hands then fold them and recite Thana.',
        bodyUr: 'نیت اور پہلی تکبیر کے بعد ہاتھ اٹھا کر باندھ لیں اور ثنا پڑھیں۔',
        arabic:
          'سُبْحَانَكَ اللَّهُمَّ وَبِحَمْدِكَ وَتَبَارَكَ اسْمُكَ وَتَعَالَى جَدُّكَ وَجَلَّ ثَنَاؤُكَ وَلَا إِلَهَ غَيْرُكَ',
        transliteration:
          "Subhanaka Allahumma wa bihamdika wa tabarakasmuka wa ta'ala jadduka wa jalla thana'uka wa la ilaha ghayruk",
        translationEn:
          'Glory be to You, O Allah, and praise; blessed is Your name, exalted is Your majesty, and there is no god but You.',
        translationUr:
          'اے اللہ! تو پاک ہے اور تیری ہی تعریف ہے، تیرا نام بابرکت ہے، تیری شان بلند ہے، اور تیرے سوا کوئی معبود نہیں۔',
      },
      {
        heading: 'Second Takbeer — Durood',
        headingUr: 'دوسری تکبیر — درود',
        body: 'After the second Takbeer, recite the Durood Ibrahim as in the sitting of the prayer.',
        bodyUr: 'دوسری تکبیر کے بعد درودِ ابراہیمی پڑھیں جیسا نماز کے قعدہ میں پڑھا جاتا ہے۔',
        arabic:
          'اللَّهُمَّ صَلِّ عَلَى مُحَمَّدٍ وَعَلَى آلِ مُحَمَّدٍ كَمَا صَلَّيْتَ عَلَى إِبْرَاهِيمَ وَعَلَى آلِ إِبْرَاهِيمَ إِنَّكَ حَمِيدٌ مَجِيدٌ',
        transliteration:
          "Allahumma salli 'ala Muhammadin wa 'ala aali Muhammad, kama sallayta 'ala Ibrahima wa 'ala aali Ibrahim, innaka Hamidun Majid",
        translationEn:
          'O Allah, send blessings upon Muhammad and the family of Muhammad as You sent blessings upon Ibrahim and the family of Ibrahim. Indeed, You are Praiseworthy and Glorious.',
        translationUr:
          'اے اللہ! محمد ﷺ اور آلِ محمد پر رحمت بھیج جیسے تو نے ابراہیم اور آلِ ابراہیم پر رحمت بھیجی۔ بے شک تو تعریف والا، بزرگی والا ہے۔',
      },
      {
        heading: 'Third Takbeer — Dua for the deceased',
        headingUr: 'تیسری تکبیر — میت کے لیے دعا',
        body: 'After the third Takbeer, supplicate for the deceased and all the believers.',
        bodyUr: 'تیسری تکبیر کے بعد میت اور تمام مومنین کے لیے دعا کریں۔',
        arabic:
          'اللَّهُمَّ اغْفِرْ لِحَيِّنَا وَمَيِّتِنَا وَشَاهِدِنَا وَغَائِبِنَا وَصَغِيرِنَا وَكَبِيرِنَا وَذَكَرِنَا وَأُنْثَانَا',
        transliteration:
          "Allahumma-ghfir li hayyina wa mayyitina wa shahidina wa gha'ibina wa saghirina wa kabirina wa dhakarina wa unthana",
        translationEn:
          'O Allah, forgive our living and our dead, those present and those absent, our young and our old, our males and our females.',
        translationUr:
          'اے اللہ! ہمارے زندوں اور مُردوں کو، حاضر و غائب کو، چھوٹے اور بڑے کو، اور ہمارے مرد و عورت سب کو بخش دے۔',
      },
      {
        heading: 'Fourth Takbeer — Salam',
        headingUr: 'چوتھی تکبیر — سلام',
        body: 'After the fourth Takbeer, pause briefly, then turn the head right and left giving Salam to end the prayer.',
        bodyUr: 'چوتھی تکبیر کے بعد ذرا ٹھہریں، پھر دائیں اور بائیں سلام پھیر کر نماز مکمل کریں۔',
        arabic: 'السَّلَامُ عَلَيْكُمْ وَرَحْمَةُ اللَّهِ',
        transliteration: "As-salamu 'alaykum wa rahmatullah",
        translationEn: 'Peace be upon you and the mercy of Allah.',
        translationUr: 'تم پر سلامتی ہو اور اللہ کی رحمت ہو۔',
      },
    ],
  },
};
