/**
 * Enhanced number formatting with caching and advanced options
 */

interface NumberFormatterOptions {
  style?: "decimal" | "currency" | "percent" | "unit";
  currency?: string;
  currencyDisplay?: "symbol" | "narrowSymbol" | "code" | "name";
  unit?: string;
  unitDisplay?: "short" | "narrow" | "long";
  minimumIntegerDigits?: number;
  minimumFractionDigits?: number;
  maximumFractionDigits?: number;
  minimumSignificantDigits?: number;
  maximumSignificantDigits?: number;
  notation?: "standard" | "scientific" | "engineering" | "compact";
  compactDisplay?: "short" | "long";
  signDisplay?: "auto" | "never" | "always" | "exceptZero";
  useGrouping?: boolean;
  roundingMode?: "ceil" | "floor" | "expand" | "trunc" | "halfExpand";
}

export class NumberFormatter {
  private static cache = new Map<string, Intl.NumberFormat>();
  private static maxCacheSize = 100;

  /**
   * Format a number with advanced options and caching
   */
  static format(
    value: number,
    locale: string,
    options: NumberFormatterOptions = {}
  ): string {
    // Validate input
    if (typeof value !== "number" || !isFinite(value)) {
      return String(value);
    }

    try {
      if (typeof Intl === "undefined" || !Intl.NumberFormat) {
        return this.fallbackFormat(value, options);
      }

      // Create cache key
      const cacheKey = this.createCacheKey(locale, options);

      // Get or create formatter
      let formatter = this.cache.get(cacheKey);
      if (!formatter) {
        formatter = this.createFormatter(locale, options);

        // Cache management
        if (this.cache.size >= this.maxCacheSize) {
          this.evictOldestCacheEntry();
        }

        this.cache.set(cacheKey, formatter);
      }

      return formatter.format(value);
    } catch (error) {
      console.error("Number formatting error:", error);
      return this.fallbackFormat(value, options);
    }
  }

  /**
   * Create an Intl.NumberFormat instance
   */
  private static createFormatter(
    locale: string,
    options: NumberFormatterOptions
  ): Intl.NumberFormat {
    const intlOptions: Intl.NumberFormatOptions = { ...options };

    // Handle special cases
    if (options.style === "currency" && !options.currency) {
      intlOptions.currency = "USD";
    }

    return new Intl.NumberFormat(locale, intlOptions);
  }

  /**
   * Create a cache key from locale and options
   */
  private static createCacheKey(
    locale: string,
    options: NumberFormatterOptions
  ): string {
    const sortedOptions = Object.keys(options)
      .sort()
      .map((key) => `${key}:${options[key as keyof NumberFormatterOptions]}`)
      .join("|");

    return `${locale}|${sortedOptions}`;
  }

  /**
   * Evict the oldest cache entry safely
   */
  private static evictOldestCacheEntry(): void {
    const firstKey = this.cache.keys().next().value;
    if (firstKey !== undefined) {
      this.cache.delete(firstKey);
    }
  }

  /**
   * Fallback formatting when Intl is not available
   */
  private static fallbackFormat(
    value: number,
    options: NumberFormatterOptions
  ): string {
    // Simple fallback formatting
    if (options.style === "currency") {
      const symbol =
        options.currency === "EUR"
          ? "€"
          : options.currency === "GBP"
          ? "£"
          : options.currency === "JPY"
          ? "¥"
          : "$";
      return `${symbol}${value.toFixed(options.minimumFractionDigits || 2)}`;
    } else if (options.style === "percent") {
      return `${(value * 100).toFixed(options.maximumFractionDigits || 2)}%`;
    } else if (options.notation === "compact") {
      return this.compactFallback(value);
    } else {
      return value.toLocaleString();
    }
  }

  /**
   * Compact number fallback (1K, 1M, 1B)
   */
  private static compactFallback(value: number): string {
    const absValue = Math.abs(value);
    const sign = value < 0 ? "-" : "";

    if (absValue >= 1e9) {
      return `${sign}${(absValue / 1e9).toFixed(1)}B`;
    } else if (absValue >= 1e6) {
      return `${sign}${(absValue / 1e6).toFixed(1)}M`;
    } else if (absValue >= 1e3) {
      return `${sign}${(absValue / 1e3).toFixed(1)}K`;
    } else {
      return String(value);
    }
  }

  /**
   * Format currency with smart defaults
   */
  static formatCurrency(
    value: number,
    locale: string,
    currency: string = "USD",
    options: Partial<NumberFormatterOptions> = {}
  ): string {
    return this.format(value, locale, {
      style: "currency",
      currency,
      currencyDisplay: "symbol",
      ...options,
    });
  }

  /**
   * Format percentage
   */
  static formatPercent(
    value: number,
    locale: string,
    options: Partial<NumberFormatterOptions> = {}
  ): string {
    return this.format(value, locale, {
      style: "percent",
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
      ...options,
    });
  }

  /**
   * Format compact number (1.2K, 3.4M, etc.)
   */
  static formatCompact(
    value: number,
    locale: string,
    options: Partial<NumberFormatterOptions> = {}
  ): string {
    return this.format(value, locale, {
      notation: "compact",
      compactDisplay: "short",
      ...options,
    });
  }

