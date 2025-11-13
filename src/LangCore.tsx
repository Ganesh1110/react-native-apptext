import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
} from "react";
import { LocaleContext, LocaleProviderProps, PluralForm } from "./types";

/**
 * Simple Interpolator
 * Replaces {{key}} placeholders with actual values
 *
 * Example:
 * interpolate("Hello {{name}}", { name: "John" })
 * → "Hello John"
 */
function interpolate(text: string, params: Record<string, any> = {}): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(params, trimmedKey);

    // FIX: Handle null, undefined, objects properly
    if (value === null || value === undefined) return match;
    if (typeof value === "object") {
      console.warn(`Cannot interpolate object for key: ${trimmedKey}`);
      return match;
    }
    return String(value);
  });
}

/**
 * Helper function to access nested object properties
 * Example: getNestedValue({ user: { name: "John" } }, "user.name") → "John"
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  if (!path || typeof path !== "string") return undefined;

  return path.split(".").reduce((current, key) => {
    return current?.[key];
  }, obj);
}

/**
 * Language-specific plural rules
 * Returns which plural form to use based on count
 */
const PLURAL_RULES: Record<string, (count: number) => PluralForm> = {
  // English: 1 is "one", everything else is "other"
  en: (n) => (n === 1 ? "one" : "other"),

  // French: 0 and 1 are "one", rest is "other"
  fr: (n) => (n === 0 || n === 1 ? "one" : "other"),

  // Arabic: Complex 6-form system
  ar: (n) => {
    if (n === 0) return "zero";
    if (n === 1) return "one";
    if (n === 2) return "two";
    if (n % 100 >= 3 && n % 100 <= 10) return "few";
    if (n % 100 >= 11) return "many";
    return "other";
  },

  // Russian: Complex Slavic rules
  ru: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  },

  // Chinese/Japanese: No plurals
  zh: () => "other",
  ja: () => "other",
  es: (n) => (n === 1 ? "one" : "other"),
  de: (n) => (n === 1 ? "one" : "other"),
  pl: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (n === 1) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  },
};

/**
 * Get the correct plural form for a language and count
 */

function getPluralForm(language: string, count: number): PluralForm {
  if (typeof count !== "number" || !isFinite(count)) {
    console.warn(`Invalid count for plural: ${count}, using 0`);
    count = 0;
  }

  const langCode = language?.split("-")[0] || "en";
  const rule = PLURAL_RULES[langCode] || PLURAL_RULES.en;
  return rule(Math.abs(Math.floor(count))); // Use absolute integer
}

type DeepKeyOf<T> = T extends object
  ? {
      [K in keyof T]: K extends string
        ? T[K] extends object
          ? `${K}` | `${K}.${DeepKeyOf<T[K]>}`
          : `${K}`
        : never;
    }[keyof T]
  : never;

interface TypedTranslationManager<T extends Translations> {
  translate(key: DeepKeyOf<T>, params?: Record<string, any>): string;
  translatePlural(
    key: DeepKeyOf<T>,
    count: number,
    params?: Record<string, any>
  ): string;
}

/**
 * Translation object structure
 * Can be a simple string or an object with plural forms
 */
export interface PluralTranslation {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string; // Required fallback
}

export type TranslationValue = string | PluralTranslation;

export interface Translations {
  [key: string]: TranslationValue | { [nestedKey: string]: TranslationValue };
}

class TranslationManager {
  private cache: Map<string, string> = new Map();
  private translations: Record<string, Translations>;

  private fallbackLanguage: string;
  private shouldWarnMissing: boolean;

  constructor(
    translations: Record<string, Translations>,
    fallbackLanguage = "en",
    shouldWarnMissing = true
  ) {
    this.translations = translations;
    this.fallbackLanguage = fallbackLanguage;
    this.shouldWarnMissing = shouldWarnMissing;
  }

  /**
   * Get a simple translation with interpolation
   *
   * @param lang - Language code (e.g., "en", "ar")
   * @param key - Translation key (supports nested like "profile.name")
   * @param params - Values to interpolate
   */
  translate(lang: string, key: string, params?: Record<string, any>): string {
    const cacheKey = params
      ? `${lang}:${key}:${JSON.stringify(params)}`
      : `${lang}:${key}`;

    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const translation = this.getTranslationValue(lang, key);

    if (typeof translation === "string") {
      const result = params ? interpolate(translation, params) : translation;
      this.cache.set(cacheKey, result);
      return result;
    }

    // If it's a plural object, use 'other' as default
    if (
      translation &&
      typeof translation === "object" &&
      "other" in translation
    ) {
      const text = translation.other;
      const result = params ? interpolate(text, params) : text;
      this.cache.set(cacheKey, result);
      return result;
    }
    return key; // Fallback to key if translation not found
  }

