import React, { useState } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Linking } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTheme, Theme } from '@/theme';
import { borderRadius, spacing, typography } from '@/tokens';
import {
  hasMapsKey,
  buildStaticMapUrl,
  buildExternalMapUrl,
} from '@/config/maps';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

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
  hint,
  height = 170,
}: LocationMapProps): React.JSX.Element {
  const { theme } = useTheme();
  const styles = createStyles(theme, height);
  const [failed, setFailed] = useState(false);

  if (!hasMapsKey || failed) {
    return (
      <View style={styles.fallback}>
        <Ionicons name="map-outline" size={24} color={theme.textMuted} />
        <Text style={styles.fallbackText}>
          {latitude.toFixed(4)}°, {longitude.toFixed(4)}°
        </Text>
      </View>
    );
  }

  const uri = buildStaticMapUrl({ latitude, longitude });

  const openExternal = () => {
    Linking.openURL(buildExternalMapUrl(latitude, longitude)).catch(() => undefined);
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={openExternal}
      style={styles.wrapper}
      accessibilityRole="button"
      accessibilityLabel={hint}
    >
      <Image
        source={{ uri }}
        style={styles.image}
        contentFit="cover"
        transition={200}
        onError={() => setFailed(true)}
      />

      {label ? (
        <View style={styles.labelBadge}>
          <Ionicons name="navigate" size={12} color={theme.accentGreen} />
          <Text style={styles.labelText} numberOfLines={1}>
            {label}
          </Text>
        </View>
      ) : null}

      <View style={styles.openHint}>
        <Ionicons name="open-outline" size={14} color="#FFFFFF" />
      </View>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme, height: number) =>
  StyleSheet.create({
    wrapper: {
      height,
      borderRadius: borderRadius.button,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.bgMuted,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    labelBadge: {
      position: 'absolute',
      top: spacing[2],
      left: spacing[2],
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      maxWidth: '70%',
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.full,
      paddingVertical: 5,
      paddingHorizontal: spacing[3],
      borderWidth: 1,
      borderColor: theme.border,
    },
    labelText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
    },
    openHint: {
      position: 'absolute',
      bottom: spacing[2],
      right: spacing[2],
      width: 28,
      height: 28,
      borderRadius: 14,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.accentGreen,
    },
    fallback: {
      height,
      borderRadius: borderRadius.button,
      borderWidth: 1,
      borderColor: theme.border,
      backgroundColor: theme.bgMuted,
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
    },
    fallbackText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
    },
  });
