import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
} from "react";
import { LocaleContext, LocaleProviderProps, PluralForm } from "./types";
import CurrencyJsonList from "../src/data/Currency.json";

// ============================================================================
// PART 1: ICU MESSAGE FORMAT PARSER
// ============================================================================

interface CurrencyEntry {
  languages: any;
  name?: string;
  cca3: string;
  flag?: string;
  currencies: {
    symbol: string;
  };
}

// Convert array to object with locale/cca3 as keys
const localeToCurrency: Record<string, CurrencyEntry> = CurrencyJsonList.reduce(
  (acc, item) => {
    let symbol = "$";

    if (typeof item.currencies === "object" && item.currencies !== null) {
      symbol = item.currencies.symbol || "$";
    } else if (typeof item.currencies === "string") {
      symbol = item.currencies;
    }

    acc[item.cca3] = {
      cca3: item.cca3,
      name: item.name,
      flag: item.flag,
      currencies: {
        symbol: symbol,
      },
    };
    return acc;
  },
  {} as Record<string, CurrencyEntry>
);

class ICUMessageFormat {
  private static PLURAL_REGEX =
    /\{(\w+),\s*plural,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;

  private static SELECT_REGEX =
    /\{(\w+),\s*select,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;

  private static SELECTORDINAL_REGEX =
    /\{(\w+),\s*selectordinal,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;

  private static VARIABLE_REGEX = /\{([^}]+)\}/g;

  static format(
    message: string,
    params: Record<string, any>,
    language: string
  ): string {
    let result = message;

    // 1. Handle plural formatting
    result = result.replace(this.PLURAL_REGEX, (match, variable, options) => {
      const count = Number(params[variable] ?? 0);
      return this.handlePlural(options, count, language, params);
    });

    // 2. Handle selectordinal
    result = result.replace(
      this.SELECTORDINAL_REGEX,
      (match, variable, options) => {
        const count = Number(params[variable] ?? 0);
        return this.handleSelectOrdinal(options, count, language, params);
      }
    );

    // 3. Handle select
    result = result.replace(this.SELECT_REGEX, (match, variable, options) => {
      const value = params[variable];
      return this.handleSelect(options, value, params);
    });

    // 4. Handle simple variables and formatting
    result = result.replace(this.VARIABLE_REGEX, (match, expression) => {
      return this.handleVariable(expression.trim(), params, language);
    });

    return result;
  }

  private static handlePlural(
    options: string,
    count: number,
    language: string,
    params: Record<string, any>
  ): string {
    const cases = this.parseOptions(options);
    const pluralForm = getPluralForm(language, count);

    // Try exact match first (e.g., =0, =1)
    const exactKey = `=${count}`;
    if (cases[exactKey]) {
      return this.replacePoundSign(cases[exactKey], count, params);
    }

    // Then try plural form (one, few, many, other)
    const caseValue = cases[pluralForm] || cases["other"] || "";
    return this.replacePoundSign(caseValue, count, params);
  }

  private static handleSelectOrdinal(
    options: string,
    count: number,
    language: string,
    params: Record<string, any>
  ): string {
    const cases = this.parseOptions(options);
    const ordinalForm = getOrdinalForm(language, count);

    const caseValue = cases[ordinalForm] || cases["other"] || "";
    return this.replacePoundSign(caseValue, count, params);
  }

  private static handleSelect(
    options: string,
    value: any,
    params: Record<string, any>
  ): string {
    const cases = this.parseOptions(options);
    const key = String(value ?? "other");
    return cases[key] || cases["other"] || "";
  }

  private static handleVariable(
    expression: string,
    params: Record<string, any>,
    language: string
  ): string {
    // Support formatting: {price, number, currency}
    const parts = expression.split(",").map((s) => s.trim());
    const variable = parts[0];
    const type = parts[1];
    const format = parts[2];

    const value = getNestedValue(params, variable);

    if (value === null || value === undefined) return `{${expression}}`;

    // Apply formatting if specified
    if (type === "number") {
      return this.formatNumber(value, format, language);
    } else if (type === "date") {
      return this.formatDate(value, format, language);
    }

    return String(value);
  }

  private static parseOptions(optionsStr: string): Record<string, string> {
    const cases: Record<string, string> = {};
    const regex = /(=?\w+)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
    let match;

    while ((match = regex.exec(optionsStr)) !== null) {
      const key = match[1].trim();
      const value = match[2].trim();
      cases[key] = value;
    }

    return cases;
  }

  private static replacePoundSign(
    text: string,
    count: number,
    params: Record<string, any>
  ): string {
    return text.replace(/#/g, String(count)).replace(/\{(\w+)\}/g, (_, key) => {
      return String(params[key] ?? `{${key}}`);
    });
  }

  private static formatNumber(
    value: any,
    format?: string,
    language: string = "en"
  ): string {
    // Validate input
    if (value === null || value === undefined) {
      return String(value);
    }

    const num = Number(value);
    if (isNaN(num) || !isFinite(num)) {
      return String(value);
    }

    try {
      if (format === "currency") {
        const currencyInfo = this.getCurrencyForLanguage(language);

        const formatter = new Intl.NumberFormat(language, {
          style: "currency",
          currency: currencyInfo.code,
          currencyDisplay: "symbol",
        });

        let result = formatter.format(num);

        // Fix spacing issues for RTL and specific locales
        if (["ar", "he", "fa", "ur"].includes(language.split("-")[0])) {
          result = result.replace(/\u202F/g, " ").replace(/\u00A0/g, " ");
        }

        return result;
      } else if (format === "percent") {
        return new Intl.NumberFormat(language, {
          style: "percent",
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(num);
      } else {
        return new Intl.NumberFormat(language, {
          minimumFractionDigits: 0,
          maximumFractionDigits: 2,
        }).format(num);
      }
    } catch (error) {
      // Silent fallback for production
      try {
        return new Intl.NumberFormat("en-US", {
          style:
            format === "currency"
              ? "currency"
              : format === "percent"
                ? "percent"
                : "decimal",
          currency: "USD",
        }).format(num);
      } catch {
        return String(value);
      }
    }
  }

  private static formatDate(
    value: any,
    format?: string,
    language: string = "en"
  ): string {
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);

    try {
      if (format === "short") {
        return date.toLocaleDateString(language);
      } else if (format === "long") {
        return date.toLocaleDateString(language, {
          year: "numeric",
          month: "long",
          day: "numeric",
        });
      }

      return date.toLocaleString(language);
    } catch (error) {
      return date.toLocaleString("en-US");
    }
  }

  private static getCurrencyForLanguage(language: string): {
    code: string;
    symbol: string;
  } {
    const defaultCurrency = { code: "USD", symbol: "$" };

    if (!language || typeof language !== "string") {
      return defaultCurrency;
    }

    // Normalize language code
    const normalized = language.toLowerCase().replace(/_/g, "-");
    const [lang, region] = normalized.split("-");

    // Cache for frequently used currencies to improve performance
    const cacheKey = `${lang}-${region || ""}`;
    if (this.currencyCache.has(cacheKey)) {
      return this.currencyCache.get(cacheKey)!;
    }

    let result = defaultCurrency;

    // ========================================================================
    // STEP 1: Try exact region match (highest priority)
    // ========================================================================
    if (region) {
      const regionUpper = region.toUpperCase();
      const regionEntry = localeToCurrency[regionUpper];

      if (regionEntry?.currencies) {
        // Use the region as currency code and get symbol directly
        const code = regionUpper;
        const symbol = regionEntry.currencies.symbol || "$";
        result = { code, symbol };
        this.currencyCache.set(cacheKey, result);
        return result;
      }
    }

    // ========================================================================
    // STEP 2: Primary country mapping (most common usage)
    // ========================================================================
    const PRIMARY_COUNTRY: Record<string, string> = {
      // Major languages
      en: "USA",
      es: "ESP",
      pt: "BRA",
      fr: "FRA",
      de: "DEU",
      it: "ITA",
      ru: "RUS",
      ar: "SAU",
      hi: "IND",
      zh: "CHN",
      ja: "JPN",
      ko: "KOR",
      el: "GRC",

      // South Asian languages
      ur: "PAK",
      bn: "BGD",
      ta: "IND",
      te: "IND",
      ml: "IND",
      kn: "IND",
      pa: "IND",
      gu: "IND",
      or: "IND",
      mr: "IND",

      // Afghan languages
      ps: "AFG",
      pus: "AFG",
      prs: "AFG",
      fa: "IRN",
      fas: "IRN",

      // Southeast Asian languages
      th: "THA",
      vi: "VNM",
      id: "IDN",
      ms: "MYS",
      my: "MMR",
      km: "KHM",
      lo: "LAO",

      // Middle Eastern languages
      he: "ISR",
      tr: "TUR",
      af: "AFG",

      // African languages
      sw: "KEN",
      am: "ETH",
      ha: "NGA",
      yo: "NGA",
      ig: "NGA",

      // European languages
      pl: "POL",
      uk: "UKR",
      cs: "CZE",
      ro: "ROU",
      hu: "HUN",
      nl: "NLD",
      sv: "SWE",
      no: "NOR",
      da: "DNK",
      fi: "FIN",
    };

    if (PRIMARY_COUNTRY[lang]) {
      const countryCode = PRIMARY_COUNTRY[lang];
      const entry = localeToCurrency[countryCode];

      if (entry?.currencies) {
        // Use country code as currency code and get symbol directly
        const code = countryCode;
        const symbol = entry.currencies.symbol || "$";
        result = { code, symbol };
        this.currencyCache.set(cacheKey, result);
        return result;
      }
    }

    // ========================================================================
    // STEP 3: Smart language matching (ISO 639-1, 639-2, 639-3)
    // ========================================================================
    const ISO_MAP: Record<string, string[]> = {
      ps: ["pus", "pbt", "pst"],
      pus: ["pus", "pbt", "pst"],
      prs: ["prs", "fa"],
      fa: ["fas", "fa", "prs"],
      ur: ["urd", "ur"],
      bn: ["ben", "bn"],
      hi: ["hin", "hi"],
      pa: ["pan", "pa"],
      th: ["tha", "th"],
      vi: ["vie", "vi"],
      id: ["ind", "id"],
      ms: ["msa", "ms"],
      my: ["mya", "my"],
      km: ["khm", "km"],
      lo: ["lao", "lo"],
      ar: ["ara", "ar"],
      he: ["heb", "he"],
      tr: ["tur", "tr"],
      sw: ["swa", "sw"],
      am: ["amh", "am"],
      ha: ["hau", "ha"],
    };

    const searchCodes = ISO_MAP[lang] || [lang];
    const matchedEntry = Object.values(localeToCurrency).find((entry) => {
      if (!entry.languages) return false;
      const langKeys = Object.keys(entry.languages).map((k) => k.toLowerCase());
      return searchCodes.some((code) => langKeys.includes(code.toLowerCase()));
    });

    if (matchedEntry?.currencies) {
      // Use country code as currency code and get symbol directly
      const code = matchedEntry.cca3;
      const symbol = matchedEntry.currencies.symbol || "$";
      result = { code, symbol };
      this.currencyCache.set(cacheKey, result);
      return result;
    }

    // ========================================================================
    // STEP 4: Final fallback - exact language match
    // ========================================================================
    const exactMatch = Object.values(localeToCurrency).find((entry) => {
      if (!entry.languages) return false;

      // Check for exact language code match
      const hasExactCodeMatch = Object.keys(entry.languages).some(
        (k) => k.toLowerCase() === lang.toLowerCase()
      );

      // Check for exact language name match
      const hasExactNameMatch = Object.values(entry.languages).some(
        (v) => v.toLowerCase().replace(/[^a-z]/g, "") === lang.toLowerCase()
      );

      return hasExactCodeMatch || hasExactNameMatch;
    });

    if (exactMatch?.currencies) {
      // Use country code as currency code and get symbol directly
      const code = exactMatch.cca3;
      const symbol = exactMatch.currencies.symbol || "$";
      result = { code, symbol };
      this.currencyCache.set(cacheKey, result);
      return result;
    }

    this.currencyCache.set(cacheKey, result);
    return result;
  }

  // Add this static cache property to your class
  private static currencyCache = new Map<
    string,
    { code: string; symbol: string }
  >();
}

// ============================================================================
// PART 2: ENHANCED PLURAL RULES (CLDR-compliant)
// ============================================================================

const PLURAL_RULES: Record<string, (count: number) => PluralForm> = {
  en: (n) => (n === 1 ? "one" : "other"),
  fr: (n) => (n === 0 || n === 1 ? "one" : "other"),
  ar: (n) => {
    if (n === 0) return "zero";
    if (n === 1) return "one";
    if (n === 2) return "two";
    if (n % 100 >= 3 && n % 100 <= 10) return "few";
    if (n % 100 >= 11) return "many";
    return "other";
  },
  ru: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  },
  pl: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (n === 1) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  },
  cs: (n) => {
    if (n === 1) return "one";
    if (n >= 2 && n <= 4) return "few";
    return "many";
  },
  zh: () => "other",
  ja: () => "other",
  ko: () => "other",
  es: (n) => (n === 1 ? "one" : "other"),
  de: (n) => (n === 1 ? "one" : "other"),
  it: (n) => (n === 1 ? "one" : "other"),
  pt: (n) => (n === 0 || n === 1 ? "one" : "other"),
};

