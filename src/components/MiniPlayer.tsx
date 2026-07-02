import React from 'react';
import { useNavigation } from '@react-navigation/native';
import { useAudioStore } from '@/store/useAudioStore';
import { usePreferencesStore } from '@/store/usePreferencesStore';
import { MiniPlayerBar } from '@/components/MiniPlayerBar';

export function MiniPlayer(): React.JSX.Element | null {
  const navigation = useNavigation<any>();

  const currentTrack = useAudioStore((s) => s.currentTrack);
  const autoOpenPlayer = usePreferencesStore((s) => s.autoOpenPlayer);

  const hadTrack = React.useRef(false);
  React.useEffect(() => {
    const hasTrack = currentTrack != null;
    if (hasTrack && !hadTrack.current && autoOpenPlayer) {
      navigation.navigate('Player');
    }
    hadTrack.current = hasTrack;
  }, [currentTrack, autoOpenPlayer, navigation]);

  return <MiniPlayerBar onOpen={() => navigation.navigate('Player')} />;
}

export default MiniPlayer;
