import { apiClient } from './apiClient';
import { cached } from './offlineCache';

export interface DivineName {
  id: string;
  number: number;
  arabic: string;
  transliteration: string;
  meaningEn: string;
  meaningUr: string;
}

async function unwrap<T>(promise: Promise<unknown>): Promise<T> {
  return (await promise) as unknown as T;
}

export const namesService = {
  async getNames(): Promise<DivineName[]> {
    return cached('names:all', async () => {
      try {
        const names = await unwrap<DivineName[]>(apiClient.get('/names'));
        return Array.isArray(names) ? names : [];
      } catch {
        return [];
      }
    });
  },

  async searchNames(query: string): Promise<DivineName[]> {
    const q = query.trim();
    if (!q) {
      return this.getNames();
    }
    try {
      const names = await unwrap<DivineName[]>(
        apiClient.get('/names/search', { params: { q } })
      );
      return Array.isArray(names) ? names : [];
    } catch {
      return [];
    }
  },
};
