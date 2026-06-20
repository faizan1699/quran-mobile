import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { useQuranStore } from '@/store/useQuranStore';
import { getSurahMeta } from '@/data/surahMeta';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';

interface FeatureTile {
  key: string;
  icon: string;
  label: string;
  labelUrdu: string;
  onPress: () => void;
  comingSoon?: boolean;
}

export default function QuranLandingScreen(): React.JSX.Element {
  const { language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  const lastRead = useQuranStore((s) => s.lastRead);
  const bookmarks = useQuranStore((s) => s.bookmarks);

  const goToSurahList = () => navigation.navigate('SurahList');

  const continueReading = () => {
    if (!lastRead) {
      goToSurahList();
      return;
    }
    navigation.navigate('QuranReader', {
      bookId: lastRead.bookId,
      chapterId: lastRead.chapterId,
      surahNumber: lastRead.surahNumber,
      surahName: lastRead.surahName,
    });
  };

  const comingSoon = () =>
    Alert.alert(
      language === 'ur' ? 'جلد آ رہا ہے' : 'Coming Soon',
      language === 'ur'
        ? 'یہ فیچر ابھی تیار کیا جا رہا ہے۔'
        : 'This feature is under construction.'
    );

  const tiles: FeatureTile[] = [
    {
      key: 'quran',
      icon: '📖',
      label: 'Al-Quran',
      labelUrdu: 'القرآن',
      onPress: goToSurahList,
    },
    {
      key: 'bookmarks',
      icon: '🔖',
      label: 'Bookmarks',
      labelUrdu: 'بک مارکس',
      onPress: () =>
        bookmarks.length > 0 ? goToSurahList() : comingSoon(),
    },
    {
      key: 'recitation',
      icon: '🎧',
      label: 'Recitation',
      labelUrdu: 'تلاوت',
      onPress: comingSoon,
      comingSoon: true,
    },
    {
      key: 'tafseer',
      icon: '📝',
      label: 'Tafseer',
      labelUrdu: 'تفسیر',
      onPress: comingSoon,
      comingSoon: true,
    },
    {
      key: 'seerat',
      icon: '🕋',
      label: 'Seerat un Nabi',
      labelUrdu: 'سیرت النبیﷺ',
      onPress: comingSoon,
      comingSoon: true,
    },
    {
      key: 'names',
      icon: '🟡',
      label: 'Allah Names',
      labelUrdu: 'اسمائے حسنیٰ',
      onPress: comingSoon,
      comingSoon: true,
    },
  ];

  const lastReadMeta = lastRead ? getSurahMeta(lastRead.surahNumber) : undefined;

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Read Quran banner */}
        <TouchableOpacity
          style={styles.banner}
          onPress={goToSurahList}
          activeOpacity={0.9}
        >
          <View style={styles.bannerTextBox}>
            <Text style={styles.bannerArabic}>القرآن الكريم</Text>
            <View style={styles.bannerBtn}>
              <Text style={styles.bannerBtnText}>
                {language === 'ur' ? 'قرآن پڑھیں' : 'Read Quran'}
              </Text>
            </View>
          </View>
          <Text style={styles.bannerEmblem}>🕌</Text>
        </TouchableOpacity>

        {/* Continue reading */}
        {lastRead && (
          <TouchableOpacity
            style={styles.continueCard}
            onPress={continueReading}
            activeOpacity={0.85}
          >
            <View style={[styles.continueRow, isRTL && styles.rowRTL]}>
              <Text style={styles.continueIcon}>↩️</Text>
              <View style={styles.continueTextBox}>
                <Text style={[styles.continueLabel, isRTL && styles.textRTL]}>
                  {language === 'ur' ? 'پڑھنا جاری رکھیں' : 'Continue Reading'}
                </Text>
                <Text style={[styles.continueSurah, isRTL && styles.textRTL]}>
                  {language === 'ur' && lastReadMeta
                    ? lastReadMeta.meaningUrdu
                    : lastRead.surahName}
                  {'  •  '}
                  {language === 'ur' ? 'آیت' : 'Ayah'} {lastRead.ayahNumber}
                </Text>
              </View>
            </View>
          </TouchableOpacity>
        )}

        {/* Feature grid */}
        <View style={styles.grid}>
          {tiles.map((tile) => (
            <TouchableOpacity
              key={tile.key}
              style={styles.tile}
              onPress={tile.onPress}
              activeOpacity={0.85}
            >
              {tile.comingSoon && (
                <View style={styles.soonBadge}>
                  <Text style={styles.soonBadgeText}>
                    {language === 'ur' ? 'جلد' : 'SOON'}
                  </Text>
                </View>
              )}
              {tile.key === 'bookmarks' && bookmarks.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{bookmarks.length}</Text>
                </View>
              )}
              <Text style={styles.tileIcon}>{tile.icon}</Text>
              <Text style={styles.tileLabel}>
                {language === 'ur' ? tile.labelUrdu : tile.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const TILE_GAP = spacing.cardGap;

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: theme.bgPage,
  },
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.pagePadding,
    paddingBottom: spacing.sectionGap * 2,
    gap: spacing.cardGap,
  },
  banner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: colors.primary[800],
    borderRadius: borderRadius.card,
    padding: spacing.cardPaddingLg,
    borderWidth: 1,
    borderColor: colors.gold[500],
    ...shadows.sm,
  },
  bannerTextBox: {
    gap: spacing[3],
  },
  bannerArabic: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.arabic.md,
    color: colors.neutral[0],
  },
  bannerBtn: {
    alignSelf: 'flex-start',
    backgroundColor: colors.gold[600],
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[2],
  },
  bannerBtnText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary[900],
  },
  bannerEmblem: {
    fontSize: 48,
  },
  continueCard: {
    backgroundColor: theme.bgCard,
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: colors.primary[100],
    ...shadows.sm,
  },
  continueRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  continueIcon: {
    fontSize: 22,
  },
  continueTextBox: {
    flex: 1,
  },
  continueLabel: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.semibold,
    color: theme.textBrandGreen,
    marginBottom: 2,
  },
  continueSurah: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.bold,
    color: theme.textPrimary,
  },
  textRTL: {
    textAlign: 'right',
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: TILE_GAP,
  },
  tile: {
    width: '48%',
    aspectRatio: 1.4,
    backgroundColor: theme.bgCard,
    borderRadius: borderRadius.card,
    borderWidth: 1,
    borderColor: theme.border,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing[2],
    ...shadows.sm,
  },
  tileIcon: {
    fontSize: 30,
  },
  tileLabel: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.base,
    fontWeight: typography.fontWeight.semibold,
    color: theme.textPrimary,
    textAlign: 'center',
  },
  soonBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    backgroundColor: colors.gold[200],
    borderRadius: borderRadius.badge,
    paddingHorizontal: 6,
    paddingVertical: 2,
  },
  soonBadgeText: {
    fontFamily: typography.fontFamily.english,
    fontSize: 9,
    fontWeight: typography.fontWeight.bold,
    color: colors.gold[600],
  },
  countBadge: {
    position: 'absolute',
    top: spacing[2],
    right: spacing[2],
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: colors.primary[600],
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 5,
  },
  countBadgeText: {
    fontFamily: typography.fontFamily.english,
    fontSize: 11,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
});
