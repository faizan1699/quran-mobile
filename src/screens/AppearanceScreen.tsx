import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { ACCENT_PRESETS, BACKGROUND_PRESETS } from '@/theme/appearancePresets';
import { normalizeHex, isValidHex, readableText } from '@/theme/colorUtils';
import { RootStackParamList } from '@/navigation/types';
import { usePreferencesStore, FontScale } from '@/store/usePreferencesStore';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppSwitch } from '@/components/AppSwitch';
import { borderRadius, spacing, typography, shadows } from '@/tokens';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

type Styles = ReturnType<typeof createStyles>;
type PickerTarget = 'accent' | 'background';

const FONT_SCALE_OPTIONS: { value: FontScale; labelKey: string; preview: number }[] = [
  { value: 'small', labelKey: 'settings.textSizeSmall', preview: 13 },
  { value: 'default', labelKey: 'settings.textSizeDefault', preview: 15 },
  { value: 'large', labelKey: 'settings.textSizeLarge', preview: 18 },
  { value: 'xlarge', labelKey: 'settings.textSizeXLarge', preview: 21 },
];

function sameColor(a: string | null, b: string | null): boolean {
  if (!a || !b) return a === b;
  return a.toUpperCase() === b.toUpperCase();
}

function Swatch({
  color,
  selected,
  onPress,
  styles,
  border,
}: {
  color: string;
  selected: boolean;
  onPress: () => void;
  styles: Styles;
  border: string;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[
        styles.swatch,
        { backgroundColor: color, borderColor: selected ? border : 'rgba(127,127,127,0.25)' },
        selected && styles.swatchSelected,
      ]}
      onPress={onPress}
      activeOpacity={0.8}
    >
      {selected ? (
        <Ionicons name="checkmark" size={16} color={readableText(color)} />
      ) : null}
    </TouchableOpacity>
  );
}

