import { apiClient } from './apiClient';
import { cachedRevalidate } from './offlineCache';

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

export function filterNames(names: DivineName[], query: string): DivineName[] {
  const q = query.trim().toLowerCase();
  if (!q) {
    return names;
  }
  return names.filter(
    (name) =>
      name.transliteration.toLowerCase().includes(q) ||
      name.meaningEn.toLowerCase().includes(q) ||
      name.meaningUr.includes(query.trim()) ||
      name.arabic.includes(query.trim()) ||
      String(name.number) === q
  );
}

export const namesService = {
  async getNames(): Promise<DivineName[]> {
    return cachedRevalidate('names:all', async () => {
      try {
        const names = await unwrap<DivineName[]>(apiClient.get('/names'));
        return Array.isArray(names) ? names : [];
      } catch {
        return [];
      }
    });
  },

  async searchNames(query: string): Promise<DivineName[]> {
    const all = await this.getNames();
    return filterNames(all, query);
  },
};
