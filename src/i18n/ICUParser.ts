import { COUNTRY_TO_CURRENCY } from "../data/LocaleData";
import CurrencyJsonList from "../data/Currency.json";
import { getPluralForm, getOrdinalForm } from "./PluralRules";
import { getNestedValue } from "./utils";

interface CurrencyInfo {
  code: string;
  symbol: string;
}

const localeToCurrency: Record<string, CurrencyInfo> = (CurrencyJsonList as any[]).reduce(
  (acc, item) => {
    const currencyCode = COUNTRY_TO_CURRENCY[item.cca3] || "USD";
    acc[item.cca3] = {
      code: currencyCode,
      symbol: item.symbol || "$",
    };
    return acc;
  },
  {} as Record<string, CurrencyInfo>
);

export class ICUMessageFormat {
  private static PLURAL_REGEX = /\{(\w+),\s*plural,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;
  private static SELECT_REGEX = /\{(\w+),\s*select,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;
  private static SELECTORDINAL_REGEX = /\{(\w+),\s*selectordinal,\s*((?:[^{}]|\{[^{}]*\})*)\}/g;
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
    result = result.replace(this.SELECTORDINAL_REGEX, (match, variable, options) => {
      const count = Number(params[variable] ?? 0);
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

  private static handlePlural(
    options: string,
    count: number,
    language: string,
    params: Record<string, any>
  ): string {
    const cases = this.parseOptions(options);
    const pluralForm = getPluralForm(language, count);

    const exactKey = `=${count}`;
    if (cases[exactKey]) {
      return this.replacePoundSign(cases[exactKey], count, params);
    }

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
    const parts = expression.split(",").map((s) => s.trim());
    const variable = parts[0];
    const type = parts[1];
    const format = parts[2];

    const value = getNestedValue(params, variable);

    if (value === null || value === undefined) return `{${expression}}`;

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

  public static formatNumber(
    value: any,
    format?: string,
    language: string = "en"
  ): string {
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
    } catch {
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
    } catch {
      return date.toLocaleString("en-US");
    }
  }

  public static getCurrencyForLanguage(language: string): CurrencyInfo {
    const defaultCurrency: CurrencyInfo = { code: "USD", symbol: "$" };

    if (!language || typeof language !== "string") {
      return defaultCurrency;
    }

    const normalized = language.toLowerCase().replace(/_/g, "-");
    const [lang, region] = normalized.split("-");

    const cacheKey = `${lang}-${region || ""}`;
    if (this.currencyCache.has(cacheKey)) {
      return this.currencyCache.get(cacheKey)!;
    }

    let result = defaultCurrency;

    if (region) {
      const regionUpper = region.toUpperCase();
      const countryCode =
        regionUpper === "GB" || regionUpper === "UK"
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

    if ((PRIMARY_COUNTRY as Record<string, string>)[lang]) {
      const countryCode = (PRIMARY_COUNTRY as Record<string, string>)[lang];
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
    };
    return mapping[code] || code;
  }

  private static currencyCache = new Map<string, CurrencyInfo>();
}

// Re-export PRIMARY_COUNTRY for internal use if needed
const PRIMARY_COUNTRY: Record<string, string> = {
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
