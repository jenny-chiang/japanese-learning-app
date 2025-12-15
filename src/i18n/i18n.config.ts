import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { translations } from './translations';

const LANGUAGE_KEY = '@app_language';

// 語言偵測器
const languageDetector = {
  type: 'languageDetector' as const,
  async: true,
  detect: async (callback: (lang: string) => void) => {
    try {
      const savedLanguage = await AsyncStorage.getItem(LANGUAGE_KEY);
      callback(savedLanguage || 'zh');
    } catch (error) {
      callback('zh');
    }
  },
  init: () => {},
  cacheUserLanguage: async (language: string) => {
    try {
      await AsyncStorage.setItem(LANGUAGE_KEY, language);
    } catch (error) {
      console.error('Error saving language:', error);
    }
  },
};

i18n
  .use(languageDetector)
  .use(initReactI18next)
  .init({
    compatibilityJSON: 'v4',
    resources: {
      zh: {
        translation: translations.zh,
      },
      en: {
        translation: translations.en,
      },
    },
    fallbackLng: 'zh',
    interpolation: {
      escapeValue: false,
    },
    react: {
      useSuspense: false,
    },
  });

export default i18n;
