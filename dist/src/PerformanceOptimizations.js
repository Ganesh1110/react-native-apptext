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
/**
 * LRU (Least Recently Used) Cache implementation
 */
export class LRUCache {
    constructor(maxSize = 1000) {
        this.cache = new Map();
        this.maxSize = maxSize;
    }
    get(key) {
        if (!this.cache.has(key)) {
            return undefined;
        }
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
        return {
            size: this.cache.size,
            maxSize: this.maxSize,
            hitRate: 0, // Would need to track hits/misses
        };
    }
}
/**
 * Translation cache with LRU eviction
 */
export class TranslationCache {
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
        const paramStr = params ? JSON.stringify(params) : "";
        return `${locale}:${key}:${paramStr}`;
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
/**
 * Debounce helper for batching updates
 */
export function debounce(func, wait) {
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
export function throttle(func, limit) {
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
export function memoize(func, maxSize = 100) {
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
export class TranslationBatcher {
    constructor(processor) {
        this.processor = processor;
        this.queue = [];
        this.timeout = null;
        this.batchSize = 50;
        this.delay = 10; // ms
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
/**
 * Memory leak prevention utilities
 */
export class MemoryManager {
    static registerTimer(timer) {
        this.timers.add(timer);
    }
    static clearTimer(timer) {
        clearTimeout(timer);
        this.timers.delete(timer);
    }
    static registerListener(target, cleanup) {
        if (!this.listeners.has(target)) {
            this.listeners.set(target, new Set());
        }
        this.listeners.get(target).add(cleanup);
    }
    static cleanupListeners(target) {
        const cleanups = this.listeners.get(target);
        if (cleanups) {
            cleanups.forEach((cleanup) => cleanup());
            this.listeners.delete(target);
        }
    }
    static clearAll() {
        // Clear all timers
        this.timers.forEach((timer) => clearTimeout(timer));
        this.timers.clear();
        // Clear all listeners
        this.listeners.forEach((cleanups) => {
            cleanups.forEach((cleanup) => cleanup());
        });
        this.listeners.clear();
    }
    static getStats() {
        return {
            activeTimers: this.timers.size,
            registeredListeners: this.listeners.size,
        };
    }
}
MemoryManager.timers = new Set();
MemoryManager.listeners = new Map();
export class VirtualListHelper {
    constructor(defaultHeight = 50) {
        this.itemHeights = new Map();
        this.defaultHeight = defaultHeight;
    }
    getItemHeight(key) {
        return this.itemHeights.get(key) || this.defaultHeight;
    }
    setItemHeight(key, height) {
        this.itemHeights.set(key, height);
    }
    getVisibleRange(scrollOffset, viewportHeight, items) {
        let currentOffset = 0;
        let startIndex = 0;
        let endIndex = 0;
        let offsetY = 0;
        // Find start index
        for (let i = 0; i < items.length; i++) {
            const height = this.getItemHeight(items[i].key);
            if (currentOffset + height > scrollOffset) {
                startIndex = i;
                offsetY = currentOffset;
                break;
            }
            currentOffset += height;
        }
        // Find end index
        currentOffset = offsetY;
        for (let i = startIndex; i < items.length; i++) {
            const height = this.getItemHeight(items[i].key);
            currentOffset += height;
            if (currentOffset > scrollOffset + viewportHeight) {
                endIndex = i;
                break;
            }
        }
        if (endIndex === 0) {
            endIndex = items.length - 1;
        }
        return { startIndex, endIndex, offsetY };
    }
    getTotalHeight(items) {
        return items.reduce((sum, item) => sum + this.getItemHeight(item.key), 0);
    }
}
/**
 * Performance monitoring
 */
export class PerformanceMonitor {
    constructor() {
        this.measurements = new Map();
    }
    measure(name, fn) {
        const start = performance.now();
        fn();
        const duration = performance.now() - start;
        if (!this.measurements.has(name)) {
            this.measurements.set(name, []);
        }
        this.measurements.get(name).push(duration);
    }
    async measureAsync(name, fn) {
        const start = performance.now();
        await fn();
        const duration = performance.now() - start;
        if (!this.measurements.has(name)) {
            this.measurements.set(name, []);
        }
        this.measurements.get(name).push(duration);
    }
    getStats(name) {
        const measurements = this.measurements.get(name) || [];
        if (measurements.length === 0) {
            return null;
        }
        const sorted = [...measurements].sort((a, b) => a - b);
        const sum = measurements.reduce((a, b) => a + b, 0);
        return {
            count: measurements.length,
            min: sorted[0],
            max: sorted[sorted.length - 1],
            mean: sum / measurements.length,
            median: sorted[Math.floor(sorted.length / 2)],
            p95: sorted[Math.floor(sorted.length * 0.95)],
            p99: sorted[Math.floor(sorted.length * 0.99)],
        };
    }
    getAllStats() {
        const stats = {};
        for (const [name] of this.measurements) {
            stats[name] = this.getStats(name);
        }
        return stats;
    }
    clear(name) {
        if (name) {
            this.measurements.delete(name);
        }
        else {
            this.measurements.clear();
        }
    }
}
// Singleton instances - using the exact names from your export
export const translationCache = new TranslationCache(1000);
export const performanceMonitor = new PerformanceMonitor();
