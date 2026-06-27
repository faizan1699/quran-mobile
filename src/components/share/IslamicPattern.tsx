import React, { useMemo } from 'react';
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native';
import type { SharePatternId } from '@/data/sharePresets';

interface IslamicPatternProps {
  variant: SharePatternId;
  color: string;
  opacity?: number;
  tile?: number;
  coverW?: number;
  coverH?: number;
  style?: StyleProp<ViewStyle>;
}

const TILE: Record<Exclude<SharePatternId, 'none'>, number> = {
  stars: 58,
  diamonds: 48,
  lattice: 42,
  dots: 30,
  rings: 40,
  crosshatch: 34,
  quatrefoil: 46,
  chevron: 36,
  trellis: 40,
};

export function IslamicPattern({
  variant,
  color,
  opacity = 0.12,
  tile,
  coverW = 480,
  coverH = 920,
  style,
}: IslamicPatternProps): React.JSX.Element | null {
  const size = variant === 'none' ? 0 : tile ?? TILE[variant];

  const count = useMemo(() => {
    if (variant === 'none' || size <= 0) {
      return 0;
    }
    const cols = Math.ceil(coverW / size);
    const rows = Math.ceil(coverH / size);
    return cols * rows;
  }, [variant, size, coverW, coverH]);

  if (variant === 'none' || count === 0) {
    return null;
  }

  return (
    <View pointerEvents="none" style={[styles.layer, { opacity }, style]}>
      <View style={styles.grid}>
        {Array.from({ length: count }).map((_, i) => (
          <Motif key={i} variant={variant} tile={size} color={color} />
        ))}
      </View>
    </View>
  );
}

function Motif({
  variant,
  tile,
  color,
}: {
  variant: Exclude<SharePatternId, 'none'>;
  tile: number;
  color: string;
}): React.JSX.Element {
  const cell: ViewStyle = {
    width: tile,
    height: tile,
    alignItems: 'center',
    justifyContent: 'center',
  };

  if (variant === 'stars') {
    const s = tile * 0.56;
    const stroke = Math.max(1, tile * 0.022);
    const square: ViewStyle = {
      position: 'absolute',
      width: s,
      height: s,
      borderWidth: stroke,
      borderColor: color,
      borderRadius: Math.max(1, tile * 0.05),
    };
    return (
      <View style={cell}>
        <View style={square} />
        <View style={[square, { transform: [{ rotate: '45deg' }] }]} />
      </View>
    );
  }

  if (variant === 'diamonds') {
    const s = tile * 0.58;
    return (
      <View style={cell}>
        <View
          style={{
            width: s,
            height: s,
            borderWidth: Math.max(1, tile * 0.025),
            borderColor: color,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    );
  }

  if (variant === 'lattice') {
    return (
      <View style={cell}>
        <View
          style={{
            width: tile,
            height: tile,
            borderWidth: Math.max(1, tile * 0.022),
            borderColor: color,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    );
  }

  if (variant === 'rings') {
    const s = tile * 0.5;
    return (
      <View style={cell}>
        <View
          style={{
            width: s,
            height: s,
            borderWidth: Math.max(1, tile * 0.03),
            borderColor: color,
            borderRadius: s / 2,
          }}
        />
      </View>
    );
  }

  if (variant === 'crosshatch') {
    const arm = tile * 0.5;
    const thickness = Math.max(1, tile * 0.04);
    const bar: ViewStyle = {
      position: 'absolute',
      backgroundColor: color,
      borderRadius: thickness / 2,
    };
    return (
      <View style={cell}>
        <View style={[bar, { width: arm, height: thickness }]} />
        <View style={[bar, { width: thickness, height: arm }]} />
      </View>
    );
  }

  if (variant === 'quatrefoil') {
    const r = tile * 0.42;
    const off = tile * 0.19;
    const stroke = Math.max(1, tile * 0.025);
    const petal = (transform: ViewStyle['transform']): ViewStyle => ({
      position: 'absolute',
      width: r,
      height: r,
      borderRadius: r / 2,
      borderWidth: stroke,
      borderColor: color,
      transform,
    });
    return (
      <View style={cell}>
        <View style={petal([{ translateY: -off }])} />
        <View style={petal([{ translateY: off }])} />
        <View style={petal([{ translateX: -off }])} />
        <View style={petal([{ translateX: off }])} />
      </View>
    );
  }

  if (variant === 'chevron') {
    const arm = tile * 0.6;
    const thickness = Math.max(1, tile * 0.06);
    const bar: ViewStyle = {
      position: 'absolute',
      width: arm,
      height: thickness,
      backgroundColor: color,
      borderRadius: thickness / 2,
    };
    return (
      <View style={cell}>
        <View style={[bar, { transform: [{ translateX: -arm * 0.32 }, { rotate: '40deg' }] }]} />
        <View style={[bar, { transform: [{ translateX: arm * 0.32 }, { rotate: '-40deg' }] }]} />
      </View>
    );
  }

  if (variant === 'trellis') {
    const thickness = Math.max(1, tile * 0.05);
    const knot = tile * 0.34;
    return (
      <View style={cell}>
        <View
          style={{ position: 'absolute', width: tile, height: thickness, backgroundColor: color }}
        />
        <View
          style={{ position: 'absolute', width: thickness, height: tile, backgroundColor: color }}
        />
        <View
          style={{
            width: knot,
            height: knot,
            borderWidth: thickness,
            borderColor: color,
            transform: [{ rotate: '45deg' }],
          }}
        />
      </View>
    );
  }

  const d = Math.max(3, tile * 0.14);
  return (
    <View style={cell}>
      <View
        style={{ width: d, height: d, borderRadius: d / 2, backgroundColor: color }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  layer: {
    ...StyleSheet.absoluteFillObject,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    overflow: 'hidden',
  },
});

export default IslamicPattern;
