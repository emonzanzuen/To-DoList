import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import idTranslation from './locales/id/translation.json';
import enTranslation from './locales/en/translation.json';
import { DEFAULT_LANGUAGE, STORAGE_KEYS, SUPPORTED_LANGUAGES } from './constants';
import { readStorage } from './utils/storage';

const stored = readStorage<string>(STORAGE_KEYS.LANGUAGE, DEFAULT_LANGUAGE);
const initialLanguage = (SUPPORTED_LANGUAGES as readonly string[]).includes(stored)
  ? stored
  : DEFAULT_LANGUAGE;

document.documentElement.lang = initialLanguage;

void i18n.use(initReactI18next).init({
  resources: {
    id: { translation: idTranslation },
    en: { translation: enTranslation },
  },
  lng: initialLanguage,
  fallbackLng: DEFAULT_LANGUAGE,
  interpolation: { escapeValue: false },
});

export default i18n;