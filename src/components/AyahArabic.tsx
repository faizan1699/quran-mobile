import React from 'react';
import { Text, StyleProp, TextStyle } from 'react-native';
import { TimedWord } from '@shared-types';
import { useAudioStore } from '@/store/useAudioStore';

interface AyahArabicProps {
  trackId: string;
  words?: TimedWord[];
  plainText: string;
  textStyle: StyleProp<TextStyle>;
  activeStyle: StyleProp<TextStyle>;
}

export function AyahArabic({
  trackId,
  words,
  plainText,
  textStyle,
  activeStyle,
}: AyahArabicProps): React.JSX.Element {
  const currentTrackId = useAudioStore((s) => s.currentTrack?.id);
  const isActive = !!words && words.length > 0 && currentTrackId === trackId;

  if (!isActive) {
    return <Text style={textStyle}>{plainText}</Text>;
  }

  return (
    <ActiveAyahArabic
      words={words as TimedWord[]}
      textStyle={textStyle}
      activeStyle={activeStyle}
    />
  );
}

interface ActiveProps {
  words: TimedWord[];
  textStyle: StyleProp<TextStyle>;
  activeStyle: StyleProp<TextStyle>;
}

function ActiveAyahArabic({ words, textStyle, activeStyle }: ActiveProps): React.JSX.Element {
  const position = useAudioStore((s) => s.position);
  const ms = position * 1000;

  let activeIndex = -1;
  for (let i = 0; i < words.length; i++) {
    if (ms >= words[i].start) activeIndex = i;
    else break;
  }

  return (
    <Text style={textStyle}>
      {words.map((w, i) => (
        <Text key={i} style={i === activeIndex ? activeStyle : undefined}>
          {w.text}
          {i < words.length - 1 ? ' ' : ''}
        </Text>
      ))}
    </Text>
  );
}

export default AyahArabic;
