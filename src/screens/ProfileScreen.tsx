import React, { useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
} from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { useTheme, ThemeMode, Theme } from '@/theme';
import { useUserStore } from '@/store/useUserStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { colors, spacing, typography, borderRadius, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

interface ThemeOption {
  mode: ThemeMode;
  labelKey: string;
  icon: string;
}
const THEME_OPTIONS: ThemeOption[] = [
  { mode: 'light', labelKey: 'theme.light', icon: 'sunny-outline' },
  { mode: 'dark', labelKey: 'theme.dark', icon: 'moon-outline' },
  { mode: 'system', labelKey: 'theme.system', icon: 'phone-portrait-outline' },
];

interface MenuItem {
  key: string;
  labelKey: string;
  icon: string;
  count?: number;
}

export default function ProfileScreen(): React.JSX.Element {
  const { t, language, changeLanguage, isRTL } = useTranslation();
  const { theme, mode, setMode } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const downloadedIds = usePreferencesStore((s) => s.downloadedIds);
  const isLoggedIn = useUserStore((s) => s.isLoggedIn);
  const user = useUserStore((s) => s.user);
  const logout = useUserStore((s) => s.logout);

  const styles = useMemo(() => createStyles(theme), [theme]);

  const menuItems: MenuItem[] = [
    { key: 'bookmarks', labelKey: 'profile.menuBookmarks', icon: 'bookmark-outline', count: 12 },
    {
      key: 'downloads',
      labelKey: 'profile.menuDownloads',
      icon: 'cloud-download-outline',
      count: downloadedIds.length,
    },
    { key: 'history', labelKey: 'profile.menuHistory', icon: 'time-outline' },
    ...(isLoggedIn
      ? [{ key: 'password', labelKey: 'auth.changeTitle', icon: 'key-outline' } as MenuItem]
      : []),
    {
      key: 'settings',
      labelKey: 'profile.menuSettings',
      icon: 'settings-outline',
    },
    { key: 'about', labelKey: 'profile.menuAbout', icon: 'information-circle-outline' },
    { key: 'help', labelKey: 'profile.menuHelp', icon: 'help-circle-outline' },
  ];

  const handleMenuPress = (key: string) => {
    if (key === 'settings') {
      navigation.navigate('MainTabs', { screen: 'MoreStack' } as never);
      return;
    }
    if (key === 'password') {
      navigation.navigate('ChangePassword');
      return;
    }
    Alert.alert(
      t(`profile.menu${key.charAt(0).toUpperCase()}${key.slice(1)}`),
      language === 'ur' ? 'یہ فیچر جلد آ رہا ہے۔' : 'This feature is coming soon.'
    );
  };

  const handleLogout = () => {
    Alert.alert(
      t('profile.logout'),
      language === 'ur' ? 'کیا آپ واقعی لاگ آؤٹ کرنا چاہتے ہیں؟' : 'Are you sure you want to log out?',
      [
        { text: language === 'ur' ? 'منسوخ' : 'Cancel', style: 'cancel' },
        { text: t('profile.logout'), style: 'destructive', onPress: () => logout() },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top bar */}
      <View style={[styles.topBar, isRTL && styles.rowRTL]}>
        <TouchableOpacity
          style={styles.iconButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={24}
            color={theme.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.topBarTitle}>{t('profile.title')}</Text>
        <View style={styles.iconButton} />
      </View>

      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Hero profile card */}
        <View style={styles.heroCard}>
          <View style={styles.heroGlow} />
          <View style={[styles.heroRow, isRTL && styles.rowRTL]}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={34} color={colors.gold[400]} />
            </View>
            <View style={styles.heroTextCol}>
              <Text style={[styles.heroName, isRTL && styles.textRTL]} numberOfLines={1}>
                {isLoggedIn && user ? user.name : t('profile.guest')}
              </Text>
              <Text style={[styles.heroSubtitle, isRTL && styles.textRTL]} numberOfLines={2}>
                {isLoggedIn
                  ? user?.email || user?.phone || t('profile.memberSince')
                  : t('profile.subtitle')}
              </Text>
            </View>
          </View>

          {!isLoggedIn ? (
            <TouchableOpacity
              style={styles.signInButton}
              activeOpacity={0.85}
              onPress={() => navigation.navigate('Auth')}
            >
              <Ionicons name="log-in-outline" size={16} color={colors.primary[900]} />
              <Text style={styles.signInText}>{t('profile.signIn')}</Text>
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Stats */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
          {t('profile.activity')}
        </Text>
        <View style={[styles.statsRow, isRTL && styles.rowRTL]}>
          <StatCard styles={styles} icon="flame" value="7" label={t('profile.streak')} />
          <StatCard styles={styles} icon="book" value="248" label={t('profile.versesRead')} />
          <StatCard styles={styles} icon="bookmark" value="12" label={t('profile.bookmarks')} />
        </View>

        {/* Appearance */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
          {t('theme.appearance')}
        </Text>
        <View style={styles.card}>
          <Text style={[styles.cardHint, isRTL && styles.textRTL]}>{t('theme.desc')}</Text>
          <View style={[styles.segment, isRTL && styles.rowRTL]}>
            {THEME_OPTIONS.map((opt) => {
              const active = mode === opt.mode;
              return (
                <TouchableOpacity
                  key={opt.mode}
                  style={[styles.segmentItem, active && styles.segmentItemActive]}
                  onPress={() => setMode(opt.mode)}
                  activeOpacity={0.85}
                >
                  <Ionicons
                    name={opt.icon}
                    size={18}
                    color={active ? theme.textOnDark : theme.textSecondary}
                  />
                  <Text style={[styles.segmentText, active && styles.segmentTextActive]}>
                    {t(opt.labelKey)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Language */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
          {t('profile.language')}
        </Text>
        <View style={styles.card}>
          <View style={[styles.segment, isRTL && styles.rowRTL]}>
            <TouchableOpacity
              style={[styles.segmentItem, language === 'en' && styles.segmentItemActive]}
              onPress={() => changeLanguage('en')}
              activeOpacity={0.85}
            >
              <Text style={[styles.segmentText, language === 'en' && styles.segmentTextActive]}>
                English
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.segmentItem, language === 'ur' && styles.segmentItemActive]}
              onPress={() => changeLanguage('ur')}
              activeOpacity={0.85}
            >
              <Text style={[styles.segmentText, language === 'ur' && styles.segmentTextActive]}>
                اردو
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Menu */}
        <Text style={[styles.sectionLabel, isRTL && styles.textRTL]}>
          {t('profile.account')}
        </Text>
        <View style={styles.card}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              style={[
                styles.menuRow,
                isRTL && styles.rowRTL,
                i < menuItems.length - 1 && styles.menuRowDivider,
              ]}
              onPress={() => handleMenuPress(item.key)}
              activeOpacity={0.7}
            >
              <View style={styles.menuIcon}>
                <Ionicons name={item.icon} size={20} color={theme.textBrandGreen} />
              </View>
              <Text style={[styles.menuLabel, isRTL && styles.textRTL]}>{t(item.labelKey)}</Text>
              {typeof item.count === 'number' && item.count > 0 ? (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{item.count}</Text>
                </View>
              ) : null}
              <Ionicons
                name={isRTL ? 'chevron-back' : 'chevron-forward'}
                size={18}
                color={theme.textMuted}
              />
            </TouchableOpacity>
          ))}
        </View>

        {/* Logout (only when signed in) */}
        {isLoggedIn ? (
          <TouchableOpacity
            style={[styles.logoutButton, isRTL && styles.rowRTL]}
            activeOpacity={0.8}
            onPress={handleLogout}
          >
            <Ionicons name="log-out-outline" size={18} color={colors.status.error} />
            <Text style={styles.logoutText}>{t('profile.logout')}</Text>
          </TouchableOpacity>
        ) : null}

        <Text style={styles.version}>v1.0.0</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({
  styles,
  icon,
  value,
  label,
}: {
  styles: ReturnType<typeof createStyles>;
  icon: string;
  value: string;
  label: string;
}): React.JSX.Element {
  return (
    <View style={styles.statCard}>
      <Ionicons name={icon} size={20} color={colors.gold[600]} />
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel} numberOfLines={1}>
        {label}
      </Text>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bgPage,
    },
    topBar: {
      height: spacing.headerHeight,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.pagePadding,
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    iconButton: {
      width: 40,
      height: 40,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    topBarTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    content: {
      paddingHorizontal: spacing.pagePadding,
      paddingBottom: spacing.sectionGap * 2,
      gap: spacing[3],
    },
    // Hero
    heroCard: {
      backgroundColor: colors.primary[800],
      borderRadius: borderRadius['2xl'],
      padding: spacing.cardPaddingLg,
      borderWidth: 1,
      borderColor: theme.isDark ? colors.primary[700] : colors.gold[500],
      overflow: 'hidden',
      ...shadows.card,
    },
    heroGlow: {
      position: 'absolute',
      top: -60,
      right: -40,
      width: 160,
      height: 160,
      borderRadius: 80,
      backgroundColor: colors.primary[500],
      opacity: 0.25,
    },
    heroRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    avatar: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.full,
      backgroundColor: colors.primary[900],
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: colors.gold[500],
    },
    heroTextCol: {
      flex: 1,
    },
    heroName: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.bold,
      color: colors.neutral[0],
    },
    heroSubtitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: 'rgba(255,255,255,0.8)',
      marginTop: 2,
    },
    signInButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      backgroundColor: colors.gold[400],
      borderRadius: borderRadius.full,
      paddingVertical: 10,
      marginTop: spacing[4],
    },
    signInText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[900],
    },
    // Sections
    sectionLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: theme.textMuted,
      textTransform: 'uppercase',
      letterSpacing: 0.5,
      marginTop: spacing[3],
      marginLeft: spacing[1],
    },
    // Stats
    statsRow: {
      flexDirection: 'row',
      gap: spacing[3],
    },
    statCard: {
      flex: 1,
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.cardLg,
      paddingVertical: spacing[4],
      alignItems: 'center',
      gap: 4,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    statValue: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize['2xl'],
      fontWeight: typography.fontWeight.extrabold,
      color: theme.textPrimary,
    },
    statLabel: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
    },
    // Generic card
    card: {
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.cardLg,
      padding: spacing[3],
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    cardHint: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textSecondary,
      marginBottom: spacing[3],
    },
    // Segmented control
    segment: {
      flexDirection: 'row',
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.full,
      padding: 4,
      gap: 4,
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
      backgroundColor: colors.primary[800],
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
    // Menu
    menuRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      paddingVertical: spacing[3],
    },
    menuRowDivider: {
      borderBottomWidth: 1,
      borderBottomColor: theme.borderDivider,
    },
    menuIcon: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      backgroundColor: theme.bgMuted,
      justifyContent: 'center',
      alignItems: 'center',
    },
    menuLabel: {
      flex: 1,
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.medium,
      color: theme.textPrimary,
    },
    badge: {
      minWidth: 22,
      paddingHorizontal: 6,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary[100],
      justifyContent: 'center',
      alignItems: 'center',
    },
    badgeText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.bold,
      color: colors.primary[800],
    },
    // Logout
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.cardLg,
      paddingVertical: spacing[4],
      marginTop: spacing[4],
      borderWidth: 1,
      borderColor: theme.border,
    },
    logoutText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: colors.status.error,
    },
    version: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
      textAlign: 'center',
      marginTop: spacing[4],
    },
    textRTL: {
      textAlign: 'right',
    },
  });
