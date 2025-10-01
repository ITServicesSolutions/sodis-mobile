import i18n, { changeLanguage as i18nextChangeLanguage, init as i18nextInit, use as i18nextUse } from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';

import fr from './locales/fr.json';
import en from './locales/en.json';

const LANG_KEY = 'APP_LANGUAGE';

const resources = {
  fr: { translation: fr },
  en: { translation: en },
};

const loadLanguage = async () => {
  const storedLang = await AsyncStorage.getItem(LANG_KEY);
  return storedLang || 'en';
};

export const initI18n = async () => {
  const language = await loadLanguage();

  await new Promise<void>((resolve, reject) => {

    i18nextUse(initReactI18next);
    i18nextInit(
      {
        resources,
        lng: language,
        fallbackLng: 'en',
        interpolation: { escapeValue: false },
      },
      (err) => {
        if (err) reject(err);
        else resolve();
      }
    );
  });
};

export const changeLanguage = async (lang: string) => {
  await i18nextChangeLanguage(lang);
  await AsyncStorage.setItem(LANG_KEY, lang);
};

export default i18n;