export default function AppearanceScreen(): React.JSX.Element {
  const { t, isRTL } = useTranslation();
  const {
    theme,
    mode,
    isDark,
    accentColor,
    backgroundColor,
    glass,
    setMode,
    setAccentColor,
    setBackgroundColor,
    setGlass,
    resetAppearance,
  } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const fontScale = usePreferencesStore((s) => s.fontScale);
  const setFontScale = usePreferencesStore((s) => s.setFontScale);

  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [hexInput, setHexInput] = useState('');
  const [originalColor, setOriginalColor] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web';
  const followSystem = mode === 'system';

  const accentInPresets = ACCENT_PRESETS.some((c) => sameColor(c, accentColor));
  const backgroundInPresets = BACKGROUND_PRESETS.some((c) =>
    sameColor(c, backgroundColor)
  );

  const applyTarget = (target: PickerTarget, color: string | null) => {
    if (target === 'accent') {
      setAccentColor(color);
    } else {
      setBackgroundColor(color);
    }
  };

  const openPicker = (target: PickerTarget) => {
    const current = target === 'accent' ? accentColor : backgroundColor;
    setOriginalColor(current);
    setHexInput(current ?? '#');
    setPickerTarget(target);
  };

  const commitLive = (value: string) => {
    if (!pickerTarget) return;
    const normalized = normalizeHex(value);
    if (normalized) {
      applyTarget(pickerTarget, normalized);
    }
  };

  const onHexChange = (text: string) => {
    setHexInput(text);
    commitLive(text);
  };

  const onWebColorChange = (value: string) => {
    setHexInput(value.toUpperCase());
    commitLive(value);
  };

  const cancelPicker = () => {
    if (pickerTarget) {
      applyTarget(pickerTarget, originalColor);
    }
    setPickerTarget(null);
  };

  const closePicker = () => setPickerTarget(null);

  const hexValid = isValidHex(hexInput);

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <TouchableOpacity
          style={[styles.backButton, isRTL && styles.rowRTL]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={18}
            color={theme.textBrandGreen}
          />
          <Text style={styles.backText}>{t('settings.title')}</Text>
        </TouchableOpacity>

        <Text style={[styles.screenTitle, isRTL && styles.textRTL]}>
          {t('theme.appearance')}
        </Text>

        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('settings.darkMode')}
          </Text>
          <View style={[styles.toggleRow, isRTL && styles.rowRTL]}>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleLabel, isRTL && styles.textRTL]}>
                {t('settings.darkMode')}
              </Text>
              <Text style={[styles.toggleDesc, isRTL && styles.textRTL]}>
                {t('settings.darkModeDesc')}
              </Text>
            </View>
            <AppSwitch
              value={isDark}
              onValueChange={(v) => setMode(v ? 'dark' : 'light')}
              disabled={followSystem}
              accessibilityLabel={t('settings.darkMode')}
            />
          </View>
          <View style={styles.divider} />
          <View style={[styles.toggleRow, isRTL && styles.rowRTL]}>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleLabel, isRTL && styles.textRTL]}>
                {t('settings.matchDevice')}
              </Text>
              <Text style={[styles.toggleDesc, isRTL && styles.textRTL]}>
                {t('settings.matchDeviceDesc')}
              </Text>
            </View>
            <AppSwitch
              value={followSystem}
              onValueChange={(v) => setMode(v ? 'system' : isDark ? 'dark' : 'light')}
              accessibilityLabel={t('settings.matchDevice')}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={[styles.sectionHeaderRow, isRTL && styles.rowRTL]}>
            <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
              {t('settings.accentColor')}
            </Text>
            <TouchableOpacity onPress={() => setAccentColor(null)} activeOpacity={0.7}>
              <Text style={styles.resetText}>{t('settings.resetToDefault')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionDesc, isRTL && styles.textRTL]}>
            {t('settings.accentColorDesc')}
          </Text>
          <View style={[styles.swatchRow, isRTL && styles.rowRTL]}>
            <TouchableOpacity
              style={[
                styles.swatch,
                styles.defaultSwatch,
                accentColor === null && styles.swatchSelected,
                accentColor === null && { borderColor: theme.textBrandGreen },
              ]}
              onPress={() => setAccentColor(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.defaultSwatchText}>A</Text>
            </TouchableOpacity>
            {ACCENT_PRESETS.map((color) => (
              <Swatch
                key={color}
                color={color}
                selected={sameColor(color, accentColor)}
                onPress={() => setAccentColor(color)}
                styles={styles}
                border={theme.textPrimary}
              />
            ))}
            <TouchableOpacity
              style={[
                styles.swatch,
                styles.customSwatch,
                accentColor && !accentInPresets ? { backgroundColor: accentColor } : null,
                accentColor && !accentInPresets ? styles.swatchSelected : null,
                accentColor && !accentInPresets ? { borderColor: theme.textPrimary } : null,
              ]}
              onPress={() => openPicker('accent')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="color-palette-outline"
                size={16}
                color={
                  accentColor && !accentInPresets
                    ? readableText(accentColor)
                    : theme.textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={[styles.sectionHeaderRow, isRTL && styles.rowRTL]}>
            <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
              {t('settings.backgroundColor')}
            </Text>
            <TouchableOpacity
              onPress={() => setBackgroundColor(null)}
              activeOpacity={0.7}
            >
              <Text style={styles.resetText}>{t('settings.resetToDefault')}</Text>
            </TouchableOpacity>
          </View>
          <Text style={[styles.sectionDesc, isRTL && styles.textRTL]}>
            {t('settings.backgroundColorDesc')}
          </Text>
          <View style={[styles.swatchRow, isRTL && styles.rowRTL]}>
            <TouchableOpacity
              style={[
                styles.swatch,
                styles.defaultSwatch,
                backgroundColor === null && styles.swatchSelected,
                backgroundColor === null && { borderColor: theme.textBrandGreen },
              ]}
              onPress={() => setBackgroundColor(null)}
              activeOpacity={0.8}
            >
              <Text style={styles.defaultSwatchText}>A</Text>
            </TouchableOpacity>
            {BACKGROUND_PRESETS.map((color) => (
              <Swatch
                key={color}
                color={color}
                selected={sameColor(color, backgroundColor)}
                onPress={() => setBackgroundColor(color)}
                styles={styles}
                border={theme.textPrimary}
              />
            ))}
            <TouchableOpacity
              style={[
                styles.swatch,
                styles.customSwatch,
                backgroundColor && !backgroundInPresets
                  ? { backgroundColor }
                  : null,
                backgroundColor && !backgroundInPresets ? styles.swatchSelected : null,
                backgroundColor && !backgroundInPresets
                  ? { borderColor: theme.textPrimary }
                  : null,
              ]}
              onPress={() => openPicker('background')}
              activeOpacity={0.8}
            >
              <Ionicons
                name="color-palette-outline"
                size={16}
                color={
                  backgroundColor && !backgroundInPresets
                    ? readableText(backgroundColor)
                    : theme.textSecondary
                }
              />
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.sectionCard}>
          <View style={[styles.toggleRow, isRTL && styles.rowRTL]}>
            <View style={styles.toggleTextCol}>
              <Text style={[styles.toggleLabel, isRTL && styles.textRTL]}>
                {t('settings.glassEffect')}
              </Text>
              <Text style={[styles.toggleDesc, isRTL && styles.textRTL]}>
                {t('settings.glassEffectDesc')}
              </Text>
            </View>
            <AppSwitch
              value={glass}
              onValueChange={setGlass}
              accessibilityLabel={t('settings.glassEffect')}
            />
          </View>
        </View>

        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('settings.textSize')}
          </Text>
          <View style={[styles.segment, isRTL && styles.rowRTL]}>
            {FONT_SCALE_OPTIONS.map((opt) => {
              const active = fontScale === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.fontScaleItem, active && styles.fontScaleItemActive]}
                  onPress={() => setFontScale(opt.value)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.fontScaleGlyph,
                      active && styles.fontScaleTextActive,
                      { fontSize: opt.preview },
                    ]}
                  >
                    A
                  </Text>
                  <Text
                    style={[
                      styles.fontScaleLabel,
                      active && styles.fontScaleTextActive,
                    ]}
                    numberOfLines={1}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        <Text style={[styles.previewCaption, isRTL && styles.textRTL]}>
          {t('settings.preview')}
        </Text>
        <View style={styles.previewCard}>
          <Text style={[styles.previewTitle, isRTL && styles.textRTL]}>
            {t('settings.previewText')}
          </Text>
          <Text style={[styles.previewBody, isRTL && styles.textRTL]}>
            {t('settings.previewBody')}
          </Text>
          <View style={[styles.previewActions, isRTL && styles.rowRTL]}>
            <View style={styles.previewPrimaryBtn}>
              <Text style={styles.previewPrimaryText}>
                {t('settings.primaryButton')}
              </Text>
            </View>
            <View style={styles.previewSecondaryBtn}>
              <Text style={styles.previewSecondaryText}>
                {t('settings.secondary')}
              </Text>
            </View>
            <Text style={styles.previewLink}>{t('settings.sampleLink')}</Text>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.resetAllButton, isRTL && styles.rowRTL]}
          onPress={resetAppearance}
          activeOpacity={0.8}
        >
          <Ionicons name="refresh-outline" size={18} color={theme.textSecondary} />
          <Text style={styles.resetAllText}>{t('settings.resetAppearance')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        visible={pickerTarget !== null}
        transparent
        animationType="fade"
        onRequestClose={cancelPicker}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
              {t('settings.customColor')}
            </Text>
            <View style={styles.modalPreviewRow}>
              {isWeb
                ? React.createElement('input' as never, {
                  type: 'color',
                  value: (hexValid
                    ? normalizeHex(hexInput) ?? '#000000'
                    : '#000000'
                  ).toLowerCase(),
                  onInput: (e: { target: { value: string } }) =>
                    onWebColorChange(e.target.value || ''),
                  onChange: (e: { target: { value: string } }) =>
                    onWebColorChange(e.target.value || ''),
                  style: {
                    width: 48,
                    height: 48,
                    padding: 0,
                    borderWidth: 1,
                    borderColor: theme.border,
                    borderRadius: 10,
                    background: 'none',
                    cursor: 'pointer',
                  },
                })
                : (
                  <View
                    style={[
                      styles.modalPreviewSwatch,
                      {
                        backgroundColor: hexValid
                          ? normalizeHex(hexInput) ?? '#FFFFFF'
                          : theme.bgMuted,
                      },
                    ]}
                  />
                )}
              <TextInput
                style={styles.hexInput}
                value={hexInput}
                onChangeText={onHexChange}
                placeholder="#1B4332"
                placeholderTextColor={theme.textMuted}
                autoCapitalize="characters"
                autoCorrect={false}
                maxLength={7}
              />
            </View>
            {!hexValid && hexInput.replace('#', '').length > 0 ? (
              <Text style={styles.hexError}>{t('settings.invalidHex')}</Text>
            ) : null}
            <View style={[styles.modalActions, isRTL && styles.rowRTL]}>
              <TouchableOpacity
                style={styles.modalCancelBtn}
                onPress={cancelPicker}
                activeOpacity={0.8}
              >
                <Text style={styles.modalCancelText}>{t('settings.cancel')}</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.modalApplyBtn}
                onPress={closePicker}
                activeOpacity={0.8}
              >
                <Text style={styles.modalApplyText}>{t('settings.done')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
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
    contentContainer: {
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing.cardGap,
      paddingBottom: spacing.sectionGap * 2,
      gap: spacing.cardGap,
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      alignSelf: 'flex-start',
      gap: 2,
      paddingVertical: 4,
    },
    backText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textBrandGreen,
      fontWeight: 'bold',
    },
    screenTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize['2xl'],
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: spacing[1],
    },
    sectionCard: {
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    sectionHeaderRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
    },
    sectionHeading: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md,
      fontWeight: 'bold',
      color: theme.textBrandGreen,
    },
    sectionDesc: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginTop: 2,
      marginBottom: spacing[3],
    },
    resetText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      fontWeight: '600',
    },
    swatchRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[3],
      marginTop: spacing[1],
    },
    swatch: {
      width: 38,
      height: 38,
      borderRadius: borderRadius.full,
      borderWidth: 2,
      justifyContent: 'center',
      alignItems: 'center',
    },
    swatchSelected: {
      borderWidth: 3,
    },
    defaultSwatch: {
      backgroundColor: theme.bgMuted,
      borderColor: theme.border,
    },
    defaultSwatchText: {
      fontFamily: typography.fontFamily.english,
      fontWeight: 'bold',
      fontSize: 14,
      color: theme.textSecondary,
    },
    customSwatch: {
      backgroundColor: theme.bgMuted,
      borderColor: theme.border,
      borderStyle: 'dashed',
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing[2],
      gap: spacing[3],
    },
    toggleTextCol: {
      flex: 1,
    },
    toggleLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
    },
    toggleDesc: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginTop: 2,
    },
    divider: {
      height: 1,
      backgroundColor: theme.borderDivider,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.full,
      padding: 4,
      gap: 4,
      marginTop: spacing[3],
    },
    fontScaleItem: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingVertical: 8,
      borderRadius: borderRadius.full,
    },
    fontScaleItemActive: {
      backgroundColor: theme.accentGreen,
    },
    fontScaleGlyph: {
      fontFamily: typography.fontFamily.english,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
      lineHeight: 24,
    },
    fontScaleLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    fontScaleTextActive: {
      color: theme.textOnAccent,
    },
    previewCaption: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      textTransform: 'uppercase',
      fontWeight: '600',
      marginTop: spacing[1],
    },
    previewCard: {
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    previewTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    previewBody: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      marginTop: spacing[2],
      marginBottom: spacing[3],
    },
    previewActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    previewPrimaryBtn: {
      backgroundColor: theme.accentGreen,
      borderRadius: borderRadius.button,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    previewPrimaryText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: 'bold',
      color: theme.textOnAccent,
    },
    previewSecondaryBtn: {
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.button,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: 8,
      paddingHorizontal: 14,
    },
    previewSecondaryText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: theme.textPrimary,
    },
    previewLink: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: theme.textBrandGreen,
    },
    resetAllButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.button,
      paddingVertical: spacing[3],
    },
    resetAllText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    textRTL: {
      textAlign: 'right',
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    modalOverlay: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      paddingHorizontal: spacing.pagePadding,
    },
    modalCard: {
      width: '100%',
      maxWidth: 360,
      backgroundColor: theme.bgElevated,
      borderRadius: borderRadius.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: theme.border,
    },
    modalTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: spacing[3],
    },
    modalPreviewRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    modalPreviewSwatch: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.button,
      borderWidth: 1,
      borderColor: theme.border,
    },
    hexInput: {
      flex: 1,
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textPrimary,
      backgroundColor: theme.bgInput,
      borderRadius: borderRadius.button,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: spacing[3],
      paddingVertical: 10,
    },
    hexError: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: '#C62828',
      marginTop: spacing[2],
    },
    modalActions: {
      flexDirection: 'row',
      justifyContent: 'flex-end',
      gap: spacing[3],
      marginTop: spacing[4],
    },
    modalCancelBtn: {
      paddingVertical: 10,
      paddingHorizontal: 16,
      borderRadius: borderRadius.button,
    },
    modalCancelText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: theme.textSecondary,
    },
    modalApplyBtn: {
      backgroundColor: theme.accentGreen,
      paddingVertical: 10,
      paddingHorizontal: 18,
      borderRadius: borderRadius.button,
    },
    modalApplyBtnDisabled: {
      opacity: 0.5,
    },
    modalApplyText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: 'bold',
      color: theme.textOnAccent,
    },
  });
