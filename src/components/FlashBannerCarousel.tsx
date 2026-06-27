import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { Image } from 'expo-image';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { useFlashes } from '@/hooks/useFlashes';
import { spacing, typography, borderRadius, shadows } from '@/tokens';

const AUTO_ADVANCE_MS = 5000;
const CARD_HEIGHT = 170;

export function FlashBannerCarousel(): React.JSX.Element | null {
  const { t, isRTL } = useTranslation();
  const { theme } = useTheme();
  const { flashes } = useFlashes();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const scrollRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [width, setWidth] = useState(Dimensions.get('window').width - spacing.pagePadding * 2);
  const indexRef = useRef(0);
  const interactingRef = useRef(false);

  const count = flashes.length;

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - width) > 1) setWidth(w);
  };

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo?.({ x: index * width, animated: true });
  };

  useEffect(() => {
    const id = setInterval(() => {
      if (interactingRef.current || count < 2) return;
      const next = (indexRef.current + 1) % count;
      indexRef.current = next;
      goTo(next);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, count]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    indexRef.current = Math.round(e.nativeEvent.contentOffset.x / width);
    interactingRef.current = false;
  };

  if (count === 0) {
    return null;
  }

  return (
    <View>
      <Text style={[styles.heading, isRTL && styles.headingRTL]}>{t('home.flashes')}</Text>

      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={onLayout}
        scrollEnabled={count > 1}
        onScrollBeginDrag={() => {
          interactingRef.current = true;
        }}
        onMomentumScrollEnd={onMomentumEnd}
        scrollEventThrottle={16}
        onScroll={Animated.event(
          [{ nativeEvent: { contentOffset: { x: scrollX } } }],
          { useNativeDriver: false }
        )}
      >
        {flashes.map((flash) => (
          <View key={flash.id} style={[styles.card, { width }]}>
            <Image
              source={{ uri: flash.imageUrl }}
              style={styles.image}
              contentFit="cover"
              transition={200}
            />
          </View>
        ))}
      </Animated.ScrollView>

      {count > 1 ? (
        <View style={styles.dotsRow}>
          {flashes.map((flash, i) => {
            const dotWidth = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [6, 18, 6],
              extrapolate: 'clamp',
            });
            const opacity = scrollX.interpolate({
              inputRange: [(i - 1) * width, i * width, (i + 1) * width],
              outputRange: [0.4, 1, 0.4],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={flash.id}
                style={[styles.dot, { width: dotWidth, opacity }]}
              />
            );
          })}
        </View>
      ) : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    heading: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textOnDark,
      marginBottom: spacing[3],
    },
    headingRTL: {
      textAlign: 'right',
    },
    card: {
      height: CARD_HEIGHT,
      borderRadius: borderRadius.cardLg,
      overflow: 'hidden',
      backgroundColor: theme.bgCard,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.card,
    },
    image: {
      width: '100%',
      height: '100%',
    },
    dotsRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: 5,
      marginTop: spacing[3],
    },
    dot: {
      height: 6,
      borderRadius: 3,
      backgroundColor: theme.accentGreen,
    },
  });

export default FlashBannerCarousel;
