import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, TextInput, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { BookCoverCard } from '@/components/BookCoverCard';
import { offlineStorageService, OfflineBook } from '@/services/offlineStorageService';
import { colors, borderRadius, spacing, typography } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';
import { BookCategory } from '@shared-types';

interface ShelfItem {
  category: BookCategory;
  title: string;
  books: OfflineBook[];
}

export default function LibraryScreen(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeSegment, setActiveSegment] = useState<'all' | 'downloads'>('all');
  const [books, setBooks] = useState<OfflineBook[]>([]);

  // Load books from offline storage database
  useEffect(() => {
    const fetchBooks = async () => {
      const data = await offlineStorageService.getBooks();
      setBooks(data);
    };
    fetchBooks();
  }, []);

  // Filter books based on search query and active segment
  const filteredBooks = books.filter((book) => {
    const matchesSearch =
      book.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (book.titleUrdu && book.titleUrdu.includes(searchQuery)) ||
      book.author.toLowerCase().includes(searchQuery.toLowerCase());
      
    if (activeSegment === 'downloads') {
      // For mock purposes, treat first two books as downloaded
      return matchesSearch && (book.id === 'b1' || book.id === 'b2');
    }
    return matchesSearch;
  });

  // Group books into category shelves
  const getShelves = (): ShelfItem[] => {
    const categories: Record<BookCategory, string> = {
      [BookCategory.QURAN]: language === 'ur' ? 'قرآن' : 'Quran',
      [BookCategory.HADITH]: language === 'ur' ? 'کتبِ حدیث' : 'Hadith Collections',
      [BookCategory.TAFSIR]: language === 'ur' ? 'تفاسیر' : 'Tafsir (Commentary)',
      [BookCategory.FIQH]: language === 'ur' ? 'کتبِ فقہ' : 'Fiqh (Jurisprudence)',
      [BookCategory.SEERAH]: language === 'ur' ? 'سیرت النبی' : 'Seerah (Biography)',
      [BookCategory.DUAA]: language === 'ur' ? 'دعائیں' : 'Duaa Books',
      [BookCategory.OTHER]: language === 'ur' ? 'متفرق کتب' : 'Other Books',
    };

    return Object.keys(categories)
      .map((catKey) => {
        const cat = catKey as BookCategory;
        return {
          category: cat,
          title: categories[cat],
          books: filteredBooks.filter((b) => b.category === cat),
        };
      })
      .filter((shelf) => shelf.books.length > 0);
  };

  const shelves = getShelves();

  const handleBookPress = (book: OfflineBook) => {
    navigation.navigate('BookDetail', {
      bookId: book.id,
      bookTitle: language === 'ur' && book.titleUrdu ? book.titleUrdu : book.title,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Global Header */}
      <GlobalHeader />

      {/* Main Container */}
      <View style={styles.container}>
        {/* Search Bar Container */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, isRTL && styles.textRTL]}
            placeholder={t('library.searchPlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            underlineColorAndroid="transparent"
          />
        </View>

        {/* Segmented Toggle Control */}
        <View style={[styles.segmentContainer, isRTL && styles.segmentContainerRTL]}>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeSegment === 'all' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveSegment('all')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'all' && styles.segmentTextActive,
              ]}
            >
              {t('library.allBooks')}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.segmentButton,
              activeSegment === 'downloads' && styles.segmentButtonActive,
            ]}
            onPress={() => setActiveSegment('downloads')}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.segmentText,
                activeSegment === 'downloads' && styles.segmentTextActive,
              ]}
            >
              {t('library.myDownloads')}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Shelf Shelf List */}
        <View style={styles.listContainer}>
          <FlashList
            data={shelves}
            keyExtractor={(item) => item.category}
            estimatedItemSize={240}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <View style={styles.shelfContainer}>
                {/* Category Shelf Header */}
                <Text style={[styles.shelfTitle, isRTL && styles.textRTL]}>
                  {item.title}
                </Text>
                
                {/* Horizontal scroll list of books */}
                <View style={styles.shelfScrollWrapper}>
                  <FlashList
                    data={item.books}
                    horizontal
                    estimatedItemSize={120}
                    showsHorizontalScrollIndicator={false}
                    keyExtractor={(book) => book.id}
                    renderItem={({ item: book }) => (
                      <BookCoverCard
                        title={book.title}
                        titleUrdu={book.titleUrdu}
                        author={book.author}
                        coverImage={book.coverImage}
                        onPress={() => handleBookPress(book)}
                      />
                    )}
                  />
                </View>
              </View>
            )}
          />
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.bgPage, // Page background light surface
  },
  container: {
    flex: 1,
    paddingTop: spacing.cardGap, // 12
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.button, // 8
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
    padding: 0, // Reset default padding
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
    backgroundColor: colors.primary[800], // Brand green active segment
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
  listContainer: {
    flex: 1,
    marginTop: spacing[3],
    paddingHorizontal: spacing.pagePadding,
  },
  shelfContainer: {
    marginBottom: spacing.sectionGap, // 24
  },
  shelfTitle: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.lg, // 16
    fontWeight: typography.fontWeight.bold,
    color: theme.textPrimary,
    marginBottom: spacing[2],
  },
  shelfScrollWrapper: {
    minHeight: 210, // fits 160px cover plus text labels below
  },
  });
