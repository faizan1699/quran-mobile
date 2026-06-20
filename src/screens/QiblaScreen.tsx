import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, SafeAreaView } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useUserStore } from '@/store/useUserStore';
import { useQiblaDirection } from '@/hooks/useQiblaDirection';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

// Haversine formula to compute distance in km
function getHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth radius in km
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

export default function QiblaScreen(): React.JSX.Element {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const { t, language, isRTL } = useTranslation();
  const { location } = useUserStore();
  const { heading, qiblaBearing, needleRotation, isEmulator } = useQiblaDirection();

  const userLat = location?.latitude ?? 21.4225;
  const userLng = location?.longitude ?? 39.8262;

  const distance = useMemo(() => {
    return getHaversineDistance(userLat, userLng, 21.4225, 39.8262);
  }, [userLat, userLng]);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Immersive Dark Gray HUD Backdrop overlay */}
      <View style={styles.container}>
        
        {/* Immersive HUD Header Row */}
        <View style={[styles.headerRow, isRTL && styles.rowRTL]}>
          <TouchableOpacity 
            style={[styles.backButton, isRTL && styles.backButtonRTL]} 
            onPress={() => navigation.goBack()}
            activeOpacity={0.7}
          >
            <Text style={styles.backArrow}>◀</Text>
            <Text style={styles.backText}>{language === 'ur' ? 'واپس' : 'Back'}</Text>
          </TouchableOpacity>

          {isEmulator && (
            <View style={styles.emulatorBadge}>
              <Text style={styles.emulatorText}>SIMULATING</Text>
            </View>
          )}
        </View>

        {/* Telemetry HUD Panel */}
        <View style={[styles.hudPanel, isRTL && styles.rowRTL]}>
          <View style={styles.hudLeft}>
            <Text style={styles.hudLabel}>{t('qibla.distance')}</Text>
            <Text style={styles.hudValue}>{distance.toLocaleString()} km</Text>
          </View>
          
          <View style={styles.hudRight}>
            <Text style={[styles.hudLabel, isRTL && styles.textRTL]}>{t('qibla.location')}</Text>
            <Text style={[styles.hudValueMini, isRTL && styles.textRTL]}>
              {location?.name || 'Mecca, SA'}{'\n'}
              {userLat.toFixed(4)}° N, {userLng.toFixed(4)}° E
            </Text>
          </View>
        </View>

        {/* Center Compass Deck */}
        <View style={styles.compassDeck}>
          <Text style={styles.statusText}>
            {isEmulator ? 'Calibrating sensors...' : t('qibla.status')}
          </Text>

          {/* 2D Compass Assembly */}
          <View style={styles.compassOuterRing}>
            <View style={[styles.compassDial, { transform: [{ rotate: `${-heading}deg` }] }]}>
              {/* Cardinal directions */}
              <Text style={[styles.cardinalLabel, styles.north]}>N</Text>
              <Text style={[styles.cardinalLabel, styles.east]}>E</Text>
              <Text style={[styles.cardinalLabel, styles.south]}>S</Text>
              <Text style={[styles.cardinalLabel, styles.west]}>W</Text>
              
              {/* Tick Marks representing 30 degree increments */}
              <View style={[styles.tick, { transform: [{ rotate: '30deg' }] }]} />
              <View style={[styles.tick, { transform: [{ rotate: '60deg' }] }]} />
              <View style={[styles.tick, { transform: [{ rotate: '120deg' }] }]} />
              <View style={[styles.tick, { transform: [{ rotate: '150deg' }] }]} />
              <View style={[styles.tick, { transform: [{ rotate: '210deg' }] }]} />
              <View style={[styles.tick, { transform: [{ rotate: '240deg' }] }]} />
              <View style={[styles.tick, { transform: [{ rotate: '300deg' }] }]} />
              <View style={[styles.tick, { transform: [{ rotate: '330deg' }] }]} />
            </View>

            {/* Rotating Needle Layer */}
            <View style={[styles.needleLayer, { transform: [{ rotate: `${needleRotation}deg` }] }]}>
              {/* Enlightenment Beam */}
              <View style={styles.enlightenmentBeam} />
              
              {/* Needle Arrow */}
              <View style={styles.needlePointer} />
              
              {/* Center Embellishment Emblem */}
              <View style={styles.centerPin}>
                <Text style={styles.pinText}>🕋</Text>
              </View>
            </View>
          </View>

          <Text style={styles.headingText}>
            Heading: {Math.round(heading)}° | Qibla: {Math.round(qiblaBearing)}°
          </Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.neutral[900], // Immersive pitch black/dark gray safe zone
  },
  container: {
    flex: 1,
    backgroundColor: '#1E1E1E', // Desaturated grayscale HUD background
    paddingHorizontal: spacing.pagePadding,
    paddingTop: spacing.cardGap,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  rowRTL: {
    flexDirection: 'row-reverse',
  },
  backButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingRight: 16,
  },
  backButtonRTL: {
    flexDirection: 'row-reverse',
  },
  backArrow: {
    fontSize: 14,
    color: colors.neutral[0],
    marginRight: 4,
  },
  backText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: colors.neutral[0],
    fontWeight: 'bold',
  },
  emulatorBadge: {
    backgroundColor: colors.gold[600],
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: borderRadius.badge,
  },
  emulatorText: {
    fontFamily: typography.fontFamily.english,
    fontSize: 10,
    color: colors.neutral[900],
    fontWeight: 'bold',
  },
  hudPanel: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    borderRadius: borderRadius.card,
    padding: spacing.cardPadding,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  hudLeft: {
    flex: 1,
  },
  hudRight: {
    flex: 1,
  },
  hudLabel: {
    fontFamily: typography.fontFamily.english,
    fontSize: 10,
    color: colors.neutral[400],
    textTransform: 'uppercase',
  },
  hudValue: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize['2xl'],
    color: colors.neutral[0],
    fontWeight: 'bold',
    marginTop: 2,
  },
  hudValueMini: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    color: colors.neutral[0],
    lineHeight: 14,
    marginTop: 4,
  },
  textRTL: {
    textAlign: 'right',
  },
  compassDeck: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    gap: spacing.sectionGap,
  },
  statusText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.md,
    color: colors.neutral[0],
    fontWeight: '500',
    textAlign: 'center',
  },
  compassOuterRing: {
    width: 280,
    height: 280,
    borderRadius: 140,
    borderWidth: 4,
    borderColor: colors.gold[600], // Outer gold ring
    backgroundColor: colors.primary[900], // green dial center
    position: 'relative',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  compassDial: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardinalLabel: {
    position: 'absolute',
    fontFamily: typography.fontFamily.english,
    fontSize: 18,
    fontWeight: 'bold',
    color: colors.neutral[0],
  },
  north: { top: 10 },
  east: { right: 12 },
  south: { bottom: 10 },
  west: { left: 12 },
  tick: {
    position: 'absolute',
    width: 2,
    height: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.4)',
    top: 0,
  },
  needleLayer: {
    width: '100%',
    height: '100%',
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },
  enlightenmentBeam: {
    position: 'absolute',
    width: 2,
    height: 100,
    backgroundColor: 'rgba(201, 168, 76, 0.4)', // gold enlightenment beam
    top: 40,
  },
  needlePointer: {
    position: 'absolute',
    width: 0,
    height: 0,
    borderLeftWidth: 10,
    borderLeftColor: 'transparent',
    borderRightWidth: 10,
    borderRightColor: 'transparent',
    borderBottomWidth: 50,
    borderBottomColor: colors.gold[500], // rotating gold needle pointer
    top: 90,
  },
  centerPin: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.neutral[900],
    borderWidth: 2,
    borderColor: colors.gold[500],
    justifyContent: 'center',
    alignItems: 'center',
  },
  pinText: {
    fontSize: 14,
  },
  headingText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    color: colors.neutral[400],
    fontWeight: '500',
  },
});
