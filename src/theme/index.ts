import { useEffect, useState } from 'react';
import { Appearance, ColorSchemeName } from 'react-native';
import { useThemeStore } from './useThemeStore';
import { lightTheme, darkTheme, Theme, ThemeMode } from './themes';

export type { Theme, ThemeMode };
export { lightTheme, darkTheme, themes } from './themes';
export { useThemeStore } from './useThemeStore';

/**
 * Returns the active theme palette plus controls for changing it.
 *
 * - `theme`   — the resolved palette (light/dark) for the active mode.
 * - `mode`    — the user's stored preference ('light' | 'dark' | 'system').
 * - `isDark`  — convenience flag for the resolved palette.
 * - `setMode` — persist a new preference.
 *
 * When `mode` is 'system' the OS appearance is followed live (the hook
 * re-renders on appearance changes).
 */
export function useTheme(): {
  theme: Theme;
  mode: ThemeMode;
  isDark: boolean;
  setMode: (mode: ThemeMode) => void;
} {
  const mode = useThemeStore((s) => s.mode);
  const setMode = useThemeStore((s) => s.setMode);

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

  const resolved = mode === 'system' ? (systemScheme === 'dark' ? 'dark' : 'light') : mode;
  const theme = resolved === 'dark' ? darkTheme : lightTheme;

  return { theme, mode, isDark: resolved === 'dark', setMode };
}
