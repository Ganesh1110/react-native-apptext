import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useMemo,
  useEffect,
  useRef,
} from "react";
import { LocaleContext, LocaleProviderProps, PluralForm } from "./types";
import {
  translationCache,
  performanceMonitor,
  debounce,
} from "./PerformanceOptimizations";
import { AccessibilityInfo } from "react-native";
import CurrencyJsonList from "./data/Currency.json";

// ============================================================================
// PART 1: ICU MESSAGE FORMAT PARSER
// ============================================================================

import { COUNTRY_TO_CURRENCY, PRIMARY_COUNTRY } from "./data/LocaleData";

interface CurrencyInfo {
  code: string;
  symbol: string;
}

// Convert Currency.json to a usable map
const localeToCurrency: Record<string, CurrencyInfo> = CurrencyJsonList.reduce(
  (acc, item) => {
    const currencyCode = COUNTRY_TO_CURRENCY[item.cca3] || "USD";
    acc[item.cca3] = {
      code: currencyCode,
      symbol: item.symbol || "$",
    };
    return acc;
  },
  {} as Record<string, CurrencyInfo>,
);

export class ICUMessageFormat {
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
    language: string,
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
      },
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
    params: Record<string, any>,
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
    params: Record<string, any>,
  ): string {
    const cases = this.parseOptions(options);
    const ordinalForm = getOrdinalForm(language, count);

    const caseValue = cases[ordinalForm] || cases["other"] || "";
    return this.replacePoundSign(caseValue, count, params);
  }

  private static handleSelect(
    options: string,
    value: unknown,
    params: Record<string, unknown>,
  ): string {
    const cases = this.parseOptions(options);
    const key = String(value ?? "other");
    return cases[key] || cases["other"] || "";
  }

  private static handleVariable(
    expression: string,
    params: Record<string, any>,
    language: string,
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
    params: Record<string, any>,
  ): string {
    return text.replace(/#/g, String(count)).replace(/\{(\w+)\}/g, (_, key) => {
      return String(params[key] ?? `{${key}}`);
    });
  }

  public static formatNumber(
    value: unknown,
    format?: string,
    language: string = "en",
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
    value: unknown,
    format?: string,
    language: string = "en",
  ): string {
    const date = new Date(value as string | number | Date);
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

  public static getCurrencyForLanguage(language: string): CurrencyInfo {
    const defaultCurrency: CurrencyInfo = { code: "USD", symbol: "$" };

    if (!language || typeof language !== "string") {
      return defaultCurrency;
    }

    // Normalize language code
    const normalized = language.toLowerCase().replace(/_/g, "-");
    const [lang, region] = normalized.split("-");

    // Cache for frequently used currencies
    const cacheKey = `${lang}-${region || ""}`;
    if (this.currencyCache.has(cacheKey)) {
      return this.currencyCache.get(cacheKey)!;
    }

    let result = defaultCurrency;

    // STEP 1: Try exact region match (highest priority)
    if (region) {
      const regionUpper = region.toUpperCase();
      // Handle special cases
      const countryCode =
        regionUpper === "GB"
          ? "GBR"
          : regionUpper === "UK"
            ? "GBR"
            : regionUpper.length === 2
              ? this.twoLetterToThreeLetter(regionUpper)
              : regionUpper;

      const regionEntry = localeToCurrency[countryCode];
      if (regionEntry) {
        result = regionEntry;
        this.currencyCache.set(cacheKey, result);
        return result;
      }
    }

    // STEP 2: Use existing PRIMARY_COUNTRY mapping
    if (PRIMARY_COUNTRY[lang]) {
      const countryCode = PRIMARY_COUNTRY[lang];
      const entry = localeToCurrency[countryCode];
      if (entry) {
        result = entry;
        this.currencyCache.set(cacheKey, result);
        return result;
      }
    }

    this.currencyCache.set(cacheKey, result);
    return result;
  }

  // Helper to convert ISO 3166-1 alpha-2 to alpha-3
  private static twoLetterToThreeLetter(code: string): string {
    const mapping: Record<string, string> = {
      US: "USA",
      CA: "CAN",
      MX: "MEX",
      DE: "DEU",
      FR: "FRA",
      IT: "ITA",
      ES: "ESP",
      NL: "NLD",
      BE: "BEL",
      AT: "AUT",
      GB: "GBR",
      CH: "CHE",
      SE: "SWE",
      NO: "NOR",
      DK: "DNK",
      CN: "CHN",
      JP: "JPN",
      IN: "IND",
      KR: "KOR",
      ID: "IDN",
      BR: "BRA",
      RU: "RUS",
      UA: "UKR",
      PL: "POL",
      TR: "TUR",
      SA: "SAU",
      ZA: "ZAF",
      NG: "NGA",
      EG: "EGY",
      AR: "ARG",
      CO: "COL",
      CL: "CHL",
      PE: "PER",
      VE: "VEN",
      PH: "PHL",
      MY: "MYS",
      SG: "SGP",
      TH: "THA",
      VN: "VNM",
      PK: "PAK",
      BD: "BGD",
      IR: "IRN",
      IQ: "IRQ",
      IL: "ISR",
      LB: "LBN",
      JO: "JOR",
      AE: "ARE",
      KW: "KWT",
      QA: "QAT",
      BH: "BHR",
      OM: "OMN",
      NZ: "NZL",
      AU: "AUS",
      PT: "PRT",
      GR: "GRC",
      CZ: "CZE",
      HU: "HUN",
      RO: "ROU",
      FI: "FIN",
      IE: "IRL",
      SK: "SVK",
      SI: "SVN",
      HR: "HRV",
      RS: "SRB",
      BG: "BGR",
      LT: "LTU",
      LV: "LVA",
      EE: "EST",
      CY: "CYP",
      MT: "MLT",
      LU: "LUX",
      IS: "ISL",
      HK: "HKG",
      TW: "TWN",
    };
    return mapping[code] || code;
  }

  // Add this static cache property to your class
  private static currencyCache = new Map<string, CurrencyInfo>();

  static clearCurrencyCache(): void {
    this.currencyCache.clear();
  }
}

