import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { useSurahs } from '@/hooks/useQuran';
import { getSurahMeta } from '@/data/surahMeta';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';
import { Chapter } from '@shared-types';

export default function SurahListScreen(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const { book, surahs, isLoading, isError, refetch } = useSurahs();

  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return surahs;
    return surahs.filter((s) => {
      const meta = getSurahMeta(s.sequenceOrder);
      return (
        s.chapterName.toLowerCase().includes(q) ||
        (s.chapterNameUrdu ?? '').includes(query) ||
        String(s.sequenceOrder) === q ||
        (meta?.meaning.toLowerCase().includes(q) ?? false)
      );
    });
  }, [surahs, query]);

  const openSurah = (surah: Chapter) => {
    if (!book) return;
    navigation.navigate('QuranReader', {
      bookId: book.id,
      chapterId: surah.id,
      surahNumber: surah.sequenceOrder,
      surahName: surah.chapterName,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalHeader />

      <View style={styles.container}>
        {/* Search */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={[styles.searchInput, isRTL && styles.textRTL]}
            placeholder={t('quran.searchSurah')}
            placeholderTextColor={theme.textMuted}
            value={query}
            onChangeText={setQuery}
            underlineColorAndroid="transparent"
          />
        </View>

        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={theme.accentGreen} />
          </View>
        ) : isError ? (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{t('quran.loadError')}</Text>
            <TouchableOpacity
              style={styles.retryBtn}
              onPress={() => refetch()}
              activeOpacity={0.8}
            >
              <Text style={styles.retryBtnText}>{t('quran.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : filtered.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>{t('quran.noSurahs')}</Text>
          </View>
        ) : (
          <ScrollView
            style={styles.list}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
          >
            {filtered.map((surah) => {
              const meta = getSurahMeta(surah.sequenceOrder);
              const revelation = meta
                ? language === 'ur'
                  ? meta.revelation === 'Makki'
                    ? 'مکی'
                    : 'مدنی'
                  : meta.revelation
                : '';
              const subtitle =
                language === 'ur'
                  ? meta?.meaningUrdu ?? surah.chapterNameUrdu ?? ''
                  : meta?.meaning ?? '';

              return (
                <TouchableOpacity
                  key={surah.id}
                  style={[styles.row, isRTL && styles.rowRTL]}
                  onPress={() => openSurah(surah)}
                  activeOpacity={0.8}
                >
                  {/* Number badge */}
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>{surah.sequenceOrder}</Text>
                  </View>

                  {/* Name + meaning */}
                  <View style={styles.nameBox}>
                    <Text
                      style={[styles.surahName, isRTL && styles.textRTL]}
                      numberOfLines={1}
                    >
                      {surah.chapterName}
                    </Text>
                    <Text
                      style={[styles.surahSub, isRTL && styles.textRTL]}
                      numberOfLines={1}
                    >
                      {revelation}
                      {revelation && meta ? '  •  ' : ''}
                      {meta
                        ? `${meta.ayahCount} ${language === 'ur' ? 'آیات' : 'Ayahs'}`
                        : ''}
                      {subtitle ? `  •  ${subtitle}` : ''}
                    </Text>
                  </View>

                  {/* Arabic name */}
                  <Text style={styles.arabicName}>
                    {meta?.arabicName ?? surah.chapterNameUrdu ?? ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
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
  centerBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.sectionGap,
    gap: spacing[3],
  },
  list: {
    flex: 1,
    marginTop: spacing[3],
  },
  listContent: {
    paddingHorizontal: spacing.pagePadding,
    paddingBottom: spacing.sectionGap * 2,
    gap: spacing.cardGap,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgCard,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.cardPadding,
    gap: spacing[3],
    ...shadows.sm,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  numberBadge: {
    width: 40,
    height: 40,
    borderRadius: borderRadius.button,
    borderWidth: 1.5,
    borderColor: theme.accentGreen,
    justifyContent: 'center',
    alignItems: 'center',
  },
  numberText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: theme.textBrandGreen,
  },
  nameBox: {
    flex: 1,
  },
  surahName: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: theme.textPrimary,
  },
  surahSub: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    color: theme.textSecondary,
    marginTop: 2,
  },
  arabicName: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.arabic.sm,
    color: theme.textBrandGreen,
  },
  emptyText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    textAlign: 'center',
  },
  errorText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: colors.status.error,
    textAlign: 'center',
  },
  retryBtn: {
    backgroundColor: theme.accentGreen,
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing[5],
    paddingVertical: spacing[2],
  },
  retryBtnText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
});
