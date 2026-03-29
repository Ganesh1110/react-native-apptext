"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ICUMessageFormat = void 0;
const LocaleData_1 = require("../data/LocaleData");
const Currency_json_1 = __importDefault(require("../data/Currency.json"));
const PluralRules_1 = require("./PluralRules");
const utils_1 = require("./utils");
const localeToCurrency = Currency_json_1.default.reduce((acc, item) => {
    const currencyCode = LocaleData_1.COUNTRY_TO_CURRENCY[item.cca3] || "USD";
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
        const pluralForm = (0, PluralRules_1.getPluralForm)(language, count);
        const exactKey = `=${count}`;
        if (cases[exactKey]) {
            return this.replacePoundSign(cases[exactKey], count, params);
        }
        const caseValue = cases[pluralForm] || cases["other"] || "";
        return this.replacePoundSign(caseValue, count, params);
    }
    static handleSelectOrdinal(options, count, language, params) {
        const cases = this.parseOptions(options);
        const ordinalForm = (0, PluralRules_1.getOrdinalForm)(language, count);
        const caseValue = cases[ordinalForm] || cases["other"] || "";
        return this.replacePoundSign(caseValue, count, params);
    }
    static handleSelect(options, value, params) {
        const cases = this.parseOptions(options);
        const key = String(value !== null && value !== void 0 ? value : "other");
        return cases[key] || cases["other"] || "";
    }
    static handleVariable(expression, params, language) {
        const parts = expression.split(",").map((s) => s.trim());
        const variable = parts[0];
        const type = parts[1];
        const format = parts[2];
        const value = (0, utils_1.getNestedValue)(params, variable);
        if (value === null || value === undefined)
            return `{${expression}}`;
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
        catch (_a) {
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
            catch (_b) {
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
        catch (_a) {
            return date.toLocaleString("en-US");
        }
    }
    static getCurrencyForLanguage(language) {
        const defaultCurrency = { code: "USD", symbol: "$" };
        if (!language || typeof language !== "string") {
            return defaultCurrency;
        }
        const normalized = language.toLowerCase().replace(/_/g, "-");
        const [lang, region] = normalized.split("-");
        const cacheKey = `${lang}-${region || ""}`;
        if (this.currencyCache.has(cacheKey)) {
            return this.currencyCache.get(cacheKey);
        }
        let result = defaultCurrency;
        if (region) {
            const regionUpper = region.toUpperCase();
            const countryCode = regionUpper === "GB" || regionUpper === "UK"
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
        };
        return mapping[code] || code;
    }
}
exports.ICUMessageFormat = ICUMessageFormat;
ICUMessageFormat.PLURAL_REGEX = /\{(\w+),\s*plural,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;
ICUMessageFormat.SELECT_REGEX = /\{(\w+),\s*select,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;
ICUMessageFormat.SELECTORDINAL_REGEX = /\{(\w+),\s*selectordinal,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;
ICUMessageFormat.VARIABLE_REGEX = /\{([^}]+)\}/g;
ICUMessageFormat.currencyCache = new Map();
// Re-export PRIMARY_COUNTRY for internal use if needed
const PRIMARY_COUNTRY = {
    ar: "EGY",
    bn: "BGD",
    zh: "CHN",
    da: "DNK",
    nl: "NLD",
    en: "USA",
    fr: "FRA",
    de: "DEU",
    el: "GRC",
    hi: "IND",
    id: "IDN",
    it: "ITA",
    ja: "JPN",
    ko: "KOR",
    ms: "MYS",
    nb: "NOR",
    pl: "POL",
    pt: "BRA",
    ru: "RUS",
    es: "ESP",
    sv: "SWE",
    th: "THA",
    tr: "TUR",
    uk: "UKR",
    vi: "VNM",
};
