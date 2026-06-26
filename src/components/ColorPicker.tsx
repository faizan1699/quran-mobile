import React, { useCallback, useMemo, useRef } from 'react';
import {
  GestureResponderEvent,
  PanResponder,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Theme } from '@/theme';
import { hexToRgb, rgbToHex, readableText, Rgb } from '@/theme/colorUtils';
import { borderRadius, spacing, typography, shadows } from '@/tokens';

type Channel = 'r' | 'g' | 'b';

const SEGMENTS = 16;

const CHANNELS: { key: Channel; label: string }[] = [
  { key: 'r', label: 'R' },
  { key: 'g', label: 'G' },
  { key: 'b', label: 'B' },
];

function channelGradient(channel: Channel, rgb: Rgb): string[] {
  const colors: string[] = [];
  for (let i = 0; i < SEGMENTS; i++) {
    const v = Math.round((i / (SEGMENTS - 1)) * 255);
    const r = channel === 'r' ? v : rgb.r;
    const g = channel === 'g' ? v : rgb.g;
    const b = channel === 'b' ? v : rgb.b;
    colors.push(`rgb(${r}, ${g}, ${b})`);
  }
  return colors;
}

function ChannelSlider({
  channel,
  label,
  rgb,
  onChange,
  styles,
  theme,
}: {
  channel: Channel;
  label: string;
  rgb: Rgb;
  onChange: (value: number) => void;
  styles: ReturnType<typeof createStyles>;
  theme: Theme;
}): React.JSX.Element {
  const widthRef = useRef(0);
  const onChangeRef = useRef(onChange);
  onChangeRef.current = onChange;

  const value = rgb[channel];

  const update = useCallback((x: number) => {
    const width = widthRef.current;
    if (width <= 0) return;
    const ratio = Math.min(1, Math.max(0, x / width));
    onChangeRef.current(Math.round(ratio * 255));
  }, []);

  const responder = useMemo(
    () =>
      PanResponder.create({
        onStartShouldSetPanResponder: () => true,
        onMoveShouldSetPanResponder: () => true,
        onPanResponderGrant: (e: GestureResponderEvent) =>
          update(e.nativeEvent.locationX),
        onPanResponderMove: (e: GestureResponderEvent) =>
          update(e.nativeEvent.locationX),
      }),
    [update]
  );

  const gradient = channelGradient(channel, rgb);
  const percent = (value / 255) * 100;

  return (
    <View style={styles.sliderRow}>
      <Text style={styles.channelLabel}>{label}</Text>
      <View
        style={styles.track}
        onLayout={(e) => {
          widthRef.current = e.nativeEvent.layout.width;
        }}
        {...responder.panHandlers}
      >
        <View style={styles.gradientRow} pointerEvents="none">
          {gradient.map((color, i) => (
            <View
              key={i}
              style={[
                styles.segment,
                { backgroundColor: color },
                i === 0 && styles.segmentLeft,
                i === gradient.length - 1 && styles.segmentRight,
              ]}
            />
          ))}
        </View>
        <View
          pointerEvents="none"
          style={[styles.thumb, { left: `${percent}%`, borderColor: theme.bgElevated }]}
        />
      </View>
      <Text style={styles.channelValue}>{value}</Text>
    </View>
  );
}

export function ColorPicker({
  value,
  onChange,
  theme,
}: {
  value: string;
  onChange: (hex: string) => void;
  theme: Theme;
}): React.JSX.Element {
  const styles = useMemo(() => createStyles(theme), [theme]);
  const rgb = hexToRgb(value);

  const setChannel = (channel: Channel, channelValue: number) => {
    onChange(rgbToHex({ ...rgb, [channel]: channelValue }));
  };

  return (
    <View style={styles.container}>
      <View style={[styles.preview, { backgroundColor: value }]}>
        <Text style={[styles.previewText, { color: readableText(value) }]}>
          {value.toUpperCase()}
        </Text>
      </View>
      <View style={styles.sliders}>
        {CHANNELS.map((c) => (
          <ChannelSlider
            key={c.key}
            channel={c.key}
            label={c.label}
            rgb={rgb}
            onChange={(v) => setChannel(c.key, v)}
            styles={styles}
            theme={theme}
          />
        ))}
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      gap: spacing[3],
    },
    preview: {
      height: 56,
      borderRadius: borderRadius.button,
      borderWidth: 1,
      borderColor: theme.border,
      justifyContent: 'center',
      alignItems: 'center',
    },
    previewText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: 'bold',
      letterSpacing: 1,
    },
    sliders: {
      gap: spacing[3],
    },
    sliderRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    channelLabel: {
      width: 16,
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: 'bold',
      color: theme.textSecondary,
    },
    track: {
      flex: 1,
      height: 22,
      justifyContent: 'center',
    },
    gradientRow: {
      flexDirection: 'row',
      height: 12,
      borderRadius: borderRadius.full,
      overflow: 'hidden',
      borderWidth: 1,
      borderColor: theme.border,
    },
    segment: {
      flex: 1,
      height: '100%',
    },
    segmentLeft: {
      borderTopLeftRadius: borderRadius.full,
      borderBottomLeftRadius: borderRadius.full,
    },
    segmentRight: {
      borderTopRightRadius: borderRadius.full,
      borderBottomRightRadius: borderRadius.full,
    },
    thumb: {
      position: 'absolute',
      width: 22,
      height: 22,
      marginLeft: -11,
      borderRadius: borderRadius.full,
      backgroundColor: '#FFFFFF',
      borderWidth: 3,
      ...shadows.sm,
    },
    channelValue: {
      width: 30,
      textAlign: 'right',
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: '600',
      color: theme.textPrimary,
    },
  });
