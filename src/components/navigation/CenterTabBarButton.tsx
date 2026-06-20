import React from 'react';
import { StyleSheet, TouchableOpacity, View, Text, GestureResponderEvent } from 'react-native';
import { colors, shadows, typography } from '@/tokens';

interface CenterTabBarButtonProps {
  children?: React.ReactNode;
  onPress?: (e: GestureResponderEvent) => void;
}

export function CenterTabBarButton({
  onPress,
}: CenterTabBarButtonProps): React.JSX.Element {
  return (
    <TouchableOpacity
      style={styles.container}
      onPress={onPress}
      activeOpacity={0.85}
    >
      <View style={styles.bubble}>
        {/* Arabic text placeholder for 'Duaa' calligraphy */}
        <Text style={styles.calligraphy}>دعاء</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    top: -16, // Protrudes ~16px above the navigation bar
    justifyContent: 'center',
    alignItems: 'center',
    ...shadows.md,
  },
  bubble: {
    width: 56, // bottomNav.centerTabSize
    height: 56,
    borderRadius: 28, // fully round
    backgroundColor: colors.primary[800], // bottomNav.centerTabBg
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.gold[500], // beautiful gold ring border
  },
  calligraphy: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: 22,
    color: colors.neutral[0], // white text
    fontWeight: 'bold',
    textAlign: 'center',
    lineHeight: 28,
  },
});
