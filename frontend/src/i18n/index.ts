import i18n from "i18next";
import { initReactI18next } from "react-i18next";
import * as Localization from "expo-localization";
import { es } from "./locales/es";
import { en } from "./locales/en";
import { pt } from "./locales/pt";
import { fr } from "./locales/fr";

export const SUPPORTED_LANGUAGES = ["es", "en", "pt", "fr"] as const;
export type SupportedLanguage = (typeof SUPPORTED_LANGUAGES)[number];

const deviceLanguage = (Localization.getLocales()[0]?.languageCode ?? "es") as SupportedLanguage | string;
const defaultLanguage: SupportedLanguage = SUPPORTED_LANGUAGES.includes(deviceLanguage as SupportedLanguage)
  ? (deviceLanguage as SupportedLanguage)
  : "es";

void i18n
  .use(initReactI18next)
  .init({
    resources: { es, en, pt, fr },
    lng: defaultLanguage,
    fallbackLng: "es",
    interpolation: { escapeValue: false },
  });

export default i18n;
