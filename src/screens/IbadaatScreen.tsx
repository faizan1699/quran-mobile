import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { PrayerTimesCard } from '@/components/PrayerTimesCard';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';

interface Tile {
  key: string;
  icon: string;
  label: string;
  labelUrdu: string;
  onPress: () => void;
  comingSoon?: boolean;
}

export default function IbadaatScreen(): React.JSX.Element {
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<any>();

  const tiles: Tile[] = [
    {
      key: 'qibla',
      icon: '🧭',
      label: 'Qibla',
      labelUrdu: 'قبلہ',
      onPress: () => navigation.navigate('Qibla'),
    },
    {
      key: 'duaa',
      icon: '🤲',
      label: 'Supplications',
      labelUrdu: 'دعائیں',
      onPress: () => navigation.navigate('Duaa'),
    },
    {
      key: 'tasbeeh',
      icon: '📿',
      label: 'Tasbeeh',
      labelUrdu: 'تسبیح',
      onPress: () => navigation.navigate('Tasbeeh'),
    },
    {
      key: 'hajj',
      icon: '🕋',
      label: 'Hajj Guide',
      labelUrdu: 'حج',
      onPress: () => navigation.navigate('Guide', { guideId: 'hajj' }),
    },
    {
      key: 'umrah',
      icon: '🕌',
      label: 'Umrah Guide',
      labelUrdu: 'عمرہ',
      onPress: () => navigation.navigate('Guide', { guideId: 'umrah' }),
    },
    {
      key: 'fasting',
      icon: '🌙',
      label: 'Fasting',
      labelUrdu: 'روزہ',
      onPress: () => navigation.navigate('Guide', { guideId: 'fasting' }),
    },
    {
      key: 'names',
      icon: '🟡',
      label: 'Allah Names',
      labelUrdu: 'اسمائے حسنیٰ',
      onPress: () => navigation.navigate('AllahNames'),
    },
    {
      key: 'janaza',
      icon: '🕊',
      label: 'Namaz-e-Janaza',
      labelUrdu: 'نمازِ جنازہ',
      onPress: () => navigation.navigate('Guide', { guideId: 'janaza' }),
    },
  ];

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.heading}>{t('tabs.ibadaat')}</Text>

        {/* Live prayer times */}
        <PrayerTimesCard />

        {/* Grid */}
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
  heading: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xl,
    fontWeight: typography.fontWeight.bold,
    color: theme.textPrimary,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    rowGap: spacing.cardGap,
    marginTop: spacing[2],
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
});
