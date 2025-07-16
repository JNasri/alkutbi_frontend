// src/i18n.js
import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import LanguageDetector from "i18next-browser-languagedetector";

import en from "./src/locales/en.json";
import ar from "./src/locales/ar.json";

i18n
  .use(LanguageDetector)
  .use(initReactI18next) // ⬅️ required for `useTranslation()` to work
  .init({
    resources: {
      en: { translation: en },
      ar: { translation: ar },
    },
    fallbackLng: "en",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
