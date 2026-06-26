import React, { useEffect, useMemo, useState } from 'react';
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
import { useTheme, Theme } from '@/theme';
import { useUserStore } from '@/store/useUserStore';
import { authService, AuthMethod } from '@/services/authService';
import { AuthField } from '@/components/auth/AuthField';
import { OtpInput } from '@/components/auth/OtpInput';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

type AuthMode = 'login' | 'register' | 'forgot' | 'otp' | 'reset';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const RESEND_SECONDS = 30;

interface Errors {
  name?: string;
  identifier?: string;
  password?: string;
  confirm?: string;
  otp?: string;
}

export default function AuthScreen(): React.JSX.Element {
  const { t, isRTL } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const signIn = useUserStore((s) => s.signIn);
  const styles = useMemo(() => createStyles(theme), [theme]);

  const [mode, setMode] = useState<AuthMode>('login');
  const [method, setMethod] = useState<AuthMethod>('email');
  const [name, setName] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [otp, setOtp] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);
  const [resendIn, setResendIn] = useState(0);

  // Resend cool-down countdown.
  useEffect(() => {
    if (resendIn <= 0) return;
    const id = setTimeout(() => setResendIn((s) => s - 1), 1000);
    return () => clearTimeout(id);
  }, [resendIn]);

  const titles: Record<AuthMode, { title: string; subtitle: string }> = {
    login: { title: t('auth.loginTitle'), subtitle: t('auth.loginSubtitle') },
    register: { title: t('auth.registerTitle'), subtitle: t('auth.registerSubtitle') },
    forgot: { title: t('auth.forgotTitle'), subtitle: t('auth.forgotSubtitle') },
    otp: { title: t('auth.otpTitle'), subtitle: `${t('auth.otpSubtitle')} ${identifier}` },
    reset: { title: t('auth.resetTitle'), subtitle: t('auth.resetSubtitle') },
  };

  const goToMode = (m: AuthMode) => {
    setErrors({});
    setPassword('');
    setConfirm('');
    setMode(m);
  };

  const validateIdentifier = (): string | null => {
    if (!identifier.trim()) return t('auth.errRequired');
    if (method === 'email') return EMAIL_RE.test(identifier.trim()) ? null : t('auth.errEmail');
    return identifier.replace(/\D/g, '').length >= 7 ? null : t('auth.errPhone');
  };

  const handleLogin = async () => {
    const errs: Errors = {};
    const idErr = validateIdentifier();
    if (idErr) errs.identifier = idErr;
    if (password.length < 6) errs.password = t('auth.errPassword');
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const user = await authService.login(method, identifier.trim(), password);
      signIn(user);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    const errs: Errors = {};
    if (!name.trim()) errs.name = t('auth.errName');
    const idErr = validateIdentifier();
    if (idErr) errs.identifier = idErr;
    if (password.length < 6) errs.password = t('auth.errPassword');
    if (confirm !== password) errs.confirm = t('auth.errMatch');
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      const user = await authService.register(method, identifier.trim(), name, password);
      signIn(user);
      navigation.goBack();
    } finally {
      setLoading(false);
    }
  };

  const handleSendOtp = async () => {
    const idErr = validateIdentifier();
    if (idErr) {
      setErrors({ identifier: idErr });
      return;
    }
    setLoading(true);
    try {
      const code = await authService.requestOtp(method, identifier.trim());
      setSentCode(code);
      setOtp('');
      setErrors({});
      setMode('otp');
      setResendIn(RESEND_SECONDS);
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendIn > 0) return;
    const code = await authService.requestOtp(method, identifier.trim());
    setSentCode(code);
    setOtp('');
    setResendIn(RESEND_SECONDS);
  };

  const handleVerify = async () => {
    if (otp.length < 6) {
      setErrors({ otp: t('auth.errOtp') });
      return;
    }
    setLoading(true);
    try {
      const ok = await authService.verifyOtp(otp, sentCode);
      if (!ok) {
        setErrors({ otp: t('auth.errOtpInvalid') });
        return;
      }
      setErrors({});
      setPassword('');
      setConfirm('');
      setMode('reset');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    const errs: Errors = {};
    if (password.length < 6) errs.password = t('auth.errPassword');
    if (confirm !== password) errs.confirm = t('auth.errMatch');
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setLoading(true);
    try {
      await authService.resetPassword(identifier.trim(), password);
      Alert.alert(t('auth.resetTitle'), t('auth.resetDone'));
      setPassword('');
      setConfirm('');
      setOtp('');
      goToMode('login');
    } finally {
      setLoading(false);
    }
  };

  const showMethodToggle = mode === 'login' || mode === 'register' || mode === 'forgot';
  const idLabel = method === 'email' ? t('auth.email') : t('auth.phone');
  const idPlaceholder = method === 'email' ? t('auth.emailPlaceholder') : t('auth.phonePlaceholder');
  const idIcon = method === 'email' ? 'mail-outline' : 'call-outline';
  const idKeyboard = method === 'email' ? 'email-address' : 'phone-pad';

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView
          contentContainerStyle={styles.content}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Hero */}
          <View style={styles.hero}>
            <View style={styles.heroGlow} />
            <TouchableOpacity
              style={[styles.closeBtn, isRTL ? styles.closeBtnRTL : styles.closeBtnLTR]}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
              accessibilityLabel="Close"
            >
              <Ionicons name="close" size={22} color={colors.neutral[0]} />
            </TouchableOpacity>

            {mode !== 'login' && mode !== 'register' ? (
              <TouchableOpacity
                style={[styles.backBtn, isRTL ? styles.backBtnRTL : styles.backBtnLTR]}
                onPress={() => goToMode(mode === 'reset' ? 'forgot' : mode === 'otp' ? 'forgot' : 'login')}
                activeOpacity={0.7}
                accessibilityLabel="Back"
              >
                <Ionicons
                  name={isRTL ? 'chevron-forward' : 'chevron-back'}
                  size={22}
                  color={colors.neutral[0]}
                />
              </TouchableOpacity>
            ) : null}

            <View style={styles.emblem}>
              <Text style={styles.emblemGlyph}>🕌</Text>
            </View>
            <Text style={styles.heroTitle}>{titles[mode].title}</Text>
            <Text style={styles.heroSubtitle} numberOfLines={2}>
              {titles[mode].subtitle}
            </Text>
          </View>

          {/* Card */}
          <View style={styles.card}>
            {/* Method toggle */}
            {showMethodToggle ? (
              <View style={[styles.segment, isRTL && styles.rowRTL]}>
                {(['email', 'phone'] as AuthMethod[]).map((m) => {
                  const active = method === m;
                  return (
                    <TouchableOpacity
                      key={m}
                      style={[styles.segmentItem, active && styles.segmentItemActive]}
                      onPress={() => {
                        setMethod(m);
                        setIdentifier('');
                        setErrors((e) => ({ ...e, identifier: undefined }));
                      }}
                      activeOpacity={0.85}
                    >
                      <Ionicons
                        name={m === 'email' ? 'mail-outline' : 'call-outline'}
                        size={16}
                        color={active ? colors.neutral[0] : theme.textSecondary}
                      />
                      <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                        {m === 'email' ? t('auth.methodEmail') : t('auth.methodPhone')}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}

            {/* Fields per mode */}
            <View style={styles.fields}>
              {mode === 'register' ? (
                <AuthField
                  label={t('auth.name')}
                  value={name}
                  onChangeText={setName}
                  placeholder={t('auth.namePlaceholder')}
                  icon="person-outline"
                  autoCapitalize="words"
                  error={errors.name}
                />
              ) : null}

              {mode !== 'otp' && mode !== 'reset' ? (
                <AuthField
                  label={idLabel}
                  value={identifier}
                  onChangeText={setIdentifier}
                  placeholder={idPlaceholder}
                  icon={idIcon}
                  keyboardType={idKeyboard}
                  error={errors.identifier}
                />
              ) : null}

              {mode === 'login' || mode === 'register' ? (
                <AuthField
                  label={t('auth.password')}
                  value={password}
                  onChangeText={setPassword}
                  placeholder={t('auth.passwordPlaceholder')}
                  icon="lock-closed-outline"
                  secure
                  error={errors.password}
                />
              ) : null}

              {mode === 'register' ? (
                <AuthField
                  label={t('auth.confirmPassword')}
                  value={confirm}
                  onChangeText={setConfirm}
                  placeholder={t('auth.confirmPasswordPlaceholder')}
                  icon="lock-closed-outline"
                  secure
                  error={errors.confirm}
                />
              ) : null}

              {mode === 'login' ? (
                <TouchableOpacity
                  onPress={() => goToMode('forgot')}
                  activeOpacity={0.7}
                  style={isRTL ? styles.selfStart : styles.selfEnd}
                >
                  <Text style={styles.linkSm}>{t('auth.forgotPassword')}</Text>
                </TouchableOpacity>
              ) : null}

              {/* OTP step */}
              {mode === 'otp' ? (
                <View style={styles.otpBlock}>
                  <OtpInput value={otp} onChange={setOtp} length={6} autoFocus error={!!errors.otp} />
                  {errors.otp ? <Text style={styles.errorText}>{errors.otp}</Text> : null}

                  {sentCode ? (
                    <View style={styles.demoHint}>
                      <Ionicons name="information-circle-outline" size={14} color={theme.textGold} />
                      <Text style={styles.demoHintText}>
                        {t('auth.demoCode')}: {sentCode}
                      </Text>
                    </View>
                  ) : null}

                  <View style={[styles.resendRow, isRTL && styles.rowRTL]}>
                    <TouchableOpacity onPress={handleResend} disabled={resendIn > 0} activeOpacity={0.7}>
                      <Text style={[styles.linkSm, resendIn > 0 && styles.linkDisabled]}>
                        {resendIn > 0 ? `${t('auth.resendIn')} ${resendIn}s` : t('auth.resend')}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ) : null}

              {/* Reset step */}
              {mode === 'reset' ? (
                <>
                  <AuthField
                    label={t('auth.newPassword')}
                    value={password}
                    onChangeText={setPassword}
                    placeholder={t('auth.newPasswordPlaceholder')}
                    icon="lock-closed-outline"
                    secure
                    error={errors.password}
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
                </>
              ) : null}
            </View>

            {/* Primary action */}
            <PrimaryButton
              styles={styles}
              loading={loading}
              label={
                mode === 'login'
                  ? t('auth.signIn')
                  : mode === 'register'
                  ? t('auth.signUp')
                  : mode === 'forgot'
                  ? t('auth.sendCode')
                  : mode === 'otp'
                  ? t('auth.verify')
                  : t('auth.resetPassword')
              }
              onPress={
                mode === 'login'
                  ? handleLogin
                  : mode === 'register'
                  ? handleRegister
                  : mode === 'forgot'
                  ? handleSendOtp
                  : mode === 'otp'
                  ? handleVerify
                  : handleReset
              }
            />

            {/* Mode switch footer */}
            {mode === 'login' ? (
              <View style={[styles.switchRow, isRTL && styles.rowRTL]}>
                <Text style={styles.switchText}>{t('auth.noAccount')} </Text>
                <TouchableOpacity onPress={() => goToMode('register')} activeOpacity={0.7}>
                  <Text style={styles.switchLink}>{t('auth.register')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {mode === 'register' ? (
              <View style={[styles.switchRow, isRTL && styles.rowRTL]}>
                <Text style={styles.switchText}>{t('auth.haveAccount')} </Text>
                <TouchableOpacity onPress={() => goToMode('login')} activeOpacity={0.7}>
                  <Text style={styles.switchLink}>{t('auth.signIn')}</Text>
                </TouchableOpacity>
              </View>
            ) : null}

            {mode === 'forgot' || mode === 'otp' || mode === 'reset' ? (
              <TouchableOpacity
                style={styles.centerLink}
                onPress={() => goToMode('login')}
                activeOpacity={0.7}
              >
                <Text style={styles.switchLink}>{t('auth.backToLogin')}</Text>
              </TouchableOpacity>
            ) : null}
          </View>

          {mode === 'login' || mode === 'register' ? (
            <TouchableOpacity
              style={styles.guestBtn}
              onPress={() => navigation.goBack()}
              activeOpacity={0.7}
            >
              <Text style={styles.guestText}>{t('auth.continueGuest')}</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PrimaryButton({
  styles,
  label,
  onPress,
  loading,
}: {
  styles: ReturnType<typeof createStyles>;
  label: string;
  onPress: () => void;
  loading: boolean;
}): React.JSX.Element {
  return (
    <TouchableOpacity
      style={[styles.primaryBtn, loading && styles.primaryBtnDisabled]}
      onPress={onPress}
      disabled={loading}
      activeOpacity={0.85}
    >
      {loading ? (
        <ActivityIndicator color={colors.neutral[0]} />
      ) : (
        <Text style={styles.primaryBtnText}>{label}</Text>
      )}
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bgPage,
    },
    flex: {
      flex: 1,
    },
    content: {
      paddingBottom: spacing.sectionGap * 2,
    },
    // Hero
    hero: {
      backgroundColor: theme.accentGreen,
      paddingTop: spacing[8],
      paddingBottom: spacing[8],
      paddingHorizontal: spacing.pagePadding,
      alignItems: 'center',
      borderBottomLeftRadius: borderRadius['3xl'],
      borderBottomRightRadius: borderRadius['3xl'],
      overflow: 'hidden',
    },
    heroGlow: {
      position: 'absolute',
      top: -70,
      right: -50,
      width: 180,
      height: 180,
      borderRadius: 90,
      backgroundColor: theme.accentGreen,
      opacity: 0.22,
    },
    closeBtn: {
      position: 'absolute',
      top: spacing[3],
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(255,255,255,0.12)',
      justifyContent: 'center',
      alignItems: 'center',
    },
    closeBtnLTR: { right: spacing.pagePadding },
    closeBtnRTL: { left: spacing.pagePadding },
    backBtn: {
      position: 'absolute',
      top: spacing[3],
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    backBtnLTR: { left: spacing.pagePadding },
    backBtnRTL: { right: spacing.pagePadding },
    emblem: {
      width: 60,
      height: 60,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[900],
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.gold[500],
      marginBottom: spacing[3],
      marginTop: spacing[4],
    },
    emblemGlyph: {
      fontSize: 28,
    },
    heroTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize['3xl'],
      fontWeight: typography.fontWeight.extrabold,
      color: colors.neutral[0],
      textAlign: 'center',
    },
    heroSubtitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: 'rgba(255,255,255,0.82)',
      textAlign: 'center',
      marginTop: 6,
      paddingHorizontal: spacing[4],
    },
    // Card
    card: {
      backgroundColor: theme.bgCard,
      marginHorizontal: spacing.pagePadding,
      marginTop: -spacing[6],
      borderRadius: borderRadius['2xl'],
      padding: spacing.cardPaddingLg,
      borderWidth: 1,
      borderColor: theme.border,
      gap: spacing[4],
      ...shadows.card,
    },
    segment: {
      flexDirection: 'row',
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.full,
      padding: 4,
      gap: 4,
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    segmentItem: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      paddingVertical: 9,
      borderRadius: borderRadius.full,
    },
    segmentItemActive: {
      backgroundColor: theme.accentGreen,
    },
    segmentText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    segmentTextActive: {
      color: colors.neutral[0],
    },
    fields: {
      gap: spacing[3],
    },
    selfEnd: { alignSelf: 'flex-end' },
    selfStart: { alignSelf: 'flex-start' },
    linkSm: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textBrandGreen,
    },
    linkDisabled: {
      color: theme.textMuted,
    },
    otpBlock: {
      gap: spacing[3],
    },
    errorText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: colors.status.error,
    },
    demoHint: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: 6,
      backgroundColor: theme.isDark ? 'rgba(201,168,76,0.12)' : colors.gold[200],
      borderRadius: borderRadius.md,
      paddingVertical: spacing[2],
    },
    demoHintText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textGold,
    },
    resendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
    },
    primaryBtn: {
      height: 52,
      borderRadius: borderRadius.button,
      backgroundColor: theme.accentGreen,
      justifyContent: 'center',
      alignItems: 'center',
    },
    primaryBtnDisabled: {
      opacity: 0.7,
    },
    primaryBtnText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: colors.neutral[0],
    },
    switchRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
    },
    switchText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
    },
    switchLink: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: theme.textBrandGreen,
    },
    centerLink: {
      alignItems: 'center',
    },
    guestBtn: {
      alignItems: 'center',
      marginTop: spacing[5],
    },
    guestText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textMuted,
      textDecorationLine: 'underline',
    },
  });
