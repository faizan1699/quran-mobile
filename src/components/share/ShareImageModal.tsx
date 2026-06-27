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
import { captureAndShareView } from '@/services/shareImage';
import {
  SHARE_BG_PRESETS,
  SHARE_FONT_SIZES,
  SHARE_RADII,
  SHARE_BORDERS,
} from '@/data/sharePresets';
import { ShareContent, ShareLang, ShareMode } from '@/types/share';

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
  const hasTranslation = hasEnglish || hasUrdu;

  const [mode, setMode] = useState<ShareMode>('both');
  const [lang, setLang] = useState<ShareLang>(language);
  const [bgIndex, setBgIndex] = useState(0);
  const [sizeIndex, setSizeIndex] = useState(1);
  const [radiusIndex, setRadiusIndex] = useState(1);
  const [borderIndex, setBorderIndex] = useState(1);
  const [sharing, setSharing] = useState(false);

  useEffect(() => {
    if (!visible) {
      return;
    }
    setMode('both');
    setLang(hasUrdu && (language === 'ur' || !hasEnglish) ? 'ur' : 'en');
  }, [visible, hasUrdu, hasEnglish, language]);

  if (!content) {
    return null;
  }

  const preset = SHARE_BG_PRESETS[bgIndex];
  const size = SHARE_FONT_SIZES[sizeIndex];
  const radius = SHARE_RADII[radiusIndex];
  const border = SHARE_BORDERS[borderIndex];

  const showArabic = hasArabic && (mode === 'arabic' || mode === 'both');
  const showTranslation = mode === 'both' && hasTranslation;

  const effectiveLang: ShareLang =
    lang === 'ur' ? (hasUrdu ? 'ur' : 'en') : hasEnglish ? 'en' : 'ur';
  const translationText =
    effectiveLang === 'ur' ? content.urdu : content.english;
  const referenceText =
    effectiveLang === 'ur'
      ? content.referenceUrdu ?? content.reference
      : content.reference ?? content.referenceUrdu;

  const cardWidth = Math.min(width - spacing[4] * 2, 360);

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
      showTranslation ? translationText : null,
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

  const showContentToggle = hasArabic && hasTranslation;
  const showLangToggle = showTranslation && hasEnglish && hasUrdu;

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
                fontArabic={size.arabic}
                fontTranslation={size.translation}
                fontReference={size.reference}
                categoryLabel={categoryLabel}
                arabic={content.arabic}
                translation={translationText}
                translationLang={effectiveLang}
                reference={referenceText}
                showArabic={showArabic}
                showTranslation={showTranslation}
                watermark={WATERMARK}
              />
            </View>

            {showContentToggle && (
              <Section label={t('share.content')} styles={styles}>
                <View style={styles.chipRow}>
                  <TextChip
                    label={t('share.arabicOnly')}
                    active={mode === 'arabic'}
                    onPress={() => setMode('arabic')}
                    styles={styles}
                  />
                  <TextChip
                    label={t('share.withTranslation')}
                    active={mode === 'both'}
                    onPress={() => setMode('both')}
                    styles={styles}
                  />
                </View>
              </Section>
            )}

            {showLangToggle && (
              <Section label={t('share.language')} styles={styles}>
                <View style={styles.chipRow}>
                  <TextChip
                    label={t('share.english')}
                    active={effectiveLang === 'en'}
                    onPress={() => setLang('en')}
                    styles={styles}
                  />
                  <TextChip
                    label={t('share.urdu')}
                    active={effectiveLang === 'ur'}
                    onPress={() => setLang('ur')}
                    styles={styles}
                  />
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
                    <View style={[styles.swatchDot, { backgroundColor: p.accent }]} />
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
                {SHARE_BORDERS.map((b, i) => (
                  <TouchableOpacity
                    key={b.id}
                    onPress={() => setBorderIndex(i)}
                    activeOpacity={0.8}
                    style={[styles.iconChip, i === borderIndex && styles.iconChipActive]}
                  >
                    <View
                      style={[
                        styles.borderGlyph,
                        {
                          borderWidth: b.width || 0,
                          borderStyle: b.style,
                          borderColor:
                            b.width === 0
                              ? 'transparent'
                              : i === borderIndex
                              ? theme.textOnAccent
                              : theme.textSecondary,
                        },
                      ]}
                    >
                      {b.width === 0 && (
                        <Text
                          style={[
                            styles.borderNone,
                            i === borderIndex && styles.iconChipTextActive,
                          ]}
                        >
                          ∅
                        </Text>
                      )}
                    </View>
                  </TouchableOpacity>
                ))}
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

function TextChip({
  label,
  active,
  onPress,
  styles,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  styles: ReturnType<typeof createStyles>;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      style={[styles.textChip, active && styles.textChipActive]}
    >
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
      maxHeight: '94%',
      paddingTop: spacing[2],
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
    scrollContent: {
      paddingHorizontal: spacing[5],
      paddingTop: spacing[4],
      paddingBottom: spacing[4],
    },
    previewArea: {
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.xl,
      paddingVertical: spacing[6],
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
    borderGlyph: {
      width: 24,
      height: 18,
      borderRadius: 3,
      alignItems: 'center',
      justifyContent: 'center',
    },
    borderNone: {
      fontSize: 14,
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
