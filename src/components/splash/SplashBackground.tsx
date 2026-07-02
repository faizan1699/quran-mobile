import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle, Ellipse, G } from 'react-native-svg';
import { colors } from '@/tokens';

type SplashBackgroundProps = {
  children?: React.ReactNode;
};

function FloralMandala({ size }: { size: number }): React.JSX.Element {
  const c = size / 2;
  const rings = [
    { r: size * 0.3, rx: size * 0.05, ry: size * 0.15 },
    { r: size * 0.42, rx: size * 0.035, ry: size * 0.11 },
  ];

  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <G stroke={colors.splash.ornament} fill="none" strokeWidth={size * 0.006}>
        <Circle cx={c} cy={c} r={size * 0.12} />
        <Circle cx={c} cy={c} r={size * 0.2} />
        <Circle cx={c} cy={c} r={size * 0.47} />
        {rings.map((ring, ri) => {
          const petals = 16;
          return Array.from({ length: petals }).map((_, i) => {
            const deg = (i / petals) * 360;
            return (
              <G key={`p-${ri}-${i}`} transform={`rotate(${deg} ${c} ${c})`}>
                <Ellipse cx={c} cy={c - ring.r} rx={ring.rx} ry={ring.ry} />
              </G>
            );
          });
        })}
      </G>
      <G fill={colors.splash.ornament}>
        {Array.from({ length: 12 }).map((_, i) => {
          const a = (i / 12) * Math.PI * 2;
          return (
            <Circle
              key={`d-${i}`}
              cx={c + Math.cos(a) * size * 0.47}
              cy={c + Math.sin(a) * size * 0.47}
              r={size * 0.008}
            />
          );
        })}
      </G>
    </Svg>
  );
}

export default function SplashBackground({ children }: SplashBackgroundProps): React.JSX.Element {
  return (
    <View style={styles.root}>
      <LinearGradient
        colors={[...colors.splash.gradient]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        colors={['rgba(95,215,158,0)', 'rgba(95,215,158,0.16)', 'rgba(95,215,158,0)']}
        locations={[0, 0.5, 1]}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={StyleSheet.absoluteFill}
      />

      <View pointerEvents="none" style={[styles.corner, styles.topRight]}>
        <FloralMandala size={320} />
      </View>
      <View pointerEvents="none" style={[styles.corner, styles.rightMid]}>
        <FloralMandala size={240} />
      </View>
      <View pointerEvents="none" style={[styles.corner, styles.bottomLeft]}>
        <FloralMandala size={360} />
      </View>
      <View pointerEvents="none" style={[styles.corner, styles.topLeft]}>
        <FloralMandala size={200} />
      </View>

      {children}
    </View>
  );
}

const cornerBase: ViewStyle = { position: 'absolute', opacity: 0.1 };

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  corner: cornerBase,
  topRight: {
    top: -110,
    right: -120,
  },
  rightMid: {
    top: '32%',
    right: -150,
    opacity: 0.07,
  },
  bottomLeft: {
    bottom: -110,
    left: -130,
    opacity: 0.12,
  },
  topLeft: {
    top: -90,
    left: -110,
    opacity: 0.06,
  },
});
