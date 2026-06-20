import React, { useMemo } from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { gregorianToHijri } from '@/utils/hijri';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

const WEEKDAYS_EN = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
const WEEKDAYS_UR = ['اتوار', 'پیر', 'منگل', 'بدھ', 'جمعرات', 'جمعہ', 'ہفتہ'];
const MONTHS_EN = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

/** Calendar-tab content: prominent Hijri date with the Gregorian date below. */
export function IslamicDateCard(): React.JSX.Element {
  const { language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const now = new Date();
  const hijri = gregorianToHijri(now);
  const weekday = (language === 'ur' ? WEEKDAYS_UR : WEEKDAYS_EN)[now.getDay()];
  const monthName = language === 'ur' ? hijri.monthNameUrdu : hijri.monthName;
  const gregorian = `${weekday}, ${now.getDate()} ${MONTHS_EN[now.getMonth()]} ${now.getFullYear()}`;
  const isFriday = now.getDay() === 5;

  return (
    <View style={styles.card}>
      <View style={[styles.header, isRTL && styles.rowRTL]}>
        <Ionicons name="calendar" size={16} color={theme.textBrandGreen} />
        <Text style={styles.headerText}>
          {language === 'ur' ? 'اسلامی تاریخ' : 'Islamic Date'}
        </Text>
      </View>

      <Text style={[styles.bigDay, language === 'ur' && styles.urduFont]}>{hijri.day}</Text>
      <Text style={[styles.monthYear, language === 'ur' && styles.urduFont]}>
        {monthName} {hijri.year} {language === 'ur' ? 'ھ' : 'AH'}
      </Text>

      <View style={styles.divider} />

      <Text style={[styles.gregorian, language === 'ur' && styles.gregorianUrdu]}>
        {language === 'ur' ? `${weekday}، ${now.getDate()} ${MONTHS_EN[now.getMonth()]} ${now.getFullYear()}` : gregorian}
      </Text>

      {isFriday ? (
        <View style={[styles.eventPill, isRTL && styles.rowRTL]}>
          <Ionicons name="sparkles" size={13} color={colors.gold[600]} />
          <Text style={[styles.eventText, language === 'ur' && styles.urduFontSm]}>
            {language === 'ur' ? 'جمعہ مبارک — سورہ الکہف پڑھیں' : "Jumu'ah Mubarak — read Surah Al-Kahf"}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.cardLg,
      padding: spacing.cardPaddingLg,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      ...shadows.card,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      alignSelf: 'flex-start',
      marginBottom: spacing[3],
    },
    rowRTL: {
      flexDirection: 'row-reverse',
      alignSelf: 'flex-end',
    },
    headerText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textBrandGreen,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    bigDay: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize['4xl'] + 16,
      fontWeight: typography.fontWeight.extrabold,
      color: theme.textGold,
      lineHeight: (typography.fontSize['4xl'] + 16) * 1.1,
    },
    monthYear: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
      marginTop: spacing[1],
      textAlign: 'center',
    },
    urduFont: {
      fontFamily: typography.fontFamily.urdu,
    },
    urduFontSm: {
      fontFamily: typography.fontFamily.urdu,
      fontSize: typography.fontSize.base,
    },
    divider: {
      height: 1,
      alignSelf: 'stretch',
      backgroundColor: theme.borderDivider,
      marginVertical: spacing[3],
    },
    gregorian: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    gregorianUrdu: {
      fontFamily: typography.fontFamily.urdu,
      fontSize: typography.fontSize.lg,
    },
    eventPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      marginTop: spacing[3],
      backgroundColor: theme.isDark ? 'rgba(201,168,76,0.15)' : colors.gold[200],
      borderRadius: borderRadius.full,
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
      borderWidth: 1,
      borderColor: 'rgba(201,168,76,0.4)',
    },
    eventText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.isDark ? colors.gold[400] : colors.primary[900],
    },
  });

export default IslamicDateCard;