const ORDINAL_RULES: Record<string, (count: number) => PluralForm> = {
  en: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 === 2 && mod100 !== 12) return "two";
    if (mod10 === 3 && mod100 !== 13) return "few";
    return "other";
  },
  es: (n) => "other",
  ar: (n) => "other",
};

function getPluralForm(language: string, count: number): PluralForm {
  if (typeof count !== "number" || !isFinite(count)) {
    count = 0;
  }
  const langCode = language?.split("-")[0] || "en";
  const rule = PLURAL_RULES[langCode] || PLURAL_RULES.en;
  return rule(Math.abs(Math.floor(count)));
}

function getOrdinalForm(language: string, count: number): PluralForm {
  const langCode = language?.split("-")[0] || "en";
  const rule = ORDINAL_RULES[langCode];
  if (!rule) return "other";
  return rule(Math.abs(Math.floor(count)));
}

// ============================================================================
// PART 3: INTERPOLATION & FORMATTING
// ============================================================================

function interpolate(text: string, params: Record<string, any> = {}): string {
  return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
    const trimmedKey = key.trim();
    const value = getNestedValue(params, trimmedKey);

    if (value === null || value === undefined) return match;
    if (typeof value === "object") {
      console.warn(`Cannot interpolate object for key: ${trimmedKey}`);
      return match;
    }
    return String(value);
  });
}