  /**
   * Format unit (e.g., 5 km, 3 hours)
   */
  static formatUnit(
    value: number,
    locale: string,
    unit: string,
    options: Partial<NumberFormatterOptions> = {}
  ): string {
    return this.format(value, locale, {
      style: "unit",
      unit,
      unitDisplay: "short",
      ...options,
    });
  }

  /**
   * Format with explicit sign (always show + or -)
   */
  static formatSigned(
    value: number,
    locale: string,
    options: Partial<NumberFormatterOptions> = {}
  ): string {
    return this.format(value, locale, {
      signDisplay: "always",
      ...options,
    });
  }

  /**
   * Format range of numbers
   */
  static formatRange(
    start: number,
    end: number,
    locale: string,
    options: NumberFormatterOptions = {}
  ): string {
    try {
      const formatter = this.createFormatter(locale, options) as any;

      if (formatter.formatRange) {
        return formatter.formatRange(start, end);
      }

      // Fallback for environments without formatRange
      return `${this.format(start, locale, options)} – ${this.format(
        end,
        locale,
        options
      )}`;
    } catch (error) {
      return `${this.format(start, locale, options)} – ${this.format(
        end,
        locale,
        options
      )}`;
    }
  }

  /**
   * Clear the formatter cache
   */
  static clearCache(): void {
    this.cache.clear();
  }

  /**
   * Get cache statistics
   */
  static getCacheStats(): { size: number; maxSize: number } {
    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
    };
  }
}

/**
 * Helper function for ICU MessageFormat integration
 */
export function formatNumberICU(
  value: any,
  format: string | undefined,
  locale: string
): string {
  const num = Number(value);

  if (isNaN(num) || !isFinite(num)) {
    return String(value);
  }

  try {
    // Parse format string
    if (!format) {
      return NumberFormatter.format(num, locale);
    }

    const parts = format.split(/\s+/);
    const style = parts[0];

    switch (style) {
      case "currency":
        const currency = parts[1] || "USD";
        return NumberFormatter.formatCurrency(num, locale, currency);

      case "percent":
        return NumberFormatter.formatPercent(num, locale);

      case "compact":
        return NumberFormatter.formatCompact(num, locale);

      case "unit":
        const unit = parts[1] || "kilometer";
        return NumberFormatter.formatUnit(num, locale, unit);

      case "signed":
        return NumberFormatter.formatSigned(num, locale);

      default:
        // Try to parse as decimal with precision
        const precision = parseInt(style, 10);
        if (!isNaN(precision)) {
          return NumberFormatter.format(num, locale, {
            minimumFractionDigits: precision,
            maximumFractionDigits: precision,
          });
        }

        return NumberFormatter.format(num, locale);
    }
  } catch (error) {
    console.warn("ICU number formatting failed, using fallback:", error);
    return String(value);
  }
}

/**
 * Ordinal number formatter (1st, 2nd, 3rd, etc.)
 */
export class OrdinalFormatter {
  private static cache = new Map<string, Intl.PluralRules>();

  static format(value: number, locale: string): string {
    const num = Math.floor(Math.abs(value));

    try {
      // Check if Intl.PluralRules is available
      if (typeof Intl === "undefined" || !Intl.PluralRules) {
        return this.fallbackFormat(value, locale);
      }

      let pluralRules = this.cache.get(locale);
      if (!pluralRules) {
        pluralRules = new Intl.PluralRules(locale, { type: "ordinal" });
        this.cache.set(locale, pluralRules);
      }

      const rule = pluralRules.select(num);
      const suffix = this.getSuffix(locale, rule);

      return `${value}${suffix}`;
    } catch (error) {
      console.warn("Ordinal formatting failed, using fallback:", error);
      return this.fallbackFormat(value, locale);
    }
  }

  private static getSuffix(locale: string, rule: string): string {
    const lang = locale.split("-")[0];

    if (lang === "en") {
      const suffixes: Record<string, string> = {
        one: "st",
        two: "nd",
        few: "rd",
        other: "th",
      };
      return suffixes[rule] || "th";
    }

    // Spanish, French, etc.
    if (["es", "fr", "it", "pt"].includes(lang)) {
      return rule === "one" ? "º" : "º";
    }

    // Default
    return "";
  }

  private static fallbackFormat(value: number, locale: string): string {
    const num = Math.floor(Math.abs(value));
    const lang = locale.split("-")[0];

    if (lang === "en") {
      const lastDigit = num % 10;
      const lastTwoDigits = num % 100;

      if (lastTwoDigits >= 11 && lastTwoDigits <= 13) {
        return `${value}th`;
      }

      switch (lastDigit) {
        case 1:
          return `${value}st`;
        case 2:
          return `${value}nd`;
        case 3:
          return `${value}rd`;
        default:
          return `${value}th`;
      }
    }

    // For other languages, just return the number
    return String(value);
  }

  static clearCache(): void {
    this.cache.clear();
  }
}

// Export types
export type { NumberFormatterOptions };
