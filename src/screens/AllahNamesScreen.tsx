import React, { useState, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { GlobalHeader } from '@/components/GlobalHeader';
import { namesService, DivineName } from '@/services/namesService';
import { colors, borderRadius, spacing, typography, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';

export default function AllahNamesScreen(): React.JSX.Element {
  const { t, language, isRTL } = useTranslation();
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [names, setNames] = useState<DivineName[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    let active = true;
    namesService.searchNames(searchQuery).then((result) => {
      if (active) {
        setNames(result);
      }
    });
    return () => {
      active = false;
    };
  }, [searchQuery]);

  return (
    <SafeAreaView edges={['top']} style={styles.safeArea}>
      <GlobalHeader />

      <View style={[styles.subHeader, isRTL && styles.rowRTL]}>
        <TouchableOpacity
          style={[styles.backButton, isRTL && styles.rowRTL]}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel={language === 'ur' ? 'واپس' : 'Back'}
        >
          <Text style={styles.backArrow}>{isRTL ? '▶' : '◀'}</Text>
          <Text style={styles.backText}>{language === 'ur' ? 'واپس' : 'Back'}</Text>
        </TouchableOpacity>

        <Text style={styles.title}>{t('allahNames.title')}</Text>

        <View style={styles.backButton} />
      </View>

      <View style={styles.searchContainer}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={[styles.searchInput, isRTL && styles.textRTL]}
          placeholder={t('allahNames.searchPlaceholder')}
          placeholderTextColor={theme.textMuted}
          value={searchQuery}
          onChangeText={setSearchQuery}
          underlineColorAndroid="transparent"
        />
      </View>

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {names.length === 0 ? (
          <Text style={styles.emptyText}>
            {language === 'ur' ? 'کوئی نام نہیں ملا۔' : 'No names found.'}
          </Text>
        ) : (
          names.map((item) => (
            <View key={item.id} style={[styles.nameCard, isRTL && styles.rowRTL]}>
              <View style={styles.numberBadge}>
                <Text style={styles.numberText}>{item.number}</Text>
              </View>
              <View style={styles.nameBody}>
                <Text style={styles.nameArabic}>{item.arabic}</Text>
                <Text style={styles.nameTranslit}>{item.transliteration}</Text>
                <Text
                  style={[styles.nameMeaning, language === 'ur' && styles.nameMeaningUrdu]}
                >
                  {language === 'ur' ? item.meaningUr : item.meaningEn}
                </Text>
              </View>
            </View>
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bgPage,
    },
    subHeader: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.pagePadding,
      paddingVertical: spacing[3],
      borderBottomWidth: 1,
      borderBottomColor: theme.borderDivider,
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    backButton: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      minWidth: 64,
    },
    backArrow: {
      fontSize: 14,
      color: theme.textBrandGreen,
      fontWeight: 'bold',
    },
    backText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textBrandGreen,
      fontWeight: typography.fontWeight.semibold,
    },
    title: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    searchContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: theme.bgCard,
      borderWidth: 1,
      borderColor: theme.border,
      borderRadius: borderRadius.button,
      marginHorizontal: spacing.pagePadding,
      marginTop: spacing[3],
      paddingHorizontal: spacing[3],
      height: 48,
    },
    searchIcon: {
      fontSize: 18,
      marginRight: 8,
    },
    searchInput: {
      flex: 1,
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textPrimary,
      height: '100%',
      padding: 0,
    },
    textRTL: {
      textAlign: 'right',
    },
    scrollView: {
      flex: 1,
      marginTop: spacing[3],
    },
    scrollContent: {
      paddingHorizontal: spacing.pagePadding,
      paddingBottom: spacing.sectionGap * 2,
      gap: spacing.cardGap,
    },
    nameCard: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      padding: spacing.cardPadding,
      borderWidth: 1,
      borderColor: theme.border,
      ...shadows.sm,
    },
    numberBadge: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: theme.accentGreen,
      borderWidth: 1,
      borderColor: colors.gold[500],
      justifyContent: 'center',
      alignItems: 'center',
    },
    numberText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.bold,
      color: colors.gold[400],
    },
    nameBody: {
      flex: 1,
      gap: 2,
    },
    nameArabic: {
      fontFamily: typography.fontFamily.arabic,
      fontSize: typography.fontSize.arabic.sm,
      lineHeight: typography.fontSize.arabic.sm * typography.lineHeight.arabic,
      color: theme.textArabic,
      textAlign: 'right',
      writingDirection: 'rtl',
    },
    nameTranslit: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textGold,
    },
    nameMeaning: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
    },
    nameMeaningUrdu: {
      fontFamily: typography.fontFamily.urdu,
      textAlign: 'right',
      writingDirection: 'rtl',
      lineHeight: 24,
    },
    emptyText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textSecondary,
      textAlign: 'center',
      marginTop: spacing.sectionGap,
    },
  });
