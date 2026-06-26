import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  LayoutChangeEvent,
  PanResponder,
} from 'react-native';
import { useAudioStore, State } from '@/store/useAudioStore';
import { colors, spacing, typography } from '@/tokens';

// Helper to format seconds to MM:SS string
function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const padMins = mins < 10 ? `0${mins}` : mins;
  const padSecs = secs < 10 ? `0${secs}` : secs;
  return `${padMins}:${padSecs}`;
}

export function AudioPlayerBar(): React.JSX.Element | null {
  const {
    currentTrack,
    playbackState,
    position,
    duration,
    queue,
    durations,
    togglePlay,
    skipToNext,
    skipToPrevious,
    isShuffleEnabled,
    isRepeatEnabled,
    toggleShuffle,
    toggleRepeat,
    seekTo,
    seekGlobal,
  } = useAudioStore();

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
        if (ug) seekGlobalRef.current(target);
        else seekToRef.current(target);
        setIsScrubbing(false);
      },
      onPanResponderTerminate: () => setIsScrubbing(false),
    })
  ).current;

  // Do not render anything if no track is active
  if (!currentTrack) return null;

  const isPlaying = playbackState === State.Playing;

  const currentIndex = queue.findIndex((t) => t.id === currentTrack.id);
  const allDurationsKnown =
    queue.length > 0 && queue.every((t) => (durations[t.id] || 0) > 0);
  const useGlobal = allDurationsKnown && currentIndex >= 0;

  const elapsedBefore = useGlobal
    ? queue.slice(0, currentIndex).reduce((sum, t) => sum + (durations[t.id] || 0), 0)
    : 0;
  const totalDuration = useGlobal
    ? queue.reduce((sum, t) => sum + (durations[t.id] || 0), 0)
    : duration;
  const displayPosition = useGlobal ? elapsedBefore + position : position;

  const percentComplete =
    totalDuration > 0 ? Math.min(100, (displayPosition / totalDuration) * 100) : 0;

  widthRef.current = sliderWidth || 1;
  seekRef.current = { useGlobal, totalDuration };

  const onSliderLayout = (e: LayoutChangeEvent) => {
    setSliderWidth(e.nativeEvent.layout.width);
  };

  const fillPercent = isScrubbing ? scrubPercent : percentComplete;
  const shownPosition = isScrubbing
    ? (scrubPercent / 100) * totalDuration
    : displayPosition;

  return (
    <View style={styles.container}>
      {/* Progress Bar Row */}
      <View style={styles.progressRow}>
        <Text style={styles.timeLabel}>
          {formatDuration(shownPosition)}
        </Text>
        <View
          style={styles.sliderHitbox}
          onLayout={onSliderLayout}
          {...panResponder.panHandlers}
        >
          <View style={styles.sliderTrack}>
            <View style={[styles.sliderFill, { width: `${fillPercent}%` }]} />
            <View
              style={[
                styles.sliderThumb,
                { left: `${fillPercent}%` },
                isScrubbing && styles.sliderThumbActive,
              ]}
            />
          </View>
        </View>
        <Text style={styles.timeLabel}>
          {formatDuration(totalDuration)}
        </Text>
      </View>

      {/* Control Actions Row */}
      <View style={styles.controlsRow}>
        {/* Shuffle Button */}
        <TouchableOpacity onPress={toggleShuffle} activeOpacity={0.7} style={styles.iconButton}>
          <Text style={[styles.icon, isShuffleEnabled && styles.iconActive]}>🔀</Text>
        </TouchableOpacity>

        {/* Previous Button */}
        <TouchableOpacity onPress={skipToPrevious} activeOpacity={0.7} style={styles.iconButton}>
          <Text style={styles.icon}>⏮</Text>
        </TouchableOpacity>

        {/* Play/Pause Button */}
        <TouchableOpacity 
          onPress={togglePlay} 
          activeOpacity={0.7} 
          style={styles.playButton}
        >
          <Text style={styles.playIcon}>
            {isPlaying ? '⏸' : '▶️'}
          </Text>
        </TouchableOpacity>

        {/* Next Button */}
        <TouchableOpacity onPress={skipToNext} activeOpacity={0.7} style={styles.iconButton}>
          <Text style={styles.icon}>⏭</Text>
        </TouchableOpacity>

        {/* Repeat Button */}
        <TouchableOpacity onPress={toggleRepeat} activeOpacity={0.7} style={styles.iconButton}>
          <Text style={[styles.icon, isRepeatEnabled && styles.iconActive]}>🔁</Text>
        </TouchableOpacity>
      </View>

      {/* Meta details text */}
      <Text style={styles.metaText} numberOfLines={1}>
        {currentTrack.hadithNumber
          ? `Hadith #${currentTrack.hadithNumber}: ${currentTrack.title}`
          : currentTrack.artist
          ? `${currentTrack.title}  ·  ${currentTrack.artist}`
          : currentTrack.title}
        {queue.length > 1 && currentIndex >= 0
          ? `  ·  ${currentIndex + 1}/${queue.length}`
          : ''}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    height: 90,
    backgroundColor: colors.primary[800],
    borderTopWidth: 1,
    borderTopColor: colors.primary[700],
    paddingHorizontal: spacing.pagePadding,
    justifyContent: 'center',
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  progressRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  timeLabel: {
    fontFamily: typography.fontFamily.english,
    fontSize: 10,
    color: colors.neutral[0],
    width: 35,
    textAlign: 'center',
  },
  sliderHitbox: {
    flex: 1,
    paddingVertical: 12,
    justifyContent: 'center',
  },
  sliderTrack: {
    width: '100%',
    height: 4,
    backgroundColor: colors.primary[600],
    borderRadius: 2,
    position: 'relative',
  },
  sliderFill: {
    height: '100%',
    backgroundColor: colors.gold[600],
    borderRadius: 2,
  },
  sliderThumb: {
    position: 'absolute',
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.gold[600],
    top: -3,
    marginLeft: -5,
  },
  sliderThumbActive: {
    width: 16,
    height: 16,
    borderRadius: 8,
    top: -6,
    marginLeft: -8,
  },
  controlsRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 32,
  },
  iconButton: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  icon: {
    fontSize: 18,
    color: colors.neutral[200],
  },
  iconActive: {
    color: colors.gold[500],
  },
  playButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.neutral[0],
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 2,
  },
  playIcon: {
    fontSize: 16,
    color: colors.primary[800],
  },
  metaText: {
    fontFamily: typography.fontFamily.english,
    fontSize: 10,
    color: colors.neutral[200],
    textAlign: 'center',
    marginTop: 4,
    opacity: 0.8,
  },
});
export default AudioPlayerBar;
