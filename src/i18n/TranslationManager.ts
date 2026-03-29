import { translationCache } from "../PerformanceOptimizations";
import { ICUMessageFormat } from "./ICUParser";
import { getPluralForm } from "./PluralRules";
import { getNestedValue, interpolate } from "./utils";

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

interface TranslationNamespace {
  [key: string]: any;
}

interface NamespacedTranslations {
  [namespace: string]: TranslationNamespace;
}

interface TranslationManagerOptions {
  fallbackLanguage?: string;
  shouldWarnMissing?: boolean;
  useICU?: boolean;
  onMissingKey?: (lang: string, key: string, namespace?: string) => void;
}

export class TranslationManager {
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

    const cached = translationCache.get(key, lang, params);
    if (cached) {
      return cached;
    }

    let result: string = key;
    let translation = this.getTranslationValue(lang, key, namespace, context);

    if (context && !translation) {
      const contextKey = `${key}_${context}`;
      translation = this.getTranslationValue(lang, contextKey, namespace);
    }

    if (!translation) {
      this.handleMissingKey(lang, key, namespace);
      result = key;
    } else if (
      typeof translation === "object" &&
      "other" in (translation as any) &&
      count !== undefined
    ) {
      result = this.translatePlural(lang, key, count, params, { namespace });
    } else if (typeof translation === "string") {
      let finalResult = translation;

      const mergedParams =
        count !== undefined ? { ...params, count } : params;

      if (this.useICU && this.hasICUSyntax(finalResult)) {
        finalResult = ICUMessageFormat.format(
          finalResult,
          mergedParams || {},
          lang
        );
      } else {
        finalResult = mergedParams
          ? interpolate(finalResult, mergedParams)
          : finalResult;
      }

      result = finalResult;
    } else {
      result = key;
    }

    translationCache.set(key, lang, params, result);
    return result;
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
    const text = (translation as PluralTranslation)[pluralForm] ?? (translation as PluralTranslation).other ?? key;

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
    translationCache.clear();
  }
}
