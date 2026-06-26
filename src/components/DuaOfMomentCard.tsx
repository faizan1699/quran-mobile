import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';

interface DuaItem {
  id: string;
  arabic: string;
  english: string;
  urdu: string;
  reference: string;
  referenceUrdu: string;
}

const DUAS_DATA: DuaItem[] = [
  {
    id: 'd1',
    arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً',
    english: 'Our Lord, give us good in this world and good in the Hereafter.',
    urdu: 'اے ہمارے رب! ہمیں دنیا میں بھی بھلائی دے اور آخرت میں بھی بھلائی دے۔',
    reference: 'Al-Baqarah 2:201',
    referenceUrdu: 'البقرہ ۲:۲۰۱',
  },
  {
    id: 'd2',
    arabic: 'رَبِّ زِدْنِي عِلْمًا',
    english: 'My Lord, increase me in knowledge.',
    urdu: 'اے میرے رب! میرے علم میں اضافہ فرما۔',
    reference: 'Ta-Ha 20:114',
    referenceUrdu: 'طٰہٰ ۲۰:۱۱۴',
  },
  {
    id: 'd3',
    arabic: 'حَسْبُنَا اللَّهُ وَنِعْمَ الْوَكِيلُ',
    english: 'Allah is sufficient for us, and He is the best disposer of affairs.',
    urdu: 'ہمیں اللہ کافی ہے اور وہ بہترین کارساز ہے۔',
    reference: 'Aal-i-Imran 3:173',
    referenceUrdu: 'آل عمران ۳:۱۷۳',
  },
];

export function DuaOfMomentCard(): React.JSX.Element {
  const { language } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeIndex, setActiveIndex] = useState(0);

  const dua = DUAS_DATA[activeIndex];
  const translation = language === 'ur' ? dua.urdu : dua.english;
  const reference = language === 'ur' ? dua.referenceUrdu : dua.reference;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.title}>
          {language === 'ur' ? 'دعا' : 'Dua of the Moment'}
        </Text>
      </View>

      <Text style={styles.arabic} numberOfLines={3}>
        {dua.arabic}
      </Text>

      <Text style={[styles.translation, language === 'ur' && styles.translationUrdu]}>
        {translation}
      </Text>

      <View style={styles.footer}>
        <Text style={styles.reference}>{reference}</Text>
        <View style={styles.dotsContainer}>
          {DUAS_DATA.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[styles.dot, activeIndex === index && styles.activeDot]}
              onPress={() => setActiveIndex(index)}
              activeOpacity={0.7}
              accessibilityLabel={`View dua ${index + 1}`}
            />
          ))}
        </View>
      </View>
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
      ...shadows.card,
    },
    header: {
      marginBottom: spacing[3],
    },
    title: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textBrandGreen,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    arabic: {
      fontFamily: typography.fontFamily.arabic,
      fontSize: typography.fontSize.arabic.md,
      lineHeight: typography.fontSize.arabic.md * typography.lineHeight.arabic,
      color: theme.textArabic,
      textAlign: 'center',
      writingDirection: 'rtl',
      marginVertical: spacing[3],
    },
    translation: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: typography.fontSize.base * typography.lineHeight.normal,
      marginBottom: spacing[4],
    },
    translationUrdu: {
      fontFamily: typography.fontFamily.urdu,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg * typography.lineHeight.urdu,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: theme.borderDivider,
      paddingTop: spacing[3],
    },
    reference: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textGold,
      fontWeight: typography.fontWeight.semibold,
    },
    dotsContainer: {
      flexDirection: 'row',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.border,
    },
    activeDot: {
      width: 14,
      backgroundColor: theme.isDark ? colors.gold[500] : theme.accentGreen,
    },
  });

export default DuaOfMomentCard;
