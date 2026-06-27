import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Pressable,
  Modal,
  TextInput,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { BackButton } from '@/components/BackButton';
import { useTheme, Theme, ThemeMode } from '@/theme';
import { ACCENT_PRESETS, BACKGROUND_PRESETS } from '@/theme/appearancePresets';
import { normalizeHex, isValidHex, readableText } from '@/theme/colorUtils';
import { RootStackParamList } from '@/navigation/types';
import { usePreferencesStore, FontScale } from '@/store/usePreferencesStore';
import {
  ARABIC_FONTS,
  URDU_FONTS,
  ENGLISH_FONTS,
  ScriptFontOption,
} from '@/theme/scriptFonts';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppSwitch } from '@/components/AppSwitch';
import { ColorPicker } from '@/components/ColorPicker';
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

const THEME_MODE_OPTIONS: { value: ThemeMode; labelKey: string; icon: string }[] = [
  { value: 'system', labelKey: 'theme.system', icon: 'phone-portrait-outline' },
  { value: 'light', labelKey: 'theme.light', icon: 'sunny-outline' },
  { value: 'dark', labelKey: 'theme.dark', icon: 'moon-outline' },
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

function FontDropdown({
  title,
  desc,
  chooseLabel,
  options,
  selected,
  onSelect,
  sizeLabel,
  sizeOptions,
  sizeValue,
  onSizeChange,
  styles,
  theme,
  isRTL,
  scriptRTL,
}: {
  title: string;
  desc: string;
  chooseLabel: string;
  options: ScriptFontOption[];
  selected: string;
  onSelect: (family: string) => void;
  sizeLabel: string;
  sizeOptions: { value: FontScale; label: string; preview: number }[];
  sizeValue: FontScale;
  onSizeChange: (scale: FontScale) => void;
  styles: Styles;
  theme: Theme;
  isRTL: boolean;
  scriptRTL: boolean;
}): React.JSX.Element {
  const [open, setOpen] = useState(false);
  const current = options.find((o) => o.family === selected) ?? options[0];

  return (
    <View style={styles.sectionCard}>
      <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>{title}</Text>
      <Text style={[styles.sectionDesc, isRTL && styles.textRTL]}>{desc}</Text>

      <TouchableOpacity
        style={[styles.dropdownTrigger, isRTL && styles.rowRTL]}
        onPress={() => setOpen(true)}
        activeOpacity={0.8}
      >
        <View style={styles.dropdownTriggerTextCol}>
          <Text
            style={[
              styles.dropdownSample,
              scriptRTL && styles.sampleRTL,
              { fontFamily: current.previewFamily ?? current.family },
            ]}
            numberOfLines={1}
          >
            {current.sample}
          </Text>
          <Text style={styles.dropdownCurrentLabel} numberOfLines={1}>
            {current.label}
          </Text>
        </View>
        <Ionicons name="chevron-down" size={18} color={theme.textSecondary} />
      </TouchableOpacity>

      <Text style={[styles.sizeLabel, isRTL && styles.textRTL]}>{sizeLabel}</Text>
      <View style={[styles.segment, isRTL && styles.rowRTL]}>
        {sizeOptions.map((opt) => {
          const active = sizeValue === opt.value;
          return (
            <TouchableOpacity
              key={opt.value}
              style={[styles.fontScaleItem, active && styles.fontScaleItemActive]}
              onPress={() => onSizeChange(opt.value)}
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
                style={[styles.fontScaleLabel, active && styles.fontScaleTextActive]}
                numberOfLines={1}
              >
                {opt.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <Modal
        visible={open}
        transparent
        animationType="fade"
        onRequestClose={() => setOpen(false)}
      >
        <Pressable style={styles.modalOverlay} onPress={() => setOpen(false)}>
          <Pressable style={styles.dropdownModalCard}>
            <Text style={[styles.modalTitle, isRTL && styles.textRTL]}>
              {chooseLabel}
            </Text>
            <ScrollView
              style={styles.dropdownList}
              contentContainerStyle={styles.dropdownListContent}
              showsVerticalScrollIndicator={false}
            >
              {options.map((opt) => {
                const active = selected === opt.family;
                return (
                  <TouchableOpacity
                    key={`${opt.family}-${opt.label}`}
                    style={[styles.fontOption, active && styles.fontOptionActive]}
                    onPress={() => {
                      onSelect(opt.family);
                      setOpen(false);
                    }}
                    activeOpacity={0.85}
                  >
                    <View style={styles.fontOptionTextCol}>
                      <Text
                        style={[
                          styles.fontSample,
                          scriptRTL && styles.sampleRTL,
                          { fontFamily: opt.previewFamily ?? opt.family },
                        ]}
                        numberOfLines={1}
                      >
                        {opt.sample}
                      </Text>
                      <Text
                        style={[
                          styles.fontOptionLabel,
                          active && styles.fontOptionLabelActive,
                        ]}
                        numberOfLines={1}
                      >
                        {opt.label}
                      </Text>
                    </View>
                    <View style={[styles.fontRadio, active && styles.fontRadioActive]}>
                      {active ? (
                        <Ionicons
                          name="checkmark"
                          size={14}
                          color={theme.textOnAccent}
                        />
                      ) : null}
                    </View>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

export default function AppearanceScreen(): React.JSX.Element {
  const { t, isRTL } = useTranslation();
  const {
    theme,
    mode,
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

  const arabicFontScale = usePreferencesStore((s) => s.arabicFontScale);
  const setArabicFontScale = usePreferencesStore((s) => s.setArabicFontScale);
  const urduFontScale = usePreferencesStore((s) => s.urduFontScale);
  const setUrduFontScale = usePreferencesStore((s) => s.setUrduFontScale);
  const englishFontScale = usePreferencesStore((s) => s.englishFontScale);
  const setEnglishFontScale = usePreferencesStore((s) => s.setEnglishFontScale);
  const arabicFont = usePreferencesStore((s) => s.arabicFont);
  const setArabicFont = usePreferencesStore((s) => s.setArabicFont);
  const urduFont = usePreferencesStore((s) => s.urduFont);
  const setUrduFont = usePreferencesStore((s) => s.setUrduFont);
  const englishFont = usePreferencesStore((s) => s.englishFont);
  const setEnglishFont = usePreferencesStore((s) => s.setEnglishFont);

  const sizeOptions = useMemo(
    () =>
      FONT_SCALE_OPTIONS.map((opt) => ({
        value: opt.value,
        label: t(opt.labelKey),
        preview: opt.preview,
      })),
    [t]
  );

  const [pickerTarget, setPickerTarget] = useState<PickerTarget | null>(null);
  const [hexInput, setHexInput] = useState('');
  const [originalColor, setOriginalColor] = useState<string | null>(null);

  const isWeb = Platform.OS === 'web';

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
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <GlobalHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <BackButton showLabel label={t('settings.title')} style={styles.backButton} />

        <Text style={[styles.screenTitle, isRTL && styles.textRTL]}>
          {t('theme.appearance')}
        </Text>

        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('settings.darkMode')}
          </Text>
          <Text style={[styles.sectionDesc, isRTL && styles.textRTL]}>
            {t('theme.desc')}
          </Text>
          <View style={[styles.segment, isRTL && styles.rowRTL]}>
            {THEME_MODE_OPTIONS.map((opt) => {
              const active = mode === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.fontScaleItem, active && styles.fontScaleItemActive]}
                  onPress={() => setMode(opt.value)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={active ? theme.textOnAccent : theme.textSecondary}
                  />
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

        <FontDropdown
          title={t('settings.arabicFont')}
          desc={t('settings.arabicFontDesc')}
          chooseLabel={t('settings.chooseFont')}
          options={ARABIC_FONTS}
          selected={arabicFont}
          onSelect={setArabicFont}
          styles={styles}
          theme={theme}
          isRTL={isRTL}
          scriptRTL
        />

        <FontDropdown
          title={t('settings.urduFont')}
          desc={t('settings.urduFontDesc')}
          chooseLabel={t('settings.chooseFont')}
          options={URDU_FONTS}
          selected={urduFont}
          onSelect={setUrduFont}
          styles={styles}
          theme={theme}
          isRTL={isRTL}
          scriptRTL
        />

        <FontDropdown
          title={t('settings.englishFont')}
          desc={t('settings.englishFontDesc')}
          chooseLabel={t('settings.chooseFont')}
          options={ENGLISH_FONTS}
          selected={englishFont}
          onSelect={setEnglishFont}
          styles={styles}
          theme={theme}
          isRTL={isRTL}
          scriptRTL={false}
        />

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

          <View style={styles.previewScriptRow}>
            <Text style={styles.previewScriptLabel}>
              {t('settings.previewArabicLabel')}
            </Text>
            <Text style={styles.previewArabic} numberOfLines={1}>
              بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
            </Text>
          </View>
          <View style={styles.previewScriptRow}>
            <Text style={styles.previewScriptLabel}>
              {t('settings.previewUrduLabel')}
            </Text>
            <Text style={styles.previewUrdu} numberOfLines={1}>
              اللہ کے نام سے جو نہایت مہربان ہے
            </Text>
          </View>
          <View style={styles.previewDivider} />
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
            {!isWeb ? (
              <ColorPicker
                value={hexValid ? normalizeHex(hexInput) ?? '#1B4332' : '#1B4332'}
                onChange={onWebColorChange}
                theme={theme}
              />
            ) : null}
            <View style={[styles.modalPreviewRow, !isWeb && styles.modalHexRow]}>
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
                : null}
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
      alignSelf: 'flex-start',
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
    dropdownTrigger: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[3],
      marginTop: spacing[3],
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
      borderRadius: borderRadius.card,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.bgMuted,
    },
    dropdownTriggerTextCol: {
      flex: 1,
    },
    dropdownSample: {
      fontSize: 24,
      lineHeight: 42,
      color: theme.textPrimary,
    },
    dropdownCurrentLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textBrandGreen,
      marginTop: 2,
    },
    dropdownModalCard: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '80%',
      backgroundColor: theme.bgElevated,
      borderRadius: borderRadius.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: theme.border,
    },
    dropdownList: {
      marginTop: spacing[2],
    },
    dropdownListContent: {
      gap: spacing[2],
      paddingBottom: spacing[1],
    },
    fontOption: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[3],
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
      borderRadius: borderRadius.card,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.bgMuted,
    },
    fontOptionActive: {
      borderColor: theme.accentGreen,
      backgroundColor: theme.accentSoft,
    },
    fontOptionTextCol: {
      flex: 1,
    },
    fontSample: {
      fontSize: 26,
      lineHeight: 46,
      color: theme.textPrimary,
    },
    sampleRTL: {
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    fontOptionLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
      marginTop: 2,
    },
    fontOptionLabelActive: {
      color: theme.textBrandGreen,
    },
    fontRadio: {
      width: 22,
      height: 22,
      borderRadius: borderRadius.full,
      borderWidth: 2,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    fontRadioActive: {
      borderColor: theme.accentGreen,
      backgroundColor: theme.accentGreen,
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
    previewScriptRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[3],
      marginTop: spacing[1],
    },
    previewScriptLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: '600',
      color: theme.textMuted,
    },
    previewArabic: {
      flex: 1,
      fontFamily: typography.fontFamily.arabic,
      fontSize: 24,
      lineHeight: 44,
      color: theme.textPrimary,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    previewUrdu: {
      flex: 1,
      fontFamily: typography.fontFamily.urdu,
      fontSize: 18,
      lineHeight: 40,
      color: theme.textPrimary,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    previewDivider: {
      height: 1,
      backgroundColor: theme.borderDivider,
      marginTop: spacing[3],
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
    modalHexRow: {
      marginTop: spacing[3],
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
