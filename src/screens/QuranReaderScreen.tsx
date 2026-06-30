import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  Pressable,
  LayoutChangeEvent,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import {
  useRoute,
  useNavigation,
  useFocusEffect,
  RouteProp,
} from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useAudioStore, State } from '@/store/useAudioStore';
import { useQuranStore } from '@/store/useQuranStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { GlobalHeader } from '@/components/GlobalHeader';
import { BackButton } from '@/components/BackButton';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import { PlayingWaves } from '@/components/PlayingWaves';
import { AyahArabic } from '@/components/AyahArabic';
import { useShareSheet } from '@/components/share/ShareProvider';
import { useSurahAyahs, useTafseerSections } from '@/hooks/useQuran';
import { getSurahMeta } from '@/data/surahMeta';
import { RECITERS, getReciter, ayahAudioUrl, translateTtsUrl, splitForTts } from '@/data/reciters';
import { useTheme, Theme } from '@/theme';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';
import { QuranAyah } from '@shared-types';
import { listNotesForSurah, Note } from '@/services/notesDb';
import { NOTE_COLOR_HEX } from '@/data/noteColors';

type QuranReaderRouteProp = RouteProp<RootStackParamList, 'QuranReader'>;

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

const BISMILLAH = 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ';

const toArabicDigits = (n: number): string =>
  String(n).replace(/[0-9]/g, (d) => '٠١٢٣٤٥٦٧٨٩'[Number(d)]);

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
  const setAutoAdvanceSurah = useAudioStore((s) => s.setAutoAdvanceSurah);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackState = useAudioStore((s) => s.playbackState);

  const bookmarks = useQuranStore((s) => s.bookmarks);
  const toggleBookmark = useQuranStore((s) => s.toggleBookmark);
  const setLastRead = useQuranStore((s) => s.setLastRead);

  const { share } = useShareSheet();

  const reciterId = usePreferencesStore((s) => s.reciterId);
  const setReciterId = usePreferencesStore((s) => s.setReciterId);
  const reciter = getReciter(reciterId);

  const playTranslation = usePreferencesStore((s) => s.playTranslation);
  const setPref = usePreferencesStore((s) => s.setPref);

  const [openTafseer, setOpenTafseer] = useState<Record<string, boolean>>({});
  const [fontModifier, setFontModifier] = useState(0); // 0 -> 4 -> 8 -> 12
  const [reciterModalOpen, setReciterModalOpen] = useState(false);
  const [readMode, setReadMode] = useState(false);
  const [displayMode, setDisplayMode] = useState<'both' | 'arabic' | 'translation'>('both');

  const [notesByAyah, setNotesByAyah] = useState<Record<number, Note[]>>({});

  const scrollRef = useRef<ScrollView | null>(null);
  const ayahOffsets = useRef<Record<string, number>>({});

  const loadAyahNotes = useCallback(async () => {
    try {
      const list = await listNotesForSurah(surahNumber);
      const map: Record<number, Note[]> = {};
      for (const note of list) {
        if (note.ayahNumber == null) continue;
        (map[note.ayahNumber] ??= []).push(note);
      }
      setNotesByAyah(map);
    } catch {
      setNotesByAyah({});
    }
  }, [surahNumber]);

  useFocusEffect(
    useCallback(() => {
      void loadAyahNotes();
    }, [loadAyahNotes])
  );

  useEffect(() => {
    const id = currentTrack?.id;
    if (!id) return;
    const baseId = id.includes('::') ? id.slice(0, id.indexOf('::')) : id;
    const y = ayahOffsets.current[baseId];
    if (y != null) {
      scrollRef.current?.scrollTo({ y: Math.max(0, y - 12), animated: true });
    }
  }, [currentTrack?.id]);

  const toggleTafseer = (id: string) =>
    setOpenTafseer((prev) => ({ ...prev, [id]: !prev[id] }));

  const buildTrack = (a: QuranAyah) => ({
    id: a.id,
    url: ayahAudioUrl(reciter, surahNumber, a.ayah),
    title: `${surahName} ${surahNumber}:${a.ayah}`,
    artist: reciter.name,
    arabic: a.arabic,
    translation: translationTextFor(a) ?? undefined,
    subtitle: `${surahName} • ${surahNumber}:${a.ayah}`,
    surahNumber,
  });

  const buildTranslationTracks = (a: QuranAyah) => {
    const text = translationTextFor(a);
    if (!text) return [];
    const label = language === 'ur' ? 'ترجمہ' : 'Translation';
    const chunks = splitForTts(text);
    return chunks.map((chunk, i) => ({
      id: chunks.length > 1 ? `${a.id}::${language}::${i}` : `${a.id}::${language}`,
      url: translateTtsUrl(chunk, language),
      title: `${surahName} ${surahNumber}:${a.ayah} — ${label}`,
      artist: language === 'ur' ? 'اردو ترجمہ (آواز)' : 'Translation (Voice)',
      arabic: a.arabic,
      translation: text,
      subtitle: `${surahName} • ${surahNumber}:${a.ayah} • ${label}`,
      surahNumber,
    }));
  };

  const isCurrentAyahId = (a: QuranAyah) => {
    const id = currentTrack?.id;
    return !!id && (id === a.id || id.startsWith(`${a.id}::`));
  };

  const isAyahPlaying = (a: QuranAyah) =>
    isCurrentAyahId(a) &&
    (playbackState === State.Playing || playbackState === State.Buffering);

  const isAyahCurrent = (a: QuranAyah) => isCurrentAyahId(a);

  const translationTextFor = (a: QuranAyah) =>
    language === 'ur' ? a.urdu : a.translation;

  const tracks = useMemo(
    () =>
      (ayahs ?? []).flatMap((a: QuranAyah) =>
        playTranslation && !!translationTextFor(a)
          ? [buildTrack(a), ...buildTranslationTracks(a)]
          : [buildTrack(a)]
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

  const cycleDisplayMode = () =>
    setDisplayMode((p) =>
      p === 'both' ? 'arabic' : p === 'arabic' ? 'translation' : 'both'
    );

  const displayModeLabel =
    language === 'ur'
      ? { both: 'سب', arabic: 'عربی', translation: 'ترجمہ' }[displayMode]
      : { both: 'All', arabic: 'Ar', translation: 'Tr' }[displayMode];

  const showArabic = displayMode !== 'translation';
  const showTranslationText = displayMode !== 'arabic';

  const markRead = (ayah: QuranAyah) =>
    setLastRead({
      surahNumber,
      surahName,
      ayahNumber: ayah.ayah,
    });

  const openFullPlayer = () => {
    if (Platform.OS !== 'web') {
      navigation.navigate('Player');
    }
  };

  const playAyah = async (ayah: QuranAyah) => {
    markRead(ayah);
    openFullPlayer();
    const ayahTracks =
      playTranslation && translationTextFor(ayah)
        ? [buildTrack(ayah), ...buildTranslationTracks(ayah)]
        : [buildTrack(ayah)];
    setAutoAdvanceSurah(false);
    await playTrack(ayahTracks[0]);
    await setQueue(ayahTracks);
  };

  const playSurah = async () => {
    if (tracks.length === 0) return;
    openFullPlayer();
    setAutoAdvanceSurah(true);
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

      <View style={styles.controlRow}>
        <View style={[styles.controlActions, isRTL && styles.rowRTL]}>
          <BackButton />

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
          <TouchableOpacity
            style={[styles.fontBtn, readMode && styles.toggleActive]}
            onPress={() => setReadMode((p) => !p)}
            activeOpacity={0.8}
          >
            <Text style={styles.fontIcon}>📖</Text>
            <Text style={[styles.fontText, readMode && styles.toggleActiveText]}>
              {language === 'ur' ? 'مطالعہ' : 'Read'}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.fontBtn, displayMode !== 'both' && styles.toggleActive]}
            onPress={cycleDisplayMode}
            activeOpacity={0.8}
          >
            <Text style={styles.fontIcon}>👁</Text>
            <Text style={[styles.fontText, displayMode !== 'both' && styles.toggleActiveText]}>
              {displayModeLabel}
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.playSurahBtn}
          onPress={playSurah}
          activeOpacity={0.85}
        >
          <Text style={styles.playSurahText}>▶  {t('quran.playSurah')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        ref={scrollRef}
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
        ) : readMode ? (
          <View style={styles.readCard}>
            {displayMode === 'translation' ? (
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
                {ayahs.map((ayah: QuranAyah) => {
                  const tr = translationTextFor(ayah);
                  return tr ? (
                    <Text key={ayah.id}>
                      {tr}
                      <Text style={styles.ayahMarker}>{`  ﴿${toArabicDigits(ayah.ayah)}﴾  `}</Text>
                    </Text>
                  ) : null;
                })}
              </Text>
            ) : (
              <Text
                style={[
                  styles.readArabic,
                  {
                    fontSize: sizeArabic + 4,
                    lineHeight: (sizeArabic + 4) * typography.lineHeight.arabic,
                  },
                ]}
              >
                {ayahs.map((ayah: QuranAyah) => (
                  <Text key={ayah.id}>
                    {ayah.arabic}
                    <Text style={styles.ayahMarker}>{`  ﴿${toArabicDigits(ayah.ayah)}﴾  `}</Text>
                  </Text>
                ))}
              </Text>
            )}
          </View>
        ) : (
          ayahs.map((ayah: QuranAyah) => {
            const bookmarked = bookmarks.some((b) => b.id === ayah.id);
            const translation = translationTextFor(ayah);
            const ayahNotes = notesByAyah[ayah.ayah] ?? [];

            return (
              <View
                key={ayah.id}
                style={styles.ayahCard}
                onLayout={(e: LayoutChangeEvent) => {
                  ayahOffsets.current[ayah.id] = e.nativeEvent.layout.y;
                }}
              >
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
                      accessibilityLabel={t('quran.addNote')}
                    >
                      <Text
                        style={[
                          styles.bookmarkIcon,
                          ayahNotes.length > 0 && styles.bookmarkActive,
                        ]}
                      >
                        📝
                      </Text>
                      {ayahNotes.length > 0 && (
                        <View style={styles.noteCountBadge}>
                          <Text style={styles.noteCountText}>{ayahNotes.length}</Text>
                        </View>
                      )}
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.iconBtn}
                      onPress={() =>
                        share({
                          kind: 'ayah',
                          arabic: ayah.arabic,
                          english: ayah.translation,
                          urdu: ayah.urdu,
                          reference: `${surahName} ${surahNumber}:${ayah.ayah}`,
                          referenceUrdu: `${surahName} ${toArabicDigits(
                            surahNumber
                          )}:${toArabicDigits(ayah.ayah)}`,
                        })
                      }
                      activeOpacity={0.7}
                      accessibilityLabel={t('share.shareBtn')}
                    >
                      <Ionicons
                        name="share-social-outline"
                        size={18}
                        color={theme.textGold}
                      />
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.playBtn, isAyahCurrent(ayah) && styles.playBtnActive]}
                      onPress={() =>
                        isAyahCurrent(ayah) ? togglePlay() : playAyah(ayah)
                      }
                      activeOpacity={0.7}
                    >
                      {isAyahPlaying(ayah) ? (
                        <PlayingWaves color={theme.accentGreen} height={16} />
                      ) : (
                        <Text style={styles.playBtnText}>
                          {isAyahCurrent(ayah) ? '▶' : '🔊'}
                        </Text>
                      )}
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Arabic */}
                {showArabic && (
                  <AyahArabic
                    trackId={ayah.id}
                    plainText={ayah.arabic}
                    textStyle={[
                      styles.arabic,
                      { fontSize: sizeArabic, lineHeight: sizeArabic * typography.lineHeight.arabic },
                    ]}
                    activeStyle={styles.arabicActive}
                  />
                )}

                {/* Translation */}
                {showTranslationText && !!translation && (
                  <>
                    {showArabic && <View style={styles.divider} />}
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

                {/* Saved notes for this ayah */}
                {ayahNotes.length > 0 && (
                  <View style={styles.notesBlock}>
                    <Text style={[styles.notesHeading, isRTL && styles.textRTL]}>
                      {`📝 ${t('quran.myNotes')}`}
                    </Text>
                    {ayahNotes.map((note) => (
                      <TouchableOpacity
                        key={note.id}
                        style={[
                          styles.noteCard,
                          {
                            borderLeftColor: note.color
                              ? NOTE_COLOR_HEX[note.color]
                              : theme.accentGreen,
                          },
                        ]}
                        onPress={() =>
                          navigation.navigate('NoteEditor', { noteId: note.id })
                        }
                        activeOpacity={0.7}
                      >
                        {!!note.title.trim() && (
                          <Text
                            style={[styles.noteCardTitle, isRTL && styles.textRTL]}
                            numberOfLines={1}
                          >
                            {note.title.trim()}
                          </Text>
                        )}
                        {!!note.body.trim() && (
                          <Text
                            style={[styles.noteCardBody, isRTL && styles.textRTL]}
                            numberOfLines={4}
                          >
                            {note.body.trim()}
                          </Text>
                        )}
                        <Text style={[styles.noteCardHint, isRTL && styles.textRTL]}>
                          {t('quran.tapToEdit')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
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
      flexDirection: 'column',
      alignItems: 'stretch',
      gap: spacing[2],
      paddingHorizontal: spacing.pagePadding,
      paddingVertical: spacing.cardGap,
      backgroundColor: theme.bgCard,
      borderBottomWidth: 1,
      borderBottomColor: theme.border,
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    controlActions: {
      flexDirection: 'row',
      flexWrap: 'wrap',
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
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accentGreen,
      borderRadius: borderRadius.button,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2] + 2,
    },
    playSurahText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
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
    readCard: {
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      padding: spacing.cardPaddingLg,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    readArabic: {
      fontFamily: typography.fontFamily.arabic,
      color: theme.textArabic,
      textAlign: 'right',
      writingDirection: 'rtl',
      includeFontPadding: true,
    },
    ayahMarker: {
      fontFamily: typography.fontFamily.arabic,
      color: theme.accentGreen,
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
      position: 'relative',
    },
    bookmarkIcon: {
      fontSize: 18,
      opacity: 0.5,
    },
    bookmarkActive: {
      opacity: 1,
    },
    noteCountBadge: {
      position: 'absolute',
      top: 0,
      right: 0,
      minWidth: 16,
      height: 16,
      paddingHorizontal: 3,
      borderRadius: 8,
      backgroundColor: theme.accentGreen,
      justifyContent: 'center',
      alignItems: 'center',
    },
    noteCountText: {
      fontFamily: typography.fontFamily.english,
      fontSize: 10,
      fontWeight: typography.fontWeight.bold,
      color: colors.neutral[0],
    },
    notesBlock: {
      marginTop: spacing[3],
      gap: spacing[2],
    },
    notesHeading: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: theme.textBrandGreen,
    },
    noteCard: {
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.button,
      borderLeftWidth: 3,
      borderLeftColor: theme.accentGreen,
      padding: spacing[3],
      gap: spacing[1],
    },
    noteCardTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    noteCardBody: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    noteCardHint: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      marginTop: 2,
    },
    playBtn: {
      backgroundColor: theme.accentSoft,
      width: 34,
      height: 34,
      borderRadius: 17,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playBtnActive: {
      borderWidth: 1.5,
      borderColor: theme.accentGreen,
    },
    playBtnText: {
      fontSize: 16,
      color: theme.accentGreen,
    },
    arabic: {
      fontFamily: typography.fontFamily.arabic,
      color: theme.textArabic,
      textAlign: 'right',
      writingDirection: 'rtl',
      includeFontPadding: true,
      paddingVertical: spacing[1],
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
