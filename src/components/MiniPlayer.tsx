import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useAudioStore, State, usePlaybackTimeline } from '@/store/useAudioStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { useTheme, Theme } from '@/theme';
import { typography, spacing, shadows } from '@/tokens';

export function MiniPlayer(): React.JSX.Element | null {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackState = useAudioStore((s) => s.playbackState);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const resetPlayer = useAudioStore((s) => s.resetPlayer);
  const autoOpenPlayer = usePreferencesStore((s) => s.autoOpenPlayer);
  const timeline = usePlaybackTimeline();

  const hadTrack = React.useRef(false);
  React.useEffect(() => {
    const hasTrack = currentTrack != null;
    if (hasTrack && !hadTrack.current && autoOpenPlayer) {
      navigation.navigate('Player');
    }
    hadTrack.current = hasTrack;
  }, [currentTrack, autoOpenPlayer, navigation]);

  if (!currentTrack) return null;

  const isPlaying = playbackState === State.Playing;
  const isBuffering = playbackState === State.Buffering;
  const open = () => navigation.navigate('Player');
  const label = currentTrack.subtitle || currentTrack.title;

  return (
    <View style={styles.wrap}>
      <View style={styles.progress}>
        <View style={[styles.progressFill, { width: `${timeline.percent}%` }]} />
      </View>
      <View style={styles.row}>
        <TouchableOpacity style={styles.playBtn} onPress={togglePlay} activeOpacity={0.85}>
          <Text style={styles.playIcon}>{isBuffering ? '…' : isPlaying ? '⏸' : '▶️'}</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.meta} onPress={open} activeOpacity={0.7}>
          <Text style={styles.title} numberOfLines={1}>
            {label}
          </Text>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={open}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.expandIcon}>⌃</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.iconBtn}
          onPress={resetPlayer}
          activeOpacity={0.7}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Text style={styles.closeIcon}>✕</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      backgroundColor: theme.bgElevated,
      borderTopWidth: 1,
      borderTopColor: theme.border,
      ...shadows.sm,
    },
    progress: {
      height: 2,
      width: '100%',
      backgroundColor: theme.borderDivider,
    },
    progressFill: {
      height: '100%',
      backgroundColor: theme.accentGreen,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      gap: spacing[2],
    },
    playBtn: {
      width: 38,
      height: 38,
      borderRadius: 19,
      backgroundColor: theme.accentGreen,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playIcon: {
      fontSize: 16,
      color: '#FFFFFF',
    },
    meta: {
      flex: 1,
    },
    title: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    artist: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      marginTop: 1,
    },
    iconBtn: {
      width: 34,
      height: 34,
      justifyContent: 'center',
      alignItems: 'center',
    },
    expandIcon: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.textSecondary,
    },
    closeIcon: {
      fontSize: 16,
      color: theme.textMuted,
    },
  });

export default MiniPlayer;
