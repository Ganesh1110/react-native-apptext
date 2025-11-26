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
        try {
            return formatter.format(value);
        }
        catch (error) {
            console.error("Number formatting error:", error);
            return String(value);
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
/**
 * Ordinal number formatter (1st, 2nd, 3rd, etc.)
 */
export class OrdinalFormatter {
    static format(value, locale) {
        const num = Math.floor(Math.abs(value));
        // Get cached PluralRules or create new one
        let pluralRules = this.cache.get(locale);
        if (!pluralRules) {
            pluralRules = new Intl.PluralRules(locale, { type: "ordinal" });
            this.cache.set(locale, pluralRules);
        }
        const rule = pluralRules.select(num);
        const suffix = this.getSuffix(locale, rule);
        return `${value}${suffix}`;
    }
    static getSuffix(locale, rule) {
        const lang = locale.split("-")[0];
        // English
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
    static clearCache() {
        this.cache.clear();
    }
}
OrdinalFormatter.cache = new Map();
