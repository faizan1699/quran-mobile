import { colors } from '@/tokens';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface Theme {
  mode: 'light' | 'dark';
  isDark: boolean;
  glass: boolean;
  statusBarStyle: 'light-content' | 'dark-content';

  bgPage: string;
  bgPageAlt: string;
  bgCard: string;
  bgElevated: string;
  bgMuted: string;
  bgInput: string;
  bgHeader: string;
  bgNavBar: string;

  bgCardAyah: string;
  bgCardPrayer: string;

  textPrimary: string;
  textSecondary: string;
  textMuted: string;
  textOnDark: string;
  textArabic: string;
  textGold: string;
  textBrandGreen: string;

  border: string;
  borderDivider: string;

  navActive: string;
  navInactive: string;

  accentGreen: string;
  accentGold: string;
  accentSoft: string;
  textOnAccent: string;

  overlay: string;
}

export const lightTheme: Theme = {
  mode: 'light',
  isDark: false,
  glass: false,
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
  accentSoft: colors.primary[100],
  textOnAccent: colors.neutral[0],

  overlay: 'rgba(0,0,0,0.5)',
};

export const darkTheme: Theme = {
  mode: 'dark',
  isDark: true,
  glass: false,
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
  accentSoft: 'rgba(58,158,110,0.15)',
  textOnAccent: colors.neutral[0],

  overlay: 'rgba(0,0,0,0.7)',
};

export const themes = { light: lightTheme, dark: darkTheme } as const;
