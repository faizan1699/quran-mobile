import React, { useMemo, useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  LayoutChangeEvent,
  PanResponder,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import {
  useAudioStore,
  State,
  usePlaybackTimeline,
  PLAYBACK_RATES,
} from '@/store/useAudioStore';
import { PlayingWaves } from '@/components/PlayingWaves';
import { useTheme, Theme } from '@/theme';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const padMins = mins < 10 ? `0${mins}` : mins;
  const padSecs = secs < 10 ? `0${secs}` : secs;
  return `${padMins}:${padSecs}`;
}

export function AudioPlayerBar(): React.JSX.Element | null {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const playbackState = useAudioStore((s) => s.playbackState);
  const togglePlay = useAudioStore((s) => s.togglePlay);
  const skipToNext = useAudioStore((s) => s.skipToNext);
  const skipToPrevious = useAudioStore((s) => s.skipToPrevious);
  const isShuffleEnabled = useAudioStore((s) => s.isShuffleEnabled);
  const isRepeatEnabled = useAudioStore((s) => s.isRepeatEnabled);
  const toggleShuffle = useAudioStore((s) => s.toggleShuffle);
  const toggleRepeat = useAudioStore((s) => s.toggleRepeat);
  const seekTo = useAudioStore((s) => s.seekTo);
  const seekGlobal = useAudioStore((s) => s.seekGlobal);
  const resetPlayer = useAudioStore((s) => s.resetPlayer);
  const playbackRate = useAudioStore((s) => s.playbackRate);
  const setPlaybackRate = useAudioStore((s) => s.setPlaybackRate);

  const timeline = usePlaybackTimeline();

  const [sliderWidth, setSliderWidth] = useState(0);
  const [isScrubbing, setIsScrubbing] = useState(false);
  const [scrubPercent, setScrubPercent] = useState(0);

  const widthRef = useRef(1);
  const startX = useRef(0);
  const seekRef = useRef({ useGlobal: false, totalDuration: 0 });
  const seekGlobalRef = useRef(seekGlobal);
  const seekToRef = useRef(seekTo);
  seekGlobalRef.current = seekGlobal;
  seekToRef.current = seekTo;

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: () => true,
      onPanResponderGrant: (evt) => {
        setIsScrubbing(true);
        startX.current = evt.nativeEvent.locationX;
        const p = Math.max(0, Math.min(1, startX.current / widthRef.current));
        setScrubPercent(p * 100);
      },
      onPanResponderMove: (_evt, gesture) => {
        const p = Math.max(0, Math.min(1, (startX.current + gesture.dx) / widthRef.current));
        setScrubPercent(p * 100);
      },
      onPanResponderRelease: (_evt, gesture) => {
        const p = Math.max(0, Math.min(1, (startX.current + gesture.dx) / widthRef.current));
        const { useGlobal: ug, totalDuration: td } = seekRef.current;
        const target = p * td;
        if (td > 0) {
          if (ug) seekGlobalRef.current(target);
          else seekToRef.current(target);
        }
        setIsScrubbing(false);
      },
      onPanResponderTerminate: () => setIsScrubbing(false),
    })
  ).current;

  if (!currentTrack) return null;

  const isPlaying = playbackState === State.Playing;
  const isBuffering = playbackState === State.Buffering;

  const { useGlobal, totalDuration, displayPosition, percent, currentIndex, queueLength } =
    timeline;
  const measuring = useGlobal && !timeline.measured;
  const canSeek = useGlobal ? timeline.measured : totalDuration > 0;

  widthRef.current = sliderWidth || 1;
  seekRef.current = { useGlobal, totalDuration };

  const onSliderLayout = (e: LayoutChangeEvent) => {
    setSliderWidth(e.nativeEvent.layout.width);
  };

  const fillPercent = isScrubbing ? scrubPercent : percent;
  const shownPosition = isScrubbing
    ? (scrubPercent / 100) * totalDuration
    : displayPosition;

  const openPlayer = () => navigation.navigate('Player');

  const cycleRate = () => {
    const idx = PLAYBACK_RATES.indexOf(playbackRate as (typeof PLAYBACK_RATES)[number]);
    const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
    setPlaybackRate(next);
  };

  const indexLabel =
    queueLength > 1 && currentIndex >= 0 ? `${currentIndex + 1}/${queueLength}` : '';
  const subtitle = currentTrack.hadithNumber
    ? `Hadith #${currentTrack.hadithNumber}`
    : currentTrack.artist ?? '';

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity
          style={styles.artwork}
          onPress={openPlayer}
          activeOpacity={0.8}
        >
          {isBuffering ? (
            <ActivityIndicator size="small" color={theme.accentGreen} />
          ) : isPlaying ? (
            <PlayingWaves color={theme.accentGreen} height={18} />
          ) : (
            <Ionicons name="musical-notes" size={20} color={theme.accentGreen} />
          )}
        </TouchableOpacity>

        <TouchableOpacity style={styles.infoCol} onPress={openPlayer} activeOpacity={0.7}>
          <Text style={styles.title} numberOfLines={1}>
            {currentTrack.title}
          </Text>
          <Text style={styles.subtitle} numberOfLines={1}>
            {subtitle}
            {subtitle && indexLabel ? '  ·  ' : ''}
            {indexLabel}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={cycleRate}
          activeOpacity={0.7}
          style={[styles.rateChip, playbackRate !== 1 && styles.rateChipActive]}
          hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
        >
          <Text style={[styles.rateText, playbackRate !== 1 && styles.rateTextActive]}>
            {playbackRate}×
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={resetPlayer}
          activeOpacity={0.7}
          style={styles.closeButton}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="close" size={18} color={theme.textMuted} />
        </TouchableOpacity>
      </View>

      <View style={styles.progressRow}>
        <Text style={styles.timeLabel}>{formatDuration(shownPosition)}</Text>
        <View
          style={styles.sliderHitbox}
          onLayout={onSliderLayout}
          {...(canSeek ? panResponder.panHandlers : {})}
        >
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${fillPercent}%` }]} />
            {canSeek && (
              <View
                style={[
                  styles.sliderThumb,
                  { left: `${fillPercent}%` },
                  isScrubbing && styles.sliderThumbActive,
                ]}
              />
            )}
          </View>
        </View>
        {measuring ? (
          <View style={[styles.timeLabel, styles.timeLabelLoading]}>
            <ActivityIndicator size="small" color={theme.textMuted} />
          </View>
        ) : (
          <Text style={styles.timeLabel}>{formatDuration(totalDuration)}</Text>
        )}
      </View>

      <View style={styles.controlsRow}>
        <TouchableOpacity onPress={toggleShuffle} activeOpacity={0.7} style={styles.iconButton}>
          <Ionicons
            name="shuffle"
            size={20}
            color={isShuffleEnabled ? theme.accentGreen : theme.textMuted}
          />
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToPrevious} activeOpacity={0.7} style={styles.iconButton}>
          <Ionicons name="play-skip-back" size={22} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={togglePlay} activeOpacity={0.85} style={styles.playButton}>
          {isBuffering ? (
            <ActivityIndicator size="small" color={colors.neutral[0]} />
          ) : (
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={26} color={colors.neutral[0]} />
          )}
        </TouchableOpacity>

        <TouchableOpacity onPress={skipToNext} activeOpacity={0.7} style={styles.iconButton}>
          <Ionicons name="play-skip-forward" size={22} color={theme.textPrimary} />
        </TouchableOpacity>

        <TouchableOpacity onPress={toggleRepeat} activeOpacity={0.7} style={styles.iconButton}>
          <Ionicons
            name="repeat"
            size={20}
            color={isRepeatEnabled ? theme.accentGreen : theme.textMuted}
          />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      backgroundColor: theme.bgCard,
      borderTopLeftRadius: borderRadius.card,
      borderTopRightRadius: borderRadius.card,
      borderTopWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing[3],
      paddingBottom: spacing[3],
      gap: spacing[2],
      ...shadows.lg,
    },
    topRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    artwork: {
      width: 46,
      height: 46,
      borderRadius: borderRadius.button,
      backgroundColor: theme.accentSoft,
      justifyContent: 'center',
      alignItems: 'center',
    },
    infoCol: {
      flex: 1,
      justifyContent: 'center',
    },
    title: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    subtitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      marginTop: 2,
    },
    rateChip: {
      minWidth: 38,
      paddingHorizontal: spacing[2],
      paddingVertical: 4,
      borderRadius: borderRadius.full,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.bgMuted,
      alignItems: 'center',
    },
    rateChipActive: {
      borderColor: theme.accentGreen,
      backgroundColor: theme.accentSoft,
    },
    rateText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
    },
    rateTextActive: {
      color: theme.accentGreen,
    },
    closeButton: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    timeLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: 10,
      color: theme.textMuted,
      width: 38,
      textAlign: 'center',
    },
    timeLabelLoading: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    sliderHitbox: {
      flex: 1,
      paddingVertical: 10,
      justifyContent: 'center',
    },
    sliderTrack: {
      width: '100%',
      height: 4,
      backgroundColor: theme.borderDivider,
      borderRadius: 2,
      position: 'relative',
    },
    sliderFill: {
      height: '100%',
      backgroundColor: theme.accentGreen,
      borderRadius: 2,
    },
    sliderThumb: {
      position: 'absolute',
      width: 12,
      height: 12,
      borderRadius: 6,
      backgroundColor: theme.accentGreen,
      top: -4,
      marginLeft: -6,
    },
    sliderThumbActive: {
      width: 18,
      height: 18,
      borderRadius: 9,
      top: -7,
      marginLeft: -9,
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingHorizontal: spacing[2],
    },
    iconButton: {
      width: 44,
      height: 44,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      width: 52,
      height: 52,
      borderRadius: 26,
      backgroundColor: theme.accentGreen,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.sm,
    },
  });

export default AudioPlayerBar;
