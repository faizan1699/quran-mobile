import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { colors, spacing, borderRadius, typography } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

export function GlobalHeader(): React.JSX.Element {
  const { language, changeLanguage } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <View style={styles.header}>
      {/* LEFT ZONE: Language Switcher Pill */}
      <View style={styles.leftContainer}>
        <View style={styles.langPill}>
          <TouchableOpacity
            style={[styles.langSegment, language === 'en' && styles.langSegmentActive]}
            onPress={() => changeLanguage('en')}
            activeOpacity={0.8}
          >
            <Text style={[styles.langText, language === 'en' && styles.langTextActive]}>EN</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.langSegment, language === 'ur' && styles.langSegmentActive]}
            onPress={() => changeLanguage('ur')}
            activeOpacity={0.8}
          >
            <Text style={[styles.langText, language === 'ur' && styles.langTextActive]}>اردو</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* CENTER ZONE: Logo Mark */}
      <View style={styles.centerContainer}>
        <View style={styles.logoRow}>
          <View style={styles.emblemContainer}>
            <Text style={styles.emblemText}>🕌</Text>
          </View>
          <Text style={styles.brandName}>دعوة الإسلام</Text>
        </View>
      </View>

      {/* RIGHT ZONE: Profile entry */}
      <View style={styles.rightContainer}>
        <TouchableOpacity
          style={styles.profilePill}
          onPress={() => navigation.navigate('Profile')}
          activeOpacity={0.8}
          accessibilityLabel="Open profile"
        >
          <View style={styles.avatarPlaceholder}>
            <Ionicons name="person" size={13} color={colors.gold[400]} />
          </View>
          <Ionicons name="chevron-down" size={12} color={theme.textSecondary} />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    header: {
      height: spacing.headerHeight,
      backgroundColor: theme.bgHeader,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.pagePadding,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderDivider,
      elevation: 3,
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
    },
    leftContainer: {
      flex: 1,
      alignItems: 'flex-start',
    },
    centerContainer: {
      flex: 2,
      alignItems: 'center',
    },
    rightContainer: {
      flex: 1,
      alignItems: 'flex-end',
    },
    langPill: {
      flexDirection: 'row',
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.full,
      padding: 2,
      borderWidth: 1,
      borderColor: theme.border,
    },
    langSegment: {
      paddingHorizontal: 8,
      paddingVertical: 3,
      borderRadius: borderRadius.full,
      justifyContent: 'center',
      alignItems: 'center',
    },
    langSegmentActive: {
      backgroundColor: colors.primary[800],
    },
    langText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    langTextActive: {
      color: colors.neutral[0],
    },
    logoRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
    },
    emblemContainer: {
      width: 24,
      height: 24,
      borderRadius: 12,
      backgroundColor: colors.primary[800],
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 1,
      borderColor: colors.gold[500],
    },
    emblemText: {
      fontSize: 12,
      color: colors.gold[500],
    },
    brandName: {
      fontFamily: typography.fontFamily.arabic,
      fontSize: 18,
      color: theme.textGold,
      fontWeight: 'bold',
    },
    profilePill: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.bgMuted,
      borderRadius: borderRadius.full,
      paddingHorizontal: 6,
      paddingVertical: 4,
      gap: 4,
      borderWidth: 1,
      borderColor: theme.border,
    },
    avatarPlaceholder: {
      width: 22,
      height: 22,
      borderRadius: 11,
      backgroundColor: colors.primary[800],
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

export default GlobalHeader;
