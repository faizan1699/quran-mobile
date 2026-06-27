import React, { useState, useEffect, useMemo, useRef } from 'react';
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
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { namesService, filterNames, DivineName } from '@/services/namesService';
import { getNameAudioUrl } from '@/data/nameAudio';
import { useAudioStore, PlaybackState } from '@/store/useAudioStore';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

function nameTrackId(number: number): string {
  return `allah-name-${number}`;
}

function nameToTrack(name: DivineName, meaning: string) {
  return {
    id: nameTrackId(name.number),
    url: getNameAudioUrl(name.number) ?? '',
    title: name.transliteration,
    artist: 'Asma-ul-Husna',
    arabic: name.arabic,
    translation: meaning,
  };
}

export default function AllahNamesScreen(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [allNames, setAllNames] = useState<DivineName[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackState = useAudioStore((s) => s.playbackState);
  const playTrack = useAudioStore((s) => s.playTrack);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const setQueue = useAudioStore((s) => s.setQueue);
  const resetPlayer = useAudioStore((s) => s.resetPlayer);

  const scrollRef = useRef<ScrollView>(null);
  const cardOffsets = useRef<Record<number, number>>({});

  useEffect(() => {
    let active = true;
    setLoading(true);
    namesService.getNames().then((result) => {
      if (active) {
        setAllNames(result);
        setLoading(false);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const names = useMemo(
    () => filterNames(allNames, searchQuery),
    [allNames, searchQuery]
  );

  useEffect(() => {
    const match = currentTrack?.id.match(/^allah-name-(\d+)$/);
    if (!match) return;
    const offset = cardOffsets.current[Number(match[1])];
    if (offset == null) return;
    scrollRef.current?.scrollTo({
      y: Math.max(0, offset - spacing[3]),
      animated: true,
    });
  }, [currentTrack?.id]);

  const meaningOf = (name: DivineName) =>
    language === 'ur' ? name.meaningUr : name.meaningEn;

  const buildQueue = () =>
    names
      .filter((n) => getNameAudioUrl(n.number))
      .map((n) => nameToTrack(n, meaningOf(n)));

  const playOne = (name: DivineName) => {
    if (!getNameAudioUrl(name.number)) return;
    if (currentTrack?.id === nameTrackId(name.number)) {
      void togglePlay();
      return;
    }
    const tracks = buildQueue();
    const target = tracks.find((tk) => tk.id === nameTrackId(name.number));
    if (!target) return;
    void (async () => {
      await playTrack(target);
      await setQueue(tracks);
    })();
  };

  const playAll = () => {
    const tracks = buildQueue();
    if (tracks.length === 0) return;
    void resetPlayer().then(() => setQueue(tracks));
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <GlobalHeader />

      <View style={[styles.subHeader, isRTL && styles.rowRTL]}>
        <TouchableOpacity
          style={[styles.backButton, isRTL && styles.rowRTL]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel={language === 'ur' ? 'واپس' : 'Back'}
        >
          <Text style={styles.backArrow}>{isRTL ? '▶' : '◀'}</Text>
          <Text style={styles.backText}>{language === 'ur' ? 'واپس' : 'Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('allahNames.title')}</Text>

        <TouchableOpacity
          style={[styles.playAllButton, isRTL && styles.rowRTL]}
          onPress={playAll}
          activeOpacity={0.7}
          disabled={names.length === 0}
          accessibilityLabel={language === 'ur' ? 'سب چلائیں' : 'Play all'}
        >
          <Text style={styles.playAllIcon}>▶</Text>
          <Text style={styles.playAllText}>{language === 'ur' ? 'سب' : 'All'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, isRTL && styles.textRTL]}
          placeholder={t('allahNames.searchPlaceholder')}
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          underlineColorAndroid="transparent"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="large" color={theme.accentGreen} />
            <Text style={styles.loadingText}>
              {language === 'ur' ? 'لوڈ ہو رہا ہے…' : 'Loading…'}
            </Text>
          </View>
        ) : names.length === 0 ? (
          <Text style={styles.emptyText}>
            {language === 'ur' ? 'کوئی نام نہیں ملا۔' : 'No names found.'}
          </Text>
        ) : (
          names.map((item) => {
            const isCurrent = currentTrack?.id === nameTrackId(item.number);
            const isPlaying = isCurrent && playbackState === PlaybackState.Playing;
            return (
              <View
                key={item.id}
                style={[
                  styles.nameCard,
                  isRTL && styles.rowRTL,
                  isCurrent && styles.nameCardActive,
                ]}
              >
                <View style={styles.numberBadge}>
                  <Text style={styles.numberText}>{item.number}</Text>
                </View>
                <View style={styles.nameBody}>
                  <Text style={styles.nameArabic}>{item.arabic}</Text>
                  <Text style={styles.nameTranslit}>{item.transliteration}</Text>
                  <Text
                    style={[styles.nameMeaning, language === 'ur' && styles.nameMeaningUrdu]}
                  >
                    {language === 'ur' ? item.meaningUr : item.meaningEn}
                  </Text>
                </View>
                <TouchableOpacity
                  style={[styles.playButton, isCurrent && styles.playButtonActive]}
                  onPress={() => playOne(item)}
                  activeOpacity={0.7}
                  accessibilityLabel={
                    isPlaying
                      ? language === 'ur'
                        ? 'روکیں'
                        : 'Pause'
                      : language === 'ur'
                      ? 'چلائیں'
                      : 'Play'
                  }
                >
                  <Text
                    style={[styles.playIcon, isCurrent && styles.playIconActive]}
                  >
                    {isPlaying ? '❚❚' : '▶'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          })
        )}
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
    subHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.pagePadding,
      paddingVertical: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.borderDivider,
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minWidth: 64,
    },
    backArrow: {
      fontSize: 14,
      color: theme.textBrandGreen,
      fontWeight: 'bold',
    },
    backText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textBrandGreen,
      fontWeight: typography.fontWeight.semibold,
    },
    title: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    playAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'flex-end',
      gap: 4,
      minWidth: 64,
    },
    playAllIcon: {
      fontSize: 12,
      color: theme.textBrandGreen,
    },
    playAllText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textBrandGreen,
      fontWeight: typography.fontWeight.semibold,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.bgCard,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.button,
      marginHorizontal: spacing.pagePadding,
      marginTop: spacing[3],
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
    scrollView: {
      flex: 1,
      marginTop: spacing[3],
    },
    scrollContent: {
      paddingHorizontal: spacing.pagePadding,
      paddingBottom: spacing.sectionGap * 2,
      gap: spacing.cardGap,
    },
    nameCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    nameCardActive: {
      borderColor: colors.gold[500],
      backgroundColor: theme.accentGreen,
    },
    playButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: theme.bgPage,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButtonActive: {
      backgroundColor: colors.gold[500],
      borderColor: colors.gold[400],
    },
    playIcon: {
      fontSize: 14,
      color: theme.textBrandGreen,
      fontWeight: 'bold',
    },
    playIconActive: {
      color: colors.neutral[0],
    },
    numberBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.accentGreen,
      borderWidth: 1,
      borderColor: colors.gold[500],
      justifyContent: 'center',
      alignItems: 'center',
    },
    numberText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.gold[400],
    },
    nameBody: {
      flex: 1,
      gap: 2,
    },
    nameArabic: {
      fontFamily: typography.fontFamily.arabic,
      fontSize: typography.fontSize.arabic.sm,
      lineHeight: typography.fontSize.arabic.sm * typography.lineHeight.arabic,
      color: theme.textArabic,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    nameTranslit: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textGold,
    },
    nameMeaning: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
    },
    nameMeaningUrdu: {
      fontFamily: typography.fontFamily.urdu,
      textAlign: 'right',
      writingDirection: 'rtl',
      lineHeight: 24,
    },
    emptyText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sectionGap,
    },
    loadingBox: {
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[3],
      marginTop: spacing.sectionGap * 2,
    },
    loadingText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
    },
  });
