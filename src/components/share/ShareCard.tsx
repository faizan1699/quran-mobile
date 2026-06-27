import React, { forwardRef } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { typography } from '@/tokens';
import { readableText, withAlpha, mix } from '@/theme/colorUtils';

interface ShareCardProps {
  width: number;
  bg: string;
  accent: string;
  radius: number;
  borderWidth: number;
  borderStyle: 'solid' | 'dashed' | 'dotted';
  fontArabic: number;
  fontTranslation: number;
  fontReference: number;
  categoryLabel: string;
  arabic?: string | null;
  english?: string | null;
  urdu?: string | null;
  reference?: string | null;
  showArabic: boolean;
  showEnglish: boolean;
  showUrdu: boolean;
  watermark: string;
}

export const ShareCard = forwardRef<View, ShareCardProps>(function ShareCard(
  {
    width,
    bg,
    accent,
    radius,
    borderWidth,
    borderStyle,
    fontArabic,
    fontTranslation,
    fontReference,
    categoryLabel,
    arabic,
    english,
    urdu,
    reference,
    showArabic,
    showEnglish,
    showUrdu,
    watermark,
  },
  ref
) {
  const textColor = readableText(bg);
  const mutedColor = mix(textColor, bg, 0.45);
  const dividerColor = withAlpha(accent, 0.4);
  const hasArabic = showArabic && !!arabic;
  const hasEnglish = showEnglish && !!english;
  const hasUrdu = showUrdu && !!urdu;
  const hasTranslation = hasEnglish || hasUrdu;

  return (
    <View
      ref={ref}
      collapsable={false}
      style={[
        styles.card,
        {
          width,
          backgroundColor: bg,
          borderRadius: radius,
          borderWidth,
          borderColor: borderWidth > 0 ? accent : 'transparent',
          borderStyle,
        },
      ]}
    >
      <View style={styles.tagRow}>
        <View style={[styles.tagDot, { backgroundColor: accent }]} />
        <Text style={[styles.tag, { color: accent }]} numberOfLines={1}>
          {categoryLabel}
        </Text>
        <View style={[styles.tagDot, { backgroundColor: accent }]} />
      </View>

      {hasArabic && (
        <Text
          style={[
            styles.arabic,
            {
              color: textColor,
              fontSize: fontArabic,
              lineHeight: fontArabic * typography.lineHeight.arabic,
            },
          ]}
        >
          {arabic}
        </Text>
      )}

      {hasArabic && hasTranslation && (
        <View style={[styles.divider, { backgroundColor: dividerColor }]} />
      )}

      {hasEnglish && (
        <Text
          style={[
            styles.translation,
            {
              color: textColor,
              fontSize: fontTranslation,
              fontFamily: typography.fontFamily.english,
              lineHeight: fontTranslation * typography.lineHeight.normal,
              writingDirection: 'ltr',
            },
          ]}
        >
          {english}
        </Text>
      )}

      {hasEnglish && hasUrdu && (
        <View style={[styles.subDivider, { backgroundColor: dividerColor }]} />
      )}

      {hasUrdu && (
        <Text
          style={[
            styles.translation,
            {
              color: textColor,
              fontSize: fontTranslation,
              fontFamily: typography.fontFamily.urdu,
              lineHeight: fontTranslation * typography.lineHeight.urdu,
              writingDirection: 'rtl',
            },
          ]}
        >
          {urdu}
        </Text>
      )}

      {!!reference && (
        <Text
          style={[
            styles.reference,
            { color: accent, fontSize: fontReference },
          ]}
        >
          {reference}
        </Text>
      )}

      <View style={[styles.footerLine, { backgroundColor: withAlpha(mutedColor, 0.4) }]} />
      <Text style={[styles.watermark, { color: mutedColor }]} numberOfLines={1}>
        {watermark}
      </Text>
    </View>
  );
});

const styles = StyleSheet.create({
  card: {
    paddingHorizontal: 26,
    paddingVertical: 30,
    alignItems: 'center',
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 18,
  },
  tagDot: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  tag: {
    fontFamily: typography.fontFamily.english,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 2,
    textTransform: 'uppercase',
  },
  arabic: {
    fontFamily: typography.fontFamily.arabic,
    textAlign: 'center',
    writingDirection: 'rtl',
  },
  divider: {
    width: 60,
    height: 1.5,
    borderRadius: 1,
    marginVertical: 18,
  },
  subDivider: {
    width: 32,
    height: 1,
    borderRadius: 1,
    marginVertical: 14,
    opacity: 0.7,
  },
  translation: {
    textAlign: 'center',
    marginTop: 6,
  },
  reference: {
    fontFamily: typography.fontFamily.english,
    fontWeight: '700',
    textAlign: 'center',
    marginTop: 18,
    letterSpacing: 0.5,
  },
  footerLine: {
    width: 32,
    height: 1,
    marginTop: 22,
    marginBottom: 10,
  },
  watermark: {
    fontFamily: typography.fontFamily.english,
    fontSize: 11,
    letterSpacing: 1,
    fontWeight: '600',
  },
});

export default ShareCard;
