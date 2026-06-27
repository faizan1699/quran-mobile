import React, { useMemo } from 'react';
import { TouchableOpacity, StyleSheet, ViewStyle, StyleProp } from 'react-native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTheme, Theme } from '@/theme';
import { useShareSheet } from '@/components/share/ShareProvider';
import { ShareContent } from '@/types/share';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

interface ShareButtonProps {
  content: ShareContent;
  size?: number;
  color?: string;
  style?: StyleProp<ViewStyle>;
  variant?: 'plain' | 'soft';
}

export function ShareButton({
  content,
  size = 18,
  color,
  style,
  variant = 'plain',
}: ShareButtonProps): React.JSX.Element {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { share } = useShareSheet();

  return (
    <TouchableOpacity
      onPress={() => share(content)}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel="Share as image"
      style={[variant === 'soft' ? styles.soft : styles.plain, style]}
    >
      <Ionicons
        name="share-social-outline"
        size={size}
        color={color ?? theme.textGold}
      />
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    plain: {
      alignItems: 'center',
      justifyContent: 'center',
      padding: 4,
    },
    soft: {
      width: 34,
      height: 34,
      borderRadius: 17,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bgMuted,
      borderWidth: 1,
      borderColor: theme.border,
    },
  });

export default ShareButton;
