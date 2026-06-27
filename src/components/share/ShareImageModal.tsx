import React, { useMemo, useRef, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Alert,
  useWindowDimensions,
} from 'react-native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { spacing, borderRadius, typography } from '@/tokens';
import { ShareCard } from '@/components/share/ShareCard';
import { IslamicPattern } from '@/components/share/IslamicPattern';
import { captureAndShareView } from '@/services/shareImage';
import {
  SHARE_BG_PRESETS,
  SHARE_FONT_SIZES,
  SHARE_RADII,
  SHARE_BORDERS,
  type ShareBorderOption,
} from '@/data/sharePresets';
import { withAlpha } from '@/theme/colorUtils';
import { ShareContent } from '@/types/share';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

const WATERMARK = 'Taleem ul Quran';

interface ShareImageModalProps {
  visible: boolean;
  content: ShareContent | null;
  onClose: () => void;
}

export function ShareImageModal({
  visible,
  content,
  onClose,
}: ShareImageModalProps): React.JSX.Element | null {
  const { t, language } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { width } = useWindowDimensions();
  const cardRef = useRef<View>(null);

  const hasArabic = !!content?.arabic;
  const hasEnglish = !!content?.english;
  const hasUrdu = !!content?.urdu;

  const [selAr, setSelAr] = useState(true);
  const [selEn, setSelEn] = useState(false);
  const [selUr, setSelUr] = useState(false);
  const [bgIndex, setBgIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(1);
  const [radiusIndex, setRadiusIndex] = useState(1);
  const [borderIndex, setBorderIndex] = useState(1);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    const preferUrdu = hasUrdu && (language === 'ur' || !hasEnglish);
    setSelAr(hasArabic);
    setSelEn(hasEnglish && !preferUrdu);
    setSelUr(hasUrdu && preferUrdu);
  }, [visible, hasArabic, hasEnglish, hasUrdu, language]);

  if (!content) {
    return null;
  }

  const preset = SHARE_BG_PRESETS[bgIndex];
  const size = SHARE_FONT_SIZES[sizeIndex];
  const radius = SHARE_RADII[radiusIndex];
  const border = SHARE_BORDERS[borderIndex];

  const showArabic = selAr && hasArabic;
  const showEnglish = selEn && hasEnglish;
  const showUrdu = selUr && hasUrdu;

  const toggleLang = (key: 'ar' | 'en' | 'ur') => {
    const next = { ar: showArabic, en: showEnglish, ur: showUrdu };
    next[key] = !next[key];
    if (!next.ar && !next.en && !next.ur) {
      return;
    }
    if (key === 'ar') {
      setSelAr(next.ar);
    } else if (key === 'en') {
      setSelEn(next.en);
    } else {
      setSelUr(next.ur);
    }
  };

  const referenceText =
    showUrdu && !showEnglish
      ? content.referenceUrdu ?? content.reference
      : content.reference ?? content.referenceUrdu;

  const availableCount =
    (hasArabic ? 1 : 0) + (hasEnglish ? 1 : 0) + (hasUrdu ? 1 : 0);

  const cardWidth = Math.min(width - spacing[5] * 2 - spacing[4], 340);

  const categoryLabel =
    content.kind === 'ayah'
      ? t('share.catAyah')
      : content.kind === 'dua'
      ? t('share.catDua')
      : t('share.catHadith');

  const onShare = async () => {
    if (sharing) {
      return;
    }
    setSharing(true);
    const lines = [
      showArabic ? content.arabic : null,
      showEnglish ? content.english : null,
      showUrdu ? content.urdu : null,
      referenceText ? `— ${referenceText}` : null,
      `(${WATERMARK})`,
    ].filter(Boolean);
    const result = await captureAndShareView(cardRef, {
      dialogTitle: t('share.title'),
      fallbackMessage: lines.join('\n\n'),
    });
    setSharing(false);
    if (!result.ok) {
      Alert.alert(t('share.failed'), t('share.failedBody'));
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
      statusBarTranslucent
    >
      <View style={styles.backdrop}>
        <View style={styles.sheet}>
          <View style={styles.grabber} />
          <View style={styles.header}>
            <Text style={styles.headerTitle}>{t('share.title')}</Text>
            <TouchableOpacity
              onPress={onClose}
              style={styles.closeBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close" size={22} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.scroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.scrollContent}
          >
            <View style={styles.previewArea}>
              <ShareCard
                ref={cardRef}
                width={cardWidth}
                bg={preset.bg}
                accent={preset.accent}
                radius={radius}
                borderWidth={border.width}
                borderStyle={border.style}
                pattern={preset.pattern}
                fontArabic={size.arabic}
                fontTranslation={size.translation}
                fontReference={size.reference}
                categoryLabel={categoryLabel}
                arabic={content.arabic}
                english={content.english}
                urdu={content.urdu}
                reference={referenceText}
                showArabic={showArabic}
                showEnglish={showEnglish}
                showUrdu={showUrdu}
                watermark={WATERMARK}
              />
            </View>

            {availableCount > 1 && (
              <Section label={t('share.content')} styles={styles}>
                <View style={styles.chipRow}>
                  {hasArabic && (
                    <ToggleChip
                      label={t('share.arabic')}
                      active={showArabic}
                      onPress={() => toggleLang('ar')}
                      styles={styles}
                      theme={theme}
                    />
                  )}
                  {hasEnglish && (
                    <ToggleChip
                      label={t('share.english')}
                      active={showEnglish}
                      onPress={() => toggleLang('en')}
                      styles={styles}
                      theme={theme}
                    />
                  )}
                  {hasUrdu && (
                    <ToggleChip
                      label={t('share.urdu')}
                      active={showUrdu}
                      onPress={() => toggleLang('ur')}
                      styles={styles}
                      theme={theme}
                    />
                  )}
                </View>
              </Section>
            )}

            <Section label={t('share.background')} styles={styles}>
              <View style={styles.swatchRow}>
                {SHARE_BG_PRESETS.map((p, i) => (
                  <TouchableOpacity
                    key={p.id}
                    onPress={() => setBgIndex(i)}
                    activeOpacity={0.8}
                    style={[
                      styles.swatch,
                      { backgroundColor: p.bg },
                      i === bgIndex && {
                        borderColor: theme.accentGreen,
                        borderWidth: 3,
                      },
                    ]}
                  >
                    {p.pattern ? (
                      <IslamicPattern
                        variant={p.pattern}
                        color={p.accent}
                        opacity={0.7}
                        tile={13}
                        coverW={46}
                        coverH={46}
                      />
                    ) : (
                      <View
                        style={[styles.swatchDot, { backgroundColor: p.accent }]}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            <Section label={t('share.textSize')} styles={styles}>
              <View style={styles.chipRow}>
                {SHARE_FONT_SIZES.map((s, i) => (
                  <TouchableOpacity
                    key={s.id}
                    onPress={() => setSizeIndex(i)}
                    activeOpacity={0.8}
                    style={[styles.iconChip, i === sizeIndex && styles.iconChipActive]}
                  >
                    <Text
                      style={[
                        styles.sizeGlyph,
                        { fontSize: 11 + i * 4 },
                        i === sizeIndex && styles.iconChipTextActive,
                      ]}
                    >
                      A
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            <Section label={t('share.corners')} styles={styles}>
              <View style={styles.chipRow}>
                {SHARE_RADII.map((r, i) => (
                  <TouchableOpacity
                    key={r}
                    onPress={() => setRadiusIndex(i)}
                    activeOpacity={0.8}
                    style={[styles.iconChip, i === radiusIndex && styles.iconChipActive]}
                  >
                    <View
                      style={[
                        styles.cornerGlyph,
                        {
                          borderTopLeftRadius: Math.min(r / 2.4, 9),
                          borderColor:
                            i === radiusIndex
                              ? theme.textOnAccent
                              : theme.textSecondary,
                        },
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </Section>

            <Section label={t('share.border')} styles={styles}>
              <View style={styles.chipRow}>
                {SHARE_BORDERS.map((b, i) => {
                  const active = i === borderIndex;
                  const glyphColor = active
                    ? theme.textOnAccent
                    : theme.textSecondary;
                  return (
                    <TouchableOpacity
                      key={b.id}
                      onPress={() => setBorderIndex(i)}
                      activeOpacity={0.8}
                      style={[styles.borderChip, active && styles.iconChipActive]}
                    >
                      {b.width === 0 ? (
                        <View style={styles.borderNoneGlyph}>
                          <View
                            style={[
                              styles.borderNoneLine,
                              { backgroundColor: glyphColor },
                            ]}
                          />
                        </View>
                      ) : (
                        <BorderGlyph option={b} color={glyphColor} styles={styles} />
                      )}
                      <Text
                        style={[
                          styles.borderChipLabel,
                          active && styles.iconChipTextActive,
                        ]}
                      >
                        {t(`share.border_${b.id}`)}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </Section>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity
              style={styles.shareBtn}
              onPress={onShare}
              activeOpacity={0.85}
              disabled={sharing}
            >
              {sharing ? (
                <ActivityIndicator color={theme.textOnAccent} />
              ) : (
                <>
                  <Ionicons
                    name="share-social"
                    size={18}
                    color={theme.textOnAccent}
                  />
                  <Text style={styles.shareBtnText}>{t('share.shareBtn')}</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

function BorderGlyph({
  option,
  color,
  styles,
}: {
  option: ShareBorderOption;
  color: string;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  const width = Math.min(option.width, 3);
  const faded = withAlpha(color, 0.35);

  if (option.style === 'bevel' || option.style === 'etch') {
    const raised = option.style === 'bevel';
    return (
      <View
        style={[
          styles.borderGlyph,
          {
            borderWidth: width,
            borderTopColor: raised ? color : faded,
            borderLeftColor: raised ? color : faded,
            borderBottomColor: raised ? faded : color,
            borderRightColor: raised ? faded : color,
          },
        ]}
      />
    );
  }

  if (option.style === 'double' || option.style === 'frame') {
    return (
      <View
        style={[styles.borderGlyph, { borderWidth: 1, borderColor: color }]}
      >
        <View style={[styles.borderGlyphInner, { borderColor: color }]} />
      </View>
    );
  }

  if (option.style === 'ornate') {
    return (
      <View style={[styles.borderGlyph, { borderWidth: 1, borderColor: color }]}>
        {[
          { top: -3, left: -3 },
          { top: -3, right: -3 },
          { bottom: -3, left: -3 },
          { bottom: -3, right: -3 },
        ].map((pos, idx) => (
          <View
            key={idx}
            style={[styles.borderGlyphOrn, pos, { borderColor: color }]}
          />
        ))}
      </View>
    );
  }

  return (
    <View
      style={[
        styles.borderGlyph,
        {
          borderWidth: width,
          borderStyle:
            option.style === 'dashed' || option.style === 'dotted'
              ? option.style
              : 'solid',
          borderColor: color,
        },
      ]}
    />
  );
}

function Section({
  label,
  children,
  styles,
}: {
  label: string;
  children: React.ReactNode;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionLabel}>{label}</Text>
      {children}
    </View>
  );
}

function ToggleChip({
  label,
  active,
  onPress,
  styles,
  theme,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.textChip, active && styles.textChipActive]}
    >
      <Ionicons
        name={active ? 'checkmark-circle' : 'ellipse-outline'}
        size={16}
        color={active ? theme.textOnAccent : theme.textSecondary}
      />
      <Text style={[styles.textChipLabel, active && styles.iconChipTextActive]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'flex-end',
    },
    sheet: {
      backgroundColor: theme.bgPage,
      borderTopLeftRadius: borderRadius['3xl'],
      borderTopRightRadius: borderRadius['3xl'],
      maxHeight: '92%',
      paddingTop: spacing[2],
    },
    grabber: {
      alignSelf: 'center',
      width: 40,
      height: 4,
      borderRadius: 2,
      backgroundColor: theme.borderDivider,
      marginBottom: spacing[2],
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.borderDivider,
    },
    headerTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    closeBtn: {
      padding: spacing[1],
    },
    scroll: {
      flexGrow: 1,
      flexShrink: 1,
    },
    scrollContent: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[4],
      paddingBottom: spacing[5],
    },
    previewArea: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing[5],
      marginBottom: spacing[5],
    },
    section: {
      marginBottom: spacing[5],
    },
    sectionLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
      textTransform: 'uppercase',
      letterSpacing: 1,
      marginBottom: spacing[3],
    },
    chipRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    textChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
      borderRadius: borderRadius.full,
      backgroundColor: theme.bgMuted,
      borderWidth: 1,
      borderColor: theme.border,
    },
    textChipActive: {
      backgroundColor: theme.accentGreen,
      borderColor: theme.accentGreen,
    },
    textChipLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    iconChipTextActive: {
      color: theme.textOnAccent,
    },
    swatchRow: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[3],
    },
    swatch: {
      width: 44,
      height: 44,
      borderRadius: borderRadius.lg,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    swatchDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
    },
    iconChip: {
      width: 48,
      height: 44,
      borderRadius: borderRadius.lg,
      backgroundColor: theme.bgMuted,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
    },
    iconChipActive: {
      backgroundColor: theme.accentGreen,
      borderColor: theme.accentGreen,
    },
    sizeGlyph: {
      fontFamily: typography.fontFamily.english,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
    },
    cornerGlyph: {
      width: 20,
      height: 20,
      borderTopWidth: 2.5,
      borderLeftWidth: 2.5,
    },
    borderChip: {
      minWidth: 64,
      paddingHorizontal: spacing[2],
      paddingTop: spacing[2],
      paddingBottom: spacing[2],
      borderRadius: borderRadius.lg,
      backgroundColor: theme.bgMuted,
      borderWidth: 1,
      borderColor: theme.border,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[1],
    },
    borderGlyph: {
      width: 30,
      height: 20,
      borderRadius: 5,
    },
    borderGlyphInner: {
      position: 'absolute',
      top: 2,
      left: 2,
      right: 2,
      bottom: 2,
      borderWidth: 1,
      borderRadius: 3,
    },
    borderGlyphOrn: {
      position: 'absolute',
      width: 6,
      height: 6,
      borderWidth: 1,
      transform: [{ rotate: '45deg' }],
    },
    borderNoneGlyph: {
      width: 30,
      height: 20,
      alignItems: 'center',
      justifyContent: 'center',
    },
    borderNoneLine: {
      width: 22,
      height: 2,
      borderRadius: 1,
      transform: [{ rotate: '-45deg' }],
    },
    borderChipLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    footer: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[3],
      paddingBottom: spacing[6],
      borderTopWidth: 1,
      borderTopColor: theme.borderDivider,
    },
    shareBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      backgroundColor: theme.accentGreen,
      paddingVertical: spacing[4],
      borderRadius: borderRadius.full,
    },
    shareBtnText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textOnAccent,
    },
  });

export default ShareImageModal;
