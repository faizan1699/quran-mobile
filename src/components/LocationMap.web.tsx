import React from 'react';
import { useTheme } from '@/theme';
import { hasMapsKey, buildEmbedMapUrl } from '@/config/maps';

interface LocationMapProps {
  latitude: number;
  longitude: number;
  label?: string;
  hint?: string;
  height?: number;
}

export function LocationMap({
  latitude,
  longitude,
  label,
  height = 170,
}: LocationMapProps): React.JSX.Element {
  const { theme } = useTheme();

  const wrapperStyle: React.CSSProperties = {
    position: 'relative',
    height,
    borderRadius: 12,
    overflow: 'hidden',
    border: `1px solid ${theme.border}`,
    backgroundColor: theme.bgMuted,
  };

  if (!hasMapsKey) {
    return (
      <div
        style={{
          ...wrapperStyle,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: theme.textSecondary,
          fontSize: 14,
        }}
      >
        {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
      </div>
    );
  }

  return (
    <div style={wrapperStyle}>
      <iframe
        title="location-map"
        src={buildEmbedMapUrl(latitude, longitude)}
        width="100%"
        height="100%"
        style={{ border: 0, display: 'block' }}
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        allowFullScreen
      />
      {label ? (
        <div
          style={{
            position: 'absolute',
            top: 8,
            left: 8,
            backgroundColor: theme.bgCard,
            color: theme.textPrimary,
            border: `1px solid ${theme.border}`,
            borderRadius: 999,
            padding: '5px 12px',
            fontSize: 12,
            fontWeight: 600,
            maxWidth: '70%',
            whiteSpace: 'nowrap',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            pointerEvents: 'none',
          }}
        >
          {label}
        </div>
      ) : null}
    </div>
  );
}
