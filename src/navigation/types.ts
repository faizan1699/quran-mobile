import { NavigatorScreenParams } from '@react-navigation/native';
import { GuideId } from '@/data/guides';

export type RootStackParamList = {
  Splash: undefined;
  MainTabs: NavigatorScreenParams<TabParamList>;
  Profile: undefined;
  Auth: undefined;
  ChangePassword: undefined;
  BookDetail: { bookId: string; bookTitle: string };
  Reader: { bookId: string; chapterId: string; contentId?: string };
  QuranReader: {
    surahNumber: number;
    surahName: string;
  };
  NotesList: undefined;
  NoteEditor:
    | {
        noteId?: number;
        surahNumber?: number;
        surahName?: string;
        ayahNumber?: number;
      }
    | undefined;
};

// Islam360-style bottom tabs: Quran | Hadith | Home (center) | Ibadaat | More
export type TabParamList = {
  QuranStack: undefined;
  HadithStack: undefined;
  HomeStack: undefined;
  IbadaatStack: undefined;
  MoreStack: undefined;
};

export type QuranStackParamList = {
  QuranLanding: undefined;
  SurahList: undefined;
};

export type HadithStackParamList = {
  Library: undefined;
};

export type HomeStackParamList = {
  Home: undefined;
};

export type IbadaatStackParamList = {
  Ibadaat: undefined;
  Qibla: undefined;
  Duaa: undefined;
  Tasbeeh: undefined;
  AllahNames: undefined;
  Guide: { guideId: GuideId };
};

export type MoreStackParamList = {
  Settings: undefined;
  Appearance: undefined;
};
