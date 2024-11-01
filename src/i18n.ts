import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

const languages = ['en' /*, 'es', 'de'*/];
const resources: { [key: string]: { translation: string } } = {};

const loadResources = async () => {
  for (const lang of languages) {
    try {
      const translations = await import(`./locales/${lang}.json`);
      resources[lang] = { translation: translations.default };
    } catch (e) {
      console.log(e);
    }
  }

  i18n.use(initReactI18next).init({
    resources,
    lng: 'en',
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false,
    },
  });
};

loadResources();

export default i18n;
