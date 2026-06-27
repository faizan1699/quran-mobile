import React, { useEffect, useMemo, useRef } from 'react';
import {
  Animated,
  StyleSheet,
  View,
  DimensionValue,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useTheme, Theme } from '@/theme';
import { borderRadius, spacing, shadows } from '@/tokens';

interface SkeletonProps {
  width?: DimensionValue;
  height?: DimensionValue;
  radius?: number;
  style?: StyleProp<ViewStyle>;
}

export function Skeleton({
  width = '100%',
  height = 16,
  radius = 6,
  style,
}: SkeletonProps): React.JSX.Element {
  const { theme } = useTheme();
  const pulse = useRef(new Animated.Value(0.4)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, {
          toValue: 1,
          duration: 750,
          useNativeDriver: true,
        }),
        Animated.timing(pulse, {
          toValue: 0.4,
          duration: 750,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [pulse]);

  return (
    <Animated.View
      style={[
        {
          width,
          height,
          borderRadius: radius,
          backgroundColor: theme.bgMuted,
          opacity: pulse,
        },
        style,
      ]}
    />
  );
}

export function LibrarySkeleton(): React.JSX.Element {
  const { theme } = useTheme();
  const styles = useMemo(() => createLibStyles(theme), [theme]);

  return (
    <View>
      {[0, 1].map((shelf) => (
        <View key={shelf} style={styles.shelf}>
          <Skeleton width={130} height={18} radius={6} style={styles.shelfTitle} />
          <View style={styles.row}>
            {[0, 1, 2].map((card) => (
              <View key={card} style={styles.card}>
                <Skeleton width={120} height={160} radius={borderRadius.bookCover} />
                <Skeleton width={104} height={13} radius={4} style={styles.cardTitle} />
                <Skeleton width={72} height={11} radius={4} style={styles.cardAuthor} />
              </View>
            ))}
          </View>
        </View>
      ))}
    </View>
  );
}

export function SurahListSkeleton(): React.JSX.Element {
  const { theme } = useTheme();
  const styles = useMemo(() => createSurahStyles(theme), [theme]);

  return (
    <View style={styles.wrap}>
      {Array.from({ length: 9 }).map((_, i) => (
        <View key={i} style={styles.row}>
          <Skeleton width={40} height={40} radius={borderRadius.button} />
          <View style={styles.nameBox}>
            <Skeleton width="55%" height={16} radius={5} />
            <Skeleton width="85%" height={11} radius={4} style={styles.sub} />
          </View>
          <Skeleton width={44} height={22} radius={5} />
          <Skeleton width={40} height={40} radius={20} />
        </View>
      ))}
    </View>
  );
}

const createLibStyles = (_theme: Theme) =>
  StyleSheet.create({
    shelf: {
      marginBottom: spacing.sectionGap,
    },
    shelfTitle: {
      marginBottom: spacing[2],
    },
    row: {
      flexDirection: 'row',
    },
    card: {
      width: 120,
      marginRight: spacing[4],
    },
    cardTitle: {
      marginTop: 8,
    },
    cardAuthor: {
      marginTop: 4,
    },
  });

const createSurahStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      flex: 1,
      marginTop: spacing[3],
      paddingHorizontal: spacing.pagePadding,
      gap: spacing.cardGap,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: theme.border,
      padding: spacing.cardPadding,
      gap: spacing[3],
      ...shadows.sm,
    },
    nameBox: {
      flex: 1,
      gap: 6,
    },
    sub: {
      marginTop: 2,
    },
  });
