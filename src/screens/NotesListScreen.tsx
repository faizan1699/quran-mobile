import React, { useCallback, useMemo } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  useNavigation,
  useFocusEffect,
} from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { colors, spacing, borderRadius, typography, shadows } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';
import { useNotesStore } from '@/store/useNotesStore';
import { Note } from '@/services/notesDb';
import { NOTE_COLOR_HEX } from '@/data/noteColors';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

type NavProp = NativeStackNavigationProp<RootStackParamList>;

const MONTHS = [
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
  'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec',
];

function formatDate(ts: number): string {
  const d = new Date(ts);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function NotesListScreen(): React.JSX.Element {
  const { t, isRTL } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const notes = useNotesStore((s) => s.notes);
  const loaded = useNotesStore((s) => s.loaded);
  const search = useNotesStore((s) => s.search);
  const setSearch = useNotesStore((s) => s.setSearch);
  const togglePin = useNotesStore((s) => s.togglePin);
  const loadNotes = useNotesStore((s) => s.loadNotes);

  useFocusEffect(
    useCallback(() => {
      void loadNotes();
    }, [loadNotes])
  );

  const renderItem = useCallback(
    ({ item }: { item: Note }) => {
      const accent = item.color ? NOTE_COLOR_HEX[item.color] : theme.border;
      const preview = item.body.trim();
      const ayahLabel =
        item.surahNumber && item.ayahNumber
          ? `${item.surahName ?? ''} ${item.surahNumber}:${item.ayahNumber}`.trim()
          : null;

      return (
        <TouchableOpacity
          style={styles.card}
          activeOpacity={0.85}
          onPress={() => navigation.navigate('NoteEditor', { noteId: item.id })}
        >
          <View style={[styles.accentBar, { backgroundColor: accent }]} />
          <View style={styles.cardBody}>
            <View style={[styles.cardTopRow, isRTL && styles.rowRTL]}>
              <Text
                style={[styles.cardTitle, isRTL && styles.textRTL]}
                numberOfLines={1}
              >
                {item.title.trim() || t('notes.untitled')}
              </Text>
              <TouchableOpacity
                onPress={() => void togglePin(item.id)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={item.isPinned ? t('notes.unpin') : t('notes.pin')}
              >
                <Ionicons
                  name={item.isPinned ? 'bookmark' : 'bookmark-outline'}
                  size={18}
                  color={item.isPinned ? theme.textGold : theme.textMuted}
                />
              </TouchableOpacity>
            </View>

            {preview ? (
              <Text
                style={[styles.cardPreview, isRTL && styles.textRTL]}
                numberOfLines={2}
              >
                {preview}
              </Text>
            ) : null}

            <View style={[styles.cardMetaRow, isRTL && styles.rowRTL]}>
              {ayahLabel ? (
                <View style={styles.ayahChip}>
                  <Ionicons name="book-outline" size={11} color={theme.textBrandGreen} />
                  <Text style={styles.ayahChipText} numberOfLines={1}>
                    {ayahLabel}
                  </Text>
                </View>
              ) : (
                <View />
              )}
              <Text style={styles.cardDate}>{formatDate(item.updatedAt)}</Text>
            </View>
          </View>
        </TouchableOpacity>
      );
    },
    [styles, theme, isRTL, t, navigation, togglePin]
  );

  return (
    <SafeAreaView edges={['top', 'bottom']} style={styles.safeArea}>
      <View style={[styles.header, isRTL && styles.rowRTL]}>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
          accessibilityLabel={t('notes.back')}
        >
          <Ionicons
            name={isRTL ? 'chevron-forward' : 'chevron-back'}
            size={22}
            color={theme.textPrimary}
          />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{t('notes.title')}</Text>
        <View style={styles.backBtn} />
      </View>

      <View style={styles.searchWrap}>
        <View style={[styles.searchBar, isRTL && styles.rowRTL]}>
          <Ionicons name="search" size={16} color={theme.textMuted} />
          <TextInput
            style={[styles.searchInput, isRTL && styles.textRTL]}
            placeholder={t('notes.searchPlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={search}
            onChangeText={setSearch}
            returnKeyType="search"
          />
          {search.length > 0 ? (
            <TouchableOpacity onPress={() => setSearch('')} hitSlop={8}>
              <Ionicons name="close-circle" size={16} color={theme.textMuted} />
            </TouchableOpacity>
          ) : null}
        </View>
      </View>

      <FlatList
        data={notes}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          loaded ? (
            <View style={styles.emptyWrap}>
              <Ionicons
                name={search ? 'search' : 'document-text-outline'}
                size={48}
                color={theme.textMuted}
              />
              <Text style={styles.emptyTitle}>
                {search ? t('notes.noResults') : t('notes.empty')}
              </Text>
              {!search ? (
                <Text style={styles.emptyDesc}>{t('notes.emptyDesc')}</Text>
              ) : null}
            </View>
          ) : null
        }
      />

      <TouchableOpacity
        style={[styles.fab, isRTL ? styles.fabLeft : styles.fabRight]}
        activeOpacity={0.85}
        onPress={() => navigation.navigate('NoteEditor')}
        accessibilityLabel={t('notes.newNote')}
      >
        <Ionicons name="add" size={28} color={colors.neutral[0]} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    safeArea: {
      flex: 1,
      backgroundColor: theme.bgPage,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      height: spacing.headerHeight,
      paddingHorizontal: spacing.pagePadding,
      backgroundColor: theme.bgHeader,
      borderBottomWidth: 1,
      borderBottomColor: theme.borderDivider,
    },
    backBtn: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    headerTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    searchWrap: {
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing.cardGap,
      paddingBottom: spacing[2],
    },
    searchBar: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: theme.bgInput,
      borderRadius: borderRadius.input,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[2],
      borderWidth: 1,
      borderColor: theme.border,
    },
    searchInput: {
      flex: 1,
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      color: theme.textPrimary,
      paddingVertical: 2,
    },
    listContent: {
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing[2],
      paddingBottom: spacing[24],
      gap: spacing[3],
    },
    card: {
      flexDirection: 'row',
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius.card,
      borderWidth: 1,
      borderColor: theme.border,
      overflow: 'hidden',
      ...shadows.sm,
    },
    accentBar: {
      width: 5,
    },
    cardBody: {
      flex: 1,
      padding: spacing.cardPadding,
      gap: spacing[2],
    },
    cardTopRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[2],
    },
    cardTitle: {
      flex: 1,
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textPrimary,
    },
    cardPreview: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textSecondary,
      lineHeight: 20,
    },
    cardMetaRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: spacing[2],
      marginTop: spacing[1],
    },
    ayahChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 4,
      backgroundColor: theme.isDark ? 'rgba(58,158,110,0.15)' : theme.accentSoft,
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing[2],
      paddingVertical: 3,
      maxWidth: '70%',
    },
    ayahChipText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textBrandGreen,
    },
    cardDate: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xs,
      color: theme.textMuted,
    },
    emptyWrap: {
      alignItems: 'center',
      justifyContent: 'center',
      paddingTop: spacing[20],
      gap: spacing[3],
    },
    emptyTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textSecondary,
    },
    emptyDesc: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      color: theme.textMuted,
      textAlign: 'center',
      paddingHorizontal: spacing[8],
    },
    fab: {
      position: 'absolute',
      bottom: spacing[6],
      width: 56,
      height: 56,
      borderRadius: 28,
      backgroundColor: theme.accentGreen,
      justifyContent: 'center',
      alignItems: 'center',
      ...shadows.md,
    },
    fabRight: {
      right: spacing.pagePadding,
    },
    fabLeft: {
      left: spacing.pagePadding,
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    textRTL: {
      textAlign: 'right',
    },
  });
