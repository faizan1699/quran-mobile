import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useQueryClient } from '@tanstack/react-query';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { RootStackParamList } from '@/navigation/types';
import { useUserStore, FiqhMethod, LocationData } from '@/store/useUserStore';
import { usePreferencesStore, FontScale } from '@/store/usePreferencesStore';
import { useDeviceLocation } from '@/hooks/useDeviceLocation';
import { clearCache } from '@/services/offlineCache';
import { GlobalHeader } from '@/components/GlobalHeader';
import { AppSwitch } from '@/components/AppSwitch';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

type Styles = ReturnType<typeof createStyles>;

/** A single labelled on/off preference row. */
function ToggleRow({
  label,
  description,
  value,
  onValueChange,
  disabled,
  isRTL,
  styles,
}: {
  label: string;
  description?: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
  disabled?: boolean;
  isRTL: boolean;
  styles: Styles;
}): React.JSX.Element {
  return (
    <View style={[styles.toggleRow, isRTL && styles.rowRTL]}>
      <View style={styles.toggleTextCol}>
        <Text style={[styles.toggleLabel, isRTL && styles.textRTL]}>{label}</Text>
        {description ? (
          <Text style={[styles.toggleDescription, isRTL && styles.textRTL]}>{description}</Text>
        ) : null}
      </View>
      <AppSwitch
        value={value}
        onValueChange={onValueChange}
        disabled={disabled}
        accessibilityLabel={label}
      />
    </View>
  );
}

const FONT_SCALE_OPTIONS: { value: FontScale; labelKey: string; preview: number }[] = [
  { value: 'small', labelKey: 'settings.textSizeSmall', preview: 13 },
  { value: 'default', labelKey: 'settings.textSizeDefault', preview: 15 },
  { value: 'large', labelKey: 'settings.textSizeLarge', preview: 18 },
  { value: 'xlarge', labelKey: 'settings.textSizeXLarge', preview: 21 },
];

const MOCK_CITIES: LocationData[] = [
  { name: 'Mecca, SA', latitude: 21.4225, longitude: 39.8262 },
  { name: 'Karachi, PK', latitude: 24.8607, longitude: 67.0011 },
  { name: 'London, UK', latitude: 51.5074, longitude: -0.1278 },
  { name: 'New York, US', latitude: 40.7128, longitude: -74.006 },
];

