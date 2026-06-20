import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { gregorianToHijri } from '@/utils/hijri';
import { colors, spacing, borderRadius, typography } from '@/tokens';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_UR = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
const MONTHS_EN = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

/**
 * Home hero strip showing today's Gregorian date alongside the Hijri date.
 * Sits on the deep-green hero background, so it uses light-on-dark text.
 */
export function HeroDateBar(): React.JSX.Element {
  const { language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const now = new Date();
  const hijri = gregorianToHijri(now);

  const weekday = (language === 'ur' ? WEEKDAYS_UR : WEEKDAYS_EN)[now.getDay()];
  const gregorian =
    language === 'ur'
      ? `${weekday}، ${now.getDate()} ${MONTHS_EN[now.getMonth()]} ${now.getFullYear()}`
      : `${weekday}, ${now.getDate()} ${MONTHS_EN[now.getMonth()]} ${now.getFullYear()}`;

  const hijriText =
    language === 'ur'
      ? `${hijri.day} ${hijri.monthNameUrdu} ${hijri.year} ھ`
      : `${hijri.day} ${hijri.monthName} ${hijri.year} AH`;

  return (
    <View style={[styles.container, isRTL && styles.containerRTL]}>
      <View style={styles.iconCircle}>
        <Ionicons name="moon" size={18} color={colors.gold[400]} />
      </View>
      <View style={[styles.textCol, isRTL && styles.textColRTL]}>
        <Text
          style={[
            styles.hijri,
            language === 'ur' && styles.hijriUrdu,
            isRTL && styles.textRTL,
          ]}
        >
          {hijriText}
        </Text>
        <Text style={[styles.gregorian, isRTL && styles.textRTL]}>{gregorian}</Text>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      backgroundColor: theme.isDark ? 'rgba(255,255,255,0.06)' : 'rgba(255,255,255,0.10)',
      borderRadius: borderRadius.cardLg,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      borderWidth: 1,
      borderColor: 'rgba(212, 185, 106, 0.35)',
    },
    containerRTL: {
      flexDirection: 'row-reverse',
    },
    iconCircle: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: 'rgba(0,0,0,0.18)',
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: 'rgba(212, 185, 106, 0.5)',
    },
    textCol: {
      flex: 1,
      alignItems: 'flex-start',
    },
    textColRTL: {
      alignItems: 'flex-end',
    },
    hijri: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.gold[400],
    },
    hijriUrdu: {
      fontFamily: typography.fontFamily.urdu,
      fontSize: typography.fontSize.xl,
    },
    gregorian: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: 'rgba(255,255,255,0.85)',
      marginTop: 2,
    },
    textRTL: {
      textAlign: 'right',
    },
  });

export default HeroDateBar;
