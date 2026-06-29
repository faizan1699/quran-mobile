// ---------------------------------------------------------------------------
// VENDORED from quran-web `packages/shared-types/src/index.ts`.
// This is the single source of truth for the API contract. If the backend
// changes these types, copy the updated file here. Imported app-wide via the
// `@shared-types` alias (see babel.config.js / tsconfig.json).
// ---------------------------------------------------------------------------

export enum UserRole {
  USER = 'USER',
  ADMIN = 'ADMIN',
  SUPER_ADMIN = 'SUPER_ADMIN',
}

export enum BookCategory {
  QURAN = 'QURAN',
  HADITH = 'HADITH',
  FIQH = 'FIQH',
  TAFSIR = 'TAFSIR',
  SEERAH = 'SEERAH',
  DUAA = 'DUAA',
  OTHER = 'OTHER',
}

export enum ContentStatus {
  DRAFT = 'DRAFT',
  SUBDITED = 'SUBDITED',
  PUBLISHED = 'PUBLISHED',
  FUNCTIONAL = 'FUNCTIONAL',
}

export enum DailyType {
  AYAH = 'AYAH',
  HADITH = 'HADITH',
  DUAA = 'DUAA',
}

export interface UserLocation {
  city?: string;
  lat?: number;
  lng?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  language: string;
  fiqhMethod: string;
  location?: UserLocation | null;
  blocked: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateAdminUserDto {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
  language?: string;
  fiqhMethod?: string;
}

export interface UpdateAdminUserDto {
  name?: string;
  email?: string;
  role?: UserRole;
  language?: string;
  fiqhMethod?: string;
}

export interface Book {
  id: string;
  title: string;
  titleUrdu?: string | null;
  author: string;
  authorUrdu?: string | null;
  personalityId?: string | null;
  category: BookCategory;
  coverImage?: string | null;
  fileUrl?: string | null;
  status: ContentStatus;
  sequence: number;
  createdAt: string;
  updatedAt: string;
}

export interface Chapter {
  id: string;
  bookId: string;
  chapterName: string;
  chapterNameUrdu?: string | null;
  sequenceOrder: number;
}

export interface TimedWord {
  text: string;
  start: number;
  end: number;
}

export interface ReciterTiming {
  audioUrl: string;
  words: TimedWord[];
}

export type WordTimings = Record<string, ReciterTiming>;

export interface Content {
  id: string;
  chapterId: string;
  verseText: string;
  translationText?: string | null;
  urduText?: string | null;
  tafseerText?: string | null;
  audioUrl?: string | null;
  wordTimings?: WordTimings | null;
  sequenceNumber: number;
  hadithNumber?: number | null;
  narrator?: string | null;
  status: ContentStatus;
  createdAt: string;
}

export interface QuranTafseerSection {
  id: string;
  surah: number;
  ayahRange?: string | null;
  ayahStart?: number | null;
  ayahEnd?: number | null;
  jild?: number | null;
  sourceFile: string;
  text: string;
  sequence: number;
  status: ContentStatus;
}

export interface QuranAyah {
  id: string;
  surah: number;
  ayah: number;
  arabic: string;
  translation?: string | null;
  urdu?: string | null;
  status: ContentStatus;
}

export interface QuranSurahSummary {
  surah: number;
  ayahCount: number;
}

export interface DailyContent {
  id: string;
  date: string;
  contentType: DailyType;
  contentRef: string;
  isActive: boolean;
}

export interface Duaa {
  id: string;
  title: string;
  titleUrdu?: string | null;
  arabicText: string;
  transliteration?: string | null;
  translation: string;
  urduText?: string | null;
  category: string;
  audioUrl?: string | null;
  isFavorite: boolean;
  status: ContentStatus;
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaginationQuery {
  page?: number;
  limit?: number;
}

export interface ApiSuccessResponse<T> {
  success: true;
  data: T;
  meta?: PaginationMeta;
}

export interface ApiErrorResponse {
  success: false;
  error: {
    code: string;
    message: string;
  };
}

export type ApiResponse<T> = ApiSuccessResponse<T> | ApiErrorResponse;

export interface LoginDto {
  email: string;
  password: string;
}

export interface RegisterDto {
  name: string;
  email: string;
  password: string;
  language?: string;
  fiqhMethod?: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export interface AuthResponse {
  user: User;
  tokens: AuthTokens;
}

export interface CreateBookDto {
  title: string;
  titleUrdu?: string;
  author: string;
  authorUrdu?: string;
  personalityId?: string;
  category: BookCategory;
  coverImage?: string;
  fileUrl?: string;
  status?: ContentStatus;
  sequence?: number;
}

export interface UpdateBookDto extends Partial<CreateBookDto> {}

export interface CreateChapterDto {
  bookId: string;
  chapterName: string;
  chapterNameUrdu?: string;
  sequenceOrder: number;
}

export interface CreateContentDto {
  chapterId: string;
  verseText: string;
  translationText?: string;
  urduText?: string;
  tafseerText?: string;
  audioUrl?: string;
  sequenceNumber: number;
  hadithNumber?: number;
  narrator?: string;
}

export interface CreateDuaaDto {
  title: string;
  titleUrdu?: string;
  arabicText: string;
  transliteration?: string;
  translation: string;
  urduText?: string;
  category: string;
  audioUrl?: string;
  status?: ContentStatus;
}

export interface UpdateDuaaDto extends Partial<CreateDuaaDto> {}

export interface SetDailyContentDto {
  date: string;
  contentType: DailyType;
  contentRef: string;
}

export interface AnalyticsTrendPoint {
  date: string;
  count: number;
}

export interface AnalyticsDistributionPoint {
  label: string;
  value: number;
}

export interface AnalyticsUsersResponse {
  data: AnalyticsTrendPoint[];
  totalUsers: number;
}

export interface AnalyticsDevicesResponse {
  languages: AnalyticsDistributionPoint[];
  fiqhMethods: AnalyticsDistributionPoint[];
  locations: AnalyticsDistributionPoint[];
}

export interface AnalyticsRetentionPoint {
  cohort: string;
  totalUsers: number;
  retainedUsers: number;
  retentionRate: number;
}

export interface AnalyticsRetentionResponse {
  data: AnalyticsRetentionPoint[];
}

export interface SyncChapter {
  id: string;
  bookId: string;
  chapterName: string;
  chapterNameUrdu?: string | null;
  sequenceOrder: number;
  createdAt: string;
  updatedAt: string;
}

export interface SyncContent {
  id: string;
  chapterId: string;
  verseText: string;
  translationText?: string | null;
  urduText?: string | null;
  tafseerText?: string | null;
  audioUrl?: string | null;
  sequenceNumber: number;
  hadithNumber?: number | null;
  narrator?: string | null;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SyncDuaa {
  id: string;
  title: string;
  titleUrdu?: string | null;
  arabicText: string;
  transliteration?: string | null;
  translation: string;
  urduText?: string | null;
  category: string;
  audioUrl?: string | null;
  isFavorite: boolean;
  status: ContentStatus;
  createdAt: string;
  updatedAt: string;
}

export interface SyncDeltaResponse {
  books: Book[];
  chapters: SyncChapter[];
  contents: SyncContent[];
  duaa: SyncDuaa[];
  syncedAt: number;
}

export interface AnalyticsOverview {
  totalUsers: number;
  contentUploads: number;
  activeAdmins: number;
  appUsage: number;
}

export interface Flash {
  id: string;
  title: string | null;
  imageUrl: string;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

export type PopupFrequency = 'ONCE' | 'DAILY' | 'EVERY_LAUNCH' | 'INTERVAL';

export interface Popup {
  id: string;
  title: string | null;
  body: string | null;
  imageUrl: string | null;
  ctaLabel: string | null;
  ctaUrl: string | null;
  startsAt: string | null;
  endsAt: string | null;
  frequency: PopupFrequency;
  intervalHours: number | null;
  maxShows: number;
  dismissible: boolean;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
}