function getNestedValue(obj: Record<string, any>, path: string): any {
  if (!obj || typeof obj !== "object") return undefined;
  if (!path || typeof path !== "string") return undefined;

  return path.split(".").reduce((current, key) => {
    return current?.[key];
  }, obj);
}

// ============================================================================
// PART 4: NAMESPACE SUPPORT
// ============================================================================

interface TranslationNamespace {
  [key: string]: any;
}

interface NamespacedTranslations {
  [namespace: string]: TranslationNamespace;
}

// ============================================================================
// PART 5: TRANSLATION MANAGER (Enhanced)
// ============================================================================

export interface PluralTranslation {
  zero?: string;
  one?: string;
  two?: string;
  few?: string;
  many?: string;
  other: string;
}

export type TranslationValue = string | PluralTranslation;

export interface Translations {
  [key: string]: TranslationValue | { [nestedKey: string]: any };
}

interface TranslationManagerOptions {
  fallbackLanguage?: string;
  shouldWarnMissing?: boolean;
  useICU?: boolean;
  onMissingKey?: (lang: string, key: string, namespace?: string) => void;
}

class TranslationManager {
  private cache: Map<string, string> = new Map();
  private translations: Record<string, Translations>;
  private namespaces: Record<string, NamespacedTranslations> = {};
  private fallbackLanguage: string;
  private shouldWarnMissing: boolean;
  private useICU: boolean;
  private onMissingKey?: (
    lang: string,
    key: string,
    namespace?: string
  ) => void;

