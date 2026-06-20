import { useCallback, useState } from 'react';
import { Platform } from 'react-native';
import * as Location from 'expo-location';
import { useUserStore, LocationData } from '@/store/useUserStore';

interface DeviceLocationState {
  detecting: boolean;
  error: string | null;
  detectLocation: () => Promise<LocationData | null>;
}

function coordsLabel(lat: number, lng: number): string {
  return `My location (${lat.toFixed(2)}°, ${lng.toFixed(2)}°)`;
}

// Turn raw coordinates into a readable "City, Country" label.
// reverseGeocodeAsync is native-only, so on web we fall back to the coords.
async function resolveCityName(lat: number, lng: number): Promise<string> {
  if (Platform.OS === 'web') {
    return coordsLabel(lat, lng);
  }

  try {
    const results = await Location.reverseGeocodeAsync({ latitude: lat, longitude: lng });
    const place = results[0];
    if (place) {
      const city = place.city || place.subregion || place.region || 'Current location';
      const country = place.isoCountryCode || place.country || '';
      return country ? `${city}, ${country}` : city;
    }
  } catch {
    // Reverse geocoding unavailable (e.g. web / no provider) — use coordinates.
  }

  return coordsLabel(lat, lng);
}

/**
 * Requests the device's GPS location and stores it on the user store so that
 * prayer times and the Qibla direction recalculate for the real location.
 * Works on native (expo-location) and web (browser Geolocation API).
 */
export function useDeviceLocation(): DeviceLocationState {
  const setLocation = useUserStore((state) => state.setLocation);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const detectLocation = useCallback(async (): Promise<LocationData | null> => {
    setDetecting(true);
    setError(null);

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied');
        return null;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      const { latitude, longitude } = position.coords;
      const name = await resolveCityName(latitude, longitude);
      const data: LocationData = { latitude, longitude, name };

      setLocation(data);
      return data;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to detect location';
      setError(message);
      return null;
    } finally {
      setDetecting(false);
    }
  }, [setLocation]);

  return { detecting, error, detectLocation };
}
