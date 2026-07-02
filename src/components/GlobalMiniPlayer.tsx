import React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAudioStore } from '@/store/useAudioStore';
import { MiniPlayerBar } from '@/components/MiniPlayerBar';
import { useTheme, Theme } from '@/theme';

interface GlobalMiniPlayerProps {
  rootRoute?: string;
  navRef: { isReady?: () => boolean; navigate: (name: string) => void };
}

const ROUTES_WITH_OWN_PLAYER = new Set([
  'MainTabs',
  'Reader',
  'QuranReader',
  'Player',
  'Splash',
  'Auth',
]);

export function GlobalMiniPlayer({
  rootRoute,
  navRef,
}: GlobalMiniPlayerProps): React.JSX.Element | null {
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const currentTrack = useAudioStore((s) => s.currentTrack);

  if (!currentTrack) return null;
  if (!rootRoute || ROUTES_WITH_OWN_PLAYER.has(rootRoute)) return null;

  const open = () => {
    if (navRef?.isReady?.()) navRef.navigate('Player');
  };

  return (
    <View style={[styles.overlay, { paddingBottom: insets.bottom }]}>
      <MiniPlayerBar onOpen={open} />
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    overlay: {
      position: 'absolute',
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: theme.bgElevated,
      zIndex: 40,
      elevation: 12,
    },
  });

export default GlobalMiniPlayer;