  constructor(
    translations: Record<string, Translations>,
    options: TranslationManagerOptions = {}
  ) {
    this.translations = translations;
    this.fallbackLanguage = options.fallbackLanguage || "en";
    this.shouldWarnMissing = options.shouldWarnMissing ?? true;
    this.useICU = options.useICU ?? true;
    this.onMissingKey = options.onMissingKey;
  }

  addNamespace(
    namespace: string,
    translations: Record<string, TranslationNamespace>
  ) {
    if (!this.namespaces[namespace]) {
      this.namespaces[namespace] = translations;
    }
    this.clearCache();
  }

  translate(
    lang: string,
    key: string,
    params?: Record<string, any>,
    options?: { namespace?: string; context?: string; count?: number }
  ): string {
    const { namespace, context, count } = options || {};

    const cacheKey = this.buildCacheKey(lang, key, params, namespace, context);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    let translation = this.getTranslationValue(lang, key, namespace, context);

    if (context && !translation) {
      const contextKey = `${key}_${context}`;
      translation = this.getTranslationValue(lang, contextKey, namespace);
    }

    if (!translation) {
      this.handleMissingKey(lang, key, namespace);
      return key;
    }

    if (
      typeof translation === "object" &&
      "other" in translation &&
      count !== undefined
    ) {
      return this.translatePlural(lang, key, count, params, { namespace });
    }

    if (typeof translation === "string") {
      let result = translation;

      const mergedParams = count !== undefined ? { ...params, count } : params;

      if (this.useICU && this.hasICUSyntax(result)) {
        result = ICUMessageFormat.format(result, mergedParams || {}, lang);
      } else {
        result = mergedParams ? interpolate(result, mergedParams) : result;
      }

      this.cache.set(cacheKey, result);
      return result;
    }

    return key;
  }