export default function SettingsScreen(): React.JSX.Element {
  const { t, language, changeLanguage, isRTL } = useTranslation();
  const { theme, mode, isDark, setMode } = useTheme();
  const { fiqhMethod, setFiqhMethod, location, setLocation } = useUserStore();
  const { detecting, error: locationError, detectLocation } = useDeviceLocation();
  const queryClient = useQueryClient();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const {
    prayerAlerts,
    dailyAyahReminder,
    jummahReminder,
    autoPlayNextAyah,
    downloadOverWifiOnly,
    downloadedIds,
    fontScale,
    setPref,
    setFontScale,
  } = usePreferencesStore();

  const followSystem = mode === 'system';

  const handleClearCache = () => {
    Alert.alert(
      t('settings.clearCache'),
      t('settings.clearCacheConfirm'),
      [
        { text: t('settings.cancel'), style: 'cancel' },
        {
          text: t('settings.clearCache'),
          style: 'destructive',
          onPress: async () => {
            queryClient.clear();
            await clearCache();
            Alert.alert(t('settings.cacheCleared'), t('settings.cacheClearedDesc'));
          },
        },
      ],
      { cancelable: true }
    );
  };

  const handleDetectLocation = async () => {
    const result = await detectLocation();
    if (result) {
      Alert.alert(
        language === 'ur' ? 'کامیاب!' : 'Success!',
        language === 'ur'
          ? `مقام تبدیل کر کے ${result.name} کر دیا گیا ہے۔`
          : `Location set to ${result.name}. Prayer times recalculated.`
      );
    }
  };

  const handleFiqhChange = (method: FiqhMethod) => {
    setFiqhMethod(method);
    Alert.alert(
      language === 'ur' ? 'کامیاب!' : 'Success!',
      language === 'ur'
        ? `فقہ کا طریقہ تبدیل کر کے ${method} کر دیا گیا ہے۔`
        : `Fiqh method updated to ${method}. Prayer times recalculated.`
    );
  };

  const handleCityChange = (city: LocationData) => {
    setLocation(city);
    Alert.alert(
      language === 'ur' ? 'کامیاب!' : 'Success!',
      language === 'ur'
        ? `مقام تبدیل کر کے ${city.name} کر دیا گیا ہے۔`
        : `Location updated to ${city.name}. Coordinate metrics synced.`
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <GlobalHeader />

      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.contentContainer}
        showsVerticalScrollIndicator={false}
      >
        <Text style={[styles.screenTitle, isRTL && styles.textRTL]}>{t('settings.title')}</Text>

        <View style={styles.sectionCard}>
          <TouchableOpacity
            style={[styles.clearCacheButton, isRTL && styles.rowRTL]}
            onPress={() => navigation.navigate('NotesList')}
            activeOpacity={0.8}
          >
            <Ionicons name="document-text-outline" size={18} color={theme.textBrandGreen} />
            <View style={styles.clearCacheTextCol}>
              <Text style={[styles.clearCacheLabel, isRTL && styles.textRTL]}>
                {t('notes.title')}
              </Text>
              <Text style={[styles.clearCacheDesc, isRTL && styles.textRTL]}>
                {t('notes.settingsDesc')}
              </Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={16}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Appearance / Theme */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('theme.appearance')}
          </Text>

          <ToggleRow
            label={t('settings.darkMode')}
            description={t('settings.darkModeDesc')}
            value={isDark}
            onValueChange={(v) => setMode(v ? 'dark' : 'light')}
            disabled={followSystem}
            isRTL={isRTL}
            styles={styles}
          />
          <View style={styles.toggleDivider} />
          <ToggleRow
            label={t('settings.matchDevice')}
            description={t('settings.matchDeviceDesc')}
            value={followSystem}
            onValueChange={(v) => setMode(v ? 'system' : isDark ? 'dark' : 'light')}
            isRTL={isRTL}
            styles={styles}
          />
        </View>

        {/* Text Size */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('settings.textSize')}
          </Text>
          <View style={[styles.segment, isRTL && styles.rowRTL]}>
            {FONT_SCALE_OPTIONS.map((opt) => {
              const active = fontScale === opt.value;
              return (
                <TouchableOpacity
                  key={opt.value}
                  style={[styles.fontScaleItem, active && styles.segmentItemActive]}
                  onPress={() => setFontScale(opt.value)}
                  activeOpacity={0.85}
                >
                  <Text
                    style={[
                      styles.fontScaleGlyph,
                      active && styles.segmentTextActive,
                      { fontSize: opt.preview },
                    ]}
                  >
                    A
                  </Text>
                  <Text
                    style={[styles.fontScaleLabel, active && styles.segmentTextActive]}
                    numberOfLines={1}
                  >
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Language Options Row */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('settings.language')}
          </Text>
          <View style={[styles.optionsRow, isRTL && styles.rowRTL]}>
            <TouchableOpacity
              style={[styles.optionButton, language === 'en' && styles.optionButtonActive]}
              onPress={() => changeLanguage('en')}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, language === 'en' && styles.optionTextActive]}>
                English
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.optionButton, language === 'ur' && styles.optionButtonActive]}
              onPress={() => changeLanguage('ur')}
              activeOpacity={0.8}
            >
              <Text style={[styles.optionText, language === 'ur' && styles.optionTextActive]}>
                اردو (Urdu)
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Fiqh Method Selection Card */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>{t('settings.fiqh')}</Text>

          <View style={styles.gridContainer}>
            {(['Hanafi', 'Shafi', 'Maliki', 'Hanbali'] as FiqhMethod[]).map((method) => {
              const isActive = fiqhMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  style={[styles.gridButton, isActive && styles.gridButtonActive]}
                  onPress={() => handleFiqhChange(method)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.gridText, isActive && styles.gridTextActive]}>{method}</Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Mock Location Selector Card */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('settings.location')}
          </Text>

          {/* GPS auto-detect */}
          <TouchableOpacity
            style={[styles.gpsButton, isRTL && styles.rowRTL]}
            onPress={handleDetectLocation}
            disabled={detecting}
            activeOpacity={0.8}
          >
            {detecting ? (
              <ActivityIndicator size="small" color={colors.neutral[0]} />
            ) : (
              <Ionicons name="location" size={16} color={colors.neutral[0]} />
            )}
            <Text style={styles.gpsButtonText}>
              {detecting ? t('settings.detecting') : t('settings.useMyLocation')}
            </Text>
          </TouchableOpacity>

          {locationError ? (
            <Text style={[styles.gpsError, isRTL && styles.textRTL]}>
              {t('settings.locationDenied')}
            </Text>
          ) : null}

          <Text style={[styles.subHeading, isRTL && styles.textRTL]}>
            {t('settings.orChooseCity')}
          </Text>

          <View style={styles.listContainer}>
            {MOCK_CITIES.map((city) => {
              const isActive = location?.name === city.name;
              return (
                <TouchableOpacity
                  key={city.name}
                  style={[
                    styles.listRow,
                    isActive && styles.listRowActive,
                    isRTL && styles.rowRTL,
                  ]}
                  onPress={() => handleCityChange(city)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.listRowLabel, isActive && styles.listRowActiveLabel]}>
                    {city.name}
                  </Text>
                  <Text style={styles.listRowDetails}>
                    {city.latitude.toFixed(2)}°, {city.longitude.toFixed(2)}°
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Notifications & Alerts Card */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('settings.notifications')}
          </Text>

          <ToggleRow
            label={t('settings.prayerAlerts')}
            description={t('settings.prayerAlertsDesc')}
            value={prayerAlerts}
            onValueChange={(v) => setPref('prayerAlerts', v)}
            isRTL={isRTL}
            styles={styles}
          />
          <View style={styles.toggleDivider} />
          <ToggleRow
            label={t('settings.dailyAyahReminder')}
            description={t('settings.dailyAyahReminderDesc')}
            value={dailyAyahReminder}
            onValueChange={(v) => setPref('dailyAyahReminder', v)}
            isRTL={isRTL}
            styles={styles}
          />
          <View style={styles.toggleDivider} />
          <ToggleRow
            label={t('settings.jummahReminder')}
            description={t('settings.jummahReminderDesc')}
            value={jummahReminder}
            onValueChange={(v) => setPref('jummahReminder', v)}
            isRTL={isRTL}
            styles={styles}
          />
        </View>

        {/* Reading & Downloads Card */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('settings.readingDownloads')}
          </Text>

          <ToggleRow
            label={t('settings.autoPlayNextAyah')}
            value={autoPlayNextAyah}
            onValueChange={(v) => setPref('autoPlayNextAyah', v)}
            isRTL={isRTL}
            styles={styles}
          />
          <View style={styles.toggleDivider} />
          <ToggleRow
            label={t('settings.downloadOverWifiOnly')}
            value={downloadOverWifiOnly}
            onValueChange={(v) => setPref('downloadOverWifiOnly', v)}
            isRTL={isRTL}
            styles={styles}
          />
          <View style={[styles.downloadsSummary, isRTL && styles.rowRTL]}>
            <Ionicons name="cloud-download-outline" size={16} color={theme.textBrandGreen} />
            <Text style={[styles.downloadsText, isRTL && styles.textRTL]}>
              {downloadedIds.length}{' '}
              {language === 'ur' ? 'آئٹمز آف لائن محفوظ ہیں' : 'items saved offline'}
            </Text>
          </View>
        </View>

        {/* Storage / Cache Card */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {t('settings.storage')}
          </Text>
          <TouchableOpacity
            style={[styles.clearCacheButton, isRTL && styles.rowRTL]}
            onPress={handleClearCache}
            activeOpacity={0.8}
          >
            <Ionicons name="trash-outline" size={18} color={colors.status.error} />
            <View style={styles.clearCacheTextCol}>
              <Text style={[styles.clearCacheLabel, isRTL && styles.textRTL]}>
                {t('settings.clearCache')}
              </Text>
              <Text style={[styles.clearCacheDesc, isRTL && styles.textRTL]}>
                {t('settings.clearCacheDesc')}
              </Text>
            </View>
            <Ionicons
              name={isRTL ? 'chevron-back' : 'chevron-forward'}
              size={16}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        </View>

        {/* Account & App Version Info Card */}
        <View style={styles.sectionCard}>
          <Text style={[styles.sectionHeading, isRTL && styles.textRTL]}>
            {language === 'ur' ? 'ایپ معلومات' : 'App Information'}
          </Text>

          <View style={styles.infoWrapper}>
            <View style={[styles.infoRow, isRTL && styles.rowRTL]}>
              <Text style={styles.infoLabel}>{t('settings.account')}</Text>
              <Text style={styles.infoValue}>Guest Account</Text>
            </View>
            <View style={styles.infoDivider} />
            <View style={[styles.infoRow, isRTL && styles.rowRTL]}>
              <Text style={styles.infoLabel}>{t('settings.version')}</Text>
              <Text style={styles.infoValue}>v1.0.0 (Hermes Enabled)</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bgPage,
    },
    container: {
      flex: 1,
    },
    contentContainer: {
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing.cardGap,
      paddingBottom: spacing.sectionGap * 2,
      gap: spacing.cardGap,
    },
    screenTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize['2xl'],
      fontWeight: 'bold',
      color: theme.textPrimary,
      marginBottom: spacing[2],
    },
    sectionCard: {
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    sectionHeading: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md,
      fontWeight: 'bold',
      color: theme.textBrandGreen,
      marginBottom: spacing[3],
    },
    // Theme segmented control
    segment: {
      flexDirection: 'row',
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.full,
      padding: 4,
      gap: 4,
    },
    segmentItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 9,
      borderRadius: borderRadius.full,
    },
    segmentItemActive: {
      backgroundColor: colors.primary[800],
    },
    segmentText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    segmentTextActive: {
      color: colors.neutral[0],
    },
    // Text-size selector
    fontScaleItem: {
      flex: 1,
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 2,
      paddingVertical: 8,
      borderRadius: borderRadius.full,
    },
    fontScaleGlyph: {
      fontFamily: typography.fontFamily.english,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
      lineHeight: 24,
    },
    fontScaleLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    // Clear-cache row
    clearCacheButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.button,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[3],
    },
    clearCacheTextCol: {
      flex: 1,
    },
    clearCacheLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
    },
    clearCacheDesc: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginTop: 2,
    },
    optionsRow: {
      flexDirection: 'row',
      gap: spacing[2],
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    optionButton: {
      flex: 1,
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.button,
      paddingVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    optionButtonActive: {
      backgroundColor: colors.primary[800],
      borderColor: colors.primary[800],
    },
    optionText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textPrimary,
      fontWeight: '600',
    },
    optionTextActive: {
      color: colors.neutral[0],
    },
    gridContainer: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      gap: spacing[2],
    },
    gridButton: {
      width: '48%',
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.button,
      paddingVertical: 10,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: theme.border,
    },
    gridButtonActive: {
      backgroundColor: colors.primary[800],
      borderColor: colors.primary[800],
    },
    gridText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textPrimary,
      fontWeight: '600',
    },
    gridTextActive: {
      color: colors.neutral[0],
    },
    gpsButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      backgroundColor: colors.primary[800],
      borderRadius: borderRadius.button,
      paddingVertical: 12,
      paddingHorizontal: spacing[3],
    },
    gpsButtonText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: colors.neutral[0],
      fontWeight: 'bold',
    },
    gpsError: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: colors.status.error,
      marginTop: spacing[2],
    },
    subHeading: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      textTransform: 'uppercase',
      fontWeight: '600',
      marginTop: spacing[4],
      marginBottom: spacing[2],
    },
    listContainer: {
      gap: spacing[1],
    },
    listRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[2],
      borderRadius: borderRadius.sm,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderDivider,
    },
    listRowActive: {
      backgroundColor: theme.isDark ? 'rgba(58,158,110,0.15)' : colors.primary[100],
      borderBottomColor: 'transparent',
    },
    listRowLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textPrimary,
      fontWeight: '500',
    },
    listRowActiveLabel: {
      color: theme.textBrandGreen,
      fontWeight: 'bold',
    },
    listRowDetails: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
    },
    infoWrapper: {
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.button,
      padding: spacing[3],
    },
    infoRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      paddingVertical: 4,
    },
    infoLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
    },
    infoValue: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textPrimary,
      fontWeight: 'bold',
    },
    infoDivider: {
      height: 1,
      backgroundColor: theme.borderDivider,
      marginVertical: 6,
    },
    textRTL: {
      textAlign: 'right',
    },
    toggleRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingVertical: spacing[2],
      gap: spacing[3],
    },
    toggleTextCol: {
      flex: 1,
    },
    toggleLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
    },
    toggleDescription: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginTop: 2,
    },
    toggleDivider: {
      height: 1,
      backgroundColor: theme.borderDivider,
    },
    downloadsSummary: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      marginTop: spacing[3],
      backgroundColor: theme.isDark ? 'rgba(58,158,110,0.15)' : colors.primary[100],
      borderRadius: borderRadius.button,
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[3],
    },
    downloadsText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textBrandGreen,
      fontWeight: typography.fontWeight.semibold,
    },
  });
