import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const languages = ['en' /*, 'es', 'de'*/];
const resources: { [key: string]: { translation: string } } = {};

export const loadI18n = async () => {
  for (const lang of languages) {
    try {
      const translations = await import(`./locales/${lang}.json`);
      resources[lang] = { translation: translations.default };
    } catch (e) {
      console.error(`Error loading language '${lang}':`, e);
    }
  }

  await i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: { escapeValue: false },
  });
};

export default i18n;
