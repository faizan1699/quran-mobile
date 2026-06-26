import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView, Alert } from 'react-native';
import { useRoute, useNavigation, RouteProp, NavigationProp } from '@react-navigation/native';
import { Image } from 'expo-image';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { offlineStorageService, OfflineBook, OfflineChapter } from '@/services/offlineStorageService';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

type BookDetailScreenRouteProp = RouteProp<RootStackParamList, 'BookDetail'>;

export default function BookDetailScreen(): React.JSX.Element {
  const route = useRoute<BookDetailScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { bookId, bookTitle } = route.params;

  const [book, setBook] = useState<OfflineBook | null>(null);
  const [chapters, setChapters] = useState<OfflineChapter[]>([]);
  const [isDownloaded, setIsDownloaded] = useState(bookId === 'b1'); // mock first downloaded

  useEffect(() => {
    const loadData = async () => {
      const bData = await offlineStorageService.getBookById(bookId);
      const cData = await offlineStorageService.getChapters(bookId);
      setBook(bData);
      setChapters(cData);
    };
    loadData();
  }, [bookId]);

  const handleDownload = () => {
    setIsDownloaded((prev) => !prev);
    Alert.alert(
      language === 'ur' ? 'کامیاب!' : 'Success!',
      isDownloaded
        ? (language === 'ur' ? 'آف لائن ڈیٹا حذف کر دیا گیا ہے۔' : 'Offline content removed.')
        : (language === 'ur' ? 'کتاب آف لائن ڈاؤن لوڈ ہو چکی ہے۔' : 'Book successfully downloaded for offline access.')
    );
  };

  const handleChapterPress = (chapter: OfflineChapter) => {
    navigation.navigate('Reader', {
      bookId: bookId,
      chapterId: chapter.id,
    });
  };

  if (!book) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <GlobalHeader />
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const titleText = language === 'ur' && book.titleUrdu ? book.titleUrdu : book.title;

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Global Header */}
      <GlobalHeader />

      {/* Detail Container */}
      <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
        {/* Back navigation header */}
        <TouchableOpacity 
          style={[styles.backButton, isRTL && styles.backButtonRTL]} 
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>{isRTL ? '◀' : '◀'}</Text>
          <Text style={styles.backText}>{language === 'ur' ? 'واپس' : 'Back'}</Text>
        </TouchableOpacity>

        {/* Hero book card */}
        <View style={[styles.heroRow, isRTL && styles.rowRTL]}>
          <View style={styles.coverWrapper}>
            {book.coverImage ? (
              <Image
                source={{ uri: book.coverImage }}
                style={styles.coverImage}
                contentFit="cover"
                transition={200}
              />
            ) : (
              <View style={styles.placeholderCover}>
                <Text style={styles.placeholderEmblem}>📖</Text>
              </View>
            )}
          </View>

          <View style={styles.metaColumn}>
            <Text style={[styles.title, isRTL && styles.textRTL]}>{titleText}</Text>
            <Text style={[styles.author, isRTL && styles.textRTL]}>{book.author}</Text>
            <View style={[styles.badgeContainer, isRTL && styles.rowRTL]}>
              <View style={styles.badge}>
                <Text style={styles.badgeText}>{book.category}</Text>
              </View>
            </View>

            {/* Download Button */}
            <TouchableOpacity
              style={[
                styles.downloadBtn,
                isDownloaded && styles.downloadBtnActive,
                isRTL && styles.rowRTL
              ]}
              onPress={handleDownload}
              activeOpacity={0.8}
            >
              <Text style={styles.downloadIcon}>{isDownloaded ? '✅' : '📥'}</Text>
              <Text style={[styles.downloadText, isDownloaded && styles.downloadTextActive]}>
                {isDownloaded ? (language === 'ur' ? 'ڈاؤن لوڈ شدہ' : 'Downloaded') : t('library.downloadForOffline')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Description Section */}
        <View style={styles.descriptionSection}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {language === 'ur' ? 'تفصیل' : 'Description'}
          </Text>
          <Text style={[styles.descriptionText, isRTL && styles.descriptionRTL]}>
            {language === 'ur'
              ? 'یہ ایک مستند اسلامی کتاب ہے جو آف لائن پڑھنے اور آڈیو سننے کی خصوصیات کے ساتھ دستیاب ہے۔'
              : 'This is an authentic Islamic compilation made available with high fidelity content lookup, offline synchronization support, and clear recitation tracks.'}
          </Text>
        </View>

        {/* Chapters List */}
        <View style={styles.chaptersSection}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {language === 'ur' ? 'ابواب' : 'Chapters'}
          </Text>

          <View style={styles.chapterList}>
            {chapters.map((chapter, index) => {
              const chName = language === 'ur' && chapter.chapterNameUrdu ? chapter.chapterNameUrdu : chapter.chapterName;
              return (
                <TouchableOpacity
                  key={chapter.id}
                  style={[styles.chapterRow, isRTL && styles.rowRTL]}
                  onPress={() => handleChapterPress(chapter)}
                  activeOpacity={0.7}
                >
                  <View style={[styles.chapterIndexBox, isRTL && styles.rowRTL]}>
                    <Text style={styles.chapterIndex}>{index + 1}</Text>
                    <Text style={[styles.chapterName, isRTL && styles.textRTL]}>{chName}</Text>
                  </View>
                  <Text style={styles.arrowIcon}>{isRTL ? '◀' : '▶'}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.bgPage,
  },
  container: {
    flex: 1,
  },
  contentContainer: {
    paddingHorizontal: spacing.pagePadding,
    paddingTop: spacing.cardGap,
    paddingBottom: spacing.sectionGap * 2,
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    paddingVertical: 8,
    paddingRight: 16,
    marginBottom: spacing[4],
  },
  backButtonRTL: {
    flexDirection: 'row-reverse',
  },
  backArrow: {
    fontSize: 14,
    color: theme.textBrandGreen,
    marginRight: 4,
  },
  backText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: theme.textBrandGreen,
    fontWeight: 'bold',
  },
  heroRow: {
    flexDirection: 'row',
    gap: spacing[4],
    marginBottom: spacing.sectionGap,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  coverWrapper: {
    width: 120,
    height: 160,
    borderRadius: borderRadius.bookCover,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gold[500],
    backgroundColor: colors.primary[900],
    ...shadows.md,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholderCover: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  placeholderEmblem: {
    fontSize: 32,
  },
  metaColumn: {
    flex: 1,
    justifyContent: 'space-between',
  },
  title: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xl,
    fontWeight: 'bold',
    color: theme.textPrimary,
  },
  author: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginTop: 2,
  },
  badgeContainer: {
    flexDirection: 'row',
    marginTop: 6,
  },
  badge: {
    backgroundColor: theme.accentSoft,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: borderRadius.badge,
  },
  badgeText: {
    fontFamily: typography.fontFamily.english,
    fontSize: 10,
    color: theme.textBrandGreen,
    fontWeight: 'bold',
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.accentGreen,
    borderRadius: borderRadius.button,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 12,
    gap: 6,
    justifyContent: 'center',
    ...shadows.sm,
  },
  downloadBtnActive: {
    backgroundColor: theme.accentGreen,
  },
  downloadIcon: {
    fontSize: 14,
  },
  downloadText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    color: theme.textBrandGreen,
    fontWeight: 'bold',
  },
  downloadTextActive: {
    color: colors.neutral[0],
  },
  descriptionSection: {
    marginBottom: spacing.sectionGap,
  },
  sectionHeading: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.textPrimary,
    marginBottom: spacing[2],
  },
  descriptionText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  descriptionRTL: {
    fontFamily: typography.fontFamily.urdu,
    textAlign: 'right',
    fontSize: typography.fontSize.md,
    lineHeight: 26,
  },
  textRTL: {
    textAlign: 'right',
  },
  chaptersSection: {
    marginTop: spacing[2],
  },
  chapterList: {
    marginTop: spacing[2],
    backgroundColor: theme.bgCard,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: theme.border,
    overflow: 'hidden',
  },
  chapterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.listItemPadding, // 14
    paddingHorizontal: spacing.pagePadding,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDivider,
  },
  chapterIndexBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  chapterIndex: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.textGold,
    width: 20,
  },
  chapterName: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: theme.textPrimary,
    fontWeight: '500',
    flex: 1,
  },
  arrowIcon: {
    fontSize: 10,
    color: theme.textMuted,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.md,
    color: theme.textSecondary,
  },
  });

