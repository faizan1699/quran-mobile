import { useState, useEffect, useMemo } from 'react';
import { Platform } from 'react-native';
import { Magnetometer } from 'expo-sensors';
import * as Location from 'expo-location';
import { useUserStore } from '@/store/useUserStore';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

export type QiblaStatus = 'checking' | 'ready' | 'unavailable' | 'denied';

export function calculateQiblaBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  const qiblaDeg = (Math.atan2(y, x) * 180) / Math.PI;

  return (qiblaDeg + 360) % 360;
}

export function useQiblaDirection() {
  const { location } = useUserStore();
  const [heading, setHeading] = useState(0);
  const [accuracy, setAccuracy] = useState<number | null>(null);
  const [status, setStatus] = useState<QiblaStatus>('checking');

  const lat = location?.latitude ?? KAABA_LAT;
  const lng = location?.longitude ?? KAABA_LNG;

  const qiblaBearing = useMemo(() => {
    return calculateQiblaBearing(lat, lng, KAABA_LAT, KAABA_LNG);
  }, [lat, lng]);

  useEffect(() => {
    let headingSub: Location.LocationSubscription | null = null;
    let cancelled = false;

    const start = async () => {
      if (Platform.OS === 'web') {
        setStatus('unavailable');
        return;
      }

      const hasCompass = await Magnetometer.isAvailableAsync().catch(() => false);
      if (cancelled) return;

      if (!hasCompass) {
        setStatus('unavailable');
        return;
      }

      const { status: permission } = await Location.requestForegroundPermissionsAsync();
      if (cancelled) return;

      const granted = permission === 'granted';

      try {
        headingSub = await Location.watchHeadingAsync((reading) => {
          const trueHeading =
            granted && reading.trueHeading >= 0 ? reading.trueHeading : reading.magHeading;
          setHeading((trueHeading + 360) % 360);
          setAccuracy(reading.accuracy);
          setStatus(granted ? 'ready' : 'denied');
        });
      } catch {
        if (!cancelled) setStatus('unavailable');
      }
    };

    start();

    return () => {
      cancelled = true;
      if (headingSub) headingSub.remove();
    };
  }, []);

  const needleRotation = (qiblaBearing - heading + 360) % 360;

  return {
    heading,
    qiblaBearing,
    needleRotation,
    accuracy,
    status,
  };
}
