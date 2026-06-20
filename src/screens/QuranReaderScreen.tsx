import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useAudioStore } from '@/store/useAudioStore';
import { useQuranStore } from '@/store/useQuranStore';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import { useSurahAyahs } from '@/hooks/useQuran';
import { getSurahMeta } from '@/data/surahMeta';
import { useTheme, Theme } from '@/theme';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';
import { Content } from '@shared-types';

type QuranReaderRouteProp = RouteProp<RootStackParamList, 'QuranReader'>;

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

export default function QuranReaderScreen(): React.JSX.Element {
  const route = useRoute<QuranReaderRouteProp>();
  const navigation = useNavigation<any>();
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { bookId, chapterId, surahNumber, surahName } = route.params;
  const meta = getSurahMeta(surahNumber);

  const { data: ayahs, isLoading, isError, refetch } = useSurahAyahs(
    bookId,
    chapterId
  );

  const playTrack = useAudioStore((s) => s.playTrack);
  const setQueue = useAudioStore((s) => s.setQueue);

  const bookmarks = useQuranStore((s) => s.bookmarks);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const setLastRead = useQuranStore((s) => s.setLastRead);

  const [openTafseer, setOpenTafseer] = useState<Record<string, boolean>>({});
  const [fontModifier, setFontModifier] = useState(0); // 0 -> 4 -> 8 -> 12

  const toggleTafseer = (id: string) =>
    setOpenTafseer((prev) => ({ ...prev, [id]: !prev[id] }));

  // Build playable tracks once per ayah set.
  const tracks = useMemo(
    () =>
      (ayahs ?? [])
        .filter((a: Content) => !!a.audioUrl)
        .map((a: Content) => ({
          id: a.id,
          url: a.audioUrl as string,
          title: `${surahName} ${surahNumber}:${a.sequenceNumber}`,
          artist: 'Mishary Rashid Alafasy',
          chapterId,
          bookId,
        })),
    [ayahs, surahName, surahNumber, chapterId, bookId]
  );

  // Remember the surah as the last-read position when it opens.
  useEffect(() => {
    if (ayahs && ayahs.length > 0) {
      setLastRead({
        bookId,
        chapterId,
        surahNumber,
        surahName,
        ayahNumber: ayahs[0].sequenceNumber,
      });
    }
  }, [ayahs, bookId, chapterId, surahNumber, surahName, setLastRead]);

  const cycleFont = () =>
    setFontModifier((p) => (p === 0 ? 4 : p === 4 ? 8 : p === 8 ? 12 : 0));

  const markRead = (ayah: Content) =>
    setLastRead({
      bookId,
      chapterId,
      surahNumber,
      surahName,
      ayahNumber: ayah.sequenceNumber,
    });

  const toTrack = (ayah: Content) => ({
    id: ayah.id,
    url: ayah.audioUrl as string,
    title: `${surahName} ${surahNumber}:${ayah.sequenceNumber}`,
    artist: 'Mishary Rashid Alafasy',
    chapterId,
    bookId,
  });

  const playAyah = async (ayah: Content) => {
    if (!ayah.audioUrl) return;
    markRead(ayah);
    // Play the chosen ayah first (sets currentTrack), then register the queue
    // so playback continues to the next ayah without auto-restarting from #1.
    await playTrack(toTrack(ayah));
    await setQueue(tracks);
  };

  const playSurah = async () => {
    if (tracks.length === 0) return;
    await playTrack(tracks[0]);
    await setQueue(tracks);
  };

  const sizeArabic = typography.fontSize.arabic.md + fontModifier;
  const sizeTranslation = typography.fontSize.base + fontModifier;
  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalHeader />

      {/* Control / nav bar */}
      <View style={[styles.controlRow, isRTL && styles.rowRTL]}>
        <TouchableOpacity
          style={[styles.backBtn, isRTL && styles.rowRTL]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Text style={styles.backArrow}>◀</Text>
          <Text style={styles.backText}>{language === 'ur' ? 'واپس' : 'Back'}</Text>
        </TouchableOpacity>

        <View style={[styles.controlActions, isRTL && styles.rowRTL]}>
          <TouchableOpacity style={styles.fontBtn} onPress={cycleFont} activeOpacity={0.8}>
            <Text style={styles.fontIcon}>🅰</Text>
            <Text style={styles.fontText}>+{fontModifier}</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.playSurahBtn} onPress={playSurah} activeOpacity={0.8}>
            <Text style={styles.playSurahText}>▶ {t('quran.playSurah')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Surah header card */}
        <View style={styles.surahHeader}>
          <Text style={styles.surahArabic}>{meta?.arabicName ?? surahName}</Text>
          <Text style={styles.surahEnglish}>
            {surahName}
            {meta ? `  •  ${language === 'ur' ? 'آیات' : 'Ayahs'} ${meta.ayahCount}` : ''}
          </Text>
          {showBismillah && <Text style={styles.bismillah}>{BISMILLAH}</Text>}
        </View>

        {/* States */}
        {isLoading ? (
          <View style={styles.centerBox}>
            <ActivityIndicator size="large" color={colors.primary[800]} />
          </View>
        ) : isError ? (
          <View style={styles.centerBox}>
            <Text style={styles.errorText}>{t('quran.loadError')}</Text>
            <TouchableOpacity style={styles.retryBtn} onPress={() => refetch()} activeOpacity={0.8}>
              <Text style={styles.retryBtnText}>{t('quran.retry')}</Text>
            </TouchableOpacity>
          </View>
        ) : !ayahs || ayahs.length === 0 ? (
          <View style={styles.centerBox}>
            <Text style={styles.emptyText}>{t('quran.noAyahs')}</Text>
          </View>
        ) : (
          ayahs.map((ayah: Content) => {
            const bookmarked = bookmarks.some((b) => b.id === ayah.id);
            const translation =
              language === 'ur' && ayah.urduText ? ayah.urduText : ayah.translationText;

            return (
              <View key={ayah.id} style={styles.ayahCard}>
                {/* Ayah header */}
                <View style={[styles.ayahHeader, isRTL && styles.rowRTL]}>
                  <View style={styles.ayahBadge}>
                    <Text style={styles.ayahBadgeText}>
                      {surahNumber}:{ayah.sequenceNumber}
                    </Text>
                  </View>

                  <View style={[styles.ayahActions, isRTL && styles.rowRTL]}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        toggleBookmark({
                          id: ayah.id,
                          bookId,
                          chapterId,
                          surahNumber,
                          surahName,
                          ayahNumber: ayah.sequenceNumber,
                          snippet: ayah.verseText.slice(0, 40),
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.bookmarkIcon, bookmarked && styles.bookmarkActive]}>
                        {bookmarked ? '🔖' : '🏷'}
                      </Text>
                    </TouchableOpacity>

                    {ayah.audioUrl && (
                      <TouchableOpacity
                        style={styles.playBtn}
                        onPress={() => playAyah(ayah)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.playBtnText}>🔊</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Arabic */}
                <Text
                  style={[
                    styles.arabic,
                    { fontSize: sizeArabic, lineHeight: sizeArabic * typography.lineHeight.arabic },
                  ]}
                >
                  {ayah.verseText}
                </Text>

                {/* Translation (always shown with the Arabic) */}
                {!!translation && (
                  <>
                    <View style={styles.divider} />
                    <Text
                      style={[
                        styles.translation,
                        language === 'ur' && styles.translationUrdu,
                        {
                          fontSize: sizeTranslation,
                          lineHeight:
                            sizeTranslation *
                            (language === 'ur'
                              ? typography.lineHeight.urdu
                              : typography.lineHeight.normal),
                        },
                      ]}
                    >
                      {translation}
                    </Text>
                  </>
                )}

                {/* Per-ayah Tafseer toggle */}
                <TouchableOpacity
                  style={[styles.tafseerToggle, isRTL && styles.rowRTL]}
                  onPress={() => toggleTafseer(ayah.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.tafseerToggleIcon}>📖</Text>
                  <Text style={styles.tafseerToggleText}>
                    {openTafseer[ayah.id] ? t('quran.hideTafseer') : t('quran.showTafseer')}
                  </Text>
                </TouchableOpacity>

                {openTafseer[ayah.id] && (
                  <View style={styles.tafseerBox}>
                    <Text
                      style={[
                        styles.tafseerText,
                        language === 'ur' && styles.tafseerUrdu,
                      ]}
                    >
                      {ayah.tafseerText || t('quran.tafseerSoon')}
                    </Text>
                  </View>
                )}
              </View>
            );
          })
        )}
      </ScrollView>

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
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePadding,
    paddingVertical: spacing.cardGap,
    backgroundColor: theme.bgCard,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  backArrow: {
    fontSize: 12,
    color: theme.textBrandGreen,
  },
  backText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: theme.textBrandGreen,
    fontWeight: typography.fontWeight.bold,
  },
  controlActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  fontBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgMuted,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.button,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
  },
  fontIcon: {
    fontSize: 13,
  },
  fontText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: theme.textSecondary,
  },
  playSurahBtn: {
    backgroundColor: colors.primary[800],
    borderRadius: borderRadius.button,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
  },
  playSurahText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: spacing.pagePadding,
    paddingBottom: spacing.sectionGap * 3,
    gap: spacing.cardGap,
  },
  surahHeader: {
    backgroundColor: colors.primary[800],
    borderRadius: borderRadius.card,
    padding: spacing.cardPaddingLg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: colors.gold[500],
    gap: spacing[2],
  },
  surahArabic: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.arabic.lg,
    color: colors.neutral[0],
  },
  surahEnglish: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: colors.gold[400],
    fontWeight: typography.fontWeight.semibold,
  },
  bismillah: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.arabic.sm,
    color: colors.neutral[0],
    textAlign: 'center',
    marginTop: spacing[1],
  },
  tafseerToggle: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 6,
    marginTop: spacing[3],
    backgroundColor: colors.gold[200],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: 6,
  },
  tafseerToggleIcon: {
    fontSize: 13,
  },
  tafseerToggleText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold[600],
  },
  tafseerBox: {
    marginTop: spacing[2],
    backgroundColor: theme.bgMuted,
    borderRadius: borderRadius.button,
    borderLeftWidth: 3,
    borderLeftColor: colors.gold[500],
    padding: spacing[3],
  },
  tafseerText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    lineHeight: 20,
  },
  tafseerUrdu: {
    fontFamily: typography.fontFamily.urdu,
    textAlign: 'right',
    writingDirection: 'rtl',
    lineHeight: 26,
  },
  ayahCard: {
    backgroundColor: theme.bgCard,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.sm,
  },
  ayahHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[3],
  },
  ayahBadge: {
    backgroundColor: colors.primary[100],
    borderRadius: borderRadius.badge,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
  },
  ayahBadgeText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[700],
  },
  ayahActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  iconBtn: {
    width: 34,
    height: 34,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bookmarkIcon: {
    fontSize: 18,
    opacity: 0.5,
  },
  bookmarkActive: {
    opacity: 1,
  },
  playBtn: {
    backgroundColor: colors.primary[100],
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
  playBtnText: {
    fontSize: 16,
  },
  arabic: {
    fontFamily: typography.fontFamily.arabic,
    color: theme.textArabic,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginVertical: spacing[2],
  },
  divider: {
    height: 1,
    backgroundColor: theme.borderDivider,
    marginVertical: spacing[3],
  },
  translation: {
    fontFamily: typography.fontFamily.english,
    color: theme.textSecondary,
  },
  translationUrdu: {
    fontFamily: typography.fontFamily.urdu,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  centerBox: {
    paddingVertical: spacing.sectionGap * 2,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[3],
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
    backgroundColor: colors.primary[800],
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
