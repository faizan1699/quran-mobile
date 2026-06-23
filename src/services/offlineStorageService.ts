import { BookCategory } from '@shared-types';

export interface OfflineBook {
  id: string;
  title: string;
  titleUrdu: string | null;
  author: string;
  category: BookCategory;
  coverImage: string | null;
}

export interface OfflineChapter {
  id: string;
  bookId: string;
  chapterName: string;
  chapterNameUrdu: string | null;
  sequenceOrder: number;
}

export interface OfflineContent {
  id: string;
  chapterId: string;
  verseText: string; // Arabic text
  translationText: string | null;
  urduText: string | null;
  audioUrl: string | null;
  sequenceNumber: number;
  hadithNumber?: number | null;
  narrator?: string | null;
}

export interface OfflineDuaa {
  id: string;
  title: string;
  titleUrdu: string | null;
  arabicText: string;
  translation: string;
  urduText: string | null;
  category: string;
  isFavorite: boolean;
  audioUrl?: string | null;
}

const MOCK_BOOKS: OfflineBook[] = [
  {
    id: 'b1',
    title: 'Sahih al-Bukhari',
    titleUrdu: 'صحیح البخاری',
    author: 'Imam al-Bukhari',
    category: BookCategory.HADITH,
    coverImage: 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'b2',
    title: 'Tafsir ibn Kathir',
    titleUrdu: 'تفسیر ابن کثیر',
    author: 'Ibn Kathir',
    category: BookCategory.TAFSIR,
    coverImage: 'https://images.unsplash.com/photo-1589829085413-56de8ae18c73?auto=format&fit=crop&q=80&w=300',
  },
  {
    id: 'b3',
    title: 'Riyad as-Salihin',
    titleUrdu: 'ریاض الصالحین',
    author: 'Imam an-Nawawi',
    category: BookCategory.HADITH,
    coverImage: 'https://images.unsplash.com/photo-1608659597669-b45511779f93?auto=format&fit=crop&q=80&w=300',
  }
];

const MOCK_CHAPTERS: OfflineChapter[] = [
  // Sahih Bukhari
  {
    id: 'ch1',
    bookId: 'b1',
    chapterName: 'Book of Revelation',
    chapterNameUrdu: 'وحی کا بیان',
    sequenceOrder: 1,
  },
  {
    id: 'ch2',
    bookId: 'b1',
    chapterName: 'Book of Belief',
    chapterNameUrdu: 'ایمان کا بیان',
    sequenceOrder: 2,
  },
  // Tafsir Ibn Kathir
  {
    id: 'ch3',
    bookId: 'b2',
    chapterName: 'Virtues of Quran',
    chapterNameUrdu: 'قرآن کے فضائل',
    sequenceOrder: 1,
  }
];

const MOCK_CONTENTS: OfflineContent[] = [
  {
    id: 'c1',
    chapterId: 'ch1',
    verseText: 'إِنَّمَا الأَعْمَالُ بِالنِّيَّاتِ، وَإِنَّمَا لِكُلِّ امْرِئٍ مَا نَوَى.',
    translationText: 'The reward of deeds depends upon the intentions and every person will get the reward according to what he has intended.',
    urduText: 'اعمال کا دارومدار نیتوں پر ہے اور ہر شخص کو وہی ملے گا جس کی اس نے نیت کی۔',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
    sequenceNumber: 1,
    hadithNumber: 1,
    narrator: 'Narrated by Umar bin Al-Khattab',
  },
  {
    id: 'c2',
    chapterId: 'ch1',
    verseText: 'أَنَّ عَائِشَةَ أُمَّ الْمُؤْمِنِينَ رَضِيَ اللَّهُ عَنْهَا أَنَّ الْحَارِثَ بْنَ هِشَامٍ رَضِيَ اللَّهُ عَنْهُ سَأَلَ رَسُولَ اللَّهِ صَلَّى اللَّهُ عَلَيْهِ وَسَلَّمَ فَقَالَ: يَا رَسُولَ اللَّهِ كَيْفَ يَأْتِيكَ الْوَحْيُ؟',
    translationText: 'Al-Harith bin Hisham asked Allah\'s Messenger: "O Allah\'s Messenger! How is the Divine Inspiration revealed to you?"',
    urduText: 'حارث بن ہشام نے رسول اللہ صلی اللہ علیہ وسلم سے سوال کیا کہ یا رسول اللہ! آپ پر وحی کس طرح نازل ہوتی ہے؟',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
    sequenceNumber: 2,
    hadithNumber: 2,
    narrator: 'Narrated by Aisha',
  },
  {
    id: 'c3',
    chapterId: 'ch2',
    verseText: 'بُنِيَ الإِسْلاَمُ عَلَى خَمْسٍ: شَهَادَةِ أَنْ لاَ إِلَهَ إِلاَّ اللَّهُ وَأَنَّ مُحَمَّدًا رَسُولُ اللَّهِ، وَإِقَامِ الصَّلاَةِ، وَإِيتَاءِ الزَّكَاةِ، وَالْحَجِّ، وَصَوْمِ رَمَضَانَ.',
    translationText: 'Islam is based on five principles: To testify that none has the right to be worshipped but Allah and Muhammad is Allah\'s Messenger, to offer prayers, to pay Zakat, to perform Hajj, and to fast during Ramadan.',
    urduText: 'اسلام کی بنیاد پانچ چیزوں پر ہے: اس بات کی گواہی دینا کہ اللہ کے سوا کوئی معبود نہیں اور محمد اللہ کے رسول ہیں، نماز قائم کرنا، زکوٰۃ دینا، حج کرنا اور رمضان کے روزے رکھنا۔',
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
    sequenceNumber: 1,
    hadithNumber: 8,
    narrator: 'Narrated by Ibn Umar',
  }
];

