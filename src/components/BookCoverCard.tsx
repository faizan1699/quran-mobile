import React, { useMemo } from 'react';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Image } from 'expo-image';
import { useTheme, Theme } from '@/theme';
import { colors, borderRadius, spacing, typography } from '@/tokens';

interface BookCoverCardProps {
  title: string;
  titleUrdu?: string | null;
  author: string;
  coverImage?: string | null;
  onPress?: () => void;
}

export function BookCoverCard({
  title,
  titleUrdu,
  author,
  coverImage,
  onPress,
}: BookCoverCardProps): React.JSX.Element {
  const [hasError, setHasError] = React.useState(false);
  const { theme } = useTheme();
  const styles = useMemo(() => createStyles(theme), [theme]);

  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
      activeOpacity={0.8}
    >
      {/* Cover image wrap */}
      <View style={styles.coverWrapper}>
        {coverImage && !hasError ? (
          <Image
            source={{ uri: coverImage }}
            style={styles.coverImage}
            contentFit="cover"
            transition={200}
            onError={() => setHasError(true)}
          />
        ) : (
          /* Placeholder Fallback */
          <View style={styles.placeholder}>
            <Text style={styles.placeholderEmblem}>📖</Text>
            <Text style={styles.placeholderText} numberOfLines={2}>
              {titleUrdu || title}
            </Text>
          </View>
        )}
      </View>

      {/* Metadata */}
      <Text style={styles.title} numberOfLines={2}>
        {title}
      </Text>
      <Text style={styles.author} numberOfLines={1}>
        {author}
      </Text>
    </TouchableOpacity>
  );
}

const createStyles = (theme: Theme) =>
  StyleSheet.create({
  container: {
    width: 120, // bookCard.width
    marginRight: spacing[4],
  },
  coverWrapper: {
    width: 120,
    height: 160, // bookCard.height
    borderRadius: borderRadius.bookCover, // 8
    overflow: 'hidden',
    backgroundColor: colors.primary[900], // Brand background fallback
    borderWidth: 1,
    borderColor: colors.gold[500],
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  coverImage: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[2],
  },
  placeholderEmblem: {
    fontSize: 28,
    color: colors.gold[600],
    marginBottom: 6,
  },
  placeholderText: {
    fontFamily: typography.fontFamily.arabic,
    fontSize: typography.fontSize.sm,
    color: colors.neutral[0],
    textAlign: 'center',
    lineHeight: 18,
  },
  title: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.sm, // 13
    fontWeight: typography.fontWeight.semibold,
    color: theme.textPrimary,
    marginTop: 8,
    lineHeight: 16,
  },
  author: {
    fontFamily: typography.fontFamily.english,
    fontSize: typography.fontSize.xs, // 12
    color: theme.textSecondary, // bookCard.authorColor
    marginTop: 2,
  },
  });
export default BookCoverCard;
