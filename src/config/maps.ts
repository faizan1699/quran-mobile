export const GOOGLE_MAPS_API_KEY =
  process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY?.trim() ?? '';

export const hasMapsKey = GOOGLE_MAPS_API_KEY.length > 0;

interface StaticMapOptions {
  latitude: number;
  longitude: number;
  zoom?: number;
  width?: number;
  height?: number;
  markerColor?: string;
}

export function buildStaticMapUrl({
  latitude,
  longitude,
  zoom = 14,
  width = 640,
  height = 320,
  markerColor = '0x1B4332',
}: StaticMapOptions): string {
  const center = `${latitude},${longitude}`;
  const markers = encodeURIComponent(`color:${markerColor}|${center}`);
  return (
    'https://maps.googleapis.com/maps/api/staticmap' +
    `?center=${center}` +
    `&zoom=${zoom}` +
    `&size=${width}x${height}` +
    '&scale=2' +
    '&maptype=roadmap' +
    `&markers=${markers}` +
    `&key=${GOOGLE_MAPS_API_KEY}`
  );
}

export function buildEmbedMapUrl(
  latitude: number,
  longitude: number,
  zoom = 14
): string {
  const q = encodeURIComponent(`${latitude},${longitude}`);
  return (
    'https://www.google.com/maps/embed/v1/place' +
    `?key=${GOOGLE_MAPS_API_KEY}` +
    `&q=${q}` +
    `&zoom=${zoom}`
  );
}

export function buildExternalMapUrl(latitude: number, longitude: number): string {
  return `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
}