const MOCK_DUAAS: OfflineDuaa[] = [
  {
    id: 'd1',
    title: 'Dua for Guidance',
    titleUrdu: 'ہدایت کی دعا',
    arabicText: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْهُدَى وَالتُّقَى وَالْعَفَافَ وَالْغِنَى',
    translation: 'O Allah, I ask You for guidance, piety, chastity, and self-sufficiency.',
    urduText: 'اے اللہ! میں تجھ سے ہدایت، تقویٰ، پاکدامنی اور غنا (بے نیازی) کا سوال کرتا ہوں۔',
    category: 'Daily',
    isFavorite: true,
    audioUrl: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'd2',
    title: 'Dua before Sleeping',
    titleUrdu: 'سونے سے پہلے کی دعا',
    arabicText: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا',
    translation: 'In Your name, O Allah, I die and I live.',
    urduText: 'اے اللہ! تیرے ہی نام کے ساتھ میں مرتا ہوں اور جیتا ہوں۔',
    category: 'Night',
    isFavorite: false,
  },
  {
    id: 'd3',
    title: 'Dua for Knowledge',
    titleUrdu: 'علم میں اضافے کی دعا',
    arabicText: 'رَّبِّ زِدْنِي عِلْمًا',
    translation: 'My Lord, increase me in knowledge.',
    urduText: 'اے میرے رب! میرے علم میں اضافہ فرما۔',
    category: 'Education',
    isFavorite: true,
  }
];

// ============================================================================
// SERVICE IMPLEMENTATION
// ============================================================================

class OfflineStorageService {
  private useMocks: boolean = true; // Set to true by default for emulator safety

  setUseMocks(use: boolean) {
    this.useMocks = use;
  }

  async getBooks(): Promise<OfflineBook[]> {
    if (this.useMocks) {
      return MOCK_BOOKS;
    }
    // WatermelonDB code will extend here
    return MOCK_BOOKS;
  }

  async getBookById(id: string): Promise<OfflineBook | null> {
    if (this.useMocks) {
      return MOCK_BOOKS.find((b) => b.id === id) || null;
    }
    return MOCK_BOOKS.find((b) => b.id === id) || null;
  }

  async getChapters(bookId: string): Promise<OfflineChapter[]> {
    if (this.useMocks) {
      return MOCK_CHAPTERS.filter((ch) => ch.bookId === bookId);
    }
    return MOCK_CHAPTERS.filter((ch) => ch.bookId === bookId);
  }

  async getChapterContents(chapterId: string): Promise<OfflineContent[]> {
    if (this.useMocks) {
      return MOCK_CONTENTS.filter((c) => c.chapterId === chapterId);
    }
    return MOCK_CONTENTS.filter((c) => c.chapterId === chapterId);
  }

  async getDuaas(): Promise<OfflineDuaa[]> {
    if (this.useMocks) {
      return MOCK_DUAAS;
    }
    return MOCK_DUAAS;
  }

  async toggleDuaaFavorite(id: string): Promise<OfflineDuaa | null> {
    const duaa = MOCK_DUAAS.find((d) => d.id === id);
    if (duaa) {
      duaa.isFavorite = !duaa.isFavorite;
      return { ...duaa };
    }
    return null;
  }

  async searchOffline(query: string): Promise<{
    books: OfflineBook[];
    contents: OfflineContent[];
    duaas: OfflineDuaa[];
  }> {
    const q = query.toLowerCase().trim();
    if (!q) {
      return { books: [], contents: [], duaas: [] };
    }

    const filteredBooks = MOCK_BOOKS.filter(
      (b) =>
        b.title.toLowerCase().includes(q) ||
        (b.titleUrdu && b.titleUrdu.includes(q)) ||
        b.author.toLowerCase().includes(q)
    );

    const filteredContents = MOCK_CONTENTS.filter(
      (c) =>
        c.verseText.includes(q) ||
        (c.translationText && c.translationText.toLowerCase().includes(q)) ||
        (c.urduText && c.urduText.includes(q)) ||
        (c.narrator && c.narrator.toLowerCase().includes(q))
    );

    const filteredDuaas = MOCK_DUAAS.filter(
      (d) =>
        d.title.toLowerCase().includes(q) ||
        (d.titleUrdu && d.titleUrdu.includes(q)) ||
        d.arabicText.includes(q) ||
        d.translation.toLowerCase().includes(q) ||
        (d.urduText && d.urduText.includes(q))
    );

    return {
      books: filteredBooks,
      contents: filteredContents,
      duaas: filteredDuaas,
    };
  }
}

export const offlineStorageService = new OfflineStorageService();
