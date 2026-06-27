import { apiClient } from './apiClient';
import { cachedRevalidate } from './offlineCache';
import { Popup } from '@shared-types';

async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

export const popupsService = {
  async getPopups(): Promise<Popup[]> {
    return cachedRevalidate('popups:active', async () => {
      try {
        const popups = await unwrap<Popup[]>(apiClient.get('/popups'));
        return Array.isArray(popups) ? popups : [];
      } catch {
        return [];
      }
    });
  },
};
