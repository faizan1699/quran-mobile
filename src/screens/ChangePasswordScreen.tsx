import React, { useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { BackButton } from '@/components/BackButton';
import { useTheme, Theme } from '@/theme';
import { authService } from '@/services/authService';
import { AuthField } from '@/components/auth/AuthField';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

interface Errors {
  current?: string;
  next?: string;
  confirm?: string;
}

export default function ChangePasswordScreen(): React.JSX.Element {
  const { t, isRTL } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [current, setCurrent] = useState('');
  const [next, setNext] = useState('');
  const [confirm, setConfirm] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const handleSave = async () => {
    const errs: Errors = {};
    if (current.length < 6) errs.current = t('auth.errPassword');
    if (next.length < 6) errs.next = t('auth.errPassword');
    if (confirm !== next) errs.confirm = t('auth.errMatch');
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await authService.changePassword(current, next);
      Alert.alert(t('auth.changeTitle'), t('auth.changeDone'));
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      {/* Top bar */}
      <View style={[styles.topBar, isRTL && styles.rowRTL]}>
        <BackButton />
        <Text style={styles.topTitle}>{t('auth.changeTitle')}</Text>
        <View style={styles.iconBtn} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.iconCircle}>
            <Ionicons name="key-outline" size={28} color={colors.gold[600]} />
          </View>
          <Text style={[styles.subtitle, isRTL && styles.rtlText]}>{t('auth.changeSubtitle')}</Text>

          <View style={styles.card}>
            <AuthField
              label={t('auth.currentPassword')}
              value={current}
              onChangeText={setCurrent}
              placeholder={t('auth.passwordPlaceholder')}
              icon="lock-closed-outline"
              secure
              error={errors.current}
            />
            <AuthField
              label={t('auth.newPassword')}
              value={next}
              onChangeText={setNext}
              placeholder={t('auth.newPasswordPlaceholder')}
              icon="lock-closed-outline"
              secure
              error={errors.next}
            />
            <AuthField
              label={t('auth.confirmPassword')}
              value={confirm}
              onChangeText={setConfirm}
              placeholder={t('auth.confirmPasswordPlaceholder')}
              icon="lock-closed-outline"
              secure
              error={errors.confirm}
            />

            <TouchableOpacity
              style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
              onPress={handleSave}
              disabled={loading}
              activeOpacity={0.85}
            >
              {loading ? (
                <ActivityIndicator color={colors.neutral[0]} />
              ) : (
                <Text style={styles.primaryBtnText}>{t('auth.savePassword')}</Text>
              )}
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bgPage,
    },
    flex: { flex: 1 },
    topBar: {
      height: spacing.headerHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.pagePadding,
    },
    rowRTL: { flexDirection: 'row-reverse' },
    iconBtn: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    content: {
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing[4],
      paddingBottom: spacing.sectionGap * 2,
      alignItems: 'center',
    },
    iconCircle: {
      width: 72,
      height: 72,
      borderRadius: borderRadius.full,
      backgroundColor: theme.isDark ? 'rgba(201,168,76,0.12)' : colors.gold[200],
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: spacing[3],
    },
    subtitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      textAlign: 'center',
      marginBottom: spacing[5],
      paddingHorizontal: spacing[4],
    },
    rtlText: { textAlign: 'right' },
    card: {
      alignSelf: 'stretch',
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius['2xl'],
      padding: spacing.cardPaddingLg,
      borderWidth: 1,
      borderColor: theme.border,
      gap: spacing[4],
      ...shadows.card,
    },
    primaryBtn: {
      height: 52,
      borderRadius: borderRadius.button,
      backgroundColor: theme.accentGreen,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing[1],
    },
    primaryBtnDisabled: { opacity: 0.7 },
    primaryBtnText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.neutral[0],
    },
  });
