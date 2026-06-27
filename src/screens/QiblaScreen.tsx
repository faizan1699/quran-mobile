import React, { useEffect, useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  Alert,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { useUserStore } from '@/store/useUserStore';
import { useQiblaDirection, QiblaStatus } from '@/hooks/useQiblaDirection';
import { borderRadius, spacing, typography } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

type Styles = ReturnType<typeof createStyles>;

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

const SIZE = Math.min(Dimensions.get('window').width - 48, 320);
const RADIUS = SIZE / 2;
const TICKS = Array.from({ length: 24 }, (_, i) => i * 15);

function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function continueAngle(prevContinuous: number, target: number): number {
  const norm = ((prevContinuous % 360) + 360) % 360;
  const delta = ((target - norm + 540) % 360) - 180;
  return prevContinuous + delta;
}

function Chip({
  icon,
  label,
  value,
  theme,
  styles,
}: {
  icon: string;
  label: string;
  value: string;
  theme: Theme;
  styles: Styles;
}): React.JSX.Element {
  return (
    <View style={styles.chip}>
      <Ionicons name={icon} size={16} color={theme.textBrandGreen} />
      <Text style={styles.chipLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.chipValue} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

export default function QiblaScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const { location } = useUserStore();
  const { heading, qiblaBearing, needleRotation, status } = useQiblaDirection();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const userLat = location?.latitude ?? KAABA_LAT;
  const userLng = location?.longitude ?? KAABA_LNG;

  const distance = useMemo(
    () => getHaversineDistance(userLat, userLng, KAABA_LAT, KAABA_LNG),
    [userLat, userLng]
  );

  const signedOffset = ((needleRotation + 180) % 360) - 180;
  const aligned = status === 'ready' && Math.abs(signedOffset) <= 4;

  const dialAnim = useRef(new Animated.Value(-heading)).current;
  const dialContinuous = useRef(-heading);
  const intro = useRef(new Animated.Value(0)).current;
  const pulse = useRef(new Animated.Value(0)).current;
  const alertedRef = useRef<QiblaStatus | null>(null);

  useEffect(() => {
    const next = continueAngle(dialContinuous.current, -heading);
    dialContinuous.current = next;
    Animated.timing(dialAnim, {
      toValue: next,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [heading, dialAnim]);

  useEffect(() => {
    Animated.timing(intro, {
      toValue: 1,
      duration: 600,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [intro]);

  useEffect(() => {
    if (!aligned) {
      pulse.stopAnimation();
      pulse.setValue(0);
      return;
    }
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0,
          duration: 750,
          easing: Easing.inOut(Easing.quad),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [aligned, pulse]);

  useEffect(() => {
    if (status === 'checking' || alertedRef.current === status) return;
    if (status === 'unavailable') {
      alertedRef.current = status;
      Alert.alert(t('qibla.noSensorTitle'), t('qibla.noSensor'));
    } else if (status === 'denied') {
      alertedRef.current = status;
      Alert.alert(t('qibla.permissionTitle'), t('qibla.permission'));
    }
  }, [status, t]);

  const dialSpin = dialAnim.interpolate({
    inputRange: [-3600, 3600],
    outputRange: ['-3600deg', '3600deg'],
  });
  const introScale = intro.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] });
  const glowScale = pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });
  const glowOpacity = pulse.interpolate({ inputRange: [0, 1], outputRange: [0.3, 0.7] });

  const statusText =
    status === 'checking'
      ? t('qibla.detecting')
      : aligned
        ? t('qibla.aligned')
        : status === 'unavailable'
          ? t('qibla.status')
          : signedOffset >= 0
            ? t('qibla.turnRight')
            : t('qibla.turnLeft');

  const accentTip = aligned ? theme.accentGreen : theme.textMuted;

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <View style={[styles.header, isRTL && styles.rowRTL]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={22}
            color={theme.textPrimary}
          />
        </TouchableOpacity>

        <Text style={styles.headerTitle}>{language === 'ur' ? 'قبلہ نما' : 'Qibla'}</Text>

        {status === 'denied' ? (
          <View style={styles.approxBadge}>
            <Text style={styles.approxText}>{language === 'ur' ? 'تخمینی' : 'APPROX'}</Text>
          </View>
        ) : (
          <View style={styles.iconButton} />
        )}
      </View>

      <View style={styles.body}>
        <View style={styles.readout}>
          <Text style={styles.readoutLabel}>{t('qibla.qiblaDirection')}</Text>
          <Text style={styles.readoutValue}>{Math.round(qiblaBearing)}°</Text>
        </View>

        <Animated.View
          style={[styles.compassWrap, { opacity: intro, transform: [{ scale: introScale }] }]}
        >
          <Animated.View
            pointerEvents="none"
            style={[
              styles.glow,
              { opacity: aligned ? glowOpacity : 0, transform: [{ scale: glowScale }] },
            ]}
          />

          <View style={[styles.topPointer, { borderTopColor: accentTip }]} />

          <View style={styles.ring}>
            <View style={styles.ringInner} />

            <Animated.View style={[styles.dial, { transform: [{ rotate: dialSpin }] }]}>
              {TICKS.map((angle) => (
                <View
                  key={angle}
                  pointerEvents="none"
                  style={[styles.tickWrap, { transform: [{ rotate: `${angle}deg` }] }]}
                >
                  <View style={[styles.tick, angle % 90 === 0 && styles.tickMajor]} />
                </View>
              ))}

              <Text style={[styles.cardinal, styles.cardinalNorth, styles.north]}>N</Text>
              <Text style={[styles.cardinal, styles.east]}>E</Text>
              <Text style={[styles.cardinal, styles.south]}>S</Text>
              <Text style={[styles.cardinal, styles.west]}>W</Text>

              <View style={[styles.arm, { transform: [{ rotate: `${qiblaBearing}deg` }] }]}>
                <View style={styles.kaabaBadge}>
                  <Text style={styles.kaabaGlyph}>🕋</Text>
                </View>
                <View style={styles.armLine} />
              </View>
            </Animated.View>

            <View style={styles.hub}>
              <View style={styles.hubDot} />
            </View>
          </View>
        </Animated.View>

        <View style={[styles.statusPill, aligned && styles.statusPillActive]}>
          <Ionicons
            name={aligned ? 'checkmark-circle' : 'compass-outline'}
            size={16}
            color={aligned ? theme.textOnAccent : theme.textSecondary}
          />
          <Text style={[styles.statusPillText, aligned && styles.statusPillTextActive]}>
            {statusText}
          </Text>
        </View>

        <View style={[styles.chipsRow, isRTL && styles.rowRTL]}>
          <Chip
            icon="navigate-outline"
            label={t('qibla.distance')}
            value={`${distance.toLocaleString()} km`}
            theme={theme}
            styles={styles}
          />
          <Chip
            icon="compass-outline"
            label={t('qibla.heading')}
            value={`${Math.round(heading)}°`}
            theme={theme}
            styles={styles}
          />
          <Chip
            icon="location-outline"
            label={t('qibla.location')}
            value={location?.name || 'Mecca, SA'}
            theme={theme}
            styles={styles}
          />
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
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bgMuted,
    },
    headerTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    approxBadge: {
      height: 40,
      paddingHorizontal: spacing[3],
      borderRadius: 20,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accentSoft,
    },
    approxText: {
      fontFamily: typography.fontFamily.english,
      fontSize: 10,
      fontWeight: typography.fontWeight.bold,
      color: theme.textBrandGreen,
      letterSpacing: 0.5,
    },
    body: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'space-evenly',
      paddingHorizontal: spacing.pagePadding,
      paddingBottom: spacing[4],
    },
    readout: {
      alignItems: 'center',
    },
    readoutLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 1.5,
    },
    readoutValue: {
      fontFamily: typography.fontFamily.english,
      fontSize: 48,
      lineHeight: 56,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    compassWrap: {
      width: SIZE + 28,
      height: SIZE + 28,
      alignItems: 'center',
      justifyContent: 'center',
    },
    glow: {
      position: 'absolute',
      width: SIZE + 20,
      height: SIZE + 20,
      borderRadius: (SIZE + 20) / 2,
      borderWidth: 3,
      borderColor: theme.accentGreen,
    },
    topPointer: {
      position: 'absolute',
      top: 0,
      left: '50%',
      marginLeft: -9,
      width: 0,
      height: 0,
      borderLeftWidth: 9,
      borderRightWidth: 9,
      borderTopWidth: 14,
      borderLeftColor: 'transparent',
      borderRightColor: 'transparent',
      zIndex: 5,
    },
    ring: {
      width: SIZE,
      height: SIZE,
      borderRadius: RADIUS,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.bgCard,
      alignItems: 'center',
      justifyContent: 'center',
    },
    ringInner: {
      position: 'absolute',
      width: SIZE - 36,
      height: SIZE - 36,
      borderRadius: (SIZE - 36) / 2,
      borderWidth: 1,
      borderColor: theme.borderDivider,
      backgroundColor: theme.bgMuted,
    },
    dial: {
      width: '100%',
      height: '100%',
      position: 'absolute',
      alignItems: 'center',
      justifyContent: 'center',
    },
    tickWrap: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      alignItems: 'center',
    },
    tick: {
      width: 2,
      height: 8,
      marginTop: 8,
      borderRadius: 1,
      backgroundColor: theme.border,
    },
    tickMajor: {
      width: 3,
      height: 14,
      backgroundColor: theme.textBrandGreen,
    },
    cardinal: {
      position: 'absolute',
      fontFamily: typography.fontFamily.english,
      fontSize: 16,
      fontWeight: typography.fontWeight.bold,
      color: theme.textSecondary,
    },
    cardinalNorth: {
      color: theme.textGold,
    },
    north: { top: 22, left: 0, right: 0, textAlign: 'center' },
    south: { bottom: 22, left: 0, right: 0, textAlign: 'center' },
    east: { right: 20, top: RADIUS - 10 },
    west: { left: 20, top: RADIUS - 10 },
    arm: {
      position: 'absolute',
      width: '100%',
      height: '100%',
      alignItems: 'center',
      paddingTop: 14,
    },
    kaabaBadge: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bgElevated,
      borderWidth: 2,
      borderColor: theme.accentGreen,
    },
    kaabaGlyph: {
      fontSize: 18,
    },
    armLine: {
      width: 4,
      height: RADIUS - 48,
      borderRadius: 2,
      backgroundColor: theme.accentGreen,
    },
    hub: {
      width: 30,
      height: 30,
      borderRadius: 15,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bgElevated,
      borderWidth: 2,
      borderColor: theme.accentGreen,
    },
    hubDot: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: theme.accentGreen,
    },
    statusPill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      paddingVertical: spacing[2],
      paddingHorizontal: spacing[4],
      borderRadius: borderRadius.full,
      backgroundColor: theme.bgMuted,
      borderWidth: 1,
      borderColor: theme.border,
    },
    statusPillActive: {
      backgroundColor: theme.accentGreen,
      borderColor: theme.accentGreen,
    },
    statusPillText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    statusPillTextActive: {
      color: theme.textOnAccent,
    },
    chipsRow: {
      flexDirection: 'row',
      gap: spacing[2],
      alignSelf: 'stretch',
    },
    chip: {
      flex: 1,
      alignItems: 'center',
      gap: 3,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[2],
      borderRadius: borderRadius.card,
      backgroundColor: theme.bgCard,
      borderWidth: 1,
      borderColor: theme.border,
    },
    chipLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: 10,
      color: theme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      textAlign: 'center',
    },
    chipValue: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
      textAlign: 'center',
    },
  });
