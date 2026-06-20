import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardTypeOptions,
} from 'react-native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { colors, spacing, typography, borderRadius } from '@/tokens';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

interface AuthFieldProps {
  label: string;
  value: string;
  onChangeText: (t: string) => void;
  placeholder?: string;
  icon?: string;
  secure?: boolean;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  error?: string;
  onSubmitEditing?: () => void;
  returnKeyType?: 'done' | 'next' | 'go';
  autoFocus?: boolean;
}

export function AuthField({
  label,
  value,
  onChangeText,
  placeholder,
  icon,
  secure = false,
  keyboardType = 'default',
  autoCapitalize = 'none',
  error,
  onSubmitEditing,
  returnKeyType,
  autoFocus,
}: AuthFieldProps): React.JSX.Element {
  const { theme } = useTheme();
  const { isRTL } = useTranslation();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(secure);

  return (
    <View style={styles.wrap}>
      <Text style={[styles.label, isRTL && styles.rtlText]}>{label}</Text>
      <View
        style={[
          styles.inputRow,
          isRTL && styles.rowRTL,
          focused && styles.inputRowFocused,
          !!error && styles.inputRowError,
        ]}
      >
        {icon ? (
          <Ionicons
            name={icon}
            size={18}
            color={error ? colors.status.error : focused ? theme.textBrandGreen : theme.textMuted}
          />
        ) : null}
        <TextInput
          style={[styles.input, isRTL && styles.rtlText]}
          value={value}
          onChangeText={onChangeText}
          placeholder={placeholder}
          placeholderTextColor={theme.textMuted}
          secureTextEntry={hidden}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={false}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          onSubmitEditing={onSubmitEditing}
          returnKeyType={returnKeyType}
          autoFocus={autoFocus}
        />
        {secure ? (
          <TouchableOpacity onPress={() => setHidden((h) => !h)} hitSlop={8} activeOpacity={0.7}>
            <Ionicons
              name={hidden ? 'eye-outline' : 'eye-off-outline'}
              size={18}
              color={theme.textMuted}
            />
          </TouchableOpacity>
        ) : null}
      </View>
      {error ? <Text style={[styles.error, isRTL && styles.rtlText]}>{error}</Text> : null}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    wrap: {
      gap: 6,
    },
    label: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    inputRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: theme.bgInput,
      borderRadius: borderRadius.input,
      borderWidth: 1,
      borderColor: theme.border,
      paddingHorizontal: spacing[3],
      height: 50,
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    inputRowFocused: {
      borderColor: theme.textBrandGreen,
    },
    inputRowError: {
      borderColor: colors.status.error,
    },
    input: {
      flex: 1,
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textPrimary,
      paddingVertical: 0,
    },
    rtlText: {
      textAlign: 'right',
    },
    error: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: colors.status.error,
    },
  });

export default AuthField;
