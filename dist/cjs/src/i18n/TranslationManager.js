"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TranslationManager = void 0;
const PerformanceOptimizations_1 = require("../PerformanceOptimizations");
const ICUParser_1 = require("./ICUParser");
const PluralRules_1 = require("./PluralRules");
const utils_1 = require("./utils");
class TranslationManager {
    constructor(translations, options = {}) {
        var _a, _b;
        this.namespaces = {};
        this.translations = translations;
        this.fallbackLanguage = options.fallbackLanguage || "en";
        this.shouldWarnMissing = (_a = options.shouldWarnMissing) !== null && _a !== void 0 ? _a : true;
        this.useICU = (_b = options.useICU) !== null && _b !== void 0 ? _b : true;
        this.onMissingKey = options.onMissingKey;
    }
    addNamespace(namespace, translations) {
        if (!this.namespaces[namespace]) {
            this.namespaces[namespace] = translations;
        }
        this.clearCache();
    }
    translate(lang, key, params, options) {
        const { namespace, context, count } = options || {};
        const cached = PerformanceOptimizations_1.translationCache.get(key, lang, params);
        if (cached) {
            return cached;
        }
        let result = key;
        let translation = this.getTranslationValue(lang, key, namespace, context);
        if (context && !translation) {
            const contextKey = `${key}_${context}`;
            translation = this.getTranslationValue(lang, contextKey, namespace);
        }
        if (!translation) {
            this.handleMissingKey(lang, key, namespace);
            result = key;
        }
        else if (typeof translation === "object" &&
            "other" in translation &&
            count !== undefined) {
            result = this.translatePlural(lang, key, count, params, { namespace });
        }
        else if (typeof translation === "string") {
            let finalResult = translation;
            const mergedParams = count !== undefined ? { ...params, count } : params;
            if (this.useICU && this.hasICUSyntax(finalResult)) {
                finalResult = ICUParser_1.ICUMessageFormat.format(finalResult, mergedParams || {}, lang);
            }
            else {
                finalResult = mergedParams
                    ? (0, utils_1.interpolate)(finalResult, mergedParams)
                    : finalResult;
            }
            result = finalResult;
        }
        else {
            result = key;
        }
        PerformanceOptimizations_1.translationCache.set(key, lang, params, result);
        return result;
    }
    translatePlural(lang, key, count, params, options) {
        var _a, _b;
        const translation = this.getTranslationValue(lang, key, options === null || options === void 0 ? void 0 : options.namespace);
        if (typeof translation === "string") {
            const allParams = { ...params, count };
            return this.useICU && this.hasICUSyntax(translation)
                ? ICUParser_1.ICUMessageFormat.format(translation, allParams, lang)
                : (0, utils_1.interpolate)(translation, allParams);
        }
        if (!translation ||
            typeof translation !== "object" ||
            !("other" in translation)) {
            this.handleMissingKey(lang, key, options === null || options === void 0 ? void 0 : options.namespace);
            return key;
        }
        const pluralForm = (0, PluralRules_1.getPluralForm)(lang, count);
        const text = (_b = (_a = translation[pluralForm]) !== null && _a !== void 0 ? _a : translation.other) !== null && _b !== void 0 ? _b : key;
        const allParams = { ...params, count };
        return this.useICU && this.hasICUSyntax(text)
            ? ICUParser_1.ICUMessageFormat.format(text, allParams, lang)
            : (0, utils_1.interpolate)(text, allParams);
    }
    hasICUSyntax(text) {
        return (/\{[^}]+,\s*(plural|select|selectordinal|number|date)\s*,/.test(text) ||
            /\{[^}]+,\s*(plural|select|selectordinal)\s+\}/.test(text));
    }
    getTranslationValue(lang, key, namespace, context) {
        var _a;
        if (namespace && ((_a = this.namespaces[namespace]) === null || _a === void 0 ? void 0 : _a[lang])) {
            const value = (0, utils_1.getNestedValue)(this.namespaces[namespace][lang], key);
            if (value)
                return value;
        }
        let langTranslations = this.translations[lang];
        let value = langTranslations ? (0, utils_1.getNestedValue)(langTranslations, key) : null;
        if (!value && lang !== this.fallbackLanguage) {
            langTranslations = this.translations[this.fallbackLanguage];
            value = langTranslations ? (0, utils_1.getNestedValue)(langTranslations, key) : null;
        }
        return value;
    }
    handleMissingKey(lang, key, namespace) {
        var _a;
        if (this.shouldWarnMissing) {
            console.warn(`[i18n] Missing translation: "${key}" (lang: ${lang}${namespace ? `, namespace: ${namespace}` : ""})`);
        }
        (_a = this.onMissingKey) === null || _a === void 0 ? void 0 : _a.call(this, lang, key, namespace);
    }
    clearCache() {
        PerformanceOptimizations_1.translationCache.clear();
    }
}
exports.TranslationManager = TranslationManager;
