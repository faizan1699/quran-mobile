import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
  Pressable,
} from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useTheme, Theme } from '@/theme';
import { usePopups } from '@/hooks/usePopups';
import { usePopupStore, selectEligiblePopup } from '@/store/usePopupStore';
import { Popup } from '@shared-types';
import { spacing, typography, borderRadius, shadows } from '@/tokens';

const SHOW_DELAY_MS = 600;

export function PopupModal(): React.JSX.Element | null {
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);
  const { popups } = usePopups();
  const history = usePopupStore((state) => state.history);
  const recordShown = usePopupStore((state) => state.recordShown);

  const [hydrated, setHydrated] = useState(usePopupStore.persist.hasHydrated());
  const [activePopup, setActivePopup] = useState<Popup | null>(null);
  const shownOnceRef = useRef(false);

  useEffect(() => {
    if (usePopupStore.persist.hasHydrated()) {
      setHydrated(true);
      return;
    }

    const unsubscribe = usePopupStore.persist.onFinishHydration(() => setHydrated(true));
    return unsubscribe;
  }, []);

  useEffect(() => {
    if (!hydrated || shownOnceRef.current || activePopup || popups.length === 0) {
      return;
    }

    const eligible = selectEligiblePopup(popups, history, Date.now());
    if (!eligible) {
      return;
    }

    const timer = setTimeout(() => {
      shownOnceRef.current = true;
      setActivePopup(eligible);
      recordShown(eligible.id);
    }, SHOW_DELAY_MS);

    return () => clearTimeout(timer);
  }, [hydrated, popups, history, activePopup, recordShown]);

  if (!activePopup) {
    return null;
  }

  const popup = activePopup;
  const dismissible = popup.dismissible;

  const close = () => setActivePopup(null);

  const handleCta = async () => {
    if (popup.ctaUrl) {
      try {
        await Linking.openURL(popup.ctaUrl);
      } catch {
        // ignore unsupported links
      }
    }
    close();
  };

  return (
    <Modal
      visible
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={close}
    >
      <Pressable style={styles.backdrop} onPress={dismissible ? close : undefined}>
        <Pressable style={styles.card} onPress={() => undefined}>
          {dismissible ? (
            <TouchableOpacity
              style={styles.closeBtn}
              onPress={close}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="close" size={20} color={theme.textOnDark} />
            </TouchableOpacity>
          ) : null}

          {popup.imageUrl ? (
            <View style={styles.imageWrap}>
              <Image
                source={{ uri: popup.imageUrl }}
                style={styles.imageBlur}
                contentFit="cover"
                blurRadius={40}
                transition={200}
              />
              <View style={styles.imageScrim} />
              <Image
                source={{ uri: popup.imageUrl }}
                style={styles.image}
                contentFit="contain"
                contentPosition="center"
                transition={200}
              />
            </View>
          ) : null}

          <ScrollView
            style={styles.body}
            contentContainerStyle={styles.bodyContent}
            showsVerticalScrollIndicator={false}
          >
            {popup.title ? <Text style={styles.title}>{popup.title}</Text> : null}
            {popup.body ? <Text style={styles.message}>{popup.body}</Text> : null}
          </ScrollView>

          {popup.ctaLabel ? (
            <TouchableOpacity style={styles.ctaBtn} onPress={handleCta} activeOpacity={0.85}>
              <Text style={styles.ctaText}>{popup.ctaLabel}</Text>
            </TouchableOpacity>
          ) : !dismissible ? (
            <TouchableOpacity style={styles.ctaBtn} onPress={close} activeOpacity={0.85}>
              <Text style={styles.ctaText}>OK</Text>
            </TouchableOpacity>
          ) : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
    backdrop: {
      flex: 1,
      backgroundColor: theme.overlay,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing[5],
    },
    card: {
      width: '100%',
      maxWidth: 420,
      maxHeight: '86%',
      backgroundColor: theme.bgCard,
      borderRadius: borderRadius['3xl'],
      overflow: 'hidden',
      ...shadows.lg,
    },
    closeBtn: {
      position: 'absolute',
      top: spacing[3],
      right: spacing[3],
      zIndex: 2,
      height: 32,
      width: 32,
      borderRadius: borderRadius.full,
      backgroundColor: 'rgba(0,0,0,0.45)',
      alignItems: 'center',
      justifyContent: 'center',
    },
    imageWrap: {
      width: '100%',
      height: 220,
      backgroundColor: theme.bgPageAlt,
      alignItems: 'center',
      justifyContent: 'center',
      overflow: 'hidden',
    },
    imageBlur: {
      ...StyleSheet.absoluteFillObject,
    },
    imageScrim: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: 'rgba(0,0,0,0.22)',
    },
    image: {
      width: '100%',
      height: '100%',
    },
    body: {
      flexGrow: 0,
    },
    bodyContent: {
      paddingHorizontal: spacing[5],
      paddingVertical: spacing[4],
      gap: spacing[2],
    },
    title: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.xl,
      fontWeight: typography.fontWeight.bold,
      color: theme.textPrimary,
    },
    message: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.md,
      lineHeight: 22,
      color: theme.textSecondary,
    },
    ctaBtn: {
      marginHorizontal: spacing[5],
      marginBottom: spacing[5],
      marginTop: spacing[1],
      paddingVertical: spacing[3],
      borderRadius: borderRadius.lg,
      backgroundColor: theme.accentGreen,
      alignItems: 'center',
    },
    ctaText: {
      fontFamily: typography.fontFamily.english,
      fontSize: typography.fontSize.base,
      fontWeight: typography.fontWeight.semibold,
      color: theme.textOnAccent,
    },
  });
