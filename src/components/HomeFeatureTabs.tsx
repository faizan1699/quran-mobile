import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { FadeInView } from '@/components/FadeInView';
import { DailyAyahCard } from '@/components/DailyAyahCard';
import { HadithOfDayCard } from '@/components/HadithOfDayCard';
import { DuaOfMomentCard } from '@/components/DuaOfMomentCard';
import { IslamicDateCard } from '@/components/IslamicDateCard';
import { colors, spacing, borderRadius, typography } from '@/tokens';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

type FeatureKey = 'quran' | 'hadith' | 'dua' | 'calendar';

interface FeatureTab {
  key: FeatureKey;
  labelKey: string;
  icon: string;
  iconActive: string;
}

const TABS: FeatureTab[] = [
  { key: 'quran', labelKey: 'tabs.quran', icon: 'book-outline', iconActive: 'book' },
  { key: 'hadith', labelKey: 'tabs.hadith', icon: 'library-outline', iconActive: 'library' },
  { key: 'dua', labelKey: 'tabs.duaa', icon: 'hand-left-outline', iconActive: 'hand-left' },
  { key: 'calendar', labelKey: 'tabs.calendar', icon: 'calendar-outline', iconActive: 'calendar' },
];

/**
 * Islam360-style feature switcher: a row of category toggles whose selection
 * swaps the content card shown below (Quran ayah / Hadith / Dua / Islamic date).
 */
export function HomeFeatureTabs(): React.JSX.Element {
  const { t, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [active, setActive] = useState<FeatureKey>('quran');

  return (
    <View>
      <View style={[styles.tabRow, isRTL && styles.tabRowRTL]}>
        {TABS.map((tab) => {
          const isActive = active === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tab, isActive && styles.tabActive]}
              onPress={() => setActive(tab.key)}
              activeOpacity={0.85}
              accessibilityRole="tab"
              accessibilityState={{ selected: isActive }}
            >
              <Ionicons
                name={isActive ? tab.iconActive : tab.icon}
                size={20}
                color={isActive ? colors.neutral[0] : theme.textSecondary}
              />
              <Text
                style={[styles.tabLabel, isActive && styles.tabLabelActive]}
                numberOfLines={1}
              >
                {t(tab.labelKey)}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FadeInView key={active} style={styles.content} offsetY={10}>
        {active === 'quran' && <DailyAyahCard />}
        {active === 'hadith' && <HadithOfDayCard />}
        {active === 'dua' && <DuaOfMomentCard />}
        {active === 'calendar' && <IslamicDateCard />}
      </FadeInView>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    tabRow: {
      flexDirection: 'row',
      gap: spacing[2],
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)',
      borderRadius: borderRadius.full,
      padding: 5,
      borderWidth: 1,
      borderColor: 'rgba(212, 185, 106, 0.25)',
    },
    tabRowRTL: {
      flexDirection: 'row-reverse',
    },
    tab: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 5,
      paddingVertical: 9,
      borderRadius: borderRadius.full,
    },
    tabActive: {
      backgroundColor: theme.accentGreen,
    },
    tabLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: 'rgba(255,255,255,0.75)',
    },
    tabLabelActive: {
      color: colors.neutral[0],
    },
    content: {
      marginTop: spacing[4],
    },
  });

export default HomeFeatureTabs;
