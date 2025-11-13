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
  // Regular expression to find {{variable}} patterns
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();

    // Handle nested objects like {{user.name}}
    const value = getNestedValue(params, trimmedKey);

    // If value exists, use it; otherwise keep the placeholder
    return value !== undefined ? String(value) : match;
  });
}

/**
 * Helper function to access nested object properties
 * Example: getNestedValue({ user: { name: "John" } }, "user.name") → "John"
 */
function getNestedValue(obj: Record<string, any>, path: string): any {
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
};

/**
 * Get the correct plural form for a language and count
 */
function getPluralForm(language: string, count: number): PluralForm {
  const langCode = language.split("-")[0]; // "en-US" → "en"
  const rule = PLURAL_RULES[langCode] || PLURAL_RULES.en;
  return rule(count);
}

/**
 * Translation object structure
 * Can be a simple string or an object with plural forms
 */
interface PluralTranslation {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string; // Required fallback
}

type TranslationValue = string | PluralTranslation;

interface Translations {
  [key: string]: TranslationValue | { [nestedKey: string]: TranslationValue };
}

class TranslationManager {
  private translations: Record<string, Translations>;

  constructor(translations: Record<string, Translations>) {
    this.translations = translations;
  }

  /**
   * Get a simple translation with interpolation
   *
   * @param lang - Language code (e.g., "en", "ar")
   * @param key - Translation key (supports nested like "profile.name")
   * @param params - Values to interpolate
   */
  translate(lang: string, key: string, params?: Record<string, any>): string {
    const translation = this.getTranslationValue(lang, key);

    if (typeof translation === "string") {
      return params ? interpolate(translation, params) : translation;
    }

    // If it's a plural object, use 'other' as default
    if (
      translation &&
      typeof translation === "object" &&
      "other" in translation
    ) {
      const text = translation.other;
      return params ? interpolate(text, params) : text;
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

    // Must be a plural object
    if (
      !translation ||
      typeof translation !== "object" ||
      !("other" in translation)
    ) {
      return key;
    }

    // Get the correct plural form for this language and count
    const pluralForm = getPluralForm(lang, count);

    // Get the text for this plural form (fallback to 'other')
    const text = translation[pluralForm] || translation.other;

    // Add count to params and interpolate
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
    const langTranslations = this.translations[lang];
    if (!langTranslations) return null;

    return getNestedValue(langTranslations, key);
  }
}

/**
 * STEP 5A: LocaleProvider Component
 * Wrap your app with this to enable translations
 */
export function LocaleProvider({
  translations,
  defaultLanguage,
  children,
}: LocaleProviderProps) {
  const [language, setLanguage] = useState(defaultLanguage);

  // Create translation manager (only once)
  const manager = useMemo(
    () => new TranslationManager(translations),
    [translations]
  );

  // t() - Simple translation function
  const t = useCallback(
    (key: string, params?: Record<string, any>) => {
      return manager.translate(language, key, params);
    },
    [language, manager]
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
  }, []);

  const value = useMemo(
    () => ({
      language,
      t,
      tn,
      changeLanguage,
    }),
    [language, t, tn, changeLanguage]
  );

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
    throw new Error("useLang must be used within LocaleProvider");
  }
  return context;
}

// Core translation manager for advanced usage
export { TranslationManager };

// Utility functions
export { interpolate, getNestedValue, getPluralForm };

// Constants
export { PLURAL_RULES };
