import React, { useEffect, useMemo, useState } from 'react';
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Ionicons as RawIonicons } from '@expo/vector-icons';
import { useTranslation } from '@/i18n';
import { useTheme, Theme } from '@/theme';
import { colors, spacing, borderRadius, typography } from '@/tokens';
import { RootStackParamList } from '@/navigation/types';
import { useNotesStore } from '@/store/useNotesStore';
import { getNote, NoteColor, NOTE_COLORS } from '@/services/notesDb';
import { NOTE_COLOR_HEX } from '@/data/noteColors';

type IconProps = { name: string; size?: number; color?: string };
const Ionicons = RawIonicons as unknown as React.ComponentType<IconProps>;

type NavProp = NativeStackNavigationProp<RootStackParamList>;
type EditorRouteProp = RouteProp<RootStackParamList, 'NoteEditor'>;

interface AyahLink {
  surahNumber: number;
  ayahNumber: number;
  surahName: string | null;
}

export default function NoteEditorScreen(): React.JSX.Element {
  const { t, isRTL } = useTranslation();
  const { theme } = useTheme();
  const navigation = useNavigation<NavProp>();
  const route = useRoute<EditorRouteProp>();
  const styles = useMemo(() => createStyles(theme), [theme]);

  const params = route.params ?? {};
  const noteId = params.noteId;
  const isEditing = noteId != null;

  const addNote = useNotesStore((s) => s.addNote);
  const editNote = useNotesStore((s) => s.editNote);
  const removeNote = useNotesStore((s) => s.removeNote);
  const persistPin = useNotesStore((s) => s.setPinned);

  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [color, setColor] = useState<NoteColor | null>(null);
  const [pinned, setPinned] = useState(false);
  const [ayah, setAyah] = useState<AyahLink | null>(
    params.surahNumber && params.ayahNumber
      ? {
          surahNumber: params.surahNumber,
          ayahNumber: params.ayahNumber,
          surahName: params.surahName ?? null,
        }
      : null
  );
  const [loading, setLoading] = useState(isEditing);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let active = true;
    if (noteId == null) {
      return;
    }
    (async () => {
      const note = await getNote(noteId);
      if (!active) {
        return;
      }
      if (note) {
        setTitle(note.title);
        setBody(note.body);
        setColor(note.color);
        setPinned(note.isPinned);
        if (note.surahNumber && note.ayahNumber) {
          setAyah({
            surahNumber: note.surahNumber,
            ayahNumber: note.ayahNumber,
            surahName: note.surahName,
          });
        }
      }
      setLoading(false);
    })();
    return () => {
      active = false;
    };
  }, [noteId]);

  const canSave = title.trim().length > 0 || body.trim().length > 0;

  const handleSave = async () => {
    if (!canSave || saving) {
      return;
    }
    setSaving(true);
    const input = {
      title,
      body,
      color,
      surahNumber: ayah?.surahNumber ?? null,
      ayahNumber: ayah?.ayahNumber ?? null,
      surahName: ayah?.surahName ?? null,
    };

    let ok = false;
    let savedId: number | null = null;
    if (isEditing && noteId != null) {
      ok = await editNote(noteId, input);
      savedId = noteId;
    } else {
      const created = await addNote(input);
      ok = created != null;
      savedId = created?.id ?? null;
    }

    if (!ok || savedId == null) {
      setSaving(false);
      Alert.alert(t('notes.saveErrorTitle'), t('notes.saveErrorBody'));
      return;
    }

    await persistPin(savedId, pinned);
    navigation.goBack();
  };

  const handleDelete = () => {
    if (noteId == null) {
      return;
    }
    Alert.alert(t('notes.deleteTitle'), t('notes.deleteConfirm'), [
      { text: t('notes.cancel'), style: 'cancel' },
      {
        text: t('notes.delete'),
        style: 'destructive',
        onPress: async () => {
          const ok = await removeNote(noteId);
          if (!ok) {
            Alert.alert(t('notes.saveErrorTitle'), t('notes.deleteErrorBody'));
            return;
          }
          navigation.goBack();
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={colors.primary[500]} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={[styles.header, isRTL && styles.rowRTL]}>
        <TouchableOpacity
          style={styles.iconBtn}
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

        <Text style={styles.headerTitle}>
          {isEditing ? t('notes.editNote') : t('notes.newNote')}
        </Text>

        <View style={[styles.headerActions, isRTL && styles.rowRTL]}>
          {isEditing ? (
            <TouchableOpacity
              style={styles.iconBtn}
              onPress={handleDelete}
              activeOpacity={0.7}
              accessibilityLabel={t('notes.delete')}
            >
              <Ionicons name="trash-outline" size={20} color={colors.status.error} />
            </TouchableOpacity>
          ) : null}
          <TouchableOpacity
            style={[styles.saveBtn, !canSave && styles.saveBtnDisabled]}
            onPress={handleSave}
            disabled={!canSave || saving}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>{t('notes.save')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}
      >
        <ScrollView
          style={styles.flex}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <TextInput
            style={[styles.titleInput, isRTL && styles.textRTL]}
            placeholder={t('notes.titlePlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={title}
            onChangeText={setTitle}
            multiline
          />

          {ayah ? (
            <View style={[styles.ayahLinkRow, isRTL && styles.rowRTL]}>
              <View style={styles.ayahChip}>
                <Ionicons name="book-outline" size={13} color={theme.textBrandGreen} />
                <Text style={styles.ayahChipText}>
                  {`${ayah.surahName ?? ''} ${ayah.surahNumber}:${ayah.ayahNumber}`.trim()}
                </Text>
                <TouchableOpacity onPress={() => setAyah(null)} hitSlop={8}>
                  <Ionicons name="close" size={13} color={theme.textBrandGreen} />
                </TouchableOpacity>
              </View>
            </View>
          ) : null}

          <TextInput
            style={[styles.bodyInput, isRTL && styles.textRTL]}
            placeholder={t('notes.bodyPlaceholder')}
            placeholderTextColor={theme.textMuted}
            value={body}
            onChangeText={setBody}
            multiline
            textAlignVertical="top"
          />
        </ScrollView>

        <View style={[styles.toolbar, isRTL && styles.rowRTL]}>
          <View style={[styles.colorRow, isRTL && styles.rowRTL]}>
            <TouchableOpacity
              style={[styles.colorDot, styles.colorNone, !color && styles.colorActive]}
              onPress={() => setColor(null)}
              accessibilityLabel={t('notes.colorNone')}
            >
              <Ionicons name="ban-outline" size={14} color={theme.textMuted} />
            </TouchableOpacity>
            {NOTE_COLORS.map((c) => (
              <TouchableOpacity
                key={c}
                style={[
                  styles.colorDot,
                  { backgroundColor: NOTE_COLOR_HEX[c] },
                  color === c && styles.colorActive,
                ]}
                onPress={() => setColor(c)}
                accessibilityLabel={c}
              />
            ))}
          </View>

          <TouchableOpacity
            style={styles.pinBtn}
            onPress={() => setPinned((p) => !p)}
            activeOpacity={0.7}
            accessibilityLabel={pinned ? t('notes.unpin') : t('notes.pin')}
          >
            <Ionicons
              name={pinned ? 'bookmark' : 'bookmark-outline'}
              size={22}
              color={pinned ? theme.textGold : theme.textMuted}
            />
          </TouchableOpacity>
        </View>
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
    flex: {
      flex: 1,
    },
    center: {
      justifyContent: 'center',
      alignItems: 'center',
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
    headerTitle: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      fontWeight: 'bold',
      color: theme.textPrimary,
    },
    headerActions: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    iconBtn: {
      width: 36,
      height: 36,
      justifyContent: 'center',
      alignItems: 'center',
    },
    saveBtn: {
      backgroundColor: colors.primary[800],
      borderRadius: borderRadius.button,
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[2],
    },
    saveBtnDisabled: {
      opacity: 0.4,
    },
    saveBtnText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: 'bold',
      color: colors.neutral[0],
    },
    scrollContent: {
      paddingHorizontal: spacing.pagePadding,
      paddingTop: spacing[3],
      paddingBottom: spacing[6],
      flexGrow: 1,
    },
    titleInput: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize['2xl'],
      fontWeight: 'bold',
      color: theme.textPrimary,
      paddingVertical: spacing[2],
    },
    ayahLinkRow: {
      flexDirection: 'row',
      marginBottom: spacing[2],
    },
    ayahChip: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 6,
      backgroundColor: theme.isDark ? 'rgba(58,158,110,0.15)' : colors.primary[100],
      borderRadius: borderRadius.full,
      paddingHorizontal: spacing[3],
      paddingVertical: spacing[1],
    },
    ayahChipText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.sm,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textBrandGreen,
    },
    bodyInput: {
      flex: 1,
      minHeight: 200,
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.lg,
      color: theme.textPrimary,
      lineHeight: 26,
      paddingTop: spacing[2],
    },
    toolbar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.pagePadding,
      paddingVertical: spacing[3],
      borderTopWidth: 1,
      borderTopColor: theme.borderDivider,
      backgroundColor: theme.bgCard,
      gap: spacing[3],
    },
    colorRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      flex: 1,
    },
    colorDot: {
      width: 26,
      height: 26,
      borderRadius: 13,
      justifyContent: 'center',
      alignItems: 'center',
      borderWidth: 2,
      borderColor: 'transparent',
    },
    colorNone: {
      backgroundColor: theme.bgMuted,
      borderColor: theme.border,
    },
    colorActive: {
      borderColor: theme.textPrimary,
    },
    pinBtn: {
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    rowRTL: {
      flexDirection: 'row-reverse',
    },
    textRTL: {
      textAlign: 'right',
    },
  });
