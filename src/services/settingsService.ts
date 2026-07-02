import { apiClient } from './apiClient';
import { ManualTimes, PrayerMode } from '@/store/useUserStore';

export interface PrayerSettings {
  fiqh: string;
  calculationMethod: string;
  mode: PrayerMode;
  manualTimes: ManualTimes;
}

async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

export const settingsService = {
  async getPrayerSettings(): Promise<PrayerSettings> {
    return unwrap<PrayerSettings>(apiClient.get('/settings/prayer'));
  },
};
