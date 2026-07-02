import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useAudioStore } from '@/store/useAudioStore';
import { useResumeStore } from '@/store/useResumeStore';
import { useTranslation } from '@/i18n';
import { Icon } from '@/components/Icon';
import { useTheme, Theme } from '@/theme';
import { spacing, typography, borderRadius, shadows } from '@/tokens';

export function ResumeCard(): React.JSX.Element | null {
  const { theme } = useTheme();
  const { language } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const session = useResumeStore((s) => s.session);
  const clearSession = useResumeStore((s) => s.clearSession);
  const currentTrack = useAudioStore((s) => s.currentTrack);
  const resumeSession = useAudioStore((s) => s.resumeSession);

  if (!session || currentTrack) return null;

  const isUrdu = language === 'ur';
  const heading = isUrdu ? 'وہیں سے جاری رکھیں' : 'Resume where you left off';
  const label = session.track.subtitle || session.track.title;

  const onResume = () => {
    void resumeSession({
      track: session.track,
      queue: session.queue,
      position: session.position,
    });
  };

  return (
    <View style={[styles.card, isUrdu && styles.cardRTL]}>
      <TouchableOpacity style={styles.playBtn} onPress={onResume} activeOpacity={0.85}>
        <Icon name="play" size={22} color="#FFFFFF" style={styles.playGlyph} />
      </TouchableOpacity>

      <TouchableOpacity style={styles.info} onPress={onResume} activeOpacity={0.7}>
        <Text style={[styles.heading, isUrdu && styles.textUrdu]} numberOfLines={1}>
          {heading}
        </Text>
        <Text style={[styles.label, isUrdu && styles.textUrdu]} numberOfLines={1}>
          {label}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.dismiss}
        onPress={clearSession}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityLabel={isUrdu ? 'ہٹا دیں' : 'Dismiss'}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
      >
        <Icon name="close" size={18} color={theme.textMuted} />
      </TouchableOpacity>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    card: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.cardLg,
      borderWidth: 1,
      borderColor: theme.border,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[3],
      ...shadows.sm,
    },
    cardRTL: {
      flexDirection: 'row-reverse',
    },
    playBtn: {
      width: 46,
      height: 46,
      borderRadius: 23,
      backgroundColor: theme.accentGreen,
      justifyContent: 'center',
      alignItems: 'center',
    },
    playGlyph: {
      marginLeft: 3,
    },
    info: {
      flex: 1,
    },
    heading: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    label: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      marginTop: 2,
    },
    textUrdu: {
      fontFamily: typography.fontFamily.urdu,
      writingDirection: 'rtl',
      textAlign: 'right',
    },
    dismiss: {
      width: 30,
      height: 30,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default ResumeCard;