  /**
   * Get a plural translation
   *
   * @param lang - Language code
   * @param key - Translation key
   * @param count - Number to determine plural form
   * @param params - Additional values to interpolate
   */
  translatePlural(
    lang: string,
    key: string,
    count: number,
    params?: Record<string, any>
  ): string {
    const translation = this.getTranslationValue(lang, key);

    // Handle string translations gracefully
    if (typeof translation === "string") {
      const allParams = { ...params, count };
      return interpolate(translation, allParams);
    }

    if (
      !translation ||
      typeof translation !== "object" ||
      !("other" in translation)
    ) {
      // Try fallback or return key
      if (this.shouldWarnMissing) {
        console.warn(
          `Missing plural translation for key: ${key} in language: ${lang}`
        );
      }
      return key;
    }

    const pluralForm = getPluralForm(lang, count);
    const text = translation[pluralForm] ?? translation.other ?? key;

    const allParams = { ...params, count };
    return interpolate(text, allParams);
  }

  /**
   * Helper to get nested translation value
   */
  private getTranslationValue(
    lang: string,
    key: string
  ): TranslationValue | null {
    // Try current language
    let langTranslations = this.translations[lang];
    let value = langTranslations ? getNestedValue(langTranslations, key) : null;

    // Fallback to default language
    if (!value && lang !== this.fallbackLanguage) {
      langTranslations = this.translations[this.fallbackLanguage];
      value = langTranslations ? getNestedValue(langTranslations, key) : null;
    }

    // Warning when translation is missing
    if (!value && this.shouldWarnMissing) {
      console.warn(`Missing translation for key: ${key} in language: ${lang}`);
    }

    return value;
  }

  clearCache() {
    this.cache.clear();
  }
}

/**
 * STEP 5A: LocaleProvider Component
 * Wrap your app with this to enable translations
 */
export function LocaleProvider({
  translations,
  defaultLanguage,
  onMissingTranslation,
  children,
}: LocaleProviderProps & {
  onMissingTranslation?: (lang: string, key: string) => void;
}) {
  const [language, setLanguage] = useState(defaultLanguage);

  const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

  const direction: "rtl" | "ltr" = useMemo(() => {
    const langCode = language.split("-")[0];
    return RTL_LANGUAGES.includes(langCode) ? "rtl" : "ltr";
  }, [language]);

  // Create translation manager (only once)
  const manager = useMemo(() => {
    if (process.env.NODE_ENV === "development") {
      validateTranslations(translations);
    }
    return new TranslationManager(translations);
  }, [translations]);

  // t() - Simple translation function
  const t = useCallback(
    (key: string, params?: Record<string, any>) => {
      const result = manager.translate(language, key, params);
      if (result === key && onMissingTranslation) {
        onMissingTranslation(language, key);
      }
      return result;
    },
    [language, manager, onMissingTranslation]
  );

  // tn() - Plural translation function
  const tn = useCallback(
    (key: string, count: number, params?: Record<string, any>) => {
      return manager.translatePlural(language, key, count, params);
    },
    [language, manager]
  );

  const changeLanguage = useCallback((lang: string) => {
    setLanguage(lang);
    manager.clearCache();
  }, []);

  const value = useMemo(
    () => ({
      language,
      t,
      tn,
      direction,
      changeLanguage,
    }),
    [language, t, tn, changeLanguage]
  );

  function validateTranslations(translations: Record<string, Translations>) {
    Object.entries(translations).forEach(([lang, langTranslations]) => {
      const checkObject = (obj: any, path: string = "") => {
        // Early return for null/undefined
        if (!obj || typeof obj !== "object") return;

        Object.entries(obj).forEach(([key, value]) => {
          // Skip null/undefined values
          if (value == null) return;

          const currentPath = path ? `${path}.${key}` : key;

          if (typeof value === "object" && !Array.isArray(value)) {
            // Check if this is a plural object (has 'other' key)
            const hasPluralKeys = [
              "zero",
              "one",
              "two",
              "few",
              "many",
              "other",
            ].some((pluralKey) => pluralKey in value);

            if (hasPluralKeys) {
              // This is a plural object, must have 'other'
              if (!("other" in value)) {
                console.error(
                  `Plural translation missing 'other' field: ${lang}.${currentPath}`
                );
              }
            } else {
              // This is a nested container, check its children
              checkObject(value, currentPath);
            }
          }
        });
      };

      checkObject(langTranslations);
    });
  }

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

/**
 * STEP 5B: useLang Hook
 * Use this hook in any component to access translations
 */
export function useLang() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error(
      "useLang must be used within LocaleProvider. " +
        "Wrap your app with <LocaleProvider> component."
    );
  }
  return context;
}

// Core translation manager for advanced usage
export { TranslationManager };

// Utility functions
export { interpolate, getNestedValue, getPluralForm };

// Constants
export { PLURAL_RULES };
