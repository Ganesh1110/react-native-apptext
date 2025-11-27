import React, { useContext, useState, useCallback, useMemo, useEffect, } from "react";
import { LocaleContext } from "./types";
import { translationCache, performanceMonitor, } from "./PerformanceOptimizations";
import CurrencyJsonList from "../src/data/Currency.json";
// ============================================================================
// PART 1: ICU MESSAGE FORMAT PARSER
// ============================================================================
// Mapping of country codes (cca3) to actual ISO 4217 currency codes
const COUNTRY_TO_CURRENCY = {
    USA: "USD",
    CAN: "CAD",
    MEX: "MXN",
    // European Union (Euro)
    DEU: "EUR",
    FRA: "EUR",
    ITA: "EUR",
    ESP: "EUR",
    NLD: "EUR",
    BEL: "EUR",
    AUT: "EUR",
    GRC: "EUR",
    PRT: "EUR",
    FIN: "EUR",
    LUX: "EUR",
    SVN: "EUR",
    SVK: "EUR",
    EST: "EUR",
    LVA: "EUR",
    LTU: "EUR",
    MLT: "EUR",
    CYP: "EUR",
    IRL: "EUR",
    HRV: "EUR",
    AND: "EUR",
    MCO: "EUR",
    SMR: "EUR",
    VAT: "EUR",
    MNE: "EUR",
    UNK: "EUR", // Kosovo
    BLM: "EUR",
    GLP: "EUR",
    MAF: "EUR",
    MTQ: "EUR",
    REU: "EUR",
    SPM: "EUR",
    MYT: "EUR",
    ATF: "EUR",
    BES: "EUR",
    // Asia
    CHN: "CNY",
    JPN: "JPY",
    IND: "INR",
    KOR: "KRW",
    IDN: "IDR",
    THA: "THB",
    MYS: "MYR",
    SGP: "SGD",
    PHL: "PHP",
    VNM: "VND",
    BGD: "BDT",
    PAK: "PKR",
    LKA: "LKR",
    NPL: "NPR",
    AFG: "AFN",
    MMR: "MMK",
    KHM: "KHR",
    LAO: "LAK",
    BTN: "BTN",
    MDV: "MVR",
    TWN: "TWD",
    HKG: "HKD",
    MAC: "MOP",
    MNG: "MNT",
    PRK: "KPW",
    // Middle East
    SAU: "SAR",
    ARE: "AED",
    ISR: "ILS",
    TUR: "TRY",
    IRN: "IRR",
    IRQ: "IQD",
    JOR: "JOD",
    KWT: "KWT",
    OMN: "OMR",
    QAT: "QAR",
    BHR: "BHR",
    YEM: "YER",
    SYR: "SYP",
    LBN: "LBP",
    PSE: "ILS",
    // Oceania
    AUS: "AUD",
    NZL: "NZL",
    FJI: "FJD",
    PNG: "PGK",
    SLB: "SBD",
    VUT: "VUV",
    NCL: "XPF",
    PYF: "XPF",
    WLF: "XPF",
    WSM: "WST",
    TON: "TOP",
    KIR: "AUD",
    TUV: "AUD",
    NRU: "AUD",
    PLW: "USD",
    FSM: "USD",
    MHL: "USD",
    COK: "NZD",
    NIU: "NZD",
    TKL: "NZD",
    // Africa
    ZAF: "ZAR",
    EGY: "EGP",
    NGA: "NGN",
    KEN: "KES",
    GHA: "GHS",
    ETH: "ETB",
    TZA: "TZS",
    UGA: "UGX",
    DZA: "DZD",
    MAR: "MAD",
    AGO: "AOA",
    SDN: "SDG",
    TUN: "TND",
    LBY: "LYD",
    CMR: "XAF",
    CIV: "XOF",
    SEN: "XOF",
    MLI: "XOF",
    BFA: "XOF",
    NER: "XOF",
    TGO: "XOF",
    BEN: "XOF",
    GIN: "GNF",
    RWA: "RWF",
    SOM: "SOS",
    ZWE: "ZWL",
    ZMB: "ZMW",
    MWI: "MWK",
    MOZ: "MZN",
    BWA: "BWP",
    NAM: "NAD",
    LSO: "LSL",
    SWZ: "SZL",
    MDG: "MGA",
    MUS: "MUR",
    SYC: "SCR",
    COM: "KMF",
    DJI: "DJF",
    ERI: "ERN",
    SSD: "SSP",
    CAF: "XAF",
    TCD: "XAF",
    COG: "XAF",
    GAB: "XAF",
    GNQ: "XAF",
    COD: "CDF",
    BDI: "BIF",
    GMB: "GMD",
    SLE: "SLL",
    LBR: "LRD",
    MRT: "MRU",
    CPV: "CVE",
    STP: "STN",
    GNB: "XOF",
    ESH: "MAD",
    // South America
    BRA: "BRL",
    ARG: "ARS",
    CHL: "CLP",
    COL: "COP",
    PER: "PEN",
    VEN: "VES",
    ECU: "USD",
    BOL: "BOB",
    PRY: "PYG",
    URY: "UYU",
    GUY: "GYD",
    SUR: "SRD",
    GUF: "EUR",
    // Central America & Caribbean
    CRI: "CRC",
    PAN: "PAB",
    GTM: "GTQ",
    HND: "HNL",
    NIC: "NIO",
    SLV: "USD",
    BLZ: "BZD",
    CUB: "CUP",
    DOM: "DOP",
    HTI: "HTG",
    JAM: "JMD",
    TTO: "TTD",
    BHS: "BSD",
    BRB: "BBD",
    ATG: "XCD",
    DMA: "XCD",
    GRD: "XCD",
    KNA: "XCD",
    LCA: "XCD",
    VCT: "XCD",
    AIA: "XCD",
    MSR: "XCD",
    VGB: "USD",
    CYM: "KYD",
    TCA: "USD",
    BMU: "BMD",
    PRI: "USD",
    VIR: "USD",
    GUM: "USD",
    ASM: "USD",
    MNP: "USD",
    UMI: "USD",
    IOT: "USD",
    // Europe (non-EU)
    CHE: "CHF",
    GBR: "GBP",
    NOR: "NOK",
    SWE: "SEK",
    DNK: "DKK",
    ISL: "ISK",
    POL: "PLN",
    CZE: "CZK",
    HUN: "HUF",
    ROU: "RON",
    BGR: "BGN",
    RUS: "RUB",
    UKR: "UAH",
    BLR: "BYN",
    MDA: "MDL",
    SRB: "RSD",
    BIH: "BAM",
    ALB: "ALL",
    MKD: "MKD",
    KAZ: "KZT",
    UZB: "UZS",
    TKM: "TMT",
    TJK: "TJS",
    KGZ: "KGS",
    ARM: "AMD",
    AZE: "AZN",
    GEO: "GEL",
    LIE: "CHF",
    FRO: "DKK",
    GIB: "GIP",
    GGY: "GBP",
    JEY: "GBP",
    IMN: "GBP",
    SJM: "NOK",
    ALA: "EUR",
    GRL: "DKK",
    ABW: "AWG",
    CUW: "ANG",
    SXM: "ANG",
    TLS: "USD",
    PCN: "NZD",
    SHN: "SHP",
    FLK: "FKP",
    SGS: "GBP",
    NFK: "AUD",
    CCK: "AUD",
    CXR: "AUD",
    HMD: "AUD",
    BVT: "NOK",
    ATA: "USD",
};
const PRIMARY_COUNTRY = {
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
// Convert Currency.json to a usable map
const localeToCurrency = CurrencyJsonList.reduce((acc, item) => {
    const currencyCode = COUNTRY_TO_CURRENCY[item.cca3] || "USD";
    acc[item.cca3] = {
        code: currencyCode,
        symbol: item.symbol || "$",
    };
    return acc;
}, {});
class ICUMessageFormat {
    static format(message, params, language) {
        let result = message;
        // 1. Handle plural formatting
        result = result.replace(this.PLURAL_REGEX, (match, variable, options) => {
            var _a;
            const count = Number((_a = params[variable]) !== null && _a !== void 0 ? _a : 0);
            return this.handlePlural(options, count, language, params);
        });
        // 2. Handle selectordinal
        result = result.replace(this.SELECTORDINAL_REGEX, (match, variable, options) => {
            var _a;
            const count = Number((_a = params[variable]) !== null && _a !== void 0 ? _a : 0);
            return this.handleSelectOrdinal(options, count, language, params);
        });
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
    static handlePlural(options, count, language, params) {
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
    static handleSelectOrdinal(options, count, language, params) {
        const cases = this.parseOptions(options);
        const ordinalForm = getOrdinalForm(language, count);
        const caseValue = cases[ordinalForm] || cases["other"] || "";
        return this.replacePoundSign(caseValue, count, params);
    }
    static handleSelect(options, value, params) {
        const cases = this.parseOptions(options);
        const key = String(value !== null && value !== void 0 ? value : "other");
        return cases[key] || cases["other"] || "";
    }
    static handleVariable(expression, params, language) {
        // Support formatting: {price, number, currency}
        const parts = expression.split(",").map((s) => s.trim());
        const variable = parts[0];
        const type = parts[1];
        const format = parts[2];
        const value = getNestedValue(params, variable);
        if (value === null || value === undefined)
            return `{${expression}}`;
        // Apply formatting if specified
        if (type === "number") {
            return this.formatNumber(value, format, language);
        }
        else if (type === "date") {
            return this.formatDate(value, format, language);
        }
        return String(value);
    }
    static parseOptions(optionsStr) {
        const cases = {};
        const regex = /(=?\w+)\s*\{([^}]*(?:\{[^}]*\}[^}]*)*)\}/g;
        let match;
        while ((match = regex.exec(optionsStr)) !== null) {
            const key = match[1].trim();
            const value = match[2].trim();
            cases[key] = value;
        }
        return cases;
    }
    static replacePoundSign(text, count, params) {
        return text.replace(/#/g, String(count)).replace(/\{(\w+)\}/g, (_, key) => {
            var _a;
            return String((_a = params[key]) !== null && _a !== void 0 ? _a : `{${key}}`);
        });
    }
    static formatNumber(value, format, language = "en") {
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
            }
            else if (format === "percent") {
                return new Intl.NumberFormat(language, {
                    style: "percent",
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                }).format(num);
            }
            else {
                return new Intl.NumberFormat(language, {
                    minimumFractionDigits: 0,
                    maximumFractionDigits: 2,
                }).format(num);
            }
        }
        catch (error) {
            // Silent fallback for production
            try {
                return new Intl.NumberFormat("en-US", {
                    style: format === "currency"
                        ? "currency"
                        : format === "percent"
                            ? "percent"
                            : "decimal",
                    currency: "USD",
                }).format(num);
            }
            catch (_a) {
                return String(value);
            }
        }
    }
    static formatDate(value, format, language = "en") {
        const date = new Date(value);
        if (isNaN(date.getTime()))
            return String(value);
        try {
            if (format === "short") {
                return date.toLocaleDateString(language);
            }
            else if (format === "long") {
                return date.toLocaleDateString(language, {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                });
            }
            return date.toLocaleString(language);
        }
        catch (error) {
            return date.toLocaleString("en-US");
        }
    }
    static getCurrencyForLanguage(language) {
        const defaultCurrency = { code: "USD", symbol: "$" };
        if (!language || typeof language !== "string") {
            return defaultCurrency;
        }
        // Normalize language code
        const normalized = language.toLowerCase().replace(/_/g, "-");
        const [lang, region] = normalized.split("-");
        // Cache for frequently used currencies
        const cacheKey = `${lang}-${region || ""}`;
        if (this.currencyCache.has(cacheKey)) {
            return this.currencyCache.get(cacheKey);
        }
        let result = defaultCurrency;
        // STEP 1: Try exact region match (highest priority)
        if (region) {
            const regionUpper = region.toUpperCase();
            // Handle special cases
            const countryCode = regionUpper === "GB"
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
    static twoLetterToThreeLetter(code) {
        const mapping = {
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
            // Add more as needed
        };
        return mapping[code] || code;
    }
}
ICUMessageFormat.PLURAL_REGEX = /\{(\w+),\s*plural,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;
ICUMessageFormat.SELECT_REGEX = /\{(\w+),\s*select,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;
ICUMessageFormat.SELECTORDINAL_REGEX = /\{(\w+),\s*selectordinal,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;
ICUMessageFormat.VARIABLE_REGEX = /\{([^}]+)\}/g;
// Add this static cache property to your class
ICUMessageFormat.currencyCache = new Map();
// ============================================================================
// PART 2: ENHANCED PLURAL RULES (CLDR-compliant)
// ============================================================================
const PLURAL_RULES = {
    en: (n) => (n === 1 ? "one" : "other"),
    fr: (n) => (n === 0 || n === 1 ? "one" : "other"),
    ar: (n) => {
        if (n === 0)
            return "zero";
        if (n === 1)
            return "one";
        if (n === 2)
            return "two";
        if (n % 100 >= 3 && n % 100 <= 10)
            return "few";
        if (n % 100 >= 11)
            return "many";
        return "other";
    },
    ru: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11)
            return "one";
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
            return "few";
        return "many";
    },
    pl: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (n === 1)
            return "one";
        if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
            return "few";
        return "many";
    },
    cs: (n) => {
        if (n === 1)
            return "one";
        if (n >= 2 && n <= 4)
            return "few";
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
const ORDINAL_RULES = {
    en: (n) => {
        const mod10 = n % 10;
        const mod100 = n % 100;
        if (mod10 === 1 && mod100 !== 11)
            return "one";
        if (mod10 === 2 && mod100 !== 12)
            return "two";
        if (mod10 === 3 && mod100 !== 13)
            return "few";
        return "other";
    },
    es: (n) => "other",
    ar: (n) => "other",
};
function getPluralForm(language, count) {
    if (typeof count !== "number" || !isFinite(count)) {
        count = 0;
    }
    const langCode = (language === null || language === void 0 ? void 0 : language.split("-")[0]) || "en";
    const rule = PLURAL_RULES[langCode] || PLURAL_RULES.en;
    return rule(Math.abs(Math.floor(count)));
}
function getOrdinalForm(language, count) {
    const langCode = (language === null || language === void 0 ? void 0 : language.split("-")[0]) || "en";
    const rule = ORDINAL_RULES[langCode];
    if (!rule)
        return "other";
    return rule(Math.abs(Math.floor(count)));
}
// ============================================================================
// PART 3: INTERPOLATION & FORMATTING
// ============================================================================
function interpolate(text, params = {}) {
    return text.replace(/\{\{([^}]+)\}\}/g, (match, key) => {
        const trimmedKey = key.trim();
        const value = getNestedValue(params, trimmedKey);
        if (value === null || value === undefined)
            return match;
        if (typeof value === "object") {
            console.warn(`Cannot interpolate object for key: ${trimmedKey}`);
            return match;
        }
        return String(value);
    });
}
function getNestedValue(obj, path) {
    if (!obj || typeof obj !== "object")
        return undefined;
    if (!path || typeof path !== "string")
        return undefined;
    return path.split(".").reduce((current, key) => {
        return current === null || current === void 0 ? void 0 : current[key];
    }, obj);
}
class TranslationManager {
    constructor(translations, options = {}) {
        var _a, _b;
        this.cache = new Map();
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
        // Check performance cache first
        const cached = translationCache.get(key, lang, params);
        if (cached) {
            return cached;
        }
        // Measure performance
        let result = key;
        performanceMonitor.measure(`translate:${key}`, () => {
            const cacheKey = this.buildCacheKey(lang, key, params, namespace, context);
            if (this.cache.has(cacheKey)) {
                result = this.cache.get(cacheKey);
                return;
            }
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
            if (typeof translation === "object" &&
                "other" in translation &&
                count !== undefined) {
                result = this.translatePlural(lang, key, count, params, { namespace });
                return;
            }
            if (typeof translation === "string") {
                let finalResult = translation;
                const mergedParams = count !== undefined ? { ...params, count } : params;
                if (this.useICU && this.hasICUSyntax(finalResult)) {
                    finalResult = ICUMessageFormat.format(finalResult, mergedParams || {}, lang);
                }
                else {
                    finalResult = mergedParams
                        ? interpolate(finalResult, mergedParams)
                        : finalResult;
                }
                this.cache.set(cacheKey, finalResult);
                result = finalResult;
                return;
            }
            result = key;
        });
        // Store in performance cache
        translationCache.set(key, lang, params, result);
        return result;
    }
    translatePlural(lang, key, count, params, options) {
        var _a, _b;
        const translation = this.getTranslationValue(lang, key, options === null || options === void 0 ? void 0 : options.namespace);
        if (typeof translation === "string") {
            const allParams = { ...params, count };
            return this.useICU && this.hasICUSyntax(translation)
                ? ICUMessageFormat.format(translation, allParams, lang)
                : interpolate(translation, allParams);
        }
        if (!translation ||
            typeof translation !== "object" ||
            !("other" in translation)) {
            this.handleMissingKey(lang, key, options === null || options === void 0 ? void 0 : options.namespace);
            return key;
        }
        const pluralForm = getPluralForm(lang, count);
        const text = (_b = (_a = translation[pluralForm]) !== null && _a !== void 0 ? _a : translation.other) !== null && _b !== void 0 ? _b : key;
        const allParams = { ...params, count };
        return this.useICU && this.hasICUSyntax(text)
            ? ICUMessageFormat.format(text, allParams, lang)
            : interpolate(text, allParams);
    }
    hasICUSyntax(text) {
        return (/\{[^}]+,\s*(plural|select|selectordinal|number|date)\s*,/.test(text) ||
            /\{[^}]+,\s*(plural|select|selectordinal)\s+\}/.test(text));
    }
    getTranslationValue(lang, key, namespace, context) {
        var _a;
        if (namespace && ((_a = this.namespaces[namespace]) === null || _a === void 0 ? void 0 : _a[lang])) {
            const value = getNestedValue(this.namespaces[namespace][lang], key);
            if (value)
                return value;
        }
        let langTranslations = this.translations[lang];
        let value = langTranslations ? getNestedValue(langTranslations, key) : null;
        if (!value && lang !== this.fallbackLanguage) {
            langTranslations = this.translations[this.fallbackLanguage];
            value = langTranslations ? getNestedValue(langTranslations, key) : null;
        }
        return value;
    }
    buildCacheKey(lang, key, params, namespace, context) {
        const parts = [lang, namespace || "main", key];
        if (context)
            parts.push(context);
        if (params)
            parts.push(JSON.stringify(params));
        return parts.join(":");
    }
    handleMissingKey(lang, key, namespace) {
        var _a;
        if (this.shouldWarnMissing) {
            console.warn(`[i18n] Missing translation: "${key}" (lang: ${lang}${namespace ? `, namespace: ${namespace}` : ""})`);
        }
        (_a = this.onMissingKey) === null || _a === void 0 ? void 0 : _a.call(this, lang, key, namespace);
    }
    clearCache() {
        this.cache.clear();
    }
}
// ============================================================================
// PART 6: LOCALE PROVIDER (Enhanced)
// ============================================================================
export function LocaleProvider({ translations, defaultLanguage, fallbackLanguage = "en", useICU = true, onMissingTranslation, children, }) {
    const [language, setLanguage] = useState(defaultLanguage);
    const [loadedNamespaces, setLoadedNamespaces] = useState(new Set(["main"]));
    const RTL_LANGUAGES = ["ar", "he", "fa", "ur"];
    const direction = useMemo(() => {
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
    const t = useCallback((key, params, options) => {
        return manager.translate(language, key, params, options);
    }, [language, manager]);
    const tn = useCallback((key, count, params, options) => {
        return manager.translatePlural(language, key, count, params, options);
    }, [language, manager]);
    const changeLanguage = useCallback((lang) => {
        setLanguage(lang);
        manager.clearCache();
    }, [manager]);
    const loadNamespace = useCallback(async (namespace, loader) => {
        if (loadedNamespaces.has(namespace))
            return;
        try {
            const translations = await loader();
            manager.addNamespace(namespace, translations);
            setLoadedNamespaces((prev) => new Set([...prev, namespace]));
        }
        catch (error) {
            console.error(`Failed to load namespace: ${namespace}`, error);
        }
    }, [manager, loadedNamespaces]);
    const value = useMemo(() => ({
        language,
        t,
        tn,
        direction,
        changeLanguage,
        loadNamespace,
    }), [language, t, tn, direction, changeLanguage, loadNamespace]);
    return (<LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>);
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
export function useNamespace(namespace, loader) {
    const { loadNamespace } = useLang();
    useEffect(() => {
        loadNamespace(namespace, loader);
    }, [namespace, loader, loadNamespace]);
}
// Export utilities
export { TranslationManager, interpolate, getNestedValue, getPluralForm, PLURAL_RULES, };
