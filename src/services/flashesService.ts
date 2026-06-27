import { apiClient } from './apiClient';
import { cachedRevalidate } from './offlineCache';
import { Flash } from '@shared-types';

async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

export const flashesService = {
  async getFlashes(): Promise<Flash[]> {
    return cachedRevalidate('flashes:active', async () => {
      try {
        const flashes = await unwrap<Flash[]>(apiClient.get('/flashes'));
        return Array.isArray(flashes) ? flashes : [];
      } catch {
        return [];
      }
    });
  },
};
