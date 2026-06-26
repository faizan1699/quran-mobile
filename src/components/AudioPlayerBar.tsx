import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
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
    togglePlay,
    skipToNext,
    skipToPrevious,
    isShuffleEnabled,
    isRepeatEnabled,
    toggleShuffle,
    toggleRepeat,
    seekTo,
  } = useAudioStore();

  // Do not render anything if no track is active
  if (!currentTrack) return null;

  const isPlaying = playbackState === State.Playing;

  // Calculate percentage for custom gold progress slider bar
  const percentComplete = duration > 0
    ? (position / duration) * 100
    : 0;

  // Manual scrubbing trigger
  const handleScrub = (percent: number) => {
    const targetSeconds = (percent / 100) * duration;
    seekTo(targetSeconds);
  };

  return (
    <View style={styles.container}>
      {/* Progress Bar Row */}
      <View style={styles.progressRow}>
        <Text style={styles.timeLabel}>
          {formatDuration(position)}
        </Text>
        <TouchableOpacity
          style={styles.sliderTrack}
          activeOpacity={0.9}
          onPress={(e) => {
            // Simple click-to-seek approximation
            const layoutWidth = 180; // approximate slider width
            const clickX = e.nativeEvent.locationX;
            const percentage = Math.max(0, Math.min(100, (clickX / layoutWidth) * 100));
            handleScrub(percentage);
          }}
        >
          <View style={[styles.sliderFill, { width: `${percentComplete}%` }]} />
          <View style={[styles.sliderThumb, { left: `${percentComplete}%` }]} />
        </TouchableOpacity>
        <Text style={styles.timeLabel}>
          {formatDuration(duration)}
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
