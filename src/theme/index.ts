import { useEffect, useMemo, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { useThemeStore } from './useThemeStore';
import { lightTheme, darkTheme, Theme, ThemeMode } from './themes';
import {
  darken,
  isLight,
  lighten,
  mix,
  readableText,
  withAlpha,
} from './colorUtils';

export type { Theme, ThemeMode };
export { lightTheme, darkTheme, themes } from './themes';
export { useThemeStore } from './useThemeStore';

function applyBackground(theme: Theme, background: string): Theme {
  const lightBg = isLight(background);
  const textPrimary = lightBg ? '#111111' : '#F1F5F2';
  const textSecondary = lightBg ? mix(textPrimary, background, 0.4) : '#C2CFC8';
  const textMuted = lightBg ? mix(textPrimary, background, 0.62) : '#8B998F';

  return {
    ...theme,
    mode: lightBg ? 'light' : 'dark',
    isDark: !lightBg,
    statusBarStyle: lightBg ? 'dark-content' : 'light-content',
    bgPage: background,
    bgPageAlt: lightBg ? darken(background, 0.08) : darken(background, 0.12),
    bgCard: lightBg ? mix(background, '#FFFFFF', 0.55) : lighten(background, 0.06),
    bgElevated: lightBg ? mix(background, '#FFFFFF', 0.72) : lighten(background, 0.1),
    bgMuted: lightBg ? darken(background, 0.05) : lighten(background, 0.04),
    bgInput: lightBg ? darken(background, 0.05) : lighten(background, 0.04),
    bgHeader: lightBg ? mix(background, '#FFFFFF', 0.4) : darken(background, 0.04),
    bgNavBar: lightBg ? mix(background, '#FFFFFF', 0.4) : darken(background, 0.04),
    textPrimary,
    textArabic: textPrimary,
    textSecondary,
    textMuted,
    textOnDark: '#FFFFFF',
    border: lightBg ? darken(background, 0.12) : lighten(background, 0.14),
    borderDivider: lightBg ? darken(background, 0.08) : lighten(background, 0.1),
    overlay: lightBg ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0.7)',
  };
}

function applyAccent(theme: Theme, accent: string): Theme {
  return {
    ...theme,
    accentGreen: accent,
    navActive: accent,
    textBrandGreen: accent,
    bgCardPrayer: accent,
    accentSoft: theme.isDark
      ? withAlpha(accent, 0.2)
      : mix(accent, '#FFFFFF', 0.84),
    textOnAccent: readableText(accent),
  };
}

function applyGlass(theme: Theme): Theme {
  return {
    ...theme,
    glass: true,
    bgCard: withAlpha(theme.bgCard, 0.62),
    bgElevated: withAlpha(theme.bgElevated, 0.7),
    bgMuted: withAlpha(theme.bgMuted, 0.55),
    bgInput: withAlpha(theme.bgInput, 0.55),
    bgHeader: withAlpha(theme.bgHeader, 0.8),
    bgNavBar: withAlpha(theme.bgNavBar, 0.8),
  };
}

function deriveTheme(
  base: Theme,
  accentColor: string | null,
  backgroundColor: string | null,
  glass: boolean
): Theme {
  let theme = base;
  if (backgroundColor) {
    theme = applyBackground(theme, backgroundColor);
  }
  if (accentColor) {
    theme = applyAccent(theme, accentColor);
  }
  if (glass) {
    theme = applyGlass(theme);
  }
  return theme;
}

export function useTheme(): {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  accentColor: string | null;
  backgroundColor: string | null;
  glass: boolean;
  setMode: (mode: ThemeMode) => void;
  setAccentColor: (color: string | null) => void;
  setBackgroundColor: (color: string | null) => void;
  setGlass: (glass: boolean) => void;
  resetAppearance: () => void;
} {
  const mode = useThemeStore((s) => s.mode);
  const accentColor = useThemeStore((s) => s.accentColor);
  const backgroundColor = useThemeStore((s) => s.backgroundColor);
  const glass = useThemeStore((s) => s.glass);
  const setMode = useThemeStore((s) => s.setMode);
  const setAccentColor = useThemeStore((s) => s.setAccentColor);
  const setBackgroundColor = useThemeStore((s) => s.setBackgroundColor);
  const setGlass = useThemeStore((s) => s.setGlass);
  const resetAppearance = useThemeStore((s) => s.resetAppearance);

  const [systemScheme, setSystemScheme] = useState<ColorSchemeName>(
    Appearance.getColorScheme()
  );

  useEffect(() => {
    if (mode !== 'system') return;
    const sub = Appearance.addChangeListener(({ colorScheme }) =>
      setSystemScheme(colorScheme)
    );
    return () => sub.remove();
  }, [mode]);

  const resolved =
    mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const base = resolved === 'dark' ? darkTheme : lightTheme;

  const theme = useMemo(() => {
    if (!accentColor && !backgroundColor && !glass) {
      return base;
    }
    return deriveTheme(base, accentColor, backgroundColor, glass);
  }, [base, accentColor, backgroundColor, glass]);

  return {
    theme,
    mode,
    isDark: theme.isDark,
    accentColor,
    backgroundColor,
    glass,
    setMode,
    setAccentColor,
    setBackgroundColor,
    setGlass,
    resetAppearance,
  };
}
