import React, { useEffect, useRef, useState } from 'react';
import {
  Animated,
  Dimensions,
  LayoutChangeEvent,
  NativeScrollEvent,
  NativeSyntheticEvent,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useTranslation } from '@/i18n';
import { FLASHES, Flash } from '@/data/flashes';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';

const AUTO_ADVANCE_MS = 4500;
const CARD_HEIGHT = 150;

interface FlashesCarouselProps {
  onFlashPress?: (flash: Flash) => void;
}

/**
 * Auto-rotating "flashes" carousel for the Home screen. Swipeable + auto-advance
 * (auto-advance pauses briefly after a manual swipe). Built on a paging
 * Animated.ScrollView so it needs no carousel dependency and works on web too.
 */
export function FlashesCarousel({ onFlashPress }: FlashesCarouselProps): React.JSX.Element {
  const { language } = useTranslation();
  const isUrdu = language === 'ur';

  // Animated.ScrollView forwards `scrollTo`; `any` avoids brittle Animated ref generics.
  const scrollRef = useRef<any>(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const [width, setWidth] = useState(Dimensions.get('window').width - spacing.pagePadding * 2);
  const indexRef = useRef(0);
  // Set to true while the user is interacting so we don't fight their gesture.
  const interactingRef = useRef(false);

  const onLayout = (e: LayoutChangeEvent) => {
    const w = e.nativeEvent.layout.width;
    if (w > 0 && Math.abs(w - width) > 1) setWidth(w);
  };

  const goTo = (index: number) => {
    scrollRef.current?.scrollTo?.({ x: index * width, animated: true });
  };

  // Auto-advance loop. Reads the live index from a ref so the interval never
  // needs to be torn down/recreated as the index changes.
  useEffect(() => {
    const id = setInterval(() => {
      if (interactingRef.current || FLASHES.length < 2) return;
      const next = (indexRef.current + 1) % FLASHES.length;
      indexRef.current = next;
      goTo(next);
    }, AUTO_ADVANCE_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width]);

  const onMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    indexRef.current = Math.round(e.nativeEvent.contentOffset.x / width);
    interactingRef.current = false;
  };

  return (
    <View>
      <Animated.ScrollView
        ref={scrollRef}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onLayout={onLayout}
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
        {FLASHES.map((flash) => (
          <TouchableOpacity
            key={flash.id}
            activeOpacity={0.9}
            onPress={() => onFlashPress?.(flash)}
            style={[styles.card, { width, backgroundColor: flash.bg }]}
          >
            {/* Decorative oversized glyph */}
            <Text style={styles.bgGlyph}>{flash.icon}</Text>

            <View style={styles.cardBody}>
              <View style={[styles.iconChip, { backgroundColor: flash.accent }]}>
                <Text style={styles.iconChipText}>{flash.icon}</Text>
              </View>

              <View style={styles.textCol}>
                <Text style={[styles.title, isUrdu && styles.textRTL]} numberOfLines={1}>
                  {isUrdu ? flash.titleUrdu : flash.title}
                </Text>

                {flash.arabic ? (
                  <Text style={styles.arabic} numberOfLines={1}>
                    {flash.arabic}
                  </Text>
                ) : null}

                <Text style={[styles.subtitle, isUrdu && styles.textRTL]} numberOfLines={2}>
                  {isUrdu ? flash.subtitleUrdu : flash.subtitle}
                </Text>

                {flash.cta ? (
                  <View style={[styles.ctaPill, { borderColor: flash.accent }]}>
                    <Text style={[styles.ctaText, { color: flash.accent }]}>
                      {isUrdu ? flash.cta.labelUrdu : flash.cta.label} ›
                    </Text>
                  </View>
                ) : null}
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </Animated.ScrollView>

      {/* Animated pagination dots */}
      <View style={styles.dotsRow}>
        {FLASHES.map((flash, i) => {
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
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    height: CARD_HEIGHT,
    borderRadius: borderRadius.cardLg,
    padding: spacing.cardPaddingLg,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.gold[500],
    justifyContent: 'center',
    ...shadows.card,
  },
  bgGlyph: {
    position: 'absolute',
    right: -10,
    top: -16,
    fontSize: 120,
    opacity: 0.12,
  },
  cardBody: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  iconChip: {
    width: 44,
    height: 44,
    borderRadius: borderRadius.full,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconChipText: {
    fontSize: 22,
  },
  textCol: {
    flex: 1,
    gap: 3,
  },
  title: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.lg,
    fontWeight: typography.fontWeight.bold,
    color: colors.neutral[0],
  },
  arabic: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.arabic.sm,
    color: colors.gold[400],
    textAlign: 'right',
  },
  subtitle: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm,
    color: 'rgba(255,255,255,0.85)',
    lineHeight: typography.fontSize.sm * typography.lineHeight.normal,
  },
  textRTL: {
    textAlign: 'right',
  },
  ctaPill: {
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderRadius: borderRadius.full,
    paddingHorizontal: spacing[3],
    paddingVertical: 4,
    marginTop: spacing[1],
  },
  ctaText: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs,
    fontWeight: typography.fontWeight.bold,
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
    backgroundColor: colors.primary[600],
  },
});

export default FlashesCarousel;