  translatePlural(
    lang: string,
    key: string,
    count: number,
    params?: Record<string, any>,
    options?: { namespace?: string }
  ): string {
    const translation = this.getTranslationValue(lang, key, options?.namespace);

    if (typeof translation === "string") {
      const allParams = { ...params, count };
      return this.useICU && this.hasICUSyntax(translation)
        ? ICUMessageFormat.format(translation, allParams, lang)
        : interpolate(translation, allParams);
    }

    if (
      !translation ||
      typeof translation !== "object" ||
      !("other" in translation)
    ) {
      this.handleMissingKey(lang, key, options?.namespace);
      return key;
    }

    const pluralForm = getPluralForm(lang, count);
    const text = translation[pluralForm] ?? translation.other ?? key;

    const allParams = { ...params, count };
    return this.useICU && this.hasICUSyntax(text)
      ? ICUMessageFormat.format(text, allParams, lang)
      : interpolate(text, allParams);
  }

  private hasICUSyntax(text: string): boolean {
    return (
      /\{[^}]+,\s*(plural|select|selectordinal|number|date)\s*,/.test(text) ||
      /\{[^}]+,\s*(plural|select|selectordinal)\s+\}/.test(text)
    );
  }

  private getTranslationValue(
    lang: string,
    key: string,
    namespace?: string,
    context?: string
  ): TranslationValue | null {
    if (namespace && this.namespaces[namespace]?.[lang]) {
      const value = getNestedValue(this.namespaces[namespace][lang], key);
      if (value) return value;
    }

    let langTranslations = this.translations[lang];
    let value = langTranslations ? getNestedValue(langTranslations, key) : null;

    if (!value && lang !== this.fallbackLanguage) {
      langTranslations = this.translations[this.fallbackLanguage];
      value = langTranslations ? getNestedValue(langTranslations, key) : null;
    }

    return value;
  }

  private buildCacheKey(
    lang: string,
    key: string,
    params?: Record<string, any>,
    namespace?: string,
    context?: string
  ): string {
    const parts = [lang, namespace || "main", key];
    if (context) parts.push(context);
    if (params) parts.push(JSON.stringify(params));
    return parts.join(":");
  }

  private handleMissingKey(lang: string, key: string, namespace?: string) {
    if (this.shouldWarnMissing) {
      console.warn(
        `[i18n] Missing translation: "${key}" (lang: ${lang}${
          namespace ? `, namespace: ${namespace}` : ""
        })`
      );
    }
    this.onMissingKey?.(lang, key, namespace);
  }

  clearCache() {
    this.cache.clear();
  }
}

