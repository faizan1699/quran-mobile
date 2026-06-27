import { createAudioPlayer, setAudioModeAsync, AudioPlayer, AudioStatus } from 'expo-audio';

const AZAN_SOURCE = require('../../assets/audio/azan.mp3');

let azanPlayer: AudioPlayer | null = null;
let azanSub: { remove: () => void } | null = null;
let audioModeReady = false;

async function ensureAlertAudioMode(): Promise<void> {
  if (audioModeReady) return;
  audioModeReady = true;
  try {
    await setAudioModeAsync({
      allowsRecording: false,
      shouldPlayInBackground: true,
      playsInSilentMode: true,
      shouldRouteThroughEarpiece: false,
      interruptionMode: 'duckOthers',
    });
  } catch {
    audioModeReady = false;
  }
}

export function isAzanPlaying(): boolean {
  return azanPlayer !== null;
}

export function stopAzan(): void {
  if (azanSub) {
    azanSub.remove();
    azanSub = null;
  }
  if (azanPlayer) {
    try {
      azanPlayer.remove();
    } catch {}
    azanPlayer = null;
  }
}

export async function playAzan(): Promise<void> {
  try {
    stopAzan();
    await ensureAlertAudioMode();
    azanPlayer = createAudioPlayer(AZAN_SOURCE, { updateInterval: 500 });
    azanSub = azanPlayer.addListener('playbackStatusUpdate', (status: AudioStatus) => {
      if (status.isLoaded && status.didJustFinish) {
        stopAzan();
      }
    });
    azanPlayer.play();
  } catch (error) {
    console.error('Failed to play azan:', error);
    stopAzan();
  }
}
