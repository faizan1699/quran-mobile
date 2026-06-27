import React, { useMemo } from 'react';
import { StyleSheet, View, ScrollView, Text, TouchableOpacity } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { FlashesCarousel } from '@/components/FlashesCarousel';
import { FlashBannerCarousel } from '@/components/FlashBannerCarousel';
import { PopupModal } from '@/components/PopupModal';
import { FadeInView } from '@/components/FadeInView';
import { HeroDateBar } from '@/components/HeroDateBar';
import { HomeFeatureTabs } from '@/components/HomeFeatureTabs';
import { PrayerTimesCard } from '@/components/PrayerTimesCard';
import { Flash } from '@/data/flashes';
import { spacing, typography, borderRadius, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

export default function HomeScreen(): React.JSX.Element {
  const { t, isRTL } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  // Route each flash CTA to a sensible destination.
  const handleFlashPress = (flash: Flash) => {
    switch (flash.kind) {
      case 'reminder':
        navigation.navigate('MainTabs', {
          screen: 'IbadaatStack',
          params: { screen: 'Duaa' },
        } as never);
        break;
      case 'verse':
      case 'announcement':
      case 'event':
      default:
        navigation.navigate('MainTabs', { screen: 'QuranStack' } as never);
        break;
    }
  };

  const quickLinks = [
    {
      icon: '📖',
      label: t('tabs.quran'),
      onPress: () => navigation.navigate('MainTabs', { screen: 'QuranStack' } as never),
    },
    {
      icon: '🧭',
      label: t('tabs.qibla'),
      onPress: () =>
        navigation.navigate('MainTabs', {
          screen: 'IbadaatStack',
          params: { screen: 'Qibla' },
        } as never),
    },
    {
      icon: '📚',
      label: t('tabs.hadith'),
      onPress: () => navigation.navigate('MainTabs', { screen: 'HadithStack' } as never),
    },
    {
      icon: '🤲',
      label: t('tabs.duaa'),
      onPress: () =>
        navigation.navigate('MainTabs', {
          screen: 'IbadaatStack',
          params: { screen: 'Duaa' },
        } as never),
    },
  ];

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <GlobalHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero: today's Gregorian + Hijri date */}
        <FadeInView style={styles.section} offsetY={12}>
          <HeroDateBar />
        </FadeInView>

        {/* Auto-rotating Flashes carousel */}
        <FadeInView style={styles.section} delay={80} offsetY={12}>
          <FlashesCarousel onFlashPress={handleFlashPress} />
        </FadeInView>

        <FadeInView style={styles.section} delay={120} offsetY={12}>
          <FlashBannerCarousel />
        </FadeInView>

        {/* Feature switcher: Quran / Hadith / Dua */}
        <FadeInView style={styles.section} delay={160}>
          <HomeFeatureTabs />
        </FadeInView>

        {/* Prayer Times Card */}
        <FadeInView style={styles.section} delay={240}>
          <PrayerTimesCard />
        </FadeInView>

        {/* Quick Links Section */}
        <FadeInView style={styles.quickLinksSection} delay={320}>
          <Text style={[styles.sectionTitle, isRTL && styles.textRTL]}>
            {t('home.quickLinks')}
          </Text>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={[
              styles.horizontalScroll,
              isRTL && styles.horizontalScrollRTL,
            ]}
          >
            {quickLinks.map((link) => (
              <TouchableOpacity
                key={link.label}
                style={styles.quickLinkTile}
                onPress={link.onPress}
                activeOpacity={0.8}
              >
                <Text style={styles.tileIcon}>{link.icon}</Text>
                <Text style={styles.tileLabel}>{link.label}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </FadeInView>
      </ScrollView>

      <PopupModal />
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bgHeader,
    },
    container: {
      flex: 1,
      backgroundColor: theme.bgPageAlt,
    },
    contentContainer: {
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing.cardGap,
      paddingBottom: spacing.sectionGap * 2,
      gap: spacing.sectionGap,
    },
    section: {
      width: '100%',
    },
    quickLinksSection: {
      width: '100%',
      marginTop: spacing[2],
    },
    sectionTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textOnDark,
      marginBottom: spacing[3],
    },
    textRTL: {
      textAlign: 'right',
    },
    horizontalScroll: {
      gap: spacing.cardGap,
      paddingRight: spacing.pagePadding,
    },
    horizontalScrollRTL: {
      flexDirection: 'row-reverse',
    },
    quickLinkTile: {
      width: 110,
      height: 100,
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.cardLg,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[3],
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    tileIcon: {
      fontSize: 32,
      marginBottom: 6,
    },
    tileLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
      textAlign: 'center',
    },
  });
