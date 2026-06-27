import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useQueryClient } from '@tanstack/react-query';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import { useSurahs } from '@/hooks/useQuran';
import { quranService } from '@/services/quranService';
import { useAudioStore } from '@/store/useAudioStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { getSurahMeta } from '@/data/surahMeta';
import {
  getReciter,
  ayahAudioUrl,
  translationAudioUrl,
  translationReciterFor,
} from '@/data/reciters';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';
import { QuranAyah, QuranSurahSummary } from '@shared-types';

type RevelationFilter = 'all' | 'Makki' | 'Madani';

export default function SurahListScreen(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();
  const queryClient = useQueryClient();
  const { surahs, isLoading, isError, refetch } = useSurahs();

  const playTrack = useAudioStore((s) => s.playTrack);
  const setQueue = useAudioStore((s) => s.setQueue);
  const reciterId = usePreferencesStore((s) => s.reciterId);
  const playTranslation = usePreferencesStore((s) => s.playTranslation);

  const [query, setQuery] = useState('');
  const [revelation, setRevelation] = useState<RevelationFilter>('all');
  const [loadingSurah, setLoadingSurah] = useState<number | null>(null);

  const FILTERS: { key: RevelationFilter; label: string }[] = [
    { key: 'all', label: t('quran.filterAll') },
    { key: 'Makki', label: t('quran.filterMakki') },
    { key: 'Madani', label: t('quran.filterMadani') },
  ];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return surahs.filter((s) => {
      const meta = getSurahMeta(s.surah);
      if (revelation !== 'all' && meta?.revelation !== revelation) return false;
      if (!q) return true;
      return (
        (meta?.englishName.toLowerCase().includes(q) ?? false) ||
        (meta?.meaningUrdu ?? '').includes(query) ||
        String(s.surah) === q ||
        (meta?.meaning.toLowerCase().includes(q) ?? false)
      );
    });
  }, [surahs, query, revelation]);

  const surahName = (surah: number) =>
    getSurahMeta(surah)?.englishName ?? `Surah ${surah}`;

  const openSurah = (surah: QuranSurahSummary) => {
    navigation.navigate('QuranReader', {
      surahNumber: surah.surah,
      surahName: surahName(surah.surah),
    });
  };

  const playFullSurah = async (surah: QuranSurahSummary) => {
    if (loadingSurah !== null) return;
    setLoadingSurah(surah.surah);
    try {
      const reciter = getReciter(reciterId);
      const ayahs = await queryClient.fetchQuery<QuranAyah[]>({
        queryKey: ['quran', 'ayahs', surah.surah],
        queryFn: () => quranService.getSurahAyahs(surah.surah),
        staleTime: Infinity,
      });
      const name = surahName(surah.surah);
      const tracks = (ayahs ?? []).flatMap((a) => {
        const arabic = {
          id: a.id,
          url: ayahAudioUrl(reciter, surah.surah, a.ayah),
          title: `${name} ${surah.surah}:${a.ayah}`,
          artist: reciter.name,
        };
        const translationText = language === 'ur' ? a.urdu : a.translation;
        if (playTranslation && translationText) {
          return [
            arabic,
            {
              id: `${a.id}::${language}`,
              url: translationAudioUrl(surah.surah, a.ayah, language),
              title: `${name} ${surah.surah}:${a.ayah} — ${
                language === 'ur' ? 'ترجمہ' : 'Translation'
              }`,
              artist: translationReciterFor(language).name,
            },
          ];
        }
        return [arabic];
      });
      if (tracks.length === 0) return;
      await playTrack(tracks[0]);
      await setQueue(tracks);
    } catch (e) {
      console.error('Error playing full surah:', e);
    } finally {
      setLoadingSurah(null);
    }
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
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

        {/* Makki / Madani filter */}
        <View style={[styles.filterRow, isRTL && styles.rowRTL]}>
          {FILTERS.map((f) => {
            const active = revelation === f.key;
            return (
              <TouchableOpacity
                key={f.key}
                style={[styles.filterChip, active && styles.filterChipActive]}
                onPress={() => setRevelation(f.key)}
                activeOpacity={0.8}
              >
                <Text
                  style={[styles.filterChipText, active && styles.filterChipTextActive]}
                >
                  {f.label}
                </Text>
              </TouchableOpacity>
            );
          })}
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
              const meta = getSurahMeta(surah.surah);
              const revelation = meta
                ? language === 'ur'
                  ? meta.revelation === 'Makki'
                    ? 'مکی'
                    : 'مدنی'
                  : meta.revelation
                : '';
              const subtitle =
                language === 'ur' ? meta?.meaningUrdu ?? '' : meta?.meaning ?? '';

              return (
                <TouchableOpacity
                  key={surah.surah}
                  style={[styles.row, isRTL && styles.rowRTL]}
                  onPress={() => openSurah(surah)}
                  activeOpacity={0.8}
                >
                  {/* Number badge */}
                  <View style={styles.numberBadge}>
                    <Text style={styles.numberText}>{surah.surah}</Text>
                  </View>

                  {/* Name + meaning */}
                  <View style={styles.nameBox}>
                    <Text
                      style={[styles.surahName, isRTL && styles.textRTL]}
                      numberOfLines={1}
                    >
                      {surahName(surah.surah)}
                    </Text>
                    <Text
                      style={[styles.surahSub, isRTL && styles.textRTL]}
                      numberOfLines={1}
                    >
                      {revelation}
                      {revelation ? '  •  ' : ''}
                      {`${surah.ayahCount} ${language === 'ur' ? 'آیات' : 'Ayahs'}`}
                      {subtitle ? `  •  ${subtitle}` : ''}
                    </Text>
                  </View>

                  {/* Arabic name */}
                  <Text style={styles.arabicName}>{meta?.arabicName ?? ''}</Text>

                  {/* Play full surah */}
                  <TouchableOpacity
                    style={styles.playBtn}
                    onPress={() => playFullSurah(surah)}
                    activeOpacity={0.7}
                    disabled={loadingSurah === surah.surah}
                  >
                    {loadingSurah === surah.surah ? (
                      <ActivityIndicator size="small" color={theme.accentGreen} />
                    ) : (
                      <Text style={styles.playIcon}>▶</Text>
                    )}
                  </TouchableOpacity>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        )}
      </View>

      <AudioPlayerBar />
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
  filterRow: {
    flexDirection: 'row',
    gap: spacing[2],
    marginHorizontal: spacing.pagePadding,
    marginTop: spacing[3],
  },
  filterChip: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
    borderRadius: borderRadius.full,
    borderWidth: 1,
    borderColor: theme.border,
    backgroundColor: theme.bgCard,
  },
  filterChipActive: {
    backgroundColor: theme.accentGreen,
    borderColor: theme.accentGreen,
  },
  filterChipText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: theme.textSecondary,
  },
  filterChipTextActive: {
    color: colors.neutral[0],
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
  playBtn: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: theme.accentSoft,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playIcon: {
    fontSize: 14,
    color: theme.accentGreen,
    marginLeft: 2,
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
