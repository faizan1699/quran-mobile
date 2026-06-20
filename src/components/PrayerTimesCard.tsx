import React from 'react';
import { StyleSheet, View, Text, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { usePrayerTimes } from '@/hooks/usePrayerTimes';
import { useDeviceLocation } from '@/hooks/useDeviceLocation';
import { useUserStore } from '@/store/useUserStore';
import { useTheme } from '@/theme';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

export function PrayerTimesCard(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const times = usePrayerTimes();
  const { location, fiqhMethod } = useUserStore();
  const { detecting, detectLocation } = useDeviceLocation();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const handleEditLocation = () => {
    void detectLocation();
  };

  const handleSettingsPress = () => {
    // Navigate to settings (More) tab via MainTabs parent
    navigation.navigate('MainTabs', { screen: 'MoreStack' } as any);
  };

  const prayers = [
    { name: language === 'ur' ? 'فجر' : 'Fajr', time: times.fajr, key: 'Fajr' },
    { name: language === 'ur' ? 'طلوع آفتاب' : 'Sunrise', time: times.sunrise, key: 'Sunrise' },
    { name: language === 'ur' ? 'ظہر' : 'Dhuhr', time: times.dhuhr, key: 'Dhuhr' },
    { name: language === 'ur' ? 'عصر' : 'Asr', time: times.asr, key: 'Asr' },
    { name: language === 'ur' ? 'مغرب' : 'Maghrib', time: times.maghrib, key: 'Maghrib' },
    { name: language === 'ur' ? 'عشاء' : 'Isha', time: times.isha, key: 'Isha' },
  ];

  const nextPrayerKey = times.nextPrayerName;

  return (
    <View style={[styles.card, { backgroundColor: theme.bgCardPrayer }]}>
      {/* Location Header */}
      <View style={styles.header}>
        <View style={styles.locationInfo}>
          <Text style={styles.locationTitle}>{t('home.currentLocation')}</Text>
          <TouchableOpacity
            style={styles.locationSelector}
            onPress={handleEditLocation}
            disabled={detecting}
            activeOpacity={0.7}
          >
            <Text style={styles.locationName} numberOfLines={1}>
              {detecting ? t('settings.detecting') : location?.name || 'Mecca, SA'}
            </Text>
            <Text style={styles.locationChevron}>📍</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.editButton}
          onPress={handleEditLocation}
          disabled={detecting}
          activeOpacity={0.7}
        >
          {detecting ? (
            <ActivityIndicator size="small" color={colors.neutral[0]} />
          ) : (
            <Text style={styles.editIcon}>📍</Text>
          )}
        </TouchableOpacity>
      </View>

      {/* Prayer Time Rows */}
      <View style={styles.rowsContainer}>
        {prayers.map((prayer) => {
          const isNext = prayer.key === nextPrayerKey;
          return (
            <View 
              key={prayer.key} 
              style={[
                styles.row,
                isNext && styles.nextPrayerRow,
                isRTL && styles.rowRTL
              ]}
            >
              <View style={styles.prayerNameContainer}>
                {isNext && <View style={styles.indicatorDot} />}
                <Text style={[styles.prayerName, isNext && styles.nextPrayerText]}>
                  {prayer.name}
                </Text>
              </View>
              <Text style={[styles.prayerTime, isNext && styles.nextPrayerText]}>
                {prayer.time}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Footer Settings Link */}
      <View style={[styles.footer, isRTL && styles.footerRTL]}>
        <Text style={styles.methodText}>
          {t('settings.fiqh')}: {fiqhMethod}
        </Text>
        <TouchableOpacity onPress={handleSettingsPress} activeOpacity={0.7}>
          <Text style={styles.settingsLink}>{t('home.calcSettings')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.primary[700], // dark green
    borderRadius: borderRadius.cardLg, // 16
    padding: spacing.cardPaddingLg, // 20
    ...shadows.card,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.15)',
    paddingBottom: spacing[3],
    marginBottom: spacing[3],
  },
  locationInfo: {
    flex: 1,
  },
  locationTitle: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    color: colors.gold[400],
    textTransform: 'uppercase',
    fontWeight: 'bold',
  },
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    gap: 4,
  },
  locationName: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.lg,
    color: colors.neutral[0],
    fontWeight: 'bold',
  },
  locationChevron: {
    fontSize: 8,
    color: colors.gold[400],
  },
  editButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  editIcon: {
    fontSize: 14,
  },
  rowsContainer: {
    gap: spacing[2],
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: borderRadius.sm,
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  nextPrayerRow: {
    backgroundColor: 'rgba(201, 168, 76, 0.15)', // light gold/transparency highlight
    borderWidth: 1,
    borderColor: 'rgba(201, 168, 76, 0.3)',
  },
  prayerNameContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  indicatorDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gold[500],
  },
  prayerName: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.md,
    color: colors.neutral[100],
  },
  prayerTime: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.md,
    color: colors.neutral[100],
    fontWeight: '500',
  },
  nextPrayerText: {
    color: colors.neutral[0],
    fontWeight: 'bold',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: spacing[4],
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.15)',
    paddingTop: spacing[3],
  },
  footerRTL: {
    flexDirection: 'row-reverse',
  },
  methodText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    color: colors.neutral[200],
  },
  settingsLink: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    color: colors.gold[400], // gold links
    fontWeight: 'bold',
    textDecorationLine: 'underline',
  },
});
export default PrayerTimesCard;
