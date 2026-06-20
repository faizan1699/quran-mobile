import React, { useEffect, useRef } from 'react';
import { Animated, Pressable, StyleSheet, ViewStyle } from 'react-native';
import { useTheme, Theme } from '@/theme';
import { colors } from '@/tokens';

interface AppSwitchProps {
  value: boolean;
  onValueChange: (value: boolean) => void;
  disabled?: boolean;
  /** Accessibility label for screen readers. */
  accessibilityLabel?: string;
  style?: ViewStyle;
}

const TRACK_WIDTH = 48;
const TRACK_HEIGHT = 28;
const THUMB_SIZE = 22;
const PADDING = 3;

/**
 * Branded animated on/off switch.
 *
 * A drop-in replacement for RN's `Switch` with a spring thumb and the app's
 * green accent when on. Used for every preference toggle (prayer alerts, dark
 * mode, reading options) so the look is consistent across the app.
 */
export function AppSwitch({
  value,
  onValueChange,
  disabled = false,
  accessibilityLabel,
  style,
}: AppSwitchProps): React.JSX.Element {
  const { theme } = useTheme();
  const progress = useRef(new Animated.Value(value ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(progress, {
      toValue: value ? 1 : 0,
      useNativeDriver: false,
      friction: 7,
      tension: 80,
    }).start();
  }, [value, progress]);

  const trackColor = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [theme.bgMuted, colors.primary[500]],
  });

  const thumbTranslate = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, TRACK_WIDTH - THUMB_SIZE - PADDING * 2],
  });

  return (
    <Pressable
      onPress={() => !disabled && onValueChange(!value)}
      disabled={disabled}
      accessibilityRole="switch"
      accessibilityState={{ checked: value, disabled }}
      accessibilityLabel={accessibilityLabel}
      style={[disabled && styles.disabled, style]}
      hitSlop={6}
    >
      <Animated.View
        style={[
          styles.track,
          { backgroundColor: trackColor, borderColor: theme.border },
        ]}
      >
        <Animated.View
          style={[
            styles.thumb,
            {
              backgroundColor: colors.neutral[0],
              transform: [{ translateX: thumbTranslate }],
            },
          ]}
        />
      </Animated.View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  track: {
    width: TRACK_WIDTH,
    height: TRACK_HEIGHT,
    borderRadius: TRACK_HEIGHT / 2,
    padding: PADDING,
    justifyContent: 'center',
    borderWidth: 1,
  },
  thumb: {
    width: THUMB_SIZE,
    height: THUMB_SIZE,
    borderRadius: THUMB_SIZE / 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  disabled: {
    opacity: 0.45,
  },
});

export default AppSwitch;
