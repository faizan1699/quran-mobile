import * as Network from 'expo-network';
import { usePreferencesStore } from '@/store/usePreferencesStore';

export type DownloadBlockReason = 'offline' | 'cellular';

export type DownloadGate =
  | { ok: true }
  | { ok: false; reason: DownloadBlockReason };

const METERED_TYPES = [
  Network.NetworkStateType.CELLULAR,
  Network.NetworkStateType.WIMAX,
];

export async function checkDownloadAllowed(): Promise<DownloadGate> {
  let state: Network.NetworkState;
  try {
    state = await Network.getNetworkStateAsync();
  } catch {
    return { ok: true };
  }

  if (state.isConnected === false) {
    return { ok: false, reason: 'offline' };
  }

  const wifiOnly = usePreferencesStore.getState().downloadOverWifiOnly;
  if (wifiOnly && state.type != null && METERED_TYPES.includes(state.type)) {
    return { ok: false, reason: 'cellular' };
  }

  return { ok: true };
}
