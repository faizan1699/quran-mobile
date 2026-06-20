import { colors } from '@/tokens';

/**
 * Theme system for light / dark mode.
 *
 * `semanticColors` in the tokens layer is the static (light-only) palette that
 * predates theming. This module promotes those semantics into two concrete
 * palettes (`lightTheme` / `darkTheme`) that share an identical shape, so a
 * screen consuming `theme.x` reads the right value for the active mode.
 *
 * Brand accents (greens in `colors.primary`, golds in `colors.gold`) are kept
 * as-is and used directly — they're on-brand and read well on both surfaces.
 * Only the neutral surfaces / text / borders flip between modes.
 */
export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  /** Resolved mode (never 'system'). */
  mode: 'light' | 'dark';
  isDark: boolean;
  statusBarStyle: 'light-content' | 'dark-content';

  // Surfaces
  bgPage: string;
  /** Deep brand-green hero background (Home scroll area, splash). */
  bgPageAlt: string;
  bgCard: string;
  bgElevated: string;
  bgMuted: string;
  bgInput: string;
  bgHeader: string;
  bgNavBar: string;

  // Branded card surfaces
  bgCardAyah: string;
  bgCardPrayer: string;

  // Text
  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  /** Always-light text used on top of dark/brand surfaces. */
  textOnDark: string;
  textArabic: string;
  textGold: string;
  textBrandGreen: string;

  // Borders
  border: string;
  borderDivider: string;

  // Navigation
  navActive: string;
  navInactive: string;

  // Brand accents (constant across modes, surfaced here for convenience)
  accentGreen: string;
  accentGold: string;

  overlay: string;
}

export const lightTheme: Theme = {
  mode: 'light',
  isDark: false,
  statusBarStyle: 'dark-content',

  bgPage: colors.neutral[50],
  bgPageAlt: colors.primary[900],
  bgCard: colors.neutral[0],
  bgElevated: colors.neutral[0],
  bgMuted: colors.neutral[100],
  bgInput: colors.neutral[100],
  bgHeader: colors.neutral[0],
  bgNavBar: colors.neutral[0],

  bgCardAyah: colors.gold[200],
  bgCardPrayer: colors.primary[700],

  textPrimary: colors.neutral[900],
  textSecondary: colors.neutral[600],
  textMuted: colors.neutral[400],
  textOnDark: colors.neutral[0],
  textArabic: colors.neutral[900],
  textGold: colors.gold[600],
  textBrandGreen: colors.primary[800],

  border: colors.neutral[200],
  borderDivider: colors.neutral[200],

  navActive: colors.primary[800],
  navInactive: colors.neutral[400],

  accentGreen: colors.primary[600],
  accentGold: colors.gold[600],

  overlay: 'rgba(0,0,0,0.5)',
};

export const darkTheme: Theme = {
  mode: 'dark',
  isDark: true,
  statusBarStyle: 'light-content',

  bgPage: '#0B1410',
  bgPageAlt: '#08110C',
  bgCard: '#14201A',
  bgElevated: '#1B2A23',
  bgMuted: '#1A2620',
  bgInput: '#1A2620',
  bgHeader: '#0F1A14',
  bgNavBar: '#0F1A14',

  bgCardAyah: '#241F0E',
  bgCardPrayer: colors.primary[800],

  textPrimary: '#F1F5F2',
  textSecondary: '#AFBDB4',
  textMuted: '#73827A',
  textOnDark: colors.neutral[0],
  textArabic: '#F1F5F2',
  textGold: colors.gold[400],
  textBrandGreen: colors.primary[500],

  border: '#26362D',
  borderDivider: '#1F2D26',

  navActive: colors.primary[500],
  navInactive: '#6B7A72',

  accentGreen: colors.primary[500],
  accentGold: colors.gold[500],

  overlay: 'rgba(0,0,0,0.7)',
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
