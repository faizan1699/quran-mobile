import React, { useRef, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  LayoutChangeEvent,
  PanResponder,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import {
  useAudioStore,
  State,
  usePlaybackTimeline,
  PLAYBACK_RATES,
} from '@/store/useAudioStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { AyahArabic } from '@/components/AyahArabic';
import { Icon } from '@/components/Icon';
import { useTheme, Theme } from '@/theme';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';

function formatDuration(seconds: number): string {
  if (isNaN(seconds) || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  const padMins = mins < 10 ? `0${mins}` : mins;
  const padSecs = secs < 10 ? `0${secs}` : secs;
  return `${padMins}:${padSecs}`;
}

export default function PlayerScreen(): React.JSX.Element | null {
  const navigation = useNavigation<any>();
  const { language } = useTranslation();
  const { theme } = useTheme();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

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

  const autoPlayNextSurah = usePreferencesStore((s) => s.autoPlayNextSurah);
  const setPref = usePreferencesStore((s) => s.setPref);

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

  if (!currentTrack) {
    return null;
  }

  const isPlaying = playbackState === State.Playing;
  const isBuffering = playbackState === State.Buffering;

  const canSeek = timeline.useGlobal ? timeline.measured : timeline.totalDuration > 0;
  widthRef.current = sliderWidth || 1;
  seekRef.current = { useGlobal: timeline.useGlobal, totalDuration: timeline.totalDuration };

  const onSliderLayout = (e: LayoutChangeEvent) => setSliderWidth(e.nativeEvent.layout.width);

  const fillPercent = isScrubbing ? scrubPercent : timeline.percent;
  const shownPosition = isScrubbing
    ? (scrubPercent / 100) * timeline.totalDuration
    : timeline.displayPosition;
  const measuring = timeline.useGlobal && !timeline.measured;

  const minimize = () => navigation.goBack();
  const close = () => {
    resetPlayer();
    navigation.goBack();
  };

  const cycleRate = () => {
    const idx = PLAYBACK_RATES.indexOf(playbackRate as (typeof PLAYBACK_RATES)[number]);
    const next = PLAYBACK_RATES[(idx + 1) % PLAYBACK_RATES.length];
    setPlaybackRate(next);
  };

  const translation = currentTrack.translation;
  const isUrdu = language === 'ur';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerBtn}
          onPress={minimize}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.headerChevron}>⌄</Text>
          <Text style={styles.headerBtnText}>{isUrdu ? 'چھوٹا کریں' : 'Minimize'}</Text>
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{isUrdu ? 'ابھی چل رہا ہے' : 'Now Playing'}</Text>

        <TouchableOpacity
          style={styles.headerBtn}
          onPress={close}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Text style={styles.headerClose}>✕</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.body}>
        {!!currentTrack.subtitle && (
          <View style={styles.subtitleBadge}>
            <Text style={styles.subtitleText} numberOfLines={1}>
              {currentTrack.subtitle}
            </Text>
          </View>
        )}

        <ScrollView
          style={styles.textScroll}
          contentContainerStyle={styles.textScrollContent}
          showsVerticalScrollIndicator={false}
        >
          <AyahArabic
            trackId={currentTrack.id}
            words={currentTrack.words}
            plainText={currentTrack.arabic || currentTrack.title}
            textStyle={styles.arabic}
            activeStyle={styles.arabicActive}
          />

          {!!translation && (
            <Text
              style={[styles.translation, isUrdu && styles.translationUrdu]}
            >
              {translation}
            </Text>
          )}
        </ScrollView>

        <View style={styles.metaRow}>
          <Text style={styles.artist} numberOfLines={1}>
            {currentTrack.artist}
          </Text>
          {timeline.queueLength > 1 && timeline.currentIndex >= 0 && (
            <Text style={styles.indexText}>
              {timeline.currentIndex + 1} / {timeline.queueLength}
            </Text>
          )}
        </View>
      </View>

      <View style={styles.footer}>
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
              <ActivityIndicator size="small" color={theme.textSecondary} />
            </View>
          ) : (
            <Text style={styles.timeLabel}>
              {formatDuration(timeline.totalDuration)}
            </Text>
          )}
        </View>

        {measuring && (
          <Text style={styles.measuringText}>
            {isUrdu ? 'مکمل دورانیہ شمار ہو رہا ہے…' : 'Calculating full duration…'}
          </Text>
        )}

        <View style={styles.optionsRow}>
          <View style={styles.optionGroup}>
            <Text style={styles.speedLabel} numberOfLines={1}>
              {isUrdu ? 'رفتار' : 'Speed'}
            </Text>
            <TouchableOpacity
              style={[styles.speedPill, playbackRate !== 1 && styles.speedPillActive]}
              onPress={cycleRate}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.speedText, playbackRate !== 1 && styles.speedTextActive]}
              >
                {playbackRate}×
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.optionGroup}>
            <Text style={styles.speedLabel} numberOfLines={1}>
              {isUrdu ? 'اگلی سورت خودکار' : 'Auto-next'}
            </Text>
            <TouchableOpacity
              style={[styles.speedPill, autoPlayNextSurah && styles.speedPillActive]}
              onPress={() => setPref('autoPlayNextSurah', !autoPlayNextSurah)}
              activeOpacity={0.8}
            >
              <Text
                style={[styles.speedText, autoPlayNextSurah && styles.speedTextActive]}
              >
                {autoPlayNextSurah ? (isUrdu ? 'آن' : 'On') : (isUrdu ? 'آف' : 'Off')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.controlsRow}>
          <TouchableOpacity
            onPress={toggleShuffle}
            activeOpacity={0.8}
            style={[styles.sideButton, isShuffleEnabled && styles.sideButtonActive]}
          >
            <Icon
              name="shuffle"
              size={20}
              color={isShuffleEnabled ? theme.accentGreen : theme.textMuted}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={skipToPrevious} activeOpacity={0.7} style={styles.skipButton}>
            <Icon name="play-skip-back" size={26} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity onPress={togglePlay} activeOpacity={0.85} style={styles.playButton}>
            <Icon
              name={isBuffering ? 'hourglass-outline' : isPlaying ? 'pause' : 'play'}
              size={30}
              color={colors.neutral[0]}
              style={!isPlaying && !isBuffering ? styles.playGlyphOffset : undefined}
            />
          </TouchableOpacity>

          <TouchableOpacity onPress={skipToNext} activeOpacity={0.7} style={styles.skipButton}>
            <Icon name="play-skip-forward" size={26} color={theme.textPrimary} />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={toggleRepeat}
            activeOpacity={0.8}
            style={[styles.sideButton, isRepeatEnabled && styles.sideButtonActive]}
          >
            <Icon
              name="repeat"
              size={20}
              color={isRepeatEnabled ? theme.accentGreen : theme.textMuted}
            />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bgPage,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.pagePadding,
      paddingVertical: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.borderDivider,
    },
    headerBtn: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minWidth: 90,
    },
    headerChevron: {
      fontSize: 20,
      color: theme.textBrandGreen,
      lineHeight: 20,
    },
    headerBtnText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textBrandGreen,
    },
    headerTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
      letterSpacing: 0.5,
    },
    headerClose: {
      fontSize: 20,
      color: theme.textSecondary,
      textAlign: 'right',
      minWidth: 90,
    },
    body: {
      flex: 1,
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing[4],
      alignItems: 'center',
    },
    subtitleBadge: {
      backgroundColor: theme.accentSoft,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing[4],
      paddingVertical: 6,
      maxWidth: '100%',
    },
    subtitleText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.accentGreen,
    },
    textScroll: {
      flex: 1,
      width: '100%',
      marginTop: spacing[5],
    },
    textScrollContent: {
      flexGrow: 1,
      justifyContent: 'center',
      paddingVertical: spacing[4],
    },
    arabic: {
      fontFamily: typography.fontFamily.arabic,
      fontSize: typography.fontSize.arabic.lg,
      lineHeight: typography.fontSize.arabic.lg * typography.lineHeight.arabic,
      color: theme.textArabic,
      textAlign: 'center',
      writingDirection: 'rtl',
    },
    arabicActive: {
      color: colors.gold[500],
    },
    translation: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md,
      lineHeight: typography.fontSize.md * typography.lineHeight.normal,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing[5],
    },
    translationUrdu: {
      fontFamily: typography.fontFamily.urdu,
      writingDirection: 'rtl',
      lineHeight: typography.fontSize.md * typography.lineHeight.urdu,
    },
    metaRow: {
      width: '100%',
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingTop: spacing[3],
    },
    artist: {
      flex: 1,
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textMuted,
    },
    indexText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textMuted,
    },
    footer: {
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing[3],
      paddingBottom: spacing[4],
      borderTopWidth: 1,
      borderTopColor: theme.borderDivider,
      backgroundColor: theme.bgCard,
      ...shadows.sm,
    },
    progressRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 8,
    },
    timeLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      width: 44,
      textAlign: 'center',
    },
    timeLabelLoading: {
      alignItems: 'center',
      justifyContent: 'center',
    },
    sliderHitbox: {
      flex: 1,
      paddingVertical: 14,
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
      width: 14,
      height: 14,
      borderRadius: 7,
      backgroundColor: theme.accentGreen,
      top: -5,
      marginLeft: -7,
    },
    sliderThumbActive: {
      width: 20,
      height: 20,
      borderRadius: 10,
      top: -8,
      marginLeft: -10,
    },
    measuringText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      textAlign: 'center',
      marginTop: 2,
    },
    optionsRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[3],
      marginTop: spacing[3],
    },
    optionGroup: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      flexShrink: 1,
    },
    speedLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      flexShrink: 1,
    },
    speedPill: {
      minWidth: 56,
      alignItems: 'center',
      backgroundColor: theme.bgMuted,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing[3],
      paddingVertical: 6,
    },
    speedPillActive: {
      backgroundColor: theme.accentGreen,
      borderColor: theme.accentGreen,
    },
    speedText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
    },
    speedTextActive: {
      color: colors.neutral[0],
    },
    controlsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing[4],
      marginTop: spacing[4],
    },
    sideButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: theme.bgMuted,
    },
    sideButtonActive: {
      backgroundColor: theme.accentSoft,
    },
    skipButton: {
      width: 48,
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playButton: {
      width: 72,
      height: 72,
      borderRadius: 36,
      backgroundColor: theme.accentGreen,
      justifyContent: 'center',
      alignItems: 'center',
      shadowColor: theme.accentGreen,
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.45,
      shadowRadius: 14,
      elevation: 8,
    },
    playGlyphOffset: {
      marginLeft: 3,
    },
  });
