import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, LayoutChangeEvent } from 'react-native';
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

  const onSliderLayout = (e: LayoutChangeEvent) => {
    setSliderWidth(e.nativeEvent.layout.width);
  };

  const handleScrub = (clickX: number) => {
    const width = sliderWidth || 1;
    const percent = Math.max(0, Math.min(1, clickX / width));
    const targetSeconds = percent * totalDuration;
    if (useGlobal) {
      seekGlobal(targetSeconds);
    } else {
      seekTo(targetSeconds);
    }
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar Row */}
      <View style={styles.progressRow}>
        <Text style={styles.timeLabel}>
          {formatDuration(displayPosition)}
        </Text>
        <TouchableOpacity
          style={styles.sliderTrack}
          activeOpacity={0.9}
          onLayout={onSliderLayout}
          onPress={(e) => handleScrub(e.nativeEvent.locationX)}
        >
          <View style={[styles.sliderFill, { width: `${percentComplete}%` }]} />
          <View style={[styles.sliderThumb, { left: `${percentComplete}%` }]} />
        </TouchableOpacity>
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
  sliderTrack: {
    flex: 1,
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
