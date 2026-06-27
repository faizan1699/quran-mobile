import React, { useMemo, useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { ShareButton } from '@/components/share/ShareButton';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';

interface AyahItem {
  id: string;
  arabic: string;
  english: string;
  urdu: string;
  reference: string;
  dayCount: number;
}

const AYAHS_DATA: AyahItem[] = [
  {
    id: 'a1',
    arabic: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ',
    english: 'It is You we worship and You we ask for help.',
    urdu: 'ہم تیری ہی عبادت کرتے ہیں اور تجھ ہی سے مدد مانگتے ہیں۔',
    reference: 'Al-Fatiha 1:5',
    dayCount: 172,
  },
  {
    id: 'a2',
    arabic: 'وَإِذَا سَأَلَكَ عِبَادِي عَنِّي فَإِنِّي قَرِيبٌ',
    english: 'And when My servants ask you concerning Me, indeed I am near.',
    urdu: 'اور جب میرے بندے آپ سے میرے بارے میں پوچھیں، تو یقیناً میں قریب ہوں۔',
    reference: 'Al-Baqarah 2:186',
    dayCount: 173,
  },
  {
    id: 'a3',
    arabic: 'لَا يُكَلِّفُ اللَّهُ نَفْسًا إِلَّا وُسْعَهَا',
    english: 'Allah does not burden a soul beyond that it can bear.',
    urdu: 'اللہ کسی جان پر اس کی طاقت سے زیادہ بوجھ نہیں ڈالتا۔',
    reference: 'Al-Baqarah 2:286',
    dayCount: 174,
  }
];

export function DailyAyahCard(): React.JSX.Element {
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [activeIndex, setActiveIndex] = useState(0);

  const currentAyah = AYAHS_DATA[activeIndex];
  const translationText = language === 'ur' ? currentAyah.urdu : currentAyah.english;

  return (
    <View style={styles.card}>
      {/* Header Row */}
      <View style={styles.header}>
        <Text style={styles.title}>{t('home.dailyAyah')}</Text>
        <Text style={styles.dayCounter}>
          {language === 'ur' 
            ? `دن #${currentAyah.dayCount}` 
            : `Day #${currentAyah.dayCount}`}
        </Text>
      </View>

      {/* Arabic scripture text */}
      <Text style={styles.arabic} numberOfLines={3}>
        {currentAyah.arabic}
      </Text>

      <Text style={styles.translation}>
        {translationText}
      </Text>

      <View style={styles.footer}>
        {/* Reference tag */}
        <Text style={styles.reference}>
          {currentAyah.reference}
        </Text>

        {/* Carousel indicator dots */}
        <View style={styles.footerRight}>
          <ShareButton
            content={{
              kind: 'ayah',
              arabic: currentAyah.arabic,
              english: currentAyah.english,
              urdu: currentAyah.urdu,
              reference: currentAyah.reference,
            }}
            color={theme.textGold}
          />
          <View style={styles.dotsContainer}>
          {AYAHS_DATA.map((_, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.dot,
                activeIndex === index && styles.activeDot,
              ]}
              onPress={() => setActiveIndex(index)}
              activeOpacity={0.7}
              accessibilityLabel={`View ayah ${index + 1}`}
            />
          ))}
          </View>
        </View>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.bgCardAyah,
      borderRadius: borderRadius.cardLg, // 16
      padding: spacing.cardPaddingLg, // 20
      borderWidth: theme.isDark ? 1 : 0,
      borderColor: 'rgba(201, 168, 76, 0.25)',
      ...shadows.card,
    },
    header: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing[4],
    },
    title: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.isDark ? colors.gold[400] : colors.primary[900],
      textTransform: 'uppercase',
      letterSpacing: 0.5,
    },
    dayCounter: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textGold,
      fontWeight: typography.fontWeight.semibold,
    },
    arabic: {
      fontFamily: typography.fontFamily.arabic,
      fontSize: typography.fontSize.arabic.md, // 28
      lineHeight: typography.fontSize.arabic.md * typography.lineHeight.arabic,
      color: theme.isDark ? colors.neutral[0] : colors.neutral[900],
      textAlign: 'center',
      writingDirection: 'rtl',
      marginVertical: spacing[3],
    },
    translation: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base, // 14
      color: theme.isDark ? 'rgba(255,255,255,0.9)' : colors.primary[900],
      textAlign: 'center',
      lineHeight: typography.fontSize.base * typography.lineHeight.normal,
      marginBottom: spacing[4],
      opacity: 0.95,
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      borderTopWidth: 1,
      borderTopColor: 'rgba(201, 168, 76, 0.2)', // subtle gold divider
      paddingTop: spacing[3],
    },
    reference: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textGold,
      fontWeight: typography.fontWeight.semibold,
    },
    footerRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    dotsContainer: {
      flexDirection: 'row',
      gap: 6,
    },
    dot: {
      width: 6,
      height: 6,
      borderRadius: 3,
      backgroundColor: 'rgba(201, 168, 76, 0.4)',
    },
    activeDot: {
      width: 14,
      backgroundColor: theme.isDark ? colors.gold[500] : theme.accentGreen,
    },
  });

export default DailyAyahCard;
