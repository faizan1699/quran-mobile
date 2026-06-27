import { Platform, Share } from 'react-native';
import { captureRef } from 'react-native-view-shot';
import * as Sharing from 'expo-sharing';

interface CaptureShareOptions {
  dialogTitle?: string;
  fallbackMessage?: string;
}

export interface ShareResult {
  ok: boolean;
  error?: string;
}

export async function captureAndShareView(
  viewRef: React.RefObject<unknown>,
  options: CaptureShareOptions = {}
): Promise<ShareResult> {
  if (!viewRef.current) {
    return { ok: false, error: 'no-view' };
  }

  try {
    const uri = await captureRef(viewRef as never, {
      format: 'png',
      quality: 1,
      result: 'tmpfile',
    });

    if (Platform.OS === 'web') {
      return { ok: true };
    }

    const canShare = await Sharing.isAvailableAsync();
    if (canShare) {
      await Sharing.shareAsync(uri, {
        mimeType: 'image/png',
        dialogTitle: options.dialogTitle,
        UTI: 'public.png',
      });
      return { ok: true };
    }

    if (options.fallbackMessage) {
      await Share.share({ message: options.fallbackMessage });
      return { ok: true };
    }

    return { ok: false, error: 'sharing-unavailable' };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : 'capture-failed';
    if (message.toLowerCase().includes('cancel')) {
      return { ok: true };
    }
    return { ok: false, error: message };
  }
}
