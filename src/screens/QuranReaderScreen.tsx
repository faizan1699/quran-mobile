import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRoute, useNavigation, RouteProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useAudioStore } from '@/store/useAudioStore';
import { useQuranStore } from '@/store/useQuranStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import { AyahArabic } from '@/components/AyahArabic';
import { useSurahAyahs, useTafseerSections } from '@/hooks/useQuran';
import { getSurahMeta } from '@/data/surahMeta';
import {
  RECITERS,
  getReciter,
  ayahAudioUrl,
  translationAudioUrl,
  translationReciterFor,
} from '@/data/reciters';
import { useTheme, Theme } from '@/theme';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';
import { QuranAyah } from '@shared-types';

type QuranReaderRouteProp = RouteProp<RootStackParamList, 'QuranReader'>;

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

export default function QuranReaderScreen(): React.JSX.Element {
  const route = useRoute<QuranReaderRouteProp>();
  const navigation = useNavigation<any>();
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const { surahNumber, surahName } = route.params;
  const meta = getSurahMeta(surahNumber);

  const { data: ayahs, isLoading, isError, refetch } = useSurahAyahs(surahNumber);

  const { data: tafseerSections } = useTafseerSections(surahNumber);

  const sectionForAyah = (ayahNumber: number) =>
    tafseerSections?.find(
      (s) =>
        s.ayahStart != null &&
        s.ayahEnd != null &&
        ayahNumber >= s.ayahStart &&
        ayahNumber <= s.ayahEnd
    ) ?? null;

  const playTrack = useAudioStore((s) => s.playTrack);
  const setQueue = useAudioStore((s) => s.setQueue);

  const bookmarks = useQuranStore((s) => s.bookmarks);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const setLastRead = useQuranStore((s) => s.setLastRead);

  const reciterId = usePreferencesStore((s) => s.reciterId);
  const setReciterId = usePreferencesStore((s) => s.setReciterId);
  const reciter = getReciter(reciterId);

  const playTranslation = usePreferencesStore((s) => s.playTranslation);
  const setPref = usePreferencesStore((s) => s.setPref);

  const [openTafseer, setOpenTafseer] = useState<Record<string, boolean>>({});
  const [fontModifier, setFontModifier] = useState(0); // 0 -> 4 -> 8 -> 12
  const [reciterModalOpen, setReciterModalOpen] = useState(false);

  const toggleTafseer = (id: string) =>
    setOpenTafseer((prev) => ({ ...prev, [id]: !prev[id] }));

  const buildTrack = (a: QuranAyah) => ({
    id: a.id,
    url: ayahAudioUrl(reciter, surahNumber, a.ayah),
    title: `${surahName} ${surahNumber}:${a.ayah}`,
    artist: reciter.name,
  });

  const buildTranslationTrack = (a: QuranAyah) => ({
    id: `${a.id}::${language}`,
    url: translationAudioUrl(surahNumber, a.ayah, language),
    title: `${surahName} ${surahNumber}:${a.ayah} — ${
      language === 'ur' ? 'ترجمہ' : 'Translation'
    }`,
    artist: translationReciterFor(language).name,
  });

  const tracks = useMemo(
    () =>
      (ayahs ?? []).flatMap((a: QuranAyah) =>
        playTranslation ? [buildTrack(a), buildTranslationTrack(a)] : [buildTrack(a)]
      ),
    [ayahs, surahName, surahNumber, reciter, playTranslation, language]
  );

  // Remember the surah as the last-read position when it opens.
  useEffect(() => {
    if (ayahs && ayahs.length > 0) {
      setLastRead({
        surahNumber,
        surahName,
        ayahNumber: ayahs[0].ayah,
      });
    }
  }, [ayahs, surahNumber, surahName, setLastRead]);

  const cycleFont = () =>
    setFontModifier((p) => (p === 0 ? 4 : p === 4 ? 8 : p === 8 ? 12 : 0));

  const markRead = (ayah: QuranAyah) =>
    setLastRead({
      surahNumber,
      surahName,
      ayahNumber: ayah.ayah,
    });

  const playAyah = async (ayah: QuranAyah) => {
    markRead(ayah);
    await playTrack(buildTrack(ayah));
    await setQueue(tracks);
  };

  const playSurah = async () => {
    if (tracks.length === 0) return;
    await playTrack(tracks[0]);
    await setQueue(tracks);
  };

  const chooseReciter = (id: string) => {
    setReciterId(id);
    setReciterModalOpen(false);
  };

  const sizeArabic = typography.fontSize.arabic.md + fontModifier;
  const sizeTranslation = typography.fontSize.base + fontModifier;
  const showBismillah = surahNumber !== 1 && surahNumber !== 9;

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
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
          <TouchableOpacity
            style={styles.reciterBtn}
            onPress={() => setReciterModalOpen(true)}
            activeOpacity={0.8}
          >
            <Text style={styles.reciterIcon}>🎙</Text>
            <Text style={styles.reciterText} numberOfLines={1}>
              {language === 'ur' ? reciter.nameUrdu : reciter.name}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.fontBtn} onPress={cycleFont} activeOpacity={0.8}>
            <Text style={styles.fontIcon}>🅰</Text>
            <Text style={styles.fontText}>+{fontModifier}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fontBtn, playTranslation && styles.toggleActive]}
            onPress={() => setPref('playTranslation', !playTranslation)}
            activeOpacity={0.8}
          >
            <Text style={styles.fontIcon}>🌐</Text>
            <Text style={[styles.fontText, playTranslation && styles.toggleActiveText]}>
              {language === 'ur' ? 'ترجمہ' : 'Tr'}
            </Text>
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
            <ActivityIndicator size="large" color={theme.accentGreen} />
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
          ayahs.map((ayah: QuranAyah) => {
            const bookmarked = bookmarks.some((b) => b.id === ayah.id);
            const translation =
              language === 'ur' && ayah.urdu ? ayah.urdu : ayah.translation;

            return (
              <View key={ayah.id} style={styles.ayahCard}>
                {/* Ayah header */}
                <View style={[styles.ayahHeader, isRTL && styles.rowRTL]}>
                  <View style={styles.ayahBadge}>
                    <Text style={styles.ayahBadgeText}>
                      {surahNumber}:{ayah.ayah}
                    </Text>
                  </View>

                  <View style={[styles.ayahActions, isRTL && styles.rowRTL]}>
                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        toggleBookmark({
                          id: ayah.id,
                          surahNumber,
                          surahName,
                          ayahNumber: ayah.ayah,
                          snippet: ayah.arabic.slice(0, 40),
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={[styles.bookmarkIcon, bookmarked && styles.bookmarkActive]}>
                        {bookmarked ? '🔖' : '🏷'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        navigation.navigate('NoteEditor', {
                          surahNumber,
                          surahName,
                          ayahNumber: ayah.ayah,
                        })
                      }
                      activeOpacity={0.7}
                    >
                      <Text style={styles.bookmarkIcon}>📝</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.playBtn}
                      onPress={() => playAyah(ayah)}
                      activeOpacity={0.7}
                    >
                      <Text style={styles.playBtnText}>🔊</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Arabic */}
                <AyahArabic
                  trackId={ayah.id}
                  plainText={ayah.arabic}
                  textStyle={[
                    styles.arabic,
                    { fontSize: sizeArabic, lineHeight: sizeArabic * typography.lineHeight.arabic },
                  ]}
                  activeStyle={styles.arabicActive}
                />

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

                {openTafseer[ayah.id] && (() => {
                  const section = language === 'ur' ? sectionForAyah(ayah.ayah) : null;
                  const sectionText = section?.text;
                  return (
                    <View style={styles.tafseerBox}>
                      {section && (
                        <Text style={styles.tafseerSourceLabel}>
                          {`تعلیم القرآن • آیات ${section.ayahRange}`}
                        </Text>
                      )}
                      <Text
                        style={[
                          styles.tafseerText,
                          language === 'ur' && styles.tafseerUrdu,
                        ]}
                      >
                        {sectionText || t('quran.tafseerSoon')}
                      </Text>
                    </View>
                  );
                })()}
              </View>
            );
          })
        )}
      </ScrollView>

      <Modal
        visible={reciterModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setReciterModalOpen(false)}
      >
        <Pressable style={styles.modalBackdrop} onPress={() => setReciterModalOpen(false)}>
          <Pressable style={styles.modalCard}>
            <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
              {t('quran.chooseReciter')}
            </Text>
            {RECITERS.map((r) => {
              const active = r.id === reciter.id;
              return (
                <TouchableOpacity
                  key={r.id}
                  style={[
                    styles.reciterRow,
                    active && styles.reciterRowActive,
                    isRTL && styles.rowRTL,
                  ]}
                  onPress={() => chooseReciter(r.id)}
                  activeOpacity={0.7}
                >
                  <View style={styles.reciterRowTextCol}>
                    <Text
                      style={[
                        styles.reciterRowName,
                        active && styles.reciterRowNameActive,
                        isRTL && styles.textRTL,
                      ]}
                    >
                      {language === 'ur' ? r.nameUrdu : r.name}
                    </Text>
                    <Text style={[styles.reciterRowSub, isRTL && styles.textRTL]}>
                      {language === 'ur' ? r.name : r.nameUrdu}
                    </Text>
                  </View>
                  {active && <Text style={styles.reciterCheck}>✓</Text>}
                </TouchableOpacity>
              );
            })}
          </Pressable>
        </Pressable>
      </Modal>

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
  reciterBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: theme.bgMuted,
    borderWidth: 1,
    borderColor: theme.border,
    borderRadius: borderRadius.button,
    paddingHorizontal: 10,
    paddingVertical: 4,
    gap: 4,
    maxWidth: 130,
  },
  reciterIcon: {
    fontSize: 13,
  },
  reciterText: {
    flexShrink: 1,
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: theme.textSecondary,
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
  toggleActive: {
    backgroundColor: theme.accentGreen,
    borderColor: theme.accentGreen,
  },
  toggleActiveText: {
    color: colors.neutral[0],
  },
  playSurahBtn: {
    backgroundColor: theme.accentGreen,
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
    backgroundColor: theme.accentGreen,
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
  tafseerSourceLabel: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold[600],
    marginBottom: spacing[2],
    textAlign: 'right',
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
    backgroundColor: theme.accentSoft,
    borderRadius: borderRadius.badge,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
  },
  ayahBadgeText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
    color: theme.accentGreen,
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
    backgroundColor: theme.accentSoft,
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
  arabicActive: {
    color: colors.gold[400],
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
  textRTL: {
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.pagePadding,
  },
  modalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: theme.bgCard,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: theme.border,
    padding: spacing.cardPadding,
    gap: spacing[1],
    ...shadows.sm,
  },
  modalTitle: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.md,
    fontWeight: typography.fontWeight.bold,
    color: theme.textBrandGreen,
    marginBottom: spacing[2],
  },
  reciterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[3],
    borderRadius: borderRadius.button,
    gap: spacing[2],
  },
  reciterRowActive: {
    backgroundColor: theme.accentSoft,
  },
  reciterRowTextCol: {
    flex: 1,
  },
  reciterRowName: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: theme.textPrimary,
  },
  reciterRowNameActive: {
    color: theme.textBrandGreen,
  },
  reciterRowSub: {
    fontFamily: typography.fontFamily.urdu,
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginTop: 2,
  },
  reciterCheck: {
    fontSize: 16,
    fontWeight: typography.fontWeight.bold,
    color: theme.accentGreen,
  },
  });
