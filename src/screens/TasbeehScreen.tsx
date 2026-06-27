import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Vibration,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { BackButton } from '@/components/BackButton';
import { useTasbeehStore } from '@/store/useTasbeehStore';
import { adhkar } from '@/data/adhkar';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

const TARGET_PRESETS = [33, 99, 100];

export default function TasbeehScreen(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const count = useTasbeehStore((s) => s.count);
  const target = useTasbeehStore((s) => s.target);
  const rounds = useTasbeehStore((s) => s.rounds);
  const lifetimeTotal = useTasbeehStore((s) => s.lifetimeTotal);
  const dhikrIndex = useTasbeehStore((s) => s.dhikrIndex);
  const vibrationEnabled = useTasbeehStore((s) => s.vibrationEnabled);
  const increment = useTasbeehStore((s) => s.increment);
  const decrement = useTasbeehStore((s) => s.decrement);
  const resetCount = useTasbeehStore((s) => s.resetCount);
  const selectDhikr = useTasbeehStore((s) => s.selectDhikr);
  const setTarget = useTasbeehStore((s) => s.setTarget);
  const toggleVibration = useTasbeehStore((s) => s.toggleVibration);

  const dhikr = adhkar[dhikrIndex] ?? adhkar[0];
  const progress = target > 0 ? Math.min(count / target, 1) : 0;

  const handleTap = () => {
    const completedLoop = increment();
    if (vibrationEnabled) {
      Vibration.vibrate(completedLoop ? [0, 60, 50, 60] : 12);
    }
  };

  const confirmReset = () => {
    if (count === 0 && rounds === 0) {
      return;
    }
    Alert.alert(
      language === 'ur' ? 'شمار صفر کریں؟' : 'Reset counter?',
      language === 'ur'
        ? 'موجودہ شمار اور راؤنڈز صفر ہو جائیں گے۔ کل تسبیحات محفوظ رہیں گی۔'
        : 'The current count and rounds will be cleared. Your lifetime total is kept.',
      [
        { text: language === 'ur' ? 'منسوخ' : 'Cancel', style: 'cancel' },
        {
          text: language === 'ur' ? 'صفر کریں' : 'Reset',
          style: 'destructive',
          onPress: resetCount,
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <GlobalHeader />

      <View style={[styles.subHeader, isRTL && styles.rowRTL]}>
        <TouchableOpacity
          style={[styles.iconButton, isRTL && styles.rowRTL]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel={language === 'ur' ? 'واپس' : 'Back'}
        >
          <Text style={styles.iconButtonText}>{isRTL ? '▶' : '◀'}</Text>
          <Text style={styles.backText}>{language === 'ur' ? 'واپس' : 'Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('tasbeeh.title')}</Text>

        <TouchableOpacity
          style={styles.resetPill}
          onPress={confirmReset}
          activeOpacity={0.7}
        >
          <Text style={styles.resetPillText}>{t('tasbeeh.reset')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.chipsRow}
        >
          {adhkar.map((item, index) => {
            const active = index === dhikrIndex;
            return (
              <TouchableOpacity
                key={item.id}
                style={[styles.chip, active && styles.chipActive]}
                onPress={() => selectDhikr(index)}
                activeOpacity={0.8}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {item.arabic}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.dhikrCard}>
          <Text style={styles.dhikrArabic}>{dhikr.arabic}</Text>
          <Text style={styles.dhikrTranslit}>{dhikr.transliteration}</Text>
          <Text
            style={[styles.dhikrMeaning, language === 'ur' && styles.dhikrMeaningUrdu]}
          >
            {language === 'ur' ? dhikr.meaningUr : dhikr.meaningEn}
          </Text>
        </View>

        <View style={[styles.statsRow, isRTL && styles.rowRTL]}>
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{rounds}</Text>
            <Text style={styles.statLabel}>{t('tasbeeh.rounds')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{target}</Text>
            <Text style={styles.statLabel}>{t('tasbeeh.target')}</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statBox}>
            <Text style={styles.statValue}>{lifetimeTotal}</Text>
            <Text style={styles.statLabel}>{t('tasbeeh.lifetime')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.counterButton}
          onPress={handleTap}
          activeOpacity={0.85}
          accessibilityLabel={t('tasbeeh.tapToCount')}
        >
          <Text style={styles.counterValue}>{count}</Text>
          <Text style={styles.counterTarget}>/ {target}</Text>
          <Text style={styles.tapHint}>{t('tasbeeh.tapToCount')}</Text>
        </TouchableOpacity>

        <View style={styles.progressTrack}>
          <View style={[styles.progressFill, { width: `${progress * 100}%` }]} />
        </View>

        <View style={[styles.controlsRow, isRTL && styles.rowRTL]}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={decrement}
            activeOpacity={0.8}
          >
            <Text style={styles.controlIcon}>−1</Text>
            <Text style={styles.controlLabel}>{t('tasbeeh.undo')}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.controlButton, vibrationEnabled && styles.controlButtonActive]}
            onPress={toggleVibration}
            activeOpacity={0.8}
          >
            <Text style={[styles.controlIcon, vibrationEnabled && styles.controlIconActive]}>
              {vibrationEnabled ? '📳' : '🔕'}
            </Text>
            <Text style={[styles.controlLabel, vibrationEnabled && styles.controlLabelActive]}>
              {t('tasbeeh.vibration')}
            </Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.sectionLabel}>{t('tasbeeh.setTarget')}</Text>
        <View style={[styles.presetsRow, isRTL && styles.rowRTL]}>
          {TARGET_PRESETS.map((preset) => {
            const active = target === preset;
            return (
              <TouchableOpacity
                key={preset}
                style={[styles.presetChip, active && styles.presetChipActive]}
                onPress={() => setTarget(preset)}
                activeOpacity={0.8}
              >
                <Text style={[styles.presetText, active && styles.presetTextActive]}>
                  {preset}
                </Text>
              </TouchableOpacity>
            );
          })}
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
    iconButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minWidth: 64,
    },
    iconButtonText: {
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
    resetPill: {
      minWidth: 64,
      alignItems: 'flex-end',
    },
    resetPillText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: colors.status.error,
      fontWeight: typography.fontWeight.semibold,
    },
    container: {
      flex: 1,
    },
    content: {
      padding: spacing.pagePadding,
      paddingBottom: spacing.sectionGap * 2,
      gap: spacing.cardGap,
    },
    chipsRow: {
      gap: spacing[2],
      paddingVertical: spacing[1],
    },
    chip: {
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.full,
      backgroundColor: theme.bgMuted,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipActive: {
      backgroundColor: theme.accentGreen,
      borderColor: theme.accentGreen,
    },
    chipText: {
      fontFamily: typography.fontFamily.arabic,
      fontSize: typography.fontSize.lg,
      color: theme.textSecondary,
      writingDirection: 'rtl',
    },
    chipTextActive: {
      color: colors.neutral[0],
    },
    dhikrCard: {
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      padding: spacing.cardPaddingLg,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      gap: spacing[2],
      ...shadows.sm,
    },
    dhikrArabic: {
      fontFamily: typography.fontFamily.arabic,
      fontSize: typography.fontSize.arabic.md,
      lineHeight: typography.fontSize.arabic.md * typography.lineHeight.arabic,
      color: theme.textArabic,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
    dhikrTranslit: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textGold,
    },
    dhikrMeaning: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
    },
    dhikrMeaningUrdu: {
      fontFamily: typography.fontFamily.urdu,
      writingDirection: 'rtl',
      lineHeight: 26,
    },
    statsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-around',
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: spacing[3],
      ...shadows.sm,
    },
    statBox: {
      flex: 1,
      alignItems: 'center',
      gap: 2,
    },
    statDivider: {
      width: 1,
      height: 28,
      backgroundColor: theme.borderDivider,
    },
    statValue: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    statLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      textTransform: 'uppercase',
    },
    counterButton: {
      alignSelf: 'center',
      width: 220,
      height: 220,
      borderRadius: 110,
      backgroundColor: theme.accentGreen,
      borderWidth: 4,
      borderColor: colors.gold[500],
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing[2],
      ...shadows.lg,
    },
    counterValue: {
      fontFamily: typography.fontFamily.english,
      fontSize: 72,
      fontWeight: typography.fontWeight.bold,
      color: colors.neutral[0],
      lineHeight: 80,
    },
    counterTarget: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      color: colors.gold[400],
      fontWeight: typography.fontWeight.semibold,
    },
    tapHint: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: 'rgba(255,255,255,0.6)',
      marginTop: spacing[2],
      textTransform: 'uppercase',
      letterSpacing: 1,
    },
    progressTrack: {
      height: 8,
      borderRadius: borderRadius.full,
      backgroundColor: theme.bgMuted,
      overflow: 'hidden',
      marginTop: spacing[2],
    },
    progressFill: {
      height: '100%',
      borderRadius: borderRadius.full,
      backgroundColor: colors.gold[500],
    },
    controlsRow: {
      flexDirection: 'row',
      gap: spacing.cardGap,
      marginTop: spacing[2],
    },
    controlButton: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.button,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: spacing[3],
    },
    controlButtonActive: {
      borderColor: theme.accentGreen,
    },
    controlIcon: {
      fontSize: 18,
      color: theme.textSecondary,
      fontWeight: typography.fontWeight.bold,
    },
    controlIconActive: {
      color: theme.textPrimary,
    },
    controlLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    controlLabelActive: {
      color: theme.textPrimary,
    },
    sectionLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
      marginTop: spacing[2],
    },
    presetsRow: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    presetChip: {
      flex: 1,
      alignItems: 'center',
      paddingVertical: spacing[3],
      borderRadius: borderRadius.button,
      backgroundColor: theme.bgMuted,
      borderWidth: 1,
      borderColor: theme.border,
    },
    presetChipActive: {
      backgroundColor: colors.gold[200],
      borderColor: colors.gold[500],
    },
    presetText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
    },
    presetTextActive: {
      color: colors.gold[600],
    },
  });
