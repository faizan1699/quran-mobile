import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView, ScrollView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { offlineStorageService, OfflineDuaa, OfflineBook, OfflineChapter } from '@/services/offlineStorageService';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

export default function DuaaScreen(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'duaa' | 'hadith'>('duaa');
  const [favoritesOnly, setFavoritesOnly] = useState(false);
  
  // Data States
  const [duaas, setDuaas] = useState<OfflineDuaa[]>([]);
  const [books, setBooks] = useState<OfflineBook[]>([]);
  const [chapters, setChapters] = useState<Record<string, OfflineChapter[]>>({});
  const [expandedBooks, setExpandedBooks] = useState<Record<string, boolean>>({});

  // Load Initial Data
  useEffect(() => {
    const loadData = async () => {
      const dData = await offlineStorageService.getDuaas();
      const bData = await offlineStorageService.getBooks();
      setDuaas(dData);
      setBooks(bData.filter((b) => b.category === 'HADITH')); // Hadith books only

      // Load chapters for each book
      const chaptersMap: Record<string, OfflineChapter[]> = {};
      for (const b of bData) {
        const cData = await offlineStorageService.getChapters(b.id);
        chaptersMap[b.id] = cData;
      }
      setChapters(chaptersMap);
    };
    loadData();
  }, []);

  const toggleFavorite = async (id: string) => {
    const updated = await offlineStorageService.toggleDuaaFavorite(id);
    if (updated) {
      setDuaas((prev) => prev.map((d) => (d.id === id ? updated : d)));
    }
  };

  const toggleBookExpanded = (bookId: string) => {
    setExpandedBooks((prev) => ({
      ...prev,
      [bookId]: !prev[bookId],
    }));
  };

  const handleChapterPress = (bookId: string, chapter: OfflineChapter) => {
    navigation.navigate('Reader', {
      bookId: bookId,
      chapterId: chapter.id,
    });
  };

  // Filters
  const filteredDuaas = duaas.filter((d) => {
    const matchesSearch =
      d.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (d.titleUrdu && d.titleUrdu.includes(searchQuery)) ||
      d.arabicText.includes(searchQuery) ||
      d.translation.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesFavorite = !favoritesOnly || d.isFavorite;

    return matchesSearch && matchesFavorite;
  });

  const filteredBooks = books.filter((b) => {
    return (
      b.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (b.titleUrdu && b.titleUrdu.includes(searchQuery))
    );
  });

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Global Header */}
      <GlobalHeader />

      <View style={styles.container}>
        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, isRTL && styles.textRTL]}
            placeholder={t('duaa.searchPlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Tab Toggle Segments */}
        <View style={[styles.segmentContainer, isRTL && styles.segmentContainerRTL]}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeSegment === 'duaa' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveSegment('duaa')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'duaa' && styles.segmentTextActive,
              ]}
            >
              {t('duaa.duaaCollection')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeSegment === 'hadith' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveSegment('hadith')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'hadith' && styles.segmentTextActive,
              ]}
            >
              {t('duaa.hadithIndex')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Dynamic Display Area */}
        {activeSegment === 'duaa' ? (
          /* ==========================================
             DUAA COLLECTION VIEW
             ========================================== */
          <View style={styles.contentWrapper}>
            {/* Favorites filter toggle */}
            <View style={[styles.filterBar, isRTL && styles.rowRTL]}>
              <TouchableOpacity
                style={[styles.filterCheckbox, isRTL && styles.rowRTL]}
                onPress={() => setFavoritesOnly((prev) => !prev)}
                activeOpacity={0.7}
              >
                <View style={[styles.checkboxOutline, favoritesOnly && styles.checkboxActive]}>
                  {favoritesOnly && <Text style={styles.checkboxTick}>✓</Text>}
                </View>
                <Text style={styles.filterLabel}>{t('duaa.favoritesOnly')}</Text>
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              contentContainerStyle={styles.scrollContent}
              showsVerticalScrollIndicator={false}
            >
              {filteredDuaas.length === 0 ? (
                <Text style={styles.emptyText}>
                  {language === 'ur' ? 'کوئی دعا نہیں ملی۔' : 'No duaas found.'}
                </Text>
              ) : (
                filteredDuaas.map((item) => {
                  const titleStr = language === 'ur' && item.titleUrdu ? item.titleUrdu : item.title;
                  const translationStr = language === 'ur' && item.urduText ? item.urduText : item.translation;

                  return (
                    <View key={item.id} style={styles.duaaCard}>
                      <View style={[styles.duaaHeader, isRTL && styles.rowRTL]}>
                        <Text style={[styles.duaaTitle, isRTL && styles.textRTL]}>
                          {titleStr}
                        </Text>
                        
                        {/* Favorite Star Tag */}
                        <TouchableOpacity 
                          onPress={() => toggleFavorite(item.id)}
                          activeOpacity={0.7}
                          style={styles.starButton}
                        >
                          <Text style={[styles.starIcon, item.isFavorite && styles.starIconActive]}>
                            {item.isFavorite ? '★' : '☆'}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      <Text style={styles.duaaArabic}>{item.arabicText}</Text>
                      <View style={styles.duaaDivider} />
                      <Text style={[styles.duaaTranslation, language === 'ur' && styles.translationUrdu]}>
                        {translationStr}
                      </Text>
                    </View>
                  );
                })
              )}
            </ScrollView>
          </View>
        ) : (
          /* ==========================================
             HADITH INDEX ACCORDION VIEW
             ========================================== */
          <ScrollView 
            style={styles.scrollView}
            contentContainerStyle={styles.hadithAccordionContent}
            showsVerticalScrollIndicator={false}
          >
            {filteredBooks.length === 0 ? (
              <Text style={styles.emptyText}>
                {language === 'ur' ? 'کوئی کتاب نہیں ملی۔' : 'No books found.'}
              </Text>
            ) : (
              filteredBooks.map((book) => {
                const bookTitle = language === 'ur' && book.titleUrdu ? book.titleUrdu : book.title;
                const isExpanded = !!expandedBooks[book.id];
                const bookChapters = chapters[book.id] || [];

                return (
                  <View key={book.id} style={styles.accordionGroup}>
                    {/* Accordion Group Header (Cream/Beige Row) */}
                    <TouchableOpacity
                      style={[
                        styles.accordionHeader,
                        isExpanded && styles.accordionHeaderExpanded,
                        isRTL && styles.rowRTL,
                      ]}
                      onPress={() => toggleBookExpanded(book.id)}
                      activeOpacity={0.8}
                    >
                      <View style={[styles.accordionTitleBox, isRTL && styles.rowRTL]}>
                        <Text style={styles.bookSymbol}>📖</Text>
                        <Text style={[styles.accordionTitle, isRTL && styles.textRTL]}>
                          {bookTitle}
                        </Text>
                      </View>
                      <Text style={styles.chevronSymbol}>
                        {isExpanded ? '▲' : '▼'}
                      </Text>
                    </TouchableOpacity>

                    {/* Expanded Child Rows (White with borders) */}
                    {isExpanded && (
                      <View style={styles.accordionChildren}>
                        {bookChapters.length === 0 ? (
                          <View style={styles.childRow}>
                            <Text style={styles.emptyText}>No chapters available</Text>
                          </View>
                        ) : (
                          bookChapters.map((ch, idx) => {
                            const chName = language === 'ur' && ch.chapterNameUrdu ? ch.chapterNameUrdu : ch.chapterName;
                            return (
                              <TouchableOpacity
                                key={ch.id}
                                style={[styles.childRow, isRTL && styles.rowRTL]}
                                onPress={() => handleChapterPress(book.id, ch)}
                                activeOpacity={0.7}
                              >
                                <Text style={styles.chapterNumber}>{idx + 1}</Text>
                                <Text style={[styles.chapterNameText, isRTL && styles.textRTL]}>
                                  {chName}
                                </Text>
                                <Text style={styles.arrowSymbol}>
                                  {isRTL ? '◀' : '▶'}
                                </Text>
                              </TouchableOpacity>
                            );
                          })
                        )}
                      </View>
                    )}
                  </View>
                );
              })
            )}
          </ScrollView>
        )}
      </View>
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
    paddingTop: spacing.cardGap,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.button,
    marginHorizontal: spacing.pagePadding,
    paddingHorizontal: spacing[3],
    height: 48,
  },
  searchIcon: {
    fontSize: 18,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: theme.textPrimary,
    height: '100%',
    padding: 0,
  },
  textRTL: {
    textAlign: 'right',
  },
  segmentContainer: {
    flexDirection: 'row',
    backgroundColor: theme.bgMuted,
    borderRadius: borderRadius.button,
    marginHorizontal: spacing.pagePadding,
    marginTop: spacing[3],
    padding: 2,
  },
  segmentContainerRTL: {
    flexDirection: 'row-reverse',
  },
  segmentButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: borderRadius.button - 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  segmentButtonActive: {
    backgroundColor: theme.accentGreen,
  },
  segmentText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: '600',
  },
  segmentTextActive: {
    color: colors.neutral[0],
  },
  contentWrapper: {
    flex: 1,
  },
  filterBar: {
    flexDirection: 'row',
    paddingHorizontal: spacing.pagePadding,
    paddingTop: spacing[3],
    paddingBottom: spacing[1],
  },
  filterCheckbox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  checkboxOutline: {
    width: 18,
    height: 18,
    borderWidth: 1.5,
    borderColor: theme.accentGreen,
    borderRadius: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: theme.accentGreen,
  },
  checkboxTick: {
    fontSize: 12,
    color: colors.neutral[0],
    fontWeight: 'bold',
    marginTop: -2,
  },
  filterLabel: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    fontWeight: '500',
  },
  scrollView: {
    flex: 1,
    marginTop: spacing[2],
  },
  scrollContent: {
    paddingHorizontal: spacing.pagePadding,
    paddingBottom: spacing.sectionGap * 2,
    gap: spacing.cardGap,
  },
  hadithAccordionContent: {
    paddingHorizontal: spacing.pagePadding,
    paddingTop: spacing[3],
    paddingBottom: spacing.sectionGap * 2,
    gap: spacing.cardGap,
  },
  duaaCard: {
    backgroundColor: theme.bgCard,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.sm,
  },
  duaaHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  duaaTitle: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: theme.textPrimary,
    flex: 1,
  },
  starButton: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  starIcon: {
    fontSize: 22,
    color: theme.textMuted,
  },
  starIconActive: {
    color: theme.textGold,
  },
  duaaArabic: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.arabic.sm, // 20
    lineHeight: typography.fontSize.arabic.sm * typography.lineHeight.arabic,
    color: theme.textPrimary,
    textAlign: 'center',
    writingDirection: 'rtl',
    marginVertical: spacing[2],
  },
  duaaDivider: {
    height: 1,
    backgroundColor: theme.borderDivider,
    marginVertical: spacing[2],
  },
  duaaTranslation: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    lineHeight: 18,
  },
  translationUrdu: {
    fontFamily: typography.fontFamily.urdu,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 24,
  },
  accordionGroup: {
    borderRadius: borderRadius.card,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gold[400],
    ...shadows.sm,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: colors.gold[200], // Beige/Cream header
    paddingVertical: spacing[4],
    paddingHorizontal: spacing.pagePadding,
  },
  accordionHeaderExpanded: {
    borderBottomWidth: 1,
    borderBottomColor: colors.gold[400],
  },
  accordionTitleBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  bookSymbol: {
    fontSize: 16,
  },
  accordionTitle: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.md,
    fontWeight: 'bold',
    color: colors.primary[900],
    flex: 1,
  },
  chevronSymbol: {
    fontSize: 10,
    color: theme.accentGreen,
  },
  accordionChildren: {
    backgroundColor: theme.bgCard,
  },
  childRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: spacing.listItemPadding,
    paddingHorizontal: spacing.pagePadding,
    borderBottomWidth: 1,
    borderBottomColor: theme.borderDivider,
  },
  chapterNumber: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    fontWeight: 'bold',
    color: theme.textGold,
    width: 24,
  },
  chapterNameText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: theme.textPrimary,
    flex: 1,
  },
  arrowSymbol: {
    fontSize: 10,
    color: theme.textMuted,
  },
  emptyText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sectionGap,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
});

