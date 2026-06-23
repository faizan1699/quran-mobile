import React, { useMemo } from 'react';
import { StyleSheet, View, Text, ScrollView, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, useRoute, RouteProp, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { guides } from '@/data/guides';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';
import { RootStackParamList, IbadaatStackParamList } from '@/navigation/types';

export default function GuideScreen(): React.JSX.Element {
  const { language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const route = useRoute<RouteProp<IbadaatStackParamList, 'Guide'>>();

  const guide = guides[route.params.guideId];

  return (
    <SafeAreaView style={styles.safeArea}>
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

        <Text style={styles.title}>{language === 'ur' ? guide.titleUr : guide.title}</Text>

        <View style={styles.backButton} />
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.introCard}>
          <Text style={styles.introIcon}>{guide.icon}</Text>
          <Text
            style={[styles.introText, language === 'ur' && styles.introTextUrdu]}
          >
            {language === 'ur' ? guide.introUr : guide.intro}
          </Text>
        </View>

        {guide.sections.map((section, index) => {
          const heading = language === 'ur' ? section.headingUr : section.heading;
          const body = language === 'ur' ? section.bodyUr : section.body;
          const translation =
            language === 'ur' ? section.translationUr : section.translationEn;

          return (
            <View key={`${guide.id}-${index}`} style={styles.sectionCard}>
              <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>{heading}</Text>

              {body ? (
                <Text style={[styles.sectionBody, language === 'ur' && styles.sectionBodyUrdu]}>
                  {body}
                </Text>
              ) : null}

              {section.arabic ? (
                <View style={styles.duaBlock}>
                  <Text style={styles.duaArabic}>{section.arabic}</Text>
                  {section.transliteration ? (
                    <Text style={styles.duaTranslit}>{section.transliteration}</Text>
                  ) : null}
                  {translation ? (
                    <Text
                      style={[styles.duaTranslation, language === 'ur' && styles.duaTranslationUrdu]}
                    >
                      {translation}
                    </Text>
                  ) : null}
                </View>
              ) : null}
            </View>
          );
        })}
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
    textRTL: {
      textAlign: 'right',
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
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.pagePadding,
      paddingBottom: spacing.sectionGap * 2,
      gap: spacing.cardGap,
    },
    introCard: {
      backgroundColor: theme.bgCardPrayer,
      borderRadius: borderRadius.card,
      padding: spacing.cardPaddingLg,
      alignItems: 'center',
      gap: spacing[3],
      ...shadows.sm,
    },
    introIcon: {
      fontSize: 36,
    },
    introText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: colors.neutral[0],
      textAlign: 'center',
      lineHeight: 22,
    },
    introTextUrdu: {
      fontFamily: typography.fontFamily.urdu,
      writingDirection: 'rtl',
      lineHeight: 30,
    },
    sectionCard: {
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: theme.border,
      gap: spacing[2],
      ...shadows.sm,
    },
    sectionHeading: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textBrandGreen,
    },
    sectionBody: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      lineHeight: 21,
    },
    sectionBodyUrdu: {
      fontFamily: typography.fontFamily.urdu,
      textAlign: 'right',
      writingDirection: 'rtl',
      lineHeight: 28,
    },
    duaBlock: {
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.md,
      borderWidth: 1,
      borderColor: colors.gold[400],
      padding: spacing.cardPadding,
      gap: spacing[2],
      marginTop: spacing[1],
    },
    duaArabic: {
      fontFamily: typography.fontFamily.arabic,
      fontSize: typography.fontSize.arabic.sm,
      lineHeight: typography.fontSize.arabic.sm * typography.lineHeight.arabic,
      color: theme.textArabic,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
    duaTranslit: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontStyle: 'italic',
      color: theme.textGold,
      textAlign: 'center',
    },
    duaTranslation: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
    },
    duaTranslationUrdu: {
      fontFamily: typography.fontFamily.urdu,
      writingDirection: 'rtl',
      lineHeight: 26,
    },
  });
