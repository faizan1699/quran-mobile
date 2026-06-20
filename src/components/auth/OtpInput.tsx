import React, { useMemo, useRef } from 'react';
import {
  StyleSheet,
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';
import { useTheme, Theme } from '@/theme';
import { typography, borderRadius } from '@/tokens';

interface OtpInputProps {
  value: string;
  onChange: (code: string) => void;
  length?: number;
  autoFocus?: boolean;
  error?: boolean;
}

/**
 * Segmented one-time-code input: `length` single-character boxes that
 * auto-advance on entry and step back on backspace. The full code string is
 * owned by the parent via `value` / `onChange`.
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  autoFocus,
  error,
}: OtpInputProps): React.JSX.Element {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const inputs = useRef<Array<TextInput | null>>([]);

  const setCharAt = (index: number, char: string) => {
    const chars = value.split('');
    chars[index] = char;
    return chars.join('').slice(0, length);
  };

  const handleChange = (text: string, index: number) => {
    const digit = text.replace(/[^0-9]/g, '').slice(-1);
    if (!digit) {
      // Cleared the box
      onChange(setCharAt(index, '').replace(/\s+$/, ''));
      return;
    }
    onChange(setCharAt(index, digit));
    if (index < length - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyPress = (
    e: NativeSyntheticEvent<TextInputKeyPressEventData>,
    index: number
  ) => {
    if (e.nativeEvent.key === 'Backspace' && !value[index] && index > 0) {
      inputs.current[index - 1]?.focus();
      onChange(setCharAt(index - 1, ''));
    }
  };

  return (
    <View style={styles.row}>
      {Array.from({ length }).map((_, i) => {
        const filled = !!value[i];
        return (
          <TextInput
            key={i}
            ref={(r) => {
              inputs.current[i] = r;
            }}
            style={[
              styles.cell,
              filled && styles.cellFilled,
              error && styles.cellError,
            ]}
            value={value[i] ?? ''}
            onChangeText={(t) => handleChange(t, i)}
            onKeyPress={(e) => handleKeyPress(e, i)}
            keyboardType="number-pad"
            maxLength={1}
            selectTextOnFocus
            autoFocus={autoFocus && i === 0}
            textContentType="oneTimeCode"
          />
        );
      })}
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    row: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      gap: 8,
    },
    cell: {
      flex: 1,
      height: 56,
      borderRadius: borderRadius.md,
      borderWidth: 1.5,
      borderColor: theme.border,
      backgroundColor: theme.bgInput,
      textAlign: 'center',
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    cellFilled: {
      borderColor: theme.textBrandGreen,
    },
    cellError: {
      borderColor: '#C62828',
    },
  });

export default OtpInput;
