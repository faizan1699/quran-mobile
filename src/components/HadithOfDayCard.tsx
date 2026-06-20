import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Share } from 'react-native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';

interface HadithItem {
  title: string;
  titleUrdu: string;
  excerpt: string;
  excerptUrdu: string;
  narrator: string;
  narratorUrdu: string;
}

const MOCK_HADITH: HadithItem = {
  title: 'Hadith of the Day',
  titleUrdu: 'آج کی حدیث',
  excerpt: '"Avoid jealousy, for it destroys good deeds as fire destroys wood."',
  excerptUrdu: '"حسد سے بچو، کیونکہ حسد نیکیوں کو اس طرح کھا جاتا ہے جیسے آگ لکڑی کو کھا جاتی ہے۔"',
  narrator: 'Narrated by Abu Hurairah (Sunan Abi Dawud)',
  narratorUrdu: 'ابو ہریرہ رضی اللہ عنہ سے روایت ہے (سنن ابی داؤد)',
};

export function HadithOfDayCard(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const handleShare = async () => {
    const textToShare = language === 'ur'
      ? `${MOCK_HADITH.titleUrdu}\n\n${MOCK_HADITH.excerptUrdu}\n\n— ${MOCK_HADITH.narratorUrdu}\n\n(Taleem ul Quran App)`
      : `${MOCK_HADITH.title}\n\n${MOCK_HADITH.excerpt}\n\n— ${MOCK_HADITH.narrator}\n\n(Taleem ul Quran App)`;

    try {
      await Share.share({
        message: textToShare,
      });
    } catch (error) {
      console.error('Error sharing Hadith:', error);
    }
  };

  const title = language === 'ur' ? MOCK_HADITH.titleUrdu : MOCK_HADITH.title;
  const excerpt = language === 'ur' ? MOCK_HADITH.excerptUrdu : MOCK_HADITH.excerpt;
  const narrator = language === 'ur' ? MOCK_HADITH.narratorUrdu : MOCK_HADITH.narrator;

  return (
    <View style={styles.card}>
      <Text style={[styles.title, isRTL && styles.textRTL]}>{title}</Text>
      
      <Text style={[styles.excerpt, isRTL && styles.excerptRTL]}>
        {excerpt}
      </Text>
      
      <Text style={[styles.narrator, isRTL && styles.textRTL]}>
        {narrator}
      </Text>

      <View style={[styles.footer, isRTL && styles.footerRTL]}>
        <TouchableOpacity 
          style={styles.shareButton} 
          onPress={handleShare}
          activeOpacity={0.8}
        >
          <Text style={styles.shareIcon}>🔗</Text>
          <Text style={styles.shareText}>{t('home.share')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.cardLg, // 16
      padding: spacing.cardPadding, // 16
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    title: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xl, // 18
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
      marginBottom: spacing[2],
    },
    excerpt: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md, // 15
      lineHeight: typography.fontSize.md * typography.lineHeight.normal,
      color: theme.textSecondary,
      fontStyle: 'italic',
      marginVertical: spacing[2],
    },
    excerptRTL: {
      fontFamily: typography.fontFamily.urdu,
      fontSize: typography.fontSize.lg,
      lineHeight: typography.fontSize.lg * 1.6,
      textAlign: 'right',
    },
    narrator: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm, // 13
      color: theme.textMuted,
      marginTop: spacing[2],
    },
    textRTL: {
      textAlign: 'right',
    },
    footer: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      marginTop: spacing[3],
      borderTopWidth: 1,
      borderTopColor: theme.borderDivider,
      paddingTop: spacing[3],
    },
    footerRTL: {
      flexDirection: 'row-reverse',
    },
    shareButton: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.isDark ? 'rgba(201,168,76,0.15)' : colors.gold[200],
      paddingHorizontal: 12,
      paddingVertical: 6,
      borderRadius: borderRadius.full,
      gap: 4,
      borderWidth: 1,
      borderColor: colors.gold[500],
    },
    shareIcon: {
      fontSize: 12,
      color: colors.gold[600],
    },
    shareText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.isDark ? colors.gold[400] : colors.primary[900],
      fontWeight: 'bold',
    },
  });

export default HadithOfDayCard;