// ============================================================================
// PART 6: LOCALE PROVIDER (Enhanced)
// ============================================================================

export function LocaleProvider({
  translations,
  defaultLanguage,
  fallbackLanguage = "en",
  useICU = true,
  onMissingTranslation,
  children,
}: LocaleProviderProps & {
  fallbackLanguage?: string;
  useICU?: boolean;
  onMissingTranslation?: (
    lang: string,
    key: string,
    namespace?: string
  ) => void;
}) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [loadedNamespaces, setLoadedNamespaces] = useState<Set<string>>(
    new Set(["main"])
  );

  const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];

  const direction: "rtl" | "ltr" = useMemo(() => {
    const langCode = language.split("-")[0];
    return RTL_LANGUAGES.includes(langCode) ? "rtl" : "ltr";
  }, [language]);

  const manager = useMemo(() => {
    return new TranslationManager(translations, {
      fallbackLanguage,
      shouldWarnMissing: true,
      useICU,
      onMissingKey: onMissingTranslation,
    });
  }, [translations, fallbackLanguage, useICU, onMissingTranslation]);

  const t = useCallback(
    (
      key: string,
      params?: Record<string, any>,
      options?: { namespace?: string; context?: string; count?: number }
    ) => {
      return manager.translate(language, key, params, options);
    },
    [language, manager]
  );

  const tn = useCallback(
    (
      key: string,
      count: number,
      params?: Record<string, any>,
      options?: { namespace?: string }
    ) => {
      return manager.translatePlural(language, key, count, params, options);
    },
    [language, manager]
  );

  const changeLanguage = useCallback(
    (lang: string) => {
      setLanguage(lang);
      manager.clearCache();
    },
    [manager]
  );

  const loadNamespace = useCallback(
    async (namespace: string, loader: () => Promise<any>) => {
      if (loadedNamespaces.has(namespace)) return;

      try {
        const translations = await loader();
        manager.addNamespace(namespace, translations);
        setLoadedNamespaces((prev) => new Set([...prev, namespace]));
      } catch (error) {
        console.error(`Failed to load namespace: ${namespace}`, error);
      }
    },
    [manager, loadedNamespaces]
  );

  const value = useMemo(
    () => ({
      language,
      t,
      tn,
      direction,
      changeLanguage,
      loadNamespace,
    }),
    [language, t, tn, direction, changeLanguage, loadNamespace]
  );

  return (
    <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>
  );
}

// ============================================================================
// PART 7: HOOKS
// ============================================================================

export function useLang() {
  const context = useContext(LocaleContext);
  if (!context) {
    throw new Error("useLang must be used within LocaleProvider");
  }
  return context;
}

export function useNamespace(namespace: string, loader: () => Promise<any>) {
  const { loadNamespace } = useLang();

  useEffect(() => {
    loadNamespace(namespace, loader);
  }, [namespace, loader, loadNamespace]);
}

// Export utilities
export {
  TranslationManager,
  interpolate,
  getNestedValue,
  getPluralForm,
  PLURAL_RULES,
};
