import i18n, { type BackendModule } from "i18next";
import { initReactI18next } from "react-i18next";
import en from "./locales/eng.json";

let language = "en";
try { if (localStorage.getItem("jf_language") === "hi") language = "hi"; } catch { /* Storage may be unavailable. */ }

// English is available immediately. Download Hindi only when selected or remembered.
const bundledTranslations: BackendModule = {
  type: "backend",
  init() {},
  read(language, _namespace, callback) {
    if (language === "en") {
      callback(null, en);
      return;
    }
    if (language !== "hi") {
      callback(new Error("Unsupported language"), false);
      return;
    }
    import("./locales/hindi.json")
      .then((module) => callback(null, module.default))
      .catch((error: unknown) => callback(
        error instanceof Error ? error : new Error("Could not load Hindi translations"),
        false,
      ));
  },
};

i18n.use(bundledTranslations).use(initReactI18next).init({
  resources: { en: { translation: en } },
  partialBundledLanguages: true,
  lng: language,
  fallbackLng: "en",
  supportedLngs: ["en", "hi"],
  keySeparator: false,
  nsSeparator: false,
  interpolation: { escapeValue: false },
});
i18n.on("languageChanged", (lng) => { try { localStorage.setItem("jf_language", lng); } catch { /* Keep switching available without storage. */ } });
export const tr = (text: string, values: Record<string, string | number> = {}) => String(i18n.t(text.replace(/\s+/g, " ").trim(), { defaultValue: text, ...values }));
export default i18n;

/** Translate display strings without changing form values, identifiers or React elements. */
export function localize<T>(value: T): T {
  if (typeof value === "string") return tr(value) as T;
  if (Array.isArray(value)) return value.map(localize) as T;
  return value;
}

/** Keep unexpected server/network errors understandable in Hindi. */
export function trError(message: string): string {
  if (i18n.resolvedLanguage === "hi" && !i18n.exists(message.replace(/\s+/g, " ").trim())) {
    return tr("Something went wrong. Please try again.");
  }
  return tr(message);
}
