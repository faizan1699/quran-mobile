import { I18nManager } from 'react-native';
import en from './en.json';
import ur from './ur.json';
import { useUserStore } from '@/store/useUserStore';

type TranslationKeys = typeof en;

const translations: Record<'en' | 'ur', typeof en> = { en, ur };

/**
 * Resolves nested keys in translation JSON objects (e.g., 'tabs.home')
 */
export function translate(key: string, language: 'en' | 'ur' = 'en'): string {
  const dict = translations[language] || en;
  const parts = key.split('.');
  
  let current: any = dict;
  for (const part of parts) {
    if (current && typeof current === 'object' && part in current) {
      current = current[part];
    } else {
      // Return key itself if not found
      return key;
    }
  }
  
  return typeof current === 'string' ? current : key;
}

/**
 * Hook to retrieve the current language, translation function 't', and helper flags.
 */
export function useTranslation() {
  const language = useUserStore((state) => state.language);
  const setLanguage = useUserStore((state) => state.setLanguage);

  const t = (key: string): string => {
    return translate(key, language);
  };

  const changeLanguage = (lang: 'en' | 'ur') => {
    setLanguage(lang);
    const isRtl = lang === 'ur';
    if (I18nManager.isRTL !== isRtl) {
      I18nManager.forceRTL(isRtl);
      // Under ordinary circumstances, RN apps might require a reload, 
      // but forceRTL triggers layout changes on restart.
    }
  };

  return {
    t,
    language,
    changeLanguage,
    isRTL: language === 'ur',
  };
}
