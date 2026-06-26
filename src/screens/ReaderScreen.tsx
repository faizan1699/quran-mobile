import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useRoute, useNavigation, RouteProp, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useAudioStore } from '@/store/useAudioStore';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AudioPlayerBar } from '@/components/AudioPlayerBar';
import { offlineStorageService, OfflineContent } from '@/services/offlineStorageService';
import { useTheme, Theme } from '@/theme';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

type ReaderScreenRouteProp = RouteProp<RootStackParamList, 'Reader'>;

export default function ReaderScreen(): React.JSX.Element {
  const route = useRoute<ReaderScreenRouteProp>();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const playTrack = useAudioStore((state) => state.playTrack);

  const { bookId, chapterId } = route.params;

  const [contents, setContents] = useState<OfflineContent[]>([]);
  const [fontSizeModifier, setFontSizeModifier] = useState<number>(0); // modifier step: 0, 4, 8, 12

  useEffect(() => {
    const loadContents = async () => {
      const data = await offlineStorageService.getChapterContents(bookId, chapterId);
      setContents(data);
    };
    loadContents();
  }, [bookId, chapterId]);

  // Cycle font size modifier: 0 -> 4 -> 8 -> 12 -> 0
  const cycleFontSize = () => {
    setFontSizeModifier((prev) => {
      if (prev === 0) return 4;
      if (prev === 4) return 8;
      if (prev === 8) return 12;
      return 0;
    });
  };

  const handlePlayVerse = (item: OfflineContent) => {
    if (!item.audioUrl) return;
    
    // Construct track meta
    playTrack({
      id: item.id,
      url: item.audioUrl,
      title: item.narrator || `Verse #${item.sequenceNumber}`,
      artist: 'Taleem ul Quran',
      chapterId: item.chapterId,
      bookId: bookId,
      hadithNumber: item.hadithNumber ?? undefined,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Global Header */}
      <GlobalHeader />

      <View style={styles.mainContainer}>
        {/* Navigation / Control Row */}
        <View style={[styles.controlRow, isRTL && styles.rowRTL]}>
          <TouchableOpacity
            style={[styles.backBtn, isRTL && styles.backBtnRTL]}
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>{isRTL ? '◀' : '◀'}</Text>
            <Text style={styles.backText}>{language === 'ur' ? 'واپس' : 'Back'}</Text>
          </TouchableOpacity>

          {/* Floating font size trigger */}
          <TouchableOpacity
            style={styles.fontBtn}
            onPress={cycleFontSize}
            activeOpacity={0.8}
            accessibilityLabel="Adjust Text Size"
          >
            <Text style={styles.fontIcon}>🅰️</Text>
            <Text style={styles.fontText}>
              +{fontSizeModifier}px
            </Text>
          </TouchableOpacity>
        </View>

        {/* Scrollable Content Area */}
        <ScrollView 
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {contents.length === 0 ? (
            <Text style={styles.emptyText}>
              {language === 'ur' ? 'اس باب میں کوئی مواد نہیں ملا۔' : 'No verses found in this chapter.'}
            </Text>
          ) : (
            contents.map((item) => {
              const textTranslation = language === 'ur' && item.urduText ? item.urduText : item.translationText;
              
              // Dynamic font sizes
              const sizeArabic = typography.fontSize.arabic.md + fontSizeModifier;
              const sizeTranslation = typography.fontSize.base + fontSizeModifier;

              return (
                <View key={item.id} style={styles.verseCard}>
                  {/* Verse Index & Audio Play row */}
                  <View style={[styles.verseHeader, isRTL && styles.rowRTL]}>
                    <Text style={styles.verseNumber}>
                      {item.hadithNumber ? `Hadith #${item.hadithNumber}` : `Verse #${item.sequenceNumber}`}
                    </Text>

                    {item.audioUrl && (
                      <TouchableOpacity
                        style={styles.playVerseBtn}
                        onPress={() => handlePlayVerse(item)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.playVerseIcon}>🔊 Play</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* Narrator credit */}
                  {item.narrator && (
                    <Text style={[styles.narratorText, isRTL && styles.textRTL]}>
                      {item.narrator}
                    </Text>
                  )}

                  {/* Arabic Scripture block */}
                  <Text
                    style={[
                      styles.arabicText,
                      {
                        fontSize: sizeArabic,
                        lineHeight: sizeArabic * typography.lineHeight.arabic,
                      },
                    ]}
                  >
                    {item.verseText}
                  </Text>

                  {/* Divider line */}
                  <View style={styles.divider} />

                  {/* Translation block */}
                  <Text
                    style={[
                      styles.translationText,
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
                    {textTranslation}
                  </Text>
                </View>
              );
            })
          )}
        </ScrollView>

        {/* Persistent player bar anchored above bottom tabs/screen end */}
        <AudioPlayerBar />
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
  mainContainer: {
    flex: 1,
    justifyContent: 'space-between',
  },
  controlRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.pagePadding,
    paddingVertical: spacing.cardGap,
    borderBottomWidth: 1,
    borderBottomColor: theme.border,
    backgroundColor: theme.bgCard,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  backBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
  },
  backBtnRTL: {
    flexDirection: 'row-reverse',
  },
  backArrow: {
    fontSize: 12,
    color: theme.textBrandGreen,
    marginRight: 4,
  },
  backText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: theme.textBrandGreen,
    fontWeight: 'bold',
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
    fontSize: 14,
  },
  fontText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: theme.textSecondary,
  },
  scrollView: {
    flex: 1,
    backgroundColor: theme.bgPage,
  },
  scrollContent: {
    padding: spacing.pagePadding,
    paddingBottom: spacing.sectionGap * 2,
    gap: spacing.cardGap,
  },
  verseCard: {
    backgroundColor: theme.bgCard,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: theme.border,
    ...shadows.sm,
  },
  verseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[2],
  },
  verseNumber: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: 'bold',
    color: theme.textGold,
  },
  playVerseBtn: {
    backgroundColor: colors.primary[100],
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: borderRadius.badge,
  },
  playVerseIcon: {
    fontFamily: typography.fontFamily.english,
    fontSize: 10,
    color: colors.primary[800],
    fontWeight: 'bold',
  },
  narratorText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: theme.textSecondary,
    marginBottom: spacing[3],
  },
  textRTL: {
    textAlign: 'right',
  },
  arabicText: {
    fontFamily: typography.fontFamily.arabic,
    color: theme.textArabic,
    textAlign: 'right',
    writingDirection: 'rtl',
    marginVertical: spacing[2],
  },
  divider: {
    height: 1,
    backgroundColor: theme.borderDivider, // borderDivider
    marginVertical: spacing[3],
  },
  translationText: {
    fontFamily: typography.fontFamily.english,
    color: theme.textSecondary,
  },
  translationUrdu: {
    fontFamily: typography.fontFamily.urdu,
    textAlign: 'right',
    writingDirection: 'rtl',
  },
  emptyText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    color: theme.textSecondary,
    textAlign: 'center',
    marginTop: spacing.sectionGap,
  },
  });

