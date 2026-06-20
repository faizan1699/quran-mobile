import { colors } from './colors';
import { borderRadius } from './borderRadius';
import { spacing } from './spacing';
import { typography } from './typography';

export const animation = {
  duration: {
    instant: 0,
    fast: 150,
    normal: 300,
    slow: 500,
    splash: 2000,
  },
  easing: {
    standard: 'ease-in-out',
    decelerate: 'ease-out',
    accelerate: 'ease-in',
  },
} as const;

export const zIndex = {
  base: 0,
  card: 10,
  overlay: 100,
  modal: 200,
  toast: 300,
  nav: 50,
} as const;

export const bottomNav = {
  height: 60,
  iconSize: 22,
  labelSize: 10,
  centerTabSize: 56,
  centerTabBg: colors.primary[800],
  centerTabIconColor: colors.neutral[0],
  centerTabIconSize: 28,
  activeColor: colors.primary[800],
  inactiveColor: colors.neutral[400],
  background: colors.neutral[0],
  tabs: ['Home', 'Library', 'Duaa', 'Settings'],
} as const;

export const ayahCard = {
  background: colors.gold[200],
  borderRadius: borderRadius.cardLg,
  padding: spacing.cardPaddingLg,
  arabicFontSize: typography.fontSize.arabic.md,
  arabicLineHeight: typography.lineHeight.arabic,
  translationFontSize: typography.fontSize.base,
  referenceColor: colors.gold[600],
  dayCountColor: colors.gold[600],
} as const;

export const prayerCard = {
  background: colors.primary[700],
  textColor: colors.neutral[0],
  borderRadius: borderRadius.cardLg,
  padding: spacing.cardPaddingLg,
  prayerNameSize: typography.fontSize.lg,
  prayerTimeSize: typography.fontSize.lg,
  locationTextSize: typography.fontSize.sm,
  settingsLinkColor: colors.gold[400],
} as const;

export const bookCard = {
  width: 120,
  height: 160,
  borderRadius: borderRadius.bookCover,
  titleFontSize: typography.fontSize.sm,
  authorFontSize: typography.fontSize.xs,
  authorColor: colors.neutral[600],
} as const;

export const hadithCard = {
  background: colors.neutral[0],
  borderRadius: borderRadius.cardLg,
  padding: spacing.cardPadding,
  titleSize: typography.fontSize.xl,
  bodySize: typography.fontSize.md,
  narratorSize: typography.fontSize.sm,
  narratorColor: colors.neutral[600],
  shareIconColor: colors.primary[800],
} as const;

export const langToggle = {
  activeBackground: colors.primary[800],
  activeText: colors.neutral[0],
  inactiveText: colors.neutral[600],
  borderRadius: borderRadius.full,
  fontSize: typography.fontSize.sm,
  fontWeight: typography.fontWeight.semibold,
  padding: { horizontal: 10, vertical: 4 },
} as const;

export const audioPlayer = {
  background: colors.primary[800],
  trackColor: colors.primary[600],
  thumbColor: colors.gold[600],
  iconColor: colors.neutral[0],
  timeColor: colors.neutral[0],
  height: 80,
  borderRadius: 0,
} as const;

export const statusBadge = {
  borderRadius: borderRadius.badge,
  fontSize: typography.fontSize.xs,
  fontWeight: typography.fontWeight.semibold,
  padding: { horizontal: 8, vertical: 3 },
} as const;
