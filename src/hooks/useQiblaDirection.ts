import { useState, useEffect, useMemo } from 'react';
import { Magnetometer } from 'expo-sensors';
import { useUserStore } from '@/store/useUserStore';

const KAABA_LAT = 21.4225;
const KAABA_LNG = 39.8262;

// Standard formula to calculate Qibla bearing from GPS coordinates
export function calculateQiblaBearing(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const phi1 = (lat1 * Math.PI) / 180;
  const phi2 = (lat2 * Math.PI) / 180;
  const deltaLambda = ((lon2 - lon1) * Math.PI) / 180;

  const y = Math.sin(deltaLambda);
  const x =
    Math.cos(phi1) * Math.sin(phi2) -
    Math.sin(phi1) * Math.cos(phi2) * Math.cos(deltaLambda);

  let qiblaRad = Math.atan2(y, x);
  let qiblaDeg = (qiblaRad * 180) / Math.PI;
  
  return (qiblaDeg + 360) % 360;
}

export function useQiblaDirection() {
  const { location } = useUserStore();
  const [heading, setHeading] = useState(0);
  const [isEmulator, setIsEmulator] = useState(false);

  const lat = location?.latitude ?? 21.4225;
  const lng = location?.longitude ?? 39.8262;

  const qiblaBearing = useMemo(() => {
    return calculateQiblaBearing(lat, lng, KAABA_LAT, KAABA_LNG);
  }, [lat, lng]);

  useEffect(() => {
    let subscription: any;
    let fallbackTimer: any;

    const startSensor = async () => {
      const isAvailable = await Magnetometer.isAvailableAsync();
      
      if (isAvailable) {
        Magnetometer.setUpdateInterval(100);
        subscription = Magnetometer.addListener(({ x, y }) => {
          // Calculate heading angle
          let angle = Math.atan2(y, x) * (180 / Math.PI);
          if (angle < 0) angle += 360;
          setHeading(angle);
        });
      } else {
        // Fallback for emulator testing
        triggerMockRotation();
      }
    };

    const triggerMockRotation = () => {
      setIsEmulator(true);
      let simulatedHeading = 0;
      fallbackTimer = setInterval(() => {
        simulatedHeading = (simulatedHeading + 2) % 360;
        setHeading(simulatedHeading);
      }, 100);
    };

    startSensor();

    return () => {
      if (subscription) subscription.remove();
      if (fallbackTimer) clearInterval(fallbackTimer);
    };
  }, [lat, lng]);

  const needleRotation = (qiblaBearing - heading + 360) % 360;

  return {
    heading,
    qiblaBearing,
    needleRotation,
    isEmulator,
  };
}
