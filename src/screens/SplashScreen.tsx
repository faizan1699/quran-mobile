import React, { useEffect, useRef } from 'react';
import { View, Image, StyleSheet, Animated, Easing, Platform, StatusBar } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import Svg, { Defs, RadialGradient, Stop, Circle } from 'react-native-svg';
import { RootStackParamList } from '@/navigation/types';
import { colors, animation } from '@/tokens';
import SplashBackground from '@/components/splash/SplashBackground';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';
const SPLASH_HOLD = animation.duration.splash;

const LOGO_SIZE = 138;
const TITLE_WIDTH = 232;
const TITLE_HEIGHT = 78;
const GLOW_SIZE = LOGO_SIZE * 2.4;

const logoSource = require('../../assets/splash/logo.png');
const titleSource = require('../../assets/splash/title.png');

function Glow({ size }: { size: number }): React.JSX.Element {
  return (
    <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <Defs>
        <RadialGradient id="splashGlow" cx="50%" cy="50%" r="50%">
          <Stop offset="0" stopColor={colors.splash.glow} stopOpacity="0.55" />
          <Stop offset="0.45" stopColor={colors.splash.glow} stopOpacity="0.22" />
          <Stop offset="1" stopColor={colors.splash.glow} stopOpacity="0" />
        </RadialGradient>
      </Defs>
      <Circle cx={size / 2} cy={size / 2} r={size / 2} fill="url(#splashGlow)" />
    </Svg>
  );
}

export default function SplashScreen(): React.JSX.Element {
  const navigation = useNavigation<NativeStackNavigationProp<RootStackParamList>>();

  const badgeOpacity = useRef(new Animated.Value(0)).current;
  const badgeScale = useRef(new Animated.Value(0.82)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleShift = useRef(new Animated.Value(16)).current;

  const glowPulse = useRef(new Animated.Value(0)).current;
  const floatY = useRef(new Animated.Value(0)).current;
  const screenOpacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(badgeOpacity, {
        toValue: 1,
        duration: 650,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.spring(badgeScale, {
        toValue: 1,
        friction: 6,
        tension: 48,
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(titleOpacity, {
        toValue: 1,
        duration: 600,
        delay: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
      Animated.timing(titleShift, {
        toValue: 0,
        duration: 600,
        delay: 420,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: USE_NATIVE_DRIVER,
      }),
    ]).start();

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

    const floatLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(floatY, {
          toValue: 1,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
        Animated.timing(floatY, {
          toValue: 0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: USE_NATIVE_DRIVER,
        }),
      ]),
    );
    floatLoop.start();

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
      floatLoop.stop();
    };
  }, [
    navigation,
    badgeOpacity,
    badgeScale,
    titleOpacity,
    titleShift,
    glowPulse,
    floatY,
    screenOpacity,
  ]);

  const glowScale = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1.12] });
  const glowOpacity = glowPulse.interpolate({ inputRange: [0, 1], outputRange: [0.7, 1] });
  const floatShift = floatY.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  return (
    <Animated.View style={[styles.screen, { opacity: screenOpacity }]}>
      <StatusBar
        barStyle="light-content"
        backgroundColor={colors.splash.gradient[0]}
        translucent
      />
      <SplashBackground>
        <View style={styles.content}>
          <Animated.View
            style={[
              styles.badgeWrap,
              {
                opacity: badgeOpacity,
                transform: [{ scale: badgeScale }, { translateY: floatShift }],
              },
            ]}
          >
            <Animated.View
              style={[
                styles.glow,
                { opacity: glowOpacity, transform: [{ scale: glowScale }] },
              ]}
            >
              <Glow size={GLOW_SIZE} />
            </Animated.View>
            <Image source={logoSource} style={styles.logo} resizeMode="contain" />
          </Animated.View>

          <Animated.View
            style={{ opacity: titleOpacity, transform: [{ translateY: titleShift }] }}
          >
            <Image source={titleSource} style={styles.title} resizeMode="contain" />
          </Animated.View>
        </View>
      </SplashBackground>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: colors.splash.gradient[0],
  },
  content: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeWrap: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  glow: {
    position: 'absolute',
    width: GLOW_SIZE,
    height: GLOW_SIZE,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logo: {
    width: LOGO_SIZE,
    height: LOGO_SIZE,
  },
  title: {
    width: TITLE_WIDTH,
    height: TITLE_HEIGHT,
    marginTop: 46,
  },
});
