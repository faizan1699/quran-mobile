import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useTranslation } from '@/i18n';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useDeviceLocation } from '@/hooks/useDeviceLocation';
import { useUserStore } from '@/store/useUserStore';
import { useTheme } from '@/theme';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';

export function PrayerTimesCard(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const times = usePrayerTimes();
  const location = useUserStore((state) => state.location);
  const { detecting, detectLocation } = useDeviceLocation();

  const handleEditLocation = () => {
    void detectLocation();
  };

  const locationLabel = detecting
    ? t('settings.detecting')
    : location?.name ?? t('home.tapToSetLocation');

  const prayers = [
    { name: language === 'ur' ? 'فجر' : 'Fajr', time: times.fajr, key: 'Fajr' },
    { name: language === 'ur' ? 'ظہر' : 'Dhuhr', time: times.dhuhr, key: 'Dhuhr' },
    { name: language === 'ur' ? 'عصر' : 'Asr', time: times.asr, key: 'Asr' },
    { name: language === 'ur' ? 'مغرب' : 'Maghrib', time: times.maghrib, key: 'Maghrib' },
    { name: language === 'ur' ? 'عشاء' : 'Isha', time: times.isha, key: 'Isha' },
  ];

  const nextPrayerKey = times.nextPrayerName;

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.locationHint, isRTL && styles.locationHintRTL]}
        onPress={handleEditLocation}
        disabled={detecting}
        activeOpacity={0.7}
      >
        <Text style={[styles.locationText, { color: theme.textMuted }]} numberOfLines={1}>
          {locationLabel}
        </Text>
        <Text style={[styles.locationPin, { color: theme.textMuted }]}>📍</Text>
      </TouchableOpacity>

      <View style={[styles.card, { backgroundColor: theme.bgCardPrayer }]}>
        <View style={[styles.strip, isRTL && styles.stripRTL]}>
          {prayers.map((prayer) => {
            const isNext = prayer.key === nextPrayerKey;
            return (
              <View key={prayer.key} style={styles.col}>
                <Text
                  style={[styles.label, isNext && styles.labelActive]}
                  numberOfLines={1}
                >
                  {prayer.name}
                </Text>
                <Text style={[styles.time, isNext && styles.timeActive]} numberOfLines={1}>
                  {prayer.time}
                </Text>
                {isNext ? <View style={styles.dot} /> : null}
              </View>
            );
          })}
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    gap: spacing[2],
  },
  locationHint: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    gap: 4,
    paddingHorizontal: spacing[1],
  },
  locationHintRTL: {
    alignSelf: 'flex-start',
    flexDirection: 'row-reverse',
  },
  locationText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    fontWeight: '500',
    maxWidth: 240,
  },
  locationPin: {
    fontSize: 11,
  },
  card: {
    borderRadius: borderRadius.cardLg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[2],
    ...shadows.card,
  },
  strip: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stripRTL: {
    flexDirection: 'row-reverse',
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 5,
  },
  label: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: 'rgba(255, 255, 255, 0.65)',
  },
  labelActive: {
    color: colors.gold[400],
    fontWeight: 'bold',
  },
  time: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.lg,
    fontWeight: 'bold',
    color: colors.neutral[0],
  },
  timeActive: {
    color: colors.gold[400],
  },
  dot: {
    width: 5,
    height: 5,
    borderRadius: 2.5,
    backgroundColor: colors.gold[400],
    marginTop: 1,
  },
});

export default PrayerTimesCard;
