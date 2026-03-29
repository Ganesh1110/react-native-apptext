"use strict";
/**
 * Performance optimizations for translation system
 *
 * Features:
 * - Memoization of translations
 * - LRU cache for expensive operations
 * - Debounced updates
 * - Virtual scrolling support
 * - Memory leak prevention
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.translationCache = exports.TranslationBatcher = exports.TranslationCache = exports.LRUCache = void 0;
exports.debounce = debounce;
exports.throttle = throttle;
exports.memoize = memoize;
/**
 * LRU (Least Recently Used) Cache implementation
 */
class LRUCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.hits = 0;
        this.misses = 0;
        this.maxSize = maxSize;
    }
    get(key) {
        if (!this.cache.has(key)) {
            this.misses++;
            return undefined;
        }
        this.hits++;
        // Move to end (most recently used)
        const value = this.cache.get(key);
        this.cache.delete(key);
        this.cache.set(key, value);
        return value;
    }
    set(key, value) {
        // Delete if exists to update position
        if (this.cache.has(key)) {
            this.cache.delete(key);
        }
        // Add to end
        this.cache.set(key, value);
        // Remove oldest if over limit
        if (this.cache.size > this.maxSize) {
            this.evictOldestEntry();
        }
    }
    has(key) {
        return this.cache.has(key);
    }
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    get size() {
        return this.cache.size;
    }
    evictOldestEntry() {
        const firstKey = this.cache.keys().next().value;
        if (firstKey !== undefined) {
            this.cache.delete(firstKey);
        }
    }
    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: total === 0 ? 0 : Math.round((this.hits / total) * 100) / 100,
        };
    }
}
exports.LRUCache = LRUCache;
/**
 * Translation cache with LRU eviction
 */
class TranslationCache {
    constructor(maxSize = 1000) {
        this.hits = 0;
        this.misses = 0;
        this.cache = new LRUCache(maxSize);
    }
    get(key, locale, params) {
        const cacheKey = this.buildKey(key, locale, params);
        const value = this.cache.get(cacheKey);
        if (value !== undefined) {
            this.hits++;
        }
        else {
            this.misses++;
        }
        return value;
    }
    set(key, locale, params, value) {
        const cacheKey = this.buildKey(key, locale, params);
        this.cache.set(cacheKey, value);
    }
    buildKey(key, locale, params) {
        if (!params)
            return `${locale}:${key}`;
        // Simple stable key for params without full stringify
        const paramKey = Object.keys(params)
            .sort()
            .map(k => `${k}:${params[k]}`)
            .join(",");
        return `${locale}:${key}:${paramKey}`;
    }
    clear() {
        this.cache.clear();
        this.hits = 0;
        this.misses = 0;
    }
    getStats() {
        const total = this.hits + this.misses;
        return {
            size: this.cache.size,
            maxSize: this.cache.maxSize,
            hits: this.hits,
            misses: this.misses,
            hitRate: total > 0 ? (this.hits / total) * 100 : 0,
        };
    }
}
exports.TranslationCache = TranslationCache;
/**
 * Debounce helper for batching updates
 */
function debounce(func, wait) {
    let timeout = null;
    return function executedFunction(...args) {
        const later = () => {
            timeout = null;
            func(...args);
        };
        if (timeout) {
            clearTimeout(timeout);
        }
        timeout = setTimeout(later, wait);
    };
}
/**
 * Throttle helper for rate-limiting
 */
function throttle(func, limit) {
    let inThrottle;
    return function executedFunction(...args) {
        if (!inThrottle) {
            func(...args);
            inThrottle = true;
            setTimeout(() => (inThrottle = false), limit);
        }
    };
}
/**
 * Memoization decorator for expensive computations
 */
function memoize(func, maxSize = 100) {
    const cache = new LRUCache(maxSize);
    return ((...args) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) {
            return cache.get(key);
        }
        const result = func(...args);
        cache.set(key, result);
        return result;
    });
}
/**
 * Batch processor for multiple translation requests
 */
class TranslationBatcher {
    constructor(processor) {
        this.processor = processor;
        this.queue = [];
        this.timeout = null;
        this.batchSize = 50;
        this.delay = 10;
    }
    add(key, params) {
        return new Promise((resolve) => {
            this.queue.push({ key, params, resolve });
            if (this.queue.length >= this.batchSize) {
                this.flush();
            }
            else if (!this.timeout) {
                this.timeout = setTimeout(() => this.flush(), this.delay);
            }
        });
    }
    async flush() {
        if (this.timeout) {
            clearTimeout(this.timeout);
            this.timeout = null;
        }
        if (this.queue.length === 0) {
            return;
        }
        const batch = this.queue.splice(0, this.batchSize);
        try {
            const results = await this.processor(batch.map(({ key, params }) => ({ key, params })));
            batch.forEach((item, index) => {
                item.resolve(results[index]);
            });
        }
        catch (error) {
            console.error("Batch processing failed:", error);
            batch.forEach((item) => {
                item.resolve(item.key); // Fallback to key
            });
        }
    }
}
exports.TranslationBatcher = TranslationBatcher;
// Singleton instances
exports.translationCache = new TranslationCache(1000);
