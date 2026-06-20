import React, { useEffect, useRef } from 'react';
import { Animated, Platform, ViewStyle, StyleProp } from 'react-native';
import { animation } from '@/tokens';

const USE_NATIVE_DRIVER = Platform.OS !== 'web';

interface FadeInViewProps {
  children: React.ReactNode;

  delay?: number;
  duration?: number;
  offsetY?: number;
  style?: StyleProp<ViewStyle>;
}

export function FadeInView({
  children,
  delay = 0,
  duration = animation.duration.normal,
  offsetY = 16,
  style,
}: FadeInViewProps): React.JSX.Element {
  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const anim = Animated.timing(progress, {
      toValue: 1,
      duration,
      delay,
      useNativeDriver: USE_NATIVE_DRIVER,
    });
    anim.start();
    return () => anim.stop();
  }, [progress, delay, duration]);

  const translateY = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [offsetY, 0],
  });

  return (
    <Animated.View style={[{ opacity: progress, transform: [{ translateY }] }, style]}>
      {children}
    </Animated.View>
  );
}

export default FadeInView;