// ============================================================================
// PART 2: ENHANCED PLURAL RULES (CLDR-compliant)
// ============================================================================

const PLURAL_RULES: Record<string, (count: number) => PluralForm> = {
  // Germanic
  en: (n) => (n === 1 ? "one" : "other"),
  de: (n) => (n === 1 ? "one" : "other"),
  nl: (n) => (n === 1 ? "one" : "other"),
  sv: (n) => (n === 1 ? "one" : "other"),
  da: (n) => (n === 1 ? "one" : "other"),
  nb: (n) => (n === 1 ? "one" : "other"), // Norwegian Bokmål
  // Romance
  fr: (n) => (n === 0 || n === 1 ? "one" : "other"),
  es: (n) => (n === 1 ? "one" : "other"),
  it: (n) => (n === 1 ? "one" : "other"),
  pt: (n) => (n === 0 || n === 1 ? "one" : "other"),
  ro: (n) => {
    if (n === 1) return "one";
    if (n === 0 || (n % 100 >= 1 && n % 100 <= 19)) return "few";
    return "other";
  },
  // Slavic
  ru: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "few";
    return "many";
  },
  uk: (n) => {
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
  // Semitic
  ar: (n) => {
    if (n === 0) return "zero";
    if (n === 1) return "one";
    if (n === 2) return "two";
    if (n % 100 >= 3 && n % 100 <= 10) return "few";
    if (n % 100 >= 11) return "many";
    return "other";
  },
  he: (n) => {
    if (n === 1) return "one";
    if (n === 2) return "two";
    if (n >= 11 && n % 10 === 0) return "many";
    return "other";
  },
  // CJK — all are invariant
  zh: () => "other",
  ja: () => "other",
  ko: () => "other",
  // South / Southeast Asian
  hi: (n) => (n === 0 || n === 1 ? "one" : "other"),
  bn: (n) => (n === 0 || n === 1 ? "one" : "other"),
  vi: () => "other",
  th: () => "other",
  id: () => "other",
  ms: () => "other",
  // Turkic
  tr: (n) => (n === 1 ? "one" : "other"),
  // Finno-Ugric
  fi: (n) => (n === 1 ? "one" : "other"),
  hu: (n) => (n === 1 ? "one" : "other"),
  // Hellenic
  el: (n) => (n === 1 ? "one" : "other"),
  // Iranian / Iranic
  fa: () => "other",
  ur: (n) => (n === 1 ? "one" : "other"),
  // Celtic
  cy: (n) => {
    if (n === 0) return "zero";
    if (n === 1) return "one";
    if (n === 2) return "two";
    if (n === 3) return "few";
    if (n === 6) return "many";
    return "other";
  },
  ga: (n) => {
    if (n === 1) return "one";
    if (n === 2) return "two";
    if (n >= 3 && n <= 6) return "few";
    if (n >= 7 && n <= 10) return "many";
    return "other";
  },
  // Baltic
  lt: (n) => {
    const mod10 = n % 10;
    const mod100 = n % 100;
    if (mod10 === 1 && mod100 !== 11) return "one";
    if (mod10 >= 2 && mod10 <= 9 && (mod100 < 11 || mod100 > 19)) return "few";
    return "many";
  },
  lv: (n) => {
    if (n % 10 === 1 && n % 100 !== 11) return "one";
    if (n === 0 || (n % 100 >= 11 && n % 100 <= 19)) return "zero";
    return "other";
  },
  // More Slavic
  sl: (n) => {
    const mod100 = n % 100;
    if (mod100 === 1) return "one";
    if (mod100 === 2) return "two";
    if (mod100 === 3 || mod100 === 4) return "few";
    return "other";
  },
  // Other Edge Cases
  br: (n) => {
    if (n === 1) return "one";
    if (n === 2) return "two";
    if (n === 3) return "few";
    if (n === 4) return "many";
    return "other";
  },
  mt: (n) => {
    if (n === 1) return "one";
    if (n === 0 || (n % 100 >= 2 && n % 100 <= 10)) return "few";
    if (n % 100 >= 11 && n % 100 <= 19) return "many";
    return "other";
  },
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
  const langCode = language || "en";
  try {
    const pluralRules = new Intl.PluralRules(langCode);
    return pluralRules.select(Math.abs(Math.floor(count))) as PluralForm;
  } catch {
    return "other";
  }
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
  // Internal cache removed — all caching is delegated to the
  // translationCache singleton to avoid dual-cache synchronisation bugs.
  private translations: Record<string, Translations>;
  private namespaces: Record<string, NamespacedTranslations> = {};
  private fallbackLanguage: string;
  private shouldWarnMissing: boolean;
  private useICU: boolean;
  private onMissingKey?: (
    lang: string,
    key: string,
    namespace?: string,
  ) => void;

  constructor(
    translations: Record<string, Translations>,
    options: TranslationManagerOptions = {},
  ) {
    this.translations = translations;
    this.fallbackLanguage = options.fallbackLanguage || "en";
    this.shouldWarnMissing = options.shouldWarnMissing ?? true;
    this.useICU = options.useICU ?? true;
    this.onMissingKey = options.onMissingKey;
  }

  addNamespace(
    namespace: string,
    translations: Record<string, TranslationNamespace>,
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
    options?: { namespace?: string; context?: string; count?: number },
  ): string {
    const { namespace, context, count } = options || {};

    // Check the singleton cache first (single source of truth)
    const cached = translationCache.get(key, lang, params);
    if (cached) {
      return cached;
    }

    let result: string = key;

    performanceMonitor.measure(`translate:${key}`, () => {
      let translation = this.getTranslationValue(lang, key, namespace, context);

      if (context && !translation) {
        const contextKey = `${key}_${context}`;
        translation = this.getTranslationValue(lang, contextKey, namespace);
      }

      if (!translation) {
        this.handleMissingKey(lang, key, namespace);
        result = key;
        return;
      }

      if (
        typeof translation === "object" &&
        "other" in translation &&
        count !== undefined
      ) {
        result = this.translatePlural(lang, key, count, params, { namespace });
        return;
      }

      if (typeof translation === "string") {
        let finalResult = translation;

        const mergedParams =
          count !== undefined ? { ...params, count } : params;

        if (this.useICU && this.hasICUSyntax(finalResult)) {
          finalResult = ICUMessageFormat.format(
            finalResult,
            mergedParams || {},
            lang,
          );
        } else {
          finalResult = mergedParams
            ? interpolate(finalResult, mergedParams)
            : finalResult;
        }

        result = finalResult;
        return;
      }

      result = key;
    });

    // Store result in singleton cache
    translationCache.set(key, lang, params, result);

    return result;
  }

  translatePlural(
    lang: string,
    key: string,
    count: number,
    params?: Record<string, any>,
    options?: { namespace?: string },
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
    context?: string,
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
    context?: string,
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
        })`,
      );
    }
    this.onMissingKey?.(lang, key, namespace);
  }

  clearCache() {
    // Delegate to the singleton cache — the single source of truth
    translationCache.clear();
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
    namespace?: string,
  ) => void;
}) {
  const [language, setLanguage] = useState(defaultLanguage);
  const [loadedNamespaces, setLoadedNamespaces] = useState<Set<string>>(
    new Set(["main"]),
  );

  const initialMount = useRef(true);

  useEffect(() => {
    if (initialMount.current) {
      initialMount.current = false;
      return;
    }
    if (AccessibilityInfo?.announceForAccessibility) {
      try {
        AccessibilityInfo.announceForAccessibility(
          `Language changed to ${language}`,
        );
      } catch (e) {
        // Ignore errors from AccessibilityInfo
      }
    }
  }, [language]);

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
      options?: { namespace?: string; context?: string; count?: number },
    ) => {
      return manager.translate(language, key, params, options);
    },
    [language, manager],
  );

  /**
   * @deprecated Use `t(key, params, { count })` instead.
   * `tn` will be removed in a future major version.
   */
  const tn = useCallback(
    (
      key: string,
      count: number,
      params?: Record<string, any>,
      options?: { namespace?: string },
    ) => {
      return manager.translatePlural(language, key, count, params, options);
    },
    [language, manager],
  );

  const languageChangeRef = useRef<{
    version: number;
    timeoutId?: ReturnType<typeof setTimeout>;
  }>({ version: 0 });

  const changeLanguage = useCallback(
    (lang: string) => {
      if (languageChangeRef.current.timeoutId) {
        clearTimeout(languageChangeRef.current.timeoutId);
      }
      const currentVersion = ++languageChangeRef.current.version;
      setLanguage(lang);
      languageChangeRef.current.timeoutId = setTimeout(() => {
        if (languageChangeRef.current.version === currentVersion) {
          manager.clearCache();
        }
        languageChangeRef.current.timeoutId = undefined;
      }, 150);
    },
    [manager],
  );

  const loadNamespace = useCallback(
    async (namespace: string, loader: () => Promise<any>) => {
      if (loadedNamespaces.has(namespace)) return;

      try {
        const translations = await loader();
        manager.addNamespace(namespace, translations);
        setLoadedNamespaces((prev) => new Set([...prev, namespace]));
      } catch (error) {
        console.warn(`Failed to load namespace: ${namespace}`, error);
      }
    },
    [manager, loadedNamespaces],
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
    [language, t, tn, direction, changeLanguage, loadNamespace],
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
