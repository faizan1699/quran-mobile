import React from 'react';
import {
  Pressable,
  Text,
  StyleSheet,
  StyleProp,
  ViewStyle,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { Icon } from '@/components/Icon';
import { useTheme, Theme } from '@/theme';
import { spacing, typography, borderRadius } from '@/tokens';

interface BackButtonProps {
  onPress?: () => void;
  label?: string;
  showLabel?: boolean;
  style?: StyleProp<ViewStyle>;
}

export function BackButton({
  onPress,
  label,
  showLabel = false,
  style,
}: BackButtonProps): React.JSX.Element {
  const navigation = useNavigation<any>();
  const { theme } = useTheme();
  const { language } = useTranslation();
  const styles = React.useMemo(() => createStyles(theme), [theme]);

  const isRTL = language === 'ur';
  const handlePress = onPress ?? (() => navigation.goBack());
  const text = label ?? (isRTL ? 'واپس' : 'Back');
  const chevron = isRTL ? 'chevron-forward' : 'chevron-back';

  return (
    <Pressable
      onPress={handlePress}
      hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
      accessibilityRole="button"
      accessibilityLabel={text}
      style={({ pressed }) => [
        showLabel ? styles.pill : styles.circle,
        showLabel && isRTL && styles.pillRTL,
        pressed && styles.pressed,
        style,
      ]}
    >
      <Icon
        name={chevron}
        size={showLabel ? 18 : 22}
        color={theme.textPrimary}
      />
      {showLabel && <Text style={styles.label}>{text}</Text>}
    </Pressable>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    circle: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.xl,
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.bgMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    pill: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 2,
      height: 40,
      paddingLeft: spacing[2],
      paddingRight: spacing[3] + 2,
      borderRadius: borderRadius.full,
      backgroundColor: theme.bgMuted,
      borderWidth: StyleSheet.hairlineWidth,
      borderColor: theme.border,
    },
    pillRTL: {
      flexDirection: 'row-reverse',
    },
    pressed: {
      opacity: 0.7,
      transform: [{ scale: 0.94 }],
      backgroundColor: theme.bgInput,
    },
    label: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
    },
  });
