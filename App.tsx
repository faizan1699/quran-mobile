import React, { useEffect } from 'react';
import { StatusBar, View, Text } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useFonts } from 'expo-font';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import AppNavigator from '@/navigation/AppNavigator';
import { ShareProvider } from '@/components/share/ShareProvider';
import { useDeviceLocation } from '@/hooks/useDeviceLocation';
import { usePrayerAzanScheduler } from '@/hooks/usePrayerAzanScheduler';
import { useReminderScheduler } from '@/hooks/useReminderScheduler';
import { useAdminPrayerSettings } from '@/hooks/useAdminPrayerSettings';
import { useTheme } from '@/theme';
import { appFonts } from '@/theme/fonts';
import {
  applyGlobalFontScalePatch,
  setScriptFontScales,
} from '@/theme/fontScalePatch';
import { usePreferencesStore, FONT_SCALE_VALUES } from '@/store/usePreferencesStore';
import { applySelectedFonts } from '@/theme/scriptFonts';
import { colors } from '@/tokens';
import SplashBackground from '@/components/splash/SplashBackground';
import SplashBadge from '@/components/splash/SplashBadge';

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
  useReminderScheduler();
  useAdminPrayerSettings();

  // Keep the per-script text-scale multipliers in sync with the stored
  // preference. Reading them here re-renders AppContent (and the active screen)
  // when they change, so the new size is reflected immediately.
  const arabicFontScale = usePreferencesStore((s) => s.arabicFontScale);
  const urduFontScale = usePreferencesStore((s) => s.urduFontScale);
  const englishFontScale = usePreferencesStore((s) => s.englishFontScale);
  setScriptFontScales({
    arabic: FONT_SCALE_VALUES[arabicFontScale],
    urdu: FONT_SCALE_VALUES[urduFontScale],
    english: FONT_SCALE_VALUES[englishFontScale],
  });

  // Live-swap the Arabic/Urdu/English faces app-wide: any text styled with a
  // base family is re-rendered in the user's selected font (see fontScalePatch).
  const arabicFont = usePreferencesStore((s) => s.arabicFont);
  const urduFont = usePreferencesStore((s) => s.urduFont);
  const englishFont = usePreferencesStore((s) => s.englishFont);
  applySelectedFonts(arabicFont, urduFont, englishFont);

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
      <View style={{ flex: 1 }}>
        <StatusBar barStyle="light-content" backgroundColor={colors.splash.gradient[0]} translucent />
        <SplashBackground>
          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
            <SplashBadge size={138} />
            <Text
              style={{
                fontFamily: 'Amiri',
                fontSize: 48,
                lineHeight: 72,
                marginTop: 40,
                color: colors.splash.title,
                textAlign: 'center',
              }}
            >
              القرآن الكريم
            </Text>
          </View>
        </SplashBackground>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: theme.bgPage }}>
      <StatusBar barStyle={theme.statusBarStyle} backgroundColor={theme.bgHeader} />
      <ShareProvider>
        <AppNavigator />
      </ShareProvider>
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
