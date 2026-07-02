import { apiClient } from './apiClient';

export interface PrayerSettings {
  fiqh: string;
  calculationMethod: string;
}

async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

export const settingsService = {
  async getPrayerSettings(): Promise<PrayerSettings> {
    return unwrap<PrayerSettings>(apiClient.get('/settings/prayer'));
  },
};
