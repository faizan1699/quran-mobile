import React, { useEffect } from 'react';
import { StatusBar, View, ActivityIndicator } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppNavigator from '@/navigation/AppNavigator';
import { useDeviceLocation } from '@/hooks/useDeviceLocation';
import { usePrayerAzanScheduler } from '@/hooks/usePrayerAzanScheduler';
import { useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';
import {
  applyGlobalFontScalePatch,
  setGlobalFontScale,
  setGlobalFontFamilyMap,
} from '@/theme/fontScalePatch';
import { usePreferencesStore, FONT_SCALE_VALUES } from '@/store/usePreferencesStore';
import {
  DEFAULT_ARABIC_FONT,
  DEFAULT_URDU_FONT,
  isKnownArabicFont,
  isKnownUrduFont,
} from '@/theme/scriptFonts';
import { colors } from '@/tokens';

// Patch RN's Text once so the app-wide font-size preference scales every label.
applyGlobalFontScalePatch();

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

// Only attempt automatic GPS detection once per app session so we don't
// re-prompt for permission on every re-render / fast-refresh.
let didAttemptAutoLocation = false;

function AppContent(): React.JSX.Element {
  const { theme } = useTheme();
  const { detectLocation } = useDeviceLocation();
  const [fontsLoaded, fontError] = useFonts({
    ...appFonts,
    ...Ionicons.font,
    ...MaterialCommunityIcons.font,
  });

  usePrayerAzanScheduler();

  // Keep the global text-scale multiplier in sync with the stored preference.
  // Reading it here re-renders AppContent (and the active screen) when it
  // changes, so the new size is reflected immediately.
  const fontScale = usePreferencesStore((s) => s.fontScale);
  setGlobalFontScale(FONT_SCALE_VALUES[fontScale]);

  // Live-swap the Arabic/Urdu faces app-wide: any text styled with the base
  // family is re-rendered in the user's selected font (see fontScalePatch).
  const arabicFont = usePreferencesStore((s) => s.arabicFont);
  const urduFont = usePreferencesStore((s) => s.urduFont);
  setGlobalFontFamilyMap({
    [DEFAULT_ARABIC_FONT]: isKnownArabicFont(arabicFont)
      ? arabicFont
      : DEFAULT_ARABIC_FONT,
    [DEFAULT_URDU_FONT]: isKnownUrduFont(urduFont) ? urduFont : DEFAULT_URDU_FONT,
  });

  useEffect(() => {
    if (didAttemptAutoLocation) {
      return;
    }
    didAttemptAutoLocation = true;
    void detectLocation();
  }, [detectLocation]);

  // Hold the UI on a branded splash until the custom fonts are ready, so text
  // never flashes in a fallback face before swapping to Inter/Arabic/Urdu.
  // If font loading errors out, proceed anyway with system fallback fonts so
  // the app never gets stuck on the splash.
  if (!fontsLoaded && !fontError) {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: colors.primary[900],
          justifyContent: 'center',
          alignItems: 'center',
        }}
      >
        <StatusBar barStyle="light-content" backgroundColor={colors.primary[900]} />
        <ActivityIndicator size="large" color={colors.gold[500]} />
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgPage }}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bgHeader} />
      <AppNavigator />
    </View>
  );
}

function App(): React.JSX.Element {
  return (
    <QueryClientProvider client={queryClient}>
      <SafeAreaProvider>
        <AppContent />
      </SafeAreaProvider>
    </QueryClientProvider>
  );
}

export default App;
