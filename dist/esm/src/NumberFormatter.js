/**
 * Enhanced number formatting with caching and advanced options
 */
export class NumberFormatter {
    /**
     * Format a number with advanced options and caching
     */
    static format(value, locale, options = {}) {
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
        }
        catch (error) {
            console.error("Number formatting error:", error);
            return this.fallbackFormat(value, options);
        }
    }
    /**
     * Create an Intl.NumberFormat instance
     */
    static createFormatter(locale, options) {
        const intlOptions = { ...options };
        // Handle special cases
        if (options.style === "currency" && !options.currency) {
            intlOptions.currency = "USD";
        }
        return new Intl.NumberFormat(locale, intlOptions);
    }
    /**
     * Create a cache key from locale and options
     */
    static createCacheKey(locale, options) {
        const sortedOptions = Object.keys(options)
            .sort()
            .map((key) => `${key}:${options[key]}`)
            .join("|");
        return `${locale}|${sortedOptions}`;
    }
    /**
     * Evict the oldest cache entry safely
     */
    static evictOldestCacheEntry() {
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) {
            this.cache.delete(firstKey);
        }
    }
    /**
     * Fallback formatting when Intl is not available
     */
    static fallbackFormat(value, options) {
        // Simple fallback formatting
        if (options.style === "currency") {
            const symbol = options.currency === "EUR"
                ? "€"
                : options.currency === "GBP"
                    ? "£"
                    : options.currency === "JPY"
                        ? "¥"
                        : "$";
            return `${symbol}${value.toFixed(options.minimumFractionDigits || 2)}`;
        }
        else if (options.style === "percent") {
            return `${(value * 100).toFixed(options.maximumFractionDigits || 2)}%`;
        }
        else if (options.notation === "compact") {
            return this.compactFallback(value);
        }
        else {
            return value.toLocaleString();
        }
    }
    /**
     * Compact number fallback (1K, 1M, 1B)
     */
    static compactFallback(value) {
        const absValue = Math.abs(value);
        const sign = value < 0 ? "-" : "";
        if (absValue >= 1e9) {
            return `${sign}${(absValue / 1e9).toFixed(1)}B`;
        }
        else if (absValue >= 1e6) {
            return `${sign}${(absValue / 1e6).toFixed(1)}M`;
        }
        else if (absValue >= 1e3) {
            return `${sign}${(absValue / 1e3).toFixed(1)}K`;
        }
        else {
            return String(value);
        }
    }
    /**
     * Format currency with smart defaults
     */
    static formatCurrency(value, locale, currency = "USD", options = {}) {
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
    static formatPercent(value, locale, options = {}) {
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
    static formatCompact(value, locale, options = {}) {
        return this.format(value, locale, {
            notation: "compact",
            compactDisplay: "short",
            ...options,
        });
    }
    /**
     * Format unit (e.g., 5 km, 3 hours)
     */
    static formatUnit(value, locale, unit, options = {}) {
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
    static formatSigned(value, locale, options = {}) {
        return this.format(value, locale, {
            signDisplay: "always",
            ...options,
        });
    }
    /**
     * Format range of numbers
     */
    static formatRange(start, end, locale, options = {}) {
        try {
            const formatter = this.createFormatter(locale, options);
            if (formatter.formatRange) {
                return formatter.formatRange(start, end);
            }
            // Fallback for environments without formatRange
            return `${this.format(start, locale, options)} – ${this.format(end, locale, options)}`;
        }
        catch (error) {
            return `${this.format(start, locale, options)} – ${this.format(end, locale, options)}`;
        }
    }
    /**
     * Clear the formatter cache
     */
    static clearCache() {
        this.cache.clear();
    }
    /**
     * Get cache statistics
     */
    static getCacheStats() {
        return {
            size: this.cache.size,
            maxSize: this.maxCacheSize,
        };
    }
}
NumberFormatter.cache = new Map();
NumberFormatter.maxCacheSize = 100;
/**
 * Helper function for ICU MessageFormat integration
 */
export function formatNumberICU(value, format, locale) {
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
    }
    catch (error) {
        console.warn("ICU number formatting failed, using fallback:", error);
        return String(value);
    }
}
/**
 * Ordinal number formatter (1st, 2nd, 3rd, etc.)
 */
export class OrdinalFormatter {
    static format(value, locale) {
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
        }
        catch (error) {
            console.warn("Ordinal formatting failed, using fallback:", error);
            return this.fallbackFormat(value, locale);
        }
    }
    static getSuffix(locale, rule) {
        const lang = locale.split("-")[0];
        if (lang === "en") {
            const suffixes = {
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
    static fallbackFormat(value, locale) {
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
    static clearCache() {
        this.cache.clear();
    }
}
OrdinalFormatter.cache = new Map();
