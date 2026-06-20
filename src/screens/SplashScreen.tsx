import React, { useEffect, useMemo, useRef } from 'react';
import { View, Text, StyleSheet, Animated, Easing, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '@/navigation/types';
import { colors, typography, animation } from '@/tokens';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const SPLASH_HOLD = animation.duration.splash; // 2000ms

export default function SplashScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  // Entrance animations
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoScale = useRef(new Animated.Value(0.82)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;
  const subtitleShift = useRef(new Animated.Value(12)).current;
  const dividerWidth = useRef(new Animated.Value(0)).current;

  // Looping ambience
  const glowPulse = useRef(new Animated.Value(0)).current;
  const ringSpin = useRef(new Animated.Value(0)).current;

  // Fade-out before leaving
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    // --- Entrance sequence ---
    Animated.parallel([
      Animated.timing(logoOpacity, {
        toValue: 1,
        duration: 700,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(logoScale, {
        toValue: 1,
        friction: 6,
        tension: 50,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(dividerWidth, {
        toValue: 1,
        duration: 800,
        delay: 350,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false, // animating width
      }),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 600,
        delay: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(subtitleShift, {
        toValue: 0,
        duration: 600,
        delay: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();

    // --- Looping glow "breathing" ---
    const glowLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(glowPulse, {
          toValue: 1,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(glowPulse, {
          toValue: 0,
          duration: 1600,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    glowLoop.start();

    // --- Slowly rotating decorative ring ---
    const spinLoop = Animated.loop(
      Animated.timing(ringSpin, {
        toValue: 1,
        duration: 12000,
        easing: Easing.linear,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    );
    spinLoop.start();

    // --- Hold, fade out, then navigate ---
    const timer = setTimeout(() => {
      Animated.timing(screenOpacity, {
        toValue: 0,
        duration: 350,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }).start(() => {
        navigation.replace('MainTabs', { screen: 'HomeStack' });
      });
    }, SPLASH_HOLD - 350);

    return () => {
      clearTimeout(timer);
      glowLoop.stop();
      spinLoop.stop();
    };
  }, [
    navigation,
    logoOpacity,
    logoScale,
    subtitleOpacity,
    subtitleShift,
    dividerWidth,
    glowPulse,
    ringSpin,
    screenOpacity,
  ]);

  const glowScale = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.12] });
  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0.7] });
  const spin = ringSpin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });
  const dividerScaleX = dividerWidth; // 0 -> 1

  return (
    <Animated.View style={[styles.container, { opacity: screenOpacity }]}>
      {/* Soft pulsing glow behind the logo */}
      <Animated.View
        style={[
          styles.glow,
          styles.glowOuter,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />
      <Animated.View
        style={[
          styles.glow,
          styles.glowInner,
          { opacity: glowOpacity, transform: [{ scale: glowScale }] },
        ]}
      />

      {/* Slowly rotating dotted ring */}
      <Animated.View style={[styles.ring, { transform: [{ rotate: spin }] }]}>
        <DottedRing />
      </Animated.View>

      {/* Logo */}
      <Animated.View
        style={{ opacity: logoOpacity, transform: [{ scale: logoScale }], alignItems: 'center' }}
      >
        <Text style={styles.arabicLogo}>تعليم القرآن</Text>
      </Animated.View>

      {/* Animated gold divider */}
      <Animated.View style={[styles.divider, { transform: [{ scaleX: dividerScaleX }] }]} />

      {/* Subtitle */}
      <Animated.View
        style={{ opacity: subtitleOpacity, transform: [{ translateY: subtitleShift }] }}
      >
        <Text style={styles.subTitle}>Taleem ul Quran</Text>
      </Animated.View>

      {/* Loading dots */}
      <View style={styles.loaderWrap}>
        <LoadingDots />
      </View>
    </Animated.View>
  );
}

/** Three gold dots animating in a gentle wave. */
function LoadingDots(): React.JSX.Element {
  const dots = useMemo(() => [new Animated.Value(0), new Animated.Value(0), new Animated.Value(0)], []);

  useEffect(() => {
    const loops = dots.map((dot, i) =>
      Animated.loop(
        Animated.sequence([
          Animated.delay(i * 180),
          Animated.timing(dot, {
            toValue: 1,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
          Animated.timing(dot, {
            toValue: 0,
            duration: 450,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: USE_NATIVE_DRIVER,
          }),
        ]),
      ),
    );
    loops.forEach((l) => l.start());
    return () => loops.forEach((l) => l.stop());
  }, [dots]);

  return (
    <View style={styles.dotsRow}>
      {dots.map((dot, i) => (
        <Animated.View
          key={i}
          style={[
            styles.dot,
            {
              opacity: dot.interpolate({ inputRange: [0, 1], outputRange: [0.3, 1] }),
              transform: [
                { translateY: dot.interpolate({ inputRange: [0, 1], outputRange: [0, -6] }) },
              ],
            },
          ]}
        />
      ))}
    </View>
  );
}

/** Static decorative dotted ring (rotated by parent). */
function DottedRing(): React.JSX.Element {
  const dots = Array.from({ length: 12 });
  const radius = 110;
  return (
    <View style={styles.ringInner}>
      {dots.map((_, i) => {
        const angle = (i / dots.length) * 2 * Math.PI;
        return (
          <View
            key={i}
            style={[
              styles.ringDot,
              {
                transform: [
                  { translateX: Math.cos(angle) * radius },
                  { translateY: Math.sin(angle) * radius },
                ],
                opacity: i % 3 === 0 ? 0.5 : 0.22,
              },
            ]}
          />
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.primary[900],
    justifyContent: 'center',
    alignItems: 'center',
  },
  glow: {
    position: 'absolute',
    backgroundColor: colors.gold[600],
    borderRadius: 999,
  },
  glowOuter: {
    width: 320,
    height: 320,
    opacity: 0.06,
  },
  glowInner: {
    width: 200,
    height: 200,
  },
  ring: {
    position: 'absolute',
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringInner: {
    width: 260,
    height: 260,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ringDot: {
    position: 'absolute',
    width: 5,
    height: 5,
    borderRadius: 3,
    backgroundColor: colors.gold[400],
  },
  arabicLogo: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.arabic.xl,
    color: colors.gold[600],
    textAlign: 'center',
  },
  divider: {
    width: 120,
    height: 2,
    borderRadius: 1,
    backgroundColor: colors.gold[500],
    marginTop: 14,
    marginBottom: 16,
    opacity: 0.9,
  },
  subTitle: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xl,
    color: colors.neutral[0],
    fontWeight: 'bold',
    letterSpacing: 1,
    textAlign: 'center',
  },
  loaderWrap: {
    position: 'absolute',
    bottom: 72,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginHorizontal: 5,
    backgroundColor: colors.gold[500],
  },
});
